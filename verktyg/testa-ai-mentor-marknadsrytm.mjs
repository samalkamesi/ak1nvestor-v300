/**
 * TESTA AI-MENTORN — MARKNADSRYTM (omgång 25: korrelationsrisken +
 * kapitalcykeln + bull-/bearmarknaden).
 *
 * Kör:  node verktyg/testa-ai-mentor-marknadsrytm.mjs
 * Krav: Node >= 22.18 (type stripping default — samma som testa-ai-mentor.mjs).
 *
 * Regressionstest för omgång 25:s tre förhandsfrågor (se
 * src/lib/ai-mentor-marknadsrytm-fragor.ts) med bevakning:
 *   A  3 nya kanoniska → rätt ämne, primärkälla, FLERKÄLLA (kallor ≥ 3 +
 *      numrerad Källor-rad i texten) och ≥ 3 kurslänkar per svar
 *   B  12 felstavade/varierade varianter → samma träff som den kanoniska
 *   C  determinism — alla frågor två gånger ⇒ bitidentiskt svar
 *   D  aritmetik maskinellt omräknad (17 poster: √-uttrycken, ln-fallet,
 *      marginalerna, 3^(1/6), 0,6^(1/10), återhämtningskvoterna) +
 *      registerdriven räknekontroll (kategori-antalet i text) +
 *      fantomslugar (varje källa/kurslänk FINNS i registret)
 *   E  4 omatchade frågor → null (kedjan/API får dem, inte dessa mönster)
 *   F  juridikgrind-lint — inga rådfraser i de nya svaren
 *   G  ANTISTÖLD — tidigare lagers kanoniska frågor (fönstrets syskon
 *      kontrahent + etfmekanik + portföljgrund + sektor + historia +
 *      tidsaxel + bas) ger NULL i detta lager
 *   H  SIST-INVARIANT — detta lagers 3 kanoniska ger NULL genom HELA
 *      kedjan utan detta lager (dupliceringsskydd)
 *   J  KÄRNORDSDISJUNKTION LIVE — kärnorden lästa ur samtliga
 *      src/lib/ai-mentor-*-fragor.ts + ai-mentor-svar.ts (utom detta
 *      lager): inget av detta lagers kärnord finns hos något annat lager
 *   L  widget-synk — import + SIST i chat-widget.tsx:s kedja + inga
 *      okända kedjekomponenter (alla 61 dokumenterade här)
 *
 * ── JURIDIKGRINDEN (2007:528) ─────────────────────────────────────────
 * Testfall F vaktar att svaren är pedagogiska — aldrig rekommendationer.
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
      "Kör med: node --experimental-strip-types verktyg/testa-ai-mentor-marknadsrytm.mjs",
  );
  process.exit(1);
}

// Den RIKTIGA koden ur src/ (ingen duplikation i testet).
const { KURSREGISTER } = await import(pathToFileURL(join(ROT, "src/lib/ai-mentor-register.ts")).href);
const { svaraLokaltMarknadsrytm, MARKNADSRYTM_MONSTER } = await import(
  pathToFileURL(join(ROT, "src/lib/ai-mentor-marknadsrytm-fragor.ts")).href
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

// ── FALL A: de tre kanoniska med flerkällskrav ──────────────────────────────
const NYA = [
  { fraga: "Vad är korrelationsrisken?", amne: "korrelationsrisk", slug: "rk-10-korrelationsrisk" },
  { fraga: "Vad är kapitalcykeln?", amne: "kapitalcykel", slug: "rk-05-cykelrisk" },
  { fraga: "Vad är en bullmarknad?", amne: "bullbear", slug: "bf-15-bubblans-anatomi" },
];

NYA.forEach((f, i) => {
  const nr = "A" + String(i + 1).padStart(2, "0");
  const svar = svaraLokaltMarknadsrytm(f.fraga, KURSREGISTER);
  if (!svar) {
    kontroll(nr + " " + f.amne, false, "inget lokalt svar på: '" + f.fraga + "'");
    return;
  }
  const amneOk = svar.amne === f.amne;
  const kallaOk = svar.kalla.slug === f.slug;
  const kallorFinns = Array.isArray(svar.kallor) && svar.kallor.length >= 3;
  const kallradOk = svar.text.includes("📖 Källor (");
  const kurslankar = svar.handlings.filter((h) => h.lank.startsWith("/kurser/"));
  const kurslankarOk = kurslankar.length >= 3;
  kontroll(
    nr + " " + f.amne + " — '" + f.fraga + "'",
    amneOk && kallaOk && kallorFinns && kallradOk && kurslankarOk,
    "ämne=" + svar.amne + " · källa=" + svar.kalla.slug +
      " · källor=" + (svar.kallor ? svar.kallor.length : 0) +
      " · kurslänkar=" + kurslankar.length,
  );
});

// ── FALL B: felstavade/varierade varianter → samma träff ────────────────────
const FELSTAVADE = [
  { fraga: "vad ar korrelationsrisken?", amne: "korrelationsrisk" },
  { fraga: "vad är korrelations risken?", amne: "korrelationsrisk" },
  { fraga: "vad är en korrelationskoefficient?", amne: "korrelationsrisk" },
  { fraga: "hur hänger korrelationsrisken ihop med krisen?", amne: "korrelationsrisk" },
  { fraga: "vad ar kapitalcykeln?", amne: "kapitalcykel" },
  { fraga: "förklara kapital cykeln", amne: "kapitalcykel" },
  { fraga: "vad är capital cycle investing?", amne: "kapitalcykel" },
  { fraga: "hur fungerar kapitalcykler?", amne: "kapitalcykel" },
  { fraga: "vad ar en bullmarknad?", amne: "bullbear" },
  { fraga: "förklara bullmarknaden!", amne: "bullbear" },
  { fraga: "vad är en bearmarknad?", amne: "bullbear" },
  { fraga: "vad menas med bear market?", amne: "bullbear" },
];

FELSTAVADE.forEach((f, i) => {
  const nr = "B" + String(i + 1).padStart(2, "0");
  const svar = svaraLokaltMarknadsrytm(f.fraga, KURSREGISTER);
  kontroll(
    nr + " " + f.amne + " — '" + f.fraga + "'",
    !!svar && svar.amne === f.amne,
    svar ? "ämne=" + svar.amne : "null",
  );
});

// ── FALL C: determinism — bitidentiskt svar ─────────────────────────────────
{
  const Alla = [...NYA.map((f) => f.fraga), ...FELSTAVADE.map((f) => f.fraga)];
  const fel = [];
  for (const fr of Alla) {
    const a = svaraLokaltMarknadsrytm(fr, KURSREGISTER);
    const b = svaraLokaltMarknadsrytm(fr, KURSREGISTER);
    if (JSON.stringify(a) !== JSON.stringify(b)) fel.push(fr);
  }
  kontroll("C determinism — " + Alla.length + " frågor × 2 ⇒ bitidentiska", fel.length === 0,
    fel.length ? "differerande: " + fel.join(" | ") : Alla.length + " par gröna");
}

// ── FALL D: aritmetik maskinellt omräknad + registerdrivet + fantomslugar ───
{
  const D = [];
  // Monster 1 — korrelationsrisken
  const v0 = 0.25 * 225 + 0.25 * 225;                    // 112,5
  D.push(["√112,5 = 10,61", approx(Math.sqrt(v0), 10.61)]);
  D.push(["15,0 − 10,61 = 4,4", approx(15 - Math.sqrt(v0), 4.39, 0.011)]);
  D.push(["√90 = 9,49", approx(Math.sqrt(0.25 * 225 + 0.25 * 225 - 0.1 * 225), 9.49)]);
  D.push(["√225 = 15,0", approx(Math.sqrt(0.25 * 225 + 0.25 * 225 + 0.5 * 1 * 225), 15.0)]);
  D.push(["√202,5 = 14,23", approx(Math.sqrt(112.5 + 0.5 * 0.8 * 225), 14.23)]);
  D.push(["15,0 − 14,23 = 0,8", approx(15 - Math.sqrt(202.5), 0.77, 0.011)]);
  D.push(["10,61/15,0 = 0,71 (−29 %)", approx(Math.sqrt(112.5) / 15, 0.707, 0.006)]);
  // Monster 2 — kapitalcykeln
  D.push(["30/100 = 30,0 % marginal", approx(30 / 100, 0.3)]);
  D.push(["−5/65 = −7,7 % marginal", approx(-5 / 65, -0.0769, 0.001)]);
  D.push(["ln 1,4 / ln 1,03 = 11,4 år", approx(Math.log(1.4) / Math.log(1.03), 11.38, 0.05)]);
  D.push(["1,03^5 = 1,16", approx(Math.pow(1.03, 5), 1.159, 0.005)]);
  D.push(["1,40 − 1,16 = 0,24", approx(1.4 - Math.pow(1.03, 5), 0.241, 0.005)]);
  D.push(["0,24/1,40 = 17 %", approx((1.4 - Math.pow(1.03, 5)) / 1.4, 0.172, 0.005)]);
  // Monster 3 — bull/bear
  D.push(["3^(1/6) − 1 = +20,1 %/år", approx(Math.pow(3, 1 / 6) - 1, 0.2009, 0.001)]);
  D.push(["0,6^(1/10) − 1 = −5,0 %/mån", approx(Math.pow(0.6, 1 / 10) - 1, -0.0498, 0.001)]);
  D.push(["300/180 = +66,7 %", approx(300 / 180, 1.6667, 0.001)]);
  D.push(["1/0,8 = +25 %", approx(1 / 0.8, 1.25, 0.001)]);
  D.forEach(([namn, ok], i) => kontroll("D" + String(i + 1).padStart(2, "0") + " aritmetik " + namn, ok, ok ? "omräknad grön" : "avvikelse"));

  // Registerdrivna tal: kategori-antalet i texten
  const riskAntal = KURSREGISTER.filter((r) => r.kategori === "RISKHANTERING").length;
  const beteendeAntal = KURSREGISTER.filter((r) => r.kategori === "BETEENDEFINANS").length;
  const s1 = svaraLokaltMarknadsrytm("vad är korrelationsrisken?", KURSREGISTER);
  const s2 = svaraLokaltMarknadsrytm("vad är kapitalcykeln?", KURSREGISTER);
  const s3 = svaraLokaltMarknadsrytm("vad är en bullmarknad?", KURSREGISTER);
  kontroll(
    "D18 registerdrivet — RISKHANTERING-antalet (" + riskAntal + ") i monster 1+2",
    s1.text.includes("finns " + riskAntal + " kurser") && s2.text.includes("finns " + riskAntal + " kurser"),
    "riskhanterings-kategorin = " + riskAntal + " kurser (läs ur registret)",
  );
  kontroll(
    "D19 registerdrivet — BETEENDEFINANS-antalet (" + beteendeAntal + ") i monster 3",
    s3.text.includes("finns " + beteendeAntal + " kurser"),
    "beteendefinans-kategorin = " + beteendeAntal + " kurser (läs ur registret)",
  );

  // Fantomslugar: varje källa/kurslänk FINNS i registret
  const slugs = new Set(KURSREGISTER.map((r) => r.slug));
  const felSlugs = [];
  for (const m of MARKNADSRYTM_MONSTER) {
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

// ── FALL E: omatchade frågor → null ─────────────────────────────────────────
const OMATCHADE = [
  "vad är en option?",
  "hur räknar jag på ränta-på-ränta?",
  "vilket bolag ska jag köpa?",
  "vad är correlation i excel?", // «correlation» engelska granne — får INTE fångas av risk-formerna
];
OMATCHADE.forEach((f, i) => {
  const nr = "E" + String(i + 1).padStart(2, "0");
  const svar = svaraLokaltMarknadsrytm(f, KURSREGISTER);
  kontroll(nr + " null — '" + f + "'", svar === null, svar ? "fångades av " + svar.amne : "null ✓");
});

// ── FALL F: juridikgrind — inga rådfraser ───────────────────────────────────
{
  const RÅD = [/köp\s+/, /sälj\s+/, /vi\s+rekommenderar/, /borde\s+du\s+köpa/, /placera\s+i\s+/, /Tipsa\s+om\s+aktie/, /bästa\s+köpet?\s+just\s+nu/];
  const brott = [];
  for (const m of MARKNADSRYTM_MONSTER) {
    const svar = m.bygga(KURSREGISTER);
    for (const rx of RÅD) if (rx.test(svar.text)) brott.push(m.id + ": " + rx.source);
    if (!svar.text.includes("inga placeringstips")) brott.push(m.id + ": utbildnings-disclaimern saknas");
  }
  kontroll("F juridikgrind — pedagogisk text, inga rådfraser", brott.length === 0,
    brott.length ? brott.join(" | ") : "0 rådfraser, disclaimer i samtliga 3");
}

// ── FALL G: antistöld — tidigare/senare lagers kanoniska → NULL här ─────────
{
  const FRÄMNINGAR = [
    { fraga: "vad är kontrahentrisken?", agare: "kontrahent (syskon u2)" },
    { fraga: "vad är ett clearinghus?", agare: "kontrahent (syskon u2)" },
    { fraga: "vad är contango?", agare: "etfmekanik (syskon u1)" },
    { fraga: "vad är etf-arbitrage?", agare: "etfmekanik (syskon u1)" },
    { fraga: "vad är korrelation?", agare: "portföljgrund" },
    { fraga: "vad är diversifiering?", agare: "portföljgrund" },
    { fraga: "vad är utspädning?", agare: "kapitalmekanik" },
    { fraga: "vad är en cyklisk aktie?", agare: "sektor" },
    { fraga: "vad är konjunkturindikatorer?", agare: "tidsaxel" },
    { fraga: "vad är en börsbubbla?", agare: "historia" },
    { fraga: "vad är momentum?", agare: "faktordjup" },
  ];
  const stolder = [];
  for (const f of FRÄMNINGAR) {
    const svar = svaraLokaltMarknadsrytm(f.fraga, KURSREGISTER);
    if (svar) stolder.push("'" + f.fraga + "' togs av detta lager (" + f.agare + " äger den)");
  }
  kontroll("G antistöld — " + FRÄMNINGAR.length + " grannfrågor lämnas ifred", stolder.length === 0,
    stolder.length ? stolder.join(" | ") : "0 stölder");
}

// ── FALL H: SIST-invariant — kanoniska NULL genom kedjan utan detta lager ──
{
  const MOTORER = [
    ["ai-mentor-makro-fragor.ts", "svaraLokaltMakro"],
    ["ai-mentor-extra-fragor.ts", "svaraLokaltExtra"],
    ["ai-mentor-svar.ts", "svaraLokalt"],
    ["ai-mentor-nasta-fragor.ts", "svaraLokaltNasta"],
    ["ai-mentor-kapitalmekanik-fragor.ts", "svaraLokaltKapitalmekanik"],
    ["ai-mentor-sektor-fragor.ts", "svaraLokaltSektor"],
    ["ai-mentor-case-fragor.ts", "svaraLokaltCase"],
    ["ai-mentor-marknadsmekanik-fragor.ts", "svaraLokaltMarknadsmekanik"],
    ["ai-mentor-praktik-fragor.ts", "svaraLokaltPraktik"],
    ["ai-mentor-valutamekanik-fragor.ts", "svaraLokaltValutamekanik"],
    ["ai-mentor-portfoljgrund-fragor.ts", "svaraLokaltPortfoljgrund"],
    ["ai-mentor-agande-fragor.ts", "svaraLokaltAgande"],
    ["ai-mentor-redovisningsdjup-fragor.ts", "svaraLokaltRedovisningsdjup"],
    ["ai-mentor-djup-fragor.ts", "svaraLokaltDjup"],
    ["ai-mentor-historia-fragor.ts", "svaraLokaltHistoria"],
    ["ai-mentor-lonsamhetsdjup-fragor.ts", "svaraLokaltLonsamhetsdjup"],
    ["ai-mentor-tsdjup-fragor.ts", "svaraLokaltTsdjup"],
    ["ai-mentor-skattedjup-fragor.ts", "svaraLokaltSkattedjup"],
    ["ai-mentor-beteendedjup-fragor.ts", "svaraLokaltBeteendedjup"],
    ["ai-mentor-riskdjup-fragor.ts", "svaraLokaltRiskdjup"],
    ["ai-mentor-riskmattsdjup-fragor.ts", "svaraLokaltRiskmattsdjup"],
    ["ai-mentor-utdelningsdjup-fragor.ts", "svaraLokaltUtdelningsdjup"],
    ["ai-mentor-forvantningsdjup-fragor.ts", "svaraLokaltForvantningsdjup"],
    ["ai-mentor-portfoljbalans-fragor.ts", "svaraLokaltPortfoljbalans"],
    ["ai-mentor-stabilitetsdjup-fragor.ts", "svaraLokaltStabilitetsdjup"],
    ["ai-mentor-grahamgolv-fragor.ts", "svaraLokaltGrahamgolv"],
    ["ai-mentor-varderjustering-fragor.ts", "svaraLokaltVarderjustering"],
    ["ai-mentor-optionsdjup-fragor.ts", "svaraLokaltOptionsdjup"],
    ["ai-mentor-risklasningsdjup-fragor.ts", "svaraLokaltRisklasningsdjup"],
    ["ai-mentor-avkastningskurva-fragor.ts", "svaraLokaltAvkastningskurva"],
    ["ai-mentor-avrakningsdjup-fragor.ts", "svaraLokaltAvkastningsdjup"],
    ["ai-mentor-varderingsverktyg-fragor.ts", "svaraLokaltVarderingsverktyg"],
    ["ai-mentor-warrant-fragor.ts", "svaraLokaltWarrant"],
    ["ai-mentor-tidsaxel-fragor.ts", "svaraLokaltTidsaxel"],
    ["ai-mentor-kapitalbindning-fragor.ts", "svaraLokaltKapitalbindning"],
    ["ai-mentor-ekosystemdjup-fragor.ts", "svaraLokaltEkosystemdjup"],
    ["ai-mentor-handelsdag-fragor.ts", "svaraLokaltHandelsdag"],
    ["ai-mentor-portfoljpraktik-fragor.ts", "svaraLokaltPortfoljpraktik"],
    ["ai-mentor-utdelningskalender-fragor.ts", "svaraLokaltUtdelningskalender"],
    ["ai-mentor-kreditdjup-fragor.ts", "svaraLokaltKreditdjup"],
    ["ai-mentor-sektordjup-fragor.ts", "svaraLokaltSektordjup"],
    ["ai-mentor-sektorskola2-fragor.ts", "svaraLokaltSektorskola2"],
    ["ai-mentor-beteendemekanik-fragor.ts", "svaraLokaltBeteendemekanik"],
    ["ai-mentor-pe-mekanik-fragor.ts", "svaraLokaltPeMekanik"],
    ["ai-mentor-riskpremie-fragor.ts", "svaraLokaltRiskpremie"],
    ["ai-mentor-overlevnadsdjup-fragor.ts", "svaraLokaltOverlevnadsdjup"],
    ["ai-mentor-koncernlasning-fragor.ts", "svaraLokaltKoncernlasning"],
    ["ai-mentor-tillvaxtdjup-fragor.ts", "svaraLokaltTillvaxtdjup"],
    ["ai-mentor-faktordjup-fragor.ts", "svaraLokaltFaktordjup"],
    ["ai-mentor-bokmastar-fragor.ts", "svaraLokaltBokmastar"],
    ["ai-mentor-riskbudget-fragor.ts", "svaraLokaltRiskbudget"],
    ["ai-mentor-konvertibel-fragor.ts", "svaraLokaltKonvertibel"],
    ["ai-mentor-sektorlasning-fragor.ts", "svaraLokaltSektorlasning"],
    ["ai-mentor-vardegrund-fragor.ts", "svaraLokaltVardegrund"],
    ["ai-mentor-realekonomi-fragor.ts", "svaraLokaltRealekonomi"],
    ["ai-mentor-forsakring-fragor.ts", "svaraLokaltForsakring"],
    ["ai-mentor-moatdjup-fragor.ts", "svaraLokaltMoatdjup"],
    ["ai-mentor-nya-territorier-fragor.ts", "svaraLokaltNyaTerritorier"],
    ["ai-mentor-etfmekanik-fragor.ts", "svaraLokaltEtfmekanik"],
    ["ai-mentor-kontrahent-fragor.ts", "svaraLokaltKontrahent"],
  ];
  const importError = [];
  const motorer = [];
  for (const [fil, fn] of MOTORER) {
    try {
      const modul = await import(pathToFileURL(join(ROT, "src/lib", fil)).href);
      motorer.push({ fil, fn: modul[fn] });
    } catch (e) {
      importError.push(fil + ": " + e.message);
    }
  }
  kontroll("H0 kedjan importbar — 60 motorer ( utan detta lager)", importError.length === 0,
    importError.length ? importError.join(" | ") : motorer.length + " motorer importerade");

  const fångster = [];
  for (const f of NYA) {
    for (const m of motorer) {
      const svar = m.fn(f.fraga, KURSREGISTER);
      if (svar) fångster.push("'" + f.fraga + "' fångades av " + m.fil);
    }
  }
  kontroll("H SIST-invariant — 3 kanoniska NULL genom 60 motorer", fångster.length === 0,
    fångster.length ? fångster.join(" | ") : "0 fångster — detta lager är enda ägaren");

  // Spegel: MED detta lager ska de fångas (kedjan hel)
  const med = NYA.map((f) => !!svaraLokaltMarknadsrytm(f.fraga, KURSREGISTER));
  kontroll("H2 med detta lager fångas samtliga 3", med.every(Boolean), med.join(","));
}

// ── FALL J: kärnordsdisjunktion LIVE ────────────────────────────────────────
{
  function normalisera(s) { return s.toLowerCase().replace(/[^\p{L}\p{N}]+/gu, " ").replace(/\s+/g, " ").trim(); }
  function diafri(s) { return normalisera(s).normalize("NFD").replace(/\p{M}/gu, "").normalize("NFC"); }
  const filer = readdirSync(join(ROT, "src/lib"))
    .filter((f) => f.startsWith("ai-mentor-") && f.endsWith(".ts") && f !== "ai-mentor-marknadsrytm-fragor.ts" && f !== "ai-mentor-register.ts" && f !== "ai-mentor-typer.ts");
  const andras = new Set();
  for (const f of filer) {
    const src = readFileSync(join(ROT, "src/lib", f), "utf8");
    for (const m of src.matchAll(/karnord:\s*\[([^\]]*)\]/gs)) {
      for (const q of m[1].matchAll(/"([^"]+)"/g)) andras.add(diafri(q[1]));
    }
  }
  const mina = MARKNADSRYTM_MONSTER.flatMap((m) => m.karnord.map(diafri));
  const overlap = mina.filter((k) => andras.has(k));
  kontroll(
    "J kärnordsdisjunktion LIVE — " + mina.length + " kärnord mot " + andras.size + " andras (ur " + filer.length + " filer)",
    overlap.length === 0,
    overlap.length ? "ÖVERLAPP: " + overlap.join(" | ") : "0 delade kärnord",
  );
}

// ── FALL L: widget-synk ─────────────────────────────────────────────────────
{
  const widget = readFileSync(join(ROT, "src/components/ak1a/chat-widget.tsx"), "utf8");
  const FEL = [];
  if (!widget.includes('from "@/lib/ai-mentor-marknadsrytm-fragor"')) FEL.push("importen av ai-mentor-marknadsrytm-fragor saknas");
  // Alla 61 kända komponenter (dokumentationsskyldigheten: framtida lager läggs här)
  const kanda = new Set([
    "svaraLokaltMakro", "svaraLokaltExtra", "svaraLokaltModernaRisker", "svaraLokalt", "svaraLokaltNasta",
    "svaraLokaltKapitalmekanik", "svaraLokaltSektor", "svaraLokaltCase",
    "svaraLokaltMarknadsmekanik", "svaraLokaltPraktik", "svaraLokaltValutamekanik",
    "svaraLokaltPortfoljgrund", "svaraLokaltAgande", "svaraLokaltRedovisningsdjup",
    "svaraLokaltDjup", "svaraLokaltHistoria", "svaraLokaltLonsamhetsdjup",
    "svaraLokaltTsdjup", "svaraLokaltSkattedjup", "svaraLokaltBeteendedjup",
    "svaraLokaltRiskdjup", "svaraLokaltRiskmattsdjup", "svaraLokaltUtdelningsdjup",
    "svaraLokaltForvantningsdjup", "svaraLokaltPortfoljbalans", "svaraLokaltStabilitetsdjup",
    "svaraLokaltGrahamgolv", "svaraLokaltVarderjustering", "svaraLokaltOptionsdjup",
    "svaraLokaltRisklasningsdjup", "svaraLokaltAvkastningskurva", "svaraLokaltAvkastningsdjup",
    "svaraLokaltVarderingsverktyg", "svaraLokaltWarrant", "svaraLokaltTidsaxel",
    "svaraLokaltKapitalbindning", "svaraLokaltEkosystemdjup", "svaraLokaltHandelsdag",
    "svaraLokaltPortfoljpraktik", "svaraLokaltUtdelningskalender", "svaraLokaltKreditdjup",
    "svaraLokaltSektordjup", "svaraLokaltSektorskola2", "svaraLokaltBeteendemekanik",
    "svaraLokaltPeMekanik", "svaraLokaltRiskpremie", "svaraLokaltOverlevnadsdjup",
    "svaraLokaltKoncernlasning", "svaraLokaltTillvaxtdjup", "svaraLokaltFaktordjup",
    "svaraLokaltBokmastar", "svaraLokaltRiskbudget", "svaraLokaltKonvertibel",
    "svaraLokaltSektorlasning", "svaraLokaltVardegrund", "svaraLokaltRealekonomi",
    "svaraLokaltForsakring", "svaraLokaltMoatdjup", "svaraLokaltNyaTerritorier",
    "svaraLokaltEtfmekanik", "svaraLokaltKontrahent",
    // Omgång 25-tillägg (s6-u2 försök 2, 2026-09-20): multipel — 61:a motorn,
    // FÖRE detta lager (marknadsrytm förblir SIST). Dokumentationsplikten.
    "svaraLokaltMultipel",
            // Omgång 26 (manifest auto-s6-1789890903364 — ordningspasset efter två
            // krockade harmoniseringsvågor): fönstrets tre i KEDJEORDNING — riskadress
            // (s6-u1, 62:a) · balansdjup (s6-u2, 63:e) · optionshantverk (s6-u3, 64:e)
            // — FÖRE marknadsrytm (deras SIST-deklaration).
            "svaraLokaltRiskadress",
            "svaraLokaltBalansdjup",
            "svaraLokaltOptionshantverk",
            // Omgång 26 (manifest auto-s6-1789890903364, s6-u2 fönster 3):
            // pengarstid — andrahandsmarknaden + sekvensrisken, 66:e motorn,
            // FÖRE detta lager (marknadsrytm förblir SIST). Dokumentationsplikten.
            "svaraLokaltPengarstid",
            "svaraLokaltVolatilitetsmekanik",
            "svaraLokaltMarknadsrytm",
  ]);
  const kedjRad = widget.split("\n").find((l) => l.includes("const lokalt = "));
  if (!kedjRad) FEL.push("kedjeraden (const lokalt = …) hittades inte");
  else {
    for (const match of kedjRad.matchAll(/svaraLokalt\w*\(/g)) {
      const namn = match[0].slice(0, -1);
      if (!kanda.has(namn)) FEL.push("okänd kedjekomponent: " + namn);
    }
    if (!kedjRad.includes("?? svaraLokaltMarknadsrytm(q, KURSREGISTER)")) FEL.push("svaraLokaltMarknadsrytm saknas SIST i kedjan");
    if (!kedjRad.trimEnd().endsWith("?? svaraLokaltMarknadsrytm(q, KURSREGISTER);")) FEL.push("svaraLokaltMarknadsrytm är inte SISTA ledet");
  }
  kontroll(
    "L01 widget-synk — import + SIST i kedjan + inga okända komponenter (63 dokumenterade)",
    FEL.length === 0,
    FEL.length ? FEL.join(" | ") : "SIST i kedjan (multipel 61:a före), samtliga komponenter kända",
  );
}

// ── Summering ───────────────────────────────────────────────────────────────
console.log("");
console.log("────────────────────────────────────────");
console.log("AI-MENTORN spår 6 s6-u3 omgång 25 (marknadsrytm): " + pass + " PASS · " + fail + " FAIL av " + (pass + fail));
process.exit(fail > 0 ? 1 : 0);
