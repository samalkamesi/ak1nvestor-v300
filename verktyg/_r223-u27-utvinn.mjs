#!/usr/bin/env node
/** _r223-u27-utvinn.mjs — utvinn rådata ur sparade NG-sidor: hitta skript-chunkar med nyckeltal. */
import { readFileSync, writeFileSync, readdirSync } from "node:fs";
const dir = "/tmp/r223-ng";
for (const f of readdirSync(dir).filter((x) => x.endsWith(".html"))) {
  const html = readFileSync(`${dir}/${f}`, "utf8");
  // App Router: self.__next_f.push([1,"..."]) — slå ihop alla sträng-chunkar
  const chunks = [...html.matchAll(/self\.__next_f\.push\(\[1,(".*?")\]\)/gs)].map((m) => m[1]);
  let blob = "";
  for (const c of chunks) {
    try { blob += JSON.parse(c); } catch { /* delvis escape — hoppa över */ }
  }
  writeFileSync(`${dir}/${f.replace(".html", "")}.blob.txt`, blob);
  console.log(`${f}: ${chunks.length} chunkar · blob ${blob.length} tecken`);
  const nycklar = ["marketCap","peRatio","currentPrice","close","previousClose","eps","dividend","beta","enterpriseValue","totalDebt","cash","roe","roic","grossMargin","operatingMargin","netMargin","fcfMargin","fcfYield","payoutRatio","debtEquity","altmanZ","wacc","nextEarningsDate","revenueGrowth","fiscalYear","priceGBX","sharesOutstanding","dayRange","week52Range"];
  const hittade = nycklar.filter((k) => blob.includes(`"${k}"`) || blob.includes(`${k}:`));
  console.log("  nycklar hittade: " + hittade.join(", "));
}
