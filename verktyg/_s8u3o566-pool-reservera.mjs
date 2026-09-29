#!/usr/bin/env node
// _s8u3o566-pool-reservera.mjs — reserverar o566 i protokollnummerpoolen
// (_s8u2o565-pool-reservera.mjs:s mönster; kontroll: nummer fritt + idempotens)
import { readFileSync, writeFileSync } from "node:fs";

const POOL = "data/vakten/protokollnummer.json";
const pool = JSON.parse(readFileSync(POOL, "utf8"));

const befintligt = pool.poster.find((p) => p.nummer === "o566");
if (befintligt) {
  console.log("o566 redan reserverat av " + befintligt.agare + " — IDEMPOTENT");
  process.exit(0);
}

pool.poster.push({
  nummer: "o566",
  agare: "s8-u3",
  manifest: "auto-s8-1790679320397",
  titel: "kvalitetsvåg: INTERNA döda länkar återmätning efter 8 dagars tillväxt (Q3-paket + 6 kurser + 5 datasetbolag + soft-404-kur sedan 09-21:s 0-fynd) + gåva till o565/o570: nasdaq.com-botväggens kontrollerade UA-bevis (verktygets UA tarpits HEAD+GET 15 s, webbläsar-UA 200/4,7 s)",
  ts: Date.now(),
  status: "reserverat",
});
writeFileSync(POOL, JSON.stringify(pool, null, 2) + "\n");
console.log("o566 reserverat för s8-u3 (manifest auto-s8-1790679320397)");
