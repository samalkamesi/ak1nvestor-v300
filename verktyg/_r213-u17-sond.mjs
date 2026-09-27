#!/usr/bin/env node
/** _r213-u17-sond.mjs — kollisionskontroll 4503.T/Astellas + Japan/halso-cellens läge. */
import { readFileSync } from "node:fs";
const u = JSON.parse(readFileSync("data/portfolj-system/bolagsunivers.json", "utf8"));
const traf = u.filter((b) => ["4503.T"].includes(b.ticker) || /astellas/i.test(b.namn ?? ""));
console.log(traf.length ? "TRAFF: " + traf.map((b) => b.ticker).join(",") : "4503.T: INGEN KOLLISION");
console.log("total: " + u.length + " | Japan/halso: " + u.filter((b) => b.land === "Japan" && b.bransch === "halso").map((b) => b.ticker).join(", ") + " | halso-cellen: " + u.filter((b) => b.bransch === "halso").length);
