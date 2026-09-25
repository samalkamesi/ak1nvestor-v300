#!/usr/bin/env node
/** _r211-u15-sond.mjs — kollisionskontroll DHL.DE + Tyskland/industri-cellens läge. */
import { readFileSync } from "node:fs";
const u = JSON.parse(readFileSync("data/portfolj-system/bolagsunivers.json", "utf8"));
const traf = u.filter((b) => ["DHL.DE", "DPW.DE"].includes(b.ticker) || /deutsche post/i.test(b.namn ?? ""));
console.log(traf.length ? "TRAFF: " + traf.map((b) => b.ticker).join(",") : "DHL.DE: INGEN KOLLISION");
console.log("total: " + u.length + " | Tyskland/industri: " + u.filter((b) => b.land === "Tyskland" && b.bransch === "industri").map((b) => b.ticker).join(", ") + " | industri-cellen: " + u.filter((b) => b.bransch === "industri").length);
