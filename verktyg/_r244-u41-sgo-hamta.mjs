#!/usr/bin/env node
/** _r244-u41-sgo-hamta.mjs — hämta StockAnalysis EPA SGO (Saint-Gobain) tre återstående paneler
 *  (quote redan hämtad i rond 240-sonden: /tmp/r240-frk/SGO.*). EPA/EUR (AI.PA-precedensen). */
import { writeFileSync, mkdirSync, copyFileSync } from "node:fs";
mkdirSync("/tmp/r244-sgo", { recursive: true });
copyFileSync('/tmp/r240-frk/SGO.html', '/tmp/r244-sgo/quote.html');
copyFileSync('/tmp/r240-frk/SGO.plain.txt', '/tmp/r244-sgo/quote.plain.txt');
const UA = "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36";
const sidor = [
  ["statistics", "https://stockanalysis.com/quote/epa/SGO/statistics/"],
  ["financials", "https://stockanalysis.com/quote/epa/SGO/financials/"],
  ["cashflow", "https://stockanalysis.com/quote/epa/SGO/financials/cash-flow-statement/"],
];
for (const [namn, url] of sidor) {
  try {
    const r = await fetch(url, { headers: { "user-agent": UA, "accept": "text/html", "cache-control": "no-cache" }, redirect: "follow" });
    const html = await r.text();
    writeFileSync(`/tmp/r244-sgo/${namn}.html`, html);
    let plain = html.replace(/<script[\s\S]*?<\/script>/g, " ").replace(/<style[\s\S]*?<\/style>/g, " ");
    plain = plain.replace(/<[^>]+>/g, "\n").replace(/&amp;/g, "&").replace(/&nbsp;/g, " ").replace(/&#x27;/g, "'");
    const rader = plain.split("\n").map((r) => r.trim()).filter((r) => r.length > 1);
    writeFileSync(`/tmp/r244-sgo/${namn}.plain.txt`, rader.join("\n"));
    console.log(`${namn}: HTTP ${r.status} · ${rader.length} textrader`);
  } catch (e) {
    console.log(`${namn}: FEL ${e.message}`);
  }
}
