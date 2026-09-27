#!/usr/bin/env node
/** _r237-u37-ifx-sond.mjs — U37-SOND: Infineon IFX.DE (Tyskland/teknik — SAP:s duopartner) enligt
 *  rond 229:s mönster: (a) kollisionskontroll primär+sekundär, (b) färsk P/E-bärarkontroll. */
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { join } from "node:path";

const rader = JSON.parse(readFileSync('data/portfolj-system/bolagsunivers.json', 'utf8'));
const traf = rader.filter(r => (r.ticker || '').toUpperCase() === 'IFX' || (r.ticker || '').toUpperCase().startsWith('IFX.') || /infineon/i.test(r.namn || ''));
console.log(`KOLLISIONSKONTROLL IFX: ${traf.length} träffar${traf.length ? ' — ' + traf.map(r => `${r.ticker} [${r.land}/${r.bransch}]`).join(' | ') : ' — REN kandidat'}`);

const UA = "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36";
mkdirSync('/tmp/r237-ifx', { recursive: true });
const r = await fetch('https://stockanalysis.com/quote/etr/IFX/', { headers: { "user-agent": UA, "accept": "text/html", "cache-control": "no-cache" }, redirect: "follow" });
const html = await r.text();
writeFileSync(join('/tmp/r237-ifx', 'quote.html'), html);
let plain = html.replace(/<script[\s\S]*?<\/script>/g, ' ').replace(/<style[\s\S]*?<\/style>/g, ' ');
plain = plain.replace(/<[^>]+>/g, '\n').replace(/&amp;/g, '&').replace(/&nbsp;/g, ' ').replace(/&#x27;/g, "'");
const rr = plain.split('\n').map(x => x.trim()).filter(x => x.length > 1);
writeFileSync(join('/tmp/r237-ifx', 'quote.plain.txt'), rr.join('\n'));
console.log(`IFX [etr]: HTTP ${r.status} · ${rr.length} textrader`);
const v = {};
for (let i = 0; i < rr.length; i++) {
  if (['Market Cap', 'Revenue (ttm)', 'Net Income', 'EPS', 'PE Ratio', 'Forward PE', 'Dividend', 'Shares Out', 'Sector', 'Industry', 'Currency is'].includes(rr[i])) v[rr[i]] = rr[i + 1];
  if (rr[i] === 'Compare' && !v.PRISEN) v.PRISEN = `${rr[i + 1]} (${rr[i + 2] ?? ''})`;
}
const barar = v['Net Income'] && !v['Net Income'].startsWith('-') && v['Net Income'] !== 'n/a';
console.log(`  pris ${v.PRISEN ?? '?'} · mcap ${v['Market Cap'] ?? '?'} · netto ${v['Net Income'] ?? '?'} · P/E ${v['PE Ratio'] ?? '?'} · div ${v['Dividend'] ?? '?'} · sektor ${v['Sector'] ?? '?'}/${v['Industry'] ?? '?'} · valuta ${v['Currency is'] ?? '?'} ⇒ P/E-bärare ${barar ? 'GRÖN' : 'RÖD'}`);
