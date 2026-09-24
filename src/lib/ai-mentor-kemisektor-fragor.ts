/**
 * AI-MENTORN 2.0 — KEMISEKTOR-FÖRHANDSFRÅGOR (s6-u1, fönster 29 i spår 6).
 *
 * ETT källmärkt monster om molekylens ekonomi — kemisektorn, finansens
 * tredje halva efter banker och fastigheter:
 *   · KEMISEKTORN ("vad är kemisektorn?" — kväve ur luft, fosfor ur berg)
 *     se-21 KEMISEKTORN primär (SEKTORANALYS-familjens tjugoförsta steg —
 *     mentorväglös sedan födelsen enligt mentorlösa-sonden 2026-09-20:
 *     exakt 1 lös kurs i kategorin) + källor se-16 SEKTORANALYSSENS METOD
 *     (metodens tre frågor: vem sätter priset, vem äger flaskhalsen, vem
 *     betalar cykeln) · km-029 SCENARIOANALYS (gas 4/8/12 är tre färdiga
 *     kolumner — vartannat tal i kursen är en färdig scenariocell) ·
 *     ln-03 MARGINALTRAPPAN (bruttomarginalen som råvaruskäl — bulkens
 *     läsning) · mt-07 PRISFULLMAKTEN (specialkemins vallgrav: formulan).
 *     Aktiveringen stänger KATEGORIN SEKTORANALYS fullt mentorlänkad —
 *     skogen, rederiet, försäkringen, gruvan och nu kemian.
 *
 * ÄMNESVAL EFTER TVIST OCH SOND (dokumenterad kedja):
 *   • v17-avtal-partnerskap var förstavalet (sond _s6u1o29-sond.mjs: 20
 *     kandidater NULL, 12 kontroller rätt ägare, 0 grannar; anspråk på disk
 *     22:19:54) men syskonet s6-u2:s fysiska bygge (handelsemotorn,
 *     22:24–22:25) tog avtalsgrenen — duplikat är förlorat arbete, territoriet
 *     lämnat helt (tvist-notis i anspråket).
 *   • v15-nätverkseffekter sonderades som reserv (_s6u1o29b-sond.mjs) — DÖD:
 *     basens moat-monster äger nätverkseffekt-ordfamiljen.
 *   • se-21-kemisektorn VALT: sond B — kemisektor-kandidater NULL, 0 grannar;
 *     sond C (_s6u1o29c-sond.mjs) — FULLSTÄNDIG familj 31 planerade kärnord:
 *     20/20 kandidatfrågor NULL genom levande kedjan (71 motorer/191
 *     monsters), 0 riskgrannar, 0 dubbletter.
 *
 * DOKUMENTERADE GRÄNSER (kursens egen gränsdragning — bärs i TEXT):
 *   • malmen och brytningen → se-20 GRUV- OCH METALLSEKTORN (fosfatbrottet
 *     berörs här som råvarusize, inte som gruvteknik — deras yta).
 *   • den breda materialvarukorgen → km-045 (kursens gränsnot).
 *   • energipriset som makrofenomen → km-043.
 *   • v03 INTÄKTSDIVERSIFIERING är granne (Yara nämns i förbifart — grannen,
 *     inte ägaren); kundkoncentration-familjen äger koncentrationsläsningen.
 *
 * Aritmetiken i svaret (kursernas EGNA modelltal med tydligt påhittade
 * bolagsnamn — maskinellt omräknade i regressionstestets D-fall):
 *   · Norden Bulk 12 000 Mkr × 18 % = 2 160 · Norden Special 3 000 × 38 % =
 *     1 140 — specialkemin bär 1 140/3 300 = 34,5 % av parets bruttovinst
 *     på 3 000/15 000 = 20 % av omsättningen.
 *   · Ammoniaken: 33 energienheter/ton ⇒ gaskostnad 132 USD/ton vid gas 4 ·
 *     264 vid 8 · 396 vid 12 — samma fabrik, tre lönsamhetsvärldar.
 *   · Balanspriset (gas 12): pris 560 ⇒ högkostnadspartnern 14/ton mot
 *     lågkostnadsproducenten 278 — nitton gånger; pris 500 ⇒ partnern −46
 *     (stänger) medan lågkostnaden lever vid 218.
 *
 * KEDJEPLACERING: 72:a motorn (efter handelsemotor, FÖRE marknadsrytm —
 * deras SIST-deklaration + L01 respekteras, multipel-precedensen). Kärnorden
 * är mekaniskt disjunkta mot samtliga 71 lager; verifieras av kedjetestets
 * fall G + H och detta lagers test (kärnorden läses LIVE ur samtliga
 * src/lib/ai-mentor-*-fragor.ts vid varje körning).
 *
 * Matchningen speglar motorns hjälpfunktioner (samma lösning som alla
 * syskinlager: Node type-stripping löser endast `import type`, så de rena
 * funktionerna speglas hit). Semantisk likhet med motorn BEVISAS av testets
 * felstavningsfall (B) och determinismfall (C). Driftvarning: ändras motorns
 * matchning måste denna spegel följa — testfall B vakar.
 *
 * ── JURIDIKGRINDEN (lagen 2007:528) ──────────────────────────────────
 * All text är pedagogisk utbildning om hur sektorn LÄS, RÄKNAS och BEDÖMS —
 * inga köp-/säljsignaler, inga placeringstips, inga omdömen om enskilda
 * bolag. Exempelvärdena är kursens egna modelltal (Norden Bulk och Norden
 * Special är påhittade bolag) — konstruerade för övningens skull.
 *
 * ── DEPENDENCY-INJECTION (samma mönster som hela motorn) ─────────────
 * Registret skickas IN som parameter (endast `import type`) så att
 * verktyg/testa-ai-mentor-kemisektor.mjs kan köra filen direkt i Node.
 * Källkurserna (se-21-kemisektorn, se-16-sektoranalysens-metod,
 * km-029-scenarioanalys, ln-03-marginaltrappan-och-operativ-havstavng,
 * mt-07-prisfullmakten) finns i KURSREGISTER — inga fantomlänkar
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

// ── Den 1 frågan: kemisektorn (se-21) ───────────────────────────────────────

export const KEMISEKTOR_MONSTER: FragMonster[] = [
  {
    id: "kemisektorn",
    karnord: [
      // Sond C (_s6u1o29c-sond.mjs): samtliga NULL genom kedjan, 0 grannar.
      // GRÄNSER (kursens egen gränsdragning, bärs i TEXT): malmen/brytningen
      // → se-20 gruv-och-metallsektorn · materialvarukorgen → km-045 ·
      // energipriset som makrofenomen → km-043.
      "kemisektorn", "kemisk industri", "kemiska industrin", "kemikaliesektorn",
      "bulkkemi", "bulkkemin", "specialkemi", "specialkemin",
      "gödningskemi", "gödningskemin", "gödselindustrin", "kvävegödseln",
      "ammoniak", "ammoniaken", "ammoniaksyntesen", "ammoniakprocessen",
      "haber-bosch-processen",
      "kväve", "kvävet", "kvävefixering",
      "fosfor", "fosforn", "fosfat", "fosfatbrottet", "fosforcykeln",
      "processindustrin", "energiintensiv", "energiräkningen",
      "balanspris", "balanspriset", "högkostnadspartnern",
      "molekylens ekonomi", "kemicykeln",
    ],
    starkord: [
      "sektorn", "kemin", "kemiska", "industrin", "molekylen", "molekyler",
      "gödsel", "gödning", "gasen", "gaspris", "gaspriset", "fabriken",
      "fabrik", "producenten", "ton", "energi", "energin", "räkningen",
      "omsättning", "marginal", "marginalen", "brutto", "bruttomarginalen",
      "cykeln", "råvaran", "berg", "berget", "luften", "formulan",
      "flaskhalsen", "priset", "stänger", "lever", "Norden",
    ],
    bygga: (reg) => {
      const seAntal = reg.filter((r) => r.kategori === "SEKTORANALYS").length;
      const kallor = [
        kursKalla(reg, "se-21-kemisektorn", "Läroplanen — molekylens ekonomi: kväve ur luft, fosfor ur berg, balanspriset"),
        kursKalla(reg, "se-16-sektoranalysens-metod", "Läroplanen — metodens tre frågor: vem sätter priset, vem äger flaskhalsen, vem betalar cykeln"),
        kursKalla(reg, "km-029-scenarioanalys", "Läroplanen — gas 4, 8 och 12 är tre färdiga kolumner: vartannat tal i kursen är en scenariocell"),
        kursKalla(reg, "ln-03-marginaltrappan-och-operativ-havstavng", "Läroplanen — bruttomarginalen som råvaruskäl: bulkens trappsteg"),
        kursKalla(reg, "mt-07-prisfullmakten", "Läroplanen — specialkemins vallgrav: formulan och godkännandet"),
      ];
      const k = kallor[0];
      const se21 = reg.find((r) => r.slug === "se-21-kemisektorn");
      return {
        text:
          `Kemisektorn är finansens tredje halva efter banker och fastigheter — och den sektor där råvaran är molekylen och flaskhalsen är antingen energi eller geologi. Det är industrien som översätter energi till mat: världens största kemiska process, ammoniaksyntesen, tar sin råvara ur luften (outtömlig) och sin begränsning ur gaspriset. Sektoranalysens metod ger tre frågor till varje bransch — vem sätter priset, vem äger flaskhalsen, vem betalar cykeln — och kemian svarar tydligare än de flesta (allt nedan är utbildning i hur sektorn läses, med kursens egna modelltal och tydligt påhittade bolag — inga placeringstips):\n\n1️⃣ KEMINS TVÅ VÄRLDAR. Bulkkemin säljer molekyler i miljontal ton: produkten är en vara, råvarukostnaden dominerar och bruttomarginalerna rör sig kring 12–18 procent. Specialkemin säljer formulan och godkännandet: marginaler kring 25–40 procent och forskning som andel av omsättningen ungefär tio gånger bulkens. Kursens genomgångsexempel bär två påhittade bolag: Norden Bulk omsätter 12 000 miljoner kronor med 18 procents bruttomarginal — tjänar 2 160; Norden Special omsätter 3 000 med 38 procent — tjänar 1 140. Räkna andelarna: paret omsätter 15 000 och tjänar 3 300; specialkemin bär 1 140/3 300 = 34,5 procent av bruttovinsten på 20 procent av omsättningen. Halva sektorns vinst bor i en fjärdedel av dess omsättning — därför är frågan «bulk eller special?» den första en kemiläsare ställer.\n2️⃣ KVÄVET UR LUFTEN — ENERGIN SOM ENDA FLASKHALS. Ammoniaksyntesen (Haber-Bosch-processen) fixerar kväve ur luften till gödningsämne; råvaran kan aldrig ta slut, men processen kräver cirka 33 energienheter per ton ammoniak. Därmed blir gaskostnaden sektorns klocka: vid gaspris 4 kostar energin 132 dollar per ton ammoniak, vid 8 blir den 264 och vid 12 hela 396 — samma fabrik, tre helt olika lönsamhetsvärldar. Det är scenarioanalysens renaste övning: tre färdiga kolumner där vartannat tal i årsredovisningen är en cell. Notera asymmetrin: råvaran är gratis och outtömlig — flaskhalsen är en räkning. Sektoranalysens fråga «vem äger flaskhalsen?» får här sitt svar: den som äger billig energi äger kvävet.\n3️⃣ FOSFORN UR BERGET — GEOLOGIN SOM ÄGANDE. Fosforn är det andra näringsämnet och den omvända logiken: grundämnet kan inte tillverkas, bara brytas. Merparten av världens produktion bärs av en handfull länder — ägandet är redan bestämt i berggrunden. Fosfatbrottet berörs här som råvarusize (brytningens teknik är gruvkursens territorium, inte kemians); det kemiläsaren tar med sig är att gödningskemin har två flaskhalsar av helt olika slag: kvävets är en energiräkning som rörligt svarar på pris, fosforns är en geologisk äganderätt som inte svarar alls. Två näringsämnen, två ägandelogiker — och helt olika sätt att läsa en årsredovisning på.\n4️⃣ BALANSPRISET — NÄR HÖGKOSTNADSPARTNERN SÄTTER TONEN. I en varumarknad sätter priset inte den billigaste producenten utan den dyraste som fortfarande måste producera: högkostnadspartnern. Kursens sifferram (vid gas 12): vid pris 560 dollar per ton tjänar högkostnadspartnern 14 per ton medan lågkostnadsproducenten tjänar 278 — nitton gånger skillnad på samma produkt. Faller priset till 500: partnern landar på minus 46 och stänger sin fabrik, medan lågkostnadsproducenten fortfarande lever på 218. Marginaltrappans läsning: bruttomarginalen i bulk är ett råvaruskäl, inte en vallgrav — priset på produkten sätts av andras kostnader, och lönsamheten bor i avståndet mellan egen och partnerns kostnadskurva. När högkostnadspartnern stänger stiger priset igen — cykeln som sektoranalysens tredje fråga frågar efter: jordbrukspriser, lager och kapacitetsutbud är kemins klockor.\n5️⃣ KEMILÄSARENS PROTOKOLL. Kursens mästerskapskapitel sammanfattar läsningen i rader att bära med sig: (1) VÄRLDEN — är bolaget bulk eller special (marginalens båda ursprung: råvaruskäl eller vallgrav)? (2) FLASKHALSEN — kväve (energiräkning) eller fosfor (geologi) — och vem äger den? (3) KOSTNADSKURVAN — var sitter bolaget på trappan mot högkostnadspartnern, och vad tjänar partnern vid dagens pris? (4) SCENARIOT — vad händer vid gas 4, 8 och 12 (tre färdiga kolumner, ingen fantasi krävs)? (5) CYKELN — var i lager- och kapacitetscykeln står sektorn, och vem betalar svängen? Varje rad mäts med en division och två uppslag i rapporten — och ingen rad säger något om vad en läsare bör äga: sektorkunskapen är hur marknaden mäter, inte vad den bör köpa.\n\nI kategorin sektoranalys finns ${seAntal} kurser — kemisektorn (${se21 ? se21.niva.toLowerCase() + " nivå" : "i registret"}) sluter den nordiska familjen: metodkursen, skogen, rederiet, försäkringen, gruvan — och nu den nedströms grannen som för deras råvaror vidare till matens kemi. Som alltid: detta är utbildning i en metod — inga placeringstips.` +
          kallradFler(kallor),
        amne: "kemisektorn",
        kalla: k,
        kallor,
        handlings: [
          { text: "Kursen: Kemisektorn", lank: "/kurser/se-21-kemisektorn", ikon: "⚗️", beskrivning: "Kväve ur luft, fosfor ur berg — molekylens ekonomi" },
          { text: "Kursen: Sektoranalysens metod", lank: "/kurser/se-16-sektoranalysens-metod", ikon: "🧭", beskrivning: "Tre frågor till varje bransch" },
          { text: "Kursen: Scenarioanalys", lank: "/kurser/km-029-scenarioanalys", ikon: "📊", beskrivning: "Gas 4/8/12 — tre färdiga kolumner" },
          { text: "Kursen: Marginaltrappan", lank: "/kurser/ln-03-marginaltrappan-och-operativ-havstavng", ikon: "🪜", beskrivning: "Bruttomarginalen som råvaruskäl" },
          { text: "Vad är en moat?", lank: "fragor:" + encodeURIComponent("vad är en moat?"), ikon: "🏰", beskrivning: "Vallgraven — specialkemins läsning" },
          { text: "Vad är en moat i siffror?", lank: "fragor:" + encodeURIComponent("vad är en moat i siffror?"), ikon: "🔢", beskrivning: "Vallgraven mätt — grannkursens verktyg" },
        ],
        motfraga: { text: "Vad är en moat?", kategori: "kemisektor" },
        fordjupa: { text: k.titel, lank: "/kurser/se-21-kemisektorn" },
      };
    },
  },
];

// ── Huvudingången ──────────────────────────────────────────────────────────

/**
 * Svara lokalt med kemisektor-mönstret — eller null (då har hela kedjan
 * före redan lämnat null och API-flödet tar över som förr). Ligger efter
 * handelsemotor och FÖRE marknadsrytm i widgetens kedja och kan därför aldrig
 * stjäla en fråga från ett tidigare lager; det fångar bara frågor som alla
 * lager före det lämnar null på. Samma matchningssemantik som basmotorn:
 * minst ett kärnord krävs, poäng = kärnord × 3 + stärkord, oavgjort → först
 * deklarerade mönstret vinner (strikt >, deterministiskt). Samma fråga ⇒
 * bitidentiskt svar.
 */
export function svaraLokaltKemisektor(fraga: string, register: RegisterRad[]): LokaltSvar | null {
  const fragaStr = diafri(fraga);
  if (!fragaStr) return null;
  const fragaOrd = fragaStr.split(" ");
  let bast: { svar: LokaltSvar; poang: number } | null = null;
  for (const m of KEMISEKTOR_MONSTER) {
    const karnTraff = m.karnord.filter((nk) => traff(fragaOrd, fragaStr, nk));
    if (karnTraff.length === 0) continue; // krav: minst ett kärnord
    const starkTraff = m.starkord?.filter((nk) => traff(fragaOrd, fragaStr, nk)) ?? [];
    const poang = karnTraff.length * 3 + starkTraff.length;
    if (!bast || poang > bast.poang) bast = { svar: m.bygga(register), poang };
  }
  return bast ? bast.svar : null;
}
