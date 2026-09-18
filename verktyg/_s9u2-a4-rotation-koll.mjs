// _s9u2-a4-rotation-koll.mjs — verifierar A4:s FNV-1a-datumrotation OFFLINE
// (prov: 2026-09-16 ska ge SHB-B.ST = kartans prod-bevis; 2026-09-17 = ny mätvärdet)
// Läser ROTATION + AKM1_FRAGOR-antal ur route.ts (ingen tsx-körning, ren textparse).
import { readFileSync } from "node:fs";

const KALLA = "src/app/api/dagens-pass/route.ts";
const src = readFileSync(KALLA, "utf8");

const rotMatch = src.match(/const ROTATION[^=]*=\s*\[([^\]]*)\]/);
if (!rotMatch) throw new Error("ROTATION ej funnen i " + KALLA);
const ROTATION = rotMatch[1].split(",").map(s => s.trim().replace(/^["']|["']$/g, "")).filter(Boolean);

const akmMatch = src.match(/const AKM1_FRAGOR[^=]*=\s*\[([\s\S]*?)\n\]/);
const AKM1_ANTAL = akmMatch ? akmMatch[1].split(/\n/).filter(l => /^\s*\{/.test(l)).length : null;

function datumHash(datum, salt) {
  const s = `${salt}:${datum}`;
  let h = 2166136261 >>> 0;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619) >>> 0;
  }
  return h >>> 0;
}

console.log(`ROTATION (${ROTATION.length} bolag): ${ROTATION.join(", ")}`);
console.log(`AKM1_FRAGOR-antal (parentes-räknat): ${AKM1_ANTAL}`);
for (const d of ["2026-09-16", "2026-09-17"]) {
  const idx = datumHash(d, 1) % ROTATION.length;
  console.log(`${d}: ROTATION[${idx}] = ${ROTATION[idx]}`);
}
