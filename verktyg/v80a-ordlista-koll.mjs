/**
 * VÅG 80A — ordliste-kompletthetskoll.
 * 1) Alla nycklar har icke-tomma sv/en/ar.
 * 2) Platshållare ({x}) i sv finns identiskt i en+ar (annars renderas {x} rått).
 */
import { readFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const kalla = readFileSync(resolve(ROT, "src/lib/ordlista.ts"), "utf8");

const block = [
  ...kalla.matchAll(/"([a-zA-Z0-9_.]+)":\s*\{([\s\S]*?)\n\s*\}/g), // flerrad
  ...kalla.matchAll(/"([a-zA-Z0-9_.]+)":\s*\{([^{}\n]*)\}/g), // enkelrad
];
let saknade = [];
let platshållarFel = [];
let total = 0;

for (const [, nyckel, body] of block) {
  total++;
  const fält = {};
  for (const f of ["sv", "en", "ar"]) {
    // JS-sträng med escaped quotes: "((?:[^"\\]|\\.)*)"
    const m = body.match(new RegExp(f + '\\s*:\\s*"((?:[^"\\\\]|\\\\.)*)"'));
    fält[f] = m ? m[1].trim() : null;
    if (!fält[f]) saknade.push(`${nyckel}.${f}`);
  }
  if (!fält.sv || !fält.en || !fält.ar) continue;
  const ph = (s) => [...new Set([...s.matchAll(/\{([a-zA-Z0-9_]+)\}/g)].map((m) => m[1]))].sort().join(",");
  if (ph(fält.sv) !== ph(fält.en) || ph(fält.sv) !== ph(fält.ar)) {
    platshållarFel.push(`${nyckel} sv:[${ph(fält.sv)}] en:[${ph(fält.en)}] ar:[${ph(fält.ar)}]`);
  }
}

console.log(`nycklar parsade: ${total}`);
console.log(`saknade fält: ${saknade.length ? saknade.join(", ") : "INGA"}`);
console.log(`platshållar-avvikelser: ${platshållarFel.length ? platshållarFel.join(" | ") : "INGA"}`);
