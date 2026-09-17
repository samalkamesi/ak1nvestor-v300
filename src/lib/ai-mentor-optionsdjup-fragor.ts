/**
 * AI-MENTORN 2.0 — OPTIONSDJUP-FÖRHANDSFRÅGOR (spår 6, omgång 14, s6-u1).
 *
 * EN ytterligare källmärkt förhandsfråga ovanpå de 24 tidigare lagren
 * (basens MONSTER i ai-mentor-svar.ts + makro, extra, nästa, kapitalmekanik,
 * sektor, case, praktik, portfoljgrund, agande, redovisningsdjup, djup,
 * historia, lonsamhetsdjup, tsdjup, skattedjup, beteendedjup, riskdjup,
 * riskmattsdjup, utdelningsdjup, förväntningsdjup, portfoljbalans,
 * stabilitetsdjup och grahamgolv):
 *   1. Köpoptionen med säljoptionen som inbyggd spegel (km-059-
 *      optionsgrunder primär + od-01-optionens-greker + od-02-implicit-
 *      volatilitet + km-062-blackscholes) — avtalets två speglade
 *      rättigheter, premin, lösenpriset och tidsvärdets smältning
 *
 * ÄMNESVAL EFTER KOLLISIONSKONTROLL (815 kärnord LIVE-lästa ur samtliga 24
 * lager med den riktiga matchern; verktyg/_s6u1-sond-omg14.mjs): "vad är en
 * köpoption?", "vad är en säljoption?", "vad är optionspremie?", "vad är
 * lösenpris?", "vad är strike?", "vad är tidsvärde?" och "vad är in the
 * money?" är HELT fria (NULL genom hela kedjan) och kärnorden köpoption/
 * säljoption/optionspremie/lösenpris/tidsvärde/optionsgreker/underliggande
 * har INGA grannar alls inom redigeringstavstånd 2. ÄMNESLUCKA: kategorin
 * OPTIONS & DERIVAT (6 kurser) saknar eget djuplager — och de två yngsta
 * kurserna od-01-optionens-greker + od-02-implicit-volatilitet nås av INGEN
 * mentorväg (sondbevis: länkas av inget monster i kedjan); detta lager
 * aktiverar dem (spårets "fler kurslänkar per svar"). Först avsågna
 * kandidater som DOG i sonden: moat-familjen (extra äger moat/vallgrav/
 * moat-erosion komplett — speglar registrets MOAT-kurser), katalysator-
 * familjen (basens V16–V18), PE/IB-familjen (nästa äger investmentbolag/
 * NAV-rabatt/substansvärde; basen private equity; sektor utfasning — de
 * kvarvarande ytorna wallenbergsfären/irr är perifera), aktiemarknadens
 * grundbegrepp (basen äger likviditet/spread/orderbok/nätmäklare). Varje
 * svar bär FYRA källor med numrerad Källor-rad + FYRA kurslänkar + en
 * levande fragor:-knapp — noll API-kostnad.
 *
 * ANSVARSFÖRDELNING (emission/V19-precedensen — sammansättningsägande ≠
 * grundordsägande; syskonlagrens dokumentationsplikt, testfall H/I bevisar
 * båda vägarna):
 *   • Nästa-lagret äger options-ÖVERSIKTSORDEN — sondbevis: "vad är en
 *     option?", "hur fungerar optioner?", "vad är covered calls?", "vad är
 *     black-scholes?" och "vad är optionens greker?" fångas av nästa
 *     (deras kärnord option/optioner/call/put/covered call/protective
 *     put/black scholes). Detta lager äger DE SVENSKA KOMPONENTORDEN:
 *     köpoption/säljoption/lösenpris/strikepris/optionspremie/tidsvärde/
 *     underliggande/optionsgreker — orden deras uppslag saknar.
 *   • Skattedjup-lagret äger optionsBESKATTNINGEN (deras kärnord sedan
 *     omgång 10) — skatteaspekten nämns inte här; deras yta är orörd.
 *   • Basens risk-monster äger "implicit volatilitet"-frågan (sondbevis:
 *     "vad är implicit volatilitet?" fångas av basens risk-mönster) —
 *     od-02 används här endast som KÄLLA/LÄNK, aldrig som kärnord.
 *
 * DOKUMENTERAD RISK (accepterad, samma bokföring som portfoljbalans-lagrets
 * rebalansera-notis): 1) Kärnorden "köpoption/säljoption" delar stav-
 * ningsstam med NÄSTAs engelska "call/put" SEMANTISKT men inte ortografiskt
 * — nästas matchning kräver deras egna kärnord och sondbeviset visar båda
 * vägarna ("vad är en köpoption?" NULL genom kedjan; "vad är en call?"
 * fångas av nästa FÖRE detta lager i kedjan — ömsesidigt säkert, vaktas av
 * testfall I). 2) "strike" (6 tkn) är NAKET engelskt kärnord — tavstånd
 * till "stribe"-klassen är > 2 och sonden hittade inga grannar; det svenska
 * "strikepris" (10 tkn) deklarerats parallellt så svensk stavning alltid
 * når. 3) "underliggande" (13 tkn) är optionsfamiliens adjektiv — frågan
 * "vad är en underliggande aktie?" når detta lager, vilket är avsikten;
 * inget tidigare lager äger ordet (testfall J vaktar mekaniskt).
 *
 * BUGGHISTORIK I KEDJAN (dokumenterad för framtida omgångar): sektor-
 * lagret (c363ec8b) levererades en gång utan sin widget-inkoppling och var
 * död kod tills syskonet s6-u1 omgång 5 kuraterade tillbaka det. Detta
 * lager kopplas in SIST — och testfall L läser widgetens kedjerad
 * MEKANISKT ur filen (tjugofemte lagret i ordning + import) så att "lager
 * utan inkoppling" aldrig kan återkomma tyst.
 *
 * Matchningen speglar motorns hjälpfunktioner (samma lösning som alla
 * syskonlagren: Node type-stripping löser endast `import type`, så de rena
 * funktionerna speglas hit). Semantisk likhet med motorn BEVISAS av
 * testets felstavningfall (B) och determinismfall (C). Driftvarning:
 * ändras motorns matchning måste denna spegel följa — testfall B vaktar.
 *
 * SAMMANSÄTTNING (chat-widget.tsx):
 *   svaraLokaltMakro(q, KURSREGISTER)
 *     ?? … (kedjans 24 lager, se widgeten) …
 *     ?? svaraLokaltGrahamgolv(q, KURSREGISTER)
 *     ?? svaraLokaltOptionsdjup(q, KURSREGISTER)
 * Detta lager ligger SIST i kedjan och kan därför ALDRIG stjäla en fråga
 * från tidigare lager — det fångar bara frågor som alla andra lämnar null
 * på. Omvänt vaktar testfall I på att den kanoniska frågan INTE fångas av
 * kedjan utan detta lager (dupliceringsskydd).
 *
 * ── JURIDIKGRINDEN (lagen 2007:528) ──────────────────────────────────
 * All text är pedagogisk utbildning om hur optionsmekaniken FUNGERAR som
 * instrument — inga köp-/säljsignaler, inga placeringstips, inga omdömen
 * om enskilda värdepapper eller upplägg. Exemplet i texten är en aritmetisk
 * illustration av avtalets mekanik (aktie till 100 kr), aldrig en
 * utfästelse om utfall eller en rekommendation att handla.
 *
 * ── DEPENDENCY-INJECTION (samma mönster som hela motorn) ─────────────
 * Registret skickas IN som parameter (endast `import type`) så att
 * verktyg/testa-ai-mentor-optionsdjup.mjs kan köra filen direkt i Node.
 * Alla källkurser (km-059-optionsgrunder, od-01-optionens-greker,
 * od-02-implicit-volatilitet, km-062-blackscholes) finns i KURSREGISTER
 * (verifierat i 396-registret — spår 5:s rebake lägger TILL kurser,
 * slugarna består; kursKalla faller tillbaka på "Läroplanen" om ett
 * framtide register läcker en slug).
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

// ── Den 1 optionsdjupfrågan ─────────────────────────────────────────────────

export const OPTIONS_DJUP_MONSTER: FragMonster[] = [
  {
    id: "kopoption",
    karnord: [
      "köpoption", "säljoption", "lösenpris", "strikepris", "strike",
      "optionspremie", "tidsvärde", "underliggande", "optionsgreker",
    ],
    starkord: [
      "aktie", "rätt", "avtal", "köpa", "sälja", "premie", "pris",
      "löptid", "utfall", "hävstång", "inlösen", "in the money",
    ],
    bygga: (reg) => {
      const kategoriAntal = reg.filter((r) => r.kategori === "OPTIONS & DERIVAT").length;
      const kallor = [
        kursKalla(reg, "km-059-optionsgrunder", "Läroplanen — options & derivat: avtalet, premin och lösenpriset"),
        kursKalla(reg, "od-01-optionens-greker", "Läroplanen — de fyra grekerna som påverkanskarta"),
        kursKalla(reg, "od-02-implicit-volatilitet", "Läroplanen — tidsvärdets motor bakom premin"),
        kursKalla(reg, "km-062-blackscholes", "Läroplanen — prismodellen som sätter ramen"),
      ];
      const k = kallor[0];
      const km059 = reg.find((r) => r.slug === "km-059-optionsgrunder");
      const od01 = reg.find((r) => r.slug === "od-01-optionens-greker");
      const od02 = reg.find((r) => r.slug === "od-02-implicit-volatilitet");
      return {
        text:
          `En köpoption är ett AVTAL om en rätt — inte en skyldighet — att köpa en underliggande aktie till ett bestämt lösenpris, senast ett bestämt datum. Säljoptionen är samma avtal i spegel: rätten att sälja till lösenpriset. På skärmen heter de call och put — svenska kursen använder de svenska orden, mäklarplattformarna de engelska; det är samma två kontrakt. Tre byggen bär hela mekaniken (allt nedan är utbildning i hur instrumentet FUNGERAR — inga placeringstips):\n\n1️⃣ PREMIEN OCH DE TRE UTFALLEN — aritmetisk illustration med en aktie till 100 kr och en köpoption med lösenpris 100 till premin 5 kr. Vid löptidens slut: är aktien 90 är optionen värdelös och köparens förlust är exakt premin 5 kr per aktie — MAXFÖRLUSTEN står alltså i kontraktet från dag ett, medan den som sålde optionen behåller 5 kr som betalning för risken de tog. Är aktien 110 är optionen värt sitt inre värde 110 − 100 = 10 kr och köparens netto blir 10 − 5 = +5 kr per aktie — +100 % på insatsen mot aktiens +10 %, hävstångens mekanik i en enda rad. Break-even ligger där båda parter går jämnt ut: lösenpris + premie = 100 + 5 = 105. Säljoptionen speglar allt: med lösenpris 100 och premie 4 blir den vid aktiekurs 90 värd 100 − 90 = 10 kr (netto +6) och vid 110 utlöper den värdelös (−4) — rätten att sälja dyrt är värd något bara när marknaden går under lösenpriset.\n2️⃣ TVÅ KLOKOR I VARJE PREMIE — premin är aldrig bara inre värde: den del som är hoppet om fortsatt rörelse är TIDSVÄRDET, och det smälter i takt med att löptiden rinner ut (avtalet är förgängligt — en option kan ha rätt och ändå tappa på att den hade rätt för sent). De fyra grekerna är preminens påverkanskarta: DELTA mäter kurskänsligheten, GAMMA hur delta själv förändras, THETA tidens pris och VEGA känsligheten för volatilitet. Drivkraften bakom både tidsvärde och vega är DEN IMPLICITA VOLATILITETEN — marknadens pris på framtiden, det enda i premin som inte står att läsa ur aktiekursen.\n3️⃣ KONTROLLEN — hela skillnaden mot att äga aktien ligger i rätt mot skyldighet: optionsköparen har en definierad nedsida (premin) och säljaren en definierad uppsida (premin) mot i princip öppen risk på andra sidan. Därför går våra kurser igenom instrumentet som MATEMATIK — vad som händer med utfallen vid olika kurser — aldrig som upplägg att använda.\n\nI kategorin options & derivat finns ${kategoriAntal} kurser — grundkursen (${km059 ? km059.minuter + " min" : "i registret"}) bygger avtal/prem/lösenpris, grekerna (${od01 ? od01.minuter + " min" : "i registret"}) och den implicita volatiliteten (${od02 ? od02.minuter + " min" : "i registret"}) är de två fördjupningarna. Som alltid: detta är utbildning i en mekanism — inga placeringstips.` +
          kallradFler(kallor),
        amne: "kopoption",
        kalla: k,
        kallor,
        handlings: [
          { text: "Kursen: Options-grunder", lank: "/kurser/km-059-optionsgrunder", ikon: "📜", beskrivning: "Avtalet, premin och lösenpriset" },
          { text: "Kursen: Optionens greker", lank: "/kurser/od-01-optionens-greker", ikon: "🧭", beskrivning: "Delta, gamma, theta och vega" },
          { text: "Kursen: Implicit volatilitet", lank: "/kurser/od-02-implicit-volatilitet", ikon: "🌡️", beskrivning: "Marknadens pris på framtiden" },
          { text: "Kursen: Black-Scholes", lank: "/kurser/km-062-blackscholes", ikon: "🧮", beskrivning: "Prismodellen som sätter ramen" },
          { text: "Vad är en option?", lank: "fragor:" + encodeURIComponent("vad är en option?"), ikon: "🪞", beskrivning: "Nästa-lagrets översikt — ett tidigare lager" },
        ],
        motfraga: { text: "Vad är en option?", kategori: "options" },
        fordjupa: { text: k.titel, lank: "/kurser/km-059-optionsgrunder" },
      };
    },
  },
];

// ── Huvudingången ──────────────────────────────────────────────────────────

/**
 * Svara lokalt med NÅGOT av de optionsdjup-mönstren — eller null
 * (då har hela kedjan före redan lämnat null och API-flödet tar över som
 * förr). Ligger SIST i widgetens kedja och kan därför aldrig stjäla en
 * fråga från tidigare lager. Samma matchningssemantik som basmotorn:
 * minst ett kärnord krävs, poäng = kärnord × 3 + stärkord, oavgjort →
 * först deklarerade mönstret vinner (strikt >, deterministiskt). Samma
 * fråga ⇒ bitidentiskt svar.
 */
export function svaraLokaltOptionsdjup(fraga: string, register: RegisterRad[]): LokaltSvar | null {
  const fragaStr = diafri(fraga);
  if (!fragaStr) return null;
  const fragaOrd = fragaStr.split(" ");
  let bast: { svar: LokaltSvar; poang: number } | null = null;
  for (const m of OPTIONS_DJUP_MONSTER) {
    const karnTraff = m.karnord.filter((nk) => traff(fragaOrd, fragaStr, nk));
    if (karnTraff.length === 0) continue; // krav: minst ett kärnord
    const starkTraff = m.starkord?.filter((nk) => traff(fragaOrd, fragaStr, nk)) ?? [];
    const poang = karnTraff.length * 3 + starkTraff.length;
    if (!bast || poang > bast.poang) bast = { svar: m.bygga(register), poang };
  }
  return bast ? bast.svar : null;
}
