#!/usr/bin/env node
/** _r223-u27-sond2.mjs — SHEL:s nuvarande cell + BP.L:s rad som duopartner-underlag. */
import { readFileSync } from "node:fs";
const u = JSON.parse(readFileSync("data/portfolj-system/bolagsunivers.json", "utf8"));
const shel = u.find((b) => b.ticker === "SHEL");
if (shel) {
  console.log("SHEL: land=" + shel.land + " · bransch=" + shel.bransch + " · namn=" + shel.namn);
  console.log("  valuta=" + shel.valuta + " · pris=" + shel.pris + " · mcap=" + shel.marknadsKapitalMdr);
  console.log("  notering (första 300): " + (shel.notering ?? "").slice(0, 300));
  console.log("  kalla: " + (shel.kallor?.[0]?.url ?? "saknas"));
  const landEnergi = u.filter((b) => b.land === shel.land && b.bransch === shel.bransch).map((b) => b.ticker);
  console.log("  " + shel.land + "/" + shel.bransch + "-cellen: " + landEnergi.join(", "));
}
const bp = u.find((b) => b.ticker === "BP.L");
console.log("\nBP.L: land=" + bp.land + " · bransch=" + bp.bransch + " · valuta=" + bp.valuta + " · pris=" + bp.pris + " · mcap=" + bp.marknadsKapitalMdr);
console.log("  P/E=" + bp.vardering?.pe + " · pe-nivå; rappdag-ur-paranoid: " + ((bp.kallor?.[0]?.paranoid ?? "").match(/NÄSTA RAPPORT[^;.]{0,60}/) ?? ["saknas"])[0]);
console.log("  notering (första 400): " + (bp.notering ?? "").slice(0, 400));
// Övriga energibolag i UK-närbild
console.log("\nAlla energi-celler:");
const cells = new Map();
for (const b of u) {
  const k = b.land + "/energi";
  if (b.bransch === "energi") { if (!cells.has(k)) cells.set(k, []); cells.get(k).push(b.ticker); }
}
for (const [k, v] of cells) console.log("  " + k + " => " + v.join(", "));
