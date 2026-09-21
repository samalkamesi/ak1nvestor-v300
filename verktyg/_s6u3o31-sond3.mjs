/**
 * SOND 3 (s6-u3, manifest auto-s6-1789965330060): bred sond av ÅTERSTÅENDE
 * kandidatfamiljer efter sond 2 (budpremien → handelsemotor, konglomerat →
 * varderjustering DÖDA): beteendefamiljen (bf-09/13/14/16/17), skatt
 * (sj-06/07), se-22 byggentreprenaden, se-23 stålsektorn, pf-07
 * krishantering, rp-07 väntan i svansen, od-09 försäkringsskrivandet,
 * ks-08 valutasäkringen, bk-08 intäktsredovisningen, roic-05 ekonomiska
 * vinsten, ib-06 evighetskapitalet, ib-07 family officen, ek-06 bayesianska
 * omviktningen, ek-07 walk-forward, enhetsekonomin (tx-06/07).
 */
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const HÄR = dirname(fileURLToPath(import.meta.url));
const ROT = join(HÄR, "..");

const kedjaKalla = readFileSync(join(ROT, "verktyg/testa-ai-mentor-kedja.mjs"), "utf8");
const defs = [...kedjaKalla.matchAll(/\{ namn: "([^"]+)",\s*fil: "([^"]+)",\s*fn: "([^"]+)",\s*arr: "([^"]+)",\s*antal: (\d+) \}/g)]
  .map((m) => ({ namn: m[1], fil: m[2], fn: m[3], arr: m[4], antal: Number(m[5]) }));

const { KURSREGISTER } = await import(pathToFileURL(join(ROT, "src/lib/ai-mentor-register.ts")).href);
const MOTORER = [];
for (const d of defs) {
  const modul = await import(pathToFileURL(join(ROT, "src/lib/" + d.fil)).href);
  MOTORER.push({ ...d, fnk: modul[d.fn], monster: modul[d.arr] });
}
function kedja(fraga) {
  for (const m of MOTORER) {
    const s = m.fnk(fraga, KURSREGISTER);
    if (s) return { svar: s, motor: m.namn };
  }
  return null;
}
console.log("Kedjan LIVE: " + MOTORER.length + " motorer / " + MOTORER.reduce((s, m) => s + m.monster.length, 0) + " monsters");

const FAMILJER = {
  haloeffekten: ["vad är haloeffekten?", "vad är en haloeffekt?", "vad är halo?",
    "hur fungerar haloeffekten?", "vad är härlighetens baksida?"],
  arbitragensGranser: ["vad är arbitragens gränser?", "vad är arbitrage?", "vad är gränsarbitrage?",
    "varför slutar arbitrage att fungera?", "vad är en arbitragör?", "hur fungerar arbitrage?"],
  beteendeportfolj: ["vad är beteendeportföljteorin?", "vad är beteendeportföljen?",
    "vad är mentala konton i portföljen?", "vad är lagerportföljen?"],
  slumpensSerier: ["vad är slumpens serier?", "vad säger slumpen?", "är en serie av åtta slump?",
    "vad är en slumpsekvens?", "ser slumptal ut som mönster?"],
  nutidsbias: ["vad är nutidsbias?", "vad är den hyperboliska kurvan?", "vad är hyperbolisk diskontering?",
    "varför väger nuet tyngst?", "vad är nutidspreferensen?"],
  arvGava: ["hur beskattas arv av aktier?", "vad är ingående värde vid arv?", "vad är ingående värde vid gåva?",
    "hur fungerar arv av aktier?", "är arv av aktier skattefritt?"],
  forlustavdrag: ["vad är förlustavdrag?", "vad är kvotering?", "hur fungerar kvoteringen?",
    "vad är förlustkvoten?", "hur kvoteras förluster?"],
  byggentreprenaden: ["vad är byggentreprenaden?", "vad är byggsektorn?", "vad är entreprenad?",
    "hur läser man ett byggbolag?", "vad är orderstocken?"],
  stalsektorn: ["vad är stålsektorn?", "vad är stålindustrin?", "hur läser man ett stålbolag?",
    "vad är stålcykeln?", "vad är coil?"],
  krishantering: ["vad är krishantering?", "hur hanterar man en krasch?", "vad gör man i en börskrasch?",
    "vad är en krisplan?"],
  vantanSvansen: ["vad är väntan i svansen?", "vad är svansen?", "vad är svansrisken?"],
  forsakringsskrivandet: ["vad är försäkringsskrivandet?", "vad är optionsskrivande med skydd?", "vad är covered call?",
    "hur skriver man optioner?"],
  valutasakringen: ["vad är valutasäkring?", "hur säkrar man valutakursen?", "vad är en valutasäkring?"],
  intaktsredovisningen: ["vad är intäktsredovisning?", "vad är intäktredovisningen?", "hur redovisas intäkter?",
    "vad är IFRS 15?"],
  ekonomiskaVinsten: ["vad är den ekonomiska vinsten?", "vad är EVA?", "vad är ekonomisk vinst?",
    "vad är kapitalkostnaden i vinsten?"],
  evighetskapitalet: ["vad är evighetskapitalet?", "vad är evig kapital?"],
  familyOffice: ["vad är en family office?", "vad är familjekontoret?"],
  bayesianskOmviktning: ["vad är bayesiansk omviktning?", "vad är bayes?", "hur omviktas bayesianskt?"],
  walkForward: ["vad är walk-forward?", "vad är walk forward-analys?", "vad är gångtestet av modellen?"],
  enhetsekonomin: ["vad är enhetsekonomin?", "vad är enhetsekonomi?", "vad är kundanskaffningskostnaden?",
    "vad är kundens livstidsvärde?", "vad är ltv per cac?", "vad är enhetsmarginalen?"],
};

let totalFel = 0;
for (const [familj, fragor] of Object.entries(FAMILJER)) {
  const result = fragor.map((f) => {
    const k = kedja(f);
    return k ? `FEL→${k.motor}` : "null";
  });
  const fel = result.filter((r) => r !== "null").length;
  totalFel += fel;
  const mark = fel === 0 ? "RENT " : fel === fragor.length ? "DÖD  " : "BLAND";
  console.log(`\n[${mark}] ${familj} (${fel}/${fragor.length} fångade)`);
  fragor.forEach((f, i) => console.log(`   ${result[i] === "null" ? "null" : result[i]}: «${f}»`));
}
console.log(`\nTOTALT FEL: ${totalFel}`);
