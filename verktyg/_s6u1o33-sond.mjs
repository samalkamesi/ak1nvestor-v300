/**
 * Sond omgång 33 (s6-u1, manifest auto-s6-1789999525797): vilka kurser i
 * KURSREGISTER är fortfarande MENTORLÖSA — dvs. länkas inte från något
 * fråge-monster (varken handlings-länk /kurser/<slug> eller källmärket
 * kursKalla(reg, "<slug>", …))?
 *
 * Samma logik som syskinlagrens sonder (_s6u1o31-sond.mjs).
 */
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";

const LIB = "/home/ak1a/AK1/src/lib";

// 1) Registerrader ur ai-mentor-register.ts
const regText = readFileSync(join(LIB, "ai-mentor-register.ts"), "utf8");
const rader = [];
const radRe =
  /\{ slug: "([^"]+)", titel: "([^"]+)", kategori: "([^"]+)",/g;
let m;
while ((m = radRe.exec(regText)) !== null) {
  rader.push({ slug: m[1], titel: m[2], kategori: m[3] });
}
console.log(`Register: ${rader.length} kurser`);

// 2) Alla kurslänkar + källslugs i samtliga fragor-filer ( inkl. speglar )
const filer = readdirSync(LIB).filter(
  (f) => f.startsWith("ai-mentor-") && f.endsWith("-fragor.ts")
);
const lankade = new Set();
let monsterAntal = 0;
for (const f of filer) {
  const t = readFileSync(join(LIB, f), "utf8");
  for (const mm of t.matchAll(/\/kurser\/([a-z0-9-]+)/g)) lankade.add(mm[1]);
  for (const mm of t.matchAll(/kursKalla\(\s*reg(?:ister)?\s*,\s*"([a-z0-9-]+)"/g))
    lankade.add(mm[1]);
  monsterAntal += (t.match(/id: "/g) || []).length;
}
console.log(
  `Fragor-filer: ${filer.length}, länkade/källmärkta slugs: ${lankade.size}, monster-id:n: ${monsterAntal}`
);

// 3) Mentorlösa, grupperade per kategori
const losa = rader.filter((r) => !lankade.has(r.slug));
const perKat = {};
for (const r of losa) (perKat[r.kategori] ??= []).push(r);
console.log(`\nMENTORLÖSA: ${losa.length} kurser`);
for (const kat of Object.keys(perKat).sort()) {
  console.log(`\n[${kat}] ${perKat[kat].length} lösa:`);
  for (const r of perKat[kat]) console.log(`  ${r.slug} — ${r.titel}`);
}
