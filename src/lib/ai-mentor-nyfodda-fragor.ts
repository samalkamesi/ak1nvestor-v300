/**
 * AI-MENTORN 2.0 — NYFÖDDA-KURSERS FÖRHANDSFRÅGOR (s6-u3, fönster 33 i spår 6,
 * manifest auto-s6-1789999525797, byggare 3/3).
 *
 * TRE källmärkta monsters som var och en aktiverar en av registrets tre
 * nyaste kurser (spår 5:s omgång 486→489, alla födda mentorväglösa —
 * rs-09-precedensen: nyfödd kurs aktiveras) och stänger sin kategori fullt:
 *   · KOMPETENSPARADOXEN ("vad är kompetensparadoxen?" — Kahnemans
 *     rådgivarkorrelationer, giltighetsmiljöerna, Mauboussins paradox,
 *     slantturneringen) bf-18 KOMPETENSILLUSIONEN primär — BETEENDEFINANS
 *     23/24 → 24/24 FULLT MENTORLÄNKAD.
 *   · KREDITDERIVATET ("vad är ett kreditderivat?" — kontraktet, spridens
 *     ekvation, säljarens stol, naken CDS, statskrediten) od-10
 *     KREDITDERIVATET primär — OPTIONS & DERIVAT 13/14 → 14/14 FULLT
 *     MENTORLÄNKAD.
 *   · AVKNOPPNINGEN ("vad är en avknoppning?" — beslutet, pro rata och
 *     when-issued, tvångsförsäljningens fönster, de första hundra dagarna)
 *     kt-10 AVKNOPPNINGEN primär — KATALYSATOR 12/13 → 13/13 FULLT
 *     MENTORLÄNKAD.
 *
 * ÄMNESVAL EFTER SOND (dokumenterad kedja, verktyg/_s6u3o33-sond-karnord.mjs
 * + _s6u3-sond-lagerluckor.mjs, 2026-09-21):
 *   • Lagerlucksonden: 111 mentorväglösa kurser; bland dem de tre nyaste
 *     (bf-18, od-10, kt-10 — samtliga födda 2026-09-21 i spår 5:s omgång
 *     486→489) som var och en lämnar sin kategori öppen. Tre monsters ⇒
 *     tre kategoristängningar (fönster-32-precedensen: nyfödda kurser
 *     aktiveras enligt rs-09).
 *   • Kärnordsdisjunktion: rond 3 mot 4 104 kärnord i 76 lager = 0 exakta
 *     kollisioner för de slutliga listorna; skuggningsprober genom hela den
 *     levande kedjan (77 motorer / 204 monsters vid sondtillfället) = NULL
 *     för varje kanonisk fråga nedan.
 *
 * DOKUMENTERADE GRÄNSER (etablerade lagers ägande — bärs i TEXT och i
 * modultestets G-fall; kärnorden lämnas åt sina ägare):
 *   • naket «kompetensillusion»/«kompetensillusionen» → overmod-monstret
 *     (beteendemekanik, km-036:s böjningsfamilj) — kursens TITELBEGREPP
 *     förblir deras; detta monster äger paradoxen, turneringen, miljöerna,
 *     korrelationerna och smittan (kursens övriga begreppsfamilj).
 *   • «kreditspread»/«kreditsprid» → kreditdjup-lagret (ma-05 kreditpremien
 *     äger spreadens NIVÅ som pris på kredit; här ägs det enskilda namnets
 *     KONTRAKT och ekvationen sprid ÷ förlustandel — kursens egen gräns,
 *     kap 2).
 *   • naket «spread»/«spreaden» → basen/marknadsmekaniken; «swap» →
 *     handelsdagens vwap (tavstånd 1 fångar ordet); «pro rata» med
 *     mellanslag → makrons ränta (diafri «rata»~«ranta», tavstånd 1) — här
 *     bärs sammanskrivna «prorata» och andels-omskrivningar.
 *   • «återvinning VID KONKURS» → överlevnadsdjupets konkursfamilj; ordet
 *     «återvinning» utan konkurs är CDS-kontraktets eget (utbetalnings-
 *     grunden) och bärs här.
 *   • «utdelning i natur» → basens utdelningsfamilj (mekaniken härleds som
 *     «utdelning i naturaska»-fri text: andelarna delas ut, inga pengar).
 *   • «konglomeratrabatt(en)» → varderjusteringen (vr-09); «tvångs-
 *     försäljning» → tvångsmekaniken; «summametod»-hantverket → km-012;
 *     indexflödenas mekanik → am-07; budets dramaturgi → kt-09;
 *     «glidning» → nya territorierna; seriepsykologin → bf-16; övermodet
 *     som KÄNsla → km-036; dunning-kruger → bf-10; prövningens teknik →
 *     ek-04; de riskjusterade måttens beräkning → km-016; samvariationens
 *     teori → rs-03; kontrahentkedjan 2008 → rk-16; basis-arbitraget →
 *     bf-13; kreditbetygen → ks-05; personalrisken → rs-09.
 *
 * Aritmetiken i svaren (kursernas EGNA modelltal med tydligt påhittade verk
 * — Kahnemans rådgivare, stiftelsen Svea, Norrvik Skog, Östersjö Capital,
 * Modrik, Nordhamn — maskinellt omräknade i regressionstestets D-fall):
 *   · Kompetens: 25 × 24 ÷ 2 = 300 parvisa · 25 × 8 = 200 årsresultat ·
 *     korrelation 0,01 · kvartilbaslinjen 1 000 → 250 → 250 × 0,25 = 62,5
 *     ≈ 62 · Mauboussin 10²/(10²+20²) = 100/500 = 0,20 mot 4/404 = 0,0099 ·
 *     slantturneringen 4 000 → 2 000 → 1 000 → 500 → 250, andelen
 *     250/4 000 = 6,25 % · Lynch sex av tio.
 *   · Kredit: 250 punkter = 2,50 % × 10 Mkr = 250 000 kr/år = 62 500/kvartal ·
 *     LGD 1 − 0,40 = 0,60 · PD = 0,025 ÷ 0,60 = 4,2 %/år · kumulativt
 *     1 − 0,9583⁵ = 19,2 % · kontrollen 0,0417 × 0,60 × 10 M = 250 000 ·
 *     utbetalning 0,60 × 10 M = 6 M = 24 års premier · år ett −5,75 M ·
 *     nivåerna 100/500/2 000 punkter = 1,7/8,3/33 % · naken 50 M på 10 M
 *     = 5× · Grekland 0,020 ÷ 0,60 = 3,3 % → 0,10 ÷ 0,60 = 16,7 %, två år
 *     1 − 0,8333² = 30,6 % · basis 250 − 220 = 30 punkter.
 *   · Avknoppning: SOTP 10 + 0,60 × 10 = 16 mdr mot 12 = rabatt 25 % ·
 *     beslutsdagen 120 → 132 (+10 %) · pro rata 60 M ÷ 100 M = 0,60 ·
 *     when-issued 64 = 36 % rabatt · kontinuitetstestet 95 + 0,60 × 62 =
 *     132,2 ≈ 132 (0,2 = brus) · fönstret 12 M aktier ÷ 0,8 M/dag = 15
 *     handelsdagar · trycket 62 → 56 = 44 % · tolv månader 71 (+26,8 % från
 *     botten) och 99; summa 99 + 0,60 × 71 = 141,6 = +7,3 % · rabatt
 *     (160 − 141,6) ÷ 160 = 11,5 % · täckning 0 → 4 analytiker.
 *
 * KEDJEPLATS: läggs sist före marknadsrytm (deras SIST-deklaration +
 * L01-respekterad, multipel-precedensen). Kärnorden är mekaniskt disjunkta
 * mot samtliga lager före det i kedjan (sond dokumenterad ovan; verifieras
 * levande av modultestets G-fall och kedjetestets struktur- och skuggfall).
 *
 * Matchningen speglar motorns hjälpfunktioner (samma lösning som alla
 * syskinlager: Node type-stripping löser endast `import type`, så de rena
 * funktionerna speglas hit). Semantisk likhet med motorn BEVISAS av
 * testets felstavningsfall (B) och determinismfall (C). Driftvarning:
 * ändras motorns matchning måste denna spegel följa — testfall B vakar.
 *
 * ── JURIDIKGRINDEN (lagen 2007:528) ──────────────────────────────────
 * All text är pedagogisk utbildning om hur skicklighetsanspråk PRÖVAS,
 * hur kreditkontrakt LÄS och RÄKNAS och hur avknoppningsförlopp LÄS —
 * inga köp-/säljsignaler, inga placeringstips, inga omdömen om enskilda
 * bolag eller länder. Exempelvärdena är kursernas egna modelltal (Svea,
 * Norrvik, Östersjö Capital, Modrik och Nordhamn är påhittade) — konstruerade
 * för övningens skull.
 *
 * ── DEPENDENCY-INJECTION (samma mönster som hela motorn) ─────────────
 * Registret skickas IN som parameter (endast `import type`) så att
 * verktyg/testa-ai-mentor-nyfodda.mjs kan köra filen direkt i Node.
 * Källkurserna finns i KURSREGISTER — inga fantomlänkar (testfall D21
 * vakar).
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

// ── Den 1 frågan: kompetensparadoxen (bf-18) ────────────────────────────────

export const NYFODDA_MONSTER: FragMonster[] = [
  {
    id: "kompetensparadoxen",
    karnord: [
      // Sond _s6u3o33 rond 3 (0 kollisioner mot 4 104 kärnord i 76 lager).
      // GRÄNSER (bärs i TEXT): naket «kompetensillusion» → overmod-monstret
      // (beteendemekanik, km-036) · seriepsykologin → bf-16 · dunning-kruger
      // → bf-10 · prövningens teknik → ek-04 · de riskjusterade måttens
      // beräkning → km-016.
      "kompetensparadoxen", "kompetensparadox",
      "slantturneringen", "slantturnering",
      "giltighetsmiljö", "giltighetsmiljöer", "giltighetsmiljön",
      "rådgivarkorrelationerna", "rådgivarkorrelation",
      "kunskapsillusionen", "kunskapsillusion",
      "social smitta",
      "stjärnstatus",
      "intuition", "expertis",
      "återmatning", "återmatningen",
    ],
    starkord: [
      "kahneman", "klein", "mauboussin", "lynch", "rådgivare", "rådgivarna",
      "förvaltare", "förvaltarna", "förvaltarkåren", "skicklighet",
      "skickligheten", "tur", "turen", "bruset", "brus", "kvartilen",
      "kvartil", "bonus", "vinnare", "vinnarna", "stjärna", "stjärnor",
      "korrelation", "maraton", "brandmannen", "schack", "aktieväljaren",
      "skicklighetsspridningen", "turspridningen", "baslinjen", "basisfrekvensen",
    ],
    bygga: (reg) => {
      const bfAntal = reg.filter((r) => r.kategori === "BETEENDEFINANS").length;
      const kallor = [
        kursKalla(reg, "bf-18-kompetensillusionen", "Läroplanen — när skickligheten är en berättelse: rådgivarkorrelationerna, giltighetsmiljöerna, paradoxen, slantturneringen"),
        kursKalla(reg, "bf-16-slumpens-serier", "Läroplanen — mönster i brus och lagen om små tal: varför serien känns meningsfull"),
        kursKalla(reg, "km-036-overconfidence", "Läroplanen — övermodet som känsla; kompetensillusionen som struktur"),
        kursKalla(reg, "ek-04-backtestens-hantverk", "Läroplanen — att testa en metod mot historien utan att lura sig själv"),
        kursKalla(reg, "km-016-sharpe-kvot", "Läroplanen — de riskjusterade måttens beräkning och deras gränser"),
      ];
      const k = kallor[0];
      const bf18 = reg.find((r) => r.slug === "bf-18-kompetensillusionen");
      return {
        text:
          `Kompetensparadoxen är beteendefinansens obekvämaste fynd: en hel bransch — rådgivare, förvaltare, analytiker — kan vara organiserad kring en skillnad som inte går att mätas, och ju bättre utbildad kåren blir, desto mindre syns skillnaden. Kursen bygger beviset i fem steg (allt nedan är utbildning i hur skicklighetsanspråk prövas, med kursernas egna exempel — inga omdömen om enskilda rådgivare eller fonder):\n\n1️⃣ STUDIEN SOM INGEN VILLE TRO PÅ. Daniel Kahneman berättade historien från ett uppdrag hos en investeringsfirma: varje år kom uppgifter om tjugufem rådgivares aktieval in, och sommaren han granskade dem lät han jämföra rådgivarna parvis — samma års resultat för den ene mot den andres. Antalet parvisa jämförelser bland tjugufem personer är 25 × 24 ÷ 2 = 300, och över åtta år samlades 25 × 8 = 200 årsresultat. Frågan var den enklaste tänkbara: var den som var bäst ett år bättre nästa? Samvariationen mellan rådgivarna landade i genomsnitt på 0,01 — noll ett. Två tärningar kastade på samma bord skulle ge samma tal. Rimlighetstestet är kursens första övning: rådgivarna fick bonus som om skillnaderna var verkliga, kunderna bytte rådgivare som om de var det, firman firade årets vinnare — men tidsserien bar ingen ordning alls. (Titelbegreppet kompetensillusionen bärs av övermodskursens familj i mentorfrågorna; detta svar äger bevisets delar: korrelationerna, miljöerna, paradoxen, turneringen.)\n2️⃣ TRE ILLUSIONER I ETT RUM. Illusionen är ingen lögn — den är tre uppriktiga upplevelser som förstärker varandra. Klientens kunskapsillusion: kunden betalar för analys och närhet, och eftersom kurser rör sig och råden ibland går bättre än index finns alltid något att visa — men i en miljö där korrelationen är 0,01 är den upplevda kunskapen inte kopplad till varaktighet. Rådgivarens minne: minnet av de bra valen är skarpt, de dåliga bleknar (slumpens serier har sin egen kurs om varför serien känns meningsfull), och den egna upplevelsen av hårt arbete bevisar för den inre juryn att skickligheten finns. Kulturens bärare: firman utser månadens vinnare, tidningar intervjuar årets förvaltare, och belöningssystemet institutionaliserar bruset — ur 200 årsresultat kommer alltid några i topp, och toppen förklaras i efterhand med kvaliteter som förlorarna också tror sig ha. Social smitta gör resten: när alla i rummet behandlar skillnaden som verklig blir den verklig som socialt faktum.\n3️⃣ GILTIGHETSMILJÖERNA — NÄR INTUITION ÄR ÄKTA. Kahneman och beslutsforskaren Gary Klein var oense i fjorton år och skrev till slut svaret tillsammans: intuition är äkta expertis när två villkor är uppfyllda. Omvärlden måste vara tillräckligt regelbunden för att vara förutsägbar — branden uppför sig regelbundet nog att erfarenhet samlas, och brandmannen som känner att golvet är på väg att rasa har äkta expertis. Och återkopplingen måste komma snabbt och tydligt — golvet rasade eller gjorde det inte; anestesisjuksköterskan hör på ljuden om patienten är på väg att vakna; schackmästaren ser draget direkt efter tusen partier med omedelbar poäng. Aktiemarknaden svarar svagt på båda: delar av den är regelbundna (balansräkningar beter sig lika, multipelmatematiken är aritmetik — där finns äkta kunskap som varar), men priset på tre månaders sikt är en röstning, och domen över ett aktieval kommer först efter år — dessutom blandad med marknadens, räntans och turens. En återmatning som kommer sent, sällan och i brus kan inte lära intuitionen något den kan lita på. Baslinjeövningen som kvantifierar: bland 1 000 slumpmässigt placerade förvaltare hamnar 250 i övre kvartilen år ett; om turen råder hamnar 250 × 0,25 = 62,5 — omkring 62 — av dem i övre kvartilen nästa år: exakt en fjärdedel, samma andel som för vem som helst.\n4️⃣ KOMPETENSPARADOXEN — JU BÄTTRE ALLA BLIR, DESTO MER AVGÖR TUREN. Michael Mauboussins modell är en rad: resultat = skicklighet + tur. Skicklighetens andel av resultatets spridning avgörs inte av hur bra den bäste är utan av hur stor skillnaden mellan deltagarna är. Sätt talen: om turspridningen är 20 procentenheter och skicklighetsspridningen 10 blir korrelationen mellan ett års resultat och något systematiskt 10 i kvadrat delat med (10 i kvadrat plus 20 i kvadrat) = 100/500 = 0,20 — svagt, men skickligheten syns. Smalnar skicklighetsspridningen till 2 procentenheter — alla utbildade, alla uppkopplade, samma terminaler och årsredovisningar — faller samma kvot till 4/404 = 0,0099, alltså 0,01. Läs siffran igen: det är rådgivarkorrelationen. Den är inte ett mysterium utan en aritmetisk nödvändighet: när kåren blir kompetentare pressas skillnaderna mot noll och kvar på planen står turen. Mauboussins andra exempel är maratonlöparna — världens tider har sjunkit i ett sekel, men toppens inbördes spridning har krympt ännu snabbare; bland de ytterst få som springer på gränsen av det mänskliga avgör skorna, vädret och dagen. Paradoxen betyder inte att skicklighet är omöjlig — den betyder att skicklighetens BEVIS kräver längre serier ju kompetensare kåren är: signalen är låg, bruset oförändrat.\n5️⃣ SLANTTURNERINGEN — SKICKLIGHET TILLVERKAD AV URVAL. Tänk en turnering där 4 000 förvaltare singlar slant om engångsresultat — ren tur. Omgång ett: hälften vinner, 2 000 kvar. Omgång två: 1 000. Omgång tre: 500. Omgång fyra: 250 deltagare med fyra raka träffar — och de ser utmärkta ut: de har vunnit fyra gånger i rad, de tror på sin metod, de har en berättelse om varför det gick. Basisfrekvensen säger något annat: 250 av 4 000 = 6,25 procent, och en slantturnering med fyra omgångar producerar exakt den andelen fyra-raka-medaljer VARJE GÅNG den körs. Överfört till marknadslivet: fonder som stängs försvinner ur statistiken, rådgivare som slutar recenseras inte — de som återstår efter tio års urval bär en glans som delvis är turneringens (backtestens hantverk äger överlevnadsbiasets roll i prövningar; detta äger dess roll i skicklighetsanspråk). Motgiftet är protokollets fem frågor: (1) BASISFREKVENSEN — hur många deltog från starten? (2) URVALET — överlever förlorarna i redovisningen? (3) ÅTERMATNINGEN — kom domen i tid att lära, eller sent och blandad? (4) SPÅRBARHETEN — kan prestationen knytas till en regel som går att pröva om, med dokumenterade beslut före utfallet? (5) HORIZONTEN — räcker serien för att signalen ska överrösta bruset, givet kårens kompetens? Lynch-talet sammanfattar den femte: sex av tio är elit — och svaret på ett kort lyckat förlopp är alltid detsamma: vänta, mät, låt protokollet få tid.\n\nI kategorin beteendefinans finns ${bfAntal} kurser — kompetensparadoxen (${bf18 ? bf18.niva.toLowerCase() + " nivå" : "i registret"}) är familjens artonde steg: först kartlade kurserna de enskilda fallen, och här samlas de till fältets bevisfråga — är den som väljer skicklig eller lyckosam, och vad krävs för att ta påståendet på allvar. Som alltid: detta är utbildning i en metod — inga placeringstips.` +
          kallradFler(kallor),
        amne: "kompetensparadoxen",
        kalla: k,
        kallor,
        handlings: [
          { text: "Kursen: Kompetensillusionen", lank: "/kurser/bf-18-kompetensillusionen", ikon: "🎭", beskrivning: "När skickligheten är en berättelse" },
          { text: "Kursen: Slumpens serier", lank: "/kurser/bf-16-slumpens-serier", ikon: "🎲", beskrivning: "Mönster i brus och lagen om små tal" },
          { text: "Kursen: Overconfidence", lank: "/kurser/km-036-overconfidence", ikon: "😌", beskrivning: "Övermodet som känsla" },
          { text: "Kursen: Backtestens hantverk", lank: "/kurser/ek-04-backtestens-hantverk", ikon: "🧪", beskrivning: "Pröva metoden mot historien" },
          { text: "Kursen: Sharpe-kvot", lank: "/kurser/km-016-sharpe-kvot", ikon: "📐", beskrivning: "De riskjusterade måttens gränser" },
          { text: "Vad är slumpens serier?", lank: "fragor:" + encodeURIComponent("vad är slumpens serier?"), ikon: "🎲", beskrivning: "Serieupplevelsens psykologi" },
          { text: "Vad är backtestens hantverk?", lank: "fragor:" + encodeURIComponent("vad är backtestens hantverk?"), ikon: "🧪", beskrivning: "Prövningens teknik" },
        ],
        motfraga: { text: "Vad är slumpens serier?", kategori: "beteendefinans" },
        fordjupa: { text: k.titel, lank: "/kurser/bf-18-kompetensillusionen" },
      };
    },
  },
  {
    id: "kreditderivatet",
    karnord: [
      // GRÄNSER (bärs i TEXT): «kreditspread»/«kreditsprid» → kreditdjupet
      // (ma-05 äger nivån; här kontraktet och ekvationen) · naket «spread» →
      // basen/marknadsmekaniken · naket «swap» → handelsdagens vwap (tav-1)
      // · «konkurs»-familjen → överlevnadsdjupet · 2008-kedjan → rk-16 ·
      // samvariationen → rs-03 · basis-arbitraget → bf-13 · betygen → ks-05.
      "kreditderivat", "kreditderivatet", "kreditderivaten",
      "cds",
      "kredithändelse", "kredithändelsen", "kredithändelser",
      "referensnamn", "referensnamnet", "referensnamnen",
      "förlustandel", "förlustanden", "lgd",
      "statskredit", "statskrediten",
      "naken cds",
      "återvinning", "återvinningen",
      "kreditkommittén",
    ],
    starkord: [
      "premie", "premien", "skydd", "skyddet", "säljaren", "säljarna",
      "köparen", "köparna", "utfärdaren", "obligation", "obligationen",
      "låntagaren", "låntagare", "punkter", "basispunkter", "spread",
      "spreaden", "sprid", "isda", "default", "swap", "auktionen",
      "auktion", "Grekland", "statsobligation", "Svea", "Norrvik",
      "Östersjö", "fallera", "fallerar", "omstrukturering",
    ],
    bygga: (reg) => {
      const odAntal = reg.filter((r) => r.kategori === "OPTIONS & DERIVAT").length;
      const kallor = [
        kursKalla(reg, "od-10-kreditderivatet", "Läroplanen — CDS, försäkringen på låntagaren: kontraktet, ekvationen, säljarens stol, svansen"),
        kursKalla(reg, "od-09-forsakringsskrivandet", "Läroplanen — säljarens stol för volatiliteten; här stolen för kredit"),
        kursKalla(reg, "ma-05-kreditpremien", "Läroplanen — kreditpremien som makrovariabel: hela ekonomins pris på risk"),
        kursKalla(reg, "ks-05-covenanter-och-kreditbetyg", "Läroplanen — betygstrappan: sändarens långsamma dom mot spreadens snabba"),
        kursKalla(reg, "rs-03-dold-samvariation", "Läroplanen — när namnen fallerar tillsammans: korrelationen bakom 2008"),
      ];
      const k = kallor[0];
      const od10 = reg.find((r) => r.slug === "od-10-kreditderivatet");
      return {
        text:
          `Kreditderivatet (CDS — credit default swap) är familjens andra värld: optionen har en aktie som underliggande, detta har en låntagare — en obligation, ett bolagsnamn och frågan om pengarna kommer tillbaka. Kontraktet är en försäkring på låntagarens betalning, och hela dess pris cirkulerar kring sannolikheten för en diskret händelse: antingen betalar namnet, eller så gör det inte det (allt nedan är utbildning i mekaniken, med kursens egna modelltal och tydligt påhittade parter — inga placeringstips):\n\n1️⃣ KONTRAKTET — PREMIEN, BELOPPET OCH KREDITHÄNDELSEN. Kursens exempel: stiftelsen Svea äger Norrvik Skog AB:s femåriga obligation på tio miljoner kronor med fast ränta 5,0 procent. Stiftelsen sover gott med kupongen men har lärt sig att skogsbolag bär cykel — och köper skydd: ett CDS med löptid fem år, belopp tio miljoner, på Norrvik Skog som referensnamn. Priset noteras i punkter (basispunkter) per år: 250 punkter. Räkna premien: 250 punkter är 2,50 procent av beloppet, alltså 0,025 × 10 000 000 = 250 000 kronor per år, betalt kvartalsvis med 62 500 kronor. Vad köper stiftelsen? Säljaren — Östersjö Capital AB — förbinder sig att ersätta kreditförlusten om en kredithändelse inträffar hos Norrvik Skog innan fem år är slut. ISDA-avtalstexten räknar tre sådana: konkurs, betalningsinställelse på skulden, och i europeiska kontrakt även omstrukturering. Ingen av dem är en kursnedgång, en varningsrapport eller en nedgradering — kontraktet svarar på betalningen, inte på stämningen.\n2️⃣ PRISET ÄR EN SANNOLIKHET — EKVATIONEN. Vid en kredithändelse förlorar obligationens ägare inte allt: en del av skulden återvinns i boet — historiska standardantaganden ofta omkring 40 procent på företagsobligationer. Förlustanden (LGD) blir 1 − 0,40 = 0,60. Ekvationen är fältets enklaste: ett rätt prissatt kontrakt ger premien lika med förväntad förlust per år — premie = sannolikhet per år × förlustandel. Baklänges: sannolikhet per år = sprid ÷ förlustandel. Sätt in Norrviks tal: 0,025 ÷ 0,60 = 0,0417 — marknaden prissätter 4,2 procents sannolikhet per år att Norrvik fallerar. Räkna vidare på löptiden: sannolikheten att händelsen INTE inträffar ett givet år är 1 − 0,0417 = 0,9583, och på fem år sammanlagt 1 − 0,9583 upphöjt till fem = 1 − 0,808 = 19,2 procent kumulativ risk. Kontrollen av symmetrin: förväntad årlig förlust = 0,0417 × 0,60 × 10 000 000 = 250 000 kronor — exakt premien. Läs nivåerna som sannolikheter: 100 punkter med förlustandel 60 procent betyder 1,7 procent per år (ett tryggare namn), 500 punkter betyder 8,3 procent (ett namn i fara), 2 000 punkter betyder 33 procent per år (marknaden räknar med att det är en tidsfråga). Spreadens nivå som hela ekonomins pris på kredit ägs av kreditpremiekursen (makrovariabeln); detta kontrakt äger det enskilda namnets ekvation.\n3️⃣ SÄLJARENS STOL — BREAK-EVEN OCH DE 24 ÅREN. Östersjö Capital tar emot 250 000 om året och lovar sex miljoner i värsta fallet — ty utbetalningen bestäms av återvinningen: (1 − 0,40) × 10 000 000 = 6 000 000 kronor. Spegelbilden: väntevärdet per år är 0,0417 × 6 000 000 = 250 000 — exakt premien; säljaren levererar väntevärde noll före kostnader, precis som aktieoptionens försäkringsskrivare (den kursen äger stolen för volatilitet; denna äger den för kredit). Skillnaden är frekvensens och allvarlighetens form: optionens förluster betalas i glidande skala och ofta, kreditkontraktets i ett enda slag och sällan. Hävstången i tal: en enda utbetalning motsvarar 6 000 000 ÷ 250 000 = 24 års premieinkomster. Fallerar Norrvik första året har säljaren inkasserat 250 000 och betalat 6 000 000 — minus 5 750 000 på en bråkdel av året. Därför är säljarens hantverk portfölj och reserv: skriv skydd på många namn som inte fallerar samtidigt (samvariationen — dold samvariation har sin egen kurs), håll reserv mot det samtidiga fallet, och prisa varje namn med ekvationen så att portföljen i genomsnitt break-evenar.\n4️⃣ SPELET UTAN HUS — NAKEN CDS, MULTIPLIKATORN OCH 2008. Försäkring förutsätter att den som köper skydd också bär risken; kreditkontraktet släppte det kravet. Tre egenskaper följer. Skydd kan köpas UTAN att äga skulden — naken CDS: stiftelsen Svea äger sin obligation och hedgear, men en annan part kan köpa samma kontrakt utan en enda krona i Norrvik och satsa på att bolaget faller — försäkring på grannens hus, vilket är spel, inte skydd (2012 förbjöd EU naken stats-CDS just därför). Det kan skrivas MER skydd än det finns skuld — femtio miljoner CDS-skydd kan cirkulera på Norrviks tio miljoner obligation: en femfaldig multiplikator; utbetalningen styrs vid händelsen av auktionsförfarandet som sedan 2005 standardiserat hur återvinningen bestäms. Och säljaren är själv en motpart — det var denna tredje egenskap som bar 2008: när amerikanska bolånefordringar paketerats såldes skyddet vidare i en kedja där varje led trodde att nästa bar risken; premierna var små, händelserna korrelerade och reserverna räckte inte samtidigt (kontrahentkedjans mekanik ägs av kontrahentriskursen; instrumentets tre egenskaper — naket, med multiplikator, kedjat — var vad som gjorde kollapsen möjlig i denna form). Benämningen till sist: när CDS-priset ligger över motsvarande obligationsspread kallas skillnaden basis — 250 punkters CDS mot 220 punkters obligation ger basis plus 30 punkter — och att handla den skillnaden är arbitragets eget område.\n5️⃣ STATSKREDITEN — SÄNDAREN SOM FICK ETT PRIS. När referensnamnet är en stat har försäkringen blivit ett röstetal. Sommaren 2009 noterades Greklands femårssprid kring 200 punkter — ekvationen ger 0,020 ÷ 0,60 = 3,3 procents årsannolikhet för statsbankrutt: oroligt men inte larm. Ett år senare hade priset passerat 1 000 punkter — 0,10 ÷ 0,60 = 16,7 procent per år, och på två år sammanlagt 1 − 0,8333² = 1 − 0,694 = 30,6 procent. Marknaden hade med kontraktets egen aritmetik utläst vad budgetpropositioner ännu skrev i förbifarten — CDS blev den snabbaste sändaren av statskredit som fanns, snabbare än kreditbetygen (betygens långsamma dom har sin egen kurs) och mer kontinuerlig än obligationsauktionerna. Våren 2012 kom mekaniken: när skuldavskrivningen förhandlades fram fastställde ISDA:s kreditkommitté kredithändelse — kontraktens största statsvittne — och auktionen bestämde återvinningen som utbetalningarna räknades på.\n6️⃣ PROTKOLLET — FEM FRÅGOR TILL EN CDS-POSITION. (1) VEM BÄR MOTPARTSRISK — fordran på säljaren, hennes balansräkning? (2) VAD SÄGER PRISET I SANNOLIKHET — punkterna dividerade med förlustanden, läst som årsprocent och jämförd med räknebokens egna mått? (3) NAKEN ELLER TÄCKT — bär positionen den underliggande risken, eller är den ett spel? (4) HUR STOR ÄR MULTIPLIKATORN — hur mycket skydd cirkulerar på namnet mot faktisk skuld? (5) VAD HÄNDER VID EN KREDITHÄNDELSE, STEG FÖR STEG — vilken av de tre händelserna utlöser, hur bestäms återvinningen, vad blir utbetalningen i kronor? Fem svar — och positionen är först då beskriven.\n\nI kategorin options och derivat finns ${odAntal} kurser — kreditderivatet (${od10 ? od10.niva.toLowerCase() + " nivå" : "i registret"}) är familjens tionde steg: först aktiens kontrakt och dess prisbildning, sedan försäkringsskrivandets stol — och här familjens andra värld, skulden, med samma maskineri baklänges. Som alltid: detta är utbildning i en metod — inga placeringstips.` +
          kallradFler(kallor),
        amne: "kreditderivatet",
        kalla: k,
        kallor,
        handlings: [
          { text: "Kursen: Kreditderivatet", lank: "/kurser/od-10-kreditderivatet", ikon: "🛡️", beskrivning: "CDS — försäkringen på låntagaren" },
          { text: "Kursen: Försäkringsskrivandet", lank: "/kurser/od-09-forsakringsskrivandet", ikon: "🪑", beskrivning: "Säljarens stol för volatilitet" },
          { text: "Kursen: Kreditpremien", lank: "/kurser/ma-05-kreditpremien", ikon: "🌡️", beskrivning: "Spreaden som makrovariabel" },
          { text: "Kursen: Covenanter och kreditbetyg", lank: "/kurser/ks-05-covenanter-och-kreditbetyg", ikon: "📋", beskrivning: "Skuldens spelregler och prislapp" },
          { text: "Kursen: Dold samvariation", lank: "/kurser/rs-03-dold-samvariation", ikon: "🔗", beskrivning: "När namnen fallerar tillsammans" },
          { text: "Vad är försäkringsskrivandet?", lank: "fragor:" + encodeURIComponent("vad är försäkringsskrivandet?"), ikon: "🪑", beskrivning: "Systerstolen — aktiens sida" },
          { text: "Vad är kreditpremien?", lank: "fragor:" + encodeURIComponent("vad är kreditpremien?"), ikon: "🌡️", beskrivning: "Nivåns makrosida" },
        ],
        motfraga: { text: "Vad är kreditpremien?", kategori: "optionsderivat" },
        fordjupa: { text: k.titel, lank: "/kurser/od-10-kreditderivatet" },
      };
    },
  },
  {
    id: "avknoppningen",
    karnord: [
      // GRÄNSER (bärs i TEXT): «konglomeratrabatt» → varderjusteringen (vr-09)
      // · «tvångsförsäljning» → tvångsmekaniken · summametodens hantverk →
      // km-012 · indexflödenas mekanik → am-07 · budets dramaturgi → kt-09 ·
      // «utdelning i natur» → basens utdelningsfamilj · «glidning» → nya
      // territorierna · «pro rata» med mellanslag → makrons ränta (tav-1 på
      // «rata») — här bärs sammanskrivna «prorata».
      "avknoppning", "avknoppningen", "avknoppas", "avknoppad",
      "prorata",
      "when-issued", "when issued",
      "distributionsdag", "distributionsdagen",
      "kontinuitetstestet", "kontinuitetstest",
      "indexuteslutning", "indexuteslutningen",
      "nynotering",
    ],
    starkord: [
      "dottern", "dotterbolag", "dotterbolaget", "moderbolag", "moderbolaget",
      "kärnan", "kärnbolag", "kärnbolaget", "andelar", "andel", "utdelning",
      "utdelningen", "notering", "noteras", "noterad", "exit", "listning",
      "rabatt", "rabatten", "summavärde", "summavärdet", "indexfond",
      "indexfonder", "mandat", "mandaten", "fönstret", "handelsdag",
      "handelsdagar", "taxedjup", "analytiker", "täckning", "insiderköp",
      "insiderköpen", "glidning", "Modrik", "Nordhamn", "beslutsdagen",
    ],
    bygga: (reg) => {
      const ktAntal = reg.filter((r) => r.kategori === "KATALYSATOR").length;
      const kallor = [
        kursKalla(reg, "kt-10-avknoppningen", "Läroplanen — delen som blir ett eget bolag: beslutet, mekaniken, fönstret, utfallet"),
        kursKalla(reg, "km-012-sum-of-the-parts-sotp", "Läroplanen — summametoden: delarna som räknas fram rabatten"),
        kursKalla(reg, "vr-09-konglomeratrabatten", "Läroplanen — när helheten är värd mindre än delarna: rabattens egen aritmetik"),
        kursKalla(reg, "am-07-indexomlaggningen", "Läroplanen — indexflödenas mekanik: tvånget bakom fönstret"),
        kursKalla(reg, "kt-09-budpremien-och-budprocessen", "Läroplanen — exitvägens andra form: budgivare och budpremie mot andelar och tvång"),
      ];
      const k = kallor[0];
      const kt10 = reg.find((r) => r.slug === "kt-10-avknoppningen");
      return {
        text:
          `Avknoppningen är katalysatorfamiljens motsats till budet: alla andra exitvägar har en köpare som betalar en premie — här delar moderbolaget ut en dotter till sina EGNA ägare, och exiten är den nya listningen själv. Budet har budgivare och budpremie; avknoppningen har andelar och tvång — två olika prisförlopp (allt nedan är utbildning i mekaniken, med kursens egna modelltal och tydligt påhittade bolag — inga placeringstips):\n\n1️⃣ BESLUTET — VARFÖR MODERBOLAGET DELAR UT EN DEL. Kursens exempel: Modrik AB, ett förpackningsbolag som för tjugo år sedan köpte logistikverksamheten Nordhamn och vuxit i båda delarna. Modrik har 100 miljoner aktier och noteringen 120 kronor — börsvärde 12 miljarder. Räkna delarna med summametoden (hantverket ägs av SOTP-kursen): kärnverksamheten är värd 10 miljarder i grundtal och andelen i Nordhamn — 60 procent av ett bolag vars hela värderas till 10 miljarder — är värd 6 miljarder. Summan 16 miljarder mot noteringen 12: rabatten (konglomeratrabattens begrepp och aritmetik ägs av dess egen kurs) är (16 − 12) ÷ 16 = 25 procent. Tre motiv driver beslutet att knoppa av Nordhamn: FOKUS — ledningen delar sin tid mellan två verksamheter med olika cykler; RABATT — marknaden betalar 12 för delar den prissätter till 16, och varje år rabatten består äter den avkastning; STYRNING — det noterade Nordhamn får egen styrelse, egen ledning med optioner på eget bolag, egen utdelningspolitik. Beslutet offentliggörs, och marknadens första dom är omedelbar: Modrik stiger 120 → 132 kronor (+10 procent) — tio av de tjugofem procentenheterna rabatt stängs på en enda dag, resten lämnas åt genomförandet.\n2️⃣ MEKANIKEN — ANDELARNA, WHEN-ISSUED OCH DISTRIBUTIONSDAGEN. Fördelningen sker andelsvis, rättvist per aktie (pro rata): Nordhamn har 100 miljoner aktier och Modrik äger 60 miljoner, alltså ger varje Modrik-aktie (100 miljoner styck) 60 ÷ 100 = 0,60 Nordhamn-aktier. Inga pengar betalas, inget byte erbjuds: att delarna delas ut till ägarna är avknoppningens juridiska kärna (beskattningens detaljer ägs av skattekurserna). Två veckor före distributionsdagen börjar when-issued-handeln: Nordhamn handlas under egen kod utan att ägas ännu — köparen förvärvar RÄTTEN till aktien från dag noll. Noteringen: 64 kronor, alltså 36 procents rabatt mot summavärdet 100 — köparna kräver redan här bred marginal. Själva dagen: Nordhamn noteras ordinärt till 62 kronor och kärn-Modrik — nu ett rent förpackningsbolag — öppnar till 95. Kontinuitetstestet, kursens viktigaste aritmetik: den som ägde en Modrik-aktie kvällen före äger nu en kärnaktie och 0,60 Nordhamn: 95 + 0,60 × 62 = 95 + 37,2 = 132,2 kronor — mot beslutsdagens 132. Bytet i sig skapar alltså inget (differensen 0,2 kronor är dagens brus): det värde som skapades tillkom på BESLUTSDAGEN av beskedet, och distributionsdagen delar bara det. Detta är kursens skiljelinje mot myten att avknoppningsdagen är vinstens dag — vinstens förlopp sitter i fönstret som följer.\n3️⃣ TVÅNGSFÖRSÄLJNINGENS FÖNSTER — INDEX, MANDAT OCH 15 HANDELSDAGAR. Varför faller ett nytt bolag utan en enda fundamental nyhet? Därför att dagens säljare inte säljer av åsikt — de säljer för att deras regler säger att de måste. Nordhamn utesluts dag ett ur de stora indexen, inte av misshag utan av regel: det nya bolagets marknadsvärde och omsättning ligger under inkluderingskraven, och indexets regelverk tvingar varje indexfond att sälja sina andelar oavsett åsikt (indexflödenas hela mekanik ägs av indexomläggningskursen — detta kapitel äger dagen då mekaniken träffar en nyfödd notering). Räkna fönstret: index- och mandatefonder bär sammanlagt omkring 12 procent av Nordhamns aktier — 12 miljoner aktier — och det dagliga taxedjupet under de första veckorna är 0,8 miljoner aktier. Fönstret: 12 ÷ 0,8 = 15 handelsdagar av mekaniskt tryck. Dit hör mandatens mjukare tvång: en förvaltare med uppdrag i breda industrifonder får inte plötsligt bära ett rent logistikbolag; en fond med storleksmandat kan inte behålla en aktie som fallit ur storleksskiktet. Resultatet i exempelräkningen: Nordhamn pressas 62 → 56 kronor inom tre månader — 44 procents rabatt mot summavärdet, djupare än when-issued-nivån — UTAN att en enda fundamental nyhet om verksamheten kommit. Kärnläxan om pris mot värde: flödets pris kan ligga långt under både flödestomma och fundamentala värden, och fönstret är tidsbestämt — 15 handelsdagar i exemplet, inte en åsiktsrevision.\n4️⃣ DE FÖRSTA HUNDRA DAGARNA — GLIDNING, TÄCKNING OCH LEDNINGENS KÖP. När fönstret stängs börjar den långsammare mekanismen. Det nya bolaget är en ägarmarknad utan ägare som valt det: praktiskt taget ingen institutionell ägare har bett att få Nordhamn — de fick det i utdelningen. Förvaltare som inte kan eller vill bygga kompetens inom logistik avyttrar därför i takt med att mandat och utrymme tillåter — en ström av försäljning som kan pågå i månader och hålla kursen pressad långt efter att indexfönstret stängts. Täckningen: noll analysbanker täcker namnet vid noteringen — och utan täckning saknar institutionella köpare det underlag deras beslutprocesser kräver; glömskan är mekanisk, inte fientlig (i exemplet fyra analytiker efter tolv månader). Mot detta står köpsidan som händelsen byggt: Nordhamns ledning — i moderbolaget en avdelning bland tio, nu hela bolaget med optioner på egen aktie — är den mest informerade tänkbara köparen, och insiderköpens tyngd ligger just i fönstret och glidningen (personalrisken äger nyckelpersonerna som risk — här ägs ledningens nya incitamentsläge som drivkraft, spegelbilden av samma mynt).\n5️⃣ UTFALLET — RABATTEN DELAS, INTE FÖRSVINNER. Samla exempelräkningen: före beskedet — Modrik 120 mot summavärde 160: 25 procents samlad rabatt. Beslutsdagen — 132: rabatten 17,5 procent (tio procentenheter stängda av beskedet). Distributionsdagen — kärnan 95 + 0,60 × 62 = 132,2: värdet bevarat, rabatten DELAD — kärnbolaget handlas med 5 procents rabatt (95 mot 100), dotterbolaget med 38 (62 mot 100). Tolv månader — kärnan 99 (+4,2 procent), Nordhamn 71 (+26,8 procent från botten 56): summan 99 + 0,60 × 71 = 141,6 kronor, +7,3 procent mot beslutsdagens 132, och den vägda rabatten mot 160 smalnad till (160 − 141,6) ÷ 160 = 11,5 procent. Läxan är dubbel: mönstret — rabatten samlad blir delad, delarna pressas olika hårt av olika flöden, och tiden och den nya ägarstrukturen arbetar mot glömskan. Och villkoret — avknoppning skapar INTE värde i sig; den tar bort ett skäl att betala mindre för delarna. Om kärnan styrs sämre utan dotterns kassaflöde, om dubbla noteringars fasta kostnader äter marginalen, om ledningen visar sig ovärdig förtroendet — då kan summan efter ett år ligga under beslutsdagen, och exempelkurvan är en kurva, inte ett löfte.\n6️⃣ PROTKOLLET — FEM FRÅGOR TILL EN AVKNOPPNINGSPLAN. (1) MOTIVET — fokus, rabatt eller styrning, och är det ett som bär utfallet? (2) DEN TVINGADE FÖRSÄLJNINGENS STORLEK — hur stor andel av det nya bolaget sitter i index- och mandatefonder, och hur många handelsdagar är fönstret (andel ÷ taxedjup)? (3) KÖPARSIDAN — vem kan och vill köpa när fönstret öppnas: ledning med incitament, förvaltare med rymmande mandat, bolag i branschen? (4) RABATTENS ARITMETIK — vad säger summametoden om gapet, hur mycket stängdes på beslutsdagen, vad återstår att prissätta i pressat läge? (5) KÄRNANS ÖDE — den tysta halvan: vem äger analysen av det som blir kvar? Fem svar — och förloppet är först då beskrivet.\n\nI kategorin katalysator finns ${ktAntal} kurser — avknoppningen (${kt10 ? kt10.niva.toLowerCase() + " nivå" : "i registret"}) är familjens tionde steg: kalendern, kedjorna och budet kartlades först — och här händelsen utan köpare, där exiten är listningen själv. Som alltid: detta är utbildning i en metod — inga placeringstips.` +
          kallradFler(kallor),
        amne: "avknoppningen",
        kalla: k,
        kallor,
        handlings: [
          { text: "Kursen: Avknoppningen", lank: "/kurser/kt-10-avknoppningen", ikon: "🌱", beskrivning: "Delen som blir ett eget bolag" },
          { text: "Kursen: Sum-of-the-Parts", lank: "/kurser/km-012-sum-of-the-parts-sotp", ikon: "🧮", beskrivning: "Summametoden — delarna som räknar rabatten" },
          { text: "Kursen: Konglomeratrabatten", lank: "/kurser/vr-09-konglomeratrabatten", ikon: "⚱️", beskrivning: "När helheten är värd mindre" },
          { text: "Kursen: Indexomläggningen", lank: "/kurser/am-07-indexomlaggningen", ikon: "🔁", beskrivning: "Flödet som flyttar kursen" },
          { text: "Kursen: Budpremien och budprocessen", lank: "/kurser/kt-09-budpremien-och-budprocessen", ikon: "🔨", beskrivning: "Exitvägens andra form" },
          { text: "Hur fungerar en budprocess?", lank: "fragor:" + encodeURIComponent("hur fungerar en budprocess?"), ikon: "🔨", beskrivning: "Systerfrågan — exit med köpare" },
          { text: "Vad är konglomeratrabatten?", lank: "fragor:" + encodeURIComponent("vad är konglomeratrabatten?"), ikon: "⚱️", beskrivning: "Rabattens egen aritmetik" },
        ],
        motfraga: { text: "Hur fungerar en budprocess?", kategori: "katalysator" },
        fordjupa: { text: k.titel, lank: "/kurser/kt-10-avknoppningen" },
      };
    },
  },
];

// ── Huvudingången ──────────────────────────────────────────────────────────

/**
 * Svara lokalt med nyfödda-kurs-mönstren — eller null (då har hela kedjan
 * före redan lämnat null och API-flödet tar över som förr). Ligger sist
 * FÖRE marknadsrytm i widgetens kedja och kan därför aldrig stjäla en fråga
 * från ett tidigare lager; det fångar bara frågor som alla lager före det
 * lämnar null på. Samma matchningssemantik som basmotorn: minst ett kärnord
 * krävs, poäng = kärnord × 3 + stärkord, oavgjort → först deklarerade
 * mönstret vinner (strikt >, deterministiskt). Samma fråga ⇒ bitidentiskt
 * svar.
 */
export function svaraLokaltNyfodda(fraga: string, register: RegisterRad[]): LokaltSvar | null {
  const fragaStr = diafri(fraga);
  if (!fragaStr) return null;
  const fragaOrd = fragaStr.split(" ");
  let bast: { svar: LokaltSvar; poang: number } | null = null;
  for (const m of NYFODDA_MONSTER) {
    const karnTraff = m.karnord.filter((nk) => traff(fragaOrd, fragaStr, nk));
    if (karnTraff.length === 0) continue; // krav: minst ett kärnord
    const starkTraff = m.starkord?.filter((nk) => traff(fragaOrd, fragaStr, nk)) ?? [];
    const poang = karnTraff.length * 3 + starkTraff.length;
    if (!bast || poang > bast.poang) bast = { svar: m.bygga(register), poang };
  }
  return bast ? bast.svar : null;
}
