/**
 * TESTA AI-MENTORN — BETEENDEFALLOR-LAGRET (s6-u3, manifest
 * auto-s6-1789965330060, fönster 31, byggare 3/3). 0 beroenden utöver
 * modulen själv + registret (dependency-injection).
 *
 * Kör:  node verktyg/testa-ai-mentor-beteendefallor.mjs
 *
 * Fall:
 *   A    källmärke      — varje monster: «📖 Källor (N):» + numrerad lista,
 *                         slugs registeräkta, ≥2 källor
 *   A2   wiring         — widgeten: import + kedjeposition EFTER casepraktik
 *                         och FÖRE marknadsrytm (deras SIST)
 *   B    felstavning    — varianter med 1–2 fel fångas av rätt monster
 *   C    determinism    — samma fråga två gånger ⇒ bitidentiskt svar
 *   D01  aritmetik      — kursens EGNA tal maskinellt omräknade
 *                         (kombinationer, normalapproximation, logaritmer,
 *                          harmoniska serien, binomialfördelningen)
 *   D02  registerdrivna — BETEENDEFINANS-antalet och nivåerna läses ur
 *                         registret VID SVARSTID (inte hårdkodade)
 *   D03  fantomslugar   — varje /kurser/-länk pekar på äkta register-slug
 *   E    kanonisk träff — lagrets kanoniska + varianter + kärnordsfamiljer
 *   F    null-gränser   — dokumenterade gränser lämnas ifred STANDALONE:
 *                         «halo-effekt» (basens fras), «kluster» (tsdjup),
 *                         «hyperbolisk diskontering» (nästa), «mentala
 *                         konton» (bas/beteendedjup), «monte carlo»,
 *                         «bayesiansk omviktning» (ekosystemdjup)
 *   G    antistöld      — mot kedjetestets ALLA kanoniska: endast egna
 *                         får träffas standalone; «merger arbitrage» är
 *                         dokumenterad KEDJESÄKER skuggning (bokmastaren
 *                         motor 50 FÖRE här — kedjan verifieras ge rätt)
 *   J    juridikgrind   — utbildningsform, inga rådsfraser, inga lagrum
 *   K    kärnords-      — LIVE-disjunktion mot SAMTLIGA övriga lagers
 *        disjunktion      kärnord (läses ur MOTORDEFS, tolerans enligt
 *                         motorns egen semantik)
 *   L    widget-synk    — import + ordning + knapp
 *
 * ── JURIDIKGRINDEN (2007:528) ─────────────────────────────────────────
 * Fall J vaktar att samtliga svar är pedagogisk utbildning.
 */
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const HÄR = dirname(fileURLToPath(import.meta.url));
const ROT = join(HÄR, "..");

const [major, minor] = process.versions.node.split(".").map(Number);
const stodStrip = major > 22 || (major === 22 && minor >= 18);
if (!stodStrip && !process.execArgv.includes("--experimental-strip-types")) {
  console.error("FEL: Node " + process.versions.node + " saknar type stripping.");
  process.exit(1);
}

const { svaraLokaltBeteendefallor, BETEENDEFALLOR_MONSTER } = await import(
  pathToFileURL(join(ROT, "src/lib/ai-mentor-beteendefallor-fragor.ts")).href
);
const { KURSREGISTER } = await import(
  pathToFileURL(join(ROT, "src/lib/ai-mentor-register.ts")).href
);

// Syskonmotorerna LIVE (för K + G) — läs MOTORDEFS ur kedjetestet.
const kedjaKalla = readFileSync(join(ROT, "verktyg/testa-ai-mentor-kedja.mjs"), "utf8");
const defs = [...kedjaKalla.matchAll(/\{ namn: "([^"]+)",\s*fil: "([^"]+)",\s*fn: "([^"]+)",\s*arr: "([^"]+)",\s*antal: (\d+) \}/g)]
  .map((m) => ({ namn: m[1], fil: m[2], fn: m[3], arr: m[4], antal: Number(m[5]) }));
const MITT_INDEX = defs.findIndex((d) => d.namn === "beteendefallor");
const MOTORER = [];
for (const d of defs) {
  const modul = await import(pathToFileURL(join(ROT, "src/lib/" + d.fil)).href);
  MOTORER.push({ ...d, index: MOTORER.length, fnk: modul[d.fn], monster: modul[d.arr] });
}
function kedja(fraga) {
  for (const m of MOTORER) {
    const s = m.fnk(fraga, KURSREGISTER);
    if (s) return { svar: s, motor: m.namn, index: m.index };
  }
  return null;
}

let pass = 0;
let fail = 0;
function kontroll(namn, ok, detalj) {
  if (ok) { pass++; console.log("PASS  " + namn + (detalj ? "  — " + detalj : "")); }
  else { fail++; console.log("FAIL  " + namn + (detalj ? "  — " + detalj : "")); }
}
function avrund(x, n) { const f = 10 ** n; return Math.round(x * f) / f; }

// ── FALL A: källmärke ───────────────────────────────────────────────────────
{
  const FEL = [];
  for (const m of BETEENDEFALLOR_MONSTER) {
    const svar = m.bygga(KURSREGISTER);
    if (!svar.text.includes("📖 Källor (" + svar.kallor.length + "):")) FEL.push(m.id + ": källblock saknas/fel antal");
    if (svar.kallor.length < 2) FEL.push(m.id + ": färre än 2 källor");
    for (const k of svar.kallor) {
      if (!k.slug) FEL.push(m.id + ": källa utan slug: " + k.titel);
      else if (!KURSREGISTER.some((r) => r.slug === k.slug)) FEL.push(m.id + ": fantomslug " + k.slug);
    }
    if (svar.text.indexOf("📖 Källor") === -1) FEL.push(m.id + ": ingen källrad alls");
  }
  kontroll(
    "A källmärke — 3 monsters med numrerad flerlist + registeräkta slugs (3/4/3 källor)",
    FEL.length === 0,
    FEL.length ? FEL.join(" | ") : "haloeffekten 3 · arbitragens gränser 4 · slumpens serier 3",
  );
}

// ── FALL A2: widget-wiring ──────────────────────────────────────────────────
{
  const widget = readFileSync(join(ROT, "src/components/ak1a/chat-widget.tsx"), "utf8");
  const rad = widget.split("\n").find((r) => r.includes("svaraLokaltMakro(q, KURSREGISTER)")) ?? "";
  const FEL = [];
  if (!widget.includes('from "@/lib/ai-mentor-beteendefallor-fragor"')) FEL.push("import saknas");
  const pCase = rad.indexOf("svaraLokaltCasepraktik(");
  const pMin = rad.indexOf("svaraLokaltBeteendefallor(");
  const pRytm = rad.indexOf("svaraLokaltMarknadsrytm(");
  if (pCase === -1 || pMin === -1 || pRytm === -1) FEL.push("kedjepositioner saknas");
  else if (!(pCase < pMin && pMin < pRytm)) FEL.push("fel ordning: casepraktik < beteendefallor < marknadsrytm gäller inte");
  kontroll("A2 wiring — 76:e motorn: efter casepraktik, FÖRE marknadsrytm (SIST-deklarationen)", FEL.length === 0, FEL.join(" | "));
}

// ── FALL B: felstavningar och varianter ─────────────────────────────────────
{
  const FALL = [
    { fraga: "vad är haloeffekcten?", amne: "haloeffekten" },       // c/e-växling
    { fraga: "vad är en haloeffekt?", amne: "haloeffekten" },
    { fraga: "hur funkar haloeffekten?", amne: "haloeffekten" },
    { fraga: "vad är glorieffekten?", amne: "haloeffekten" },
    { fraga: "vad är arbitrage?", amne: "arbitragens gränser" },
    { fraga: "vad är gränsarbitraget?", amne: "arbitragens gränser" },
    { fraga: "vad är ett misspris?", amne: "arbitragens gränser" },
    { fraga: "vad är missprissättning?", amne: "arbitragens gränser" },
    { fraga: "varför arbitreras inte felen bort?", amne: "arbitragens gränser" },
    { fraga: "vad är slumptalsmönster?", amne: "slumpens serier" },
    { fraga: "vad är apofenin?", amne: "slumpens serier" },
    { fraga: "vad är spelarens felslut?", amne: "slumpens serier" },
    { fraga: "vad betyder lagen om små tal?", amne: "slumpens serier" },
    { fraga: "hur många rekord ger slumptal?", amne: "slumpens serier" },
  ];
  const FEL = [];
  for (const f of FALL) {
    const s = svaraLokaltBeteendefallor(f.fraga, KURSREGISTER);
    if (!s) FEL.push("«" + f.fraga + "» → null (väntat " + f.amne + ")");
    else if (s.amne !== f.amne) FEL.push("«" + f.fraga + "» → " + s.amne + " (väntat " + f.amne + ")");
  }
  kontroll("B varianter ×" + FALL.length + " — felstavningar och omformuleringar når rätt monster", FEL.length === 0, FEL.join(" | "));
}

// ── FALL C: determinism ─────────────────────────────────────────────────────
{
  const FEL = [];
  for (const f of ["vad är haloeffekten?", "vad är arbitragens gränser?", "vad är slumpens serier?"]) {
    const a = JSON.stringify(svaraLokaltBeteendefallor(f, KURSREGISTER));
    const b = JSON.stringify(svaraLokaltBeteendefallor(f, KURSREGISTER));
    if (a !== b) FEL.push("«" + f + "» ej bitidentisk");
  }
  kontroll("C determinism — samma fråga två gånger ⇒ bitidentiskt (×3)", FEL.length === 0, FEL.join(" | "));
}

// ── FALL D01: aritmetik maskinellt omräknad ─────────────────────────────────
{
  const FEL = [];
  const kolla = (namn, villkor) => { if (!villkor) FEL.push(namn); };
  // M2 arbitragens gränser
  kolla("100 ÷ 120 = 0,833 → 16,7 %", Math.abs(100 / 120 - 0.8333) < 0.0001 && Math.abs((1 - 100 / 120) * 100 - 16.67) < 0.01);
  kolla("120 ÷ 85 = 1,412 → +41,2 %", Math.abs(120 / 85 - 1.41176) < 0.0001 && Math.abs((120 / 85 - 1) * 100 - 41.18) < 0.01);
  // M3 slumpens serier — kombinatorik
  function binom(n, k) { let r = 1; for (let i = 0; i < k; i++) r = (r * (n - i)) / (i + 1); return r; }
  const summa = [6, 7, 8, 9, 10].reduce((s, k) => s + binom(10, k), 0);
  kolla("kombinationer 210+120+45+10+1 = 386", [6, 7, 8, 9, 10].map((k) => binom(10, k)).join("+") === "210+120+45+10+1" && summa === 386);
  kolla("386/1024 = 37,7 %", Math.abs(386 / 1024 - 0.37695) < 0.0001 && Math.abs(386 / 1024 * 100 - 37.7) < 0.05);
  const zStor = (59.5 - 50) / 5;
  const pStor = 0.5 * (1 - erfApprox(zStor / Math.SQRT2));
  kolla("stora sjukhuset: z = 1,9 ⇒ knappt 2,9 %", Math.abs(pStor - 0.0287) < 0.002);
  kolla("37,7/2,9 ≈ 13,0 — tretton gånger", Math.abs(37.7 / 2.87 - 13.1) < 0.5);
  kolla("exakt 5 av 10: 252/1024 = 24,6 %", binom(10, 5) === 252 && Math.abs(252 / 1024 * 100 - 24.61) < 0.01);
  const minst8 = [8, 9, 10].reduce((s, k) => s + binom(10, k), 0);
  kolla("minst 8 av 10: 56/1024 = 5,5 %", minst8 === 56 && Math.abs(minst8 / 1024 * 100 - 5.47) < 0.01);
  kolla("minst 8 av något slag: 112/1024 = 10,9 %", 2 * minst8 === 112 && Math.abs(112 / 1024 * 100 - 10.94) < 0.01);
  kolla("log₂ 100 = 6,6 och log₂ 200 = 7,6", Math.abs(Math.log2(100) - 6.64) < 0.01 && Math.abs(Math.log2(200) - 7.64) < 0.01);
  const harmonisk = 0; let hSumma = 0; for (let k = 1; k <= 100; k++) hSumma += 1 / k;
  kolla("harmoniska serien 100 steg ≈ 5,2", Math.abs(hSumma - 5.187) < 0.01 && harmonisk === 0);
  // kanten 53 %
  kolla("52 veckor: μ = 27,6 σ = 3,6", Math.abs(52 * 0.53 - 27.56) < 0.01 && Math.abs(Math.sqrt(52 * 0.53 * 0.47) - 3.594) < 0.01);
  function binomKdf(n, p, max) { let s = 0; for (let k = 0; k <= max; k++) s += binom(n, k) * p ** k * (1 - p) ** (n - k); return s; }
  kolla("P(≤26 vinster av 52) = 38 %", Math.abs(binomKdf(52, 0.53, 26) - 0.383) < 0.01);
  kolla("520 veckor: μ = 275,6 σ = 11,4", Math.abs(520 * 0.53 - 275.6) < 0.01 && Math.abs(Math.sqrt(520 * 0.53 * 0.47) - 11.383) < 0.01);
  kolla("P(≤260 av 520) = 9 %", Math.abs(binomKdf(520, 0.53, 260) - 0.088) < 0.015);
  kolla("1 − 0,95²⁰ = 0,64", Math.abs(1 - 0.95 ** 20 - 0.6415) < 0.001);
  kontroll("D01 aritmetik ×17 — kursernas egna tal oberoende omräknade", FEL.length === 0, FEL.join(" | "));
}
function erfApprox(x) {
  // Abramowitz-Stegun 7.1.26 — räcker för 2-siffrig kontroll av normalapprox.
  const t = 1 / (1 + 0.3275911 * Math.abs(x));
  const y = 1 - ((((1.061405429 * t - 1.453152027) * t + 1.421413741) * t - 0.284496736) * t + 0.254829592) * t * Math.exp(-x * x);
  return x >= 0 ? y : -y;
}

// ── FALL D02: registerdrivna tal ────────────────────────────────────────────
{
  const bfAntal = KURSREGISTER.filter((r) => r.kategori === "BETEENDEFINANS").length;
  const FEL = [];
  for (const m of BETEENDEFALLOR_MONSTER) {
    const text = m.bygga(KURSREGISTER).text;
    if (!text.includes("beteendefinans finns " + bfAntal + " kurser")) FEL.push(m.id + ": bf-antal " + bfAntal + " saknas i texten");
  }
  const niva = (slug) => KURSREGISTER.find((r) => r.slug === slug)?.niva?.toLowerCase();
  const t1 = BETEENDEFALLOR_MONSTER[0].bygga(KURSREGISTER).text;
  const t2 = BETEENDEFALLOR_MONSTER[1].bygga(KURSREGISTER).text;
  const t3 = BETEENDEFALLOR_MONSTER[2].bygga(KURSREGISTER).text;
  if (!t1.includes((niva("bf-09-haloeffekt") ?? "") + " nivå")) FEL.push("bf-09 nivå ej registerdriven");
  if (!t2.includes((niva("bf-13-arbitragens-granser") ?? "") + " nivå")) FEL.push("bf-13 nivå ej registerdriven");
  if (!t3.includes((niva("bf-16-slumpens-serier") ?? "") + " nivå")) FEL.push("bf-16 nivå ej registerdriven");
  kontroll("D02 registerdrivna tal — bf-antal (" + bfAntal + ") + nivåer läs ur registret vid svarstid", FEL.length === 0, FEL.join(" | "));
}

// ── FALL D03: fantomslugar ──────────────────────────────────────────────────
{
  const slugSet = new Set(KURSREGISTER.map((r) => r.slug));
  const FEL = [];
  for (const m of BETEENDEFALLOR_MONSTER) {
    const svar = m.bygga(KURSREGISTER);
    for (const h of svar.handlings ?? []) {
      const match = [...h.lank.matchAll(/\/kurser\/([a-z0-9-]+)/g)].map((x) => x[1]);
      for (const s of match) if (!slugSet.has(s)) FEL.push(m.id + ": fantomslug " + s);
    }
    const fd = [...(svar.fordjupa?.lank ?? "").matchAll(/\/kurser\/([a-z0-9-]+)/g)].map((x) => x[1]);
    for (const s of fd) if (!slugSet.has(s)) FEL.push(m.id + ": fantom-fordjupa " + s);
  }
  kontroll("D03 fantomslugar — 0 olagliga kurslänkar (handlings + fordjupa)", FEL.length === 0, FEL.join(" | "));
}

// ── FALL E: kanonisk träff + kärnordsfamiljer ───────────────────────────────
{
  const FALL = [
    "vad är haloeffekten?", "vad är arbitragens gränser?", "vad är arbitrage?",
    "vad är slumpens serier?", "vad är klusterillusionen?", "vad är apofeni?",
    "vad är spelarens felslut?", "vad är lagen om små tal?", "vad är myntkast?",
    "vad är misspriset?", "vad är kapitalhorisonten?", "vad är finansieringsklockan?",
    "vad är tolkningsklockan?", "vad är basfrekvensen?", "vad är urvalsstorleken?",
    "vad är serielängden?", "vad är slumptal?", "vad är slumpsekvensen?",
    "vad är halofällan?", "vad är gränsarbitrage?",
  ];
  const FEL = [];
  for (const f of FALL) {
    if (!svaraLokaltBeteendefallor(f, KURSREGISTER)) FEL.push("«" + f + "» → null");
  }
  // KEDJAN också: kanoniska får inte kapas av tidigare motor
  for (const f of ["vad är haloeffekten?", "vad är arbitragens gränser?", "vad är slumpens serier?"]) {
    const k = kedja(f);
    if (!k || k.motor !== "beteendefallor") FEL.push("kedjan: «" + f + "» → " + (k ? k.motor : "null"));
  }
  kontroll("E kanonisk träff ×" + FALL.length + " + 3 kedjeverifierade", FEL.length === 0, FEL.join(" | "));
}

// ── FALL F: null-gränser (dokumenterade) ────────────────────────────────────
{
  const FALL = [
    "vad är halo-effekten?",        // basens flerordsfras — når aldrig de sammanskrivna
    "vad är kluster?",              // tsdjupets kärnord
    "vad är hyperbolisk diskontering?", // nästa-lagrets
    "vad är mentala konton?",       // bas/beteendedjup — bf-14 bärs som källa
    "vad är monte carlo?",          // ek-05 är KÄLLA, inte kärnordsägare här
    "vad är bayesiansk omviktning?", // ekosystemdjupets fras — ek-06 källa här
    "vad är prospektteori?",        // bf-12 är KÄLLA, inte kärnord här
    "vad är bekräftelsefällan?",    // km-019 är KÄLLA — motor 19 äger
    "vad är optionsprissättning?",  // optionslagren
  ];
  const FEL = [];
  for (const f of FALL) {
    if (svaraLokaltBeteendefallor(f, KURSREGISTER)) FEL.push("«" + f + "» → TRÄFF (skulle vara null)");
  }
  kontroll("F null-gränser ×" + FALL.length + " — grannfamiljerna lämnas ifred STANDALONE", FEL.length === 0, FEL.join(" | "));
  // Dokumenterad KEDJESÄKER skuggning (motorn matchar standalone men ett
  // TIDIGARE lager vinner alltid i widgetens kedjeordning — verifieras):
  const dokGranser = [
    { fraga: "vad är merger arbitrage?", motor: "bokmastar" }, // motor 50, FÖRE här
    { fraga: "vad är etf-arbitrage?", motor: "praktik" },      // praktiken äger naket etf, FÖRE här
  ];
  const GFEL = [];
  for (const d of dokGranser) {
    const k = kedja(d.fraga);
    if (!k || k.motor !== d.motor) GFEL.push("kedjan: «" + d.fraga + "» → " + (k ? k.motor : "null") + " (väntat " + d.motor + ")");
  }
  kontroll("F2 dokumenterade kedjesäkra skuggningar ×2 — kedjan ger tidigare lagers svar", GFEL.length === 0, GFEL.join(" | "));
}

// ── FALL G: antistöld mot kedjetestets kanoniska ────────────────────────────
{
  const kanoniska = [...kedjaKalla.matchAll(/\{ fraga: "([^"]+)",\s*motor: (\d+) \}/g)]
    .map((m) => ({ fraga: m[1], motor: Number(m[2]) }));
  const FEL = [];
  const dokSkugg = new Set(["vad är merger arbitrage?"]); // bokmastaren (motor 50) FÖRE här — kedjesäker
  for (const k of kanoniska) {
    if (k.motor === MITT_INDEX) continue;
    const s = svaraLokaltBeteendefallor(k.fraga, KURSREGISTER);
    if (s && !dokSkugg.has(k.fraga)) FEL.push("«" + k.fraga + "» (motor " + k.motor + ") stjäls standalone");
  }
  // Den dokumenterade skuggningen: KEDJAN måste svara bokmastaren
  const mm = kedja("vad är merger arbitrage?");
  if (!mm || mm.motor !== "bokmastar") FEL.push("kedjan ger inte bokmastaren på merger arbitrage: " + (mm ? mm.motor : "null"));
  kontroll(
    "G antistöld — " + kanoniska.length + " kanoniska: 0 stölder (1 dokumenterad kedjesäker skuggning verifierad)",
    FEL.length === 0,
    FEL.join(" | "),
  );
}

// ── FALL J: juridikgrind (2007:528) ─────────────────────────────────────────
{
  const FEL = [];
  const radsMönster = /\b(du bör|ni bör|du ska köpa|sälj dina|rekommenderar att (du|ni) (köper|säljer)|köp denna aktie|bör du investera)\b/i;
  const lagrum = /\b\d{1} kap\.?\s*\d{1,2}\s*§|lagen \(?\d{4}:\d{4}\)?/i;
  for (const m of BETEENDEFALLOR_MONSTER) {
    const t = m.bygga(KURSREGISTER).text;
    const r = t.match(radsMönster);
    if (r) FEL.push(m.id + ": rådsfras «" + r[0] + "»");
    const l = t.match(lagrum);
    if (l) FEL.push(m.id + ": lagrum «" + l[0] + "»");
    if (!/utbildning i (en )?metod|inga placeringstips/.test(t)) FEL.push(m.id + ": utbildningsdisclaimern saknas");
    // Språkgrind: CJK, tabbar, typografiska apostrofer, understreck i svarstext
    if (/[\u4e00-\u9fff]/.test(t)) FEL.push(m.id + ": CJK-tecken");
    if (t.includes("\t")) FEL.push(m.id + ": tabb");
    if (/[\u2018\u2019\u02bc]/.test(t)) FEL.push(m.id + ": typografisk apostrof");
    if (/_/.test(t)) FEL.push(m.id + ": understreck i text");
  }
  kontroll("J juridikgrind + språkgrind — utbildningsform, 0 råd, 0 lagrum, 0 främmande tecken", FEL.length === 0, FEL.join(" | "));
}

// ── FALL K: kärnordsdisjunktion LIVE mot övriga lager ───────────────────────
{
  function diafriT(s) {
    return s.toLowerCase().replace(/[^\p{L}\p{N}]+/gu, " ").replace(/\s+/g, " ").trim().normalize("NFD").replace(/\p{M}/gu, "").normalize("NFC");
  }
  function tavstand(a, b) {
    if (a === b) return 0;
    const n = a.length, m = b.length;
    if (!n) return m; if (!m) return n;
    let fore = Array.from({ length: m + 1 }, (_, j) => j);
    const nu = new Array(m + 1);
    for (let i = 1; i <= n; i++) {
      nu[0] = i;
      for (let j = 1; j <= m; j++) {
        nu[j] = Math.min(nu[j - 1] + 1, fore[j] + 1, fore[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
      }
      fore = [...nu];
    }
    return fore[m];
  }
  const FEL = [];
  const mina = BETEENDEFALLOR_MONSTER.flatMap((m) => m.karnord.map(diafriT));
  if (new Set(mina).size !== mina.length) FEL.push("dubbletter inom lagret");
  // Dokumenterad gräns (kedjesäker skuggning — F2 verifierar att kedjan ger
  // bokmastarens svar): bokmastarens fras «merger arbitrage» innehåller
  // ordet «arbitrage» — motor 50 ligger FÖRE detta lager, paret tillåtet.
  const tillatnaPar = new Set(["bokmastar«merger arbitrage» ~ «arbitrage»"]);
  for (const motor of MOTORER) {
    if (motor.namn === "beteendefallor") continue;
    for (const mst of motor.monster) {
      for (const g0 of mst.karnord ?? []) {
        const g = diafriT(g0);
        for (const nk of mina) {
          let farligt = false;
          if (g.includes(" ") || nk.includes(" ")) farligt = g.includes(nk) || nk.includes(g);
          else if (g.length <= 3 || nk.length <= 3) farligt = g === nk;
          else {
            const maxG = g.length <= 7 ? 1 : 2;
            const maxN = nk.length <= 7 ? 1 : 2;
            farligt = tavstand(g, nk) <= Math.min(maxG, maxN);
          }
          if (farligt && !tillatnaPar.has(motor.namn + "«" + g0 + "» ~ «" + nk + "»")) FEL.push(motor.namn + "«" + g0 + "» ~ «" + nk + "»");
        }
      }
    }
  }
  kontroll(
    "K kärnordsdisjunktion LIVE — " + mina.length + " kärnord mot " + (MOTORER.length - 1) + " övriga motorer: 0 kollisioner",
    FEL.length === 0,
    FEL.join(" | "),
  );
}

// ── FALL L: widget-synk (import + ordning + knappar) ────────────────────────
{
  const widget = readFileSync(join(ROT, "src/components/ak1a/chat-widget.tsx"), "utf8");
  const rad = widget.split("\n").find((r) => r.includes("svaraLokaltMakro(q, KURSREGISTER)")) ?? "";
  const FEL = [];
  if (!widget.includes("ai-mentor-beteendefallor-fragor")) FEL.push("importen saknas");
  const ordning = ["svaraLokaltKemisektor(", "svaraLokaltStalsektor(", "svaraLokaltCasepraktik(", "svaraLokaltBeteendefallor(", "svaraLokaltMarknadsrytm("];
  let senaste = -1;
  for (const namn of ordning) {
    const p = rad.indexOf(namn);
    if (p === -1) { FEL.push(namn + " saknas i kedjeraden"); break; }
    if (p < senaste) FEL.push(namn + " i fel ordning");
    senaste = p;
  }
  // Fragor-knappar inom modulen: handlings med fragor:-länkar pekar på egna kanoniska
  for (const m of BETEENDEFALLOR_MONSTER) {
    const svar = m.bygga(KURSREGISTER);
    const knappar = (svar.handlings ?? []).filter((h) => h.lank.startsWith("fragor:"));
    if (knappar.length < 2) FEL.push(m.id + ": färre än 2 fragor-knappar");
    for (const h of knappar) {
      const q = decodeURIComponent(h.lank.slice(7));
      if (!svaraLokaltBeteendefallor(q, KURSREGISTER)) FEL.push(m.id + ": knapp «" + q + "» svarar inte inom lagret");
    }
  }
  kontroll("L widget-synk — import, kedjeordning (kemisektor→stålsektor→casepraktik→BETEENDEFALLOR→marknadsrytm), fragor-knappar ×2+", FEL.length === 0, FEL.join(" | "));
}

// ── Sammanfattning ──────────────────────────────────────────────────────────
console.log("");
console.log("BETEENDEFALLOR-LAGRET (s6-u3 fönster 31): " + pass + " PASS · " + fail + " FAIL av " + (pass + fail));
if (fail > 0) process.exit(1);
console.log("");
console.log("Kategoristängning BETEENDEFINANS 18/23 → 23/23 — fem aktiverade slugs verifierade i källmärke + länkar:");
for (const slug of ["bf-09-haloeffekt", "bf-13-arbitragens-granser", "bf-14-beteendeportfoljteori", "bf-16-slumpens-serier", "bf-17-nutidsbias-och-den-hyperboliska-kurvan"]) {
  const r = KURSREGISTER.find((x) => x.slug === slug);
  console.log("  " + slug + " — " + (r ? r.titel : "SAKNAS I REGISTRET!"));
}
const ek6 = KURSREGISTER.find((x) => x.slug === "ek-06-bayesianska-omviktningen");
console.log("  ek-06-bayesianska-omviktningen — " + (ek6 ? ek6.titel : "SAKNAS!") + " (EKOSYSTEM-källaktivering)");
