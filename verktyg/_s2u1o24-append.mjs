#!/usr/bin/env node
/**
 * s2-u1 omg24 (manifest auto-s2-1789927508250) — DATASET-DJUP +1 BCE:
 * Kanada/kommunikation 0→1 (Bell Canada, universumets första rena TSX/CAD-rad)
 * — universum 231→232. Syskon u2/u3 dispatchas parallellt (väljer själva) —
 * append läser diskens faktiska läge och lämnar alla befintliga rader
 * BIT-IDENTISKA (bevisas). Idempotent: finns BCE redan ⇒ ingen append.
 */
import { readFileSync, writeFileSync } from "node:fs";

const FIL = "data/portfolj-system/bolagsunivers.json";
const raderNya = JSON.parse(readFileSync("/tmp/s2u1o24/rader-nya.json", "utf8"));
const u = JSON.parse(readFileSync(FIL, "utf8"));

const innan = u.length;
const bevisFore = JSON.stringify(u);
if (u.some((b) => b.ticker === "BCE")) {
  console.log("IDEMPOTENS: BCE finns redan — ingen append, läget orört.");
  process.exit(0);
}
console.log("diskens läge:", innan, "| sista 3:", u.slice(-3).map((b) => b.ticker).join(", "));

u.push(...raderNya);
const bevisEfterGamla = JSON.stringify(u.slice(0, innan));
if (bevisFore !== bevisEfterGamla) {
  throw new Error("INNEHÅLLSIDENTITET BRUTEN — befintliga rader förändrade, AVBRYTER");
}
// Universumets kanonformat = stringify-indent 2 (omg20-läxan; omg22/23-precedenserna intakta)
writeFileSync(FIL, JSON.stringify(u, null, 2) + "\n");
console.log(`APPEND KIRURGISK: ${innan}→${u.length} (+1), 0 befintliga rader förändrade (bevis: bit-identisk stringify prefix).`);
const efter = JSON.parse(readFileSync(FIL, "utf8"));
console.log(`READBACK: ${efter.length} rader, sista: ${efter.slice(-1).map((b) => b.ticker).join(", ")}`);
const bce = efter.find((b) => b.ticker === "BCE");
console.log(`BCE-kontroll: land=${bce.land} bransch=${bce.bransch} valuta=${bce.valuta} pe=${bce.vardering.pe} pb=${bce.vardering.pb}`);
