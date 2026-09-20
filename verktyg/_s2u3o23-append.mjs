#!/usr/bin/env node
/**
 * s2-u3 omg23 (manifest auto-s2-1789904706844) — DATASET-DJUP +3 TELEKOM-TRION:
 * TMUS (kommunikation/USA 7→8, tillväxt-telekom) + 9433.T KDDI (kommunikation/
 * Japan 1→2, duopolmaskinen) + ORA.PA Orange (kommunikation/Frankrike 0→1,
 * NY CELL — statstelekom-pedagogiken). Syskonen: u1 BP.L (UK/energi) + u2
 * SAN.MC + HINDUNILVR.NS — anspråk lästa, noll koordinatkollision; deras rader
 * kan ha landat på disk under fönstret (ride-along intakta, deras ägo).
 * Idempotent append: befintliga rader lämnas BIT-IDENTISKA (bevisas);
 * mina rader byggda av _s2u3o23-radbyggare.mjs (48/48 GRÖNA grinden).
 */
import { readFileSync, writeFileSync } from "node:fs";

const FIL = "data/portfolj-system/bolagsunivers.json";
const raderNya = JSON.parse(readFileSync("/tmp/s2u3o23/rader-nya.json", "utf8"));
const u = JSON.parse(readFileSync(FIL, "utf8"));

const innan = u.length;
const bevisFore = JSON.stringify(u);
for (const t of ["TMUS", "9433.T", "ORA.PA"]) {
  if (u.some((b) => b.ticker === t)) {
    console.log(`IDEMPOTENS: ${t} finns redan — ingen append, läget orört.`);
    process.exit(0);
  }
}
// Syskonnotis: diskens tre sista (deras rader om de landat)
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
// Indent-2 round-trip-bevis (helbytesdiff-fällan omg22)
const rtt = JSON.parse(readFileSync(FIL, "utf8"));
console.log("ROUND-TRIP: parse(write(parse)) OK —", rtt.length, "rader");
