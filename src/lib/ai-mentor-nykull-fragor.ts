/**
 * AI-MENTORN 2.0 — NYKULL-KURSERNAS FÖRHANDSFRÅGOR (s6-u3, fönster 34 i
 * spår 6, manifest auto-s6-1790029519192, byggare 3/3).
 *
 * TRE källmärkta monsters som aktiverar spår 5:s kurskull (489→495, alla
 * födda mentorväglösa — rs-09-precedensen: nyfödd kurs aktiveras):
 *   · PRODUKTIONSGAPET ("vad är produktionsgapet?" — hastighetstaket, gap-
 *     formeln, tre sidor, Phillips-läxan, nollgolvet) ma-09 PRODUKTIONS-
 *     GAPET primär — MAKROEKONOMI & RÄNTA 13/14 → 14/14 FULLT MENTORLÄNKAD.
 *   · BINDNINGSRISKEN ("vad är bindningsrisken?" — fast mot rörlig,
 *     känslighetstalet, bindningstrappan, swappen utifrån) st-08 BINDNINGS-
 *     RISKEN primär — kursen fick sin första mentorlänk som KÄLLA i u1:s
 *     ränteswap-motor (samma fönster); detta lager äger PRIMÄR-svaret,
 *     låntagarens stol, enligt kursens egen spegelgräns (kap 5).
 *   · UNDERHÅLLSCAPEXET ("vad är underhållscapex?" — två ansikten, tre
 *     skattningsvägar, kassaörat före tillväxt, faskvoten, underinvesterings-
 *     fällan) ln-06 UNDERHÅLLSCAPEX primär — LÖNSAMHET 13/15 (roic-06
 *     förblir lös, öppet bokförd: kategorin stängs inte detta fönster).
 *
 * PIVOT EFTER RACE (öppet bokförd, Newmont/VZ-precedensens stil): första-
 * valet var TRE kategoristängningar ma-09 + od-11 + st-08 (anspråk disk-först
 * 2026-09-22 ~00:3x). Syskon u1:s anspråk (00:30, FÖRE detta) tog od-11
 * primär + st-08 som källa, och deras motor landade på disk 00:34 —
 * klaim-mtime-konventionen ger dem objektet; RÄNTESWAP-MONSTRET kasserat
 * utan git-spår (se-22-precedensen), deras yta orörd. Syskon u2 tog ks-09 +
 * ks-08 (KAPITALSTRUKTUR stängd). Båda syskonens anspråk lämnar uttryckligen
 * ma-09 och ln-06 åt u3 — detta lager följer deras lista. Kategoristängnings-
 * valet ma-09 står kvar (ingen tog den); st-08-lägget är nu primär-
 * aktiveringen av u1:s källmärkta kurs; ln-06 är nyfödelse-aktiveringen.
 *
 * ÄMNESVAL EFTER SOND (dokumenterad kedja, verktyg/_s6u3o34-sond.mjs +
 * _s6u3o34-sond-karnord{,2}.mjs, 2026-09-22):
 *   • Lagerlucksonden: 108 mentorlösa kurser i 79 lager / 185 monsters;
 *     ma-09 var MAKROEKONOMI & RÄNTAS enda lösa kurs (kategoristängning);
 *     ln-06 och roic-06 är LÖNSAMHETs två sista lösa (nyfödda i spår 5:s
 *     kull 492→495).
 *   • Kärnordsdisjunktion (rond 2, LIVE-läge med syskonens ränteswap +
 *     skuldordning: 82 motorer / 1 248 kärnord): 0 exakta kärnords-
 *     kollisioner, 0 grannar inom tavstånd 2, kanoniska prober NULL.
 *
 * DOKUMENTERADE GRÄNSER (etablerade lagers ägande — bärs i TEXT och i
 * modultestets G-fall; kärnorden lämnas åt sina ägare):
 *   • «ränteswap»/«swap»-familjen → u1:s ränteswap-motor (od-11 primär,
 *     samma fönster): maskineriet inifrån — benen, nättingen, säkrings-
 *     identiteten, swapkurvan, brytvärdet. Detta lager äger st-08:s vy:
 *     låntagarens stol, känslighetstalet, trapporna, det korrelerade fallet.
 *   • naket «swap» → handelsdagens vwap (tavstånd 1 fångar ordet —
 *     etablerad gräns sedan nyfodda-lagret).
 *   • naket «räntenoten» → banksektorns «räntenätet» (tavstånd 2, skugg-
 *     ningsprob bevisad): banksektorn äger den nakna frågan; här bärs
 *     ordet som starkord — i sällskap av ett kärnord vinner detta lager
 *     poängkampen.
 *   • naket «stresstest»/«känslighetsanalys» → stabilitetsdjupet (deras
 *     monster sedan omgång 13); här ägs det KORRELERADE fallet — ränta och
 *     konjunktur i samma våg — och känslighetstalet (kronor per procent-
 *     enhet), som är kursens eget verktyg.
 *   • «naturfrekvens»/arbetslöshetens mått/NAIRU → mk-02 (kursens egen
 *     gränsdeklaration); indikatorpanelen → ma-04; kostnadsspiran → ma-02;
 *     penningpolitikens instrument → mk-06; transmissionen → ma-01;
 *     cykelformerna → km-057; marginaltrappan → ln-03; orderboken → km-069.
 *   • naket «tillväxt» → basens tillväxt-monster (tav-1 fångar ordet);
 *     därför bärs «kassaörat före tillväxt» som KÄRNORDSFRAS men den nakna
 *     tillväxt-frågan lämnas basen. «fas1/2/3» → basens fasmonster: här
 *     bärs sammanskrivna «faskvoten» (prorata-precedensen i nyfodda-lagret).
 *   • kassaflödesanalysens struktur → km-003 (basens kassaflödes-monster);
 *     avskrivningsvalen → bk-05; accruals → ln-02; EBITDA-multipeln → v08;
 *     kapitalförbränningen → v19; allokeringsbeslutet → ks-02; modell-
 *     risken → rs-08; tillväxtens värde → tx-03; skuggförbindelserna →
 *     st-07; sektorns underhållscyklar → se-20/se-18; durationen → rk-08;
 *     clearing/motparten → rk-16 (kontrahent-lagret); bindningsvalet → ks-03;
 *     refinansieringsmuren → st-05.
 *
 * Aritmetiken i svaren (kursernas EGNA modelltal med tydligt påhittade
 * verk — exempel-ekonomin Svealand, Norrverk Verkstäder, Sund Värme,
 * Svanhals Verkstäder — maskinellt omräknade i regressionstestets D-fall):
 *   · Gap: 5,0 m × 1 600 = 8,0 mdr timmar · × 575 = 4 600 mdr · gapet
 *     (4 416 − 4 600) ÷ 4 600 = −4,0 % · trappan 4 508/4 600/4 784 =
 *     −2,0/0,0/+4,0 % · takets rörelse 0,99 × 1,008 = 0,998 ⇒ 4 590 ·
 *     spänningsmåttet 92 000 ÷ 205 000 = 0,45 · Okun 0,5 × 4,0 = 2,0 pp
 *     mot 6,5 ⇒ 8,5 % · Phillips 2,0 + 0,5 × gap ⇒ 0,0/1,0/2,0/3,0/4,0 ·
 *     Taylor 2,0 + 4,0 + 1,0 + 0,75 = 7,75 (händerna 1,0 + 0,75) ·
 *     lugnt 4,0 · nedgång 1,5 · kris −1,0 (nollgolvet) · Norrverk
 *     7 800 ÷ 10 000 = 78 % · +1 500 ⇒ 9 300 (93 %) · +2 500 ⇒ 10 300
 *     = 300 timmar över taket.
 *   · Bindning: A 600 × 6,00 % = 36 mot täckning 90/36 = 2,50 · B 30 mot
 *     3,00 · premien 6/år = 30 på fem år · break-even 5,00 − 2,20 = 2,80 ·
 *     känslighet 6,0/0/4,0 · korrelerat stress (+3,0 pp, EBIT 90→70):
 *     54 ⇒ 1,30 · 30 ⇒ 2,33 · 46 ⇒ 1,52 · trappan 10 + 24 = 34 ⇒ 2,65 ·
 *     swappen 200 × 0,50 % = 1 Mkr/år, känslighet 4,0 → 2,0, lugn 35,
 *     stress 41 ⇒ 1,71.
 *   · Underhåll: naivt 204 − 132 = 72 mot genomarbetat 204 − 72 = 132 ·
 *     tre vägar 720/12 + 480/40 = 72 · median 74/77/78/81/132 = 78 ·
 *     6,0 % × 1 200 = 72 · arbetsnummer 75 ⇒ kassaöra 129 (10,8 %; med 72:
 *     132 = 11,0 %) · tillväxtens pris 132 − 75 = 57 · faskvoten 132/72 =
 *     1,83 mot 78/72 = 1,08 · underinvesteringsfällan 72 − 40 = 32/år ⇒
 *     1 200 − 5 × 32 = 1 040 · jämförelsen 11,0 % mot 15,0 % kassaöra vid
 *     identisk EBITDA-marginal 17,0 % · nolltillväxtskassaörat 132.
 *
 * KEDJEPLATS: efter notläsning, FÖRE nyfodda + ränteswap + skuldordning +
 * marknadsrytm (syskonens SIST-deklarationer respekteras — A2-precedensen
 * från omgång 33). Kärnorden är mekaniskt disjunkta mot samtliga lager
 * före det i kedjan (sond dokumenterad ovan; verifieras levande av
 * modultestets G-fall och kedjetestets struktur- och skuggfall).
 *
 * Matchningen speglar motorns hjälpfunktioner (samma lösning som alla
 * syskinlager: Node type-stripping löser endast `import type`, så de rena
 * funktionerna speglas hit). Semantisk likhet med motorn BEVISAS av
 * testets felstavningsfall (B) och determinismfall (C). Driftvarning:
 * ändras motorns matchning måste denna spegel följa — testfall B vakar.
 *
 * ── JURIDIKGRINDEN (lagen 2007:528) ──────────────────────────────────
 * All text är pedagogisk utbildning om hur ett konjunkturtal BERÄKNAS OCH
 * LÄS, hur en räntenot LÄS och hur en investeringsrad DELAS — inga köp-/
 * säljsignaler, inga placeringstips, inga omdömen om enskilda bolag,
 * länder, räntelägen eller valutor. Exempelvärdena är kursernas egna
 * modelltal (Svealand, Norrverk, Sund Värme och Svanhals är påhittade) —
 * konstruerade för övningens skull.
 *
 * ── DEPENDENCY-INJECTION (samma mönster som hela motorn) ─────────────
 * Registret skickas IN som parameter (endast `import type`) så att
 * verktyg/testa-ai-mentor-nykull.mjs kan köra filen direkt i Node.
 * Källkurserna finns i KURSREGISTER — inga fantomlänkar (testfall D21-
 * klassen vakar).
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

// ── Den 1 frågan: produktionsgapet (ma-09) ──────────────────────────────────

export const NYKULL_MONSTER: FragMonster[] = [
  {
    id: "produktionsgapet",
    karnord: [
      // Sond _s6u3o34 rond 2 (0 kärnordskollisioner mot 82 motorer).
      // GRÄNSER (bärs i TEXT): «naturfrekvens»/NAIRU/arbetslöshetens mått →
      // mk-02 · indikatorpanelen → ma-04 · kostnadsspiran → ma-02 ·
      // instrumenten/mandatet → mk-06 · transmissionen → ma-01 ·
      // cykelformerna → km-057 · marginaltrappan → ln-03 · orderboken →
      // km-069 · naket «tillväxt» → basen.
      "produktionsgap", "produktionsgapet",
      "potentialproduktion", "potentialproduktionen",
      "hastighetstaket",
      "gap-formeln",
      "vakanskvoten",
      "spänningsmåttet",
      "okuns räknelära",
      "phillips-läxan",
      "nollgolvet",
      "gap-läget",
    ],
    starkord: [
      "svealand", "gapet", "potential", "timmar", "produktivitet",
      "övertid", "flaskhalsar", "norrverk", "maskintimmar",
      "taylor", "okun", "phillips", "vakanser", "arbetslösa",
      "konjunktursituation", "referenspunkten",
    ],
    bygga: (reg) => {
      const maAntal = reg.filter((r) => r.kategori === "MAKROEKONOMI & RÄNTA").length;
      const kallor = [
        kursKalla(reg, "ma-09-produktionsgapet", "Läroplanen — hastighetstaket, gapet och räntans fixpunkt: potentialens tre källor, tre sidor, Phillips-läxan, nollgolvet"),
        kursKalla(reg, "mk-02-arbetsloshet", "Läroplanen — arbetslöshetens mått och naturfrekvensen: gapets arbetsmarknadssida"),
        kursKalla(reg, "ma-04-konjunkturindikatorerna", "Läroplanen — indikatorpanelen som läses mot en referenspunkt"),
        kursKalla(reg, "ma-02-lonebildning-och-kostnadsspiralen", "Läroplanen — kostnadsspiran: trycket efter gapet, spiran vid tröskeln"),
        kursKalla(reg, "mk-06-penningpolitik", "Läroplanen — instrumenten och mandatet: policy-svarets verktygslåda"),
      ];
      const k = kallor[0];
      const ma09 = reg.find((r) => r.slug === "ma-09-produktionsgapet");
      return {
        text:
          `Produktionsgapet är det tal hela makrofamiljen cirklar kring utan att äga: avståndet mellan vad ekonomin producerar och vad den KAN producera. Räntan stiger och faller med dess tecken, lönebildningen trycker när det är positivt, indikatorerna läses mot det — och här beräknas det själva talet (allt nedan är utbildning i mekaniken, med kursens egna modelltal i den påhittade exempel-ekonomin Svealand — inga placeringsråd):\n\n1️⃣ HASTIGHETSTAKET — POTENTIALPRODUKTIONENS TRE KÄLLOR. Potentialen kan inte mätas, bara beräknas, och kursen bygger den av tre källor: 5,0 miljoner sysselsatta × 1 600 arbetstimmar per år = 8,0 miljarder timmar, och varje timme bär produktiviteten 575 kronor — potentialproduktionen 8,0 miljarder × 575 = 4 600 miljarder kronor per år. Det är taket: nivån ekonomin kan hålla vid normalt utnyttjande av arbete, kapital och kunnande — inte maximit som kortvarigt pressas ut i övertid, utan nivån utan tryck. När den faktiska produktionen landar på 4 416 miljarder står ekonomin 184 miljarder under sitt tak, och det avståndet är talet alla kanaler svarar på. Insikten som gör talet ödmjukt: potentialen är ett bedömt tal, inte ett observerat — varje debatt om ränteläget är i praktiken en debatt om ett osynligt tals storlek, och därför publicerar centralbanker det med försiktighet och reviderar i efterhand.\n2️⃣ GAP-FORMELN — TECKNET OCH STORLEKEN. Gapet = (faktisk produktion − potentiell produktion) ÷ potentiell produktion. För Svealand: (4 416 − 4 600) ÷ 4 600 = −4,0 procent. Trappan på samma potential: faktiskt 4 508 ger −2,0 procent (92 miljarder outnyttjat), faktiskt 4 600 ger 0,0 (ekonomin på taket), faktiskt 4 784 ger +4,0 (184 miljarder ÖVER taket — övertid och flaskhalsar). Tecknet säger läget — negativt gap är outnyttjad kapacitet, positivt är ekonomin körd över taket och tryck byggs. Storleken säger kraften: ±0,5 procent är brus, ±4 procent är en konjunktursituation. Och gapet kan röra sig av två skäl: om arbetstimrarna faller 1,0 procent medan produktiviteten stiger 0,8 växer potentialen 0,99 × 1,008 = 0,998 — nästa års tak 4 600 × 0,998 ≈ 4 590 miljarder. Ett gap kan alltså ÖKA utan att produktionen rört sig: taket själv sjönk.\n3️⃣ TRE SIDOR AV SAMMA GAP — ATT MÄTA DET OSYNLIGA. Produktionssidan ger trendläsningen: statistikbyråer filtrerar bort cykeln och kallar resten potential — ärlig mot sina antaganden men långsam och reviderad. Arbetsmarknadssidan ger gatunivåns motläsning: 92 000 lediga jobb mot 205 000 arbetslösa ger spänningsmåttet 92 000 ÷ 205 000 = 0,45 — under 0,5 är en normal marknad i vila, över 0,9 betyder att varje ledigt jobb nästan har sin egen arbetslös: spänd marknad, gapet på väg upp. Prissidan läses sist: sjunker inflationen mot noll är gapet sannolikt negativt; stiger den över det väntade är det troligen positivt. Okuns deklarerat grova räknelära knyter ihop sidorna: en tumregel med koefficienten 0,5 ger gap −4,0 procent ≈ 0,5 × 4,0 = 2,0 procentenheter arbetslöshet över naturfrekvensen — med naturfrekvensen 6,5 procent blir den aktuella arbetslösheten cirka 8,5 (naturfrekvensbegreppet och måttens detaljer ägs av arbetslöshetskursen; detta steg äger sammanlänkningen till gapet). När alla tre sidor pekar samma håll är gap-läget trovärdigt; när de tvistar — produktion svag men arbetsmarknad spänd — står ekonomin just där centralbankers beslut är som svårast.\n4️⃣ PHILLIPS-LÄXAN — GAPETS RÖST I PRISERNA. Den enkelheten som kallas Phillips-läxan (deklarerad pedagogisk förenkling): inflation ≈ förväntad inflation + 0,5 × gap. Förväntningarna bär det mesta — med väntade 2,0 procent blir inflationen 2,0 om gapet är noll. Men gapet lägger till och drar ifrån: vid gap −4,0 blir summan 2,0 + 0,5 × (−4,0) = 0,0 procent — inflationen dör ut trots förväntningarna. Vid gap +4,0 blir summan 4,0 procent. Hela skillnaden mellan en inflation som somnar och en som vaknar ligger i gapets tecken; och när trycket blir lönekrav och lönekraven prishöjningar som flyttar förväntningarna tar kostnadsspiran vid — den mekaniken ägs av lönebildningskursen, detta steg bär länken från gap till tryck fram till spiralens tröskel. Läxan för aktieläsaren: ett starkt år kan vara friskt (gap nära noll, inflation lugn) eller överhettat (gap positivt, inflation stigande) — och bolagen prissätter de två åren olika, eftersom det första följs av fortsatt tillväxt och det andra av policy-svar.\n5️⃣ POLICY-SVARET — REGLNS TVÅ HÄNDER OCH NOLLGOLVET. Taylor-regeln, deklarerad som pedagogisk förenkling: styrränta ≈ neutral ränta + inflation + 0,5 × (inflation − mål) + 0,5 × gap. Svealands överhettning: neutral 2,0, inflation 4,0, mål 2,0, gap +1,5 ger 2,0 + 4,0 + 0,5 × 2,0 + 0,5 × 1,5 = 7,75 procent. Notera fördelningen: av de 1,75 procentenheter som ligger över neutral plus inflation kommer 1,0 från inflationshanden och 0,75 från gap-handen — gapet är en av regelns två händer. Det lugna läget (inflation 2,0, gap 0,0) ger 4,0 procent — neutralt. Tidig nedgång (1,0, −2,0) ger 2,0 + 1,0 − 0,5 − 1,0 = 1,5. Och krisen, kursens kron: inflation 0,0, gap −4,0 ger 2,0 + 0,0 − 1,0 − 2,0 = −1,0 procent — regeln begär en negativ styrränta, men instrumentet står vid noll. NOLLGOLVET: när räntans kanal slår i golvet står kreditpremien, valutan och bostadsmekaniken ensamma med bördan — det är mekaniken som förklarar perioder då politiken blev beroende av andra kanaler än räntan. (Instrumenten och mandatet ägs av penningpolitikskursen; transmissionen av transmissionskursen — detta steg äger endast beslutsunderlaget: hur gapet tar plats i reaktionen.)\n6️⃣ AKTIELÄSNINGEN — BOLAGET SOM GAP I MINIATYR. Påhittade Norrverk Verkstäder AB har maskinkapaciteten 10 000 timmar per år och använder 7 800 — kapacitetsutnyttjande 7 800 ÷ 10 000 = 78 procent. De 2 200 outnyttjade timmarna gör att nästa order bär full marginal: de fasta kostnaderna är betalda, timmen finns på lagret. Orderökningen 1 500 timmar landar på 9 300 — 93 procent, fortfarande under taket, och marginalen svarar oproportionerligt mer än omsättningen (marginaltrappans mekanik ägs av sin egen kurs). Men orderökningen 2 500 timmar landar på 10 300 — 300 timmar ÖVER taket — och då har bolaget tre möjliga svar: övertid (dyrare per timme), prishöjning (priset börjar bära bristen) eller investering i ny kapacitet (flerårig återbetalning). Vilket svar som aktiveras avgörs inte av bolaget ensamt utan av gap-läget i ekonomin: ett brett negativt gap ger konkurrenter med lediga timmar att sälja billigt; ett positivt gap får hela branschen att springa mot samma tak samtidigt. Orderbokens siffror kan alltså bara tolkas mot gapet — det är referenspunkten.\n\nI kategorin makroekonomi och ränta finns ${maAntal} kurser — produktionsgapet (${ma09 ? ma09.niva.toLowerCase() + " nivå" : "i registret"}) är familjens nionde steg: åtta kanaler byggde VAD ekonomin svarar med — och det nionde steget vände kameran mot referenspunkten själv: var ligger taket, var står produktionen, vad säger gapets tecken om nästa policy-svar. Som alltid: detta är utbildning i en metod — inga placeringstips.` +
          kallradFler(kallor),
        amne: "produktionsgapet",
        kalla: k,
        kallor,
        handlings: [
          { text: "Kursen: Produktionsgapet", lank: "/kurser/ma-09-produktionsgapet", ikon: "📏", beskrivning: "Hastighetstaket, gapet och räntans fixpunkt" },
          { text: "Kursen: Arbetslöshet", lank: "/kurser/mk-02-arbetsloshet", ikon: "🧑‍🏭", beskrivning: "Naturfrekvensen och måttens detaljer" },
          { text: "Kursen: Konjunkturindikatorerna", lank: "/kurser/ma-04-konjunkturindikatorerna", ikon: "📊", beskrivning: "Panelen som läses mot gapet" },
          { text: "Kursen: Lönebildning och kostnadsspiralen", lank: "/kurser/ma-02-lonebildning-och-kostnadsspiralen", ikon: "⚙️", beskrivning: "Spiran efter trycket" },
          { text: "Kursen: Penningpolitik", lank: "/kurser/mk-06-penningpolitik", ikon: "🏦", beskrivning: "Instrumenten bakom policy-svaret" },
          { text: "Vad är underhållscapex?", lank: "fragor:" + encodeURIComponent("vad är underhållscapex?"), ikon: "🔧", beskrivning: "Bolagets eget tak i miniatyr" },
          { text: "Vad är bindningsrisken?", lank: "fragor:" + encodeURIComponent("vad är bindningsrisken?"), ikon: "🪢", beskrivning: "Priset på räntan i balansräkningen" },
        ],
        motfraga: { text: "Vad är konjunkturindikatorerna?", kategori: "makroekonomi och ränta" },
        fordjupa: { text: k.titel, lank: "/kurser/ma-09-produktionsgapet" },
      };
    },
  },
  {
    id: "bindningsrisken",
    karnord: [
      // GRÄNSER (bärs i TEXT): «ränteswap»-familjen → u1:s ränteswap-motor
      // (od-11 primär, samma fönster — deras maskineri inifrån; här
      // låntagarens stol) · naket «stresstest»/«känslighetsanalys» →
      // stabilitetsdjupet (deras monster) — här ägs det KORRELERADE fallet
      // och känslighetSTALET (kronor per procentenhet) · naket «räntenoten»
      // → banksektorns «räntenätet» (tav-2, prob bevisad) — här bär ordet
      // som starkord i sällskap av ett kärnord · duration på portföljsidan →
      // rk-08 · refinansieringsmuren → st-05 · strukturen/styrningen → ks-03
      // · motpartsrisk → rk-16 (kontrahent-lagret).
      "bindningsrisk", "bindningsrisken",
      "känslighetstalet",
      "bindningstrappan", "förfallotrappan",
      "det korrelerade stresstestet",
      "premien för visshet",
    ],
    starkord: [
      "sund värme", "värmepumpar", "förfallodatum", "visshet",
      "räntenoten", "räntetäckning", "stärräntan", "låntagarens stol",
    ],
    bygga: (reg) => {
      const stAntal = reg.filter((r) => r.kategori === "STABILITET").length;
      const kallor = [
        kursKalla(reg, "st-08-bindningsrisken", "Läroplanen — skuldens andra axel: priset och tiden; fast mot rörlig, känslighetstalet, trappan, swappen utifrån"),
        kursKalla(reg, "st-05-refinansieringsmuren", "Läroplanen — förfallomuren: den andra risken som delar kvoten med bindningen"),
        kursKalla(reg, "ks-03-skuldens-anatomi", "Läroplanen — skuldens anatomi: strukturen och bindningsvalet som styrningsfråga"),
        kursKalla(reg, "rk-08-ranterisk", "Läroplanen — ränteriskens mätning och duration på portföljsidan"),
        kursKalla(reg, "od-11-ranteswapen", "Läroplanen — spegelgrannen: swappen utifrån här, instrumentets maskineri där"),
      ];
      const k = kallor[0];
      const st08 = reg.find((r) => r.slug === "st-08-bindningsrisken");
      return {
        text:
          `Bindningsrisken är skuldens andra axel. Kurserna om stabilitet har läst skulden som en storlek — kvoter, täckningar, murar; detta steg läser priset på skulden: vad räntan heter, hur länge, och vad varje procentenhet kostar i kronor. Två bolag kan vara identiska i varje mått utom räntenoten — och deras motståndskraft är inte identisk i något scenario som rör räntan (allt nedan är utbildning i mekaniken, med kursens egna modelltal och tydligt påhittade bolag — inga placeringsråd):\n\n1️⃣ TVÅ FABRIKER, EN SKILLNAD. Påhittade Sund Värme AB tillverkar värmepumpar med omsättning 900, rörelseresultat 90 och balansomslutning 980 — skuld 600 och eget kapital 380: skuldsättningsgrad 1,58 och soliditet 38,8 procent för BÅDA fabrikerna. Fabrik A har lånat 600 helt rörligt: styrränta 3,80 plus marginal 2,20 = 6,00 procent — räntekostnad 36 per år. Fabrik B har bundit hela skulden fem år till 5,00 procent — kostnad 30. Samma skuld, sex miljoners skillnad i årskostnad, och bakom den ligger hela frågan: är de sex miljonerna slöseri eller försäkring? Räntetäckningen berättar första halvan: A har 90 ÷ 36 = 2,50, B har 90 ÷ 30 = 3,00 — identiska bolag, olika tålighet, och ingen av skillnaderna syns i skuldsättningsgraden. Skuldens totala risk är summan av två: bindningsrisken (kostnaden förändras när räntan gör det) och refinansieringsrisken (lånet kan förnyas inte alls — den muren ägs av sin egen kurs); de två delar på samma kvot, och rörlig ränta ger maximal bindningsrisk men ingen förnyelsediskussion under löptiden, fast ränta det omvända.\n2️⃣ FÖRSÄKRINGENS RÄKNELÄRA — PREMIEN OCH BREAK-EVEN. Att binda är att köpa en försäkring: premien är skillnaden mot rörligt, skyddet är vissheten. B betalar 30 mot A:s 36 — premien för visshet är 6 per år, 30 över fem år. Break-even ligger där den rörliga räntan passerar den fasta: med marginalen 2,20 kostar det rörliga lånet mer än 5,00 procent när styrräntan överstiger 2,80 — varje år med snitt över 2,80 har B vunnit sin insats, varje år under har A. Kursens vändning av intuitionen: den fasta räntan är inte «det försiktiga valet» — den är valet som tar en prisrisk EN gång (vid förnyelsen), medan den rörliga tar den VARJE år. Ingen är gratis; valet är ett försäkringsexempel i ren form med premien känd och skadefallet okänt, och kursen räknar konsekvenserna — den väljer aldrig.\n3️⃣ KÄNSLIGHETSTALET — EN PROCENTENHET I KRONOR. Kursens enklaste verktyg: den rörliga skulden delat med hundra ger kostnadsökningen i miljoner per procentenhet. Fabrik A med 600 rörligt: känslighet 6,0 — varje procentenhet uppåt kostar sex miljoner om året, direkt ur resultatet. Fabrik B: känslighet noll nominellt under bindningstiden. Trappan (200 fast + 400 rörligt): 4,0. Med talet i handen blir stressen konkret, och kursens poäng är det KORRELERADE fallet — ränta och konjunktur vandrar ofta tillsammans: stiger styrräntan 3,0 procentenheter samtidigt som rörelseresultatet faller från 90 till 70 i samma åtstramning. Då: A:s ränta 36 → 54 och täckningen 70 ÷ 54 = 1,30; B står kvar på 30 och täcker 2,33; trappan landar på 46 och 1,52. Tre bolag identiska i går, tre olika berättelser i morgon — allt bestämt i räntenoten, för längesedan. Läxan: stresstesta aldrig en variabel i taget när verkligheten flyttar dem i samma våg (det nakna stresstestet och känslighetsanalysen ägs av stabilitetsdjupets lager — detta steg äger den korrelerade läsningen och kron-talet).\n4️⃣ BINDNINGSTRAPPAN — ATT SPRIDA BÅDA RISKERNA ÖVER TID. Valet är inte antingen-eller: de flesta bolag bygger en trappa. PRISTRAPPAN: 200 bundet fem år till 5,00 procent (10 per år) plus 400 rörligt till 6,00 (24) — totalt 34 i lugnt läge, täckning 90 ÷ 34 = 2,65, och känsligheten fallen från 6,0 till 4,0. FÖRFALLOTRAPPAN: sprids de 600 som 200 med två års löptid, 200 med fem och 200 rörligt förfaller aldrig mer än en tredjedel på samma datum — förnyelsemuren blir ett trappsteg i stället för en klippa. I första trappan är tanken priset, i andra förfallet; verkliga trappor bygger båda. Fördelen med att sprida är valfriheten: när den korta partien förfaller i ett år med hög ränta kan bolaget binda lite och vänta med resten — koncentrerar det allt till ett datum har det inget val alls. Portföljtänkandet flyttat till skuldsidan: som placeraren sprider tillgångar sprider låntagaren förfall — målet detsamma, att aldrig vara beroende av en enda dags villkor. Priset för spridningen: trappan vinner aldrig mot det perfekta valet i efterhand, bara mot det sämsta i förväg.\n5️⃣ SWAPPEN UTIFRÅN — ATT FLYTTA PRISET, ALDRIG KREDITEN. Sund Värme kan ta trappan ett steg längre: 200 av de 400 rörliga byts till fast via ränteswap med banken mot ett påslag om 0,50 procentenheter. Efter swappen: 200 bundna i lånet, 200 bundna via avtal, 200 rörliga — känsligheten fallen från 4,0 till 2,0, och priset är påslaget 200 × 0,50 % = 1 miljon per år. Lugnt läge: 10 (fasta) + 13 (swappade: 6,00 rörlig + 0,50 påslag ≈ fast 6,50) + 12 (rörliga) = 35. I det korrelerade stresstestet (+3,0 procentenheter, resultat 70): de rörliga kostar 18, de fasta och swappade står stilla — totalt 41, täckning 70 ÷ 41 = 1,71 mot trappans 1,52 utan swap. En miljon om året köpte nästan två tiondelar täckning i det onda året — och mer i ett värre. Men instrumentet har sin gräns, och kursen drar den rak: swappen flyttar prisrisken men skapar en motpartsrisk av eget slag (det fältet ägs av motpartsriskkursen), och den lämnar själva lånet där det var — skulden minskas inte, löptiden förlängs inte, kreditrisken tas inte bort. Instrumentets inre maskineri — de två benen, differensen, swapkurvan — ägs av derivatfamiljens egen kurs och dess mentorfråga; här läses swappen utifrån, från låntagarens stol. Principen som gäller all styrning av finansiella risker: varje instrument som flyttar en risk skapar en annan — annars vore det gratis.\n6️⃣ LÄSKONSTEN — RÄNTENOTENS FEM FRÅGOR. (1) Hur stor del av den räntebärande skulden är rörlig i dag — känslighetstalet direkt? (2) Hur ser förfalloprofilen ut — vilka belopp vilka år; en koncentration är förnyelsemuren även när räntan är bunden? (3) Hur mycket är swappat, till vilket pris och vilken löptid — swappad andel är fast i praktiken men kan stå som rörlig om avtalsraden inte läses? (4) Vad blir räntekostnaden om styrräntan stiger två procentenheter — och täckningen om rörelseresultatet samtidigt faller en femtedel: det korrelerade testet på bolagets egna tal? (5) Vad var årets genomsnittsränta mot förra årets — och förklarar förändringen volym, pris eller bindningsläge? Fem frågor, tio minuter med noten — och skuldens andra axel är läst. Så länge noter om bindning läses av få är informationen inte dold, bara försummad; kursens bidrag är att den inte längre är försummad av dig.\n\nI kategorin stabilitet finns ${stAntal} kurser — bindningsrisken (${st08 ? st08.niva.toLowerCase() + " nivå" : "i registret"}) är familjens åttonde steg: kvoterna och murarna kartlades först — och här den andra axeln, priset och tiden, som ingen kvot ser. Som alltid: detta är utbildning i en metod — inga placeringstips.` +
          kallradFler(kallor),
        amne: "bindningsrisken",
        kalla: k,
        kallor,
        handlings: [
          { text: "Kursen: Bindningsrisken", lank: "/kurser/st-08-bindningsrisken", ikon: "🪢", beskrivning: "Skuldens andra axel — pris och tid" },
          { text: "Kursen: Refinansieringsmuren", lank: "/kurser/st-05-refinansieringsmuren", ikon: "🧱", beskrivning: "Den risken som delar kvoten" },
          { text: "Kursen: Skuldens anatomi", lank: "/kurser/ks-03-skuldens-anatomi", ikon: "📜", beskrivning: "Strukturen och bindningsvalet" },
          { text: "Kursen: Ränterisk", lank: "/kurser/rk-08-ranterisk", ikon: "📐", beskrivning: "Mätning och duration" },
          { text: "Kursen: Ränteswapen", lank: "/kurser/od-11-ranteswapen", ikon: "🔄", beskrivning: "Instrumentet inifrån — spegelgrannen" },
          { text: "Vad är en ränteswap?", lank: "fragor:" + encodeURIComponent("vad är en ränteswap?"), ikon: "🔄", beskrivning: "Instrumentets maskineri" },
          { text: "Vad är underhållscapex?", lank: "fragor:" + encodeURIComponent("vad är underhållscapex?"), ikon: "🔧", beskrivning: "Syskonfrågan — investeringens två ansikten" },
        ],
        motfraga: { text: "Vad är en ränteswap?", kategori: "stabilitet" },
        fordjupa: { text: k.titel, lank: "/kurser/st-08-bindningsrisken" },
      };
    },
  },
  {
    id: "underhallscapexet",
    karnord: [
      // GRÄNSER (bärs i TEXT): naket «tillväxt» → basens tillväxt-monster
      // (tav-1 — därför bärs «kassaörat före tillväxt» som KÄRNORDSFRAS)
      // · «fas1/2/3» → basens fasmonster: här sammanskrivna «faskvoten»
      // (prorata-precedensen) · kassaflödesanalysens struktur → km-003 ·
      // avskrivningsvalen → bk-05 · accruals → ln-02 · EBITDA-multipeln →
      // v08 · kapitalförbränningen → v19 · allokeringsbeslutet → ks-02 ·
      // modellrisken → rs-08 · tillväxtens värde → tx-03 · skuggförbindel-
      // serna → st-07 · sektorns underhållscyklar → se-20/se-18.
      "underhållscapex", "underhållscapexet",
      "tillväxtcapex", "tillväxtcapexet",
      "kassaörat", "kassaöret",
      "kassaöre-marginalen",
      "kassaörat före tillväxt",
      "underinvesteringsfällan",
      "faskvoten",
      "ersättningsinvesteringarna",
      "tre skattningsvägar",
    ],
    starkord: [
      "svanhals", "monteringshallen", "hallen", "maskinparken",
      "avskrivningarna", "capex", "nolltillväxt", "substanset",
      "nettotappet", "arbetsnumret", "ersättningsinvestering",
    ],
    bygga: (reg) => {
      const lnAntal = reg.filter((r) => r.kategori === "LÖNSAMHET").length;
      const kallor = [
        kursKalla(reg, "ln-06-underhallscapex", "Läroplanen — investeringens två ansikten: underhållet mot hallen, tre skattningsvägar, kassaörat, faskvoten, underinvesteringsfällan"),
        kursKalla(reg, "km-003-kassaflodesanalysen", "Läroplanen — rapportens struktur: raden där båda ansiktena bor"),
        kursKalla(reg, "ln-02-resultatkvalitet-och-accruals", "Läroplanen — accruals: underinvesteringsfällans kusin i kundfordringarna"),
        kursKalla(reg, "v08-ebitda-marginal", "Läroplanen — marginalmåttet som här rättas: mellanstationen, inte svaret"),
        kursKalla(reg, "ks-02-kapitalallokering", "Läroplanen — beslutet att bygga hallen: tillväxtens pris som investering"),
      ];
      const k = kallor[0];
      const ln06 = reg.find((r) => r.slug === "ln-06-underhallscapex");
      return {
        text:
          `Underhållscapexet är kassaflödets mest feltolkade rad och den fråga som skiljer analytikern från läsaren: hur mycket av investeringarna måste återinvesteras bara för att hålla verksamheten vid liv? Alla investeringar står på samma rad i kassaflödesanalysen, men de gör två helt olika saker — den ena typen skapar något som inte fanns, den andra förhindrar att något som finns slutar fungera (allt nedan är utbildning i mekaniken, med kursens egna modelltal och tydligt påhittat bolag — inga placeringsråd):\n\n1️⃣ DE TVÅ ANSIKTENA — BESTÅ ELLER VÄXA. Kursens exempel: påhittade Svanhals Verkstäder, omsättning 1 200 miljoner kronor, EBITDA 204 (marginal 17,0 procent) och årets investeringar 132 miljoner. Den naiva läsningen som många rapportläsare stannar vid: fritt kassaflöde = EBITDA − investeringar = 204 − 132 = 72 miljoner. Räkningen är aritmetiskt korrekt och ändå vilseledande, för investeringarna är inte av ett slag. I årets 132 ingår den nya monteringshallen — 60 miljoner för en produktionslinje som inte fanns, byggd för en ny kundfamilj. Resterande 72 miljoner är underhållet: slitna bearbetningsmaskiner som bytts ut, tak och ventilation som renoverats, fordon som ersatts. Skillnaden är begreppslig och bokföringsmässig på en gång: hallen är en tillgång som byggs (den avskrivs och ska förhoppningsvis tjäna i tjugo år), underhållet är kostnaden för att bestå (de nya maskinerna ersätter gamla som gjort tjänst). Kassaflödesanalysen — rapportens struktur ägs av sin egen kurs — redovisar båda under samma post «investeringar i anläggningstillgångar»: det är läsarens uppgift att dela dem, och gränsen dem emellan är en bedömning, inte en bokförd siffra. Därför är uppdelningen ett hantverk.\n2️⃣ TRE VÄGAR ATT SKATTA UNDERHÅLLET. Underhållsdelen bokförs aldrig för sig — den måste skattas, och kursen kräver att tre oberoende vägar pekar mot varandra innan någon siffra får bära en slutsats. Väg ett — AVSKRIVNINGARNA: Svanhals maskiner är bokförda till 720 miljoner med tolv års linjär avskrivning = 60 per år; byggnaderna 480 miljoner på fyrtio år = 12; summa 72 — bokföringens egen uppskattning av hur snabbt kapitalstocken förbrukas. Väg två — HISTORIKEN: femårsraden för investeringar 74/77/78/81/132 har medianen 78; i fyra av fem år byggde Svanhals ingen hall, och åren innan hallen är den renaste bilden av underhållsnivån. Väg tre — NYCKELTALET: verkstadsbranschens erfarenhetstal omkring 6,0 procent av omsättningen = 0,060 × 1 200 = 72. Tre vägar, tre svar: 72, 78, 72 — konvergensen ger kursens arbetsnummer 75. Sprider sig vägarna mer (säg 60 mot 95) är underhållsbegreppet oläsligt just där, och den försiktiga läsaren väljer det högsta beloppet eftersom felet slår mot varje värdering som bygger på nämnaren. Notera vad vägarna INTE är: avskrivningarna är en bokföringsregel (valen bakom dem — restvärden, livslängder — ägs av redovisningskursen), inte ett fysiskt mått; historiken kan innehålla outsedda expansionsår; nyckeltalet är branschens, inte bolagets. Därför tre vägar — inte en.\n3️⃣ KASSAÖRAT FÖRE TILLVÄXT — EBITDA-RÄTTNINGEN. Med underhållet skattat faller EBITDA-marginalens roll i rang: den är en mellanstation, inte ett svar. Den genomarbetade versionen: EBITDA 204 − underhåll 75 (arbetsnumret) = kassaöre 129 miljoner — mot naivräkningens 72, nästan dubbla på identiska siffror. Skillnaden är hallen: tillväxtens pris är 132 − 75 = 57 miljoner, en investering i balansräkningen som ska bedömas som en investering (med avkastningskrav och osäkerhet — allokeringskursens domän), inte dras av årets lönsamhet. Marginaltrappan: EBITDA-marginal 204/1 200 = 17,0 procent; kassaöre-marginal 129/1 200 = 10,8 procent (med den exakta skattningen 72: kassaöre 132 och marginal 11,0 — kursen redovisar båda, skillnaden 3 miljoner är mindre än skattningsosäkerheten). Jämförelsen som ger begreppet tyngd: två verkstadsbolag med IDENTISK EBITDA-marginal 17,0 procent — det ena lägger 6,0 procent av omsättningen på underhåll (kassaöre-marginal 11,0), det andra 2,0 (15,0): rubriksiffran är densamma, verksamheterna är det inte. Sex procentenheter av omsättningen slukas av maskinparkens egen åtgång — EBITDA svarar på vad verksamheten tjänar innan maskinparken får sin andel; kassaörat svarar på vad som blir kvar när den fått den. Den första siffran imponerar, den andra betalar.\n4️⃣ FASKVOTEN — INVESTERINGAR ÷ AVSKRIVNINGAR. En enda division sammanfattar bolagets investeringsläge: årets investeringar dividerat med årets avskrivningar. Svanhals hallår: 132/72 = 1,83 — klart över ett: tillväxtfas (eller överinvestering; kvoten skiljer dem inte åt, det gör strategin och avkastningen). Femårsmedianen: 78/72 = 1,08 — i princip jämvikt, maskinparken förnyas i takt med att den slits. Läsområdena: kvot kring 1,0 år efter år = ett bolag som består; stabil över 1,2 MED växande intäkter = kapacitetsbygge; stabil över 1,2 UTAN växande intäkter = varningssignalen överinvestering (pengarna bygger, resultatet svarar inte); under 1,0 år efter år = underinvesteringsmönstret — nästa steg. Tidsserien är kvotens styrka: ett enda års-kvot är brus (ett tungt ersättningsår kan ge 1,4 utan tillväxt), men femårsbandet avslöjar fasen. I exemplet läses fyra år kring 1,0 följt av 1,83 som «jämviktsbolag som bygger en expansion» — en läsning hallens affärsfall sedan ska bära eller vederlägga. (I sektorer med rytmiska underhållscyklar — gruvornas fyraåriga renoveringar, rederiernas femårsinspektioner — slår kvoten i takt med schemat; det ägs av sektorkurserna.)\n5️⃣ UNDERINVESTERINGSFÄLLAN — VINSTEN SOM LÅNAT AV MASKINPARKEN. Den farligaste varianten av felräkningen är den omvända: konstruera fallet — Svanhals lägger i fem år 40 miljoner per år på investeringar medan avskrivningarna löper 72. Maskin- och byggnadsstocken, bokförd 1 200 (maskiner 720 + byggnader 480), förbrukas 72 per år och förnyas 40: nettotappet 32 per år, på fem år 160 — substanset har smalnat från 1 200 till 1 040 medan resultaträkningen hela tiden visat oförändrad vinst. Det är resultatkvalitetsproblemets fysiska skepnad: accruals i maskinparken i stället för i kundfordringar. Kassorna ser också bra ut — fritt kassaflöde «förbättras» med 32 per år jämfört med fullt underhåll — men förbättringen är ett lån ur balansräkningen som en dag förfaller, och förfallodagen är större än de årliga besparingarna: fem års underinvestering på 32 blir ett framtida år med extrainvesteringar på 160 plus produktionsbortfall medan linorna står still. Det är skuggskuldernas fysiska kusin: en förpliktelse som varken står bland skulder eller förbindelser, utan i en maskinpark som åldras. Praktiska spår i rapporten: investeringar under avskrivningar fem år i rad, nöjehetstillgångar som växer, underhållskostnadsposten som sjunker som andel av omsättningen. Vänd på det och fällan blir ett analysverktyg: bolag vars historik visar kvot under 1,0 ska inte läsas på sina rapporterade vinster utan på de vinster som återstår när maskinparken återförs i skick — bolaget säljer sin maskinpark i slow motion och kallar det marginalförbättring.\n6️⃣ PROTKOLLET — FEM FRÅGOR TILL INVESTERINGSRADEN. (1) ANDELEN — hur stor del av årets investeringar är underhåll (Svanhals: 72 av 132 = 54,5 procent), och vad säger andelen om verksamhetens karaktär? (2) VÄGEN — hur skattades underhållet, och konvergerar de tre vägarna (72/78/72) eller spretar de? (3) FASEN — var ligger faskvoten (1,83 i hallåret, 1,08 på medianen), och är fasen i linje med strategin och dess värde? (4) UTHÅLLIGHETEN — vad blir kassaörat i ett nolltillväxtscenario där hela investeringsraden är underhåll (204 − 72 = 132, marginal 11,0 procent): den enda lönsamhetssiffra som inte kan sminkas av ett enda gott expansionsår — den visar verksamheten som den är, när inget byggs och inget firas. (5) REDOVISNINGEN — kostnadsförs eller aktiveras underhållet, och är avskrivningsantagandena rimliga mot verksamhetens fysik? Fem svar — och investeringsraden är först då läst.\n\nI kategorin lönsamhet finns ${lnAntal} kurser — underhållscapexet (${ln06 ? ln06.niva.toLowerCase() + " nivå" : "i registret"}) är familjens sjätte steg: Dupont-trädet, resultatets kvalitet, marginaltrappan, kapitalbindningen och själva frågan vad lönsamhet är byggde maskineriet — och här avslutas vägen från intäkt till uttagsbar kassa: marginalen minus bindningen minus underhållet, först då vet läsaren vad lönsamheten är värd i kronor. Som alltid: detta är utbildning i en metod — inga placeringstips.` +
          kallradFler(kallor),
        amne: "underhållscapexet",
        kalla: k,
        kallor,
        handlings: [
          { text: "Kursen: Underhållscapex", lank: "/kurser/ln-06-underhallscapex", ikon: "🔧", beskrivning: "Investeringens två ansikten" },
          { text: "Kursen: Kassaflödesanalysen", lank: "/kurser/km-003-kassaflodesanalysen", ikon: "💧", beskrivning: "Raden där båda ansiktena bor" },
          { text: "Kursen: Resultatets kvalitet", lank: "/kurser/ln-02-resultatkvalitet-och-accruals", ikon: "🔬", beskrivning: "Accruals — fällans kusin" },
          { text: "Kursen: EBITDA", lank: "/kurser/v08-ebitda-marginal", ikon: "📊", beskrivning: "Mellanstationen som rättas" },
          { text: "Kursen: Kapitalallokering", lank: "/kurser/ks-02-kapitalallokering", ikon: "🎯", beskrivning: "Beslutet att bygga hallen" },
          { text: "Vad är produktionsgapet?", lank: "fragor:" + encodeURIComponent("vad är produktionsgapet?"), ikon: "📏", beskrivning: "Ekonomins tak — bolagets tak" },
          { text: "Vad är bindningsrisken?", lank: "fragor:" + encodeURIComponent("vad är bindningsrisken?"), ikon: "🪢", beskrivning: "Syskonfrågan — skuldens andra axel" },
        ],
        motfraga: { text: "Vad är resultatets kvalitet?", kategori: "lönsamhet" },
        fordjupa: { text: k.titel, lank: "/kurser/ln-06-underhallscapex" },
      };
    },
  },
];

// ── Huvudingången ──────────────────────────────────────────────────────────

/**
 * Svara lokalt med nykull-mönstren — eller null (då har hela kedjan före
 * redan lämnat null och API-flödet tar över som förr). Ligger efter
 * notläsning och FÖRE nyfodda + ränteswap + skuldordning + marknadsrytm i
 * widgetens kedja och kan därför aldrig stjäla en fråga från ett tidigare
 * lager; det fångar bara frågor som alla lager före det lämnar null på.
 * Samma matchningssemantik som basmotorn: minst ett kärnord krävs, poäng
 * = kärnord × 3 + stärkord, oavgjort → först deklarerade mönstret vinner
 * (strikt >, deterministiskt). Samma fråga ⇒ bitidentiskt svar.
 */
export function svaraLokaltNykull(fraga: string, register: RegisterRad[]): LokaltSvar | null {
  const fragaStr = diafri(fraga);
  if (!fragaStr) return null;
  const fragaOrd = fragaStr.split(" ");
  let bast: { svar: LokaltSvar; poang: number } | null = null;
  for (const m of NYKULL_MONSTER) {
    const karnTraff = m.karnord.filter((nk) => traff(fragaOrd, fragaStr, nk));
    if (karnTraff.length === 0) continue; // krav: minst ett kärnord
    const starkTraff = m.starkord?.filter((nk) => traff(fragaOrd, fragaStr, nk)) ?? [];
    const poang = karnTraff.length * 3 + starkTraff.length;
    if (!bast || poang > bast.poang) bast = { svar: m.bygga(register), poang };
  }
  return bast ? bast.svar : null;
}
