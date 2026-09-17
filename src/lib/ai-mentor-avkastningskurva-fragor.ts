/**
 * AI-MENTORN 2.0 — AVKASTNINGSKURVE-FÖRHANDSFRÅGA (spår 6, omgång 15, s6-u1).
 *
 * EN ytterligare källmärkt förhandsfråga ovanpå de 27 tidigare lagren
 * (basens MONSTER i ai-mentor-svar.ts + makro, extra, nästa, kapitalmekanik,
 * sektor, case, praktik, portföljgrund, ägande, redovisningsdjup, djup,
 * historia, lonsamhetsdjup, tsdjup, skattedjup, beteendedjup, riskdjup,
 * riskmåttsdjup, utdelningsdjup, förväntningsdjup, portföljbalans,
 * stabilitetsdjup, grahamgolv, varderjustering, optionsdjup och
 * riskläsningsdjup):
 *   1. Den omvända avkastningskurvan (mk-08-omvand-yield-curve primär +
 *      mk-06-penningpolitik + mk-01-bnp-och-tillvaxt + ma-01-
 *      transmissionsmekaniken) — kurvan som kartlägger statens
 *      lånekostnader över löptiderna, normallutningen, inversionens
 *      tecken och signalen, med tre läsfällor
 *
 * ÄMNESVAL EFTER KOLLISIONSKONTROLL (kedjeprober genom samtliga 27 lager
 * LIVE med den riktiga matchern; verktyg/_s6u1-sond-omg15.mjs):
 * "vad är den omvända avkastningskurvan?", "vad är yield curve?",
 * "vad är en inverterad yield curve?", "vad är räntekurvan?" och "vad
 * betyder det när kurvan inverteras?" är HELT fria (NULL genom hela
 * kedjan). ÄMNESLUCKA: mk-08-omvand-yield-curve, mk-06-penningpolitik
 * och mk-01-bnp-och-tillvaxt nås av INGEN mentorväg (sondens länkräkning
 * över samtliga monsters handlings/fordjupa/kalla/kallor) — detta lager
 * aktiverar tre olänkade kurser (spårets "fler kurslänkar per svar");
 * kategorin MAKROEKONOMI bar 9 av 11 kurser olänkade före leveransen.
 *
 * ANSVARSFÖRDELNING (V19-precedensen — kärnordsägande är territoriellt;
 * syskonlagrens dokumentationsplikt, testfall G/G2/H/I bevisar båda
 * vägarna):
 *   • Makro-lagret äger RÄNTEORDEN — sondbevis: "vad är styrräntan?",
 *     "vad är ränta?", "varför sjunker långa räntor?", "vad är
 *     penningpolitik?" och "vad är en statsobligation?" fångas av makro
 *     (deras kärnord ränta/styrränta/penningpolitik/obligation). Detta
 *     lager äger ENDAST SAMMANSATTA KURVORD: avkastningskurva/
 *     räntekurva (med böjningar), yield curve-kurvfrasen och
 *     kurvinverteringsfamiljen — orden deras uppslag saknar.
 *   • CAPE/CAPE-fälle-klassen (varderjustering-lagrets dokumenterade
 *     fälla, omgång 14): nakna "inverterad"/"invertering" (9–11 tkn)
 *     ligger redigeringstavstånd 1–2 från "investerad"/"investering" —
 *     ett naket sådant ord som kärnord hade antingen stulit
 *     investeringsfrågor till kurvesvaret eller tvärtom. Därför: nakna
 *     inverter-ord är ENDAST starkord här (kan aldrig fånga en fråga
 *     ensamma), kärnorden är kurvsammansättningar och flerordsfraser.
 *     Testfall B15 vaktar fällan permanent i båda riktningarna.
 *   • Basens aktiemarknads-monster äger naket "spread" (sondbevis:
 *     "vad är spreaden?" ⇒ basen) — spread är läsord i texten och
 *     starkord här, aldrig kärnord.
 *   • Riskdjup-lagret äger "löptid" (sondbevis: "vad är löptid?" ⇒
 *     skuldfallan) — löptid är starkord här, aldrig kärnord.
 *   • Redovisningsdjupets STARKORD "kurva" (avskrivningsmonstret) kan
 *     aldrig stjäla en fråga (starkord ger poäng först efter
 *     kärnordsträff i det egna monstret); naket "kurva"/"kurvan" är
 *     därför STARKORD även här — frågor med naket kurvord utan
 *     kärnordskurva lämnas till kedjan, exakt som sonden visar.
 *
 * SIDOLEVERANS I SAMMA FÖNSTER (regressionstest-fyndet): basotestets E01
 * var RÖTT (inbakat register 401 · byggt 402 — vr-04-rebaken i spår 5
 * nådde aldrig ai-mentor-register.ts). Registret rebakades till 402 i
 * denna leverans; testa-ai-mentor.mjs 26/26 grönt. Notering för framtida
 * omgångar: spår 5:s kursinsert KAN glömma mentorsregistret — basotestet
 * E01 är grinden som fångar det (körningen ovan är beviset).
 *
 * DOKUMENTERAD RISK (accepterad, samma bokföring som syskonlagren): mk-
 * kurserna saknar minuter i registret (minuten undefined — källdatan har
 * inga totalMinutes för dem) — svarets kursfakta använder KAPITELTALET
 * registerdrivet i stället (testfall D02 vaktar "undefined"-läckan
 * mekaniskt; mk-08/mk-06/mk-01/ma-01 bär alla 6 kapitel).
 *
 * Matchningen speglar motorns hjälpfunktioner (samma lösning som alla
 * syskonlagren: Node type-stripping löser endast `import type`, så de rena
 * funktionerna speglas hit). Semantisk likhet med motorn BEVISAS av
 * testets felstavningfall (B) och determinismfall (C). Driftvarning:
 * ändras motorns matchning måste denna spegel följa — testfall B vaktar.
 *
 * SAMMANSÄTTNING (chat-widget.tsx):
 *   svaraLokaltMakro(q, KURSREGISTER)
 *     ?? … (kedjans 27 lager, se widgeten) …
 *     ?? svaraLokaltRisklasningsdjup(q, KURSREGISTER)
 *     ?? svaraLokaltAvkastningskurva(q, KURSREGISTER)
 * Detta lager ligger SIST i kedjan och kan därför ALDRIG stjäla en fråga
 * från tidigare lager — det fångar bara frågor som alla andra lämnar null
 * på. Omvänt vaktar testfall I på att den kanoniska frågan INTE fångas av
 * kedjan utan detta lager (dupliceringsskydd).
 *
 * ── JURIDIKGRINDEN (lagen 2007:528) ──────────────────────────────────
 * All text är pedagogisk utbildning om hur kurvan läses och vad
 * historisk samvariation betytt — inga placeringstips, inga
 * marknadsprognoser, inga omdömen om nuläget. Talen är aritmetiska
 * illustrationer med påhittade nivåer (2,0 % / 4,0 % osv.), aldrig
 * utfästelser om faktiska framtida räntor eller konjunkturer; den
 * historiska genomgången är bokförd med sina osäkerheter (ledtid,
 * falska signaler) i själva texten.
 *
 * ── DEPENDENCY-INJECTION (samma mönster som hela motorn) ─────────────
 * Registret skickas IN som parameter (endast `import type`) så att
 * verktyg/testa-ai-mentor-avkastningskurva.mjs kan köra filen direkt i
 * Node. Alla källkurser (mk-08-omvand-yield-curve, mk-06-penningpolitik,
 * mk-01-bnp-och-tillvaxt, ma-01-transmissionsmekaniken) finns i
 * KURSREGISTER (verifierat i 402-registret — spår 5:s rebake lägger TILL
 * kurser, slugarna består; kursKalla faller tillbaka på "Läroplanen" om
 * ett framtida register läcker en slug).
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

// ── Den 1 avkastningskurvefrågan ────────────────────────────────────────────

export const AVKASTNINGSKURVA_MONSTER: FragMonster[] = [
  {
    id: "avkastningskurva",
    karnord: [
      // Svenska sammansättningar (samtliga ≥ 10 tkn — granngaranti mot alla
      // tidigare lagers kärnord verifierad av sonden + testfall J):
      "avkastningskurva", "avkastningskurvan", "avkastningskurvor",
      "räntekurva", "räntekurvan", "räntekurvor",
      "kurvinvertering", "kurvinverteringen", "kurvinverterad", "kurvinverterade",
      // Flerordsfraser (matches med includes — täcker omvänd/inverterad +
      // kurva-kombinationer utan att röra nakna invester-/inverter-ord):
      "yield curve", "omvänd avkastningskurva", "omvänd räntekurva",
      "inverterad avkastningskurva", "inverterad räntekurva",
      "när kurvan inverteras", "kurvan inverterad", "är kurvan inverterad",
    ],
    starkord: [
      // Nakna inverter-ord är MEDVETET bara starkord (cape/case-klassen):
      // "inverterad"/"invertering" ligger tavstånd 1–2 från "investerad"/
      // "investering" och får aldrig fånga en fråga på egen hand.
      "inverterad", "inverterade", "invertering", "inverteras", "invertering",
      "kurva", "kurvan", "kurvor", "ränta", "räntor", "obligation",
      "statsobligation", "löptid", "tio år", "recession", "konjunktur",
      "procentenhet", "spread", "signal",
    ],
    bygga: (reg) => {
      const mkAntal = reg.filter((r) => r.kategori === "MAKROEKONOMI").length;
      const maAntal = reg.filter((r) => r.kategori === "MAKROEKONOMI & RÄNTA").length;
      const kallor = [
        kursKalla(reg, "mk-08-omvand-yield-curve", "Läroplanen — makroekonomi: kurvans anatomi och signalvärde"),
        kursKalla(reg, "mk-06-penningpolitik", "Läroplanen — makroekonomi: styrräntan och marknadens spelrum"),
        kursKalla(reg, "ma-01-transmissionsmekaniken", "Läroplanen — makroekonomi & ränta: från styrränta till bolaget"),
        kursKalla(reg, "mk-01-bnp-och-tillvaxt", "Läroplanen — makroekonomi: konjunkturens eget mått"),
      ];
      const k = kallor[0];
      const mk08 = reg.find((r) => r.slug === "mk-08-omvand-yield-curve");
      const mk06 = reg.find((r) => r.slug === "mk-06-penningpolitik");
      const mk01 = reg.find((r) => r.slug === "mk-01-bnp-och-tillvaxt");
      return {
        text:
          `Avkastningskurvan (räntekurvan, engelskans yield curve — tre namn, samma sak) är en kartbild över vad staten betalar för att låna pengar vid olika löptider: rita varje statsläns årliga avkastning från kortast (till exempel tre månader) till längst (tio år) och kurvan är linjen genom punkterna. Tre byggen bär hela läsningen (allt nedan är utbildning i hur kurvan läses — inga placeringstips och inga prognoser om dagens läge):\n\n1️⃣ NORMALLUTNINGEN OCH VARFÖR DEN FINNS — den normala kurvan lutar uppåt: ett påhittat exempel med tre månader till 2,0 %, två år till 2,5 %, fem år till 3,0 % och tio år till 3,5 %. Lutningen betalas som ersättning: den som låser sina pengar i tio år bär mer osäkerhet (framtida inflation, oförutsedda behov av kassan) och kräver mer än den som lånar ut i tre månader — i exemplet 3,5 − 2,0 = 1,5 procentenheter. Att den korta räntan är LÄGST är kurvans normala vila.\n2️⃣ INVERSIONEN OCH TECKNET — ibland vänder kurvan: de korta lånen betalar MER än de långa. Samma spelplan med tre månader till 4,0 % och tio år till 3,0 %: skillnaden mellan tio år och tre månader blir 3,0 − 4,0 = −1,0 procentenhet, och minustecknet är själva anomalibeteckningen — som om banken betalade högre ränta på sparkontot i tre månader än på bindningen i tio år. Inverterad kurva, omvänd kurva och negativ lutning är samma fynd i tre språkdräkter.\n3️⃣ SIGNALVERKET — varför marknaden bryr sig. Den korta räntan styrs direkt av centralbankens styrränta; den långa tioårsräntan är marknadens sammanvägda bud på hur de korta räntorna KOMMER ATT BLI under tio år, plus en premie för själva låsningen. En inverterad kurva är därför marknadens bud: dagens höga räntor är tillfälliga, sänkningar väntas framöver — och centralbanker sänker främst när konjunkturen sviktar. Kurvan är inte en enskild prognosmakare utan tusentals köpares och säljares samlade förväntning, tryckt i priser. Därtill en mekanisk förstärkning: bankernas grundaffär är att låna kort och utlåna långt, och när mellanskillnaden försvinner kläms marginalen — kreditgivningen stramas åt och bromsar ekonomin ytterligare. Ärligheten om historien hör till läsningen: i amerikanska data sedan 1950-talet har i princip varje recession föregåtts av en inverterad kurva, men ledtiden har varierat (ungefär ett halvt till två år) och minst en inversion har kommit utan att någon recession följde — kurvan är en termometer, inte en klocka.\n4️⃣ TRE LÄSFÄLLOR — (a) LEDTIDSFÄLLAN: signalen säger "någon gång", inte "nu"; att tolka inversionen som en tajmingklocka är det klassiska misstaget. (b) MÅTTFÄLLAN: vilka löptider som jämförs ändrar bilden — tre månader mot tio år, två år mot tio år eller hela kurvan ger inte alltid samma tecken; ange alltid paret. (c) ORSAKSFÄLLAN: kurvan ORSAKAR inte en recession genom sig själv — den samlar förväntningar, och den mekaniska kanalen är bankernas klämda marginal, inte en trolig spådom.\n\nI kategorin makroekonomi finns ${mkAntal} kurser och i makroekonomi & ränta ${maAntal} — kurvan själv (${mk08 ? mk08.kapitel + " kapitel" : "i registret"}), penningpolitiken (${mk06 ? mk06.kapitel + " kapitel" : "i registret"}) och BNP-tillväxten (${mk01 ? mk01.kapitel + " kapitel" : "i registret"}) är de närmaste grannarna, och transmissionsmekanismen binder kurvan till bolagets egen värld. Som alltid: detta är utbildning i att läsa en marknadsbild — ingen kommentar om nuläget och inga placeringstips.` +
          kallradFler(kallor),
        amne: "avkastningskurva",
        kalla: k,
        kallor,
        handlings: [
          { text: "Kursen: Omvänd yield curve", lank: "/kurser/mk-08-omvand-yield-curve", ikon: "📉", beskrivning: "Kurvans anatomi och signalvärde" },
          { text: "Kursen: Penningpolitik — QE och QT", lank: "/kurser/mk-06-penningpolitik", ikon: "🏦", beskrivning: "Styrräntan och marknadens spelrum" },
          { text: "Kursen: Transmissionsmekaniken", lank: "/kurser/ma-01-transmissionsmekaniken", ikon: "🔗", beskrivning: "Från styrränta till bolagets resultat" },
          { text: "Kursen: BNP och tillväxt", lank: "/kurser/mk-01-bnp-och-tillvaxt", ikon: "📊", beskrivning: "Konjunkturens eget mått" },
          { text: "Vad är styrräntan?", lank: "fragor:" + encodeURIComponent("vad är styrräntan?"), ikon: "🪞", beskrivning: "Makro-lagrets grundord — ett tidigare lager" },
        ],
        motfraga: { text: "Vad är penningpolitik?", kategori: "makro" },
        fordjupa: { text: k.titel, lank: "/kurser/mk-08-omvand-yield-curve" },
      };
    },
  },
];

// ── Huvudingången ──────────────────────────────────────────────────────────

/**
 * Svara lokalt med NÅGOT av avkastningskurve-mönstren — eller null
 * (då har hela kedjan före redan lämnat null och API-flödet tar över som
 * förr). Ligger SIST i widgetens kedja och kan därför aldrig stjäla en
 * fråga från tidigare lager. Samma matchningssemantik som basmotorn:
 * minst ett kärnord krävs, poäng = kärnord × 3 + stärkord, oavgjort →
 * först deklarerade mönstret vinner (strikt >, deterministiskt). Samma
 * fråga ⇒ bitidentiskt svar.
 */
export function svaraLokaltAvkastningskurva(fraga: string, register: RegisterRad[]): LokaltSvar | null {
  const fragaStr = diafri(fraga);
  if (!fragaStr) return null;
  const fragaOrd = fragaStr.split(" ");
  let bast: { svar: LokaltSvar; poang: number } | null = null;
  for (const m of AVKASTNINGSKURVA_MONSTER) {
    const karnTraff = m.karnord.filter((nk) => traff(fragaOrd, fragaStr, nk));
    if (karnTraff.length === 0) continue; // krav: minst ett kärnord
    const starkTraff = m.starkord?.filter((nk) => traff(fragaOrd, fragaStr, nk)) ?? [];
    const poang = karnTraff.length * 3 + starkTraff.length;
    if (!bast || poang > bast.poang) bast = { svar: m.bygga(register), poang };
  }
  return bast ? bast.svar : null;
}
