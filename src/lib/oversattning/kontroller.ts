/**
 * MÖS KVALITETSKONTROLLER — deterministiska, inga nätverk, inga undantag
 * (Våg 52, MEGA ÖVERSÄTTNINGSSYSTEMET).
 *
 * Kundens krav: "vi måste garantera att översättningen har också rätt
 * översättning". Garantin består av FYRA kontroller som varje maskinöversätt
 * MÅSTE passera innan den får status högre än "maskinutkast-behovar-
 * granskning" (se ./motor.ts). Deterministiska, inga nätverk — exakt ETT
 * dokumenterat undantag finns (LATERAL_UNDANTAG_CHART, se lateralKolla):
 *
 *   1. termKonsistens   — varje termbanksterm i källan SKALL vara översatt med
 *                         bankens kanoniska målterm (rätt-översättningsgarantin).
 *   2. sifferIntegritet — ALLA tal identiska (multiset) källa/översättning; en
 *                         felaktig siffra är ett FAKTAFEL, inte ett språkfel
 *                         (SPRAK-PLAN §4.1.4a). AR tillåter östra siffror —
 *                         normaliseras ٠-٩ → 0-9 (och ۰-۹, ٫ → ., ٬ → ,) först.
 *   3. strukturIntegritet — stycken, rader, markdown-listor (*, -, 1.), rubriker
 *                         (#), tabellrader (|) och — för JSON-block (tabell/
 *                         tidslinje) — toppnycklar + arraylängder: identiska.
 *   4. lateralKolla     — längdförhållande 0,5–2,5× källan (kraftigt avvikande
 *                         längd ⇒ avkapad eller påhittad text); AR: inga åäö-
 *                         läckor (vitlista från termbanken, se arVitlista);
 *                         EN: inga arabiska teckenläckor.
 *
 * Poäng 0–100: term 40 + siffror 25 + struktur 20 + lateral 15. Kvalitetströskel
 * 90 (KVALITETSTRASKEL) styr motor.ts statusflöde.
 *
 * Ren funktionell kärna: varken fs, nätverk eller env — importeras av BOTH
 * cron-rutten (server) och verktyg/validera-motorer.mjs (tsx-tester).
 */

import { arVitlista, hittaTermerIKalla, type TermRad } from "./termbank";
import type { MalSprak } from "./kalla";

// ── Typer ────────────────────────────────────────────────────────────────────

export type KontrollNamn = "termKonsistens" | "sifferIntegritet" | "strukturIntegritet" | "lateralKolla";

export type KontrollResultat = {
  namn: KontrollNamn;
  pass: boolean;
  /** Människoläsbar förklaring — sparas i kontrollrapporten (Supabase JSONB). */
  detaljer: string;
  /** Maskinläsbara nyckeltal för kontrollen. */
  varden: Record<string, number | string>;
};

export type Kontrollrapport = {
  /** 0–100 — viktad summa av godkända kontroller. */
  poang: number;
  resultat: readonly KontrollResultat[];
};

/** Under denna poäng krävs granskning oavsett motor (motor.ts). */
export const KVALITETSTRASKEL = 90;

const VIKTER: Record<KontrollNamn, number> = {
  termKonsistens: 40,
  sifferIntegritet: 25,
  strukturIntegritet: 20,
  lateralKolla: 15,
};

// ── Siffernormalisering ──────────────────────────────────────────────────────

const OSTRA_SIFFROR: Record<string, string> = {
  "٠": "0", "١": "1", "٢": "2", "٣": "3", "٤": "4",
  "٥": "5", "٦": "6", "٧": "7", "٨": "8", "٩": "9",
  // Persisk/urdu-variant (utökade arabisk-indiska siffror) — samma normaliser-
  // ing: finanssajter blandar, kontrollen ska inte missa ett tal pga skrifttyp.
  "۰": "0", "۱": "1", "۲": "2", "۳": "3", "۴": "4",
  "۵": "5", "۶": "6", "۷": "7", "۸": "8", "۹": "9",
  // Arabiska decimal- och tusentalsseparatorer
  "٫": ".", "٬": ",",
};

/** Normalisera östra siffror/separatatorer till västerländska (idempotent). */
export function normaliseraSiffror(text: string): string {
  return text.replace(/[٠-٩۰-۹٫٬]/gu, (tecken) => OSTRA_SIFFROR[tecken] ?? tecken);
}

/** Talregex enligt kundspec: [-+]?\d+([.,]\d+)? — på normaliserad text. */
const TAL_RE = /[-+]?\d+(?:[.,]\d+)?/g;

/** Multiset av talen i en text: "12,5 12,5 8" → {"12,5": 2, "8": 1}. */
function talMultiset(text: string): Map<string, number> {
  const m = new Map<string, number>();
  for (const tal of normaliseraSiffror(text).match(TAL_RE) ?? []) {
    m.set(tal, (m.get(tal) ?? 0) + 1);
  }
  return m;
}

// ── Kontroll 1: termKonsistens ───────────────────────────────────────────────

/**
 * Varje termbanksterm som förekommer i källan SKALL ha bankens målterm i
 * översättningen. Svensk term matchas med ordgränser + tillåtna böjnings-
 * suffix (se termbank.ts); måltermen söms med includes() — skiftlägesokänsligt
 * för EN (meningens inledning versaliserar), exakt för AR (saknar skiftläge).
 */
export function termKonsistens(
  kalltext: string,
  oversattning: string,
  sprak: MalSprak,
): KontrollResultat {
  const traffade = hittaTermerIKalla(kalltext);
  const hoStack = sprak === "en" ? oversattning.toLowerCase() : oversattning;
  const missar: string[] = [];
  for (const rad of traffade as readonly TermRad[]) {
    const mal = sprak === "en" ? rad.en.toLowerCase() : rad.ar;
    if (!hoStack.includes(mal)) missar.push(rad.sv + " → " + mal);
  }
  const pass = missar.length === 0;
  return {
    namn: "termKonsistens",
    pass,
    detaljer: pass
      ? traffade.length === 0
        ? "inga termbankstermer i källan — garantin vilar på övriga kontroller"
        : traffade.length + " termer träffade, samtliga korrekt översatta enligt termbanken"
      : "MISSAR (" + missar.length + "): " + missar.slice(0, 8).join("; "),
    varden: { traffade: traffade.length, missar: missar.length, sprak },
  };
}

// ── Kontroll 2: sifferIntegritet ─────────────────────────────────────────────

/**
 * ALLA tal ska vara identiska multiset källa/översättning. Sträng-formen ska
 * bevaras exakt ("2,5" förblir "2,5" även på EN — motorpromten föreskriver
 * detta; en decimalteckenbyte är en ändring som syns). Undantag per kundspec:
 * AR får använda östra siffror — de normaliseras före jämförelsen.
 */
export function sifferIntegritet(kalltext: string, oversattning: string): KontrollResultat {
  const kallaM = talMultiset(kalltext);
  const ovM = talMultiset(oversattning);
  const saknas: string[] = []; // tal som finns i källan men ej (tillräckligt många gånger) i översättningen
  const extra: string[] = [];
  for (const [tal, antal] of kallaM) {
    const ovAntal = ovM.get(tal) ?? 0;
    if (ovAntal < antal) saknas.push(tal + " (källa " + antal + "×, översättning " + ovAntal + "×)");
  }
  for (const [tal, antal] of ovM) {
    const kallAntal = kallaM.get(tal) ?? 0;
    if (kallAntal < antal) extra.push(tal + " (översättning " + antal + "×, källa " + kallAntal + "×)");
  }
  const pass = saknas.length === 0 && extra.length === 0;
  return {
    namn: "sifferIntegritet",
    pass,
    detaljer: pass
      ? "alla " + kallaM.size + " unika tal identiska (multiset) efter AR-normalisering"
      : "SIFFOR AVVIKER — saknas i översättning: [" + saknas.slice(0, 6).join(", ") + "] extra: [" + extra.slice(0, 6).join(", ") + "]",
    varden: {
      unikaTalKalla: kallaM.size,
      unikaTalOversattning: ovM.size,
      saknade: saknas.length,
      extra: extra.length,
    },
  };
}

// ── Kontroll 3: strukturIntegritet ───────────────────────────────────────────

type StrukturProfil = {
  stycken: number;
  rader: number;
  punktlistor: number;
  numreradeListor: number;
  rubriker: number;
  tabellrader: number;
  jsonToppnycklar: string;
  jsonArraylangder: string;
};

function strukturProfil(text: string): StrukturProfil {
  const rader = text.split("\n");
  const stycken = text
    .split(/\n\s*\n/)
    .map((s) => s.trim())
    .filter((s) => s.length > 0).length;
  const punktlistor = rader.filter((r) => /^\s*[-*+]\s/.test(r)).length;
  const numreradeListor = rader.filter((r) => /^\s*\d+[.)]\s/.test(r)).length;
  const rubriker = rader.filter((r) => /^\s*#{1,6}\s/.test(r)).length;
  const tabellrader = rader.filter((r) => /^\s*\|/.test(r)).length;

  // JSON-block (blocktyp "tabell"/"tidslinje" i deep-courses.json): strukturen
  // är datan — jämför toppnycklar och arraylängder om båda ändarna parses.
  let jsonToppnycklar = "-";
  let jsonArraylangder = "-";
  const trimmad = text.trim();
  if (trimmad.startsWith("{") || trimmad.startsWith("[")) {
    try {
      const parsad: unknown = JSON.parse(trimmad);
      if (parsad && typeof parsad === "object" && !Array.isArray(parsad)) {
        const obj = parsad as Record<string, unknown>;
        jsonToppnycklar = Object.keys(obj)
          .slice()
          .sort()
          .join(",");
        jsonArraylangder = Object.keys(obj)
          .filter((k) => Array.isArray(obj[k]))
          .sort()
          .map((k) => k + ":" + String((obj[k] as unknown[]).length))
          .join(",");
      } else if (Array.isArray(parsad)) {
        jsonToppnycklar = "(array)";
        jsonArraylangder = "längd:" + String(parsad.length);
      }
    } catch {
      jsonToppnycklar = "(ogiltig JSON)";
    }
  }
  return { stycken, rader: rader.length, punktlistor, numreradeListor, rubriker, tabellrader, jsonToppnycklar, jsonArraylangder };
}

/**
 * Strukturen är pedagogiken: antal stycken/rader, markdown-listor, rubriker
 * och tabellrader ska vara identiska — annars har motorn kapat eller lagt till
 * innehåll. För JSON-block jämförs även toppnycklar + arraylängder.
 */
export function strukturIntegritet(kalltext: string, oversattning: string): KontrollResultat {
  const a = strukturProfil(kalltext);
  const b = strukturProfil(oversattning);
  const falt: Array<[keyof StrukturProfil, string]> = [
    ["stycken", "stycken"],
    ["rader", "rader"],
    ["punktlistor", "markdown-*-listor"],
    ["numreradeListor", "numrerade listor"],
    ["rubriker", "rubriker (#)"],
    ["tabellrader", "tabellrader (|)"],
    ["jsonToppnycklar", "JSON-toppnycklar"],
    ["jsonArraylangder", "JSON-arraylängder"],
  ];
  const avvikelser = falt
    .filter(([nyckel]) => String(a[nyckel]) !== String(b[nyckel]))
    .map(([nyckel, namn]) => namn + ": källa " + String(a[nyckel]) + " ≠ översättning " + String(b[nyckel]));
  const pass = avvikelser.length === 0;
  return {
    namn: "strukturIntegritet",
    pass,
    detaljer: pass
      ? "struktur identisk: " + a.stycken + " stycken, " + a.rader + " rader, " + a.punktlistor + " punktlistor, " + a.numreradeListor + " numrerade, " + a.rubriker + " rubriker, " + a.tabellrader + " tabellrader, json=[" + a.jsonToppnycklar + " / " + a.jsonArraylangder + "]"
      : "STRUKTUR AVVIKER — " + avvikelser.slice(0, 6).join("; "),
    varden: {
      styckenKalla: a.stycken,
      styckenOversattning: b.stycken,
      raderKalla: a.rader,
      raderOversattning: b.rader,
    },
  };
}

// ── Kontroll 4: lateralKolla ─────────────────────────────────────────────────

/**
 * Korpusens ENDA dokumenterade lateral-undantag (våg 76 → våg 86, V86-CHARTFIX):
 * the-intelligent-investor kap15:quiz3:a2 + kap19:quiz1:a3 har källtexten exakt
 * "Chart" (5 tecken). Termbankens kanoniska rad "chart" (skiftlägesokänslig
 * träff i termKonsistens) kräver måltermen "الرسم البياني" — 13 tecken, dvs.
 * längdkvot 13/5 = 2,6. INGEN termbankskorrekt AR-översättning kan hålla sig
 * under taket 2,5 (måltermen ensam är 13 tecken), och en tilläggsrad
 * ("Chart"→"مخطط") löser det inte: källan träffar BÅDA raderna och svaret
 * måste då innehålla båda arabtermerna (≥ 18 tecken, kvot 3,6). Korpus-skann
 * (våg 86) bekräftar att exakt DESSA 2 poster är de enda källorna vars text
 * efter trim är "Chart" — undantaget scopas av källtexten + språket, inte
 * nyckeln (kontrollerna är nyckellösa). Tak 3,0 släpper in 2,6 men förkastar
 * fortfarande t.ex. "مخطط الرسم البياني" (18 tecken, 3,6). Undre taket
 * (0,5) och åäö-kontrollen gäller oförändrat; EN påverkas inte.
 */
const LATERAL_UNDANTAG_CHART = "Chart";
const LATERAL_UNDANTAG_TAK = 3.0;

/** AR-vitlistan hämtas en gång (termbanken är oföränderlig per process). */
let vitlistaCache: readonly string[] | null = null;

/**
 * Lateral sanering: längdförhållande 0,5–2,5× källan (undantag: källtext exakt
 * "Chart" i AR får 3,0× — se LATERAL_UNDANTAG_CHART); AR får inte läcka å/ä/ö
 * (utom inom vitlistade termbankssträngar — arVitlista()); EN får inte läcka
 * arabiska bokstäver. Riktning: SPRAK-PLAN §4.1.4a längdsanitet.
 */
export function lateralKolla(
  kalltext: string,
  oversattning: string,
  sprak: MalSprak,
): KontrollResultat {
  const problem: string[] = [];
  const kallaLangd = kalltext.length;
  const ovLangd = oversattning.length;
  const undantaget = sprak === "ar" && kalltext.trim() === LATERAL_UNDANTAG_CHART;
  const tak = undantaget ? LATERAL_UNDANTAG_TAK : 2.5;
  let forhallande = 1;
  if (kallaLangd > 0) {
    forhallande = ovLangd / kallaLangd;
    if (forhallande < 0.5) problem.push("för kort: förhållande " + forhallande.toFixed(3) + " (< 0,5) — avkapad?");
    if (forhallande > tak) problem.push("för lång: förhållande " + forhallande.toFixed(3) + " (> " + String(tak) + (undantaget ? ", undantagets tak" : "") + ") — påhittat innehåll?");
  }
  if (sprak === "ar") {
    if (!vitlistaCache) vitlistaCache = arVitlista();
    let rensad = oversattning;
    for (const tillaten of vitlistaCache) {
      rensad = rensad.split(tillaten).join(" ");
    }
    const lackage = rensad.match(/[åäöÅÄÖ]/g);
    if (lackage) problem.push("åäö-läckage i arabisk text: " + lackage.slice(0, 5).join(" "));
  } else if (sprak === "en") {
    const arabiska = oversattning.match(/[\u0600-\u06FF]/g);
    if (arabiska) problem.push("arabiska tecken i engelsk text: " + arabiska.slice(0, 5).join(" "));
  }
  return {
    namn: "lateralKolla",
    pass: problem.length === 0,
    detaljer: problem.length === 0
      ? "längdförhållande " + forhallande.toFixed(3) + " inom [0,5; " + String(tak) + "]" + (undantaget ? " (dokumenterat Chart-undantag)" : "") + (sprak === "ar" ? "; inga åäö-läckor" : "") + (sprak === "en" ? "; inga arabiska läckor" : "")
      : problem.join("; "),
    varden: {
      langdForhallande: Math.round(forhallande * 1000) / 1000,
      kallaLangd,
      oversattLangd: ovLangd,
      sprak,
    },
  };
}

// ── Sammantaget ──────────────────────────────────────────────────────────────

/**
 * Kör alla fyra kontroller och räkna poäng (0–100). Deterministisk: samma par
 * (källa, översättning, språk) ger alltid samma rapport.
 */
export function korKontroller(kalltext: string, oversattning: string, sprak: MalSprak): Kontrollrapport {
  const resultat: KontrollResultat[] = [
    termKonsistens(kalltext, oversattning, sprak),
    sifferIntegritet(kalltext, oversattning),
    strukturIntegritet(kalltext, oversattning),
    lateralKolla(kalltext, oversattning, sprak),
  ];
  const poang = resultat.reduce((summa, r) => summa + (r.pass ? VIKTER[r.namn] : 0), 0);
  return { poang, resultat };
}
