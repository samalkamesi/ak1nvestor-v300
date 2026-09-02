/**
 * BETEENDETRACERN (v1) — det tysta organsystem som lär känna eleven
 * genom beteende. Användarens direktiv: "förstå kunden utan att kunden
 * vet själv eller säger".
 *
 * Tracern lyssnar passivt på sidvisningar, verktygsanvändning och quiz —
 * och vänder mönstret till pedagogiska insikter (lasInsikter), ALLTID
 * uppmuntrande och aldrig dömande (se PEDAGOGIK_PRINCIPER i pedagogik.ts:
 * inga "du borde", bara "välkommen" och "din resa").
 *
 * INTEGRITET — grundlagen här:
 * - ALLT lagras lokalt i localStorage under "ak1a-tracer-v1".
 * - INGET skickas någonsin utan elevens aktiva val. Delning sker endast
 *   via /api/tracer och anropas uteslutande av en frivillig knapp
 *   (Min Sida — knappen är ännu ej byggd, spårad i MEGA_PLAN).
 * - Inga personuppgifter samlas: sökvägar, antal och timmar — inte namn.
 *
 * Server-side-säker: anrop på servern (SSR) är no-op/läser tomt.
 */

/** De fyra intressespåren tracern klassificerar beteende mot. */
export type IntresseNyckel = "teknisk" | "fundamental" | "portfölj" | "beteende";

export const INTRESSE_NYCKLAR: readonly IntresseNyckel[] = [
  "teknisk",
  "fundamental",
  "portfölj",
  "beteende",
];

export type BeteendeProfil = {
  aktivTid: number; // total sek på plattformen
  besoktaSidor: Record<string, number>; // sida → antal
  verktygsAnvandning: Record<string, number>; // verktyg → antal
  "quiz ratt": number;
  "quiz fel": number;
  typiskaTimmar: number[]; // vilka timmar (0-23) eleven är aktiv
  intresseProfil: Record<string, number>; // "teknisk"|"fundamental"|"portfölj"|"beteende" → poäng
  senastAktiv: number; // Date.now()
};

export type Insikt = { rubrik: string; text: string; ikon: string };

const NYCKEL = "ak1a-tracer-v1";
const MAX_SIDOR = 120;
const MAX_VERKTYG = 40;
/** Aktiv tid räknas bara för luckor ≤ 30 min — idle tid räknas aldrig. */
const MAX_AKTIV_LUCKA_SEK = 1800;
/** Dubblett-skydd: samma sida inom 15 sek räknas en gång (SPA/StrictMode). */
const SIDVISNING_DUBBLETT_MS = 15_000;

function tomProfil(): BeteendeProfil {
  return {
    aktivTid: 0,
    besoktaSidor: {},
    verktygsAnvandning: {},
    "quiz ratt": 0,
    "quiz fel": 0,
    typiskaTimmar: [],
    intresseProfil: {},
    senastAktiv: 0,
  };
}

function renTalfalt(v: unknown, max: number): number {
  const n = Math.round(Number(v));
  return Number.isFinite(n) && n >= 0 ? Math.min(n, max) : 0;
}

function renRaknare(v: unknown, maxNycklar: number): Record<string, number> {
  const ur: Record<string, number> = {};
  if (!v || typeof v !== "object") return ur;
  let antal = 0;
  for (const [k, val] of Object.entries(v as Record<string, unknown>)) {
    if (typeof k !== "string" || k.length > 120) continue;
    const n = renTalfalt(val, 100000);
    if (n <= 0) continue;
    ur[k] = n;
    if (++antal >= maxNycklar) break;
  }
  return ur;
}

/** Läs profilen — alltid en giltig BeteendeProfil, även i SSR-läge. */
export function lasBeteende(): BeteendeProfil {
  if (typeof window === "undefined") return tomProfil();
  try {
    const rå = window.localStorage.getItem(NYCKEL);
    if (!rå) return tomProfil();
    const p = JSON.parse(rå) as Partial<BeteendeProfil>;
    const timmar = (Array.isArray(p.typiskaTimmar) ? p.typiskaTimmar : [])
      .map((h) => renTalfalt(h, 23))
      .filter((h, i, a) => h >= 0 && h <= 23 && a.indexOf(h) === i)
      .sort((a, b) => a - b);
    const intressen: Record<string, number> = {};
    for (const nyckel of INTRESSE_NYCKLAR) {
      const poang = renTalfalt((p.intresseProfil ?? {})[nyckel], 100000);
      if (poang > 0) intressen[nyckel] = poang;
    }
    return {
      aktivTid: renTalfalt(p.aktivTid, 40_000_000), // ~15 månaders tak
      besoktaSidor: renRaknare(p.besoktaSidor, MAX_SIDOR),
      verktygsAnvandning: renRaknare(p.verktygsAnvandning, MAX_VERKTYG),
      "quiz ratt": renTalfalt(p["quiz ratt"], 100000),
      "quiz fel": renTalfalt(p["quiz fel"], 100000),
      typiskaTimmar: timmar,
      intresseProfil: intressen,
      senastAktiv: renTalfalt(p.senastAktiv, Number.MAX_SAFE_INTEGER),
    };
  } catch {
    return tomProfil();
  }
}

function spara(p: BeteendeProfil) {
  try {
    window.localStorage.setItem(NYCKEL, JSON.stringify(p));
  } catch {
    /* privat läge etc. — tracern är tyst även när den inte kan minnas */
  }
}

let senasteSidvisning = { namn: "", tid: 0 };

/**
 * Rapportera ett beteende till profilen. Sidvisningar dedupliceras
 * inom 15 sek (SPA-navigering/StrictMode räknas en gång).
 */
export function rapporteraBeteende(händelse: {
  typ: "sidvisning" | "verktyg" | "quiz" | "quizfel";
  namn: string;
  intresse?: string;
}) {
  if (typeof window === "undefined") return;
  const namn = typeof händelse.namn === "string" ? händelse.namn.slice(0, 120) : "";
  if (!namn) return;

  const nu = Date.now();
  if (händelse.typ === "sidvisning") {
    if (
      senasteSidvisning.namn === namn &&
      nu - senasteSidvisning.tid < SIDVISNING_DUBBLETT_MS
    ) {
      return;
    }
    senasteSidvisning = { namn, tid: nu };
  }

  const p = lasBeteende();

  // Aktiv tid: endast korta luckor mellan händelser räknas som närvaro.
  if (p.senastAktiv > 0) {
    const luckaSek = (nu - p.senastAktiv) / 1000;
    if (luckaSek > 0 && luckaSek <= MAX_AKTIV_LUCKA_SEK) {
      p.aktivTid += luckaSek;
    }
  }

  // Vilken timme på dygnet eleven är aktiv (unika timmar).
  const timme = new Date(nu).getHours();
  if (!p.typiskaTimmar.includes(timme)) p.typiskaTimmar.push(timme);
  p.typiskaTimmar.sort((a, b) => a - b);

  switch (händelse.typ) {
    case "sidvisning":
      p.besoktaSidor[namn] = (p.besoktaSidor[namn] ?? 0) + 1;
      break;
    case "verktyg":
      p.verktygsAnvandning[namn] = (p.verktygsAnvandning[namn] ?? 0) + 1;
      break;
    case "quiz":
      p["quiz ratt"] += 1;
      break;
    case "quizfel":
      p["quiz fel"] += 1;
      break;
  }

  const intresse = händelse.intresse;
  if (typeof intresse === "string" && (INTRESSE_NYCKLAR as readonly string[]).includes(intresse)) {
    p.intresseProfil[intresse] = (p.intresseProfil[intresse] ?? 0) + 1;
  }

  p.senastAktiv = nu;
  spara(p);
}

/**
 * Klassificera en sökväg till ett intressespår (används av TracerMount
 * och allt som vill berika sidvisningar):
 * - teknisk: /kurser/ts-*, AK1TS, Superanalysen, Konfluens, våg-verktygen
 * - fundamental: /kurser/v* (v01-v20), km-, vm-, mk-, se-, pc-, ud-, sj-*
 * - portfölj: portfölj-sidor (min-portfolj, portfoljbyggare) + kalkylatorn
 * - beteende: /kurser/bf-*, AI-Diagnos, Kognitiv profil
 */
export function klassifiera(sida: string): IntresseNyckel | undefined {
  const s = (sida ?? "").toLowerCase();
  if (!s.startsWith("/")) return undefined;
  if (
    s.startsWith("/kurser/teknisk") ||
    s.startsWith("/kurser/ts-") ||
    s.startsWith("/kurser/ak1ts") ||
    s.startsWith("/superanalys") ||
    s.startsWith("/konfluens") ||
    s.startsWith("/vagkon") ||
    s.startsWith("/netnet")
  ) {
    return "teknisk";
  }
  if (
    s.startsWith("/kurser/v") || // v01-v20 + vm- + vagfundament
    s.startsWith("/kurser/km-") ||
    s.startsWith("/kurser/mk-") ||
    s.startsWith("/kurser/se-") ||
    s.startsWith("/kurser/pc-") ||
    s.startsWith("/kurser/ud-") ||
    s.startsWith("/kurser/sj-") ||
    s.startsWith("/kurser/the-") || // BOKMASTER-böckerna: i grunden fundamental
    s.startsWith("/analyser")
  ) {
    return "fundamental";
  }
  if (
    s.includes("portfolj") ||
    s.startsWith("/kurser/pf-") ||
    s.startsWith("/kalkylator")
  ) {
    return "portfölj";
  }
  if (
    s.startsWith("/kurser/bf-") ||
    s.startsWith("/kurser/km-018") ||
    s.startsWith("/kurser/km-019") ||
    s.startsWith("/kurser/km-020") ||
    s.startsWith("/kurser/km-035") ||
    s.startsWith("/kurser/km-036") ||
    s.startsWith("/kurser/km-037") ||
    s.startsWith("/diagnos") ||
    s.startsWith("/profil")
  ) {
    return "beteende";
  }
  return undefined;
}

/** Toppintresset — det spår eleven visat störst nyfikenhet för. */
export function lasToppIntresse(p: BeteendeProfil | null = null): IntresseNyckel | null {
  const profil = p ?? lasBeteende();
  let topp: IntresseNyckel | null = null;
  let max = 0;
  for (const nyckel of INTRESSE_NYCKLAR) {
    const poang = profil.intresseProfil[nyckel] ?? 0;
    if (poang > max) {
      max = poang;
      topp = nyckel;
    }
  }
  return topp;
}

/** Intern helper: det mest använda verktyget. */
function toppVerktyg(p: BeteendeProfil): { namn: string; antal: number } | null {
  let topp: { namn: string; antal: number } | null = null;
  for (const [namn, antal] of Object.entries(p.verktygsAnvandning)) {
    if (!topp || antal > topp.antal) topp = { namn, antal };
  }
  return topp;
}

/** Intern helper: dygnsrytm ur typiskaTimmar. */
function dagrytm(timmar: number[]): "kvall" | "morgon" | "dag" | "blandat" | "okand" {
  if (timmar.length === 0) return "okand";
  const kvall = timmar.filter((h) => h >= 18 || h <= 4).length;
  const morgon = timmar.filter((h) => h >= 5 && h <= 9).length;
  const dag = timmar.filter((h) => h >= 10 && h <= 17).length;
  const storst = Math.max(kvall, morgon, dag);
  if (storst === 0) return "okand";
  if (kvall === storst && kvall > timmar.length / 2) return "kvall";
  if (morgon === storst && morgon > timmar.length / 2) return "morgon";
  if (dag === storst && dag > timmar.length / 2) return "dag";
  return "blandat";
}

/** Alltid uppmuntrande text om toppintresset — aldrig bristperspektiv. */
function intresseText(nyckel: IntresseNyckel): { rubrik: string; text: string; ikon: string } {
  switch (nyckel) {
    case "teknisk":
      return {
        rubrik: "Vågorna svarar dig",
        text: "Din nyfikenhet söker sig till vågor, mönster och timing — AK1TS-fördjupningarna och bibliotekets tekniska BOKMASTER är skrivna för just den resan.",
        ikon: "🌊",
      };
    case "fundamental":
      return {
        rubrik: "Värdet är din kompass",
        text: "Du lägger tid där kärnan finns: bokföring, värdering och bolagens verkliga substans — precis grunden som de största analytikerna byggt på.",
        ikon: "🏛️",
      };
    case "portfölj":
      return {
        rubrik: "Du ser helheten",
        text: "Ditt intresse samlar kunskapen till något större — en portfölj som bär. Portföljkurserna och ekosystem-kursen väver trådarna ihop.",
        ikon: "🧩",
      };
    case "beteende":
      return {
        rubrik: "Du studerar den viktigaste aktören — dig själv",
        text: "Beteendefinans är många mästares hemliga vapen. Att förstå ditt eget sinne är den mest avkastande kursen av alla.",
        ikon: "🧠",
      };
  }
}

/** Standardinsikter när profilen ännu är ung — alltid lika välkomnande. */
const STANDARDINSIKTER: Insikt[] = [
  {
    rubrik: "Ditt mönster tar form",
    text: "Tracern lyssnar tyst medan du utforskar. Efter några besök börjar den se hur du lär dig bäst — och tipsar dig vidare, alltid i din takt.",
    ikon: "🔭",
  },
  {
    rubrik: "Ett Dagens Pass väntar",
    text: "Ett kort pass om dagen bygger mer än långa pass en gång i månaden. Välkommen att prova när helst det passar — vi sparar din plats.",
    ikon: "☀️",
  },
  {
    rubrik: "Biblioteket är öppet — alltid",
    text: "Hela biblioteket är kostnadsfritt, för alltid. Följ din nyfikenhet dit den vill — den vet ofta bäst vart kunskapen ska bära.",
    ikon: "📚",
  },
];

/**
 * 3-5 pedagogiska insikter ur beteendeprofilen — AK1A-rösten:
 * uppmuntrande, aldrig dömande, alltid med ett "nästa steg" som känns
 * som en välkomnande dörr (inte en brist att åtgärda).
 */
export function lasInsikter(): Insikt[] {
  const p = lasBeteende();
  const quizTotalt = p["quiz ratt"] + p["quiz fel"];
  const andelRatt = quizTotalt > 0 ? p["quiz ratt"] / quizTotalt : 0;
  const topp = lasToppIntresse(p);
  const verktyg = toppVerktyg(p);
  const rytm = dagrytm(p.typiskaTimmar);
  const insikter: Insikt[] = [];

  // 1. Mästarnivå: quiz ≥ 80 % rätt efter minst 5 svar.
  if (quizTotalt >= 5 && andelRatt >= 0.8) {
    if (topp === "teknisk") {
      insikter.push({
        rubrik: "Du behärskar teknisk analys",
        text: "Över 80 % rätt på quiz med teknisk inriktning — djupare BOKMASTER i ämnet väntar: Elliott Wave Principle och Technical Analysis of the Financial Markets är nära naturliga steg.",
        ikon: "📈",
      });
    } else if (topp === "fundamental") {
      insikter.push({
        rubrik: "Du behärskar fundamental analys",
        text: "Över 80 % rätt på quiz i fundamentalämnena — djupare BOKMASTER i ämnet väntar: Security Analysis och The Intelligent Investor är nästa naturliga stapel.",
        ikon: "🏛️",
      });
    } else if (topp === "portfölj") {
      insikter.push({
        rubrik: "Du behärskar portföljtänket",
        text: "Över 80 % rätt på quiz med portfölijinriktning — Superanalysen och ekosystem-kursen Från aktie till portfölj väntar för att väva ihop helheten.",
        ikon: "🧩",
      });
    } else {
      insikter.push({
        rubrik: "Din kunskap bär",
        text: "Över 80 % rätt på quiz — glansen i dina svar syns. Tänka snabbt och långsamt är BOKMASTER som fördjupar just det du redan kan.",
        ikon: "🧠",
      });
    }
  } else if (quizTotalt >= 5 && andelRatt >= 0.5) {
    // 2. På god väg — repetition utan bristperspektiv.
    insikter.push({
      rubrik: "Kunskapen håller på att sätta sig",
      text: "Du svarar rätt oftare och oftare — glömskekurvan är normal, och repetition är inte baksteg, det är hur hjärnan bygger. Dagens Pass håller rörelsen vid liv.",
      ikon: "🔁",
    });
  }

  // 3. Dygnsrytm — när eleven studerar.
  if (rytm === "kvall") {
    insikter.push({
      rubrik: "Din studietid är kvällar",
      text: "Ditt mönster lyser starkast kvällstid — en fin och lugn timme för djupläsning. Ett kort Dagens Pass på morgonen kan balansera dagen och ge två tillfällen av närvaro.",
      ikon: "🌙",
    });
  } else if (rytm === "morgon") {
    insikter.push({
      rubrik: "Du bygger i gryningsljus",
      text: "Morgontimmar är din studietid — då sinnet är vilar och förmågan att läsa är som starkast. Dagens Pass är gjord för just din rytm.",
      ikon: "🌅",
    });
  }

  // 4. Praktiskt lagd — portfölj-verktyget mest använt.
  if (verktyg && (verktyg.namn.includes("portfolj") || verktyg.namn.includes("kalkylator"))) {
    insikter.push({
      rubrik: "Du är praktiskt lagd",
      text: "Verktygen är din ingång till kunskapen — du lär genom att göra. Superanalysen är din nästa utmaning: samma praktiska grepp, men med hela ekosystemet i spel.",
      ikon: "🛠️",
    });
  } else if (verktyg && verktyg.namn.includes("superanalys")) {
    insikter.push({
      rubrik: "Du har smakat på mästarverktyget",
      text: "Superanalysen ligger i din ryggrad — djupare BOKMASTER i värdeinvestering ger nästa nivå av underlag att analysera med.",
      ikon: "🔬",
    });
  }

  // 5. Toppintresset — alltid plats för nyfikenheten.
  if (topp && !insikter.some((i) => i.ikon === intresseText(topp).ikon)) {
    insikter.push(intresseText(topp));
  }

  // 6. Tacksamhet (tvåsidig) — aldrig skyldighet.
  if (p.aktivTid >= 30 * 60) {
    insikter.push({
      rubrik: `${Math.round(p.aktivTid / 60)} minuter av närvaro`,
      text: "Tack för att du investerar i dig själv — den tiden är din, och kunskapen som byggs kan ingen ta ifrån dig.",
      ikon: "❤️",
    });
  }

  // Fyll alltid upp till minst 3 — ny profil är inte en tom profil, bara en början.
  for (const standard of STANDARDINSIKTER) {
    if (insikter.length >= 3) break;
    if (!insikter.some((i) => i.rubrik === standard.rubrik)) insikter.push(standard);
  }

  return insikter.slice(0, 5);
}
