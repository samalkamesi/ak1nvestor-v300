/**
 * AI-MENTORN 2.0 — ENHETSEKONOMI-FÖRHANDSFRÅGOR (s6-u2, omgång 35 i
 * spår 6, manifest auto-s6-1790245511290, byggare 2/3).
 *
 * TVÅ källmärkta monsters ⇒ KATEGORISTÄNGNING TILLVÄXT (kategorins två
 * sista mentorväglösa kurser aktiveras — sond _s6u1d-mentorlosa.mjs
 * 2026-09-24: 91 lösa, TILLVÄXT exakt 2):
 *   · ENHETSEKONOMIN ("vad är enhetsekonomin?/livstidsvärdet?/CAC?/
 *     payback?/kassatrappan?…" — kunden som en liten investering)
 *     tx-06 ENHETSEKONOMIN primär — TILLVÄXT-familjens sjätte steg,
 *     född i spår 5 (s5, data/kurser-tillagg/tx-06-enhetsekonomin.json).
 *     Territoriet dokumenterat RENT av syskon s6-u3 omgång 31
 *     (beteendefallor-sond2: "ENHETSEKONOMIN (tx-06/tx-07) RENT —
 *     reserverad som fallback, ej behövd"). Källor: tx-05 TILLVÄXTENS
 *     FÖRSTA LÄSNING (årtal, procent och tjocka filtar — gränsen till
 *     detta lagers andrahandsläsning) · tx-03 NÄR SKAPAR TILLVÄXT VÄRDE
 *     (återinvesteringens matematik — kassatrappans underskott är dess
 *     räknefall) · v02 ARR-TILLVÄXT (kursens egen pekare: nettochurnens
 *     ARR-vokabulär) · v19 KAPITALFÖRBRÄNNNING (payback-blindhetens
 *     bro till bränntakten) · mt-05 BYTESKOSTNADER (retentionens
 *     mekanism — kunden stannar för att bytet kostar) · mt-03 VALLGRAVEN
 *     I SIFFROR (moaten som VISAR sig i enhetsekonomi är en mätbar sådan).
 *   · KONVERTERINGSTESTET ("vad är konverteringsgraden?/tullkvoten?/
 *     driftkassan?/betalningstiden?…" — intäktsraden påstår, kassan
 *     vittnar) tx-07 FRÅN SIFFRA TILL KASSA primär — familjens sjunde
 *     steg; kursens resumé konstaterar själv att kassaflödeskonvertering
 *     har noll kursägare (sond mot 470 kurser). Källor: tx-06 (syster-
 *     steget — trappan och konverteringen delar väntan) · tx-05 · tx-03 ·
 *     bk-08 INTÄKTREDOVISNINGEN (redovisningskonstens granskning —
 *     kursens egen gränsritning: detta lager äger TESTET som hittar
 *     platsen att gräva) · km-003 KASSAFLÖDESANALYSEN (den djupa
 *     kassaflödesanalysen — samma rad, annat djup).
 *
 * ÄMNESVAL EFTER SOND (dokumenterad kedja):
 *   • Sond _s6u1d-mentorlosa.mjs (före byggstart): 495 kurser, 83 lager,
 *     91 mentorväglösa — TILLVÄXT exakt 2 (tx-06, tx-07) ⇒ kategori-
 *     stängning med u2:s kvot (+2 monsters). Syskonens territorier
 *     (BOKMASTER 58, PRAKTISKA CASE 12, PE 3, SKATT 2, kategorisistorna
 *     rp-07/pf-07/roic-06/v15) lämnas uttryckligen ÅT FÖNSTRETS SYSKON —
 *     anspråk data/vakten/auto-s6-1790245511290-s6-u2-ansprak.md på disk
 *     FÖRE byggstart.
 *   • Sond _s6u2o35-sond.mjs: 82 filer · 2 324 kärnord LIVE · 83 motorer
 *     (216 monsters). Kandidatfamiljerna RENTA genom hela kedjan;
 *     12 kanoniska frågor NULL utom «vad är churn?» → sektordjup
 *     (deras fångst vinner — V19).
 *
 * DOKUMENTERADE GRÄNSER (kursens egna gränsdragningar — bärs i TEXT):
 *   • «churn»/«churn rate» → sektordjup (telekomfamiljens kärnord —
 *     sonden: exakt kollision; detta lager nås via «kundbortfall»/
 *     «bortfallet»/«årsbortfall»).
 *   • «kundlivslängd»/«kundlivslängden» (båda formerna) → pe-mekanikens
 *     «fondlivslängd» (tav 2 fångar frågeorden; den bestämda formen som
 *     kärnord här hade OGÄRNINGEN att fånga det nakna ordet med tav 1 —
 *     modultestets J-fall fångade levande, kärnordet struket).
 *   • naket «bortfallet» → krishanteringens «börsfallet» (tav 1 — syskonet
 *     u1:s omgångens fönstermotor; nås här via «kundbortfall»).
 *   • «ltv inflationen» → makrons «inflation» (delfånga i fras — kursens
 *     fällnamn bärs i TEXT som LTV-inflationen).
 *   • kassakonverteringscykeln/CCC/rörelsekapital som BEGREPP →
 *     kapitalbindningen (ln-04/km-003-familjen; tx-07:s cykelkapitel
 *     bärs här i text med attribution — tillväxtens vinkel är detta lagers).
 *   • ARR/netintäktsretentionens vokabulär → v02 · bränntakten → v19 ·
 *     vallgravens mått → mt-03 · byteskostnaden → mt-05 · redovisnings-
 *     konsten som begrepp → bokföringsfamiljen (bk-08) · den första
 *     läsningen (tillväxtakt, jämförbarhet, engångsposter) → tx-05 ·
 *     återinvesteringens avkastning → tx-03 · S-kurvan/mättnaden/prismix
 *     → tx-04/tillväxtdjupet (kategorigrannar) · diskonteringsräntan som
 *     begrepp → värderingsfamiljen (här endast kursens egen 10-procents-
 *     konvention, redovisad som övre gräns).
 *
 * Aritmetiken i svaren (kursernas EGNA modelltal — maskinellt omräknade
 * i regressionstestets D-fall):
 *   · tx-06: CAC 600 · ARPU 100 · kontribution 70 · churn 3,5 %/mån ·
 *     payback 600/70 = 8,6 mån · livslängd 1/0,035 = 28,6 mån · LTV
 *     70/0,035 = 2 000 · LTV/CAC 3,33 · årsbortfall 1−0,965¹² = 34,8 %
 *     (inte 42) · diskonterat 70/(0,035+0,008) ≈ 1 630 (nyckeltal ≈ 2,7) ·
 *     tre liv: 1,75 % → 57,1 mån/4 000/6,67 · 3,5 % → 28,6/2 000/3,33 ·
 *     7,0 % → 14,3/1 000/1,67 (payback 8,6 i alla tre) · kassatrappan:
 *     1 000 kunder/mån × 600 = 600 000 kr ut, brytpunkt 600 000/70 =
 *     8 571 kunder ≈ 10 mån, jämviktsstock 1 000/0,035 = 28 571 kunder ≈
 *     2,0 Mkr/mån · två spakar: organisk kanal 120 kr → 1,7 mån mot
 *     betald 1 400 kr → 20,0.
 *   · tx-07: omsättning 200→240 (+20 %) · EBITDA 96→120 (48→50 %, +24) ·
 *     fordringar 41→59 (+18) · lager 30→42 (+12) · leverantörer 25→31
 *     (+6) · tull 18+12−6 = 24 · driftkassa 120−18−12+6−10−6 = 80 ·
 *     konvertering 80/120 = 0,67 mot 72/96 = 0,75 · tullens andel av
 *     tillväxten 24/40 = 60 % · marginalökning mot tull 24/24 = ett till
 *     ett (brytpunkten) · kassan 72→80 = +11 % (kursen rundar till
 *     "tolv" — motorräkningen ger 8/72 = 11,1 %, här curad till elva) ·
 *     betalningstid 41/200×365 = 75 → 59/240×365 = 90 dagar (fordringar
 *     +44 % mot omsättning +20 %) · cykel 75+91−76 = 90 → 90+107−79 =
 *     118 (+28; lagertid 30/120×365 = 91 → 42/144×365 = 107,
 *     leverantörstid 25/120×365 = 76 → 31/144×365 = 79, varukostnad
 *     60 % av omsättningen) · utmaningen: 150−20−8+4−12−8 = 106,
 *     106/150 = 0,71 · 74/300×365 = 90 dagar · 90+95−72 = 113 dagar.
 *
 * KEDJEPLATS: omgångens SIST-bygge — efter valideringsfonster, FÖRE
 * marknadsrytm (deras permanenta SIST-deklaration + L01 respekteras,
 * multipel-precedensen). Kärnorden är mekaniskt disjunkta mot samtliga
 * 82 lager (sond + detta lagers eget test, J-fall) och kedjetestets
 * strukturfall.
 *
 * Matchningen speglar motorns hjälpfunktioner (samma lösning som alla
 * syskinlager: Node type-stripping löser endast `import type`, så de rena
 * funktionerna speglas hit). Semantisk likhet med motorn BEVISAS av
 * testets felstavningsfall (B) och determinismfall (C). Driftvarning:
 * ändras motorns matchning måste denna spegel följa — testfall B vakar.
 *
 * ── JURIDIKGRINDEN (lagen 2007:528) ──────────────────────────────────
 * All text är pedagogisk utbildning om hur kundrörelser LÄSES, RÄKNAS
 * och BEDÖMS — inga köp-/säljsignaler, inga placeringstips, inga
 * omdömen om enskilda bolag. Exempelvärdena är kursernas egna modelltal,
 * avsiktligt rent påhittade — konstruerade för övningens skull.
 *
 * ── DEPENDENCY-INJECTION (samma mönster som hela motorn) ─────────────
 * Registret skickas IN som parameter (endast `import type`) så att
 * verktyg/testa-ai-mentor-enhetsekonomi.mjs kan köra filen direkt i
 * Node. Källkurserna (tx-06-enhetsekonomin, tx-05-tillvaxtens-forsta-
 * lasning, tx-03-nar-skapar-tillvaxt-varde, v02-arr-tillvaxt,
 * v19-kapitalforbrinning, mt-05-byteskostnader-och-inlasning,
 * mt-03-vallgraven-i-siffror, tx-07-fran-siffra-till-kassa,
 * bk-08-intaktredovisningen, km-003-kassaflodesanalysen) finns i
 * KURSREGISTER — inga fantomlänkar (testets D-fall vakar).
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

// ── Monster 1 av 2: enhetsekonomin (tx-06) ──────────────────────────────────

export const ENHETSEKONOMI_MONSTER: FragMonster[] = [
  {
    id: "enhetsekonomins-fem-tal",
    karnord: [
      // Sond _s6u2o35-sond.mjs: kandidaterna RENTA mot 2 324 kärnord i
      // 82 lager. Kasserade (dokumenterade gränser, bärs i TEXT):
      // «churn»/«churn rate» → sektordjup (telekomfamiljen — deras
      // fångst vinner, V19; här nås begreppet via «kundbortfall»/
      // «bortfallsprocent») · naket «kundlivslängd»/«kundlivslängden» →
      // pe-mekanikens «fondlivslängd» (tav 2 fångar frågeorden i båda
      // formerna — och den bestämda formen som kärnord här hade fångat
      // det nakna med tav 1, J-fallets levande fångst) · naket
      // «bortfallet» → krishanteringens «börsfallet» (tav 1, syskonet
      // u1:s fönstermotor — deras fångst vinner; nås via «kundbortfall»)
      // · «ltv inflationen» → makrons «inflation» (fällnamnet
      // LTV-inflationen bärs i text).
      "enhetsekonomin", "enhetsekonomi", "enhetsekonomins",
      "kundanskaffningskostnad", "kundanskaffningskostnaden",
      "värvningskostnad", "värvningskostnaden",
      "livstidsvärdet", "livstidsvärde",
      "kundbortfall", "bortfallsprocent", "årsbortfall",
      "återbetalningstiden", "återbetalningstid", "payback",
      "kassatrappan", "jämviktsstock", "jämviktsstocken",
      "månadsintäkt", "månadsintäkten", "per kund",
      "kohort", "kohorten", "kohorter",
      "ersättningsmaskin", "ersättningsmaskinen",
      "bortfalsförnekelsen", "payback blindheten",
      "marginalanskaffning", "nästa kund", "nästa kunden",
      "CAC", "LTV", "ARPU",
    ],
    starkord: [
      "kund", "kunden", "kunder", "kunderna", "kundstocken",
      "retention", "retentionen", "abonnemang", "abonnemanget",
      "prenumeration", "tillväxt", "tillväxten", "växer", "växa",
      "kontribution", "kontributionen", "kanal", "kanalen", "kanaler",
      "organisk", "betald", "division", "månaden", "månads", "brutto",
      "netto", "churn", "förlorar", "lämnar", "stannar",
    ],
    bygga: (reg) => {
      const txAntal = reg.filter((r) => r.kategori === "TILLVÄXT").length;
      const kallor = [
        kursKalla(reg, "tx-06-enhetsekonomin", "Läroplanen — kunden som en liten investering: fem tal, allt annat härleds"),
        kursKalla(reg, "tx-05-tillvaxtens-forsta-lasning", "Läroplanen — den första läsningen av tillväxten (årtal, procent, tjocka filtar)"),
        kursKalla(reg, "tx-03-nar-skapar-tillvaxt-varde", "Läroplanen — återinvesteringens matematik: när köpt tillväxt är värd sitt pris"),
        kursKalla(reg, "v02-arr-tillvaxt", "Läroplanen — ARR-sidans vokabulär: nettochurn och netintäktsretention"),
        kursKalla(reg, "v19-kapitalforbranning", "Läroplanen — bränntakten: payback-blindhetens bro till kassarisken"),
        kursKalla(reg, "mt-05-byteskostnader-och-inlasning", "Läroplanen — retentionens mekanism: kunden stannar för att bytet kostar"),
        kursKalla(reg, "mt-03-vallgraven-i-siffror", "Läroplanen — vallgravens mått: en moat som syns i enhetsekonomi är mätbar"),
      ];
      const k = kallor[0];
      const tx06 = reg.find((r) => r.slug === "tx-06-enhetsekonomin");
      return {
        text:
          `Enhetsekonomin är räkneläran för EN kund — tillväxtens minsta byggsten, före procenter och före diagram. Synsättet är en investering: bolaget lägger ut anskaffningskostnaden för att vinna kunden och får en ström av kontribution tillbaka. Fem tal bär hela kursen (allt nedan är utbildning i metoden, med kursens egna påhittade modelltal — inga placeringstips):\n\n1️⃣ DE FEM TALEN. Kundanskaffningskostnaden (branschens CAC) är 600 kronor — annonser, säljtid eller rabatt. Månadsintäkten per kund (ARPU) är 100 kronor, varav 70 är kontribution: det som återstår när de kostnader som följer just denna kund är betalda — servern, frakten, kortavgiften, supporten. Kundbortfallet — churn i branschens språk, ord som sektorfamiljen äger — är 3,5 procent per månad. Tre av de fem är observationer per kund, ett är ett antagande om framtiden (bortfallet) och ett är en division av de andra. Kontributionen är INTE vinsten: kunden måste först betala tillbaka sin egen inköpsnota innan lokalen, utvecklingen och ledningen kan betalas — därför kan två bolag med samma omsättning bära helt olika ekonomi, och skillnaden sitter i de 70 kronorna och hur många månader de får rinna.\n2️⃣ DIVISIONERNA SOM BÄR ALLT. Första: livslängden — 1 delat med 0,035 är 28,6 månader. Andra: livstidsvärdet (LTV) — kontributionen delad med bortfallet, 70 delat med 0,035 = 2 000 kronor (samma division som livslängden, vilket är poängen). Tredje: återbetalningstiden (payback) — 600 delat med 70 = 8,6 månader. Nyckeltalet blir LTV per CAC: 2 000 delat med 600 = 3,33. En varningsslaga med i paketet: 3,5 procent per månad är INTE 42 procent per år utan 1 minus 0,965 upphöjt till 12 = 34,8 procent — kvarvarandet rabatteras månad för månad, inte årsvis. Och hederligheten: med en diskonteringsränta på 10 procent per år (cirka 0,80 procent per månad) faller livstidsvärdet till 70 delat med 0,043, omkring 1 630 kronor, och nyckeltalet till omkring 2,7 — ett livstidsvärde utan diskontering är en övre gräns, inte en prognos. De relativa jämförelserna — vilken kanal, vilket pris, vilken retention — överlever diskonteringen; absolutbeloppen gör det inte.\n3️⃣ SAMMA PAYBACK, TRE LIV. Tre bolag med identisk anskaffning 600 och kontribution 70 skiljs åt av ETT tal: bortfallet. Bolag A tappar 1,75 procent per månad — livslängd 57,1 månader, livstidsvärde 70/0,0175 = 4 000 kronor, nyckeltal 6,67. Bolag B är kursexemplet: 3,5 procent, 28,6 månader, 2 000 kronor, 3,33. Bolag C tappar 7,0 procent — livslängd 14,3 månader, livstidsvärde 1 000 kronor, nyckeltal 1,67. Återbetalningstiden är 8,6 månader i alla tre, för den beror bara på anskaffning och kontribution. Därav kursens skarpaste skiljelinje: payback mäter risken på det utlagda kapitalet — hur länge pengarna är exponerade — medan livstidsvärdet mäter priset på själva kunden. Ett bolag kan vara en utmärkt lånrörelse (snabb payback) och en dålig ägarrörelse (kort liv), och omvänt. Halverat bortfall fördubblar livstidsvärdet — förbättrad retention slår nyförsäljning, krona för krona. Bolag C:s kundstock är en läckande balansräkning: varje månad måste 7 procent av allt köpas om — tillväxten är i realiteten en ersättningsmaskin tills retentionen förbättras. Kursens regel: jämför aldrig två kundrörelser på tillväxtprocent innan bägges bruttobortfall är känt (v02 äger ARR-sidans ord — nettochurn kan visa noll medan halva stocken byts ut; brutto och netintäktsretention är två tal och båda behövs).\n4️⃣ KASSATRAPPAN — DE TVÅ SPAKARNA. Ett bolag vinner 1 000 nya kunder per månad till 600 kronor: anskaffningsflödet är 600 000 kronor per månad, utbetalt omedelbart, medan kundstockens kontribution sipprar in med 70 kronor per kund och månad. Brytpunkten nås när stockens kontribution täcker anskaffningen — 600 000 delat med 70 = 8 571 kunder, och med 3,5 procent bortfall nås den efter omkring tio månader. Stabil jämvikt inträder vid 1 000 delat med 0,035 = 28 571 kunder, där kontributionen är omkring 2,0 miljoner kronor per månad och varje ny kund bara ersätter bortfallet. Två lärdomar: payback-tiden är bolagets finansieringsbehov i miniatyr — de tio första månadernas underskott måste bäras av kapital (v19 äger bränntaktens granskning) — och vid jämvikt upphör tillväxt att skapa kassaflöde om inte enhetsekonomin förbättras: maskinen arbetar då enbart för att stå stilla. De två spakarna: SÄNK ANSKAFFNINGEN — organisk kanal i exemplet 120 kronor ger 1,7 månaders payback mot betald kanal 1 400 kronor som ger 20,0 — eller FÖRLÄNG OCH FÖRDJUPA KUNDEN — lägre bortfall och högre kontribution (mt-05:s byteskostnad är retentionens mekanism: kunden stannar inte av lojalitet utan för att bytet kostar). Ordningen är principen: först spaken som inte kräver mer kapital, sedan den som gör.\n5️⃣ FEM FÄLLOR. (1) LTV-inflationen — livstidsvärdet är en division vars nämnare är ett antagande; vilken siffra som helst kan köpas med en tillräckligt lång livslängd, så läs det som en prognos med egen risk, inte en observation. (2) bortfalsförnekelsen — nettochurn kan visa noll medan halva stocken byts ut. (3) genomsnittsfällan — medeltalen för hela stocken gäller inte nästa kund; blandningen av gamla lågbortfallskunder och nya högbortfallskunder gör snittet till en historiebok, och beslutet fattas om nästa kohort — på marginalen, inte i medelvärdet. (4) Payback-blindheten — ett livstidsvärde på tre gånger anskaffningen säger ingenting om kassan om återbetalningen tar 40 månader; bolaget kan förblöda innan värdet infinns sig. (5) Den blandade anskaffningen — samlad CAC döljer att kanalerna har olika priser och att den sista kunden är den dyraste: en snittkostnad på 600 kan dölja att de sista hundra kunderna kostade 1 400 styck (marginal-anskaffningen stiger när de billiga kanalerna mättas).\n6️⃣ ENHETSPROTOKOLLET — FEM FRÅGOR. (1) MARGINALEN — vad kostar nästa kund, i den kanal som faktiskt måste användas när tillväxten skalas? (2) KONTRIBUTIONEN — vad betalar kunden per period efter just hennes rörliga kostnader? (3) VARAKTIGHETEN — hur länge stannar kunden, brutto och netto, med diskonteringen synlig? (4) ÅTERBETALNINGEN — när är kronan tillbaka, och vem finansierar väntan? (5) KOHORTEN — bär nästa kohort samma ekonomi som snittet, eller är tillväxten på väg in i en dyrare kanal med kortare kundliv? Den som svarar på de fem har konverterat en tillväxtprocent till en kapitalallokering: varje ny kund är en investering med känd kostnad, känd avkastningsprofil och känd tid. Systrarna i familjen bär varsin sida — tx-05 den första läsningen av tillväxtakten, tx-03 återinvesteringens matematik, mt-03 vallgravens mått (en moat som VISAR sig i lägre anskaffning eller lägre bortfall är en mätbar sådan, inte en berättelse) — och syskonsteget tx-07 för räkneläran vidare till kassan: hur mycket av tillväxten som blir kassa är nästa fråga efter hur mycket en kund är värd.\n\nI kategorin tillväxt finns ${txAntal} kurser — enhetsekonomin (${tx06 ? tx06.niva.toLowerCase() + " nivå, " + tx06.kapitel + " kapitel" : "i registret"}) är familjens sjätte steg: källan, motorerna, återinvesteringen, gränserna, den första läsningen — och nu byggstenen själv. Som alltid: detta är utbildning i en metod — inga placeringstips.` +
          kallradFler(kallor),
        amne: "enhetsekonomin",
        kalla: k,
        kallor,
        handlings: [
          { text: "Kursen: Enhetsekonomin", lank: "/kurser/tx-06-enhetsekonomin", ikon: "🧮", beskrivning: "Nästa kunds hela räknelära — de fem talen" },
          { text: "Kursen: Tillväxtens första läsning", lank: "/kurser/tx-05-tillvaxtens-forsta-lasning", ikon: "📈", beskrivning: "Årtal, procent och tjocka filtar" },
          { text: "Kursen: När skapar tillväxt värde?", lank: "/kurser/tx-03-nar-skapar-tillvaxt-varde", ikon: "♻️", beskrivning: "Återinvesteringens matematik" },
          { text: "Kursen: ARR-tillväxt", lank: "/kurser/v02-arr-tillvaxt", ikon: "🔁", beskrivning: "Nettochurn och netintäktsretention" },
          { text: "Kursen: Kapitalförbränning", lank: "/kurser/v19-kapitalforbranning", ikon: "🔥", beskrivning: "Bränntakten — paybackens baksida" },
          { text: "Kursen: Byteskostnader och inlåsning", lank: "/kurser/mt-05-byteskostnader-och-inlasning", ikon: "🔒", beskrivning: "Retentionens mekanism" },
          { text: "Kursen: Vallgraven i siffror", lank: "/kurser/mt-03-vallgraven-i-siffror", ikon: "🏰", beskrivning: "Moaten som mätbart tal" },
          { text: "Kursen: Från siffra till kassa", lank: "/kurser/tx-07-fran-siffra-till-kassa", ikon: "💧", beskrivning: "Syskonsteget — tillväxtens konverteringstest" },
          { text: "Kursen: Organisk vs förvärvad tillväxt", lank: "/kurser/tx-01-organisk-mot-forvarvad-tillvaxt", ikon: "🌱", beskrivning: "Spåra källan till tillväxten" },
          { text: "Vad är konverteringsgraden?", lank: "fragor:" + encodeURIComponent("vad är konverteringsgraden?"), ikon: "💧", beskrivning: "Syskonstegets test — kassan mot resultatet" },
          { text: "Vad är churn?", lank: "fragor:" + encodeURIComponent("vad är churn?"), ikon: "🚪", beskrivning: "Bortfallet — sektorfamiljens vinkel" },
          { text: "Vad är ARR?", lank: "fragor:" + encodeURIComponent("vad är arr?"), ikon: "🔁", beskrivning: "Återkommande intäkter" },
        ],
        motfraga: { text: "Vad är konverteringsgraden?", kategori: "konverteringstestet" },
        fordjupa: { text: k.titel, lank: "/kurser/tx-06-enhetsekonomin" },
      };
    },
  },
  // ── Monster 2 av 2: konverteringstestet (tx-07) ──────────────────────────
  {
    id: "konverteringstestet-fran-siffra-till-kassa",
    karnord: [
      // Sond _s6u2o35-sond.mjs: samtliga RENTA. Kasserade gränser som
      // KÄRNORD (bärs i TEXT med attribution): «kassakonverterings-
      // cykeln»/«ccc»/«rörelsekapital» → kapitalbindningen (ln-04/
      // km-003-familjen) · «redovisningskonst» → bokföringsfamiljen
      // (bk-08 äger granskningen; detta lager äger TESTET som hittar
      // platsen att gräva).
      "konverteringsgraden", "konverteringsgrad",
      "kassaflödeskonvertering", "konverteringstestet",
      "tullkvot", "tullkvoten", "tullen", "tillväxtens tull",
      "driftkassan", "driftkassa",
      "betalningstiden", "betalningstid",
      "lagertiden", "leverantörstiden", "leverantörstid",
      "äkta tull", "slirande kvalitet",
      "intäktsraden", "kassaraden", "tullens andel",
    ],
    starkord: [
      "kassa", "kassan", "kassaflöde", "kassaflödet", "ebitda",
      "omsättning", "omsättningen", "fordringar", "kundfordringar",
      "lager", "lagret", "leverantörer", "leverantörsskulder",
      "balansräkningen", "balansräkning", "marginal", "marginalen",
      "intäkter", "intäkterna", "resultat", "resultatet",
      "tillväxt", "tillväxten", "växer", "serie", "serien",
      "bokförs", "året", "dagar", "tull",
    ],
    bygga: (reg) => {
      const txAntal = reg.filter((r) => r.kategori === "TILLVÄXT").length;
      const kallor = [
        kursKalla(reg, "tx-07-fran-siffra-till-kassa", "Läroplanen — tillväxtens kvitto: konverteringstestet mellan intäktsrad och kassarad"),
        kursKalla(reg, "tx-06-enhetsekonomin", "Läroplanen — kassatrappan och payback: samma väntan sedd från kunden"),
        kursKalla(reg, "tx-05-tillvaxtens-forsta-lasning", "Läroplanen — den första läsningen; detta steg äger andrahandsläsningen där kassan kontrollerar berättelsen"),
        kursKalla(reg, "tx-03-nar-skapar-tillvaxt-varde", "Läroplanen — återinvesteringen: den äkta tullens räknefall"),
        kursKalla(reg, "bk-08-intaktredovisningen", "Läroplanen — intäktens födelse och redovisningskonstens granskning (IFRS 15)"),
        kursKalla(reg, "km-003-kassaflodesanalysen", "Läroplanen — den djupa kassaflödesanalysen, steg för steg"),
      ];
      const k = kallor[0];
      const tx07 = reg.find((r) => r.slug === "tx-07-fran-siffra-till-kassa");
      return {
        text:
          `Konverteringstestet är tillväxtanalysens kvitto: intäktsraden är ett påstående om affärer som gjorts, kassaraden är ett vittnesmål om pengar som rört sig — och för ett växande bolag är avståndet mellan dem en variabel, inte en konstant. Testet som detta steg äger: ställ driftkassan mot resultatet, år efter år, och läs serien (allt nedan är utbildning i metoden, med kursens egna påhittade modelltal — inga placeringstips):\n\n1️⃣ TESTET OCH GRADEN. Konverteringsgraden räknas som driftkassa (kassaflöde från löpande verksamhet) delat på EBITDA, och läses som en serie — aldrig som en enstaka siffra. Pedagogiska tumregler från praktiken: över 0,8 är stark konvertering (mer än fyra av fem resultatkronor blir kassa), 0,6 till 0,8 är normalt för ett växande bolag som betalar sin tull, under 0,5 är en varning som kräver förklaring innan den ursäktas. Zonerna är branschberoende i grunden: ett bolag med förskottsbetalda abonnemang kan ligga över ett helt (kassan kommer FÖRE intäkten — enhetsekonomin speglad i bokföringen), ett projektbolag med långa fakturor kan ligga under 0,5 i ett år utan att något är fel — men då ska serien visa att läget är strukturellt, inte förvärrande. Bankkontot kan inte skrivas upp efter önskan: kassan är den enda raden i rapporten som inte kan välja sin egen konvention.\n2️⃣ TULLEN — ARBETSKAPITALET SOM TILLVÄXTENS KOSTNAD. Tre poster i balansräkningen bestämmer tullen. Kundfordringar: varje fakturerad men obetald krona är resultat som bokförts men inte kassats. Lager: varor köpta inför kommande försäljning är kassa som redan lämnat bolaget — och lagret växer ofta FÖRE försäljningen. Leverantörsskulder: motposten — mottaget men obetalt, kassa som bolaget än så länge behåller. Tullen är nettot av de tre: förändringen i fordringar plus förändringen i lager minus förändringen i leverantörsskulder — exakt det belopp som balansräkningen dragit ifrån resultatet innan driftkassan beräknas. Tullkvoten är tullen delat på årets ökning av intäkterna: andelen av varje tillväxtkrona som fastnar i balansräkningen. (Kassakonverteringscykeln — de tre tiderna samlade i ett mått — ägs som begrepp av kapitalbindningsfamiljen; här bärs den i tillväxtens vinkel nedan.)\n3️⃣ RÄKNEEXEMPLET — ETT BOLAG SOM VÄXER 20 PROCENT. Bolaget (påhittat): omsättning 200 till 240 miljoner (+20 procent). EBITDA växer från 96 till 120 — marginalen förbättras från 48 till 50 procent, marginalökningen är 24 miljoner. Balansräkningen rör sig samtidigt: kundfordringar 41 till 59 (+18), lager 30 till 42 (+12), leverantörsskulder 25 till 31 (+6). Tullen blir 18 + 12 − 6 = 24 miljoner. Driftkassan: 120 − 18 − 12 + 6 − betalad skatt 10 − betalad ränta 6 = 80 miljoner. Konverteringsgraden: 80 delat på 120 = 0,67 — mot förra årets 72/96 = 0,75. Serien sjunker. Och testets vassaste rad: marginalökningen var 24 och tullen var 24 — förhållandet ett till ett, exakt konverteringens brytpunkt: varje tillväxtkrona marginalen skapade betalade balansräkningen sin krona, och kassan fick behålla ingenting av årets förbättring. Tullens andel av tillväxten: 24/40 = 60 procent. Omsättningen firar 20 procent, EBITDA firar 25 procent — men kassan växer från 72 till 80, elva procent, långsammare än allt annat i rapporten. Exemplet dömer INTE tillväxten: om lagret är byggt för en efterfrågan som nästa år realiseras är tullen balansräkningens sätt att betala i dag det kassan får i morgon — men riktningsfrågan (0,75 till 0,67 — nedåt), djupfrågan (betalningstiden nedan) och andelen (60 procent) avgör tillsammans om 20-procentaren är en bra historia eller en dyr.\n4️⃣ TRE FALLEN — SAMMA 24 MILJONER, TRE ANSIKTEN. Fall ett, ÄKTA TULL: verksamheten växer och arbetskapitalet växer i takt — betalningstiden (kundfordringar delat på omsättningen gånger 365) står stilla eller förbättras, och konverteringen sjunker måttligt för att återhämtas när tillväxten mogar. Frågan hör hemma i tx-03: ger de investerade kronorna tillräcklig avkastning? Fall två, SLIRANDE KVALITET: betalningstiden sträcker sig — i exemplet från 41/200 × 365 = 75 dagar till 59/240 × 365 = 90 dagar; fordringarna växer 44 procent medan omsättningen växer 20. Kunderna betalar senare och resultatet kvalitetsförsämras i tysthet: intäkterna finns, kassan kommer inte. Fall tre, REDOVISNINGSKONST: intäkter intas före fullbordad prestation, kostnader kapitaliseras i stället för att belasta resultatet — kassan hamnar efter medan resultaträkningen glänser, och skillnaden växer år från år (granskningen ägs av bokföringsfamiljen — bk-08:s intäktredovisning; detta test äger upptäckten av platsen att gräva). Skiljedomaren är samma i alla tre: läs TIDSSERIERNA, inte bara totalerna — ett års slirning är en notering, tre år är en kurva.\n5️⃣ CYKELN I TILLVÄXTENS LJUS — TIDEN SOM BALANSRÄKNINGENS RÖST. Med varukostnad 60 procent av omsättningen: förra året betalningstid 75 dagar, lagertid 30/120 × 365 = 91, leverantörstid 25/120 × 365 = 76 — cykeln 75 + 91 − 76 = 90 dagar. I år: 90 + 107 − 79 = 118, med lagertiden 42/144 × 365 = 107 och leverantörstiden 31/144 × 365 = 79. Cykeln förlängdes 28 dagar på ett enda år — bolaget finansierar nu nästan en månad mer av sin egen verksamhet, och det är balansräkningens sätt att säga vad konverteringsserien redan sa. Systerkursen tx-06 ser samma väntan från andra hållet: payback 8,6 månader och trappans längd är samma väntan — sedd från kunden respektive kassan.\n6️⃣ PROTROLLET — FYRA RADER PER ÅR. (1) KONVERTINGSGRADEN — 0,75, 0,67: riktningsfrågan. (2) BETALNINGSTIDEN — 75, 90 dagar: djupfrågan. (3) LAGERTIDEN — 91, 107: varorna står längre. (4) TULLENS ANDEL AV MARGINALÖKNINGEN — 24 mot 24, ett till ett: brytpunkten. En rad förklaring per rad, och fem tidshorisonter som ram: ett år är ett prov, serien är mönstret. Träna själv med kursens utmaning (påhittade tal): EBITDA 150, fordringar +20, lager +8, leverantörer +4, skatt 12, ränta 8 — driftkassa 150 − 20 − 8 + 4 − 12 − 8 = 106 och konvertering 106/150 = 0,71; kundfordringar 74 på omsättning 300 — betalningstid 74/300 × 365 = 90 dagar; med lagertid 95 och leverantörstid 72 — cykeln 90 + 95 − 72 = 113 dagar; och den som väger tyngst: förklara skillnaden mellan konverteringsgraden och betalningstiden som varningssignaler — graden ser hur MYCKET, tiden ser VARFÖR.\n\nI kategorin tillväxt finns ${txAntal} kurser — från siffra till kassa (${tx07 ? tx07.niva.toLowerCase() + " nivå, " + tx07.kapitel + " kapitel" : "i registret"}) är familjens sjunde steg och dess kvitto: först räkneläran per kund (tx-06), sedan testet av vad tillväxten faktiskt lämnar i kassan. Som alltid: detta är utbildning i en metod — inga placeringstips.` +
          kallradFler(kallor),
        amne: "konverteringstestet",
        kalla: k,
        kallor,
        handlings: [
          { text: "Kursen: Från siffra till kassa", lank: "/kurser/tx-07-fran-siffra-till-kassa", ikon: "💧", beskrivning: "Tillväxtens konverteringstest" },
          { text: "Kursen: Enhetsekonomin", lank: "/kurser/tx-06-enhetsekonomin", ikon: "🧮", beskrivning: "Syskonsteget — kassatrappan och payback" },
          { text: "Kursen: Kassaflödesanalys", lank: "/kurser/km-003-kassaflodesanalysen", ikon: "🔍", beskrivning: "Den djupa granskningen, steg för steg" },
          { text: "Kursen: Intäktredovisningen", lank: "/kurser/bk-08-intaktredovisningen", ikon: "📒", beskrivning: "Redovisningskonstens anatomi (IFRS 15)" },
          { text: "Kursen: När skapar tillväxt värde?", lank: "/kurser/tx-03-nar-skapar-tillvaxt-varde", ikon: "♻️", beskrivning: "Den äkta tullens avkastning" },
          { text: "Kursen: Tillväxtens första läsning", lank: "/kurser/tx-05-tillvaxtens-forsta-lasning", ikon: "📈", beskrivning: "Första läsningen — detta steg äger andra" },
          { text: "Kursen: Volym, pris och mix", lank: "/kurser/tx-02-volym-pris-och-mix", ikon: "⚙️", beskrivning: "Tillväxtens tre motorer" },
          { text: "Kursen: Tillväxtens gränser", lank: "/kurser/tx-04-tillvaxtens-granser", ikon: "📐", beskrivning: "S-kurvan och utrymmesräkningen" },
          { text: "Vad är enhetsekonomin?", lank: "fragor:" + encodeURIComponent("vad är enhetsekonomin?"), ikon: "🧮", beskrivning: "Syskonsteget — kundens hela räknelära" },
          { text: "Vad är kassakonverteringscykeln?", lank: "fragor:" + encodeURIComponent("vad är kassakonverteringscykeln?"), ikon: "🔄", beskrivning: "Cykeln som begrepp — kapitalbindningens vinkel" },
          { text: "Vad är driftkassan?", lank: "fragor:" + encodeURIComponent("vad är driftkassan?"), ikon: "💧", beskrivning: "Radens egen läsning" },
        ],
        motfraga: { text: "Vad är enhetsekonomin?", kategori: "enhetsekonomin" },
        fordjupa: { text: k.titel, lank: "/kurser/tx-07-fran-siffra-till-kassa" },
      };
    },
  },
];

// ── Huvudingången ──────────────────────────────────────────────────────────

/**
 * Svara lokalt med enhetsekonomi-/konverteringstest-mönstret — eller null
 * (då har hela kedjan före redan lämnat null och API-flödet tar över som
 * förr). Ligger efter valideringsfonster och FÖRE marknadsrytm i widgetens
 * kedja (omgångens SIST-bygge; marknadsrytms permanenta SIST-deklaration
 * respekteras) och kan därför aldrig stjäla en fråga från ett tidigare
 * lager; det fångar bara frågor som alla lager före det lämnar null på.
 * Dokumenterade gränser: «churn» → sektordjup · naket «kundlivslängd» →
 * pe-mekaniken · kassakonverteringscykeln/rörelsekapital → kapitalbindningen
 * · ARR → v02 · bränntakten → v19 · redovisningskonsten → bk-08 ·
 * S-kurvan/mättnaden → tx-04. Samma matchningssemantik som basmotorn:
 * minst ett kärnord krävs, poäng = kärnord × 3 + stärkord, oavgjort →
 * först deklarerade mönstret vinner (strikt >, deterministiskt).
 * Samma fråga ⇒ bitidentiskt svar.
 */
export function svaraLokaltEnhetsekonomi(fraga: string, register: RegisterRad[]): LokaltSvar | null {
  const fragaStr = diafri(fraga);
  if (!fragaStr) return null;
  const fragaOrd = fragaStr.split(" ");
  let bast: { svar: LokaltSvar; poang: number } | null = null;
  for (const m of ENHETSEKONOMI_MONSTER) {
    const karnTraff = m.karnord.filter((nk) => traff(fragaOrd, fragaStr, nk));
    if (karnTraff.length === 0) continue; // krav: minst ett kärnord
    const starkTraff = m.starkord?.filter((nk) => traff(fragaOrd, fragaStr, nk)) ?? [];
    const poang = karnTraff.length * 3 + starkTraff.length;
    if (!bast || poang > bast.poang) bast = { svar: m.bygga(register), poang };
  }
  return bast ? bast.svar : null;
}
