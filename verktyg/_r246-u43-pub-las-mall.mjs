#!/usr/bin/env node
/** _r246-u43-pub-las-mall.mjs — skriv ut SGO.PA:s (senaste normala inlägget) fältvärden som mall för PUB-radens skal-fält. */
import { readFileSync } from "node:fs";
const u = JSON.parse(readFileSync("data/portfolj-system/bolagsunivers.json", "utf8"));
const sgo = u.find((b) => b.ticker === "SGO.PA");
console.log(JSON.stringify({ tillvaxt: sgo.tillvaxt, stabilitet: sgo.stabilitet, aterkop: sgo.aterkop, moat: sgo.moat, vardering: sgo.vardering, golv: sgo.golv, serierNycklar: Object.keys(sgo.serier), serierAr: sgo.serier.ar, hamtat: sgo.hamtat }, null, 1));
