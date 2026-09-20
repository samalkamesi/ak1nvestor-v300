#!/usr/bin/env node
// Testsvit — DYNAMIC-CATALOG (våg 213 del b / o106): katalogens inre konsistens
// + PARITET mot källan public/deep-courses.json (rotfyndet: engångsgenererad
// fil utan generator/svit drifte — 8 titlar hade glidit; denna svit låser).
// Kör: node verktyg/testa-dynamic-catalog.mjs  (Node ≥ 22.18: type stripping)
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const HÄR = dirname(fileURLToPath(import.meta.url));
const ROT = join(HÄR, "..");
const [major, minor] = process.versions.node.split(".").map(Number);
if (!(major > 22 || (major === 22 && minor >= 18))) {
  console.error("FEL: Node " + process.versions.node + " saknar type stripping.");
  process.exit(1);
}

const { aktiveraTsImport } = await import(pathToFileURL(join(HÄR, "_o106-ts-import.mjs")).href);
aktiveraTsImport();

const { DYNAMIC_CATALOG, CATALOG_CATEGORIES, TOTAL_CATALOG_COURSES } = await import(
  pathToFileURL(join(ROT, "src/lib/ak1a/dynamic-catalog.ts")).href
);
const KALLA = JSON.parse(readFileSync(join(ROT, "public/deep-courses.json"), "utf8"));

let pass = 0, fail = 0;
const ok = (namn, villkor) => { if (villkor) { pass++; console.log("  PASS " + namn); } else { fail++; console.log("  FAIL " + namn); } };

console.log("A — inre konsistens");
ok(`A1 antal = TOTAL_CATALOG_COURSES (${DYNAMIC_CATALOG.length} mot ${TOTAL_CATALOG_COURSES})`, DYNAMIC_CATALOG.length === TOTAL_CATALOG_COURSES);
ok("A2 id:n unika", new Set(DYNAMIC_CATALOG.map((c) => c.id)).size === DYNAMIC_CATALOG.length);
ok("A3 slug:ar unika", new Set(DYNAMIC_CATALOG.map((c) => c.slug)).size === DYNAMIC_CATALOG.length);
ok("A4 kategorier ∈ CATALOG_CATEGORIES (samtliga)", DYNAMIC_CATALOG.every((c) => CATALOG_CATEGORIES.includes(c.category)));
ok("A5 nivåer giltiga", DYNAMIC_CATALOG.every((c) => ["nyborjare", "intermediar", "avancerad"].includes(c.level)));
ok("A6 minuter/kapitel positiva tal", DYNAMIC_CATALOG.every((c) => c.minutes > 0 && c.chapterCount > 0));
ok("A7 titel + sammanfattning satta (icke-tomma)", DYNAMIC_CATALOG.every((c) => c.title.trim().length > 0 && c.summary.trim().length > 0));
ok("A8 KURS_TITLAR-paritet: kategorikonstanten täcker alla katalogkategorier exakt", new Set(DYNAMIC_CATALOG.map((c) => c.category)).size === CATALOG_CATEGORIES.length);

console.log("B — paritet mot källan public/deep-courses.json (driftlåset)");
const saknas = DYNAMIC_CATALOG.filter((c) => !KALLA[c.slug]);
ok(`B1 samtliga slugs finns i källan (${saknas.length} saknade)`, saknas.length === 0);
const titelAvv = DYNAMIC_CATALOG.filter((c) => KALLA[c.slug] && KALLA[c.slug].title !== c.title);
ok(`B2 titlar bitidentiska med källan (${titelAvv.length} avviker)`, titelAvv.length === 0);
if (titelAvv.length) for (const c of titelAvv) console.log("    aviker:", c.slug, "→", JSON.stringify(c.title), "mot", JSON.stringify(KALLA[c.slug].title));
const katAvv = DYNAMIC_CATALOG.filter((c) => KALLA[c.slug] && KALLA[c.slug].category !== c.category);
ok(`B3 kategorier bitidentiska (${katAvv.length} avviker)`, katAvv.length === 0);
const talAvv = DYNAMIC_CATALOG.filter((c) => KALLA[c.slug] && (Number(KALLA[c.slug].minutes) !== c.minutes || Number(KALLA[c.slug].chapterCount) !== c.chapterCount));
ok(`B4 minuter+kapitelantal bitidentiska (${talAvv.length} avviker)`, talAvv.length === 0);

console.log("C — urvalsregeln: katalogen lämnar AKM1:s egna ytor");
const akm1Slugs = Object.keys(KALLA).filter((s) => s.startsWith("akm1"));
ok(`C1 inga AKM1-kurser i katalogen (källan bär ${akm1Slugs.length})`, DYNAMIC_CATALOG.every((c) => !c.slug.startsWith("akm1")));
const bokmaster = Object.entries(KALLA).filter(([, v]) => v.category === "BOKMASTER");
ok(`C2 bokmastarbiblioteket (${bokmaster.length} i källan) är EJ katalogens yta`, DYNAMIC_CATALOG.every((c) => c.category !== "BOKMASTER"));

console.log(`\nSVIT DYNAMIC-CATALOG: ${pass} PASS / ${fail} FAIL`);
process.exit(fail === 0 ? 0 : 1);
