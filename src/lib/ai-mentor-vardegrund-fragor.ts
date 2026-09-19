/**
 * AI-MENTORN 2.0 — VÄRDEGRUND-FÖRHANDSFRÅGOR (spår 6, omgång 23, s6-u3).
 *
 * Tre källmärkta förhandsfrågor ovanpå de femtio committade lagren —
 * värderingsfamiljens grundvåning:
 *   1. INTRINSIC VALUE / MOTIVERAT VÄRDE ("vad är motiverat värde?") —
 *      aktiens inre värde som begrepp + miniräknaren DCF med hela kedjan
 *      10,00 → 184,6 kronor (vm-02 primär + vr-05 + vr-06 + vr-07)
 *   2. REALOPTIONERNA ("vad är realoptioner?") — värdet av flexibilitet:
 *      gruvträdet där väntandet är värt 35 miljoner (vm-05 primär +
 *      vm-02 + vm-11)
 *   3. KASSAFLÖDESAVKASTNINGEN ("vad är kassaflödesavkastning?") —
 *      FCF-yield 4 ÷ 100 = 4,0 % och multiplarnas inverterade kusin
 *      (vm-07 primär + vm-09 + vm-10 + km-028)
 *
 * REGISTERBÄRNING: startsweepen (_s6u3-sond-omg23.mjs, 50 motorer / 132
 * monsters / 446 kurser) räknade 293 nådda kurser — VÄRDERINGSMETODER var
 * 7/7 mentorväglösa (km-028, vm-02, vm-05, vm-07, vm-09, vm-10, vm-11) och
 * VÄRDERING saknade dessutom vr-05/vr-06/vr-07. Detta lager aktiverar
 * TIO kurser: vm-02/05/07/09/10/11 + km-028 primära/källor + vr-05/06/07
 * som källor — hela det fria värderingsblocket. Värderingsmetoderna har
 * tidigare lager (värderingsverktyg: scenario/DDM/PEG; varderjustering:
 * normalisering/CAPE) men ingen bar själva värdegrunden.
 *
 * ÄMNESVAL EFTER SOND I TRE RONDER (verktyg/_s6u3-sond{,2,3}-omg23.mjs,
 * otrackade; kedjan LIVE-läst ur chat-widget.tsx, 1 453 kärnord i svepet):
 *   • Rond 2 DÖDADE reverse-DCF som eget monster: Nästa-motorn äger hela
 *     DCF-kärnordsfamiljen («vad är reverse dcf?»/«omvänd dcf?»/«baklänges
 *     dcf?» alla FÅNGADE av nästa; endast «omvänd diskonteringsmodell?»
 *     NULL) — km-028 bärs i stället som KÄLLA i monster 3 (V19:
 *     källägande ≠ kärnordsägande).
 *   • Rond 2 DÖDADE P/CF- och substans-formuleringarna: Extra äger «fcf
 *     yield»/«free cash flow yield»/«price to cash flow», Nästa äger
 *     «substansvärde»/«substansbaserad värdering»/«tillgångsbaserad
 *     värdering»/«inre värde», Lönsamhetsdjupet «wacc», Basen «pris och
 *     värde», Djup «jämförelsebolag» — samtliga deras frågor bärs som
 *     knappar eller nämns endast i text.
 *   • Rond 3 DOKUMENTERAD RISK (ncav↔nav-precedensen): «verkliga optioner»
 *     och «real option» (med mellanslag) fångas av Nästa (option-familjen)
 *     trots grön kärnordsdisjunktion — sammanskrivna «realoption(er)» är
 *     detta lagers; frågor med nakna «option(er)» lämnas åt Nästa och
 *     länkas som knapp. «p/cf» STRYKS som kärnord (8 grannar: fcf, p/e,
 *     dcf, put, etf, kf, peg, pmi).
 *   • Kvarvarande fria kärnord, samtliga NULL genom kedjan + 0 grannar
 *     (tavstånd ≤ 2): intrinsic value, motiverat värde, motiverade värde,
 *     verkligt värde, fair value, motiverat aktiepris, realoptioner,
 *     realoption, kassaflödesavkastning, kassaflödesavkastningen,
 *     asset based valuation.
 *
 * ANSVARSFÖRDELNING (syskonlagrens dokumentationsplikt):
 *   • Nästa äger DCF-ordfamiljen, «inre värde», substans- och tillgångs-
 *     orden och option-familjen — deras frågor knapp-länkas, aldrig kärnord.
 *   • Extra äger kassaflödesanalysen och de engelska yield-orden; detta
 *     lager bär endast den svenska sammansättningen kassaflödesavkastning.
 *   • Lönsamhetsdjupet äger WACC; vm-11 (WACC-fällor) är här KÄLLA (V19).
 *   • Varderingsverktyget äger scenarioanalys/DDM/PEG — värdegrunden
 *     (vm-02-familjen) var fri och är nu detta lagers.
 *
 * DOKUMENTERAD RISK (accepterad): «fair value» delas med redovisningens
 * värdebegrepp (IAS-fair value) — kedjans sweep visar NULL hos alla 50
 * motorer och Bokföringsdjupets IFRS-familj ligger på engelska med andra
 * sammansättningar («fair value» togs med i rond 2/3-proverna utan fånga);
 * passerar annars till API-flödet som förut.
 *
 * Aritmetiken i alla tre svar (påhittade tal, maskinellt omräknade i
 * regressionstestets D-fall):
 *   • Intrinsic value: FCF₀ 10,00 kr, tillväxt 5 %, diskonto 8 %, evig 2 %:
 *     år 1–3 = 10,50/11,03/11,58 (exakt 11,57625), nuvärden 9,72 + 9,45 +
 *     9,19 = 28,36; TV = 11,57625 × 1,02 ÷ 0,06 = 196,80 → diskonterat
 *     156,22; totalt 184,59 ≈ 184,6. Terminalandelen 156,22 ÷ 184,6 =
 *     84,6 %. Kurs 150 → 150 ÷ 184,6 = 0,81 (19 % under värdet).
 *     Nämnarläxan 8 → 9 %: 158,1 = −14 % (vm-11:s kärna).
 *   • Realoptioner: brytning idag 100 − 120 = −20; träd: 0,5 × (150 − 120)
 *     + 0,5 × 0 = +15; flexibilitetens värde 15 − (−20) = 35 mkr.
 *   • Kassaflödesavkastning: 4 ÷ 100 = 4,0 %; P/FCF 100 ÷ 4 = 25;
 *     P/CF 100 ÷ 6 = 16,7; P/B 100 ÷ 80 = 1,25.
 *
 * Matchningen speglar motorns hjälpfunktioner (samma lösning som alla
 * syskonlagren: Node type-stripping löser endast `import type`, så de rena
 * funktionerna speglas hit). Semantisk likhet med motorn BEVISAS av testets
 * felstavningsfall (B) och determinismfall (C). Driftvarning: ändras motorns
 * matchning måste denna spegel följa — testfall B vakar.
 *
 * SAMMANSÄTTNING (chat-widget.tsx) — detta lager levereras SIST (efter
 * konvertibeln, som 51:a motorn) och kan därför aldrig stjäla en fråga från
 * ett tidigare lager; det fångar bara frågor som alla lager före det
 * lämnar null på. Omvänt vaktar kedjetestets A-fall på att dessa frågor
 * INTE fångas av kedjan utan detta lager (dupliceringsskydd).
 *
 * ── JURIDIKGRINDEN (lagen 2007:528) ──────────────────────────────────
 * All text är pedagogisk utbildning om hur värderingsbegrepp DEFINIERAS
 * och RÄKNAS som metod — inga köp-/säljsignaler, inga placeringstips, inga
 * omdömen om enskilda börsbolag (exemplen talar om "ett bolag", "en gruva"
 * med påhittade tal; kursen 150 i marginalräkningen är ett öningstal).
 *
 * ── DEPENDENCY-INJECTION (samma mönster som hela motorn) ─────────────
 * Registret skickas IN som parameter (endast `import type`) så att
 * verktyg/testa-ai-mentor-vardegrund.mjs kan köra filen direkt i Node.
 * Alla källkurser (vm-02-intrinsic-value, vr-05-pris-och-varde,
 * vr-06-jamforelsebolagen, vr-07-terminalvardet, vm-05-realoptioner,
 * vm-11-waccfallor, vm-07-free-cash-flow-yield, vm-09-pricetocashflow,
 * vm-10-assetbased-valuation, km-028-reverse-dcf) finns i KURSREGISTER
 * (verifierat av sondens slug-sanity; kursKalla faller tillbaka på
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

// ── De 3 värdegrundfrågorna ─────────────────────────────────────────────────

export const VARDEGRUND_MONSTER: FragMonster[] = [
  {
    id: "intrinsic",
    karnord: [
      "intrinsic value", "motiverat värde", "motiverade värde",
      "verkligt värde", "fair value", "motiverat aktiepris",
    ],
    starkord: [
      "värde", "värdera", "värderar", "dcf", "kassaflöde", "diskonterat",
      "terminalvärdet", "aktie", "kurs", "beräkna", "räkna", "värdering",
    ],
    bygga: (reg) => {
      const vmAntal = reg.filter((r) => r.kategori === "VÄRDERINGSMETODER").length;
      const vrAntal = reg.filter((r) => r.kategori === "VÄRDERING").length;
      const kallor = [
        kursKalla(reg, "vm-02-intrinsic-value", "Läroplanen — värderingsmetoder: aktiens inre värde från begrepp till miniräknare"),
        kursKalla(reg, "vr-05-pris-och-varde", "Läroplanen — värderingens grund: priset är vad du betalar, värdet är vad du får"),
        kursKalla(reg, "vr-06-jamforelsebolagen", "Läroplanen — multipelvägen: urvalet bakom varje jämförelse"),
        kursKalla(reg, "vr-07-terminalvardet", "Läroplanen — DCF:s andra halva: allt som händer efter prognosisperioden"),
      ];
      const k = kallor[0];
      const vm02 = reg.find((r) => r.slug === "vm-02-intrinsic-value");
      return {
        text:
          `Motiverat värde — intrinsic value, på svenska också verkligt eller rättvist pris — är vad aktien är VÄRD om du räknar på det som faktiskt kommer ut ur bolaget, skilt från vad börsen just nu betalar. Priset ser du varje sekund; värdet måste räknas fram — och det är hela skillnaden (allt nedan är utbildning i hur begreppet DEFINIERAS och RÄKNAS — inga omdömen om enskilda bolag, talen är påhittade):\n\n1️⃣ TRE VÄGAR SAMMA MÅL. (A) KASSAFLÖDESVÄGEN: räkna ihop allt fritt kassaflöde bolaget kommer generera, översatt till dagens pengar — diskonterade kassaflöden, DCF (den frågan äger DCF-kursens lager, knappen nedan). (B) MULTIPELVÄGEN: vad betalar marknaden för jämförbara bolag per krona vinst eller kassaflöde — kvickt men bara så klokt som urvalet av jämförelsebolag. (C) SUBSTANSVÄGEN: vad är tillgångarna värda om verksamheten tystnar. De tre vägarna ska landa i samma härad — gör de inte det är det inte ett prisfel, det är en FÖRSTÅELSEFEL-flagga: någon av vägarna bygger på fel antagande.\n2️⃣ MINIRÄKNAREN (övningsräkning med påhittade tal). Ett bolag med fritt kassaflöde 10,00 kronor per aktie, tillväxt 5 procent per år i tre år, diskonteringsränta 8 procent och evig tillväxt 2 procent därefter: årsflödena blir 10,50 · 11,03 · 11,58 kronor, nuvärdena 9,72 + 9,45 + 9,19 = 28,36 kronor. Terminalvärdet i slutet av år tre: 11,58 × 1,02 ÷ (0,08 − 0,02) = 196,80 kronor, diskonterat till idag 156,22. Motiverat värde: 28,36 + 156,22 = 184,58 ≈ 184,6 kronor per aktie. Två läxor sitter i den kedjan: terminalandelen är 156,22 ÷ 184,6 = 84,6 procent — mer än fyra femtedelar av värdet ligger AFTER prognosisperioden (terminalvärde-kursens kärna, knappen nedan) — och om kursen är 150 ligger den 19 procent under värdet (150 ÷ 184,6 = 0,81): skillnaden är marginalen, inte en signal.\n3️⃣ TRE FÄLLOR. Nämnarfallan: höj diskontot en enda procent, 8 → 9, och samma bolag faller till 158,1 kronor = −14 procent — värdet är en funktion av DIN ränta, inte bara bolagets flöden (WACC-kursens ämne). Precisionstillfället: att svaret kommer med en decimal betyder inte att det är en decimals kunskap — tre räkningar med olika antaganden lär mer än en "exakt" multipel. Och jämförelsefallan: multipelvägen är bara så sann som listan av jämförelsebolag — det är en urvalsfråga, inte en räknefråga.\n\nI värderingsmetoder finns ${vmAntal} kurser och i värdering ${vrAntal} — huvudkursen (${vm02 ? vm02.minuter + " min, " + vm02.niva.toLowerCase() + " nivå" : "i registret"}) går igenom alla tre vägarna steg för steg. Som alltid: detta är utbildning i en metod — inga placeringstips.` +
          kallradFler(kallor),
        amne: "intrinsic",
        kalla: k,
        kallor,
        handlings: [
          { text: "Kursen: Intrinsic value", lank: "/kurser/vm-02-intrinsic-value", ikon: "🔗", beskrivning: "Från begrepp till miniräknare" },
          { text: "Kursen: Pris och värde", lank: "/kurser/vr-05-pris-och-varde", ikon: "⚖️", beskrivning: "Aktiens två tal" },
          { text: "Kursen: Terminalvärdet", lank: "/kurser/vr-07-terminalvardet", ikon: "📐", beskrivning: "DCF:s andra halva" },
          { text: "Vad är DCF?", lank: "fragor:" + encodeURIComponent("vad är DCF?"), ikon: "🧮", beskrivning: "Kassaflödesvägens egen fråga" },
          { text: "Vad är kassaflödesavkastning?", lank: "fragor:" + encodeURIComponent("vad är kassaflödesavkastning?"), ikon: "💧", beskrivning: "Nästa steg i spåret" },
        ],
        motfraga: { text: "Vad är kassaflödesavkastning?", kategori: "vardering" },
        fordjupa: { text: k.titel, lank: "/kurser/vm-02-intrinsic-value" },
      };
    },
  },
  {
    id: "realoptioner",
    karnord: ["realoptioner", "realoption"],
    starkord: [
      "flexibilitet", "vänta", "gruva", "brytning", "expandera", "utbyggnad",
      "licens", "oljefält", "beslut", "osäkerhet", "option", "pipeline",
    ],
    bygga: (reg) => {
      const vmAntal = reg.filter((r) => r.kategori === "VÄRDERINGSMETODER").length;
      const kallor = [
        kursKalla(reg, "vm-05-realoptioner", "Läroplanen — värderingsmetoder: värdet av flexibilitet och rätten att vänta"),
        kursKalla(reg, "vm-02-intrinsic-value", "Läroplanen — värdet realoptionerna bygger vidare på"),
        kursKalla(reg, "vm-11-waccfallor", "Läroplanen — nämnarens känslighet: optionens värde sviker med räntan"),
      ];
      const k = kallor[0];
      const vm05 = reg.find((r) => r.slug === "vm-05-realoptioner");
      return {
        text:
          `Realoptioner — verkliga optioner — är finansens svar på en fråga som vanlig värdering glömmer: vad är RÄTTEN ATT VÄNTA eller RÄTTEN ATT VÄXA värd? En DCF räknar på en enda plan; verkligheten erbjuder beslut längs vägen, och varje beslut som kan fattas KLOKARE senare har ett värde redan idag (allt nedan är utbildning i hur begreppet TÄNKS och RÄKNAS — inga omdömen om enskilda bolag, talen är påhittade):\n\n1️⃣ GRUVTRÄDET (övningsräkning). En gruva: brytning idag ger väntat malnvärde 100 miljoner och kostar 120 miljoner att öppna — räkningen blir 100 − 120 = −20 miljoner, ett projekt som är FÄRDIGRÄKNAT. Men malmpriset rör sig: om tre år har det med femtio procents sannolikhet gått upp så att väntevärdet är 150 miljoner, annars ner till 70. Med rätten att VÄNTA: i uppflyttningen bryter du (150 − 120 = +30), i nedfarten låter du bli (0 — du förlorar aldrig 70 − 120 = −50). Väntevärdet av att vänta: 0,5 × 30 + 0,5 × 0 = +15 miljoner. Skillnaden mot att tvingas bestämma idag: 15 − (−20) = 35 miljoner — FLEXIBILITETENS VÄRDE. Samma mark, två värdetal: utan rätt att vänta är gruvan värdelös, med den är den en tillgång.\n2️⃣ DE FYRA KLASSISKA FAMILJERNA. VÄNTA-OPTIONEN (skjuta upp brytningen, utbyggnaden, lanseringen tills informationen är bättre), VÄXA-OPTIONEN (basaffären som plattform — lilla fabriken som kan dubbleras om efterfrågan kommer), VÄXLA-OPTIONEN (fabriken som kan körda mellan två produkter efter prisbilden) och ÖVERGE-OPTIONEN (projektet som kan läggas ner innan det slukar mer kapital — dörren ut har också ett pris). Läkemedelspipelinen är skolboken: varje godkänd fas är en option på nästa — därför kan ett bolag utan intäkter bära ett värde (känsligt för detta lagers syskon fråga om kassaflödet).\n3️⃣ TVÅ FÄLLOR. Osäkerhets-paradoxen: optionens värde VÄXER med osäkerheten — oroliga tider gör rätten att vänta dyrbarare, vilket känns bakvänt men är kärnan (stillastående värdefall = död option, volatil framtid = levande). Och ursäktstillta: "det är ju optionellt" kan förvandlas till en ursäkt för att ALDRIG bestämma — en option som aldrig utnyttjas är en kostnad, inte en strategi; varje gruvträdsräkning ska ha ett datum då beslutet måste fattas.\n\nI värderingsmetoder finns ${vmAntal} kurser — huvudkursen (${vm05 ? vm05.minuter + " min, " + vm05.niva.toLowerCase() + " nivå" : "i registret"}) äger hela trädramverket. Som alltid: detta är utbildning i en metod — inga placeringstips.` +
          kallradFler(kallor),
        amne: "realoptioner",
        kalla: k,
        kallor,
        handlings: [
          { text: "Kursen: Realoptioner", lank: "/kurser/vm-05-realoptioner", ikon: "🔗", beskrivning: "Värdet av att vänta" },
          { text: "Kursen: WACC-fällor", lank: "/kurser/vm-11-waccfallor", ikon: "📉", beskrivning: "Nämnarens svikande känsla" },
          { text: "Vad är intrinsic value?", lank: "fragor:" + encodeURIComponent("vad är intrinsic value?"), ikon: "🎯", beskrivning: "Värdet som grunden" },
          { text: "Vad är en köpoption?", lank: "fragor:" + encodeURIComponent("vad är en köpoption?"), ikon: "🎫", beskrivning: "Optionen i aktiemarknadens dräkt" },
          { text: "Vad är kassaflödesavkastning?", lank: "fragor:" + encodeURIComponent("vad är kassaflödesavkastning?"), ikon: "💧", beskrivning: "Syskonmåttet i spåret" },
        ],
        motfraga: { text: "Vad är kassaflödesavkastning?", kategori: "vardering" },
        fordjupa: { text: k.titel, lank: "/kurser/vm-05-realoptioner" },
      };
    },
  },
  {
    id: "kassaflodesavkastning",
    karnord: ["kassaflödesavkastning", "kassaflödesavkastningen", "asset based valuation"],
    starkord: [
      "fcf", "free cash flow", "yield", "avkastning", "kassaflöde", "multiplar",
      "multipel", "substans", "tillgångar", "balansräkning", "värdera", "kurs",
    ],
    bygga: (reg) => {
      const vmAntal = reg.filter((r) => r.kategori === "VÄRDERINGSMETODER").length;
      const kallor = [
        kursKalla(reg, "vm-07-free-cash-flow-yield", "Läroplanen — värderingsmetoder: det fria kassaflödets avkastning på kursen"),
        kursKalla(reg, "vm-09-pricetocashflow", "Läroplanen — kassaflödesmultiplen och valet av nämnare"),
        kursKalla(reg, "vm-10-assetbased-valuation", "Läroplanen — balansräkningens väg: vad tillgångarna är värda"),
        kursKalla(reg, "km-028-reverse-dcf", "Läroplanen — att läsa av marknadens antaganden baklänges"),
      ];
      const k = kallor[0];
      const vm07 = reg.find((r) => r.slug === "vm-07-free-cash-flow-yield");
      return {
        text:
          `Kassaflödesavkastningen — FCF yield — är det fria kassaflödet per aktie dividerat med kursen: bolaget som ger 4 kronor i fritt kassaflöde och handlas till 100 kronor har 4 ÷ 100 = 4,0 procents kassaflödesavkastning. Spegeln är multiplen P/FCF = 100 ÷ 4 = 25 — SAMMA information uppochner, men avkastningsformen har en fördel: den jämförs rakt med alternativen (bankkonto, statsobligation, hyresfastighet) medan "25 gånger" bara jämförs med andra bolag (allt nedan är utbildning i hur måtten DEFINIERAS och RÄKNAS — inga omdömen om enskilda bolag, talen är påhittade):\n\n1️⃣ VARFÖR KASSAFLÖDE och inte vinst? Vinsten är en redovisningsprodukt med skattesyn och avskrivningsval; det fria kassaflödet — det som blir kvar EFTER investeringarna — är pengar som kan delas ut, köpa tillbaka aktier eller betala av skuld utan att bolaget krymper. Avkastningen på kursen är ägarens faktiska siffra.\n2️⃣ FAMILJEN — TRE NÄMNARE, TRE FRÅGOR. Vilket kassaflöde du lägger i nämnaren är ett VAL: kassaflödet från den löpande verksamheten FÖRE investeringar ger P/CF = 100 ÷ 6 = 16,7 — snällare mått, dolt antagande att investeringarna är frivilliga; det FRIA kassaflödet (efter investeringar, 4 kronor) ger P/FCF = 25 — hårdare och ärligare för en fabrik; och balansräkningens väg — asset-based — frågar i stället vad TILLGÅNGARNA är värda: eget kapital 80 kronor per aktie mot kurs 100 ger P/B = 100 ÷ 80 = 1,25, värdefullast när intäktsmaskinen är trasig men brytelsen lever (kapitalbindningens och nettoformlernas värld). Tre mått, tre frågor — de ska berätta SAMMA historia, gör de inte det är det en definitionsfråga att reda ut, inte ett prisfel.\n3️⃣ TVÅ VERKTYG + TRE FÄLLOR. Verktyg ett — jämförelsen med räntan: 4,0 procents kassaflödesavkastning mot ett alternativ på 3 procent betyder att marknaden prissätter flödet ungefär som en obligation MED tillväxtoptionen på köpet — därför måste skillnader mot förväntad tillväxt läsas tillsammans. Verktyg två — reverse DCF-spindeln (km-028): vrid på tillväxt och ränta tills modellen ger kursen, och läs AV vilka antaganden marknaden gör — en baklängesfråga i stället för en framlänges. Fällorna: engångskassaflöden (en såld fastighet blåser upp årets FCF — normalåret är nämnaren), svängande arbetande kapital (ett tillväxtår kan släcka FCF helt utan att något är fel — kapitalbindningens ämne, knappen nedan) och negativ yield (bolaget konsumerar kapital — ibland rationellt i expansion, alltid värt en fråga om VARFÖR och hur länge).\n\nI värderingsmetoder finns ${vmAntal} kurser — huvudkursen (${vm07 ? vm07.minuter + " min, " + vm07.niva.toLowerCase() + " nivå" : "i registret"}) äger måttfamiljen från definition till fällor. Som alltid: detta är utbildning i en metod — inga placeringstips.` +
          kallradFler(kallor),
        amne: "kassaflodesavkastning",
        kalla: k,
        kallor,
        handlings: [
          { text: "Kursen: Free Cash Flow Yield", lank: "/kurser/vm-07-free-cash-flow-yield", ikon: "🔗", beskrivning: "Avkastningen på kursen" },
          { text: "Kursen: Asset-based valuation", lank: "/kurser/vm-10-assetbased-valuation", ikon: "🏛️", beskrivning: "Balansräkningens väg" },
          { text: "Kursen: Reverse DCF", lank: "/kurser/km-028-reverse-dcf", ikon: "🔄", beskrivning: "Marknadens antaganden baklänges" },
          { text: "Vad är kassaflödesanalys?", lank: "fragor:" + encodeURIComponent("vad är kassaflödesanalys?"), ikon: "💧", beskrivning: "Grundfrågan om flödet" },
          { text: "Vad är intrinsic value?", lank: "fragor:" + encodeURIComponent("vad är intrinsic value?"), ikon: "🎯", beskrivning: "Första steget i spåret" },
        ],
        motfraga: { text: "Vad är intrinsic value?", kategori: "vardering" },
        fordjupa: { text: k.titel, lank: "/kurser/vm-07-free-cash-flow-yield" },
      };
    },
  },
];

// ── Huvudingången ──────────────────────────────────────────────────────────

/**
 * Svara lokalt med NÅGOT av de tre värdegrund-mönstren — eller null
 * (då har hela kedjan före redan lämnat null och API-flödet tar över som
 * förr). Ligger SIST i widgetens kedja och kan därför aldrig stjäla en
 * fråga från tidigare lager. Samma matchningssemantik som basmotorn:
 * minst ett kärnord krävs, poäng = kärnord × 3 + stärkord, oavgjort →
 * först deklarerade mönstret vinner (strikt >, deterministiskt). Samma
 * fråga ⇒ bitidentiskt svar.
 */
export function svaraLokaltVardegrund(fraga: string, register: RegisterRad[]): LokaltSvar | null {
  const fragaStr = diafri(fraga);
  if (!fragaStr) return null;
  const fragaOrd = fragaStr.split(" ");
  let bast: { svar: LokaltSvar; poang: number } | null = null;
  for (const m of VARDEGRUND_MONSTER) {
    const karnTraff = m.karnord.filter((nk) => traff(fragaOrd, fragaStr, nk));
    if (karnTraff.length === 0) continue; // krav: minst ett kärnord
    const starkTraff = m.starkord?.filter((nk) => traff(fragaOrd, fragaStr, nk)) ?? [];
    const poang = karnTraff.length * 3 + starkTraff.length;
    if (!bast || poang > bast.poang) bast = { svar: m.bygga(register), poang };
  }
  return bast ? bast.svar : null;
}
