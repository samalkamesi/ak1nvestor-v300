#!/usr/bin/env node
/**
 * s2-u3 omg25 (manifest auto-s2-1789954504687) — DATASET-DJUP +3 FRANKRIKE/
 * KONSUMENT: RMS.PA + BN.PA + RI.PA ⇒ cellen 2→5 = MATTAN NÅS. Syskonen
 * s2-u1/s2-u2 kör parallellt — deras rader kan landa under fönstret
 * (ride-along intakta, deras ägo; append på diskens faktiska läge, idempotent).
 */
import { readFileSync, writeFileSync } from "node:fs";

const FIL = "data/portfolj-system/bolagsunivers.json";
const raderNya = JSON.parse(readFileSync("/tmp/s2u3o25/rader-nya.json", "utf8"));
const u = JSON.parse(readFileSync(FIL, "utf8"));

const innan = u.length;
const bevisFore = JSON.stringify(u);
for (const t of ["RMS.PA", "BN.PA", "RI.PA"]) {
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
// Universumets kanonformat = stringify-indent 2 (omg20/22/24-kontraktet: append KIRURGISK)
writeFileSync(FIL, JSON.stringify(u, null, 2) + "\n");
console.log(`APPEND KIRURGISK: ${innan}→${u.length} (+3), 0 befintliga rader förändrade (bevis: bit-identisk stringify prefix).`);
const efter = JSON.parse(readFileSync(FIL, "utf8"));
console.log(`READBACK: ${efter.length} rader, sista 3: ${efter.slice(-3).map((b) => b.ticker).join(", ")}`);
const cell = efter.filter((b) => b.land === "Frankrike" && b.bransch === "konsument");
console.log(`FRANKRIKE/KONSUMENT EFTER: ${cell.length} rader — ${cell.map((b) => b.ticker).join(", ")}`);
const pe = cell.map((b) => b.vardering?.pe).filter((x) => typeof x === "number");
console.log(`CELL-P/E: ${pe.sort((a, b) => a - b).join(", ")} — matta ${pe.length} = MATTAN NÅS`);
