#!/usr/bin/env node
/** _r255-hal-hamta.mjs — U50: hämta StockAnalysis NSE HAL-paneler (LT+HAL duon, industri 1→2).
 *  Quote från rond 248-sonden om den lever, annars färsk. NSE/INR med LT.NS-precedensen. */
import { writeFileSync, mkdirSync, copyFileSync, existsSync } from "node:fs";
mkdirSync("/tmp/r255-hal", { recursive: true });
if (existsSync('/tmp/r248-sond/HAL.html')) {
  copyFileSync('/tmp/r248-sond/HAL.html', '/tmp/r255-hal/quote.html');
  if (existsSync('/tmp/r248-sond/HAL.plain.txt')) copyFileSync('/tmp/r248-sond/HAL.plain.txt', '/tmp/r255-hal/quote.plain.txt');
  console.log('quote: kopierad ur r248-sonden');
}
const UA = "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36";
const sidor = [
  ["quote", "https://stockanalysis.com/quote/nse/HAL/"],
  ["statistics", "https://stockanalysis.com/quote/nse/HAL/statistics/"],
  ["financials", "https://stockanalysis.com/quote/nse/HAL/financials/"],
  ["cashflow", "https://stockanalysis.com/quote/nse/HAL/financials/cash-flow-statement/"],
  ["balans", "https://stockanalysis.com/quote/nse/HAL/financials/balance-sheet/"],
];
for (const [namn, url] of sidor) {
  if (namn === 'quote' && existsSync('/tmp/r255-hal/quote.html')) continue;
  try {
    const r = await fetch(url, { headers: { "user-agent": UA, "accept": "text/html", "cache-control": "no-cache" }, redirect: "follow" });
    const html = await r.text();
    writeFileSync(`/tmp/r255-hal/${namn}.html`, html);
    let plain = html.replace(/<script[\s\S]*?<\/script>/g, " ").replace(/<style[\s\S]*?<\/style>/g, " ");
    plain = plain.replace(/<[^>]+>/g, "\n").replace(/&amp;/g, "&").replace(/&nbsp;/g, " ").replace(/&#x27;/g, "'");
    const rader = plain.split("\n").map((r) => r.trim()).filter((r) => r.length > 1);
    writeFileSync(`/tmp/r255-hal/${namn}.plain.txt`, rader.join("\n"));
    console.log(`${namn}: HTTP ${r.status} · ${rader.length} textrader`);
  } catch (e) {
    console.log(`${namn}: FEL ${e.message}`);
  }
}
