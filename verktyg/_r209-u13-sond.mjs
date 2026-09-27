#!/usr/bin/env node
/** _r209-u13-sond.mjs — kollisionskontroll SAP + Tysklands celler (vem bär teknik-grenen?). */
import { readFileSync } from "node:fs";
const u = JSON.parse(readFileSync("data/portfolj-system/bolagsunivers.json", "utf8"));
const sap = u.filter((b) => ["SAP", "SAP.DE"].includes(b.ticker) || /^SAP SE/i.test(b.namn ?? ""));
console.log(sap.length ? "TRAFF: " + sap.map((b) => b.ticker).join(",") : "SAP: INGEN KOLLISION");
console.log("total: " + u.length + " | Tyskland (" + u.filter((b) => b.land === "Tyskland").length + "): " + u.filter((b) => b.land === "Tyskland").map((b) => b.ticker + "/" + b.bransch).join(" · "));
