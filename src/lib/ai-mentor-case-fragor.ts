/**
 * AI-MENTORN 2.0 — CASE-FÖRHANDSFRÅGOR (spår 6, omgång 5, u1: nivån 36 → 37).
 *
 * EN källmärkt förhandsfråga ovanpå samtliga tidigare lager (basens MONSTER
 * i ai-mentor-svar.ts, extra-, makro-, nästa-, kapitalmekanik- och
 * sektor-lagren):
 *   1. Praktiska case / verkliga bolag (från teori till färdighet —
 *      portfolj-ekosystemet som primärkälla, med Atlas Copco och H&M
 *      som kontrastparen ur pc-familjen)
 *
 * ÄMNESVAL SEN MOT KOLLISIONSKONTROLL (auto-s6 omgång 5, parallella
 * syskon): PRAKTISKA CASE är registrets största återstående helt otäckta
 * kategori — 21 kurser (pc-01–pc-20 + portfolj-ekosystemet) utan ett
 * enda kärnord i basens, extra-, makro-, nästa-, kapitalmekanik- eller
 * sektor-lager ("case", "fallstudie", "verkliga bolag" saknas bland de
 * existerande kärnorden — verifierat mekaniskt av testfall K, som läser
 * samtliga lager LIVE). Anspråksnotis skriven till syskonen FÖRE
 * byggstart: data/vakten/s7-omg5-u1-ansprak.md.
 *
 * Matchningen speglar motorns hjälpfunktioner (samma lösning som alla
 * syskonlagren: Node type-stripping löser endast `import type`, så de
 * rena funktionerna speglas hit). Semantisk likhet med motorn BEVISAS
 * av testets felstavningfall (B) och determinismfall (D). Driftvarning:
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
 * Detta lager ligger SIST i kedjan och kan därför ALDRIG stjäla en
 * fråga från tidigare lager (bevisad princip från nästa-lagret, sjätte
 * tillämpningen). Testfall H vaktar dessutom HELA kedjan inklusive
 * sektor-lagret — och testfall L verifierar att WIDGET-filen själv
 * bär alla sju lager (spårets första widgetbevis; sektor-lagret var
 * död kod i prod sedan omgång 3 eftersom wiringen saknades).
 *
 * ── JURIDIKGRINDEN (lagen 2007:528) ──────────────────────────────────
 * All text är pedagogisk utbildning om hur fallstudier används som
 * träningsmaterial — inga köp-/säljsignaler, inga placeringstips. De
 * namngivna bolagen är URVALSKURSER i läroplanen och texten säger det
 * uttryckligen: exempel, inte placeringar.
 *
 * ── DEPENDENCY-INJECTION (samma mönster som hela motorn) ─────────────
 * Registret skickas IN som parameter (endast `import type`) så att
 * verktyg/testa-ai-mentor-case.mjs kan köra filen direkt i Node.
 * Alla källkurser (portfolj-ekosystemet, pc-01-case-atlas-copco,
 * pc-06-case-hm, pc-09-case-novo-nordisk) finns i KURSREGISTER sedan
 * rebaken 349 → 358 — inga väntande registerberoenden.
 */

import type { RegisterRad } from "./ai-mentor-register";
import type { FragMonster, LokalKalla, LokaltSvar } from "./ai-mentor-svar";

// ── Hjälpbyggare — spegling av motorns (ai-mentor-svar.ts) ─────────────────
// Samma driftvarning som syskonlagren: speglade rena funktioner, bevisade
// likvärdiga av regressionstestet (fall B + D).

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

/** Källrad som avslutar varje svar — KÄLLMÄRKT (samma format som motorn). */
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

// ── Case-förhandsfrågan ──────────────────────────────────────────────────────

export const CASE_MONSTER: FragMonster[] = [
  {
    id: "case",
    karnord: [
      "case", "fallstudie", "fallstudier", "fallstudien",
      "praktiska case", "verkliga bolag", "verkliga exempel",
      "bolagscase", "casestudie", "case studie", "praktikcase",
    ],
    starkord: [
      "aktier", "aktie", "bolag", "bolagen", "exempel", "exemplen",
      "analysera", "analyserar", "träna", "öva", "praktiska",
      "praktisk", "studera", "lära", "förstå", "verkliga", "börsen",
    ],
    bygga: (reg) => {
      const caseAntal = reg.filter((r) => r.kategori === "PRAKTISKA CASE").length;
      const eko = reg.find((r) => r.slug === "portfolj-ekosystemet");
      const atlas = reg.find((r) => r.slug === "pc-01-case-atlas-copco");
      const hm = reg.find((r) => r.slug === "pc-06-case-hm");
      const kallor = [
        kursKalla(reg, "portfolj-ekosystemet", "Läroplanen — praktiska case, hela ekosystemet i praktiken"),
        kursKalla(reg, "pc-01-case-atlas-copco", "Läroplanen — praktiska case, industri och moat"),
        kursKalla(reg, "pc-06-case-hm", "Läroplanen — praktiska case, konsument och marginalpress"),
      ];
      const k = kallor[0];
      return {
        text:
          `Praktiska case är bron mellan teori och egen analys — kursen om P/E blir en färdighet först när du räknat på ett riktigt bolag med riktiga rapporter. Kategorin praktiska case har ${caseAntal} kurser och hela upplägget vilar på tre principer:\n\n1. TEORIN FÅR BLOD — varje case tar ett verkligt börsbolag och kör analysverktygen på dess siffror: affärsmodellen först, nyckeltalen i sektorns kontext sedan, historiens vändningar till sist. Samma checklista varje gång — olika svar varje gång. Det är just det som tränar ögat.\n2. KONTRASTEN ÄR LÄRAN — case läsas bäst i par: Atlas Copco (${atlas ? atlas.minuter : 30} min — prissättningskraft och moat i industri) mot H&M (${hm ? hm.minuter : 25} min — marginalpress och modecykel i konsument). Två svenska börsbolag, två helt olika mekanikuniverum; jämförelsen lär mer än tio enskilda fall.\n3. ETT CASE ÄR INTE EN MALL — bolagen i kurserna är utvalda som pedagogiska exempel, inte som placeringar. Det som pressade ett bolag för tio år sedan kan vara helt frånkopplat hos ett annat bolag idag. Färdigheten du tränar är checklistan — aldrig slutsatsen.\n\nBörja med ekosystemkursen "Från aktie till portfölj" (${eko ? eko.minuter : 55} min) som visar hur alla verktyg sätts samman till en helhetsbild — och välj sedan case i en bransch du vill lära känna. Det är utbildning i analys hundra procent; vad du gör med kunskapen är alltid ditt eget beslut.` +
          kallradFler(kallor),
        amne: "case",
        kalla: k,
        kallor,
        handlings: [
          { text: "Kursen: Från aktie till portfölj", lank: "/kurser/portfolj-ekosystemet", ikon: "🧩", beskrivning: "Ekosystemet i praktiken — samlar alla verktyg" },
          { text: "Case: Atlas Copco", lank: "/kurser/pc-01-case-atlas-copco", ikon: "🔧", beskrivning: "Industri — moat och prissättningskraft" },
          { text: "Case: H&M", lank: "/kurser/pc-06-case-hm", ikon: "👕", beskrivning: "Konsument — marginalpress och modecykel" },
          { text: "Case: Novo Nordisk", lank: "/kurser/pc-09-case-novo-nordisk", ikon: "💊", beskrivning: "Avancerad — pharma-fallet" },
          { text: "Vad är sektorsanalys?", lank: "fragor:" + encodeURIComponent("vad är sektorsanalys?"), ikon: "🧭", beskrivning: "Ramverket bakom varje case" },
        ],
        motfraga: { text: "Hur jämför jag nyckeltal inom en sektor?", kategori: "sektorsanalys" },
        fordjupa: { text: k.titel, lank: "/kurser/portfolj-ekosystemet" },
      };
    },
  },
];

// ── Huvudingången ──────────────────────────────────────────────────────────

/**
 * Svara lokalt med case-mönstret — eller null (då har hela kedjan före
 * redan lämnat null och API-flödet tar över som förr). Samma
 * matchningssemantik som basmotorn: minst ett kärnord krävs,
 * poäng = kärnord × 3 + stärkord, oavgjort → först deklarerade mönstret
 * vinner (strikt >, deterministiskt). Samma fråga ⇒ bitidentiskt svar.
 */
export function svaraLokaltCase(fraga: string, register: RegisterRad[]): LokaltSvar | null {
  const fragaStr = diafri(fraga);
  if (!fragaStr) return null;
  const fragaOrd = fragaStr.split(" ");
  let bast: { svar: LokaltSvar; poang: number } | null = null;
  for (const m of CASE_MONSTER) {
    const karnTraff = m.karnord.filter((nk) => traff(fragaOrd, fragaStr, nk));
    if (karnTraff.length === 0) continue; // krav: minst ett kärnord
    const starkTraff = m.starkord?.filter((nk) => traff(fragaOrd, fragaStr, nk)) ?? [];
    const poang = karnTraff.length * 3 + starkTraff.length;
    if (!bast || poang > bast.poang) bast = { svar: m.bygga(register), poang };
  }
  return bast ? bast.svar : null;
}
