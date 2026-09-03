import { NextRequest, NextResponse } from "next/server";
import { getSupabaseRest } from "@/lib/supabase-rest";
import { INTRESSE_NYCKLAR, klassifiera, lasInsikter, type Insikt, type IntresseNyckel } from "@/lib/tracer";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * GET /api/admin/beteende — BETEENDE-ANALYSDASHBOARD (admin).
 *
 * "Redovisa analyser till admin så admin vet hur vi optimerar vidare."
 *
 * KÄLLOR (tre ärliga lägen, redovisade i `datakalla`):
 *   1. "tracer"   — FRIVILLIGT delade beteendeprofiler ur system_events
 *                   (type=tracer_rapport, eller det äldre kontraktet
 *                   type=organ + source=organ/tracer från POST /api/tracer).
 *                   Bara sammanfattningar (aktivTid, toppIntresse, ev.
 *                   xp/niva/quiz) — aldrig råa sökvägar.
 *   2. "aktivitet" — anonyma sessioner ur user_activities (90 d). Nivå/XP
 *                   finns EJ på servern (member-local är localStorage) —
 *                   här redovisas en aktivitets-viktad PROXY, tydligt märkt.
 *   3. "statisk"  — ingen data alls: nollor + statiska tips + tracerns
 *                   standardinsikter (lasInsikter är SSR-säker och ger
 *                   då sina tre välkomnande basinsikter).
 *
 * MÖNSTER som mäts:
 *   - Kurs-start utan fortsättning   (öppnad kurs, ingen course_complete)
 *   - Verktyg-upptäckt utan återkomst (analysis_run/portfolio_create == 1)
 *   - Quiz-sträckor                  (>70 % rätt på 5+ i rad — kräver
 *                                     tracer-delning eller quiz-metadata)
 *
 * SKYDD: ADMIN_PASSWORD på servern (samma som /api/admin/auth), lämnad i
 * headern "x-admin-password" eller "Authorization: Bearer <pwd>". Jämförelsen
 * är timing-säker; endast misslyckade försök rate-limitas (10/min/process).
 *
 * Pedagogisk plattform — inte investeringsråd.
 */

// ── Admin-skydd (mönster från /api/admin/fas2-access) ────────────────────────

const misslyckade: number[] = [];
const MAX_MISSLYCKADE_PER_MIN = 10;

function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

function kontrolleraAdmin(req: NextRequest): NextResponse | null {
  const expected = process.env.ADMIN_PASSWORD || "AK1A-2026";
  const urHeader = req.headers.get("x-admin-password");
  const authorization = req.headers.get("authorization");
  const provided = urHeader
    ? urHeader
    : authorization && authorization.startsWith("Bearer ")
      ? authorization.slice(7)
      : "";

  const now = Date.now();
  while (misslyckade.length && now - misslyckade[0] > 60_000) misslyckade.shift();
  if (misslyckade.length >= MAX_MISSLYCKADE_PER_MIN) {
    return NextResponse.json(
      { error: "För många felaktiga försök — vänta en minut." },
      { status: 429 },
    );
  }
  if (!provided || !timingSafeEqual(provided, expected)) {
    misslyckade.push(now);
    return NextResponse.json({ error: "Admin-lösenord krävs (x-admin-password)." }, { status: 401 });
  }
  return null;
}

// ── Typer ─────────────────────────────────────────────────────────────────────

type Sammanfattning = {
  aktivaElever: number;
  medelNiva: number;
  medelXP: number;
  toppIntressen: string[];
  fas2Redo: number;
};

type Monster = { namn: string; frekvens: number; beskrivning: string };

type InsiktMedTid = Insikt & { tid?: string | null };

type TracerRapport = {
  elevId: string;
  aktivTidSek: number;
  toppIntresse: IntresseNyckel | null;
  xp: number | null;
  niva: number | null;
  quizRatt: number | null;
  quizFel: number | null;
  skapad: string;
};

type AktivitetRad = {
  session_id?: string | null;
  action?: string | null;
  section?: string | null;
  target_type?: string | null;
  target_id?: string | null;
  metadata?: unknown;
  created_at?: string | null;
};

type SessionStat = {
  kursStart: number;
  kursKlar: number;
  verktyg: number;
  quiz: number;
  quizRatt: number | null;
  quizFel: number | null;
  sistSedd: string;
};

// ── Småhjälpredor ─────────────────────────────────────────────────────────────

const mean = (v: number[]): number => (v.length ? v.reduce((s, x) => s + x, 0) / v.length : 0);
const avrundat = (x: number): number => Math.round(x * 10) / 10;

/** Samma nivåregel som member-local (100 XP per nivå, tak 100) — bas 1. */
function nivaFranXP(xp: number): number {
  return Math.max(1, Math.min(100, Math.floor(xp / 100) + 1));
}

/**
 * Aktivitets-viktad XP-PROXY (läge "aktivitet") — INTE elevens riktiga XP.
 * Vikterna speglar grovt insatsen per action och dokumenteras här så att
 * siffran aldrig kan förväxlas med de riktiga, lokala XP:na.
 */
const XP_VIKT: Record<string, number> = {
  section_visit: 1,
  search: 2,
  organ_consulted: 5,
  meeting_convened: 5,
  course_open: 10,
  portfolio_update: 15,
  analysis_run: 25,
  portfolio_create: 40,
  course_complete: 100,
};
const XP_VIKT_STANDARD = 3; // okända actions — försiktig mellanvikt

/** Intressespår ur en aktivitetsrad — återanvänder tracerns kanoniska
 *  sökvägsklassificering (klassifiera) på "/kurser/<slug>" och "/<section>". */
function intresseUrRad(a: AktivitetRad): IntresseNyckel | null {
  if (a.target_type === "course" && typeof a.target_id === "string" && a.target_id) {
    const urSlug = klassifiera(`/kurser/${a.target_id.toLowerCase()}`);
    if (urSlug) return urSlug;
  }
  if (typeof a.section === "string" && a.section) {
    return klassifiera(`/${a.section.toLowerCase()}`) ?? null;
  }
  return null;
}

function plockaObjekt(rå: unknown): Record<string, unknown> {
  return rå && typeof rå === "object" && !Array.isArray(rå) ? (rå as Record<string, unknown>) : {};
}

/** details/metadata-kolumnen kan vara jsonb eller sträng — tolkas försiktigt. */
function jsonEventuellt(rå: unknown): Record<string, unknown> {
  if (typeof rå === "string") {
    try {
      return plockaObjekt(JSON.parse(rå));
    } catch {
      return {};
    }
  }
  return plockaObjekt(rå);
}

function nummer(v: unknown): number | null {
  const n = Number(v);
  return Number.isFinite(n) && n >= 0 ? n : null;
}

/** metadata kan vara strängad JSON med quiz-räkning (t.ex. {ratt, fel}). */
function metadataRakning(metadata: unknown): { ratt: number | null; fel: number | null } {
  const m = jsonEventuellt(metadata);
  return {
    ratt: nummer(m.ratt) ?? nummer(m.ratta) ?? nummer(m["quiz ratt"]),
    fel: nummer(m.fel) ?? nummer(m["quiz fel"]),
  };
}

/** Läs en Supabase-respons till en array — aldrig kasta på tom/galen data. */
async function lasRader<T>(res: Response): Promise<T[]> {
  if (!res.ok) return [];
  try {
    const rader = (await res.json()) as unknown;
    return Array.isArray(rader) ? (rader as T[]) : [];
  } catch {
    return [];
  }
}

// ── GET ───────────────────────────────────────────────────────────────────────

export async function GET(req: NextRequest) {
  const skyddSvar = kontrolleraAdmin(req);
  if (skyddSvar) return skyddSvar;

  const rest = getSupabaseRest();
  const nu = Date.now();
  const sedan30 = new Date(nu - 30 * 86400_000).toISOString();
  const sedan90 = new Date(nu - 90 * 86400_000).toISOString();

  // Fallback-svaret — komplett och giltigt även utan Supabase-konfig.
  const resultat: {
    sammanfattning: Sammanfattning;
    mönster: Monster[];
    optimeringsTips: string[];
    senasteInsikter: InsiktMedTid[];
    datakalla: "tracer" | "aktivitet" | "statisk";
    genererad: string;
  } = {
    sammanfattning: { aktivaElever: 0, medelNiva: 0, medelXP: 0, toppIntressen: [], fas2Redo: 0 },
    mönster: [
      { namn: "Kurs-start utan fortsättning", frekvens: 0, beskrivning: "Elever som påbörjar men inte klarar kapitel 2" },
      { namn: "Verktyg-upptäckt utan återkomst", frekvens: 0, beskrivning: "Verktyg testas en gång men används inte igen" },
      { namn: "Quiz-sträckor", frekvens: 0, beskrivning: "Elever med >70% träff på 5+ quiz i rad" },
    ],
    optimeringsTips: [],
    senasteInsikter: lasInsikter().map((i) => ({ ...i })), // SSR-säkert: standardinsikterna
    datakalla: "statisk",
    genererad: new Date(nu).toISOString(),
  };

  if (!rest) {
    resultat.optimeringsTips = statiskaTips();
    return NextResponse.json(resultat);
  }

  try {
    // Fyra parallella läsningar: tracer-rapporter (båda kontrakten), aktiviteter, medlemstyper.
    const [rapportRes1, rapportRes2, aktivitetRes, medlemRes] = await Promise.all([
      fetch(
        `${rest.origin}/rest/v1/system_events?type=eq.tracer_rapport&select=type,source,details,message,created_at&order=created_at.desc&limit=500`,
        { headers: rest.headers, signal: AbortSignal.timeout(10000) },
      ),
      fetch(
        `${rest.origin}/rest/v1/system_events?type=eq.organ&source=eq.organ%2Ftracer&select=type,source,details,message,created_at&order=created_at.desc&limit=500`,
        { headers: rest.headers, signal: AbortSignal.timeout(10000) },
      ),
      fetch(
        `${rest.origin}/rest/v1/user_activities?created_at=gte.${sedan90}&select=session_id,action,section,target_type,target_id,metadata,created_at&order=created_at.desc&limit=5000`,
        { headers: rest.headers, signal: AbortSignal.timeout(10000) },
      ),
      fetch(`${rest.origin}/rest/v1/members?select=member_type&limit=1000`, {
        headers: rest.headers,
        signal: AbortSignal.timeout(10000),
      }),
    ]);

    // ── 1. Tracer-rapporter → läge "tracer" ──────────────────────────────────
    const rapportRader = [...(await lasRader<Record<string, unknown>>(rapportRes1)), ...(await lasRader<Record<string, unknown>>(rapportRes2))];
    const allaRapporter: TracerRapport[] = [];
    for (const r of rapportRader) {
      const detaljer = jsonEventuellt(r.details);
      // Nytt kontrakt: matt ligger i details.matt; äldre OrganEvent: hela details.
      const matt = plockaObjekt(detaljer.matt).elevId
        ? plockaObjekt(detaljer.matt)
        : detaljer.elevId
          ? detaljer
          : plockaObjekt(r.matt);
      const elevId =
        typeof matt.elevId === "string" && matt.elevId.trim() ? matt.elevId.trim().slice(0, 64) : "";
      if (!elevId) continue;
      const topp =
        typeof matt.toppIntresse === "string" && (INTRESSE_NYCKLAR as readonly string[]).includes(matt.toppIntresse)
          ? (matt.toppIntresse as IntresseNyckel)
          : null;
      allaRapporter.push({
        elevId,
        aktivTidSek: Math.max(0, Math.min(40_000_000, Math.round(Number(matt.aktivTid) || 0))),
        toppIntresse: topp,
        xp: nummer(matt.xp),
        niva: nummer(matt.niva),
        quizRatt: nummer(matt.quizRatt) ?? nummer(matt["quiz ratt"]),
        quizFel: nummer(matt.quizFel) ?? nummer(matt["quiz fel"]),
        skapad: typeof r.created_at === "string" ? r.created_at : "",
      });
    }
    // Samma elev kan ha delat flera gånger — behåll den senaste rapporten.
    const senastePerElev = new Map<string, TracerRapport>();
    for (const rp of allaRapporter) {
      const befintlig = senastePerElev.get(rp.elevId);
      if (!befintlig || (rp.skapad || "") >= (befintlig.skapad || "")) senastePerElev.set(rp.elevId, rp);
    }
    const perElev = [...senastePerElev.values()];

    // ── 2. Aktiviteter (proxy-läge + mönster) ────────────────────────────────
    const aktiviteter = await lasRader<AktivitetRad>(aktivitetRes);
    const medlemTyper = (await lasRader<{ member_type?: string | null }>(medlemRes))
      .map((m) => (typeof m.member_type === "string" ? m.member_type : ""))
      .filter(Boolean);

    const sessioner = new Map<string, SessionStat>();
    const intressePoang = new Map<IntresseNyckel, number>();
    const aktiva30 = new Set<string>();
    const proxyXp = new Map<string, number>();

    const session = (id: string): SessionStat => {
      let s = sessioner.get(id);
      if (!s) {
        s = { kursStart: 0, kursKlar: 0, verktyg: 0, quiz: 0, quizRatt: null, quizFel: null, sistSedd: "" };
        sessioner.set(id, s);
      }
      return s;
    };

    for (const a of aktiviteter) {
      const id = typeof a.session_id === "string" && a.session_id ? a.session_id : "okänd";
      const s = session(id);
      const action = typeof a.action === "string" ? a.action : "";
      const skapad = typeof a.created_at === "string" ? a.created_at : "";
      if (skapad > s.sistSedd) s.sistSedd = skapad;
      if (skapad >= sedan30) aktiva30.add(id);
      proxyXp.set(id, (proxyXp.get(id) ?? 0) + (XP_VIKT[action] ?? XP_VIKT_STANDARD));

      if (action === "course_open" || (action === "section_visit" && a.target_type === "course" && a.target_id)) {
        s.kursStart += 1;
      }
      if (action === "course_complete") s.kursKlar += 1;
      if (action === "analysis_run" || action === "portfolio_create") s.verktyg += 1;
      if (/quiz/i.test(action)) {
        s.quiz += 1;
        const rakning = metadataRakning(a.metadata);
        if (rakning.ratt !== null) {
          s.quizRatt = (s.quizRatt ?? 0) + rakning.ratt;
          s.quizFel = (s.quizFel ?? 0) + (rakning.fel ?? 0);
        }
      }
      const intresse = intresseUrRad(a);
      if (intresse) intressePoang.set(intresse, (intressePoang.get(intresse) ?? 0) + 1);
    }
    const sessionStat = [...sessioner.values()];

    const monster: Monster[] = [
      {
        namn: "Kurs-start utan fortsättning",
        frekvens: sessionStat.filter((s) => s.kursStart > 0 && s.kursKlar === 0).length,
        beskrivning: "Elever som påbörjar men inte klarar kapitel 2",
      },
      {
        namn: "Verktyg-upptäckt utan återkomst",
        frekvens: sessionStat.filter((s) => s.verktyg === 1).length,
        beskrivning: "Verktyg testas en gång men används inte igen",
      },
      {
        namn: "Quiz-sträckor",
        frekvens: raknaQuizStrackor(sessionStat, perElev),
        beskrivning: "Elever med >70% träff på 5+ quiz i rad",
      },
    ];

    // ── Sammanfattning + läge ─────────────────────────────────────────────────
    let sammanfattning: Sammanfattning;
    if (perElev.length > 0) {
      // LÄGE "tracer" — verkliga, frivilligt delade profiler.
      const nivaer = perElev.map((r) => r.niva).filter((n): n is number => n !== null);
      const xp = perElev.map((r) => r.xp).filter((n): n is number => n !== null);
      const intresseRakning = new Map<IntresseNyckel, number>();
      for (const r of perElev) {
        if (r.toppIntresse) intresseRakning.set(r.toppIntresse, (intresseRakning.get(r.toppIntresse) ?? 0) + 1);
      }
      sammanfattning = {
        aktivaElever: perElev.length,
        medelNiva: avrundat(nivaer.length ? mean(nivaer) : xp.length ? nivaFranXP(mean(xp)) : 0),
        // Utan explicit XP redovisas närvaro-minuter som XP-proxy (märkt i panelen).
        medelXP: avrundat(xp.length ? mean(xp) : mean(perElev.map((r) => r.aktivTidSek / 60))),
        toppIntressen: [...intresseRakning.entries()]
          .sort((a, b) => b[1] - a[1])
          .slice(0, 2)
          .map(([k]) => k),
        fas2Redo: perElev.filter((r) => (r.niva ?? 0) >= 25 || (r.xp ?? 0) >= 2500).length,
      };
      resultat.datakalla = "tracer";
      resultat.senasteInsikter = perElev
        .slice()
        .sort((a, b) => (b.skapad || "").localeCompare(a.skapad || ""))
        .slice(0, 5)
        .map(insiktFranRapport);
    } else if (aktiviteter.length > 0) {
      // LÄGE "aktivitet" — anonyma sessioner + tydligt märkt XP-proxy.
      const proxyVarden = [...proxyXp.values()];
      sammanfattning = {
        aktivaElever: aktiva30.size,
        medelXP: avrundat(mean(proxyVarden)),
        medelNiva: nivaFranXP(mean(proxyVarden)),
        toppIntressen: [...intressePoang.entries()]
          .sort((a, b) => b[1] - a[1])
          .slice(0, 2)
          .map(([k]) => k),
        fas2Redo:
          medlemTyper.filter((t) => t === "fas2" || t === "premium" || t === "pro").length ||
          proxyVarden.filter((x) => x >= 2500).length,
      };
      resultat.datakalla = "aktivitet";
    } else {
      sammanfattning = resultat.sammanfattning;
    }

    resultat.sammanfattning = sammanfattning;
    resultat.mönster = monster;
    resultat.optimeringsTips = dynamiskaTips(sammanfattning, monster, resultat.datakalla, aktiviteter.length);
  } catch {
    // Fail-safe: nätverksfel → statiskt svar (aldrig krascha för admin).
    resultat.optimeringsTips = statiskaTips();
  }

  return NextResponse.json(resultat);
}

// ── Quiz-sträckor ─────────────────────────────────────────────────────────────

/** >70 % träff på 5+ quiz — ur tracer-rapporter (verkliga tal) eller, om
 *  aktiviteterna bär quiz-metadata med rätt/fel, ur sessionerna. */
function raknaQuizStrackor(
  sessionStat: { quiz: number; quizRatt: number | null; quizFel: number | null }[],
  rapporter: TracerRapport[],
): number {
  let antal = 0;
  for (const r of rapporter) {
    const totalt = (r.quizRatt ?? 0) + (r.quizFel ?? 0);
    if (totalt >= 5 && (r.quizRatt ?? 0) / totalt > 0.7) antal += 1;
  }
  for (const s of sessionStat) {
    const totalt = (s.quizRatt ?? 0) + (s.quizFel ?? 0);
    if (s.quiz >= 5 && s.quizRatt !== null && totalt >= 5 && s.quizRatt / totalt > 0.7) antal += 1;
  }
  return antal;
}

// ── Insikter ur tracer-rapporter (AK1A-rösten: uppmuntrande, aldrig dömande) ──

const INTRESSE_IKON: Record<IntresseNyckel, string> = {
  teknisk: "🌊",
  fundamental: "🏛️",
  portfölj: "🧩",
  beteende: "🧠",
};

function insiktFranRapport(r: TracerRapport): InsiktMedTid {
  const minuter = Math.round(r.aktivTidSek / 60);
  const intresseText =
    r.toppIntresse === "teknisk"
      ? "vågor, mönster och timing"
      : r.toppIntresse === "fundamental"
        ? "bokföring, värdering och substans"
        : r.toppIntresse === "portfölj"
          ? "helheten och samspelet mellan positioner"
          : r.toppIntresse === "beteende"
            ? "det egna sinnet som investerare"
            : "ännu ospikat spår";
  return {
    rubrik: r.toppIntresse ? `Elev reser mot ${r.toppIntresse}` : "Elev delade sin resa",
    text: `Frivilligt delad profil: ${minuter} min närvaro och störst nyfikenhet för ${intresseText}. Nästa tips bör möta eleven precis där — i dennes egen takt.`,
    ikon: r.toppIntresse ? INTRESSE_IKON[r.toppIntresse] : "🔭",
    tid: r.skapad || null,
  };
}

// ── Optimerings-tips — konkreta, datastyrda där data finns ────────────────────

function statiskaTips(): string[] {
  return [
    "Aktivera den frivilliga tracer-delningsknappen på Min Sida — varje delad profil ger verkliga intressen, närvaro och quiz-sträckor i denna vy (idag bara sammanfattningar).",
    "Bygg en mjuk välkomstväg mellan kapitel 1 och 2: två korta pass före det första långa — glömskekurvan belönar tidig repetition.",
    "Påminn verktygs-testare om verktyget i Dagens Pass en vecka senare — en andra användning är den starkaste predictorn för att verktyget sätter sig.",
    "Fira quiz-sträckor anonymt (badge utan namn): '>70 % på 5 i rad' är den signal som bäst förutsäger Fas 2-mognad.",
    "Bevaka fas2Redo-talet veckovis — när det växer är det dags att öppna nästa Fas 2-kohort.",
  ];
}

function dynamiskaTips(
  s: Sammanfattning,
  m: Monster[],
  kalla: "tracer" | "aktivitet" | "statisk",
  aktivitetsRader: number,
): string[] {
  const tips: string[] = [];
  const [kursStart, verktyg, quiz] = m;

  if (s.aktivaElever > 0 && kursStart.frekvens > 0) {
    const andel = Math.round((kursStart.frekvens / Math.max(1, s.aktivaElever)) * 100);
    tips.push(
      `${kursStart.frekvens} av ${s.aktivaElever} aktiva elever (${andel} %) öppnar kurs utan slutförande — bygg en uppmuntrande påminnelse efter kapitel 1 och mät igen om 30 dagar.`,
    );
  }
  if (verktyg.frekvens > 0) {
    tips.push(
      `${verktyg.frekvens} sessioner testar ett verktyg exakt en gång — lägg in en mjuk återkomst-nudging i Dagens Pass 7 dagar efter första verktygsanvändningen.`,
    );
  }
  if (kalla !== "tracer") {
    tips.push(
      `Quiz-sträckor kan inte mätas i läget "${kalla}" (${aktivitetsRader} aktivitetsrader utan quiz-räkning) — aktivera frivillig tracer-delning för att få >70 %-sträckor redovisade.`,
    );
  } else if (quiz.frekvens > 0) {
    tips.push(
      `${quiz.frekvens} elever kör >70 % rätt på 5+ quiz i rad — flagga dem som Fas 2-mogna och bjud in till fördjupningen medan glansen är varm.`,
    );
  }
  if (s.toppIntressen.length > 0) {
    tips.push(
      `Toppintressena just nu: ${s.toppIntressen.join(" och ")} — prioritera nytt kursmaterial i de spåren nästa sprint, så möter utbudet efterfrågan där den redan finns.`,
    );
  }
  if (s.fas2Redo > 0) {
    tips.push(
      `${s.fas2Redo} elever står redo för Fas 2 — öppna nästa kohort eller skicka en personlig inbjudan; mognaden ska aldrig få svalna.`,
    );
  }
  if (kalla === "aktivitet") {
    tips.push(
      "Nivå/XP i sammanfattningen är en aktivitets-viktad uppskattning (servern ser bara anonyma sessioner) — läs den som trend; exakta värden kräver tracer-delning.",
    );
  }

  // Fyll alltid upp med de statiska basspåren — admin ska alltid ha ett nästa steg.
  for (const t of statiskaTips()) {
    if (tips.length >= 6) break;
    if (!tips.some((x) => x.slice(0, 40) === t.slice(0, 40))) tips.push(t);
  }
  return tips.slice(0, 6);
}
