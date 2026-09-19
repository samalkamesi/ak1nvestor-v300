/**
 * AI-MENTORN 2.0 — MARKNADSMEKANIK-FÖRHANDSFRÅGOR (våg 189 — spår 6, kundorder
 * "fortsätt enligt planen allt online", levererad från kundens arbetsstation
 * 2026-09-19).
 *
 * Tio källmärkta förhandsfrågor om AKTIEMARKNADENS MEKANIKER — ordervärlden,
 * likviditet och index-konstruktion — bokad i PIPELINE-KO.md (rond 68) och
 * eftersatt enligt skiftets vika-regel ("körs vid lucka i fokus 1-4"; fokus
 * 1-4 levererade genom våg 191-207 ⇒ luckan fanns). Ämnena speglar kategorin
 * AKTIEMARKNADEN I PRAKTIKEN (am-kurserna + km-069), som fram till denna våg
 * saknade eget förhandsfrågelager.
 *
 *   1. Orderboken      (nivåerna, köp- och säljsidan — km-069)
 *   2. Matchning       (pris-tid-prioritet, prisbildning — km-069 + am-04)
 *   3. Ordertyper      (marknadsord vs limitord + stopp — am-04)
 *   4. Spread          (handelns dolda kostnad — am-01)
 *   5. Likviditet      (marknadens tre dimensioner — am-01, med V11-avgränsning)
 *   6. Handelsvolym    (likviditetens puls — am-01, AK1TS-gränsen respekterad)
 *   7. Värdeviktning   (hur ett värdeviktat index byggs — am-02)
 *   8. Likviktat       (kontrasten till värdeviktning — am-02)
 *   9. OMXS30          (urval, omprövning, vikter — am-02)
 *  10. Courtage        (handelns kostnadsposter — am-01)
 *
 * ÄMNESVAL EFTER KOLLISIONSKONTROLL mot SAMTLIGA 52 befintliga lager (113
 * monster, 1 254 kärnord, lästa ur serverns aktuella filer 2026-09-19):
 *   · tsdjup äger orderflöde/marknadsdjup/volymanalys/volymprofil (AK1TS:s
 *     tekniska sida) — detta lager äger bara det nakna ordet "volym" som
 *     likviditetsmått och rör ALDRIG analysbetydelsen.
 *   · handelsdag äger marknadsstruktur/auktioner/handelsplatser — här nämns
 *     auktionerna endast som hänvisande prosa, aldrig som kärnord.
 *   · praktik äger index/indexfond-familjen — därför siktar index-frågorna
 *     på KONSTRUKTIONEN (värdeviktning, likviktning, omxs30) med kärnord
 *     som aldrig innehåller ordet index.
 *   · overlevnadsdjup äger bolagets likviditetsreserv/buffert — fråga 5
 *     äger MARKNADENS likviditet och avgränsar de två begreppen i texten.
 *   · kreditdjup äger kreditspread; portfoljbalans äger rebalansering —
 *     spräds.
 *   Verifierat mekaniskt av testfall K (kärnorden läses LIVE ur samtliga
 *   src/lib/ai-mentor-*-fragor.ts vid varje körning) och testfall G
 *   (antistöld mot tidigare lagers kanoniska frågor).
 *
 * KEDJEPLACERING: EFTER case, FÖRE praktik — med kärnorden disjunkta är
 * platsen en tie-brytning (makro-precedensen): frågor om index-KONSTRUKTION
 * ("hur vägs OMXS30?") ska inte fångas av praktik-lagrets generella
 * indexfond-svar. Praktik behåller allt som innehåller ordet "index" som
 * kärnordsträff UTAN egen konstruktionsfras — testfall G2 vaktar gränsen.
 *
 * Matchningen speglar motorns hjälpfunktioner (samma lösning som samtliga
 * syskonlager: Node type-stripping löser endast `import type`, så de rena
 * funktionerna speglas hit). Semantisk likhet med motorn BEVISAS av testets
 * felstavningfall (B) och determinismfall (C). Driftvarning: ändras motorns
 * matchning måste denna spegel följa — testfall B vaktar.
 *
 * SAMMANSÄTTNING (chat-widget.tsx):
 *   … ?? svaraLokaltCase(q, KURSREGISTER)
 *     ?? svaraLokaltMarknadsmekanik(q, KURSREGISTER)
 *     ?? svaraLokaltPraktik(q, KURSREGISTER) ?? …
 *
 * ── JURIDIKGRINDEN (lagen 2007:528) ──────────────────────────────────
 * All text är pedagogisk utbildning om hur marknadsmekanismerna fungerar —
 * inga köp-/säljsignaler, inga placeringstips, inga omdömen om enskilda
 * värdepapper, mäklare eller val av ordertyp. Kostnadsexemplen är aritmetik
 * med tydligt markerade exempelbelopp, aldrig prisjämförelser.
 *
 * ── DEPENDENCY-INJECTION (samma mönster som hela motorn) ─────────────
 * Registret skickas IN som parameter (endast `import type`) så att
 * verktyg/testa-ai-mentor-marknadsmekanik.mjs kan köra filen direkt i Node.
 * Källkurserna (km-069, am-01–am-06, v11-likviditet, ts-24-order-flow,
 * ts-23-volume-spread-analysis) finns i KURSREGISTER — inga fantomlänkar
 * (testfall D vaktar).
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

/** Kategoriräknare — registerdrivna tal i svaren (testfall D2 vaktar). */
function amAntal(register: RegisterRad[]): number {
  return register.filter((r) => r.kategori === "AKTIEMARKNADEN I PRAKTIKEN").length;
}

// ── De 10 marknadsmekanik-frågorna ──────────────────────────────────────────

export const MARKNADSMEKANIK_MONSTER: FragMonster[] = [
  {
    id: "orderbok",
    karnord: [
      "orderbok", "orderboken", "orderdjup", "köpsida", "säljsida",
      "köpsidor", "säljsidor",
    ],
    starkord: ["aktier", "handel", "börs", "fungerar", "betyder", "order", "ordrar"],
    bygga: (reg) => {
      const kallor = [
        kursKalla(reg, "km-069-orderbok-och-prissattning", "Läroplanen — aktiemarknaden i praktiken, orderbokens anatomi"),
        kursKalla(reg, "am-04-marknadsstruktur", "Läroplanen — aktiemarknaden i praktiken, hur handeln organiseras"),
        kursKalla(reg, "am-01-likviditet-och-spread", "Läroplanen — aktiemarknaden i praktiken, böckernas täthet"),
      ];
      const k = kallor[0];
      return {
        text:
          `Orderboken är listan över alla synliga köpordrar och säljordrar i en aktie — utbud och efterfrågan utskrivna rad för rad. Tre delar att känna igen — så fungerar mekaniken, inte vad du ska göra:\n\n1. DE TVÅ SIDORNA — köpsidan (bud) visar vad köpare högst är beredda att betala, säljsidan (fråga) visar lägsta pris säljare accepterar. Budtoppen och frågetoppen kallas sidornas toppar.\n2. NIVÅERNA — under toppen ligger order på sämre priser, varje nivå med sin volym. Orderdjupet är summan av det som står ut: en tät bok med stora volymer nära toppen är något annat än en gles med några enstaka lotsar långt ner.\n3. RÖRELSEN — order läggs, dras och ändras hela tiden. Boken är en levande bild av var motparterna just nu möts, inte en värdedom över bolaget.\n\nKategorin aktiemarknaden i praktiken har ${amAntal(reg)} kurser som bygger vidare på precis denna mekanik.` +
          kallradFler(kallor),
        amne: "orderbok",
        kalla: k,
        kallor,
        handlings: [
          { text: "Kursen: Orderbok och prissättning", lank: "/kurser/km-069-orderbok-och-prissattning", ikon: "📕", beskrivning: "Bokens anatomi, nivå för nivå" },
          { text: "Kursen: Marknadsstruktur", lank: "/kurser/am-04-marknadsstruktur", ikon: "🏗️", beskrivning: "Hur handeln organiseras kring böckerna" },
          { text: "Likviditet och spread", lank: "/kurser/am-01-likviditet-och-spread", ikon: "💧", beskrivning: "Vad en tät eller gles bok betyder" },
          { text: "Vad är spread?", lank: "fragor:" + encodeURIComponent("vad är spread?"), ikon: "↔️", beskrivning: "Avståndet mellan sidorna" },
        ],
        motfraga: { text: "Vad är skillnaden mellan marknadsord och limitord?", kategori: "aktiemarknaden" },
        fordjupa: { text: k.titel, lank: "/kurser/km-069-orderbok-och-prissattning" },
      };
    },
  },
  {
    id: "matchning",
    karnord: [
      "matchning", "matchas", "matchning av ordrar", "prisbildning",
      "prissättning", "pris-tid-prioritet", "tidsprioritet",
      "sätts priset", "priset sätts", "prisbildningen", "priset bestäms",
    ],
    starkord: ["ordrar", "order", "handel", "börs", "aktier", "fungerar"],
    bygga: (reg) => {
      const kallor = [
        kursKalla(reg, "km-069-orderbok-och-prissattning", "Läroplanen — aktiemarknaden i praktiken, hur motparter matchas"),
        kursKalla(reg, "am-04-marknadsstruktur", "Läroplanen — aktiemarknaden i praktiken, matchningens regler"),
        kursKalla(reg, "am-05-handelsdagens-auktioner", "Läroplanen — aktiemarknaden i praktiken, auktionernas samlade matchning"),
      ];
      const k = kallor[0];
      return {
        text:
          `Matchning är börsens regelverk för vilka ordrar som får göra affär med varandra — och i vilken ordning. Tre regler bär mekaniken — detta är hur systemet fungerar, inte en handlingsregel:\n\n1. PRISPRIORITET — det bästa köpet (högst bud) och den bästa försäljningen (lägst fråga) matchas först. Priset slår alltid volymen: en stor order på ett sämre pris väntar.\n2. TIDSPRIORITET — vid SAMMA pris gäller först in, först utförd. Den som ställt sin order tidigare står före i kön på sin prisnivå.\n3. PRISBILDNINGEN — affären sker där sidorna möts: en aktiv köpare som tar säljsidans pris betalar frågan, en aktiv säljare får budet. Auktionerna vid öppning och stängning matchar i stället ALLA ordrar samlat till ett pris — en mekanik den egna kursen om handelsdagen förklarar.\n\nSå byggs priset du ser i kurssystemet — ur tusentals sådana möten.` +
          kallradFler(kallor),
        amne: "matchning",
        kalla: k,
        kallor,
        handlings: [
          { text: "Kursen: Orderbok och prissättning", lank: "/kurser/km-069-orderbok-och-prissattning", ikon: "⚙️", beskrivning: "Matchningsreglerna i detalj" },
          { text: "Kursen: Marknadsstruktur", lank: "/kurser/am-04-marknadsstruktur", ikon: "🏗️", beskrivning: "Systemet kring matchningen" },
          { text: "Handelsdagens auktioner", lank: "/kurser/am-05-handelsdagens-auktioner", ikon: "🔔", beskrivning: "Öppning och stängning samlar orderna" },
        ],
        motfraga: { text: "Hur fungerar orderboken?", kategori: "aktiemarknaden" },
        fordjupa: { text: k.titel, lank: "/kurser/km-069-orderbok-och-prissattning" },
      };
    },
  },
  {
    id: "ordertyper",
    karnord: [
      "marknadsord", "marknadsorder", "limitord", "limitorder", "stopp",
      "stop-loss", "stop loss", "stoppmarknadsord", "stopp-limit",
    ],
    starkord: ["skillnaden", "order", "ordertyp", "välja", "fungerar", "aktier"],
    bygga: (reg) => {
      const kallor = [
        kursKalla(reg, "am-04-marknadsstruktur", "Läroplanen — aktiemarknaden i praktiken, ordertypernas mekanik"),
        kursKalla(reg, "km-069-orderbok-och-prissattning", "Läroplanen — aktiemarknaden i praktiken, hur ordertyperna möter boken"),
      ];
      const k = kallor[0];
      return {
        text:
          `Ordertyper är två olika sätt att möta orderboken — och mekaniken är en avvägning mellan utförande och pris:\n\n1. MARKNADSORD — "genomför nu". Ordern matchas omedelbart mot bästa tillgängliga pris på motsatt sida. Utförandet är nästan säkert; PRISTET är dess pris: i en tunn bok kan nästa nivå ligga märkbart sämre.\n2. LIMITORD — "endast till mitt pris eller bättre". Du sätter gränsen; ordern ligger synlig i boken tills någon matchar den. Prisvissheten är köpt med osäkerhet om UTFÖRANDET — gränsen kan aldrig nås.\n3. STOPP-ORDER — en villkorad utlösare: när priset passerar din tröskel omvandlas den till ett marknadsord (eller stopp-limit till ett limitord). Mekaniskt är den alltså ett par — bevakning plus den ordertyp den utlöser.\n\nVilken typ som passar en viss situation är en placéringsfråga vi aldrig svarar på — här får du mekaniken, och kurserna ger djupet.` +
          kallradFler(kallor),
        amne: "ordertyper",
        kalla: k,
        kallor,
        handlings: [
          { text: "Kursen: Marknadsstruktur", lank: "/kurser/am-04-marknadsstruktur", ikon: "🏗️", beskrivning: "Ordertyperna i systemet" },
          { text: "Orderbok och prissättning", lank: "/kurser/km-069-orderbok-och-prissattning", ikon: "📕", beskrivning: "Hur ordern möter boken" },
          { text: "Likviditet och spread", lank: "/kurser/am-01-likviditet-och-spread", ikon: "💧", beskrivning: "Vad ordervalet kostar i boken" },
          { text: "Vad är spread?", lank: "fragor:" + encodeURIComponent("vad är spread?"), ikon: "↔️", beskrivning: "Kostnaden som avgörs i boken" },
        ],
        motfraga: { text: "Vad är orderboken?", kategori: "aktiemarknaden" },
        fordjupa: { text: k.titel, lank: "/kurser/am-04-marknadsstruktur" },
      };
    },
  },
  {
    id: "spread",
    karnord: [
      "spread", "spreaden", "bid-ask", "bid ask", "köp-sälj-skillnad",
      "skillnaden mellan köp och sälj",
    ],
    starkord: ["aktier", "kostnad", "handla", "börs", "betyder", "pris"],
    bygga: (reg) => {
      const kallor = [
        kursKalla(reg, "am-01-likviditet-och-spread", "Läroplanen — aktiemarknaden i praktiken, handelns dolda kostnader"),
        kursKalla(reg, "am-04-marknadsstruktur", "Läroplanen — aktiemarknaden i praktiken, spreadens mekanik"),
        kursKalla(reg, "km-069-orderbok-och-prissattning", "Läroplanen — aktiemarknaden i praktiken, topparna som bildar spreaden"),
      ];
      const k = kallor[0];
      return {
        text:
          `Spread är avståndet mellan orderbokens två toppar: bästa säljpris (frågan) minus bästa köppris (budet). Den är handelns dolda kostnad — och ett mått på böckernas hälsa:\n\n1. DEN IMPLICITA KOSTNADEN — den som samtidigt köper och säljer förlorar spreaden per rundresa, även utan courtage. En aktie med bud 98,50 och fråga 99,00 bär en halvkronas avstånd — aritmetik, inte värdering.\n2. VAD SOM DRIVER DEN — hur tätt motparter står, hur stor volym som cirkulerar och hur osäker priset just då är. Mycket handel med många aktörer pressar avståndet; en tunn och ensam bok bär det bredare.\n3. GRÄNSDRAGNINGEN — i vår värld finns också KREDITSPREAD (extramarginalen för låntagarens risk), ett helt annat begrepp som trots samma ord handlar om obligationer — kursen om kreditdjup äger den sidan.\n\nSpreaden förklaras mekaniskt; vad du ska handla är aldrig frågan här.` +
          kallradFler(kallor),
        amne: "spread",
        kalla: k,
        kallor,
        handlings: [
          { text: "Kursen: Likviditet och spread", lank: "/kurser/am-01-likviditet-och-spread", ikon: "💧", beskrivning: "Handelns dolda kostnader från grunden" },
          { text: "Kursen: Marknadsstruktur", lank: "/kurser/am-04-marknadsstruktur", ikon: "🏗️", beskrivning: "Var spreaden kommer ifrån" },
          { text: "Orderbok och prissättning", lank: "/kurser/km-069-orderbok-och-prissattning", ikon: "📕", beskrivning: "Topparna som bildar spreaden" },
          { text: "Vad är orderboken?", lank: "fragor:" + encodeURIComponent("vad är en orderbok?"), ikon: "📚", beskrivning: "Boken bakom kostnaden" },
        ],
        motfraga: { text: "Vad betyder likviditet på börsen?", kategori: "aktiemarknaden" },
        fordjupa: { text: k.titel, lank: "/kurser/am-01-likviditet-och-spread" },
      };
    },
  },
  {
    id: "likviditet",
    karnord: [
      "likviditet", "likviditeten", "likvid marknad", "illikvid",
      "illikvida", "illikviditet",
    ],
    starkord: ["aktier", "börs", "handla", "betyder", "marknad", "handel"],
    bygga: (reg) => {
      const kallor = [
        kursKalla(reg, "am-01-likviditet-och-spread", "Läroplanen — aktiemarknaden i praktiken, marknadens likviditet"),
        kursKalla(reg, "am-04-marknadsstruktur", "Läroplanen — aktiemarknaden i praktiken, likviditetens byggstenar"),
        kursKalla(reg, "v11-likviditet", "Läroplanen — stabilitet, bolagets likviditet (avgränsningen)"),
      ];
      const k = kallor[0];
      return {
        text:
          `Marknadens likviditet är hur lätt en tillgång byter ägare utan att priset behöver röra sig — tre dimensioner som tillsammans måttar handelsbarheten:\n\n1. KOSTNADEN (spreaden) — hur brett avståndet mellan bud och fråga står. Trång spread är billigt byte, bred är dyrt.\n2. DJUPET — hur mycket som ligger vid priserna. Ett stort byte kan tömma nivåer och flytta priset i tunna böcker, medan en djup bok sväljer samma order utan att märkas.\n3. RESILIENSEN — hur snabbt nya order fyller luckor som handel lämnar. En illikvid aktie känns igen på alla tre: bred spread, tunt djup, långsam återfyllnad.\n\nVIKTIG AVGRÄNSNING: bolagets likviditet — kassan och de korta skulderna i balansräkningen — är ett ANNAT begrepp med samma ord; det ägs av stabilitetsvariabeln V11 och kursen där. Marknadens likviditet handlar om handeln, bolagets om betalningsförmågan.\n\nKategorin aktiemarknaden i praktiken (${amAntal(reg)} kurser) fortsätter bygga på dessa dimensioner — alltid som mekanikförståelse.` +
          kallradFler(kallor),
        amne: "likviditet",
        kalla: k,
        kallor,
        handlings: [
          { text: "Kursen: Likviditet och spread", lank: "/kurser/am-01-likviditet-och-spread", ikon: "💧", beskrivning: "De tre dimensionerna i praktiken" },
          { text: "Kursen: Marknadsstruktur", lank: "/kurser/am-04-marknadsstruktur", ikon: "🏗️", beskrivning: "Byggstenarna bakom handelsbarheten" },
          { text: "Bolagets likviditet (V11)", lank: "/kurser/v11-likviditet", ikon: "🏦", beskrivning: "Avgränsningen — balansräkningens sida" },
          { text: "Vad är spread?", lank: "fragor:" + encodeURIComponent("vad är spread?"), ikon: "↔️", beskrivning: "Dimension ett, förklarad" },
        ],
        motfraga: { text: "Vad säger handelsvolymen om en aktie?", kategori: "aktiemarknaden" },
        fordjupa: { text: k.titel, lank: "/kurser/am-01-likviditet-och-spread" },
      };
    },
  },
  {
    id: "handelsvolym",
    karnord: [
      "handelsvolym", "handelsvolymen", "volym", "volymen",
      "omsatt volym", "byter ägare",
    ],
    starkord: ["aktie", "aktier", "handlas", "betyder", "börs", "ser", "handel"],
    bygga: (reg) => {
      const kallor = [
        kursKalla(reg, "am-01-likviditet-och-spread", "Läroplanen — aktiemarknaden i praktiken, volymen som likviditetsmått"),
        kursKalla(reg, "am-04-marknadsstruktur", "Läroplanen — aktiemarknaden i praktiken, volymens plats i strukturen"),
        kursKalla(reg, "ts-24-order-flow", "Läroplanen — AK1TS fördjupning, den tekniska ordningsanalysen"),
      ];
      const k = kallor[0];
      return {
        text:
          `Handelsvolym är hur mycket som faktiskt byter ägare i en aktie under en period — antal aktier eller omsatt värde. I vår undervisning är volymen först och främst LIKVIDITETENS PULS:\n\n1. MÅTTET — volymen beräknas på genomförda affärer, inte på order som ligger. Den mäter rörelsen som skett, inte viljan som väntar.\n2. SAMMANHANGET — volym läses tillsammans med spread och djup: mycket handel med trång spread säger något annat än samma volym med bred. Ensam säger volymen inget om bra eller dåligt — den är ett bakgrundsmått, aldrig en slutsats.\n3. GRÄNSEN MOT ANALYSEN — att TOLKA volymen som tryck från köparna eller säljarna är ett eget kunskapsområde (orderflöde och volymanalys i AK1TS-fördjupningen) med egna kurser och egna metoder. Här stannar vi vid mekaniken: vad volymen ÄR och vad den mäter.\n\nSkillnaden mellan att känna mekaniken och att analysera flöden är exakt var grundkursen slutar och fördjupningen börjar.` +
          kallradFler(kallor),
        amne: "handelsvolym",
        kalla: k,
        kallor,
        handlings: [
          { text: "Kursen: Likviditet och spread", lank: "/kurser/am-01-likviditet-och-spread", ikon: "💧", beskrivning: "Volymen i likviditetssammanhanget" },
          { text: "Kursen: Marknadsstruktur", lank: "/kurser/am-04-marknadsstruktur", ikon: "🏗️", beskrivning: "Volymens plats i systemet" },
          { text: "Fördjupning: Order Flow", lank: "/kurser/ts-24-order-flow", ikon: "🌊", beskrivning: "Den tekniska analysidan — eget område" },
        ],
        motfraga: { text: "Vad betyder likviditet på börsen?", kategori: "aktiemarknaden" },
        fordjupa: { text: k.titel, lank: "/kurser/am-01-likviditet-och-spread" },
      };
    },
  },
  {
    id: "värdeviktning",
    karnord: [
      "värdeviktat", "värdeviktade", "värdeviktning", "kapitalviktat",
      "kapitalviktade", "kapitalviktning", "marknadsviktat", "börsvärdesviktat",
    ],
    starkord: ["index", "indexet", "byggs", "fungerar", "börs", "konstruktion"],
    bygga: (reg) => {
      const kallor = [
        kursKalla(reg, "am-02-index-och-passivt-agande", "Läroplanen — aktiemarknaden i praktiken, indexets konstruktion"),
        kursKalla(reg, "am-04-marknadsstruktur", "Läroplanen — aktiemarknaden i praktiken, viktningens mekanik"),
      ];
      const k = kallor[0];
      return {
        text:
          `Värdeviktning (kapitalviktning) är sättet de flesta börstindex byggs på: varje bolags röst i indexet väger efter dess börsvärde — aktiepris gånger antal aktier, med justering för hur stor andel aktier som faktiskt är fritt omsatta. Tre konsekvenser av mekaniken:\n\n1. STORT VÄGER TUNGT — ett bolag värt tusen miljarder rör indexet tio gånger mer än ett värt hundra. Kurvan speglar de stora bolagens samlade värdering, inte bordets genomsnitt.\n2. VIKTEN FLYTTAR SIG SJÄLV — stiger en aktie växer dess vikt, sjunker den krymper. Konstruktionen följer marknaden utan att någon behöver röra en spak — det är aritmetik, inte aktivt beslut.\n3. KONSEKVENSEN FÖR LÄSANDET — ett värdeviktat index säger "så värderar marknaden sina tyngsta bolag", inte "så går genomsnittsbolaget". Den som vill jämföra behöver veta vad kurvan mäter — grunden i kursen om index och passivt ägande.\n\nHur ett FÖLJANDE sparande förhåller sig till index är praktik-lagrets fråga; här är konstruktionen.` +
          kallradFler(kallor),
        amne: "värdeviktning",
        kalla: k,
        kallor,
        handlings: [
          { text: "Kursen: Index och passivt ägande", lank: "/kurser/am-02-index-och-passivt-agande", ikon: "📊", beskrivning: "Konstruktionen och dess konsekvenser" },
          { text: "Kursen: Marknadsstruktur", lank: "/kurser/am-04-marknadsstruktur", ikon: "🏗️", beskrivning: "Viktningens mekanik" },
          { text: "Läsa aktiesidan", lank: "/kurser/am-03-lasa-aktiesidan", ikon: "🖥️", beskrivning: "Siffrorna på skärmen — inklusive kurvan" },
          { text: "Vad är likviktat?", lank: "fragor:" + encodeURIComponent("vad är likviktat?"), ikon: "⚖️", beskrivning: "Kontrasten som förklarar båda" },
        ],
        motfraga: { text: "Hur är OMXS30 uppbyggt?", kategori: "aktiemarknaden" },
        fordjupa: { text: k.titel, lank: "/kurser/am-02-index-och-passivt-agande" },
      };
    },
  },
  {
    id: "likviktat",
    karnord: ["likviktat", "likviktade", "likviktning", "lika vikt"],
    starkord: ["index", "indexet", "skillnaden", "börs", "fungerar"],
    bygga: (reg) => {
      const kallor = [
        kursKalla(reg, "am-02-index-och-passivt-agande", "Läroplanen — aktiemarknaden i praktiken, viktningssätten"),
        kursKalla(reg, "am-04-marknadsstruktur", "Läroplanen — aktiemarknaden i praktiken, konstruktionens val"),
      ];
      const k = kallor[0];
      return {
        text:
          `Likviktat betyder att varje bolag i indexet får EXAKT samma vikt oavsett storlek — jubilen är aritmetiken, inte omdömet. Tre saker mekaniken ger:\n\n1. EN ROST PER BOLAG — trettio likviktade bolag rörs lika mycket av var och en. Ett litet bolags prisrörelse får samma röst som ett jättens, vilket gör kurvan till ett genomsnitt av BOLAGEN i stället för av KAPITALET.\n2. KONTRASTEN — i ett värdeviktat index domineras kurvan av de största; i ett likviktat är småbolagens sammanlagda röster synliga. Skillnaden mellan kurvorna är alltså en fråga om VAD indexet försöker mäta — inte om vilket som är rätt.\n3. UNDERHÅLLET — likviktning kräver återställning: eftersom priser rör sig glider vikterna isär och måste vägas tillbaka med jämna mellanrum. Värdeviktningen sköter motsvarande självmant; konstruktionen väljer sin egen arbetsbörda.\n\nBåda sätten förklaras neutrala i kurserna — valet mellan dem hör till placeringen, som aldrig är vår fråga.` +
          kallradFler(kallor),
        amne: "likviktat",
        kalla: k,
        kallor,
        handlings: [
          { text: "Kursen: Index och passivt ägande", lank: "/kurser/am-02-index-och-passivt-agande", ikon: "📊", beskrivning: "Viktningssätten sida vid sida" },
          { text: "Kursen: Marknadsstruktur", lank: "/kurser/am-04-marknadsstruktur", ikon: "🏗️", beskrivning: "Vad konstruktionen väljer" },
          { text: "Läsa aktiesidan", lank: "/kurser/am-03-lasa-aktiesidan", ikon: "🖥️", beskrivning: "Kurvan på skärmen i praktiken" },
          { text: "Vad är värdeviktning?", lank: "fragor:" + encodeURIComponent("vad är värdeviktning?"), ikon: "📏", beskrivning: "Motsatsen, förklarad" },
        ],
        motfraga: { text: "Hur vägs OMXS30 ihop?", kategori: "aktiemarknaden" },
        fordjupa: { text: k.titel, lank: "/kurser/am-02-index-och-passivt-agande" },
      };
    },
  },
  {
    id: "omxs30",
    karnord: ["omxs30", "omx30", "omx stockholm 30", "omx"],
    starkord: ["index", "indexet", "sammansätts", "byggs", "bolag", "börs"],
    bygga: (reg) => {
      const kallor = [
        kursKalla(reg, "am-02-index-och-passivt-agande", "Läroplanen — aktiemarknaden i praktiken, Sveriges mest citerade index"),
        kursKalla(reg, "am-04-marknadsstruktur", "Läroplanen — aktiemarknaden i praktiken, handelsplatsens roll"),
      ];
      const k = kallor[0];
      return {
        text:
          `OMX Stockholm 30 — OMXS30 — är börsens mest citerade svenskindex: trettio av de mest omsatta bolagen på Nasdaq Stockholm. Så byggs kurvan — mekaniken, inte några favoriter:\n\n1. URVALET — bolagen rankas efter handelsvolym och omsatt värde, med krav på fri omsättning (att aktierna verkligen cirkulerar) och tillräcklig listningstid. De trettio största enligt måtten tas in — urvalet mäter AKTIVITET, inte kvalitet.\n2. OMPRÖVNINGEN — med jämna mellanrum (halvårsvis, juni och december) granskas listan: bolag som glidit ur måtten byts ut, nya som vuxit in tas upp. Index är alltså en levande lista med regelverk, inte en fast klubb.\n3. VIKTERNA — bolagen vägs efter sitt (fritt omsatta) börsvärde enligt värdeviktningsmekaniken, med regelverk som sätter tak för hur tungt ett enskilt bolag får bli — konstruktionsdetaljer kursen går igenom.\n\nIndexet fungerar som marknadens barometer — en termometer visar värme, inte vad du ska göra åt den.` +
          kallradFler(kallor),
        amne: "omxs30",
        kalla: k,
        kallor,
        handlings: [
          { text: "Kursen: Index och passivt ägande", lank: "/kurser/am-02-index-och-passivt-agande", ikon: "📊", beskrivning: "OMX-indexen och deras regler" },
          { text: "Kursen: Marknadsstruktur", lank: "/kurser/am-04-marknadsstruktur", ikon: "🏗️", beskrivning: "Handelsplatsen bakom indexet" },
          { text: "Läsa aktiesidan", lank: "/kurser/am-03-lasa-aktiesidan", ikon: "🖥️", beskrivning: "Indexet på skärmen — talen bakom" },
          { text: "Vad är värdeviktning?", lank: "fragor:" + encodeURIComponent("vad är värdeviktning?"), ikon: "📏", beskrivning: "Viktsättet OMXS30 använder" },
        ],
        motfraga: { text: "Vad betyder likviktat?", kategori: "aktiemarknaden" },
        fordjupa: { text: k.titel, lank: "/kurser/am-02-index-och-passivt-agande" },
      };
    },
  },
  {
    id: "courtage",
    karnord: [
      "courtage", "courtagen", "courtageavgift", "courtageavgifter",
      "mäklaravgift", "mäklararvode",
    ],
    starkord: ["aktier", "handla", "kostnad", "kostar", "avgift", "pris"],
    bygga: (reg) => {
      const kallor = [
        kursKalla(reg, "am-01-likviditet-och-spread", "Läroplanen — aktiemarknaden i praktiken, handelns kostnadsposter"),
        kursKalla(reg, "am-04-marknadsstruktur", "Läroplanen — aktiemarknaden i praktiken, kostnadernas plats i kedjan"),
      ];
      const k = kallor[0];
      return {
        text:
          `Courtage är mäklarens avgift för att förmedla en aktieaffär — den synliga av handelns kostnader. Så hänger posterna ihop — ren kostnadsaritmetik, aldrig råd:\n\n1. DE TRE POSTERNA — en aktieaffär bär (a) courtage, (b) spreaden (den implicita kostnad som orderbokens avstånd skapar) och (c) för fonder deras egna avgifter. De två första syns olika: courtagen står på notan, spreaden gör det inte.\n2. PROCENTRÄKNINGEN — fasta avgifter väger tyngre ju mindre affären är. Räkneexempel: en affär på 1 000 kronor med 39 kronor i courtage bär 3,9 procent i avgift — innan spreaden räknats. Samma avgift på 100 000 kronor är 0,039 procent. Aritmetiken är mekanikens poäng; siffrorna är exempel, inte någon aktuell taxa.\n3. VARFÖR DET ÄR UTBILDNING — att förstå kostnadsposterna är att förstå vad som händer med ett belopp på vägen genom systemet — grundkunskapen kursen bygger vidare på. Vilka avgifter just du betalar hos vilka aktörer är en placérings- och valfråga vi aldrig yttrar oss om.` +
          kallradFler(kallor),
        amne: "courtage",
        kalla: k,
        kallor,
        handlings: [
          { text: "Kursen: Likviditet och spread", lank: "/kurser/am-01-likviditet-och-spread", ikon: "💧", beskrivning: "Handelns kostnadsposter samlade" },
          { text: "Kursen: Marknadsstruktur", lank: "/kurser/am-04-marknadsstruktur", ikon: "🏗️", beskrivning: "Kostnaderna i kedjan" },
          { text: "Läsa aktiesidan", lank: "/kurser/am-03-lasa-aktiesidan", ikon: "🖥️", beskrivning: "Vad notan på skärmen innehåller" },
          { text: "Vad är spread?", lank: "fragor:" + encodeURIComponent("vad är spread?"), ikon: "↔️", beskrivning: "Den osynliga delen av samma kostnad" },
        ],
        motfraga: { text: "Vad är skillnaden mellan marknadsord och limitord?", kategori: "aktiemarknaden" },
        fordjupa: { text: k.titel, lank: "/kurser/am-01-likviditet-och-spread" },
      };
    },
  },
];

// ── Huvudingången ──────────────────────────────────────────────────────────

/**
 * Svara lokalt med NÅGOT av de tio marknadsmekanik-mönstren — eller null
 * (då prövar widgeten nästa lager i kedjan). Samma matchningssemantik som
 * basmotorn: minst ett kärnord krävs, poäng = kärnord × 3 + stärkord,
 * oavgjort → först deklarerade mönstret vinner (strikt >, deterministiskt).
 * Samma fråga ⇒ bitidentiskt svar.
 */
export function svaraLokaltMarknadsmekanik(fraga: string, register: RegisterRad[]): LokaltSvar | null {
  const fragaStr = diafri(fraga);
  if (!fragaStr) return null;
  const fragaOrd = fragaStr.split(" ");
  let bast: { svar: LokaltSvar; poang: number } | null = null;
  for (const m of MARKNADSMEKANIK_MONSTER) {
    const karnTraff = m.karnord.filter((nk) => traff(fragaOrd, fragaStr, nk));
    if (karnTraff.length === 0) continue; // krav: minst ett kärnord
    const starkTraff = m.starkord?.filter((nk) => traff(fragaOrd, fragaStr, nk)) ?? [];
    const poang = karnTraff.length * 3 + starkTraff.length;
    if (!bast || poang > bast.poang) bast = { svar: m.bygga(register), poang };
  }
  return bast ? bast.svar : null;
}
