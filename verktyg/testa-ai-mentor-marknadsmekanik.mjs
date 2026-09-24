/**
 * TESTA AI-MENTORN — VÅG 189: MARKNADSMEKANIK (tio förhandsfrågor).
 *
 * Kör:  node verktyg/testa-ai-mentor-marknadsmekanik.mjs
 * Krav: Node >= 22.18 (type stripping default — samma som testa-ai-mentor.mjs).
 *
 * Regressionstest för våg 189:s tio förhandsfrågor om aktiemarknadens
 * mekaniker (se src/lib/ai-mentor-marknadsmekanik-fragor.ts) med bevakning:
 *   A  10 nya kanoniska → rätt ämne, primärkälla, FLERKÄLLA (kallor ≥ 2 +
 *      numrerad Källor-rad i texten) och ≥ 3 kurslänkar per svar
 *   B  20 felstavade/varierade varianter → samma träff som den kanoniska
 *   C  determinism — alla frågor två gånger ⇒ bitidentiskt svar
 *   D  källaäkthet — varje källa/kurslänk FINNS i registret (fantomslugar
 *      är testfel) + registerdriven räknekontroll (kategori-antalet i text)
 *   E  3 omatchade frågor → null (kedjan får dem, inte dessa mönster)
 *   F  juridikgrind-lint — inga rådfraser i de nya svaren
 *   G  ANTISTÖLD — tidigare/senare lagers kanoniska frågor (basens 15 +
 *      makro + praktik + handelsdag + tsdjup + kreditdjup + overlevnadsdjup
 *      + portfoljbalans) ger NULL i detta lager
 *   H  kedjan (marknadsmekanik ?? praktik ?? bas — våg 189:s insättnings-
 *      ordning i chat-widget): alla når RÄTT lager, inklusive gränsfallet
 *      indexfond (praktik) vs värdeviktat (marknadsmekanik)
 *   K  KÄRNORDSDISJUNKTION LIVE — kärnorden läsa ur samtliga
 *      src/lib/ai-mentor-*-fragor.ts (utom detta lagret): inget av detta
 *      lagers kärnord finns hos något annat lager — den mekaniska garantin
 *      bakom kedjeplaceringen
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
      "Kör med: node --experimental-strip-types verktyg/testa-ai-mentor-marknadsmekanik.mjs",
  );
  process.exit(1);
}

// Den RIKTIGA koden ur src/ (ingen duplikation i testet).
const { KURSREGISTER } = await import(pathToFileURL(join(ROT, "src/lib/ai-mentor-register.ts")).href);
const { svaraLokalt } = await import(pathToFileURL(join(ROT, "src/lib/ai-mentor-svar.ts")).href);
const { svaraLokaltMarknadsmekanik } = await import(pathToFileURL(join(ROT, "src/lib/ai-mentor-marknadsmekanik-fragor.ts")).href);

// Gränsyskon (kedje-testerna) — hoppas versätligt över OM import misslyckas
// (syskonet kan skrivas just nu).
let svaraLokaltPraktik = null;
try {
  ({ svaraLokaltPraktik } = await import(pathToFileURL(join(ROT, "src/lib/ai-mentor-praktik-fragor.ts")).href));
} catch {
  console.log("NOT  fall H: ai-mentor-praktik-fragor.ts ej importbar just nu — kedjetest körs utan praktik");
}

// ── Testharness (samma stil som testa-ai-mentor-makro.mjs) ─────────────────
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

// ── FALL A: de tio nya kanoniska (våg 189) med flerkällskrav ───────────────
const NYA = [
  { fraga: "Vad är en orderbok och hur läses den?", amne: "orderbok", slug: "km-069-orderbok-och-prissattning" },
  { fraga: "Hur matchas ordrar på börsen?", amne: "matchning", slug: "km-069-orderbok-och-prissattning" },
  { fraga: "Vad är skillnaden mellan marknadsord och limitord?", amne: "ordertyper", slug: "am-04-marknadsstruktur" },
  { fraga: "Vad är spread?", amne: "spread", slug: "am-01-likviditet-och-spread" },
  { fraga: "Vad betyder likviditet på börsen?", amne: "likviditet", slug: "am-01-likviditet-och-spread" },
  { fraga: "Vad säger handelsvolymen för en aktie?", amne: "handelsvolym", slug: "am-01-likviditet-och-spread" },
  { fraga: "Hur byggs ett värdeviktat index?", amne: "värdeviktning", slug: "am-02-index-och-passivt-agande" },
  { fraga: "Vad är likviktat?", amne: "likviktat", slug: "am-02-index-och-passivt-agande" },
  { fraga: "Hur är OMXS30 uppbyggt?", amne: "omxs30", slug: "am-02-index-och-passivt-agande" },
  { fraga: "Vad är courtage?", amne: "courtage", slug: "am-01-likviditet-och-spread" },
];

NYA.forEach((f, i) => {
  const nr = "A" + String(i + 1).padStart(2, "0");
  const svar = svaraLokaltMarknadsmekanik(f.fraga, KURSREGISTER);
  if (!svar) {
    kontroll(nr + " " + f.amne, false, "inget lokalt svar på: '" + f.fraga + "'");
    return;
  }
  const amneOk = svar.amne === f.amne;
  const kallaOk = svar.kalla.slug === f.slug;
  const kallorFinns = Array.isArray(svar.kallor) && svar.kallor.length >= 2;
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

// ── FALL B: felstavade varianter → samma träff ──────────────────────────────
const FELSTAVADE = [
  { fraga: "vad ar en orderbok?", amne: "orderbok" },
  { fraga: "hur las orderboken?", amne: "orderbok" },
  { fraga: "vad är orderdjup?", amne: "orderbok" },
  { fraga: "hur matchas ordrar?", amne: "matchning" },
  { fraga: "vad är prisbildning?", amne: "matchning" },
  { fraga: "marknadsorder eller limitorder?", amne: "ordertyper" },
  { fraga: "hur fungerar stop loss?", amne: "ordertyper" },
  { fraga: "vad ar spread?", amne: "spread" },
  { fraga: "vad är bid ask?", amne: "spread" },
  { fraga: "likviditet pa borsen?", amne: "likviditet" },
  { fraga: "vad är illikvida aktier?", amne: "likviditet" },
  { fraga: "vad ar volym?", amne: "handelsvolym" },
  { fraga: "vad är handelsvolymen?", amne: "handelsvolym" },
  { fraga: "hur fungerar vardeviktning?", amne: "värdeviktning" },
  { fraga: "vad är kapitalviktat?", amne: "värdeviktning" },
  { fraga: "likviktat eller vardeviktat?", amne: "värdeviktning|likviktat" }, // tvetydig — deterministisk vinnare, båda accepteras
  { fraga: "vad är omx stockholm 30?", amne: "omxs30" },
  { fraga: "vad ar courtage?", amne: "courtage" },
  { fraga: "vad är mäklaravgift?", amne: "courtage" },
  { fraga: "hur sätts priset på börsen?", amne: "matchning" },
];

FELSTAVADE.forEach((f, i) => {
  const nr = "B" + String(i + 1).padStart(2, "0");
  const svar = svaraLokaltMarknadsmekanik(f.fraga, KURSREGISTER);
  const ok = svar !== null && (svar.amne === f.amne || f.amne.split("|").includes(svar.amne));
  kontroll(nr + " " + f.amne + " — '" + f.fraga + "'", ok, svar ? "ämne=" + svar.amne : "inget svar");
});

// ── FALL C: determinism — alla frågor × 2 körningar bitidentiska ────────────
{
  const alla = [...NYA.map((f) => f.fraga), ...FELSTAVADE.map((f) => f.fraga)];
  const forsta = alla.map((f) => JSON.stringify(svaraLokaltMarknadsmekanik(f, KURSREGISTER)));
  const andra = alla.map((f) => JSON.stringify(svaraLokaltMarknadsmekanik(f, KURSREGISTER)));
  const identiska = forsta.every((s, i) => s === andra[i]);
  kontroll("C01 determinism — " + alla.length + " frågor × 2 körningar bitidentiska", identiska,
    identiska ? "" : "avvikelse upptäckt");
}

// ── FALL D: källaäkthet — källor och kurslänkar FINNS i registret ──────────
{
  const slugFinns = new Set(KURSREGISTER.map((r) => r.slug));
  const FEL = [];
  for (const f of NYA) {
    const svar = svaraLokaltMarknadsmekanik(f.fraga, KURSREGISTER);
    if (!svar) continue;
    for (const k of svar.kallor ?? []) {
      if (k.slug && !slugFinns.has(k.slug)) FEL.push("källa '" + k.slug + "' (" + f.amne + ") finns ej i registret");
    }
    if ((svar.kallor ?? []).length > 0 && svar.kallor[0].slug !== svar.kalla.slug) {
      FEL.push("kallor[0] (" + svar.kallor[0].slug + ") != kalla (" + svar.kalla.slug + ") i " + f.amne);
    }
    for (const h of svar.handlings) {
      if (h.lank.startsWith("/kurser/")) {
        const s = h.lank.slice("/kurser/".length);
        if (!slugFinns.has(s)) FEL.push("kurslänk '" + s + "' (" + f.amne + ") finns ej i registret");
      } else if (!h.lank.startsWith("fragor:")) {
        FEL.push("oväntad länk '" + h.lank + "' i " + f.amne);
      }
    }
  }
  kontroll("D01 källaäkthet — inga fantomslugar i källor/länkar", FEL.length === 0,
    FEL.length ? FEL.join(" | ") : KURSREGISTER.length + " kurser genomsökta");

  // Registerdriven räknekontroll: kategorins antal i texterna ska komma ur
  // registret (klippskydd vid registerändring).
  const amAntal = KURSREGISTER.filter((r) => r.kategori === "AKTIEMARKNADEN I PRAKTIKEN").length;
  const oSvar = svaraLokaltMarknadsmekanik(NYA[0].fraga, KURSREGISTER);
  const lSvar = svaraLokaltMarknadsmekanik(NYA[4].fraga, KURSREGISTER);
  kontroll(
    "D02 registerdrivet tal — AKTIEMARKNADEN I PRAKTIKEN = " + amAntal + " i båda svaren",
    oSvar && oSvar.text.includes(amAntal + " kurser") &&
      lSvar && lSvar.text.includes("(" + amAntal + " kurser)"),
    "texten ska bära registrets egna tal",
  );
}

// ── FALL E: omatchade frågor → null (kedjan) ────────────────────────────────
const OMATCHADE = [
  "Vad blir vädret i Ystad imorgon?",
  "Vem målade Skriet?",
  "Hur många strängar har en kontrabas?",
];
OMATCHADE.forEach((fraga, i) => {
  const nr = "E" + String(i + 1).padStart(2, "0");
  const svar = svaraLokaltMarknadsmekanik(fraga, KURSREGISTER);
  kontroll(nr + " omatchad — '" + fraga + "'", svar === null,
    svar ? "fick lokalt svar (ämne=" + svar.amne + ") — skulle gått vidare i kedjan" : "null ✓");
});

// ── FALL F: juridikgrind-lint — inga rådfraser i de nya svaren ──────────────
{
  const RADCITAT = /\b(köp|sälj|köp denna|sälj denna|rekommenderar att du köper|borde du köpa|bör du sälja|tipsa dig om)\b/i;
  const FEL = [];
  for (const f of NYA) {
    const svar = svaraLokaltMarknadsmekanik(f.fraga, KURSREGISTER);
    if (!svar) continue;
    if (RADCITAT.test(svar.text)) FEL.push(f.amne + ": rådfras i text");
    for (const h of svar.handlings) if (RADCITAT.test(h.text)) FEL.push(f.amne + ": rådfras i handling '" + h.text + "'");
  }
  kontroll("F01 juridikgrind — inga rådfraser i marknadsmekanik-svaren", FEL.length === 0,
    FEL.length ? FEL.join(" | ") : "ren utbildningsformulering");
}

// ── FALL G: ANTISTÖLD — andra lagers kanoniska ger null här ─────────────────
{
  const GAMLA = [
    // Basens femton kanoniska (samma lista som testa-ai-mentor-makro.mjs)
    { fraga: "Vad är AKM1?", amne: "akm1" },
    { fraga: "Hur börjar jag lära mig aktieanalys?", amne: "borja" },
    { fraga: "Vad är en impulsvåg?", amne: "impulsvåg" },
    { fraga: "Vad kostar det?", amne: "kostnad" },
    { fraga: "Ger ni investeringsråd?", amne: "råd" },
    { fraga: "Vad är V09?", amne: "variabel-V09" },
    { fraga: "Vad är teknisk analys?", amne: "teknisk analys" },
    { fraga: "Hur hanterar jag risk?", amne: "risk" },
    { fraga: "Hur bygger jag en portfölj?", amne: "portfölj" },
    { fraga: "Vilka böcker ska jag läsa?", amne: "böcker" },
    { fraga: "Hur fungerar quiz och XP?", amne: "quiz-xp" },
    { fraga: "Vad är Fas 1, 2 och 3?", amne: "faser" },
    { fraga: "Vad är konfluens?", amne: "konfluens" },
    { fraga: "Vad är vågfundamentet?", amne: "vågfundament" },
    { fraga: "Vad är AK1TS?", amne: "ak1ts" },
    // Makro-lagrets två
    { fraga: "Vad är ränta och hur påverkar den aktier?", amne: "ränta" },
    { fraga: "Vad är inflation och KPI?", amne: "inflation" },
    // Praktik-lagrets tre — SÄRSKILT indexfond (grannen i kedjan)
    { fraga: "Vad är en indexfond och hur fungerar den?", amne: "index" },
    { fraga: "Hur fungerar blankning och short?", amne: "blankning" },
    { fraga: "Vad är bruttomarginal?", amne: "marginal" },
    // Handelsdag-lagret (auktioner/marknadsstruktur/handelsplatser)
    { fraga: "Hur fungerar öppningsauktionen?", amne: "handelsdagen" },
    { fraga: "Vad är marknadsstruktur?", amne: "handelsdagen" },
    // Tsdjup-lagret (AK1TS:s volym-/order-ämnen)
    { fraga: "Vad är volymanalys?", amne: null },
    { fraga: "Vad är orderflöde?", amne: null },
    { fraga: "Vad är marknadsdjup?", amne: null },
    // Kreditdjup / overlevnadsdjup / portfoljbalans (nära ordgrannar)
    { fraga: "Vad är kreditspread?", amne: null },
    { fraga: "Vad är en likviditetsreserv?", amne: null },
    { fraga: "Vad är rebalansering?", amne: null },
  ];
  const STJALDA = GAMLA.filter((f) => svaraLokaltMarknadsmekanik(f.fraga, KURSREGISTER) !== null);
  kontroll("G01 antistöld — 28 grannfrågor ger null i marknadsmekanik-lagret", STJALDA.length === 0,
    STJALDA.length ? STJALDA.map((f) => "'" + f.fraga + "' ⇒ " + svaraLokaltMarknadsmekanik(f.fraga, KURSREGISTER).amne).join(" | ") : "0 stölder ✓");

  // FALL H: kedjan i våg 189:s insättningsordning (marknadsmekanik FÖRE
  // praktik, basen under). Mini-kedjan bevisar det denna våg äger: (a) de
  // tio nya når marknadsmekanik (praktik/bas stjäl dem inte), (b) praktiks
  // kanoniska — särskilt indexfond — når praktik (inte oss), (c) basens
  // femton blir besvarade nånstans i kedjan (livskraft). Full kedja bevisas
  // av testa-ai-mentor-kedja.mjs på servern (våg 176:s svit).
  if (svaraLokaltPraktik) {
    const kedja = (fraga) =>
      svaraLokaltMarknadsmekanik(fraga, KURSREGISTER) ??
      (svaraLokaltPraktik ? svaraLokaltPraktik(fraga, KURSREGISTER) : null) ??
      svaraLokalt(fraga, KURSREGISTER);
    const fel = [];
    // (a) de tio nya → marknadsmekanik
    for (const f of NYA) {
      const svar = kedja(f.fraga);
      if (!svar || svar.amne !== f.amne) fel.push("'" + f.fraga + "' ⇒ " + (svar ? svar.amne : "null") + " (väntat " + f.amne + ")");
    }
    // (b) praktiks gränsfrågor → praktik (inte marknadsmekanik)
    for (const f of [{ fraga: "Vad är en indexfond och hur fungerar den?", amne: "index" },
      { fraga: "Hur fungerar blankning och short?", amne: "blankning" }]) {
      const svar = kedja(f.fraga);
      if (!svar || svar.amne !== f.amne) fel.push("'" + f.fraga + "' ⇒ " + (svar ? svar.amne : "null") + " (väntat " + f.amne + ")");
    }
    // (c) basens femton → icke-null (livskraft i mini-kedjan)
    const basens = GAMLA.filter((g) => ["akm1", "borja", "impulsvåg", "kostnad", "råd", "variabel-V09", "teknisk analys", "risk", "portfölj", "böcker", "quiz-xp", "faser", "konfluens", "vågfundament", "ak1ts"].includes(g.amne));
    for (const f of basens) {
      const svar = kedja(f.fraga);
      if (!svar) fel.push("'" + f.fraga + "' ⇒ null (basen borde svara)");
    }
    kontroll("H01 kedja — 10 nya till mekanik · 2 praktikfrågor till praktik · 15 basfrågor levande", fel.length === 0,
      fel.length ? fel.join(" | ") : "27/27 rätt");
  } else {
    console.log("NOT  H01 hoppas över (praktik-lager saknas)");
  }
}

// ── FALL K: kärnordsdisjunktion LIVE mot samtliga syskonlager ───────────────
{
  const MINA = ["orderbok", "orderboken", "orderdjup", "köpsida", "säljsida", "köpsidor", "säljsidor",
    "matchning", "matchas", "matchning av ordrar", "prisbildning", "prissättning", "pris-tid-prioritet", "tidsprioritet",
    "sätts priset", "priset sätts", "prisbildningen", "priset bestäms",
    "marknadsord", "marknadsorder", "limitord", "limitorder", "stopp", "stop-loss", "stop loss", "stoppmarknadsord", "stopp-limit",
    "spread", "spreaden", "bid-ask", "bid ask", "köp-sälj-skillnad", "skillnaden mellan köp och sälj",
    "likviditet", "likviditeten", "likvid marknad", "illikvid", "illikvida", "illikviditet",
    "handelsvolym", "handelsvolymen", "volym", "volymen", "omsatt volym", "byter ägare",
    "värdeviktat", "värdeviktade", "värdeviktning", "kapitalviktat", "kapitalviktade", "kapitalviktning", "marknadsviktat", "börsvärdesviktat",
    "likviktat", "likviktade", "likviktning", "lika vikt",
    "omxs30", "omx30", "omx stockholm 30", "omx",
    "courtage", "courtagen", "courtageavgift", "courtageavgifter", "mäklaravgift", "mäklararvode"];
  const minSet = new Set(MINA);
  const dubbla = MINA.filter((w, i) => MINA.indexOf(w) !== i);
  const FEL = dubbla.map((w) => "eget dubbelord '" + w + "'");
  const libDir = join(ROT, "src/lib");
  for (const fil of readdirSync(libDir)) {
    if (!/^ai-mentor-.*-fragor\.ts$/.test(fil)) continue;
    if (fil === "ai-mentor-marknadsmekanik-fragor.ts") continue;
    const t = readFileSync(join(libDir, fil), "utf8");
    for (const m of t.matchAll(/karnord:\s*\[([\s\S]*?)\]/g)) {
      for (const w of [...m[1].matchAll(/"([^"]+)"/g)]) {
        if (minSet.has(w[1].toLowerCase())) FEL.push("'" + w[1] + "' ägs också av " + fil);
      }
    }
  }
  kontroll("K01 kärnordsdisjunktion — " + MINA.length + " kärnord unika mot alla syskonlager (LIVE-läsning)",
    FEL.length === 0, FEL.length ? FEL.slice(0, 8).join(" | ") : "disjunkta ✓");
}

// ── Summering ───────────────────────────────────────────────────────────────
console.log("");
console.log("────────────────────────────────────────");
console.log("AI-MENTORN våg 189 (marknadsmekanik): " + pass + " PASS · " + fail + " FAIL av " + (pass + fail));
console.log("Nya förhandsfrågor: 10 · Register: " + KURSREGISTER.length + " kurser");
console.log("────────────────────────────────────────");
process.exitCode = fail === 0 ? 0 : 1;
