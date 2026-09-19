/**
 * AI-MENTORN 2.0 — RISKBUDGET-FÖRHANDSFRÅGOR (spår 6, omgång 22, s6-u2,
 * manifest auto-s6-1789791914561).
 *
 * Två källmärkta förhandsfrågor ovanpå de fyrtiosex committade lagren —
 * portföljens risk som BESLUT i ett tal och som BETYG i divisioner:
 *   1. Volatilitetsbudgeten ("vad är volatilitetsbudgeten?") — risken satt
 *      som ett tal i fredstid och fördelad i vikter (rp-04 primär + rp-03 +
 *      rp-01 + km-017 som källor)
 *   2. Sortino och Calmar ("vad är sortino?") — riskjusterade mått där bara
 *      nedgångarna kostar och det djupaste fallet sätter nämnaren
 *      (rp-02 primär + rp-01 + km-031 som källor)
 *
 * REGISTERBÄRNING: HELA RISKHANTERING & PORTFÖLJTEORI-kategorin länkas fullt
 * ut 7/13 → 13/13 (sondens genomräkning: kategorins sex mentorväglösa kurser
 * rp-01, rp-02, rp-03, rp-04, km-017, km-031 — samtliga bärs här som primär-
 * eller källkurs; varje slug en äkta rad i KURSREGISTER, kedjetestets E-fall
 * vakar).
 *
 * ÄMNESVAL EFTER SOND I TVÅ RONDER (verktyg/_s6u2-sond-omg22.mjs, otrackad;
 * 46 motorer / 125 monsters / 440 kurser / 273 nådda / 1 359 kärnord LIVE
 * med basmotorn med — omgång 21:s import-fälla kontrollerad):
 *   • Rond 2 DÖDADE som kärnord: «kelly»/«kelly-kriteriet» (basens risk-
 *     monster äger kelly EXAKT + "position sizing"), «riskparitet» (port-
 *     följbalansens), «roic»-familjen (lönsamhetsdjupets), «value at risk»
 *     (basens risk-ord), «volatilitet» och «risk» naket (basens) — kurserna
 *     km-017/km-031/rp-03 bärs därför ENDAST som KÄLLOR enligt V19-preceden-
 *     sen, ägarnas frågor som knappar.
 *   • Rond 2 GRÖN: «volatilitetsbudgeten»/«volatilitetsbudget»/«riskbudget»
 *     och «sortino»/«sortino-kvoten»/«calmar»/«calmar-kvoten»/«tre mått tre
 *     frågor» samtliga NULL genom kedjan; rond 3: 0 kärnordsgrannar mot
 *     kedjans 1 359 ord.
 *
 * DOKUMENTERADE GRÄNSER (rondens strykningar — inte mina kärnord):
 *   • BAS-motorn äger naket «risk», «volatilitet», «kelly», «position
 *     sizing», «value at risk», «hur mycket risk får portföljen ta?».
 *   • Riskmåttsdjupet äger «sharpe-kvoten» — Sharpe förklaras här ENDAST som
 *     jämförelseraden i tretalet, deras fråga bärs som knapp.
 *   • Portföljbalansen äger «riskparitet» — rp-03:s gränsdoktrin (lika risk-
 *     bidrag, inte lika kronor) refereras som syskonläsning + knapp.
 *
 * Aritmetiken i båda svar är KURSERNAS EGNA övningsportföljer (maskinellt
 * oberoende omräknade i regressionstestets D03-fall):
 *   • Volatilitetsbudgeten (rp-04:s exempelportfölj, påhittade tal): aktier
 *     18 % vol, räntepapper 6 %, korrelation noll; 60/40 → varians 116,64 +
 *     5,76 = 122,4 ⇒ 11,06 %; 70/30 ⇒ 158,76 + 3,24 = 162,0 ⇒ 12,73 %;
 *     budgeten 12 % ⇒ ekvationen 10w² − 2w − 3 = 0 ⇒ w = 0,6568 ⇒ 65,7/34,3
 *     med kontrollen 139,76 + 4,24 = 144,00 ⇒ 12,00; svängen 18 → 24 %
 *     ⇒ 248,46 + 4,24 = 252,70 ⇒ 15,90 % = 3,90 procentenheter = 32,5 %
 *     över taket; återförd vikt 17w² − 2w − 3 = 0 ⇒ w = 0,4830 ⇒ 48,3/51,7
 *     med kontrollen 134,38 + 9,62 = 144,00.
 *   • Sortino/Calmar (rp-02:s exempelportfölj): avkastning 12,0 %, riskfri
 *     2,0 %, vol 10,0 %, nedsidig vol 7,0 %, max fall 15,0 % ⇒ Sharpe
 *     (12,0 − 2,0) ÷ 10,0 = 1,00 · Sortino ÷ 7,0 = 1,43 · Calmar 12,0 ÷ 15,0
 *     = 0,80; spegelportföljen 9,0 % / 7,0 / 6,0 / 8,0 ⇒ 1,00 · 1,17 · 1,13
 *     — Sharpe oavgjort, Sortino exempelportföljen, Calmar spegeln; √12 ≈
 *     3,46 (månads-Sharpe 0,29 × 3,46 ≈ 1,0 i årsläge).
 *
 * Matchningen speglar motorns hjälpfunktioner (samma lösning som alla
 * syskinlager: Node type-stripping löser endast `import type`, så de rena
 * funktionerna speglas hit). Semantisk likhet med motorn BEVISAS av testets
 * felstavningsfall (B) och determinismfall (C). Driftvarning: ändras motorns
 * matchning måste denna spegel följa — testfall B vakar.
 *
 * SAMMANSÄTTNING (chat-widget.tsx) — detta lager wireas EFTER tillväxtdjup
 * (kedjans 46:e motor vid byggtillfället) och kan därför aldrig stjäla en
 * fråga från ett tidigare lager; det fångar bara frågor som alla lager före
 * det lämnar null på. Omvänt vaktar testfall H på att dessa frågor INTE
 * fångas av kedjan utan detta lager (dupliceringsskydd). Syskon i samma
 * fönster (u1 konvertibel, u3 bokmastar) kan wirea efter — kada-bördan
 * uppdaterar isåfall A2-positionen (omgång 20–21-presedensen).
 *
 * ── JURIDIKGRINDEN (lagen 2007:528) ──────────────────────────────────
 * All text är pedagogisk utbildning om hur riskmått och riskbudgeter
 * DEFINIERAS, RÄKNAS och LÄS — inga köp-/säljsignaler, inga placeringstips,
 * inga omdömen om enskilda värdepapper (exempelportföljerna är kursernas
 * övningstal, konstruerade för övningens skull).
 *
 * ── DEPENDENCY-INJECTION (samma mönster som hela motorn) ─────────────
 * Registret skickas IN som parameter (endast `import type`) så att
 * verktyg/testa-ai-mentor-riskbudget.mjs kan köra filen direkt i Node.
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

// ── De 2 riskbudget-frågorna ────────────────────────────────────────────────

export const RISKBUDGET_MONSTER: FragMonster[] = [
  {
    id: "volatilitetsbudget",
    karnord: [
      "volatilitetsbudget", "volatilitetsbudgeten", "riskbudget",
    ],
    // NOTERA gränserna (sondrond 2 + testfall G-fyndet): naket «volatilitet»
    // och «risk» ägs av basens risk-monster (deras svar, deras territorium —
    // deras fråga bärs som knapp); «riskparitet» ägs av portföljbalansen
    // (rp-03 här KÄLLA enligt V19); «riskbudgeten» ägs av ekosystemdjupets
    // «röstbudgeten» (SAM:ens röstbudget — tavstånd 2, de ligger FÖRE detta
    // lager i kedjan och svarar redan på den formuleringen) — kärnordet här
    // är «riskbudget» (tavstånd 4 till röstbudgeten, säkert båda vägar).
    starkord: [
      "budget", "budgeten", "pendling", "pendla", "tak", "taket", "portfölj",
      "portföljen", "vikt", "vikten", "beslut", "fredstid", "återförd",
    ],
    bygga: (reg) => {
      const rpAntal = reg.filter((r) => r.kategori === "RISKHANTERING & PORTFÖLJTEORI").length;
      const kallor = [
        kursKalla(reg, "rp-04-volatilitetsbudgeten", "Läroplanen — budgeten: risken som beslut, vikten som uppfyller talet"),
        kursKalla(reg, "rp-03-riskparitet", "Läroplanen — syskondoktrinen: vikta efter riskbidrag, inte kronor"),
        kursKalla(reg, "rp-01-riskmattens-karta", "Läroplanen — kartan: fem mått och fem frågor innan formlerna"),
        kursKalla(reg, "km-017-position-sizing-kelly-kriteriet", "Läroplanen — nästa steg ner: hur stor varje position får bli"),
      ];
      const k = kallor[0];
      const rp04 = reg.find((r) => r.slug === "rp-04-volatilitetsbudgeten");
      return {
        text:
          `En volatilitetsbudget är portföljens risk satt som ETT tal, valt i fredstid — hur mycket den totala portföljen får pendla per år — och sedan fördelas riskkronorna så att talet håller (allt nedan är utbildning i en metod, med kursexempelens påhittade tal — inga placeringstips):\n\n1️⃣ BUDGETEN — RISKEN SOM BESLUT, INTE SOM ÖDE. Utan budget upptäcks risktakets nivå först i nedgången, genom att taket träffs. Med budget vänds ordningen: FÖRE positionerna väljs talet, och positionerna anpassas till talet. Övningstalet i kursens exempel är tolv procent årlig pendling — och här väntar första överraskningen: tolv procents budget betyder 65,7 procent aktier. En aktieandel de flesta skulle kalla bestämd snarare än blygsam. Talet som ser återhållsamt ut i volatilitet kan se modigt ut i kronor — därför ska budgeten väljas som BESLUT, inte härledas ur vad portföljen råkar innehålla.\n2️⃣ FYSIKEN — VILKEN VIKT SOM UPPFYLLER TALET. Med aktier på 18 procent volatilitet, räntepapper på 6 och korrelation noll (kvadratlagen: varianserna adderas vikade i kvadrat) blir tabellen: 100/0 ger 18,0 procent; 60/40 ger variansen 116,64 + 5,76 = 122,4 alltså 11,06 procent — strax under; 70/30 ger 158,76 + 3,24 = 162,0 alltså 12,73 — strax över. Budgetvikten löser ekvationen w² × 324 + (1 − w)² × 36 = 144, förenklat 10w² − 2w − 3 = 0, med den positiva roten w = 0,6568: alltså 65,7 procent aktier och 34,3 procent räntepapper — kontrollen: 139,76 + 4,24 = 144,00, roten = exakt 12,00. Notera kvadratlagen igen: vid LIKA kronvikter fördelar sig risken 90/10 för volförhållandet 3 mot 1 (9 mot 1 i varians) — risken koncentreras i kvadrat på måttskillnaden, vilket är syskonkursen riskparitetens utgångspunkt (knappen nedan).\n3️⃣ DRIFTEN — NÄR VOLATILITETEN RÖR PÅ SIG. Marknadens pendling är ingen konstant. Stiger aktievolatiliteten från 18 till 24 procent — en ordinarie händelse i en orolig period — blir portföljvolatiliteten 248,46 + 4,24 = 252,70 alltså 15,90 procent: överskridet med 3,90 procentenheter = 32,5 procent över taket, utan att portföljen ändrats en krona. Budgetens motorkapitel är återföringen: lös ekvationen igen med 576 i stället för 324 — 17w² − 2w − 3 = 0 ger w = 0,4830, alltså 48,3/51,7, med kontrollen 134,38 + 9,62 = 144,00 ⇒ 12,00 återställt. Två fallor på köpet: falsk precision (skillnaden mellan 11,9 och 12,0 är brus — mellan tolv och sexton är ett beslut; talet förtjänar ett band, tolv plus minus ett) och budgeten utan herre (ett tolv som ingen äger eller återför är en dekoration). Frågan hur stor VARJE position får bli inuti budgeten — position sizing och Kelly — är nästa steg ner (knappen nedan).\n\nI kategorin riskhantering & portföljteori finns ${rpAntal} kurser — huvudkursen (${rp04 ? rp04.minuter + " min, " + rp04.niva.toLowerCase() + " nivå" : "i registret"}) äger hela kedjan från beslut via vikt till återföring. Som alltid: detta är utbildning i en metod — inga placeringstips.` +
          kallradFler(kallor),
        amne: "volatilitetsbudget",
        kalla: k,
        kallor,
        handlings: [
          { text: "Kursen: Volatilitetsbudgeten", lank: "/kurser/rp-04-volatilitetsbudgeten", ikon: "🎯", beskrivning: "Risken som beslut" },
          { text: "Kursen: Riskparitet", lank: "/kurser/rp-03-riskparitet", ikon: "⚖️", beskrivning: "Vikta efter risk, inte kronor" },
          { text: "Kursen: Riskmåttens karta", lank: "/kurser/rp-01-riskmattens-karta", ikon: "🗺️", beskrivning: "Fem mått, fem frågor" },
          { text: "Vad är riskparitet?", lank: "fragor:" + encodeURIComponent("vad är riskparitet?"), ikon: "⚖️", beskrivning: "Syskonläsningen" },
          { text: "Vad är sortino?", lank: "fragor:" + encodeURIComponent("vad är sortino?"), ikon: "📉", beskrivning: "Betyget på pendlingen" },
        ],
        motfraga: { text: "Vad är sortino?", kategori: "risk" },
        fordjupa: { text: k.titel, lank: "/kurser/rp-04-volatilitetsbudgeten" },
      };
    },
  },
  {
    id: "sortino-calmar",
    karnord: [
      "sortino", "sortinokvoten", "sortino-kvoten", "calmar", "calmarkvoten",
      "calmar-kvoten", "tre mått tre frågor",
    ],
    // NOTERA gränserna (sondrond 2): «sharpe-kvoten» ägs av riskmåttsdjupet
    // — Sharpe förekommer här ENDAST som jämförelserad i tretalet, deras
    // fråga bärs som knapp. «riskmått» naket testades NULL men hålls som
    // starkord — kartans kurs (rp-01) bär familjeordet som KÄLLA.
    starkord: [
      "kvot", "kvoten", "mått", "måtten", "riskmått", "nedgång", "nedgångar",
      "nedsidig", "fall", "fallet", "drawdown", "avkastning", "division",
    ],
    bygga: (reg) => {
      const rpAntal = reg.filter((r) => r.kategori === "RISKHANTERING & PORTFÖLJTEORI").length;
      const kallor = [
        kursKalla(reg, "rp-02-tre-matt-tre-fragor", "Läroplanen — de tre divisionerna: Sharpe, Sortino och Calmar i samma portfölj"),
        kursKalla(reg, "rp-01-riskmattens-karta", "Läroplanen — kartan före formlerna: fem mått och deras frågor"),
        kursKalla(reg, "km-031-var", "Läroplanen — grannmåttet: VaR sätter gränsen i kronor, kvoterna i divisioner"),
      ];
      const k = kallor[0];
      const rp02 = reg.find((r) => r.slug === "rp-02-tre-matt-tre-fragor");
      return {
        text:
          `Sortino- och Calmar-kvoterna är två av de tre riskjusterade måtten — divisioner som ställer avkastning i täljaren mot ett riskmått i nämnaren och ger ETT betyg (allt nedan är utbildning i en metod, med kursexempelens påhittade tal — inga placeringstips):\n\n1️⃣ IDÉN — AVKASTNING DELAT I RISK, PÅ TRE SÄTT. En portföljrapport som bara visar avkastning är en halv rapport: 12,0 procent om året låter bra tills frågan kommer — med hur mycket pendling, hur djupa fall, hur ofta? Kursens exempelportfölj bärs genom alla tre måtten med oförändrade tal: avkastning 12,0 procent, riskfri ränta 2,0, volatilitet 10,0, nedsidig volatilitet 7,0 och maximalt fall 15,0 procent. Tre divisioner ger tre betyg — och inget av dem är rätt eller fel; de svarar på olika frågor.\n2️⃣ SORTINO — BARA NEDGÅNGARNA KOSTAR. Sortino behåller Sharpe-kvotens täljare (avkastning minus riskfri ränta, eller minus ett valt mål) men byter nämnare: i stället för hela standardavvikelsen räknas ENDAST nedsidesavvikelserna — månaderna under målet, kvadrerade, summerade och rotade. Exempelportföljen: (12,0 − 2,0) ÷ 7,0 = 1,43, mot Sharpe-kvotens (12,0 − 2,0) ÷ 10,0 = 1,00. Skillnaden mellan 1,43 och 1,00 är i sig information: en ovanligt stor andel av pendlingen satt på UPPSIDAN. Ligger Sortino nära Sharpe pendlade portföljen jämnt båda vägar; är gapet stort satt överraskningarna uppåt.\n3️⃣ CALMAR — AVKASTNINGEN MOT DET DJUPASTE FALLET. Calmar ställer årlig avkastning mot det maximala drawdownet, portföljens djupaste dal från topp till botten: exempelportföljen 12,0 ÷ 15,0 = 0,80. Och här vänder kursens signaturfall på rankningen — spegelportföljen med avkastning 9,0, volatilitet 7,0, nedsidig 6,0 och maximalt fall 8,0 procent: Sharpe (9,0 − 2,0) ÷ 7,0 = 1,00 — IDENTISKT med exempelportföljen; Sortino (9,0 − 2,0) ÷ 6,0 = 1,17 — exempelportföljen vinner (1,43); Calmar 9,0 ÷ 8,0 = 1,13 — spegeln vinner (0,80). Tre mått, tre frågor, tre olika vinnare på samma två portföljer: enda sättet att läsa risk är att fråga vilken risk. Tre fallor på köpet: årsrymden (ett Calmar över tre år vilar på max ett värre fall — läs alltid årsrymden FÖRE kvoten), annualiseringen (månadsdata förs till årsnivå med roten ur tolv ≈ 3,46 — månads-Sharpe 0,29 × 3,46 ≈ 1,0 — men bara om båda talen mäts i samma frekvens) och jämförelsesynderna (brutto mot netto, olika perioder).\n\nI kategorin riskhantering & portföljteori finns ${rpAntal} kurser — huvudkursen (${rp02 ? rp02.minuter + " min, " + rp02.niva.toLowerCase() + " nivå" : "i registret"}) äger hela triot med jämförelsetabellen. Som alltid: detta är utbildning i en metod — inga placeringstips.` +
          kallradFler(kallor),
        amne: "sortino-calmar",
        kalla: k,
        kallor,
        handlings: [
          { text: "Kursen: Tre mått, tre frågor", lank: "/kurser/rp-02-tre-matt-tre-fragor", ikon: "📊", beskrivning: "Sharpe, Sortino och Calmar" },
          { text: "Kursen: Riskmåttens karta", lank: "/kurser/rp-01-riskmattens-karta", ikon: "🗺️", beskrivning: "Fem mått, fem frågor" },
          { text: "Kursen: VaR — Value at Risk", lank: "/kurser/km-031-var", ikon: "🚧", beskrivning: "Gränsen i kronor" },
          { text: "Vad är sharpe-kvoten?", lank: "fragor:" + encodeURIComponent("vad är sharpe-kvoten?"), ikon: "📏", beskrivning: "Första divisionen" },
          { text: "Vad är volatilitetsbudgeten?", lank: "fragor:" + encodeURIComponent("vad är volatilitetsbudgeten?"), ikon: "🎯", beskrivning: "Syskonläsningen: risken som beslut" },
        ],
        motfraga: { text: "Vad är volatilitetsbudgeten?", kategori: "risk" },
        fordjupa: { text: k.titel, lank: "/kurser/rp-02-tre-matt-tre-fragor" },
      };
    },
  },
];

// ── Huvudingången ──────────────────────────────────────────────────────────

/**
 * Svara lokalt med NÅGOT av de två riskbudget-mönstren — eller null
 * (då har hela kedjan före redan lämnat null och API-flödet tar över som
 * förr). Wiread efter tillväxtdjup och kan därför aldrig stjäla en fråga
 * från tidigare lager. Samma matchningssemantik som basmotorn: minst ett
 * kärnord krävs, poäng = kärnord × 3 + stärkord, oavgjort → först
 * deklarerade mönstret vinner (strikt >, deterministiskt). Samma fråga ⇒
 * bitidentiskt svar.
 */
export function svaraLokaltRiskbudget(fraga: string, register: RegisterRad[]): LokaltSvar | null {
  const fragaStr = diafri(fraga);
  if (!fragaStr) return null;
  const fragaOrd = fragaStr.split(" ");
  let bast: { svar: LokaltSvar; poang: number } | null = null;
  for (const m of RISKBUDGET_MONSTER) {
    const karnTraff = m.karnord.filter((nk) => traff(fragaOrd, fragaStr, nk));
    if (karnTraff.length === 0) continue; // krav: minst ett kärnord
    const starkTraff = m.starkord?.filter((nk) => traff(fragaOrd, fragaStr, nk)) ?? [];
    const poang = karnTraff.length * 3 + starkTraff.length;
    if (!bast || poang > bast.poang) bast = { svar: m.bygga(register), poang };
  }
  return bast ? bast.svar : null;
}
