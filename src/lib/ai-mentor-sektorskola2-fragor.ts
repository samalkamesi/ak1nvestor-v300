/**
 * AI-MENTORN 2.0 — SEKTORSKOLA 2-FÖRHANDSFRÅGOR (spår 6, omgång 19, s6-u3).
 *
 * Tre ytterligare källmärkta förhandsfrågor ovanpå de trettionio committade
 * lagren — sektorskolans andra årskurs, tre analytikerklassiker:
 *   1. Läkemedelsbolag ("hur analyserar jag läkemedelsbolag?") —
 *      patentbranten, pipelinen och sannolikhetsmaskinen
 *      (km-039 primär + km-048 + pc-02 + mt-02 som källor)
 *   2. Detaljhandelsbolag ("hur analyserar jag detaljhandelsbolag?") —
 *      like-for-like, marginaltrappan och skalans nätverk
 *      (se-07 primär + km-044 + se-05 som källor)
 *   3. Logistikbolag ("hur analyserar jag logistikbolag?") —
 *      nätverksekonomins täthetsmatte och kapitaltätheten
 *      (se-04 primär + se-15 + km-041 som källor)
 *
 * REGISTERBÄRNING: 8 mentorväglösa kurser aktiveras (237 → 245 av 420
 * nådda enligt sondens genomräkning): km-039, km-048, pc-02, se-07, km-044,
 * se-05, se-04, se-15 — varje källa en äkta slug i KURSREGISTER
 * (kedjetestets E-fall vakar). PRAKTISKA CASE (23 kurser) och MOAT (8)
 * får var sin första mentorväg via pc-02 och mt-02.
 *
 * ÄMNESVAL EFTER SOND I TRE RONDER (verktyg/_s6u3-sond-omg19.mjs +
 * _s6u3-sond2-omg19.mjs, otrackade; 39 motorer / 1 229 kärnord LIVE-lästa
 * ur src/ med den riktiga matcharen + diskutläsning av ev. syskonmoduler):
 *   • Rond 1: genomräkning — 183 kurser mentorväglösa; BOKMASTER 69 (svår
 *     att bära av tre frågor), CASE 17, SEKTORANALYS 14, BETEENDE 9,
 *     VÄRDERINGSMETODER 8. 16 kandidatfrågor probade.
 *   • Rond 2 DÖDADE moat/vallgravs-idén (hela mt-familjen frestade):
 *     extra-motorn äger moat/moats/VALLGRAV/vallgraven/konkurrensfördel/
 *     konkurrensfördelar/konkurrensövertag/konkurrenskraft som kärnord —
 *     moat-frågeformuleringarna är stängda territorium. mt-02 blir här
 *     ENDAST källa (V19-precedensen: källägande ≠ kärnordsägande).
 *   • Rond 3: sektorfamiljerna — samtliga 16 kandidatfrågor NULL genom
 *     kedjan, 0 kärnordsgrannar mot 1 229 kärnord. JUSTERING efter
 *     prototyp-stöldprovet: "e-handel"/"ehandel" flyttades till STÄRKORD
 *     (prototypen fångade kontrollfrågan "vad är e-handel?" — den frågan
 *     lämnas orörd åt kedjan/API-flödet), "galleria"/"köpcentrum" ströks.
 *
 * ANSVARSFÖRDELNING (syskonlagrens dokumentationsplikt; modultestets G/G2-
 * fall bevisar båda vägarna):
 *   • Sektormotorn äger SEKTOR-GRUNDORDEN ("sektor", "bransch", "-sektorn"-
 *     sammansättningarna) och bank-/fastighets-frågorna; sektordjupet äger
 *     saas/halvledare/försvar-familjerna. Detta lager bär ENDAST de tre
 *     bolagstypsfamiljerna — läkemedel, detaljhandel, logistik — och använder
 *     aldrig "-sektorn"-sammansättningar.
 *   • Extra äger moat/vallgrav/konkurrensfördel (rond 2:s fynd) och
 *     nätverkseffekter: logistiksvaret förklarar nätverkstätheten i TEXT
 *     men bär aldrig "nätverkseffekt" som kärnord; "vad är en moat?" bärs
 *     som handlingsknapp (extra:s ämne — knappen landar aldrig null).
 *   • Kapitalbindningen äger lageromsättning/kassakonverteringscykeln:
 *     detaljhandels- och logistiksvaret LÄNKAR deras frågor som knappar
 *     (butikslager och terminaler är deras ämnes gränspass), kärnorden är
 *     deras.
 *   • Tidsaxeln äger orderstock/backlog; makro äger ränteorden — orörda.
 *   • "frakt" (5 tecken, tolerans 1) dokumenterad risk (chip-precedensen):
 *     sweepen visar 0 grannar i kedjans 1 229 kärnord; vardagliga
 *     fraktfrågor utan bolagsanalyssammanhang är sällsynta och passerar
 *     annars till API-flödet som förut. "pipeline" samma dokumentations-
 *     status: i svenska finansfrågor nästan alltid läkemedelscontext.
 *
 * DOKUMENTERAD RISK (accepterad): pc-02-case-astrazeneca bärs som KÄLLA —
 * kursens titel namnger ett börsbolag (kundens eget pedagogiska case), men
 * svarets TEXT talar endast om "ett läkemedelsbolag" med påhittade tal —
 * inga omdömen om enskilda börsbolag (juridikgrinden, sektordjup-precedensen
 * med pc-07-case-sinch).
 *
 * Aritmetiken i alla tre svar (påhittade tal, maskinellt omräknade i
 * regressionstestets D-fall):
 *   • Läkemedel: toppreparat 8 mdr av 20 mdr = 40 % av intäkterna;
 *     generika tar 90 % ⇒ 8 × 0,9 = 7,2 mdr försvinner på branten;
 *     5 kandidater i fas III × 60 % = 3 väntade godkännanden;
 *     riskjusterat toppbidrag 0,5 × 2 000 = 1 000 Mkr/år.
 *   • Detaljhandel: like-for-like 6 + 9 − 3 = 12 % total tillväxt;
 *     bruttomarginal 100 − 60 = 40; trappan 40 − 12 − 18 = 10 %
 *     rörelsemarginal.
 *   • Logistik: kostnad per paket 8 → 5 kr vid dubblad volym =
 *     (8 − 5) ÷ 8 = 37,5 % lägre; flotta 1 000 Mkr ÷ 8 år = 125 Mkr/år i
 *     avskrivningar; kapitaltäthet 1 000 ÷ 2 500 = 0,4; lastmile 4 av
 *     10 kr = 40 % av paketkostnaden.
 *
 * Matchningen speglar motorns hjälpfunktioner (samma lösning som alla
 * syskinlagren: Node type-stripping löser endast `import type`, så de rena
 * funktionerna speglas hit). Semantisk likhet med motorn BEVISAS av testets
 * felstavningsfall (B) och determinismfall (C). Driftvarning: ändras motorns
 * matchning måste denna spegel följa — testfall B vakar.
 *
 * SAMMANSÄTTNING (chat-widget.tsx) — detta lager levereras SIST (efter
 * sektordjup, kedjans 40:e motor) och kan därför aldrig stjäla en fråga
 * från ett tidigare lager; det fångar bara frågor som alla lager före det
 * lämnar null på. Omvänt vaktar testfall I på att dessa frågor INTE fångas
 * av kedjan utan detta lager (dupliceringsskydd).
 *
 * ── JURIDIKGRINDEN (lagen 2007:528) ──────────────────────────────────
 * All text är pedagogisk utbildning om hur tre bolagstypers NYCKELTAL och
 * AFFÄRSLOGIK DEFINIERAS och RÄKNAS som metod — inga köp-/säljsignaler,
 * inga placeringstips, inga omdömen om enskilda börsbolag (exemplen talar
 * om "ett läkemedelsbolag", "en detaljhandelskedja", "ett logistikbolag"
 * med påhittade tal). Läkemedelstexten berör kliniska utfall ENDAST som
 * sannolikhetspedagogik — inga medicinska påståenden.
 *
 * ── DEPENDENCY-INJECTION (samma mönster som hela motorn) ─────────────
 * Registret skickas IN som parameter (endast `import type`) så att
 * verktyg/testa-ai-mentor-sektorskola2.mjs kan köra filen direkt i Node.
 * Alla källkurser (km-039-pharmasektorn, km-048-halsovardsektorn,
 * pc-02-case-astrazeneca, mt-02-moat-erosion-och-vallgravstest,
 * se-07-detailhandel, km-044-konsumentsektorn, se-05-lyxsektorn,
 * se-04-logistiksektorn, se-15-logistik, km-041-industrisektorn) finns i
 * KURSREGISTER (verifierat i 420-registret; kursKalla faller tillbaka på
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

// ── De 3 sektorskola 2-frågorna ─────────────────────────────────────────────

export const SEKTORSKOLA2_MONSTER: FragMonster[] = [
  {
    id: "lakemedel",
    karnord: [
      "läkemedelsbolag", "läkemedelsbolagen", "läkemedelsbranschen",
      "pharma", "pharmabolag", "pharmaindustrin",
      "patentbrant", "patentbranten", "patentutlöpning", "patentutfall",
      "pipeline", "pipelinen", "läkemedelspipeline", "blockbuster",
    ],
    starkord: [
      "patent", "patenten", "klinisk", "fas", "studie", "studier",
      "godkännande", "generika", "generisk", "indikation", "läkemedel",
      "utveckling", "hälsovård", "sjukvård",
    ],
    bygga: (reg) => {
      const seAntal = reg.filter((r) => r.kategori === "SEKTORANALYS").length;
      const pcAntal = reg.filter((r) => r.kategori === "PRAKTISKA CASE").length;
      const kallor = [
        kursKalla(reg, "km-039-pharmasektorn", "Läroplanen — sektorn analys: patentbranten, pipelinen och värderingskonsten"),
        kursKalla(reg, "km-048-halsovardsektorn", "Läroplanen — hälsovårdens bredare bolagsfamilj: från preparat till tjänster"),
        kursKalla(reg, "pc-02-case-astrazeneca", "Läroplanen — ett helt praktiskt case på ett läkemedelsbolag, steg för steg"),
        kursKalla(reg, "mt-02-moat-erosion-och-vallgravstest", "Läroplanen — vallgravens erosionslära: försprånget som knottrar ner med tiden"),
      ];
      const k = kallor[0];
      const km039 = reg.find((r) => r.slug === "km-039-pharmasektorn");
      return {
        text:
          `Läkemedelssektorns analys har en klocka som ingen annan bransch har: varje intäktskrona är ett patent på tid (allt nedan är utbildning i hur sektorns mekanismer DEFINIERAS och RÄKNAS — inga omdömen om enskilda bolag, talen är påhittade):\n\n1️⃣ PATENTBRANTEN — INTÄKTERNAS UTGÅNGSDATUM. Ett läkemedel patentskyddas i 20 år från ansökan, men kliniska prövningar och godkännandeprocesser förbrukar en stor del — den effektiva exklusiviteten är ofta cirka 8–12 år efter lansering. När skyddet utlöper kommer generika och priserna rasar: övningsräkningen med påhittade tal — ett toppreparat som drar in 8 miljarder om året av ett bolag med 20 miljarder i intäkter står för 8 ÷ 20 = 40 procent av hela intäktsströmmen, och tar generikan 90 procent av preparatets försäljning på några år försvinner 8 × 0,9 = 7,2 miljarder om året vid branten. Därför är patentutlöpningstabellen sektorns viktigaste kalender: analysen börjar med att räkna ut hur stor andel av intäkterna som kliver utfall för utfall de kommande åren — branten är känd flera år i förväg.\n2️⃣ PIPELINEN — SANNOLIKHETSMASKINEN. Pipelinen är bolagets framtida intäkter under utveckling: kandidater i fas I (liten säkerhetsstudie), fas II (verkan och dosering) och fas III (stora bevisande studier) innan ansökan. Pedagogiska överlevnadstal från utbildningslitteraturen: av tio substanser som inleder fas I når ungefär en godkännande — men en kandidat som kommit till fas III har ofta cirka 60 procents chans. Övningen: fem kandidater i fas III × 60 procent = 3 väntade godkännanden; och en kandidat med 50 procents godkännanchans och 2 000 Mkr i väntad toppomsättning har ett riskjusterat bidrag på 0,5 × 2 000 = 1 000 Mkr om året. Fas III-misslyckanden slår dubbelt: den framtida intäkten uteblir OCH de nedskrivna utvecklingsmiljonerna är borta — därför reagerar kurserna kraftigare på ett fas III-fall än på siffran ensam.\n3️⃣ VÄRDERINGSKONSTEN — MULTIPELN MED MINUTER. Ett lågt P/E på ett läkemedelsbolag vid patentperiodens topp kan vara en illusion: nämnaren (vinsten) står på intäkter som branten redan väntar på. Moat-språket (extra-lagrets ämne, knappen nedan) fångar det här som en vallgrav med utgångsdatum — eroderingen är programmerad, inte möjlig (mt-02:s kärna). Rätt läsning: dela upp intäkterna i patentperiod kontra "bibehållen bas" (äldre preparat med kvarvarande lojalitet, nya indikationer), värdera pipelinen med sannolikheter i stället för toppsiffror, och jämför gärna med hälsovårdens bredare bolagstyper (km-048) där intäkterna inte svävar på samma patentklocka. Misslyckade områden med ÅR av noll resultat (klassiskt demenssegmentet) är pedagogik i vad långa odds kostar — inte en värdering i sig.\n\nI sektorn analys-kategorin finns ${seAntal} kurser och i praktiska case ${pcAntal} — huvudkursen (${km039 ? km039.minuter + " min, " + km039.niva.toLowerCase() + " nivå" : "i registret"}) äger hela kedjan patentbrant → pipeline → värdering. Som alltid: detta är utbildning i en metod — inga placeringstips.` +
          kallradFler(kallor),
        amne: "lakemedel",
        kalla: k,
        kallor,
        handlings: [
          { text: "Kursen: Pharma-sektorn", lank: "/kurser/km-039-pharmasektorn", ikon: "🔗", beskrivning: "Patentbranten och pipelinen" },
          { text: "Casemet: ett läkemedelsbolag", lank: "/kurser/pc-02-case-astrazeneca", ikon: "🗂️", beskrivning: "Hela analysen i ett praktiskt case" },
          { text: "Kursen: Moat-erosion", lank: "/kurser/mt-02-moat-erosion-och-vallgravstest", ikon: "🏰", beskrivning: "Vallgraven med utgångsdatum" },
          { text: "Vad är en moat?", lank: "fragor:" + encodeURIComponent("vad är en moat?"), ikon: "🛡️", beskrivning: "Försvarsmurens grunder" },
          { text: "Hur analyserar jag detaljhandelsbolag?", lank: "fragor:" + encodeURIComponent("hur analyserar jag detaljhandelsbolag?"), ikon: "🛒", beskrivning: "Nästa bransch i spåret" },
        ],
        motfraga: { text: "Hur analyserar jag detaljhandelsbolag?", kategori: "sektor" },
        fordjupa: { text: k.titel, lank: "/kurser/km-039-pharmasektorn" },
      };
    },
  },
  {
    id: "detaljhandel",
    karnord: [
      "detaljhandel", "detaljhandelsbolag", "detaljhandelsbolagen",
      "detaljhandelsaktier", "like-for-like", "jämförbar försäljning",
      "butiksomsättning",
    ],
    starkord: [
      "e-handel", "ehandel", "butik", "butiker", "handel", "kedja",
      "konsument", "konsumtion", "varuhus", "hyra", "personal",
      "marginal", "varumärke",
    ],
    bygga: (reg) => {
      const seAntal = reg.filter((r) => r.kategori === "SEKTORANALYS").length;
      const kallor = [
        kursKalla(reg, "se-07-detailhandel", "Läroplanen — sektorn analys: skalan, butiken och e-handelns tryck"),
        kursKalla(reg, "km-044-konsumentsektorn", "Läroplanen — konsumtionens struktur: dagligvaror, säsongsvaror, trender"),
        kursKalla(reg, "se-05-lyxsektorn", "Läroplanen — marginalens motsatspol: varumärket som prissättningsmakt"),
      ];
      const k = kallor[0];
      const se07 = reg.find((r) => r.slug === "se-07-detailhandel");
      return {
        text:
          `Detaljhandeln är börsens mest vardagsnära bransch — och analysen handlar om att skilja äkta tillväxt från butiksexpansion och hyrd volym (allt nedan är utbildning i hur branschens mått DEFINIERAS och RÄKNAS — inga omdömen om enskilda bolag, talen är påhittade):\n\n1️⃣ LIKE-FOR-LIKE — DEN ÄRLIGA TILLVÄXTEN. Totalsiffran ljuger tre gånger: nya butiker tillför volym, stängda tar bort, och inflationen blåser upp resten. Därför är branschens kärnmått LIKE-FOR-LIKE (jämförbar försäljning): samma butiker, minst ett år gamla, i fast valuta. Övningsidentiteten med påhittade tal: total tillväxt 12 procent = jämförbar försäljning +6 + nytöppnade butiker +9 − avvecklade −3, tydligt skrivet 6 + 9 − 3 = 12. En kedja kan alltså visa tvåsiffrig tillväxt med SJUNKANDE jämförbar försäljning — expansionen finansierar intrycket tills taket tar slut. E-handelns kanalglidning (frågan om e-handel i sig lämnas här utanför — den är inte detta lagers ämne) syns just i LFL-splitten mellan fysiska butiker och digital kanal.\n2️⃣ MARGINALTRAPPAN — HYRAN, PERSONALET, VARORNA. Detaljhandelns resultaträkning är en trappa med fasta trappsteg. Övningen: säljer butiken varor för 100 som kostade 60 i inköp är bruttomarginalen 100 − 60 = 40 procent; sedan betalar den hyra 12 procent av omsättningen och personal 18 procent — kvar till rörelsen blir 40 − 12 − 18 = 10 procent. Det är en fabrik av låg marginal med hög volym: varje extra procent jämförbar tillväxt ramla nästan rakt igenom till bottenraden (personal och hyra är redan betalda), men samma mekanism slår åt andra hållet när volymen vänder — därför är detaljhandelsaktier bland börsens mest konjunkturkänsliga i motgångar trots "tråkiga" varor.\n3️⃣ SKALAN OCH VARUMÄRKET — NÄTETS TVÅ ÄNDAR. Butiksnätets värde sitter i tätheten (logistiksektorns tema, knappen nedan): fler-butiks-täthet ger kortare transporter, billigare marknadsföring per kund och svårkopierad närvaro. I andra änden står varumärkesmakt — lyxsektorn (se-05) är samma konsument med SPEGLAD ekonomi: marginaler på 60+ procent och prissättningsmakt i stället för volym. Konsumentkursen (km-044) ramar in hela spännvidden från dagligvaror (stabilt, lågt) till trendvaror (cykliskt, högt). Och blodcirkulationen i allt detta är lagret — varorna på hyllan binder kapital (lageromsättningens matte ägs av kapitalbindningskursen, knappen nedan).\n\nI sektorn analys-kategorin finns ${seAntal} kurser — huvudkursen (${se07 ? se07.minuter + " min, " + se07.niva.toLowerCase() + " nivå" : "i registret"}) går igenom skalans och butikens ekonomi steg för steg. Som alltid: detta är utbildning i en metod — inga placeringstips.` +
          kallradFler(kallor),
        amne: "detaljhandel",
        kalla: k,
        kallor,
        handlings: [
          { text: "Kursen: Detaljhandel", lank: "/kurser/se-07-detailhandel", ikon: "🔗", beskrivning: "Skala, butik och e-handel" },
          { text: "Kursen: Konsument-sektorn", lank: "/kurser/km-044-konsumentsektorn", ikon: "🛍️", beskrivning: "Konsumtionens struktur" },
          { text: "Kursen: Lyx-sektorn", lank: "/kurser/se-05-lyxsektorn", ikon: "💎", beskrivning: "Marginalens motsatspol" },
          { text: "Vad är lageromsättning?", lank: "fragor:" + encodeURIComponent("vad är lageromsättning?"), ikon: "📦", beskrivning: "Butikens blodcirkulation" },
          { text: "Hur analyserar jag logistikbolag?", lank: "fragor:" + encodeURIComponent("hur analyserar jag logistikbolag?"), ikon: "🚚", beskrivning: "Nästa bransch i spåret" },
        ],
        motfraga: { text: "Hur analyserar jag logistikbolag?", kategori: "sektor" },
        fordjupa: { text: k.titel, lank: "/kurser/se-07-detailhandel" },
      };
    },
  },
  {
    id: "logistik",
    karnord: [
      "logistik", "logistikbolag", "logistikbolagen", "logistikbranschen",
      "frakt", "fraktbolag", "godstransport", "lastmile", "last mile",
    ],
    starkord: [
      "nätverk", "transport", "gods", "terminal", "rutt", "rutter",
      "fordon", "truck", "paket", "volym", "leverans", "distribution",
      "e-handel",
    ],
    bygga: (reg) => {
      const seAntal = reg.filter((r) => r.kategori === "SEKTORANALYS").length;
      const kallor = [
        kursKalla(reg, "se-04-logistiksektorn", "Läroplanen — sektorn analys: nätverkets täthet, kapitalet och kontrakten"),
        kursKalla(reg, "se-15-logistik", "Läroplanen — nätverkslogiken: varför tätheten slår storleken"),
        kursKalla(reg, "km-041-industrisektorn", "Läroplanen — den kapitalintensiva driftslogik logistiken delar med industrin"),
      ];
      const k = kallor[0];
      const se04 = reg.find((r) => r.slug === "se-04-logistiksektorn");
      return {
        text:
          `Logistikbranschen levererar handelns blodcirkulation — och dess analys står och faller med två bilder: NÄTVERKET och KAPITALET (allt nedan är utbildning i hur branschens ekonomi DEFINIERAS och RÄKNAS — inga omdömen om enskilda bolag, talen är påhittade):\n\n1️⃣ NÄTVERKSEKONOMIN — TÄTHETENS MATTE. En rutt med tio upphämtningsstopp kostar nästan samma förare och fordon som en med hundra: kostnaden per paket FALLER med volymen på varje sträcka. Övningsräkningen: går kostnaden per paket från 8 kronor till 5 när volymen fördubblas på rutten sjunker den med (8 − 5) ÷ 8 = 37,5 procent — utan en enda ny anställd. Detta är nätverkslogiken (se-15:s kärna): täthet — många stopp, korta sträckor, fulla fordon — är svårkopierad på ett sätt som enskilda priser aldrig är, eftersom en konkurrent inte kan låna ditt nät. Nav-och-eker-arkitekturen (terminaler som brytpunkter) är samma mekanik som gör att EN hubb mindre eller mer ändrar hela systemets kostnadskurva — strukturen, inte fliteten, bär marginalen.\n2️⃣ KAPITALTÄTHETEN — TRUCKARNAS PRIS. Logistik är tung drift: fordon, terminaler, truckar — ofta leasing eller ägt. Övningen: en flotta värd 1 000 Mkr skriven av över 8 år kostar 1 000 ÷ 8 = 125 Mkr om året i enbart avskrivningar, och vid 2 500 Mkr i årsomsättning är kapitaltätheten 1 000 ÷ 2 500 = 0,4 — fyra tiondelar av varje intäktskrona ligger i maskinparken (kursens jämförelse: samma logik som industrisektorns, km-041). Därför skiljer branschen TJÄNSTELOGIK (tillgångar i drift, kassaflödesvikt) från BOLAGSLOGIK — och därför är avkastningen på sysselsatt kapital nyckeltalet, inte vinstmarginalen ensam.\n3️⃣ LASTMILE OCH KONTRAKTEN — DÖRRENS PRIS. Sista sträckan till dörren är dyrast: i övningsexemplet står lastmilen för 4 av 10 kronor per paket = 40 procent av hela kostnaden — att bära ett brev tio kilometer kostar mer än att flyga det tusen. E-handelns tillväxt (styrkordsnivå här — dess egen fråga ägs av kedjan på annat håll) matar volymerna, men också lastmile-andelen. Kontrakten gör intäkterna stelt volymkopplade: stora kundavtal prissätter volym i förväg, och när handeln vänder sjunker påfyllnaden direkt — en cykelsårbarhet som förstärks av bränslekostnader. Kassakonverteringscykeln (kapitalbindningslagrets ämne, knappen nedan) stänger analysen: ett logistikbolag som kan hålla kundfordringar korta och leverantörstider långa driver verksamheten delvis på andras kapital.\n\nI sektorn analys-kategorin finns ${seAntal} kurser — huvudkursen (${se04 ? se04.minuter + " min, " + se04.niva.toLowerCase() + " nivå" : "i registret"}) äger nätverkets och kapitalets hela analysram. Som alltid: detta är utbildning i en metod — inga placeringstips.` +
          kallradFler(kallor),
        amne: "logistik",
        kalla: k,
        kallor,
        handlings: [
          { text: "Kursen: Logistik-sektorn", lank: "/kurser/se-04-logistiksektorn", ikon: "🔗", beskrivning: "Nätet, kapitalet, kontrakten" },
          { text: "Kursen: Logistik — nätverk", lank: "/kurser/se-15-logistik", ikon: "🕸️", beskrivning: "Täthetens logik" },
          { text: "Kursen: Industri-sektorn", lank: "/kurser/km-041-industrisektorn", ikon: "🏭", beskrivning: "Kapitallogikens granne" },
          { text: "Vad är kassakonverteringscykeln?", lank: "fragor:" + encodeURIComponent("vad är kassakonverteringscykeln?"), ikon: "🔄", beskrivning: "Andras kapital i driften" },
          { text: "Hur analyserar jag läkemedelsbolag?", lank: "fragor:" + encodeURIComponent("hur analyserar jag läkemedelsbolag?"), ikon: "💊", beskrivning: "Första branschen i spåret" },
        ],
        motfraga: { text: "Hur analyserar jag läkemedelsbolag?", kategori: "sektor" },
        fordjupa: { text: k.titel, lank: "/kurser/se-04-logistiksektorn" },
      };
    },
  },
];

// ── Huvudingången ──────────────────────────────────────────────────────────

/**
 * Svara lokalt med NÅGOT av de tre sektorskola 2-mönstren — eller null
 * (då har hela kedjan före redan lämnat null och API-flödet tar över som
 * förr). Ligger SIST i widgetens kedja och kan därför aldrig stjäla en
 * fråga från tidigare lager. Samma matchningssemantik som basmotorn:
 * minst ett kärnord krävs, poäng = kärnord × 3 + stärkord, oavgjort →
 * först deklarerade mönstret vinner (strikt >, deterministiskt). Samma
 * fråga ⇒ bitidentiskt svar.
 */
export function svaraLokaltSektorskola2(fraga: string, register: RegisterRad[]): LokaltSvar | null {
  const fragaStr = diafri(fraga);
  if (!fragaStr) return null;
  const fragaOrd = fragaStr.split(" ");
  let bast: { svar: LokaltSvar; poang: number } | null = null;
  for (const m of SEKTORSKOLA2_MONSTER) {
    const karnTraff = m.karnord.filter((nk) => traff(fragaOrd, fragaStr, nk));
    if (karnTraff.length === 0) continue; // krav: minst ett kärnord
    const starkTraff = m.starkord?.filter((nk) => traff(fragaOrd, fragaStr, nk)) ?? [];
    const poang = karnTraff.length * 3 + starkTraff.length;
    if (!bast || poang > bast.poang) bast = { svar: m.bygga(register), poang };
  }
  return bast ? bast.svar : null;
}
