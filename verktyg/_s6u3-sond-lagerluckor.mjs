/**
 * Sond för s6-u3 (manifest auto-s6-1789912510460): vilka kurser i KURSREGISTER
 * saknar NÄMNS i något frågelager (varken kursKalla-källa eller /kurser/-länk)?
 * Mönster: våg 210 valde ma-07+rk-07 "som saknade eget förhandsfrågelager".
 * Läser källfilerna som text — inga importer, ingen installation.
 */
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";

const lib = "/home/ak1a/AK1/src/lib";
const registerRaw = readFileSync(join(lib, "ai-mentor-register.ts"), "utf8");

// Extrahera slugs ur KURSREGISTER-arrayen (radvis "slug: "...""-mönster)
const slugRe = /slug:\s*"([^"]+)"/g;
const allaSlugs = [];
let m;
while ((m = slugRe.exec(registerRaw)) !== null) allaSlugs.push(m[1]);

// Titlar per slug (raden ovan slug innehåller titel: "...")
const titelMap = new Map();
const radRe = /titel:\s*"([^"]+)",\s*\n\s*slug:\s*"([^"]+)"/g;
while ((m = radRe.exec(registerRaw)) !== null) titelMap.set(m[2], m[1]);

// Kategori per slug — RegisterRad har kategori: "..." någonstans på blocket;
// enklare: läs blockvis. Fallback: okänd.
const katMap = new Map();
for (const slug of allaSlugs) {
  const idx = registerRaw.indexOf(`slug: "${slug}"`);
  const blockStart = Math.max(0, registerRaw.lastIndexOf("{", idx));
  const blockEnd = registerRaw.indexOf("},", idx);
  const block = registerRaw.slice(blockStart, blockEnd > 0 ? blockEnd : idx + 200);
  const kat = block.match(/kategori:\s*"([^"]+)"/);
  katMap.set(slug, kat ? kat[1] : "?");
}

// Samla ALL text ur samtliga frågelager
const lagerFiler = readdirSync(lib).filter((f) => /^ai-mentor-.*-fragor\.ts$/.test(f));
let lagerText = "";
for (const f of lagerFiler) lagerText += readFileSync(join(lib, f), "utf8");

const namnda = new Set();
for (const slug of allaSlugs) {
  if (lagerText.includes(slug)) namnda.add(slug);
}
const osagda = allaSlugs.filter((s) => !namnda.has(s));

console.log(`Lagerfiler: ${lagerFiler.length}`);
console.log(`Kurser i registret: ${allaSlugs.length}`);
console.log(`Nämnda i något lager: ${namnda.size}`);
console.log(`ALDRIG nämnda (kandidater): ${osagda.length}\n`);
for (const s of osagda) {
  console.log(`  ${s}  [${katMap.get(s)}]  ${titelMap.get(s) ?? "?"}`);
}

// Även: vilka slugs nämns i lager men SAKNAS i registret (fantomlänkar, info)
const iLagerMenEjRegistret = [];
for (const f of lagerFiler) {
  const txt = readFileSync(join(lib, f), "utf8");
  const re = /["'/][^"']*?([a-z]{2}-\d{2}-[a-z0-9-]+)["']/g;
  let mm;
  while ((mm = re.exec(txt)) !== null) {
    const kand = mm[1];
    if (!allaSlugs.includes(kand) && !iLagerMenEjRegistret.includes(kand)) {
      iLagerMenEjRegistret.push(kand);
    }
  }
}
console.log(`\nSlug-liknande strängar i lager men EJ i registret (info): ${iLagerMenEjRegistret.length}`);
for (const s of iLagerMenEjRegistret) console.log(`  ? ${s}`);
