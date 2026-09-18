/**
 * AI-MENTORN 2.0 — KREDITDJUP-FÖRHANDSFRÅGOR (spår 6, omgång 18, s6-u2,
 * manifest auto-s6-1789724700618).
 *
 * Två ytterligare källmärkta förhandsfrågor ovanpå de trettiosex committade
 * lagren (104 monsters) — kedjans PRIS-PÅ-KREDIT-frågor, som hela kedjan
 * lämnar null på:
 *   1. Kreditpremien (ma-05 primär + ma-03 + ks-03 + st-04) — varför bolagets
 *      lån kostar mer än statens: spreaden som en kurs, premien som priset på
 *      förväntad förlust, termometern och kronprislappen. ma-05 var
 *      MAKROEKONOMI & RÄNTA:S ENDA mentorväglösa kurs (1 av 10) — detta lager
 *      aktiverar den (221 → 222 nådda kurser).
 *   2. Kreditrating och covenanter (ks-05 primär + ma-05 + st-05 + ks-03) —
 *      betygstrappan (investment grade/high yield-gränsen, fallen angels),
 *      trösklarnas aritmetik och betygets prislapp i kronor. ks-05 var
 *      KAPITALSTRUKTUR-kategorins mentorväglösa kurs — aktiveras här.
 *
 * Lagernamnet är berättelsen: båda monsters svarar på VAD KREDIT KOSTAR och
 * VAD SOM BESTÄMMER PRISET — premien är själva spreaden, ratingen det betyg
 * som (delvis) sätter den.
 *
 * ÄMNESVAL EFTER SOND (verktyg/_s6u2-sond-omg18.mjs, otrackad diskbevis:
 * 36 motorer, 104 monsters, LIVE-lästa med den riktiga matcharn): hela
 * kreditpris-familjen var NULL genom kedjan ("vad är kreditpremien?" ·
 * "vad är kreditspread?" · "hur räknas kreditpremien?" · "vad är
 * kreditriskpremie?" · "vad är kreditrating?" · "vad är en rating?" ·
 * "vad är kreditbetyg?" · "vad är investment grade?" · "vad är high
 * yield?" · "vad är fallen angels?" · "vad är en ratingnedgång?" ·
 * "vad är företagsobligationer?" · "vad är kreditvärdighet?" · "vad är
 * kreditrisk?").
 *
 * ANSVARSFÖRDELNING (syskinlagrens dokumentationsplikt; emission/V19-
 * precedensen — källägande ≠ kärnordsägande; samtliga gränser SONDERADE):
 *   • Makro äger obligation/statsobligations-familjen och ränteorden —
 *     sondbevis: "vad är en obligation?", "vad är statsobligationer?",
 *     "betyg på obligationer?", "högavkastande obligationer?" och "spread
 *     över statsobligationer?" FÅNGAS ALLA av makro. Detta lager bär ENBART
 *     sammansättningarna (företagsobligation; "högavkastande" är här
 *     STARKORD, aldrig kärnord — frågor som bara bär det ordet lämnas åt
 *     makro enligt kedjeordningen); naket "obligation" är som mest starkord.
 *   • Basen äger naket "spread" och "z-spread" (sondbevis: "vad är
 *     spread?" → bas/aktiemarknaden) — här bär endast kreditspread-
 *     sammansättningarna.
 *   • Riskdjupet äger covenants/löptid/refinansiering solo (sondbevis:
 *     "vad är covenants?" → riskdjup/skuldfalla) — ks-05:s covanter-titel
 *     länkas som KÄLLA här; frågor med bara covenant-orden lämnas åt
 *     riskdjupet (kedjan kör det FÖRE detta lager).
 *   • Avkastningskurvan äger kurvorden; stabilitetsdjupet känslighet/
 *     stresstest; kapitalbindningen rörelsekapital-familjen.
 *   • Dokumenterad fribit (EJ detta lagers): "vad är riskpremien?" /
 *     "aktieriskpremien?" är NULL men tillhör avkastningsdjupets
 *     territorium — lämnas åt framtida lager.
 *
 * Matchningen speglar motorns hjälpfunktioner (samma lösning som alla
 * syskinlager: Node type-stripping löser endast `import type`, så de rena
 * funktionerna speglas hit). Semantisk likhet med motorn BEVISAS av testets
 * felstavningsfall (B) och determinismfall (C). Driftvarning: ändras
 * motorns matchning måste denna spegel följa — testfall B vaktar.
 *
 * SAMMANSÄTTNING (chat-widget.tsx):
 *   svaraLokaltMakro ?? … ?? svaraLokaltPortfoljpraktik
 *   ?? svaraLokaltKreditdjup
 * Detta lager levererades SIST och kan därför aldrig stjäla en fråga från
 * ett tidigare lager; det fångar bara frågor som alla 36 lager före det
 * lämnar null på. Omvänt vaktar testfall I på att dessa frågor INTE fångas
 * av kedjan utan detta lager (dupliceringsskydd).
 *
 * ── JURIDIKGRINDEN (lagen 2007:528) ──────────────────────────────────
 * All text är pedagogisk utbildning om hur kreditpremien och kreditratingen
 * DEFINIERAS och RÄKNAS som metod — inga köp-/säljsignaler, inga
 * placerings-tips, inga omdömen om enskilda bolag, värdepapper eller dagens
 * kreditmarknad. Aritmetiken illustrerar mekaniken med kursfilernas egna
 * påhittade exempel (staten 2,0 % mot bolaget 3,5 % · 1 000-kronorslånet
 * med 35 kronors kupong · skulden 2 000,0 miljoner med 30,0 miljoners
 * premie · räntetäckningen 900/180 = 5,0× mot tröskeln 3,0× · betygs-
 * prislappen 3,25 % = 130,0 miljoner mot 7,00 % = 280,0 miljoner) — aldrig
 * utfästelser om den verkliga kreditmarknaden eller något verkligt bolag.
 *
 * ── DEPENDENCY-INJECTION (samma mönster som hela motorn) ─────────────
 * Registret skickas IN som parameter (endast `import type`) så att
 * verktyg/testa-ai-mentor-kreditdjup.mjs kan köra filen direkt i Node.
 * Alla källkurser (ma-05-kreditpremien, ma-03-realrantan, ks-03-skuldens-
 * anatomi, st-04-stabilitet-genom-kreditcykeln, ks-05-covenanter-och-
 * kreditbetyg, st-05-refinansieringsmuren) finns i KURSREGISTER (verifierat
 * mot levande register; kursKalla faller tillbaka på "Läroplanen" om ett
 * framtido register läcker en slug).
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

// ── De 2 kreditdjupfrågorna ─────────────────────────────────────────────────

export const KREDITDJUP_MONSTER: FragMonster[] = [
  {
    id: "kreditpremien",
    karnord: [
      "kreditpremie", "kreditpremien",
      "kreditpremier", "kreditpremierna",
      "kreditspread", "kreditspreaden",
      "kreditspreadar", "kreditspreadarna",
      "kreditriskpremie", "kreditriskpremien",
    ],
    starkord: [
      "premie", "premien", "spread", "lån", "lånet", "låna",
      "bolag", "bolagets", "bolagens", "ränta", "räntor",
      "stat", "statens", "riskfri", "riskfria", "kostnad",
      "kostar", "kronor", "miljoner", "procent", "procentenheter",
      "förlust", "skyddar", "kredit", "krediten", "skillnad",
      "termometer", "historiskt", "läge", "läget", "dyr",
      "billig", "priset", "pris",
    ],
    bygga: (reg) => {
      const maAntal = reg.filter((r) => r.kategori === "MAKROEKONOMI & RÄNTA").length;
      const kallor = [
        kursKalla(reg, "ma-05-kreditpremien", "Läroplanen — MAKROEKONOMI & RÄNTA: varför bolagets lån kostar mer än statens"),
        kursKalla(reg, "ma-03-realrantan", "Läroplanen — MAKROEKONOMI & RÄNTA: den riskfria basen premien mäts över"),
        kursKalla(reg, "ks-03-skuldens-anatomi", "Läroplanen — KAPITALSTRUKTUR: instrumenten som bär premien"),
        kursKalla(reg, "st-04-stabilitet-genom-kreditcykeln", "Läroplanen — STABILITET: fönstret premien lever i"),
      ];
      const k = kallor[0];
      const ma5 = reg.find((r) => r.slug === "ma-05-kreditpremien");
      return {
        text:
          `Kreditpremien är skillnaden mellan vad staten och ett bolag betalar för att låna — och den är en kurs, inte ett pris. Kursens genomgående exempel (påhittat): staten lånar till 2,0 procent, bolaget till 3,5 — skillnaden 1,5 procentenheter är bolagets kreditspread. Samma marknad, samma dag, två olika priser: frågan varför är ämnets hela kärna, och svaret är att premien är priset på risk som kan händer (och händer). Allt nedan är utbildning i läsmetoden — inga omdömen om något enskilt bolag eller dagens kreditmarknad:\n\n1️⃣ VAD PREMIEN SKYDDAR MOT — den förväntade förlusten. Kursens räkneläxa (påhittad): ett lån på 1 000 kronor till 3,5 procent betalar 35 kronor om året; det riskfria alternativet ger 20. Skillnaden — 15 kronor — är premien, och den är inte ett straff utan en försäkring: långivaren tar bolagets orden på att pengarna kommer tillbaka, och premien är priset på det löftet. Sprider risken över många lån blir de 15 kronorna en statistiskt förväntad förlust — premien skyddar mot just den.\n2️⃣ TERMOMETERN — spreadens läge och rörelse läsens som en temperatur, inte ett omdöme: samma bolag kan bära 0,8 procentenheter i det ena läget och 3,5 i ett annat — med oförändrad verksamhet. LÄGET mäts mot bolagets egen historia (är spreaden vid sitt normala band eller utanför?), RÖRELSEN läses över månader (en stigande spread säger något om marknadens prislapp på risken — en fallande det omvända). Det är därför kursen kallar spreaden en termometer: den mäter, den dömer inte.\n3️⃣ KRONPRISLAPPEN — från procent till miljoner. Skulden 2 000,0 miljoner till 3,5 procent kostar 70,0 miljoner om året; till det riskfria 2,0 procent hade samma skuld kostat 40,0. Premien i kronor: 30,0 miljoner per år. Och breds spreaden från 1,5 till 3,0 procentenheter stiger räntekostnaden med ytterligare 30,0 miljoner — till 100,0 — utan att bolaget lånat en krona mer. Fönstret som öppnar och stänger dessa priser är kreditcykeln (st-04); instrumenten som bär dem — obligationer, banklån, ramar — är skuldens anatomi (ks-03). Mästerskapet är kursens fem frågor till varje spread: vad är läget? vad är rörelsen? vad skyddar premien mot? vad kostar den bolaget i kronor? och var finns talen att läsa?\n\nI kategorin makroekonomi & ränta finns ${maAntal} kurser — kreditpremien (${ma5 ? ma5.minuter + " min, " + ma5.niva.toLowerCase() + " nivå" : "i registret"}) är ämnets nybörjarkurs och kategorins språklära. Som alltid: detta är utbildning i en metod — inga placeringstips och ingen prognos om den verkliga kreditmarknaden.` +
          kallradFler(kallor),
        amne: "kreditpremien",
        kalla: k,
        kallor,
        handlings: [
          { text: "Kursen: Kreditpremien", lank: "/kurser/ma-05-kreditpremien", ikon: "📐", beskrivning: "Varför bolagets lån kostar mer än statens" },
          { text: "Kursen: Realräntan", lank: "/kurser/ma-03-realrantan", ikon: "🧮", beskrivning: "Den riskfria basen premien mäts över" },
          { text: "Kursen: Skuldens anatomi", lank: "/kurser/ks-03-skuldens-anatomi", ikon: "🔬", beskrivning: "Instrumenten som bär premien" },
          { text: "Vad är covenants?", lank: "fragor:" + encodeURIComponent("vad är covenants?"), ikon: "📜", beskrivning: "Skuldens spelregler — riskdjupet" },
        ],
        motfraga: { text: "Vad är covenants?", kategori: "stabilitet" },
        fordjupa: { text: k.titel, lank: "/kurser/ma-05-kreditpremien" },
      };
    },
  },
  {
    id: "kreditrating",
    karnord: [
      "kreditrating", "kreditratingen",
      "rating", "ratingen",
      "kreditbetyg", "kreditbetyget", "kreditbetygen",
      "betygstrappa", "betygstrappan",
      "investment grade",
      "high yield",
      "fallen angel", "fallen angels",
      "ratingnedgång", "ratingnedgången",
      "ratinguppgradering",
      "kreditvärdighet", "kreditvärdigheten",
      "kreditrisk", "kreditrisken",
      "företagsobligation", "företagsobligationen",
      "företagsobligationer",
    ],
    starkord: [
      "betyg", "betyget", "trappa", "trappan", "trappsteg",
      "högavkastande", "nedgradering", "uppgradering", "nedgång", "utrymme",
      "tröskel", "trösklar", "räntetäckning", "täckningsgrad",
      "prislapp", "pris", "kostnad", "miljoner", "obligation",
      "obligationer", "spread", "premie", "lån", "skuld",
      "långivare", "bedömer", "mäta", "mäter",
    ],
    bygga: (reg) => {
      const ksAntal = reg.filter((r) => r.kategori === "KAPITALSTRUKTUR").length;
      const kallor = [
        kursKalla(reg, "ks-05-covenanter-och-kreditbetyg", "Läroplanen — KAPITALSTRUKTUR: skuldens spelregler och prislapp"),
        kursKalla(reg, "ma-05-kreditpremien", "Läroplanen — MAKROEKONOMI & RÄNTA: betygets pris i spreaden"),
        kursKalla(reg, "st-05-refinansieringsmuren", "Läroplanen — STABILITET: vad en nedgång möter i förfallokalendern"),
        kursKalla(reg, "ks-03-skuldens-anatomi", "Läroplanen — KAPITALSTRUKTUR: betygens plats bland skuldens mått"),
      ];
      const k = kallor[0];
      const ks5 = reg.find((r) => r.slug === "ks-05-covenanter-och-kreditbetyg");
      return {
        text:
          `Kreditrating är tredjeparts betyg på en låntagares kreditvärdighet — en trappa från sämsta goda fin (kursspråket: AAA i toppen) ner mot betyg för skuld som redan brutit sina löften. Trappans viktigaste gräns går mellan INVESTMENT GRADE (de övre stegen) och HIGH YIELD (de undre — på svenska högavkastande, ett ärligare ord är högräntande); ett bolag som faller över gränsen kallas en fallen angel, och fallet är ingen etikett utan en prislapp. Allt nedan är utbildning i läsmetoden — inga omdömen om något enskilt bolag:\n\n1️⃣ BETYGENS TVÅ SPRÅK — stegen skrivs i bokstäver (AAA · AA · A · BBB …) eller i delat betyg med emellan-steg — och den viktigaste läsningen är inte nivån utan AVGÅNGEN: betygsinstituten skriver historia (protokollet över vad som hänt), inte framtid (vad som kommer hända). En ratingnedgång är en bekräftelse som ofta kommer efter att marknaden redan prissatt förändringen — spreaden (ma-05) rör sig FÖRE trappan.\n2️⃣ TRÖSKLARNA OCH MÄTÖGONBLICKEN — betyget lever bredvid lånets spelregler, covenants, och deras trösklar. Kursens aritmetik (påhittad): rörelseresultat 900,0 miljoner mot räntekostnad 180,0 ger räntetäckningen 900,0 ÷ 180,0 = 5,0×. Lånet kräver minst 3,0× — resultatet får alltså sjunka till 3,0 × 180,0 = 540,0 miljoner, ett utrymme på 360,0 miljoner, innan tröskeln nuddas. Två fällor att vägra: mätögonblicket (tröskeln läses vid definierade tillfällen, inte varje dag) och trappans tomrum (ett bolag kan stå bredvid tröskeln i åratal — avståndet är utrymmet, inte säkerheten).\n3️⃣ BETYGETS PRISLAPP I KRONOR — samma skuld, två betyg, två kostnader. Skulden 4 000,0 miljoner: vid spreaden 1,25 procentenheter över det riskfria 2,0 procent blir räntan 3,25 procent = 130,0 miljoner om året; efter en nedgradering som ger 7,00 procent blir samma skuld 280,0 miljoner — skillnaden 150,0 miljoner per år är betygets prislapp, mer än hela årsbudgeten för många bolags avdelningar. Och här möter trappan kalendern (st-05): en nedgång som träffar en förfalloklunga slår dubbelt — högre prislapp SAMTIDIGT som skulden måste rullas. Betyget är därför en INGÅNG till analysen, aldrig dess slut: läs trappan med förfallotabellen och kassflödet bredvid.\n\nI kategorin kapitalstruktur finns ${ksAntal} kurser — covenanter och kreditbetyg (${ks5 ? ks5.minuter + " min, " + ks5.niva.toLowerCase() + " nivå" : "i registret"}) äger spelreglerna och prislappen. Som alltid: detta är utbildning i en metod — inga placeringstips.` +
          kallradFler(kallor),
        amne: "kreditrating",
        kalla: k,
        kallor,
        handlings: [
          { text: "Kursen: Covenanter och kreditbetyg", lank: "/kurser/ks-05-covenanter-och-kreditbetyg", ikon: "📜", beskrivning: "Skuldens spelregler och prislapp" },
          { text: "Kursen: Kreditpremien", lank: "/kurser/ma-05-kreditpremien", ikon: "📐", beskrivning: "Betygets pris i spreaden" },
          { text: "Kursen: Refinansieringsmuren", lank: "/kurser/st-05-refinansieringsmuren", ikon: "🧱", beskrivning: "När nedgången möter förfallokalendern" },
          { text: "Vad är kreditpremien?", lank: "fragor:" + encodeURIComponent("vad är kreditpremien?"), ikon: "🌡️", beskrivning: "Spreaden som termometer — detta lager" },
        ],
        motfraga: { text: "Vad är refinansieringsmuren?", kategori: "stabilitet" },
        fordjupa: { text: k.titel, lank: "/kurser/ks-05-covenanter-och-kreditbetyg" },
      };
    },
  },
];

// ── Huvudingången ──────────────────────────────────────────────────────────

/**
 * Svara lokalt med NÅGOT av de två kreditdjup-mönstren — eller null
 * (då har hela kedjan före redan lämnat null och API-flödet tar över som
 * förr). Ligger SIST i widgetens kedja och kan därför aldrig stjäla en
 * fråga från tidigare lager. Samma matchningssemantik som basmotorn:
 * minst ett kärnord krävs, poäng = kärnord × 3 + stärkord, oavgjort →
 * först deklarerade mönstret vinner (strikt >, deterministiskt). Samma
 * fråga ⇒ bitidentiskt svar.
 */
export function svaraLokaltKreditdjup(fraga: string, register: RegisterRad[]): LokaltSvar | null {
  const fragaStr = diafri(fraga);
  if (!fragaStr) return null;
  const fragaOrd = fragaStr.split(" ");
  let bast: { svar: LokaltSvar; poang: number } | null = null;
  for (const m of KREDITDJUP_MONSTER) {
    const karnTraff = m.karnord.filter((nk) => traff(fragaOrd, fragaStr, nk));
    if (karnTraff.length === 0) continue; // krav: minst ett kärnord
    const starkTraff = m.starkord?.filter((nk) => traff(fragaOrd, fragaStr, nk)) ?? [];
    const poang = karnTraff.length * 3 + starkTraff.length;
    if (!bast || poang > bast.poang) bast = { svar: m.bygga(register), poang };
  }
  return bast ? bast.svar : null;
}
