#!/usr/bin/env node
/** _r234-u35-puig-hamta.mjs — hämta StockAnalysis BME PUIG tre återstående paneler
 *  (quote redan hämtad i rond 233-sonden: /tmp/r233-u35/PUIG.*). BME/EUR (ITX.MC-precedensen). */
import { writeFileSync, mkdirSync, copyFileSync } from "node:fs";
mkdirSync("/tmp/r234-puig", { recursive: true });
copyFileSync('/tmp/r233-u35/PUIG.html', '/tmp/r234-puig/quote.html');
copyFileSync('/tmp/r233-u35/PUIG.plain.txt', '/tmp/r234-puig/quote.plain.txt');
const UA = "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36";
const sidor = [
  ["statistics", "https://stockanalysis.com/quote/bme/PUIG/statistics/"],
  ["financials", "https://stockanalysis.com/quote/bme/PUIG/financials/"],
  ["cashflow", "https://stockanalysis.com/quote/bme/PUIG/financials/cash-flow-statement/"],
];
for (const [namn, url] of sidor) {
  try {
    const r = await fetch(url, { headers: { "user-agent": UA, "accept": "text/html", "cache-control": "no-cache" }, redirect: "follow" });
    const html = await r.text();
    writeFileSync(`/tmp/r234-puig/${namn}.html`, html);
    let plain = html.replace(/<script[\s\S]*?<\/script>/g, " ").replace(/<style[\s\S]*?<\/style>/g, " ");
    plain = plain.replace(/<[^>]+>/g, "\n").replace(/&amp;/g, "&").replace(/&nbsp;/g, " ").replace(/&#x27;/g, "'");
    const rader = plain.split("\n").map((r) => r.trim()).filter((r) => r.length > 1);
    writeFileSync(`/tmp/r234-puig/${namn}.plain.txt`, rader.join("\n"));
    console.log(`${namn}: HTTP ${r.status} · ${rader.length} textrader`);
  } catch (e) {
    console.log(`${namn}: FEL ${e.message}`);
  }
}
