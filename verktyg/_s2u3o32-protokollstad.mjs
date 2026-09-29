#!/usr/bin/env node
// _s2u3o32-protokollstad.mjs — engångs: städar könotis punkt 4 i protokollet
import { readFileSync, writeFileSync } from "node:fs";
const F = "data/forskning/NYTTOVALT-EUROPA-UTOKNING-U3.md";
const txt = readFileSync(F, "utf8");
const nyPunkt4 = `4. **Landaspekt-Spanien:** Spanien når 10 bolag i universumet (8 äldre + ELE
   + ENG) men spridda över branscher — spanien-landmodulen (finns ej, jfr
   frankrike våg 21) blir aktuell när en enskild branschcell når matta ≥ 5;
   Spanien×nyttovalt = 2 idag. Österrike×nyttovalt = 1 (VER.VI ensam i sitt
   land — 24:e landet, aspektsida långt borta).`;
const re = /^4\. \*\*Landaspekt-spanien:\*\*[\s\S]*?nästa behov\.$/m;
if (!re.test(txt)) { console.error("hittar inte punkt 4-blocket"); process.exit(1); }
writeFileSync(F, txt.replace(re, nyPunkt4));
console.log("punkt 4 städad");
