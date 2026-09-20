/**
 * TESTA AI-MENTORN — VOLATILITETSMEKANIK (omgång 27, s6-u2: volatilitets-
 * draget [rp-06 primär + rp-04 + rp-05 som källor] + marginaltrappan
 * [ln-03 primär + ln-01 + v07 som källor] — varifrån bruset kommer och vad
 * det kostar).
 *
 * Kör:  node verktyg/testa-ai-mentor-volatilitetsmekanik.mjs
 * Krav: Node >= 22.18 (type stripping default — samma som testa-ai-mentor.mjs).
 *
 * Regressionstest för omgång 27:s två förhandsfrågor (se
 * src/lib/ai-mentor-volatilitetsmekanik-fragor.ts) med bevakning:
 *   A   4 kanoniska ingångar (volatilitetsdraget/variansdraget +
 *       marginaltrappan/täckningsbidraget) → rätt ämne, primärkälla,
 *       FLERKÄLLA (kallor = 3 + numrerad Källor-rad) och ≥ 3 kurslänkar
 *   B   10 felstavade/varierade varianter → samma träff
 *   C   determinism — alla frågor två gånger ⇒ bitidentiskt svar
 *   D01–D30 aritmetik maskinellt omräknad (spegelparet, reparationstrappan,
 *       tre liv, approximationen, diversifieringsspaken, trapporna A/B,
 *       DOL 3,75/9,0/2,57, nollpunkterna, marginalvikten) + D31–D32
 *       registerdrivna räknekontroller + D33 nivåkontroll + D34 fantomslug
 *   E   11 omatchade/gränsfrågor → null (varderjusteringens «konglomerat-
 *       rabatt», basens nakna «volatilitet»/«marginalen»/«hävstång»/
 *       «brusets avgift», handelsdagens «belåningsräntan», u1:s
 *       «marginalhandeln»/«marginalkravet» [kollisionsvikten], TEXT-burna
 *       «DOL»/«nollpunkten», juridik)
 *   F   juridikgrind-lint — inga rådfraser + disclaimer
 *   G   ANTISTÖLD — grannlagers kanoniska (volatilitetsbudgeten,
 *       sekvensrisken, Du Pont-analysen, bruttomarginalen, Sharpe-kvoten,
 *       riskparitet, spreaden …) → NULL
 *   H   ÄGAR-INVARIANT — kanoniska NULL genom HELA kedjan utan detta lager
 *       (motorlistan läses LIVE ur kedjetestets MOTORDEFS — framtidsäker
 *       när syskonens fönsterlager wireas) + H2 med detta lager
 *   J   KÄRNORDSDISJUNKTION LIVE — kärnorden lästa ur samtliga
 *       src/lib/ai-mentor-*-fragor.ts (utom detta lager): inget kärnord
 *       delas med annat lager
 *   L   widget-synk — import + MELLAN pengarstid och marknadsrytm
 *       (deras SIST-deklaration) i chat-widget.tsx:s kedja
 *
 * ── JURIDIKGRINDEN (2007:528) ─────────────────────────────────
 * Testfall F vaktar att svaret är pedagogiskt — aldrig rekommendation.
 */

import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { readdirSync, readFileSync } from "node:fs";

const HÄR = dirname(fileURLToPath(import.meta.url));
const ROT = join(HÄR, "..");

const [major, minor] = process.versions.node.split(".").map(Number);
const stodStrip = major > 22 || (major === 22 && minor >= 18);
if (!stodStrip && !process.execArgv.includes("--experimental-strip-types")) {
  console.error(
    "FEL: Node " + process.versions.node + " saknar type stripping. " +
      "Kör med: node --experimental-strip-types verktyg/testa-ai-mentor-volatilitetsmekanik.mjs",
  );
  process.exit(1);
}

// Den RIKTIGA koden ur src/ (ingen duplikation i testet).
const { KURSREGISTER } = await import(pathToFileURL(join(ROT, "src/lib/ai-mentor-register.ts")).href);
const { svaraLokaltVolatilitetsmekanik, VOLATILITETSMEKANIK_MONSTER } = await import(
  pathToFileURL(join(ROT, "src/lib/ai-mentor-volatilitetsmekanik-fragor.ts")).href
);

// ── Testharness ─────────────────────────────────────────────────────────────
let pass = 0;
let fail = 0;
function kontroll(namn, ok, detalj) {
  if (ok) {
    pass++;
    console.log("PASS  " + namn + (detalj ? "  — " + detalj : ""));
  } else {
    fail++;
    console.log("FAIL  " + namn + (detalj ? "  — " + detalj : ""));
  }
}
function approx(a, b, tolerans = 0.005) {
  return Math.abs(a - b) <= tolerans;
}

// ── FALL A: fyra kanoniska ingångar, två monster, flerkällskrav ─────────────
const NYA = [
  { fraga: "Vad är volatilitetsdraget?", amne: "volatilitetsdraget", slug: "rp-06-volatilitetsdraget" },
  { fraga: "Vad är variansdraget?", amne: "volatilitetsdraget", slug: "rp-06-volatilitetsdraget" },
  { fraga: "Vad är marginaltrappan?", amne: "marginaltrappan", slug: "ln-03-marginaltrappan-och-operativ-havstavng" },
  { fraga: "Vad är täckningsbidraget?", amne: "marginaltrappan", slug: "ln-03-marginaltrappan-och-operativ-havstavng" },
];

NYA.forEach((f, i) => {
  const nr = "A" + String(i + 1).padStart(2, "0");
  const svar = svaraLokaltVolatilitetsmekanik(f.fraga, KURSREGISTER);
  if (!svar) {
    kontroll(nr + " volatilitetsmekanik", false, "inget lokalt svar på: '" + f.fraga + "'");
    return;
  }
  const amneOk = svar.amne === f.amne;
  const kallaOk = svar.kalla.slug === f.slug;
  const kallorFinns = Array.isArray(svar.kallor) && svar.kallor.length === 3;
  const kallradOk = svar.text.includes("📖 Källor (3)");
  const kurslankar = svar.handlings.filter((h) => h.lank.startsWith("/kurser/"));
  const kurslankarOk = kurslankar.length >= 3;
  kontroll(
    nr + " volatilitetsmekanik — '" + f.fraga + "'",
    amneOk && kallaOk && kallorFinns && kallradOk && kurslankarOk,
    "ämne=" + svar.amne + " · källa=" + svar.kalla.slug +
      " · källor=" + (svar.kallor ? svar.kallor.length : 0) +
      " · kurslänkar=" + kurslankar.length,
  );
});

// ── FALL B: felstavade/varierade varianter → samma träff ────────────────────
const FELSTAVADE = [
  { fraga: "vad ar volatilitetsdraget?", amne: "volatilitetsdraget" },
  { fraga: "förklara volatilitets draget", amne: "volatilitetsdraget" },
  { fraga: "vad är volatilitetsskatten?", amne: "volatilitetsdraget" },
  { fraga: "vad ar variansdraget?", amne: "volatilitetsdraget" },
  { fraga: "vad är spegelparet?", amne: "volatilitetsdraget" },
  { fraga: "vad ar marginaltrappan?", amne: "marginaltrappan" },
  { fraga: "förklara marginal trappan", amne: "marginaltrappan" },
  { fraga: "hur läser man marginaltrappor?", amne: "marginaltrappan" },
  { fraga: "vad är hävstångsgraden?", amne: "marginaltrappan" },
  { fraga: "vad är marginalvikten?", amne: "marginaltrappan" },
];
FELSTAVADE.forEach((f, i) => {
  const nr = "B" + String(i + 1).padStart(2, "0");
  const svar = svaraLokaltVolatilitetsmekanik(f.fraga, KURSREGISTER);
  kontroll(
    nr + " — '" + f.fraga + "'",
    !!svar && svar.amne === f.amne,
    svar ? "ämne=" + svar.amne : "null",
  );
});

// ── FALL C: determinism — bitidentiskt svar ─────────────────────────────────
{
  const Alla = [...NYA.map((f) => f.fraga), ...FELSTAVADE.map((f) => f.fraga)];
  const fel = [];
  for (const fr of Alla) {
    const a = svaraLokaltVolatilitetsmekanik(fr, KURSREGISTER);
    const b = svaraLokaltVolatilitetsmekanik(fr, KURSREGISTER);
    if (JSON.stringify(a) !== JSON.stringify(b)) fel.push(fr);
  }
  kontroll("C determinism — " + Alla.length + " frågor × 2 ⇒ bitidentiska", fel.length === 0,
    fel.length ? "differerande: " + fel.join(" | ") : Alla.length + " par gröna");
}

// ── FALL D: aritmetik maskinellt omräknad + registerdrivet + fantomslug ─────
{
  const D = [];
  // 1️⃣ Spegelparet (rp-06)
  D.push(["100 × 1,20 × 0,80 = 96,0", approx(100 * 1.2 * 0.8, 96)]);
  D.push(["förlust 1 − 0,96 = 4,0 %", approx(1 - 0.96, 0.04, 0.001)]);
  D.push(["återväxt 100/96 − 1 = 4,17 % ≈ 4,2", approx(100 / 96 - 1, 0.0417, 0.001)]);
  D.push(["150,0 × 0,50 = 75,0", approx(150 * 0.5, 75)]);
  D.push(["tillbaka 100/75 − 1 = 33,3 %", approx(100 / 75 - 1, 1 / 3, 0.001)]);
  // 2️⃣ Konstruktionen (+30/−10)
  D.push(["100 × 1,30 × 0,90 = 117,0", approx(100 * 1.3 * 0.9, 117)]);
  D.push(["geometriskt √1,17 − 1 = 8,17 %", approx(Math.sqrt(1.17) - 1, 0.0817, 0.001)]);
  D.push(["gap 10 − 8,17 = 1,83", approx(0.1 - (Math.sqrt(1.17) - 1), 0.0183, 0.001)]);
  // Approximationen: geometrisk ≈ aritmetisk − halva variansen
  D.push(["σ20 kring +10: 0,10 − 0,5×0,04 = 8,0", approx(0.1 - 0.5 * 0.2 * 0.2, 0.08, 0.001)]);
  // 3️⃣ Tre liv (tjugo år, alla aritmetiskt +10)
  D.push(["σ10: √(1,2×1,0) − 1 = 9,54 %", approx(Math.sqrt(1.2 * 1.0) - 1, 0.0954, 0.0005)]);
  D.push(["σ20: √(1,3×0,9) − 1 = 8,17 %", approx(Math.sqrt(1.3 * 0.9) - 1, 0.0817, 0.0005)]);
  D.push(["σ30: √(1,4×0,8) − 1 = 5,83 %", approx(Math.sqrt(1.4 * 0.8) - 1, 0.0583, 0.0005)]);
  D.push(["1,0954^20 = 6,19x", approx(Math.pow(1.0954, 20), 6.19, 0.02)]);
  D.push(["1,0817^20 = 4,81x", approx(Math.pow(1.0817, 20), 4.81, 0.02)]);
  D.push(["1,0583^20 = 3,11x", approx(Math.pow(1.0583, 20), 3.11, 0.02)]);
  D.push(["3,11/6,19 = 0,502 — hälften", approx(3.11 / 6.19, 0.5, 0.01)]);
  // 4️⃣ Diversifieringsspaken
  D.push(["10/√2 = 7,07 ≈ 7,1 %", approx(10 / Math.SQRT2, 7.07, 0.01)]);
  D.push(["drag σ10: 0,5×0,01 = 0,50 %", approx(0.5 * 0.1 * 0.1, 0.005, 0.0001)]);
  D.push(["drag 7,1: 0,5×0,005 = 0,25 %", approx(0.5 * 0.0707 * 0.0707, 0.0025, 0.0002)]);
  // 5️⃣ Trapporna (ln-03) — Bolag A
  D.push(["A brutto 1 000 − 550 = 450 (45,0 %)", approx((1000 - 550) / 1000, 0.45, 0.001)]);
  D.push(["A EBITDA 450 − 250 = 200 (20,0 %)", approx((450 - 250) / 1000, 0.2, 0.001)]);
  D.push(["A EBIT 200 − 80 = 120 (12,0 %)", approx((200 - 80) / 1000, 0.12, 0.001)]);
  D.push(["A netto (120 − 20) × 0,8 = 80 (8,0 %)", approx(((120 - 20) * 0.8) / 1000, 0.08, 0.001)]);
  // Bolag B
  D.push(["B brutto 1 000 − 100 = 900 (90,0 %)", approx((1000 - 100) / 1000, 0.9, 0.001)]);
  D.push(["B EBITDA 900 − 780 = 120 (12,0 %)", approx((900 - 780) / 1000, 0.12, 0.001)]);
  D.push(["B EBIT 120 − 20 = 100 (10,0 %)", approx((120 - 20) / 1000, 0.1, 0.001)]);
  D.push(["B netto 100 × 0,8 = 80 (8,0 %)", approx((100 * 0.8) / 1000, 0.08, 0.001)]);
  // 6️⃣ DOL — de fasta kostnadernas fysik
  D.push(["A +10 %: 1 100 − 605 − 330 = 165", approx(1100 - 605 - 330, 165)]);
  D.push(["A sväng (165 − 120)/120 = 37,5 %", approx((165 - 120) / 120, 0.375, 0.001)]);
  D.push(["A −10 %: 900 − 495 − 330 = 75", approx(900 - 495 - 330, 75)]);
  D.push(["A DOL = TB/EBIT = 450/120 = 3,75", approx(450 / 120, 3.75, 0.01)]);
  D.push(["B +10 %: 1 100 − 110 − 800 = 190", approx(1100 - 110 - 800, 190)]);
  D.push(["B sväng (190 − 100)/100 = 90 %", approx((190 - 100) / 100, 0.9, 0.001)]);
  D.push(["B DOL = 900/100 = 9,0", approx(900 / 100, 9)]);
  D.push(["A lägesmått 1 200: 540/210 = 2,57", approx((1200 * 0.45) / (1200 - 660 - 330), 2.571, 0.01)]);
  D.push(["nollpunkt A 330/0,45 = 733", approx(330 / 0.45, 733.3, 0.5)]);
  D.push(["nollpunkt B 800/0,90 = 889", approx(800 / 0.9, 888.9, 0.5)]);
  // 7️⃣ Marginalvikten
  D.push(["1 pp marginal = 0,01 × 1 000 = 10 mcr", approx(0.01 * 1000, 10)]);
  D.push(["3 % volym = 0,03 × 1 000 × 0,12 = 3,6 mcr", approx(0.03 * 1000 * 0.12, 3.6)]);
  D.push(["vikt 10/3,6 = 2,78 = 1/(3 × 0,12)", approx(10 / 3.6, 1 / (3 * 0.12), 0.01)]);
  D.push(["vid 5 %: 1/(3 × 0,05) = 6,7", approx(1 / (3 * 0.05), 6.67, 0.01)]);
  D.forEach(([namn, ok], i) => kontroll("D" + String(i + 1).padStart(2, "0") + " aritmetik " + namn, ok, ok ? "omräknad grön" : "avvikelse"));

  // Registerdrivna tal: kategori-antal i texterna
  const rpAntal = KURSREGISTER.filter((r) => r.kategori === "RISKHANTERING & PORTFÖLJTEORI").length;
  const lnAntal = KURSREGISTER.filter((r) => r.kategori === "LÖNSAMHET").length;
  const s1 = svaraLokaltVolatilitetsmekanik("vad är volatilitetsdraget?", KURSREGISTER);
  const s2 = svaraLokaltVolatilitetsmekanik("vad är marginaltrappan?", KURSREGISTER);
  kontroll(
    "D31 registerdrivet — RISK&P-antalet (" + rpAntal + ") i monster 1:s text",
    s1.text.includes("finns " + rpAntal + " kurser"),
    "RISKHANTERING & PORTFÖLJTEORI = " + rpAntal + " kurser (läs ur registret)",
  );
  kontroll(
    "D32 registerdrivet — LÖNSAMHET-antalet (" + lnAntal + ") i monster 2:s text",
    s2.text.includes("finns " + lnAntal + " kurser"),
    "LÖNSAMHET = " + lnAntal + " kurser (läs ur registret)",
  );

  const rp06 = KURSREGISTER.find((r) => r.slug === "rp-06-volatilitetsdraget");
  const ln03 = KURSREGISTER.find((r) => r.slug === "ln-03-marginaltrappan-och-operativ-havstavng");
  kontroll(
    "D33 registerdrivet — nivåerna (" + rp06.niva.toLowerCase() + "/" + ln03.niva.toLowerCase() + ") i texterna",
    s1.text.includes(rp06.niva.toLowerCase() + " nivå") && s2.text.includes(ln03.niva.toLowerCase() + " nivå"),
    "rp-06 = " + rp06.niva + " · ln-03 = " + ln03.niva + " (registerdrivna, klippskydd)",
  );

  // Fantomslug: varje källa/kurslänk FINNS i registret
  const slugs = new Set(KURSREGISTER.map((r) => r.slug));
  const felSlugs = [];
  for (const m of VOLATILITETSMEKANIK_MONSTER) {
    const svar = m.bygga(KURSREGISTER);
    if (svar.kalla.slug && !slugs.has(svar.kalla.slug)) felSlugs.push(m.id + ":kalla:" + svar.kalla.slug);
    for (const kk of svar.kallor ?? []) if (kk.slug && !slugs.has(kk.slug)) felSlugs.push(m.id + ":kalla2:" + kk.slug);
    for (const h of svar.handlings) {
      const mm = /\/kurser\/([a-z0-9-]+)/.exec(h.lank ?? "");
      if (mm && !slugs.has(mm[1])) felSlugs.push(m.id + ":handling:" + mm[1]);
    }
    if (svar.fordjupa?.lank) {
      const m3 = /\/kurser\/([a-z0-9-]+)/.exec(svar.fordjupa.lank);
      if (m3 && !slugs.has(m3[1])) felSlugs.push(m.id + ":fordjupa:" + m3[1]);
    }
  }
  kontroll("D34 fantomslug — alla källor och kurslänkar äkta i registret", felSlugs.length === 0,
    felSlugs.length ? felSlugs.join(" | ") : "0 fantomer");
}

// ── FALL E: omatchade/gränsfrågor → null ────────────────────────────────────
const OMATCHADE = [
  "vad är konglomeratrabatten?",  // varderjusteringens (d0) — vr-09 dödat som primär av sonden
  "vad är volatilitet?",          // basens nakta kärnord — dokumenterad gräns
  "vad är marginalen?",           // basens nakna — km-030 äger värderingsmarginalen
  "vad är operativ hävstång?",    // basens nakna «hävstång» — DOL-läran bärs i TEXT
  "vad är belåningsräntan?",      // handelsdags (utlåningsräntan d2) — dokumenterad gräns
  "vad är marginalhandeln?",      // u1:s lager — kollisionsvikten (anspråk v2)
  "vad är marginalkravet?",       // u1:s lager — kollisionsvikten
  "vad är DOL?",                  // tre tecken exakt — bärs i TEXT, aldrig kärnord
  "vad är nollpunkten?",          // lämnad åt framtida lager — TEXT
  "vad är brusets avgift?",       // basens «avgift» — kursens undertitel i TEXT
  "vilket bolag ska jag köpa?",   // juridik — basens råd-monster
];
OMATCHADE.forEach((f, i) => {
  const nr = "E" + String(i + 1).padStart(2, "0");
  const svar = svaraLokaltVolatilitetsmekanik(f, KURSREGISTER);
  kontroll(nr + " null — '" + f + "'", svar === null, svar ? "fångades av " + svar.amne : "null ✓");
});

// ── FALL F: juridikgrind — inga rådfraser ───────────────────────────────────
{
  // \b-ordgränser (riskadress-precedensen): sammansättningar som «köparens»
  // är oskyldiga ord — rådfrasen är det FRISTÅENDE imperativet.
  const RÅD = [/\bköp\b/, /\bsälj\b/, /vi\s+rekommenderar/, /borde\s+du\s+köpa/, /\bplacera\s+i\s+/, /Tipsa\s+om\s+aktie/, /bästa\s+köpet?\s+just\s+nu/, /\bbelåna\s+kontot\b/];
  const brott = [];
  for (const m of VOLATILITETSMEKANIK_MONSTER) {
    const svar = m.bygga(KURSREGISTER);
    for (const rx of RÅD) if (rx.test(svar.text)) brott.push(m.id + ": " + rx.source);
    if (!svar.text.includes("inga placeringstips")) brott.push(m.id + ": utbildnings-disclaimern saknas");
  }
  kontroll("F juridikgrind — pedagogisk text, inga rådfraser", brott.length === 0,
    brott.length ? brott.join(" | ") : "0 rådfraser, disclaimer på plats");
}

// ── FALL G: antistöld — grannlagers kanoniska → NULL här ────────────────────
{
  const FRÄMNINGAR = [
    { fraga: "vad är volatilitetsbudgeten?", agare: "riskbudget" },
    { fraga: "vad är sekvensrisken?", agare: "pengarstid (källa här — aldrig kärnord)" },
    { fraga: "vad är riskparitet?", agare: "portfoljbalans" },
    { fraga: "vad är Sharpe-kvoten?", agare: "riskmåttsdjup" },
    { fraga: "vad är Du Pont-analysen?", agare: "lonsamhetsdjup" },
    { fraga: "vad är bruttomarginalen?", agare: "v07-familjens ägare" },
    { fraga: "vad är spreaden?", agare: "bas/am-01" },
    { fraga: "vad är styrräntan?", agare: "makro" },
    { fraga: "vad är kassaflödesanalys?", agare: "extra" },
    { fraga: "vad är andrahandsmarknaden?", agare: "pengarstid" },
  ];
  const stolder = [];
  for (const f of FRÄMNINGAR) {
    const svar = svaraLokaltVolatilitetsmekanik(f.fraga, KURSREGISTER);
    if (svar) stolder.push("'" + f.fraga + "' togs av detta lager (" + f.agare + " äger den)");
  }
  kontroll("G antistöld — " + FRÄMNINGAR.length + " grannfrågor lämnas ifred", stolder.length === 0,
    stolder.length ? stolder.join(" | ") : "0 stölder");
}

// ── FALL H: ägar-invariant — kanoniska NULL genom kedjan utan detta lager ──
{
  // Motorlistan läses LIVE ur kedjetestets MOTORDEFS (speglar widgeten via
  // dess fall G) — framtidsäker när syskonens fönsterlager wireas efter detta.
  const kedjekalla = readFileSync(join(ROT, "verktyg/testa-ai-mentor-kedja.mjs"), "utf8");
  const defs = [...kedjekalla.matchAll(
    /\{ namn:\s+"([^"]+)",\s+fil:\s+"([^"]+)",\s+fn:\s+"([^"]+)",\s+arr:\s+"([^"]+)",\s+antal:\s+(\d+) \}/g,
  )].map((m) => ({ namn: m[1], fil: m[2], fn: m[3] }));
  const utom = defs.filter((d) => d.fil !== "ai-mentor-volatilitetsmekanik-fragor.ts");
  const importError = [];
  const motorer = [];
  for (const d of utom) {
    try {
      const modul = await import(pathToFileURL(join(ROT, "src/lib", d.fil)).href);
      motorer.push({ namn: d.namn, fn: modul[d.fn] });
    } catch (e) {
      importError.push(d.fil + ": " + e.message);
    }
  }
  kontroll("H0 kedjan importbar — " + utom.length + " motorer (utan detta lager)", importError.length === 0,
    importError.length ? importError.join(" | ") : motorer.length + " motorer importerade");

  const fångster = [];
  for (const f of NYA) {
    for (const m of motorer) {
      const svar = m.fn(f.fraga, KURSREGISTER);
      if (svar) fångster.push("'" + f.fraga + "' fångades av " + m.namn);
    }
  }
  kontroll("H ägar-invariant — 4 kanoniska NULL genom " + utom.length + " motorer", fångster.length === 0,
    fångster.length ? fångster.join(" | ") : "0 fångster — detta lager är enda ägaren");

  // Spegel: MED detta lager ska de fångas (kedjan hel)
  const med = NYA.map((f) => !!svaraLokaltVolatilitetsmekanik(f.fraga, KURSREGISTER));
  kontroll("H2 med detta lager fångas samtliga 4", med.every(Boolean), med.join(","));
}

// ── FALL J: kärnordsdisjunktion LIVE ────────────────────────────────────────
{
  function normalisera(s) { return s.toLowerCase().replace(/[^\p{L}\p{N}]+/gu, " ").replace(/\s+/g, " ").trim(); }
  function diafri(s) { return normalisera(s).normalize("NFD").replace(/\p{M}/gu, "").normalize("NFC"); }
  const filer = readdirSync(join(ROT, "src/lib"))
    .filter((f) => f.startsWith("ai-mentor-") && f.endsWith(".ts") && f !== "ai-mentor-volatilitetsmekanik-fragor.ts" && f !== "ai-mentor-register.ts" && f !== "ai-mentor-typer.ts");
  const andras = new Set();
  for (const f of filer) {
    const src = readFileSync(join(ROT, "src/lib", f), "utf8");
    for (const m of src.matchAll(/karnord:\s*\[([^\]]*)\]/gs)) {
      for (const q of m[1].matchAll(/"([^"]+)"/g)) andras.add(diafri(q[1]));
    }
  }
  const mina = VOLATILITETSMEKANIK_MONSTER.flatMap((m) => m.karnord.map(diafri));
  const overlap = mina.filter((k) => andras.has(k));
  kontroll(
    "J kärnordsdisjunktion LIVE — " + mina.length + " kärnord mot " + andras.size + " andras (ur " + filer.length + " filer)",
    overlap.length === 0,
    overlap.length ? "ÖVERLAPP: " + overlap.join(" | ") : "0 delade kärnord",
  );
}

// ── FALL L: widget-synk — mellan pengarstid och marknadsrytm ────────────────
{
  const widget = readFileSync(join(ROT, "src/components/ak1a/chat-widget.tsx"), "utf8");
  const FEL = [];
  if (!widget.includes('from "@/lib/ai-mentor-volatilitetsmekanik-fragor"')) FEL.push("importen av ai-mentor-volatilitetsmekanik-fragor saknas");
  const kedjRad = widget.split("\n").find((l) => l.includes("const lokalt = "));
  if (!kedjRad) FEL.push("kedjeraden (const lokalt = …) hittades inte");
  else {
    if (!kedjRad.includes("?? svaraLokaltVolatilitetsmekanik(q, KURSREGISTER)")) FEL.push("svaraLokaltVolatilitetsmekanik saknas i kedjan");
    const posVolmek = kedjRad.indexOf("svaraLokaltVolatilitetsmekanik(q, KURSREGISTER)");
    const posPengarstid = kedjRad.indexOf("svaraLokaltPengarstid(q, KURSREGISTER)");
    const posMarknadsrytm = kedjRad.indexOf("svaraLokaltMarknadsrytm(q, KURSREGISTER)");
    if (!(posPengarstid >= 0 && posVolmek > posPengarstid)) FEL.push("svaraLokaltVolatilitetsmekanik ligger inte EFTER pengarstid");
    if (!(posMarknadsrytm >= 0 && posVolmek < posMarknadsrytm)) FEL.push("svaraLokaltVolatilitetsmekanik ligger inte FÖRE marknadsrytm (deras SIST-deklaration)");
    if (!kedjRad.trimEnd().endsWith("?? svaraLokaltMarknadsrytm(q, KURSREGISTER);")) FEL.push("marknadsrytm är inte SISTA ledet");
  }
  kontroll(
    "L widget-synk — import + MELLAN pengarstid och marknadsrytm (SIST respekterad)",
    FEL.length === 0,
    FEL.length ? FEL.join(" | ") : "efter pengarstid: pengarstid → volatilitetsmekanik → marknadsrytm (SIST)",
  );
}

// ── Summering ───────────────────────────────────────────────────────────────
console.log("");
console.log("────────────────────────────────────────");
console.log("AI-MENTORN spår 6 s6-u2 omgång 27 (volatilitetsmekanik): " + pass + " PASS · " + fail + " FAIL av " + (pass + fail));
process.exit(fail > 0 ? 1 : 0);
