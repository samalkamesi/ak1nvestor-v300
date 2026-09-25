#!/usr/bin/env node
/** _r223-u27-sond.mjs — kartlägg 1-grenar + UK-celler inför U27-koordinatval (rond 223). */
import { readFileSync } from "node:fs";
const u = JSON.parse(readFileSync("data/portfolj-system/bolagsunivers.json", "utf8"));
console.log("total: " + u.length);
const byCell = new Map();
for (const b of u) {
  const k = b.land + "/" + b.bransch;
  if (!byCell.has(k)) byCell.set(k, []);
  byCell.get(k).push(b.ticker);
}
console.log("--- Storbritannien ---");
for (const [k, v] of byCell) if (k.startsWith("Storbritannien")) console.log(k + " => " + v.join(", "));
console.log("--- alla 1-grenar ---");
for (const [k, v] of byCell) if (v.length === 1) console.log(k + " => " + v[0]);
console.log("--- kollisionskontroll kandidater: SHEL/BP ---");
const traf = u.filter((b) => ["SHEL.L", "SHEL", "BP.L", "BP", "SHEL.MC", "BPCE"].includes(b.ticker) || /shell|british petroleum/i.test(b.namn ?? ""));
console.log(traf.length ? "TRAFF: " + traf.map((b) => b.ticker + " (" + (b.namn ?? "").slice(0, 30) + ")").join(", ") : "SHEL/BP: INGEN KOLLISION");
console.log("--- Kanada/Spanien 1-grenar ---");
for (const [k, v] of byCell) if (/Kanada|Spanien/.test(k) && v.length < 2) console.log(k + " => " + v.join(", "));
