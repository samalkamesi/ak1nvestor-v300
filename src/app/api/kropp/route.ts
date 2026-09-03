import { NextResponse } from "next/server";
import { readFileSync, readdirSync } from "fs";
import path from "path";
import { getSupabaseRest } from "@/lib/supabase-rest";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * GET /api/kropp — organismens puls (MEGA_PLAN_V3 Fas A: nervsystemet + kroppsvyn).
 *
 * Samlar kroppens tillstånd i EN lättvikts-aggregator (forskning-organ-
 * arkitektur.md §3.3: "loggen ÄR pulsen — inga nya endpoints per organ"):
 *
 * (a) Levande organ: senaste system_events-raden per organ-typ — styrelse-beslut
 *     (organ_msg, företrädesvis typ beslut/delegation), vagscan, autonom-rapport,
 *     xp_sync samt OrganEvent-v1-källorna (organ/datacache, organ/kvalitetsvakt,
 *     organ/nyheter, organ/email, organ/portfolj, organ/seo, organ/kurser —
 *     register: ORGAN_KALLA_TILL_TYP) — läst via getSupabaseRest i ÉN fråga
 *     (order desc, limit 500 = retentionstakets hela fönster, så även månads-
 *     organet ryms), grupperat på typ med senaste raden + timestamp per typ.
 * (b) Statiska organ-statusar: motorerna ("live") med senaste valideringsstatus
 *     ur data/rapporter/motorervalidering-*.md (readFileSync — de sista radernas
 *     Totalt-rad: PASS/FAIL/SKIP).
 *
 * Pulsmodellen: lever = rapporterat inom 2× sin kadens, vilande = äldre, okänd =
 * ingen signal. UTAN Supabase-konfig returneras den statiska delen ändå (fail-safe,
 * samma regel som organ-motorn). P8: sammanfattningarna är grövla — inga interna
 * delegations-texter eller elevnamn läcker till den publika vyn.
 */

type OrganStatus = "lever" | "vilande" | "okänd";

type KroppsOrgan = {
  id: string;
  namn: string;
  ikon: string;
  status: OrganStatus;
  senast: string | null;
  sammanfattning: string;
};

type EventRad = {
  type?: string | null;
  severity?: string | null;
  message?: string | null;
  source?: string | null;
  details?: Record<string, unknown> | null;
  created_at?: string | null;
};

/**
 * Puls-fönster per organ (2× kadens): dagliga cron-organen = 48 h, mejl/seo/
 * kurser/datacache/nyheter dagligen = 48 h, portföljronen månadsvis ≈ 62 dagar,
 * styrelsen ronderas dagligen men får marginal, xp_sync vid besök (7 d).
 */
const KADENS_TIM: Record<string, number> = {
  styrelse: 48,
  vagscan: 48,
  autonom: 48,
  xp_sync: 168,
  matsmaltningen: 48,
  oronen: 48,
  andningen: 48,
  huden: 48,
  tillvaxten: 48,
  ryggraden: 1488,
};

/**
 * OrganEvent-källor (source "organ/<id>") → kroppsyta. AUTONOMI-ARKITEKTUR:
 * varje autonom kanal andas ut sin puls via publiceraOrganEvent — den här
 * tabellen är kroppsvyns register över vilka källor som FINNS. Nya organ-
 * källor läggs här (annars är de osynliga för pulsen).
 */
const ORGAN_KALLA_TILL_TYP: Record<string, string> = {
  "organ/datacache": "matsmaltningen",
  "organ/kvalitetsvakt": "immunforsvaret",
  "organ/nyheter": "oronen",
  "organ/email": "andningen",
  "organ/portfolj": "ryggraden",
  "organ/seo": "huden",
  "organ/kurser": "tillvaxten",
};

const ORGAN_EVENT_TYPER = "organ_msg,vagscan,autonom_report,xp_sync,organ";

/** Organ-typer som matchas ur event-flödet (okända typer ignoreras). */
function typNyckel(rad: EventRad): string | null {
  if (rad.type === "vagscan") return "vagscan";
  if (rad.type === "autonom_report") return "autonom";
  if (rad.type === "xp_sync") return "xp_sync";
  if (rad.type === "organ_msg") return "styrelse";
  if (rad.type === "organ") {
    // OrganEvent v1: beslut/delegation → styrelsen (rondens slut); annars
    // mappas källan via ORGAN_KALLA_TILL_TYP, motor/vagscan → vågkartan.
    const detaljer = rad.details ?? {};
    const verb = String(detaljer.verb ?? "");
    const kalla = String(detaljer.source ?? rad.source ?? "");
    if (verb === "beslut" || verb === "delegation") return "styrelse";
    if (ORGAN_KALLA_TILL_TYP[kalla]) return ORGAN_KALLA_TILL_TYP[kalla];
    if (kalla.startsWith("motor/vagscan")) return "vagscan";
  }
  return null;
}

/** Grupperar senaste raden per organ-typ (rader förväntas i created_at desc). */
function senastePerTyp(rader: EventRad[]): Map<string, EventRad> {
  const senaste = new Map<string, EventRad>();
  for (const rad of rader) {
    const nyckel = typNyckel(rad);
    if (nyckel && !senaste.has(nyckel)) senaste.set(nyckel, rad);
  }
  // Styrelsen: företrädesvis en besluts-/delegationsrad (organ-bus rondens slut),
  // annars räcker senaste organ_msg-raden.
  const styrelseRader = rader.filter(
    (r) => r.type === "organ_msg" && ["beslut", "delegation"].includes(String(r.details?.typ ?? ""))
  );
  if (styrelseRader.length > 0) senaste.set("styrelse", styrelseRader[0]);
  return senaste;
}

/** Puls-status ur senaste signal + kadens (okänd utan signal). */
function pulsStatus(typ: string, senast: string | null): OrganStatus {
  if (!senast) return "okänd";
  const t = Date.parse(senast);
  if (Number.isNaN(t)) return "okänd";
  const timmar = (Date.now() - t) / 3_600_000;
  return timmar <= (KADENS_TIM[typ] ?? 48) ? "lever" : "vilande";
}

/**
 * Statisk motorervalidering: senaste data/rapporter/motorervalidering-*.md läses
 * med readFileSync — de sista radernas "**Totalt**"-rad ger PASS/FAIL/SKIP.
 */
function lasMotorvalidering(): { datum: string; pass: number; fail: number; skip: number } | null {
  try {
    const dir = path.join(process.cwd(), "data/rapporter");
    const filer = readdirSync(dir)
      .filter((f) => /^motorervalidering-[\d-]+\.md$/.test(f))
      .sort();
    const senasteFil = filer[filer.length - 1];
    if (!senasteFil) return null;
    const text = readFileSync(path.join(dir, senasteFil), "utf8");
    const svans = text.trimEnd().split(/\r?\n/).slice(-40).join("\n");
    const total = svans.match(
      /\|\s*\*\*Totalt\*\*\s*\|\s*\*{0,2}(\d+)\*{0,2}\s*\|\s*\*{0,2}(\d+)\*{0,2}\s*\|\s*\*{0,2}(\d+)\*{0,2}\s*\|/
    );
    if (!total) return null;
    return {
      datum: senasteFil.replace(/^motorervalidering-/, "").replace(/\.md$/, ""),
      pass: Number(total[1]),
      fail: Number(total[2]),
      skip: Number(total[3]),
    };
  } catch {
    return null;
  }
}

/** Gröv sammanfattning av styrelsens senaste signal (P8 — aldrig rå delegations-text). */
function sammanfattaStyrelse(rad: EventRad | undefined): string {
  if (!rad) return "Ingen styrelserond loggad ännu — ronder körs enligt cron-schema.";
  const typ = String(rad.details?.typ ?? "");
  if (typ === "delegation") return "Senaste rond klar: beslut fattade och nästa åtgärd delegerad.";
  if (typ === "beslut") return "Senaste rond klar: beslut loggade.";
  if (typ === "fragar") return "Rond pågår: rapportering initierad.";
  if (typ === "rapport") return "Rond pågår: organrapporter mottagna.";
  return "Styrelsens ronder loggas i system_events.";
}

/** Immunförsvarets grova sammanfattning — kvalitetsstatus RÖD/GUL/GRÖN eller hälsorapport. */
function sammanfattaImmun(rad: EventRad | undefined): string {
  if (!rad) return "Hälsoronden körs enligt cron-schema.";
  const matt = (rad.details as { matt?: Record<string, unknown> } | null)?.matt;
  const status = String(matt?.status ?? "");
  if (status === "RÖD" || status === "GUL" || status === "GRÖN") {
    return `Kvalitetsvakten senast: ${status} (${mattTal(rad, "fel") ?? "?"} fel).`;
  }
  if (rad.type === "autonom_report") {
    return rad.message?.trim() || "Organrapporten mottagen.";
  }
  return "Hälsoronden andas — senaste signal mottagen.";
}

/** Senaste av två rader (null-säkert) — immunförsvaret andas via två kanaler. */
function senasteAv(a: EventRad | undefined, b: EventRad | undefined): EventRad | undefined {
  if (!a) return b;
  if (!b) return a;
  return String(b.created_at ?? "") > String(a.created_at ?? "") ? b : a;
}

/** OrganEvent-matt som tal — undefined när fältet saknas/ogiltigt (P8: grovt). */
function mattTal(rad: EventRad | undefined, nyckel: string): number | undefined {
  const matt = (rad?.details as { matt?: Record<string, unknown> } | null)?.matt;
  const v = matt?.[nyckel];
  return typeof v === "number" && Number.isFinite(v) ? v : undefined;
}

export async function GET() {
  const genererad = new Date().toISOString();

  // ── (a) Levande organ: senaste signal per typ ur system_events ─────────────
  let senaste = new Map<string, EventRad>();
  const rest = getSupabaseRest();
  if (rest) {
    try {
      const res = await fetch(
        `${rest.origin}/rest/v1/system_events?type=in.(${ORGAN_EVENT_TYPER})` +
          `&select=type,severity,message,source,details,created_at&order=created_at.desc&limit=500`,
        { headers: rest.headers, cache: "no-store", signal: AbortSignal.timeout(8000) }
      );
      if (res.ok) {
        const rader = (await res.json()) as EventRad[];
        if (Array.isArray(rader)) senaste = senastePerTyp(rader);
      }
    } catch {
      // tyst — den statiska delen returneras ändå
    }
  }

  // ── (b) Statisk motorervalidering (fungerar även UTAN Supabase) ────────────
  const validering = lasMotorvalidering();

  // ── Kroppens organ ──────────────────────────────────────────────────────────
  const styrelseRad = senaste.get("styrelse");
  const vagscanRad = senaste.get("vagscan");
  const autonomRad = senaste.get("autonom");
  const xpRad = senaste.get("xp_sync");
  const datacacheRad = senaste.get("matsmaltningen");
  const nyheterRad = senaste.get("oronen");
  const emailRad = senaste.get("andningen");
  const portfoljRad = senaste.get("ryggraden");
  const seoRad = senaste.get("huden");
  const kurserRad = senaste.get("tillvaxten");
  // Immunförsvaret andas via två kanaler: autonom hälsorapport + kvalitetsvakten.
  const immunRad = senasteAv(autonomRad, senaste.get("immunforsvaret"));

  // Sammanfattningar för de nya ytorna — ALWAYS grova tal ur matt (P8).
  const dataSparade = mattTal(datacacheRad, "sparadeRader");
  const nyhetAntal = mattTal(nyheterRad, "antal");
  const nyhetHoga = mattTal(nyheterRad, "hogPaverkan");
  const emailSkickade = mattTal(emailRad, "skickade");
  const portfoljBearbetade = mattTal(portfoljRad, "bearbetade");
  const seoUrl = mattTal(seoRad, "crawlbaraUrl");
  const kurserKvar = mattTal(kurserRad, "kapitelKvarstaende");

  const organ: KroppsOrgan[] = [
    {
      id: "hjartat",
      namn: "Hjärtat",
      ikon: "🫀",
      status: "lever",
      senast: genererad,
      sammanfattning: "Kommandocentralen (Min Sida) — du läser pulsen just nu.",
    },
    {
      id: "hjarnan",
      namn: "Hjärnan",
      ikon: "🧠",
      status: pulsStatus("styrelse", styrelseRad?.created_at ?? null),
      senast: styrelseRad?.created_at ?? null,
      sammanfattning: sammanfattaStyrelse(styrelseRad),
    },
    {
      id: "sinnena",
      namn: "Sinnena",
      ikon: "👁️",
      status: validering ? "lever" : "okänd",
      senast: vagscanRad?.created_at ?? null,
      sammanfattning: validering
        ? `Motorer live · validering ${validering.pass} PASS / ${validering.fail} FAIL (${validering.datum})`
        : "Motorer live · ingen valideringsrapport hittad ännu.",
    },
    {
      id: "immunforsvaret",
      namn: "Immunförsvaret",
      ikon: "🛡️",
      status: pulsStatus("autonom", immunRad?.created_at ?? null),
      senast: immunRad?.created_at ?? null,
      sammanfattning: sammanfattaImmun(immunRad),
    },
    {
      id: "minnet",
      namn: "Minnet",
      ikon: "💾",
      status: pulsStatus("xp_sync", xpRad?.created_at ?? null),
      senast: xpRad?.created_at ?? null,
      // P8/PGD: aldrig elevnamn eller XP-nivåer i publika pulsen.
      sammanfattning: xpRad
        ? "Elevkärnan aktiv — senaste XP-synk till topplistan mottagen."
        : "Ingen XP-synk loggad ännu — synkar sker när elever besöker topplistan.",
    },
    {
      id: "matsmaltningen",
      namn: "Matsmältningen",
      ikon: "🍽️",
      status: pulsStatus("matsmaltningen", datacacheRad?.created_at ?? null),
      senast: datacacheRad?.created_at ?? null,
      sammanfattning:
        dataSparade !== undefined
          ? `Datacentralen fyllde cachen — ${dataSparade} mätningar sparade senaste ronden.`
          : "Datacentralen förfyller cachen dagligen (06:00 UTC).",
    },
    {
      id: "oronen",
      namn: "Öronen",
      ikon: "👂",
      status: pulsStatus("oronen", nyheterRad?.created_at ?? null),
      senast: nyheterRad?.created_at ?? null,
      sammanfattning:
        nyhetAntal !== undefined
          ? `Nyhetscentralen möter morgonen — ${nyhetAntal} nyheter${nyhetHoga !== undefined ? `, ${nyhetHoga} med hög påverkan` : ""}.`
          : "Nyhetscentralen skannar universumet varje morgon (08:00 UTC).",
    },
    {
      id: "andningen",
      namn: "Andningen",
      ikon: "🌬️",
      status: pulsStatus("andningen", emailRad?.created_at ?? null),
      senast: emailRad?.created_at ?? null,
      sammanfattning:
        emailSkickade !== undefined
          ? `Morgonbriefingen andades ut — ${emailSkickade} brev köade.`
          : "Mejl-rondan köar morgonbriefingen dagligen (06:30 UTC).",
    },
    {
      id: "ryggraden",
      namn: "Ryggraden",
      ikon: "🦴",
      status: pulsStatus("ryggraden", portfoljRad?.created_at ?? null),
      senast: portfoljRad?.created_at ?? null,
      sammanfattning:
        portfoljBearbetade !== undefined
          ? `Portföljronen klar — ${portfoljBearbetade} portföljer omanalyserade (då mot nu).`
          : "Portföljronerna mäter då-mot-nu varje månad/kvartal.",
    },
    {
      id: "huden",
      namn: "Huden",
      ikon: "✨",
      status: pulsStatus("huden", seoRad?.created_at ?? null),
      senast: seoRad?.created_at ?? null,
      sammanfattning:
        seoUrl !== undefined
          ? `Sökbart ytplan — ${seoUrl} crawlbara URL:er i senaste sitemap-hälsan.`
          : "SEO-ronden räknar sajtens crawlbara ytplan dagligen.",
    },
    {
      id: "tillvaxten",
      namn: "Tillväxten",
      ikon: "🌱",
      status: pulsStatus("tillvaxten", kurserRad?.created_at ?? null),
      senast: kurserRad?.created_at ?? null,
      sammanfattning:
        kurserKvar !== undefined
          ? kurserKvar === 0
            ? "Alla kurskapitel är fördjupade — tillväxten i balans."
            : `Kursinnehållet växer — ${kurserKvar} kapitel återstår att fördjupa.`
          : "Kursexpansionen fördjupar ett kapitel per dag (deterministiska mallar).",
    },
  ];

  return NextResponse.json({ genererad, organ });
}
