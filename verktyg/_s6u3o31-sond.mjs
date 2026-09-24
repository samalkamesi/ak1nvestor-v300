/**
 * SOND 1 (s6-u3, manifest auto-s6-1789965330060): kategoristatus — vilka
 * kategorier har mentorväglösa kurser (aldrig nämnda som slug i något
 * frågelager), hur stora är kategorierna, och vilka slugs är lösa?
 * Vidare: BOKMASTER utesluts ur huvudlistan (bokkanon — separat spår).
 */
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";

const lib = "/home/ak1a/AK1/src/lib";
const registerRaw = readFileSync(join(lib, "ai-mentor-register.ts"), "utf8");

const slugRe = /slug:\s*"([^"]+)"/g;
const allaSlugs = [];
let m;
while ((m = slugRe.exec(registerRaw)) !== null) allaSlugs.push(m[1]);

const titelMap = new Map();
const radRe = /titel:\s*"([^"]+)",\s*\n\s*slug:\s*"([^"]+)"/g;
while ((m = radRe.exec(registerRaw)) !== null) titelMap.set(m[2], m[1]);

const katMap = new Map();
for (const slug of allaSlugs) {
  const idx = registerRaw.indexOf(`slug: "${slug}"`);
  const blockStart = Math.max(0, registerRaw.lastIndexOf("{", idx));
  const blockEnd = registerRaw.indexOf("},", idx);
  const block = registerRaw.slice(blockStart, blockEnd > 0 ? blockEnd : idx + 200);
  const kat = block.match(/kategori:\s*"([^"]+)"/);
  katMap.set(slug, kat ? kat[1] : "?");
}

const lagerFiler = readdirSync(lib).filter((f) => /^ai-mentor-.*-fragor\.ts$/.test(f) || f === "ai-mentor-svar.ts");
let lagerText = "";
for (const f of lagerFiler) lagerText += readFileSync(join(lib, f), "utf8");

const namnda = new Set(allaSlugs.filter((s) => lagerText.includes(s)));

// Kategoriaggregat (exklusive BOKMASTER)
const katStat = new Map();
for (const slug of allaSlugs) {
  const kat = katMap.get(slug);
  if (kat === "BOKMASTER") continue;
  if (!katStat.has(kat)) katStat.set(kat, { total: 0, losa: [] });
  katStat.get(kat).total++;
  if (!namnda.has(slug)) katStat.get(kat).losa.push(slug);
}

console.log("=== KATEGORIER MED LÖSA KURSER (exkl. BOKMASTER) ===");
const sorterade = [...katStat.entries()].sort((a, b) => b[1].losa.length - a[1].losa.length);
for (const [kat, st] of sorterade) {
  if (st.losa.length === 0) continue;
  console.log(`\n[${kat}] ${st.total - st.losa.length}/${st.total} nådda — LÖSA ${st.losa.length}:`);
  for (const s of st.losa) console.log(`   ${s} — ${titelMap.get(s) ?? "?"}`);
}
console.log("\n=== FULLT NÅDDA KATEGORIER (exkl. BOKMASTER) ===");
for (const [kat, st] of sorterade) {
  if (st.losa.length === 0) console.log(`  [${kat}] ${st.total}/${st.total}`);
}
const bm = katStat.get("__") ?? null;
const bokmaster = allaSlugs.filter((s) => katMap.get(s) === "BOKMASTER");
const bmNamma = bokmaster.filter((s) => namnda.has(s)).length;
console.log(`\nBOKMASTER (info): ${bmNamma}/${bokmaster.length} nämnda`);
