#!/usr/bin/env node
/** _r249-infy-inr-test.mjs — testa om källan kan visa financials/cashflow i INR (TCS-precedensen). */
import { writeFileSync, mkdirSync } from "node:fs";
mkdirSync("/tmp/r249-infy", { recursive: true });
const UA = "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36";
const sidor = [
  ["financials-inr", "https://stockanalysis.com/quote/nse/INFY/financials/?currency=INR"],
  ["cashflow-inr", "https://stockanalysis.com/quote/nse/INFY/financials/cash-flow-statement/?currency=INR"],
];
for (const [namn, url] of sidor) {
  try {
    const r = await fetch(url, { headers: { "user-agent": UA, "accept": "text/html", "cache-control": "no-cache" }, redirect: "follow" });
    const html = await r.text();
    let plain = html.replace(/<script[\s\S]*?<\/script>/g, " ").replace(/<style[\s\S]*?<\/style>/g, " ");
    plain = plain.replace(/<[^>]+>/g, "\n").replace(/&amp;/g, "&").replace(/&nbsp;/g, " ").replace(/&#x27;/g, "'");
    const rader = plain.split("\n").map((r) => r.trim()).filter((r) => r.length > 1);
    writeFileSync(`/tmp/r249-infy/${namn}.plain.txt`, rader.join("\n"));
    const val = rader.find(x => /[Ff]inancials in|Cash Flow in|millions|INR|USD/.test(x) && x.length < 80);
    const rev = rader.indexOf('Revenue');
    console.log(`${namn}: HTTP ${r.status} · valutadetalj: "${val}" · runtom Revenue: ${rader.slice(rev, rev + 10).join(' | ')}`);
  } catch (e) { console.log(`${namn}: FEL ${e.message}`); }
}
