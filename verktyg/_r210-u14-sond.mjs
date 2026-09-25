#!/usr/bin/env node
/** _r210-u14-sond.mjs — kollisionskontroll SHL.DE + Tyskland/halso-cellens läge. */
import { readFileSync } from "node:fs";
const u = JSON.parse(readFileSync("data/portfolj-system/bolagsunivers.json", "utf8"));
const traf = u.filter((b) => ["SHL.DE"].includes(b.ticker) || /healthineers/i.test(b.namn ?? ""));
console.log(traf.length ? "TRAFF: " + traf.map((b) => b.ticker).join(",") : "SHL.DE: INGEN KOLLISION");
console.log("total: " + u.length + " | Tyskland/halso: " + u.filter((b) => b.land === "Tyskland" && b.bransch === "halso").map((b) => b.ticker).join(", ") + " | halso-cellen: " + u.filter((b) => b.bransch === "halso").length);
