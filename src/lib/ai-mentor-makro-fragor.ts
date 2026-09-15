/**
 * AI-MENTORN 2.0 — MAKROFÖRHANDSFRÅGOR (spår 6, omgång 2, u1: nivån 23 → 25).
 *
 * Två ytterligare källmärkta förhandsfrågor ovanpå de tjugotre tidigare
 * (basens tjugo i ai-mentor-svar.ts + u3:s tre i ai-mentor-extra-fragor.ts):
 *   1. Ränta      (priset på pengar — km-054, med centralbanker och
 *                  ränta-på-ränta: km-056 + pf-06)
 *   2. Inflation  (penningvärdet — km-055, med realränta och deflation:
 *                  km-054 + mk-09)
 *
 * ÄMNESVAL SEN MOT KOLLISIONSKONTROLL (auto-s6 omgång 2, parallella syskon):
 * kategorin MAKROEKONOMI & RÄNTA bär FEM kurser i registret (km-054–km-058)
 * men hade NOLL täckning bland motorns 23 mönster — varken basens MONSTER
 * eller u3:s extra-lager har ränta/inflation/centralbank/köpkraft bland
 * kärnorden. Syskonens troliga fält (indexfond, balansräkning, P/B,
 * börsen) lämnas orörda. Kärnorden är disjunkta mot BÅDA lagren —
 * verifierat mekaniskt av fall I i testa-ai-mentor-makro.mjs (inga stölder).
 *
 * Matchningen speglar motorns hjälpfunktioner (samma lösning som u3:s
 * extra-lager: Node type-stripping löser endast `import type`, så de rena
 * funktionerna speglas hit). Semantisk likhet med motorn BEVISAS av testets
 * felstavningfall (C) och determinismfall (D). Driftvarning: ändras motorns
 * matchning måste denna spegel följa — testfall C vaktar.
 *
 * SAMMANSÄTTNING (chat-widget.tsx):
 *   svaraLokaltMakro(q, KURSREGISTER)
 *     ?? svaraLokaltExtra(q, KURSREGISTER)
 *     ?? svaraLokalt(q, KURSREGISTER)
 * Makro-mönstren prövas FÖRST. Kärnorden är disjunkta mot båda underliggande
 * lager, så företrädesordningen är i praktiken bara en deterministisk
 * tie-brytning — fall I i testet vaktar att inget tidigare svar stjäls.
 *
 * ── JURIDIKGRINDEN (lagen 2007:528) ──────────────────────────────────
 * All text är pedagogisk utbildning om hur mekanismerna fungerar — inga
 * köp-/säljsignaler, inga placeringstips, inga omdömen om enskilda bolag.
 *
 * ── DEPENDENCY-INJECTION (samma mönster som hela motorn) ─────────────
 * Registret skickas IN som parameter (endast `import type`) så att
 * verktyg/testa-ai-mentor-makro.mjs kan köra filen direkt i Node.
 */

import type { RegisterRad } from "./ai-mentor-register";
import type { FragMonster, LokalKalla, LokaltSvar } from "./ai-mentor-svar";

// ── Hjälpbyggare — spegling av motorns (ai-mentor-svar.ts) ─────────────────
// Samma driftvarning som u3:s extra-lager: speglade rena funktioner, bevisade
// likvärdiga av regressionstestet (fall C + D).

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
 * Flerkällskällmärke — spegling av motorns kallradFler (som är modulprivat):
 * en källa ⇒ kallrad-format, flera ⇒ numrerad Källor-lista. Formatet vakas
 * av testfall B ("📖 Källor (").
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

// ── De 2 makroförhandsfrågorna ──────────────────────────────────────────────

export const MAKRO_MONSTER: FragMonster[] = [
  {
    id: "ränta",
    karnord: [
      "ränta", "räntan", "räntor", "styrränta", "styrräntan", "räntehöjning",
      "räntesänkning", "riksbank", "riksbanken", "centralbank", "centralbanken",
      "centralbanker", "stibor", "repo", "obligation", "obligationer",
      "statsobligation", "statsobligationer", "ränta-på-ränta",
    ],
    starkord: ["aktier", "påverkar", "lån", "låna", "bolån", "sparande", "pris", "pengar"],
    bygga: (reg) => {
      const makroAntal = reg.filter((r) => r.kategori === "MAKROEKONOMI & RÄNTA").length;
      const kallor = [
        kursKalla(reg, "km-054-ranta", "Läroplanen — makroekonomi & ränta, kurs 1 (nybörjarnivå)"),
        kursKalla(reg, "km-056-centralbanker", "Läroplanen — makroekonomi & ränta, styrräntans väktare"),
        kursKalla(reg, "pf-06-aterinvestering", "Läroplanen — portföljhantering, ränta-på-ränta-mekaniken"),
      ];
      const k = kallor[0];
      return {
        text:
          `Ränta är priset på pengar — vad det kostar att låna dem och vad du får betalt för att låna UT dem. Riksbanken styr med styrräntan, och hela räntetrappan (bolån, sparkonto, företagslån) rör sig i dess spår. Tre mekanismer att förstå — så fungerar ekonomin, inte vad du ska göra:\n\n1. DISKONTERING — ett bolags värde är framtida kassaflöden räknade i dagens pengar. När räntan stiger kräver marknaden högre avkastning för att vänta, och samma framtida kassaflöde blir mindre värt IDAG. Det är matte, inte magi — och förklarar varför ränterörelser kan röra hela börsen åt samma håll.\n2. ALTERNATIVKOSTNAD — när räntan stiger blir riskfria alternativ (sparkonto, statsobligationer) konkurrenskraftigare, och riskfyllda tillgångar måste motivera sig hårdare. När räntan sjunker är logiken omvänd.\n3. HÄVSTÅNGEN — bolag med stor skuld har en fast räntekostnad som växer vid omförhandling när räntan stiger. Därför är kapitalstruktur (skuld vs eget kapital) en egen dimension i AKM1.\n\nOch mekaniken bakom allt långsiktigt sparande: RÄNTA-PÅ-RÄNTA — avkastning som själv får avkastning. Den är ett skäl till att tiden, inte tajmingen, är den tålmodige elevens största vän.\n\nI kategorin makroekonomi & ränta finns ${makroAntal} kurser — från räntans grunder till konjunkturcykler och valutor.` +
          kallradFler(kallor),
        amne: "ränta",
        kalla: k,
        kallor,
        handlings: [
          { text: "Kursen: Ränta — priset på pengar", lank: "/kurser/km-054-ranta", ikon: "🏦", beskrivning: "Nybörjarnivå · 18 min · 18 quiz" },
          { text: "Kursen: Centralbanker", lank: "/kurser/km-056-centralbanker", ikon: "🏛️", beskrivning: "Styrräntan, inflationsmålet, penningpolitiken" },
          { text: "Ränta-på-ränta i praktiken", lank: "/kurser/pf-06-aterinvestering", ikon: "🔁", beskrivning: "Återinvestering — portföljens compound" },
          { text: "Kursen: Statsobligationer", lank: "/kurser/mk-04-statsobligationer", ikon: "📜", beskrivning: "Räntebärande papper från grunden" },
          { text: "Vad är inflation?", lank: "fragor:" + encodeURIComponent("vad är inflation?"), ikon: "🔥", beskrivning: "Räntans ständiga motpol" },
        ],
        motfraga: { text: "Vad är inflation och KPI?", kategori: "makroekonomi" },
        fordjupa: { text: k.titel, lank: "/kurser/km-054-ranta" },
      };
    },
  },
  {
    id: "inflation",
    karnord: [
      "inflation", "inflationen", "deflation", "köpkraft", "penningvärde",
      "penningvärdet", "kpi", "konsumentprisindex", "realränta", "realräntan",
      "inflationsmål", "prisökningar", "prisökningstakt", "penningpolitik",
    ],
    starkord: ["aktier", "sparande", "mäta", "mått", "ekonomi", "pengar"],
    bygga: (reg) => {
      const makroAntal = reg.filter((r) => r.kategori === "MAKROEKONOMI & RÄNTA").length;
      const kallor = [
        kursKalla(reg, "km-055-inflation", "Läroplanen — makroekonomi & ränta, 2%-målet från grunden"),
        kursKalla(reg, "km-054-ranta", "Läroplanen — makroekonomi & ränta, realräntans andra halva"),
        kursKalla(reg, "mk-09-deflation-vs-inflation", "Läroplanen — makroekonomi, deflationens farliga spegelbild"),
      ];
      const k = kallor[0];
      return {
        text:
          `Inflation betyder att penningvärdet sjunker — samma hundralapp köper färre kassarätt nästa år. Den mäts med KPI, konsumentprisindex, som följer priserna på en korg av varor och tjänster hushållen faktiskt köper. Tre begrepp som gör ämnet begripligt:\n\n1. 2%-MÅLET — Riksbanken (och de flesta centralbanker) siktar på en låg, stabil inflation runt två procent. För hög inflation äter köpkraften; för låg riskerar deflation — den spegelbild där människor skjuter upp sina inköp i väntan på lägre priser och ekonomin bromsar in.\n2. REALRÄNTAN — nominell ränta MINUS inflation. Ett sparkonto med 2 % ränta vid 4 % inflation FÖRLORAR köpkraft — det är realräntan som talar om vad sparandet faktiskt växer. Den tänkta ekvationen är utbildning i mekaniken, inte ett val av konto.\n3. AKTIER OCH INFLATION — bolagens intäkter och priser KAN följa inflationen över tid, men inte mekaniskt och inte samtidigt: kostnader, konkurrens och prissättningsmakten avgör. Det är därför köpkraftsfrågan hör hemma i VARJE analys — som ett sätt att tänka, aldrig som en handlingsregel.\n\nVill du djupare: hela makrokategorin (${makroAntal} kurser) binder samman inflation, ränta, centralbanker och konjunkturcykler.` +
          kallradFler(kallor),
        amne: "inflation",
        kalla: k,
        kallor,
        handlings: [
          { text: "Kursen: Inflation — 2% målet", lank: "/kurser/km-055-inflation", ikon: "🔥", beskrivning: "Nybörjarnivå · 18 min · 16 quiz" },
          { text: "Kursen: Ränta — priset på pengar", lank: "/kurser/km-054-ranta", ikon: "🏦", beskrivning: "Realräntans andra halva" },
          { text: "Deflation vs inflation", lank: "/kurser/mk-09-deflation-vs-inflation", ikon: "🧊", beskrivning: "Spegelbilden — och varför den är farlig" },
          { text: "Vad är ränta?", lank: "fragor:" + encodeURIComponent("vad är ränta?"), ikon: "💸", beskrivning: "Inflationens motpol i ekvationen" },
        ],
        motfraga: { text: "Vad gör Riksbanken med styrräntan?", kategori: "makroekonomi" },
        fordjupa: { text: k.titel, lank: "/kurser/km-055-inflation" },
      };
    },
  },
];

// ── Huvudingången ──────────────────────────────────────────────────────────

/**
 * Svara lokalt med NÅGOT av de två makromönstren — eller null (då prövar
 * widgeten extra-lagret, sedan basmotorn, sedan API-flödet som förr). Samma
 * matchningssemantik som basmotorn: minst ett kärnord krävs, poäng =
 * kärnord × 3 + stärkord, oavgjort → först deklarerade mönstret vinner
 * (strikt >, deterministiskt). Samma fråga ⇒ bitidentiskt svar.
 */
export function svaraLokaltMakro(fraga: string, register: RegisterRad[]): LokaltSvar | null {
  const fragaStr = diafri(fraga);
  if (!fragaStr) return null;
  const fragaOrd = fragaStr.split(" ");
  let bast: { svar: LokaltSvar; poang: number } | null = null;
  for (const m of MAKRO_MONSTER) {
    const karnTraff = m.karnord.filter((nk) => traff(fragaOrd, fragaStr, nk));
    if (karnTraff.length === 0) continue; // krav: minst ett kärnord
    const starkTraff = m.starkord?.filter((nk) => traff(fragaOrd, fragaStr, nk)) ?? [];
    const poang = karnTraff.length * 3 + starkTraff.length;
    if (!bast || poang > bast.poang) bast = { svar: m.bygga(register), poang };
  }
  return bast ? bast.svar : null;
}
