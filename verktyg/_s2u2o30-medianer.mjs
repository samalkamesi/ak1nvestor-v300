#!/usr/bin/env node
// s2-u2 omg30 — medianmätare: FÖRE (disk minus ENI+TRN, INPEX ride-along kvar — syskonets ägo)
// / EFTER (diskens läge 259). Replik av raknaBranschMedianer ur dataset-medianer.ts.
import { readFileSync } from "node:fs";
const u = JSON.parse(readFileSync("data/portfolj-system/bolagsunivers.json", "utf8"));
const MINA = ["ENI.MI", "TRN.MI"];
const median = (v) => { const r = v.filter(x => typeof x === "number" && Number.isFinite(x)); if (!r.length) return null; const s = [...r].sort((a, b) => a - b); const m = Math.floor(s.length / 2); return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2; };
const percentil = (v, p) => { const r = v.filter(x => typeof x === "number" && Number.isFinite(x)); if (!r.length) return null; const s = [...r].sort((a, b) => a - b); const pos = (s.length - 1) * p; const lo = Math.floor(pos), hi = Math.ceil(pos); return lo === hi ? s[lo] : s[lo] + (pos - lo) * (s[hi] - s[lo]); };
const runda1 = (x) => x === null ? null : Math.round(x * 10) / 10;
const svTal = (x) => x === null ? "—" : String(x).replace(".", ",");
const stat = (rader, f, pct) => { const v = rader.map(b => f(b) ?? null); const n = v.filter(x => typeof x === "number" && Number.isFinite(x)).length; const omv = x => x === null ? null : (pct ? runda1(x * 100) : runda1(x)); return { median: omv(median(v)), p25: omv(percentil(v, 0.25)), p75: omv(percentil(v, 0.75)), n }; };

const mät = (label, rader) => {
  const tot = { pe: stat(rader, b => b.vardering?.pe, false), pb: stat(rader, b => b.vardering?.pb, false), ebit: stat(rader, b => b.lonksamhet?.ebitMarginal, true), fcf: stat(rader, b => b.lonksamhet?.fcfMarginal, true), till: stat(rader, b => b.tillvaxt?.omsattningTillvaxtTTM, true), res: stat(rader, b => b.tillvaxt?.resultatCAGR5ar, true), fcfy: stat(rader, b => b.vardering?.fcfYield, true) };
  console.log(`\n[${label}] N=${rader.length}`);
  console.log(`  TOTALT: P/E ${svTal(tot.pe.median)} (kv ${svTal(tot.pe.p25)}–${svTal(tot.pe.p75)}, n ${tot.pe.n}) · P/B ${svTal(tot.pb.median)} · EBIT ${svTal(tot.ebit.median)} % · FCF ${svTal(tot.fcf.median)} % · omsTill ${svTal(tot.till.median)} % · resCAGR ${svTal(tot.res.median)} %`);
  const rs = rader.filter(r => r.bransch === "energi");
  const pe = stat(rs, r => r.vardering?.pe, false), pb = stat(rs, r => r.vardering?.pb, false), ebit = stat(rs, r => r.lonksamhet?.ebitMarginal, true), fcf = stat(rs, r => r.lonksamhet?.fcfMarginal, true), till = stat(rs, r => r.tillvaxt?.omsattningTillvaxtTTM, true), res = stat(rs, r => r.tillvaxt?.resultatCAGR5ar, true), fcfy = stat(rs, r => r.vardering?.fcfYield, true);
  console.log(`  energi: ${rs.length} bolag — P/E ${svTal(pe.median)} (kv ${svTal(pe.p25)}–${svTal(pe.p75)}, n ${pe.n}) · P/B ${svTal(pb.median)} (kv ${svTal(pb.p25)}–${svTal(pb.p75)}, n ${pb.n}) · EBIT ${svTal(ebit.median)} % (kv ${svTal(ebit.p25)}–${svTal(ebit.p75)}, n ${ebit.n}) · FCFmarg ${svTal(fcf.median)} % (kv ${svTal(fcf.p25)}–${svTal(fcf.p75)}, n ${fcf.n}) · fcfYield ${svTal(fcfy.median)} % (kv ${svTal(fcfy.p25)}–${svTal(fcfy.p75)}, n ${fcfy.n}) · omsTill ${svTal(till.median)} % · resCAGR ${svTal(res.median)} % (n ${res.n})`);
};
const fore = u.filter(b => !MINA.includes(b.ticker));
const mina = u.filter(b => MINA.includes(b.ticker));
console.log("diskens läge:", u.length, "| mina rader på disk:", mina.length, "| syskonets INPEX ride-along kvar i båda mätningarna (deras ägo)");
mät("FÖRE (disk minus ENI+TRN)", fore);
if (mina.length === 2) mät("EFTER (= diskens nuvarande)", u);

// CELLEN Italien/energi (matta 5: n=3 — ej nådd, dokumentation)
console.log("\n[CELLEN Italien/energi]");
{
  const cell = u.filter(b => b.land === "Italien" && b.bransch === "energi");
  console.log(`  n=${cell.length} (${cell.map(b => b.ticker).join(", ")}) — matta 5 för landsida EJ nådd; +2 till nästa omgång · Italien-grenar efter: ${[...new Set(u.filter(b => b.land === "Italien").map(b => b.bransch))].sort().join(", ")}`);
}

// Universumjämförelse: mina mått mot universumet EFTER (259-läget)
console.log("\n[UNIVERSUMJÄMFÖRELSE — ENI.MI + TRN.MI mot universumet EFTER]");
const rankAsc = (f, val) => [...u].map(b => f(b)).filter(x => typeof x === "number" && Number.isFinite(x)).sort((a, b) => a - b).indexOf(val) + 1;
const peE = stat(u, b => b.vardering?.pe, false), pbE = stat(u, b => b.vardering?.pb, false), fcfyE = stat(u, b => b.vardering?.fcfYield, true), ebitE = stat(u, b => b.lonksamhet?.ebitMarginal, true), resE = stat(u, b => b.tillvaxt?.resultatCAGR5ar, true), bruttoE = stat(u, b => b.lonksamhet?.bruttoMarginal, true);
for (const t of u.filter(b => MINA.includes(b.ticker))) {
  console.log(`  ${t.ticker}: P/E ${t.vardering.pe} rank ${rankAsc(b => b.vardering?.pe, t.vardering.pe)}/${peE.n} (universum median ${svTal(peE.median)}, kv ${svTal(peE.p25)}–${svTal(peE.p75)}) · P/B ${t.vardering.pb} rank ${rankAsc(b => b.vardering?.pb, t.vardering.pb)}/${pbE.n} · fcfYield ${svTal(t.vardering.fcfYield * 100)} % rank ${rankAsc(b => (b.vardering?.fcfYield ?? 0) * 100, t.vardering.fcfYield * 100)}/${fcfyE.n} · bruttoMarginal ${svTal(t.lonksamhet.bruttoMarginal * 100)} % rank ${rankAsc(b => (b.lonksamhet?.bruttoMarginal ?? 0) * 100, t.lonksamhet.bruttoMarginal * 100)}/${bruttoE.n} (universum median ${svTal(bruttoE.median)} %) · resCAGR ${svTal(t.tillvaxt.resultatCAGR5ar * 100)} % (universum median ${svTal(resE.median)} %)`);
}
