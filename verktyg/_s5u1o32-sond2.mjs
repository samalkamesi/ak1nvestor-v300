#!/usr/bin/env node
/**
 * SOND 2 för s5-u1 (omgång 32) — bredare kandidatprobar efter att sond 1 dödade
 * covenant (ks-05 äger) och blankning (am-06 äger). Kör: node verktyg/_s5u1o32-sond2.mjs
 */
import { readFileSync } from "node:fs";

const dc = JSON.parse(readFileSync("/home/ak1a/AK1/public/deep-courses.json", "utf8"));
const slugs = Object.keys(dc);
const blob = {};
for (const s of slugs) blob[s] = JSON.stringify(dc[s]).toLowerCase();

function agare(term) {
  const t = term.toLowerCase();
  return slugs.filter((s) => blob[s].includes(t));
}

const kandidater = [
  // BOKFÖRING: segmentrapportering (bk-10-kandidat)
  "segmentrapportering", "segmentredovisning", "not upplysning om segment", "segmentanalys",
  // SEKTOR: mjukvara/SaaS (se-25-kandidat)
  "saas", "mjukvarubolag", "abonnemangsintäkt", "arr", "net revenue retention", "churn",
  "prenumerationsintäkt",
  // LÖNSAMHET: inkrementell ROIC (ln-07/roic-07-kandidat)
  "inkrementell roic", "inkrementell avkastning", "varje ny krona", "gränsavkastning",
  // AKTIEMARKNADEN: insynshandel (am-10-kandidat)
  "insynslista", "insynshandel", "ledamots köp", "insiderköp", "pdmr",
  // TILLVÄXT: synergi (tx-08-kandidat)
  "synergi", "synergieffekt",
  // VÄRDERING: multipelpersistens (vr-11-kandidat)
  "multipelpersistens", "multipelns beständighet", "reversion mot medel",
  // KATALYSATOR: «terrk»? nej — aktivistisk ägare (kt-12-kandidat)
  "aktivistisk", "aktieägarkampanj", "proxy fight",
  // BETEENDE: ankartillägningsheuristiken (bf-19-kandidat)
  "förankring", "ankartillägnings",
];

console.log("═ PROBE 2: kandidatterm → ägande (0 = vit fläck) ═");
for (const k of kandidater) {
  const a = agare(k);
  const mark = a.length === 0 ? "  ← VIT FLÄCK" : a.length <= 2 ? "  ← TUNNT" : "";
  console.log(`«${k}»: ${a.length}${mark}${a.length > 0 && a.length <= 6 ? "  → " + a.join(", ") : ""}`);
}
