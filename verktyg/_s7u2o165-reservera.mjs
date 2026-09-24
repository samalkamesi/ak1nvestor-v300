#!/usr/bin/env node
// o165 (s7-u2, omdispatch): reservera nästa lediga protokollnummer i poolen.
// Körs under: flock /tmp/ak1a-protokollnummer.lock node verktyg/_s7u2o165-reservera.mjs
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
  titel: "prestandavåg: o159 §9 EFTER-vakarövertag som STÅENDE instrument — autonom kedja som väntar ut RAM-blockerad deploy av 21e67000 och då kör kanalbevis + LH-EFTER ×3 + skroll-CLS och domar (mät före/efter, deploy, prod 200, mätning bokförd)",
  ts: Date.now(),
  status: "reserverat",
});
writeFileSync(FIL, JSON.stringify(pool, null, 2) + "\n");
console.log("RESERVERAT:", nr, "(poolens högsta var o" + hogst + ")");
