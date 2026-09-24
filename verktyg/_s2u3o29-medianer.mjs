#!/usr/bin/env node
// s2-u3 omg29 — medianmätare: FÖRE (disk minus mina 3) / EFTER (diskens läge 262)
// Replik av raknaBranschMedianer ur src/lib/dataset-medianer.ts (o21–o28-kroppen).
import { readFileSync } from "node:fs";
const u = JSON.parse(readFileSync("data/portfolj-system/bolagsunivers.json", "utf8"));
const MINA = ["BHARTIARTL.NS", "SUNPHARMA.NS", "LT.NS"];
const median = (v) => { const r = v.filter(x => typeof x === "number" && Number.isFinite(x)); if (!r.length) return null; const s = [...r].sort((a, b) => a - b); const m = Math.floor(s.length / 2); return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2; };
const percentil = (v, p) => { const r = v.filter(x => typeof x === "number" && Number.isFinite(x)); if (!r.length) return null; const s = [...r].sort((a, b) => a - b); const pos = (s.length - 1) * p; const lo = Math.floor(pos), hi = Math.ceil(pos); return lo === hi ? s[lo] : s[lo] + (pos - lo) * (s[hi] - s[lo]); };
const runda1 = (x) => x === null ? null : Math.round(x * 10) / 10;
const svTal = (x) => x === null ? "—" : String(x).replace(".", ",");
const stat = (rader, f, pct) => { const v = rader.map(b => f(b) ?? null); const n = v.filter(x => typeof x === "number" && Number.isFinite(x)).length; const omv = x => x === null ? null : (pct ? runda1(x * 100) : runda1(x)); return { median: omv(median(v)), p25: omv(percentil(v, 0.25)), p75: omv(percentil(v, 0.75)), n }; };

const mät = (label, rader) => {
  const tot = { pe: stat(rader, b => b.vardering?.pe, false), pb: stat(rader, b => b.vardering?.pb, false), ebit: stat(rader, b => b.lonksamhet?.ebitMarginal, true), fcf: stat(rader, b => b.lonksamhet?.fcfMarginal, true), till: stat(rader, b => b.tillvaxt?.omsattningTillvaxtTTM, true), res: stat(rader, b => b.tillvaxt?.resultatCAGR5ar, true) };
  console.log(`\n[${label}] N=${rader.length}`);
  console.log(`  TOTALT: P/E ${svTal(tot.pe.median)} (kv ${svTal(tot.pe.p25)}–${svTal(tot.pe.p75)}, n ${tot.pe.n}) · P/B ${svTal(tot.pb.median)} · EBIT ${svTal(tot.ebit.median)} % · FCF ${svTal(tot.fcf.median)} % · omsTill ${svTal(tot.till.median)} % · resCAGR ${svTal(tot.res.median)} %`);
  for (const b of ["kommunikation", "halso", "industri"]) {
    const rs = rader.filter(r => r.bransch === b);
    const pe = stat(rs, r => r.vardering?.pe, false), pb = stat(rs, r => r.vardering?.pb, false), ebit = stat(rs, r => r.lonksamhet?.ebitMarginal, true), fcf = stat(rs, r => r.lonksamhet?.fcfMarginal, true), till = stat(rs, r => r.tillvaxt?.omsattningTillvaxtTTM, true), res = stat(rs, r => r.tillvaxt?.resultatCAGR5ar, true);
    console.log(`  ${b}: ${rs.length} bolag — P/E ${svTal(pe.median)} (kv ${svTal(pe.p25)}–${svTal(pe.p75)}, n ${pe.n}) · P/B ${svTal(pb.median)} (kv ${svTal(pb.p25)}–${svTal(pb.p75)}, n ${pb.n}) · EBIT ${svTal(ebit.median)} % (kv ${svTal(ebit.p25)}–${svTal(ebit.p75)}) · FCF ${svTal(fcf.median)} % · omsTill ${svTal(till.median)} % · resCAGR ${svTal(res.median)} % (n ${res.n})`);
  }
};
const fore = u.filter(b => !MINA.includes(b.ticker));
const mina = u.filter(b => MINA.includes(b.ticker));
console.log("diskens läge:", u.length, "| mina rader på disk:", mina.length, "(", mina.map(m => m.ticker).join(", ") || "—", ")");
mät("FÖRE (disk minus mina 3)", fore);
if (mina.length === 3) mät("EFTER (= diskens nuvarande)", u);

// INDIEN-cellen — sju grenar, ingen matta (alla n=1 utom gamla)
console.log("\n[INDIEN — sju grenar EFTER]");
{
  const cell = u.filter(b => b.land === "Indien");
  for (const b of cell) console.log(`  ${b.ticker} ${b.bransch}: P/E ${b.vardering?.pe ?? "—"} · P/B ${b.vardering?.pb ?? "—"} · EBIT ${svTal(b.lonksamhet?.ebitMarginal * 100)} %`);
}

// Universumjämförelse: mina tre mot universumets EFTER-läge (kvartilsvy + rang)
console.log("\n[UNIVERSUMJÄMFÖRELSE — mina tre mot universumet EFTER]");
const peEfter = stat(u, b => b.vardering?.pe, false);
for (const t of MINA) {
  const r = u.find(b => b.ticker === t);
  const rank = u.filter(b => typeof b.vardering?.pe === "number" && b.vardering.pe < r.vardering.pe).length + 1;
  const peB = stat(u.filter(b => b.bransch === r.bransch), b => b.vardering?.pe, false);
  const rankB = u.filter(b => b.bransch === r.bransch && typeof b.vardering?.pe === "number" && b.vardering.pe < r.vardering.pe).length + 1;
  console.log(`  ${t}: P/E ${r.vardering.pe} — rad ${rank}/${peEfter.n} i universumet (median ${svTal(peEfter.median)}, kv ${svTal(peEfter.p25)}–${svTal(peEfter.p75)}) · rad ${rankB}/${peB.n} i ${r.bransch} (median ${svTal(peB.median)}, kv ${svTal(peB.p25)}–${svTal(peB.p75)})`);
}
// resCAGR-rang (kvartilsvärlden)
console.log("\n[resCAGR-kvartilsvärlden — mina tre mot universumet]");
const resEfter = stat(u, b => b.tillvaxt?.resultatCAGR5ar, true);
for (const t of MINA) {
  const r = u.find(b => b.ticker === t);
  const v = r.tillvaxt?.resultatCAGR5ar;
  if (typeof v !== "number") { console.log(`  ${t}: resCAGR osatt`); continue; }
  const rank = u.filter(b => typeof b.tillvaxt?.resultatCAGR5ar === "number" && b.tillvaxt.resultatCAGR5ar > v).length + 1;
  console.log(`  ${t}: resCAGR ${(v * 100).toFixed(1)} % — rad ${rank}/${resEfter.n} från toppen (universummedian ${svTal(resEfter.median)} %, kv ${svTal(resEfter.p25)}–${svTal(resEfter.p75)})`);
}
