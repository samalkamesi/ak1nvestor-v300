/**
 * SOND _s6u3-mentorlosa — färsk lagerluckkarta för spår 6 (AI-Mentorn).
 * Manifest auto-s6-1790670317558, byggare 3/3.
 *
 * Metod (v208+ standard): läs ALLA ai-mentor-lagers källkod, samla ALLA
 * slug-referenser (kursKalla(reg, "slug" + "/kurser/slug" — hela filen,
 * alla block), jämför mot public/deep-courses.json (501 kurser) och
 * rapportera mentorlösa per kategori med datatyngd (bytes chapters-list).
 * Ohyllad läxa från omgång 35: samtliga block per fil — regexen här
 * matchar hela filinnehållet, inga block missas.
 */
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";

const ROT = join(import.meta.dirname, "..");
const LIB = join(ROT, "src/lib");

const filer = readdirSync(LIB).filter(
  (f) => f.startsWith("ai-mentor-") && (f.includes("fragor") || f === "ai-mentor-svar.ts"),
);
const slugar = new Set();
for (const f of filer) {
  const txt = readFileSync(join(LIB, f), "utf8");
  for (const m of txt.matchAll(/kursKalla\((?:reg|register), "([^"]+)"/g)) slugar.add(m[1]);
  for (const m of txt.matchAll(/\/kurser\/([a-z0-9-]+)/g)) slugar.add(m[1]);
}
console.log("lager lästa:", filer.length, "· unika slug-referenser:", slugar.size);

const dc = JSON.parse(readFileSync(join(ROT, "public/deep-courses.json"), "utf8"));
const kurser = Object.values(dc);
const losa = kurser
  .filter((k) => !slugar.has(k.slug))
  .map((k) => {
    const tyngd = JSON.stringify(k.chapters_list ?? k.chapters ?? "").length;
    return { slug: k.slug, titel: k.title, kat: k.category, kap: k.chapterCount, tyngd };
  });
const perKat = {};
for (const r of losa) {
  perKat[r.kat] = perKat[r.kat] || { antal: 0, kurser: [] };
  perKat[r.kat].antal++;
  perKat[r.kat].kurser.push(r);
}
console.log("\n=== MENTORLÖSA PER KATEGORI (" + losa.length + " av " + kurser.length + ") ===");
const sorterade = Object.entries(perKat).sort((a, b) => b[1].antal - a[1].antal);
for (const [kat, v] of sorterade) {
  console.log("\n" + kat + " — " + v.antal + " lösa");
  for (const r of v.kurser.sort((a, b) => b.tyngd - a.tyngd)) {
    console.log("  " + r.slug + " · " + r.kap + " kap · " + r.tyngd + " tkn · " + r.titel.slice(0, 60));
  }
}
