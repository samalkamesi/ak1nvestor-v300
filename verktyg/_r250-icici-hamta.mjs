#!/usr/bin/env node
/** _r250-icici-hamta.mjs — U45: hämta StockAnalysis NSE ICICIBANK fyra paneler.
 *  Quote finns från rond 248-sonden (/tmp/r248-sond/ICICIBANK.*) — kopieras.
 *  NSE/INR med HDFCBANK.NS-precedensen (bankradens fältprofil). */
import { writeFileSync, mkdirSync, copyFileSync } from "node:fs";
mkdirSync("/tmp/r250-icici", { recursive: true });
copyFileSync('/tmp/r248-sond/ICICIBANK.html', '/tmp/r250-icici/quote.html');
copyFileSync('/tmp/r248-sond/ICICIBANK.plain.txt', '/tmp/r250-icici/quote.plain.txt');
const UA = "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36";
const sidor = [
  ["statistics", "https://stockanalysis.com/quote/nse/ICICIBANK/statistics/"],
  ["financials", "https://stockanalysis.com/quote/nse/ICICIBANK/financials/"],
  ["cashflow", "https://stockanalysis.com/quote/nse/ICICIBANK/financials/cash-flow-statement/"],
];
for (const [namn, url] of sidor) {
  try {
    const r = await fetch(url, { headers: { "user-agent": UA, "accept": "text/html", "cache-control": "no-cache" }, redirect: "follow" });
    const html = await r.text();
    writeFileSync(`/tmp/r250-icici/${namn}.html`, html);
    let plain = html.replace(/<script[\s\S]*?<\/script>/g, " ").replace(/<style[\s\S]*?<\/style>/g, " ");
    plain = plain.replace(/<[^>]+>/g, "\n").replace(/&amp;/g, "&").replace(/&nbsp;/g, " ").replace(/&#x27;/g, "'");
    const rader = plain.split("\n").map((r) => r.trim()).filter((r) => r.length > 1);
    writeFileSync(`/tmp/r250-icici/${namn}.plain.txt`, rader.join("\n"));
    console.log(`${namn}: HTTP ${r.status} · ${rader.length} textrader`);
  } catch (e) {
    console.log(`${namn}: FEL ${e.message}`);
  }
}
