#!/usr/bin/env node
/** _r202-v173u8-sond.mjs — kollisionskontroll AEM (exakt: AEM/AEM.TO + Agnico) + celläge. */
import { readFileSync } from "node:fs";
const u = JSON.parse(readFileSync("data/portfolj-system/bolagsunivers.json", "utf8"));
const traf = u.filter((b) => ["AEM", "AEM.TO"].includes(b.ticker) || /agnico/i.test(b.namn ?? ""));
console.log(traf.length ? "TRAFF: " + traf.map((b) => b.ticker).join(",") : "INGEN KOLLISION");
console.log("total: " + u.length + " | Kanada: " + u.filter((b) => b.land === "Kanada").map((b) => b.ticker + "/" + b.bransch).join(" · ") + " | material: " + u.filter((b) => b.bransch === "material").length);
