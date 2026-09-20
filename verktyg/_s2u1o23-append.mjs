#!/usr/bin/env node
/**
 * s2-u1 omg23 (manifest auto-s2-1789904706844) — DATASET-DJUP +1 BP.L:
 * Storbritannien/energi 0→1 (supermajor-kvintetten komplett) — universum 225→226.
 * Syskon u2/u2 dispatchas parallellt (väljer själva) — append läser diskens
 * faktiska läge och lämnar alla befintliga rader BIT-IDENTISKA (bevisas).
 * Idempotent: finns BP.L redan ⇒ ingen append, läget orört.
 */
import { readFileSync, writeFileSync } from "node:fs";

const FIL = "data/portfolj-system/bolagsunivers.json";
const raderNya = JSON.parse(readFileSync("/tmp/s2u1o23/rader-nya.json", "utf8"));
const u = JSON.parse(readFileSync(FIL, "utf8"));

const innan = u.length;
const bevisFore = JSON.stringify(u);
if (u.some((b) => b.ticker === "BP.L")) {
  console.log("IDEMPOTENS: BP.L finns redan — ingen append, läget orört.");
  process.exit(0);
}
console.log("diskens läge:", innan, "| sista 3:", u.slice(-3).map((b) => b.ticker).join(", "));

u.push(...raderNya);
const bevisEfterGamla = JSON.stringify(u.slice(0, innan));
if (bevisFore !== bevisEfterGamla) {
  throw new Error("INNEHÅLLSIDENTITET BRUTEN — befintliga rader förändrade, AVBRYTER");
}
// Universumets kanonformat = stringify-indent 2 (omg20-läxan; omg22-precedensen intakt)
writeFileSync(FIL, JSON.stringify(u, null, 2) + "\n");
console.log(`APPEND KIRURGISK: ${innan}→${u.length} (+1), 0 befintliga rader förändrade (bevis: bit-identisk stringify prefix).`);
const efter = JSON.parse(readFileSync(FIL, "utf8"));
console.log(`READBACK: ${efter.length} rader, sista: ${efter.slice(-1).map((b) => b.ticker).join(", ")}`);
const bp = efter.find((b) => b.ticker === "BP.L");
console.log(`BP.L-kontroll: land=${bp.land} bransch=${bp.bransch} valuta=${bp.valuta} pe=${bp.vardering.pe} pb=${bp.vardering.pb}`);
