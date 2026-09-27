#!/usr/bin/env node
/** _r223-u27-inspektera2.mjs — extrahera läsbar text ur statistics/financials/cashflow. */
import { readFileSync, writeFileSync } from "node:fs";
for (const f of ["statistics", "financials", "cashflow"]) {
  const html = readFileSync(`/tmp/r223-ng/${f}.html`, "utf8");
  let plain = html.replace(/<script[\s\S]*?<\/script>/g, " ").replace(/<style[\s\S]*?<\/style>/g, " ");
  plain = plain.replace(/<[^>]+>/g, "\n").replace(/&amp;/g, "&").replace(/&nbsp;/g, " ").replace(/&#x27;/g, "'");
  const rader = plain.split("\n").map((r) => r.trim()).filter((r) => r.length > 1);
  writeFileSync(`/tmp/r223-ng/${f}.plain.txt`, rader.join("\n"));
  console.log(`=== ${f}: ${rader.length} rader ===`);
}
console.log("OK — plain-filer skrivna");
