/**
 * AI-MENTORN 2.0 — PRAKTIKFÖRHANDSFRÅGOR (spår 6, omgång 6, u3: nivån 38 → 41).
 *
 * Tre ytterligare källmärkta förhandsfrågor ovanpå de tidigare lagren
 * (basens MONSTER i ai-mentor-svar.ts, extra-, makro-, nästa-,
 * kapitalmekanik- och sektor-lagren):
 *   1. Index & passivt ägande (indexfondens aritmetik — Bogleheads-guiden
 *      som primär källa, eftersom am-02 ännu inte finns i mentorregistret)
 *   2. Blankning / short (motsatspositionens mekanik — pf-10 Long/short
 *      med Staley och Lewis som BOKMASTER-djup)
 *   3. Marginalanalys (bruttomarginal, EBITDA-marginal, Du Pont-kedjan)
 *
 * ÄMNESVAL SEN MOT KOLLISIONSKONTROLL (auto-s6 omgång 6, parallella
 * syskon): kärnordsfamiljerna "index/indexfond/etf/passiv",
 * "blanka/blankning/short/kortposition" och "marginal/bruttomarginal/
 * ebitda/vinstmarginal" verifierades fria mot samtliga 38 mönster i sex
 * lager, lästa LIVE ur modulerna (testfall J). Medvetna gränser:
 * "fond/fonder" ägs av basens private-equity-mönster (används här endast
 * som STÄRKORD), "hävstång" av kapitalstruktur-mönstret (endast prosatext),
 * "strategi" av utdelningsmönstret (endast stärkord), och "volatilitet/
 * risk" av basens risk-mönster. Anspråksnotis skriven till syskonen FÖRE
 * byggstart: data/vakten/s6-omg6-u3-ansprak.md.
 *
 * DEFEKT-NOTIS (åtgärdad av syskon under mitt fönster): chat-widget-kedjan
 * hade TAPPAT sektor-lagret (s6-u2:s kapitalmekanik-rad skrev över s6-u1:s
 * kedjerad — sektor-filerna levde men var oåtkomliga). Syskonet s6-u1
 * omgång 5 återkopplade sektor OCH tillförde ett case-lager medan jag
 * byggde; kedjan denna fil hänger sist i är därför
 *   makro ?? extra ?? bas ?? nästa ?? kapitalmekanik ?? sektor ?? case ?? praktik
 * där praktik ligger SIST och därför ALDRIG kan stjäla en fråga från
 * tidigare lager (u1:s bevisade princip). Omvänt vaktar testfall I på att
 * praktikfrågorna INTE fångas av kedjan utan detta lager, och testfall G2
 * på att kommande syskonkärnord (t.ex. case-lagrets) inte fångas här.
 *
 * Matchningen speglar motorns hjälpfunktioner (samma lösning som alla
 * syskonlagren: Node type-stripping löser endast `import type`, så de
 * rena funktionerna speglas hit). Semantisk likhet med motorn BEVISAS
 * av testets felstavningfall (B) och determinismfall (C). Driftvarning:
 * ändras motorns matchning måste denna spegel följa — testfall B vaktar.
 *
 * ── JURIDIKGRINDEN (lagen 2007:528) ──────────────────────────────────
 * All text är pedagogisk utbildning om hur marknadspraktiker, positioner
 * och lönsamhetsmått fungerar — inga köp-/säljsignaler, inga placerings-
 * tips, inga omdömen om enskilda bolag eller värdepapper. Särskilt för
 * blankningsfrågan: mekaniken beskrivs neutralt utan att någon uppmanas
 * att inta någon position.
 *
 * ── DEPENDENCY-INJECTION (samma mönster som hela motorn) ─────────────
 * Registret skickas IN som parameter (endast `import type`) så att
 * verktyg/testa-ai-mentor-praktik.mjs kan köra filen direkt i Node.
 * Källkurserna (the-bogleheads-guide-to-investing,
 * common-sense-on-mutual-funds, pf-03-diversifiering, pf-10-longshort,
 * the-art-of-short-selling, the-big-short, v07-bruttomarginal,
 * v08-ebitda-marginal, ln-01-dupont-analysen) finns i KURSREGISTER — inga
 * väntande registerberoenden. ENDAST am-02-index-och-passivt-agande kommer
 * med syskonets rebake 349→358 och hanteras fallback-säkert via kursKalla
 * (källrad utan slug tills registret fångar den — aldrig en fantomlänk).
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

// ── De 3 praktikförhandsfrågorna ────────────────────────────────────────────

export const PRAKTIK_MONSTER: FragMonster[] = [
  {
    id: "index",
    karnord: [
      "index", "indexet", "indexfond", "indexfonder", "indexfonden",
      "etf", "etfs", "passiv", "passivt", "passiva", "passivt ägande",
    ],
    starkord: [
      "aktier", "aktie", "fonder", "fond", "sparande", "börsen",
      "ägande", "äga", "långsiktigt", "avgift", "avgifter",
    ],
    bygga: (reg) => {
      const passivaDjup = reg.filter((r) => /passiv|bogle|common sense|index/i.test(r.titel + " " + r.slug)).length;
      const kallor = [
        kursKalla(reg, "the-bogleheads-guide-to-investing", "BOKMASTER — den passiva skolans nybörjarguide"),
        kursKalla(reg, "common-sense-on-mutual-funds", "BOKMASTER — Bogles egna argument i sin helhet"),
        kursKalla(reg, "pf-03-diversifiering", "Läroplanen — portföljhantering, korgens spridning"),
        // am-02 finns i registret först efter syskonets rebake 349→358 —
        // kursKalla:s fallback ("Läroplanen", utan slug) gör källraden sann
        // i båda lägena; slugen aktiveras automatiskt när rebaken landar.
        kursKalla(reg, "am-02-index-och-passivt-agande", "Läroplanen — aktiemarknaden i praktiken, indexkursen"),
      ];
      const k = kallor[0];
      return {
        text:
          `Ett aktieindex är en korg av bolag som visar hur en hel marknad — eller en del av den — utvecklas, ungefär som ett temperaturmått för marknaden. Passivt ägande innebär att äga hela korgen (via en indexfond) i stället för att plocka enskilda bolag. Tre mekanismer bär idén:\n\n1. ARITMETIKEN — alla aktieägare TILLSAMMANS är marknaden. Före kostnader blir därför genomsnittsägarens avkastning exakt marknadens; på ett index med 250 bolag är summan av alla som slår indexet precis lika stor som summan av alla som hamnar under det — varje krona som vinns mot indexet tas från någon annan. Det är ingen värdering av vilken metod som är bättre, bara en bokföringsidentitet.\n2. AVGIFTEN ÄR DEN ENDA SÄKRA SKILLNADEN — en aktivt förvaltad fonds avgift dras av resultatet innan det når spararen. Skillnaden 0,2 % mot 1,5 % per år låter liten men är 1 300 kr om året på 100 000 kr — varje år, och ränta-på-ränta gör avståndet större med tiden. Därför börjar den passiva skolan alltid sin analys i kostnaderna.\n\n3. SPRIDNINGEN FÖLJER MED — korgen äger allt: sektorer man gillar, bolag man aldrig skulle undersöka. Det är samtidigt styrkan (bredd, ingen enskild katastrof) och priset (man äger också det man inte tror på) — en medveten avvägning som varje ägarskola gör på sitt sätt.\n\nI registrets ${reg.length} kurser är det ${passivaDjup} BOKMASTER-djup som bär den passiva skolan — Bogleheads-guiden (nybörjaringången) och John Bogles eget Common Sense. Det här är en beskrivning av en ägarskola bland flera — inte ett råd om vilken form ditt sparande ska ha.` +
          kallradFler(kallor),
        amne: "index",
        kalla: k,
        kallor,
        handlings: [
          { text: "BOKMASTER: Bogleheads-guiden", lank: "/kurser/the-bogleheads-guide-to-investing", ikon: "📗", beskrivning: "Nybörjaringången i passivt ägande" },
          { text: "BOKMASTER: Common Sense on Mutual Funds", lank: "/kurser/common-sense-on-mutual-funds", ikon: "📘", beskrivning: "Bogles egna argument" },
          { text: "Kursen: Diversifiering", lank: "/kurser/pf-03-diversifiering", ikon: "🧺", beskrivning: "Korgens spridning förklarad" },
          { text: "Vad är risk?", lank: "fragor:" + encodeURIComponent("vad är risk?"), ikon: "⚠️", beskrivning: "Avkastningens andra sida" },
        ],
        motfraga: { text: "Hur bygger jag en portfölj?", kategori: "portfölj" },
        fordjupa: { text: k.titel, lank: "/kurser/the-bogleheads-guide-to-investing" },
      };
    },
  },
  {
    id: "blankning",
    karnord: [
      "blanka", "blankning", "blankningar", "blankare", "blankarna",
      "short", "shorts", "shorta", "kortposition", "kortpositioner",
      "kort position",
    ],
    starkord: [
      "aktie", "aktier", "bolag", "fungerar", "mekanism", "hedge",
      "hedging", "tjäna", "position",
    ],
    bygga: (reg) => {
      const portfoljAntal = reg.filter((r) => r.kategori === "PORTFÖLJHANTERING").length;
      const kallor = [
        kursKalla(reg, "pf-10-longshort", "Läroplanen — portföljhantering, positionsteknikens kurs"),
        kursKalla(reg, "the-art-of-short-selling", "BOKMASTER — Staley: blankningens hantverk"),
        kursKalla(reg, "the-big-short", "BOKMASTER — Lewis: 2008 års fallstudie"),
      ];
      const k = kallor[0];
      return {
        text:
          `Att blanka (gå "short") är motsatsen till att äga en aktie i hopp om uppgång: mekaniken ger vinst när kursen FALLER. De fyra stegen ÄR pedagogiken:\n\n1. LÅNA AKTIERNA — du lånar 100 aktier av en ägare (via mäklare) och lämnar dem vidare på marknaden till dagens kurs, säg 50 kr — in på kontot kommer 5 000 kr, men skulden är 100 aktier, inte pengar.\n2. LÄMNA TILLBAKA — förr eller senare måste du förvärva samma 100 aktier på marknaden och återlämna dem till ägaren. Det är positionens "stängning".\n3. RESULTATET BEROR PÅ KURSEN — sjunker aktien till 40 kr kostar det 4 000 kr att ställa dig fri; skillnaden 1 000 kr är mekanikens vinst. Stiger den till 60 kr kostar det 6 000 kr — då är förlusten 1 000 kr. Notera asymmetrin: en lång positions värsta fall är insatsen (kursen till noll), men en kort positions förlust har inget tak, för en kurs kan stiga hur långt som helst.\n4. KOSTNADERNA — Blankaren betalar ofta låneränta till ägaren och måste ersätta utdelningar under lånets tid (att blanka ett utdelningsbolag kostar alltså utdelningen). Därför är blankning ett yrke med egen kurslitteratur — i portföljhanterskategorins ${portfoljAntal} kurser är det Long/short-kursen som äger tekniken, och historiens mest kända fallstudie är "The Big Short" om de få som ställde sig korta mot amerikanska bolåneobligationer inför 2008.\n\nDetta är en beskrivning av en marknadsmekanik — ingen uppmaning att inta någon position, i någon riktning.` +
          kallradFler(kallor),
        amne: "blankning",
        kalla: k,
        kallor,
        handlings: [
          { text: "Kursen: Long/short — hedging", lank: "/kurser/pf-10-longshort", ikon: "🔄", beskrivning: "Positionsteknikens kurs" },
          { text: "BOKMASTER: The Art of Short Selling", lank: "/kurser/the-art-of-short-selling", ikon: "📕", beskrivning: "Staley — hantverket från grunden" },
          { text: "BOKMASTER: The Big Short", lank: "/kurser/the-big-short", ikon: "🎬", beskrivning: "Lewis — 2008 års fallstudie" },
          { text: "Vad är en option?", lank: "fragor:" + encodeURIComponent("vad är en option?"), ikon: "🎛️", beskrivning: "Syskoninstrumentet med tidsvärde" },
        ],
        motfraga: { text: "Vad är kapitalstruktur och hävstång?", kategori: "kapitalstruktur" },
        fordjupa: { text: k.titel, lank: "/kurser/pf-10-longshort" },
      };
    },
  },
  {
    id: "marginal",
    // Ansvarsfördelning (s6-u2:s emission/V19-precedens): orden "marginal",
    // "marginalen", "marginaler", "bruttomarginal", "ebitda" och
    // "ebitda-marginal" ägs av basens data-drivna V-uppslag (titelorden ur
    // v07-bruttomarginal/v08-ebitda-marginal, träffade med samma
    // felstavningstolerans) — frågor med dem får variabel-V-svaret (ockå
    // källmärkt) i kedjan. Detta mönster äger familjeorden basen INTE har
    // som variabeltitlar: vinstmarginal, rörelsemarginal, marginalanalys.
    // Bevisas av kedjetestet fall H (kanonisk → marginal) och I (V-ord →
    // tidigare lager, medvetet).
    karnord: [
      "vinstmarginal", "vinstmarginalen", "rörelsemarginal",
      "rörelsemarginalen", "marginalanalys",
    ],
    starkord: [
      "marginal", "marginalen", "marginaler", "bruttomarginal",
      "bruttomarginalen", "ebitda", "ebitda-marginal",
      "bolag", "bolaget", "aktie", "aktier", "analys", "analysera",
      "betyder", "nyckeltal", "lönsamhet", "lönsamt", "intäkter",
    ],
    bygga: (reg) => {
      const losamhetAntal = reg.filter((r) => r.kategori === "LÖNSAMHET").length;
      const kallor = [
        kursKalla(reg, "v07-bruttomarginal", "Läroplanen — lönsamhet, prissättningskraftens mått"),
        kursKalla(reg, "v08-ebitda-marginal", "Läroplanen — lönsamhet, trappans nästa steg"),
        kursKalla(reg, "ln-01-dupont-analysen", "Läroplanen — lönsamhet, ROE i tre bitar"),
      ];
      const k = kallor[0];
      return {
        text:
          `Marginalen besvarar frågan "hur mycket av varje intjänad krona blir kvar?" — och VAR i resultaträkningen den klipper avslöjar vad som driver bolaget. Tre steg gör familjen begriplig:\n\n1. BRUTTOMARGINALEN — (intäkter − kostnad för sålda varor) ÷ intäkter. Intäkter 1 000 mkr och varukostnad 600 mkr ger (1 000 − 600) ÷ 1 000 = 40 %. Måttet visar prissättningskraften: hur mycket marknaden betalar över det som produkten kostar att tillverka — kraft som kommer från varumärke, teknik eller brist på konkurrenter.\n2. EBITDA-MARGINALEN — klipper senare i samma trappa: efter löner, marknadsföring och lokaler, men före avskrivningar. Den gör bolag med olika investeringstakt jämförbara och visar driftens lönsamhet. Avståndet mellan brutto- och EBITDA-marginal berättar hur tung verksamheten är att driva.\n3. MARGINALENS HÄVSTÅNG — 1 procentenhet marginal på 1 mdr i intäkter är 10 mkr i resultat. Ju lägre marginalnivån är, desto större är den relativa förändringen av samma procentenhet: vid 10 % bruttomarginal betyder +1 pp hela +10 % bruttoresultat, vid 40 % bara +2,5 %. Därför väger marginalnyheter tungt i rapportläsningen.\n\nDu Pont-kedjan binder ihop helheten: ROE = vinstmarginal × omsättningshastighet × kapitalhävstång — två bolag kan nå samma aktieägaravkastning på helt olika vägar (marginalfirma respektive volymfirma). Kategorin lönsamhet har ${losamhetAntal} kurser i registret, från bruttomarginalens grunder till Du Pont-analysen.` +
          kallradFler(kallor),
        amne: "marginal",
        kalla: k,
        kallor,
        handlings: [
          { text: "Kursen: Bruttomarginal", lank: "/kurser/v07-bruttomarginal", ikon: "📐", beskrivning: "Prissättningskraftens mått" },
          { text: "Kursen: EBITDA-marginal", lank: "/kurser/v08-ebitda-marginal", ikon: "📊", beskrivning: "Trappans nästa steg" },
          { text: "Kursen: Du Pont-analysen", lank: "/kurser/ln-01-dupont-analysen", ikon: "🧩", beskrivning: "ROE plockad i tre bitar" },
          { text: "Vad är nyckeltal?", lank: "fragor:" + encodeURIComponent("vad är nyckeltal?"), ikon: "📏", beskrivning: "Familjen som marginalen tillhör" },
        ],
        motfraga: { text: "Hur läser jag en kvartalsrapport?", kategori: "rapportläsning" },
        fordjupa: { text: k.titel, lank: "/kurser/v07-bruttomarginal" },
      };
    },
  },
];

// ── Huvudingången ──────────────────────────────────────────────────────────

/**
 * Svara lokalt med NÅGOT av de tre praktikmönstren — eller null (då har
 * hela kedjan före redan lämnat null och API-flödet tar över som förr).
 * Samma matchningssemantik som basmotorn: minst ett kärnord krävs,
 * poäng = kärnord × 3 + stärkord, oavgjort → först deklarerade mönstret
 * vinner (strikt >, deterministiskt). Samma fråga ⇒ bitidentiskt svar.
 */
export function svaraLokaltPraktik(fraga: string, register: RegisterRad[]): LokaltSvar | null {
  const fragaStr = diafri(fraga);
  if (!fragaStr) return null;
  const fragaOrd = fragaStr.split(" ");
  let bast: { svar: LokaltSvar; poang: number } | null = null;
  for (const m of PRAKTIK_MONSTER) {
    const karnTraff = m.karnord.filter((nk) => traff(fragaOrd, fragaStr, nk));
    if (karnTraff.length === 0) continue; // krav: minst ett kärnord
    const starkTraff = m.starkord?.filter((nk) => traff(fragaOrd, fragaStr, nk)) ?? [];
    const poang = karnTraff.length * 3 + starkTraff.length;
    if (!bast || poang > bast.poang) bast = { svar: m.bygga(register), poang };
  }
  return bast ? bast.svar : null;
}
