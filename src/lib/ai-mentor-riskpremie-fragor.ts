/**
 * AI-MENTORN 2.0 — RISKPREMIE-FÖRHANDSFRÅGOR (spår 6, omgång 21, s6-u1).
 *
 * En källmärkt förhandsfråga ovanpå de fyrtiotvå föregående lagren —
 * kedjans fråga för ägandets pris: aktiernas riskpremie, den extra
 * avkastning som börsen måste bjuda över statsobligationen
 * (ma-06 primär + ma-05 + ma-03 + km-008 + km-007).
 *
 * Aktiverar TVÅ mentorväglösa kurser — KATEGORIN MAKROEKONOMI & RÄNTA
 * blir fullt länkad (10/11 → 11/11) med ma-06-aktiernas-riskpremie som
 * primär (spår 5:s färska kurs 2026-09-18, mentorväglös sedan födelsen)
 * och km-008-wacc som fjärde källa (VÄRDERINGSMETODER) — spårets mål
 * "fler kurslänkar per svar", utan API-kostnad.
 *
 * ÄMNESVAL EFTER SOND I TVÅ RONDER (verktyg/_s6u1-sond-omg21.mjs +
 * _s6u1-sond2-omg21.mjs, otrackade diskbevis; anspråk
 * data/vakten/auto-s6-1789768506578-u1-ansprak.md FÖRE byggstart —
 * fönstrets FÖRSTA anspråk): hela den svenska premie-familjen var NULL
 * genom kedjans 43 motorer / 119 monsters («vad är aktiernas
 * riskpremie?» · «vad är riskpremien?» · «vad är aktieriskpremien?» ·
 * «hur räknar man ut riskpremien?» · «hur mäter man aktiernas
 * riskpremie?» · «vad betyder riskpremien?») och samtliga tolv kärnord
 * RENTA mot 1 287 unika syskonkärnord (närmaste granne kreditpremien på
 * tavstånd 5 — motorns tolerans är 2). Prototyp-stöldprovet: 0 fångster
 * av 116 syskonkanoniska frågor.
 *
 * ANSVARSFÖRDELNING (syskinlagrens dokumentationsplikt; V19-precedensen —
 * källägande ≠ kärnordsägande):
 *   • Kreditdjupet äger kreditpris-familjen («vad är kreditpremien?» ·
 *     «vad är kreditspreaden?» FÅNGAS av dem — sondbevisat); ma-05 bärs
 *     här ENDAST som källa + fragor:-knapp (tidigare-lager-kravet).
 *   • Makro äger obligation/statsobligations-orden (omgång 18:s gräns) —
 *     de är här ENDAST stärkord, aldrig kärnord: «vad är
 *     statsobligationer?» förblir makrons fråga.
 *   • Basen äger den engelska helhetsfrågan («vad är equity risk
 *     premium?» FÅNGAS av basen — sondbevisat); detta lager bär de
 *     svenska premie-orden.
 *   • Avkastningsdjupet äger avkastningskällorna (u2 omgång 18:s
 *     dokumenterade fribit «riskpremien = avkastningsdjupets
 *     territorium» löses så: deras källfamilj vr-04, mina premie-ord —
 *     mekaniskt disjunkta, sondbevisat).
 *   • Lönsamhetsdjupet äger WACC/kapitalkostnad («vad är wacc?» är
 *     deras); km-008 är här KÄLLA + fragor:-knapp.
 *   • Optionsdjupet äger optionens premie («optionspremie») — naket
 *     «premie» är INTE kärnord här; premie-orden bär alltid risk-/
 *     aktie-sammanhang.
 *
 * Matchningen speglar motorns hjälpfunktioner (samma lösning som alla
 * syskinlager: Node type-stripping löser endast `import type`, så de rena
 * funktionerna speglas hit). Semantisk likhet med motorn BEVISAS av
 * testets felstavningsfall (B) och determinismfall (C). Driftvarning:
 * ändras motorns matchning måste denna spegel följa — testfall B vaktar.
 *
 * SAMMANSÄTTNING (chat-widget.tsx): detta lager ligger efter pe-mekanik
 * och FÖRE överlevnadsdjup (omgång 20:s syskonlager och omgång 21:s
 * koncernlasning/tillväxtdjup ligger EFTER — deras SIST-positioner
 * respekteras). Ett senare lager kan därför aldrig stjäla en fråga från
 * detta; omvänt vaktar testfall I på att dessa frågor INTE fångas av
 * kedjan utan detta lager (dupliceringsskydd).
 *
 * ── JURIDIKGRINDEN (lagen 2007:528) ──────────────────────────────────
 * All text är pedagogisk utbildning om hur premien DEFINIERAS, MÄTS och
 * RÄKNAS — inga köp-/säljsignaler, inga placeringstips, inga omdömen om
 * enskilda värdepapper. Aritmetiken återger kursens egna exempeltal
 * (8,0 − 2,0 = 6,0 · svängning 17 mot 6 · 6 av 40 år · 6,0 ÷ 17 ≈ 0,35 ·
 * 1,08³⁰ = 10,1 mot 1,02³⁰ = 1,81 = 5,6× · krav 2,0 + 6,0 = 8,0 med
 * P/E-spegeln 12,5/11,1/14,3) — och kursens första budskap bärs med i
 * texten: premien är ett pris, inte ett löfte; den säger inte att aktier
 * är bättre, bara att marknaden historiskt betalat för deras osäkerhet.
 *
 * ── DEPENDENCY-INJECTION (samma mönster som hela motorn) ─────────────
 * Registret skickas IN som parameter (endast `import type`) så att
 * verktyg/testa-ai-mentor-riskpremie.mjs kan köra filen direkt i Node.
 * Alla källkurser (ma-06-aktiernas-riskpremie, ma-05-kreditpremien,
 * ma-03-realrantan, km-008-wacc, km-007-dcf) finns i KURSREGISTER
 * (verifierat mot levande register; kursKalla faller tillbaka på
 * "Läroplanen" om ett framtida register läcker en slug).
 */

import type { RegisterRad } from "./ai-mentor-register";
import type { FragMonster, LokalKalla, LokaltSvar } from "./ai-mentor-svar";

// ── Hjälpbyggare — spegling av motorns (ai-mentor-svar.ts) ─────────────────
// Samma driftvarning som syskinlagren: speglade rena funktioner, bevisade
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

// ── Den 1 riskpremiefrågan ──────────────────────────────────────────────────

export const RISKPREMIE_MONSTER: FragMonster[] = [
  {
    id: "riskpremie",
    karnord: [
      "riskpremie", "riskpremien", "riskpremier",
      "riskpremium",
      "aktieriskpremie", "aktieriskpremien",
      "aktiernas riskpremie", "aktiens riskpremie",
      "premieöverskott", "premieöverskottet",
      "ägarrisk", "ägarrisken",
      "premie per riskenhet",
    ],
    starkord: [
      "aktier", "aktien", "aktiernas", "börsen", "börs", "index", "avkastning",
      "avkastningskrav", "kravet", "krav", "ränta", "räntan", "riskfria",
      "riskfri", "obligation", "obligationer", "statsobligation",
      "statsobligationer", "procentenheter", "svängning", "svängningar",
      "volatilitet", "osäkerhet", "ägandet", "sekel", "fönstret", "fönster",
      "kassaflöde", "kassaflödet", "värdering", "värderingen", "värdera",
      "multipel", "multiplar", "dcf", "wacc", "subtraktionen", "mätning",
      "historien", "pris", "prislista", "risk", "kapital",
    ],
    bygga: (reg) => {
      const maAntal = reg.filter((r) => r.kategori === "MAKROEKONOMI & RÄNTA").length;
      const kallor = [
        kursKalla(reg, "ma-06-aktiernas-riskpremie", "Läroplanen — MAKROEKONOMI & RÄNTA: varför börsen betalar mer än statsobligationen"),
        kursKalla(reg, "ma-05-kreditpremien", "Läroplanen — MAKROEKONOMI & RÄNTA: varför bolagets lån kostar mer än statens"),
        kursKalla(reg, "ma-03-realrantan", "Läroplanen — MAKROEKONOMI & RÄNTA: pengars tidsvärde efter inflation"),
        kursKalla(reg, "km-008-wacc", "Läroplanen — VÄRDERINGSMETODER: den vägda kapitalkostnaden där kravet möter skuldens"),
        kursKalla(reg, "km-007-dcf", "Läroplanen — VÄRDERINGSMETODER: kassaflödesmodellen som avkastningskravet delar"),
      ];
      const k = kallor[0];
      const ma6 = reg.find((r) => r.slug === "ma-06-aktiernas-riskpremie");
      return {
        text:
          `Aktiernas riskpremie är finansens mest grundläggande subtraktion: skillnaden mellan vad börsen förväntas avkasta och vad statsobligationen betalar — det pris marknaden tar ut för att bära ägandets osäkerhet i stället för utlåningens lugn. Allt nedan är utbildning i hur premien definieras, mäts och räknas — inga råd om placering:\n\n1️⃣ SUBTRAKTIONEN — två tillgångar, två priser — ställ ett bred aktieindex (som i kursens exempel förväntas avkasta 8,0 procent per år, kursökning och utdelning tillsammans) bredvid statsobligationen som ger 2,0 procent med nästan full säkerhet: 8,0 − 2,0 = 6,0 procentenheter — det är aktiernas riskpremie. Regeln som gör talet äkta heter jämför lika med lika: samma valuta, samma periodlängd, samma behandling av skatt och kostnader — en aktieavkastning före courtage mot en obligationsränta efter är inget mått utan ett måttfel. Och notera vad subtraktionen INTE säger: den säger inte att aktier ÄR bättre, bara att marknaden historiskt betalat för deras osäkerhet — premien är ett pris, inte ett löfte. Familjen bär tre syskon-subtraktioner med samma disciplin: realräntan drar bort inflationen och lämnar tidens pris, kreditpremien drar bort statens ränta från bolagets lån och lämnar låntagarrisken, och aktiernas riskpremie drar bort obligationsräntan från börsen och lämnar ägarrisken — tre frågor, tre subtraktioner, en regel.\n2️⃣ VAD PREMIEN BETALAR — svängningarnas prislista — premien köper inte en sämre tillgång utan en krångligare väg: aktiemarknaden svänger med en standardavvikelse kring 17 procent på årsbasis mot obligationens 6 — den ena resan är nästan tre gånger krokigare. Nedgångsåren gör det tydligast: i kursens exempelserie av 40 år föll aktierna mer än 20 procent i 6 av åren — 6 ÷ 40 = 15 procent, ett år av sju — mot obligationernas 1 av 40 = 2,5 procent. Räkna premiens pris per riskenhet: 6,0 ÷ 17 ≈ 0,35 procentenheter premie för varje procentenhet svängning — krånglets pris i en enda siffra. Listans sista rad är den viktigaste: premien betalar för SVÄNGNINGARNA, inte för katastrof — ett år då aktierna faller 35 procent utplånar mer än fem års premie (5 × 6,0 = 30 procentenheter, och utfallet slår till i ett enda år). Det är förklaringen till att premien måste vara just flera procentenheter: den ska bära inte bara de många små svängningarna utan de få stora fallen.\n3️⃣ HISTORIENS SIFFRA OCH VÄRDERINGENS — premien mäts baklänges: i kursens exempelsekel gav aktierna 9,0 procent per år och obligationerna 3,0 — 9,0 − 3,0 = 6,0 procentenheter, samma subtraktion som det framåtblickande exemplet. Sedan ränta-på-räntan, premiens eget bevis: en krona växer till 1,08³⁰ = 10,1 kronor på trettio år med 8,0 procent, medan obligationens växer till 1,02³⁰ = 1,81 — förhållandet 10,1 ÷ 1,81 = 5,6: efter ett halvt sekel bär den ena kronan mer än fem av den andra. Tre bruksanvisningsvarningar följer med historien: fönstret (tjugo år i stället för ett sekel kan visa 2 eller 10 procentenheter utan att något fundamentalt förändrats — korta fönster mäter periodens tur), överlevnaden (de långa serierna kommer från marknader som inte dog — vinnarmarknadernas premie är för vacker för att vara sann) och riktningen (historien mäter vad som HÄNDE, värderingen frågar vad som KRÄVS — släkt men inte identiska). Värderingssidan bygger kravet som en summa: riskfri ränta 2,0 procent plus premien 6,0 procentenheter — 2,0 + 6,0 = 8,0 procent, aktiens avkastningskrav — talet som i en DCF-värdering delar framtida kassaflöden till dagens värde och som i WACC möter skuldens billigare krav. Ta ett bestående kassaflöde på 8 kronor per aktie: vid krav 8,0 procent är värdet 8 ÷ 0,080 = 100 kronor. Flytta premien en enda procentenhet: stiger den till 7,0 blir kravet 9,0 och värdet 8 ÷ 0,090 = 88,9 kronor — minus 11,1 procent utan att bolaget förändrats en krona; faller den till 5,0 blir kravet 7,0 och värdet 8 ÷ 0,070 = 114,3 kronor — plus 14,3 procent. Spegeln heter P/E: kravet 8,0 procent motsvarar vinstavkastning 8,0 procent alltså P/E 12,5 (1 ÷ 0,080), krav 9,0 → P/E 11,1 och krav 7,0 → P/E 14,3. Detta förklarar finansens mest förvirrande fall: börsen sjunker elva procent och ingen nyhet förklarar varför — svaret är en premievidgning; samma bolag, samma kassaflöde, högre pris på osäkerheten. Tre vägar till talet: historiens totalavkastningsindex (med varningarna ovan), analyshusens publicerade krav minus den matchande statsräntan (skillnaderna mellan husen är i sig information), och den egna räkningen baklänges — en DCF till 100 kronor för ett bestående kassaflöde 8 kronor avslöjar kravet 8,0 procent, minus räntan 2,0: premien står där, 6,0 procentenheter. Fem frågor till varje premie: mot vilket alternativ? vilket fönster? vad ingår i aktiens tal? vad är prissatt just nu? vad skulle flytta den?\n\nI kategorin makroekonomi & ränta finns ${maAntal} kurser — aktiernas riskpremie (${ma6 ? ma6.minuter + " min, " + ma6.niva.toLowerCase() + " nivå" : "i registret"}) är familjens sjätte steg och bryggen till värderingen: kreditpremien (ma-05) är låntagarens pris, realräntan (ma-03) tidens, och denna kurs ägarriskens — tre subtraktioner som tillsammans plockar isär räntan och avkastningen. Som alltid: detta är utbildning i hur premien fungerar — inga placeringstips, och premien är ett pris, inte ett löfte.` +
          kallradFler(kallor),
        amne: "riskpremie",
        kalla: k,
        kallor,
        handlings: [
          { text: "Kursen: Aktiernas riskpremie", lank: "/kurser/ma-06-aktiernas-riskpremie", ikon: "⚖️", beskrivning: "Subtraktionen, prislistan och P/E-spegeln" },
          { text: "Kursen: Kreditpremien", lank: "/kurser/ma-05-kreditpremien", ikon: "🏦", beskrivning: "Syskonpremien — låntagarens pris" },
          { text: "Kursen: Realräntan", lank: "/kurser/ma-03-realrantan", ikon: "⏳", beskrivning: "Den första subtraktionen — inflationen" },
          { text: "Kursen: WACC — vägd kapitalkostnad", lank: "/kurser/km-008-wacc", ikon: "🧮", beskrivning: "Där kravet möter skuldens billigare" },
          { text: "Vad är kreditpremien?", lank: "fragor:" + encodeURIComponent("vad är kreditpremien?"), ikon: "📊", beskrivning: "Kreditdjup-lagrets fråga — spreaden som en kurs" },
          { text: "Vad är WACC?", lank: "fragor:" + encodeURIComponent("vad är wacc?"), ikon: "📐", beskrivning: "Lönsamhetsdjupets fråga — den vägda kapitalkostnaden" },
        ],
        motfraga: { text: "Vad är kreditpremien?", kategori: "kreditpremien" },
        fordjupa: { text: k.titel, lank: "/kurser/ma-06-aktiernas-riskpremie" },
      };
    },
  },
];

// ── Huvudingången ──────────────────────────────────────────────────────────

/**
 * Svara lokalt med riskpremie-mönstret — eller null (då har hela kedjan
 * före redan lämnat null och API-flödet tar över som förr). Ligger efter
 * pe-mekanik och FÖRE överlevnadsdjup i widgetens kedja och kan därför
 * aldrig stjäla en fråga från senare lager; tidigare lagers frågor lämnas
 * ifred (kärnorden mekaniskt disjunkta — testfall J/G2 vaktar). Samma
 * matchningssemantik som basmotorn: minst ett kärnord krävs, poäng =
 * kärnord × 3 + stärkord, oavgjort → först deklarerade mönstret vinner
 * (strikt >, deterministiskt). Samma fråga ⇒ bitidentiskt svar.
 */
export function svaraLokaltRiskpremie(fraga: string, register: RegisterRad[]): LokaltSvar | null {
  const fragaStr = diafri(fraga);
  if (!fragaStr) return null;
  const fragaOrd = fragaStr.split(" ");
  let bast: { svar: LokaltSvar; poang: number } | null = null;
  for (const m of RISKPREMIE_MONSTER) {
    const karnTraff = m.karnord.filter((nk) => traff(fragaOrd, fragaStr, nk));
    if (karnTraff.length === 0) continue; // krav: minst ett kärnord
    const starkTraff = m.starkord?.filter((nk) => traff(fragaOrd, fragaStr, nk)) ?? [];
    const poang = karnTraff.length * 3 + starkTraff.length;
    if (!bast || poang > bast.poang) bast = { svar: m.bygga(register), poang };
  }
  return bast ? bast.svar : null;
}
