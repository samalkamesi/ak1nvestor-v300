/**
 * EKO-KOPPLINGEN — ekosystemets samverkansmotor.
 *
 * Användarens direktiv: "sammansatta ekosystem som ska vara först i världen.
 * Alla system skall DELA sin kunskap om klienten och reagera på varandra."
 *
 * Detta är motorn som låter systemen SAMTALA: tracerns intresseprofil +
 * kurstipsens spår, vågkartans dagliga mätning + elevens portfölj, quiz +
 * veckoplanen, signal-bussen + notiserna — och Fas 2-analysen som väver
 * samman allt. Ingen enskild källa hade kunnat forma insikterna nedan;
 * de uppstår först när systemen läggs ihop (därav "eko-koppling").
 *
 * ARKITEKTUR (samma grundlag som övriga organ):
 *  - ISOMORF: importeras säkert av både server (GET /api/eko) och klient-
 *    paneler (admin beteende-panel, Min Sida assistent-panel). Inga node-
 *    beroenden på modulnivå; allt localStorage-arbete är `window`-vaktat.
 *  - INGEN import av member-local.ts ("use client" — skulle bryta server-
 *    importen): lasKlientkontext läser samma nycklar ("ak1a-xp",
 *    "ak1a-klara-kurser", "ak1a-streak") med egen vaktad läsare.
 *  - FAIL-SAFE: raknaEkoInsikter kastar aldrig — varje källa får tyst
 *    falla tillbaka (signal-bussen har statisk andning, vågkartan får
 *    sakna-läge, portföljen får vara tom) och motorn gissar aldrig.
 *  - P8/PGD: insikterna bygger endast på SAMMANFATTAD lokaldata (nivå,
 *    antal klara kurser, quiz-traff i procent, aktiv tid) — inga råa
 *    sökvägar, inga namn, inga interna vikter lämnar eleven.
 *  - PEDAGOGIK (pedagogik.ts): varje text hjälper och dömer aldrig —
 *    "väntar", "din resa", "naturligt nästa steg", aldrig "borde/missade".
 *
 * KÄLLOR SOM SAMVERKAR (regler R1–R5 i raknaEkoInsikter):
 *  R1 tracer + kurstips    → intresse utan klarad kurs i spåret
 *  R2 vågkarta + portfölj  → impulsvågor dominerar + inga värde-positioner
 *  R3 quiz + veckoplan     → träff < 50 % på planens område (V-spåret)
 *  R4 signal-bus + notiser → senaste signal som matchar intresseprofilen
 *  R5 Fas 2-analys         → nivå + aktiv tid + quiz + intresse-bredd
 */

import { lasSignaler, type Signal } from "@/lib/signal-bus";
import { getSupabaseRest } from "@/lib/supabase-rest";
import { lasBeteende, lasToppIntresse, INTRESSE_NYCKLAR, type IntresseNyckel } from "@/lib/tracer";

// ── Publika typer ────────────────────────────────────────────────────────────

/** Område en insikt tillhör — styr färg/gruppering i panelerna. */
export type EkoOmrade = "utbildning" | "verktyg" | "beteende" | "marknad" | "fas2";

/** En samverkans-insikt — född ur MINST två system (kalla: "a+b"). */
export type EkoInsikt = {
  omrade: EkoOmrade;
  rubrik: string;
  /** Pedagogisk text — förklarar VAD systemen ser tillsammans och VARFÖR. */
  text: string;
  /** Vilka system som genererade insikten, "+"-separerade (t.ex. "tracer+kurstips"). */
  kalla: string;
  /** En emoji. */
  ikon: string;
  /** Intern relativ länk ("/min-sida") — aldrig extern. */
  lank?: string;
  /** 1 = högst prioritet. */
  prioritet: number;
};

/**
 * Elevens delade kontext — SAMMANFATTAD (P8/PGD, samma filosofi som
 * /api/tracer): endast nivå, antal kurser, quiz-traff, aktiv tid och
 * intressen. Byggs på klienten av lasKlientkontext eller parsas ur
 * GET /api/eko:s query-parametrar.
 */
export type EkoKlientkontext = {
  /** Nivå 1–100 (100 XP per nivå — speglar member-local nivaFranXP). */
  niva: number;
  /** Klarade kurs-slugs (member-local "ak1a-klara-kurser"). */
  klaraKurser: string[];
  /** Streak-antal (member-local "ak1a-streak"). */
  streakAntal: number;
  /** Tracerns totala aktiva tid i sekunder. */
  aktivTidSek: number;
  /** Tracerns toppintresse — det spår nyfikenheten lyser starkast för. */
  toppIntresse: IntresseNyckel | null;
  /** Intresseprofil per spår (poäng > 0 = spåret är aktivt). */
  intresseProfil: Record<string, number>;
  "quiz ratt": number;
  "quiz fel": number;
  /** Portföljens antal innehav (Supabase client_holdings — server fyller i). */
  portfoljAntal: number;
  /** Portföljens unika sektorer (för värde-positions-analys, R2). */
  portfoljSektorer: string[];
};

/** Fas 2 öppnas vid nivå 25 — speglar member-local fas2Upplast(). */
export const EKO_FAS2_NIVA = 25;

// ── Sanitering (försvar i djupled — samma stil som signal-bus) ───────────────

const MAX_KLARA_KURSER = 60;
const MAX_SEKTORER = 24;
const MAX_TAL = 100_000;
const MAX_AKTIV_TID = 40_000_000; // ~15 månader, samma tak som tracern

function renTal(v: unknown, max: number): number {
  const n = Math.round(Number(v));
  return Number.isFinite(n) && n >= 0 ? Math.min(n, max) : 0;
}

/**
 * Kurs-slugs är "v01-forsaljningstillvaxt" etc. — boundade och slug-säkra.
 * Exporterad för /api/eko:t query-tolkning (samma validering båda vägarna).
 */
export function renSlugLista(v: unknown, max: number): string[] {
  if (!Array.isArray(v)) return [];
  const ut: string[] = [];
  for (const x of v) {
    if (typeof x !== "string") continue;
    const slug = x.trim();
    if (/^[a-zA-Z0-9åäöÅÄÖ][a-zA-Z0-9åäöÅÄÖ-]{0,79}$/.test(slug) && ut.length < max) {
      ut.push(slug);
    }
  }
  return ut;
}

function renStr(v: unknown, max: number): string {
  return typeof v === "string" ? v.replace(/\s+/g, " ").trim().slice(0, max) : "";
}

/** Endast interna relativa länkar ("/min-sida") — aldrig externa värdar. */
function renLank(v: unknown): string | undefined {
  if (typeof v !== "string") return undefined;
  const str = v.trim();
  return /^\/(?!\/)[^\s]*$/.test(str) && str.length <= 200 ? str : undefined;
}

/** Träff-% i hel procent, eller null när underlaget saknas (motorn gissar aldrig). */
function quizTraff(k: EkoKlientkontext): number | null {
  const totalt = k["quiz ratt"] + k["quiz fel"];
  if (totalt < 3) return null; // för få svar — inga slutsatser på luft
  return Math.round((k["quiz ratt"] / totalt) * 100);
}

/** Intresse-bredd: antal spår med poäng > 0 (R5:s "nyfikenhetens bredd"). */
function intresseBredd(k: EkoKlientkontext): number {
  return INTRESSE_NYCKLAR.filter((n) => (k.intresseProfil[n] ?? 0) > 0).length;
}

/** Svenskt heltal med komma? Nej — heltal här, men minuter avrundas vänligt. */
function minuterText(sek: number): string {
  const min = Math.round(sek / 60);
  return min >= 60 ? `${Math.round(min / 60)} timmar` : `${min} minuter`;
}

// ── lasKlientkontext — klientens samlade jag (member-local + tracer) ─────────

/** member-local.ts:s nycklar (läses med egen vaktad läsare — se ARKITEKTUR). */
const XP_NYCKEL = "ak1a-xp";
const KLARA_NYCKEL = "ak1a-klara-kurser";
const STREAK_NYCKEL = "ak1a-streak";

function lasJson(nyckel: string): unknown {
  if (typeof window === "undefined") return null;
  try {
    const rå = window.localStorage.getItem(nyckel);
    return rå ? (JSON.parse(rå) as unknown) : null;
  } catch {
    return null;
  }
}

/**
 * Samla elevens kontext på KLIENTEN (member-local + tracer) — sanitiserad
 * och bounded. Anropas av paneler som sedan skickar sammanfattningen till
 * GET /api/eko (query) eller räknar insikterna direkt med raknaEkoInsikter.
 *
 * Portföljen lämnas tom här — den lever i Supabase (client_holdings), inte
 * i localStorage; servern fyller i den via lasPortfoljForMedlem(memberId).
 * På servern (SSR) returneras en gästens kontext — allt är `window`-vaktat.
 */
export function lasKlientkontext(): EkoKlientkontext {
  const profil = lasBeteende(); // tracerns passiva lyssnande (SSR → tomt)

  const xp = renTal(lasJson(XP_NYCKEL), 100_000_000);
  const streakRad = lasJson(STREAK_NYCKEL) as { antal?: unknown } | null;

  return {
    niva: Math.max(1, Math.min(100, Math.floor(xp / 100) + 1)), // speglar nivaFranXP
    klaraKurser: renSlugLista(lasJson(KLARA_NYCKEL), MAX_KLARA_KURSER),
    streakAntal: renTal(streakRad?.antal, 3650),
    aktivTidSek: profil.aktivTid,
    toppIntresse: lasToppIntresse(profil),
    intresseProfil: profil.intresseProfil,
    "quiz ratt": profil["quiz ratt"],
    "quiz fel": profil["quiz fel"],
    portfoljAntal: 0,
    portfoljSektorer: [],
  };
}

// ── Portfölj (Supabase, server-sida) ─────────────────────────────────────────

/**
 * Hämta medlemmens SENASTE portfölj + sektorer ur Supabase
 * (client_portfolios → client_holdings — samma tabeller som
 * /api/member/portfolio). Returnerar tomt läge utan konfig/fel — aldrig kast.
 */
export async function lasPortfoljForMedlem(
  memberId: string,
): Promise<{ antal: number; sektorer: string[] }> {
  const id = renStr(memberId, 64);
  if (!id) return { antal: 0, sektorer: [] };

  const rest = getSupabaseRest();
  if (!rest) return { antal: 0, sektorer: [] };

  try {
    const pRes = await fetch(
      `${rest.origin}/rest/v1/client_portfolios?member_id=eq.${encodeURIComponent(id)}` +
        `&select=id&order=created_at.desc&limit=1`,
      { headers: rest.headers, cache: "no-store", signal: AbortSignal.timeout(6000) },
    );
    if (!pRes.ok) return { antal: 0, sektorer: [] };
    const portfoljer = (await pRes.json()) as Array<{ id?: unknown }>;
    const portfoljId = portfoljer?.[0]?.id;
    if (typeof portfoljId !== "string" || !portfoljId) return { antal: 0, sektorer: [] };

    const hRes = await fetch(
      `${rest.origin}/rest/v1/client_holdings?portfolio_id=eq.${encodeURIComponent(portfoljId)}` +
        `&select=ticker,sector&limit=50`,
      { headers: rest.headers, cache: "no-store", signal: AbortSignal.timeout(6000) },
    );
    if (!hRes.ok) return { antal: 0, sektorer: [] };
    const holdings = (await hRes.json()) as Array<{ ticker?: unknown; sector?: unknown }>;
    if (!Array.isArray(holdings)) return { antal: 0, sektorer: [] };

    const sektorer: string[] = [];
    for (const h of holdings) {
      const sek = renStr(h?.sector, 40).toLowerCase();
      if (sek && !sektorer.includes(sek) && sektorer.length < MAX_SEKTORER) sektorer.push(sek);
    }
    return { antal: holdings.length, sektorer };
  } catch {
    return { antal: 0, sektorer: [] }; // tyst — portföljen får vila
  }
}

// ── Vågkartan (senaste autonoma mätningen, med signal-fallback) ──────────────

type VagkartaLage = { impulsvag: number; korrigering: number; basbygge: number; osatt: number };

/**
 * Senaste vågkartan — läser system_events (type=vagscan, samma läsning som
 * /api/vagscan/senaste och mejl-rondan). FALLBACK: parsar den senaste
 * vagscan-SIGNALEN på bussen ("X impulsvågor mot Y korrigeringar") — två
 * system som delar samma kunskap, vilken kanal som än andas. Null = saknas.
 */
async function lasSenasteVagkarta(): Promise<VagkartaLage | null> {
  const rest = getSupabaseRest();
  if (rest) {
    try {
      const res = await fetch(
        `${rest.origin}/rest/v1/system_events?type=eq.vagscan&select=details,created_at&order=created_at.desc&limit=1`,
        { headers: rest.headers, cache: "no-store", signal: AbortSignal.timeout(6000) },
      );
      if (res.ok) {
        const rader = (await res.json()) as Array<{ details?: Record<string, unknown> | null }>;
        const u = rader?.[0]?.details?.universumSammanfattning as VagkartaLage | undefined;
        if (u) {
          const lage: VagkartaLage = {
            impulsvag: renTal(u.impulsvag, 100_000),
            korrigering: renTal(u.korrigering, 100_000),
            basbygge: renTal(u.basbygge, 100_000),
            osatt: renTal(u.osatt, 100_000),
          };
          if (lage.impulsvag + lage.korrigering > 0) return lage;
        }
      }
    } catch {
      // tyst — prova signal-fallback
    }
  }

  try {
    const signaler = await lasSignaler({ kalla: "vagscan", maxAntal: 3 });
    for (const sig of signaler) {
      // "…206 impulsvågor mot 84 korrigeringar och 40 basbyggen…"
      const m = sig.text.match(/(\d+)\s*impulsvågor[^]*?(\d+)\s*korrigeringar/);
      if (m) {
        return {
          impulsvag: renTal(m[1], 100_000),
          korrigering: renTal(m[2], 100_000),
          basbygge: 0,
          osatt: 0,
        };
      }
    }
  } catch {
    // tyst — vågkartan får saknas
  }
  return null;
}

// ── Intresse-spåren (tracer + kurstips delar samma karta) ────────────────────

type SparInfo = {
  namn: string;
  ikon: string;
  /** Slug-test för "tillhör detta spår" (samma indelning som tracer.klassifiera). */
  passar: (slug: string) => boolean;
  /** Första kursen i spåret — insiktens välkomnande dörr. */
  forstaKurs: string;
  /** Vad spåret heter i bibliotekets ton. */
  visningsnamn: string;
};

const INTRESSE_SPAR: Record<IntresseNyckel, SparInfo> = {
  teknisk: {
    namn: "teknisk analys",
    ikon: "🌊",
    passar: (slug) => /^(ts-|ak1ts)/i.test(slug),
    forstaKurs: "ts-01-elliott-wave",
    visningsnamn: "tekniska analysens vågor och mönster",
  },
  fundamental: {
    namn: "fundamental analys",
    ikon: "🏛️",
    passar: (slug) => /^v\d{2}-/i.test(slug),
    forstaKurs: "v01-forsaljningstillvaxt",
    visningsnamn: "fundamentalanalysens tjugo variabler",
  },
  portfölj: {
    namn: "portföljtänket",
    ikon: "🧩",
    passar: (slug) => /^(pf-|portfolj-)/i.test(slug),
    forstaKurs: "pf-01-portfoljbyggande",
    visningsnamn: "portföljens konst att väva ihop kunskapen",
  },
  beteende: {
    namn: "beteendefinans",
    ikon: "🧠",
    passar: (slug) => /^(bf-|km-03[5-7])/i.test(slug),
    forstaKurs: "bf-01-tillganglighetsfalla",
    visningsnamn: "beteendefinansens självkännedom",
  },
};

/** Klassiska värdesektorer (R2) — där värdeinvesteringens golva bor. */
const VARDE_SEKTORER = [
  "finans",
  "bank",
  "bank & finans",
  "försäkring",
  "fastighet",
  "energi",
  "material",
  "råvaror",
  "telekom",
  "telekommunikation",
];

function harVardePosition(sektorer: string[]): boolean {
  return sektorer.some((sek) =>
    VARDE_SEKTORER.some((v) => sek === v || sek.includes(v) || v.includes(sek)),
  );
}

/** Signal-källor → intressespår (R4:s matchning mot elevens profil). */
const SIGNAL_INTRESSE: Record<string, IntresseNyckel> = {
  vagscan: "fundamental",
  netnet: "fundamental",
  konfluens: "teknisk",
  tracer: "beteende",
  streak: "beteende",
};

// ── Motorn: räkna fram ekosystemets samlade insikter ─────────────────────────

/** Gästens kontext — motorn fungerar även utan inloggning/delning. */
function gastKontext(): EkoKlientkontext {
  return {
    niva: 1,
    klaraKurser: [],
    streakAntal: 0,
    aktivTidSek: 0,
    toppIntresse: null,
    intresseProfil: {},
    "quiz ratt": 0,
    "quiz fel": 0,
    portfoljAntal: 0,
    portfoljSektorer: [],
  };
}

/**
 * Räkna fram ekosystemets samlade intelligens — insikter som bara uppstår
 * när systemen DELAR sin kunskap om eleven.
 *
 * @param kontext elevens sammanfattade kontext (lasKlientkontext på klienten,
 *                query-parametrar via /api/eko på servern). Null = gäst-läge.
 *
 * Sorteras på prioritet (1 = högst), max 8 insikter, ALDRIG kastande.
 */
export async function raknaEkoInsikter(kontext?: EkoKlientkontext | null): Promise<EkoInsikt[]> {
  const k = kontext ?? gastKontext();
  const klaraSet = new Set(k.klaraKurser);
  const traff = quizTraff(k);
  const bredd = intresseBredd(k);

  // Samla server-källorna parallellt — varje källa tyst-faller individuellt.
  const [signaler, vagkarta] = await Promise.all([
    lasSignaler({ mottagare: "alla", maxAntal: 10 }).catch(() => [] as Signal[]),
    lasSenasteVagkarta().catch(() => null),
  ]);

  const insikter: EkoInsikt[] = [];
  /** Insiktens välkomnande dörr — endast intern, renLank-validerad länk. */
  const lank = (l?: string): { lank?: string } => {
    const ren = renLank(l);
    return ren === undefined ? {} : { lank: ren };
  };

  // ── R1: TRACER + KURSTIPS ──────────────────────────────────────────────────
  // Tracern ser intresset; kurstipsen ser spåret. Intresse + noll klarade
  // kurser i spåret = en välkomnande dörr som står öppen.
  if (k.toppIntresse) {
    const spar = INTRESSE_SPAR[k.toppIntresse];
    const klaraISparet = k.klaraKurser.filter((slug) => spar.passar(slug));
    if (klaraISparet.length === 0) {
      insikter.push({
        omrade: "utbildning",
        rubrik: `Ditt intresse ligger på ${spar.namn} — nästa kurs väntar`,
        text:
          `Två system jämförde anteckningar om dig: tracern ser att din nyfikenhet söker sig till ` +
          `${spar.visningsnamn}, och kurstipsen noterar att spåret än så länge står oöppnat. ` +
          `Välkommen in genom första dörren — allt i Fas 1 är kostnadsfritt, för alltid, och din takt är den rätta.`,
        kalla: "tracer+kurstips",
        ikon: spar.ikon,
        ...lank(`/kurser/${spar.forstaKurs}`),
        prioritet: 2,
      });
    }
  }

  // ── R2: VÅGKARTA + PORTFÖLJ ────────────────────────────────────────────────
  // Vågkartan andas varje dag; portföljen är elevens. När impulsvågorna
  // dominerar fundamentalvärdena och portföljen helt saknar värde-positioner
  // ser KOMBINATIONEN något ingen av dem ser ensam.
  if (
    vagkarta &&
    vagkarta.impulsvag > vagkarta.korrigering &&
    k.portfoljAntal > 0 &&
    !harVardePosition(k.portfoljSektorer)
  ) {
    insikter.push({
      omrade: "marknad",
      rubrik: "Värderingsvågor växer — din portfölj väntar på värde-positioner",
      text:
        `Vågkartans senaste mätning räknar ${vagkarta.impulsvag} impulsvågor mot ${vagkarta.korrigering} korrigeringar ` +
        `— fundamentala värden rör sig uppåt i ekonomin just nu. Din portfölj (${k.portfoljAntal} innehav) står än så länge ` +
        `utanför de klassiska värdesektorerna. Kunskap före position, alltid: kurserna V04 (P/S) och V05 (P/B) lär dig ` +
        `läsa värdegolvet — sedan blir valet ditt.`,
      kalla: "vagkarta+portfolj",
      ikon: "🌊",
      ...lank("/min-portfolj"),
      prioritet: 3,
    });
  }

  // ── R3: QUIZ + VECKOPLAN ───────────────────────────────────────────────────
  // Veckoplanen schemalgger V-spåret (fundamentalanalys); quizzen mäter
  // träffen. Under 50 % + schemalagt område = planen kan få andas om.
  if (traff !== null && traff < 50) {
    insikter.push({
      omrade: "utbildning",
      rubrik: "Veckans plan kan behöva justeras — området känns tufft",
      text:
        `Quizzen visar ${traff} % träff i veckoplanens schemalagda område (fundamentalanalysens V-spår). ` +
        `Det är ingen brist — glömskekurvan är normal och repetition är hur hjärnan bygger. Ett förslag från samverkan: ` +
        `byt ett kurstillfälle mot flashcards denna vecka, eller läs samma kurs en gång till. Planen är din att forma.`,
      kalla: "quiz+veckoplan",
      ikon: "🔁",
      ...lank("/min-sida"),
      prioritet: 2,
    });
  }

  // ── R4: SIGNAL-BUS + NOTISER ───────────────────────────────────────────────
  // Bussens senaste andetag matchas mot intresseprofilen — notiserna lyfter
  // fram det som är SKRÄDDARSytt för eleven, inte allt för alla.
  if (k.toppIntresse) {
    const matchande = signaler.find(
      (sig) => SIGNAL_INTRESSE[sig.kalla] === k.toppIntresse,
    );
    if (matchande) {
      const spar = INTRESSE_SPAR[k.toppIntresse];
      insikter.push({
        omrade: k.toppIntresse === "beteende" ? "beteende" : "marknad",
        rubrik: `${matchande.rubrik} — lyfts fram för din skull`,
        text:
          `Signal-bussen andas: "${renStr(matchande.text, 220)}" — och eftersom ditt toppintresse ligger på ${spar.namn} ` +
          `har notiserna valt att lyfta fram just denna. Två system som reagerar på varandra, med dig i mitten.`,
        kalla: "signal-bus+notiser",
        ikon: matchande.ikon || "📡",
        ...lank(matchande.lank ?? "/min-sida"),
        prioritet: 4,
      });
    }
  }

  // ── R5: FAS 2-ANALYS (nivå + aktivTid + quizTraff + intresse-bredd) ────────
  // Hela ekosystemets fyra mätare i ETT andetag — vägen till Fas 2.
  if (k.niva >= EKO_FAS2_NIVA) {
    insikter.push({
      omrade: "fas2",
      rubrik: "Fas 2-beredskapen är nådd",
        text:
          `Samverkanens fyra mätare talar med varandra: nivå ${k.niva}, ${minuterText(k.aktivTidSek)} av närvaro` +
        `${traff !== null ? `, ${traff} % quizträff` : ""} och nyfikenhet på ${bredd} av 4 spår. ` +
        `Superanalysen, konfluensradarn och net-net-skannern står redo — din resa har burit dig hit.`,
      kalla: "fas2",
      ikon: "🚀",
      ...lank("/fas2-ansok"),
      prioritet: 1,
    });
  } else {
    const stegKvar = EKO_FAS2_NIVA - k.niva;
    insikter.push({
      omrade: "fas2",
      rubrik: `Du är ${stegKvar} ${stegKvar === 1 ? "kurs" : "kurser"} från Fas 2-beredskap`,
      text:
        `Fyra system räknade tillsammans: nivå ${k.niva} av ${EKO_FAS2_NIVA}, ${k.klaraKurser.length} klara kurser, ` +
        `${minuterText(k.aktivTidSek)} aktiv närvaro${traff !== null ? `, ${traff} % quizträff` : ""} och intresse på ` +
        `${bredd} av 4 spår. Varje kurs lyfter dig ett steg — och Fas 2 (superanalys, konfluens, net-net) öppnar sig ` +
        `gradvis, i din takt. Kurstipsen på Min Sida pekar ut nästa steg.`,
      kalla: "fas2",
      ikon: "🚀",
      ...lank("/min-sida"),
      prioritet: stegKvar <= 5 ? 1 : 4,
    });
  }

  // ── Gästens/freshörarens andning — motorn är aldrig tom ────────────────────
  if (insikter.length < 2) {
    insikter.push({
      omrade: "verktyg",
      rubrik: "Ekosystemet börjar lära känna dig",
      text:
        `Tracern, kurstipsen, quizzen, veckoplanen och signal-bussen har just börjat samtala om sin gemensamma bild ` +
        `av dig — en bild som växer sig skarpare för varje besök. Ett par kurser in i resan föds de första ` +
        `samverkans-insikterna här, alltid i din takt och alltid uppmuntrande.`,
      kalla: "eko-koppling",
      ikon: "🧬",
      ...lank("/kurser"),
      prioritet: 5,
    });
  }

  // Dedupe på rubrik + stabil sort på prioritet → predictbar ordning.
  const sett = new Set<string>();
  return insikter
    .filter((i) => {
      if (sett.has(i.rubrik)) return false;
      sett.add(i.rubrik);
      return true;
    })
    .sort((a, b) => a.prioritet - b.prioritet)
    .slice(0, 8);
}

// ── Källsystem-urval (API:t rapporterar VILKA system som bidrog) ─────────────

/**
 * Vilka system bidrog till insikterna? "tracer+kurstips" → ["tracer",
 * "kurstips"]. Ordning = första förekomst — deterministisk och ärlig.
 */
export function raknaKallsystem(insikter: EkoInsikt[]): string[] {
  const ut: string[] = [];
  for (const i of insikter ?? []) {
    for (const del of String(i.kalla ?? "").split("+")) {
      const namn = renStr(del, 40);
      if (namn && !ut.includes(namn)) ut.push(namn);
    }
  }
  return ut;
}
