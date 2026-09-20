#!/usr/bin/env node
/**
 * s2-u3 omg24 (manifest auto-s2-1789927508250) — DATASET-DJUP +3 JAPAN/
 * KOMMUNIKATION: 9432.T NTT + 9434.T SoftBank Corp + 4751.T CyberAgent ⇒
 * cellen 2→5 = MATTAN NÅS. Syskonen s2-u1 (+1) + s2-u2 (+2) kör parallellt —
 * deras rader kan landa under fönstret (ride-along intakta, deras ägo;
 * append på diskens faktiska läge, idempotent).
 */
import { readFileSync, writeFileSync } from "node:fs";

const FIL = "data/portfolj-system/bolagsunivers.json";
const raderNya = JSON.parse(readFileSync("/tmp/s2u3o24/rader-nya.json", "utf8"));
const u = JSON.parse(readFileSync(FIL, "utf8"));

const innan = u.length;
const bevisFore = JSON.stringify(u);
for (const t of ["9432.T", "9434.T", "4751.T"]) {
  if (u.some((b) => b.ticker === t)) {
    console.log(`IDEMPOTENS: ${t} finns redan — ingen append, läget orört.`);
    process.exit(0);
  }
}
console.log("diskens läge:", innan, "| sista 3 på disk:", u.slice(-3).map((b) => b.ticker).join(", "));

u.push(...raderNya);
const bevisEfterGamla = JSON.stringify(u.slice(0, innan));
if (bevisFore !== bevisEfterGamla) {
  throw new Error("INNEHÅLLSIDENTITET BRUTEN — befintliga rader förändrade, AVBRYTER");
}
// Universumets kanonformat = stringify-indent 2 (omg20/22-läxan: append KIRURGISK)
writeFileSync(FIL, JSON.stringify(u, null, 2) + "\n");
console.log(`APPEND KIRURGISK: ${innan}→${u.length} (+3), 0 befintliga rader förändrade (bevis: bit-identisk stringify prefix).`);
const efter = JSON.parse(readFileSync(FIL, "utf8"));
console.log(`READBACK: ${efter.length} rader, sista 3: ${efter.slice(-3).map((b) => b.ticker).join(", ")}`);
const japan = efter.filter((b) => b.land === "Japan" && b.bransch === "kommunikation");
console.log(`JAPAN/KOMMUNIKATION EFTER: ${japan.length} rader — ${japan.map((b) => b.ticker).join(", ")}`);
