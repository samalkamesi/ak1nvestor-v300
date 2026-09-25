#!/usr/bin/env node
/** _r249-infy-hamta.mjs — U44: hämta StockAnalysis NSE INFY (Infosys) fyra paneler.
 *  Quote finns från rond 248-sonden (/tmp/r248-sond/INFY.*) — kopieras; tre hämtas färska.
 *  NSE/INR med TCS.NS-precedensen (räkenskapsår april–mars, slutårsetikett). */
import { writeFileSync, mkdirSync, copyFileSync } from "node:fs";
mkdirSync("/tmp/r249-infy", { recursive: true });
copyFileSync('/tmp/r248-sond/INFY.html', '/tmp/r249-infy/quote.html');
copyFileSync('/tmp/r248-sond/INFY.plain.txt', '/tmp/r249-infy/quote.plain.txt');
const UA = "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36";
const sidor = [
  ["statistics", "https://stockanalysis.com/quote/nse/INFY/statistics/"],
  ["financials", "https://stockanalysis.com/quote/nse/INFY/financials/"],
  ["cashflow", "https://stockanalysis.com/quote/nse/INFY/financials/cash-flow-statement/"],
];
for (const [namn, url] of sidor) {
  try {
    const r = await fetch(url, { headers: { "user-agent": UA, "accept": "text/html", "cache-control": "no-cache" }, redirect: "follow" });
    const html = await r.text();
    writeFileSync(`/tmp/r249-infy/${namn}.html`, html);
    let plain = html.replace(/<script[\s\S]*?<\/script>/g, " ").replace(/<style[\s\S]*?<\/style>/g, " ");
    plain = plain.replace(/<[^>]+>/g, "\n").replace(/&amp;/g, "&").replace(/&nbsp;/g, " ").replace(/&#x27;/g, "'");
    const rader = plain.split("\n").map((r) => r.trim()).filter((r) => r.length > 1);
    writeFileSync(`/tmp/r249-infy/${namn}.plain.txt`, rader.join("\n"));
    console.log(`${namn}: HTTP ${r.status} · ${rader.length} textrader`);
  } catch (e) {
    console.log(`${namn}: FEL ${e.message}`);
  }
}
