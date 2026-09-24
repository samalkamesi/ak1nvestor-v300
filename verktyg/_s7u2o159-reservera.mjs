#!/usr/bin/env node
// o159 (s7-u2): reservera nästa lediga protokollnummer i poolen.
// Körs under: flock /tmp/ak1a-protokollnummer.lock node verktyg/_s7u2o159-reservera.mjs
import { readFileSync, writeFileSync } from "node:fs";
const FIL = "data/vakten/protokollnummer.json";
const pool = JSON.parse(readFileSync(FIL, "utf8"));
const hogst = pool.poster
  .map((p) => Number(p.nummer.slice(1)))
  .reduce((a, b) => Math.max(a, b), 0);
const nr = "o" + (hogst + 1);
pool.poster.push({
  nummer: nr,
  agare: "s7-u2",
  manifest: "auto-s7-1790249713381",
  titel: "prestandavåg: bolagsfamiljens jungfrumark — första baslinjen /data/nyckeltalsguide + /bolag + /bolag/[slug] (LH mobil + 52px-sond, kur vid fynd, mätning bokförd)",
  ts: Date.now(),
  status: "reserverat",
});
writeFileSync(FIL, JSON.stringify(pool, null, 2) + "\n");
console.log("RESERVERAT:", nr, "(poolens högsta var o" + hogst + ")");
