#!/usr/bin/env node
/** _r226-las-flaggat.mjs — visa de flaggade raderna i de åtta gamla skripten. */
import { readFileSync } from "node:fs";
const flaggat = {
  "verktyg/_f17-v166d17-kvd.mjs": [78],
  "verktyg/_f21-v166d21-kvd.mjs": [94],
  "verktyg/_f22-v166d22-kvd.mjs": [125],
  "verktyg/_f23-v166d23-kvd.mjs": [157],
  "verktyg/_f24-v166d24-kvd.mjs": [103],
  "verktyg/_r187-levera.mjs": [33, 34, 37],
  "verktyg/_r187-ratta.mjs": [7, 8, 11],
  "verktyg/_v182-sjalvtest.mjs": [38, 58],
};
for (const [fil, rader] of Object.entries(flaggat)) {
  const txt = readFileSync(fil, "utf8");
  const alla = txt.split("\n");
  console.log("=== " + fil + " (import-rader + flaggade) ===");
  console.log("  import: " + alla.filter((r) => /child_process/.test(r)).join(" | "));
  for (const r of rader) console.log("  L" + r + ": " + alla[r - 1].trim());
}
