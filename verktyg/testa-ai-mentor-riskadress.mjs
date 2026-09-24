/**
 * TESTA AI-MENTORN — RISKADRESS (omgång 26: riskens adresser — leverantörs-
 * risken + modellrisken + personalrisken ovanpå anatomi-kartans fyra adresser).
 *
 * Kör:  node verktyg/testa-ai-mentor-riskadress.mjs
 * Krav: Node >= 22.18 (type stripping default — samma som testa-ai-mentor.mjs).
 *
 * Regressionstest för omgång 26:s förhandsfråga (se
 * src/lib/ai-mentor-riskadress-fragor.ts) med bevakning:
 *   A   3 kanoniska ingångar (leverantörsrisken/modellrisken/personalrisken)
 *       → samma ämne, primärkälla, FLERKÄLLA (kallor ≥ 4 + numrerad
 *       Källor-rad) och ≥ 4 kurslänkar
 *   B   10 felstavade/varierade varianter → samma träff
 *   C   determinism — alla frågor två gånger ⇒ bitidentiskt svar
 *   D01–D17 aritmetik maskinellt omräknad (påslaget, avbrottet, dubbel-
 *       källan, felbudgeten, kärnkvoten) + D18 registerdriven räknekontroll
 *       + D19 nivåkontroll + D20 fantomslugar
 *   E   6 omatchade/gränsfrågor → null (basens «riskens anatomi», makros
 *       «räntetäckning», marknadsmekanikens «stopp», juridik)
 *   F   juridikgrind-lint — inga rådfraser + disclaimer
 *   G   ANTISTÖLD — grannlagers kanoniska (risklasningsdjup, riskdjup,
 *       riskbudget, överlevnadsdjup, skattedjup, portföljgrund …) → NULL
 *   H   ÄGAR-INVARIANT — kanoniska NULL genom HELA kedjan utan detta lager
 *       (motorlistan läses LIVE ur kedjetestets MOTORDEFS — framtidsäker
 *       när syskonens fönsterlager wireas) + H2 med detta lager
 *   J   KÄRNORDSDISJUNKTION LIVE — kärnorden lästa ur samtliga
 *       src/lib/ai-mentor-*-fragor.ts + ai-mentor-svar.ts (utom detta
 *       lager): inget kärnord delas med annat lager
 *   L   widget-synk — import + MELLAN multipel och marknadsrytm (deras
 *       SIST-deklaration) i chat-widget.tsx:s kedja
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
      "Kör med: node --experimental-strip-types verktyg/testa-ai-mentor-riskadress.mjs",
  );
  process.exit(1);
}

// Den RIKTIGA koden ur src/ (ingen duplikation i testet).
const { KURSREGISTER } = await import(pathToFileURL(join(ROT, "src/lib/ai-mentor-register.ts")).href);
const { svaraLokaltRiskadress, RISKADRESS_MONSTER } = await import(
  pathToFileURL(join(ROT, "src/lib/ai-mentor-riskadress-fragor.ts")).href
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

// ── FALL A: tre kanoniska ingångar, ett monster, flerkällskrav ──────────────
const NYA = [
  { fraga: "Vad är leverantörsrisken?", slug: "rs-06-riskens-anatomi" },
  { fraga: "Vad är modellrisken?", slug: "rs-06-riskens-anatomi" },
  { fraga: "Vad är personalrisken?", slug: "rs-06-riskens-anatomi" },
];

NYA.forEach((f, i) => {
  const nr = "A" + String(i + 1).padStart(2, "0");
  const svar = svaraLokaltRiskadress(f.fraga, KURSREGISTER);
  if (!svar) {
    kontroll(nr + " riskadresser", false, "inget lokalt svar på: '" + f.fraga + "'");
    return;
  }
  const amneOk = svar.amne === "riskadresser";
  const kallaOk = svar.kalla.slug === f.slug;
  const kallorFinns = Array.isArray(svar.kallor) && svar.kallor.length >= 4;
  const kallradOk = svar.text.includes("📖 Källor (4)");
  const kurslankar = svar.handlings.filter((h) => h.lank.startsWith("/kurser/"));
  const kurslankarOk = kurslankar.length >= 4;
  kontroll(
    nr + " riskadresser — '" + f.fraga + "'",
    amneOk && kallaOk && kallorFinns && kallradOk && kurslankarOk,
    "ämne=" + svar.amne + " · källa=" + svar.kalla.slug +
      " · källor=" + (svar.kallor ? svar.kallor.length : 0) +
      " · kurslänkar=" + kurslankar.length,
  );
});

// ── FALL B: felstavade/varierade varianter → samma träff ────────────────────
const FELSTAVADE = [
  { fraga: "vad ar leverantorsrisken?" },
  { fraga: "förklara leverantörs risken" },
  { fraga: "hur mäter man leverantörsrisker?" },
  { fraga: "vad ar modellrisken?" },
  { fraga: "vad är modell risken?" },
  { fraga: "vad ar personalrisken?" },
  { fraga: "vad är kärnkvoten?" },
  { fraga: "hur räknar jag karnkvoten?" },
  { fraga: "vad är en felbudget?" },
  { fraga: "vad är nyckelpersonskartan?" },
];
FELSTAVADE.forEach((f, i) => {
  const nr = "B" + String(i + 1).padStart(2, "0");
  const svar = svaraLokaltRiskadress(f.fraga, KURSREGISTER);
  kontroll(
    nr + " — '" + f.fraga + "'",
    !!svar && svar.amne === "riskadresser",
    svar ? "ämne=" + svar.amne : "null",
  );
});

// ── FALL C: determinism — bitidentiskt svar ─────────────────────────────────
{
  const Alla = [...NYA.map((f) => f.fraga), ...FELSTAVADE.map((f) => f.fraga)];
  const fel = [];
  for (const fr of Alla) {
    const a = svaraLokaltRiskadress(fr, KURSREGISTER);
    const b = svaraLokaltRiskadress(fr, KURSREGISTER);
    if (JSON.stringify(a) !== JSON.stringify(b)) fel.push(fr);
  }
  kontroll("C determinism — " + Alla.length + " frågor × 2 ⇒ bitidentiska", fel.length === 0,
    fel.length ? "differerande: " + fel.join(" | ") : Alla.length + " par gröna");
}

// ── FALL D: aritmetik maskinellt omräknad + registerdrivet + fantomslugar ───
{
  const D = [];
  // 2️⃣ Leverantörsrisken — påslaget
  D.push(["405,6 × 0,080 = 32,4", approx(405.6 * 0.08, 32.45, 0.05)]);
  D.push(["32,4/96,0 = 33,8 %", approx((405.6 * 0.08) / 96, 0.338, 0.001)]);
  D.push(["96,0 − 32,4 = 63,6", approx(96 - 32.4, 63.6, 0.001)]);
  D.push(["63,6/1 200 = 5,3 %", approx(63.6 / 1200, 0.053, 0.0005)]);
  // 2️⃣ Leverantörsrisken — avbrottet
  D.push(["6/48 = 12,5 %", approx(6 / 48, 0.125)]);
  D.push(["1 200 × 0,125 = 150,0", approx(1200 * (6 / 48), 150, 0.01)]);
  D.push(["150 × 0,30 = 45,0", approx(150 * 0.3, 45)]);
  D.push(["45/96 = 46,9 %", approx((150 * 0.3) / 96, 0.46875, 0.001)]);
  // 2️⃣ Leverantörsrisken — dubbelkällan
  D.push(["202,8 × 0,030 = 6,1", approx(202.8 * 0.03, 6.08, 0.05)]);
  D.push(["0,10 × 45,0 = 4,5", approx(0.1 * 45, 4.5)]);
  // 3️⃣ Modellrisken — felbudgeten
  D.push(["16,8/210 = 8,0 %", approx((226.8 - 210) / 210, 0.08)]);
  D.push(["135 × 0,115 × 13,5 = 209,6", approx(135 * 0.115 * 13.5, 209.59, 0.05)]);
  D.push(["135 × 0,115 × 14 = 217,4", approx(135 * 0.115 * 14, 217.35, 0.05)]);
  D.push(["135 × 0,12 × 13,5 = 218,7", approx(135 * 0.12 * 13.5, 218.7, 0.01)]);
  // 4️⃣ Personalrisken — kärnkvoten
  D.push(["5/12 = 41,7 %", approx(5 / 12, 0.4167, 0.001)]);
  D.push(["1/14 = 7,1 %", approx(1 / 14, 0.0714, 0.001)]);
  D.push(["5 + 4 + 3 = 12", approx(5 + 4 + 3, 12)]);
  D.forEach(([namn, ok], i) => kontroll("D" + String(i + 1).padStart(2, "0") + " aritmetik " + namn, ok, ok ? "omräknad grön" : "avvikelse"));

  // Registerdrivna tal: kategori-antalet + nivån i texten
  const riskAntal = KURSREGISTER.filter((r) => r.kategori === "RISK").length;
  const rs06 = KURSREGISTER.find((r) => r.slug === "rs-06-riskens-anatomi");
  const rs09 = KURSREGISTER.find((r) => r.slug === "rs-09-personalrisken");
  const s = svaraLokaltRiskadress("vad är leverantörsrisken?", KURSREGISTER);
  kontroll(
    "D18 registerdrivet — RISK-antalet (" + riskAntal + ") i texten",
    s.text.includes("finns " + riskAntal + " kurser"),
    "risk-kategorin = " + riskAntal + " kurser (läs ur registret)",
  );
  kontroll(
    "D19 registerdrivet — nivåerna (" + rs06.niva.toLowerCase() + "/" + rs09.niva.toLowerCase() + ") i texten",
    s.text.includes(rs06.niva.toLowerCase() + " nivå") && s.text.includes(rs09.niva.toLowerCase() + " nivå"),
    "rs-06 = " + rs06.niva + " · rs-09 = " + rs09.niva + " (registerdrivna, klippskydd)",
  );

  // Fantomslugar: varje källa/kurslänk FINNS i registret
  const slugs = new Set(KURSREGISTER.map((r) => r.slug));
  const felSlugs = [];
  for (const m of RISKADRESS_MONSTER) {
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
  kontroll("D20 fantomslugar — alla källor och kurslänkar äkta i registret", felSlugs.length === 0,
    felSlugs.length ? felSlugs.join(" | ") : "0 fantomer");
}

// ── FALL E: omatchade/gränsfrågor → null ────────────────────────────────────
const OMATCHADE = [
  "vad är risk?",                    // basens kärnterritorium
  "vad är riskens anatomi?",         // basens («risken» tav 1) — dokumenterad gräns
  "vad är räntetäckning?",           // makros
  "vad är en stopp-order?",          // marknadsmekanikens «stopp»-familj
  "vad är kundkoncentration?",       // risklasningsdjupets
  "vilket bolag ska jag köpa?",      // juridik — basens råd-monster
];
OMATCHADE.forEach((f, i) => {
  const nr = "E" + String(i + 1).padStart(2, "0");
  const svar = svaraLokaltRiskadress(f, KURSREGISTER);
  kontroll(nr + " null — '" + f + "'", svar === null, svar ? "fångades av " + svar.amne : "null ✓");
});

// ── FALL F: juridikgrind — inga rådfraser ───────────────────────────────────
{
  // \b-ordgränser (eget fynd, kurerat med motiv): den raka formen /köp\s+/
  // triggade FALSKT på detta monsters «inköp » — sammansättningar som
  // inköp/återköp/utköp är oskyldiga ord, rådfrasen är det FRISTÅENDE
  // imperativet («köp aktien»). \bköp\b fångar imperativet, skonar sätten.
  const RÅD = [/\bköp\b/, /\bsälj\b/, /vi\s+rekommenderar/, /borde\s+du\s+köpa/, /\bplacera\s+i\s+/, /Tipsa\s+om\s+aktie/, /bästa\s+köpet?\s+just\s+nu/];
  const brott = [];
  for (const m of RISKADRESS_MONSTER) {
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
    { fraga: "vad är kundkoncentration?", agare: "risklasningsdjup" },
    { fraga: "vad är en riskmatris?", agare: "risklasningsdjup" },
    { fraga: "vad är koncentrationsrisk?", agare: "risklasningsdjup/marknadsrytm-källa" },
    { fraga: "vad är en svart svan?", agare: "riskdjup" },
    { fraga: "vad är volatilitetsbudgeten?", agare: "riskbudget" },
    { fraga: "vad är Altman Z-score?", agare: "överlevnadsdjup" },
    { fraga: "vad är personaloptioner?", agare: "skattedjup" },
    { fraga: "vad är korrelation?", agare: "portföljgrund" },
    { fraga: "vad är stresstest?", agare: "stabilitetsdjup/bas" },
    { fraga: "vad är konkursrisken?", agare: "bas/överlevnadsdjup" },
  ];
  const stolder = [];
  for (const f of FRÄMNINGAR) {
    const svar = svaraLokaltRiskadress(f.fraga, KURSREGISTER);
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
  const utom = defs.filter((d) => d.fil !== "ai-mentor-riskadress-fragor.ts");
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
  kontroll("H ägar-invariant — 3 kanoniska NULL genom " + utom.length + " motorer", fångster.length === 0,
    fångster.length ? fångster.join(" | ") : "0 fångster — detta lager är enda ägaren");

  // Spegel: MED detta lager ska de fångas (kedjan hel)
  const med = NYA.map((f) => !!svaraLokaltRiskadress(f.fraga, KURSREGISTER));
  kontroll("H2 med detta lager fångas samtliga 3", med.every(Boolean), med.join(","));
}

// ── FALL J: kärnordsdisjunktion LIVE ────────────────────────────────────────
{
  function normalisera(s) { return s.toLowerCase().replace(/[^\p{L}\p{N}]+/gu, " ").replace(/\s+/g, " ").trim(); }
  function diafri(s) { return normalisera(s).normalize("NFD").replace(/\p{M}/gu, "").normalize("NFC"); }
  const filer = readdirSync(join(ROT, "src/lib"))
    .filter((f) => f.startsWith("ai-mentor-") && f.endsWith(".ts") && f !== "ai-mentor-riskadress-fragor.ts" && f !== "ai-mentor-register.ts" && f !== "ai-mentor-typer.ts");
  const andras = new Set();
  for (const f of filer) {
    const src = readFileSync(join(ROT, "src/lib", f), "utf8");
    for (const m of src.matchAll(/karnord:\s*\[([^\]]*)\]/gs)) {
      for (const q of m[1].matchAll(/"([^"]+)"/g)) andras.add(diafri(q[1]));
    }
  }
  const mina = RISKADRESS_MONSTER.flatMap((m) => m.karnord.map(diafri));
  const overlap = mina.filter((k) => andras.has(k));
  kontroll(
    "J kärnordsdisjunktion LIVE — " + mina.length + " kärnord mot " + andras.size + " andras (ur " + filer.length + " filer)",
    overlap.length === 0,
    overlap.length ? "ÖVERLAPP: " + overlap.join(" | ") : "0 delade kärnord",
  );
}

// ── FALL L: widget-synk — mellan multipel och marknadsrytm ──────────────────
{
  const widget = readFileSync(join(ROT, "src/components/ak1a/chat-widget.tsx"), "utf8");
  const FEL = [];
  if (!widget.includes('from "@/lib/ai-mentor-riskadress-fragor"')) FEL.push("importen av ai-mentor-riskadress-fragor saknas");
  const kedjRad = widget.split("\n").find((l) => l.includes("const lokalt = "));
  if (!kedjRad) FEL.push("kedjeraden (const lokalt = …) hittades inte");
  else {
    if (!kedjRad.includes("?? svaraLokaltRiskadress(q, KURSREGISTER)")) FEL.push("svaraLokaltRiskadress saknas i kedjan");
    const posRisk = kedjRad.indexOf("svaraLokaltRiskadress(q, KURSREGISTER)");
    const posMultipel = kedjRad.indexOf("svaraLokaltMultipel(q, KURSREGISTER)");
    const posMarknadsrytm = kedjRad.indexOf("svaraLokaltMarknadsrytm(q, KURSREGISTER)");
    if (!(posMultipel >= 0 && posRisk > posMultipel)) FEL.push("svaraLokaltRiskadress ligger inte EFTER multipel");
    if (!(posMarknadsrytm >= 0 && posRisk < posMarknadsrytm)) FEL.push("svaraLokaltRiskadress ligger inte FÖRE marknadsrytm (deras SIST-deklaration)");
    if (!kedjRad.trimEnd().endsWith("?? svaraLokaltMarknadsrytm(q, KURSREGISTER);")) FEL.push("marknadsrytm är inte SISTA ledet");
  }
  kontroll(
    "L widget-synk — import + MELLAN multipel och marknadsrytm (SIST respekterad)",
    FEL.length === 0,
    FEL.length ? FEL.join(" | ") : "62:a motorn: multipel → riskadress → marknadsrytm (SIST)",
  );
}

// ── Summering ───────────────────────────────────────────────────────────────
console.log("");
console.log("────────────────────────────────────────");
console.log("AI-MENTORN spår 6 s6-u1 omgång 26 (riskadress): " + pass + " PASS · " + fail + " FAIL av " + (pass + fail));
process.exit(fail > 0 ? 1 : 0);
