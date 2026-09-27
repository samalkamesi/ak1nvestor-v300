#!/usr/bin/env node
/** _r246-u43-pub-hamta.mjs — hämta StockAnalysis EPA PUB (Publicis) FYRA paneler
 *  för U43-inlägget (kommunikation 1→2: Orange nätet + Publicis budskapet). */
import { writeFileSync, mkdirSync } from "node:fs";
mkdirSync("/tmp/r246-pub", { recursive: true });
const UA = "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36";
const sidor = [
  ["quote", "https://stockanalysis.com/quote/epa/PUB/"],
  ["statistics", "https://stockanalysis.com/quote/epa/PUB/statistics/"],
  ["financials", "https://stockanalysis.com/quote/epa/PUB/financials/"],
  ["cashflow", "https://stockanalysis.com/quote/epa/PUB/financials/cash-flow-statement/"],
];
for (const [namn, url] of sidor) {
  try {
    const r = await fetch(url, { headers: { "user-agent": UA, accept: "text/html", "cache-control": "no-cache" }, redirect: "follow" });
    const html = await r.text();
    writeFileSync(`/tmp/r246-pub/${namn}.html`, html);
    let plain = html.replace(/<script[\s\S]*?<\/script>/g, " ").replace(/<style[\s\S]*?<\/style>/g, " ");
    plain = plain.replace(/<[^>]+>/g, "\n").replace(/&amp;/g, "&").replace(/&nbsp;/g, " ").replace(/&#x27;/g, "'");
    const rader = plain.split("\n").map((r) => r.trim()).filter((r) => r.length > 1);
    writeFileSync(`/tmp/r246-pub/${namn}.plain.txt`, rader.join("\n"));
    console.log(`${namn}: HTTP ${r.status} · ${rader.length} textrader`);
  } catch (e) {
    console.log(`${namn}: FEL ${e.message}`);
  }
}
