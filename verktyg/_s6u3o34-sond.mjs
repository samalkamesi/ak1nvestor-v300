// Sond fönster 34 (manifest auto-s6-1790029519192, s6-u3): mentorlösa kurser
// per kategori — samma metod som _s6u3-sond-lagerluckor.mjs (omg 33):
// en kurs räknas mentorlänkad OM dess slug förekommer i någon
// ai-mentor-*-fragor.ts (källmärke, handlingslänk eller fordjupa).
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

const LIB = "/home/ak1a/AK1/src/lib";
const files = readdirSync(LIB).filter((f) => /^ai-mentor-.*-fragor\.ts$/.test(f));
let bundet = "";
const motorer = [];
for (const f of files) {
  const t = readFileSync(join(LIB, f), "utf8");
  bundet += t;
  const monster = (t.match(/id: "/g) || []).length;
  motorer.push({ f, monster });
}

// Register via samma kanal som kedjetestet
const { KURSREGISTER } = await import("/home/ak1a/AK1/src/lib/ai-mentor-register.ts");

const perKategori = {};
const losa = [];
for (const r of KURSREGISTER) {
  const kopplad = bundet.includes(r.slug);
  if (!kopplad) losa.push(r);
  perKategori[r.kategori] = perKategori[r.kategori] || { totalt: 0, losa: 0, losaSlugs: [] };
  perKategori[r.kategori].totalt++;
  if (!kopplad) { perKategori[r.kategori].losa++; perKategori[r.kategori].losaSlugs.push(r.slug); }
}

const totMonster = motorer.reduce((a, m) => a + m.monster, 0);
console.log(`Motorer: ${motorer.length} · monsters: ${totMonster} (sondläge)`);
console.log(`Register: ${KURSREGISTER.length} kurser · mentorlösa: ${losa.length}\n`);
console.log("Kategorier (lösa/totalt):");
const rader = Object.entries(perKategori).sort((a, b) => b[1].losa - a[1].losa || a[0].localeCompare(b[0]));
for (const [kat, s] of rader) {
  const mark = s.losa === 0 ? "STÄNGD" : s.losa === 1 ? "ENDA LÖSA=" + s.losaSlugs[0] : "öppen";
  console.log(`  ${kat}: ${s.losa}/${s.totalt} ${mark}${s.losa > 0 && s.losa <= 6 ? "  [" + s.losaSlugs.join(", ") + "]" : ""}`);
}
// De sex nyfödda från spår 5 omgång 27 (492→495) — rs-09-precedensen
const nyfodda = ["ma-09-produktionsgapet", "roic-06-bankernas-lonsamhet", "st-08-bindningsrisken", "ln-06-underhallscapex", "ks-09-senioritetsordningen", "od-11-ranteswapen"];
console.log("\nSpår 5:s sex nyfödda (omg 27, 492→495):");
for (const slug of nyfodda) {
  const r = KURSREGISTER.find((x) => x.slug === slug);
  console.log(`  ${slug}: ${r ? (bundet.includes(slug) ? "mentorlänkad" : "MENTORLÖS") : "SAKNAS I REGISTER"} (${r ? r.kategori : "?"})`);
}
