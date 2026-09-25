#!/usr/bin/env node
/** _r214-u18-sond.mjs — kollisionskontroll 6501.T/Hitachi + Japan/industri-cellens läge. */
import { readFileSync } from "node:fs";
const u = JSON.parse(readFileSync("data/portfolj-system/bolagsunivers.json", "utf8"));
const traf = u.filter((b) => ["6501.T"].includes(b.ticker) || /^hitachi/i.test(b.namn ?? ""));
console.log(traf.length ? "TRAFF: " + traf.map((b) => b.ticker).join(",") : "6501.T: INGEN KOLLISION");
console.log("total: " + u.length + " | Japan/industri: " + u.filter((b) => b.land === "Japan" && b.bransch === "industri").map((b) => b.ticker).join(", ") + " | industri-cellen: " + u.filter((b) => b.bransch === "industri").length);
