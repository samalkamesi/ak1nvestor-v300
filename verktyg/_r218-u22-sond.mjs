#!/usr/bin/env node
/** _r218-u22-sond.mjs — kollisionskontroll AT1.DE/Aroundtown + Tyskland/fastighet-cellens läge. */
import { readFileSync } from "node:fs";
const u = JSON.parse(readFileSync("data/portfolj-system/bolagsunivers.json", "utf8"));
const traf = u.filter((b) => ["AT1.DE", "AT1"].includes(b.ticker) || /aroundtown/i.test(b.namn ?? ""));
console.log(traf.length ? "TRAFF: " + traf.map((b) => b.ticker).join(",") : "AT1.DE: INGEN KOLLISION");
console.log("total: " + u.length + " | Tyskland/fastighet: " + u.filter((b) => b.land === "Tyskland" && b.bransch === "fastighet").map((b) => b.ticker).join(", ") + " | fastighet-cellen: " + u.filter((b) => b.bransch === "fastighet").length + " | Tyskland: " + u.filter((b) => b.land === "Tyskland").length);
