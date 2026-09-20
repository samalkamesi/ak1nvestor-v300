#!/usr/bin/env node
/**
 * s2-u3 omg22 (manifest auto-s2-1789882502912) — DATASET-DJUP +3 USA-magneter:
 * CMCSA (kommunikation 15→16, cellens lägsta P/E 7,36) + AMT (fastighet 16→17,
 * REIT-konventionen) + CRWD (tillväxt 16→17, universumets FÖRSTA cyber-rad,
 * P/E 5 419,71 = multiplens gränsfall). PIVOT från Finland/material:
 * Suominen (SUY1V.HE) föll i Sony-fällan i sonderingen (TTM-netto −14,58 M€,
 * EPS −0,19, P/E n/a, mcap 86 M€) — METSB var redan blockerad (omg21);
 * cellen kan ej nå matta 5 med P/E-bärare ⇒ pivot dokumenterad i anspråket.
 * Syskonen: u1 UBSG.SW (Schweiz/finans) + u2 8604.T+8750.T (Japan/finans)
 * landade på disk under fönstret (219→222, deras ägo) — ride-along intakta.
 * Idempotent append: befintliga rader lämnas BIT-IDENTISKA (bevisas);
 * mina rader byggda av _s2u3o22-radbyggare.mjs (44/44 GRÖNA grinden).
 */
import { readFileSync, writeFileSync } from "node:fs";

const FIL = "data/portfolj-system/bolagsunivers.json";
const raderNya = JSON.parse(readFileSync("/tmp/s2u3o22/rader-nya.json", "utf8"));
const u = JSON.parse(readFileSync(FIL, "utf8"));

const innan = u.length;
const bevisFore = JSON.stringify(u);
for (const t of ["CMCSA", "AMT", "CRWD"]) {
  if (u.some((b) => b.ticker === t)) {
    console.log(`IDEMPOTENS: ${t} finns redan — ingen append, läget orört.`);
    process.exit(0);
  }
}
// Syskonkontrakt: diskens faktiska läge efter deras +3
const syskon = u.slice(-3).map((b) => b.ticker);
console.log("diskens läge:", innan, "| sista 3 (syskonen):", syskon.join(", "));

u.push(...raderNya);
const bevisEfterGamla = JSON.stringify(u.slice(0, innan));
if (bevisFore !== bevisEfterGamla) {
  throw new Error("INNEHÅLLSIDENTITET BRUTEN — befintliga rader förändrade, AVBRYTER");
}
// Universumets kanonformat = stringify-indent 2 (HEAD-bevisad round-trip ren;
// omg20-läxan: append KIRURGISK — indent 1 gav helbytesdiff, rättat före commit)
writeFileSync(FIL, JSON.stringify(u, null, 2) + "\n");
console.log(`APPEND KIRURGISK: ${innan}→${u.length} (+3), 0 befintliga rader förändrade (bevis: bit-identisk stringify prefix).`);
const efter = JSON.parse(readFileSync(FIL, "utf8"));
console.log(`READBACK: ${efter.length} rader, sista 3: ${efter.slice(-3).map((b) => b.ticker).join(", ")}`);
