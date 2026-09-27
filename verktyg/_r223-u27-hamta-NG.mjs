#!/usr/bin/env node
/** _r223-u27-hamta-NG.mjs — hämta StockAnalysis LON NG (National Grid) fyra paneler via __NEXT_DATA__. */
import { writeFileSync, mkdirSync } from "node:fs";
mkdirSync("/tmp/r223-ng", { recursive: true });
const UA = "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36";
const sidor = [
  ["quote", "https://stockanalysis.com/quote/lon/NG/"],
  ["statistics", "https://stockanalysis.com/quote/lon/NG/statistics/"],
  ["financials", "https://stockanalysis.com/quote/lon/NG/financials/"],
  ["cashflow", "https://stockanalysis.com/quote/lon/NG/financials/cash-flow-statement/"],
];
for (const [namn, url] of sidor) {
  try {
    const r = await fetch(url, { headers: { "user-agent": UA, "accept": "text/html", "cache-control": "no-cache" }, redirect: "follow" });
    const html = await r.text();
    const m = html.match(/<script id="__NEXT_DATA__" type="application\/json">([\s\S]*?)<\/script>/);
    if (!m) {
      writeFileSync(`/tmp/r223-ng/${namn}.html`, html);
      console.log(`${namn}: HTTP ${r.status}, ${html.length} tecken, INGEN __NEXT_DATA__ (sparad html)`);
      continue;
    }
    writeFileSync(`/tmp/r223-ng/${namn}.json`, m[1]);
    const j = JSON.parse(m[1]);
    console.log(`${namn}: HTTP ${r.status} · __NEXT_DATA__ ${m[1].length} tecken · props-nycklar: ` + Object.keys(j.props?.pageProps ?? {}).join(","));
  } catch (e) {
    console.log(`${namn}: FEL ${e.message}`);
  }
}
