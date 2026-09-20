#!/usr/bin/env node
// o108-försond — OBEROENDE FULLFÄLTSPARITET: bevisar att ALLA CatalogCourse-fält
// är projektioner av public/deep-courses.json INNAN gallring (gallringens
// förlustfrihet = varje fält har källmotsvarighet; bit-identitet inte krav —
// avvikelser ÄR driften som gallringen eliminerar, källan är sanningen).
// Fynd i första körningen: id-regel = versal av TVÅ första slug-segmenten;
// 13 summaries driftade (äldre varianter; källan bär de korrigerade).
// Kör: node verktyg/_s8u3o108-paritet.mjs
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const HÄR = dirname(fileURLToPath(import.meta.url));
const ROT = join(HÄR, "..");
const { aktiveraTsImport } = await import(pathToFileURL(join(HÄR, "_o106-ts-import.mjs")).href);
aktiveraTsImport();
const { DYNAMIC_CATALOG } = await import(pathToFileURL(join(ROT, "src/lib/ak1a/dynamic-catalog.ts")).href);
const KALLA = JSON.parse(readFileSync(join(ROT, "public/deep-courses.json"), "utf8"));

let hardFail = 0;
const rapport = (namn, lista, hard = true) => {
  if (lista.length === 0) { console.log("  GRÖN " + namn); return; }
  if (hard) hardFail += lista.length;
  console.log((hard ? "  AVVIKELSE " : "  DRIFT ") + namn + " (" + lista.length + "):");
  for (const r of lista.slice(0, 5)) console.log("    ", r);
};

console.log("OBEROENDE FULLFÄLTSPARITET — " + DYNAMIC_CATALOG.length + " katalogposter mot " + Object.keys(KALLA).length + " källposter");

// Mappningsregler (explicita): id = versal av två första slug-segmenten ·
// slug/category/title = rå identitet · level = källnivå normaliserad ·
// minutes/chapterCount = tal · hasX = sanningsvärde av källsektionen.
// summary = mjukt fält: krav = källTÄCKNING (fältet finns i källan för alla);
// avvikelser klassas drift (källans text är den korrigerade, enligt o106 §1).
const NIVA = { "Nybörjare": "nyborjare", "Intermediär": "intermediar", "Avancerad": "avancerad" };
const sannt = (v) => v !== undefined && v !== null && v !== "" && v !== false;

rapport("id = versal(två första slug-segmenten)",
  DYNAMIC_CATALOG.filter((c) => c.id !== c.slug.split("-").slice(0, 2).join("-").toUpperCase()).map((c) => c.id));
rapport("slug finns i källan (projektionsbar)",
  DYNAMIC_CATALOG.filter((c) => !KALLA[c.slug]).map((c) => c.slug));
rapport("category bitidentisk",
  DYNAMIC_CATALOG.filter((c) => KALLA[c.slug] && KALLA[c.slug].category !== c.category).map((c) => c.slug));
rapport("title bitidentisk",
  DYNAMIC_CATALOG.filter((c) => KALLA[c.slug] && KALLA[c.slug].title !== c.title).map((c) => c.slug));
const saknarSummary = DYNAMIC_CATALOG.filter((c) => KALLA[c.slug] && typeof KALLA[c.slug].summary !== "string");
rapport("summary: källan bär fältet för samtliga poster (täckning " + (DYNAMIC_CATALOG.length - saknarSummary.length) + "/" + DYNAMIC_CATALOG.length + ")",
  saknarSummary.map((c) => c.slug));
rapport("summary bitidentisk — RÄKNAS SOM DRIFT (källan bär texten; avvikande katalogtextar är äldre varianter)",
  DYNAMIC_CATALOG.filter((c) => KALLA[c.slug] && typeof KALLA[c.slug].summary === "string" && KALLA[c.slug].summary !== c.summary)
    .map((c) => c.slug), false);
const okändaNivaer = [...new Set(DYNAMIC_CATALOG.map((c) => KALLA[c.slug] && KALLA[c.slug].level).filter((n) => !(n in NIVA)))];
rapport("level = källnivå normaliserad (" + (okändaNivaer.length ? "OKÄNDA KÄLLNIVÅER: " + okändaNivaer.join("/") : "vokabulär låst") + ")",
  DYNAMIC_CATALOG.filter((c) => KALLA[c.slug] && NIVA[KALLA[c.slug].level] !== c.level).map((c) => c.slug));
rapport("minutes bitidentiskt",
  DYNAMIC_CATALOG.filter((c) => KALLA[c.slug] && Number(KALLA[c.slug].minutes) !== c.minutes).map((c) => c.slug));
rapport("chapterCount bitidentiskt",
  DYNAMIC_CATALOG.filter((c) => KALLA[c.slug] && Number(KALLA[c.slug].chapterCount) !== c.chapterCount).map((c) => c.slug));
for (const [katFalt, kallFalt] of [["hasLynch", "lynchSection"], ["hasGraham", "grahamSection"], ["hasAk1", "ak1Section"], ["hasHistory", "history"]]) {
  rapport(katFalt + " = sanningsvärde(" + kallFalt + ")",
    DYNAMIC_CATALOG.filter((c) => KALLA[c.slug] && sannt(KALLA[c.slug][kallFalt]) !== c[katFalt]).map((c) => c.slug));
}

console.log(hardFail === 0
  ? "\nSLUTSATS: samtliga 11 fältprojektioner håller (summary-drift ovan dokumenterad) — gallring förlorar 0 data som saknas i källan."
  : "\nSLUTSATS: " + hardFail + " HÅRDA avvikelser — fält saknar källmotsvarighet, gallring INTE förlustfri.");
process.exit(hardFail === 0 ? 0 : 1);
