#!/usr/bin/env node
/** _r224-u28-bpkoll.mjs — BP.L:s valuta/seriekonvention (USD-rapportvaluta + GBX-noting) som DGE-mall. */
import { readFileSync } from "node:fs";
const u = JSON.parse(readFileSync("data/portfolj-system/bolagsunivers.json", "utf8"));
const bp = u.find((b) => b.ticker === "BP.L");
console.log("BP.L valuta: " + bp.valuta + " · pris: " + bp.pris + " · mcap: " + bp.marknadsKapitalMdr);
console.log("serier.ar: " + JSON.stringify(bp.serier.ar));
console.log("serier.omsattning (första/sista): " + bp.serier.omsattning[0] + " … " + bp.serier.omsattning.at(-1));
console.log("serier.fcf: " + JSON.stringify(bp.serier.fcf));
console.log("tillvaxt: " + JSON.stringify(bp.tillvaxt));
console.log("vardering: " + JSON.stringify(bp.vardering));
console.log("notering (500): " + (bp.notering ?? "").slice(0, 500));
