#!/usr/bin/env node
/** _r253-indus-hamta.mjs — U48: hämta StockAnalysis NSE INDUSTOWER fyra paneler.
 *  Quote finns från rond 248-sonden (/tmp/r248-sond/INDUSTOWER.*) — kopieras.
 *  NSE/INR med BHARTIARTL.NS-precedensen (telekom/torn-radens fältprofil). */
import { writeFileSync, mkdirSync, copyFileSync } from "node:fs";
mkdirSync("/tmp/r253-indus", { recursive: true });
copyFileSync('/tmp/r248-sond/INDUSTOWER.html', '/tmp/r253-indus/quote.html');
copyFileSync('/tmp/r248-sond/INDUSTOWER.plain.txt', '/tmp/r253-indus/quote.plain.txt');
const UA = "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36";
const sidor = [
  ["statistics", "https://stockanalysis.com/quote/nse/INDUSTOWER/statistics/"],
  ["financials", "https://stockanalysis.com/quote/nse/INDUSTOWER/financials/"],
  ["cashflow", "https://stockanalysis.com/quote/nse/INDUSTOWER/financials/cash-flow-statement/"],
];
for (const [namn, url] of sidor) {
  try {
    const r = await fetch(url, { headers: { "user-agent": UA, "accept": "text/html", "cache-control": "no-cache" }, redirect: "follow" });
    const html = await r.text();
    writeFileSync(`/tmp/r253-indus/${namn}.html`, html);
    let plain = html.replace(/<script[\s\S]*?<\/script>/g, " ").replace(/<style[\s\S]*?<\/style>/g, " ");
    plain = plain.replace(/<[^>]+>/g, "\n").replace(/&amp;/g, "&").replace(/&nbsp;/g, " ").replace(/&#x27;/g, "'");
    const rader = plain.split("\n").map((r) => r.trim()).filter((r) => r.length > 1);
    writeFileSync(`/tmp/r253-indus/${namn}.plain.txt`, rader.join("\n"));
    console.log(`${namn}: HTTP ${r.status} · ${rader.length} textrader`);
  } catch (e) {
    console.log(`${namn}: FEL ${e.message}`);
  }
}
