/**
 * AI-MENTORN 2.0 — TVÅNGSMEKANIK-FÖRHANDSFRÅGOR (s6-u2, fönstret efter
 * omgång 27 — manifest auto-s6-1789912510460 är klart och kvitterat; detta
 * är spårets nästa par ur de dokumenterat öppna fälten).
 *
 * TVÅ källmärkta monsters om tvångets mekanik — kontraktet som säljer åt
 * dig och kalendern som flyttar kursen:
 *   · MARGINALHANDELN ("vad är marginalhandeln?" — belåningskontot,
 *     marginalkravet och kaskaden)
 *     am-09 MARGINALHANDELN primär (kursen född 2026-09-20 av spår 5 u1 —
 *     commit f212ccae, mentorväglös sedan födelsen, rs-09-precedensen;
 *     aktiveringen stänger KATEGORIN AKTIEMARKNADEN I PRAKTIKEN fullt
 *     länkad — am-09 var kategorins sista lösa kurs) + källor km-030 MARGIN
 *     OF SAFETY (kapitel 1: «km-030 äger värderingsmarginalen» — ordets
 *     andra hem) · mk-04 STATSOBLIGATIONER (kapitel 4: räntan följer
 *     penningpolitiken — KÄLLAKTIVERING: mk-04 var MAKROEKONOMI:s enda
 *     lösa kurs ⇒ kategorin stängs) · bf-15 BUBBLANS ANATOMI (kaskadens
 *     systemvy) · am-01 LIKVIDITET OCH SPREAD (spreaden i kravdagen).
 *   · OPTIONSFÖRFALLETS DAG ("vad är optionsförfallet?" — kalenderns
 *     inbyggda katalysator)
 *     kt-08 OPTIONSFÖRFALLETS DAG primär (född 2026-09-20 av spår 5 u3 —
 *     commit 62901006, mentorväglös sedan födelsen) + källor km-059
 *     OPTIONS-GRUNDER (open interest-begreppet «ägs av grundkursen» —
 *     kursens egen text) · am-05 HANDELSDAGENS AUKTIONER (stängnings-
 *     auktionens mekanik — kursens egen gränsdragning) · kt-03 KATALYSATOR-
 *     KEDJOR (KÄLLAKTIVERING: mentorväglös) · od-01 OPTIONENS GREKER
 *     (gamman som begrepp — kursens egen gräns).
 *
 * ÄMNESVAL EFTER SOND (verktyg/_s6u2o28-sond.mjs mot kedjans LIVE-läge 69
 * motorer / 187 monsters; anspråk data/vakten/s6-u2-fonster28-ansprak.md
 * FÖRE byggstart — disk-först-konventionen):
 *   • Rond 1: 32 kandidatfrågor — 28 NULL genom hela kedjan; 4 fångade
 *     = dokumenterade gränser (nedan).
 *   • Rond 2: 14 kontroller — alla hos rätt ägare: basen (hävstång · margin
 *     call · margin of safety · marginalen) · sektorn (utlåningsgrad +
 *     belåningsgrad tav 2) · handelsdagen (utlåningsräntan + belåningsräntan
 *     tav 2 + auktionen) · optionshantverket (förfallodagen + delta) ·
 *     optionsdjupet (köpoptionen).
 *   • Rond 3 grannkontroll: 32 planerade kärnord mot SAMTLIGA lagers
 *     kärnord — 0 riskgrannar, 0 dubbletter.
 *
 * DOKUMENTERADE GRÄNSER (sondens fynd — bärs i TEXT, aldrig kärnord):
 *   • «open interest» → realekonomins (rond 1-fångst) — bärs som
 *     «utestående kontrakt (open interest, km-059:s begrepp)».
 *   • «pin-risken» → basen (rond 1-fångst) — pin-läget i TEXT.
 *   • «gamma-hedgning» → valutamekanikens hedging-familj — hedgen i TEXT;
 *     «gamman» är NULL men lämnas åt od-familjen (begreppets ägare —
 *     vr-09-läxan: mentorväglös ≠ fritt territorium).
 *   • «stängningsauktionen» → handelsdagen (am-05).
 *   • «förfallodagen» → optionshantverket (d0) — benämns endast i
 *     källrader/knappar; «delta» deras kanoniska — talen i TEXT.
 *   • naket «hävstång»/«margin call»/«margin of safety»/«marginalen» →
 *     basen; «belåningsgrad» → sektorn (tav 2); «belåningsräntan» →
 *     handelsdagen (tav 2) — u1:s omgång-27-striks, verifierade.
 *   • «värderingsmarginalen» → NULL men km-030:s framtida territorium —
 *     bärs som KÄLLA med ordet i TEXT.
 *
 * Aritmetiken i svaren (kursernas EGNA modelltal med tydligt påhittade
 * värden — maskinellt omräknade i regressionstestets D-fall):
 *   · Belåningsvärdet: 150 000 × 0,70 + 100 000 × 0,50 + 50 000 × 0,25 =
 *     105 000 + 50 000 + 12 500 = 167 500 av marknadsvärdet 300 000 = 55,8 %.
 *   · Grundtalen: exponering 300 000 (eget 200 000 + belåning 100 000) ·
 *     belåningsgrad 100/300 = 33,3 % · värdeandel 200/300 = 66,7 %.
 *   · Kaskaden: −20 % → 140 000/240 000 = 58,3 % · −40 % → 80 000/180 000 =
 *     44,4 % · −50 % → 50 000/150 000 = 33,3 % · −55 % → 35 000/135 000 =
 *     25,9 % < kravet 30 % ⇒ marginalkrav; åtgärden S ≥ 135 000 −
 *     35 000/0,30 = 135 000 − 116 700 = 18 300.
 *   · Hävstången 300/200 = 1,5: eget kapital −82,5 % vid börsens −55, mot
 *     −55 oblånat — priset 27,5 procentenheter.
 *   · Räntan 5,95 % × 100 000 = 5 950/år ≈ 496/mån; netto = 1,5a − 0,5r:
 *     +8 % → 9,0 % mot 8,0 oblånat (+1,0) · −8 % → −15,0 mot −8,0 (−7,0) ·
 *     brytpunkten a = r.
 *   · Magnetkartan: 95 → 3 000 kontrakt = 300 000 aktier · 100 → 12 000 =
 *     1 200 000 = 15 % av dagomsättningen 8 000 000 · 105 → 5 000 =
 *     500 000; tyngdpunkten ett steg från kursen 101.
 *   · Hedgen: 1 000 kontrakt × 100 = 100 000 aktier vid delta 0,50, korta
 *     50 000; 101 → delta 0,62 ⇒ köper 12 000 · 99 → 0,38 ⇒ köper tillbaka
 *     12 000 — köp åt båda håll, dragning mot tyngdpunkten; grundplanen
 *     σ 1,5 % ⇒ 49,5 % inom en krona från 100.
 *   · Tron-komprimeringen: 1 200 000 mot 5 000 000 omsättning = 24 % —
 *     magneten växer när handeln tunnar (15 % → 24 %).
 *
 * KEDJEPLACERING: 70:e motorn (av 70), efter co-invest, FÖRE marknadsrytm
 * (deras SIST-deklaration + deras testfall L01 respekteras — multipl-
 * precedensen). Kärnorden är mekaniskt disjunkta mot samtliga lager;
 * verifieras av kedjetestets fall G + detta lagers test (kärnorden läses
 * LIVE ur samtliga src/lib/ai-mentor-*-fragor.ts vid varje körning).
 *
 * Matchningen speglar motorns hjälpfunktioner (samma lösning som alla
 * syskinlager: Node type-stripping löser endast `import type`, så de rena
 * funktionerna speglas hit). Semantisk likhet med motorn BEVISAS av
 * testets felstavningsfall (B) och determinismfall (C). Driftvarning:
 * ändras motorns matchning måste denna spegel följa — testfall B vakar.
 *
 * ── JURIDIKGRINDEN (lagen 2007:528) ──────────────────────────────────
 * All text är pedagogisk utbildning om hur kontraktet och kalendern LÄSES,
 * MÄTS och BEDÖMS — inga köp-/säljsignaler, inga placeringstips, inga
 * omdömen om enskilda bolag. Exempelvärdena är kursernas egna modelltal
 * (Emilias belåningskonto; magnetkartans kontrakt) med tydligt påhittade
 * värden — konstruerade för övningens skull. Belåningsgraden är alltid
 * läsarens eget beslut.
 *
 * ── DEPENDENCY-INJECTION (samma mönster som hela motorn) ─────────────
 * Registret skickas IN som parameter (endast `import type`) så att
 * verktyg/testa-ai-mentor-tvangsmekanik.mjs kan köra filen direkt i Node.
 * Källkurserna (am-09-marginalhandeln, km-030-margin-of-safety,
 * mk-04-statsobligationer, bf-15-bubblans-anatomi, am-01-likviditet-och-
 * spread, kt-08-optionsforfallets-dag, km-059-optionsgrunder,
 * am-05-handelsdagens-auktioner, kt-03-katalysatorkedjor,
 * od-01-optionens-greker) finns i KURSREGISTER — inga fantomlänkar
 * (testfall D20 vakar).
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

// ── Den 1 frågan: marginalhandeln (am-09) ───────────────────────────────────

export const TVANGSMEKANIK_MONSTER: FragMonster[] = [
  {
    id: "marginalhandeln",
    karnord: [
      // u1:s omgång-27-sond (rond 3-listan, oförändrad) + min rond 1 —
      // 0 grannar mot hela kedjan. GRÄNSER (sondens strik): naket
      // «hävstång»/«margin call»/«marginalen» → basen; «belåningsgrad» →
      // sektorn (tav 2 mot «utlåningsgrad»); «belåningsräntan» →
      // handelsdagen (tav 2 mot «utlåningsräntan») — alla i TEXT.
      "marginalhandel", "marginalhandeln",
      "belåningskonto", "belåningskontot",
      "belåningsvärde", "belåningsvärdet",
      "det belåningsbara värdet",
      "marginalkrav", "marginalkravet", "marginkrav",
      "värdeandel", "värdeandelen",
      "kaskadpunkt", "kaskadpunkten", "kaskaden",
      "tvångsförsäljning", "tvångsförsäljningen",
      "kravdag", "kravdagen",
      "underhållskrav", "underhållskravet",
      "belåningsfaktor", "belåningsfaktorerna",
      "marginalens två betydelser",
    ],
    // NOTERA gränserna (sondrond 2): basen äger naket «marginalen» och
    // «hävstång» (deras frågor bärs som fragor:-knappar, aldrig kärnord),
    // km-030:s «värderingsmarginalen» bärs i TEXT — ordets andra hem är
    // källans territorium, inte mitt.
    starkord: [
      "kontot", "kredit", "krediten", "pant", "panten", "exponering",
      "exponeringen", "banken", "bankens", "kontraktet", "amortera",
      "amortering", "Emilia", "portfölj", "portföljen", "börsfall",
      "fall", "säkerhet", "säkerhetsvärdet", "deposition", "utlåning",
      "innehaven", "poster", "gränsen", "kravet", "sälja", "försäljningen",
      "tvingande", "tvingad", "procent", "räntekostnaden", "kvarter",
    ],
    bygga: (reg) => {
      const amAntal = reg.filter((r) => r.kategori === "AKTIEMARKNADEN I PRAKTIKEN").length;
      const kallor = [
        kursKalla(reg, "am-09-marginalhandeln", "Läroplanen — kontots marginal: belåningsvärdet, kaskaden och kravdagen"),
        kursKalla(reg, "km-030-margin-of-safety", "Läroplanen — ordets andra hem: värderingsmarginalen (analysens skydd, km-030:s territorium)"),
        kursKalla(reg, "mk-04-statsobligationer", "Läroplanen — räntans källa: belåningsräntan följer penningpolitiken (två kostnader, en källa)"),
        kursKalla(reg, "bf-15-bubblans-anatomi", "Läroplanen — kaskadens systemvy: varje tvångsförsäljning pressar nästa konto"),
        kursKalla(reg, "am-01-likviditet-och-spread", "Läroplanen — kravdagenens marknad: spreaden vidgar sig när likviditeten sinar"),
      ];
      const k = kallor[0];
      const am09 = reg.find((r) => r.slug === "am-09-marginalhandeln");
      return {
        text:
          `Marginalhandeln är mekaniken i att belåna aktieportföljen: att låna pengar med innehaven som pant, och att leva med det kontrakt som då skrivs. Först ordet — det har två hem, och förväxlingen kostar förmögenheter. Värderingsmarginalen är analysens skydd: avståndet mellan priset och det beräknade värdet, valt fritt, kan aldrig utlösa något. Kontots marginal är bankens säkerhet för återbetalning: stående i ett kontrakt, övervakad i realtid, kan utlösa en försäljning utan att du blir tillfrågad. Marginalhandeln är läran om det andra slaget (allt nedan är utbildning i hur kontraktet räknas, med kursens egna modelltal och tydligt påhittade värden — inga placeringstips, och belåningsgraden är alltid läsarens eget beslut):\n\n1️⃣ MÄTNINGEN — DET BELÅNINGSBARA VÄRDET. Ett kontos köpkraft är inte dess marknadsvärde utan ett lägre tal. Genomgångsexemplet Emilias konto bär tre poster: ett storbolag värt 150 000, ett medelstort 100 000, ett småbolag 50 000 — marknadsvärde 300 000. Banken räknar per post med en belåningsfaktor som speglar hur lätt posten säljs i ett stressigt läge: 70, 50 och 25 procent. Multiplicera och summera: 150 000 × 0,70 = 105 000; 100 000 × 0,50 = 50 000; 50 000 × 0,25 = 12 500 — det belåningsbara värdet är 167 500 kronor, 55,8 procent av marknadsvärdet, inte en krona mer. Skillnaden är bankens marginal, inte din. Kontots tre grundtal: exponering 300 000 (eget kapital 200 000 + belåning 100 000) · belåningsgraden 100 000/300 000 = 33,3 procent · värdeandelen 200 000/300 000 = 66,7 procent — samma tallinje sedd från två håll. Bankens underhållskrav i exemplet: värdeandel minst 30 procent.\n2️⃣ KASKADEN — NÄR KONTRAKTET SLÅR TILL. Följ ett börsfall genom kontot. Minus 20 procent: exponeringen 240 000, eget 140 000, värdeandel 58,3 — kravet vilar. Minus 40: 180 000, 80 000, 44,4 — vila. Minus 50: 150 000, 50 000, 33,3 — grannen till gränsen. Minus 55: 135 000, 35 000, andel 25,9 procent — UNDER kravet 30. Nu inträffar marginalkravet: banken kräver värdeandelen återställd, och det finns två vägar — stoppa in nya pengar, eller sälja poster och amortera. Räkna det senare: sälj för S, exponeringen blir 135 000 − S och kravet är 35 000/(135 000 − S) minst 0,30, alltså S minst 135 000 − 35 000/0,30 = 135 000 − 116 700 = 18 300 kronor. Efter försäljningen står kontot på 30,0 procent — och det som såldes är sålt. Notera: 18 300 är inget analytiskt val — kontraktets matematik valde vilka poster som lämnar kontot, inte analysen; försäljningen verkställs i ett läge där marknaden fallit 55 procent, och just därför trycker varje tvångsförsäljning priserna en aning längre ner, för nästa belåningskonto vars krav då närmar sig — det är kaskaden, och den enskilda länken ser alltid oskyldig ut. Bakom ligger hävstången: exponering dividerat med eget kapital = 300 000/200 000 = 1,5, så det egna kapitalet faller 1,5 × marknadens fall — vid minus 55 har Emilias eget kapital fallit 82,5 procent (200 000 → 35 000), mot exakt 55 oblånat. Skillnaden, 27,5 procentenheter, är hävstångens pris i det dåliga scenariot — det står inte i någon prospekttext utan i bråket 300/200.\n3️⃣ RÄNTAN — DEN SÄKRA KOSTNADEN. Alla intäkter i en aktieportfölj är osäkra utom en utgift: belåningsräntan. I exemplet 5,95 procent på 100 000 = 5 950 kronor per år, ungefär 496 i månaden — debiterad i varje scenario, oavsett om portföljen stiger eller sjunker. Räkna spegeln med formeln netto = 1,5a − 0,5r (a = portföljavkastningen, r = belåningsräntan; koefficienterna från hävstången 1,5 och låneandelen 0,5). Ett bra år, a = +8: 1,5 × 8 − 0,5 × 5,95 = 9,0 procent mot 8,0 oblånat — hävstångsvinsten 1,0 procentenhet. Ett dåligt år, a = −8: −12 − 2,975 = minus 15,0 procent mot minus 8,0 oblånat — hävstångsförlusten 7,0 procentenheter. Asymmetrin är strukturell: räntan dras i båda världar (+1,0 mot −7,0). Formeln ger också brytpunkten: sätt netto = a och ekvationen 1,5a − 0,5r = a ger a = r — hävstången förbättrar utfallet ENDAST när portföljen avkastar mer än belåningsräntan. Och räntan är rörlig: den följer penningpolitiken, så scenariot som pressar portföljer är ofta samma scenario som höjer räntekostnaden — två kostnader, en källa.\n4️⃣ SEX FÄLLOR, PROTOKOLLETS FEM FRÅGOR. Fällorna är sex vanliga tankefel: TAKFÄLLAN (att belåna ända till 167 500 och kalla marginalen noll — med belåning 167 500 på exponering 367 500 lämnar ett ordinärt fall på 40 procent kontot på 24,0 procent, under kravet: kravdag) · RÄNTEFÄLLAN (månadsbelastningen 496 är både evig och rörlig; brytpunkten a = r är ingen åsikt) · KORRELATIONSFÄLLAN (kontraktet räknar summan, inte posterna — nio sektorer faller som ett konto; diversifiering är klok mot bolagsrisk men verkningslös mot kontraktsmekanik) · LIKVIDITETSFÄLLAN (kravdagen kommer när köpsidan är tunnast, och tvångsförsäljningen väljer ofta portföljens mest omsatta kärnor — spridens mekanik) · UTDELNINGSFÄLLAN (en portfölj vars utdelning precis täcker 5 950 står still — och utdelningskapningar träffar både intäkten och, via kursfallet, värdeandelen) · SKATTEFÄLLAN (en tvångsförsäljning är en avyttring också i skattehänseende — latent vinst kan realiseras just det år kontot förlorar mest). Protokollets fem frågor förvandlar kravdagen från överraskning till uträkning: Vad är kaskadpunkten — vid vilket börsfall bryter kontraktet, och vilka poster säljs då först? Vad är räntans andel — hur mycket av utdelning och avkastning äter 5 950-kostnaden, och vad händer när räntan stiger? Var finns reserven — finns likviditet utanför kontot, räknad i motpartens takt (minuter, inte dagar)? Vad är tidslinjen — tål kontot att ha rätt i tre år om kravet kommer i år ett? Står svaret skrivet — finns ett dokumenterat beslut i dag, i lugn, om vad som säljs och vad som förstärks, så att kravdagen verkställer en plan och inte föder ett panikbeslut?\n\nI kategorin aktiemarknaden i praktiken finns ${amAntal} kurser — marginalhandeln (${am09 ? am09.niva.toLowerCase() + " nivå" : "i registret"}) sluter familjen: spreaden, indexet, aktiesidan, marknadsstrukturen, auktionerna, kortläget, indexomläggningen, ETF:ens maskin — och ägarens eget konto, den enda maskinen i familjen vars kostnad är fast, vars gränser är kontrakterade och vars åtgärd vid brott är en försäljning läsaren inte beställer. Som alltid: detta är utbildning i en metod — inga placeringstips.` +
          kallradFler(kallor),
        amne: "marginalhandeln",
        kalla: k,
        kallor,
        handlings: [
          { text: "Kursen: Marginalhandeln", lank: "/kurser/am-09-marginalhandeln", ikon: "🏦", beskrivning: "Belåningskontot, marginalkravet och kaskaden" },
          { text: "Kursen: Margin of safety", lank: "/kurser/km-030-margin-of-safety", ikon: "📐", beskrivning: "Ordets andra hem — värderingsmarginalen" },
          { text: "Kursen: Statsobligationer", lank: "/kurser/mk-04-statsobligationer", ikon: "📈", beskrivning: "Räntans källa — två kostnader, en källa" },
          { text: "Kursen: Likviditet och spread", lank: "/kurser/am-01-likviditet-och-spread", ikon: "💧", beskrivning: "Kravdagenens marknad — spreaden vidgas" },
          { text: "Vad är hävstång?", lank: "fragor:" + encodeURIComponent("vad är hävstång?"), ikon: "⚖️", beskrivning: "Basens ord — hävstångens två ansikten" },
          { text: "Vad är utlåningsräntan?", lank: "fragor:" + encodeURIComponent("vad är utlåningsräntan?"), ikon: "💸", beskrivning: "Handelsdagens gränsord — räntans släkting" },
        ],
        motfraga: { text: "Vad är hävstång?", kategori: "tvangsmekanik" },
        fordjupa: { text: k.titel, lank: "/kurser/am-09-marginalhandeln" },
      };
    },
  },
  {
    id: "optionsförfallets-dag",
    karnord: [
      // Sond rond 1: alla NULL genom kedjan; rond 3: 0 grannar. GRÄNSER:
      // «förfallodagen» → optionshantverket (d0); «delta» deras kanoniska;
      // «open interest» → realekonomin; «gamma-hedgning» → valutamekaniken;
      // «stängningsauktionen» → handelsdagen; «pin-risken» → basen —
      // samtliga bärs i TEXT med attribution.
      "optionsförfallet", "optionsförfallets dag",
      "förfalloptron",
      "magnetkarta", "magnetkartan", "magnetkartor", "magnetkartorna",
      "uteståendet",
      "utestående kontrakt",
      "volatilitetens torka",
      "rullningen",
      "häxtimman",
    ],
    starkord: [
      "kontrakt", "kontrakten", "kontraktstorlek", "lösenpris", "serie",
      "serier", "kvartal", "kvartals", "kalender", "kalendern", "magneter",
      "magneten", "tyngdpunkten", "torka", "efterspelet", "gamman",
      "hedg", "hedgen", "auktion", "fredagen", "ombyggnaden",
    ],
    bygga: (reg) => {
      const ktAntal = reg.filter((r) => r.kategori === "KATALYSATOR").length;
      const kallor = [
        kursKalla(reg, "kt-08-optionsforfallets-dag", "Läroplanen — dagen: magnetkartan, hedgen och tron"),
        kursKalla(reg, "km-059-optionsgrunder", "Läroplanen — utestående kontrakt (open interest): grundkursens begrepp, förfalloläsarens karta"),
        kursKalla(reg, "am-05-handelsdagens-auktioner", "Läroplanen — stängningsauktionens mekanik: dagens utfallsrum"),
        kursKalla(reg, "kt-03-katalysatorkedjor", "Läroplanen — kedjan: rullningsdagar, förfall, efterspel som tre namngivna led"),
        kursKalla(reg, "od-01-optionens-greker", "Läroplanen — gamman som begrepp: grekerna ägs av optionsfamiljen"),
      ];
      const k = kallor[0];
      const kt08 = reg.find((r) => r.slug === "kt-08-optionsforfallets-dag");
      return {
        text:
          `Optionsförfallet är marknadens enda händelse vars datum är helt känt månader i förväg men vars verkan inte är det. Katalysatorns grammatik säger att en katalysator tvingar marknaden att ompröva — förfallet tvingar inte fram omprövning av VÄRDET utan av POSITIONERNA: tusentals innehav måste avgöras, rullas eller realiseras samma dag. Det är positionernas dag, inte värderingsdagen. Instrumentet och dess känslighetstal ägs av optionskurserna — här ägs DAGEN: vad som händer med aktien och marknaden när kontrakten löper ut (allt nedan är utbildning i hur dagen läses, med kursens egna modelltal och tydligt påhittade värden — inga placeringstips):\n\n1️⃣ MAGNETKARTAN — VAR TYNGDEN SITTER. Före dagen finns kartan: utestående kontrakt per lösenpris (open interest — grundkursens begrepp), multiplicerat med kontraktstorleken 100 aktier. Exemplet: aktien handlas kring 101; vid lösenpris 95 är uteståendet 3 000 kontrakt = 300 000 aktier; vid lösenpris 100 hela 12 000 kontrakt = 1 200 000 aktier; vid 105 är det 5 000 = 500 000. Ställ 1 200 000 mot en dagomsättning på 8 000 000: 15 procent — en positionstyngd att respektera när den ska avgöras inom några timmar. Kartan säger inte att kursen KOMMER stänga vid 100 — den säger var konsekvenserna är koncentrerade om den gör det: en lösen nära tyngdpunkten rör flest aktier och störst volym i stängningsauktionen.\n2️⃣ HEDGEN SOM DRAR MOT TYNGDPUNKTEN. Magneten har en motor: gamma-hedgningen (hedging-ordet är valutamekanikens, gamman od-01-optionens grekers begrepp — här läses flödet från MARKNADENS sida). En handlare (påhittat exempel) har köpt 1 000 kontrakt köpoptioner med lösenpris 100 — exponeringen 100 000 aktier vid deltata 0,50 — och vill inte bära aktierisk: korta 50 000 aktier. Stiger kursen till 101 växer deltata till 0,62 — exponering 62 000 — och för att förbli neutral KÖPER handlaren 12 000 aktier in i styrkan. Faller kursen till 99 krymper deltata till 0,38 — 38 000 — och handlaren köper tillbaka 12 000 in i svagheten. Köp åt båda håll: rörelsen dämpas, och flödet pekar ständigt tillbaka mot lösenpriset 100 — det är dragkraftens motor. Vänd bilden — handlaren har sålt optionerna — och flödet vänder: stigande kurs tvingar köp högt upp, fallande försäljning lågt ner: förstärkning i stället för dämpning. Dagens karaktär avgörs av vilken sida som bär mest utestående. Och utan magnet är grundplanen ändå uträknad: med daglig standardavvikelse 1,5 procent stängs aktien inom en krona från 100 i 49,5 procent av dagarna under ren slump — hedgflödet lägger dragningskraft ovanpå slumptalet.\n3️⃣ TRON — NÄR ALLT LÖPER UT SAMTIDIGT. Standardserierna förfaller tredje fredagen i månaden; kvartalsförfalloptron (mars, juni, september, december) är den täta: aktieoptioner, indexoptioner och indexterminer samma dag, och volym som normalt sprids över veckor samlas på en enda eftermiddag — den sista timmen före stängningen bär dagens största omsättning. Dagarna före tron rullar innehavarna: positioner som inte vill realiseras flyttas till nästa serie — den gamla säljs, nästa köps — vilket syns som svällande utestående i kommande månad medan den gamla serien töms.\n4️⃣ EFTERSPELET — VOLATILITETENS KALENDER. Dagen slutar inte när kontrakten dör. I veckorna före ett stort förfall pressas rörelserna ned av det köpta hedgflödet — volatilitetens torka, när säljare av optioner får medvind. På själva förfallodagen (optionshantverkets ord för seriens sista giltighetsdag) läcker gamman ur systemet: de kontrakt som dör har ingen hedge kvar att justera, och det flödet som dämpade försvinner. Därmed öppnas fönstret efteråt: utan det dämpande flödet kan rörelser som sparats återkomma, nya serier emitteras och nästa månads magneter etableras inom några handelsdagar. Mät komprimeringen: samma 1 200 000 aktier mot en sinande omsättning på 5 000 000 är 24 procent — magneten växer när handeln tunnar (15 → 24). En vecka där förfalloptron sammanfaller med räntebeslut och stora rapporter bär mer sammanlagd rörelserisk än kalenderns rader var för sig antyder — inte för att någon rad säger det, utan för att de positioner som normalt dämpar rörelse just då är som tunnast.\n5️⃣ ARBETSBLADETS FEM RADER. (1) KALENDERN: är nästa förfall månatligt eller kvartalstron, och vilka andra händelser delar vecka? (2) MAGNETKARTAN: vilket lösenpris bär störst utestående — hur många aktier, hur många procent av omsättningen? (3) AVSTÅNDET: hur långt i procent sitter kursen från tyngdpunkten (101 mot 100 är gränslandet)? (4) HEDGRIKTNING: dominerar köpt eller såld gamma i serien — ett dokumenterat antagande är bättre än inget? (5) EFTERSPELET: när ritas nästa karta om, och vilken volatilitetsform bär veckorna efter? Varje rad mäts med två sökningar och en division — och ingen rad säger något om värde: arbetsbladet läser mekanik, och värderingen läses bäst när mekanikens röst inte skriver kurran.\n\nI kategorin katalysator finns ${ktAntal} kurser — optionsförfallets dag (${kt08 ? kt08.niva.toLowerCase() + " nivå" : "i registret"}) är den mest mätbara av katalysatorer och den minst värdebärande: rörelse utan påstående om värde. Som alltid: detta är utbildning i en metod — inga placeringstips.` +
          kallradFler(kallor),
        amne: "optionsförfallets dag",
        kalla: k,
        kallor,
        handlings: [
          { text: "Kursen: Optionsförfallets dag", lank: "/kurser/kt-08-optionsforfallets-dag", ikon: "📅", beskrivning: "Kalenderns inbyggda katalysator" },
          { text: "Kursen: Options-grunder", lank: "/kurser/km-059-optionsgrunder", ikon: "🎓", beskrivning: "Open interest — grundkursens begrepp" },
          { text: "Kursen: Handelsdagens auktioner", lank: "/kurser/am-05-handelsdagens-auktioner", ikon: "🔨", beskrivning: "Stängningsauktionens mekanik" },
          { text: "Kursen: Katalysatorkedjor", lank: "/kurser/kt-03-katalysatorkedjor", ikon: "🔗", beskrivning: "Andra ordningens effekter — kedjans led" },
          { text: "Vad är förfallodagen?", lank: "fragor:" + encodeURIComponent("vad är förfallodagen?"), ikon: "⏳", beskrivning: "Optionshantverkets ord — dagens gränsvakt" },
          { text: "Vad är en köpoption?", lank: "fragor:" + encodeURIComponent("vad är en köpoption?"), ikon: "🎟️", beskrivning: "Optionsdjupets grund — rätten, inte plikten" },
        ],
        motfraga: { text: "Vad är förfallodagen?", kategori: "tvangsmekanik" },
        fordjupa: { text: k.titel, lank: "/kurser/kt-08-optionsforfallets-dag" },
      };
    },
  },
];

// ── Huvudingången ──────────────────────────────────────────────────────────

/**
 * Svara lokalt med tvångsmekanik-mönstret — eller null (då har hela kedjan
 * före redan lämnat null och API-flödet tar över som förr). Ligger efter
 * co-invest och FÖRE marknadsrytm i widgetens kedja och kan därför aldrig
 * stjäla en fråga från ett tidigare lager; det fångar bara frågor som alla
 * lager före det lämnar null på. Samma matchningssemantik som basmotorn:
 * minst ett kärnord krävs, poäng = kärnord × 3 + stärkord, oavgjort → först
 * deklarerade mönstret vinner (strikt >, deterministiskt). Samma fråga ⇒
 * bitidentiskt svar.
 */
export function svaraLokaltTvangsmekanik(fraga: string, register: RegisterRad[]): LokaltSvar | null {
  const fragaStr = diafri(fraga);
  if (!fragaStr) return null;
  const fragaOrd = fragaStr.split(" ");
  let bast: { svar: LokaltSvar; poang: number } | null = null;
  for (const m of TVANGSMEKANIK_MONSTER) {
    const karnTraff = m.karnord.filter((nk) => traff(fragaOrd, fragaStr, nk));
    if (karnTraff.length === 0) continue; // krav: minst ett kärnord
    const starkTraff = m.starkord?.filter((nk) => traff(fragaOrd, fragaStr, nk)) ?? [];
    const poang = karnTraff.length * 3 + starkTraff.length;
    if (!bast || poang > bast.poang) bast = { svar: m.bygga(register), poang };
  }
  return bast ? bast.svar : null;
}
