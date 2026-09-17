/**
 * AI-MENTORN 2.0 — TS-DJUP-FÖRHANDSFRÅGOR (spår 6, omgång 10: nivån 54 → 58).
 *
 * Fyra ytterligare källmärkta förhandsfrågor ovanpå de tretton tidigare
 * lagren — från AK1TS-familjen, registrets största otäckta kursfamilj
 * (25 kurser i kategorin AK1TS FÖRDJUPNING):
 *   1. Fibonacci-retracements & det gyllene snittet (ts-03 primär; ts-07
 *      Lucas-talserien och ts-20 harmoniska mönster som syskonkällor)
 *   2. Fibonacci-extensions, kluster & tidszoner (ts-04 primär; ts-21 +
 *      ts-19 som syskonkällor)
 *   3. Gann-vinklar & cyklar (ts-05 primär; ts-06 + tidsdimensionen)
 *   4. Volymens djupstrukturer — profil/VPOC, order flow, market profile
 *      (ts-09 primär; ts-24, ts-25, ts-08, ts-23 som syskonkällor)
 *
 * ÄMNESVAL EFTER KOLLISIONSKONTROLL (auto-s6 omgång 10, parallella syskon):
 * kärnordsfamiljerna "fibonacci/retracement/gyllene snittet/lucas",
 * "extension/kluster/tidszon", "gann/tidscykel" och
 * "volymanalys/volymprofil/vpoc/order flow/marknadsdjup/value area" är
 * sonderade FRIA genom HELA den tretton lagerskedjan (54 monsters, 624
 * kärnord — kontrolleras MEKANISKT av testens G2-/I-fall, som läser
 * lagren live). Ord som ÄGS av tidigare lager (ansvarsfördelningen enligt
 * emission/V19-precedensen): basens teknisk-monster äger
 * candlestick/rsi/macd/bollinger/trendlinje/moving average/stöd och
 * motstånd/chart/diagram, impulsvag-monstret äger elliott/impulsvåg/5-vågs,
 * ak1ts-monstret äger våglära/25-cellers/tidshorisonter, och basens
 * aktiemarknads-monster äger "spread" — därför är Volume Spread Analysis
 * (ts-23) endast KÄLLA här, aldrig kärnord, och "volym" ensamt (tillväxt-
 * familjens ord) är medvetet strejkat: detta lager äger bara
 * volym-sammansättningarna (volymanalys, volymprofil …). KORTORDSKUREN
 * (omgång 10, testfall E): "gann" ensamt (4 bokstäver, tål 1 fel enligt
 * motorns matchning) fångade vanliga svenska ord — "vem vann …?" gav ett
 * Gann-svar — och är därför MEDVETET struket som kärnord; namnet bärs av
 * sammansättningarna (gannvinklar/ganncyklar …), "ganns" och frasen
 * "w d gann" i stället (samma försiktighet som motorn använder för korta
 * ord i allmänhet).
 *
 * Matchningen speglar motorns hjälpfunktioner (samma lösning som övriga
 * syskonlager: Node type-stripping löser endast `import type`, så de rena
 * funktionerna speglas hit). Semantisk likhet med motorn BEVISAS av
 * testets felstavningfall (B) och determinismfall (D). Driftvarning:
 * ändras motorns matchning måste denna spegel följa — testfall B vaktar.
 *
 * SAMMANSÄTTNING (chat-widget.tsx):
 *   svaraLokaltMakro ?? svaraLokaltExtra ?? svaraLokalt ?? svaraLokaltNasta
 *     ?? svaraLokaltKapitalmekanik ?? svaraLokaltSektor ?? svaraLokaltCase
 *     ?? svaraLokaltPraktik ?? svaraLokaltPortfoljgrund ?? svaraLokaltAgande
 *     ?? svaraLokaltRedovisningsdjup ?? svaraLokaltDjup ?? svaraLokaltHistoria
 *     ?? svaraLokaltTsdjup
 * Detta lager wire:ades SIST i kedjan (fjortonde positionen, elfte
 * tillämpningen av u1:s princip) — under samma fabriksomgång tillkom
 * syskonet u3:s skattedjup EFTER detta lager (parallellfabrikens
 * realitet); SIST-principen gäller per wire-tillfälle och lagret kan
 * fortfarande aldrig stjäla en fråga från tidigare lager — det fångar
 * bara frågor som alla andra lämnar null på.
 *
 * ── JURIDIKGRINDEN (lagen 2007:528) ──────────────────────────────────
 * All text är pedagogisk utbildning om hur verktygen fungerar — inga
 * köp-/säljsignaler, inga rekommendationer, inga prognoser. Nivåer och
 * vinklar beskrivs som ARITMETIK och HISTORIA, aldrig som handlingsråd;
 * varje svar säger uttryckligen att verktygen aldrig används ensamma.
 *
 * ── DEPENDENCY-INJECTION (samma mönster som hela motorn) ─────────────
 * Registret skickas IN som parameter (endast `import type`) så att
 * verktyg/testa-ai-mentor-tsdjup.mjs kan köra filen direkt i Node.
 * Alla källkurser (ts-03, ts-04, ts-05, ts-06, ts-07, ts-08, ts-09,
 * ts-19, ts-20, ts-21, ts-23, ts-24, ts-25, trading-for-a-living) finns
 * i KURSREGISTER — inga väntande beroenden.
 */

import type { RegisterRad } from "./ai-mentor-register";
import type { FragMonster, LokalKalla, LokaltSvar } from "./ai-mentor-svar";

// ── Hjälpbyggare — spegling av motorns (ai-mentor-svar.ts) ────────────────
// Samma driftvarning som syskonlagren: speglade rena funktioner, bevisade
// likvärdiga av regressionstestet (fall B + D).

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
 * av testfall E ("📖 Källor (").
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

/** Registerfakta vid svarstid — inga hårdkodade siffror som blir lögn(er). */
function fa(r: RegisterRad | undefined): string {
  return r ? `${r.kapitel} kapitel · ${r.minuter} min${r.quiz ? ` · ${r.quiz} quizfrågor` : ""}` : "kursregistret";
}

// ── De 4 ts-djup-frågorna ───────────────────────────────────────────────────

export const TSDJUP_MONSTER: FragMonster[] = [
  {
    id: "fibonacci",
    karnord: [
      "fibonacci", "fibonaccis", "fibonaccital", "fibonaccitalen",
      "fibonaccitalserie", "fibonacci talserie", "fibonacciserien",
      "fibonacciretracements", "fibonacciretracement",
      "retracement", "retracements", "tillbakadragning", "tillbakadragningar",
      "gyllene snittet", "gyllene snitt", "gyllene ratio",
      "lucas", "lucastal", "lucas talserie", "lucastalserie",
    ],
    starkord: ["nivåer", "nivå", "talserie", "teori", "teknisk", "kvot"],
    bygga: (reg) => {
      const retr = reg.find((r) => r.slug === "ts-03-fibonacciretracements");
      const lucas = reg.find((r) => r.slug === "ts-07-lucastalserie");
      const klu = reg.find((r) => r.slug === "ts-21-fibonaccikluster");
      const harm = reg.find((r) => r.slug === "ts-20-harmoniska-monster");
      const tsAntal = reg.filter((r) => r.kategori === "AK1TS FÖRDJUPNING").length;
      const kallor = [
        kursKalla(reg, "ts-03-fibonacciretracements", "Läroplanen — AK1TS-fördjupning, kursen om fibonacci-retracements"),
        kursKalla(reg, "ts-07-lucastalserie", "Läroplanen — AK1TS-fördjupning, talseriens kusin med samma kvot"),
        kursKalla(reg, "ts-21-fibonaccikluster", "Läroplanen — AK1TS-fördjupning, där nivåerna samlas till zoner"),
        kursKalla(reg, "ts-20-harmoniska-monster", "Läroplanen — AK1TS-fördjupning, mönster byggda av samma förhållanden"),
      ];
      const k = kallor[0];
      return {
        text:
          `Fibonacci-retracements är teknisk analysens sätt att mäta hur djup en motrörelse kan bli — med aritmetik ur en 800 år gammal talserie. Allt nedan är utbildning i metoden, aldrig signaler om någon kurs.\n\n1️⃣ TALSERIEN OCH KVOTEN — Leonardo av Pisas talserie (1202): 1, 1, 2, 3, 5, 8, 13, 21, 34, 55 … varje tal är summan av de två föregående. Dela ett tal med nästa: 8 ÷ 13 = 0,615, 13 ÷ 21 = 0,619, 34 ÷ 55 = 0,618 — kvoten konvergerar mot cirka 0,618, det gyllene snittet (och 21 ÷ 34 = 0,6176, 34 ÷ 55 = 0,6182: konvergensen är själva poängen). Kursen om retracements (${retr ? retr.minuter + " min, " + retr.niva.toLowerCase() : "i registret"}) bygger nivåerna från grunden.\n2️⃣ NIVÅERNA — dras en linje mellan en svängs låg och hög; de klassiska nivåerna är 23,6 %, 38,2 %, 50 %, 61,8 % och 78,6 %. Två aritmetiska kurioser: 38,2 % är 0,618 i kvadrat (0,618 × 0,618 = 0,382) och 23,6 % är 0,618 i kubik — nivåerna är talseriens inre struktur, inte gissningar. (50 % är däremot INTE fibonacci: det är ett arv från Dow-teorin som behållits av tradition.)\n3️⃣ LUCAS — VÄRLDENS FINASTE KURIOSA — Lucas-talserien (${lucas ? lucas.minuter + " min" : "i registret"}) startar 2, 1, 3, 4, 7, 11, 18, 29, 47 … med SAMMA rekursion men andra starttal — och kvoten konvergerar mot samma 0,618 (29 ÷ 47 = 0,617). Lärdomen är djupare än kuriosan: förhållandet är robust, den enskilda serien är godtycklig — därför handlar nivåanalys om ZONER (${klu ? klu.minuter + " min kluster-kurs" : "kluster-kursen"}), inte om exakta linjer.\n\nHur används det på AK1TS-vis? Som EN av flera dimensioner i konfluensen — värde möter vågor: en fibonacci-nivå betyder något först när fundamental bild, vågstruktur och volym pekar samma håll (${harm ? harm.titel + " bygger sina mönster av exakt dessa förhållanden" : "harmoniska mönster bygger på samma förhållanden"}). AK1TS-familjen bär ${tsAntal} fördjupningskurser. Som alltid: verktyget är utbildning i att strukturera en iakttagelse — aldrig ett handlingsråd.` +
          kallradFler(kallor),
        amne: "fibonacci",
        kalla: k,
        kallor,
        handlings: [
          { text: `Kursen: Fibonacci-retracements${retr ? " · " + retr.minuter + " min" : ""}`, lank: "/kurser/ts-03-fibonacciretracements", ikon: "📐", beskrivning: `${fa(retr)} · nivå ${retr?.niva.toLowerCase() || "intermediär"}` },
          { text: `Kursen: Lucas-talserien${lucas ? " · " + lucas.minuter + " min" : ""}`, lank: "/kurser/ts-07-lucastalserie", ikon: "🔢", beskrivning: "Kusinen med samma kvot — intermediär" },
          { text: `Kursen: Fibonacci-kluster${klu ? " · " + klu.minuter + " min" : ""}`, lank: "/kurser/ts-21-fibonaccikluster", ikon: "🎯", beskrivning: "Från linjer till zoner — avancerad" },
          { text: "Vad är konfluens?", lank: "fragor:" + encodeURIComponent("vad är konfluens?"), ikon: "🔀", beskrivning: "När dimensionerna möts — basens genomgång" },
        ],
        motfraga: { text: "Vad är konfluens?", kategori: "konfluens" },
        fordjupa: { text: k.titel, lank: "/kurser/ts-03-fibonacciretracements" },
      };
    },
  },
  {
    id: "extension",
    karnord: [
      "extension", "extensions", "förlängning", "förlängningar",
      "fibonacciextensions", "fibonacciextension",
      "förlängningsnivåer", "projicering", "projiceringar",
      "kluster", "klustret", "klusterzon", "klusterzoner", "klusterzonen",
      "fibonaccikluster", "tidszon", "tidszoner", "tidszonerna",
      "fibonaccitidszoner",
    ],
    starkord: ["fibonacci", "nivåer", "mål", "target", "tid", "teknisk"],
    bygga: (reg) => {
      const ext = reg.find((r) => r.slug === "ts-04-fibonacciextensions");
      const klu = reg.find((r) => r.slug === "ts-21-fibonaccikluster");
      const tid = reg.find((r) => r.slug === "ts-19-fibonaccitidszoner");
      const retr = reg.find((r) => r.slug === "ts-03-fibonacciretracements");
      const kallor = [
        kursKalla(reg, "ts-04-fibonacciextensions", "Läroplanen — AK1TS-fördjupning, kursen om fibonacci-extensions"),
        kursKalla(reg, "ts-21-fibonaccikluster", "Läroplanen — AK1TS-fördjupning, överlappande nivåer blir zoner"),
        kursKalla(reg, "ts-19-fibonaccitidszoner", "Läroplanen — AK1TS-fördjupning, serien räknad i tiden"),
        kursKalla(reg, "ts-03-fibonacciretracements", "Läroplanen — AK1TS-fördjupning, retracements som motpol"),
      ];
      const k = kallor[0];
      return {
        text:
          `Fibonacci-extensions är talseriens FRAMÅT-sida: där retracements mäter hur djup en motrörelse kan bli, mäter extensions hur långt nästa våg kan nå. Utbildning i aritmetiken — inte kursprognoser.\n\n1️⃣ EXTENSION-TALEN — klassiska nivåer är 127,2 %, 161,8 % och 261,8 % av föregående sväng, och de är släkt med varandra genom ren matematik: 1 ÷ 0,618 ≈ 1,618 (det gyllene snittet är sin egen invers plus ett), 1,272 är roten ur 1,618, och 1,618 × 1,618 = 2,618. Kursen (${ext ? ext.minuter + " min, " + ext.niva.toLowerCase() : "i registret"}) räknar dem på riktiga diagram steg för steg.\n2️⃣ KLUSTRET — där linjer blir zon — en enskild nivå är ett tunt streck, men när en extension från en våg, en retracement från en annan (${retr ? retr.titel.toLowerCase() : "retracements-kursen"}) och en tidigare omsättningszon ligger inom något par procent av varandra uppstår ett KLUSTER (${klu ? klu.minuter + " min kurs" : "kurs i registret"}) — signifikansen sitter i överlappet, inte i den enskilda linjen. Det är ts-familjens viktigaste metodlärdom: precisionens illusion är verktygets största fiende.\n3️⃣ TIDSSONERNA — den mest experimentella grenen: talserien räknas framåt i dagar (5, 8, 13, 21 …) från en svängtopp, och vertikala linjer markerar där "tidens rytm" kan sammanfalla med vändpunkter (${tid ? tid.minuter + " min, avancerad" : "i registret"}). Ärligheten i kursen: av alla fibonacci-tillämpningar har tidszonerna det svagaste empiriska stödet — de undervisas som ett sätt att TÄNKA på tid som dimension, inte som en klocka.\n\nI AK1TS används extensions som målhypoteser i konfluensen — ett skelett som fundamental bild och vågstruktur får ge kött, aldrig tvärtom. Som alltid: detta är verktygslära, aldrig råd om positioner.` +
          kallradFler(kallor),
        amne: "extension",
        kalla: k,
        kallor,
        handlings: [
          { text: `Kursen: Fibonacci-extensions${ext ? " · " + ext.minuter + " min" : ""}`, lank: "/kurser/ts-04-fibonacciextensions", ikon: "📏", beskrivning: `${fa(ext)} · nivå ${ext?.niva.toLowerCase() || "intermediär"}` },
          { text: `Kursen: Fibonacci-kluster${klu ? " · " + klu.minuter + " min" : ""}`, lank: "/kurser/ts-21-fibonaccikluster", ikon: "🎯", beskrivning: "Överlappen som gör linjer till zoner" },
          { text: `Kursen: Fibonacci-tidszoner${tid ? " · " + tid.minuter + " min" : ""}`, lank: "/kurser/ts-19-fibonaccitidszoner", ikon: "⏳", beskrivning: "Serien i tiden — avancerad, kritiskt belyst" },
          { text: "Vad är fibonacci-retracements?", lank: "fragor:" + encodeURIComponent("vad är fibonacci retracements?"), ikon: "📐", beskrivning: "Motpolen: att mäta bakåt — detta lager" },
        ],
        motfraga: { text: "Vad är fibonacci-retracements?", kategori: "fibonacci" },
        fordjupa: { text: k.titel, lank: "/kurser/ts-04-fibonacciextensions" },
      };
    },
  },
  {
    id: "gann",
    karnord: [
      "gannvinklar", "gann vinklar", "gannvinkel", "gannvinkeln",
      "ganncyklar", "gann cyklar", "ganncykel", "ganncykeln",
      "ganns", "w d gann",
      "tidscykel", "tidscykler", "tidscykeln", "cykelanalys",
    ],
    starkord: ["vinkel", "vinklar", "cykler", "cykel", "tid", "geometri", "teknisk"],
    bygga: (reg) => {
      const vink = reg.find((r) => r.slug === "ts-05-gannvinklar");
      const cyk = reg.find((r) => r.slug === "ts-06-ganncyklar");
      const tid = reg.find((r) => r.slug === "ts-19-fibonaccitidszoner");
      const elder = reg.find((r) => r.slug === "trading-for-a-living");
      const kallor = [
        kursKalla(reg, "ts-05-gannvinklar", "Läroplanen — AK1TS-fördjupning, kursen om Gann-vinklar"),
        kursKalla(reg, "ts-06-ganncyklar", "Läroplanen — AK1TS-fördjupning, Gann-cyklarna och tiden"),
        kursKalla(reg, "ts-19-fibonaccitidszoner", "Läroplanen — AK1TS-fördjupning, tidsdimensionen i släktmetoden"),
        kursKalla(reg, "trading-for-a-living", "Läroplanen — bokmästaren, Elders disciplin och journaler"),
      ];
      const k = kallor[0];
      return {
        text:
          `W.D. Gann (1878–1955) är teknisk analysens mest mytomspunna gestalt — en tidig amerikansk trader som tog PRIS och TID på allvar som lika värda dimensioner. Historien som utbildning, med båda delarna synliga:\n\n1️⃣ VINKLARNA — Ganns kärna är att en enhet tid ska balansera en enhet pris: den berömda 1x1-vinkeln (kallad 45-graderslinjen) stiger en prisenhet per tidsenhet, med brantare och flackare syskonvinklar ovanför och under. När kursen "rinner ifrån" sin linje är balansen rubbad — idén är geometri som tidsaxel, inte magi (${vink ? vink.minuter + " min, " + vink.niva.toLowerCase() : "i registret"}).\n2️⃣ CYKLARNA — Gann ansåg att tiden har rytm: årsdagar, återkommande cykler och långa cykler (som den omtalade 90-årscykeln) skulle sammanfalla med vändpunkter (${cyk ? cyk.minuter + " min kurs" : "kurs i registret"}). Ärligheten i kursen — och i hela AK1TS-familjen: detta är den gren där underlaget är svagast; cyklerna undervisas som HISTORIA och tankeverktyg, aldrig som klocka (samma ödmjuka hållning som fibonacci-tidszonerna, ${tid ? tid.titel.toLowerCase() : "tidszoner-kursen"}).\n3️⃣ MYTEN OCH HANTVERKET — Gann efterlämnade både noggranna börsböcker och esoteriska kvadrater; legender om hans framgångar växte efter hans död. Det bestående, lärrika arvet är det andra: han DOKUMENTERADE — journaler, regler, kontroll av risk — vilket är raka släktskapet till Elders Trading for a Living (${elder ? "bokmästarkurs, " + elder.minuter + " min" : "i bokmästaren"}): disciplinen överlever metodens mode.\n\nI AK1TS är Gann ett kapitel i verktygshistorien: förstå varför vinklar och cykler föll i onåd, vad som var hantverk och vad som var myt — kunskapen gör dig härdad mot varje ny "exakt vinkel"-berättelse. Utbildning i metodkritik, aldrig signaler.` +
          kallradFler(kallor),
        amne: "gann",
        kalla: k,
        kallor,
        handlings: [
          { text: `Kursen: Gann-vinklar${vink ? " · " + vink.minuter + " min" : ""}`, lank: "/kurser/ts-05-gannvinklar", ikon: "📏", beskrivning: `${fa(vink)} · nivå ${vink?.niva.toLowerCase() || "avancerad"}` },
          { text: `Kursen: Gann-cyklar${cyk ? " · " + cyk.minuter + " min" : ""}`, lank: "/kurser/ts-06-ganncyklar", ikon: "🔄", beskrivning: "Tiden som dimension — kritiskt belyst" },
          { text: "Boken som kurs: Trading for a Living", lank: "/kurser/trading-for-a-living", ikon: "📓", beskrivning: "Elder — journalernas och disciplinens fader" },
          { text: "Vad är teknisk analys?", lank: "fragor:" + encodeURIComponent("vad är teknisk analys?"), ikon: "📊", beskrivning: "Fältet Gann verkar i — basens genomgång" },
        ],
        motfraga: { text: "Vad är teknisk analys?", kategori: "teknisk analys" },
        fordjupa: { text: k.titel, lank: "/kurser/ts-05-gannvinklar" },
      };
    },
  },
  {
    id: "volymdjup",
    karnord: [
      "volymanalys", "volymanalysen", "volymprofil", "volymprofilen",
      "volymprofiler", "vpoc", "order flow", "orderflow", "orderflöde",
      "marknadsdjup", "market profile", "value area", "värdeområde",
    ],
    starkord: ["volym", "profil", "djup", "likviditet", "omsättning", "teknisk"],
    bygga: (reg) => {
      const vpoc = reg.find((r) => r.slug === "ts-09-volymprofiler");
      const flow = reg.find((r) => r.slug === "ts-24-order-flow");
      const mprof = reg.find((r) => r.slug === "ts-25-market-profile");
      const grund = reg.find((r) => r.slug === "ts-08-volymanalys");
      const vsa = reg.find((r) => r.slug === "ts-23-volume-spread-analysis-vsa");
      const kallor = [
        kursKalla(reg, "ts-09-volymprofiler", "Läroplanen — AK1TS-fördjupning, kursen om volymprofiler och VPOC"),
        kursKalla(reg, "ts-24-order-flow", "Läroplanen — AK1TS-fördjupning, orderflödet och marknadsdjupet"),
        kursKalla(reg, "ts-25-market-profile", "Läroplanen — AK1TS-fördjupning, Steidlmayers ursprungsmetod"),
        kursKalla(reg, "ts-08-volymanalys", "Läroplanen — AK1TS-fördjupning, volymanalysens grunder"),
        kursKalla(reg, "ts-23-volume-spread-analysis-vsa", "Läroplanen — AK1TS-fördjupning, att läsa volym mot prisanslag"),
      ];
      const k = kallor[0];
      return {
        text:
          `Volymens djupstrukturer svarar på frågan efter "hur mycket" — nämligen VAR och AV VEM det handlades. Tre kurser håller ihop fältet (${grund ? grund.titel + " som grund" : "grunderna"}, profilerna och flödet). Allt nedan är verktygslära, aldrig råd.\n\n1️⃣ PROFILEN OCH VPOC — en volymprofil är ett horisontellt histogram: för varje PRISNIVÅ summeras hur mycket som handlades under en period. Den högsta stapeln — priset med mest avhandlad volym — är VPOC, Volume Point of Control (${vpoc ? vpoc.minuter + " min, " + vpoc.niva.toLowerCase() : "i registret"}): periodens tyngdpunkt, dit handeln återvänder när den söker "rättvisa" pris. Runt VPOC ligger value area, värdeområdet, som i praxis täcker cirka 70 procent av volymen (ankring i normalfördelningens cirka 68 procent — statistik, inte magi).\n2️⃣ KLOCKFORM = BALANS, UTDRAGEN FORM = TREND — det är kärnan i Market Profile (${mprof ? mprof.minuter + " min" : "i registret"}), J. Peter Steidlmayers metod från 1980-talets börsparker: en klockformad profil betyder att köpare och säljare är överens om värdet (balansdag), en utdragen profil betyder att ena sidan jagar priset (trenddag). Formen är information — profilens sätt att berätta vem som har initiativet.\n3️⃣ ORDER FLOW — DJUPT BAKOM KURSEN — nästa nivå är orderboken i realtid: synliga bud och giv, marknadsdjupet (${flow ? flow.minuter + " min" : "i registret"}), och konsten att läsa när stora order parkeras eller dras tillbaka. Volume Spread Analysis (${vsa ? vsa.minuter + " min" : "i registret"}) är den klassiska släktmetoden: samspelet mellan volym, prisrörelse och räckvidd för att spåra professionellt deltagande — notera namnet: "spread" i VSA är prisanslagets utsträckning, ett helt annat begrepp än handelsspreaden i likviditetsutbildningen.\n\nKopplingen till det fundamentala: VPOC är priset där FLEST ägare byggts — därför blir profilerade nivåer stöd och motstånd med känsla (människor som sitter på fel sida om snittet). I AK1TS bekräftar volymen vågbilden (klassiskt bärs tredje vågen av högst volym) — dimension ett, aldrig dimension enda. Utbildning i marknadens mikrostruktur, inga prognoser.` +
          kallradFler(kallor),
        amne: "volymdjup",
        kalla: k,
        kallor,
        handlings: [
          { text: `Kursen: Volym-profiler — VPOC${vpoc ? " · " + vpoc.minuter + " min" : ""}`, lank: "/kurser/ts-09-volymprofiler", ikon: "📊", beskrivning: `${fa(vpoc)} · nivå ${vpoc?.niva.toLowerCase() || "avancerad"}` },
          { text: `Kursen: Order Flow — marknadsdjup${flow ? " · " + flow.minuter + " min" : ""}`, lank: "/kurser/ts-24-order-flow", ikon: "🌊", beskrivning: "Betalorderboken i realtid" },
          { text: `Kursen: Market Profile${mprof ? " · " + mprof.minuter + " min" : ""}`, lank: "/kurser/ts-25-market-profile", ikon: "🔔", beskrivning: "Steidlmayer — formen berättar" },
          { text: `Kursen: Volym-analys — grunder${grund ? " · " + grund.minuter + " min" : ""}`, lank: "/kurser/ts-08-volymanalys", ikon: "📈", beskrivning: "Börja här — intermediär" },
          { text: "Vad är stöd och motstånd?", lank: "fragor:" + encodeURIComponent("vad är stöd och motstånd?"), ikon: "🧱", beskrivning: "Profilens nivåer i diagrammet — basens genomgång" },
        ],
        motfraga: { text: "Vad är stöd och motstånd?", kategori: "teknisk analys" },
        fordjupa: { text: k.titel, lank: "/kurser/ts-09-volymprofiler" },
      };
    },
  },
];

// ── Huvudingången ──────────────────────────────────────────────────────────

/**
 * Svara lokalt med NÅGOT av de fyra ts-djup-mönstren — eller null (då har
 * hela kedjan före redan lämnat null och API-flödet tar över som förr).
 * Ligger SIST i widgetens kedja och kan därför aldrig stjäla en fråga från
 * tidigare lager. Samma matchningssemantik som basmotorn: minst ett
 * kärnord krävs, poäng = kärnord × 3 + stärkord, oavgjort → först
 * deklarerade mönstret vinner (strikt >, deterministiskt). Samma fråga ⇒
 * bitidentiskt svar.
 */
export function svaraLokaltTsdjup(fraga: string, register: RegisterRad[]): LokaltSvar | null {
  const fragaStr = diafri(fraga);
  if (!fragaStr) return null;
  const fragaOrd = fragaStr.split(" ");
  let bast: { svar: LokaltSvar; poang: number } | null = null;
  for (const m of TSDJUP_MONSTER) {
    const karnTraff = m.karnord.filter((nk) => traff(fragaOrd, fragaStr, nk));
    if (karnTraff.length === 0) continue; // krav: minst ett kärnord
    const starkTraff = m.starkord?.filter((nk) => traff(fragaOrd, fragaStr, nk)) ?? [];
    const poang = karnTraff.length * 3 + starkTraff.length;
    if (!bast || poang > bast.poang) bast = { svar: m.bygga(register), poang };
  }
  return bast ? bast.svar : null;
}
