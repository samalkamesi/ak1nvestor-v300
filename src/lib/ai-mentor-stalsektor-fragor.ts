/**
 * AI-MENTORN 2.0 — STÅLSEKTOR-FÖRHANDSFRÅGOR (s6-u1, fönster 31 i spår 6,
 * manifest auto-s6-1789965330060, byggare 1/3).
 *
 * ETT källmärkt monster om kapacitetens sektor — stålet, börsens mest
 * renodlade cykelmaskin:
 *   · STÅLSEKTORN ("vad är stålsektorn?" — kapacitetens hävstång, malmen
 *     mot skrotet, förädlingstrappan) se-23 STÅLSEKTORN primär —
 *     SEKTORANALYS-familjens tjugotredje steg, född 2026-09-21 06:05
 *     (commit 5c60035c, registrets 483:e kurs) och mentorväglös under
 *     sina första timmar: mentorn kunde inte svara på «vad är
 *     stålsektorn?» före detta lager (sond _s6u1o31-sond.mjs: 120 lösa
 *     kurser, se-23 bland dem — rs-09-precedensen: spår 5:s kurs född ⇒
 *     mentorn lär sig den nästa fönster). Källor: rk-15 CYKELRISK
 *     (cykeln som portföljbegrepp — kursen äger mekaniken de lånar
 *     exemplen från) · vr-02 NORMALISERADE MULTIPLER (värderingen på
 *     cykelns medelpris, inte toppårets tonpris) · se-20 GRUV- OCH
 *     METALLSEKTORN (malmen i berget — gränsen till ugnen) · mt-05
 *     BYTESKOSTNADER (kärnplåtens kvalificering = moaten i stålets
 *     skepnad). Familjetraditionen hålls: skogen, rederiet,
 *     försäkringen, gruvan, kemian — och nu stålet.
 *
 * ÄMNESVAL EFTER SOND (dokumenterad kedja):
 *   • Sond _s6u1o31-sond.mjs (före byggstart): 483 kurser i registret,
 *     363 mentorlänkade, 120 lösa i 15 kategorier. Kategoristängningarna
 *     (kt-09 budpremien ⇒ KATALYSATOR, roic-05 EVA ⇒ LÖNSAMHET, od-09
 *     försäkringsskrivandet ⇒ OPTIONS & DERIVAT, rp-07 CVaR, vr-09
 *     konglomeratrabatten ⇒ VÄRDERING) lämnas uttryckligen ÅT FÖNSTRETS
 *     SYSKON (u2/u3) — anspråk data/vakten/s6-u1-fonster31-ansprak.md
 *     på disk FÖRE byggstart.
 *   • se-23-stalsektorn VALT: registrets NYASTE kurs — mentorn ska kunna
 *     kursen samma dag den föds; aritmetiken är KVD-omräknad av kursens
 *     egen leverans (s5-u3: 34 ekvationer oberoende omräknade).
 *
 * DOKUMENTERADE GRÄNSER (kursens egen gränsdragning — bärs i TEXT):
 *   • malmen i berget, brytningen, gruvsidans kassamarginal → se-20
 *     (nakna «malm»/«malmen»/«gruvsektorn» bärs EJ som kärnord — ett
 *     framtida gruv-lagers fett, kemisektorns F-fall respekteras).
 *   • cykelrisken som portföljbegrepp → rk-15 (KÄLLA här).
 *   • normaliseringen, multipeln på medelpriset → vr-02 (KÄLLA här).
 *   • byteskostnadsmoaten som begrepp → mt-05 (KÄLLA här).
 *   • elnätet som sektor → km-047 (länk här — kärnplåtens efterfrågan).
 *   • bostadstransmissionen → ma-08 · orderstocken → se-22/tidsaxeln ·
 *     soliditeten som mått → st-01 · täckningsbidraget/marginaltrappan →
 *     volatilitetsmekaniken (ln-03) · halvledarfabens hävstång → se-02 ·
 *     material-/industrisektorn → km-045/km-041 (översiktsgrannar).
 *   • KÄRNORDSGRÄNS mot sektordjupet: obestämd «stålbolag» bärs EJ
 *     (tavstånd 2 till deras «saasbolag» — de ligger tidigare i kedjan
 *     och skulle stjäla frågan oavsett); bestämd «stålbolaget» är trygg
 *     (avstånd 3) och bärs här. Bevis: _s6u1o31-karnord.mjs — 1 kollision
 *     före kassationen, 0 efter.
 *
 * Aritmetiken i svaret (kursens EGNA modelltal med tydligt påhittade
 * verk — Forshammar Stål AB, Kvarnviken Stål AB och Velox Specialstål AB
 * — maskinellt omräknade i regressionstestets D-fall):
 *   · Forshammar (integrerat verk, 4,0 Mton/år, fasta 4 000 Mkr, rörlig
 *     1 900 kr/ton, pris 3 400): bidrag 1 500/ton ⇒ full volym
 *     6 000 − 4 000 = +2 000 Mkr · 80 % ⇒ 4 800 − 4 000 = +800 ·
 *     60 % ⇒ 3 600 − 4 000 = −400. Volymen föll 40 %, resultatet svängde
 *     2 400 Mkr; var tionde procentenhet = 600 Mkr; fasta per ton
 *     1 000 → 1 250 → 1 667.
 *   · Kvartalsskuggan (70 % kontrakt à 3 400 + 30 % spot; spot −20 % ⇒
 *     2 720): blandpris 3 196 = −6,0 % men blandbidrag 1 296 = −13,6 % —
 *     hävstången 2,3 gånger; kontrollen 50/50 ⇒ 3 060 (−10 %) mot
 *     1 160 (−22,7 %).
 *   · Två råvaruvägar (båda 1 900 kr/ton rörlig): malmvägen 1 100 +
 *     350 + 200 + 250 mot skrotvägen 1 200 + 400 + 100 + 200; malmchock
 *     +30 % = 330 kr/ton för masugsverket, elchock +50 % = 200 kr/ton
 *     för skrotverket; fasta 4 000 mot 700 ⇒ vid 60 % volym: −400 mot
 *     +20 Mkr.
 *   · Masugnen: 12 miljarder för 1,0 Mton/år = 12 000 kr per årston,
 *     40 års livslängd, byggtid 3–4 år; kapacitetsloppet: fem verk à
 *     +20 % = sektorn +20 % — ingen ensam beslutade det.
 *   · Velox (kärnplåt): pris 12 000, rörlig 5 500 ⇒ bidrag 6 500;
 *     0,3 Mton × 6 500 = 1 950 − 900 = 1 050 Mkr på 3 600 = 29,2 %
 *     resultatmarginal mot Forshammars 14,7; kvalificering cirka tre år
 *     hos fyrtio transformatorverk.
 *
 * KEDJEPLATS: 74:e motorn (efter kemisektor, FÖRE marknadsrytm — deras
 * SIST-deklaration + L01 respekteras, multipel-precedensen). Kärnorden är
 * mekaniskt disjunkta mot samtliga 73 lager (2 145 kärnord kontrollerade,
 * av _s6u1o31-karnord.mjs); verifieras levande av detta lagers eget test
 * (J-fall)
 * och kedjetestets strukturfall.
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
 * bolag. Exempelvärdena är kursens egna modelltal (Forshammar, Kvarnviken
 * och Velox är påhittade verk) — konstruerade för övningens skull.
 *
 * ── DEPENDENCY-INJECTION (samma mönster som hela motorn) ─────────────
 * Registret skickas IN som parameter (endast `import type`) så att
 * verktyg/testa-ai-mentor-stalsektor.mjs kan köra filen direkt i Node.
 * Källkurserna (se-23-stalsektorn, rk-15-cykelrisk, vr-02-normaliserade-
 * multipler, se-20-gruv-och-metallsektorn, mt-05-byteskostnader-och-
 * inlasning, km-047-utilitysektorn) finns i KURSREGISTER — inga
 * fantomlänkar (testfall D12 vakar).
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

// ── Den 1 frågan: stålsektorn (se-23) ───────────────────────────────────────

export const STALSEKTOR_MONSTER: FragMonster[] = [
  {
    id: "stalsektorn",
    karnord: [
      // Sond _s6u1o31-karnord.mjs: 45 kärnord, 0 kollisioner mot 2 145
      // befintliga i 73 lager (efter kassation av «stålbolag» — tav 2 mot
      // sektordjupets «saasbolag», deras tidigare kedjeposition vinner ändå).
      // GRÄNSER (kursens egen gränsdragning, bärs i TEXT): malmen i berget
      // → se-20 · cykelbegreppen → rk-15 · normaliseringen → vr-02 ·
      // moat-begreppet → mt-05 · elnätet → km-047.
      "stålsektorn", "stålindustrin", "stålverket", "stålverk", "stålbolaget",
      "stålcykeln", "stålräkning", "stålräkningen",
      "kapacitetsutnyttjande", "kapacitetsutnyttjandet", "utnyttjandegrad",
      "utnyttjandegraden", "kapacitetsloppet",
      "masugn", "masugnen", "masugnar",
      "ljusbågsugn", "ljusbågsugnen", "skrotverk", "skrotverket",
      "malmvägen", "skrotvägen",
      "järnmalmspris", "järnmalmspriset", "grossistpris", "grossistpriset",
      "skrotpris", "skrotpriset",
      "kärnplåt", "kärnplåten", "transformatorstål", "transformatorstålet",
      "elektriskt stål",
      "förädlingstrappan", "förädlingstrappa",
      "kontraktspris", "kontraktspriset", "kvartalsskuggan", "kvartalsskugga",
      "valsverk", "valsverket",
      "bessemerprocessen", "syrgasprocessen",
      "ugnens hävstång", "kapacitetens hävstång",
    ],
    starkord: [
      "stål", "stålet", "stålets", "verket", "ugnen", "ton", "tonet",
      "tonpris", "tonpriset", "volym", "volymen", "kapacitet", "kapaciteten",
      "priset", "cykeln", "cykel", "kontrakt", "kontrakten", "spot",
      "malm", "malmen", "skrot", "skrotet", "fasta", "kostnaden", "korgen",
      "elnätet", "transformator", "transformatorerna", "kvalificeringen",
      "kvalificering", "förädling", "förädlingen", "plåten", "coil",
      "bandstål", "marginalen", "resultatet", "Forshammar", "Kvarnviken",
      "Velox", "verk", "koks",
    ],
    bygga: (reg) => {
      const seAntal = reg.filter((r) => r.kategori === "SEKTORANALYS").length;
      const kallor = [
        kursKalla(reg, "se-23-stalsektorn", "Läroplanen — kapacitetens hävstång: fullt/80/60 procent, kontraktens två klockor, malmens och skrotets vägar"),
        kursKalla(reg, "rk-15-cykelrisk", "Läroplanen — cykelrisken som portföljbegrepp (kursen äger mekaniken de lånar exemplen från)"),
        kursKalla(reg, "vr-02-normaliserade-multipler", "Läroplanen — värderingen på cykelns medelpris, inte toppårets tonpris"),
        kursKalla(reg, "se-20-gruv-och-metallsektorn", "Läroplanen — malmen i berget: gruvsidans ekonomi (gränsen till ugnen)"),
        kursKalla(reg, "mt-05-byteskostnader-och-inlasning", "Läroplanen — byteskostnadsmoaten: kärnplåtens kvalificering är dess skepnad i stål"),
      ];
      const k = kallor[0];
      const se23 = reg.find((r) => r.slug === "se-23-stalsektorn");
      return {
        text:
          `Stålsektorn är börsens mest renodlade cykelmaskin — den sektor som byggde den tunga industrin och där resultaträkningen ägs av volymen, inte av priset. Allt sedan Bessemerprocessen 1856 (luft genom smält gjutjärn, kolet brann ut av egen kraft) har sektorns ekonomi varit ugnens ekonomi: ugnen och valsverket kostar samma per år vare sig de går varma eller kalla. Sektoranalysens familjekurser har gått igenom skogen, rederiet, försäkringen, gruvan och kemian — stålet är kapacitetens gren (allt nedan är utbildning i hur sektorn läses, med kursens egna modelltal och tydligt påhittade verk — inga placeringstips):\n\n1️⃣ KAPACITETSUTNYTTJANDET — UGNENS HÄVSTÅNG. Kursens första exempelverk Forshammar Stål AB (påhittat) är ett integrerat verk: malm och koks in i masugnen, syrgasprocessen blåser, valsverket formar — kapacitet 4,0 miljoner ton om året. De fasta kostnaderna är 4 000 miljoner kronor per år (1 000 kronor per ton vid fullt utnyttjande), den rörliga kostnaden 1 900 kronor per ton och kontraktspriset 3 400 — bidraget per ton blir 3 400 minus 1 900 = 1 500 kronor. Räkna stegen: vid full volym ger 1 500 × 4,0 = 6 000 miljoner i täckningsbidrag minus 4 000 fasta = rörelseresultat plus 2 000 miljoner. Sjunker utnyttjandet till 80 procent (3,2 miljoner ton) faller resultatet till 800; vid 60 procent (2,4 miljoner ton) är det minus 400 miljoner. Volymen föll 40 procent — resultatet svängde 2 400 miljoner, från djup vinst till förlust utan att priset rörde sig en krona. Var tionde procentenhet kapacitetsutnyttjande är 600 miljoner i resultat, och den fasta kostnaden per ton stiger från 1 000 vid fullt utnyttjande till 1 250 vid 80 och 1 667 vid 60. Därför läses en stålräkning uppifrån och ner: utnyttjandegraden först, multipeln sist (gränsen mot grannkurserna: rk-15 äger cykelrisken som begrepp och vr-02 normaliseringskonsten — detta kapitel äger mekaniken de lånar sitt exempel från; se-02 äger samma hävstång i halvledarfaben).\n2️⃣ KONTRAKT OCH SPOT — PRISETS TVÅ KLOCKOR. Priset på stål är inte ett pris utan två: kontraktspriset som förhandlas kvartalsvis med industriella kunder och spotpriset som sätts dagligen. Forshammar säljer 70 procent på kvartalskontrakt (3 400 kronor tonet) och 30 procent på spot. Faller spot 20 procent till 2 720 medan kontrakten står kvar blir blandpriset 0,7 × 3 400 + 0,3 × 2 720 = 3 196 kronor — priset föll bara 6,0 procent. Men bidraget: en kontraktston ger 1 500, en spotton 2 720 − 1 900 = 820; blandbidraget 0,7 × 1 500 + 0,3 × 820 = 1 296 kronor — ett fall med 13,6 procent. Ett prisfall på 6 procent blev ett bidragsfall på 13,6: hävstången 2,3 gånger, av samma skäl som i kapitel ett — den rörliga kostnaden står kvar. Kontrollen i andra änden: en femtiofemtioblandning ger blandpriset 3 060 (minus 10 procent) och blandbidraget 1 160 (minus 22,7 procent) — samma hävstång, ty den är inbyggd i kostnadens tröghet. Därtill klockan: kontrakten omförhandlas först vid kvartalsgränsen, så det kvartal som redovisas speglar föregående kvartals spot — kvartalsskuggan. Ett bolag med hög kontraktsandel redovisar lugnare kvartal men hamnar efter i vändningarna: skyddet är ett lån, inte en gåva. Kontraktsandelen är därför den första raden i en stålbolagsbeskrivning.\n3️⃣ MALM ELLER SKROT — DE TVÅ RÅVARUVÄGARNA. Två kemiska vägar leder till samma ton stål: masugnen som reducerar järnmalm med koks, och ljusbågsugnen som smälter skrot med elektricitet. Kursens andra exempelverk Kvarnviken Stål AB (påhittat) är ett skrotverk med ljusbågsugn. Båda verkens rörliga kostnad är 1 900 kronor per ton — men med annan geografi. Forshammars korg: järnmalm 1 100 (prissatt globalt), koks 350, processenergi 200, arbete och övrigt 250. Kvarnvikens: skrot 1 200 (omkring 1,08 ton skrot per ton stål), el 400 (400 kilowattimmar per ton), elektroder och övrigt 100, arbete 200. Räkna känsligheten: stiger järnmalmspriset 30 procent kostar det masugsverket 1 100 × 0,30 = 330 kronor per ton — en chock skrotverket inte märker. Stiger elpriset 50 procent kostar det skrotverket 400 × 0,50 = 200 kronor per ton — masugsverket rör knappt på sig. Den djupaste skillnaden är samvariationen: malmen prissätts globalt av gruvornas utbud (gruvkursens se-20:s värld — dess ekonomi i berget är deras kapitel, här börjar ekonomin först vid ugnen) medan skrotet är stålets egen spegel: när stålpriset faller faller skrotpriset efter, och skrotverkets marginal dämpas inbyggt i fallet. Skrotet är en kort cykel, malmen en lång. De fasta kostnaderna fullbordar kontrasten: Kvarnviken bär 700 miljoner per år mot Forshammars 4 000 — vid 60 procents utnyttjande ger skrotverket 0,48 × 1 500 = 720 minus 700 = plus 20 miljoner (nästan noll, och ugnen kan dessutom pausas veckovis) medan masugsverket visar minus 400. Samma volymfall, olika konsekvens: cykeln straffar inte alla lika — den frågar först vilken kemi verket bygger på.\n4️⃣ UTBUDETS TRÖGHET — MASUGNEN SOM 40-ÅRSBESLUT. Efterfrågesidans kurvor svänger på några år; utbudssidan svänger på decennier. En masugnslinje kostar i kursens räkneexempel 12 miljarder kronor och ger en miljon ton per år — 12 000 kronor per årston kapacitet — med teknisk livslängd på omkring 40 år: beslutet är ett lån på fyra decennier, fattat på en enda års prislista. Mekanismen som gör cykeln: under de goda åren ser varje verk samma räkning och var och en beslutar expandera — om fem verk var och en lägger 20 procent växer sektorns utbud 20 procent, men ingen ensam verksstyrelse fattade det beslutet. Byggtiden på tre till fyra år släpar tonaget in i nästa fas, ofta redan i ett fallande pris; historien bär mönstret (under 2010-talets mitt göts omkring hälften av världens stål i ett enda land, och när tillväxten där bröts blev överskottet globalt). Den pedagogiska frågan till en expansionsplan är inte om efterfrågan finns i dag utan vad alla andra redan byggt — och spegelbilden gör toppen: nedlagd kapacitet tar år att väcka, prisutbrotten kommer när efterfrågan vänder mot ett utbud som stängdes i förtid.\n5️⃣ FÖRÄDLINGSTRAPPAN — FRÅN COIL TILL KÄRNPLÅT. Volymstålet säljs i ton och prissätts av cykeln, men trappan har steg: varje steg upp i förädling flyttar priset från börsnoterat ton till förhandlad prestanda. Kursens tredje exempelverk Velox Specialstål AB (påhittat) gör elektriskt stål — kärnplåten som transformatorernas kärnor skärs ur. Priset ligger på 12 000 kronor per ton, den rörliga kostnaden på 5 500: bidraget blir 6 500 per ton mot Forshammars 1 500. Volymen är liten — 0,3 miljoner ton — men med fasta kostnader på 900 miljoner blir resultatet 1 950 − 900 = 1 050 miljoner på en omsättning av 3 600: resultatmarginal 29,2 procent mot Forshammars 14,7 vid fullt utnyttjande. Skillnaden är inte stålet utan kundrelationen: kärnplåten kvalificeras hos varje transformatorverk i en provnings- och godkännandeprocess som tar tre år och omfattar omkring fyrtio verk världen över — det är byteskostnadsmoaten (mt-05:s begrepp) i stålets skepnad: trappan skyddar inte genom att stålet är hemligt utan genom att bytet är dyrt och långsamt. Och efterfrågan följer inte bygget utan elnäten (km-047:s sektor): när överföringskapacitet och förnybar utbyggnad accelererar ökar transformatorbeställningarna — en efterfrågevåg oberoende av bostadscykeln. Trappans läxa är dubbel: marginalen köps med tiden, och skyddet förnyas av prestanda — en ny materialgeneration kan tvinga hela trappan att byggas om.\n6️⃣ STÅLLÄSARENS PROTOKOLL — FEM FRÅGOR TILL EN STÅLRÄKNING. (1) VAR I KAPACITETSSTEGEN läses siffrorna — redovisas utnyttjandegraden, och är vinsten räknad på ett toppårs tonpris eller på cykelns medel (vr-02:s normaliseringskrav — Grahams varning för låg multipel på tillfälligt hög vinst är stålräkningens första kommentarrad)? (2) VILKA TVÅ KLOCKOR bär priset — kontraktsandel och spotandel, och vilken kvartalsskugga ligger i resultaträkningens priser? (3) VILKEN RÅVARUVÄG — malm eller skrot — och vad kostar en malmchock på 30 procent respektive en elchock på 50 procent i just den kostnadskorgen? (4) VAR PÅ FÖRÄDLINGSTRAPPAN står verket — volymstål, eller kvalificeringar som tagit år att vinna? (5) VAD ÄR ÖVERLEVNADSMÅTTET i dalåret — hur många minus-400-miljoner-år tål balansräkningen innan soliditeten blir sektorns hela fråga (st-01:s mått; frågan är inte om minusåret kommer utan hur många cykeln tål)? Protokollet dömer inte bolaget — det gör räkningen läsbar: fem frågor, fem svar, och först därefter är en multipel ens ett tal att samtala om. Stålcykeln belönar inte den som räknar vackrast på toppen utan den som räknar djupast i dalen.\n\nI kategorin sektoranalys finns ${seAntal} kurser — stålsektorn (${se23 ? se23.niva.toLowerCase() + " nivå" : "i registret"}) är kapacitetens gren av familjen: gruvan äger malmen i berget, kemian för den vidare till matens kemi — och stålverket översätter den till det material som bär broar, brotts och elnät. Som alltid: detta är utbildning i en metod — inga placeringstips.` +
          kallradFler(kallor),
        amne: "stålsektorn",
        kalla: k,
        kallor,
        handlings: [
          { text: "Kursen: Stålsektorn", lank: "/kurser/se-23-stalsektorn", ikon: "🏭", beskrivning: "Kapacitetens hävstång, malmen mot skrotet, förädlingstrappan" },
          { text: "Kursen: Cykel-risk", lank: "/kurser/rk-15-cykelrisk", ikon: "🔄", beskrivning: "Cykelrisken som portföljbegrepp" },
          { text: "Kursen: Normaliserade multipler", lank: "/kurser/vr-02-normaliserade-multipler", ikon: "📐", beskrivning: "Värdera på cykelns medelpris — räkna bort cykeln" },
          { text: "Kursen: Gruv- och metallsektorn", lank: "/kurser/se-20-gruv-och-metallsektorn", ikon: "⛏️", beskrivning: "Malmen i berget — granngenrenens ekonomi" },
          { text: "Kursen: Byteskostnader", lank: "/kurser/mt-05-byteskostnader-och-inlasning", ikon: "🔒", beskrivning: "Moaten bakom kärnplåtens kvalificering" },
          { text: "Kursen: Utility-sektorn", lank: "/kurser/km-047-utilitysektorn", ikon: "⚡", beskrivning: "Elnäten — kärnplåtens efterfrågan" },
          { text: "Vad är normalisering?", lank: "fragor:" + encodeURIComponent("vad är normalisering?"), ikon: "📏", beskrivning: "Räkna bort cykeln ur multipeln" },
          { text: "Vad är prisfullmakten?", lank: "fragor:" + encodeURIComponent("vad är prisfullmakten?"), ikon: "🔱", beskrivning: "Trappans prisfullmakt — grannfrågan" },
        ],
        motfraga: { text: "Vad är normalisering?", kategori: "stålsektor" },
        fordjupa: { text: k.titel, lank: "/kurser/se-23-stalsektorn" },
      };
    },
  },
];

// ── Huvudingången ──────────────────────────────────────────────────────────

/**
 * Svara lokalt med stålsektor-mönstret — eller null (då har hela kedjan
 * före redan lämnat null och API-flödet tar över som förr). Ligger efter
 * kemisektor och FÖRE marknadsrytm i widgetens kedja och kan därför aldrig
 * stjäla en fråga från ett tidigare lager; det fångar bara frågor som alla
 * lager före det lämnar null på. Samma matchningssemantik som basmotorn:
 * minst ett kärnord krävs, poäng = kärnord × 3 + stärkord, oavgjort → först
 * deklarerade mönstret vinner (strikt >, deterministiskt). Samma fråga ⇒
 * bitidentiskt svar.
 */
export function svaraLokaltStalsektor(fraga: string, register: RegisterRad[]): LokaltSvar | null {
  const fragaStr = diafri(fraga);
  if (!fragaStr) return null;
  const fragaOrd = fragaStr.split(" ");
  let bast: { svar: LokaltSvar; poang: number } | null = null;
  for (const m of STALSEKTOR_MONSTER) {
    const karnTraff = m.karnord.filter((nk) => traff(fragaOrd, fragaStr, nk));
    if (karnTraff.length === 0) continue; // krav: minst ett kärnord
    const starkTraff = m.starkord?.filter((nk) => traff(fragaOrd, fragaStr, nk)) ?? [];
    const poang = karnTraff.length * 3 + starkTraff.length;
    if (!bast || poang > bast.poang) bast = { svar: m.bygga(register), poang };
  }
  return bast ? bast.svar : null;
}
