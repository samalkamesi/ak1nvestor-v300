#!/usr/bin/env node
/** SOND s5-u3 omgång 16 (manifest auto-s5-1789743901668): serie- och nivåkarta
 *  ur registret (public/deep-courses.json) + kurser-tillagg på disk.
 *  Visar per serie (prefix): antal kurser, nivåfördelning N/I/A/allmän,
 *  högsta nummer, och om det finns gluggar i nummerserien. */
import { readFileSync, readdirSync } from "node:fs";

const register = JSON.parse(readFileSync("public/deep-courses.json", "utf8"));
const slugs = Object.keys(register);

// Serie = prefix framför första siffran-segmentet (t.ex. "bk-05-x" → "bk")
const serieAv = (slug) => (slug.match(/^([a-z]+)-/) || [])[1] ?? "?";
const numAv = (slug) => Number((slug.match(/^([a-z]+)-(\d+)/) || [])[2] ?? 0);

const serier = new Map();
for (const slug of slugs) {
  const s = serieAv(slug);
  if (!serier.has(s)) serier.set(s, []);
  serier.get(s).push(slug);
}

const NIVA = { Nybörjare: "N", Intermediär: "I", Avancerad: "A" };
const rader = [];
for (const [s, list] of [...serier.entries()].sort((a, b) => a[0].localeCompare(b[0]))) {
  list.sort((a, b) => numAv(a) - numAv(b));
  const nivaer = list.map((sl) => NIVA[register[sl].level] ?? "?");
  const kat = register[list[0]].category;
  const nummer = list.map(numAv);
  const max = Math.max(...nummer);
  const glugg = [];
  for (let i = 1; i <= max; i++) if (!nummer.includes(i)) glugg.push(i);
  rader.push({
    serie: s,
    kat,
    antal: list.length,
    max,
    glugg: glugg.join(",") || "—",
    nivaStr: nivaer.join(""),
   lista: list.map((sl, i) => `${numAv(sl)}:${NIVA[register[sl].level] ?? "?"}`).join(" "),
  });
}
console.log("SERIE | KATEGORI | ANTAL | MAX | GLUGG | NIVÅER");
for (const r of rader) console.log(`${r.serie} | ${r.kat} | ${r.antal} | ${r.max} | ${r.glugg} | ${r.nivaStr}`);

// Tilläggsfiler på disk som INTE är i registret (otrackade pågåenden)
const disk = readdirSync("data/kurser-tillagg").filter((f) => f.endsWith(".json")).map((f) => f.replace(/\.json$/, ""));
const otrackade = disk.filter((d) => !register[d]);
console.log("\nOTRACKADE PÅ DISK (ej i registret): " + (otrackade.join(", ") || "ingen"));

// Kategoriers nivåtäckning: saknar kategorin N, I eller A?
const katNiva = new Map();
for (const slug of slugs) {
  const kat = register[slug].category;
  if (!katNiva.has(kat)) katNiva.set(kat, new Set());
  katNiva.get(kat).add(NIVA[register[slug].level] ?? "?");
}
console.log("\nKATEGORIER som saknar nivå (serier med ≥2 kurser):");
for (const [kat, set] of [...katNiva.entries()].sort()) {
  const saknas = ["N", "I", "A"].filter((n) => !set.has(n));
  const antalIKat = slugs.filter((s) => register[s].category === kat).length;
  if (saknas.length && antalIKat >= 2) console.log(`  ${kat} (n=${antalIKat}) saknar: ${saknas.join(",")}`);
}
console.log(`\nTOTALT: ${slugs.length} kurser i registret; ${disk.length} tilläggsfiler på disk.`);
