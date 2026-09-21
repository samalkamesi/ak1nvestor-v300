/**
 * AI-MENTORN 2.0 — BANKSEKTOR-FÖRHANDSFRÅGOR (s6-u1, omgång 33 i spår 6,
 * manifest auto-s6-1789999525797, byggare 1/3).
 *
 * ETT källmärkt monster om spegelvända balansräkningen — banksektorn,
 * den svenska börsens tyngsta sektor:
 *   · BANKSEKTORN ("vad är nätlånet?/räntenätet?/K/I-talet?…" — balansräkningen
 *     spegelvänd, deposit-betan, förlusttrapporna, den reglerade hävstången)
 *     se-24 BANKSEKTORN primär — SEKTORANALYS-familjens tjugofjärde steg,
 *     född 2026-09-21 (s5-u1, commit 9653dbdd) och mentorlös under sina
 *     första timmar: mentorn kunde inte svara på «vad är nätlånet?» före
 *     detta lager (sond _s6u1o33-sond.mjs: 111 lösa kurser, se-24 bland
 *     dem — rs-09-precedensen: spår 5:s kurs född ⇒ mentorn lär sig den
 *     nästa fönster). Källor: se-19 FÖRSÄKRINGSSEKTORN (finansbalansräkningens
 *     andra sida — floaten mot inlåningen) · ln-01 DU PONT-ANALYSEN
 *     (avkastningsidentitetens industriella ursprung — bankens spegel) ·
 *     ud-09 UTDELNINGENS HÅLLBARHET (utdelningsekvationens släktskap) ·
 *     vr-02 NORMALISERADE MULTIPLER (protokollets sjätte fråga) ·
 *     st-04 STABILITET GENOM KREDITCYKELN (cykeln ur låntagarens
 *     perspektiv) · ma-08 BOSTADSMARKNADENS MEKANIK (transmissionen från
 *     ränta till bostad) · mt-05 BYTESKOSTNADER (inlåningsfranchisen som
 *     moat i pengars skepnad). Familjetraditionen hålls: skogen, rederiet,
 *     försäkringen, gruvan, kemian, stålet — och nu banken.
 *
 * ÄMNESVAL EFTER SOND (dokumenterad kedja):
 *   • Sond _s6u1o33-sond.mjs (före byggstart): 489 kurser i registret,
 *     76 fragor-filer, 179 monster-id:n (77 motorer), 111 lösa kurser i
 *     15 kategorier. PRIVATE EQUITY (5 lösa), PRAKTISKA CASE (11 lösa) och
 *     kategoristängningarna (rp-07/vr-09/kt-10/od-10 m.fl.) lämnas uttryckligen
 *     ÅT FÖNSTRETS SYSKON (u2/u3) — anspråk
 *     data/vakten/auto-s6-1789999525797-s6-u1-ansprak.md på disk FÖRE
 *     byggstart.
 *   • se-24-banksektorn VALT: spår 5:s NYASTE kurs — mentorn ska kunna
 *     kursen samma dag den föds; aritmetiken är kursens egen leverans
 *     (Sveabolån/Kreditia/Fondia med exakt aritmetik, oberoende omräknad
 *     i regressionstestets D-fall).
 *
 * ÖVERSIKT+DJUP-PRECEDENSEN (som se-23 mot km-045): det TIDIGA
 * sektorlagret (ai-mentor-sektor-fragor.ts, position 7 i kedjan) äger
 * översiktsorden «banksektorn»/«bankbolag»/«kreditförlust(er)»/
 * «kapitaltäckning»/«utlåning» med primärkurs km-040:s tre meningar.
 * Detta DJUPLAGER äger maskinens EGNA begrepp — kärnord som översikten
 * saknar helt (sond _s6u1o33-karnord.mjs: 60 kandidater mot 2 322 kärnord
 * i 77 filer).
 *
 * DOKUMENTERADE GRÄNSER (kursens egen gränsdragning — bärs i TEXT):
 *   • «banksektorn», «bankbolag», «kreditförlust», «kapitaltäckning»,
 *     «utlåning», «utlåningsgrad» → sektorlagrets översikt (EXAKT-kollision
 *     — deras tidigare kedjeposition vinner ändå; detta lager äger
 *     DJUPET: nätlånet, betan, trapporna, K/I, kärnprimärkapitalrelationen).
 *   • «utlåningsräntan» → handelsdagen (tav 2 — kasserad).
 *   • nakna «inlåning»/«utlåning» → etfmekanik «inlösningen» + handelsdagen
 *     «inklämningen» (tav 2 — bärs i TEXT, aldrig som kärnord).
 *   • «deposit-beta» → riskmåttsdjupets korta «beta» (CAPM-betan — deras
 *     monster fångar frågeordet «beta»/«betan» före detta lager i kedjan;
 *     bankens deposit-beta bärs i TEXT och nås som kärnord via
 *     «inlåningsbetan»).
 *   • «belåningsgraden» → tav 2 mot sektorlagrets «utlåningsgrad» (deras
 *     kärnord — LTV-dämparen bärs i TEXT).
 *   • spridens mikrovärld → am-01 (likviditet och spread).
 *   • kreditriskens marknadspris → ma-05 ( kreditpremien — KÄLLA-logik).
 *   • bostadstransmissionen → ma-08 (ränta till bostad — detta lager äger
 *     fortsättningen in i resultaträkningen).
 *   • realräntan som begrepp → ma-03 (bankens beta-arbete är nominellt).
 *   • kreditcykeln ur låntagarens perspektiv → st-04.
 *   • moat-erosionens mönster → mt-02 (appens bytestids-hot mot franchisen).
 *   • DuPont-industrin → ln-01 · utdelningens hållbarhet (vanliga bolaget)
 *     → ud-09 · likviditetsreserven (vanliga bolaget) → st-06 ·
 *     redovisningspolitiken → bk-05 · P/B-värderingen → v05 ·
 *     AKM1-integrationen → km-040 · familjens generiska sektorsfrågor →
 *     se-16 · ett verkligt case att träna protokollet mot → pc-03.
 *
 * Aritmetiken i svaret (kursens EGNA modelltal med tydligt påhittade
 * banker — Sveabolån Bank AB, Kreditia Bank AB och Fondia Bank AB —
 * maskinellt omräknade i regressionstestets D-fall):
 *   · Sveabolån (100 mdr bolån à 3,60 %; 80 mdr inlåning à 1,00 % +
 *     20 mdr marknad à 2,60 %): NII 3 600 − 800 − 520 = 2 280 Mkr,
 *     räntenät 2,28 %; franchisen 1,60 pp × 80 mdr = 1 280 Mkr/år.
 *   · Räntesvängen +1 pp (beta 0,4): 4 600 − 1 120 − 720 = 2 760 =
 *     +480 Mkr (+21 %); 48 öre kvar av intäktskronan; −1 pp → 1 800
 *     (−21 %); +2 pp → 3 240 (+960, +42 %, linjär).
 *   · Kreditia (10 mdr à 12 % mot 3 %): NII 900, räntenät 9,0 %;
 *     normal 900 + 150 − 700 − 200 = +150; kris −250 (1,7 normalår).
 *   · Fondia (40 mdr à 5,0 %; 15 à 0 % + 25 à 3 %): NII 1 250;
 *     normal 0,3 % = 120; fastighetskris 3,0 % = 1 200 (tiofalt).
 *   · Tre trappor: bolån 0,05→1,0 % (tjugofaldigt, LTV-dämpare: huset
 *     måste tappa >40 % vid 60-procentig pant) · konsumtion 2→6 %
 *     (trefaldigt från hög nivå) · företag 0,3→3,0 % (tiofalt).
 *   · Riskjusterat räntenät: Kreditia 7,0 % mot Sveabolån 2,23 %.
 *   · K/I: 1 100/2 700 = 40,7 % mot 700/1 050 = 66,7 %; per kund
 *     4 000 × 400 000 − 50 = 1 550 Mkr (= RÖK-kontrollen).
 *   · Kapital: 110 mdr på EK 8 mdr = 13,75×; kärnprimärkapital 8/80 =
 *     10,0 % mot 8,5 (fiktivt); RÖK 1 550 − 22 % skatt = 1 209 → ROE
 *     15,1 %; 4-mdr-leken 30,2 % men 5,0 % < 8,5 otillåtet;
 *     utdelningsekvationen RWA +5 % → 809 (67 %), +10 % → 409 (34 %).
 *
 * KEDJEPLATS: 78:e motorn (efter kategoristängning, FÖRE marknadsrytm —
 * deras SIST-deklaration + L01 respekteras, multipel-precedensen). Kärnorden
 * är mekaniskt disjunkta mot samtliga 77 lager (sond + detta lagers eget
 * test, J-fall) och kedjetestets strukturfall.
 *
 * Matchningen speglar motorns hjälpfunktioner (samma lösning som alla
 * syskinlager: Node type-stripping löser endast `import type`, så de rena
 * funktionerna speglas hit). Semantisk likhet med motorn BEVISAS av
 * testets felstavningsfall (B) och determinismfall (C). Driftvarning:
 * ändras motorns matchning måste denna spegel följa — testfall B vakar.
 *
 * ── JURIDIKGRINDEN (lagen 2007:528) ──────────────────────────────────
 * All text är pedagogisk utbildning om hur sektorn LÄS, RÄKNAS och BEDÖMS —
 * inga köp-/säljsignaler, inga placeringstips, inga omdömen om enskilda
 * banker. Exempelvärdena är kursens egna modelltal (Sveabolån, Kreditia
 * och Fondia är påhittade banker) — konstruerade för övningens skull.
 *
 * ── DEPENDENCY-INJECTION (samma mönster som hela motorn) ─────────────
 * Registret skickas IN som parameter (endast `import type`) så att
 * verktyg/testa-ai-mentor-banksektor.mjs kan köra filen direkt i Node.
 * Källkurserna (se-24-banksektorn, se-19-forsakringssektorn,
 * ln-01-dupont-analysen, ud-09-utdelningens-hallbarhet,
 * vr-02-normaliserade-multipler, st-04-stabilitet-genom-kreditcykeln,
 * ma-08-bostadsmarknadens-mekanik, mt-05-byteskostnader-och-inlasning)
 * finns i KURSREGISTER — inga fantomlänkar (testfall D-vakar).
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

/** Källrad som avslutar varje svar — KÄLLMÄRT (samma format som motorn). */
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

// ── Den 1 frågan: banksektorn (se-24) ───────────────────────────────────────

export const BANKSEKTOR_MONSTER: FragMonster[] = [
  {
    id: "banksektorns-mekanik",
    karnord: [
      // Sond _s6u1o33-karnord.mjs: 60 kandidater mot 2 322 kärnord i 77
      // lager — maskinens begrepp ALLA renta. Kasserade (dokumenterade
      // gränser, bärs i TEXT): «banksektorn»/«bankbolag»/«kreditförlust»/
      // «kapitaltäckning»/«utlåning» → sektorlagrets översikt (km-040) ·
      // «utlåningsränta(n)» → handelsdagen (tav 2) · nakna «inlåning»/
      // «utlåning» → etfmekanik «inlösningen» + handelsdagen «inklämningen»
      // (tav 2) · «deposit-beta» → riskmåttsdjupets korta «beta» (CAPM-betan
      // — deras monster fångar frågeordet «beta» före detta lager i kedjan;
      // begreppet nås här via «inlåningsbetan») · «belåningsgraden» → tav 2
      // mot sektorlagrets «utlåningsgrad» (deras kärnord). Översikt+djup-
      // precedensen som se-23 mot km-045.
      "nätlånet", "nätlån", "nätlånsintäkt", "nätlånsintäkten", "nätlånsintäkter",
      "räntenätet", "räntenät", "räntenätets",
      "inlåningsfranchisen", "inlåningsfranchise", "inlåningsandelen",
      "inlåningsbetan",
      "kreditförlustnivå", "kreditförlustnivån",
      "förlusttrappan", "förlusttrappor", "förlusttrapporna",
      "K/I-talet", "KI-talet", "kostnads-intäktskvoten",
      "kärnprimärkapitalrelationen", "kärnprimärkapital",
      "riskvägda tillgångar", "utdelningsekvationen",
      "riskjusterat räntenät", "riskjusterade räntenätet",
      "räntesvängen", "räntesväng",
      "bankräkning", "bankräkningen", "bankbranschen",
      "utlåningsboken", "penningmarknadsfinansiering",
      "provisionscykel", "provisionscykeln",
      "sparkontot", "lönekontot",
      "Sveabolån", "Kreditia", "Fondia",
      "växa eller dela", "bankens hävstång",
    ],
    starkord: [
      "bank", "banken", "banker", "bankernas", "bankväsende",
      "inlåning", "inlåningen", "inlåningsränta", "inlåningsräntan",
      "utlåning", "utlåningen", "utlåningsränta", "utlåningsräntan",
      "reporäntan", "styrräntan", "räntan", "ränta", "räntor", "räntesvängen",
      "kredit", "krediter", "kreditförlust", "kreditförluster",
      "kapitaltäckning", "bolån", "bolånen", "boken", "böckerna",
      "kunder", "kunderna", "kontot", "konton", "kapital", "buffert",
      "bufferten", "skuld", "skulder", "tillgångar", "tillgångarna",
      "Sveabolån", "Kreditia", "Fondia", "DuPont",
      "P/B", "floaten", "avgifter", "avgiften", "spread", "spriden",
    ],
    bygga: (reg) => {
      const seAntal = reg.filter((r) => r.kategori === "SEKTORANALYS").length;
      const kallor = [
        kursKalla(reg, "se-24-banksektorn", "Läroplanen — balansräkningen spegelvänd: nätlånet, deposit-betan, tre förlusttrappor, K/I, kapitaltäckning, utdelningsekvationen"),
        kursKalla(reg, "se-19-forsakringssektorn", "Läroplanen — finansbalansräkningens andra sida: floaten arbetar i portföljen, inlåningen i räntespringan"),
        kursKalla(reg, "ln-01-dupont-analysen", "Läroplanen — Du Pont-identitetens industriella ursprung (bankens spegel: räntenät + avgifter − kostnader − förluster, gånger hävstång)"),
        kursKalla(reg, "ud-09-utdelningens-hallbarhet", "Läroplanen — utdelningens hållbarhet för det vanliga bolaget (bankens utdelningsekvation är dess reglerade kusin)"),
        kursKalla(reg, "vr-02-normaliserade-multipler", "Läroplanen — protokollets sjätte fråga: botten eller topp på förlustcykeln"),
        kursKalla(reg, "st-04-stabilitet-genom-kreditcykeln", "Läroplanen — kreditcykeln ur låntagarens perspektiv (samma balansräkning, två världar)"),
        kursKalla(reg, "ma-08-bostadsmarknadens-mekanik", "Läroplanen — transmissionen från ränta till bostad (bankens resultaträkning är dess fortsättning)"),
        kursKalla(reg, "mt-05-byteskostnader-och-inlasning", "Läroplanen — byteskostnadsmoaten: inlåningsfranchisen är moaten i pengars skepnad"),
      ];
      const k = kallor[0];
      const se24 = reg.find((r) => r.slug === "se-24-banksektorn");
      return {
        text:
          `Bankens balansräkning är spegelvänd: inlåningen är råvaran, utlåningen är produkten, och vinsten föds i springan mellan räntorna — nätlånet. Sektoranalysens familjekurser har gått igenom skogen, rederiet, försäkringen, gruvan, kemian och stålet — banken är finansbalansräkningens gren, den sektor som bär en fjärdedel av den svenska börsen (allt nedan är utbildning i hur sektorn läses, med kursens egna modelltal och tydligt påhittade banker — inga placeringstips):\n\n1️⃣ BALANSRÄKNINGEN SPEGELVÄND — NÄTLÅNET OCH RÄNTENÄTET. Kursens första exempelbank Sveabolån Bank AB (påhittad för räkningen) är en ren bolånebank: 100 miljarder kronor utlåning till hushåll till 3,60 procent — ränteinkomsterna 3 600 miljoner per år. Finansieringen bärs av 80 miljarder hushållsinlåning till 1,00 procent (800 miljoner i räntekostnad) och 20 miljarder penningmarknadsfinansiering till 2,60 procent (520 miljoner). Räkna springan: 3 600 minus 800 minus 520 = 2 280 miljoner i nätlånsintäkt — räntenätet 2,28 procent av utlåningen. Inlåningsandelen, 80 procent, är hela hemligheten: lönekontot är marknadens trögaste kontoflytt (mt-05:s byteskostnad i pengars skepnad — autogiron, appen och hemlånet sitter fast), och därför betalar banken 1,00 procent för pengar som marknaden prissätter till 2,60. Skillnaden, 1,60 procentenheter på 80 miljarder, är 1 280 miljoner om året — inlåningsfranchisens värde i en enda rad. Granngenrens spegel: se-19:s försäkringsbolag får sin float att arbeta i portföljen; banken låter inlåningen arbeta i räntespringan (am-01 äger spridens mikrovärld, ma-05 kreditriskens marknadspris — här prissätts samma risk i utlåningsräntan själv).\n2️⃣ RÄNTESVÄNGEN — DEPOSIT-BETAN SOM ENVÄRDE. Reporäntan stiger en procentenhet. Bolåneräntan följer direkt: 3,60 blir 4,60 procent, inkomsten 4 600 miljoner — plus 1 000. Inlåningen följer bara delvis: beta 0,4 ger 1,00 plus 0,40 = 1,40 procent, kostnaden 1 120 miljoner — plus 320. Penningmarknaden följer fullt ut: 2,60 blir 3,60, kostnaden 720 — plus 200. Ny nätlånsintäkt: 4 600 minus 1 120 minus 720 = 2 760 miljoner, en ökning med 480 miljoner eller 21 procent, från en räterörelse som bara rörde kundernas bolåneräkning. Av varje ny intäktskrona behålls 48 öre — 52 läcker tillbaka i finansieringen, och läckan är betans spegel. Fallet nedåt är mekaniskt symmetriskt (minus en procentenhet ger 1 800 miljoner, minus 21 procent) men verklighetens asymmetri är grymmare: när inlåningsräntan närmar sig noll kan den inte falla längre, betan stiger mot 1 och räntenätet pressas av varje ytterligare sjunkande ränta — erfarenheten från 2015–2021 års negativa räntor. Linjäriteten håller ändå räkneverket: plus två procentenheter ger 5 600 minus 1 440 minus 920 = 3 240 miljoner — plus 960, plus 42 procent. En bank med inlåningsbeta 0,2 svänger dubbelt så kraftigt som en med 0,4: två banker med identiska balansräkningar kan leva i två olika ränteklimat. (Gränser: ma-08 äger transmissionen från ränta till bostad — detta kapitel äger dess fortsättning in i resultaträkningen; ma-03 äger realräntan som begrepp.)\n3️⃣ KREDITFÖRLUSTENS KLOCKA — TRE BÖCKER, TRE TRAPPOR. Kursens andra exempelbank Kreditia Bank AB (påhittad) är konsumtionskreditens nischbank: 10 miljarder utlåning till 12,0 procent ränta, finansierad på obligationsmarknaden till 3,0 — nätlånet 900 miljoner, räntenätet 9,0 procent, fyra gånger Sveabolåns. Bred marginal köper förlustutrymme: normalåret kostar kreditförlusterna 2,0 procent av boken, 200 miljoner, och resultatet blir 900 plus avgifter 150 minus kostnader 700 minus förluster 200 = plus 150 miljoner. I krisåret, när konsumtionsboken går från 2,0 till 6,0 procent, blir samma rad 900 plus 150 minus 700 minus 600 = minus 250 miljoner: förlust — ett enda krisår äter 1,7 normalår. Tredje exempelbanken Fondia Bank AB (påhittad) är bolagsbanken: 40 miljarder utlåning till företag till 5,0 procent, finansierad av 15 miljarder bolagsinlåning till noll procent (transaktionskonton — bolag förväntar sig ingen ränta) och 25 miljarder marknad till 3,0: nätlånet 2 000 minus 0 minus 750 = 1 250 miljoner. Normalårets förlust 0,3 procent av boken, 120 miljoner — men 40 procent av Fondias bok sitter i fastighetsbolag, och fastighetskriser som 1990-talets svenska gav den branschen förlustnivåer kring 3,0 procent: 1 200 miljoner, tiofalt mot normalåret. Nu de tre trapporna sida vid sida: bolåneboken går från 0,05 till 1,0 procent i en djupkris — tjugofaldigt, men från bottennivå och dämpat av panten (huset måste tappa över 40 procent i värde innan första kronan av en 60-procentig belåningsgrad försvinner); konsumtionsboken tredubblas från redan hög nivå; företagsboken tiordubblas. Det riskjusterade räntenätet gör böckerna jämförbara: Kreditia (900 minus 200) på 10 miljarder = 7,0 procent mot Sveabolåns (2 280 minus 50) på 100 miljarder = 2,23 procent — nätmarginalens båda världar. Räntenätet betalar för förlusttrappan, aldrig tvärtom. (Gränser: st-04 äger kreditcykeln ur låntagarens perspektiv; ma-05 riskens marknadspris — detta kapitel äger trapporna i bankens egen bok.)\n4️⃣ K/I-TALET — KOSTNADSBASEN OCH SKALAN. Banken är en industri med en enda råvara: förtroende. Sveabolåns rörelsekostnader är 1 100 miljoner (nät, system, personal, kontor) på intäkter 2 700 (nätlån 2 280 plus avgifter 420) — kostnads-intäktskvoten 40,7 procent. Kreditia: kostnader 700 på intäkter 1 050 — K/I 66,7 procent. Per kund blir kontrasten talbar: Sveabolåns 400 000 kunder bär 2 750 kronor i kostnad per kund men tjänar 5 700 i nätlånsintäkt och 1 050 i avgifter — 4 000 kronor kvar före förlust. Kreditias 250 000 kunder bär nästan samma kostnad, 2 800 kronor, men tjänar 3 600 i nätlånet och 600 i avgifter — 1 400 före förlust, och förlusten (800 kronor per kund) lämnar 600. Kontrollen: 400 000 kunder gånger 4 000 kronor minus bolåneförlusterna 50 miljoner = 1 550 miljoner — exakt rörelseresultatet. K/I-talets väg är skärningspunkten mellan skala och teknik: filialnätet var en gång distributionsmoat, digitaliseringen har flyttat moaten från torgläget till appen och pressat talen nedåt — men appen sänker också bytestiden för kontot, vilket hotar inlåningsfranchisen med erosion (mt-02:s mönster). En bank med K/I 40 och en med 65 kan bära samma värdering — men de dör av olika saker: den första av räntenätets tryck, den andra av förlusttrappans djup.\n5️⃣ KAPITALTÄCKNINGEN — DEN REGLERADE HÄVSTÅNGEN. Ett vanligt bolags hävstång väljer styrelsen; en banks väljer regleringen. Sveabolåns balansräkning i sammandrag: tillgångar 110 miljarder (100 bolån plus 10 likviditet och övrigt), finansierade av 100 miljarder räntebärande skulder, 2 miljarder övriga skulder och 8 miljarder eget kapital — hävstången 110 på 8 = 13,75 kronor per egen kapitalkrona. I banken är den hävstången affären, men bara under taket: de riskvägda tillgångarna (bolån väger lågt, företagslån högt) blir 80 miljarder, och 8 miljarder eget kapital ger kärnprimärkapitalrelationen 10,0 procent mot ett fiktivt krav på 8,5 — bufferten 1,5 procentenheter, 1 200 miljoner. Avkastningen: rörelseresultatet 1 550 minus skatt 22 procent = 1 209 miljoner netto på 8 miljarder eget kapital = 15,1 procent. Se Du Pont-spegeln (ln-01 äger den industriella identiteten): i banken blir avkastningen räntenät plus avgifter minus kostnader minus förluster, allt gånger hävstången — och hävstången får inte röras. Försöket visar varför: samma netto på 4 miljarder eget kapital vore 30,2 procent avkastning, men kapitalrelationen 5,0 procent hamnar under kravet 8,5 — otillåtet. Därav utdelningsekvationen, sektorns egna version av ud-09:s hållbarhetstest: vinsten 1 209 miljoner kan delas ut eller behållas. Växer de riskvägda tillgångarna 5 procent (80 till 84 miljarder) kräver tioprocentsregeln 8 400 i kapital — av 8 000 plus 1 209 finns 9 209, och 809 miljoner (67 procent av vinsten) kan lämnas till ägarna. Växer boken 10 procent istället krävs 8 800 — utdelningen krymper till 409 miljoner (34 procent). Växa eller dela: bankens eviga växel, reglerad ned till sista procentenheten.\n6️⃣ PROTROLLET — SEX FRÅGOR TILL EN BANKRÄKNING. (1) FINANSIERINGSMIXEN — hur stor andel av finansieringen är trög inlåning (Sveabolån 80 procent) och hur mycket är marknad som minns varje räterörelse? (2) BETAN — hur många procentenheter rör inlåningsräntan när styrräntan rör en, och vad blir räntenätets sväng (beta 0,4 gav plus 21 procent per procentenhet)? (3) BÖCKERNAS TRAPPOR — andelen bolån, konsumtionskredit och företagsutlåning, med normal- och krisnivå för varje trappa (0,05/1,0 — 2,0/6,0 — 0,3/3,0)? (4) K/I-TALET OCH DESS VÄG — 40,7 eller 66,7 procent, och trycker skala och digitalisering det nedåt eller köper tillväxten det uppåt? (5) KAPITALTÄCKNINGEN — kärnprimärkapitalrelationen mot kravet, buffertens storlek i miljoner, och utdelningsekvationens utrymme vid bokens tillväxt? (6) CYKELLÄGET — var på provisionscykeln läses siffrorna: är förlustnivån en botten som normaliseringen (vr-02) måste justera upp, eller en topp som ska normaliseras ned? Först därefter är ett värderingstal som P/B (v05) ens ett samtal — och översiktskursen på AKM1-sidan (km-040) binder samman begreppen ovanpå, medan familjens case-samling (pc-03:s Swedbank-case) ger en verklig bankräkning att träna protokollet mot. Sektoranalysens familj har sin historia: Palmstruchs Stockholm Banco gav ut Europas första sedlar 1661 och kollapsade 1664 — ur askan föddes Riksbanken 1668; krisen 1991–93 skrev om kreditvurmeringen; de negativa räntorna 2015–2021 prövade nollgolvet. Protokollet dömer inte banken — det gör räkningen läsbar: sex frågor, sex svar, och en klocka som tickar.\n\nI kategorin sektoranalys finns ${seAntal} kurser — banksektorn (${se24 ? se24.niva.toLowerCase() + " nivå" : "i registret"}) är finansbalansräkningens gren av familjen: försäkringsbolaget äger floaten, banken äger springan mellan räntorna. Som alltid: detta är utbildning i en metod — inga placeringstips.` +
          kallradFler(kallor),
        amne: "banksektorn",
        kalla: k,
        kallor,
        handlings: [
          { text: "Kursen: Banksektorn", lank: "/kurser/se-24-banksektorn", ikon: "🏦", beskrivning: "Räntenätet, inlåningsfranchisen och kreditförlustens klocka" },
          { text: "Kursen: Försäkringssektorn", lank: "/kurser/se-19-forsakringssektorn", ikon: "🛡️", beskrivning: "Finansbalansräkningens andra sida — floaten" },
          { text: "Kursen: Du Pont-analysen", lank: "/kurser/ln-01-dupont-analysen", ikon: "🔬", beskrivning: "Plocka isär ROE — bankens spegel" },
          { text: "Kursen: Utdelningens hållbarhet", lank: "/kurser/ud-09-utdelningens-hallbarhet", ikon: "💧", beskrivning: "Utdelningsekvationens ursprung" },
          { text: "Kursen: Normaliserade multipler", lank: "/kurser/vr-02-normaliserade-multipler", ikon: "📐", beskrivning: "Räkna bort cykeln — protokollets sjätte fråga" },
          { text: "Kursen: Stabilitet genom kreditcykeln", lank: "/kurser/st-04-stabilitet-genom-kreditcykeln", ikon: "⚖️", beskrivning: "Cykeln ur låntagarens perspektiv" },
          { text: "Kursen: Bostadsmarknadens mekanik", lank: "/kurser/ma-08-bostadsmarknadens-mekanik", ikon: "🏘️", beskrivning: "Transmissionen från ränta till bostad" },
          { text: "Kursen: Byteskostnader och inlåsning", lank: "/kurser/mt-05-byteskostnader-och-inlasning", ikon: "🔒", beskrivning: "Inlåningsfranchisen som moat" },
          { text: "Kursen: Bank-sektorn (översikt)", lank: "/kurser/km-040-banksektorn", ikon: "🗺️", beskrivning: "AKM1-översikten — granne med djupkursen" },
          { text: "Kursen: P/B (Price-to-Book)", lank: "/kurser/v05-pb", ikon: "📕", beskrivning: "Bankens eget värderingstal" },
          { text: "Kursen: Case: Swedbank", lank: "/kurser/pc-03-case-swedbank", ikon: "🧪", beskrivning: "Träna protokollet mot ett verkligt case" },
          { text: "Vad är combined ratio?", lank: "fragor:" + encodeURIComponent("vad är combined ratio?"), ikon: "🛡️", beskrivning: "Försäkringsgrannens nyckeltal" },
          { text: "Vad är normalisering?", lank: "fragor:" + encodeURIComponent("vad är normalisering?"), ikon: "📏", beskrivning: "Räkna bort cykeln ur multipeln" },
        ],
        motfraga: { text: "Vad är combined ratio?", kategori: "försäkringssektorn" },
        fordjupa: { text: k.titel, lank: "/kurser/se-24-banksektorn" },
      };
    },
  },
];

// ── Huvudingången ──────────────────────────────────────────────────────────

/**
 * Svara lokalt med banksektor-mönstret — eller null (då har hela kedjan
 * före redan lämnat null och API-flödet tar över som förr). Ligger efter
 * kategoristängning och FÖRE marknadsrytm i widgetens kedja och kan därför
 * aldrig stjäla en fråga från ett tidigare lager; det fångar bara frågor
 * som alla lager före det lämnar null på. Översiktsorden («banksektorn»,
 * «kreditförlust», «kapitaltäckning», «utlåning») ägs av det tidiga
 * sektorlagret (km-040:s översikt) — detta lager äger maskinens egna
 * begrepp (nätlånet, räntenätet, deposit-beta, K/I-talet,
 * kärnprimärkapitalrelationen, förlusttrapporna). Samma matchningssemantik
 * som basmotorn: minst ett kärnord krävs, poäng = kärnord × 3 + stärkord,
 * oavgjort → först deklarerade mönstret vinner (strikt >, deterministiskt).
 * Samma fråga ⇒ bitidentiskt svar.
 */
export function svaraLokaltBanksektorn(fraga: string, register: RegisterRad[]): LokaltSvar | null {
  const fragaStr = diafri(fraga);
  if (!fragaStr) return null;
  const fragaOrd = fragaStr.split(" ");
  let bast: { svar: LokaltSvar; poang: number } | null = null;
  for (const m of BANKSEKTOR_MONSTER) {
    const karnTraff = m.karnord.filter((nk) => traff(fragaOrd, fragaStr, nk));
    if (karnTraff.length === 0) continue; // krav: minst ett kärnord
    const starkTraff = m.starkord?.filter((nk) => traff(fragaOrd, fragaStr, nk)) ?? [];
    const poang = karnTraff.length * 3 + starkTraff.length;
    if (!bast || poang > bast.poang) bast = { svar: m.bygga(register), poang };
  }
  return bast ? bast.svar : null;
}
