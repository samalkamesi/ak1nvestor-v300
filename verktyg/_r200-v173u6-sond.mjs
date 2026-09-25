#!/usr/bin/env node
/** _r200-v173u6-sond.mjs — kollisionskontroll CNR (exakt: CNR/CNR.TO/CNI + Canadian National) + celläge. */
import { readFileSync } from "node:fs";
const u = JSON.parse(readFileSync("data/portfolj-system/bolagsunivers.json", "utf8"));
const traf = u.filter((b) => ["CNR", "CNR.TO", "CNI", "CNI.NYSE"].includes(b.ticker) || /canadian national/i.test(b.namn ?? ""));
console.log(traf.length ? "TRAFF: " + traf.map((b) => b.ticker).join(",") : "INGEN KOLLISION");
console.log("total: " + u.length + " | Kanada: " + u.filter((b) => b.land === "Kanada").map((b) => b.ticker + "/" + b.bransch).join(" · ") + " | industri-cellen: " + u.filter((b) => b.bransch === "industri").length);
