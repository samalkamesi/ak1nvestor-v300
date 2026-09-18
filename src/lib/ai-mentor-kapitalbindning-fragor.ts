/**
 * AI-MENTORN 2.0 — KAPITALBINDNING-FÖRHANDSFRÅGOR (spår 6, omgång 16, s6-u3).
 *
 * Tre ytterligare källmärkta förhandsfrågor ovanpå de trettio committade
 * lagren (basens MONSTER i ai-mentor-svar.ts + makro, extra, nästa,
 * kapitalmekanik, sektor, case, praktik, portfoljgrund, ägande,
 * redovisningsdjup, djup, historia, lonsamhetsdjup, tsdjup, skattedjup,
 * beteendedjup, riskdjup, riskmåttsdjup, utdelningsdjup, förväntningsdjup,
 * portfoljbalans, stabilitetsdjup, grahamgolv, varderjustering, optionsdjup,
 * riskläsningsdjup, avkastningskurva, avrakningsdjup, värderingsverktyg):
 *   1. Rörelsekapital (ln-04 primär + bk-01 + bk-03 + km-003) —
 *      lönsamhetens andra halva: kapitalet som binds i lager och ford-
 *      ringar medan verksamheten snurrar
 *   2. Kassakonverteringscykeln/CCC (ln-04 primär + bk-03 + km-003 +
 *      bk-01) — dagarna mellan utbetald leverantör och inbetalande kund:
 *      DIO + DSO − DPO
 *   3. Lageromsättning (ln-04 primär + roic-02 + bk-01 + km-003) —
 *      varans vilotid i lagret: hastigheten i kronor och dagar (DIO)
 *
 * ÄMNESVAL EFTER SOND (verktyg/_s6sista-u3-sond.mjs, otrackad; 971 kärnord
 * LIVE-lästa ur 30 motorer med den riktiga matchern + registerunderlag):
 * rond 1 dödade kandidaterna RSI/MACD/candlesticks/stöd/motstånd/bollinger
 * (basens teknisk analys-monster), fritt kassaflöde (extra-lagret), FCFF/
 * FCFE-närmaste granne "fcf@extra", beta (riskmåttsdjup), kelly + drawdown
 * + volatilitet (basens risk-monster), likviditet/orderbok/spread (basens
 * aktiemarknaden), hävstång (basens kapitalstruktur), immateriella
 * (kapitalmekanik), förvärv (basens tillväxt), IPO-insider-aktiesplit-split
 * (tunn källbärning i registret: pe-03 + tx-01 endast). Rond 2 fann
 * friheten: rörelsekapital, arbetande kapital, kapitalbindning, working
 * capital, kassakonverteringscykel, kassacykel, ccc, dso, dpo,
 * lageromsättning, lageromsättningshastighet, dio — ALLA NULL genom hela
 * kedjan med INGA kärnordsgrannar inom tolerans 2. Registerbärningen är
 * spårets starkaste: ln-04-kapitalbindning-och-rorelsekapital ÄR familjens
 * dedikerade kurs (LÖNSAMHET), med bk-01/bk-03/km-003/roic-02 som källor.
 *
 * ANSVARSFÖRDELNING (syskonlagrens dokumentationsplikt; testfallen H/I
 * bevisar båda vägarna):
 *   • Extra-lagret äger GRUNDORDEN kassaflödesfamiljen: "vad är kassaflödes-
 *     analys?" och "vad är fritt kassaflöde?" går till extra (kedjebevisat i
 *     sonden). Detta lager bär därför ALDRIG kassaflödesord som kärnord —
 *     kassaflödeskurserna är här KÄLLOR och STARKORD. Källägande ≠ kärn-
 *     ordsägande.
 *   • Lonsamhetsdjupet äger DuPont/ROIC och (via roic-02-kursen) kapital-
 *     omsättningshastigheten som helhetsmått — detta lager äger lager-
 *     omsättningen (delmåttet) och båda texterna länkar dit som källa.
 *     Kärnorden "lageromsättning*" och "kapitalomsättningshastighet" är
 *     olika ord på avstånd > 2 (mekaniskt verifierat i sonden).
 *   • Redovisningsdjupet äger avskrivningar/leasing; lagervärderingsprincip-
 *     erna (FIFO med flera) nämns här endast som HÄNVISNING i text, aldrig
 *     kärnord.
 *   • Basen äger balansräkningen som helhet ("vad är en balansräkning?") —
 *     detta lager äger rörelsekapitalet (delposten) och länkar dit.
 *
 * DOKUMENTERAD RISK (accepterad, ncav↔nav-precedensen): förkortningarna
 * "ccc", "dso", "dpo" och "dio" är korta ord (exakt matchning i motorn,
 * ingen felstavningstolerans) — de kan aldrig stjäla ett längre kärnord,
 * och inget tidigare lager bär dem som kärnord (sond: 0 träffar i 971).
 * Omvänt kan "fcf"-frågor (extra-lagrets) ALDRIG stjälas av detta lager:
 * "fcf" fångas av extra FÖRE detta lager i kedjan (där kärnordet matchar
 * exakt); "fcff"/"fcfe" är medvetet INTE kärnord här (granne på avstånd 1
 * till extra:s "fcf" — samma bokföring som grahamgolv-lagrets J3-falla).
 *
 * Samma fingerade exempelbolag genom alla tre svaren (alla tal exakta och
 * maskinellt omräknade i regressionstestet): omsättning 219 Mkr/år (0,6
 * per dag), kostnad sålda varor 146 Mkr/år, kassa 5 + fordringar 21 +
 * lager 20 = omsättningstillgångar 46, leverantörsskulder 12 + övriga
 * kortfristiga 4 = 16, rörelsekapital 46 − 16 = 30 Mkr, DIO = 20 × 365 ÷
 * 146 = 50,0 dagar, DSO = 21 × 365 ÷ 219 = 35,0 dagar, DPO = 12 × 365 ÷
 * 146 = 30,0 dagar, CCC = 50 + 35 − 30 = 55 dagar.
 *
 * Matchningen speglar motorns hjälpfunktioner (samma lösning som alla
 * syskonlagren: Node type-stripping löser endast `import type`, så de rena
 * funktionerna speglas hit). Semantisk likhet med motorn BEVISAS av testets
 * felstavningfall (B) och determinismfall (C). Driftvarning: ändras motorns
 * matchning måste denna spegel följa — testfall B vaktar.
 *
 * SAMMANSÄTTNING (chat-widget.tsx) — detta lager levereras SIST (efter
 * värderingsverktyg) och kan därför aldrig stjäla en fråga från ett
 * tidigare lager; det fångar bara frågor som alla 30 lagen före det
 * lämnar null på. Omvänt vaktar testfall I på att dessa frågor INTE fångas
 * av kedjan utan detta lager (dupliceringsskydd).
 *
 * ── JURIDIKGRINDEN (lagen 2007:528) ──────────────────────────────────
 * All text är pedagogisk utbildning om hur rörelsekapital, kassakonverter-
 * ingscykel och lageromsättning DEFINIERAS och RÄKNAS som metod — inga
 * köp-/säljsignaler, inga placeringstips, inga omdömen om enskilda bolag
 * eller värdepapper. Aritmetiken illustrerar mekaniken med påhittade tal,
 * aldrig utfästelser om avkastning.
 *
 * ── DEPENDENCY-INJECTION (samma mönster som hela motorn) ─────────────
 * Registret skickas IN som parameter (endast `import type`) så att
 * verktyg/testa-ai-mentor-kapitalbindning.mjs kan köra filen direkt i
 * Node. Alla källkurser (ln-04-kapitalbindning-och-rorelsekapital,
 * bk-01-balansrakningen, bk-03-kassaflodesrakningen,
 * km-003-kassaflodesanalysen, roic-02-avkastningstrappan) finns i
 * KURSREGISTER (verifierat i 408-registret; kursKalla faller tillbaka på
 * "Läroplanen" om ett framtida register läcker en slug).
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

// ── De 3 kapitalbindningsfrågorna ───────────────────────────────────────────

export const KAPITALBINDNING_MONSTER: FragMonster[] = [
  {
    id: "rorelsekapital",
    karnord: [
      "rörelsekapital", "rörelsekapitalet", "rörelsekapitalbehov",
      "arbetande kapital", "working capital",
      "kapitalbindning", "kapitalbindningen", "kapitalbindningsgrad",
    ],
    starkord: [
      "omsättningstillgångar", "kortfristiga", "lager", "fordringar",
      "leverantörsskulder", "balansräkning", "kassa", "binda", "lönsamhet",
    ],
    bygga: (reg) => {
      const lnAntal = reg.filter((r) => r.kategori === "LÖNSAMHET").length;
      const bkAntal = reg.filter((r) => r.kategori === "BOKFÖRING & ÅRSREDOVISNING").length;
      const kallor = [
        kursKalla(reg, "ln-04-kapitalbindning-och-rorelsekapital", "Läroplanen — lönsamhetens andra halva: kapitalet som binds medan verksamheten snurrar"),
        kursKalla(reg, "bk-01-balansrakningen", "Läroplanen — balansräkningen: där omsättningstillgångarna och de kortfristiga skulderna bor"),
        kursKalla(reg, "bk-03-kassaflodesrakningen", "Läroplanen — pengarna som faktiskt rörde sig: bindningens spår i kassaflödet"),
        kursKalla(reg, "km-003-kassaflodesanalysen", "Läroplanen — kassaflödesanalysen steg för steg"),
      ];
      const k = kallor[0];
      const ln04 = reg.find((r) => r.slug === "ln-04-kapitalbindning-och-rorelsekapital");
      return {
        text:
          `Rörelsekapital — ibland kallat arbetande kapital eller working capital — är skillnaden mellan omsättningstillgångar och kortfristiga skulder: kapitalet som verksamheten behöver ha upplåst i sitt dagliga kretslopp, utöver det som sitter i maskiner och byggnader. Det är lönsamhetens andra halva: samma vinst kan vara värd olika mycket beroende på hur mycket kapital som måste bindas för att skapa den (allt nedan är utbildning i hur måttet beräknas och läses — ingen kommentar om något enskilt bolag):\n\n1️⃣ FORMELN — Rörelsekapital = omsättningstillgångar − kortfristiga skulder. Aritmetisk illustration med påhittade tal: lager 20 miljoner + kundfordringar 21 + kassa 5 ger omsättningstillgångar 46; leverantörsskulder 12 + övriga kortfristiga 4 ger 16. Rörelsekapital = 46 − 16 = 30 miljoner. Notera vad som räknas och inte: anläggningstillgångar (byggnader, maskiner, goodwill) står utanför — de äger kapitalmekanikens frågor — medan hela det löpande kretsloppet (varor på väg in, krediter på väg ut) står inom.\n2️⃣ LÄSNINGEN — varje krona i lager och fordringar är kapital som VÄNTAR på att arbeta. Bindningens pris går att räkna: 30 miljoner bundna mot ett avkastningskrav på 8 procent kostar 2,4 miljoner per år i alternativkostnad — pengar som hade kunnat arbetat någon annanstans. Därför växer värdet av samma resultatmarginal när bindningen krymper: två bolag med identisk vinst är inte identiska om det ena binder hälften så mycket kapital. Omvänd mekanik finns också: när kunder betalar snabbare än bolaget betalar sina leverantörer blir rörelsekapitalet negativt — då FRIGÖR tillväxt kapital i stället för att binda det, och skalning blir en finansieringskälla i sig (mekanismen, inte ett omdöme om någon bransch).\n3️⃣ GRÄNSERNA — rörelsekapitalet är en DAGSBILD från balansräkningen: säsongsbolag kan visa helt olika tal i januari och juli, så en engångsläsning kan vilseleda (jämför samma månad år för år). Och posterna är inte fria från bedömning: lagrets värde vilar på värderingsprinciper som hör till redovisningsdjupet, och osäkra fordringar kan visa sig mindre värda än de ser ut. Räkna därför rörelsekapitalet som ett STARTLÄGE för frågor — aldrig som ett färdigt omdöme. Nästa steg i spåret: kassakonverteringscykeln, som översätter bindningen till DAGAR.\n\nI lönsamhetsfamiljen finns ${lnAntal} kurser och i bokföringens och redovisningens ${bkAntal} — huvudkursen (${ln04 ? ln04.minuter + " min" : "i registret"}) äger hela kapitalbindningsämnet. Som alltid: detta är utbildning i en metod — inga placeringstips.` +
          kallradFler(kallor),
        amne: "rorelsekapital",
        kalla: k,
        kallor,
        handlings: [
          { text: "Kursen: Kapitalbindning & rörelsekapital", lank: "/kurser/ln-04-kapitalbindning-och-rorelsekapital", ikon: "🔗", beskrivning: "Lönsamhetens andra halva" },
          { text: "Kursen: Balansräkningen", lank: "/kurser/bk-01-balansrakningen", ikon: "🗺️", beskrivning: "Posternas karta" },
          { text: "Kursen: Kassaflödesräkningen", lank: "/kurser/bk-03-kassaflodesrakningen", ikon: "💧", beskrivning: "Pengarna som faktiskt rörde sig" },
          { text: "Kursen: Kassaflödesanalysen", lank: "/kurser/km-003-kassaflodesanalysen", ikon: "🔬", beskrivning: "Analysen steg för steg" },
          { text: "Vad är kassakonverteringscykeln?", lank: "fragor:" + encodeURIComponent("vad är kassakonverteringscykeln?"), ikon: "⏱️", beskrivning: "Bindningen i dagar — nästa svar" },
        ],
        motfraga: { text: "Vad är kassakonverteringscykeln?", kategori: "lönsamhet" },
        fordjupa: { text: k.titel, lank: "/kurser/ln-04-kapitalbindning-och-rorelsekapital" },
      };
    },
  },
  {
    id: "kassakonvertering",
    karnord: [
      "kassakonverteringscykeln", "kassakonverteringscykel", "kassakonvertering",
      "kassacykel", "kassacykeln",
      "ccc", "dso", "dpo",
    ],
    starkord: [
      "lager", "dagar", "fordringar", "leverantörsskulder", "kapital",
      "binda", "finansiering", "cykel", "omsättning",
    ],
    bygga: (reg) => {
      const lnAntal = reg.filter((r) => r.kategori === "LÖNSAMHET").length;
      const kallor = [
        kursKalla(reg, "ln-04-kapitalbindning-och-rorelsekapital", "Läroplanen — cykeln som översätter kapitalbindningen till dagar"),
        kursKalla(reg, "bk-03-kassaflodesrakningen", "Läroplanen — cykeln förklarar gapet mellan resultat och kassa"),
        kursKalla(reg, "km-003-kassaflodesanalysen", "Läroplanen — analysen av flödets tidsluckor"),
        kursKalla(reg, "bk-01-balansrakningen", "Läroplanen — posterna cykeln bygger på"),
      ];
      const k = kallor[0];
      const ln04 = reg.find((r) => r.slug === "ln-04-kapitalbindning-och-rorelsekapital");
      return {
        text:
          `Kassakonverteringscykeln — på engelska cash conversion cycle, CCC — är antalet dagar mellan det att bolaget betalar sina leverantörer och det att kunderna betalar bolaget: den tid som kapitalet är utlånat åt verksamheten. Tre delmått bygger cykeln (allt nedan är utbildning i hur måttet beräknas och läses — ingen kommentar om något enskilt bolag):\n\n1️⃣ FORMELN — CCC = DIO + DSO − DPO. DIO är lageromsättningsdagarna (varans vilotid i lagret), DSO är kundfordringarnas dagar (tid till betalning) och DPO är leverantörsskuldernas dagar (tiden innan bolaget själv måste betala). Aritmetisk illustration med påhittade tal, samma exempelbolag som i rörelsekapital-svaret: DIO = lager 20 miljoner ÷ kostnad sålda varor 146 miljoner × 365 = 50,0 dagar; DSO = fordringar 21 ÷ omsättning 219 × 365 = 35,0 dagar; DPO = leverantörsskulder 12 ÷ kostnad sålda varor 146 × 365 = 30,0 dagar. CCC = 50 + 35 − 30 = 55 dagar — i femtiofem dagar mellan utbetalning och inbetalning måste gapet finansieras av bundet kapital.\n2️⃣ RÄKNEÖVNINGEN I KÄNSLIGHET — omsättningen 219 miljoner per år motsvarar 0,6 miljoner per dag (219 ÷ 365). Krymp cykeln från 55 till 45 dagar — tio dagar — och ungefär 10 × 0,6 = 6 miljoner kapital frigörs (förenklad övning som räknar med omsättningsdagar; den exakta kursräkningen skiljer på KSV-baserade och omsättningsbaserade dagar). Det är cykelns kraft: förändringen sker utan en kronas skillnad i resultat — bara genom att pengarna återkommer snabbare.\n3️⃣ SPELRUMMET OCH DESS GRÄNSER — tre spakar förkortar cykeln: färre lagerdagar (DIO), snabbare indrivning av fordringar (DSO) och längre leverantörskrediter (DPO). Men varje spak har en backsida: lagret kan inte strypas i det oändliga utan att tomma hyllor kostar försäljning; hårda krav på kundernas betaltider kan prissättas i förlorade affärer; och utdragen betalning till leverantörer är en bärande relation att vårda, ingen fri bank. Tjänstebolag utan lager har DIO = 0 och cykeln blir skillnaden mellan två kredittider. Cykeln är därför ett BALANSMÅTT att läsa i sin bransch — inte ett tal att jaga mot noll.\n\nI lönsamhetsfamiljen finns ${lnAntal} kurser — huvudkursen (${ln04 ? ln04.minuter + " min" : "i registret"}) går igenom cykeln med räkneexempel. Som alltid: detta är utbildning i en metod — inga placeringstips.` +
          kallradFler(kallor),
        amne: "kassakonvertering",
        kalla: k,
        kallor,
        handlings: [
          { text: "Kursen: Kapitalbindning & rörelsekapital", lank: "/kurser/ln-04-kapitalbindning-och-rorelsekapital", ikon: "🔗", beskrivning: "Cykelns moderämne" },
          { text: "Kursen: Kassaflödesräkningen", lank: "/kurser/bk-03-kassaflodesrakningen", ikon: "💧", beskrivning: "Gapet mellan resultat och kassa" },
          { text: "Kursen: Kassaflödesanalysen", lank: "/kurser/km-003-kassaflodesanalysen", ikon: "🔬", beskrivning: "Flödets tidsluckor" },
          { text: "Kursen: Balansräkningen", lank: "/kurser/bk-01-balansrakningen", ikon: "🗺️", beskrivning: "Posterna cykeln bygger på" },
          { text: "Vad är lageromsättning?", lank: "fragor:" + encodeURIComponent("vad är lageromsättning?"), ikon: "📦", beskrivning: "Cykelns första del — DIO" },
        ],
        motfraga: { text: "Vad är lageromsättning?", kategori: "lönsamhet" },
        fordjupa: { text: k.titel, lank: "/kurser/ln-04-kapitalbindning-och-rorelsekapital" },
      };
    },
  },
  {
    id: "lageromsattning",
    karnord: [
      "lageromsättning", "lageromsättningen", "lageromsättningshastighet",
      "lageromsättningshastigheten", "lageromsättningsdagar", "dio",
    ],
    starkord: [
      "lager", "varor", "kostnad", "sålda", "dagar", "hastighet",
      "kapitalbindning", "balansräkning", "cykel",
    ],
    bygga: (reg) => {
      const lnAntal = reg.filter((r) => r.kategori === "LÖNSAMHET").length;
      const bkAntal = reg.filter((r) => r.kategori === "BOKFÖRING & ÅRSREDOVISNING").length;
      const kallor = [
        kursKalla(reg, "ln-04-kapitalbindning-och-rorelsekapital", "Läroplanen — lagret som kapitalbindare och dess dagar"),
        kursKalla(reg, "roic-02-avkastningstrappan", "Läroplanen — lageromsättningen som del av kapitalomsättningstrappan"),
        kursKalla(reg, "bk-01-balansrakningen", "Läroplanen — lagret bor i omsättningstillgångarna"),
        kursKalla(reg, "km-003-kassaflodesanalysen", "Läroplanen — lagrets rörelser i flödet"),
      ];
      const k = kallor[0];
      const ln04 = reg.find((r) => r.slug === "ln-04-kapitalbindning-och-rorelsekapital");
      return {
        text:
          `Lageromsättning — lageromsättningshastigheten — mäter hur många gånger per år lagret byts ut: hur länge en genomsnittlig vara VILAR i lagret innan den säljs. Det är kassakonverteringscykelns första del (DIO) och den mest konkreta kapitalbindaren: ett lager är pengar som ligger i form av varor (allt nedan är utbildning i hur måttet beräknas och läses — ingen kommentar om något enskilt bolag):\n\n1️⃣ FORMELN — Lageromsättningshastighet = kostnad sålda varor ÷ genomsnittligt lager, och DIO (dagarna) = 365 ÷ hastigheten. Aritmetisk illustration med påhittade tal: kostnad sålda varor 146 miljoner per år och lager 20 miljoner ger 146 ÷ 20 = 7,3 varv per år; DIO = 365 ÷ 7,3 = 50 dagar — exakt samma lagerdagar som i kassakonverteringscykel-svarets exempel, eftersom det är samma exempelbolag. Notera vilken täljare som används: kostnaden för sålda varor (inte omsättningen), eftersom lagret är värderat till inköpskostnad.\n2️⃣ LÄSNINGEN — DIO är en Vilotid: 50 dagar betyder att varje krona i lagret i snitt väntar femtio dagar på att bli en försäljning. Lägg hastigheten bredvid lönsamhetens övriga mått och den förgrenas: i ROIC:s värld är lageromsättningen en av delarna i kapitalomsättningshastigheten (avkastningstrappans kurva) — samma vinst på ett halverat lager ger högre avkastning på investerat kapital, utan att röra marginalen. Branschjämförelsen är allt: färskvaror hanteras i dagar, verkstadsdelar i månader — talet är ett SPÅR att följa över tid och mot sina branskollegor, aldrig en universell siffra.\n3️⃣ FÄLLORNA I BÅDA RIKTNINGARNA — ett VÄXANDE lager vid fallande försäljning är en klassisk varning: produktionen har inte hunnit anpassas till efterfrågan (piskmekaniken i långa leveranskedjor — order till leverantör förstärks uppåt och svänger hårdare nedåt). Nedskrivningar lurar i åldrande lager: utmodade varor redovisas ned mot nettorealisationsvärde, och vinsten som en gång bokfördes äts upp. Men spegelbilden finns: ett STÄNDIGT magert lager kan slå mot leveransförmågan när efterfrågan oväntat vänder, och plötsligt sjunkande lagerdagar kan ibland avslöja att bolaget rensar ut innan en nedskrivning. Lagret är med andra ord bolagets mest talande balanspost — läs dess KURVA, inte dess nivå.\n\nI lönsamhetsfamiljen finns ${lnAntal} kurser och i bokföringens och redovisningens ${bkAntal} — huvudkursen (${ln04 ? ln04.minuter + " min" : "i registret"}) äger lagerämnets kapitalbindningssida. Som alltid: detta är utbildning i en metod — inga placeringstips.` +
          kallradFler(kallor),
        amne: "lageromsattning",
        kalla: k,
        kallor,
        handlings: [
          { text: "Kursen: Kapitalbindning & rörelsekapital", lank: "/kurser/ln-04-kapitalbindning-och-rorelsekapital", ikon: "🔗", beskrivning: "Lagret som kapitalbindare" },
          { text: "Kursen: Avkastningstrappan (ROIC)", lank: "/kurser/roic-02-avkastningstrappan", ikon: "📶", beskrivning: "Lageromsättningens roll i ROIC" },
          { text: "Kursen: Balansräkningen", lank: "/kurser/bk-01-balansrakningen", ikon: "🗺️", beskrivning: "Lagrets hem i balansräkningen" },
          { text: "Kursen: Kassaflödesanalysen", lank: "/kurser/km-003-kassaflodesanalysen", ikon: "🔬", beskrivning: "Lagrets rörelser i flödet" },
          { text: "Vad är rörelsekapital?", lank: "fragor:" + encodeURIComponent("vad är rörelsekapital?"), ikon: "🔗", beskrivning: "Moderämnet — första svaret" },
        ],
        motfraga: { text: "Vad är rörelsekapital?", kategori: "lönsamhet" },
        fordjupa: { text: k.titel, lank: "/kurser/ln-04-kapitalbindning-och-rorelsekapital" },
      };
    },
  },
];

// ── Huvudingången ──────────────────────────────────────────────────────────

/**
 * Svara lokalt med NÅGOT av de tre kapitalbindnings-mönstren — eller null
 * (då har hela kedjan före redan lämnat null och API-flödet tar över som
 * förr). Ligger SIST i widgetens kedja och kan därför aldrig stjäla en
 * fråga från tidigare lager. Samma matchningssemantik som basmotorn:
 * minst ett kärnord krävs, poäng = kärnord × 3 + stärkord, oavgjort →
 * först deklarerade mönstret vinner (strikt >, deterministiskt). Samma
 * fråga ⇒ bitidentiskt svar.
 */
export function svaraLokaltKapitalbindning(fraga: string, register: RegisterRad[]): LokaltSvar | null {
  const fragaStr = diafri(fraga);
  if (!fragaStr) return null;
  const fragaOrd = fragaStr.split(" ");
  let bast: { svar: LokaltSvar; poang: number } | null = null;
  for (const m of KAPITALBINDNING_MONSTER) {
    const karnTraff = m.karnord.filter((nk) => traff(fragaOrd, fragaStr, nk));
    if (karnTraff.length === 0) continue; // krav: minst ett kärnord
    const starkTraff = m.starkord?.filter((nk) => traff(fragaOrd, fragaStr, nk)) ?? [];
    const poang = karnTraff.length * 3 + starkTraff.length;
    if (!bast || poang > bast.poang) bast = { svar: m.bygga(register), poang };
  }
  return bast ? bast.svar : null;
}
