#!/usr/bin/env node
/** _r231-u33-td-hamta.mjs — hämta StockAnalysis TSX TD (Toronto-Dominion) tre återstående paneler
 *  (quote redan hämtad i rond 229-sonden: /tmp/r229-u32/TD.*) + visa RY/SAN-bankmallens fälttyper. */
import { writeFileSync, mkdirSync, copyFileSync, readFileSync } from "node:fs";
mkdirSync("/tmp/r231-td", { recursive: true });
copyFileSync('/tmp/r229-u32/TD.html', '/tmp/r231-td/quote.html');
copyFileSync('/tmp/r229-u32/TD.plain.txt', '/tmp/r231-td/quote.plain.txt');
const UA = "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36";
const sidor = [
  ["statistics", "https://stockanalysis.com/quote/tsx/TD/statistics/"],
  ["financials", "https://stockanalysis.com/quote/tsx/TD/financials/"],
  ["cashflow", "https://stockanalysis.com/quote/tsx/TD/financials/cash-flow-statement/"],
];
for (const [namn, url] of sidor) {
  try {
    const r = await fetch(url, { headers: { "user-agent": UA, "accept": "text/html", "cache-control": "no-cache" }, redirect: "follow" });
    const html = await r.text();
    writeFileSync(`/tmp/r231-td/${namn}.html`, html);
    let plain = html.replace(/<script[\s\S]*?<\/script>/g, " ").replace(/<style[\s\S]*?<\/style>/g, " ");
    plain = plain.replace(/<[^>]+>/g, "\n").replace(/&amp;/g, "&").replace(/&nbsp;/g, " ").replace(/&#x27;/g, "'");
    const rader = plain.split("\n").map((r) => r.trim()).filter((r) => r.length > 1);
    writeFileSync(`/tmp/r231-td/${namn}.plain.txt`, rader.join("\n"));
    console.log(`${namn}: HTTP ${r.status} · ${rader.length} textrader`);
  } catch (e) {
    console.log(`${namn}: FEL ${e.message}`);
  }
}

// Bankmall: RY-radens (Kanada/finans) och SAN.MC-radens fälttyper
const u = JSON.parse(readFileSync('data/portfolj-system/bolagsunivers.json', 'utf8'));
for (const t of ['RY', 'SAN.MC']) {
  const r = u.find(b => b.ticker === t);
  if (!r) continue;
  console.log(`\n── BANKMALL ${t} (${r.namn}) ──`);
  console.log(`valuta=${r.valuta} · pris=${r.pris} · mcap=${r.marknadsKapitalMdr} · moat=${JSON.stringify(r.moat)}`);
  console.log(`lonksamhet=${JSON.stringify(r.lonksamhet)}`);
  console.log(`stabilitet=${JSON.stringify(r.stabilitet)}`);
  console.log(`aterkop=${JSON.stringify(r.aterkop)}`);
  console.log(`vardering=${JSON.stringify(r.vardering)}`);
  console.log(`serier.ar=${JSON.stringify(r.serier.ar)} · oms=${JSON.stringify(r.serier.omsattning)} · res=${JSON.stringify(r.serier.resultat)} · fcf=${JSON.stringify(r.serier.fcf)}`);
  console.log(`notering (första 400)=${(r.notering || '').slice(0, 400)}`);
}
