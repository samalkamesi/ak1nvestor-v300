#!/usr/bin/env node
/** _r228-u31-pson-hamta.mjs — hämta StockAnalysis LON PSON (Pearson) tre återstående paneler (quote redan hämtad i triappen). */
import { writeFileSync, mkdirSync, copyFileSync } from "node:fs";
mkdirSync("/tmp/r228-pson", { recursive: true });
copyFileSync('/tmp/r228-trio/PSON.html', '/tmp/r228-pson/quote.html');
copyFileSync('/tmp/r228-trio/PSON.plain.txt', '/tmp/r228-pson/quote.plain.txt');
const UA = "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36";
const sidor = [
  ["statistics", "https://stockanalysis.com/quote/lon/PSON/statistics/"],
  ["financials", "https://stockanalysis.com/quote/lon/PSON/financials/"],
  ["cashflow", "https://stockanalysis.com/quote/lon/PSON/financials/cash-flow-statement/"],
];
for (const [namn, url] of sidor) {
  try {
    const r = await fetch(url, { headers: { "user-agent": UA, "accept": "text/html", "cache-control": "no-cache" }, redirect: "follow" });
    const html = await r.text();
    writeFileSync(`/tmp/r228-pson/${namn}.html`, html);
    let plain = html.replace(/<script[\s\S]*?<\/script>/g, " ").replace(/<style[\s\S]*?<\/style>/g, " ");
    plain = plain.replace(/<[^>]+>/g, "\n").replace(/&amp;/g, "&").replace(/&nbsp;/g, " ").replace(/&#x27;/g, "'");
    const rader = plain.split("\n").map((r) => r.trim()).filter((r) => r.length > 1);
    writeFileSync(`/tmp/r228-pson/${namn}.plain.txt`, rader.join("\n"));
    console.log(`${namn}: HTTP ${r.status} · ${rader.length} textrader`);
  } catch (e) {
    console.log(`${namn}: FEL ${e.message}`);
  }
}
