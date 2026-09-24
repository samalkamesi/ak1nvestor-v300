#!/usr/bin/env node
// _s2u1o30-medianer.mjs — AUTO-S2 omgång 30 u1: kvartiler + universumjämförelse
// för INPEX 1605.T (energi-grenen före/efter, total, rang).
import { readFileSync } from "node:fs";

const u = JSON.parse(readFileSync("data/portfolj-system/bolagsunivers.json", "utf8"));
const median = (v) => { const s = [...v].sort((a, b) => a - b); const m = Math.floor(s.length / 2); return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2; };
const p = (v, q) => { const s = [...v].sort((a, b) => a - b); const pos = (s.length - 1) * q; const lo = Math.floor(pos), hi = Math.ceil(pos); return lo === hi ? s[lo] : s[lo] + (pos - lo) * (s[hi] - s[lo]); };
const sv = (x) => String(Math.round(x * 10) / 10).replace(".", ",");
const stat = (rader, f) => {
  const v = rader.map(f).filter((x) => typeof x === "number" && Number.isFinite(x));
  return { n: v.length, median: median(v), p25: p(v, 0.25), p75: p(v, 0.75) };
};
const rang = (f) => { const v = u.map(f).filter((x) => typeof x === "number" && Number.isFinite(x)).sort((a, b) => a - b); const mitt = f(u.find((b) => b.ticker === "1605.T")); return { plats: v.indexOf(mitt) + 1, av: v.length }; };

const fore = u.filter((b) => b.ticker !== "1605.T" && b.bransch === "energi");
const efter = u.filter((b) => b.bransch === "energi");
console.log("ENERGI före", fore.length, "→ efter", efter.length);
for (const [namn, f, pct] of [["P/E", (b) => b.vardering?.pe, 0], ["P/B", (b) => b.vardering?.pb, 0], ["EBIT-marginal", (b) => b.lonksamhet?.ebitMarginal, 1], ["FCF-marginal", (b) => b.lonksamhet?.fcfMarginal, 1], ["omsTillväxt", (b) => b.tillvaxt?.omsattningTillvaxtTTM, 1], ["resCAGR", (b) => b.tillvaxt?.resultatCAGR5ar, 1]]) {
  const a = stat(fore, f), b = stat(efter, f);
  const fmt = (x) => (pct ? sv(x * 100) + " %" : sv(x));
  console.log(`  ${namn}: median ${fmt(a.median)}→${fmt(b.median)} · kv ${fmt(a.p25)}–${fmt(a.p75)}→${fmt(b.p25)}–${fmt(b.p75)} · n ${a.n}→${b.n}`);
}
const tot = stat(u, (b) => b.vardering?.pe);
console.log("TOTALT P/E median", sv(tot.median), "n", tot.n, "av", u.length);
console.log("INPEX pe-rang", JSON.stringify(rang((b) => b.vardering?.pe)), "· pb-rang", JSON.stringify(rang((b) => b.vardering?.pb)), "· ebit-rang", JSON.stringify(rang((b) => b.lonksomhet?.ebitMarginal)), "· fcfYield-rang", JSON.stringify(rang((b) => b.vardering?.fcfYield)));
const ebitAll = u.map((b) => b.lonksamhet?.ebitMarginal).filter((x) => typeof x === "number").sort((a, b) => b - a);
console.log("EBIT-marginal topp-3 universumet:", ebitAll.slice(0, 3).map((x) => sv(x * 100) + " %").join(" · "), "— INPEX plats", ebitAll.indexOf(0.5085) + 1, "av", ebitAll.length);
const jp = u.filter((b) => b.land === "Japan");
const grenar = [...new Set(jp.map((b) => b.bransch))].length;
console.log("JAPAN:", jp.length, "bolag i", grenar, "grenar (energi 0→1 = den åttonde)");
