#!/usr/bin/env node
/** _r242-u39-el-hamta.mjs — hämta StockAnalysis EPA EL (EssilorLuxottica) tre återstående paneler
 *  (quote redan hämtad i rond 240-sonden: /tmp/r240-frk/EL.*). EPA/EUR (SAN.PA-precedensen). */
import { writeFileSync, mkdirSync, copyFileSync } from "node:fs";
mkdirSync("/tmp/r242-el", { recursive: true });
copyFileSync('/tmp/r240-frk/EL.html', '/tmp/r242-el/quote.html');
copyFileSync('/tmp/r240-frk/EL.plain.txt', '/tmp/r242-el/quote.plain.txt');
const UA = "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36";
const sidor = [
  ["statistics", "https://stockanalysis.com/quote/epa/EL/statistics/"],
  ["financials", "https://stockanalysis.com/quote/epa/EL/financials/"],
  ["cashflow", "https://stockanalysis.com/quote/epa/EL/financials/cash-flow-statement/"],
];
for (const [namn, url] of sidor) {
  try {
    const r = await fetch(url, { headers: { "user-agent": UA, "accept": "text/html", "cache-control": "no-cache" }, redirect: "follow" });
    const html = await r.text();
    writeFileSync(`/tmp/r242-el/${namn}.html`, html);
    let plain = html.replace(/<script[\s\S]*?<\/script>/g, " ").replace(/<style[\s\S]*?<\/style>/g, " ");
    plain = plain.replace(/<[^>]+>/g, "\n").replace(/&amp;/g, "&").replace(/&nbsp;/g, " ").replace(/&#x27;/g, "'");
    const rader = plain.split("\n").map((r) => r.trim()).filter((r) => r.length > 1);
    writeFileSync(`/tmp/r242-el/${namn}.plain.txt`, rader.join("\n"));
    console.log(`${namn}: HTTP ${r.status} · ${rader.length} textrader`);
  } catch (e) {
    console.log(`${namn}: FEL ${e.message}`);
  }
}
