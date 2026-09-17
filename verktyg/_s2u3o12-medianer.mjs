#!/usr/bin/env node
// s2-u3 omg12: medianer + kvartiler + universumjämförelse enligt
// src/lib/dataset-medianer.ts + dataset-aspekter-kontrakt.ts (median:
// mittersta-par-medel; percentil: linjär interpolation (n-1)·p; runda1).
import { readFileSync } from "node:fs";
const u = JSON.parse(readFileSync("/home/ak1a/AK1/data/portfolj-system/bolagsunivers.json", "utf8"));

const median = (v) => { const r = v.filter(Number.isFinite); if (!r.length) return null; const s = [...r].sort((a, b) => a - b); const m = Math.floor(s.length / 2); return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2; };
const percentil = (v, p) => { const r = v.filter(Number.isFinite); if (!r.length) return null; const s = [...r].sort((a, b) => a - b); const pos = (s.length - 1) * p; const lo = Math.floor(pos), hi = Math.ceil(pos); return lo === hi ? s[lo] : s[lo] + (pos - lo) * (s[hi] - s[lo]); };
const r1 = (x) => Math.round(x * 10) / 10;
const stat = (v, proc) => { const r = v.filter(Number.isFinite); const o = (x) => x === null ? null : r1(proc ? x * 100 : x); return { n: r.length, median: o(median(r)), p25: o(percentil(r, 0.25)), p75: o(percentil(r, 0.75)) }; };
const hamta = { pe: (b) => b.vardering?.pe, pb: (b) => b.vardering?.pb, ebit: (b) => b.lonksamhet?.ebitMarginal, fcf: (b) => b.lonksamhet?.fcfMarginal, tillvaxt: (b) => b.tillvaxt?.omsattningTillvaxtTTM, resCagr: (b) => b.tillvaxt?.resultatCAGR5ar };

const branscher = [...new Set(u.map((b) => b.bransch))].sort((a, b) => a.localeCompare(b, "sv"));
console.log("UNIVERSUM (n=" + u.length + "):");
for (const [k, proc] of [["pe", false], ["pb", false], ["ebit", true], ["fcf", true], ["tillvaxt", true], ["resCagr", true]]) {
  const s = stat(u.map(hamta[k]).map((v) => (v == null ? NaN : v)), proc);
  console.log(`  ${k.padEnd(9)} median ${String(s.median).padStart(6)}  P25 ${String(s.p25).padStart(6)}  P75 ${String(s.p75).padStart(6)}  n=${s.n}`);
}
for (const br of ["teknik", "kommunikation"]) {
  const rader = u.filter((b) => b.bransch === br);
  console.log(`\n${br.toUpperCase()} (${rader.length} bolag):`);
  for (const [k, proc] of [["pe", false], ["pb", false], ["ebit", true], ["fcf", true], ["tillvaxt", true]]) {
    const s = stat(rader.map(hamta[k]).map((v) => (v == null ? NaN : v)), proc);
    console.log(`  ${k.padEnd(9)} median ${String(s.median).padStart(6)}  P25 ${String(s.p25).padStart(6)}  P75 ${String(s.p75).padStart(6)}  n=${s.n}`);
  }
}
// Landmattor för protokollet
console.log("\nLANDMATTOR (mätbara P/E per land×bransch, >=4):");
const cell = {};
for (const b of u) { const k = b.land + "|" + b.bransch; cell[k] = cell[k] || 0; if (b.vardering?.pe != null) cell[k]++; }
Object.entries(cell).filter(([k, v]) => v >= 4).sort((a, b) => b[1] - a[1]).forEach(([k, v]) => console.log("  " + k.padEnd(28), v));
