#!/usr/bin/env node
/** _r222-u26-sond.mjs — kollisionskontroll RR.L/Rolls-Royce (primär+sekundär enligt AZN-läxan) + UK/industri-läget. */
import { readFileSync } from "node:fs";
const u = JSON.parse(readFileSync("data/portfolj-system/bolagsunivers.json", "utf8"));
const traf = u.filter((b) => ["RR.L", "RR", "RYCEY"].includes(b.ticker) || /rolls.?royce/i.test(b.namn ?? "") || (b.kallor?.[0]?.url ?? "").includes("/RR/"));
console.log(traf.length ? "TRAFF: " + traf.map((b) => b.ticker + " (" + b.namn.slice(0, 34) + ")").join(", ") : "RR.L: INGEN KOLLISION (primär+sekundär+namn+url)");
console.log("total: " + u.length + " | Storbritannien/industri: " + u.filter((b) => b.land === "Storbritannien" && b.bransch === "industri").map((b) => b.ticker).join(", ") + " | industri-cellen: " + u.filter((b) => b.bransch === "industri").length + " | Storbritannien: " + u.filter((b) => b.land === "Storbritannien").length);
const bae = u.find((b) => b.ticker === "BA.L");
if (bae) console.log("BA.L-konvention: valuta " + bae.valuta + " · pris " + bae.pris + " · mcap " + bae.marknadsKapitalMdr + " · rappdag ur paranoid: " + ((bae.kallor?.[0]?.paranoid ?? "").match(/NÄSTA RAPPORT[^;.]{0,60}/) ?? ["saknas"])[0]);
