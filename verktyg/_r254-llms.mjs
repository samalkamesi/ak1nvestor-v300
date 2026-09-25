#!/usr/bin/env node
/** _r254-llms.mjs — U49: llms.txt HELREGEN 309→310 (hälsa-sektionen + alla total-jämförelser). */
import { readFileSync, writeFileSync } from "node:fs";
const FIL = "public/llms.txt";
let t = readFileSync(FIL, "utf8");
const byt = (gammal, ny, min = 1) => {
  const n = t.split(gammal).length - 1;
  if (n < min) { console.log(`FEL: "${gammal}" hittades ${n} gånger (min ${min}) — AVBRYTER`); process.exit(1); }
  t = t.split(gammal).join(ny);
  console.log(`OK (${n}st): ${gammal.slice(0, 60)} → ${ny.slice(0, 40)}…`);
};

// Totalen: 309 → 310
byt("det fasta universumet på 309 bolag i 10 branscher", "det fasta universumet på 310 bolag i 10 branscher");
byt("(309 bolag i 10 branscher", "(310 bolag i 10 branscher");
byt("n=297 av 309 bolag med mätt P/E", "n=298 av 310 bolag med mätt P/E");
byt("samtliga 309 bolag", "samtliga 310 bolag", 8);
byt("samtliga 259 bolag", "samtliga 260 bolag", 2);

// Hälsa-sektionen (rad 518)
byt(
  "- [Dataset Hälsa — branschmedianer](https://lab.ak1nvestor.com/dataset/halso): Medianerna för Hälsa i AK1A:s universum (31 bolag i branschen, rådata 2026-09-25): P/E 25,7 med kvartilspridning P25–P75 19,4–36,2 (n=29) · P/B 3,2 · EBIT-marginal 22,9 % · FCF-marginal 14,5 % · omsättningstillväxt 4,7 %. Jämförd med universumet: median P/E 20 för samtliga 310 bolag.",
  "- [Dataset Hälsa — branschmedianer](https://lab.ak1nvestor.com/dataset/halso): Medianerna för Hälsa i AK1A:s universum (32 bolag i branschen, rådata 2026-09-25): P/E 25,9 med kvartilspridning P25–P75 19,9–36,8 (n=30) · P/B 3,4 · EBIT-marginal 22,0 % · FCF-marginal 14,4 % · omsättningstillväxt 4,8 %. Jämförd med universumet: median P/E 20 för samtliga 310 bolag."
);
// Hälsa CAGR (rad 519)
byt(
  "median 8 % per år med kvartilspridning P25–P75 -2,8–25,5 % (n=28 bolag med mätt resultat-CAGR). Jämförd med universumet: median 5,9 % för samtliga 260 bolag",
  "median 9 % per år med kvartilspridning P25–P75 -2,7–25,3 % (n=29 bolag med mätt resultat-CAGR). Jämförd med universumet: median 6,0 % för samtliga 260 bolag"
);

writeFileSync(FIL, t, "utf8");
const koll = readFileSync(FIL, "utf8");
console.log("\nLÄS-TILLBAKA: '309 bolag' kvar: " + (koll.match(/309 bolag/g) || []).length + " · '310 bolag': " + (koll.match(/310 bolag/g) || []).length + " · 'samtliga 259': " + (koll.match(/samtliga 259/g) || []).length);
console.log("APOLLOHOSP nämnd: " + (koll.includes("APOLLOHOSP") ? "JA" : "NEJ — saknas!"));
