#!/usr/bin/env node
/** _r197-v173u3-landsond.mjs — land/bransch-fördelning + Sverigecellens innehåll (kandidatval v2). */
import { readFileSync, writeFileSync } from "node:fs";
const u = JSON.parse(readFileSync("data/portfolj-system/bolagsunivers.json", "utf8"));
const ut = [];
const land = {};
for (const b of u) land[b.land] = (land[b.land] ?? 0) + 1;
ut.push("=== land (sorterat) ===");
ut.push("  " + Object.entries(land).sort((a, b) => b[1] - a[1]).map(([k, n]) => `${k}:${n}`).join(" · "));
const sve = u.filter((b) => b.land === "Sverige");
ut.push("=== Sverige-cellen (" + sve.length + "): " + sve.map((b) => b.ticker + "/" + b.bransch).join(" · "));
const peBar = sve.map((b) => `${b.ticker} P/E=${b.vardering?.pe ?? "—"}`);
ut.push("=== Sveriges P/E: " + peBar.join(" · "));
writeFileSync("/tmp/r197-land.txt", ut.join("\n"));
console.log(ut.join("\n"));
