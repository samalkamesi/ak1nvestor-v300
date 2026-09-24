/**
 * TESTA AI-MENTORN — CO-INVEST (omgång 27: co-investeringen — andelen
 * bredvid fonden; urvalsasymmetrin, break-even-räkneläran, de fem kraven).
 *
 * Kör:  node verktyg/testa-ai-mentor-coinvest.mjs
 * Krav: Node >= 22.18 (type stripping default — samma som testa-ai-mentor.mjs).
 *
 * Regressionstest för omgång 27:s förhandsfråga (se
 * src/lib/ai-mentor-coinvest-fragor.ts) med bevakning:
 *   A   3 kanoniska ingångar → samma ämne, primärkälla, FLERKÄLLA
 *       (kallor ≥ 4 + numrerad Källor-rad) och ≥ 4 kurslänkar
 *   B   8 felstavade/varierade varianter → samma träff
 *   C   determinism — alla frågor två gånger ⇒ bitidentiskt svar
 *   D01–D18 aritmetik maskinellt omräknad (två biljetter, urvals-
 *       asymmetrin, break-even + trappan, den enskilda affären,
 *       koncentrationen) + D19 registerdriven räknekontroll + D20
 *       nivåkontroll + D21 fantomslugar
 *   E   8 omatchade/gränsfrågor → null (djupets «break-even-multipeln»,
 *       nästas «capital call», pe-mekaniks IRR, pengarstids J-kurvan,
 *       den STÄNGDA solidform-fällan «vad är en investering?», juridik)
 *   F   juridikgrind-lint — inga rådfraser + disclaimer
 *   G   ANTISTÖLD — grannlagers kanoniska (pe-mekanik, pengarstid,
 *       portföljgrund, optionsdjup …) → NULL
 *   H   ÄGAR-INVARIANT — kanoniska NULL genom HELA kedjan utan detta
 *       lager (motorlistan läses LIVE ur kedjetestets MOTORDEFS —
 *       framtidsäker när syskonens fönsterlager wireas) + H2 med detta
 *   J   KÄRNORDSDISJUNKTION LIVE — kärnorden lästa ur samtliga
 *       src/lib/ai-mentor-*-fragor.ts + ai-mentor-svar.ts (utom detta
 *       lager): inget kärnord delas med annat lager
 *   L   widget-synk — import + MELLAN volatilitetsmekanik och marknadsrytm
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
      "Kör med: node --experimental-strip-types verktyg/testa-ai-mentor-coinvest.mjs",
  );
  process.exit(1);
}

// Den RIKTIGA koden ur src/ (ingen duplikation i testet).
const { KURSREGISTER } = await import(pathToFileURL(join(ROT, "src/lib/ai-mentor-register.ts")).href);
const { svaraLokaltCoinvest, COINVEST_MONSTER } = await import(
  pathToFileURL(join(ROT, "src/lib/ai-mentor-coinvest-fragor.ts")).href
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
  { fraga: "Vad är en co-investering?", slug: "pe-07-co-investeringen" },
  { fraga: "Vad är co-investeringen?", slug: "pe-07-co-investeringen" },
  { fraga: "Vad är urvalsasymmetrin?", slug: "pe-07-co-investeringen" },
];

NYA.forEach((f, i) => {
  const nr = "A" + String(i + 1).padStart(2, "0");
  const svar = svaraLokaltCoinvest(f.fraga, KURSREGISTER);
  if (!svar) {
    kontroll(nr + " co-invest", false, "inget lokalt svar på: '" + f.fraga + "'");
    return;
  }
  const amneOk = svar.amne === "co-investeringen";
  const kallaOk = svar.kalla.slug === f.slug;
  const kallorFinns = Array.isArray(svar.kallor) && svar.kallor.length >= 4;
  const kallradOk = svar.text.includes("📖 Källor (4)");
  const kurslankar = svar.handlings.filter((h) => h.lank.startsWith("/kurser/"));
  const kurslankarOk = kurslankar.length >= 4;
  kontroll(
    nr + " co-invest — '" + f.fraga + "'",
    amneOk && kallaOk && kallorFinns && kallradOk && kurslankarOk,
    "ämne=" + svar.amne + " · källa=" + svar.kalla.slug +
      " · källor=" + (svar.kallor ? svar.kallor.length : 0) +
      " · kurslänkar=" + kurslankar.length,
  );
});

// ── FALL B: felstavade/varierade varianter → samma träff ────────────────────
const FELSTAVADE = [
  { fraga: "hur fungerar co-invest?" },
  { fraga: "vad är coinvest?" },
  { fraga: "förklara co investeringen" },
  { fraga: "vad ar co investering?" },
  { fraga: "vad är co-investeringar?" },
  { fraga: "vad är co-investorn?" },
  { fraga: "vad är en co-invest-biljett?" },
  { fraga: "vad är biljetten bredvid fonden?" },
];
FELSTAVADE.forEach((f, i) => {
  const nr = "B" + String(i + 1).padStart(2, "0");
  const svar = svaraLokaltCoinvest(f.fraga, KURSREGISTER);
  kontroll(
    nr + " — '" + f.fraga + "'",
    !!svar && svar.amne === "co-investeringen",
    svar ? "ämne=" + svar.amne : "null",
  );
});

// ── FALL C: determinism — bitidentiskt svar ─────────────────────────────────
{
  const Alla = [...NYA.map((f) => f.fraga), ...FELSTAVADE.map((f) => f.fraga)];
  const fel = [];
  for (const fr of Alla) {
    const a = svaraLokaltCoinvest(fr, KURSREGISTER);
    const b = svaraLokaltCoinvest(fr, KURSREGISTER);
    if (JSON.stringify(a) !== JSON.stringify(b)) fel.push(fr);
  }
  kontroll("C determinism — " + Alla.length + " frågor × 2 ⇒ bitidentiska", fel.length === 0,
    fel.length ? "differerande: " + fel.join(" | ") : Alla.length + " par gröna");
}

// ── FALL D: aritmetik maskinellt omräknad + registerdrivet + fantomslugar ───
{
  const D = [];
  // 1️⃣ Två biljetter
  D.push(["carry 20 % av vinsten 100 = 20", approx(0.2 * (200 - 100), 20)]);
  D.push(["LP-vägen 200 − 20 − 12 = 168", approx(200 - 20 - 12, 168)]);
  D.push(["gapet 200 − 168 = 32", approx(200 - 168, 32)]);
  // 2️⃣ Urvalsasymmetrin
  D.push(["helägd carry 20 % av 110 = 22", approx(0.2 * (210 - 100), 22)]);
  D.push(["fondvägen 210 − 22 − 12 = 176", approx(210 - 22 - 12, 176)]);
  D.push(["gapet 176 − 170 = 6 (trots 34 i avgift+carry)", approx(176 - 170, 6)]);
  D.push(["avgift+carry 22 + 12 = 34", approx(22 + 12, 34)]);
  // 3️⃣ Break-even + trappan
  D.push(["break-even 176/100 = 1,76x", approx(176 / 100, 1.76)]);
  D.push(["urvalsgapet 2,10 − 1,76 = 0,34x", approx(2.1 - 1.76, 0.34)]);
  D.push(["speglingen 0,34x × 100 = 34 enheter", approx(0.34 * 100, 34)]);
  D.push(["trappan 2,10 → 170+? nej: 210−22−12=176 mot 210 = +34", approx(210 - 176, 34)]);
  D.push(["trappan 1,90 → 190 − 176 = +14", approx(190 - 176, 14)]);
  D.push(["trappan 1,76 → 0", approx(176 - 176, 0)]);
  D.push(["trappan 1,70 → −6", approx(170 - 176, -6)]);
  // 3️⃣ Den enskilda affären
  D.push(["i fonden 170 − 14 carry − 12 = 144", approx(170 - 0.2 * (170 - 100) - 12, 144)]);
  D.push(["biljettens övertag 170 − 144 = 26", approx(170 - 144, 26)]);
  D.push(["26/144 = 18,1 %", approx(26 / 144, 0.1806, 0.001)]);
  // 4️⃣ Koncentrationen
  D.push(["nollresultat i fonden 1/25 = 4 %", approx(1 / 25, 0.04)]);
  D.push(["nollresultat på biljetten 100 %", approx(100, 100)]);
  D.forEach(([namn, ok], i) => kontroll("D" + String(i + 1).padStart(2, "0") + " aritmetik " + namn, ok, ok ? "omräknad grön" : "avvikelse"));

  // Registerdrivna tal: kategori-antalet + nivån i texten
  const peAntal = KURSREGISTER.filter((r) => r.kategori === "PRIVATE EQUITY & INVESTMENTBOLAG").length;
  const pe07 = KURSREGISTER.find((r) => r.slug === "pe-07-co-investeringen");
  const s = svaraLokaltCoinvest("vad är en co-investering?", KURSREGISTER);
  kontroll(
    "D19 registerdrivet — PE-antalet (" + peAntal + ") i texten",
    s.text.includes("finns " + peAntal + " kurser"),
    "PE-kategorin = " + peAntal + " kurser (läs ur registret)",
  );
  kontroll(
    "D20 registerdrivet — nivån (" + pe07.niva.toLowerCase() + ") i texten",
    s.text.includes(pe07.niva.toLowerCase() + " nivå"),
    "pe-07 = " + pe07.niva + " (registerdriven, klippskydd)",
  );

  // Fantomslugar: varje källa/kurslänk FINNS i registret
  const slugs = new Set(KURSREGISTER.map((r) => r.slug));
  const felSlugs = [];
  for (const m of COINVEST_MONSTER) {
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
  kontroll("D21 fantomslugar — alla källor och kurslänkar äkta i registret", felSlugs.length === 0,
    felSlugs.length ? felSlugs.join(" | ") : "0 fantomer");
}

// ── FALL E: omatchade/gränsfrågor → null ────────────────────────────────────
const OMATCHADE = [
  "vad är break-even-multipeln?",   // djup-lagrets «multipeln»-familj (sondfynd)
  "vad är en capital call?",        // nästas «call» (pengarstids dokumenterade gräns)
  "vad är en investering?",         // SOLIDFORM-FÄLLAN: tav 2 mot «coinvestering» — struken
  "vad är investering?",            // dito
  "vad är internräntan?",           // pe-mekaniks
  "vad är utfasningar?",            // pe-mekaniks
  "vad är andrahandsmarknaden?",    // pengarstids
  "vilket bolag ska jag köpa?",     // juridik — basens råd-monster
];
OMATCHADE.forEach((f, i) => {
  const nr = "E" + String(i + 1).padStart(2, "0");
  const svar = svaraLokaltCoinvest(f, KURSREGISTER);
  kontroll(nr + " null — '" + f + "'", svar === null, svar ? "fångades av " + svar.amne : "null ✓");
});

// ── FALL F: juridikgrind — inga rådfraser ───────────────────────────────────
{
  const RÅD = [/\bköp\b/, /\bsälj\b/, /vi\s+rekommenderar/, /borde\s+du\s+köpa/, /\bplacera\s+i\s+/, /Tipsa\s+om\s+aktie/, /bästa\s+köpet?\s+just\s+nu/];
  const brott = [];
  for (const m of COINVEST_MONSTER) {
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
    { fraga: "vad är internräntan?", agare: "pe-mekanik" },
    { fraga: "vad är lbo?", agare: "pe-mekanik" },
    { fraga: "vad är vattenfallet?", agare: "pe-mekanik" },
    { fraga: "vad är carried interest?", agare: "pe-mekanik" },
    { fraga: "vad är andrahandsmarknaden?", agare: "pengarstid" },
    { fraga: "vad är sekvensrisken?", agare: "pengarstid" },
    { fraga: "vad är diversifiering?", agare: "portföljgrund" },
    { fraga: "vad är en köpoption?", agare: "optionsdjup" },
    { fraga: "vad är J-kurvan?", agare: "realekonomi" },
    { fraga: "vad är korrelation?", agare: "portföljgrund" },
  ];
  const stolder = [];
  for (const f of FRÄMNINGAR) {
    const svar = svaraLokaltCoinvest(f.fraga, KURSREGISTER);
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
    /\{ namn:\s+"([^"]+)",\s*fil:\s+"([^"]+)",\s*fn:\s+"([^"]+)",\s*arr:\s+"([^"]+)",\s*antal:\s+(\d+) \}/g,
  )].map((m) => ({ namn: m[1], fil: m[2], fn: m[3] }));
  const utom = defs.filter((d) => d.fil !== "ai-mentor-coinvest-fragor.ts");
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
  const med = NYA.map((f) => !!svaraLokaltCoinvest(f.fraga, KURSREGISTER));
  kontroll("H2 med detta lager fångas samtliga 3", med.every(Boolean), med.join(","));
}

// ── FALL J: kärnordsdisjunktion LIVE ────────────────────────────────────────
{
  function normalisera(s) { return s.toLowerCase().replace(/[^\p{L}\p{N}]+/gu, " ").replace(/\s+/g, " ").trim(); }
  function diafri(s) { return normalisera(s).normalize("NFD").replace(/\p{M}/gu, "").normalize("NFC"); }
  const filer = readdirSync(join(ROT, "src/lib"))
    .filter((f) => f.startsWith("ai-mentor-") && f.endsWith(".ts") && f !== "ai-mentor-coinvest-fragor.ts" && f !== "ai-mentor-register.ts" && f !== "ai-mentor-typer.ts");
  const andras = new Set();
  for (const f of filer) {
    const src = readFileSync(join(ROT, "src/lib", f), "utf8");
    for (const m of src.matchAll(/karnord:\s*\[([^\]]*)\]/gs)) {
      for (const q of m[1].matchAll(/"([^"]+)"/g)) andras.add(diafri(q[1]));
    }
  }
  const mina = COINVEST_MONSTER.flatMap((m) => m.karnord.map(diafri));
  const overlap = mina.filter((k) => andras.has(k));
  kontroll(
    "J kärnordsdisjunktion LIVE — " + mina.length + " kärnord mot " + andras.size + " andras (ur " + filer.length + " filer)",
    overlap.length === 0,
    overlap.length ? "ÖVERLAPP: " + overlap.join(" | ") : "0 delade kärnord",
  );
}

// ── FALL L: widget-synk — mellan volatilitetsmekanik och marknadsrytm ───────
{
  const widget = readFileSync(join(ROT, "src/components/ak1a/chat-widget.tsx"), "utf8");
  const FEL = [];
  if (!widget.includes('from "@/lib/ai-mentor-coinvest-fragor"')) FEL.push("importen av ai-mentor-coinvest-fragor saknas");
  const kedjRad = widget.split("\n").find((l) => l.includes("const lokalt = "));
  if (!kedjRad) FEL.push("kedjeraden (const lokalt = …) hittades inte");
  else {
    if (!kedjRad.includes("?? svaraLokaltCoinvest(q, KURSREGISTER)")) FEL.push("svaraLokaltCoinvest saknas i kedjan");
    const posCoin = kedjRad.indexOf("svaraLokaltCoinvest(q, KURSREGISTER)");
    const posVolm = kedjRad.indexOf("svaraLokaltVolatilitetsmekanik(q, KURSREGISTER)");
    const posPengarstid = kedjRad.indexOf("svaraLokaltPengarstid(q, KURSREGISTER)");
    const posMarknadsrytm = kedjRad.indexOf("svaraLokaltMarknadsrytm(q, KURSREGISTER)");
    if (!(posPengarstid >= 0 && posVolm > posPengarstid && posCoin > posVolm)) FEL.push("svaraLokaltCoinvest ligger inte EFTER volatilitetsmekanik (som ligger efter pengarstid)");
    if (!(posMarknadsrytm >= 0 && posCoin < posMarknadsrytm)) FEL.push("svaraLokaltCoinvest ligger inte FÖRE marknadsrytm (deras SIST-deklaration)");
    if (!kedjRad.trimEnd().endsWith("?? svaraLokaltMarknadsrytm(q, KURSREGISTER);")) FEL.push("marknadsrytm är inte SISTA ledet");
  }
  kontroll(
    "L widget-synk — import + MELLAN volatilitetsmekanik och marknadsrytm (SIST respekterad)",
    FEL.length === 0,
    FEL.length ? FEL.join(" | ") : "sista ledet: pengarstid → volatilitetsmekanik → co-invest → marknadsrytm (SIST)",
  );
}

// ── Summering ───────────────────────────────────────────────────────────────
console.log("");
console.log("────────────────────────────────────────");
console.log("AI-MENTORN spår 6 s6-u1 omgång 27 (co-invest): " + pass + " PASS · " + fail + " FAIL av " + (pass + fail));
process.exit(fail > 0 ? 1 : 0);
