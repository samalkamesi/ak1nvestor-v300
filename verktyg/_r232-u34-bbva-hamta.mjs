#!/usr/bin/env node
/** _r232-u34-bbva-hamta.mjs — hämta StockAnalysis BME BBVA tre återstående paneler
 *  (quote redan hämtad i rond 229-sonden: /tmp/r229-u32/BBVA.*). BME/EUR-precedensen (SAN.MC-klassen). */
import { writeFileSync, mkdirSync, copyFileSync } from "node:fs";
mkdirSync("/tmp/r232-bbva", { recursive: true });
copyFileSync('/tmp/r229-u32/BBVA.html', '/tmp/r232-bbva/quote.html');
copyFileSync('/tmp/r229-u32/BBVA.plain.txt', '/tmp/r232-bbva/quote.plain.txt');
const UA = "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36";
const sidor = [
  ["statistics", "https://stockanalysis.com/quote/bme/BBVA/statistics/"],
  ["financials", "https://stockanalysis.com/quote/bme/BBVA/financials/"],
  ["cashflow", "https://stockanalysis.com/quote/bme/BBVA/financials/cash-flow-statement/"],
];
for (const [namn, url] of sidor) {
  try {
    const r = await fetch(url, { headers: { "user-agent": UA, "accept": "text/html", "cache-control": "no-cache" }, redirect: "follow" });
    const html = await r.text();
    writeFileSync(`/tmp/r232-bbva/${namn}.html`, html);
    let plain = html.replace(/<script[\s\S]*?<\/script>/g, " ").replace(/<style[\s\S]*?<\/style>/g, " ");
    plain = plain.replace(/<[^>]+>/g, "\n").replace(/&amp;/g, "&").replace(/&nbsp;/g, " ").replace(/&#x27;/g, "'");
    const rader = plain.split("\n").map((r) => r.trim()).filter((r) => r.length > 1);
    writeFileSync(`/tmp/r232-bbva/${namn}.plain.txt`, rader.join("\n"));
    console.log(`${namn}: HTTP ${r.status} · ${rader.length} textrader`);
  } catch (e) {
    console.log(`${namn}: FEL ${e.message}`);
  }
}
