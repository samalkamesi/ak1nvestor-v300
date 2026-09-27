#!/usr/bin/env node
/** _r238-u37-ifx-hamta.mjs — hämta StockAnalysis ETR IFX (Infineon) tre återstående paneler
 *  (quote redan hämtad i rond 237-sonden: /tmp/r237-ifx/). ETR/EUR (SAP.DE-precedensen). */
import { writeFileSync, mkdirSync, copyFileSync } from "node:fs";
mkdirSync("/tmp/r238-ifx", { recursive: true });
copyFileSync('/tmp/r237-ifx/quote.html', '/tmp/r238-ifx/quote.html');
copyFileSync('/tmp/r237-ifx/quote.plain.txt', '/tmp/r238-ifx/quote.plain.txt');
const UA = "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36";
const sidor = [
  ["statistics", "https://stockanalysis.com/quote/etr/IFX/statistics/"],
  ["financials", "https://stockanalysis.com/quote/etr/IFX/financials/"],
  ["cashflow", "https://stockanalysis.com/quote/etr/IFX/financials/cash-flow-statement/"],
];
for (const [namn, url] of sidor) {
  try {
    const r = await fetch(url, { headers: { "user-agent": UA, "accept": "text/html", "cache-control": "no-cache" }, redirect: "follow" });
    const html = await r.text();
    writeFileSync(`/tmp/r238-ifx/${namn}.html`, html);
    let plain = html.replace(/<script[\s\S]*?<\/script>/g, " ").replace(/<style[\s\S]*?<\/style>/g, " ");
    plain = plain.replace(/<[^>]+>/g, "\n").replace(/&amp;/g, "&").replace(/&nbsp;/g, " ").replace(/&#x27;/g, "'");
    const rader = plain.split("\n").map((r) => r.trim()).filter((r) => r.length > 1);
    writeFileSync(`/tmp/r238-ifx/${namn}.plain.txt`, rader.join("\n"));
    console.log(`${namn}: HTTP ${r.status} · ${rader.length} textrader`);
  } catch (e) {
    console.log(`${namn}: FEL ${e.message}`);
  }
}
