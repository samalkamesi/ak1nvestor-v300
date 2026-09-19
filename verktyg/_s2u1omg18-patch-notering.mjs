#!/usr/bin/env node
/**
 * s2-u1 omg18 — SUPERLATIVPATCH av 9983.T-radens notering + paranoid i
 * bolagsunivers.json (omg14-regeln: superlativtest FÖRE leverans — grunden
 * fångade fyra överdrivna formuleringar; alla ersätts med verifierbara).
 * Kirurgisk textreplace: filen parse:as efteråt (giltighetsbevis), radantal
 + oförändrat, ALLA andra rader byte-identiska (innehållsintegritetsbevis).
 */
import { readFileSync, writeFileSync } from "node:fs";

const FIL = "data/portfolj-system/bolagsunivers.json";
const fore = readFileSync(FIL, "utf8");
const uFore = JSON.parse(fore);

const BYT = [
  [
    "ROIC 37,51 % mot WACC 6,53 % = +30,98 pp — bredaste klyftan i universumet bland bolag med bägge fält mätta (8035:s +20,5 · ABEV:s +19,4 · FCX:s +1,6 för jämförelsetrappan): koncernen tjänar 5,7× sin kapitalkostnad per år.",
    "ROIC 37,51 % mot WACC 6,53 % = +30,98 pp — ROIC-rank 17/176 i universumet (jämförelsetrappan 8035:s gap +20,5 · ABEV:s +19,4 · FCX:s +1,6): koncernen tjänar 5,7× sin kapitalkostnad per år.",
  ],
  [
    "Yanai-familjen äger 38,77 % (insiders-andelen är universumets högsta bland de stora länderraderna; grundarblocket är själva styrningen)",
    "Yanai-familjen äger 38,77 % (källans insiders-andel; grundarblocket är själva styrningen)",
  ],
  [
    "universumjämförelseraden: konsumentgrenens median P/E 18,1 mot FR 40,0 = grenens dyraste varumärkeskapital efter LVMH-blocket. P/B 7,39 — grenens högsta efter ITX.",
    "universumjämförelseraden: konsumentgrenens median P/E 18,1 mot FR 40,0 — grenens näst dyraste efter Ferrari (RACE 41,8) och över grenens P75 22,2. P/B 7,39 = grenens sjätte högsta (RACE 18,7 · KO 10,6 · ITX 9,3 · PEP 8,4 · HM 8,1).",
  ],
  ["beta 0,45 (5 år — HM/ITX-stabilitetsklassen)", "beta 0,45 (5 år)"],
  ["STABILITET: beta 0,45 (HM-klassens försvarlighet)", "STABILITET: beta 0,45 (5 år)"],
  [
    "nästa rapp torsdagen 2026-10-08 (universumets första oktober-rappdag, före GS 10-13)",
    "nästa rapp torsdagen 2026-10-08 (bland universumets tidigaste oktober-rappdagar; GS rapporterar 10-13)",
  ],
  [
    "52-v 44 380–88 690 (+42,25 % — kursen −23,6 % från julitoppen 73 740 efter Q3-rallyt)",
    "52-v 44 380–88 690 (+42,25 % — kursen −23,6 % från 52v-toppen 88 690 efter Q3-rallyt +45,7 %)",
  ],
  [
    "split 3:1 2023-02-27 (ETR-aktieklasshistorik noterar även 10:1 aug-1999-halvering etc. — ej relevanta här)",
    "split 3:1 2023-02-27 (källans corporate actions)",
  ],
];

let txt = fore;
for (const [gammal, ny] of BYT) {
  const n = txt.split(gammal).length - 1;
  if (n !== 1) {
    console.error(`ABORT: frasen hittad ${n} gånger (ska vara exakt 1): ${gammal.slice(0, 60)}…`);
    process.exit(1);
  }
  txt = txt.replace(gammal, ny);
  console.log(`BYTE ✓ ${gammal.slice(0, 48)}…`);
}

const uEfter = JSON.parse(txt); // giltighetsbevis
if (uEfter.length !== uFore.length) throw new Error("radantal ändrat!");
let diff = 0;
for (let i = 0; i < uFore.length; i++) {
  if (JSON.stringify(uFore[i]) !== JSON.stringify(uEfter[i])) {
    if (uFore[i].ticker === "9983.T") diff++;
    else throw new Error("annan rad än 9983.T förändrad: " + uFore[i].ticker);
  }
}
if (diff !== 1) throw new Error("9983-raden förändrad " + diff + " gånger (ska vara 1)");
writeFileSync(FIL, txt);
console.log(`PATCH: ${BYT.length} fraser, radantal ${uFore.length}→${uEfter.length}, ENBART 9983.T-raden förändrad`);
