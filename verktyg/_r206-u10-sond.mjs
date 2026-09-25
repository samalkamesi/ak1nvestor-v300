#!/usr/bin/env node
/** _r206-u10-sond.mjs — kollisionskontroll U10-kandidaterna (CLN.MC/REE.MC/BT.L) + spanien/UK-cellers läge. */
import { readFileSync } from "node:fs";
const u = JSON.parse(readFileSync("data/portfolj-system/bolagsunivers.json", "utf8"));
const kand = ["CLN.MC", "REE.MC", "BT.L"];
for (const tk of kand) {
  const traf = u.find((b) => b.ticker === tk);
  console.log(`${tk}: ${traf ? "UPPTAGEN" : "ledig"}`);
}
console.log("total: " + u.length + " | Spanien: " + u.filter((b) => b.land === "Spanien").map((b) => b.ticker + "/" + b.bransch).join(" · "));
console.log("UK kommunikation: " + u.filter((b) => b.land === "Storbritannien" && b.bransch === "kommunikation").map((b) => b.ticker).join(", "));
