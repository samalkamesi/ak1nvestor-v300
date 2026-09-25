#!/usr/bin/env node
/** _r217-u21-sond.mjs — kollisionskontroll FNT.DE/Freenet + Tyskland/kommunikation-cellens läge. */
import { readFileSync } from "node:fs";
const u = JSON.parse(readFileSync("data/portfolj-system/bolagsunivers.json", "utf8"));
const traf = u.filter((b) => ["FNT.DE", "UTDI.DE"].includes(b.ticker) || /freenet|united internet/i.test(b.namn ?? ""));
console.log(traf.length ? "TRAFF: " + traf.map((b) => b.ticker).join(",") : "FNT.DE: INGEN KOLLISION");
console.log("total: " + u.length + " | Tyskland/kommunikation: " + u.filter((b) => b.land === "Tyskland" && b.bransch === "kommunikation").map((b) => b.ticker).join(", ") + " | kommunikation-cellen: " + u.filter((b) => b.bransch === "kommunikation").length);
