/**
 * AI-MENTORN 2.0 — ÄGANDEFÖRHANDSFRÅGOR (spår 6, omgång 8, s6-u2).
 *
 * Två ytterligare källmärkta förhandsfrågor ovanpå de tidigare lagren
 * (basens MONSTER i ai-mentor-svar.ts, extra-, makro-, nästa-,
 * kapitalmekanik-, sektor-, case-, praktik- och portfoljgrund-lagren):
 *   1. Bolagsstämma & rösträtt (sj-03 primär + km-002 + km-067 —
 *      A/B-aktiernas svenska klassiker)
 *   2. Styrelse & bolagsstyrning (km-002 primär + km-026 relaterade
 *      parter + sj-03 — ägarmaktens fördelning ägare → styrelse → VD)
 *
 * ÄMNESVAL EFTER KOLLISIONSKONTROLL (513 kärnord LIVE-lästa ur samtliga
 * nio tidigare lager, mekaniskt): "bolagsstämma/stämma/rösträtt/röstvärde/
 * aktieklass" och "styrelse/bolagsstyrning/förvaltningsberättelse/
 * närstående" saknades helt. Basens rapport-monster äger bokslutsläsningen
 * (bokslut/balansräkning/resultaträkning), aktiemarknads-monstret äger
 * handelns mekanik (orderbok/likviditet/spread) och sektorns fastighets-
 * monster äger "stamaktionär/stamaktieägare" — samtliga familjer lämnas
 * orörda; A/B-aktier behandlas här via "aktieklass/röstvärde" i stället.
 * Registret bär 13 BOKFÖRING & ÅRSREDOVISNING-kurser, 5 SKATT & JURIDIK-
 * kurser och den dedikerade stämmokursen sj-03 — rikt källmaterial,
 * noll API-kostnad.
 *
 * ANSVARSFÖRDELNING (samma princip som syskonlagren):
 *   • "utdelning" ägs av basens utdelnings-monster — stämmasvaret nämner
 *     att utdelningen BESLUTAS på stämman men ämnet självt lämnas åt
 *     basen (fragor:-knapp, inte kärnord).
 *   • "investmentbolag" ägs av nästa-lagret — km-067 används här endast
 *     som KÄLLA och kurslänk, aldrig som kärnord.
 *   • "relaterade parter"/"närstående" ägs av detta lager; km-026 är
 *     dess primära fördjupningskurs i styrelse-svaret.
 *
 * Matchningen speglar motorns hjälpfunktioner (samma lösning som alla
 * syskonlagren: Node type-stripping löser endast `import type`, så de
 * rena funktionerna speglas hit). Semantisk likhet med motorn BEVISAS
 * av testets felstavningfall (B) och determinismfall (C). Driftvarning:
 * ändras motorns matchning måste denna spegel följa — testfall B vaktar.
 *
 * SAMMANSÄTTNING (chat-widget.tsx):
 *   svaraLokaltMakro(q, KURSREGISTER)
 *     ?? svaraLokaltExtra(q, KURSREGISTER)
 *     ?? svaraLokalt(q, KURSREGISTER)
 *     ?? svaraLokaltNasta(q, KURSREGISTER)
 *     ?? svaraLokaltKapitalmekanik(q, KURSREGISTER)
 *     ?? svaraLokaltSektor(q, KURSREGISTER)
 *     ?? svaraLokaltCase(q, KURSREGISTER)
 *     ?? svaraLokaltPraktik(q, KURSREGISTER)
 *     ?? svaraLokaltPortfoljgrund(q, KURSREGISTER)
 *     ?? svaraLokaltAgande(q, KURSREGISTER)
 * Detta lager ligger SIST i kedjan och kan därför ALDRIG stjäla en
 * fråga från tidigare lager — det fångar bara frågor som alla andra
 * lager lämnar null på. Omvänt vaktar testfall I på att dessa frågor
 * INTE fångas av kedjan utan detta lager (dupliceringsskydd).
 *
 * ── JURIDIKGRINDEN (lagen 2007:528) ──────────────────────────────────
 * All text är pedagogisk utbildning om hur ägarmakt, röstning och
 * bolagsstyrning FUNGERAR — inga köp-/säljsignaler, inga omdömen om
 * enskilda bolag, styrelser eller huvudägare. A/B-aktiers för- och
 * nackdelar beskrivs som avvägningar läsaren själv får bedöma.
 *
 * ── DEPENDENCY-INJECTION (samma mönster som hela motorn) ─────────────
 * Registret skickas IN som parameter (endast `import type`) så att
 * verktyg/testa-ai-mentor-agande.mjs kan köra filen direkt i Node.
 * Alla källkurser (sj-03, km-002, km-067, km-026) finns i KURSREGISTER —
 * inga väntande registerberoenden.
 */

import type { RegisterRad } from "./ai-mentor-register";
import type { FragMonster, LokalKalla, LokaltSvar } from "./ai-mentor-svar";

// ── Hjälpbyggare — spegling av motorns (ai-mentor-svar.ts) ─────────────────
// Samma driftvarning som syskonlagren: speglade rena funktioner, bevisade
// likvärdiga av regressionstestet (fall B + C).

function normalisera(s: string): string {
  return s.toLowerCase().replace(/[^\p{L}\p{N}]+/gu, " ").replace(/\s+/g, " ").trim();
}

function diafri(s: string): string {
  return normalisera(s).normalize("NFD").replace(/\p{M}/gu, "").normalize("NFC");
}

function redigeringstavstand(a: string, b: string): number {
  if (a === b) return 0;
  const n = a.length;
  const m = b.length;
  if (n === 0) return m;
  if (m === 0) return n;
  let fore = Array.from({ length: m + 1 }, (_, j) => j);
  const nu = new Array<number>(m + 1);
  for (let i = 1; i <= n; i++) {
    nu[0] = i;
    for (let j = 1; j <= m; j++) {
      const kostnad = a.charCodeAt(i - 1) === b.charCodeAt(j - 1) ? 0 : 1;
      nu[j] = Math.min(nu[j - 1] + 1, fore[j] + 1, fore[j - 1] + kostnad);
    }
    fore = [...nu];
  }
  return fore[m];
}

function traff(fragaOrd: string[], fragaStr: string, nyckelord: string): boolean {
  const nk = diafri(nyckelord);
  if (!nk) return false;
  if (nk.includes(" ")) return fragaStr.includes(nk); // flerordsfras
  if (nk.length <= 3) return fragaOrd.includes(nk); // korta ord: exakt
  const max = nk.length <= 7 ? 1 : 2; // längre ord tål 1–2 fel
  return fragaOrd.some((o) => redigeringstavstand(o, nk) <= max);
}

/** Källrad som avslutar varje svar — KÄLLMÄRT (samma format som motorn). */
function kallrad(k: LokalKalla): string {
  return `\n\n📖 Källa: ${k.titel}${k.slug ? ` (${k.slug})` : ""} — ${k.lagrow}.`;
}

/**
 * Flerkällskällmärke — spegling av motorns kallradFler (modulprivat där):
 * en källa ⇒ kallrad-format, flera ⇒ numrerad Källor-lista. Formatet vakas
 * av testfall A ("📖 Källor (").
 */
function kallradFler(kallor: LokalKalla[]): string {
  if (kallor.length === 0) return "";
  if (kallor.length === 1) return kallrad(kallor[0]);
  const rader = kallor
    .map((k, i) => `${i + 1}. ${k.titel}${k.slug ? ` (${k.slug})` : ""} — ${k.lagrow}`)
    .join("\n");
  return `\n\n📖 Källor (${kallor.length}):\n${rader}`;
}

function kursKalla(register: RegisterRad[], slug: string, lagrow: string): LokalKalla {
  const r = register.find((x) => x.slug === slug);
  return r
    ? { slug: r.slug, titel: r.titel, lagrow }
    : { titel: "Läroplanen", lagrow };
}

// ── De 2 ägande-frågorna ────────────────────────────────────────────────────

export const AGANDE_MONSTER: FragMonster[] = [
  {
    id: "bolagsstamma",
    karnord: [
      "bolagsstämma", "bolagsstämman", "bolagsstämmor",
      "stämma", "stämman", "stämmor",
      "rösträtt", "rösträtten", "röstvärde", "röstvärdet",
      "aktieklass", "aktieklasser", "röstandel", "röstandelar",
      "minoritetsskydd", "majoritetsägare",
    ],
    starkord: [
      "aktier", "aktie", "ägare", "ägande", "bolag", "bolaget",
      "veta", "hur", "fungerar", "besluta", "beslutas",
    ],
    bygga: (reg) => {
      const sjAntal = reg.filter((r) => r.kategori === "SKATT & JURIDIK").length;
      const kallor = [
        kursKalla(reg, "sj-03-bolagsstamma-och-rostratt", "Läroplanen — skatt & juridik, kursen om ägarmaktens arena"),
        kursKalla(reg, "km-002-forvaltningsberattelsen", "Läroplanen — bokföring & årsredovisning, stämmans eget dokument"),
        kursKalla(reg, "km-067-investmentbolag", "Läroplanen — private equity & investmentbolag, A/B-systemets klassiker"),
      ];
      const k = kallor[0];
      const sj = reg.find((r) => r.slug === "sj-03-bolagsstamma-och-rostratt");
      return {
        text:
          `Bolagsstämman är aktieägarnas högsta organ — den årliga sammankomst där ägarna utövar sin makt över bolaget de äger. Tre mekanisker gör ämnet mer än formalia:\n\n1️⃣ RÖSTRÄTTEN ÄR ÄGANDETS RÖST — huvudregeln är en aktie, en röst: vem som äger mest röstandelar styr besluten (utdelning, styrelse, revision). Men många bolag har AKTIEKLASSER: A-aktier med superröster (på svenska börsen ofta tio röster mot B:s en) låter en familj eller stiftelse kontrollera bolag med en bråkdel av kapitalet. Systemet har två sidor som var och en får bedöma själv: långsiktighet och skydd mot bud — eller att kapital och makt hamnar på olika händer.\n2️⃣ STÄMMAN BESLUTAR OM DET SOM GÅR HEM TILL DIG — utdelningen (som har en egen förhandsfråga här i mentorn), styrelsens sammansättning och revisionsfirman. Därför läses en stämma som en kalenderpost i aktieägandets år: lika naturlig som rapporten, fast den handlar om MAKT snarare än siffror.\n3️⃣ MINORITETSSKYDDEN ÄR SPELENS REGLER — majoriteten får inte rösta igenom vad som helst: övertagande- och minoritetsskyddsreglerna sätter ramarna för vad en majoritetsägare får göra mot övriga ägare. Att känna regelverket är att veta var ens egen röst börjar och slutar.\n\nI kategorin skatt & juridik finns ${sjAntal} kurser — stämmokursen (${sj ? sj.minuter + " min" : "i registret"}) är den som tar hela dagen från kallelse till protokoll.\n\nSom alltid: detta är utbildning i hur ägarmakt FUNGERAR — aldrig ett omdöme om någon enskild bolagsstyrning eller ägare.` +
          kallradFler(kallor),
        amne: "bolagsstämma",
        kalla: k,
        kallor,
        handlings: [
          { text: "Kursen: Bolagsstämma och rösträtt", lank: "/kurser/sj-03-bolagsstamma-och-rostratt", ikon: "🗳️", beskrivning: "Nybörjare — ägarmaktens arena" },
          { text: "Kursen: Förvaltningsberättelsen", lank: "/kurser/km-002-forvaltningsberattelsen", ikon: "📜", beskrivning: "Intermediär — stämmans eget dokument" },
          { text: "Kursen: Investmentbolag — NAV-rabatt", lank: "/kurser/km-067-investmentbolag", ikon: "🏛️", beskrivning: "A/B-aktiernas svenska klassiker" },
          { text: "Vad gör en styrelse?", lank: "fragor:" + encodeURIComponent("vad gör en styrelse?"), ikon: "🪑", beskrivning: "Makten nästa steg ner" },
        ],
        motfraga: { text: "Vad gör en styrelse?", kategori: "ägande" },
        fordjupa: { text: k.titel, lank: "/kurser/sj-03-bolagsstamma-och-rostratt" },
      };
    },
  },
  {
    id: "styrning",
    karnord: [
      "styrelse", "styrelsen", "styrelser",
      "styrelseordförande", "styrelseledamot", "styrelseledamöter",
      "bolagsstyrning", "bolagsstyrningen",
      "förvaltningsberättelse", "förvaltningsberättelsen",
      "närstående", "närståendetransaktion",
      "relaterade parter",
    ],
    starkord: [
      "bolag", "bolaget", "ansvar", "ansvarar", "väljs", "välja",
      "vem", "gör", "vd", "utser",
    ],
    bygga: (reg) => {
      const bkAntal = reg.filter((r) => r.kategori === "BOKFÖRING & ÅRSREDOVISNING").length;
      const kallor = [
        kursKalla(reg, "km-002-forvaltningsberattelsen", "Läroplanen — bokföring & årsredovisning, styrelsens egen redogörelse"),
        kursKalla(reg, "km-026-relaterade-parter", "Läroplanen — bokföring & årsredovisning, intressekonfliktens redovisning"),
        kursKalla(reg, "sj-03-bolagsstamma-och-rostratt", "Läroplanen — skatt & juridik, den stämma som väljer styrelsen"),
      ];
      const k = kallor[0];
      const fb = reg.find((r) => r.slug === "km-002-forvaltningsberattelsen");
      const rp = reg.find((r) => r.slug === "km-026-relaterade-parter");
      return {
        text:
          `Styrelsen är länken mellan ägarna och bolaget: vald av stämman att förvalta aktieägarnas kapital — inte att driva bolaget dag för dag (det är VD:s och ledningens uppdrag). Tre byggstenar gör bolagsstyrningen begriplig:\n\n1️⃣ ANSVARSFÖRDELNINGEN ÄR TRE STEG — ägarna röstar på stämman, styrelsen utser och granskar ledningen, ledningen driver verksamheten. Varje steg har sin fråga: ägarna frågar VARIFRÅN kapitalet kommer, styrelsen frågar VEM som får förfoga över det, ledningen frågar HUR det ska användas. När något går snett i ett bolag är första övningen att lokalisera vilket steg som svek.\n2️⃣ FÖRVALTNINGSBERÄTTELSEN ÄR STYRELSENS RÖST — årsredovisningens del där styrelsen självt berättar om året: verksamhet, risker, händelser efter räkenskapsårets slut. Den läses som ett styrelseansvar i dokumentform (${fb ? fb.minuter + " min kurs" : "kurs i registret"}) — och den undertecknas av samma personer som stämman kan avsätta.\n3️⃣ RELATERADE PARTER ÄR KONFLIKTERNAS REDOVISNING — när bolaget gör affärer med styrelsen själv, stora ägare eller deras andra bolag uppstår frågan vems intresse som styr priset. Sådana transaktioner ska redovisas öppet (${rp ? rp.minuter + " min kurs" : "kurs i registret"}) — transparensen är mekanismen som gör en närståendeaffär granskbar för dem som inte satt vid bordet.\n\nI kategorin bokföring & årsredovisning finns ${bkAntal} kurser — från förvaltningsberättelsen till noter och relaterade parter.\n\nSom alltid: detta är utbildning i hur styrning och ansvar FUNGERAR — aldrig ett omdöme om någon enskild styrelse eller bolagsledning.` +
          kallradFler(kallor),
        amne: "bolagsstyrning",
        kalla: k,
        kallor,
        handlings: [
          { text: "Kursen: Förvaltningsberättelsen", lank: "/kurser/km-002-forvaltningsberattelsen", ikon: "📜", beskrivning: "Intermediär — styrelsens egen redogörelse" },
          { text: "Kursen: Relaterade parter", lank: "/kurser/km-026-relaterade-parter", ikon: "🔀", beskrivning: "Avancerad — intressekonfliktens redovisning" },
          { text: "Kursen: Bolagsstämma och rösträtt", lank: "/kurser/sj-03-bolagsstamma-och-rostratt", ikon: "🗳️", beskrivning: "Nybörjare — den stämma som väljer styrelsen" },
          { text: "Vad är en bolagsstämma?", lank: "fragor:" + encodeURIComponent("vad är en bolagsstämma?"), ikon: "🗳️", beskrivning: "Ägarmaktens arena" },
        ],
        motfraga: { text: "Vad är en bolagsstämma?", kategori: "ägande" },
        fordjupa: { text: k.titel, lank: "/kurser/km-002-forvaltningsberattelsen" },
      };
    },
  },
];

// ── Huvudingången ──────────────────────────────────────────────────────────

/**
 * Svara lokalt med NÅGOT av de två ägande-mönstren — eller null
 * (då har hela kedjan före redan lämnat null och API-flödet tar över som
 * förr). Ligger SIST i widgetens kedja och kan därför aldrig stjäla en
 * fråga från tidigare lager. Samma matchningssemantik som basmotorn:
 * minst ett kärnord krävs, poäng = kärnord × 3 + stärkord, oavgjort →
 * först deklarerade mönstret vinner (strikt >, deterministiskt).
 * Samma fråga ⇒ bitidentiskt svar.
 */
export function svaraLokaltAgande(fraga: string, register: RegisterRad[]): LokaltSvar | null {
  const fragaStr = diafri(fraga);
  if (!fragaStr) return null;
  const fragaOrd = fragaStr.split(" ");
  let bast: { svar: LokaltSvar; poang: number } | null = null;
  for (const m of AGANDE_MONSTER) {
    const karnTraff = m.karnord.filter((nk) => traff(fragaOrd, fragaStr, nk));
    if (karnTraff.length === 0) continue; // krav: minst ett kärnord
    const starkTraff = m.starkord?.filter((nk) => traff(fragaOrd, fragaStr, nk)) ?? [];
    const poang = karnTraff.length * 3 + starkTraff.length;
    if (!bast || poang > bast.poang) bast = { svar: m.bygga(register), poang };
  }
  return bast ? bast.svar : null;
}
