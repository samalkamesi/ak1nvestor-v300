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
 *     (organ_msg, företrädesvis typ beslut/delegation), vagscan, autonom-rapport
 *     och xp_sync — läst via getSupabaseRest i ÉN fråga (order desc, limit 120),
 *     grupperat på typ med senaste raden + timestamp per typ.
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

/** Puls-fönster per organ (2× kadens): cron-organen går 1×/dag, xp_sync vid besök. */
const KADENS_TIM: Record<string, number> = {
  styrelse: 48,
  vagscan: 48,
  autonom: 48,
  xp_sync: 168,
};

const ORGAN_EVENT_TYPER = "organ_msg,vagscan,autonom_report,xp_sync,organ";

/** Organ-typer som matchas ur event-flödet (okända typer ignoreras). */
function typNyckel(rad: EventRad): string | null {
  if (rad.type === "vagscan") return "vagscan";
  if (rad.type === "autonom_report") return "autonom";
  if (rad.type === "xp_sync") return "xp_sync";
  if (rad.type === "organ_msg") return "styrelse";
  if (rad.type === "organ") {
    // OrganEvent v1: beslut/delegation → styrelsen; motor/vagscan → vågkartan.
    const detaljer = rad.details ?? {};
    const verb = String(detaljer.verb ?? "");
    const kalla = String(detaljer.source ?? rad.source ?? "");
    if (verb === "beslut" || verb === "delegation") return "styrelse";
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
  if (typ === "fragor") return "Rond pågår: rapportering initierad.";
  if (typ === "rapport") return "Rond pågår: organrapporter mottagna.";
  return "Styrelsens ronder loggas i system_events.";
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
          `&select=type,severity,message,source,details,created_at&order=created_at.desc&limit=120`,
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
      status: pulsStatus("autonom", autonomRad?.created_at ?? null),
      senast: autonomRad?.created_at ?? null,
      sammanfattning: autonomRad?.message?.trim() || "Organrapporten körs enligt cron-schema.",
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
  ];

  return NextResponse.json({ genererad, organ });
}
