#!/usr/bin/env node
/** _r221-u25-sond.mjs — kollisionskontroll AZN.L/AstraZeneca + Storbritannien/halso-cellens läge. */
import { readFileSync } from "node:fs";
const u = JSON.parse(readFileSync("data/portfolj-system/bolagsunivers.json", "utf8"));
const traf = u.filter((b) => ["AZN", "AZN.L"].includes(b.ticker) || /astrazeneca/i.test(b.namn ?? ""));
console.log(traf.length ? "TRAFF: " + traf.map((b) => b.ticker).join(",") : "AZN.L: INGEN KOLLISION");
console.log("total: " + u.length + " | Storbritannien/halso: " + u.filter((b) => b.land === "Storbritannien" && b.bransch === "halso").map((b) => b.ticker).join(", ") + " | halso-cellen: " + u.filter((b) => b.bransch === "halso").length + " | Storbritannien: " + u.filter((b) => b.land === "Storbritannien").length);
