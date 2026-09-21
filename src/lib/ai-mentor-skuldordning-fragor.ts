/**
 * AI-MENTORN 2.0 — SKULDORDNINGS-FÖRHANDSFRÅGOR (s6-u2, omgång 34 i spår 6,
 * manifest auto-s6-1790029519192, byggare 2/3).
 *
 * TVÅ källmärkta monsters med temat SKULDENS ORDNING — platsen i kön och
 * valutan på beloppet:
 *   · SENIORITETSORDNINGEN ("vad är senioritetsordningen?" — trappan,
 *     konkursräkningen, återvinningen per steg, yield-trappan,
 *     rekonstruktionen) — ks-09 SENIORITETSORDNINGEN primär —
 *     KAPITALSTRUKTUR-familjens näst sista mentorväglösa steg.
 *   · VALUTASÄKRINGEN I RAPPORTEN ("vad är säkringsgraden?" — de två
 *     tiderna, terminspremien, valutanotens fem läsningar, gradens lägen,
 *     de sex fällorna) — ks-08 VALUTASÄKRINGEN primär — familjens sista
 *     mentorväglösa steg ⇒ KAPITALSTRUKTUR FULLT MENTORLÄNKAD 9/9.
 *
 * ÄMNESVAL EFTER SOND (dokumenterad kedja):
 *   • Sond _s6u1d-mentorlosa.mjs 2026-09-22 (före anspråk): 98 mentorväglösa;
 *     KAPITALSTRUKTUR exakt 2 lösa (ks-08 + ks-09) av 9 — enda kategorin
 *     som +2 stänger HELT. ks-09 är spår 5:s nyaste kurs i familjen (född i
 *     492→495-commiten 2026-09-21) — rs-09-precedensen: ny kurs mentorlänkas
 *     samma dygn.
 *   • RACE, slutlig bokföring: mitt anspråk planerade od-11 ränteswapen som
 *     källaktivering — u3:s anspråk (00:30:12) nådde disk FÖRE u1:s
 *     (00:30:25) och deras NYKULL-motor äger od-11 som PRIMÄR; u1:s
 *     konkurrerande ränteswap-bygge kasserades av dem själva (öppen not i
 *     widgeten + deras anspråk v2). od-11 är här endast en av sex KÄLLOR i
 *     valutasäkringsmonstret (swappen är central i ks-08:s eget innehåll),
 *     med attribuering i lagrow.
 *   • Anspråk auto-s6-1790029519192-s6-u2-ansprak.md på disk FÖRE byggstart;
 *     TILLVÄXT/SKATT (2 lösa var) nedlagda — stängs inte av +2.
 *
 * DOKUMENTERADE GRÄNSER (bärs i TEXT, aldrig som kärnord):
 *   • naket «valutasäkring»/«valutahedging» → valutamekanikens hedging-
 *     monster (motor ~11 — ÖVERSIKTSORD deras, banksektorn-precedensen:
 *     detta lager äger MASKINENS begrepp: säkringsgraden, terminsprogrammet,
 *     notens fem läsningar; kollisionen var sonderad: "valutasäkring" ägs,
 *     "valutasäkringen" tav-2-fångas av deras "valutasakring").
 *   • «konkursprognos»/«z-score»/«altman»/«kassaräckvidd» → överlevnadsdjupet
 *     (dÖT-familjen deras) · «skuldfällan»/vägen in i krisen → riskdjupet
 *     (rk-03 deras — här ägs det som händer SEDAN) · naket «termin»/
 *     «terminer» → nästas (försäkringslagrets dokumenterade gräns) ·
 *     «swap» → handelsdagens vwap (nyfodda-kommentaren; od-11 är här endast
 *     KÄLLA) · «covenants»/«kreditbetyg» → ks-05:s ägare · «konvertibel»/
 *     «kapitaltrappan» → konvertibel-lagret · «borgen»/«skuggskuld»/
 *     «förbindelsenot» → notläsningen · «refinansieringsmuren» → tidsaxeln
 *     (st-05) · LGD/CDS-ekvationen som instrument → od-10 kreditderivatet
 *     (nyfodda — här härleds LGD ur trappan, deras ekvation citeras) ·
 *     «riskpremien»/statsreferensen → ma-05:s lager · «ppp»/«ränteparitet»
 *     som valutateori → valutamekaniken (HER används räntepariteten som
 *     aritmetik för terminspremien, med deras kurs ma-07 som källa) ·
 *     «valutarisk» som portföljrisk → riskdjupet/basen (rk-07 källa här).
 *
 * Aritmetiken i svaren (kursernas EGNA modelltal med tydligt påhittade verk
 * — NorrVerk Maskiner och Norrsken Verktyg AB — maskinellt omräknade i
 * regressionstestets D-fall):
 *   · Senioritet: 420×0,61 = 256,2 · 380×0,35 = 133,0 · 256,2+133,0 = 389,2
 *     (48,7 % av 800) · 389,2−12,0 = 377,2 · 380−256,2 = 123,8 ·
 *     133,0−12,0−42 = 79,0 · 79,0/381,8 = 20,7 % · 123,8×0,207 = 25,6 ·
 *     256,2+25,6 = 281,8 = 74,2 % · 150×0,207 = 31,0 · klyfta 53,5 pp ·
 *     kontroll 256,2+42+79,0 = 377,2 · LGD 1−0,207 = 0,793 ·
 *     0,045×0,793 = 0,0357 ≈ 3,6 pp · spreadtrappan 2,0/3,4/7,0 ·
 *     rekonstruktion 25+15 = 40 % · stress 420×0,51 = 214,2 · övning:
 *     300×0,70 = 210, rest 40 · 60/150 = 40,0 %, 0,40×80 = 32 ·
 *     0,060×0,650 = 3,9 pp.
 *   · Valutasäkring: 11,50×1,040/1,025 = 11,67 · premie +0,17 ·
 *     40/1,025 = 39,0 · 39,0×11,50 = 448,8 · 448,8×1,040 = 466,7 ·
 *     40×11,67 = 466,8 · option 0,35 kr/EUR ⇒ 14,0 MSEK ·
 *     11,50×1,020/1,030 = 11,39 · premie −0,12 ⇒ −4,8 MSEK ·
 *     +0,17 ⇒ 6,8 MSEK · noten: 31 av 40 = 78 % till 11,52 · 9 osäkrat ·
 *     nettoinvestering 280+20 = 300 = 100 % · överhedg 50−40 = 10.
 *
 * KEDJEPLATS: 82:a motorn av 83 (efter nyfodda, FÖRE u1:s
 * valideringsfönster och marknadsrytm som förblir SIST; deras
 * SIST-deklaration respekteras, huskonventionen räknar rad+1; u1:s
 * ränteswap-bygge kasserat av dem själva — ordinalen följer det
 * levererade trädet, fall G verifierar ordningen varje körning).
 * Kärnorden är mekaniskt disjunkta mot
 * samtliga övriga lager (sond _s6u2o34-karnord.mjs mot 2 177 kärnord i 79
 * lager: senioritetslistan 33/33 RENT, valutalistan 28/28 RENT utom
 * «valutasäkring»-familjen som MEDVETET lämnats åt valutamekaniken +
 * «valutanot» tav-1-mot «valutan» struket; rond 2+3: 41 ytterligare
 * rapportbegrepp RENTA) — verifieras levande av detta lagers eget test
 * (J-fall) och kedjetestets strukturfall.
 *
 * Matchningen speglar motorns hjälpfunktioner (samma lösning som alla
 * syskinlager: Node type-stripping löser endast `import type`, så de rena
 * funktionerna speglas hit). Semantisk likhet med motorn BEVISAS av
 * testets felstavningsfall (B) och determinismfall (C). Driftvarning:
 * ändras motorns matchning måste denna spegel följa — testfall B vakar.
 *
 * ── JURIDIKGRINDEN (lagen 2007:528) ──────────────────────────────────
 * All text är pedagogisk utbildning om hur senioritetsordningar,
 * konkursräkningar och valutanoter LÄS och RÄKNAS — inga köp-/säljsignaler,
 * inga placeringstips, inga omdömen om enskilda bolag. Exempelvärdena är
 * kursernas egna modelltal (NorrVerk Maskiner och Norrsken Verktyg AB är
 * påhittade) — konstruerade för övningens skull.
 *
 * ── DEPENDENCY-INJECTION (samma mönster som hela motorn) ─────────────
 * Registret skickas IN som parameter (endast `import type`) så att
 * verktyg/testa-ai-mentor-skuldordning.mjs kan köra filen direkt i Node.
 * Källkurserna finns i KURSREGISTER — inga fantomlänkar (kedjetestets
 * E-fall vakar).
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

// ── Den 1 frågan: senioritetsordningen (ks-09) ──────────────────────────────

export const SKULDORDNING_MONSTER: FragMonster[] = [
  {
    id: "senioritetsordningen",
    karnord: [
      // Sond _s6u2o34-karnord rond 1 (inline node): 33/33 RENT mot 2 177
      // kärnord i 79 lager. GRÄNSER (bärs i TEXT): konkursprognos/z-score →
      // överlevnadsdjupet · skuldfällan → riskdjupet · covenants/kreditbetyg
      // → ks-05:s ägare · konvertibel/kapitaltrappan → konvertibel-lagret ·
      // borgen/skuggskuld → notläsningen · refinansieringsmuren → tidsaxeln ·
      // CDS/LGD-ekvationen → nyfodda (od-10).
      "senioritet", "senioriteten", "senioritetsordning", "senioritetsordningen",
      "rekonstruktion", "rekonstruktionen", "företagsrekonstruktionen", "rekonstruktören",
      "obligationsinnehavare", "obligationsägarna", "obligationsinnehavarna",
      "sakrätt", "sakrätten", "sakrättsligt",
      "ackordsordning", "ackordsförslag", "ackordet",
      "likvidationsordning", "likvidationsordningen", "likvidatorn", "likvidationsöverskott",
      "fortsättningsintressen", "subordination", "subordinerad",
      "efterställd", "efterställda", "förställd",
      "penningutlåning", "utdelningsstoppen",
      "tillgångstratten", "tvångsförfarandet",
    ],
    starkord: [
      "skuld", "skulden", "skulder", "fordran", "fordringar", "borgenärer",
      "trappan", "trappsteg", "trappsteget", "konkurs", "boet", "pant",
      "panten", "förmånsrätt", "obligation", "obligationen", "bankkredit",
      "leverantör", "leverantörer", "pro rata", "utdelningskvot",
      "återvinning", "realisation", "spread", "yield", "ställning",
      "företräde", "prospekt", "NorrVerk", "faller", "insolvens", "miljoner",
    ],
    bygga: (reg) => {
      const ksAntal = reg.filter((r) => r.kategori === "KAPITALSTRUKTUR").length;
      const kallor = [
        kursKalla(reg, "ks-09-senioritetsordningen", "Läroplanen — trappan, konkursräkningen och yield-trappan: samma trappa sedd före och efter"),
        kursKalla(reg, "ks-03-skuldens-anatomi", "Läroplanen — löptider, bindning och panten som kolleteral"),
        kursKalla(reg, "ks-05-covenanter-och-kreditbetyg", "Läroplanen — reglerna medan bolaget lever; trappan äger dagen de inte gör det"),
        kursKalla(reg, "ks-06-konvertibler-och-hybridkapital", "Läroplanen — mellanstegen: skuld som kan bli eget kapital"),
        kursKalla(reg, "rk-03-skuldfalla", "Läroplanen — vägen in i krisen (deras); här ägs det som händer sedan"),
        kursKalla(reg, "st-07-skuggskulderna", "Läroplanen — åtagandena i noten: trappans osynliga platser"),
      ];
      const k = kallor[0];
      const ks09 = reg.find((r) => r.slug === "ks-09-senioritetsordningen");
      return {
        text:
          `Senioritetsordningen är skuldens köbiljett: en kapitalstruktur är inte en lista över belopp utan en TURORDNING — vem som har laglig företräde, vem som står säkrat, och vem som får det som blir kvar när allt annat betalats. Kursen bygger exempelbolaget NorrVerk Maskiner (påhittat, som alla tal) och räknar hela vägen från balansräkning till utdelningskvot (allt nedan är utbildning i läskonst — inga placeringstips):\n\n1️⃣ TRAPPAN — FYRA TRAPPSTEG OCH EN FOTBAS. NorrVerks balansräkning vid krisen: tillgångar 800 miljoner, varav pantsatta 420 och opantade 380. Fordringarna, sammanlagt 680: säkerad bankkredit 380 (pant i de 420 pantsatta tillgångarna), efterställd företagsobligation 150 (uttryckligen skriven att stå efter banken), leverantörsskulder 90, skatteskuld 30, lönefordran 12 och övriga fordringar 18. Det egna kapitalet, bokfört 120, står inte bland fordringarna alls — det är trappans fotbas: de som ÄGER bolaget betalas endast om alla trappsteg ovanför täcks till hundra procent. Fyra sorters placeringar bär ordningen: PANT (bankens förmånsrätt i specifika tillgångar), LAGLIG FÖRMÅNSRÄTT (skatt och löner står före osäkrade fordringar även utan pant), AVTALAD EFTERSTÄLLDHET (subordinationen är ett avtal, inte en gest — en mening i prospektet) och DE OSÄKRADES PRO RATA (leverantörer och övriga delar på resten, i förhållande till sina fordringar — lika per krona, inte lika per fordran).\n2️⃣ KONKURSRÄKNINGEN — TRE STEG. Realisationen: boet säljer de pantsatta tillgångarna till 61 procent av bokfört värde — 420 × 0,61 = 256,2 — och den opantade substansen (fordringar, lager, mindre maskiner) till 35 procent — 380 × 0,35 = 133,0. Summa realiserat 389,2, alltså återvinningen 389,2/800 = 48,7 procent av hela balansräkningen. Boets kostnad: förvaltaren, värderingsmän och auktioner kostar 12,0 — fördelningsbart blir 377,2. Fördelningen: PANTRÄTTEN ger banken 256,2 av sin fordran 380 direkt, medan resten — 380 − 256,2 = 123,8 — blir osäkrad restfordran och söker sig till de fria medlen. FÖRMÅNSRÄTTEN betalar skatt 30 och löner 12, sammanlagt 42, ur det opanta utfallet innan några osäkrade ser en krona: 133,0 − 12,0 − 42 = 79,0 kvar. PRO RATA-POTTEN: de osäkrade fordringarna är bankens rest 123,8, obligationen 150, leverantörerna 90 och övrigt 18 — sammanlagt 381,8 — och potten 79,0 räcker till utdelningskvoten 79,0/381,8 = 20,7 procent. AKTIEÄGARNA: noll — de bokförda 120 är en restpost, och resten är noll. Kontrollraden stänger räknenöten: 256,2 + 42 + 79,0 = 377,2 exakt — trappan tar allt, aldrig mer.\n3️⃣ ÅTERVINNINGEN PER STEG — SAMMA FALL, FYRA UTFALL. Banken: 256,2 ur panträtten plus restfordran i potten 123,8 × 0,207 = 25,6, totalt 281,8 av 380 = 74,2 procent. Obligationen: 150 × 0,207 = 31,0 = 20,7 procent. Här står trappans renaste läxa: banken och obligationsinnehavarna lånade till SAMMA bolag, bar samma makroskäl — utfallet skilde 53,5 procentenheter, och hela skillnaden är panträtten och efterställningen. Leverantörerna: 90 × 0,207 = 18,6 = 20,7 procent — leverantörskredit är osäkrad utlåning utan ränta, och fallet prissätter den till 79,3 procent förlust. Skatt och löner: 100 procent. Översatt till kreditderivatets språk är förlusten vid fall LGD = 1 − 0,207 = 79,3 procent för obligationen — siffran som multipliceras med fallrisken i deras ekvation. Och trappan är OLINJÄR vid gränserna: sjunker pantrealisationen från 61 till 51 procent (420 × 0,51 = 214,2) rasar bankens återvinning men obligationens knappt — tills panträtten inte täcker banken alls och banken börjar konkurrera i pro rata-potten: DÅ rasar obligationens utfall.\n4️⃣ YIELD-TRAPPAN — PRISET PÅ PLATSEN I FÖRVÄG. Före krisen bar NorrVerks skulder tre priser: statsobligationen 2,0 procent (den riskfria referensen), den pantsäkrade bankkrediten 3,4 (spread 1,4 procentenheter) och den efterställda obligationen 7,0 (5,0 över staten, 3,6 över banken). Kursens ekvation: förväntad förlust = fallprocent × förlustandel — 4,5 procent fallrisk × 79,3 procent LGD = 3,57, rundat 3,6 procentenheter. Spreaden över den säkrade krediten är alltså exakt det pris som återvinningstabellen visade i efterhand: yield-trappan och konkurstrappan är SAMMA trappa, sedd före och efter. Räkningen är en modell, inte en börs — verkliga spreader bär också likviditet och riskaptit — men kärnan håller: spreaden mellan två lån till samma bolag är inte två åsikter om bolaget, det är en åsikt om trappan.\n5️⃣ REKONSTRUKTIONEN — NÄR TRAPPAN FÖRHANDLAS OM. I stället för konkurs erbjuder NorrVerks rekonstruktion: borgenärerna får 25 procent kontant inom nio månader och 15 procent i nya aktier — sammanlagt 40 mot konkursens 20,7, allt vid boets slut efter två till tre års förvaltning. Aktieägarna, som fick noll i boet, behåller 10 procent utspällda. Varifrån kommer vinsten? Verksamheten som pågående: fabrikens kunder och kontrakt är värda mer i drift än i stycken — realisationsrabatten (48,7 procent av bok) är konkursens pris, och rekonstruktionen köper tillbaka en del av den. Varje parts ja vägs mot DETS EGET konkursutfall, inte mot bolagets bästa: obligationer och leverantörer (40 mot 20,7) är uppgörelsens anhängare, banken (40 mot 74,2) kan vilja boet — bankens ställningstagande är ofta rekonstruktionens verkliga votum.\n6️⃣ PROTOKOLLET — FEM FRÅGOR TILL VARJE SKULDPOST. Ett: säkerheten — vad står skulden pant-säkrad med, och vilken realisationsgrad bär panten i stress? (61 procent gav 256,2 — vad ger 51?) Två: platsen — före eller efter förmånsrätten, och finns en skriftlig efterställning? (Obligationens mening i prospektet: 53,5 procentenheter i utfallet.) Tre: löptiden — när förfaller posten och i vilken ordning? (Refinansieringsmurens ägare äger frågan; trappan avgör vem som står där först.) Fyra: reglerna — vad kräver covenanterna vid nivåer och täckning? Fem: stressen — om realisationen sjunker tio procentenheter på både pant och fri substans, vad blir återvinningen för DENNA post? Tre övningsfall avslutar: (a) pant 300 realiserad till 70 procent mot säkrad fordran 250 ⇒ 300 × 0,70 = 210, restfordran 40; (b) fri pott 60 på osäkrade 40 + 80 + 30 = 150 ⇒ kvot 60/150 = 40,0 procent, obligationen 0,40 × 80 = 32; (c) obligation med återvinning 35 procent och fallrisk 6,0 procent per år ⇒ LGD 65,0 procent, förväntad förlust 0,060 × 0,650 = 3,9 procentenheter.\n\nI kategorin kapitalstruktur finns ${ksAntal} kurser — senioritetsordningen (${ks09 ? ks09.niva.toLowerCase() + " nivå" : "i registret"}) är familjens nionde och sista steg: efter grunderna, allokeringen, skuldens anatomi, emissionen, covenanterna, konvertiblerna och avvägningen tränar den läsaren i strukturfrågan som alla beloppsfrågor vilar på — inte hur mycket bolaget är skyldigt, utan i vilken ordning det är skyldigt det. Som alltid: detta är utbildning i en metod — inga placeringstips.` +
          kallradFler(kallor),
        amne: "senioritetsordningen",
        kalla: k,
        kallor,
        handlings: [
          { text: "Kursen: Senioritetsordningen", lank: "/kurser/ks-09-senioritetsordningen", ikon: "🪜", beskrivning: "Trappan, konkursräkningen och yield-trappan" },
          { text: "Kursen: Skuldens anatomi", lank: "/kurser/ks-03-skuldens-anatomi", ikon: "🏗️", beskrivning: "Löptider, bindning och panten som kolleteral" },
          { text: "Kursen: Covenanter och kreditbetyg", lank: "/kurser/ks-05-covenanter-och-kreditbetyg", ikon: "📋", beskrivning: "Reglerna medan bolaget lever" },
          { text: "Kursen: Skuldfällan", lank: "/kurser/rk-03-skuldfalla", ikon: "🕳️", beskrivning: "Vägen in i krisen" },
          { text: "Vad är en skuggskuld?", lank: "fragor:" + encodeURIComponent("vad är en skuggskuld?"), ikon: "🌑", beskrivning: "Syskonfrågan — trappans osynliga platser i noten" },
        ],
        motfraga: { text: "Vad är en skuldfälla?", kategori: "kapitalstruktur" },
        fordjupa: { text: k.titel, lank: "/kurser/ks-09-senioritetsordningen" },
      };
    },
  },
  {
    id: "valutasakringen",
    karnord: [
      // Sond _s6u2o34-karnord rond 1: «valutasäkring»-familjen ÄGS av
      // valutamekanikens hedging-monster (översiktsord, banksektorn-
      // precedensen) och lämnas medvetet där; «valutanot» ströket (tav-1
      // mot portföljgrundens «valutan») och «funktionell valuta» ströket
      // (frasen delsträngskrockar med portföljgrundens nakna «valuta» —
      // en fråga med frasen fångas av dem FÖRE detta lager; begreppet
      // bärs i TEXT via presentation-/transaktionsvaluta-orden). Ronder
      // 2+3: ytterligare 41 rapportbegrepp RENTA. GRÄNSER (bärs i TEXT):
      // naket «termin»/«terminer» → nästa · «swap» → handelsdagen (od-11
      // endast KÄLLA här) · «ppp»/«ränteparitet» som valutateori →
      // valutamekaniken · «valutarisk» som portföljrisk → riskdjupet/
      // basen.
      "säkringsgrad", "säkringsgraden",
      "valutatermin", "valutaterminen", "valutaswap", "valutaswappen",
      "säkringsdiff", "säkringsdifferens", "säkringsresultat", "säkringskontot",
      "valutaexponering", "nettoexponering", "nettoinvestering", "nettoinvesteringen",
      "deltäckning", "heltäckning", "översäkring", "undersäkring",
      "överhedg", "överhedgen",
      "terminssäkring", "terminskurslås",
      "terminsprogram", "terminsprogrammet", "medeltermin", "medelterminen",
      "valutariskhantering", "valutapolitiken",
      "kontraktsmatchning", "naturlig säkring",
      "terminskurs", "terminskursen", "spotkurs", "spotkursen",
      "presentationvaluta", "presentationvalutan",
      "transaktionsvaluta", "transaktionsvalutan",
      "översättningsdifferens", "översättningsdiffen",
      "valutakursdifferens", "valutadiffen",
      "säkringsrelation", "kassaströmsäkring",
      "lånevaluta", "lånevalutan",
      "säkringsprotokoll", "säkringsprotokollet",
      "osäkrad rest", "osäkrade resten",
      "terminspremie", "terminspremien",
    ],
    starkord: [
      "säkring", "säkrad", "säkrat", "osäkrad", "valuta", "valutan", "euro",
      "eur", "dollar", "usd", "krona", "kronan", "termin", "terminer",
      "swap", "swappen", "option", "put", "premie", "ränta", "räntan",
      "flöde", "flödet", "noten", "bokslut", "dotterbolag", "marginal",
      "kvartal", "Norrsken", "verktyg", "rapporten", "matchning",
    ],
    bygga: (reg) => {
      const ksAntal = reg.filter((r) => r.kategori === "KAPITALSTRUKTUR").length;
      const kallor = [
        kursKalla(reg, "ks-08-valutasakringen", "Läroplanen — de två tiderna, terminspremien och valutanotens fem läsningar"),
        kursKalla(reg, "od-07-terminskontraktet", "Läroplanen — terminen som instrument: priset idag, leveransen sedan"),
        kursKalla(reg, "od-11-ranteswapen", "Läroplanen — swappen: samma arkitektur i serie (syskonet nykullens primärkurs — här källa i valutaprogrammet)"),
        kursKalla(reg, "ma-07-valutakursens-mekanik", "Läroplanen — räntepariteten som valutateori (här: aritmetiken för premien)"),
        kursKalla(reg, "km-058-valutor", "Läroplanen — valutornas grunder"),
        kursKalla(reg, "rk-07-valutarisk", "Läroplanen — valutarisken som riskpost i portföljen"),
      ];
      const k = kallor[0];
      const ks08 = reg.find((r) => r.slug === "ks-08-valutasakringen");
      return {
        text:
          `Valutasäkringen i rapporten är läran om hur ett bolag flyttar valutans vind från marginalen till beslutet — och hur den som läser en valutanot skiljer verktygens kvartal från valutans. Kursens genomgående exempel är påhittat: Norrsken Verktyg AB, svensk verktygstillverkare med 1 800 miljoner kronor i omsättning — 40 procent faktureras i euro, 25 i dollar, resten i kronor — och ett tyskt dotterbolag med nettotillgångar om 300 miljoner euro som översätts till kronor vid varje bokslut (allt nedan är utbildning i mekaniken med påhittade tal — inga placeringstips):\n\n1️⃣ DE TVÅ TIDERNA — FLÖDET OCH POSITIONEN. Exponeringen lever i två skepnader. FLÖDET: tolv månaders eurofakturor om sammanlagt 40 miljoner euro — bestämda belopp, bestämda datum; varje kronas rörelse från dagens kurs till betalningsdagen är en osäkrad vinst eller förlust som landar i marginalen. NETTOINVESTERINGEN: dotterbolagets balansräkning — inte ett flöde utan en beständig position som vid varje bokslut rör det EGET KAPITAL med kursens rörelse. Och före båda: den NATURLIGA SÄKRINGEN — dotterbolagets kostnader är i euro, och varje eurokostnad mot eurointäkten minskar exponeringen innan något instrument beställts. De två typerna förväxlas aldrig ostraffat: flödesrisken är ändlig och dör med sista fakturan; positionen lever så länge dotterbolaget gör det. Säkringens första fråga är aldrig «termin eller option» — den är «flöde eller position».\n2️⃣ INSTRUMENTEN OCH TERMINSPREMIENS ARITMETIK. TERMINEN: Norrsken säljer 40 miljoner euro tolv månader fram till en bindande kurs. Ingen premie betalas — och kursen är inte en åsikt utan ränteparitetens aritmetik: spot EUR/SEK 11,50, svensk tolvmånadersränta 4,0 procent, euroländernas 2,5 ⇒ terminen 11,50 × 1,040/1,025 = 11,67. Beviset att de sjutton örena är mekanik och inte prognos: pengmarknadsvägen — låna idag 40/1,025 = 39,0 miljoner euro, växla till 11,50 = 448,8 miljoner kronor, placera till 4,0 procent = 466,7 miljoner om tolv månader; terminen ger 40 × 11,67 = 466,8 — samma slutsumma, öre för öre. SWAPPEN är samma arkitektur i serie — ett program av terminer som rullar. OPTIONEN är den betalda rättigheten: en put på euro till strike 11,40 kostar cirka 0,35 kronor per euro — 14 miljoner på 40 miljoner euro — och köper golvet 11,40 med taket öppet. Och eftersom premien är ränteskillnaden vänder dess TECKEN med räntecykeln: svenska räntan en procentenhet under euroländernas ger terminen 11,50 × 1,020/1,030 = 11,39 — samma rad i rapporten som var ett tillskott bär nu en belastning. Samma bolag, samma säkring; bara ränteläget har vänt.\n3️⃣ RAPPORTENS VALUTANOT — FEM LÄSNINGAR. Norrskens bokslut (påhittat): av euroflödet 40 miljoner är 78 procent — 31 miljoner — säkrade i det rullande terminsprogrammet till en medeltermin av 11,52 mot bokslutets spot 11,50; 9 miljoner euro står osäkrade. Dollarflödet 15 miljoner är säkrat till noll procent — motiverat av att ett dollarlån på 42 miljoner i balansräkningen matchar intäktsströmmen: en naturlig position, dokumenterad. Nettoinvesteringen 300 miljoner euro är till hundra procent matchad — 280 genom eurolån, 20 genom en lång termin — och rör sig alltså inte i det egna kapitalet med kursen. De fem läsningarna: VILKEN ANDEL av varje objekt (78, 0 och 100 procent — tre olika beslut, inte tre slarv) · VILKEN LÖPTID (programmet matchar flödenas förfalloprofil) · VILKET INSTRUMENT (termin för basflödet, lån för positionen) · VILKET SPÅR (flödessäkringarnas effekter landar i resultatet samma period som fakturan; nettoinvesteringssäkringen rör det egna kapitalet parallellt med översättningen) och VAD RESTEN BETYDER — de nio osäkrade miljonerna euro är en aktiv valutaåsikt, bokförd som delaktighet.\n4️⃣ SÄKRINGSGRADEN OCH PREMIENS CYKEL. Tre lägen, tre avtal. HUNDRA PROCENT: marginalen låst, kvartalens jämförbarhet maximal — men bolaget har sålt all delaktighet och kan aldrig förklara en valutavinst, bara en terminspremie. NORRSKENS SJUTTIOÅTTA: basflödet under budget låst, volymen därutöver osäkrad — planeringen skyddad, verksamhetens överskott lever med valutan. NOLL: hela exponeringen kvar — i grunden en valutaposition i verktygsdräkt. Vad kostar säkringen? I ränteläget ovan: 40 miljoner euro × premien 0,17 kronor = 6,8 miljoner kronor per år — inte en avgift till banken utan en flytt av avkastning mellan valutornas räntenivåer; i det vända läget −0,12 kronor per euro ≈ −4,8 miljoner, alltså ett tillskott. Optionens kostnad är däremot alltid en premie — 14 miljoner — och köper asymmetrin. Frågan till bolagsstämman är därför inte «varför inte hundra procent» utan «vilken åsikt bor i den osäkrade resten — och vad kostar den i dagens ränteläge?».\n5️⃣ SEX FÄLLOR. Ett: TERMINSKURSEN SOM PROGNOS — att läsa termin 11,67 som «banken tror att euron stiger»; terminen är räntepariteten, inte ett omdöme. Två: ÖVERHEDGEN — att säkra mer än flödet «för säkerhets skull»; den som säkrar 50 miljoner euro mot 40 i fakturor har byggt en naken valutaposition på 10 miljoner. Tre: SPÅRFÖRVÄXLINGEN — derivatet värderas till marknad i kvartalet medan flödet ligger i framtiden; utan parning ser kvartalet falskt volatilt ut. Fyra: GRADEN SOM FIXPUNKT — «vi säkrar alltid åttio procent» är antingen för mycket eller för lite beroende på var flödena ligger; graden är ett beslut per objekt. Fem: KOSTNADSAUTOPILOTEN — att läsa varje negativ terminspost som förlorade pengar; premiens tecken följer räntecykeln och säger ingenting om säkringens kvalitet. Sex: FEL INSTRUMENT FÖR FEL EXONERING — korta terminer mot en lång position, eller långa lån mot ett dödande flöde; löptiden ska matcha objektets tid. Gemensam mekanism: säkringen slår fel när den slutar vara en avbildning av exponeringen och börjar bli en position i sig själv.\n6️⃣ SÄKRINGSPROTOKOLLETS FEM FRÅGOR. Ett: vilka är exponeringarna — flöden, nettoinvesteringar, naturliga matchningar — per valuta och tid? Två: hur mycket av varje objekt är säkrat — beslut per objekt eller slentriansiffra? Tre: med vilka instrument och löptider — matchar programmets förfalloprofil flödets? Fyra: var landar effekterna — resultat eller eget kapital, och kan ledningen visa derivatet BREDD det säkrade? Fem: vilken åsikt bor i den osäkrade resten — hur stor är den i kronor, och skulle den motiveras om den låg i en separat valutafond? Fem svar ger en karta, en grad, en verktygslåda, ett spår och en position — och med dem kan läsaren av nästa bokslut särskilja verktygens kvartal från valutans. Kursens vändning: valutasäkring är inte en försäkring utan en portfölj i portföljen — den flyttar risken från valutan till ränteskillnaden, och den som förstår det slutar fråga «var det dyrt?» och börjar fråga «vilken risk valde vi, och till vilket pris?».\n\nI kategorin kapitalstruktur finns ${ksAntal} kurser — valutasäkringen (${ks08 ? ks08.niva.toLowerCase() + " nivå" : "i registret"}) är familjens åttonde steg: sidan av skulden som handlar inte om ordningen i kön utan om valutan på beloppet — terminen, swappen och kronan i rapporten. Som alltid: detta är utbildning i en metod — inga placeringstips.` +
          kallradFler(kallor),
        amne: "valutasakringen",
        kalla: k,
        kallor,
        handlings: [
          { text: "Kursen: Valutasäkringen", lank: "/kurser/ks-08-valutasakringen", ikon: "💱", beskrivning: "Terminen, swappen och kronan i rapporten" },
          { text: "Kursen: Terminskontraktet", lank: "/kurser/od-07-terminskontraktet", ikon: "📜", beskrivning: "Instrumentet bakom programmet" },
          { text: "Kursen: Ränteswapen", lank: "/kurser/od-11-ranteswapen", ikon: "🔁", beskrivning: "Swappen — avtalet som byter fast mot rörlig" },
          { text: "Kursen: Valutakursens mekanik", lank: "/kurser/ma-07-valutakursens-mekanik", ikon: "🌍", beskrivning: "Räntepariteten som teori" },
          { text: "Kursen: Valutarisk", lank: "/kurser/rk-07-valutarisk", ikon: "⚠️", beskrivning: "Valutarisken som riskpost" },
          { text: "Vad är senioritetsordningen?", lank: "fragor:" + encodeURIComponent("vad är senioritetsordningen?"), ikon: "🪜", beskrivning: "Syskonfrågan — skuldens andra sida: ordningen" },
        ],
        motfraga: { text: "Vad är valutarisk?", kategori: "kapitalstruktur" },
        fordjupa: { text: k.titel, lank: "/kurser/ks-08-valutasakringen" },
      };
    },
  },
];

// ── Huvudingången ──────────────────────────────────────────────────────────

/**
 * Svara lokalt med skuldordnings-mönstren — eller null (då har hela kedjan
 * före redan lämnat null och API-flödet tar över som förr). Ligger efter
 * nyfodda (och u3:s nykull) och FÖRE valideringsfönstret + marknadsrytm i
 * widgetens kedja och kan därför aldrig
 * stjäla en fråga från ett tidigare lager; det fångar bara frågor som alla
 * lager före det lämnar null på. Samma matchningssemantik som basmotorn:
 * minst ett kärnord krävs, poäng = kärnord × 3 + stärkord, oavgjort →
 * först deklarerade mönstret vinner (strikt >, deterministiskt).
 * Samma fråga ⇒ bitidentiskt svar.
 */
export function svaraLokaltSkuldordning(fraga: string, register: RegisterRad[]): LokaltSvar | null {
  const fragaStr = diafri(fraga);
  if (!fragaStr) return null;
  const fragaOrd = fragaStr.split(" ");
  let bast: { svar: LokaltSvar; poang: number } | null = null;
  for (const m of SKULDORDNING_MONSTER) {
    const karnTraff = m.karnord.filter((nk) => traff(fragaOrd, fragaStr, nk));
    if (karnTraff.length === 0) continue; // krav: minst ett kärnord
    const starkTraff = m.starkord?.filter((nk) => traff(fragaOrd, fragaStr, nk)) ?? [];
    const poang = karnTraff.length * 3 + starkTraff.length;
    if (!bast || poang > bast.poang) bast = { svar: m.bygga(register), poang };
  }
  return bast ? bast.svar : null;
}
