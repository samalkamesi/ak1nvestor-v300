#!/usr/bin/env node
/** _r203-v173u9-sond.mjs — kollisionskontroll ABX (exakt: ABX/ABX.TO/Barrick/GOLD) + celläge. */
import { readFileSync } from "node:fs";
const u = JSON.parse(readFileSync("data/portfolj-system/bolagsunivers.json", "utf8"));
const traf = u.filter((b) => ["ABX", "ABX.TO", "GOLD"].includes(b.ticker) || /barrick/i.test(b.namn ?? ""));
console.log(traf.length ? "TRAFF: " + traf.map((b) => b.ticker).join(",") : "INGEN KOLLISION");
console.log("total: " + u.length + " | Kanada: " + u.filter((b) => b.land === "Kanada").map((b) => b.ticker + "/" + b.bransch).join(" · ") + " | material: " + u.filter((b) => b.bransch === "material").length);
