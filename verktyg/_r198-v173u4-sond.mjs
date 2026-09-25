#!/usr/bin/env node
/** _r198-v173u4-sond.mjs — kollisionskontroll Rogers (exakt ticker-match: RCI-B/RCI.B/RCI/RCU varianter). */
import { readFileSync } from "node:fs";
const u = JSON.parse(readFileSync("data/portfolj-system/bolagsunivers.json", "utf8"));
const varianter = ["RCI-B", "RCI.B", "RCI", "RCU", "RCU-B", "ROGERS"];
for (const v of varianter) {
  const traf = u.filter((b) => b.ticker === v || (b.namn ?? "").toLowerCase().includes("rogers"));
  if (traf.length) console.log("TRAFF: " + v + " → " + traf.map((b) => b.ticker + " (" + b.namn + ")").join(", "));
}
console.log("total: " + u.length + " | Kanada: " + u.filter((b) => b.land === "Kanada").map((b) => b.ticker + "/" + b.bransch).join(" · "));
console.log("INGEN KOLLISION" );
