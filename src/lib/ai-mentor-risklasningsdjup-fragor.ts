/**
 * AI-MENTORN 2.0 — RISKLÄSNINGSDJUP-FÖRHANDSFRÅGOR (spår 6, omgång 14, s6-u3).
 *
 * Tre ytterligare källmärkta förhandsfrågor ovanpå de tjugofyra committade
 * lagren (basens MONSTER i ai-mentor-svar.ts + makro, extra, nästa,
 * kapitalmekanik, sektor, case, praktik, portfoljgrund, ägande,
 * redovisningsdjup, djup, historia, lonsamhetsdjup, tsdjup, skattedjup,
 * beteendedjup, riskdjup, riskmåttsdjup, utdelningsdjup, förväntningsdjup,
 * portfoljbalans, stabilitetsdjup, grahamgolv):
 *   1. Kundkoncentration (rs-02-kundkoncentration primär + rk-09-
 *      koncentrationsrisk + rs-03-dold-samvariation + rs-05-riskavsnittet)
 *      — när få kunder bär intäkterna: måttet, mekaniken, läsningen
 *   2. Riskmatrisen (rs-04-riskmatrisen primär + rs-03 + rs-05 + km-032-
 *      stresstesting) — sannolikhet × konsekvens: att kartlägga
 *      osäkerheten i kvadranter i stället för i adjektiv
 *   3. Riskavsnittet mellan raderna (rs-05 primär + rs-04 + rs-03 + rk-11-
 *      bedrageririsk) — att läsa bolagets EGEN riskredovisning: ordningen,
 *      förändringarna och bockningsmeningarnas tomrum
 *
 * ÄMNESVAL EFTER SOND (verktyg/_s6u3-sond-omg14.mjs: 25 motorer, 80
 * monsters, 843 kärnord LIVE-lästa med den riktiga matcharen): RISK är
 * registrets näst största helt otäckta kategori — sex kurser (rs-01–rs-05
 * + V19) där volatilitet ägs av basens risk-monster, dold samvariation av
 * portföljgrundens korrelationsfamilj och kapitalförbränning av basens
 * V19-monster; de tre läsningskurserna (rs-02, rs-04, rs-05) hade ALLA
 * NULL genom hela kedjan och INGA kärnordsgrannar inom tolerans
 * (närmaste: "riskhantering" (basen) på avstånd 5 till "riskmatris" —
 * utanför max 2). Sondens döda spår, bokförda: orderbok/likviditet/
 * spread/nätmäklare (basens aktiemarknads-monster), implicit volatilitet
 * som FRÅGA (basens "volatilitet" stjäl formuleringen — kursen blir bara
 * KÄLLA), optionsgreker med ordet "option" (nästa-lagrets familj),
 * beta/small cap (riskmåttsdjup), ränta på ränta (makro), SAM-viktning/
 * backtest (basen äger akm1/konfluens/vågfundament — kvarvarande familj
 * för tunn för ett eget lager).
 *
 * ANSVARSFÖRDELNING (syskonlagrens dokumentationsplikt; emission/V19-
 * precedensen — källägande ≠ kärnordsägande):
 *   • Basens risk-monster äger GRUNDORDEN: "risk", "risken", "risker",
 *     "riskhantering", "riskspridning" — "hur hanterar jag risk?" går
 *     till basen (kedjan prövar den först; sonden bevisar det). Detta
 *     lager bär därför ENDAST sammansatta familjeord basen saknar
 *     (kundkoncentration/koncentrationsrisk/kundberoende · riskmatris ·
 *     riskavsnitt/riskbeskrivning/riskredovisning/risklista).
 *   • Riskdjupet äger svart svan/skuldfällan (teorin), riskmåttsdjupet
 *     äger sharpe-kvoten (måtten), portföljgrundens monster äger
 *     korrelation/samvariation — rs-03-dold-samvariation och km-032 får
 *     därför ALDRIG bära "samvariation"- eller "stress"-kärnord här;
 *     kurserna är KÄLLOR och knappmål, inte kärnordsägande.
 *   • Stabilitetsdjupet äger känslighetsanalys/soliditetsgrad — därför
 *     länkar riskmatris-svarets fragor:-knapp medvetet dit (tidigare
 *     lager, aldrig eget).
 *
 * Matchningen speglar motorns hjälpfunktioner (samma lösning som alla
 * syskonlagren: Node type-stripping löser endast `import type`, så de
 * rena funktionerna speglas hit). Semantisk likhet med motorn BEVISAS av
 * testets felstavningfall (B) och determinismfall (C). Driftvarning:
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
 *     ?? svaraLokaltRedovisningsdjup(q, KURSREGISTER)
 *     ?? svaraLokaltDjup(q, KURSREGISTER)
 *     ?? svaraLokaltHistoria(q, KURSREGISTER)
 *     ?? svaraLokaltLonsamhetsdjup(q, KURSREGISTER)
 *     ?? svaraLokaltTsdjup(q, KURSREGISTER)
 *     ?? svaraLokaltSkattedjup(q, KURSREGISTER)
 *     ?? svaraLokaltBeteendedjup(q, KURSREGISTER)
 *     ?? svaraLokaltRiskdjup(q, KURSREGISTER)
 *     ?? svaraLokaltRiskmattsdjup(q, KURSREGISTER)
 *     ?? svaraLokaltUtdelningsdjup(q, KURSREGISTER)
 *     ?? svaraLokaltForvantningsdjup(q, KURSREGISTER)
 *     ?? svaraLokaltPortfoljbalans(q, KURSREGISTER)
 *     ?? svaraLokaltStabilitetsdjup(q, KURSREGISTER)
 *     ?? svaraLokaltGrahamgolv(q, KURSREGISTER)
 *     ?? svaraLokaltRisklasningsdjup(q, KURSREGISTER)
 * Detta lager levererades SIST och kan därför aldrig stjäla en fråga från
 * ett tidigare lager; det fångar bara frågor som alla lager före det
 * lämnar null på. Omvänt vaktar testfall I på att dessa frågor INTE
 * fångas av kedjan utan detta lager (dupliceringsskydd).
 *
 * ── JURIDIKGRINDEN (lagen 2007:528) ──────────────────────────────────
 * All text är pedagogisk utbildning om hur kundkoncentration, riskmatriser
 * och bolagets egen riskredovisning DEFINIERAS och LÄSES som metod — inga
 * köp-/säljsignaler, inga placeringstips, inga omdömen om enskilda bolag
 * eller värdepapper. Aritmetiken illustrerar mekaniken med påhittade tal,
 * aldrig utfästelser om avkastning.
 *
 * ── DEPENDENCY-INJECTION (samma mönster som hela motorn) ─────────────
 * Registret skickas IN som parameter (endast `import type`) så att
 * verktyg/testa-ai-mentor-risklasningsdjup.mjs kan köra filen direkt i
 * Node. Alla källkurser (rs-02-kundkoncentration, rs-03-dold-samvariation,
 * rs-04-riskmatrisen, rs-05-riskavsnittet-mellan-raderna,
 * rk-09-koncentrationsrisk, rk-11-bedrageririsk, km-032-stresstesting-
 * portfoljen) finns i KURSREGISTER (verifierat i 396-registret — spår 5:s
 * rebake lägger TILL kurser, slugarna består; kursKalla faller tillbaka på
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

// ── De 3 riskläsningsfrågorna ───────────────────────────────────────────────

export const RISKLÄSNINGSDJUP_MONSTER: FragMonster[] = [
  {
    id: "kundkoncentration",
    karnord: [
      "kundkoncentration", "kundkoncentrationen",
      "koncentrationsrisk", "koncentrationsrisken",
      "kundberoende", "kundberoendet",
      "storkundsberoende", "storkundsrisken",
    ],
    starkord: [
      "kund", "kunder", "intäkter", "omsättning",
      "risk", "koncentration", "segment", "not", "spridning",
    ],
    bygga: (reg) => {
      const rkAntal = reg.filter((r) => r.kategori === "RISKHANTERING").length;
      const kallor = [
        kursKalla(reg, "rs-02-kundkoncentration", "Läroplanen — RISK: när få kunder bär intäkterna"),
        kursKalla(reg, "rk-09-koncentrationsrisk", "Läroplanen — RISKHANTERING: koncentration som grundbegrepp"),
        kursKalla(reg, "rs-03-dold-samvariation", "Läroplanen — RISK: när bolagen delar samma risk"),
        kursKalla(reg, "rs-05-riskavsnittet-mellan-raderna", "Läroplanen — RISK: att läsa bolagets egen riskredovisning"),
      ];
      const k = kallor[0];
      const rs2 = reg.find((r) => r.slug === "rs-02-kundkoncentration");
      const rk9 = reg.find((r) => r.slug === "rk-09-koncentrationsrisk");
      return {
        text:
          `Kundkoncentration betyder att en liten grupp kunder bär en stor del av intäkterna — bolaget kan sälja till hundratals i teorin men äger i praktiken sin framtid hos tre eller fyra namngivna köpare. Det är en av de vanligaste riskerna att läsa i en årsredovisning, och en av de lättaste att underskatta (allt nedan är utbildning i hur måttet mäts och läses — ingen kommentar om något enskilt bolag):\n\n1️⃣ MÅTTET — andel av omsättningen per kund. Aritmetisk illustration med påhittade tal: omsättning 400 miljoner, kund A 140 (35 %), kund B 80 (20 %), övriga topp-5 80 (20 %) — de fem största kunderna bär 75 % av intäkterna, och EN kund bär mer än en tredjedel. Två kompletterande mått: antalet kunder som ensamma överstiger en tioprocentstrandel (ett tröskelvärde som i många regelverk kräver upplysning i not) och hur koncentrationen RÖR SIG — en andel som stiger år efter år är en annan läsning än en som faller.\n2️⃣ MEKANIKEN — varför koncentrationen kostar på två sätt. Direkt: försvinner den stora kunden försvinner marginalen med den (i illustrationen: −140 av 400 i intäkt — kvar finns en verksamhet dimensionerad för en annan volym). Indirekt, och löpande: en kund som vet att den är stor förhandlar — priset pressas, marginalerna urholkas innan någon kund lämnat. Koncentration är alltså inte bara en framtidsrisk utan en pågående marginalrisk — samma mekanik som marginpress-kurserna beskriver, men med köparen som motpart. Vändsidan är äkta: ett fåtal stora, nöjda kunder kan också vara ett bevis på att produkten gör nytta (moat-kursernas kundlojalitet) — läsningen avgörs av ANDRA tecken: bindande avtal, kundens egen bransch, alternativa leverantörer.\n3️⃣ LÄSNINGEN — var uppgifterna står: intäktsnoter och segmentinformation i redovisningen, kundantal i förvaltningsberättelsen, och — minst lika mycket — vad som SAKNAS: ett bolag som aldrig nämner kundkoncentration trots få namngivna kunder i kundlistan talar om risken mellan raderna — genom att inte nämna den. Dold samvariation tillhör samma läsning: flera små kunder som alla tjänar pengar på samma slutkonsument är koncentration i förklädnad.\n\nI kategorin riskhantering finns ${rkAntal} kurser — koncentrationsrisk-kursen (${rk9 ? rk9.minuter + " min, nybörjarnivå" : "i registret"}) lägger grundbegreppet och kundkoncentration-kursen (${rs2 ? rs2.minuter + " min" : "i registret"}) bygger läsningen på det. Som alltid: detta är utbildning i en metod — inga placeringstips.` +
          kallradFler(kallor),
        amne: "kundkoncentration",
        kalla: k,
        kallor,
        handlings: [
          { text: "Kursen: Kundkoncentration", lank: "/kurser/rs-02-kundkoncentration", ikon: "🎯", beskrivning: "När få kunder bär intäkterna" },
          { text: "Kursen: Koncentrationsrisk", lank: "/kurser/rk-09-koncentrationsrisk", ikon: "📊", beskrivning: "Grundbegreppet från grunden" },
          { text: "Kursen: Dold samvariation", lank: "/kurser/rs-03-dold-samvariation", ikon: "🧩", beskrivning: "Koncentration i förklädnad" },
          { text: "Kursen: Riskavsnittet mellan raderna", lank: "/kurser/rs-05-riskavsnittet-mellan-raderna", ikon: "📖", beskrivning: "Läs bolagets egen risklista" },
          { text: "Vad är diversifiering?", lank: "fragor:" + encodeURIComponent("vad är diversifiering?"), ikon: "🧺", beskrivning: "Riskspridning — portföljgrundens område" },
        ],
        motfraga: { text: "Vad är en riskmatris?", kategori: "risk" },
        fordjupa: { text: k.titel, lank: "/kurser/rs-02-kundkoncentration" },
      };
    },
  },
  {
    id: "riskmatris",
    karnord: [
      "riskmatris", "riskmatrisen", "riskmatriser", "riskmatriserna",
    ],
    starkord: [
      "sannolikhet", "konsekvens", "risk", "osäkerhet",
      "kartlägga", "kvadrant", "bolag", "årsredovisning",
    ],
    bygga: (reg) => {
      const riskAntal = reg.filter((r) => r.kategori === "RISK").length;
      const kallor = [
        kursKalla(reg, "rs-04-riskmatrisen", "Läroplanen — RISK: att kartlägga osäkerheten"),
        kursKalla(reg, "rs-05-riskavsnittet-mellan-raderna", "Läroplanen — RISK: bolagets egen riskredovisning som råmaterial"),
        kursKalla(reg, "rs-03-dold-samvariation", "Läroplanen — RISK: när bolagen delar samma risk"),
        kursKalla(reg, "km-032-stresstesting-portfoljen", "Läroplanen — riskmåttens praktik: att pröva kartan mot svåra scenarier"),
      ];
      const k = kallor[0];
      const rs4 = reg.find((r) => r.slug === "rs-04-riskmatrisen");
      return {
        text:
          `En riskmatris är utbildningens enklaste verktyg för att tvinga riskerna från adjektiv till koordinater: två axlar — SANNOLIKHET (hur troligt är utfallet?) och KONSEKVENS (hur stort blir det om det inträffar?) — och en ruta per risk. Metoden används både i bolags internstyrning och i analysarbete, och dess pedagogiska kraft ligger i vad den FÖRBIDRER: påståendet "risken är låg" utan tal (allt nedan är utbildning i metoden — ingen kommentar om något enskilt bolag):\n\n1️⃣ BYGGET — fyra kvadranter av två axlar. Aritmetisk illustration med påhittade tal: en risk med sannolikhet 20 % och konsekvens 150 miljoner ger ett förväntat värde på 0,20 × 150 = 30 miljoner — att jämföra med exempelvis en vinst på 60 miljoner, alltså hälften. Talet i sig är ingen prognos (sannolikheten är en uppskattning, inte en frekvens), men jämförelsen går att resonera kring: tvänger den inte fram en åtgärd flaggar den i varje fall en kvadrant. Kvadranternas klassiska läsning: låg/låg accepteras, hög/låg hanteras med rutiner, låg/hög övervakas (det är här svansriskernas teori bor — den lilla sannolikheten med den stora konsekvensen), hög/hög åtgärdas FÖRE allt annat.\n2️⃣ VARFÖR MATRISEN SLÅR LISTOR — en risklista i löpande text får tio risker att låta lika viktiga; en matris avslöjar att bolaget själv rangordnar: ordningen i årsredovisningens riskavsnitt, sidantal per risk, och om konsekvensbenämnt tal saknas helt. Samma övning på PORTFÖLJEN: att lägga innehavens risker (bolag som delar råvara, kund, valuta) i samma matris synliggör dold samvariation — två bolag som ser olika ut men ligger i samma ruta är inte spridning.\n3️⃣ GRÄNSERNA — matrisen rangordnar, den värderar inte. Konsekvensen måste mätas i något (intäkt, marginal, kassaflöde) för att rutorna ska bli jämförbara; annars är matrisen bara en lista i rutform. Och sannolikheter som sätts "efter känsla" ska läsas som just känsla — därför hör stresstestarbetet till samma familj: att pröva kartan mot uttalade scenarier (kostnaden +2 %, valutan −10 %, volymen −15 %) är känslighetsanalysens område och matrisens kontroll.\n\nI risk-kategorin finns ${riskAntal} kurser — riskmatris-kursen (${rs4 ? rs4.minuter + " min" : "i registret"}) går igenom kartläggningen steg för steg. Som alltid: detta är utbildning i en metod — inga placeringstips.` +
          kallradFler(kallor),
        amne: "riskmatris",
        kalla: k,
        kallor,
        handlings: [
          { text: "Kursen: Riskmatrisen", lank: "/kurser/rs-04-riskmatrisen", ikon: "🗺️", beskrivning: "Att kartlägga osäkerheten" },
          { text: "Kursen: Riskavsnittet mellan raderna", lank: "/kurser/rs-05-riskavsnittet-mellan-raderna", ikon: "📖", beskrivning: "Råmaterialet till matrisen" },
          { text: "Kursen: Dold samvariation", lank: "/kurser/rs-03-dold-samvariation", ikon: "🧩", beskrivning: "När bolagen delar samma risk" },
          { text: "Kursen: Stress-testing portföljen", lank: "/kurser/km-032-stresstesting-portfoljen", ikon: "🌡️", beskrivning: "Att pröva kartan mot scenarier" },
          { text: "Vad är känslighetsanalys?", lank: "fragor:" + encodeURIComponent("vad är känslighetsanalys?"), ikon: "🔬", beskrivning: "Siffrorna bakom rutorna — stabilitetsdjupet" },
        ],
        motfraga: { text: "Hur läser jag riskavsnittet?", kategori: "risk" },
        fordjupa: { text: k.titel, lank: "/kurser/rs-04-riskmatrisen" },
      };
    },
  },
  {
    id: "riskavsnitt",
    karnord: [
      "riskavsnitt", "riskavsnittet",
      "riskbeskrivning", "riskbeskrivningen",
      "riskredovisning", "riskredovisningen",
      "risklista", "risklistan",
    ],
    starkord: [
      "årsredovisning", "läsa", "läsning", "bolaget",
      "förvaltningsberättelse", "noter", "raderna", "mellan",
    ],
    bygga: (reg) => {
      const riskAntal = reg.filter((r) => r.kategori === "RISK").length;
      const kallor = [
        kursKalla(reg, "rs-05-riskavsnittet-mellan-raderna", "Läroplanen — RISK: att läsa bolagets egen riskredovisning"),
        kursKalla(reg, "rs-04-riskmatrisen", "Läroplanen — RISK: koordinater åt det som beskrivs"),
        kursKalla(reg, "rs-03-dold-samvariation", "Läroplanen — RISK: risken som delas utan att skrivas"),
        kursKalla(reg, "rk-11-bedrageririsk", "Läroplanen — RISKHANTERING: när presentationen och siffrorna skiljer sig åt"),
      ];
      const k = kallor[0];
      const rs5 = reg.find((r) => r.slug === "rs-05-riskavsnittet-mellan-raderna");
      return {
        text:
          `Riskavsnittet är den del av årsredovisningen där bolaget själv beskriver sina väsentliga risker — och därmed ett av de mest läsvärda styckena i hela redovisningen: ingen annanstans säger bolaget så mycket om vad det är rädd för. Konsten är att läsa det som ett DOKUMENT av en avsändare, inte som en lista av sanningar (allt nedan är utbildning i läsningen — ingen kommentar om något enskilt bolag):\n\n1️⃣ VAR DET LIGGER OCH VAD SOM STÅR DÄR — riskbeskrivningen återfinns i förvaltningsberättelsen och dess angränsande noter: risker per område (marknad, kredit, likviditet, verksamhet, juridik), ofta med en mening om hanteringen. ORDNINGEN är den första läsningen: det som bolaget listar först är det som prioriteras högst — jämför ordningen med vad SIFFRORNA i samma årsredovisning bär (en "mindre" kundkoncentration som ändå syns i intäktsnoten).\n2️⃣ DE FEM LÄSNINGSFRÅGORNA — (a) FÖRÄNDRINGEN: läs fjolårets avsnitt bredvid årets; en risk som bytts ut, lagts till eller omformulerats talar sitt eget språk — nya risker skrivs ofta EFTER att de slagit till, som en efterskrift. (b) STORLEKEN: vilket avsnitt har växt? (c) KOPPLINGEN: står det ett TAL nära risken (exponering, andel, belopp) eller bara ord? (d) BOCKNINGSMENINGARNA: formuleringar av typen "risker hanteras löpande inom ramen för den etablerade verksamheten" är tomrum — de säger att en process finns, inte vad som riskeras. (e) DET SOM SAKNAS: kundkoncentration som aldrig nämns, valuta som endast finns i en not — avsaknaden av ett ämne är en iakttagelse om vad bolaget ser (eller vill visa).\n3️⃣ MELLAN RADERNA — riskavsnittets mest lärorika läsning är skillnaden mellan PRESENTATIONEN och REDOVISNINGEN: när bilden i förvaltningsberättelsen och siffrorna i noterna skiljer sig åt (växande kundfordringar medan kreditrisken beskrivs som låg; goodwill som växer medan förvärvsrisken ligger kvar oförändrad år efter år) är det just det mönstret som kursen i bedrägeri-risk tränar — inte anklagelsen att något är fel, utan färdigheten att lägga två yttryck för samma verklighet bredvid varandra. Därav metoden: läs riskavsnittet MED resten av årsredovisningen, aldrig som ett fristående kapitel.\n\nI risk-kategorin finns ${riskAntal} kurser — riskavsnitt-kursen (${rs5 ? rs5.minuter + " min" : "i registret"}) går igenom läsningen av förvaltningsberättelsens mest underskattade sida. Som alltid: detta är utbildning i en metod — inga placeringstips.` +
          kallradFler(kallor),
        amne: "riskavsnitt",
        kalla: k,
        kallor,
        handlings: [
          { text: "Kursen: Riskavsnittet mellan raderna", lank: "/kurser/rs-05-riskavsnittet-mellan-raderna", ikon: "📖", beskrivning: "Bolagets egen riskredovisning, rad för rad" },
          { text: "Kursen: Riskmatrisen", lank: "/kurser/rs-04-riskmatrisen", ikon: "🗺️", beskrivning: "Ge det beskrivna koordinater" },
          { text: "Kursen: Bedrägeri-risk", lank: "/kurser/rk-11-bedrageririsk", ikon: "🕵️", beskrivning: "När presentation och siffror skiljer sig" },
          { text: "Kursen: Dold samvariation", lank: "/kurser/rs-03-dold-samvariation", ikon: "🧩", beskrivning: "Risken som delas utan att skrivas" },
          { text: "Hur läser jag en kvartalsrapport?", lank: "fragor:" + encodeURIComponent("hur läser jag en kvartalsrapport?"), ikon: "📰", beskrivning: "Rapportläsningens grund — bas-lagret" },
        ],
        motfraga: { text: "Vad är kundkoncentration?", kategori: "risk" },
        fordjupa: { text: k.titel, lank: "/kurser/rs-05-riskavsnittet-mellan-raderna" },
      };
    },
  },
];

// ── Huvudingången ──────────────────────────────────────────────────────────

/**
 * Svara lokalt med NÅGOT av de tre riskläsnings-mönstren — eller null
 * (då har hela kedjan före redan lämnat null och API-flödet tar över som
 * förr). Ligger SIST i widgetens kedja och kan därför aldrig stjäla en
 * fråga från tidigare lager. Samma matchningssemantik som basmotorn:
 * minst ett kärnord krävs, poäng = kärnord × 3 + stärkord, oavgjort →
 * först deklarerade mönstret vinner (strikt >, deterministiskt). Samma
 * fråga ⇒ bitidentiskt svar.
 */
export function svaraLokaltRisklasningsdjup(fraga: string, register: RegisterRad[]): LokaltSvar | null {
  const fragaStr = diafri(fraga);
  if (!fragaStr) return null;
  const fragaOrd = fragaStr.split(" ");
  let bast: { svar: LokaltSvar; poang: number } | null = null;
  for (const m of RISKLÄSNINGSDJUP_MONSTER) {
    const karnTraff = m.karnord.filter((nk) => traff(fragaOrd, fragaStr, nk));
    if (karnTraff.length === 0) continue; // krav: minst ett kärnord
    const starkTraff = m.starkord?.filter((nk) => traff(fragaOrd, fragaStr, nk)) ?? [];
    const poang = karnTraff.length * 3 + starkTraff.length;
    if (!bast || poang > bast.poang) bast = { svar: m.bygga(register), poang };
  }
  return bast ? bast.svar : null;
}
