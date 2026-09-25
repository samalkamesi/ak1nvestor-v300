#!/usr/bin/env node
/** _r219-u23-sond.mjs — kollisionskontroll HEI.DE/Heidelberg Materials + Tyskland/material-cellens läge. */
import { readFileSync } from "node:fs";
const u = JSON.parse(readFileSync("data/portfolj-system/bolagsunivers.json", "utf8"));
const traf = u.filter((b) => ["HEI.DE", "HEI"].includes(b.ticker) || /heidelberg/i.test(b.namn ?? ""));
console.log(traf.length ? "TRAFF: " + traf.map((b) => b.ticker).join(",") : "HEI.DE: INGEN KOLLISION");
console.log("total: " + u.length + " | Tyskland/material: " + u.filter((b) => b.land === "Tyskland" && b.bransch === "material").map((b) => b.ticker).join(", ") + " | material-cellen: " + u.filter((b) => b.bransch === "material").length + " | Tyskland: " + u.filter((b) => b.land === "Tyskland").length);
