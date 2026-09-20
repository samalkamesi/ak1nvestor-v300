/**
 * AI-MENTORN 2.0 — OPTIONSHANTVERK-FÖRHANDSFRÅGOR (omgång 26, manifest
 * auto-s6-1789890903364 — spår 6, byggare s6-u3, levererad 2026-09-20).
 *
 * Tre källmärkta förhandsfrågor om OPTIONSHANTVERKET — optionspositionens
 * tre verkstadsgolv: priset (hur optionen får sitt pris utan prognos),
 * konstruktionen (straddeln och dess släktingar) och förvaltningen
 * (deltat, thetans hyra och förfallodagen). Speglar od-08, od-04 och
 * od-06 — OPTIONS & DERIVAT:s fyra mentorväglösa kurser får här sina
 * första mentorvägar (od-05 aktiveras som källa; efter detta lager är
 * kategorin fullt mentorlänkad 8/8).
 *
 *   1. Binomialträdet  (od-08 primär; källor od-05 pariteten + od-01)
 *   2. Straddlen       (od-04 primär; källor od-06 + od-02)
 *   3. Deltat          (od-06 primär; källor od-01 + od-04)
 *
 * ÄMNESVAL EFTER NEDSTÄLLNING OCH KOLLISIONSKONTROLL: första valet
 * (riskens adresser rs-06/07/08/09) togs på disk av syskonet s6-u1
 * (deras anspråk 08:04:28Z, 100 s före detta lagers; deras modul på
 * disk 08:07:38Z) — nedställning bokförd i
 * data/vakten/auto-s6-1789890903364-s6-u3-ansprak.md v2. Omgångens
 * syskonterritorier: u1 riskadress (rs-familjen), u2 balansdjup
 * (bk-06/bk-07) — detta lager rör ingen av deras ytor.
 *
 * SOND (verktyg/_s6u3o26-sond.mjs, otrackad, 08:0xZ) mot SAMTLIGA 62
 * motorer / 173 monsters / 3 749 kärnord+starkord (LIVE-lästa):
 *   · hela familjen NULL med 0 grannar inom motorns tolerans:
 *     binomialträdet · replikeringen · replikeringsportföljen ·
 *     hedgekvoten · straddle · straddlen · strangle · stranglen ·
 *     kombinerade optionspositioner · delta · deltat ·
 *     aktieekvivalenter · förfallodagen · thetan · positionen efter
 *     bygget · pariteten · gamma.
 *   · kontroller som SKA fångas av sina ägare (sonden mäter rätt):
 *     "vad är risk?" → basen · kundkoncentration → risklasningsdjup ·
 *     collar → portföljgrund · ex-dagen → utdelningskalender.
 *
 * STRUKNA kärnord (dokumenterade gränser — sonder + syskonanspråk):
 *   · "collar" — portföljgrundens ("dollar" tav 1); collarn bärs i
 *     TEXT (od-04:s kapitel 2), aldrig som kärnord.
 *   · "prisspridning" — basens ("riskspridning" tav 2); den vertikala
 *     prisspridningen beskrivs i text, ordet ägs av basen.
 *   · "ex-dagen" — utdelningskalenderns; od-05 bärs via källrad +
 *     kurslänk (aktiveringen), aldrig som kärnord.
 *   · "omhedging" — valutamekanikens "hedging" (tav 2: en sökfråga
 *     "vad är hedging?" skulle hamna här och stjäla deras fråga);
 *     omräkningen kallas omräkning/band i text.
 *   · "option"/"options" — nästa-lagrets exakta kortord (≤3 tecken-
 *     regeln gäller ej men deras ägarskap dokumenterat i omgång 25);
 *     detta lager bär ENDAST sammansättningarna — sammansättnings-
 *     doktrinen från korrelationsrisk-precedensen.
 *
 * KEDJEPLACERING: omedelbart FÖRE marknadsrytm (deras SIST-deklaration
 * + testfall L01 respekteras — multipel-precedensen från omgång 25:
 * … kontrahent → multipel → [u1:s riskadress om wiread] → detta lager
 * → marknadsrytm). Kärnorden mekaniskt disjunkta mot samtliga lager;
 * bevisas av kedjetestets fall G + detta lagers testfall K (kärnorden
 * läses LIVE ur samtliga src/lib/ai-mentor-*-fragor.ts vid varje
 * körning) och testfall G2 (antistöld mot tidigare lagers kanoniska).
 *
 * Matchningen speglar motorns hjälpfunktioner (samma lösning som
 * samtliga syskonlager). Semantisk likhet med motorn BEVISAS av
 * testets felstavningfall (B) och determinismfall (C). Driftvarning:
 * ändras motorns matchning måste denna spegel följa — testfall B vaktar.
 *
 * SAMMANSÄTTNING (chat-widget.tsx):
 *   … ?? svaraLokaltMultipel(q, KURSREGISTER)
 *     ?? svaraLokaltOptionshantverk(q, KURSREGISTER)
 *     ?? svaraLokaltMarknadsrytm(q, KURSREGISTER)
 *
 * ── JURIDIKGRINDEN (lagen 2007:528) ──────────────────────────────────
 * All text är pedagogisk utbildning om hur optioner prissätts, byggs
 * och förvaltas — inga rekommendationer om positioner, strategival
 * eller konstruktioner. Aritmetiken bär kursernas egna övningstal med
 * tydligt markerade påhittade exempel.
 *
 * ── DEPENDENCY-INJECTION (samma mönster som hela motorn) ─────────────
 * Registret skickas IN som parameter (endast `import type`) så att
 * verktyg/testa-ai-mentor-optionshantverk.mjs kan köra filen direkt i
 * Node. Källkurserna (od-08, od-05, od-01, od-04, od-06, od-02) finns
 * i KURSREGISTER — inga fantomlänkar (testfall D vaktar).
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

/** Kategoriräknare — registerdrivna tal i svaret (testfall D2 vaktar). */
function odAntal(register: RegisterRad[]): number {
  return register.filter((r) => r.kategori === "OPTIONS & DERIVAT").length;
}

// ── De 3 optionshantverks-frågorna ──────────────────────────────────────────

export const OPTIONSHANTVERK_MONSTER: FragMonster[] = [
  {
    id: "binomialtradet",
    karnord: [
      "binomialträdet", "binomialträd", "binomialtradet",
      "replikeringen", "replikering", "replikeringsportföljen",
      "hedgekvoten", "hedgekvot",
      "riskneutrala sannolikheten", "riskneutral sannolikhet",
    ],
    starkord: ["option", "optionen", "pris", "aktie", "lån", "ränta", "träd", "steg", "arbitrage", "väntevärde"],
    bygga: (reg) => {
      const kallor = [
        kursKalla(reg, "od-08-binomialtradet-och-replikeringen", "Läroplanen — options & derivat, hur optionen får sitt pris"),
        kursKalla(reg, "od-05-utdelningen-och-optionen", "Läroplanen — options & derivat, pariteten: fyra pris och en ekvation"),
        kursKalla(reg, "od-01-optionens-greker", "Läroplanen — options & derivat, optionens greker"),
      ];
      const k = kallor[0];
      return {
        text:
          `Binomialträdet och replikeringen — svaret på frågan hur en option får sitt pris UTAN att gissa framtiden. Idén: om du kan bygga optionens utfall av enklare delar — aktie + lån — är priset på optionen priset på delarna. Räkneexemplet (kursexempel, påhittade tal): aktien står i 100, nästa steg blir 120 eller 80, räntan 2 procent, en köpoption med lösenpris 100 betalar 20 i upp-läget och 0 i ner-läget. Tre steg:\n\n1. HEDGEKVOTEN — hur många aktier behövs för att efterapa utfallen? (20 − 0) ÷ (120 − 80) = 0,5 — en halv aktie rör sig 20 kronor mellan lägena, precis som optionen. Kontroll båda vägar: 0,5 × 120 − 40 = 20 ✓ och 0,5 × 80 − 40 = 0 ✓.\n2. LÅNET — ner-läget måste betala 0: 0,5 × 80 = 40 ska återbetalas exakt, så lånet är 40 vid slutet, alltså 40 ÷ 1,02 = 39,22 idag. Replikeringsportföljen: 0,5 aktie (kostar 0,5 × 100 = 50) minus lånet 39,22 — optionens pris 50 − 39,22 = 10,78. Räntans spår syns i en subtraktion: vore räntan 4 procent vore lånet 40 ÷ 1,04 = 38,46 och priset 11,54.\n3. DEN RISKNEUTRALA VÄGEN — samma pris utan portfölj: viktsindelningen q = (1,02 − 0,80) ÷ (1,20 − 0,80) = 0,55, och priset (0,55 × 20 + 0,45 × 0) ÷ 1,02 = 11 ÷ 1,02 = 10,78. Två vägar, samma svar — det är beviset. q är INTE en prognos ("marknaden tror 55 procent upp") utan en viktsindelning fallen ur arbitragekravet: de som prissätter med andra vikter kan arbitreras.\n\nDetta är optionsprissättningens järnvillkor: två identiska utfall ska kosta samma — annars köper man det billiga och säljer det dyra. Trädet är också ett mikroskop: samma konstruktion granskar andras priser och egna antaganden, steg för steg. OPTIONS & DERIVAT-kategorin (${odAntal(reg)} kurser) äger djupet — hur någon BÖR handla optioner är en rådgivningsfråga vi aldrig besvarar; detta är utbildning i mekaniken.` +
          kallradFler(kallor),
        amne: "binomialträdet",
        kalla: k,
        kallor,
        handlings: [
          { text: "Kursen: Binomialträdet och replikeringen", lank: "/kurser/od-08-binomialtradet-och-replikeringen", ikon: "🌳", beskrivning: "Priset utan prognos — trädet steg för steg" },
          { text: "Kursen: Utdelningen och optionen", lank: "/kurser/od-05-utdelningen-och-optionen", ikon: "💰", beskrivning: "Pariteten — fyra pris och en ekvation" },
          { text: "Kursen: Optionens greker", lank: "/kurser/od-01-optionens-greker", ikon: "🏛️", beskrivning: "Delta, gamma, theta och vega" },
          { text: "Vad är en straddle?", lank: "fragor:" + encodeURIComponent("vad är en straddle?"), ikon: "🎯", beskrivning: "Konstruktionen som köper rörelsen" },
        ],
        motfraga: { text: "Vad är en straddle?", kategori: "options & derivat" },
        fordjupa: { text: k.titel, lank: "/kurser/od-08-binomialtradet-och-replikeringen" },
      };
    },
  },
  {
    id: "straddlen",
    karnord: [
      "straddle", "straddlen", "straddles",
      "strangle", "stranglen", "strangles",
      "kombinerade optionspositioner", "rörelsen utan riktning",
    ],
    starkord: ["premie", "ben", "position", "köpa", "lösenpris", "strike", "break-even", "rikting", "option"],
    bygga: (reg) => {
      const kallor = [
        kursKalla(reg, "od-04-kombinerade-optionspositioner", "Läroplanen — options & derivat, collar, straddle och prisspridning"),
        kursKalla(reg, "od-06-positionen-efter-bygget", "Läroplanen — options & derivat, positionens liv efter orderbekräftelsen"),
        kursKalla(reg, "od-02-implicit-volatilitet", "Läroplanen — options & derivat, premiens pris på framtiden"),
      ];
      const k = kallor[0];
      return {
        text:
          `Straddeln — kombinerade optionspositioners renaste exemplar: köp en köpoption och en säljoption med SAMMA lösenpris, och du äger rörelsen utan riktning. Varje enskilt optionsben har en sida som lyfter och en som läcker — kombinationernas poäng är att benens luckor kan stänga mot varann. Kursexempel (påhittade tal):\n\n1. STRADDLE 100 — köp call 100 för 4 och put 100 för 4: total premie 8. Förlusten är som störst där benen dör — vid kursen 100 — och max förlust är premien 8. Break-even blir 100 − 8 = 92 nedåt och 100 + 8 = 108 uppåt: positionen vinner på ALLT som rör sig mer än 8 kronor, oavsett riktning.\n2. STRANGLE 90/110 — släktingen som flyttar benen utåt: köp call 110 för 2 och put 90 för 2, total premie 4 — hälften. Priset: break-even 90 − 4 = 86 och 110 + 4 = 114. Dubbelt bredare zon för halva premien, men kurserna mellan 90 och 110 lämnar BÅDA benen döda — strängen köper rörelsen bara om den blir STOR.\n3. VERTIKAL PRISSPRIDNING — arbetshästen: köp ett ben, sälj ett annat med samma löptid men olika strikar. Aritmetiken är tre rader: maxförlust = nettokostnaden (inköpta minus sålda premier), maxvinst = strikskillnaden minus nettokostnaden, break-even = den köpta striken plus nettokostnaden. Det sålda benet finansierar det köpta — och takar vinsten.\n\nVad kombinationer EGENTLIGEN gör: de flyttar risk mellan utfall — premien mot zonen, bredden mot storleken på rörelsen. Payoff-diagrammet (rita positionen FÖRE bygget — en linje med knäpunkter) är hantverket som förenar dem alla. OPTIONS & DERIVAT-kategorin (${odAntal(reg)} kurser) äger konstruktionerna — vilka positioner någon BÖR bygga besvaras aldrig här; mekaniken är utbildningen.` +
          kallradFler(kallor),
        amne: "straddlen",
        kalla: k,
        kallor,
        handlings: [
          { text: "Kursen: Kombinerade optionspositioner", lank: "/kurser/od-04-kombinerade-optionspositioner", ikon: "🎯", beskrivning: "Collar, straddle och prisspridning" },
          { text: "Kursen: Positionen efter bygget", lank: "/kurser/od-06-positionen-efter-bygget", ikon: "🛠️", beskrivning: "Då straddeln börjar leva" },
          { text: "Vad är delta?", lank: "fragor:" + encodeURIComponent("vad är delta?"), ikon: "📐", beskrivning: "Positionens levande exponering" },
        ],
        motfraga: { text: "Vad är delta?", kategori: "options & derivat" },
        fordjupa: { text: k.titel, lank: "/kurser/od-04-kombinerade-optionspositioner" },
      };
    },
  },
  {
    id: "deltat",
    karnord: [
      "delta", "deltat", "nettodelta",
      "aktieekvivalenter", "förfallodagen",
      "thetan", "thetans hyra",
      "positionen efter bygget",
    ],
    starkord: ["gamma", "exponering", "kontrakt", "omräkning", "hyra", "skörd", "band", "position"],
    bygga: (reg) => {
      const kallor = [
        kursKalla(reg, "od-06-positionen-efter-bygget", "Läroplanen — options & derivat, delta, band och förfallodagen"),
        kursKalla(reg, "od-01-optionens-greker", "Läroplanen — options & derivat, optionens greker"),
        kursKalla(reg, "od-04-kombinerade-optionspositioner", "Läroplanen — options & derivat, konstruktionerna som lever vidare"),
      ];
      const k = kallor[0];
      return {
        text:
          `Deltat och positionen efter bygget — byggkurserna slutar där förvaltningen börjar: vid orderbekräftelsen. Positionens första sanning är exponeringen i aktieekvivalenter, och dess andra sanning är att den inte står stilla. Kursexempel (påhittade tal — en straddle, 10 kontrakt à 100 aktier, lösenpris 150):\n\n1. DELTAT SOM LEVANDE EXPOSERING — vid köpet: köpoptionen +0,52, säljoptionen −0,48, nettodelta +0,04 ⇒ 10 × 100 × 0,04 = 40 aktier lång. Efter en rörelse till 158: +0,63 och −0,37, netto +0,26 ⇒ 10 × 100 × 0,26 = 260 aktier. Skillnaden +220 aktier uppstod UTAN ett enda beslut — positionen är en annan bara av att marknaden rörde sig. Morgonrutinen är därför: räkna exponeringen på DAGENS kurser, inte på köpdagens.\n2. THETANS HYRA OCH GAMMANS SKÖRD — den köpta positionen betalar en daglig hyra för rätten till rörelse: thetan −0,50 kr per aktie och handelsdag, på 1 000 aktieenheter = 500 kr per dag. En dag med 8 kronors rörelse skördar via gamman: 0,5 × 0,02 × 8 × 8 = 0,64 kr per aktie = 640 kr — netto +140 kr för dagen. En stillastående dag: −500 kr. Hyran betalas VARJE dag; skörden kommer bara när det rör sig.\n3. BREAK-EVEN-RÖRELSEN — hur stor måste en daglig rörelse vara för att skörda hyran? √(2 × 0,50 ÷ 0,02) = √50 ≈ 7,1 kr — ungefär 4,7 procent av lösenpriset 150. Det talet är positionens hjärtfrekvens: mindre rörelse än så, och tiden äter; mer, och gamman betalar. (Pulstalet är en första översättning — delta och gamma är kurvor i verkligheten, inte konstanter.) Förfallodagen sätter slutbudgeten: thetan växer mot slutet och bandet för omräkning kan aldrig vara varje prissteg — tröskeln är en del av konstruktionen.\n\nPositionsförvaltning är läsning, inte magi: exponering, hyra, skörd, tröskel — fyra tal som talar om vad positionen gör just nu. OPTIONS & DERIVAT-kategorin (${odAntal(reg)} kurser) äger hantverket — hur någon BÖR förvalta sina positioner är en rådgivningsfråga vi aldrig besvarar.` +
          kallradFler(kallor),
        amne: "deltat",
        kalla: k,
        kallor,
        handlings: [
          { text: "Kursen: Positionen efter bygget", lank: "/kurser/od-06-positionen-efter-bygget", ikon: "🛠️", beskrivning: "Delta, band och förfallodagen" },
          { text: "Kursen: Optionens greker", lank: "/kurser/od-01-optionens-greker", ikon: "🏛️", beskrivning: "Grekerna från grunden" },
          { text: "Hur får optionen sitt pris?", lank: "fragor:" + encodeURIComponent("hur får optionen sitt pris?"), ikon: "🌳", beskrivning: "Binomialträdet och replikeringen" },
        ],
        motfraga: { text: "Hur får optionen sitt pris?", kategori: "options & derivat" },
        fordjupa: { text: k.titel, lank: "/kurser/od-06-positionen-efter-bygget" },
      };
    },
  },
];

// ── Huvudingången ──────────────────────────────────────────────────────────

/**
 * Svara lokalt med NÅGOT av de tre optionshantverks-mönstren — eller null
 * (då prövar widgeten nästa lager i kedjan). Samma matchningssemantik som
 * basmotorn: minst ett kärnord krävs, poäng = kärnord × 3 + stärkord,
 * oavgjort → först deklarerade mönstret vinner (strikt >, deterministiskt).
 * Samma fråga ⇒ bitidentiskt svar.
 */
export function svaraLokaltOptionshantverk(fraga: string, register: RegisterRad[]): LokaltSvar | null {
  const fragaStr = diafri(fraga);
  if (!fragaStr) return null;
  const fragaOrd = fragaStr.split(" ");
  let bast: { svar: LokaltSvar; poang: number } | null = null;
  for (const m of OPTIONSHANTVERK_MONSTER) {
    const karnTraff = m.karnord.filter((nk) => traff(fragaOrd, fragaStr, nk));
    if (karnTraff.length === 0) continue; // krav: minst ett kärnord
    const starkTraff = m.starkord?.filter((nk) => traff(fragaOrd, fragaStr, nk)) ?? [];
    const poang = karnTraff.length * 3 + starkTraff.length;
    if (!bast || poang > bast.poang) bast = { svar: m.bygga(register), poang };
  }
  return bast ? bast.svar : null;
}
