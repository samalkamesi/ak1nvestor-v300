/**
 * SVITHARMONISERING omgång 23, s6-u3 — dokumentationsplikten (L01-vakterna):
 * lägger fönstrets tre nya kedjekomponenter SIST i KOMPONENTER-listorna i
 * samtliga syskontesters widget-synk (annars underkänns "okänd kedje-
 * komponent"): svaraLokaltSektorlasning (u2) + svaraLokaltVardegrund (u3,
 * detta lager) + svaraLokaltRealekonomi (u1) — i fönstrets dokumenterade
 * ordning. Idempotent: namn som redan finns hoppas över per namn.
 */

import { readFileSync, writeFileSync, readdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const HÄR = dirname(fileURLToPath(import.meta.url));
const NYA = [
  ["svaraLokaltSektorlasning", "Omgång 23: sektorlasning (s6-u2) — 51:a motorn (svitharmoniseringens dokumentationsplikt)."],
  ["svaraLokaltVardegrund", "Omgång 23: vardegrund (s6-u3) — 52:a motorn (svitharmoniseringens dokumentationsplikt)."],
  ["svaraLokaltRealekonomi", "Omgång 23: realekonomi (s6-u1) — 53:e motorn (svitharmoniseringens dokumentationsplikt)."],
];

let andrade = 0;
let hoppade = 0;
let saknade = 0;
for (const f of readdirSync(HÄR).filter((x) => /^testa-ai-mentor-(?!vardegrund\b)[\w-]+\.mjs$/.test(x))) {
  const p = join(HÄR, f);
  let src = readFileSync(p, "utf8");
  if (!src.includes("okänd kedjekomponent")) { saknade++; continue; } // ingen kanda-lista
  const m = src.match(/(const KOMPONENTER = \[[\s\S]*?)(\n\s*\];)/);
  if (!m) { console.log("VARNING: " + f + " har kanda-vakt men ingen KOMPONENTER-array — MANUELL KOLL KRÄVS"); continue; }
  let tilagg = "";
  for (const [namn, kommentar] of NYA) {
    if (!src.includes('"' + namn + '"')) tilagg += `\n    // ${kommentar}\n    "${namn}",`;
  }
  if (!tilagg) { hoppade++; continue; }
  const ny = src.replace(/(const KOMPONENTER = \[[\s\S]*?)(\n\s*\];)/, `$1${tilagg}$2`);
  if (ny === src) { console.log("VARNING: " + f + " ersättning träffade ej"); continue; }
  writeFileSync(p, ny);
  src = ny;
  andrade++;
  console.log("harmoniserad: " + f);
}
console.log("\nSAMMANFATTNING: " + andrade + " harmoniserade · " + hoppade + " redan klara · " + saknade + " utan kanda-lista");
