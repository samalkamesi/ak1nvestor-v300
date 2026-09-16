/**
 * AI-MENTORN 2.0 — HISTORIEFÖRHANDSFRÅGOR (spår 6, omgång 9, s6-u3).
 *
 * Tre ytterligare källmärkta förhandsfrågor ovanpå de tolv tidigare lagren
 * (basens MONSTER i ai-mentor-svar.ts + extra, makro, nästa, kapitalmekanik,
 * sektor, case, praktik, portfoljgrund, agande, redovisningsdjup — och
 * syskonet djup som skrevs i förra fönstret):
 *   1. Tulpanmanin (extraordinary-popular-delusions primär +
 *      manias-panics-and-crashes + the-great-crash-1929 +
 *      km-057-konjunkturcykler) — historiens första dokumenterade bubbla
 *   2. Börsbubblans anatomi (manias-panics-and-crashes primär +
 *      extraordinary-popular-delusions + the-great-crash-1929 +
 *      rk-15-cykelrisk) — Kindlebergers fem faser
 *   3. Aktiekraschen 1929 (the-great-crash-1929 primär +
 *      manias-panics-and-crashes + extraordinary-popular-delusions +
 *      km-057-konjunkturcykler) — Galbraith om hävstången och fallet
 *
 * ÄMNESVAL EFTER KOLLISIONSKONTROLL (598 kärnord LIVE-lästa ur samtliga tolv
 * lager, mekaniskt, med den riktiga matcharen; verktyg/_s6u3-sond.mjs):
 * frågeformuleringarna "vad var tulpanmanin?", "vad är en börsbubbla?" och
 * "vad hände vid aktiekraschen 1929?" är helt fria (NULL genom hela kedjan).
 * BOKMASTER är registrets STÖRSTA kategori (103 kurser) och bär samtliga tre
 * primärkällor som KOMPLETT-kurser (hela böcker som kurser med quiz) —
 * mästarfrågan i djup-lagret rörde nutida investerare, detta lager tar
 * HÄNDELSERNA och mönstren i börsens historia. Alternativa kandidater som
 * avsågs: råvaror och börsvärde/small cap (kärnorden fria men 0 källkurser
 * i registret — ingen äkta källmärkning möjlig), obligationer (makro-lagret
 * äger kärnorden), panik/beteende-ord (basen äger). Varje svar bär FYRA
 * kurslänkar (spårets "fler kurslänkar per svar") — noll API-kostnad.
 *
 * ANSVARSFÖRDELNING (syskonlagrens dokumentationsplikt, testfall H/I
 * bevisar båda vägarna):
 *   • Basen äger börs-GRUNDORDEN ("börs", "börsen", "aktiemarknaden") —
 *     därför fångar basen fortfarande "vad är börsens historia?" (dess
 *     aktiemarknads-monster, bevisat LIVE). Detta lagrets kärnord är
 *     händelse- och bokorden (tulpan, bubbla, krasch, mackay, kindleberger,
 *     galbraith, 1929 …) — orden basen saknar. Svaren nämner "börsen" i
 *     TEXT men bär den inte som kärnord.
 *   • Basen äger beteende-orden (panik, psykologi, känslor) och djup-lagret
 *     äger fomo/prospektteori-familjen — bubbel-svaret beskriver euforin och
 *     paniken som FASER i Kindlebergers mönster (historisk mekanik) utan att
 *     bära orden som kärnord; knappen "Vad är FOMO?" länkar medvetet till
 *     djup-lagret (bevisat LIVE i kedjan).
 *   • Makro-lagret äger ränte-/inflations-familjen — 1929-svaret nämner
 *     penningpolitik och konjunktur i text; knappen "Vad är ränta och hur
 *     påverkar den aktier?" länkar medvetet dit.
 *
 * DOKUMENTERAD RISK (accepterad, samma bokföring som djup-lagrets
 * "lynch"/"lunch"-notis): kärnordet "krasch" (6 tecken, tål 1 fel) kan
 * teoretiskt fånga korta främmande ord på avstånd 1 — antistöldtestet kör
 * samtliga 598 syskonkärnord som frågor utan träff; risken är domänmässigt
 * försumbar. Talet "1929" som kärnord är medvetet EXAKT (4 tecken → ingen
 * felstavningstolerans) så att årtalsfrågor ("vad hände 1929?") når svaret
 * utan att skräpa med andra tal. AVSTÅTT efter kollisionsfynd (G2-svepet):
 * kärnorden "kraschen"/"krascher" (fångar sektorlagrets "branschen"/
 * "branscher" på avstånd 2) och frasen "wall street" (fångar djup-lagrets
 * "one up on wall street") — generiska plural frågor om krascher får i
 * stället aktie-formen och årtals-orden som ingång.
 *
 * BUGGHISTORIK I KEDJAN (dokumenterad för framtida omgångar): sektor-
 * lagret (c363ec8b) levererades en gång utan sin widget-inkoppling och var
 * död kod tills syskonet s6-u1 omgång 5 kuraterade tillbaka det. Detta
 * lager kopplas in SIST — och testfall L läser widgetens kedjerad MEKANISKT
 * ur filen (tretton lager i ordning + import) så att "lager utan inkoppling"
 * aldrig kan återkomma tyst.
 *
 * Matchningen speglar motorns hjälpfunktioner (samma lösning som alla
 * syskonlagren: Node type-stripping löser endast `import type`, så de
 * rena funktionerna speglas hit). Semantisk likhet med motorn BEVISAS
 * av testets felstavningfall (B) och determinismfall (C). Driftvarning:
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
 * Detta lager ligger SIST i kedjan och kan därför ALDRIG stjäla en fråga
 * från tidigare lager — det fångar bara frågor som alla tolv lämnar null
 * på. Omvänt vaktar testfall I på att dessa frågor INTE fångas av kedjan
 * utan detta lager (dupliceringsskydd).
 *
 * ── JURIDIKGRINDEN (lagen 2007:528) ──────────────────────────────────
 * All text är pedagogisk utbildning om hur historiska bubblor och krascher
 * FUNGERAR som mönster — inga köp-/säljsignaler, inga placeringstips, inga
 * omdömen om enskilda bolag eller värdepapper, inga prognoser om framtida
 * marknadsrörelser. Historien används som laboratorium för mekanismer
 * (meckanismförståelse), aldrig som underlag för handelsbeslut.
 *
 * ── DEPENDENCY-INJECTION (samma mönster som hela motorn) ─────────────
 * Registret skickas IN som parameter (endast `import type`) så att
 * verktyg/testa-ai-mentor-historia.mjs kan köra filen direkt i Node.
 * Alla källkurser (extraordinary-popular-delusions,
 * manias-panics-and-crashes, the-great-crash-1929, km-057-konjunkturcykler,
 * rk-15-cykelrisk) finns i KURSREGISTER (verifierat i 358-registret —
 * spår 5:s rebake till 369 lägger TILL kurser, slugarna består;
 * kursKalla faller tillbaka på "Läroplanen" om ett framtida register
 * läcker en slug).
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

// ── De 3 historiefrågorna ───────────────────────────────────────────────────

export const HISTORIA_MONSTER: FragMonster[] = [
  {
    id: "tulpanmanin",
    karnord: [
      "tulpanmanin", "tulpan", "tulpaner", "tulpanlökar",
      "mackay", "popular delusions",
    ],
    starkord: [
      "historia", "holland", "nederländerna", "1637",
      "galenskap", "lökar", "pris", "börsen", "aktier",
    ],
    bygga: (reg) => {
      const bokAntal = reg.filter((r) => r.kategori === "BOKMASTER").length;
      const kallor = [
        kursKalla(reg, "extraordinary-popular-delusions", "Läroplanen — bokmästaren, Mackay om massans galenskaper"),
        kursKalla(reg, "manias-panics-and-crashes", "Läroplanen — bokmästaren, Kindleberger & Aliber om bubblornas mönster"),
        kursKalla(reg, "the-great-crash-1929", "Läroplanen — bokmästaren, Galbraith om hävstångens fara"),
        kursKalla(reg, "km-057-konjunkturcykler", "Läroplanen — makroekonomi, cyklerna som bubblor föds ur"),
      ];
      const k = kallor[0];
      const epd = reg.find((r) => r.slug === "extraordinary-popular-delusions");
      return {
        text:
          `Tulpanmanin — Nederländerna 1636–1637 — är den äldsta väl dokumenterade prisbubblan och har förblivit en standardreferens i nästan fyra sekel (allt nedan är historien som UNDERVISNING om en mekanism, inte en kommentar till dagens marknad):\n\n1️⃣ VAD SOM HÄNDE — enligt Mackays klassiska skildring (Extraordinary Popular Delusions, 1841) handlades kontrakt på tulpanLÖKAR till priser i nivå med ett helt hus; den mest omskrivna löken, Semper Augustus, blev sin tids symbol för hur långt spekulativa priser kan nå. Viktigt att förstå: vinterns handel gällde framtida leveranser (en tidig terminsmarknad) — de flesta lökarna bytte aldrig ägare, bara papperen gjorde det.\n2️⃣ MEKANIKEN, INTE BLOMMAN — drivkrafterna var knapphet (nya och eftertraktade sorter), social bevising (alla omkring verkade tjäna) och köpare som inte ville ha lökar utan ville sälja vidare till nästa köpare. När auktionerna i februari 1637 plötsligt fann få bud kollapsade priserna — ingen "nyhet" krävdes, bara frånvaron av en ny köpare i kedjan. Det är själva läroboken i mönstret: priset bars av FÖRVÄNTAN på nästa köpare, inte av något underlag.\n3️⃣ VARFÖR HISTORIEN LEVER — tulpanmanin används (med viss rätt och viss överdrift — senare forskning har nyanserat Mackays siffror) som den mest kompakta illustrationen av spekulationens anatomi: samma mönster återkom i South Sea 1720, 1929 och IT-bubblan 2000. Historiens värde i utbildningen är mönsterigenkänning — att förstå HUR en bubbla ser ut inifrån, inte att förutsäga när nästa kommer.\n\nI bokmästar-kategorin finns ${bokAntal} KOMPLETT-kurser (hela böcker som kurser med quiz) — Mackays bok är en av dem (${epd ? epd.minuter + " min" : "i registret"}). Som alltid: detta är utbildning i historiens mönster — inga prognoser, inga placeringstips.` +
          kallradFler(kallor),
        amne: "tulpanmanin",
        kalla: k,
        kallor,
        handlings: [
          { text: "Boken som kurs: Extraordinary Popular Delusions", lank: "/kurser/extraordinary-popular-delusions", ikon: "🌷", beskrivning: "Mackay — massans galenskaper, KOMPLETT" },
          { text: "Boken som kurs: Manias, Panics, and Crashes", lank: "/kurser/manias-panics-and-crashes", ikon: "📕", beskrivning: "Kindleberger & Aliber — bubblemönstret" },
          { text: "Boken som kurs: The Great Crash 1929", lank: "/kurser/the-great-crash-1929", ikon: "📉", beskrivning: "Galbraith — hävstångens fall" },
          { text: "Kursen: Konjunkturcykler", lank: "/kurser/km-057-konjunkturcykler", ikon: "🔄", beskrivning: "Cyklerna bubblor föds ur" },
          { text: "Hur påverkar psykologin mitt sparande?", lank: "fragor:" + encodeURIComponent("hur påverkar psykologin mitt sparande?"), ikon: "🧠", beskrivning: "Massans psykologi — basens genomgång" },
        ],
        motfraga: { text: "Hur påverkar psykologin mitt sparande?", kategori: "beteendefinans" },
        fordjupa: { text: k.titel, lank: "/kurser/extraordinary-popular-delusions" },
      };
    },
  },
  {
    id: "bubbla",
    karnord: [
      "bubbla", "bubblan", "bubblor", "bubblorna",
      "börsbubbla", "börsbubblan", "börsbubblor",
      "spekulationsmani", "spekulationsbubbla",
      "kindleberger", "aliber", "south sea", "sydbubblan",
    ],
    starkord: [
      "spekulation", "eufori", "mani", "mania", "pris", "priser",
      "marknaden", "aktier", "panik", "historia", "it-bubblan",
    ],
    bygga: (reg) => {
      const rkAntal = reg.filter((r) => r.kategori === "RISKHANTERING").length;
      const kallor = [
        kursKalla(reg, "manias-panics-and-crashes", "Läroplanen — bokmästaren, Kindleberger & Aliber om bubblans fem faser"),
        kursKalla(reg, "extraordinary-popular-delusions", "Läroplanen — bokmästaren, Mackay om massans galenskaper"),
        kursKalla(reg, "the-great-crash-1929", "Läroplanen — bokmästaren, Galbraith om hävstångens roll i fallet"),
        kursKalla(reg, "rk-15-cykelrisk", "Läroplanen — riskhanteringen, konjunkturkänsligheten när cykeln vänder"),
      ];
      const k = kallor[0];
      const mpc = reg.find((r) => r.slug === "manias-panics-and-crashes");
      return {
        text:
          `En börsbubbla är en period då priset drivs av förväntan på nästa köpare snarare än av underlaget — och den har en förvånansvärt likartad inre anatomi. Den bästa kartan är Kindleberger & Alibers Manias, Panics, and Crashes, som bygger på Minskys fem faser (utbildning om mekanismen — ingen kommentar om nivåer):\n\n1️⃣ DE FEM FASERNA — (i) FÖRSKJUTNING: något nytt (teknik, handel, billiga lån) skapar berättad löftesrikedom; (ii) BOOM: priserna stiger, uppgången syns, fler ansluter; (iii) EUFORI: priserna kopplas från underlaget, "den här gången är det annorlunda" blir argumentet, nyckeltalet är att SÄLJARNA börjar tala om traditioner som exempel på okunnighet; (iv) VINSTTAGNING: de mest erfarna lämnar tyst; (v) PANIK: alla försöker ut samtidigt genom en dörr som är byggd för att gå in en i taget. Tulpanmanin 1637, South Sea 1720, 1929 och IT-bubblan 2000 är samma mönster i olika tappningar.\n2️⃣ VARFÖR BUBBLOR ÅTERKOMMER — minnet är generationskortet: den som inte själv satt i en eufori har bara hört talas om den, och varje ny teknik ger mönstret ett nytt berättigat skal. Därför är historiestudiet (bokmästarens tunga väsensdel) en del av riskutbildningen — igenkänning i realtid är svårt, kunskap om mönstret är möjligt.\n3️⃣ VAD BUBBELARBETET INTE ÄR — att peka ut en bubbla i efterhand är trivialt, i realtid omdömesgillt omöjligt; därför handlar riskhanteringskurserna om positionens utsatthet och cykelrisk — konjunkturkänsligheten i det egna sparandet — hellre än om att "kalla" marknaden. Förstå mekanismen, håll isär observation och slutsats: det är utbildningsuppdraget.\n\nKindleberger & Alibers bok finns som KOMPLETT-kurs (${mpc ? mpc.minuter + " min" : "i registret"}) — Alibers uppdaterade upplagor drar linjen ända till finanskrisen 2008. I kategorin riskhantering finns ${rkAntal} kurser. Som alltid: detta är utbildning i hur mönstret FUNGERAR — aldrig ett svar på vad marknaden gör härnäst.` +
          kallradFler(kallor),
        amne: "bubbla",
        kalla: k,
        kallor,
        handlings: [
          { text: "Boken som kurs: Manias, Panics, and Crashes", lank: "/kurser/manias-panics-and-crashes", ikon: "📕", beskrivning: "Kindleberger & Aliber — de fem faserna, KOMPLETT" },
          { text: "Boken som kurs: Extraordinary Popular Delusions", lank: "/kurser/extraordinary-popular-delusions", ikon: "🌷", beskrivning: "Mackay — de klassiska manierna" },
          { text: "Boken som kurs: The Great Crash 1929", lank: "/kurser/the-great-crash-1929", ikon: "📉", beskrivning: "Galbraith — euforins slutspel" },
          { text: "Kursen: Cykel-risk — konjunkturkänslighet", lank: "/kurser/rk-15-cykelrisk", ikon: "⛈️", beskrivning: "När cykeln vänder" },
          { text: "Vad är FOMO?", lank: "fragor:" + encodeURIComponent("vad är fomo?"), ikon: "🏃", beskrivning: "Driftkraften inuti euforin — djup-lagret" },
        ],
        motfraga: { text: "Vad är FOMO?", kategori: "beteendefinans" },
        fordjupa: { text: k.titel, lank: "/kurser/manias-panics-and-crashes" },
      };
    },
  },
  {
    id: "krasch1929",
    karnord: [
      "aktiekrasch", "aktiekraschen", "krasch",
      "1929", "galbraith",
      "depressionen", "stora depressionen",
      "finanskris", "finanskrisen",
    ],
    starkord: [
      "depression", "börsen", "aktier", "usa", "amerika",
      "belåning", "margin", "2008", "historia", "dow", "jones",
    ],
    bygga: (reg) => {
      const mkAntal = reg.filter((r) => r.kategori === "MAKROEKONOMI & RÄNTA").length;
      const kallor = [
        kursKalla(reg, "the-great-crash-1929", "Läroplanen — bokmästaren, Galbraiths klassiker om kraschen"),
        kursKalla(reg, "manias-panics-and-crashes", "Läroplanen — bokmästaren, Kindleberger & Aliber om krisernas mönster"),
        kursKalla(reg, "extraordinary-popular-delusions", "Läroplanen — bokmästaren, Mackay om massans galenskaper"),
        kursKalla(reg, "km-057-konjunkturcykler", "Läroplanen — makroekonomi, cykeln som förvandlade krasch till depression"),
      ];
      const k = kallor[0];
      const tgc = reg.find((r) => r.slug === "the-great-crash-1929");
      return {
        text:
          `Aktiekraschen 1929 är den mest studerade börskraschen i historien — och Galbraiths The Great Crash 1929 (${tgc ? tgc.minuter + " min som KOMPLETT-kurs" : "i registret"}) är fortfarande standardverket. Historien som utbildning, i tre delar:\n\n1️⃣ MEKANIKEN: HÄVSTÅNGEN — under 1920-talets slut kunde amerikaner köpa aktier med cirka 10 % egen insats och 90 % LÅN (marginalhandel); varje nedgång tvingade fram tvångsförsäljningar som tryckte priserna längre ned — en mekanisk förstärkningsloop. Ovanpå det: investment trusts, bolag som ägde aktier finansierade med skuld — hävstång på hävstång — vilket Galbraith lyfter fram som periodens mest renodlade spekulativa konstruktion.\n2️⃣ FÖRLOPPET — efter en topp i september 1929 kom Svarta torsdagen 24 oktober och den värre Svarta tisdagen 29 oktober, då exempelvis hundratusentals aktier bytte ägare i panik och kurserna föll dag efter dag. Dow-indexets resa från ~381 (september 1929) till ~41 (sommaren 1932) — en nedgång på ungefär 89 % — tog tre år av löpande fall, felköpta "bottnar" och rekyl-rallyn; depressionen som följde blev så djup att den samlade ekonomiska historien (konjunkturcykler, penningpolitik, banker och kreditförluster) är nödvändig för att förstå varför en börsfall blev en samhällskris.\n3️⃣ LÄRDOMARNA SOM SYSTEM — ur kraschen föddes mycket av den moderna marknadsregleringen i USA (bl.a. krav på åtskillnad mellan bank- och värdepappersrörelse samt upprättandet av en federal börsinspektion). Mönstret — eufori, hävstång, tvångsförsäljning, kreditkris — återkom med variationer i finanskrisen 2008 (där Alibers uppdaterade utgåva av Manias, Panics, and Crashes binder samman historien med nutiden); därför är krasch- och cykelstudiet kärna i riskutbildningen: att förstå hur UTSMETTNINGEN ser ut mekaniskt, inte att förutsäga nästa datum.\n\nI kategorin makroekonomi & ränta finns ${mkAntal} kurser — konjunkturcykler, riksbank och räntans roll i upp- och nedgångar. Som alltid: detta är utbildning i historiens mekanik — inga prognoser, inga placeringstips.` +
          kallradFler(kallor),
        amne: "krasch1929",
        kalla: k,
        kallor,
        handlings: [
          { text: "Boken som kurs: The Great Crash 1929", lank: "/kurser/the-great-crash-1929", ikon: "📉", beskrivning: "Galbraith — standardverket, KOMPLETT" },
          { text: "Boken som kurs: Manias, Panics, and Crashes", lank: "/kurser/manias-panics-and-crashes", ikon: "📕", beskrivning: "Krisernas mönster — från 1637 till 2008" },
          { text: "Boken som kurs: Extraordinary Popular Delusions", lank: "/kurser/extraordinary-popular-delusions", ikon: "🌷", beskrivning: "Mackay — maniernas anatomi" },
          { text: "Kursen: Konjunkturcykler", lank: "/kurser/km-057-konjunkturcykler", ikon: "🔄", beskrivning: "Från börsfall till depression" },
          { text: "Vad är ränta och hur påverkar den aktier?", lank: "fragor:" + encodeURIComponent("vad är ränta och hur påverkar den aktier?"), ikon: "🏦", beskrivning: "Penningpolitikens roll — makro-lagret" },
        ],
        motfraga: { text: "Vad är ränta och hur påverkar den aktier?", kategori: "makroekonomi" },
        fordjupa: { text: k.titel, lank: "/kurser/the-great-crash-1929" },
      };
    },
  },
];

// ── Huvudingången ──────────────────────────────────────────────────────────

/**
 * Svara lokalt med NÅGOT av de tre historie-mönstren — eller null (då har
 * hela kedjan före redan lämnat null och API-flödet tar över som förr).
 * Ligger SIST i widgetens kedja och kan därför aldrig stjäla en fråga från
 * tidigare lager. Samma matchningssemantik som basmotorn: minst ett
 * kärnord krävs, poäng = kärnord × 3 + stärkord, oavgjort → först
 * deklarerade mönstret vinner (strikt >, deterministiskt). Samma fråga ⇒
 * bitidentiskt svar.
 */
export function svaraLokaltHistoria(fraga: string, register: RegisterRad[]): LokaltSvar | null {
  const fragaStr = diafri(fraga);
  if (!fragaStr) return null;
  const fragaOrd = fragaStr.split(" ");
  let bast: { svar: LokaltSvar; poang: number } | null = null;
  for (const m of HISTORIA_MONSTER) {
    const karnTraff = m.karnord.filter((nk) => traff(fragaOrd, fragaStr, nk));
    if (karnTraff.length === 0) continue; // krav: minst ett kärnord
    const starkTraff = m.starkord?.filter((nk) => traff(fragaOrd, fragaStr, nk)) ?? [];
    const poang = karnTraff.length * 3 + starkTraff.length;
    if (!bast || poang > bast.poang) bast = { svar: m.bygga(register), poang };
  }
  return bast ? bast.svar : null;
}
