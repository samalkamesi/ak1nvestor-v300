#!/usr/bin/env node
/** _r220-u24-sond.mjs — kollisionskontroll 4503.T/Astellas + Japan/halso-cellens läge. */
import { readFileSync } from "node:fs";
const u = JSON.parse(readFileSync("data/portfolj-system/bolagsunivers.json", "utf8"));
const traf = u.filter((b) => b.ticker === "4503.T" || /astellas/i.test(b.namn ?? ""));
console.log(traf.length ? "TRAFF: " + traf.map((b) => b.ticker).join(",") : "4503.T: INGEN KOLLISION");
console.log("total: " + u.length + " | Japan/halso: " + u.filter((b) => b.land === "Japan" && b.bransch === "halso").map((b) => b.ticker).join(", ") + " | halso-cellen: " + u.filter((b) => b.bransch === "halso").length + " | Japan: " + u.filter((b) => b.land === "Japan").length);
