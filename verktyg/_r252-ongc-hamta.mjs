#!/usr/bin/env node
/** _r252-ongc-hamta.mjs — U47: hämta StockAnalysis NSE ONGC fyra paneler.
 *  Quote finns från rond 248-sonden (/tmp/r248-sond/ONGC.*) — kopieras.
 *  NSE/INR med RELIANCE.NS-precedensen (energiradens fältprofil). */
import { writeFileSync, mkdirSync, copyFileSync } from "node:fs";
mkdirSync("/tmp/r252-ongc", { recursive: true });
copyFileSync('/tmp/r248-sond/ONGC.html', '/tmp/r252-ongc/quote.html');
copyFileSync('/tmp/r248-sond/ONGC.plain.txt', '/tmp/r252-ongc/quote.plain.txt');
const UA = "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36";
const sidor = [
  ["statistics", "https://stockanalysis.com/quote/nse/ONGC/statistics/"],
  ["financials", "https://stockanalysis.com/quote/nse/ONGC/financials/"],
  ["cashflow", "https://stockanalysis.com/quote/nse/ONGC/financials/cash-flow-statement/"],
];
for (const [namn, url] of sidor) {
  try {
    const r = await fetch(url, { headers: { "user-agent": UA, "accept": "text/html", "cache-control": "no-cache" }, redirect: "follow" });
    const html = await r.text();
    writeFileSync(`/tmp/r252-ongc/${namn}.html`, html);
    let plain = html.replace(/<script[\s\S]*?<\/script>/g, " ").replace(/<style[\s\S]*?<\/style>/g, " ");
    plain = plain.replace(/<[^>]+>/g, "\n").replace(/&amp;/g, "&").replace(/&nbsp;/g, " ").replace(/&#x27;/g, "'");
    const rader = plain.split("\n").map((r) => r.trim()).filter((r) => r.length > 1);
    writeFileSync(`/tmp/r252-ongc/${namn}.plain.txt`, rader.join("\n"));
    console.log(`${namn}: HTTP ${r.status} · ${rader.length} textrader`);
  } catch (e) {
    console.log(`${namn}: FEL ${e.message}`);
  }
}
