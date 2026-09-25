#!/usr/bin/env node
/** _r215-u19-sond.mjs — kollisionskontroll 9531.T/Tokyo Gas + Japan/energi-cellens läge. */
import { readFileSync } from "node:fs";
const u = JSON.parse(readFileSync("data/portfolj-system/bolagsunivers.json", "utf8"));
const traf = u.filter((b) => ["9531.T"].includes(b.ticker) || /tokyo gas/i.test(b.namn ?? ""));
console.log(traf.length ? "TRAFF: " + traf.map((b) => b.ticker).join(",") : "9531.T: INGEN KOLLISION");
console.log("total: " + u.length + " | Japan/energi: " + u.filter((b) => b.land === "Japan" && b.bransch === "energi").map((b) => b.ticker).join(", ") + " | energi-cellen: " + u.filter((b) => b.bransch === "energi").length);
