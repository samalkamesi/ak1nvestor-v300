/**
 * AI-MENTORN 2.0 — VÄRDERINGSVERKTYG-FÖRHANDSFRÅGOR (spår 6, omgång 15, s6-u3).
 *
 * Tre ytterligare källmärkta förhandsfrågor ovanpå de tjugosju committade
 * lagren (basens MONSTER i ai-mentor-svar.ts + makro, extra, nästa,
 * kapitalmekanik, sektor, case, praktik, portfoljgrund, ägande,
 * redovisningsdjup, djup, historia, lonsamhetsdjup, tsdjup, skattedjup,
 * beteendedjup, riskdjup, riskmåttsdjup, utdelningsdjup, förväntningsdjup,
 * portföljbalans, stabilitetsdjup, grahamgolv, värderingsjustering,
 * optionsdjup, riskläsningsdjup):
 *   1. Scenarioanalysen (km-029-scenarioanalys primär + km-032-stresstesting-
 *      portfoljen + rs-04-riskmatrisen + vm-04-cyklisk-justering) — att
 *      värdera med tre utfall i stället för en punkt: intervall, sannolikheter
 *      och förväntat värde
 *   2. Utdelningsdiskonteringsmodellen (vm-06-dividend-discount-model-ddm
 *      primär + ud-09-utdelningens-hallbarhet + km-064-utdelningstillvaxt +
 *      vm-01-grahams-formel) — Gordons formel: dagens kronor diskonterade
 *      mot evighetstillväxten, och nämnarens makt
 *   3. PEG-ratio (km-027-pegratio primär + km-009-pe + km-007-dcf +
 *      tx-03-nar-skapar-tillvaxt-varde) — multipeln delad med tillväxten:
 *      samma P/E kan vara billig eller dyr beroende på nämnaren
 *
 * ÄMNESVAL EFTER SOND (verktyg/_s6u3-sond-omg15.mjs + två inlineronder:
 * 27 motorer, 86 monsters, 897 kärnord LIVE-lästa med den riktiga matchern):
 * VÄRDERINGSMETODER är registrets näst största kategori (21 kurser) men
 * flera av dess verktyg saknade alltjämt eget monstersvar: scenarioanalys,
 * DDM och PEG gick ALLA NULL genom hela kedjan och kärnordsfamiljerna
 * (scenarioanalys/scenarier · utdelningsdiskonteringsmodell/gordons
 * tillväxtmodell/ddm/gordon growth · peg ratio/peg/peg-kvoten) har INGA
 * kärnordsgrannar i tidigare lager inom tolerans (närmaste: "sektorsanalys"
 * (sektor) på avstånd 6 till "scenarioanalys"; "gratis" (bas) på avstånd 4
 * till "peg ratio" — fras-matchad, därtill kräver fras exakt inkludering).
 * Sondens döda spår, bokförda: moat/vallgrav (extra-lagret äger),
 * nätverkseffekter + patent + varumärke + ev/sales (basens variabel-monster),
 * katalysator-familjen (basen), tillväxt/p clash organisk-förvärvad (basen),
 * böcker/boktips/bokkanon (basens bok-monster), wacc (lönsamhetsdjupets
 * roic-monster, d=0), reverse dcf (nästa-lagret), price to cash flow
 * (extra-lagret), byteskostnader (fritt men extra äger moat-huvudfamiljen —
 * halvt lager lämnat), dividend discount model som FRÅGA (basens
 * "dividend"-ord stjäl formuleringen — kursen förblir KÄLLA, svarsord
 * svenska sammansättningar + "ddm").
 *
 * ANSVARSFÖRDELNING (syskonlagrens dokumentationsplikt; emission/V19-
 * precedensen — källägande ≠ kärnordsägande):
 *   • Basens utdelning-monster äger GRUNDORDEN: "utdelning", "utdelningar",
 *     "utdelningsaktie(r)", "direktavkastning", "dividend", "dividender",
 *     "payout ratio" — "hur värderar man utdelningsaktier?" går till basen
 *     (kedjan prövar den först; sonden bevisar det). Detta lager bär därför
 *     ENDAST sammansatta familjeord basen saknar (utdelningsdiskonterings-
 *     modell(-en) · utdelningsdiskontering(-en) · gordons tillväxtmodell(-en)
 *     · gordon growth · ddm).
 *   • Lönsamhetsdjupets roic-monster äger "wacc"/"kapitalkostnad" — DDM-
 *     svarets diskonteringsränta benämns därför "avkastningskrav" och
 *     länkar medvetet inte wacc-ordet; vm-01-grahams-formel är KÄLLA,
 *     inte kärnordsägande (grahamgolv-lagret äger graham-familjen).
 *   • Värderingsjusteringslagret äger normalisering/CAPE/SOTP — vm-04-
 *     cyklisk-justering är här KÄLLA (där deras normaliserings-monster bär
 *     den som källa 2; samma kurs får vara källa i flera lager —
 *     källägande är delat, kärnordsägande aldrig).
 *   • Riskläsningsdjupet äger riskmatris/riskavsnitt — rs-04-riskmatrisen
 *     är här KÄLLA och knappmål, inte kärnordsägande.
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
 *     ?? svaraLokaltVarderjustering(q, KURSREGISTER)
 *     ?? svaraLokaltOptionsdjup(q, KURSREGISTER)
 *     ?? svaraLokaltRisklasningsdjup(q, KURSREGISTER)
 *     ?? svaraLokaltVarderingsverktyg(q, KURSREGISTER)
 * Detta lager levererades SIST och kan därför aldrig stjäla en fråga från
 * ett tidigare lager; det fångar bara frågor som alla lager före det
 * lämnar null på. Omvänt vaktar testfall I på att dessa frågor INTE
 * fångas av kedjan utan detta lager (dupliceringsskydd).
 *
 * ── JURIDIKGRINDEN (lagen 2007:528) ──────────────────────────────────
 * All text är pedagogisk utbildning om hur scenarioanalys, DDM och PEG
 * DEFINIERAS och RÄKNAS som metod — inga köp-/säljsignaler, inga
 * placeringstips, inga omdömen om enskilda bolag eller värdepapper.
 * Aritmetiken illustrerar mekaniken med påhittade tal, aldrig utfästelser
 * om avkastning.
 *
 * ── DEPENDENCY-INJECTION (samma mönster som hela motorn) ─────────────
 * Registret skickas IN som parameter (endast `import type`) så att
 * verktyg/testa-ai-mentor-varderingsverktyg.mjs kan köra filen direkt i
 * Node. Alla källkurser (km-029-scenarioanalys, km-032-stresstesting-
 * portfoljen, rs-04-riskmatrisen, vm-04-cyklisk-justering, vm-06-dividend-
 * discount-model-ddm, ud-09-utdelningens-hallbarhet, km-064-utdelningstillvaxt,
 * vm-01-grahams-formel, km-027-pegratio, km-009-pe, km-007-dcf,
 * tx-03-nar-skapar-tillvaxt-varde) finns i KURSREGISTER (verifierat mot
 * 402-registret — spår 5:s rebake lägger TILL kurser, slugarna består;
 * kursKalla faller tillbaka på "Läroplanen" om ett framtida register läcker
 * en slug).
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

// ── De 3 värderingsverktygsfrågorna ─────────────────────────────────────────

export const VARDERINGSVERKTYG_MONSTER: FragMonster[] = [
  {
    id: "scenarioanalys",
    karnord: [
      "scenarioanalys", "scenarioanalysen",
      "scenarieanalys", "scenarieanalysen",
      "scenarier", "scenarierna",
      "scenariokalkyl", "scenariokalkylen",
    ],
    starkord: [
      "värdera", "värdering", "kassaflöde", "utfall",
      "sannolikhet", "osäkerhet", "prognos", "nedside", "uppsida",
    ],
    bygga: (reg) => {
      const vmAntal = reg.filter((r) => r.kategori === "VÄRDERINGSMETODER").length;
      const kallor = [
        kursKalla(reg, "km-029-scenarioanalys", "Läroplanen — värderingsmetoder: att värdera med utfall i stället för en punkt"),
        kursKalla(reg, "km-032-stresstesting-portfoljen", "Läroplanen — att pröva portföljen mot svåra scenarier"),
        kursKalla(reg, "rs-04-riskmatrisen", "Läroplanen — RISK: koordinater åt osäkerheten"),
        kursKalla(reg, "vm-04-cyklisk-justering", "Läroplanen — normalåren bakom multiplicerna"),
      ];
      const k = kallor[0];
      const km29 = reg.find((r) => r.slug === "km-029-scenarioanalys");
      return {
        text:
          `En scenarioanalys ersätter värderingens ENA tal med en famn av tal: i stället för att gissa ett framtida kassaflöde räknar du på tre (eller fler) utfall — ett nedsidescenario, ett basscenario och ett uppsidescenario — och väger samman dem med sannolikheter. Metoden ändrar inte osäkerheten; den synliggör den (allt nedan är utbildning i metoden med påhittade tal — ingen kommentar om något enskilt bolag):\n\n1️⃣ BYGGET — tre utfall, tre vikter, ett förväntat värde. Aritmetisk illustration med påhittade tal för ett tänkt bolag: fritt kassaflöde vid nedsidan 70 miljoner kronor (sannolikhet 30 procent), basfallet 100 miljoner (50 procent), uppsidan 130 miljoner (20 procent). Det förväntade värdet blir 0,30 × 70 + 0,50 × 100 + 0,20 × 130 = 21 + 50 + 26 = 97 miljoner. Notera skillnaden mot punktskattningen: den som bara räknar basfallet får 100 — de tre miljonerna är osäkerhetens pris, och de FANNS inte i punkttaket.\n2️⃣ KÄNSLIGHETEN — vad omfördelningen kostar. Samma utfall, nya vikter: om nedsidans sannolikhet dubblas till 60 procent på basfallets bekostnad (60/20/20) blir det förväntade värdet 0,60 × 70 + 0,20 × 100 + 0,20 × 130 = 42 + 20 + 26 = 88 miljoner — nio miljoner lägre av en OMORDNING, utan att något utfall ändrats. Det är scenarioanalysens kärnfynd: värdet sitter lika mycket i SANNOLIKHETERNA som i utfallen, och sannolikheter som sätts efter känsla ska läsas som just känsla (riskmatrisens varning gäller här med). Scenarierna ska också ha NAMN och ORSAKER — "kontraktet försvinner", "räntan stiger" — annars är det bara tre tal i kosmetisk ordning.\n3️⃣ GRÄNSERNA OCH GRANNARNA — scenarioanalysen rangordnar osäkerhet, den värderar inte den: konsekvenserna måste mätas i samma enhet (kassaflöde, vinst) för att kunna vägas, och vikterna ska prövas BÅDA vägarna (vad krävs för att nedsidan ska bli bas?). Släktingarna kompletterar: stresstestet fryser vikterna och vrider utfallen, riskmatrisen kartlägger risken utan tal, den cykliska justeringen hanterar att även "normalåret" är ett val. Tillsammans blir de en helhet som ingen enskilt äger.\n\nI kategorin värderingsmetoder finns ${vmAntal} kurser — scenarioanalys-kursen (${km29 ? km29.minuter + " min" : "i registret"}) går igenom bygget steg för steg. Som alltid: detta är utbildning i en metod — inga placeringstips.` +
          kallradFler(kallor),
        amne: "scenarioanalys",
        kalla: k,
        kallor,
        handlings: [
          { text: "Kursen: Scenario-analys", lank: "/kurser/km-029-scenarioanalys", ikon: "🎭", beskrivning: "Tre utfall i stället för en punkt" },
          { text: "Kursen: Stress-testing portföljen", lank: "/kurser/km-032-stresstesting-portfoljen", ikon: "🌡️", beskrivning: "Att frysa vikterna och vrida utfallen" },
          { text: "Kursen: Riskmatrisen", lank: "/kurser/rs-04-riskmatrisen", ikon: "🗺️", beskrivning: "Koordinater åt osäkerheten" },
          { text: "Kursen: Cyklisk justering", lank: "/kurser/vm-04-cyklisk-justering", ikon: "📊", beskrivning: "Valet av normalår" },
          { text: "Vad är känslighetsanalys?", lank: "fragor:" + encodeURIComponent("vad är känslighetsanalys?"), ikon: "🔬", beskrivning: "Siffrorna bakom vikterna — stabilitetsdjupet" },
        ],
        motfraga: { text: "Vad är en riskmatris?", kategori: "risk" },
        fordjupa: { text: k.titel, lank: "/kurser/km-029-scenarioanalys" },
      };
    },
  },
  {
    id: "ddm",
    karnord: [
      "utdelningsdiskonteringsmodellen", "utdelningsdiskonteringsmodell",
      "utdelningsdiskontering", "utdelningsdiskonteringen",
      "gordons tillväxtmodell", "gordons tillväxtmodellen",
      "gordon growth", "ddm",
    ],
    starkord: [
      "utdelning", "diskontera", "avkastningskrav",
      "tillväxt", "värdera", "kronor", "ränta", "evighet",
    ],
    bygga: (reg) => {
      const vmAntal = reg.filter((r) => r.kategori === "VÄRDERINGSMETODER").length;
      const kallor = [
        kursKalla(reg, "vm-06-dividend-discount-model-ddm", "Läroplanen — värderingsmetoder: dagens utdelning diskonterad till ett pris"),
        kursKalla(reg, "ud-09-utdelningens-hallbarhet", "Läroplanen — utdelningsstrategi: att stressa kronorna bakom utdelningen"),
        kursKalla(reg, "km-064-utdelningstillvaxt", "Läroplanen — utdelningstillväxtens roll i modellen"),
        kursKalla(reg, "vm-01-grahams-formel", "Läroplanen — Grahams formel som släkting"),
      ];
      const k = kallor[0];
      const vm6 = reg.find((r) => r.slug === "vm-06-dividend-discount-model-ddm");
      const ud9 = reg.find((r) => r.slug === "ud-09-utdelningens-hallbarhet");
      return {
        text:
          `Utdelningsdiskonteringsmodellen (DDM) värderar en aktie som summan av ALLA framtida utdelningar, omräknade till dagens värde — och dess vanligaste skepnad, Gordons tillväxtmodell, pressar hela den idén till en enda bråkdel: värdet är nästa års utdelning delat med skillnaden mellan avkastningskrav och utdelningstillväxt. Enklast av alla modeller — och därför den som tydligast visar både värderingens kraft och dess fallgropar (allt nedan är utbildning i metoden med påhittade tal — ingen kommentar om något enskilt bolag):\n\n1️⃣ FORMEN — V = D₁ ÷ (r − g). Aritmetisk illustration med påhittade tal: nästa års utdelning 4,00 kronor per aktie, avkastningskrav 8 procent, förväntad evighetstillväxt 2 procent → värdet 4,00 ÷ (0,08 − 0,02) = 4,00 ÷ 0,06 ≈ 66,67 kronor. Tre tal in, ett pris ut — men varje tal är en hypothesis klädd som siffra: utdelningen ska vara HOLDBAR (kurserna om utdelningens hållbarhet stressar kronorna bakom den), avkastningskravet är DITT (lönsamhetsdjupets kapitalkostnapsområde, ej ett marknadens faktum) och tillväxten är en evighetsantagande.\n2️⃣ NÄMNARENS MAKT — modellens känslighet bor i subtraktionen. Spegelparet med samma 4,00 kronor: höj avkastningskravet en procentenhet (9 procent) → 4,00 ÷ 0,07 ≈ 57,14 kronor (minus 14 procent); höj i stället tillväxten en procentenhet (3 procent) → 4,00 ÷ 0,05 = 80,00 kronor (plus 20 procent). EN procentenhet i nämnaren flyttar värdet med en sjundedel eller en femtedel — därför är DDM-kalibreringen övning i nämnarens hygien: små ändringar i (r − g) är stora ändringar i priset, och den som inte förstår det förstår inte sitt eget svar. (Även denna modells avkastningskrav har sitt hem i lönsamhetsdjupets kapitalkostnapsområde — den exakta termen där ägs av det lagret.)\n3️⃣ GRÄNSERNA — modellen passar mogna bolag med stabil, principiell utdelning (där "evighet" är en rimlig approximation); för tillväxtbolag som återinvesterar allt, för bolag med negativ eller våldsam utdelningstillväxt, och inte minst när g närmar sig r (nämnaren går mot noll och värdet mot oändligheten — modellen EXPLODERAR formellt) är DDM fel verktyg: då är DCF-kursernas kassaflödesvärdering eller Grahams formel rätt grann. Fallenheterna: att stoppa dagens högkonjunktursutdelning i formeln som vore den evig (hållbarhetskontrollen först), och att jämföra DDM-värden med olika (r − g) som vore de samma valuta.\n\nI kategorin värderingsmetoder finns ${vmAntal} kurser — DDM-kursen (${vm6 ? vm6.minuter + " min" : "i registret"}) bygger modellen från grunden, och utdelningens hållbarhet (${ud9 ? ud9.minuter + " min" : "i registret"}) prövar det tal som stoppas in. Som alltid: detta är utbildning i en metod — inga placeringstips.` +
          kallradFler(kallor),
        amne: "ddm",
        kalla: k,
        kallor,
        handlings: [
          { text: "Kursen: Dividend Discount Model", lank: "/kurser/vm-06-dividend-discount-model-ddm", ikon: "💰", beskrivning: "Gordons formel från grunden" },
          { text: "Kursen: Utdelningens hållbarhet", lank: "/kurser/ud-09-utdelningens-hallbarhet", ikon: "🧪", beskrivning: "Stressa kronorna bakom utdelningen" },
          { text: "Kursen: Utdelningstillväxt", lank: "/kurser/km-064-utdelningstillvaxt", ikon: "📈", beskrivning: "Nämnarens andra tal" },
          { text: "Kursen: Grahams formel", lank: "/kurser/vm-01-grahams-formel", ikon: "🧮", beskrivning: "Släktingen med vinst i täljaren" },
          { text: "Vad är utdelningsfällor?", lank: "fragor:" + encodeURIComponent("vad är utdelningsfällor?"), ikon: "🪤", beskrivning: "När utdelningen bär på faror — utdelningsdjupet" },
        ],
        motfraga: { text: "Hur räknar man ut PEG?", kategori: "värdering" },
        fordjupa: { text: k.titel, lank: "/kurser/vm-06-dividend-discount-model-ddm" },
      };
    },
  },
  {
    id: "pegratio",
    karnord: [
      "peg ratio", "pegratio", "peg", "peg-kvoten", "peg-kvot", "pegkvot", "pegkvoten",
    ],
    starkord: [
      "multipel", "tillväxt", "vinst", "vinsttillväxt",
      "pris", "jämföra", "billig", "dyr", "tumregel",
    ],
    bygga: (reg) => {
      const vmAntal = reg.filter((r) => r.kategori === "VÄRDERINGSMETODER").length;
      const kallor = [
        kursKalla(reg, "km-027-pegratio", "Läroplanen — värderingsmetoder: multipeln delad med tillväxten"),
        kursKalla(reg, "km-009-pe", "Läroplanen — P/E-grunden som PEG bygger på"),
        kursKalla(reg, "km-007-dcf", "Läroplanen — kassaflödenas moder: DCF"),
        kursKalla(reg, "tx-03-nar-skapar-tillvaxt-varde", "Läroplanen — TILLVÄXT: återinvesteringens matematik"),
      ];
      const k = kallor[0];
      const km27 = reg.find((r) => r.slug === "km-027-pegratio");
      return {
        text:
          `PEG-ratio (pris/vinst delat med vinsttillväxt) är multipeln som försöker göra det omöjliga: jämföra bolag med OLIKA tillväxt som vore de lika. Formeln: PEG = (P/E) ÷ vinsttillväxten i procent — och hela dess pedagogiska kraft ligger i att den sätter en NÄMNARE på multipeln (allt nedan är utbildning i metoden med påhittade tal — ingen kommentar om något enskilt bolag):\n\n1️⃣ RÄKNINGEN — samma P/E, tre olika PEG. Aritmetisk illustration med påhittade tal: pris 120 kronor, vinst 6,00 kronor per aktie → P/E = 120 ÷ 6,00 = 20. Med förväntad långsiktig vinsttillväxt 10 procent per år: PEG = 20 ÷ 10 = 2,0. Med 20 procents tillväxt: PEG = 20 ÷ 20 = 1,0. Med 5 procent: PEG = 20 ÷ 5 = 4,0. Spegelparets läsning: IDENTISKT pris, IDENTISK vinst, IDENTISK multipel — och ändå allt från "rimlig" till "dyr" enbart beroende på nämnaren. Multipeln utan tillväxtens tal är ofullständig information; PEG är det enklaste sättet att bära med sig det.\n2️⃣ TUMREGLER OCH DERAS BAKSIDOR — den klassiska läsningen (från tillväxtinvesterare som Peter Lynch) är att PEG under 1,0 tyder på att tillväxten inte är fullt prissatt och PEG över 2,0 att multipeln sprungit ifrån fundamentet. Men tumregeln vilar på antaganden den inte visar: tillväxten ska vara LÅNGSIKTIG (tre till fem år, inte ett enskilt toppår — en pandemibolus i vinsten ger nonsens-tal), den ska vara bibehållen i jämförelsen (PEG 1,0 med 20 procents tillväxt är ett annat villkor än PEG 1,0 med 8), och höga tillväxttal tenderar att ÅTERGÅ till medelvärdet — nämnaren som inte håller, deflaterar inte talet, den gör det FALSKT. PEG på bolag utan vinst (förlorare, cykliskt deppade) är meningslöst: divisionen kräver en positiv multipel att dela.\n3️⃣ PLATSEN I VERKTYGSLÅDAN — PEG är en KOMPLETTERING till P/E, inte en ersättare: den svarar på "dyr med hänsyn till tillväxt?" men säger inget om balansräkning, kassaflöde eller kapitalåtergång — där tar DCF-grannen och återinvesteringens matematik över (tillväxt som kräver ständig nyemission skapar inte värde trots snygg PEG). Bäst använd: som ett första sorteringsmått bland bolag man redan förstår, med nämnarens historia upprättad — aldrig som ett enskilt tal med köpslutsats som enda innehåll (utbildningsdoktrinen delar den slutsatsen).\n\nI kategorin värderingsmetoder finns ${vmAntal} kurser — PEG-kursen (${km27 ? km27.minuter + " min" : "i registret"}) går igenom både formeln och fällorna. Som alltid: detta är utbildning i en metod — inga placeringstips.` +
          kallradFler(kallor),
        amne: "pegratio",
        kalla: k,
        kallor,
        handlings: [
          { text: "Kursen: PEG-ratio", lank: "/kurser/km-027-pegratio", ikon: "⚖️", beskrivning: "Multipeln delad med tillväxten" },
          { text: "Kursen: P/E — djupdykning", lank: "/kurser/km-009-pe", ikon: "🔍", beskrivning: "Grunden som PEG bygger på" },
          { text: "Kursen: DCF", lank: "/kurser/km-007-dcf", ikon: "🌊", beskrivning: "Kassaflödenas värdering" },
          { text: "Kursen: När skapar tillväxt värde?", lank: "/kurser/tx-03-nar-skapar-tillvaxt-varde", ikon: "🌱", beskrivning: "Återinvesteringens matematik" },
          { text: "Vad är en värderingsmultipel?", lank: "fragor:" + encodeURIComponent("vad är en värderingsmultipel?"), ikon: "📐", beskrivning: "Multiplens anatomi — djup-lagret" },
        ],
        motfraga: { text: "Vad är scenarioanalys?", kategori: "värdering" },
        fordjupa: { text: k.titel, lank: "/kurser/km-027-pegratio" },
      };
    },
  },
];

// ── Huvudingången ──────────────────────────────────────────────────────────

/**
 * Svara lokalt med NÅGOT av de tre värderingsverktygs-mönstren — eller null
 * (då har hela kedjan före redan lämnat null och API-flödet tar över som
 * förr). Ligger SIST i widgetens kedja och kan därför aldrig stjäla en
 * fråga från tidigare lager. Samma matchningssemantik som basmotorn:
 * minst ett kärnord krävs, poäng = kärnord × 3 + stärkord, oavgjort →
 * först deklarerade mönstret vinner (strikt >, deterministiskt). Samma
 * fråga ⇒ bitidentiskt svar.
 */
export function svaraLokaltVarderingsverktyg(fraga: string, register: RegisterRad[]): LokaltSvar | null {
  const fragaStr = diafri(fraga);
  if (!fragaStr) return null;
  const fragaOrd = fragaStr.split(" ");
  let bast: { svar: LokaltSvar; poang: number } | null = null;
  for (const m of VARDERINGSVERKTYG_MONSTER) {
    const karnTraff = m.karnord.filter((nk) => traff(fragaOrd, fragaStr, nk));
    if (karnTraff.length === 0) continue; // krav: minst ett kärnord
    const starkTraff = m.starkord?.filter((nk) => traff(fragaOrd, fragaStr, nk)) ?? [];
    const poang = karnTraff.length * 3 + starkTraff.length;
    if (!bast || poang > bast.poang) bast = { svar: m.bygga(register), poang };
  }
  return bast ? bast.svar : null;
}
