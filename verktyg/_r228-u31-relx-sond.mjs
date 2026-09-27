#!/usr/bin/env node
/** _r228-u31-relx-sond.mjs — reserv 2: RELX.L — kollisionskontroll (universumet) + färsk quote-panel (P/E-bärarkontroll). */
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
const ROT = '/home/ak1a/agent/ak1';

// (1) Kollisionskontroll i universumet: RELX/REL-tickers + namn
const rader = JSON.parse(readFileSync(`${ROT}/data/portfolj-system/bolagsunivers.json`, 'utf8'));
const traf = rader.filter(r => /RELX|REL\b/i.test(r.ticker || '') || /relx|reed elsevier/i.test(r.namn || ''));
console.log(`KOLLISIONSKONTROLL RELX: ${traf.length} träffar${traf.length ? ' — ' + traf.map(r => `${r.ticker} ${r.namn} [${r.land}/${r.bransch}]`).join(' | ') : ' — REN kandidat'}`);

// (2) Färsk quote-panel
mkdirSync('/tmp/r228-relx', { recursive: true });
const UA = "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36";
const r = await fetch('https://stockanalysis.com/quote/lon/REL/', { headers: { "user-agent": UA, "accept": "text/html", "cache-control": "no-cache" }, redirect: "follow" });
const html = await r.text();
writeFileSync('/tmp/r228-relx/quote.html', html);
let plain = html.replace(/<script[\s\S]*?<\/script>/g, ' ').replace(/<style[\s\S]*?<\/style>/g, ' ');
plain = plain.replace(/<[^>]+>/g, '\n').replace(/&amp;/g, '&').replace(/&nbsp;/g, ' ').replace(/&#x27;/g, "'");
const rader2 = plain.split('\n').map(x => x.trim()).filter(x => x.length > 1);
writeFileSync('/tmp/r228-relx/quote.plain.txt', rader2.join('\n'));
console.log(`RELX quote: HTTP ${r.status} · ${rader2.length} textrader`);

// (3) P/E-bärarkontroll: visa nyckeltalen
const viktiga = ['Market Cap', 'Revenue (ttm)', 'Net Income', 'EPS', 'PE Ratio', 'Forward PE', 'Dividend', 'Shares Out', 'Sector', 'Industry', 'Currency is', 'At close', '52-Week Range', 'Beta'];
for (let i = 0; i < rader2.length; i++) {
  if (viktiga.includes(rader2[i])) console.log(`  ${rader2[i]}: ${rader2[i + 1]}`);
}
