/**
 * AI-MENTORN 2.0 — BOKMASTER 2: INTERMARKET-KEDJAN + STORHETSSPRÅNGET
 * (v206-u1, manifest v206-mega-kapacitet-1789637000, byggare 1/6).
 *
 * TVÅ källmärkta monsters ur BOKMASTER-blockets 53 mentorväglösa kurser —
 * data-djupmetodens två tyngsta (sondens wc -c på data/bokmaster/*.json):
 *   1. INTERMARKET-KEDJAN («vad är intermarket-analys?»… — Murphys fyra
 *      tillgångsslag som ETT system: dollar → råvaror → obligationer →
 *      aktier) — intermarket-analysis primär (137 453 byte — blockets
 *      data-tätaste lösa kurs) + technical-analysis-financial-markets +
 *      the-visual-investor (Murphy-trilogin) + a-random-walk-down-wall-
 *      street (kontroversens EMH-sida) + martin-pring-on-market-momentum.
 *   2. STORHETSSPRÅNGET («vad är bra till bäst?»/«vad är good to great?»…
 *      — Collins transformationsforskning: urvalstratten, nivå 5,
 *      igelkottskonceptet, flugsvärmen) — good-to-great primär
 *      (130 341 byte — näst tyngst) + the-innovators-dilemma (bokens eget
 *      syskonkapitel) + competition-demystified (vallgravsbron) +
 *      made-in-america + shoe-dog + the-everything-store + zero-to-one.
 *
 * REGISTERBÄRNING: 12 mentorväglösa BOKMASTER-kurser aktiveras (5 + 7) —
 * varje källa en äkta slug i KURSREGISTER (testfall D vakar; kursKalla
 * faller tillbaka på «Läroplanen» om ett framtidsregister läcker en slug).
 * BOKMASTER 53 → 41 lösa kvar.
 *
 * ÄMNESVAL EFTER SOND (verktyg/_s6u1o36-sond.mjs LIVE 2026-09-28, samma
 * sond som fönster 36 — 495 kurser / 89 lagerfiler / 423 aktiva slugs):
 *   • Rond 1 (data-djup): BOKMASTER 53 lösa; de två tyngsta kurs-JSON:erna
 *     är intermarket-analysis 137 453 byte och good-to-great 130 341 byte.
 *     Avvisade större: financial-statement-analysis (145 669) och
 *     creative-cash-flow-reporting (138 187) — redan mentorlänkade via
 *     bokmastar-lagret (omgång 22). Trean elliott-wave-principle (130 225)
 *     avvisad som område: AK1TS ts-02/ts-22 äger vågfamiljen och basens
 *     teknisk analys-monster äger indikatorparaplyet (bokmastar-dok).
 *   • Rond 2 (kärnordsdisjunktion, 54 kandidater mot kedjans samtliga
 *     kärnord i sondens --karnord-läge + rågrep-dubbelsäkring):
 *     0 exakta kollisioner, 0 grannar inom tavstånd 2.
 *
 * DOKUMENTERADE GRÄNSER (etablerade lagers ägande — bärs i TEXT och i
 * modultestets F-fall; kärnorden lämnas sina ägare):
 *   • «teknisk analys» naket → basens monster (indikatorfamiljen);
 *     Murphys kurser här är SAMSPELET mellan tillgångsslag, inte
 *     indikatorläsning — motsatt läsfälla än elliott-avvisningen ovan.
 *   • «korrelationsrisken» → marknadsrytmen (SIST-grannen); detta lager
 *     äger korrelationsMATRISEN och regimelarmet — deras fråga bärs som
 *     knapp i intermarket-svaret.
 *   • «valutarisk»/«valutamekanik» → valutamekanik; här är dollarn bara
 *     kedjans första led. «styrräntan»/«inflation»/«deflation» naket →
 *     makro; detta lager bär «desinflation»/«desinflationsregimen» (fria)
 *     och inflationen endast som LÄNKEN råvaror–obligationer.
 *   • «råvaror»/«råvara» → etfmekanik (terminsfamiljen); naket «guld»
 *     lämnas öppet (bokens par är guldet mot DOLLARN, inte råvarufronten
 *     i sig — CRB-indexet är här mätaren).
 *   • «moat»/«vallgraven» → moatdjup + extra + basen; Collins cirkel ett
 *     ÄR vallgravsfrågan (V13–V15) men kärnordet lämnas sina ägare —
 *     deras fråga bärs som knapp i storhets-svaret.
 *   • «bullmarknad»/«björnmarknad» → marknadsrytm; «nätverkseffekter» →
 *     natverkseffekter (V15-sidan av cirkel ett); «enhetsekonomin» →
 *     enhetsekonomi (profit-per-x är NÄMNAREN, inte enhetsekonomin).
 *   • naket «bok» → basens böcker-monster (deras kärnord, exakt träff —
 *     KEDJETEST-FYND vid wireningen: «vad är murphy för bok?» skuggas
 *     av dem; Murphy-frågan bärs utan ordet «bok»).
 *
 * Aritmetiken i svaren — BÖCKERNAS EGNA, HISTORISKA TAL (flaggas i
 * texten; maskinellt omräknade i regressionstestets D-fall):
 *   • Intermarket: Dow −22,6 % den 19 oktober 1987 (index 100 → 77,4);
 *     Nikkei-topp 38 957 den 29 december 1989, runt −80 % ⇒
 *     38 957 × 0,20 ≈ 7 790 medan japanska statsobligationer STEG;
 *     guldet 252 dollar/uns sommaren 1999 → 400 dollar 2002–04 =
 *     +58,7 % ((400 − 252) ÷ 252 = 0,587); matrisens normalvärden
 *     obligationer–aktier +0,3 till +0,6 (mittpunkt +0,45), råvaror–
 *     obligationer −0,5 till −0,7, dollar–råvaror −0,4 till −0,6;
 *     rullande fönster 60–120 handelsdagar.
 *   • Storhet: tratten 1 435 Fortune 500-bolag (1965–1995) → 126 (8,8 %)
 *     → 19 → 11 (0,8 % av universum); elva bolag med i genomsnitt sju
 *     gånger marknaden under femton år ⇒ 7^(1/15) = 1,1385 ⇒ 13,9 %/år;
 *     Circuit City 18,5 gånger ⇒ 18,5^(1/15) = 1,2148 ⇒ 21,5 %/år;
 *     28-bolagsdesignen 11 + 11 + 6 = 28; tio av elva VD:ar odlade
 *     internt (10 ÷ 11 = 0,91 ⇒ 91 %) mot jämförelsebolagens externa
 *     räddare sex gånger oftare; igelkottskonceptet runt fyra år att
 *     kristallisera; Mockler Gillette 1975–1991 (16 år).
 *   • PÅHITTADE övningstal (tydligt märkta i texten, D-fall vakar):
 *     kvot-exemplet aktieindex 240 / obligationspris 120 = 2,00; aktier
 *     +10 % (→ 264) och obligationer −5 % (→ 114) ⇒ 264/114 = 2,32 =
 *     +16 % relativ rörelse; flugsvärmsövningen tolv kvartal samriktade.
 *
 * KEDJEPLATS: 90:e motorn — EFTER faktorfadrarna (fönster 41:s syskon),
 * FÖRE marknadsrytm (deras SIST-deklaration respekteras). Kärnorden är
 * mekaniskt disjunkta mot samtliga övriga lager (sond + detta lagers
 * eget test, J-fall) och kedjetestets strukturfall.
 *
 * Matchningen speglar motorns hjälpfunktioner (samma lösning som alla
 * syskinlager: Node type-stripping löser endast `import type`, så de rena
 * funktionerna speglas hit). Semantisk likhet med motorn BEVISAS av
 * testets felstavningsfall (B) och determinismfall (C). Driftvarning:
 * ändras motorns matchning måste denna spegel följa — testfall B vakar.
 *
 * ── JURIDIKGRINDEN (lagen 2007:528) ──────────────────────────────────
 * All text är pedagogisk utbildning om hur intermarket-sambanden och
 * transformationsforskningen DEFINIERAS, MÄTS och LÄS — inga köp-/
 * säljsignaler, inga placeringstips. Historiska bolagsnamn (Kimberly-
 * Clark, Gillette, Walgreens, Nucor, Wells Fargo med flera) är bokens
 * publicerade forskningsmaterial från 1965–1995 och behandlas uteslutande
 * som historiska läroboksexempel — kontroverskapitelen (båda böckernas)
 * påpekar själva survivorship-varningen: de elva är exempel på METODER,
 * inte köplistor. Övningsexemplens tal är påhittade där de inte är
 * bokens egna historiska fakta.
 *
 * ── DEPENDENCY-INJECTION (samma mönster som hela motorn) ─────────────
 * Registret skickas IN som parameter (endast `import type`) så att
 * verktyg/testa-ai-mentor-bokmastar2.mjs kan köra filen direkt i Node.
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
 * av testfall A («📖 Källor (»).
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

// ── Monster 1: intermarket-kedjan (intermarket-analysis) ───────────────────

export const BOKMASTAR2_MONSTER: FragMonster[] = [
  {
    id: "intermarket-kedjan",
    karnord: [
      // Sond 2026-09-28 (två ronder, 54 kandidater mot kedjans samtliga
      // kärnord): 0 kollisioner, 0 grannar. Gränser: «teknisk analys» →
      // basen; «korrelationsrisken» → marknadsrytm; «valutarisk» →
      // valutamekanik; «inflation»/«deflation» → makro; «råvaror» →
      // etfmekanik; naket «guld» lämnas öppet (dokumenterat).
      "intermarket", "intermarket analys", "intermarket analysen",
      "intermarketanalys", "intermarket kedjan", "intermarket modellen",
      "murphy", "murphy grafen",
      "fyra tillgångsslag", "tillgångsslagen", "tillgångsslagskedjan",
      "normalförhållandet", "normalförhållande", "flight to quality",
      "crb index", "crb", "råvarufronten", "inflationens länk",
      "dollarns kedja", "valutakedjan", "sektorsrotation", "rotationen",
      "regimskiftet", "regimelarmet", "desinflation", "desinflationsregimen",
      "korrelationsmatris",
    ],
    starkord: [
      "obligationer", "obligation", "aktier", "aktiemarknaden", "ränta",
      "räntan", "räntor", "råvaror", "dollar", "dollarn", "guld", "valuta",
      "valutor", "korrelation", "regimen", "kedjan", "marknaderna",
      "sektorer", "index", "kvot",
    ],
    bygga: (reg) => {
      const bokAntal = reg.filter((r) => r.kategori === "BOKMASTER").length;
      const kallor = [
        kursKalla(reg, "intermarket-analysis", "Läroplanen — Murphys kanoniska text om de fyra tillgångsslagen som ett system: kedjan, normalförhållandet, brytningarna, mätverktygen och kontroversen"),
        kursKalla(reg, "technical-analysis-financial-markets", "Läroplanen — Murphys lärobok: verktygslådan som intermarket-läsningen bygger på"),
        kursKalla(reg, "the-visual-investor", "Läroplanen — Murphys nybörjarbok: grafläsningens dörr"),
        kursKalla(reg, "a-random-walk-down-wall-street", "Läroplanen — Malkiels EMH-sida: kontroversens motpart om samkörningen redan är prissatt"),
        kursKalla(reg, "martin-pring-on-market-momentum", "Läroplanen — Pring om momentum: den mekanik kedjans led läses genom"),
      ];
      const k = kallor[0];
      const imk = reg.find((r) => r.slug === "intermarket-analysis");
      return {
        text:
          `Intermarket-analys är idén som John J. Murphy myntade som disciplin och syntetiserade i Intermarket Analysis (Wiley, 2004): de fyra tillgångsslagen — obligationer, aktier, råvaror och valutor — är inte fyra marknader utan ETT system, och varje marknad måste läsas i de andras ljus. Hans två andra böcker har varsin roll i katalogen (The Visual Investor är dörren till grafläsning, läroboken är verktygslådan) — denna är det tredje hörnet: samspelet. Kedjan i normalregimen har fast ordning: dollarns trend sätter prisenheten → råvarorna svarar med månadsfördröjning → obligationsmarknaden diskonterar inflationstrycket → aktierna kommer sist i kön eftersom de diskonterar allt det andra PLUS sina egna vinster. 1980-talet var kedjans negativa variant (svag dollar → stigande råvaror → fallande obligationer → slitna aktier); 1990-talet den positiva spegelvärlden (stark dollar → fallande råvaror → stigande obligationer → stigande aktier). Allt nedan är utbildning i hur samspelet LÄS och MÄTS — inga placeringstips, och de historiska talen är bokens egna forskningsfakta.\n\n1️⃣ 1987 — KEDJANS KÄNDA FALL. Plaza-avtalet 1985–86 försvagade dollarn (svag valuta = importerad inflation). Våren 1987 bröt råvarumarknaden — med CRB-index i spetsen — kraftigt uppåt: inflationen var tillbaka, den tidigaste varningen. Obligationsmarknaden vände nedåt (stigande räntor, nya räntetoppar), och aktiernas utdelningsavkastning närmade sig obligationsräntan tills gapet i princip var borta. Den 19 oktober 1987 föll Dow med 22,6 procent på en dag — index 100 → 77,4 — och kraschen var världsomspännande på timmar (beviset att systemet nu var ett system). Bokens poäng är inte fallet utan ORDNINGEN: råvarorna och obligationerna berättade historien först, aktiemarknaden levererade slutsatsen sist. Kursens egen varning — nackdelarna med efterklokhet: i realtid hade varje enskild signal alternativa förklaringar; därför är slutprodukten ett REGELVERK (fyra rader med mätbara villkor: CRB över 52-veckors högsta? 10-årig ränta över 52-veckors högsta? utdelningsavkastningen inom någon procentenhet av obligationsräntan?), inte minnet av 1987.\n2️⃣ NORMALFÖRHÅLLANDET — OBLIGATIONER OCH AKTIER TILLSAMMANS. Det normala är positiv samrörelse, genom fyra kanaler: diskonteringskanalen (lägre ränta → högre nutidsvärde av framtida kassaflöden), konkurreringskanalen (obligationsavkastningen är aktiens alternativkostnad), konjunkturkanalen (billigare kredit → efterfrågan → vinster) och kreditkanalen (räntan prissätter balansräkningens andra sida). Bokens illustrativa normalvärden — murphy-modellens korrelationsmatris: obligationer–aktier +0,3 till +0,6 (mittpunkt +0,45), råvaror–obligationer −0,5 till −0,7 (inflationens länk — den viktigaste inversa relationen), dollar–råvaror −0,4 till −0,6 (råvaror prissätts i dollar), guld–dollar starkast negativ i klassen (guldet som valutaspegel). 1990-talet blev normalförhållandets paradfall: desinflationen sjönk räntorna i mångårig trend och obligationer och aktier steg tillsammans.\n3️⃣ BRYTNINGARNA — NÄR NORMALEN DÖR. Flight to quality: när paniken slår till flyr kapitalet till statspapper och relationen vänder tecken. Deflationsregimen — bokens tydligaste exempel Japan: Nikkei toppade på 38 957 den 29 december 1989 och föll därefter i över ett decennium, som mest runt 80 procent (38 957 × 0,20 ≈ 7 790) — medan Japans STATSOBLIGATIONER STEG och räntan sjönk mot noll: fallande räntor UTAN stigande aktier, normalförhållandets negation. Guldet visar frontens bottnar och vändningar: 252 dollar per uns sommaren 1999, Washington-agreementet i september 1999 (centralbanker begränsade guldutlåning), och 2002–04 dollarn föll + guldet bröt uppåt mot 400 dollar + CRB till nya högsta sedan början av 1980-talet — en rörelse på (400 − 252) ÷ 252 = 0,587 alltså +58,7 procent. Och anomalin Murphy själv lyfter fram: 2002–03 steg råvaror OCH obligationer tillsammans (Kinas desinflationschock + flykt efter IT-kraschen) — kedjan är ett regelverk, inte en maskin; när två led pekar motsatt är systemet i övergång och uppgiften är att MARKERA övergången, inte tvinga kedjan till lydnad.\n4️⃣ MÄTA — KVOTER OCH FÖRÄNDRINGAR. Murphys instrument är den relativa styrka-kvoten mellan två tillgångar (aktieindex delat med obligationspris — ett mått på vilken som leder). Övningstal, tydligt PÅHITTADE: aktieindex 240 mot obligationspris 120 ger kvoten 2,00; stiger aktierna 10 procent (till 264) medan obligationer faller 5 procent (till 114) blir kvoten 264/114 = 2,32 — en relativ rörelse på runt +16 procent ur en absolut på +10. Kvoten förstorar det som skiljer. Korrelationskoefficienten används på FÖRÄNDRINGAR (dags- eller veckoförändringar) i ett rullande fönster på 60–120 handelsdagar — ALDRIG på prisnivåer: två serier som båda trendar uppåt får automatiskt hög korrelation utan annat samband än gemensam trend (isglass-försäljningen och drunkningsolyckorna korrelerar också — av samma skäl: sommaren). En korrelationsserie som FLIPPAR tecken är inte brus utan REGIMELARM som förtjänar ett eget beslut.\n5️⃣ KONTROVERSEN — INSTABILITETEN ÄR OBJEKTET. Kritiken: korrelationer klustrar och flippar; obligation/aktie-korrelationen var positiv under decennier, vände efter 2000-talets centralbanks-era, och i finanskrisen 2008 gick korrelationen mellan risktillgångar mot ETT — «allt korrelerade till 1» — då diversifieringen kollapsade samtidigt som normal-sambanden. EMH-skolan (Malkiel — grannkursen i katalogen) tillägger: kända samband arbitreras bort. Murphys svar, som kursen formaliserar: specialiserade deltagare och ojämnt rörligt kapital lämnar EFTERSLÄPNING mellan slagen — kedjans turordning ÄR den eversläpningen — och korrelationsinstabiliteten är inte modellens fel utan modellens OBJEKT: läs världen (regimen), inte tabellen. I krisens akuta fas gäller INGEN normal-modell — slutsatsen är riskhantering, inte finare sambandsmodeller. AKM1-bryggan: regimen översätts till bolagsrader — V10 skuldsättningsgrad (räntekänsligheten), V07 (råvarorna som inputpris), V12 intäktsstabilitet mot V01 tillväxt (vilken variabel marknaden just betalar för); AK1TS läser samspelet deterministiskt per horisont med OSATT när underlaget är motstridigt — aldrig gissning.\n6️⃣ RITUALEN — FYRA RUTOR, EN DIAGNOS. (1) Rita panelen: dollarindex, råvaruindex (CRB-typ), lång statsobligation, brett aktieindex — veckograf, två års fönster. (2) Klassa varje graf: upp, ned eller sidledes. (3) Para med matrisens förväntade tecken och leta flippar. (4) Skriv en regime-diagnos på max tre meningar — inflation, desinflation, deflation eller kris — och upprepa första söndagen varje månad. Kursen på ${imk ? imk.kapitel : 16} kapitel (${imk ? imk.quiz : 48} quiz-frågor) är utbildningen; panelen är verktyget.\n\nI kategorin bokmaster finns ${bokAntal} kurser — med intermarket-analysen, de två Murphy-syskonen, random walk och Pring blir fem av blockets kurser mentorlänkade i detta svar. Som alltid: detta är utbildning i en läsmetod — inga placeringstips.` +
          kallradFler(kallor),
        amne: "intermarket-analys",
        kalla: k,
        kallor,
        handlings: [
          { text: "Kursen: Intermarket Analysis — Murphy", lank: "/kurser/intermarket-analysis", ikon: "🌐", beskrivning: "De fyra tillgångsslagen som ett system" },
          { text: "Kursen: Technical Analysis of the Financial Markets", lank: "/kurser/technical-analysis-financial-markets", ikon: "🧰", beskrivning: "Murphys verktygslåda" },
          { text: "Kursen: The Visual Investor", lank: "/kurser/the-visual-investor", ikon: "👁️", beskrivning: "Grafläsningens dörr" },
          { text: "Kursen: A Random Walk Down Wall Street", lank: "/kurser/a-random-walk-down-wall-street", ikon: "🎲", beskrivning: "EMH-sidan av kontroversen" },
          { text: "Kursen: Martin Pring on Market Momentum", lank: "/kurser/martin-pring-on-market-momentum", ikon: "📈", beskrivning: "Momentum-mekaniken i kedjans led" },
          { text: "Vad är korrelationsrisken?", lank: "fragor:" + encodeURIComponent("vad är korrelationsrisken?"), ikon: "📉", beskrivning: "Grannens fråga — riskmåttssidan" },
          { text: "Vad är styrräntan?", lank: "fragor:" + encodeURIComponent("vad är styrräntan?"), ikon: "🏦", beskrivning: "Räntans makrosida" },
          { text: "Vad är valutarisk?", lank: "fragor:" + encodeURIComponent("vad är valutarisk?"), ikon: "💱", beskrivning: "Dollarns led på djupet" },
        ],
        motfraga: { text: "Vad är korrelationsrisken?", kategori: "intermarket-analys" },
        fordjupa: { text: k.titel, lank: "/kurser/intermarket-analysis" },
      };
    },
  },
  {
    id: "storhetssprånget",
    karnord: [
      // Sond 2026-09-28 (rond 2): 0 kollisioner. Gränser: «moat»/«vallgraven»
      // → moatdjup/extra/basen (cirkel ett refererar V13–V15 i TEXT);
      // «nätverkseffekter» → natverkseffekter; «enhetsekonomin» →
      // enhetsekonomi; «bullmarknad» → marknadsrytm.
      "good to great", "bra till bäst", "storhetssprånget", "storhetssprång",
      "collins", "jim collins", "nivå 5", "nivå 5 ledarskap", "nivå fem",
      "fem nivåer", "igelkott", "igelkotten", "igelkottskonceptet", "hedgehog",
      "hedgehog konceptet", "tre cirklar", "flugsvärmen", "svänghjulet",
      "svänghjul", "domedagsloopen", "profit per x", "nämnaren",
      "fönstret och spegeln", "stockdale", "stockdale paradoxen",
      "karismatikern", "karisma",
    ],
    starkord: [
      "bolag", "bolaget", "bolagen", "ledarskap", "ledningen", "vd",
      "storhet", "transformation", "transformationen", "företaget",
      "företagen", "disciplin", "kulturen", "momentum", "hjulet",
      "forskning", "urmärkta",
    ],
    bygga: (reg) => {
      const bokAntal = reg.filter((r) => r.kategori === "BOKMASTER").length;
      const kallor = [
        kursKalla(reg, "good-to-great", "Läroplanen — Collins transformationsforskning: urvalstratten, nivå 5-ledarskapet, igelkottskonceptet, flugsvärmen och kontroversen"),
        kursKalla(reg, "the-innovators-dilemma", "Läroplanen — Christensens syskonverk: innovationens dilemma mot storhetens kontinuitet"),
        kursKalla(reg, "competition-demystified", "Läroplanen — Greenwald & Kahn: vallgravsteorin som cirkel ett fördjupar"),
        kursKalla(reg, "made-in-america", "Läroplanen — Sam Walton: grundarberättelsen som nivå 5-fallet från verkligt liv"),
        kursKalla(reg, "shoe-dog", "Läroplanen — Phil Knight: Nike-bygget som svänghjul i berättelseform"),
        kursKalla(reg, "the-everything-store", "Läroplanen — Bezos och Amazon: nämnar-tänkandets moderna fall"),
        kursKalla(reg, "zero-to-one", "Läroplanen — Thiel: nolltillett-tänkandet som storhetssprångets motsats-fråga"),
      ];
      const k = kallor[0];
      const g2g = reg.find((r) => r.slug === "good-to-great");
      return {
        text:
          `Bra till bäst (Good to Great, Jim Collins m.fl., 2001) är transformationsforskningens mest inflytelserika verk — och en metodfråga innan den är något annat: VAD är storhet, mätt BARA FÖRE utfallet? Forskarlaget (över tjugo personer under fem år) började med universum: de 1 435 Fortune 500-bolag som förekom på listorna 1965–1995. Tratten: 1 435 → 126 gick vidare i första gallringen (händelsen «hopp från medelmåttighet» — 8,8 procent) → 19 efter hårdare krav (minst tre gånger marknaden, sektoreffekter rensade) → ELVA great-bolag — 0,8 procent av universum — som efter en tydlig övergångspunkt slog allmänna marknaden med i genomsnitt runt sju gånger under femton år. Sju gånger på femton år är 7^(1/15) = 1,1385 — alltså 13,9 procent per år i snitt — år efter år; Circuit City nådde hela 18,5 gånger = 18,5^(1/15) = 1,2148 alltså 21,5 procent per år. Designen — metodens pedagogiska guld: 28 bolag i tre grupper (11 great + 11 direkta jämförelsebolag + 6 icke-beständiga transformationer, 11 + 11 + 6 = 28), så att varje hypotes prövades mot dem som FÖRSÖKTE men inte höll. Allt nedan är utbildning om publicerad forskning — de elva är historiska läroboksexempel på metoder, inte köplistor; inga placeringstips.\n\n1️⃣ NIVÅ 5-LEDARSKAPET — BLYGSAM VILJA. Pyramiden har fem nivåer (kapabel individ → bidragande lag spelare → kompetent chef → effektiv ledare → nivå 5), men poängen är att nivå 4 inte är en lägre grad av nivå 5 — det är en ANNAN SORT: nivå 4 bygger storhet som står och faller med personen; nivå 5 bygger en maskin som fungerar utan hen (klockbyggaren, inte tidtäljaren). Ikonerna: Darwin Smith på Kimberly-Clark (VD från 1971, tillsagd av pressen att han inte var kvalificerad — tjugo år senare hade bolagets varumärken tagit andelar från Procter & Gamble) och Colman Mockler på Gillette (1975–1991, sexton år): under två fientliga budvågor (Revlons Perelman 1986, senare Coniston) vägrade han sälja och satte kapitalet i produktsatsningar i stället — hade han kapitulerat hade KÖPARNA inkasserat de kommande åren, inte de kvarvarande aktieägarna. Datans mönster: i tio av elva great-bolag kom VD:n inifrån — 10 ÷ 11 = 0,91 alltså 91 procent — medan jämförelsebolagen anställde externa räddare sex gånger oftare. Verktyget är FÖNSTRET OCH SPEGELN: nivå 5 tittar ut genom fönstret vid framgång (kredit till andra och tur) och in i spegeln vid motgång (mitt ansvar); karismatikern gör motsatsen. Karisma är en lyxskatt: den köper uppmärksamhet och betalas med sanningen — omgiven av människor som säger det ledaren vill höra.\n2️⃣ IGELKOTTKONCEPTET — TRE CIRKLAR. Cirkel ett: vad kan bolaget bli BÄST I VÄRLDEN på — och lika viktigt, vad kan det ALDRIG vara bäst på (kompetensfällan: att vara bra på något är inte detsamma som att kunna bli BÄST på det)? Cirkel två: vad driver den ekonomiska motorn djupast — operationaliserat som EN enda nämnare, profit per x. Cirkel tre: vad tänder organisationen på riktigt? Konceptet är inte ett mål utan en FÖRSTÅELSE — great-bolagen behövde i genomsnitt runt FYRA år att kristallisera den, genom rådets frågor. Nämnarna ur boken: Wells Fargo — vinst per ANSTÄLLD (ägar-tänk i avreglerad bank); Walgreens — vinst per KUNDBESÖK (bekvämlighetens ekonomi: butikstäthet, hörnlägen, drive-through); Nucor — vinst per TON stål (minimill-ekonomin). AKM1-översättningen: cirkel ett = moat-blocket V13–V15 (patent, varumärke, nätverk — poängen FÅR bara vara hög om cirkeln finns), cirkel två = V07–V09 (brutto-/EBITDA-marginal, ROE som motorns instrument), cirkel tre = V01–V02 (ihållig tillväxt som energi-spår). Kravet är SAMMANHANG: moat stark men marginaler svag → någon cirkel är en illusion; motor utan moat → commodity som kommer pressas.\n3️⃣ FLUGSVÄRMEN — MOMENTUM UTAN MIRAKELÖGONBLICK. Transformationen är som att sätta igång ett enormt svänghjul: första trycket flyttar inget, hundrade trycken knappt något, tusende trycken får hjulet att snurra — och till sist går det varv av egen kraft utan att någon enskild push kan identifieras som DEN avgörande. Genombrottet i aktiekursen var en FÖLJD av momentum, inte en orsak till det. Spegelbilden är DOMEDAGSLOOPEN: misslyckade starter → ackumulerat missnöje → tron att ett dramatiskt drag ska vända allt (stort förvärv för att KÖPA momentum — Collins kallar det ympning — extern stjärn-VD, revolutionerande omorganisation); Rubbermaid och Chrysler är bokens fall. Investerarens översättning (övningstal, PÅHITTADE): räkna hur många kvartal I FÖLJD som V01–V02 (tillväxt) och V07–V09 (motor) pekar samma riktning — tolv kvartal samriktade är ett snurrande hjul; stark V16–V18-aktivitet med svajande motor är loop-signaturen. Strategisk churn — fler än ett par riktningsändringar per år — är den mätbara ledtråden.\n4️⃣ KONTROVERSEN — SURVIVORSHIP OCH SLUMPENS MÖNSTER. Kritiken mot boken är ärligt bokförd i kursen: urvalet är gjort EFTER utfall (survivorship), slumpen kan måla mönster, och efterföljden varade inte — Circuit City och Fannie Mae föll senare, och även Built to Last-kullar (Motorola, Merck) tappade storheten, vilket tvingade fram uppföljningen Great by Choice (2011: 20 Mile March — tjugomilsmarschen — och kulorna). Collins försvar: studien definerade «great» mätbart FÖRE utfall (tratten ovan) och jämförde mot dem som försökte. AKM1:s syntes är därför metodisk: definiera kriterierna i förväg, mät samma variabler varje kvartal, och läs tidsseriernas ACKUMULATION — inte enstaka kvartal. Bokens fråga «kan bli bäst» är en jämförelse- och potentialfråga — exakt vallgravsfrågan (därav kopplingen till Competition Demystified), och Christensens syskonverk kompletterar: vallgraven kan OMDEFINIERAS bort av nya arkitekturer, varför kontinuitet (nivå 5, hjulet) och förnyelse måste bäras av samma organisation.\n5️⃣ RITUALEN — FYRA GRANSKNINGAR. (1) FÖNSTRET OCH SPEGELN: läs fyra senaste rapporter för ett bolag — vem fick krediten för framgångarna, vem bar skulden för motgångarna? En enda mening där ledningen tar fullt ansvar för ett misslyckande är en av de mest informationsräta en årsredovisning innehåller. (2) TRE-CIRKELVERKSTADEN: fyll varje cirkel med tre kandidater, stryk tills en återstår per cirkel, och pröva mot V13–V15/V07–V09/V01–V02. (3) NÄMNARJAKTEN: gissa tre kandidat-nämnare, läs tre rapporter — nämns någon? styrs bonusen mot den? (4) FLUGSVÄRMSREVISIONEN: fem år bakåt — riktningsändringar per år mot samriktade kvartal. Kursen på ${g2g ? g2g.kapitel : 15} kapitel (${g2g ? g2g.quiz : 45} quiz-frågor) är forskningsläsningen; de fyra granskningarna är verktygen.\n\nI kategorin bokmaster finns ${bokAntal} kurser — med good-to-great och dess sex källkursers aktiveringar blir sju av blockets kurser mentorlänkade i detta svar. Som alltid: detta är utbildning om publicerad forskning och dess gränser — inga placeringstips.` +
          kallradFler(kallor),
        amne: "bra till bäst",
        kalla: k,
        kallor,
        handlings: [
          { text: "Kursen: Good to Great — Collins", lank: "/kurser/good-to-great", ikon: "🚀", beskrivning: "Från medelmåttighet till varaktighet" },
          { text: "Kursen: The Innovator's Dilemma", lank: "/kurser/the-innovators-dilemma", ikon: "💡", beskrivning: "Vallgraven som kan omdefinieras" },
          { text: "Kursen: Competition Demystified", lank: "/kurser/competition-demystified", ikon: "🏰", beskrivning: "Vallgravsteorin bakom cirkel ett" },
          { text: "Kursen: Made in America", lank: "/kurser/made-in-america", ikon: "🛒", beskrivning: "Waltons grundarberättelse" },
          { text: "Kursen: Shoe Dog", lank: "/kurser/shoe-dog", ikon: "👟", beskrivning: "Nike — svänghjulet i berättelseform" },
          { text: "Kursen: The Everything Store", lank: "/kurser/the-everything-store", ikon: "📦", beskrivning: "Amazon — nämnar-tänkandets fall" },
          { text: "Kursen: Zero to One", lank: "/kurser/zero-to-one", ikon: "0️⃣", beskrivning: "Nolltillett mot bra-till-bäst" },
          { text: "Vad är en moat?", lank: "fragor:" + encodeURIComponent("vad är en moat?"), ikon: "🏰", beskrivning: "Grannens fråga — cirkel ett på djupet" },
          { text: "Vad är Metcalfe's lag?", lank: "fragor:" + encodeURIComponent("vad är metcalfes lag?"), ikon: "🕸️", beskrivning: "V15-sidan av vallgraven" },
          { text: "Vad är enhetsekonomin?", lank: "fragor:" + encodeURIComponent("vad är enhetsekonomin?"), ikon: "⚙️", beskrivning: "Nämnarens släkting — per-enhet-logiken" },
        ],
        motfraga: { text: "Vad är en moat?", kategori: "bra till bäst" },
        fordjupa: { text: k.titel, lank: "/kurser/good-to-great" },
      };
    },
  },
];

// ── Huvudingången ──────────────────────────────────────────────────────────

/**
 * Svara lokalt med bokmaster-2-mönstret — eller null (då har hela kedjan
 * före redan lämnat null och API-flödet tar över som förr). Ligger efter
 * faktorfadrarna och FÖRE marknadsrytm i widgetens kedja och kan därför
 * aldrig stjäla en fråga från ett tidigare lager. Basen äger «teknisk
 * analys» (indikatorfamiljen), marknadsrytm äger «korrelationsrisken»,
 * moatdjup äger «moat» — detta lager äger INTERMARKET-vinkeln (fyra
 * tillgångsslag, kedjan, regimen) och STORHETS-vinkeln (bra till bäst,
 * nivå 5, igelkotten, flugsvärmen) — alla NULL genom kedjan före detta
 * lager (H-fallet bevisar). Samma matchningssemantik som basmotorn:
 * minst ett kärnord krävs, poäng = kärnord × 3 + stärkord, oavgjort →
 * först deklarerade mönstret vinner (strikt >, deterministiskt). Samma
 * fråga ⇒ bitidentiskt svar.
 */
export function svaraLokaltBokmastar2(fraga: string, register: RegisterRad[]): LokaltSvar | null {
  const fragaStr = diafri(fraga);
  if (!fragaStr) return null;
  const fragaOrd = fragaStr.split(" ");
  let bast: { svar: LokaltSvar; poang: number } | null = null;
  for (const m of BOKMASTAR2_MONSTER) {
    const karnTraff = m.karnord.filter((nk) => traff(fragaOrd, fragaStr, nk));
    if (karnTraff.length === 0) continue; // krav: minst ett kärnord
    const starkTraff = m.starkord?.filter((nk) => traff(fragaOrd, fragaStr, nk)) ?? [];
    const poang = karnTraff.length * 3 + starkTraff.length;
    if (!bast || poang > bast.poang) bast = { svar: m.bygga(register), poang };
  }
  return bast ? bast.svar : null;
}
