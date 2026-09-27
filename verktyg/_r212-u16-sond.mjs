#!/usr/bin/env node
/** _r212-u16-sond.mjs — kollisionskontroll 4063.T/Shin-Etsu + Japan/material-cellens läge. */
import { readFileSync } from "node:fs";
const u = JSON.parse(readFileSync("data/portfolj-system/bolagsunivers.json", "utf8"));
const traf = u.filter((b) => ["4063.T"].includes(b.ticker) || /shin-etsu/i.test(b.namn ?? ""));
console.log(traf.length ? "TRAFF: " + traf.map((b) => b.ticker).join(",") : "4063.T: INGEN KOLLISION");
console.log("total: " + u.length + " | Japan/material: " + u.filter((b) => b.land === "Japan" && b.bransch === "material").map((b) => b.ticker).join(", ") + " | material-cellen: " + u.filter((b) => b.bransch === "material").length + " | Japan totalt: " + u.filter((b) => b.land === "Japan").length);
