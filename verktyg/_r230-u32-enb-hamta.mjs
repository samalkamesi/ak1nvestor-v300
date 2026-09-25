#!/usr/bin/env node
/** _r230-u32-enb-hamta.mjs — hämta StockAnalysis TSX ENB (Enbridge) tre återstående paneler
 *  (quote redan hämtad i rond 229-sonden: /tmp/r229-u32/ENB.*). TSX/CAD-precedensen (BCE/NTR). */
import { writeFileSync, mkdirSync, copyFileSync } from "node:fs";
mkdirSync("/tmp/r230-enb", { recursive: true });
copyFileSync('/tmp/r229-u32/ENB.html', '/tmp/r230-enb/quote.html');
copyFileSync('/tmp/r229-u32/ENB.plain.txt', '/tmp/r230-enb/quote.plain.txt');
const UA = "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36";
const sidor = [
  ["statistics", "https://stockanalysis.com/quote/tsx/ENB/statistics/"],
  ["financials", "https://stockanalysis.com/quote/tsx/ENB/financials/"],
  ["cashflow", "https://stockanalysis.com/quote/tsx/ENB/financials/cash-flow-statement/"],
];
for (const [namn, url] of sidor) {
  try {
    const r = await fetch(url, { headers: { "user-agent": UA, "accept": "text/html", "cache-control": "no-cache" }, redirect: "follow" });
    const html = await r.text();
    writeFileSync(`/tmp/r230-enb/${namn}.html`, html);
    let plain = html.replace(/<script[\s\S]*?<\/script>/g, " ").replace(/<style[\s\S]*?<\/style>/g, " ");
    plain = plain.replace(/<[^>]+>/g, "\n").replace(/&amp;/g, "&").replace(/&nbsp;/g, " ").replace(/&#x27;/g, "'");
    const rader = plain.split("\n").map((r) => r.trim()).filter((r) => r.length > 1);
    writeFileSync(`/tmp/r230-enb/${namn}.plain.txt`, rader.join("\n"));
    console.log(`${namn}: HTTP ${r.status} · ${rader.length} textrader`);
  } catch (e) {
    console.log(`${namn}: FEL ${e.message}`);
  }
}
