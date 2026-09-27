#!/usr/bin/env node
/** _r226-u30-hamta.mjs — hämta StockAnalysis LON SN (Smith & Nephew) fyra paneler + extrahera läsbar text. */
import { writeFileSync, mkdirSync } from "node:fs";
mkdirSync("/tmp/r226-sn", { recursive: true });
const UA = "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36";
const sidor = [
  ["quote", "https://stockanalysis.com/quote/lon/SN/"],
  ["statistics", "https://stockanalysis.com/quote/lon/SN/statistics/"],
  ["financials", "https://stockanalysis.com/quote/lon/SN/financials/"],
  ["cashflow", "https://stockanalysis.com/quote/lon/SN/financials/cash-flow-statement/"],
];
for (const [namn, url] of sidor) {
  try {
    const r = await fetch(url, { headers: { "user-agent": UA, "accept": "text/html", "cache-control": "no-cache" }, redirect: "follow" });
    const html = await r.text();
    writeFileSync(`/tmp/r226-sn/${namn}.html`, html);
    let plain = html.replace(/<script[\s\S]*?<\/script>/g, " ").replace(/<style[\s\S]*?<\/style>/g, " ");
    plain = plain.replace(/<[^>]+>/g, "\n").replace(/&amp;/g, "&").replace(/&nbsp;/g, " ").replace(/&#x27;/g, "'");
    const rader = plain.split("\n").map((r) => r.trim()).filter((r) => r.length > 1);
    writeFileSync(`/tmp/r226-sn/${namn}.plain.txt`, rader.join("\n"));
    console.log(`${namn}: HTTP ${r.status} · ${rader.length} textrader`);
  } catch (e) {
    console.log(`${namn}: FEL ${e.message}`);
  }
}
