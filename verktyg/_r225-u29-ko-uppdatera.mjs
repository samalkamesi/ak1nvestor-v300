#!/usr/bin/env node
/** _r225-u29-ko-uppdatera.mjs — lägg UK-hälsa/UK-kommunikation i kön (rättelsens kö-uppdatering). */
import { readFileSync, writeFileSync } from "node:fs";
let pk = readFileSync("PIPELINE-KO.md", "utf8");
const fore = " · nästa: rappdagar 10-20→11-04 → v172 (DSV 10-21 · DGE 10-29 · 4503 10-30 · Kirin 11-11), Kanada/Spanien 1-grenar, eller spårrotation";
const efter = " · nästa: rappdagar 10-20→11-04 → v172 (DSV 10-21 · DGE 10-29 · 4503 10-30 · Kirin 11-11), UK-hälsa (GSK+?) och UK-kommunikation (BT+?) [rättelse r225: kvarvarande 1-grenar], Kanada/Spanien 1-grenar, eller spårrotation";
if (pk.includes(fore)) {
  pk = pk.replace(fore, efter);
  writeFileSync("PIPELINE-KO.md", pk);
  console.log("PIPELINE-KO: kön uppdaterad med UK-hälsa/UK-kommunikation");
} else {
  console.log("PIPELINE-KO: ankare ej träffat — kontrollera manuellt");
}
