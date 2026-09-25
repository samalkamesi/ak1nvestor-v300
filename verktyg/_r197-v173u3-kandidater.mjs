#!/usr/bin/env node
/**
 * _r197-v173u3-kandidater.mjs — kandidatjakt v2 (TMUS-kollisionsläxan:
 * varje kandidat dubbelkollas mot universumet med EXAKT ticker-match):
 * sök "ledig/FALLER/avsänd/kö-not/kvarstår"-meningar i alla UTOKNING/KOMPLEMENT-
 * protokoll, dra ut tickern ur meningen, filtrera mot diskens tickers.
 * Kvitto: /tmp/r197-kandidater.txt
 */
import { readFileSync, readdirSync, writeFileSync } from "node:fs";

const u = JSON.parse(readFileSync("data/portfolj-system/bolagsunivers.json", "utf8"));
const paDisk = new Set(u.map((b) => b.ticker));
const ut = [];

const TICKER = /\b([A-Z][A-Z0-9]{1,5}(?:[-.][A-Z]{1,3})?\.(?:ST|OL|HE|CO|AS|PA|MI|L|T|N|S|DE|SW)|(?:^|\s)([A-Z]{2,6}(?:-[A-Z])?\.ST)\b|[A-Z]{3,5}\.(?:ST|T|PA|L|CO|OL|HE|AS|MI|DE))\b/g;

for (const f of readdirSync("data/forskning").sort()) {
  if (!/(UTOKNING|KOMPLEMENT|V209)/.test(f)) continue;
  const t = readFileSync(`data/forskning/${f}`, "utf8");
  for (const mening of t.split(/(?<=\.)\s+(?=[A-Z★*—])/)) {
    if (!/(ledig|FALLER|avs[äe]nd|k[öo]-not|v[äa]ntar kundbeslut om|utl[öo]st)/i.test(mening)) continue;
    for (const m of mening.matchAll(/\b([A-Z][A-Z0-9]{0,5}(?:-[A-Z])?(?:\.[A-Z]{1,4})?)\b/g)) {
      const tk = m[1];
      if (!tk.includes(".") && !/^[A-Z]{4,6}$/.test(tk)) continue;
      if (["OMG", "UTOKNING", "KOMPLEMENT", "TTM", "CAGR", "P/E", "EV", "ROE", "ROIC", "WACC", "P/B", "EPS", "FCF", "NASDAQ", "TYO", "JPY", "USD", "MDR", "STOCKANALYSIS", "YAHOO"].includes(tk)) continue;
      const finns = paDisk.has(tk) || [...paDisk].some((d) => d.startsWith(tk + "."));
      ut.push(`${finns ? "UPPTAGEN" : "LEDIG??"} ${tk} — ${f}: ${mening.replace(/\s+/g, " ").slice(0, 150)}`);
    }
  }
}
// deduplicera på ticker
const sedda = new Set();
const rader = ut.filter((r) => { const k = r.split(" ")[1]; if (sedda.has(k)) return false; sedda.add(k); return true; });
writeFileSync("/tmp/r197-kandidater.txt", rader.join("\n") || "(inga träffar)");
console.log(rader.join("\n") || "(inga träffar)");
