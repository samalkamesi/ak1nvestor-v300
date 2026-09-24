#!/usr/bin/env node
/** s5-u2 o25 — andra rättningspasset: ogiltig escape + sista tre-punkt-artefakterna. */
import { readFileSync, writeFileSync } from "node:fs";
const p = "/home/ak1a/AK1/data/kurser-tillagg/roic-05-den-ekonomiska-vinsten.json";
let t = readFileSync(p, "utf8");

// 1. Ogiltig escape: strängen slutar med backslash-citat.
const skada = "ränta på ränta.\\\",";
if (t.includes(skada)) {
  t = t.replace(skada, "ränta på ränta.\",");
  console.log("escape-rättning: bäddad backslash-citat avlägsnad");
} else {
  console.log("escape-skadan hittades inte på förväntad form — söker brett:");
  for (const m of t.matchAll(/.{20}\\",/g)) console.log("  kandidat: " + m[0]);
}

writeFileSync(p, t, "utf8");
try {
  const k = JSON.parse(readFileSync(p, "utf8"));
  console.log("JSON GILTIG — kapitel: " + k.chapters.length);
  const s = JSON.stringify(k);
  for (const m of s.matchAll(/.{50}\.\.\..{50}/g)) console.log("KVARVARANDE TRE-PUNKTER >>> " + m[0] + "\n");
} catch (e) {
  console.log("FORTFARANDE OGILTIG: " + e.message);
}
