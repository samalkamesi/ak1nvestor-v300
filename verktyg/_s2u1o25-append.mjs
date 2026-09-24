#!/usr/bin/env node
/**
 * s2-u1 omg25 (manifest auto-s2-1789954504687) — DATASET-DJUP +1 NIPPON STEEL:
 * Japan/material 0→1 (universumets första japanska stål-/råvarurad, US Steel-året)
 * — append läser diskens faktiska läge och lägger till ETT steg; befintliga rader
 * lämnas BIT-IDENTISKA (bevisas). Idempotent: finns 5401.T redan ⇒ ingen append.
 */
import { readFileSync, writeFileSync } from "node:fs";

const FIL = "data/portfolj-system/bolagsunivers.json";
const raderNya = JSON.parse(readFileSync("/tmp/s2u1o25/rad-ny.json", "utf8"));
const u = JSON.parse(readFileSync(FIL, "utf8"));

const innan = u.length;
const bevisFore = JSON.stringify(u);
if (u.some((b) => b.ticker === "5401.T")) {
  console.log("IDEMPOTENS: 5401.T finns redan — ingen append, läget orört.");
  process.exit(0);
}
console.log("diskens läge:", innan, "| sista 3:", u.slice(-3).map((b) => b.ticker).join(", "));

u.push(...raderNya);
const bevisEfterGamla = JSON.stringify(u.slice(0, innan));
if (bevisFore !== bevisEfterGamla) {
  throw new Error("INNEHÅLLSIDENTITET BRUTEN — befintliga rader förändrade, AVBRYTER");
}
// Universumets kanonformat = stringify-indent 2 (omg20-läxan; omg22/23/24-precedenserna intakta)
writeFileSync(FIL, JSON.stringify(u, null, 2) + "\n");
console.log(`APPEND KIRURGISK: ${innan}→${u.length} (+1), 0 befintliga rader förändrade (bevis: bit-identisk stringify prefix).`);
const efter = JSON.parse(readFileSync(FIL, "utf8"));
console.log(`READBACK: ${efter.length} rader, sista: ${efter.slice(-1).map((b) => b.ticker).join(", ")}`);
const nsc = efter.find((b) => b.ticker === "5401.T");
console.log(`5401.T-kontroll: land=${nsc.land} bransch=${nsc.bransch} valuta=${nsc.valuta} pe=${nsc.vardering.pe} pb=${nsc.vardering.pb}`);
