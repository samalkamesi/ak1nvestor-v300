#!/usr/bin/env node
/**
 * AK1A — VÅG 63 bygg-2 (MEGA-OPTIMERING fas B, problem #2): slimmigt
 * sökindex för kommandopaletten (⌘K) och 404-sidans kursförslag.
 *
 * BAKGRUND (data/forskning/OPTIMERING/o1-prestanda.md #2): sokindex.ts
 * fetchar hela /deep-courses.json — 16,6 MB över wire, 17,4 MB JSON.parse
 * på huvudtråden — vid första sökningen, fast sökningen bara behöver
 * slug/titel/kategori/nycklar. Detta verktyg destillerar filen till
 * public/sok-index.json (endast sökfält, ingen chapters/history):
 *   { version, genererat, antal, kurser: [{ slug, title, category,
 *     level, weight, summary(≤110 tecken) }] }
 * level+summary följer med trots att de inte är obligatoriska i
 * uppdraget: palettens "nycklar" söker på level och beskrivningen
 * visar summary — utan dem tappar ⌘K träffkvalitet mot gamla vägen.
 * Målbudget ≈ 150 kB (verklighet ~100 kB för 333 kurser).
 *
 * ── KORS DETTA EFTER VARJE KURSÄNDRING ────────────────────────────────
 *    node verktyg/kor-sokindex.mjs
 * Pipelinen som skriver deep-courses.json (expand-courses, generate-
 * courses, bokmaster-import m.fl.) uppdaterar INTE sökindexet själv —
 * glöms steget blir indexet inaktuellt och paletten visar gamla kurser
 * tills det körs. Skriptet är idempotent: filen skrivs ENBART när
 * kurslistan faktiskt förändrats (genererat-datumet orsakar aldrig en
 * diff), så det är säkert att köra i redundans.
 *
 * FALLBACK: saknas public/sok-index.json (t.ex. äldre deploy) faller
 * src/lib/sokindex.ts automatiskt tillbaka till /deep-courses.json —
 * sökningen fungerar alltid, bara långsammare.
 *
 * Avslutskod: 0 om indexet är aktuellt (skrivet eller redan rätt),
 * 1 om deep-courses.json saknas eller är ogiltig.
 *
 * Pedagogisk forskning — ALDRIG investeringsråd.
 */
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const KALLA = path.join(REPO, "public", "deep-courses.json");
const MAL = path.join(REPO, "public", "sok-index.json");

/** Max tecken av summary som följer med (palettens beskrivningsrad klipper ändå vid 110). */
const SUMMARY_MAX = 110;

if (!existsSync(KALLA)) {
  console.error("FEL: public/deep-courses.json saknas — inget underlag att indexera.");
  process.exit(1);
}

/** Kurs-post i deep-courses.json (endast de fält vi läser). */
let rå;
try {
  rå = JSON.parse(readFileSync(KALLA, "utf8"));
} catch (e) {
  console.error(`FEL: kunde inte tolka public/deep-courses.json (${e.message}).`);
  process.exit(1);
}

const poster = Object.entries(rå ?? {})
  .filter(([slug, k]) => typeof slug === "string" && slug && k && typeof k === "object")
  .map(([slug, k]) => ({
    slug,
    title: String(k.title || slug),
    category: typeof k.category === "string" ? k.category : "",
    level: typeof k.level === "string" ? k.level : "",
    weight: typeof k.weight === "string" ? k.weight : "",
    summary: String(k.summary || "").slice(0, SUMMARY_MAX),
  }))
  .sort((a, b) => a.slug.localeCompare(b.slug));

if (poster.length === 0) {
  console.error("FEL: deep-courses.json innehåller inga kurser — indexet skrivs inte (modellen gissar aldrig).");
  process.exit(1);
}

const index = {
  _kalla:
    "genererad av verktyg/kor-sokindex.mjs ur public/deep-courses.json — kör skriptet efter varje kursändring",
  version: 1,
  genererat: new Date().toISOString().slice(0, 10),
  antal: poster.length,
  kurser: poster,
};

// Idempotens: hoppa över skrivningen om kurslistan är oförändrad (utom
// genererat-datumet, som aldrig ensam ska smutsa ner git-diffen).
if (existsSync(MAL)) {
  try {
    const befintlig = JSON.parse(readFileSync(MAL, "utf8"));
    const samma =
      befintlig.version === index.version &&
      Array.isArray(befintlig.kurser) &&
      befintlig.kurser.length === index.kurser.length &&
      JSON.stringify(befintlig.kurser) === JSON.stringify(index.kurser);
    if (samma) {
      console.log(
        `sok-index.json är aktuellt: ${index.antal} kurser · ${Math.round(
          readFileSync(MAL, "utf8").length / 1024,
        )} kB — ingen ändring, filen orörd.`
      );
      process.exit(0);
    }
  } catch {
    // Ogiltig befintlig fil → skrivs om nedan.
  }
}

const ut = JSON.stringify(index);
writeFileSync(MAL, ut);
console.log(
  `Skrev public/sok-index.json: ${index.antal} kurser · ${Math.round(
    ut.length / 1024,
  )} kB (källa ${(readFileSync(KALLA, "utf8").length / 1024 / 1024).toFixed(1)} MB — ${Math.round(
    (1 - ut.length / readFileSync(KALLA, "utf8").length) * 100,
  )} % mindre).`
);
