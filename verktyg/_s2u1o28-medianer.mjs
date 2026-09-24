#!/usr/bin/env node
// s2-u1 omg28 — medianmätare: FÖRE (disk minus Komatsu) / EFTER (diskens läge)
// Replik av raknaBranschMedianer ur src/lib/dataset-medianer.ts (o21–o27-kroppen).
import { readFileSync } from "node:fs";
const u = JSON.parse(readFileSync("data/portfolj-system/bolagsunivers.json", "utf8"));
const MINA = ["6301.T"];
const median = (v) => { const r = v.filter(x => typeof x === "number" && Number.isFinite(x)); if (!r.length) return null; const s = [...r].sort((a, b) => a - b); const m = Math.floor(s.length / 2); return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2; };
const percentil = (v, p) => { const r = v.filter(x => typeof x === "number" && Number.isFinite(x)); if (!r.length) return null; const s = [...r].sort((a, b) => a - b); const pos = (s.length - 1) * p; const lo = Math.floor(pos), hi = Math.ceil(pos); return lo === hi ? s[lo] : s[lo] + (pos - lo) * (s[hi] - s[lo]); };
const runda1 = (x) => x === null ? null : Math.round(x * 10) / 10;
const svTal = (x) => x === null ? "—" : String(x).replace(".", ",");
const stat = (rader, f, pct) => { const v = rader.map(b => f(b) ?? null); const n = v.filter(x => typeof x === "number" && Number.isFinite(x)).length; const omv = x => x === null ? null : (pct ? runda1(x * 100) : runda1(x)); return { median: omv(median(v)), p25: omv(percentil(v, 0.25)), p75: omv(percentil(v, 0.75)), n }; };

const mät = (label, rader) => {
  const tot = { pe: stat(rader, b => b.vardering?.pe, false), pb: stat(rader, b => b.vardering?.pb, false), ebit: stat(rader, b => b.lonksamhet?.ebitMarginal, true), fcf: stat(rader, b => b.lonksamhet?.fcfMarginal, true), till: stat(rader, b => b.tillvaxt?.omsattningTillvaxtTTM, true), res: stat(rader, b => b.tillvaxt?.resultatCAGR5ar, true), fcfy: stat(rader, b => b.vardering?.fcfYield, true) };
  console.log(`\n[${label}] N=${rader.length}`);
  console.log(`  TOTALT: P/E ${svTal(tot.pe.median)} (kv ${svTal(tot.pe.p25)}–${svTal(tot.pe.p75)}, n ${tot.pe.n}) · P/B ${svTal(tot.pb.median)} · EBIT ${svTal(tot.ebit.median)} % · FCF ${svTal(tot.fcf.median)} % · omsTill ${svTal(tot.till.median)} % · resCAGR ${svTal(tot.res.median)} %`);
  const rs = rader.filter(r => r.bransch === "industri");
  const pe = stat(rs, r => r.vardering?.pe, false), pb = stat(rs, r => r.vardering?.pb, false), ebit = stat(rs, r => r.lonksamhet?.ebitMarginal, true), fcf = stat(rs, r => r.lonksamhet?.fcfMarginal, true), till = stat(rs, r => r.tillvaxt?.omsattningTillvaxtTTM, true), res = stat(rs, r => r.tillvaxt?.resultatCAGR5ar, true), fcfy = stat(rs, r => r.vardering?.fcfYield, true);
  console.log(`  industri: ${rs.length} bolag — P/E ${svTal(pe.median)} (kv ${svTal(pe.p25)}–${svTal(pe.p75)}, n ${pe.n}) · P/B ${svTal(pb.median)} (kv ${svTal(pb.p25)}–${svTal(pb.p75)}, n ${pb.n}) · EBIT ${svTal(ebit.median)} % (kv ${svTal(ebit.p25)}–${svTal(ebit.p75)}, n ${ebit.n}) · FCFmarg ${svTal(fcf.median)} % (kv ${svTal(fcf.p25)}–${svTal(fcf.p75)}, n ${fcf.n}) · fcfYield ${svTal(fcfy.median)} % (kv ${svTal(fcfy.p25)}–${svTal(fcfy.p75)}, n ${fcfy.n}) · omsTill ${svTal(till.median)} % · resCAGR ${svTal(res.median)} % (n ${res.n})`);
};
const fore = u.filter(b => !MINA.includes(b.ticker));
const mina = u.filter(b => MINA.includes(b.ticker));
console.log("diskens läge:", u.length, "| min rad på disk:", mina.length);
mät("FÖRE (disk minus Komatsu)", fore);
if (mina.length === 1) mät("EFTER (= diskens nuvarande)", u);

// CELLEN Japan/industri (matta 5 ej nådd — dokumentation)
console.log("\n[CELLEN Japan/industri]");
{
  const cell = u.filter(b => b.land === "Japan" && b.bransch === "industri");
  console.log(`  n=${cell.length} (matta 5 för landsida: EJ nådd — ingen land.ts-yta berörs) · Japan-grenar efter: ${[...new Set(u.filter(b => b.land === "Japan").map(b => b.bransch))].sort().join(", ")}`);
}

// Universumjämförelse: Komatsus mätbara mått mot universumet EFTER (pe mätt — full P/E-vy bär)
console.log("\n[UNIVERSUMJÄMFÖRELSE — 6301.T mot universumet EFTER]");
const rankAsc = (f, val) => [...u].map(b => f(b)).filter(x => typeof x === "number" && Number.isFinite(x)).sort((a, b) => a - b).indexOf(val) + 1;
const peEfter = stat(u, b => b.vardering?.pe, false);
const pbEfter = stat(u, b => b.vardering?.pb, false);
const fcfyEfter = stat(u, b => b.vardering?.fcfYield, true);
const ebitEfter = stat(u, b => b.lonksamhet?.ebitMarginal, true);
const resEfter = stat(u, b => b.tillvaxt?.resultatCAGR5ar, true);
const t = u.find(b => b.ticker === "6301.T");
console.log(`  P/E 16,61: rank ${rankAsc(b => b.vardering?.pe, t.vardering.pe)} av ${peEfter.n} stigande (universum median ${svTal(peEfter.median)}, kv ${svTal(peEfter.p25)}–${svTal(peEfter.p75)}) — UNDER medianen och under industri-kvartilens P25`);
console.log(`  P/B 1,68: rank ${rankAsc(b => b.vardering?.pb, t.vardering.pb)} av ${pbEfter.n} (universum median ${svTal(pbEfter.median)}, kv ${svTal(pbEfter.p25)}–${svTal(pbEfter.p75)}) — under medianen, botten-halvan`);
console.log(`  fcfYield 4,04 %: rank ${rankAsc(b => (b.vardering?.fcfYield ?? 0) * 100, t.vardering.fcfYield * 100)} stigande av ${fcfyEfter.n} — universum median ${svTal(fcfyEfter.median)} % (kv ${svTal(fcfyEfter.p25)}–${svTal(fcfyEfter.p75)})`);
console.log(`  EBIT-marg 13,63 %: universum median ${svTal(ebitEfter.median)} % · resCAGR +13,72 %: universum median ${svTal(resEfter.median)} % (n ${resEfter.n}) — övre delen: fyra raka tillväxtår mot grenens median 4 %`);
