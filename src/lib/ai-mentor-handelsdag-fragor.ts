/**
 * AI-MENTORN 2.0 — HANDELSDAG-FÖRHANDSFRÅGOR (spår 6, omgång 17, s6-u1).
 *
 * En källmärkt förhandsfråga ovanpå de trettiofem föregående lagren —
 * kedjans VAR-fråga för allt som händer MELLAN tangenttrycket och
 * avräkningen: HANDELSDAGEN — marknadsstrukturen, auktionerna och
 * kortläget (am-05 primär + am-03 + am-04 + am-06 + Flash Boys).
 *
 * Aktiverar fyra mentorväglösa kurser — KATEGORIN AKTIEMARKNADEN I
 * PRAKTIKEN blir fullt länkad (4/8 → 8/8): am-03-lasa-aktiesidan ·
 * am-04-marknadsstruktur · am-05-handelsdagens-auktioner ·
 * am-06-kortlage-och-aktieutlaning — plus boken flash-boys som femte
 * källa (spårets mål "fler kurslänkar per svar", utan API-kostnad).
 *
 * ÄMNESVAL EFTER SOND (verktyg/_s6u1-sond-omg17.mjs + -sond2- + -sond3-,
 * otrackade diskbevis; anspråk data/vakten/auto-s6-1789704300078-u1-ansprak.md
 * FÖRE byggstart): hela familjen var NULL genom kedjan («vad är
 * marknadsstruktur?» · «hur fungerar handelsdagen?» · «vad är
 * öppningsauktionen?» · «vad är stängningsauktionen?» · «vad är
 * efterhandeln?» · «vad är kortläget?» · «vad är aktieutlåning?» ·
 * «hur läser jag aktiesidan?» · «vad är utlåningsränta?» · «vad är dark
 * pool?» · «vad är kortsqueeze?» · «vad är vwap?») och samtliga planerade
 * kärnord RENTA mot 1 032 unika syskonkärnord (motorns tavstånd).
 *
 * ANSVARSFÖRDELNING (syskinlagrens dokumentationsplikt; V19-precedensen —
 * källägande ≠ kärnordsägande):
 *   • Basens aktiemarknads-monster äger grundfamiljen orderbok/likviditet/
 *     spread/prisspridning/nätmäklare («vad är spreaden?» FÅNGAS av basen —
 *     sondbevisat); am-01/km-069/km-070 är redan deras kurser och lämnas där.
 *   • Praktik-lagret äger blanknings-STRATEGIN och kortpositions-orden
 *     («vad är kortposition?» FÅNGAS av praktik, d=0 — sondbevisat); detta
 *     lager bär ENDAST data-/mekanik-vokabulärerna (kortläge, aktieutlåning,
 *     täckningsdagar, utlåningsavgift, inklämning) — strategin länkas aldrig.
 *   • Nästa-lagret äger derivat/optioner/terminer; optionen↔auktionen ligger
 *     tavstånd 3 (utanför bådas tolerans) — mätetbart disjunkta.
 *   • Redovisningsdjupet äger leasing; «clearing» kasserades därför som
 *     kärnord (tavstånd 2 till leasing inom det planerade ordets tolerans —
 *     hade stulit leasing-frågorna). Clearing nämns ENDAST i text.
 *   • Extra/moat fångar «hur mäts X?»-formuleringar («hur mäts kreditrisk?»
 *     → moat, sondbevisat) — kanoniska frågor här undviker mät-formen.
 *   • Ekosystemdjupet (lager 34, samma omgång) äger SAM-/backtest-/monte
 *     carlo-familjerna — kärnordsdisjunktion i båda riktningarna bevisas av
 *     testens J-fall mot LIVE-läget.
 *
 * Matchningen speglar motorns hjälpfunktioner (samma lösning som alla
 * syskinlager: Node type-stripping löser endast `import type`, så de rena
 * funktionerna speglas hit). Semantisk likhet med motorn BEVISAS av testets
 * felstavningsfall (B) och determinismfall (C). Driftvarning: ändras motorns
 * matchning måste denna spegel följa — testfall B vaktar.
 *
 * SAMMANSÄTTNING (chat-widget.tsx): detta lager ligger SIST (efter
 * ekosystemdjupet) och kan därför aldrig stjäla en fråga från ett tidigare
 * lager; det fångar bara frågor som alla lager före det lämnar null på.
 * Omvänt vaktar testfall I på att dessa frågor INTE fångas av kedjan utan
 * detta lager (dupliceringsskydd).
 *
 * ── JURIDIKGRINDEN (lagen 2007:528) ──────────────────────────────────
 * All text är pedagogisk utbildning om hur handelsdagens mekanismer
 * DEFINIERAS och RÄKNAS — inga köp-/säljsignaler, inga placeringstips,
 * inga omdömen om enskilda värdepapper eller när någon bör handla.
 * Aritmetiken återger kursernas egna publicerade räkneexempel (auktions-
 * trappan 1 000/950 med auktionskurs 100 och 430 omsatta aktier ·
 * aktiesidans 84,00/83,00 → +1,20 procent · kortlägets netto 420 kronor
 * med spegeln −1 680 · täckningsdagarna 6,0/1,2 = 5,0 · Volkswagen 2008
 * och GameStop 2021 som MEKANIK, inte drama) — kortlägets ram är genom-
 * gående förståelse av mekanismen, aldrig någon uppmuntran att bruka den.
 *
 * ── DEPENDENCY-INJECTION (samma mönster som hela motorn) ─────────────
 * Registret skickas IN som parameter (endast `import type`) så att
 * verktyg/testa-ai-mentor-handelsdag.mjs kan köra filen direkt i Node.
 * Alla källkurser (am-05-handelsdagens-auktioner, am-03-lasa-aktiesidan,
 * am-04-marknadsstruktur, am-06-kortlage-och-aktieutlaning, flash-boys)
 * finns i KURSREGISTER (verifierat mot levande register; kursKalla faller
 * tillbaka på "Läroplanen" om ett framtida register läcker en slug).
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

// ── Den 1 handelsdagsfrågan ─────────────────────────────────────────────────

export const HANDELSDAG_MONSTER: FragMonster[] = [
  {
    id: "handelsdagen",
    karnord: [
      "marknadsstruktur", "marknadsstrukturen", "marknadsstrukturer",
      "öppningsauktion", "öppningsauktionen",
      "slutauktion", "slutauktionen", "stängningsauktion", "stängningsauktionen",
      "auktion", "auktionen", "auktioner", "auktionerna",
      "handelsdag", "handelsdagen",
      "efterhandel", "efterhandeln",
      "aktiesida", "aktiesidan",
      "kortläge", "kortläget",
      "aktieutlåning", "aktieutlåningen",
      "utlåningsavgift", "utlåningsränta", "utlåningsräntan",
      "täckningsdagar", "täckningsdagen",
      "mörk pool", "mörka pooler", "dark pool",
      "volatilitetsavbrott", "volatilitetspaus",
      "inklämning", "inklämningen",
      "kortsqueeze", "squeeze",
      "vwap",
      "avräkning",
      "handelsplats", "handelsplatser", "handelsplatserna",
      "referenskurs", "referenskursen",
    ],
    starkord: [
      "handel", "handlas", "börs", "börsen", "kurs", "kursen", "pris",
      "order", "orderbok", "köp", "köps", "sälj", "säljs", "volym",
      "omsättning", "dag", "dagen", "öppning", "stängning", "aktie",
      "aktier", "lån", "låna", "lånade", "kort", "korta", "data",
      "läsa", "siffror", "matchning", "matchas", "insamling", "kontinuerlig",
    ],
    bygga: (reg) => {
      const amAntal = reg.filter((r) => r.kategori === "AKTIEMARKNADEN I PRAKTIKEN").length;
      const kallor = [
        kursKalla(reg, "am-05-handelsdagens-auktioner", "Läroplanen — AKTIEMARKNADEN I PRAKTIKEN: dagens tre lägen och auktionskursens aritmetik"),
        kursKalla(reg, "am-03-lasa-aktiesidan", "Läroplanen — AKTIEMARKNADEN I PRAKTIKEN: skärmens sex huvudtal"),
        kursKalla(reg, "am-04-marknadsstruktur", "Läroplanen — AKTIEMARKNADEN I PRAKTIKEN: en orders väg genom systemet"),
        kursKalla(reg, "am-06-kortlage-och-aktieutlaning", "Läroplanen — AKTIEMARKNADEN I PRAKTIKEN: orderbokens andra sida"),
        kursKalla(reg, "flash-boys", "Bokmastaren — Lewis om farten som strategi och strukturblindhetens pris"),
      ];
      const k = kallor[0];
      const am5 = reg.find((r) => r.slug === "am-05-handelsdagens-auktioner");
      return {
        text:
          `Handelsdagen är rytmerna bakom varje notering i kursrutan — dagen har tre lägen, och varje läge sätter priset på sitt eget sätt: före öppning samlas order in och matchas i EN auktion som ger dagens första kurs; mitt på dagen matchar orderboken kontinuerligt (köparna möter säljarna löpande — spridningens mekanik ur likviditetskursen); i slutauktionen sätts dagens officiella stängningskurs — och därefter finns efterhandeln för handel utanför börsens ordinarie session, tunnare och med bredare avstånd mellan köpkurs och säljkurs. Bakom rytmen ligger marknadsstrukturen, en orders väg: orderläggning, mäklare, handelsplats — reglerad marknad, multilateral handelsplats (MTF), systematisk intern handel (SI) eller mörk pool — matchning, clearing och slutligen avräkning: kedjan tar sekunder att resa och två dagar att slutgöra. Allt nedan är utbildning i mekanismerna — inga råd om när eller hur någon bör handla:\n\n1️⃣ AUKTIONSKURSEN I REN ARITMETIK — auktionen bygger två trappor. Köpsidan rangordnas från högst till lägst (hur många aktier vill köpas till minst vilken kurs), säljsidan spegelvänt, och trapporna räknas kumulativt: vid varje tänkbar kurs möts alla bud på eller över kursen alla lösen på eller under den — den omsatta volymen är det MINDRE av de två kumulativen, och auktionskursen är kursen där detta tal är som störst. Kursens genomgående exempel: bud 100 aktier till 102, 150 till 101, 200 till 100, 250 till 99 och 300 till 98 — sammanlagt 1 000 aktier; lösen 120 till 98, 130 till 99, 180 till 100, 220 till 101 och 300 till 102 — sammanlagt 950. Kumulativt vid varje kurs blir köpsidan 100/250/450/700/1 000 och säljsidan 120/250/430/650/950; den omsatta volymen blir minst av paren: 120 · 250 · 430 · 250 · 100 — störst vid kurs 100, där 430 aktier byter ägare och auktionskursen alltså blir 100. Resterar 450 − 430 = 20 omatchade bud på köpsidan: ett uppåttryck som signalerar åt vilket håll trycket pekade vid nästa matchning. Två vidare mekaniker: SLUTAUKTIONEN HAR VUXIT — passiva index- och fondflöden prissätts mot stängningskursen, därför samlas stora omsättningsvolymer just där, särskilt vid indexombalanseringar; och VOLATILITETSAVBROTTET — rör sig kursen för fort pausas handeln (sedan EU:s MiFID II 2018 ett krav på reglerade handelsplatser), orderna får inte försvinna utan samlas, och handeln återupptas via en kort auktion: pausen är en auktion i förklädnad — stoppad handel är osynlig rörelse, avbrottet döljer trycket, det avlägsnar det inte.\n2️⃣ AKTIESIDANS SEX TAL — skärmens fälttäckning, före alla metoder: senaste kurs, dagens förändring, dagens högsta och lägsta, handlad volym, börsvärde och direktavkastning. Procentens grammatik är fältens gemensamma språk: kurs 84,00 kronor mot gårdagens 83,00 är en krona — men också (84,00 − 83,00) ÷ 83,00 = +1,20 procent, och procenttalet är det som talar mellan aktier med olika kursnivåer. Volymen räknar aktier, omsättningen kronor — först när båda är klara kan handeln jämföras mellan bolag; börsvärdet är kurs gånger antal aktier. Kursens fem nybörjarmissläsningar, i positiv form: läs låg kurs som lågt pris (inte billigt), läs procent (inte kronor), jämför volym inom bolaget (inte mellan), läs direktavkastningen som historisk (inte utlovad) — och minn att siffrorna är fakta, aldrig råd.\n3️⃣ KORTLÄGET — ORDERBOKENS ANDRA SIDA — ett kortläge är sålda LÅNADE aktier med skyldighet att återlämna samma antal: vinsten är fallet mellan försäljning och återköp, förlusten är stigningen däremellan. Bakom varje kort position står utlåningskedjan: institutionella ägare lånar ut andelar av sina innehav via förmedlare mot avgift — kursens exempel: en fond med 2 miljoner aktier lånar ut 8 procent = 160 000 aktier à 30 kronor = 4,8 miljoner kronor utlåat mot 0,4 procent = 19 200 kronor per år. Kortlägets ekonomi i kursexemplets aritmetik: låna 100 aktier à 30, sälja för 3 000, återköpa à 24 för 2 400 — brutto 600 kronor; MINUS låneavgiften 1,0 procent av 3 000 = 30 kronor och utdelningsersättningen 100 × 1,50 = 150 kronor (rätten till utdelning skyddas hos ägaren — i Sverige som standard 120 procent av utdelningen) = NETTO 420 kronor. Spegeln, kursens egna sanning: stiger aktien till 45 i stället blir bruttoförlusten −1 500 och nettot −1 680 — och förlusten har INGET tak, ty aktien kan stiga hur högt som helst. Dataläran — kortläget är marknadens mest läsliga åsikt: andelen korta 6,0 miljoner av 100 miljoner = 6,0 procent; täckningsdagarna 6,0 ÷ 1,2 miljoner per dag = 5,0 dagars omsättning att köpa tillbaka allt; utnyttjandegraden 5,1 ÷ 6,0 lånbara = 85 procent; och sedan 2012 rapporterar EU:s shortsregister nettokortpositioner offentligt från 0,5 procent av aktiekapitalet. Inklämningen är mekanik, inte drama: stigande kurs driver förlustar, marginalkrav och återköp som driver kursen vidare — Volkswagen oktober 2008 (Porsches tillkännagivna 74,1 procents kontroll mot ett kortläge på c:a 12,9 procent; aktien från c:a 210 euro till 1 005,01 euro på intradagstoppen två handelsdagar senare) och GameStop januari 2021 (ett kortläge större än den fritt omsatta andeln mötte en koordinerad köpvåg; c:a 20 till 483 dollar intradags). Kursens ram är genomgående: mekanikens förståelse, aldrig en uppmuntran — asymmetrin (obegränsad förlust, negativ bäring) är själva läxan.\n\nI kategorin aktiemarknaden i praktik finns ${amAntal} kurser — handelsdagens auktioner (${am5 ? am5.minuter + " min, " + am5.niva.toLowerCase() + " nivå" : "i registret"}) binder ihop spåret: aktiesidan är skärmens sex tal, likviditeten och spridningen handelns kostnad, orderboken motorn, marknadsstrukturen systemet — och kortläget den sida kurserna normalt visar uppifrån. Som alltid: detta är utbildning i hur marknadens mekanismer fungerar — inga placeringstips.` +
          kallradFler(kallor),
        amne: "handelsdagen",
        kalla: k,
        kallor,
        handlings: [
          { text: "Kursen: Handelsdagens auktioner", lank: "/kurser/am-05-handelsdagens-auktioner", ikon: "🕰️", beskrivning: "Öppning, löpande handel och stängning" },
          { text: "Kursen: Marknadsstruktur", lank: "/kurser/am-04-marknadsstruktur", ikon: "🗺️", beskrivning: "En orders väg genom systemet" },
          { text: "Kursen: Läsa aktiesidan", lank: "/kurser/am-03-lasa-aktiesidan", ikon: "📟", beskrivning: "Skärmens sex huvudtal" },
          { text: "Kursen: Kortläge och aktieutlåning", lank: "/kurser/am-06-kortlage-och-aktieutlaning", ikon: "↩️", beskrivning: "Orderbokens andra sida" },
          { text: "Vad är likviditet och spread?", lank: "fragor:" + encodeURIComponent("vad är spreaden?"), ikon: "💧", beskrivning: "Handelns dolda kostnader — basens aktiemarknads-lager" },
        ],
        motfraga: { text: "Vad är orderboken?", kategori: "aktiemarknaden" },
        fordjupa: { text: k.titel, lank: "/kurser/am-05-handelsdagens-auktioner" },
      };
    },
  },
];

// ── Huvudingången ──────────────────────────────────────────────────────────

/**
 * Svara lokalt med handelsdag-mönstret — eller null (då har hela kedjan
 * före redan lämnat null och API-flödet tar över som förr). Ligger SIST i
 * widgetens kedja och kan därför aldrig stjäla en fråga från tidigare
 * lager. Samma matchningssemantik som basmotorn: minst ett kärnord krävs,
 * poäng = kärnord × 3 + stärkord, oavgjort → först deklarerade mönstret
 * vinner (strikt >, deterministiskt). Samma fråga ⇒ bitidentiskt svar.
 */
export function svaraLokaltHandelsdag(fraga: string, register: RegisterRad[]): LokaltSvar | null {
  const fragaStr = diafri(fraga);
  if (!fragaStr) return null;
  const fragaOrd = fragaStr.split(" ");
  let bast: { svar: LokaltSvar; poang: number } | null = null;
  for (const m of HANDELSDAG_MONSTER) {
    const karnTraff = m.karnord.filter((nk) => traff(fragaOrd, fragaStr, nk));
    if (karnTraff.length === 0) continue; // krav: minst ett kärnord
    const starkTraff = m.starkord?.filter((nk) => traff(fragaOrd, fragaStr, nk)) ?? [];
    const poang = karnTraff.length * 3 + starkTraff.length;
    if (!bast || poang > bast.poang) bast = { svar: m.bygga(register), poang };
  }
  return bast ? bast.svar : null;
}
