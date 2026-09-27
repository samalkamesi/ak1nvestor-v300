#!/usr/bin/env node
/** _r236-u36-a3m-hamta.mjs — hämta StockAnalysis BME A3M (Atresmedia) tre återstående paneler
 *  (quote redan hämtad i rond 235: /tmp/r235-a3m/). BME/EUR (CLN.MC-precedensen). */
import { writeFileSync, mkdirSync, copyFileSync } from "node:fs";
mkdirSync("/tmp/r236-a3m", { recursive: true });
copyFileSync('/tmp/r235-a3m/quote.html', '/tmp/r236-a3m/quote.html');
copyFileSync('/tmp/r235-a3m/quote.plain.txt', '/tmp/r236-a3m/quote.plain.txt');
const UA = "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36";
const sidor = [
  ["statistics", "https://stockanalysis.com/quote/bme/A3M/statistics/"],
  ["financials", "https://stockanalysis.com/quote/bme/A3M/financials/"],
  ["cashflow", "https://stockanalysis.com/quote/bme/A3M/financials/cash-flow-statement/"],
];
for (const [namn, url] of sidor) {
  try {
    const r = await fetch(url, { headers: { "user-agent": UA, "accept": "text/html", "cache-control": "no-cache" }, redirect: "follow" });
    const html = await r.text();
    writeFileSync(`/tmp/r236-a3m/${namn}.html`, html);
    let plain = html.replace(/<script[\s\S]*?<\/script>/g, " ").replace(/<style[\s\S]*?<\/style>/g, " ");
    plain = plain.replace(/<[^>]+>/g, "\n").replace(/&amp;/g, "&").replace(/&nbsp;/g, " ").replace(/&#x27;/g, "'");
    const rader = plain.split("\n").map((r) => r.trim()).filter((r) => r.length > 1);
    writeFileSync(`/tmp/r236-a3m/${namn}.plain.txt`, rader.join("\n"));
    const ar404 = rader.slice(0, 3).join(' ').includes('404');
    console.log(`${namn}: HTTP ${r.status} · ${rader.length} textrader${ar404 ? ' · 404-VARNING' : ''}`);
  } catch (e) {
    console.log(`${namn}: FEL ${e.message}`);
  }
}
