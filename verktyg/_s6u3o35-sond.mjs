/**
 * SOND s6-u3 omgång 35 — lagerluckor: vilka kurser är fortfarande MENTORVÄGLÖSA?
 *
 * Metod (samma som _s6u3o34-sond.mjs): en kurs räknas mentorlänkad om dess
 * slug förekommer som sträng i någon ai-mentor-*-fragor.ts eller mentor-svar.ts
 * (källa, kurslänk eller fördjupning). Registret läses ur register-filens
 * KURSREGISTER-block. Utdata: mentorlösa per kategori + andel, för val av
 * nästa tre aktiveringar.
 */
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";

const ROT = "/home/ak1a/AK1";
const regKalla = readFileSync(join(ROT, "src/lib/ai-mentor-register.ts"), "utf8");
const slugs = [...regKalla.matchAll(/^\s*\{ slug: "([^"]+)", titel: "([^"]+)", kategori: "([^"]+)"/gm)].map(
  (m) => ({ slug: m[1], titel: m[2], kategori: m[3] }),
);

const libFiler = readdirSync(join(ROT, "src/lib"))
  .filter((f) => (f.startsWith("ai-mentor-") && f.endsWith("-fragor.ts")) || f === "mentor-svar.ts" || f === "ai-mentor-svar.ts")
  .map((f) => readFileSync(join(ROT, "src/lib", f), "utf8"));
const korpus = libFiler.join("\n");

const losa = slugs.filter((r) => !korpus.includes(r.slug));
const perKat = new Map();
for (const r of losa) perKat.set(r.kategori, [...(perKat.get(r.kategori) || []), r]);
const katTotal = new Map();
for (const r of slugs) katTotal.set(r.kategori, (katTotal.get(r.kategori) || 0) + 1);

console.log(`Registret: ${slugs.length} kurser · mentorlösa: ${losa.length} i ${perKat.size} kategorier\n`);
const rader = [...perKat.entries()].sort((a, b) => a[1].length - b[1].length || a[0].localeCompare(b[0]));
for (const [kat, arr] of rader) {
  console.log(`── ${kat} ${arr.length}/${katTotal.get(kat)} lösa:`);
  for (const r of arr) console.log(`   ${r.slug} — ${r.titel}`);
}
console.log("\nKategorier med FÄRST lösa (stängningskandidater):");
for (const [kat, arr] of rader.slice(0, 8)) console.log(`   ${kat}: ${arr.length} lösa → ${arr.map((r) => r.slug).join(", ")}`);
