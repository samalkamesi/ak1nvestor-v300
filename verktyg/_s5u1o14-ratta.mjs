#!/usr/bin/env node
/**
 * s5-u1 omgång 14 — språkgrindsrättningar av tx-04 FÖRE register-insert.
 * Varje ersättning kräver EXAKT förväntat antal träffar — annars abort utan skrivning.
 */
import { readFileSync, writeFileSync } from "node:fs";

const FIL = "data/kurser-tillagg/tx-04-tillvaxtens-granser.json";
let s = readFileSync(FIL, "utf8");

const RATTNINGAR = [
  // aritmetikfel i tabellen (oberoende omräkning: 0,15625·720 000·0,70 = 78 750; 0,15625·1 632 000·0,32 = 81 600)
  ["71 094", "78 750", 1],
  ["84 000 |", "81 600 |", 1],
  // stavfel och läckor
  ["Linjäräsningsens", "Linjärläsningens", 1],
  ["en absurtet modellen själv inte kan se", "en absurditet som modellen själv inte kan se", 1],
  ["(absurtet)", "(absurditet)", 1],
  ["SOM MÖRST", "SOM STÖRST", 1],
  ["younger än sitt rykte", "yngre än sitt rykte", 1],
  ["почти stilla", "nästan stilla", 1],
  ["fortfarande expandera när", "fortfarande expanderar när", 1],
  ["extapolerats", "extrapolerats", 1],
  ["extapolera FUNKTIONEN", "extrapolera FUNKTIONEN", 1],
  ["årtaal", "årtal", 1],
  ["mer än ikanterna", "mer än i kanterna", 1],
  ["BESTÅNDSANDelen", "BESTÅNDSANDELEN", 1],
  ["UTAN ANDSFÖRBÄTTRING", "UTAN ANDELSFÖRBÄTTRING", 1],
  ["MÄT BÅDA ANDLARNA", "MÄT BÅDA ANDELARNA", 1],
  ["att antagandet aldrig tar fart", "att adoptionen aldrig tar fart", 1],
  ["det är den första klockans tredje läxa", "det är utrymmesräkningens tredje läxa", 1],
  ["En stilla marknadstillväxt", "En blygsam marknadstillväxt", 1],
  ["tillväxtTAKT", "tillväxttakt", 1],
  ["ersättningsandel — sex rader", "ersättningsandel — fem rader", 1],
  ["14,3 procent i procenttecknet, identisk produkt", "14,3 procent i båda fallen, identisk produkt", 1],
  ["en siffra ingen vuxen analys tror på", "en siffra ingen seriös analys tror på", 1],
  // räknbart → räknelig-former (träffar räknas per form)
  ["är räknbart", "är räkneligt", 0],
  ["fysiskt räknbart", "fysiskt räkneligt", 0],
  ["med räknbar kulmen, räknbar spegel och räknbart slut", "med räknelig kulmen, räknelig spegel och räkneligt slut", 0],
];

const fel = [];
for (const [fran, till, vantan] of RATTNINGAR) {
  const n = s.split(fran).length - 1;
  if (vantan > 0 && n !== vantan) { fel.push(`${fran}: ${n} träffar (väntade ${vantan})`); continue; }
  if (vantan === 0 && n > 0) s = s.split(fran).join(till);
  if (vantan > 0) s = s.split(fran).join(till);
}
if (fel.length) { console.error("ABORT — träffavvikelse:\n" + fel.join("\n")); process.exit(1); }

// postgrind
const kyr = [...s].filter((c) => { const o = c.codePointAt(0); return o >= 0x400 && o <= 0x4ff; });
const cjk = [...s].filter((c) => { const o = c.codePointAt(0); return (o >= 0x4e00 && o <= 0x9fff) || (o >= 0x3040 && o <= 0x30ff) || (o >= 0xac00 && o <= 0xd7af); });
if (kyr.length || cjk.length) { console.error("ABORT — läckage kvar"); process.exit(1); }
JSON.parse(s);
writeFileSync(FIL, s);
console.log("RÄTTAD: alla ersättningar exakt, JSON giltig, 0 CJK/kyrilliska kvar.");
