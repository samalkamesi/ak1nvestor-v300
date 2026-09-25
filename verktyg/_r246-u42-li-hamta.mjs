#!/usr/bin/env node
/** _r246-u42-li-hamta.mjs — hämta StockAnalysis EPA LI (Klepierre) tre återstående paneler
 *  (quote redan hämtad i rond 245-sonden: /tmp/r245-sond/LI.*) + visa fastighetsmallen (VNA.DE/AT1.DE). */
import { writeFileSync, mkdirSync, copyFileSync, readFileSync } from "node:fs";
mkdirSync("/tmp/r246-li", { recursive: true });
copyFileSync('/tmp/r245-sond/LI.html', '/tmp/r246-li/quote.html');
copyFileSync('/tmp/r245-sond/LI.plain.txt', '/tmp/r246-li/quote.plain.txt');
const UA = "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36";
const sidor = [
  ["statistics", "https://stockanalysis.com/quote/epa/LI/statistics/"],
  ["financials", "https://stockanalysis.com/quote/epa/LI/financials/"],
  ["cashflow", "https://stockanalysis.com/quote/epa/LI/financials/cash-flow-statement/"],
];
for (const [namn, url] of sidor) {
  try {
    const r = await fetch(url, { headers: { "user-agent": UA, "accept": "text/html", "cache-control": "no-cache" }, redirect: "follow" });
    const html = await r.text();
    writeFileSync(`/tmp/r246-li/${namn}.html`, html);
    let plain = html.replace(/<script[\s\S]*?<\/script>/g, " ").replace(/<style[\s\S]*?<\/style>/g, " ");
    plain = plain.replace(/<[^>]+>/g, "\n").replace(/&amp;/g, "&").replace(/&nbsp;/g, " ").replace(/&#x27;/g, "'");
    const rader = plain.split("\n").map((r) => r.trim()).filter((r) => r.length > 1);
    writeFileSync(`/tmp/r246-li/${namn}.plain.txt`, rader.join("\n"));
    console.log(`${namn}: HTTP ${r.status} · ${rader.length} textrader`);
  } catch (e) {
    console.log(`${namn}: FEL ${e.message}`);
  }
}

// Fastighetsmallen: VNA.DE + AT1.DE (hur ser en fastighetsrad ut?)
const u = JSON.parse(readFileSync('data/portfolj-system/bolagsunivers.json', 'utf8'));
for (const t of ['VNA.DE', 'AT1.DE', 'URW.PA']) {
  const r = u.find(b => b.ticker === t);
  if (!r) continue;
  console.log(`\n── FASTIGHETSMALL ${t} (${r.namn.slice(0, 30)}) ──`);
  console.log(`valuta=${r.valuta} · pris=${r.pris} · mcap=${r.marknadsKapitalMdr}`);
  console.log(`lonksamhet=${JSON.stringify(r.lonksamhet)}`);
  console.log(`stabilitet=${JSON.stringify(r.stabilitet)}`);
  console.log(`aterkop=${JSON.stringify(r.aterkop)}`);
  console.log(`vardering=${JSON.stringify(r.vardering)}`);
  console.log(`moat=${JSON.stringify(r.moat)}`);
  console.log(`serier.ar=${JSON.stringify(r.serier.ar)} · oms=${JSON.stringify(r.serier.omsattning.map(x => x / 1e6))} · res=${JSON.stringify(r.serier.resultat.map(x => x / 1e6))} · fcf=${JSON.stringify(r.serier.fcf.map(x => x / 1e6))}`);
  console.log(`notering (första 300)=${(r.notering || '').slice(0, 300)}`);
}
