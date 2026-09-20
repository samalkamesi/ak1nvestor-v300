/**
 * AI-MENTORN 2.0 — CO-INVEST-FÖRHANDSFRÅGAN (omgång 27, s6-u1, manifest
 * auto-s6-1789912510460).
 *
 * ETT källmärkt monster om co-investeringen — andelen bredvid fonden — som
 * aktiverar TVÅ mentorväglösa kurser i ett svar:
 *   · CO-INVESTERINGEN ("vad är en co-investering?" — den kanoniska frågan,
 *     men svaret är hela biljetten: två priser → urvalsasymmetrin →
 *     break-even-räkneläran → de fem kraven, fyra fällorna, protokollets
 *     fem frågor)
 *     pe-07 CO-INVESTERINGEN primär (kursen född 2026-09-20 av spår 5 —
 *     commit 62901005:s fönster, mentorväglös sedan födelsen,
 *     rs-09-precedensen; aktiveringen gör KATEGORIN PRIVATE EQUITY &
 *     INVESTMENTBOLAG fullt mentorlänkad 13/14 → 14/14 — kursens eget
 *     kapitel 6 stänger familje-cirkeln pe-01…pe-06 + «biljetten bredvid»)
 *     + pe-04 DEN PRIVATA ÄGARSIDAN som källa (kursens kapitel 3: «pe-04
 *     bär den privata ägarsidans hantverk» — källaktivering: pe-04:s
 *     första mentorväg).
 *
 * ÄMNESVAL EFTER NEDSTÄLLNING + SOND (verktyg/_s6u1f-sond-omg27.mjs mot
 * kedjans 68 motorer / 186 monsters; anspråk data/vakten/
 * auto-s6-1789912510460-s6-u1-ansprak.md v2 FÖRE byggstart — nedställningen
 * dokumenterad där): v1-valet marginalhandeln (am-09) överläts åt syskonet
 * s6-u2 (deras anspråk 16:03 FÖRE detta lagers 16:04 — disk-först-
 * konventionen); pe-07 är s6-u2:s EGET förslag för u1:s +1 («kärnord
 * co-investeringen/co-investering NULL+0 grannar … passar u1:s +1»).
 *   • Rond A: 13 kandidatfrågor — 12 NULL genom hela kedjan.
 *   • Kontroller som SKALL fångas av sina ägare (sonden mäter rätt):
 *     internräntan/vattenfallet/utfasningar → pe-mekanik · andrahands-
 *     marknaden/sekvensrisken → pengarstid · capital call → nästa ·
 *     diversifiering → portföljgrund · köpoption → optionsdjup ·
 *     J-kurvan → realekonomi.
 *   • Rond C grannkontroll: 0 riskgrannar, 0 frasöverlapp.
 *
 * DOKUMENTERADE GRÄNSER (sondens fynd — inte mina kärnord):
 *   • Djup-lagret äger «multipeln»-familjen — «vad är break-even-
 *     multipeln?» FÅNGAS av dem; begreppet bärs här i TEXT som «den grova
 *     affärsnivå där besparingen ätits upp av urvalet — i modellen 1,76x».
 *   • Solidformen «coinvestering» STRYKS som kärnord: redigeringstavstånd
 *     2 till «investering» (13-bokstaversordens tolerans) — en fråga som
 *     «vad är en investering?» (idag NULL = API-flödets) skulle stjälas av
 *     stavningstoleransen. Hyphen-formerna («co-investering» m.fl.) blir
 *     FLERORDSFRASER via normaliseringen («co investering») och kräver
 *     co-prefixet i frågan — inga ensamstående «investering»-frågor
 *     fångas. «coinvest» (8 bokstäver, tolerans 1) är säkert: «invest»
 *     ligger tavstånd 2 utanför.
 *   • «call»-ordet är nästa-lagrets (pengarstidens dokumenterade gräns) —
 *     capital calls nämns ENDAST i text (krav två: beredskap).
 *   • pe-mekanik äger IRR/utfasningar/vattenfallet, pengarstid äger
 *     andrahandsmarknaden/J-kurvan/kapitalbolagens kronologi — deras
 *     frågor bärs som fragor:-knappar, aldrig kärnord.
 *
 * Aritmetiken i svaret (kursens EGNA modelltal med tydligt påhittade
 * värden — maskinellt omräknade i regressionstestets D-fall):
 *   • Två biljetter: affär köpt 100, utfasad 200 (grovmultipel 2,0x).
 *     LP-vägen: 200 − 20 (carry: 20 % av vinsten 100) − 12 (avgifter
 *     under livet) = 168 av 100 insatta. Biljetten: 200 av 100. Gap 32.
 *   • Urvalsasymmetrin: helägda affärer 2,10x → 210 − 22 − 12 = 176;
 *     erbjudna affärer 1,70x → biljetten 170. Gap 6 till fondvägens
 *     fördel — trots att fondvägen bär 34 enheter i avgift och carry.
 *   • Break-even (i text): 1,76x — biljetten 100 × 1,76 = 176 = fondvägen.
 *     Speglingen: urvalsgapet 2,10 − 1,76 = 0,34x = 34 enheter = fondvägens
 *     avgift+carry — samma valuta. Trappan: 2,10x → +34 · 1,90x → +14 ·
 *     1,76x → 0 · 1,70x → −6.
 *   • Enskild erbjuden affär: burits i fonden 144; som biljett 170 —
 *     26 enheter mer, 26/144 = drygt 18 % högre slutvärde. Sant — men
 *     ofullständigt: urvalet står inte i erbjudandebrevet.
 *   • Koncentrationen: fonden bär typiskt ett tjogtal affärer — ett
 *     nollresultat är 4 procent av fonden i modellen med 25 poster, mot
 *     100 procent av biljetten.
 *
 * KEDJEPLACERING: 69:e motorn (av 69), efter volatilitetsmekanik, FÖRE
 * marknadsrytm (deras SIST-deklaration + deras testfall L01 respekteras —
 * multipel-precedensen). Kärnorden är mekaniskt disjunkta mot samtliga
 * lager; verifieras av kedjetestets fall G + detta lagers test (kärnorden
 * läses LIVE ur samtliga src/lib/ai-mentor-*-fragor.ts vid varje körning).
 *
 * Matchningen speglar motorns hjälpfunktioner (samma lösning som alla
 * syskinlager: Node type-stripping löser endast `import type`, så de rena
 * funktionerna speglas hit). Semantisk likhet med motorn BEVISAS av
 * testets felstavningsfall (B) och determinismfall (C). Driftvarning:
 * ändras motorns matchning måste denna spegel följa — testfall B vakar.
 *
 * ── JURIDIKGRINDEN (lagen 2007:528) ──────────────────────────────────
 * All text är pedagogisk utbildning om hur biljetten LÄSES, MÄTS och
 * BEDÖMS — inga köp-/säljsignaler, inga placeringstips, inga omdömen om
 * enskilda fonder eller bolag. Exempelvärdena är kursens egna modelltal
 * med tydligt påhittade värden — konstruerade för övningens skull.
 *
 * ── DEPENDENCY-INJECTION (samma mönster som hela motorn) ─────────────
 * Registret skickas IN som parameter (endast `import type`) så att
 * verktyg/testa-ai-mentor-coinvest.mjs kan köra filen direkt i Node.
 * Källkurserna (pe-07-co-investeringen, pe-04-den-privata-agarsidan,
 * pe-06-j-kurvan-och-capital-calls, km-014-korrelation-diversifiering)
 * finns i KURSREGISTER — inga fantomlänkar (testfall D20 vakar).
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

// ── Den 1 co-invest-frågan ──────────────────────────────────────────────────

export const COINVEST_MONSTER: FragMonster[] = [
  {
    id: "coinvesteringen",
    karnord: [
      // Hyphen-formerna → FLERORDSFRASER via normaliseringen («co
      // investering») — kräver co-prefixet, fångar aldrig ensamstående
      // «investering»-frågor (solidformerna STRYKS: tavstånd 2 till
      // «investering», dokumenterat i modulens huvudkommentar).
      "co-investering", "co-investeringen", "co-investeringar",
      "co-invest", "co-investorn", "co-invest-biljett",
      "coinvest",
      "urvalsasymmetri", "urvalsasymmetrin",
      "biljetten bredvid fonden",
    ],
    // NOTERA gränserna (sondrond A): djup äger «multipeln»-familjen
    // (break-even-begreppet i TEXT), nästa «call» (capital calls i TEXT),
    // pe-mekanik IRR/utfasningar/vattenfallet, pengarstid andrahands-
    // marknaden — deras frågor bärs som knappar, aldrig kärnord.
    starkord: [
      "fond", "fonden", "fonder", "gp", "lp", "carry", "avgift",
      "avgifter", "erbjuden", "erbjudna", "erbjudandet", "urval",
      "billet", "biljetten", "delning", "riskdelning", "kapacitet",
      "tvivel", "break", "even", "trappan", "utfasning", "privat",
      "onoterat", "andelen", "bredvid",
    ],
    bygga: (reg) => {
      const peAntal = reg.filter((r) => r.kategori === "PRIVATE EQUITY & INVESTMENTBOLAG").length;
      const kallor = [
        kursKalla(reg, "pe-07-co-investeringen", "Läroplanen — biljetten: två priser på samma affär"),
        kursKalla(reg, "pe-04-den-privata-agarsidan", "Läroplanen — krav ett: den privata ägarsidans hantverk, analysen hemma"),
        kursKalla(reg, "pe-06-j-kurvan-och-capital-calls", "Läroplanen — krav två: beredskapen, kallelserna och kapitalplikten"),
        kursKalla(reg, "km-014-korrelation-diversifiering", "Läroplanen — krav tre: koncentrationens matematik"),
      ];
      const k = kallor[0];
      const pe07 = reg.find((r) => r.slug === "pe-07-co-investeringen");
      return {
        text:
          `En co-investering är en andel i en affär BREVID fonden — samma bolag, samma konsert, men två olika biljetter. Genom fonden äger du affären med förvaltningsavgifter och carry ovanpå; som co-investor äger du den direkt, utan avgift och utan carry på just den biljetten. Så långt ser biljetten ut som gratis pengar — men meningen har en andra halva som inte står på fakturan: co-investorn blev ERBUDEN affären, fonden valde bland alla. Kursens egentliga ämne är priset på det urvalet (allt nedan är utbildning i hur biljetten räknas, med kursens egna modelltal och tydligt påhittade värden — inga placeringstips):\n\n1️⃣ TVÅ BILJETTER TILL SAMMA KONSERT. Modellens affär: ett bolag som fonden köper för 100 och utfasar för 200 — grovmultipeln 2,0x. Fondens LP äger affären via fonden: på brutto 200 betalas tjugo procent carry på vinsten 100 — alltså 20 — och tolv enheter avgifter under livet; LP:n får 168 av 100 insatta. Co-investorn äger samma affär direkt, utan förvaltningsavgift och utan carry på biljetten: 200 av 100. Gapet är 32 enheter — fondens pris för exponeringen på just denna affär, ur LP:s öga. Det är den siffran som ser bra ut i erbjudandebrevet — och den är sann, bara ofullständig.\n2️⃣ URVALSASYMMETRIN — VARFÖR DELAR FONDEN? Tre skäl finns i ryggraden, och bara det första är gratis för LP:n. KAPACITET: fonden är full eller affären för stor för mandatet — delandet är strukturellt nödvändigt och urvalet neutralt. RISKDELNING: förvaltaren vill avlasta sin egen balansräkning på affärer den ändå tror på — urvalet mild. TVIVEL: förvaltaren vill ha sällskap just där övertygelsen är svagast — urvalet ogynnsamt. Ingen LP ser vilken av de tre som gäller: erbjudandebrevet ser likadant ut i alla fallen. Kursens modell sätter tal på skillnaden: fondens helägda affärer bär grovmultipeln 2,10x — LP:n får 210 − 22 carry − 12 avgifter = 176 — medan de erbjudna affärerna bär 1,70x, och co-investorn utan avgifter får 170. Gapet är 6 enheter till fondvägens fördel, TROTS att fondvägen bär 34 enheter i avgift och carry. Den gratis biljetten till fel konsert kostade mer än den med avgift — i modellen.\n3️⃣ MÄTNINGEN — BILLETTENS ENDA ÄRLIGA SAMMANFATTNING. Break-even är den grova affärsnivå där besparingen ätits upp av urvalet: i modellen 1,76x — biljetten 100 × 1,76 = 176 är exakt fondvägens netto. Under den nivån förlorar biljetten mot fondvägen trots noll avgifter; över den vinner den. Notera speglingen: urvalsgapet 2,10 − 1,76 = 0,34x — och fondvägens avgift och carry på de helägda affärerna är 34 enheter. De båda krafterna mäts i samma valuta: 0,34x urval äter exakt 34 enheter avgift. Trappan blir läsbar: erbjuds affärer till 2,10x vinner biljetten med 34 enheter; till 1,90x vinner den med 14; till 1,76x går allt jämnt ut; till 1,70x — modellens nivå — förlorar den med 6. Och den enskilda erbjudna affären: burits den i fonden hade den gett 144; som biljett ger den 170 — 26 enheter mer, drygt 18 procent högre slutvärde på insatsen (26/144). Siffran är sann — men urvalet gör den ofullständig.\n4️⃣ FEM KRAV, FYRA FÄLLOR, PROTOKOLLETS FEM FRÅGOR. Fonden är en portfölj med ett team bakom; biljetten är en affär med dig själv bakom. Fem krav följer av skillnaden: (1) EGEN ANALYS — i fonden görs due diligence av ett team du betalar via avgiften; på biljetten måste analysen ägas hemma. (2) BEREDSKAP — co-invest-kallelser kommer med kort varsel när en affär stänger, och kapitalplikten är hård: på biljetten finns ingen fondkassa som buffrar. (3) KONCENTRATION — fonden bär typiskt ett tjogtal affärer: ett totalt nollresultat är 4 procent av fonden i modellen med 25 poster, mot 100 procent av biljetten. (4) LIKVIDITETENS FRÅNVARO — ingen andrahandsmarknad värd namnet före utfasningen; direktposter är tunnare än fondandelar. (5) ÄGARARBETET — styrelseplats, informationsskyldigheter, utvecklingssamtal: det ägande fonden annars administrerar. Fyra fällor med en gemensam rot (besparingen står på papperet, urvalet gör det inte): gratis-tänkandet (boten: break-even-talet, som tvingar urvalet in i samma räkning som avgiften) · relationens pris (att tacka ja eller nej av rädsla för att bli förbigången — fondvalet bedöms som fondval, biljetten som biljett) · koncentrationens förnekelse (nollresultatet räknas mot hela portföljen, inte mot fonden) · analysavståndet (GP:s material är inte ditt ansvar — boten är det skrivna tesbladet före varje ja: vad är affären värd, vad kan gå fel, varför delas den? Uteblir svar, uteblir biljett). Protokollets fem frågor, med den första som svårast — svaret står aldrig i erbjudandebrevet: Varför delar GP:n just denna affär — kapacitet, riskdelning eller tvivel? Skulle fonden ha gjort affären ensam? Vad kostar koncentrationen — vad är ett nollresultat av min hela portfölj? Vad är biljettens break-even — fondvägens netto, biljettens brutto och avgiftsbördan, räknade och skrivna? Bär jag de fem kraven — analys, beredskap, koncentration, likviditet och arbete — hemma, i dag?\n\nI kategorin private equity och investmentbolag finns ${peAntal} kurser — co-investeringen (${pe07 ? pe07.niva.toLowerCase() + " nivå" : "i registret"}) sluter familjen: fonderna, utfasningarna, bolagssidan, den privata världen, tiden, kronologin — och biljetten bredvid. Som alltid: detta är utbildning i en metod — inga placeringstips.` +
          kallradFler(kallor),
        amne: "co-investeringen",
        kalla: k,
        kallor,
        handlings: [
          { text: "Kursen: Co-investeringen", lank: "/kurser/pe-07-co-investeringen", ikon: "🎟️", beskrivning: "Andelen bredvid fonden — urvalets pris" },
          { text: "Kursen: Den privata ägarsidan", lank: "/kurser/pe-04-den-privata-agarsidan", ikon: "🔍", beskrivning: "Krav ett: analysen hemma" },
          { text: "Kursen: J-kurvan och capital calls", lank: "/kurser/pe-06-j-kurvan-och-capital-calls", ikon: "⏱️", beskrivning: "Krav två: beredskap och kapitalplikt" },
          { text: "Kursen: Korrelation och diversifiering", lank: "/kurser/km-014-korrelation-diversifiering", ikon: "🧮", beskrivning: "Krav tre: 4 % mot 100 %" },
          { text: "Vad är utfasningar?", lank: "fragor:" + encodeURIComponent("vad är utfasningar?"), ikon: "🚪", beskrivning: "Fondens fyra dörrar ur ett bolag" },
          { text: "Vad är andrahandsmarknaden?", lank: "fragor:" + encodeURIComponent("vad är andrahandsmarknaden?"), ikon: "🔁", beskrivning: "LP-andelens pris när fonden inte får vänta" },
        ],
        motfraga: { text: "Vad är utfasningar?", kategori: "co-invest" },
        fordjupa: { text: k.titel, lank: "/kurser/pe-07-co-investeringen" },
      };
    },
  },
];

// ── Huvudingången ──────────────────────────────────────────────────────────

/**
 * Svara lokalt med co-invest-mönstret — eller null (då har hela kedjan före
 * redan lämnat null och API-flödet tar över som förr). Ligger efter
 * volatilitetsmekanik och FÖRE marknadsrytm i widgetens kedja och kan därför
 * aldrig stjäla en fråga från ett tidigare lager; det fångar bara frågor
 * som alla lager före det lämnar null på. Samma matchningssemantik som
 * basmotorn: minst ett kärnord krävs, poäng = kärnord × 3 + stärkord,
 * oavgjort → först deklarerade mönstret vinner (strikt >, deterministiskt).
 * Samma fråga ⇒ bitidentiskt svar.
 */
export function svaraLokaltCoinvest(fraga: string, register: RegisterRad[]): LokaltSvar | null {
  const fragaStr = diafri(fraga);
  if (!fragaStr) return null;
  const fragaOrd = fragaStr.split(" ");
  let bast: { svar: LokaltSvar; poang: number } | null = null;
  for (const m of COINVEST_MONSTER) {
    const karnTraff = m.karnord.filter((nk) => traff(fragaOrd, fragaStr, nk));
    if (karnTraff.length === 0) continue; // krav: minst ett kärnord
    const starkTraff = m.starkord?.filter((nk) => traff(fragaOrd, fragaStr, nk)) ?? [];
    const poang = karnTraff.length * 3 + starkTraff.length;
    if (!bast || poang > bast.poang) bast = { svar: m.bygga(register), poang };
  }
  return bast ? bast.svar : null;
}
