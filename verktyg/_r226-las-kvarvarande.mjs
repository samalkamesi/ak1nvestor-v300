#!/usr/bin/env node
/** _r226-las-kvarvarande.mjs — visa kvarvarande execSync-rader i _f22 och _r187-levera. */
import { readFileSync } from "node:fs";
for (const f of ["verktyg/_f22-v166d22-kvd.mjs", "verktyg/_r187-levera.mjs"]) {
  const rader = readFileSync(f, "utf8").split("\n");
  console.log("=== " + f + " ===");
  rader.forEach((r, i) => { if (/execSync\(/.test(r)) console.log("  L" + (i + 1) + ": " + r.trim()); });
}
