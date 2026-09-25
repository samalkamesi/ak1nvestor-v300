#!/usr/bin/env node
/** _r225-u29-sond.mjs — kollisionskontroll SGE.L (primär+sekundär enligt AZN-läxan) + ARM-rad som duopartnerunderlag. */
import { readFileSync } from "node:fs";
const u = JSON.parse(readFileSync("data/portfolj-system/bolagsunivers.json", "utf8"));
console.log("total: " + u.length);
const traf = u.filter((b) => ["SGE.L", "SGE", "SGEYY"].includes(b.ticker) || /sage group|^sage\b/i.test(b.namn ?? "") || (b.kallor?.[0]?.url ?? "").includes("/lon/SGE/"));
console.log(traf.length ? "TRAFF: " + traf.map((b) => b.ticker + " (" + (b.namn ?? "").slice(0, 32) + " · " + b.land + "/" + b.bransch + ")").join(", ") : "SGE.L: INGEN KOLLISION (primär+sekundär+namn+url)");
const arm = u.find((b) => b.ticker === "ARM");
if (arm) {
  console.log("ARM (duopartner): land " + arm.land + "/" + arm.bransch + " · valuta " + arm.valuta + " · pris " + arm.pris + " · mcap " + arm.marknadsKapitalMdr);
  console.log("  vardering: " + JSON.stringify(arm.vardering));
  console.log("  notering (450): " + (arm.notering ?? "").slice(0, 450));
}
console.log("UK/teknik idag: " + u.filter((b) => b.land === "Storbritannien" && b.bransch === "teknik").map((b) => b.ticker).join(", "));
console.log("teknik-cellen totalt: " + u.filter((b) => b.bransch === "teknik").length + " | Storbritannien: " + u.filter((b) => b.land === "Storbritannien").length);
