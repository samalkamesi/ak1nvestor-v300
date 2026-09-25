#!/usr/bin/env node
/** _r256-llms.mjs — U50: llms.txt HELREGEN 310→311 (industri-sektionen + alla total-jämförelser). */
import { readFileSync, writeFileSync } from "node:fs";
const FIL = "public/llms.txt";
let t = readFileSync(FIL, "utf8");
const byt = (gammal, ny, min = 1) => {
  const n = t.split(gammal).length - 1;
  if (n < min) { console.log(`FEL: "${gammal}" hittades ${n} gånger (min ${min}) — AVBRYTER`); process.exit(1); }
  t = t.split(gammal).join(ny);
  console.log(`OK (${n}st): ${gammal.slice(0, 60)} → ${ny.slice(0, 40)}…`);
};

// Totalen: 310 → 311
byt("det fasta universumet på 310 bolag i 10 branscher", "det fasta universumet på 311 bolag i 10 branscher");
byt("(310 bolag i 10 branscher", "(311 bolag i 10 branscher");
byt("totalt median P/E 20 (n=298 av 310 bolag med mätt P/E)", "totalt median P/E 20,1 (n=299 av 311 bolag med mätt P/E)");
byt("median P/E 20 för samtliga 310 bolag", "median P/E 20,1 för samtliga 311 bolag", 10);
byt("median 5,9 % för samtliga 260 bolag", "median 6,1 % för samtliga 261 bolag", 9);
byt("median 6,0 % för samtliga 260 bolag", "median 6,1 % för samtliga 261 bolag");

// Industri-sektionen — branschmedianer (rad 520)
byt(
  "(29 bolag i branschen, rådata 2026-09-25): P/E 28,2 med kvartilspridning P25–P75 20,9–35,4 (n=29) · P/B 4,6 · EBIT-marginal 13,6 % · FCF-marginal 11,3 % · omsättningstillväxt 5,2 %",
  "(30 bolag i branschen, rådata 2026-09-25): P/E 28,2 med kvartilspridning P25–P75 21,2–35,1 (n=30) · P/B 4,7 · EBIT-marginal 13,8 % · FCF-marginal 11,3 % · omsättningstillväxt 5,2 %"
);
// Industri CAGR (rad 521)
byt(
  "median 4 % per år med kvartilspridning P25–P75 -2,5–15,2 % (n=23 bolag med mätt resultat-CAGR)",
  "median 4 % per år med kvartilspridning P25–P75 -1,6–16 % (n=24 bolag med mätt resultat-CAGR)"
);

writeFileSync(FIL, t, "utf8");
const koll = readFileSync(FIL, "utf8");
console.log("\nLÄS-TILLBAKA: '310 bolag' kvar: " + (koll.match(/310 bolag/g) || []).length + " · '311 bolag': " + (koll.match(/311 bolag/g) || []).length + " · 'samtliga 260': " + (koll.match(/samtliga 260/g) || []).length + " · 'samtliga 261': " + (koll.match(/samtliga 261/g) || []).length);
console.log("gamla 5,9-totaler kvar: " + (koll.match(/median 5,9 % för samtliga/g) || []).length);
