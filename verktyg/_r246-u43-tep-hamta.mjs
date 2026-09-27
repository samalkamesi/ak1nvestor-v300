#!/usr/bin/env node
/** _r246-u43-tep-hamta.mjs — hämta StockAnalysis EPA TEP (Teleperformance) FYRA paneler
 *  (quote + statistics + financials + cashflow) + skriv ut SEKTOR-raderna för
 *  U43-villkoret (källans sektor får ej visa Industrials — rond 245:s dokumenterade villkor). */
import { writeFileSync, mkdirSync } from "node:fs";
mkdirSync("/tmp/r246-tep", { recursive: true });
const UA = "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36";
const sidor = [
  ["quote", "https://stockanalysis.com/quote/epa/TEP/"],
  ["statistics", "https://stockanalysis.com/quote/epa/TEP/statistics/"],
  ["financials", "https://stockanalysis.com/quote/epa/TEP/financials/"],
  ["cashflow", "https://stockanalysis.com/quote/epa/TEP/financials/cash-flow-statement/"],
];
for (const [namn, url] of sidor) {
  try {
    const r = await fetch(url, { headers: { "user-agent": UA, "accept": "text/html", "cache-control": "no-cache" }, redirect: "follow" });
    const html = await r.text();
    writeFileSync(`/tmp/r246-tep/${namn}.html`, html);
    let plain = html.replace(/<script[\s\S]*?<\/script>/g, " ").replace(/<style[\s\S]*?<\/style>/g, " ");
    plain = plain.replace(/<[^>]+>/g, "\n").replace(/&amp;/g, "&").replace(/&nbsp;/g, " ").replace(/&#x27;/g, "'");
    const rader = plain.split("\n").map((r) => r.trim()).filter((r) => r.length > 1);
    writeFileSync(`/tmp/r246-tep/${namn}.plain.txt`, rader.join("\n"));
    console.log(`${namn}: HTTP ${r.status} · ${rader.length} textrader`);
  } catch (e) {
    console.log(`${namn}: FEL ${e.message}`);
  }
}
// SEKTOR-VILLKORET: visa alla rader omkring Sector/Industry ur quote-panelen
const q = (await import("node:fs")).readFileSync("/tmp/r246-tep/quote.plain.txt", "utf8").split("\n");
const ix = q.map((r, i) => [r, i]).filter(([r]) => /^(sector|industry)$/i.test(r));
for (const [rad, i] of ix) {
  console.log(`VILLKOR quote[${i}] ${rad}: ${q[i + 1] ?? "?"} | ${q[i + 2] ?? ""} | ${q[i + 3] ?? ""}`);
}
const hittar = q.some((r) => /^Industrials$/i.test(r.trim()));
console.log(hittar ? "SEKTORVAKT: Industrials syns i quote-panelen — se tolkning" : "SEKTORVAKT: Ingen ren Industrials-rad i quote — tolka kontexten ovan");
