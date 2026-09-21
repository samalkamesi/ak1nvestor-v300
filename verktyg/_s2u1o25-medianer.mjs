// s2-u1 omg25 — medianmätare: FÖRE (disk minus 5401.T) / EFTER (diskens läge)
// Replik av raknaBranschMedianer ur src/lib/dataset-medianer.ts (o22/o23/o24-kroppen).
import { readFileSync } from "node:fs";
const u = JSON.parse(readFileSync("data/portfolj-system/bolagsunivers.json", "utf8"));
const MINA = ["5401.T"];
const median = (v) => { const r = v.filter(x => typeof x === "number" && Number.isFinite(x)); if (!r.length) return null; const s = [...r].sort((a, b) => a - b); const m = Math.floor(s.length / 2); return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2; };
const percentil = (v, p) => { const r = v.filter(x => typeof x === "number" && Number.isFinite(x)); if (!r.length) return null; const s = [...r].sort((a, b) => a - b); const pos = (s.length - 1) * p; const lo = Math.floor(pos), hi = Math.ceil(pos); return lo === hi ? s[lo] : s[lo] + (pos - lo) * (s[hi] - s[lo]); };
const runda1 = (x) => x === null ? null : Math.round(x * 10) / 10;
const svTal = (x) => x === null ? "—" : String(x).replace(".", ",");
const stat = (rader, f, pct) => { const v = rader.map(b => f(b) ?? null); const n = v.filter(x => typeof x === "number" && Number.isFinite(x)).length; const omv = x => x === null ? null : (pct ? runda1(x * 100) : runda1(x)); return { median: omv(median(v)), p25: omv(percentil(v, 0.25)), p75: omv(percentil(v, 0.75)), n }; };

const mät = (label, rader) => {
  const tot = { pe: stat(rader, b => b.vardering?.pe, false), pb: stat(rader, b => b.vardering?.pb, false), ebit: stat(rader, b => b.lonksamhet?.ebitMarginal, true), fcf: stat(rader, b => b.lonksamhet?.fcfMarginal, true), till: stat(rader, b => b.tillvaxt?.omsattningTillvaxtTTM, true), res: stat(rader, b => b.tillvaxt?.resultatCAGR5ar, true) };
  console.log(`\n[${label}] N=${rader.length}`);
  console.log(`  TOTALT: P/E ${svTal(tot.pe.median)} (kv ${svTal(tot.pe.p25)}–${svTal(tot.pe.p75)}, n ${tot.pe.n}) · P/B ${svTal(tot.pb.median)} · EBIT ${svTal(tot.ebit.median)} % · FCF ${svTal(tot.fcf.median)} % · omsTill ${svTal(tot.till.median)} % · resCAGR ${svTal(tot.res.median)} %`);
  const rs = rader.filter(r => r.bransch === "material");
  const pe = stat(rs, r => r.vardering?.pe, false), pb = stat(rs, r => r.vardering?.pb, false), ebit = stat(rs, r => r.lonksamhet?.ebitMarginal, true), fcf = stat(rs, r => r.lonksamhet?.fcfMarginal, true), till = stat(rs, r => r.tillvaxt?.omsattningTillvaxtTTM, true), res = stat(rs, r => r.tillvaxt?.resultatCAGR5ar, true);
  console.log(`  material: ${rs.length} bolag — P/E ${svTal(pe.median)} (kv ${svTal(pe.p25)}–${svTal(pe.p75)}, n ${pe.n}) · P/B ${svTal(pb.median)} (kv ${svTal(pb.p25)}–${svTal(pb.p75)}, n ${pb.n}) · EBIT ${svTal(ebit.median)} % · FCF ${svTal(fcf.median)} % · omsTill ${svTal(till.median)} % · resCAGR ${svTal(res.median)} % (kv ${svTal(res.p25)}–${svTal(res.p75)}, n ${res.n})`);
};
const fore = u.filter(b => !MINA.includes(b.ticker));
const mina = u.filter(b => MINA.includes(b.ticker));
console.log("diskens läge:", u.length, "| mina rader på disk:", mina.length, "(", mina.map(m => m.ticker).join(", ") || "—", ")");
mät("FÖRE (disk minus min 5401.T)", fore);
if (mina.length === 1) mät("EFTER (= diskens nuvarande)", u);

// 5401.T:s läge i materialgrenen + universumet (universumjämförelserader)
const gren = u.filter(b => b.bransch === "material" && typeof b.vardering?.pe === "number").map(b => ({ t: b.ticker, pe: b.vardering.pe, pb: b.vardering.pb })).sort((a, b) => a.pe - b.pe);
const rank = gren.findIndex(e => e.t === "5401.T") + 1;
console.log(`\n5401.T i materialgrenens P/E-trappa: rank ${rank}/${gren.length} — ${gren.map(e => e.t + ":" + e.pe).join(" ")}`);
const grenPb = u.filter(b => b.bransch === "material" && typeof b.vardering?.pb === "number").map(b => ({ t: b.ticker, pb: b.vardering.pb })).sort((a, b) => a.pb - b.pb);
const rankPb = grenPb.findIndex(e => e.t === "5401.T") + 1;
console.log(`5401.T i grenens P/B-trappa: rank ${rankPb}/${grenPb.length} — ${grenPb.map(e => e.t + ":" + e.pb).join(" ")}`);
const allPe = u.filter(b => typeof b.vardering?.pe === "number").map(b => ({ t: b.ticker, pe: b.vardering.pe })).sort((a, b) => a.pe - b.pe);
console.log(`5401.T i universumets P/E-trappa: rank ${allPe.findIndex(e => e.t === "5401.T") + 1}/${allPe.length}`);
const negFcf = u.filter(b => typeof b.lonksamhet?.fcfMarginal === "number" && b.lonksamhet.fcfMarginal < 0).map(b => b.ticker);
console.log(`negativa fcfMarginal-rader i universumet: ${negFcf.length} st — ${negFcf.join(" · ")}`);
const subBook = u.filter(b => typeof b.vardering?.pb === "number" && b.vardering.pb < 1).map(b => b.ticker + ":" + b.vardering.pb);
console.log(`sub-book-rader (P/B < 1): ${subBook.length} st — ${subBook.join(" · ")}`);
