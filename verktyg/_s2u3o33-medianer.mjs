#!/usr/bin/env node
// _s2u3o33-medianer.mjs — s2-u3 ITALIEN/FINANS: medianer/kvartiler FÖRE (HEAD:s 322-träd)
// → EFTER (diskens 326) med lasBranschMedianer/llms-regen percentil-logik EXAKT.
import { execSync } from "node:child_process";
import { readFileSync } from "node:fs";

const lasJson = (s) => JSON.parse(s);
const före = lasJson(execSync("git show HEAD:data/portfolj-system/bolagsunivers.json", { encoding: "utf8", maxBuffer: 64e6 }));
const efter = lasJson(readFileSync("data/portfolj-system/bolagsunivers.json", "utf8"));

const median = (v) => {
  const r = v.filter((x) => typeof x === "number" && Number.isFinite(x));
  if (!r.length) return null;
  const s = [...r].sort((a, b) => a - b);
  const m = Math.floor(s.length / 2);
  return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
};
const percentil = (v, p) => {
  const r = v.filter((x) => typeof x === "number" && Number.isFinite(x));
  if (!r.length) return null;
  const s = [...r].sort((a, b) => a - b);
  const pos = (s.length - 1) * p;
  const lo = Math.floor(pos), hi = Math.ceil(pos);
  return lo === hi ? s[lo] : s[lo] + (pos - lo) * (s[hi] - s[lo]);
};
const stat = (rader, f) => {
  const v = rader.map((b) => f(b) ?? null);
  const n = v.filter((x) => typeof x === "number" && Number.isFinite(x)).length;
  return { median: median(v), p25: percentil(v, 0.25), p75: percentil(v, 0.75), n };
};
const f1 = (x) => (x >= 100 ? x.toFixed(0) : x >= 10 ? x.toFixed(1) : x.toFixed(2));
const rad = (etikett, f, pct) => {
  const a = stat(före.filter(r => r.bransch === "finans"), f);
  const b = stat(efter.filter(r => r.bransch === "finans"), f);
  const omv = (s) => s.median === null ? "—" : `${(pct ? s.median * 100 : s.median).toFixed(pct ? 1 : 2)} (kv ${(pct ? s.p25 * 100 : s.p25).toFixed(pct ? 1 : 2)}–${(pct ? s.p75 * 100 : s.p75).toFixed(pct ? 1 : 2)}, n ${s.n})`;
  console.log(`${etikett.padEnd(22)} FÖRE ${omv(a).padEnd(34)} EFTER ${omv(b)}`);
};
console.log(`FINANS grenen: före ${före.filter(r=>r.bransch==="finans").length} rader (HEAD 322-trädet) → efter ${efter.filter(r=>r.bransch==="finans").length} (disken 326)`);
rad("P/E", (b) => b.vardering?.pe ?? null, false);
rad("P/B", (b) => b.vardering?.pb ?? null, false);
rad("EBIT-marginal", (b) => b.lonksamhet?.ebitMarginal ?? null, true);
rad("FCF-marginal", (b) => b.lonksamhet?.fcfMarginal ?? null, true);
rad("OmsTillväxt TTM", (b) => b.tillvaxt?.omsattningTillvaxtTTM ?? null, true);
rad("Resultat-CAGR", (b) => b.tillvaxt?.resultatCAGR5ar ?? null, true);
rad("ROE", (b) => b.lonksamhet?.roe ?? null, true);
console.log();
const tot = (u) => `median P/E ${stat(u, (b) => b.vardering?.pe ?? null, false).median.toFixed(2)} (n ${stat(u, (b) => b.vardering?.pe ?? null).n} av ${u.length})`;
console.log(`UNIVERSUM: före ${före.length} rader ${tot(före)} → efter ${efter.length} rader ${tot(efter)}`);
console.log();
// Rang för de tre nya i finans-grenen (efter-läget)
const fin = efter.filter(r => r.bransch === "finans");
for (const [t, f, namn] of [["ISP.MI", b => b.vardering?.pe, "P/E"], ["UCG.MI", b => b.vardering?.pe, "P/E"], ["G.MI", b => b.vardering?.pe, "P/E"], ["ISP.MI", b => b.vardering?.pb, "P/B"], ["UCG.MI", b => b.vardering?.pb, "P/B"], ["G.MI", b => b.vardering?.pb, "P/B"], ["UCG.MI", b => b.lonksamhet?.roe, "ROE"]]) {
  const v = fin.map(f).filter(x => typeof x === "number" && Number.isFinite(x)).sort((a, b) => a - b);
  const mitt = f(fin.find(r => r.ticker === t));
  console.log(`${t} ${namn}: rang ${v.indexOf(mitt) + 1}/${v.length} (värdet ${mitt}) — P25 ${percentil(fin.map(f), 0.25).toFixed(3)} / P75 ${percentil(fin.map(f), 0.75).toFixed(3)}`);
}
console.log();
console.log(`Italien-cellen: ${efter.filter(r => r.land === "Italien").length} bolag (landaspekt-modul finns ej i src — ingen ny sida, mattan ${efter.filter(r => r.land === "Italien" && r.bransch === "finans").length} < 5)`);
