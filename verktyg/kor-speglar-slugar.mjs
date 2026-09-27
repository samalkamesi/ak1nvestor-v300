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
 * v186 (r275): flaggan --kontroll = JäMFÖR ENBART (skriver aldrig) för
 * pre-commit-grindens speglar-driftvakt — se verktyg/hooks/pre-commit.
 * Drift där = 404 på spegelsidor som ska finnas (bevisat 2026-09-27).
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

/** KONTROLL-läge (v186, r275): pre-commit-grindens driftvakt — jämför ENBART, skriver ALDRIG. */
const KONTROLL = process.argv.includes("--kontroll");

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

/** Jämför mot en befintlig MAL — true om slug-listorna är identiska (datum oräknat). */
function listaArSamma() {
  if (!existsSync(MAL)) return false;
  try {
    const befintlig = JSON.parse(readFileSync(MAL, "utf8"));
    return (
      befintlig.version === utdata.version &&
      Array.isArray(befintlig.kurser) &&
      Array.isArray(befintlig.blogg) &&
      befintlig.kurser.length === utdata.kurser.length &&
      befintlig.blogg.length === utdata.blogg.length &&
      JSON.stringify(befintlig.kurser) === JSON.stringify(utdata.kurser) &&
      JSON.stringify(befintlig.blogg) === JSON.stringify(utdata.blogg)
    );
  } catch {
    return false; // Ogiltig befintlig fil ⇒ räknas som drift.
  }
}

// KONTROLL-läge (v186, r275): drift betyder att data/blogg eller sok-index
// ändrats utan att listan regenererats ⇒ speglarna (/en|/ar/(kurser|blogg)/
// <slug>) svarar ÄKTA 404 på sidor som SKA finnas — bevisat 2026-09-27:
// 39 glappade bloggslugar = 78 döda spegelsidor i prod (listan frusen
// 2026-09-21; sitemapen lovade vägarna hela tiden).
if (KONTROLL) {
  if (listaArSamma()) {
    console.log(
      `speglar-slugar.json i sync: ${utdata.kurser.length} kurser + ${utdata.blogg.length} blogg — ingen drift.`,
    );
    process.exit(0);
  }
  let befintligBlogg = [];
  let befintligKurser = [];
  try {
    const b = JSON.parse(readFileSync(MAL, "utf8"));
    befintligBlogg = Array.isArray(b.blogg) ? b.blogg : [];
    befintligKurser = Array.isArray(b.kurser) ? b.kurser : [];
  } catch {
    // Ogiltig/ponerad fil ⇒ tomma listor ⇒ maximal driftredovisning nedan.
  }
  const saknadeBlogg = utdata.blogg.filter((s) => !befintligBlogg.includes(s));
  const saknadeKurser = utdata.kurser.filter((s) => !befintligKurser.includes(s));
  const exempel = [...saknadeBlogg, ...saknadeKurser].slice(0, 3).join(", ");
  console.error(
    `SPEGLAR-DRIFT: public/speglar-slugar.json är inaktuell — ${saknadeBlogg.length} blogg- + ${saknadeKurser.length} kurs-slugar saknas (${exempel}${saknadeBlogg.length + saknadeKurser.length > 3 ? ", …" : ""}).`,
  );
  console.error(
    "KUR: node verktyg/kor-speglar-slugar.mjs — committa public/speglar-slugar.json i SAMMA commit som data-ändringen, annars svarar speglarna 404 på sidor som ska finnas.",
  );
  process.exit(1);
}

// Idempotens: hoppa över skrivningen om listorna är oförändrade (utom
// genererat-datumet, som aldrig ensam ska smutsa ner git-diffen).
if (listaArSamma()) {
  console.log(
    `speglar-slugar.json är aktuell: ${utdata.kurser.length} kurser + ${utdata.blogg.length} blogg · ${Math.round(
      readFileSync(MAL, "utf8").length / 1024,
    )} kB — ingen ändring, filen orörd.`,
  );
  process.exit(0);
}

const ut = JSON.stringify(utdata);
writeFileSync(MAL, ut);
console.log(
  `Skrev public/speglar-slugar.json: ${utdata.kurser.length} kurser + ${utdata.blogg.length} blogg · ${Math.round(
    ut.length / 1024,
  )} kB (källa sok-index.json ${Math.round(readFileSync(KALLA_SOK, "utf8").length / 1024)} kB).`,
);
