#!/usr/bin/env node
/** _r226-vaktstatus3.mjs — läs HELA prodens RÖDA kvalitetsrapport. */
import { readFileSync } from "node:fs";
const txt = readFileSync("/home/ak1a/AK1/data/rapporter/kvalitetsrapport-SENASTE.md", "utf8");
const rader = txt.split("\n");
// visa sektioner med FEL + sektionen före + SAMMANFATTNING
const start = rader.findIndex((r) => r.startsWith("## 12"));
console.log(rader.slice(Math.max(0, start), rader.length).join("\n"));
console.log("\n=== FEL-sektionernas kontext ===");
for (let i = 0; i < rader.length; i++) {
  if (/^### FEL/.test(rader[i])) {
    console.log("--- kontext för " + rader[i] + " ---");
    console.log(rader.slice(Math.max(0, i - 8), i + 16).join("\n"));
  }
}
