#!/usr/bin/env node
/** _r199-v173u5-rattning.mjs — paranoid-cykelbastal till skriptets exakta värden (maskin före hand, igen). */
import { readFileSync, writeFileSync } from "node:fs";
const UNI = "data/portfolj-system/bolagsunivers.json";
let raw = readFileSync(UNI, "utf8");
const byten = [
  ["oms −11,49 % · netto −33,05 %", "oms −11,74 % · netto −34,47 %"],
];
let n = 0;
for (const [a, b] of byten) {
  if (raw.includes(a)) { raw = raw.split(a).join(b); n++; }
}
writeFileSync(UNI, raw);
const el = JSON.parse(readFileSync(UNI, "utf8"));
const t = el.find((x) => x.ticker === "NTR");
console.log(`RÄTTAD (${n} byten) · total ${el.length} · NTR kvar ${!!t} · cykelbas bär skriptvärdena: ${t.kallor[0].paranoid.includes("−11,74 % · netto −34,47 %")}`);
