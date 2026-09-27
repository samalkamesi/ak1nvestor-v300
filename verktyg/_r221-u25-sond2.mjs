#!/usr/bin/env node
/** _r221-u25-sond2.mjs — kollisionskontroll DSV + Danmark/industri-cellens läge (efter AZN-kollisionen). */
import { readFileSync } from "node:fs";
const u = JSON.parse(readFileSync("data/portfolj-system/bolagsunivers.json", "utf8"));
const traf = u.filter((b) => ["DSV.CO", "DSV"].includes(b.ticker) || /\bdsv\b/i.test(b.namn ?? ""));
console.log(traf.length ? "TRAFF: " + traf.map((b) => b.ticker + " (" + b.namn.slice(0, 30) + ")").join(",") : "DSV.CO: INGEN KOLLISION");
console.log("total: " + u.length + " | Danmark/industri: " + u.filter((b) => b.land === "Danmark" && b.bransch === "industri").map((b) => b.ticker).join(", ") + " | Danmark: " + u.filter((b) => b.land === "Danmark").length + " | industri-cellen: " + u.filter((b) => b.bransch === "industri").length);
const ma = u.find((b) => b.ticker === "MAERSK-B.CO");
if (ma) console.log("MAERSK-B.co-konvention: valuta " + ma.valuta + " · pris " + ma.pris + " · mcap " + ma.marknadsKapitalMdr + " · pe " + ma.vardering?.pe + " · fcfY " + ma.vardering?.fcfYield);
