#!/usr/bin/env node
// s2-u3 omg27 — medianmätare: FÖRE (disk minus mina 3) / EFTER (diskens läge)
// Replik av raknaBranschMedianer ur src/lib/dataset-medianer.ts (o21–o26-kroppen).
import { readFileSync } from "node:fs";
const u = JSON.parse(readFileSync("data/portfolj-system/bolagsunivers.json", "utf8"));
const MINA = ["STMPA.PA", "SOP.PA", "SWP.PA"];
const median = (v) => { const r = v.filter(x => typeof x === "number" && Number.isFinite(x)); if (!r.length) return null; const s = [...r].sort((a, b) => a - b); const m = Math.floor(s.length / 2); return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2; };
const percentil = (v, p) => { const r = v.filter(x => typeof x === "number" && Number.isFinite(x)); if (!r.length) return null; const s = [...r].sort((a, b) => a - b); const pos = (s.length - 1) * p; const lo = Math.floor(pos), hi = Math.ceil(pos); return lo === hi ? s[lo] : s[lo] + (pos - lo) * (s[hi] - s[lo]); };
const runda1 = (x) => x === null ? null : Math.round(x * 10) / 10;
const svTal = (x) => x === null ? "—" : String(x).replace(".", ",");
const stat = (rader, f, pct) => { const v = rader.map(b => f(b) ?? null); const n = v.filter(x => typeof x === "number" && Number.isFinite(x)).length; const omv = x => x === null ? null : (pct ? runda1(x * 100) : runda1(x)); return { median: omv(median(v)), p25: omv(percentil(v, 0.25)), p75: omv(percentil(v, 0.75)), n }; };

const mät = (label, rader) => {
  const tot = { pe: stat(rader, b => b.vardering?.pe, false), pb: stat(rader, b => b.vardering?.pb, false), ebit: stat(rader, b => b.lonksamhet?.ebitMarginal, true), fcf: stat(rader, b => b.lonksamhet?.fcfMarginal, true), till: stat(rader, b => b.tillvaxt?.omsattningTillvaxtTTM, true), res: stat(rader, b => b.tillvaxt?.resultatCAGR5ar, true) };
  console.log(`\n[${label}] N=${rader.length}`);
  console.log(`  TOTALT: P/E ${svTal(tot.pe.median)} (kv ${svTal(tot.pe.p25)}–${svTal(tot.pe.p75)}, n ${tot.pe.n}) · P/B ${svTal(tot.pb.median)} · EBIT ${svTal(tot.ebit.median)} % · FCF ${svTal(tot.fcf.median)} % · omsTill ${svTal(tot.till.median)} % · resCAGR ${svTal(tot.res.median)} %`);
  for (const b of ["teknik"]) {
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

// CELLEN Frankrike/teknik — landsidans fem tal (matta-regeln: 5 nått)
console.log("\n[CELLEN Frankrike/teknik — landsidans fem mått EFTER]");
{
  const cell = u.filter(b => b.land === "Frankrike" && b.bransch === "teknik");
  const m = (f, pct) => stat(cell, f, pct);
  console.log(`  n=${cell.length} · P/E ${svTal(m(b => b.vardering?.pe, false).median)} (kv ${svTal(m(b => b.vardering?.pe, false).p25)}–${svTal(m(b => b.vardering?.pe, false).p75)}, matta ${m(b => b.vardering?.pe, false).n}) · P/B ${svTal(m(b => b.vardering?.pb, false).median)} · EBIT ${svTal(m(b => b.lonksamhet?.ebitMarginal, true).median)} % · FCF ${svTal(m(b => b.lonksamhet?.fcfMarginal, true).median)} % · omsTill ${svTal(m(b => b.tillvaxt?.omsattningTillvaxtTTM, true).median)} %`);
}

// Universumjämförelse: mina tre mot universumets EFTER-läge (kvartilsvyernas underlag)
console.log("\n[UNIVERSUMJÄMFÖRELSE — mina tre mot universumet EFTER]");
const peEfter = stat(u, b => b.vardering?.pe, false);
for (const t of MINA) {
  const r = u.find(b => b.ticker === t);
  const pos = [...u].map(b => b.vardering?.pe).filter(x => typeof x === "number").sort((a, b) => a - b).indexOf(r.vardering.pe) + 1;
  console.log(`  ${t}: P/E ${svTal(r.vardering.pe)} (rank ${pos} av ${peEfter.n}) · P/B ${svTal(r.vardering.pb)} · resCAGR ${svTal((r.tillvaxt?.resultatCAGR5ar ?? 0) * 100)} % · EBIT-marg ${svTal((r.lonksamhet?.ebitMarginal ?? 0) * 100)} % — mot universum P/E ${svTal(peEfter.median)} kv ${svTal(peEfter.p25)}–${svTal(peEfter.p75)}`);
}
