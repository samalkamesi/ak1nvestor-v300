#!/usr/bin/env node
/** _r197-v173u3-telus-rattning.mjs — paranoid-rättning: "Kanada 4→5" → "Kanada 3→4" (skriptets mätning: RY+CNQ+BCE = 3 före, +TELUS = 4). */
import { readFileSync, writeFileSync } from "node:fs";
const UNI = "data/portfolj-system/bolagsunivers.json";
const raw = readFileSync(UNI, "utf8");
if (!raw.includes("Kanada 4→5")) { console.log("INGEN ATT RÄTTA (redan korrekt)"); process.exit(0); }
const ny = raw.replace("Kanada 4→5", "Kanada 3→4");
writeFileSync(UNI, ny);
const el = JSON.parse(readFileSync(UNI, "utf8"));
const t = el.find((b) => b.ticker === "TELUS");
console.log("RÄTTAD: Kanada 3→4 · total " + el.length + " · TELUS kvar: " + !!t + " · paranoid bär rättning: " + (t.kallor[0].paranoid.includes("Kanada 3→4")));
