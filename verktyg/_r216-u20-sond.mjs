#!/usr/bin/env node
/** _r216-u20-sond.mjs — kollisionskontroll EOAN.DE/E.ON + Tyskland/energi-cellens läge. */
import { readFileSync } from "node:fs";
const u = JSON.parse(readFileSync("data/portfolj-system/bolagsunivers.json", "utf8"));
const traf = u.filter((b) => ["EOAN.DE"].includes(b.ticker) || /^e\.on/i.test(b.namn ?? ""));
console.log(traf.length ? "TRAFF: " + traf.map((b) => b.ticker).join(",") : "EOAN.DE: INGEN KOLLISION");
console.log("total: " + u.length + " | Tyskland/energi: " + u.filter((b) => b.land === "Tyskland" && b.bransch === "energi").map((b) => b.ticker).join(", ") + " | energi-cellen: " + u.filter((b) => b.bransch === "energi").length);
