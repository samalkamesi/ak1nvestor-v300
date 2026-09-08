#!/usr/bin/env node
/**
 * AK1A — VÅG 83 DEL B (SPEGLAR404): destillerad slug-lista för middlewarens
 * äkta 404 på speglarna (/en|/ar/kurser/[slug] och /en|/ar/blogg/[slug]).
 *
 * BAKGRUND (STYRELSE-SPEGLAR-P2.md §1 alt C + STYRELSE-VAG83-ROLLER.md DEL B):
 * speglarnas [slug]-router har dynamicParams=true + force-static — okänd
 * slug renderar 404-UI i ett 200-skal (soft-404). Middleware validerar
 * istället slugen mot en destillerad lista och svarar äkta 404 FÖRE
 * routern. deep-courses.json är 17 MB (för tung för edge-bunt) — detta
 * verktyg destillerar fram ENDAST slugar:
 *   public/speglar-slugar.json = { _kalla, version, genererat,
 *     antalKurser, antalBlogg, kurser: [slug …], blogg: [slug …] }
 * Källor: public/sok-index.json (kurser — redan destillerat ur
 * deep-courses.json av verktyg/kor-sokindex.mjs) + filnamnen i
 * data/blogg/*.json (filnamn minus ändelse = slug, samma källa som
 * src/lib/content.ts läser).
 *
 * ── KÖR DETTA EFTER VARJE KURS- ELLER BLOGGÄNDRING ────────────────────
 *    node verktyg/kor-sokindex.mjs && node verktyg/kor-speglar-slugar.mjs
 * Pipelinen som skriver deep-courses.json/data/blogg uppdaterar INTE denna
 * fil själv — glöms steget blir listan inaktuell och NYA kurser/artiklar
 * får 404 tills den körs (befintliga påverkas aldrig; en för gammal lista
 * kan aldrig ge false 200). Idempotent som kor-sokindex.mjs: filen skrivs
 * ENBART när slug-listorna faktiskt förändrats (genererat-datumet orsakar
 * aldrig en diff), så det är säkert att köra i redundans.
 *
 * MINNETS REGEL: slugar är rena ASCII [a-z0-9-]+ — ogiltig slug avvisas
 * med avslutskod 1 (modellen gissar aldrig, listan saneras aldrig tyst).
 *
 * Avslutskod: 0 om filen är aktuell (skriven eller redan rätt),
 * 1 om källor saknas/är ogiltiga eller innehåller ogiltiga slugar.
 *
 * Pedagogisk forskning — ALDRIG investeringsråd.
 */
import { readFileSync, writeFileSync, existsSync, readdirSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const KALLA_SOK = path.join(REPO, "public", "sok-index.json");
const KALLA_BLOGG = path.join(REPO, "data", "blogg");
const MAL = path.join(REPO, "public", "speglar-slugar.json");

/** Minnets regel — exakt samma regex som middlewarens block använder. */
const SLUG_MONSTER = /^[a-z0-9-]+$/;

if (!existsSync(KALLA_SOK)) {
  console.error("FEL: public/sok-index.json saknas — kör verktyg/kor-sokindex.mjs först.");
  process.exit(1);
}
if (!existsSync(KALLA_BLOGG)) {
  console.error("FEL: data/blogg saknas — inget underlag för blogg-slugar.");
  process.exit(1);
}

let kurser;
try {
  const sok = JSON.parse(readFileSync(KALLA_SOK, "utf8"));
  kurser = (Array.isArray(sok) ? sok : sok.kurser ?? [])
    .map((k) => (k && typeof k === "object" && typeof k.slug === "string" ? k.slug : ""))
    .filter((s) => s.length > 0);
} catch (e) {
  console.error(`FEL: kunde inte tolka public/sok-index.json (${e.message}).`);
  process.exit(1);
}

const blogg = readdirSync(KALLA_BLOGG)
  .filter((f) => f.endsWith(".json"))
  .map((f) => f.slice(0, -".json".length));

const ogiltiga = [...kurser, ...blogg].filter((s) => !SLUG_MONSTER.test(s));
if (kurser.length === 0 || blogg.length === 0) {
  console.error(
    `FEL: tomma källor (${kurser.length} kurser, ${blogg.length} blogg) — listan skrivs inte (modellen gissar aldrig).`,
  );
  process.exit(1);
}
if (ogiltiga.length > 0) {
  console.error(`FEL: ogiltiga slugar (väntat ^[a-z0-9-]+$: ${ogiltiga.slice(0, 5).join(", ")}).`);
  process.exit(1);
}

const utdata = {
  _kalla:
    "genererad av verktyg/kor-speglar-slugar.mjs ur public/sok-index.json + data/blogg — kör skriptet efter varje kurs-/bloggändring",
  version: 1,
  genererat: new Date().toISOString().slice(0, 10),
  antalKurser: kurser.length,
  antalBlogg: blogg.length,
  kurser: [...new Set(kurser)].sort(),
  blogg: [...new Set(blogg)].sort(),
};

// Idempotens: hoppa över skrivningen om listorna är oförändrade (utom
// genererat-datumet, som aldrig ensam ska smutsa ner git-diffen).
if (existsSync(MAL)) {
  try {
    const befintlig = JSON.parse(readFileSync(MAL, "utf8"));
    const samma =
      befintlig.version === utdata.version &&
      Array.isArray(befintlig.kurser) &&
      Array.isArray(befintlig.blogg) &&
      befintlig.kurser.length === utdata.kurser.length &&
      befintlig.blogg.length === utdata.blogg.length &&
      JSON.stringify(befintlig.kurser) === JSON.stringify(utdata.kurser) &&
      JSON.stringify(befintlig.blogg) === JSON.stringify(utdata.blogg);
    if (samma) {
      console.log(
        `speglar-slugar.json är aktuell: ${utdata.kurser.length} kurser + ${utdata.blogg.length} blogg · ${Math.round(
          readFileSync(MAL, "utf8").length / 1024,
        )} kB — ingen ändring, filen orörd.`,
      );
      process.exit(0);
    }
  } catch {
    // Ogiltig befintlig fil → skrivs om nedan.
  }
}

const ut = JSON.stringify(utdata);
writeFileSync(MAL, ut);
console.log(
  `Skrev public/speglar-slugar.json: ${utdata.kurser.length} kurser + ${utdata.blogg.length} blogg · ${Math.round(
    ut.length / 1024,
  )} kB (källa sok-index.json ${Math.round(readFileSync(KALLA_SOK, "utf8").length / 1024)} kB).`,
);
