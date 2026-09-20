/**
 * TESTA AI-MENTORN — PENGARSTID (omgång 26, s6-u2 fönster 3: andrahands-
 * marknaden [pe-05 primär + pe-06 + ib-05 som källor] + sekvensrisken
 * [rp-05 primär + rp-04 + ek-04 som källor] — pengarnas tid och ordning).
 *
 * Kör:  node verktyg/testa-ai-mentor-pengarstid.mjs
 * Krav: Node >= 22.18 (type stripping default — samma som testa-ai-mentor.mjs).
 *
 * Regressionstest för omgång 26:s två förhandsfrågor (se
 * src/lib/ai-mentor-pengarstid-fragor.ts) med bevakning:
 *   A   4 kanoniska ingångar (andrahandsmarknaden/LP-andelen + sekvens-
 *       risken/utfallsordningen) → rätt ämne, primärkälla, FLERKÄLLA
 *       (kallor = 3 + numrerad Källor-rad) och ≥ 3 kurslänkar
 *   B   10 felstavade/varierade varianter → samma träff
 *   C   determinism — alla frågor två gånger ⇒ bitidentiskt svar
 *   D01–D34 aritmetik maskinellt omräknad (den sanna rabatten, mognaden,
 *       årsverkan, J-kurvan, kostnadstrappan, spegelbanorna, trappan,
 *       buffertfönstret) + D35–D36 registerdrivna räknekontroller +
 *       D37 nivåkontroll + D38 fantomslug
 *   E   8 omatchade/gränsfrågor → null (realekonomins «j-kurvan», nästa-
 *       lagrets «capital call», basens «risk»/«private equity», portfölj-
 *       praktikens «pension», juridik)
 *   F   juridikgrind-lint — inga rådfraser + disclaimer
 *   G   ANTISTÖLD — grannlagers kanoniska (NAV-rabatt, utfasning,
 *       förvärvsmaskin, volatilitetsbudgeten, riskparitet, Sharpe-kvoten …)
 *       → NULL
 *   H   ÄGAR-INVARIANT — kanoniska NULL genom HELA kedjan utan detta lager
 *       (motorlistan läses LIVE ur kedjetestets MOTORDEFS — framtidsäker
 *       när syskonens fönsterlager wireas) + H2 med detta lager
 *   J   KÄRNORDSDISJUNKTION LIVE — kärnorden lästa ur samtliga
 *       src/lib/ai-mentor-*-fragor.ts (utom detta lager): inget kärnord
 *       delas med annat lager
 *   L   widget-synk — import + MELLAN optionshantverk och marknadsrytm
 *       (deras SIST-deklaration) i chat-widget.tsx:s kedja
 *
 * ── JURIDIKGRINDEN (2007:528) ─────────────────────────────────────────
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
      "Kör med: node --experimental-strip-types verktyg/testa-ai-mentor-pengarstid.mjs",
  );
  process.exit(1);
}

// Den RIKTIGA koden ur src/ (ingen duplikation i testet).
const { KURSREGISTER } = await import(pathToFileURL(join(ROT, "src/lib/ai-mentor-register.ts")).href);
const { svaraLokaltPengarstid, PENGARSTID_MONSTER } = await import(
  pathToFileURL(join(ROT, "src/lib/ai-mentor-pengarstid-fragor.ts")).href
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
  { fraga: "Vad är andrahandsmarknaden?", amne: "andrahandsmarknaden", slug: "pe-05-andrahandsmarknaden" },
  { fraga: "Vad är en LP-andel?", amne: "andrahandsmarknaden", slug: "pe-05-andrahandsmarknaden" },
  { fraga: "Vad är sekvensrisken?", amne: "sekvensrisken", slug: "rp-05-sekvensrisken" },
  { fraga: "Vad är utfallsordningen?", amne: "sekvensrisken", slug: "rp-05-sekvensrisken" },
];

NYA.forEach((f, i) => {
  const nr = "A" + String(i + 1).padStart(2, "0");
  const svar = svaraLokaltPengarstid(f.fraga, KURSREGISTER);
  if (!svar) {
    kontroll(nr + " pengarstid", false, "inget lokalt svar på: '" + f.fraga + "'");
    return;
  }
  const amneOk = svar.amne === f.amne;
  const kallaOk = svar.kalla.slug === f.slug;
  const kallorFinns = Array.isArray(svar.kallor) && svar.kallor.length === 3;
  const kallradOk = svar.text.includes("📖 Källor (3)");
  const kurslankar = svar.handlings.filter((h) => h.lank.startsWith("/kurser/"));
  const kurslankarOk = kurslankar.length >= 3;
  kontroll(
    nr + " pengarstid — '" + f.fraga + "'",
    amneOk && kallaOk && kallorFinns && kallradOk && kurslankarOk,
    "ämne=" + svar.amne + " · källa=" + svar.kalla.slug +
      " · källor=" + (svar.kallor ? svar.kallor.length : 0) +
      " · kurslänkar=" + kurslankar.length,
  );
});

// ── FALL B: felstavade/varierade varianter → samma träff ────────────────────
const FELSTAVADE = [
  { fraga: "vad ar andrahandsmarknaden?", amne: "andrahandsmarknaden" },
  { fraga: "förklara andrahands marknaden", amne: "andrahandsmarknaden" },
  { fraga: "hur prissätts andrahandsmarknader?", amne: "andrahandsmarknaden" },
  { fraga: "vad ar en lp-andel?", amne: "andrahandsmarknaden" },
  { fraga: "vad är lp andelens pris?", amne: "andrahandsmarknaden" },
  { fraga: "vad ar sekvensrisken?", amne: "sekvensrisken" },
  { fraga: "vad är sekvens risken?", amne: "sekvensrisken" },
  { fraga: "vad är utfalls ordningen?", amne: "sekvensrisken" },
  { fraga: "vad är spegelbanorna?", amne: "sekvensrisken" },
  { fraga: "hur mäter man sekvenskänsligheten?", amne: "sekvensrisken" },
];
FELSTAVADE.forEach((f, i) => {
  const nr = "B" + String(i + 1).padStart(2, "0");
  const svar = svaraLokaltPengarstid(f.fraga, KURSREGISTER);
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
    const a = svaraLokaltPengarstid(fr, KURSREGISTER);
    const b = svaraLokaltPengarstid(fr, KURSREGISTER);
    if (JSON.stringify(a) !== JSON.stringify(b)) fel.push(fr);
  }
  kontroll("C determinism — " + Alla.length + " frågor × 2 ⇒ bitidentiska", fel.length === 0,
    fel.length ? "differerande: " + fel.join(" | ") : Alla.length + " par gröna");
}

// ── FALL D: aritmetik maskinellt omräknad + registerdrivet + fantomslug ─────
{
  const D = [];
  // 1️⃣ Den sanna rabatten (Nordkärnanfond 2018)
  D.push(["0,85 × 60,0 = 51,0", approx(0.85 * 60, 51)]);
  D.push(["51,0 + 20,0 = 71,0", approx(51 + 20, 71)]);
  D.push(["60,0 + 20,0 = 80,0", approx(60 + 20, 80)]);
  D.push(["71,0/80,0 = 0,8875", approx(71 / 80, 0.8875)]);
  D.push(["1 − 0,8875 = 11,25 %", approx(1 - 71 / 80, 0.1125, 0.0001)]);
  D.push(["51,0/60,0 = 0,850 ⇒ 15,0 %", approx(1 - 51 / 60, 0.15, 0.0001)]);
  D.push(["91,0/100,0 = 0,910 ⇒ 9,0 %", approx(1 - 91 / 100, 0.09, 0.0001)]);
  // 2️⃣ Mognaden + årsverkan
  D.push(["0,78 × 80,0 = 62,4", approx(0.78 * 80, 62.4, 0.01)]);
  D.push(["0,90 × 60,0 = 54,0", approx(0.9 * 60, 54)]);
  D.push(["(100/85)^(1/3) − 1 = 5,6 %", approx(Math.pow(100 / 85, 1 / 3) - 1, 0.056, 0.001)]);
  D.push(["(100/85)^(1/5) − 1 = 3,3 %", approx(Math.pow(100 / 85, 1 / 5) - 1, 0.033, 0.001)]);
  // 3️⃣ J-kurvan (Nordkust Kapital I)
  D.push(["drag 30+25+20+15+10 = 100", approx(30 + 25 + 20 + 15 + 10, 100)]);
  D.push(["ut 10+15+25+30+25+15+10 = 130", approx(10 + 15 + 25 + 30 + 25 + 15 + 10, 130)]);
  D.push(["kumulativ botten år 4 = −80", approx(-30 - 25 - 20 - (15 - 10), -80)]);
  D.push(["multipel 130/100 = 1,30", approx(130 / 100, 1.3)]);
  D.push(["TVPI (130+20)/100 = 1,50", approx((130 + 20) / 100, 1.5)]);
  D.push(["effektiv avgift 2/30 = 6,67 %", approx(2 / 30, 0.0667, 0.0005)]);
  // 4️⃣ Kostnadstrappan (Kupolverk/Havstekel/Nordpost)
  D.push(["12,0 − 0,8 = 11,2", approx(12 - 0.8, 11.2)]);
  D.push(["11,2/12,0 = 93,3 %", approx(11.2 / 12, 0.933, 0.001)]);
  D.push(["12,0 − 2,0 = 10,0 · överskott 10,0 − 8,0 = 2,0", approx(12 - 2 - 8, 2)]);
  D.push(["andel 0,20 × 2,0 = 0,4 ⇒ 10,0 − 0,4 = 9,6", approx(12 - 2 - 0.2 * 2, 9.6)]);
  D.push(["9,6/12,0 = 80,0 %", approx(9.6 / 12, 0.8, 0.001)]);
  D.push(["100 × 1,08^20 = 466,1", approx(100 * Math.pow(1.08, 20), 466.1, 0.1)]);
  D.push(["100 × 1,06^20 = 320,7", approx(100 * Math.pow(1.06, 20), 320.7, 0.1)]);
  D.push(["320,7/466,1 = 0,688 ⇒ 31,2 %", approx(1 - Math.pow(1.06, 20) / Math.pow(1.08, 20), 0.312, 0.001)]);
  // 1️⃣–2️⃣ Spegelbanorna (rp-05)
  D.push(["utan uttag 100 × 1,3² × 0,9² = 136,89", approx(100 * 1.3 * 1.3 * 0.9 * 0.9, 136.89, 0.01)]);
  const fore4 = ((100 * 1.3 - 7) * 1.3 - 7) * 0.9 - 7;
  const efter4 = ((100 * 0.9 - 7) * 0.9 - 7) * 1.3 - 7;
  D.push(["Före 4 år = 110,549", approx(((fore4) * 0.9 - 7), 110.549, 0.01)]);
  D.push(["Efter 4 år = 98,313", approx(((efter4) * 1.3 - 7), 98.313, 0.01)]);
  D.push(["gap 12,236 = 12,2 % av start", approx(((fore4 * 0.9 - 7) - (efter4 * 1.3 - 7)) / 100, 0.122, 0.001)]);
  D.push(["geometriskt (1,3²·0,9²)^(1/4) = 8,17 %", approx(Math.pow(1.3 * 1.3 * 0.9 * 0.9, 0.25) - 1, 0.0817, 0.001)]);
  // 3️⃣ Trappan
  D.push(["2 år: (100×1,3−7)×0,9−7 = 103,7", approx((100 * 1.3 - 7) * 0.9 - 7, 103.7, 0.01)]);
  D.push(["2 år: (100×0,9−7)×1,3−7 = 100,9", approx((100 * 0.9 - 7) * 1.3 - 7, 100.9, 0.01)]);
  let f6 = 100; for (const r of [1.3, 1.3, 1.3, 0.9, 0.9, 0.9]) f6 = f6 * r - 7;
  let e6 = 100; for (const r of [0.9, 0.9, 0.9, 1.3, 1.3, 1.3]) e6 = e6 * r - 7;
  D.push(["6 år: Före = 120,83", approx(f6, 120.83, 0.01)]);
  D.push(["6 år: Efter = 90,554", approx(e6, 90.554, 0.01)]);
  D.push(["6 år: gap = 30,3 %", approx((f6 - e6) / 100, 0.303, 0.001)]);
  D.push(["6 år utan uttag 100 × 1,3³ × 0,9³ = 160,16", approx(100 * Math.pow(1.3, 3) * Math.pow(0.9, 3), 160.16, 0.01)]);
  // 4️⃣ Buffertfönstret
  D.push(["2 × 7 = 14", approx(2 * 7, 14)]);
  D.push(["14 × 1,3689 = 19,16", approx(14 * 1.3689, 19.1646, 0.01)]);
  D.push(["pris 19,16 − 14 = 5,16 ≈ 5,2 %", approx((14 * 1.3689 - 14) / 100, 0.052, 0.001)]);
  D.forEach(([namn, ok], i) => kontroll("D" + String(i + 1).padStart(2, "0") + " aritmetik " + namn, ok, ok ? "omräknad grön" : "avvikelse"));

  // Registerdrivna tal: kategori-antal i texterna
  const peAntal = KURSREGISTER.filter((r) => r.kategori === "PRIVATE EQUITY & INVESTMENTBOLAG").length;
  const rpAntal = KURSREGISTER.filter((r) => r.kategori === "RISKHANTERING & PORTFÖLJTEORI").length;
  const s1 = svaraLokaltPengarstid("vad är andrahandsmarknaden?", KURSREGISTER);
  const s2 = svaraLokaltPengarstid("vad är sekvensrisken?", KURSREGISTER);
  kontroll(
    "D35 registerdrivet — PE-antalet (" + peAntal + ") i monster 1:s text",
    s1.text.includes("finns " + peAntal + " kurser"),
    "PRIVATE EQUITY & INVESTMENTBOLAG = " + peAntal + " kurser (läs ur registret)",
  );
  kontroll(
    "D36 registerdrivet — RISK&P-antalet (" + rpAntal + ") i monster 2:s text",
    s2.text.includes("finns " + rpAntal + " kurser"),
    "RISKHANTERING & PORTFÖLJTEORI = " + rpAntal + " kurser (läs ur registret)",
  );

  const pe05 = KURSREGISTER.find((r) => r.slug === "pe-05-andrahandsmarknaden");
  const rp05 = KURSREGISTER.find((r) => r.slug === "rp-05-sekvensrisken");
  kontroll(
    "D37 registerdrivet — nivåerna (" + pe05.niva.toLowerCase() + "/" + rp05.niva.toLowerCase() + ") i texterna",
    s1.text.includes(pe05.niva.toLowerCase() + " nivå") && s2.text.includes(rp05.niva.toLowerCase() + " nivå"),
    "pe-05 = " + pe05.niva + " · rp-05 = " + rp05.niva + " (registerdrivna, klippskydd)",
  );

  // Fantomslug: varje källa/kurslänk FINNS i registret
  const slugs = new Set(KURSREGISTER.map((r) => r.slug));
  const felSlugs = [];
  for (const m of PENGARSTID_MONSTER) {
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
  kontroll("D38 fantomslug — alla källor och kurslänkar äkta i registret", felSlugs.length === 0,
    felSlugs.length ? felSlugs.join(" | ") : "0 fantomer");
}

// ── FALL E: omatchade/gränsfrågor → null ────────────────────────────────────
const OMATCHADE = [
  "vad är j-kurvan?",             // realekonomins kärnord (valutans J-kurva) — dokumenterad gräns
  "vad är en capital call?",      // nästa-lagrets «call» (options) — dokumenterad gräns
  "vad är private equity?",       // basens
  "vad är ett investmentbolag?",  // nästa-lagrets
  "vad är pension?",              // portföljpraktikens («pension»-grundordet deras)
  "vad är risk?",                 // basens kärnterritorium
  "vad är kostnadstrappan?",      // aktiveras som KÄLLA (od-05-precedensen) — inte kärnord här
  "vilket bolag ska jag köpa?",   // juridik — basens råd-monster
];
OMATCHADE.forEach((f, i) => {
  const nr = "E" + String(i + 1).padStart(2, "0");
  const svar = svaraLokaltPengarstid(f, KURSREGISTER);
  kontroll(nr + " null — '" + f + "'", svar === null, svar ? "fångades av " + svar.amne : "null ✓");
});

// ── FALL F: juridikgrind — inga rådfraser ───────────────────────────────────
{
  // \b-ordgränser (riskadress-precedensen): sammansättningar som «köparens»
  // är oskyldiga ord — rådfrasen är det FRISTÅENDE imperativet.
  const RÅD = [/\bköp\b/, /\bsälj\b/, /vi\s+rekommenderar/, /borde\s+du\s+köpa/, /\bplacera\s+i\s+/, /Tipsa\s+om\s+aktie/, /bästa\s+köpet?\s+just\s+nu/];
  const brott = [];
  for (const m of PENGARSTID_MONSTER) {
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
    { fraga: "vad är NAV-rabatt?", agare: "nästa (investmentbolag)" },
    { fraga: "vad är en utfasning?", agare: "sektor (bank)" },
    { fraga: "vad är en förvärvsmaskin?", agare: "pe-mekanik" },
    { fraga: "vad är volatilitetsbudgeten?", agare: "riskbudget" },
    { fraga: "vad är riskparitet?", agare: "portfoljbalans" },
    { fraga: "vad är Sharpe-kvoten?", agare: "riskmåttsdjup" },
    { fraga: "vad är avkastningskurvan?", agare: "avkastningskurva" },
    { fraga: "vad är backtestens hantverk?", agare: "ekosystemdjup" },
    { fraga: "vad är kassaflödesanalys?", agare: "extra" },
    { fraga: "vad är utdelningsstrategi?", agare: "utdelningsdjup" },
  ];
  const stolder = [];
  for (const f of FRÄMNINGAR) {
    const svar = svaraLokaltPengarstid(f.fraga, KURSREGISTER);
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
  const utom = defs.filter((d) => d.fil !== "ai-mentor-pengarstid-fragor.ts");
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
  const med = NYA.map((f) => !!svaraLokaltPengarstid(f.fraga, KURSREGISTER));
  kontroll("H2 med detta lager fångas samtliga 4", med.every(Boolean), med.join(","));
}

// ── FALL J: kärnordsdisjunktion LIVE ────────────────────────────────────────
{
  function normalisera(s) { return s.toLowerCase().replace(/[^\p{L}\p{N}]+/gu, " ").replace(/\s+/g, " ").trim(); }
  function diafri(s) { return normalisera(s).normalize("NFD").replace(/\p{M}/gu, "").normalize("NFC"); }
  const filer = readdirSync(join(ROT, "src/lib"))
    .filter((f) => f.startsWith("ai-mentor-") && f.endsWith(".ts") && f !== "ai-mentor-pengarstid-fragor.ts" && f !== "ai-mentor-register.ts" && f !== "ai-mentor-typer.ts");
  const andras = new Set();
  for (const f of filer) {
    const src = readFileSync(join(ROT, "src/lib", f), "utf8");
    for (const m of src.matchAll(/karnord:\s*\[([^\]]*)\]/gs)) {
      for (const q of m[1].matchAll(/"([^"]+)"/g)) andras.add(diafri(q[1]));
    }
  }
  const mina = PENGARSTID_MONSTER.flatMap((m) => m.karnord.map(diafri));
  const overlap = mina.filter((k) => andras.has(k));
  kontroll(
    "J kärnordsdisjunktion LIVE — " + mina.length + " kärnord mot " + andras.size + " andras (ur " + filer.length + " filer)",
    overlap.length === 0,
    overlap.length ? "ÖVERLAPP: " + overlap.join(" | ") : "0 delade kärnord",
  );
}

// ── FALL L: widget-synk — mellan optionshantverk och marknadsrytm ───────────
{
  const widget = readFileSync(join(ROT, "src/components/ak1a/chat-widget.tsx"), "utf8");
  const FEL = [];
  if (!widget.includes('from "@/lib/ai-mentor-pengarstid-fragor"')) FEL.push("importen av ai-mentor-pengarstid-fragor saknas");
  const kedjRad = widget.split("\n").find((l) => l.includes("const lokalt = "));
  if (!kedjRad) FEL.push("kedjeraden (const lokalt = …) hittades inte");
  else {
    if (!kedjRad.includes("?? svaraLokaltPengarstid(q, KURSREGISTER)")) FEL.push("svaraLokaltPengarstid saknas i kedjan");
    const posPengarstid = kedjRad.indexOf("svaraLokaltPengarstid(q, KURSREGISTER)");
    const posOptionshantverk = kedjRad.indexOf("svaraLokaltOptionshantverk(q, KURSREGISTER)");
    const posMarknadsrytm = kedjRad.indexOf("svaraLokaltMarknadsrytm(q, KURSREGISTER)");
    if (!(posOptionshantverk >= 0 && posPengarstid > posOptionshantverk)) FEL.push("svaraLokaltPengarstid ligger inte EFTER optionshantverk");
    if (!(posMarknadsrytm >= 0 && posPengarstid < posMarknadsrytm)) FEL.push("svaraLokaltPengarstid ligger inte FÖRE marknadsrytm (deras SIST-deklaration)");
    if (!kedjRad.trimEnd().endsWith("?? svaraLokaltMarknadsrytm(q, KURSREGISTER);")) FEL.push("marknadsrytm är inte SISTA ledet");
  }
  kontroll(
    "L widget-synk — import + MELLAN optionshantverk och marknadsrytm (SIST respekterad)",
    FEL.length === 0,
    FEL.length ? FEL.join(" | ") : "66:e motorn: optionshantverk → pengarstid → marknadsrytm (SIST)",
  );
}

// ── Summering ───────────────────────────────────────────────────────────────
console.log("");
console.log("────────────────────────────────────────");
console.log("AI-MENTORN spår 6 s6-u2 omgång 26 (pengarstid): " + pass + " PASS · " + fail + " FAIL av " + (pass + fail));
process.exit(fail > 0 ? 1 : 0);
