#!/usr/bin/env node
/** _r201-v173u7-sond.mjs — kollisionskontroll CPKC (exakt: CP/CP.TO/CPKC + Canadian Pacific) + celläge. */
import { readFileSync } from "node:fs";
const u = JSON.parse(readFileSync("data/portfolj-system/bolagsunivers.json", "utf8"));
const traf = u.filter((b) => ["CP", "CP.TO", "CPKC", "CPKC.TO"].includes(b.ticker) || /canadian pacific/i.test(b.namn ?? ""));
console.log(traf.length ? "TRAFF: " + traf.map((b) => b.ticker).join(",") : "INGEN KOLLISION");
console.log("total: " + u.length + " | Kanada: " + u.filter((b) => b.land === "Kanada").map((b) => b.ticker + "/" + b.bransch).join(" · ") + " | industri: " + u.filter((b) => b.bransch === "industri").length);
