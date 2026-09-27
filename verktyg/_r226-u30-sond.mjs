#!/usr/bin/env node
/** _r226-u30-sond.mjs — kollisionskontroll SN.L/SNN (Smith & Nephew) + HIK.L (Hikma) + GSK-rad som duopartnerunderlag. */
import { readFileSync } from "node:fs";
const u = JSON.parse(readFileSync("data/portfolj-system/bolagsunivers.json", "utf8"));
console.log("total: " + u.length);
const traf = u.filter((b) => ["SN.L", "SN", "SNN", "HIK.L", "HIK", "HKMPF"].includes(b.ticker) || /smith.?nephew|hikma/i.test(b.namn ?? "") || (b.kallor?.[0]?.url ?? "").includes("/lon/SN/") || (b.kallor?.[0]?.url ?? "").includes("/lon/HIK/"));
console.log(traf.length ? "TRAFF: " + traf.map((b) => b.ticker + " (" + (b.namn ?? "").slice(0, 32) + " · " + b.land + "/" + b.bransch + ")").join(", ") : "SN/HIK: INGEN KOLLISION (primär+sekundär+namn+url)");
const gsk = u.find((b) => b.ticker === "GSK.L");
if (gsk) {
  console.log("GSK.L (duopartner): valuta " + gsk.valuta + " · pris " + gsk.pris + " · mcap " + gsk.marknadsKapitalMdr + " · P/E " + gsk.vardering?.pe);
  console.log("  notering (350): " + (gsk.notering ?? "").slice(0, 350));
}
// Medtech-referenser i universumet (cellens kontrasttradition)
const medtech = u.filter((b) => /healthineers|smith|nephew|medtronic|stryker|boston scientific|cook medical/i.test(b.namn ?? "")).map((b) => b.ticker + "(" + b.land + ")");
console.log("medtech-referenser: " + (medtech.join(", ") || "inga"));
console.log("UK/hälsa idag: " + u.filter((b) => b.land === "Storbritannien" && b.bransch === "halso").map((b) => b.ticker).join(", "));
console.log("hälsa-cellen totalt: " + u.filter((b) => b.bransch === "halso").length);
