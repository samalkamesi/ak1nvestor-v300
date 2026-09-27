#!/usr/bin/env node
/** _r199-v173u5-sond.mjs — kollisionskontroll Nutrien (exakt: NTR/Nutrien varianter) + celläge. */
import { readFileSync } from "node:fs";
const u = JSON.parse(readFileSync("data/portfolj-system/bolagsunivers.json", "utf8"));
const traf = u.filter((b) => ["NTR", "NTR.TO", "NTR-UN"].includes(b.ticker) || /nutrien/i.test(b.namn ?? ""));
console.log(traf.length ? "TRAFF: " + traf.map((b) => b.ticker).join(",") : "INGEN KOLLISION");
console.log("total: " + u.length + " | Kanada: " + u.filter((b) => b.land === "Kanada").map((b) => b.ticker + "/" + b.bransch).join(" · ") + " | material-cellen: " + u.filter((b) => b.bransch === "material").length);
