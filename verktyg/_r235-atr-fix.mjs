#!/usr/bin/env node
/** _r235-atr-fix.mjs — Rond 235: korrigerad Atresmedia-hämtning (BME-symbolen är A3M, inte ATR —
 *  förra rundans 404 diagnostiserad ur /tmp/r234-atr/quote.plain.txt) + universumets minsta
 *  börsvärden som tröskelgrund för Spanien/kommunikation 1→2-beslutet. */
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";

const ROT = '/home/ak1a/agent/ak1';

// Tröskelgrunden: universumets minsta börsvärden (bottom-10)
const u = JSON.parse(readFileSync(`${ROT}/data/portfolj-system/bolagsunivers.json`, 'utf8'));
const sorterad = [...u].sort((a, b) => (a.marknadsKapitalMdr ?? 1e9) - (b.marknadsKapitalMdr ?? 1e9));
console.log(`UNIVERSUM ${u.length} rader — DE MINSTA (bottom-8):`);
for (const r of sorterad.slice(0, 8)) console.log(`  ${r.ticker} — ${r.namn.slice(0, 34)} · ${r.marknadsKapitalMdr} mdr ${r.valuta} [${r.land}/${r.bransch}]`);

// Korrigerad hämtning: A3M
const UA = "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36";
mkdirSync('/tmp/r235-a3m', { recursive: true });
const r = await fetch('https://stockanalysis.com/quote/bme/A3M/', { headers: { "user-agent": UA, "accept": "text/html", "cache-control": "no-cache" }, redirect: "follow" });
const html = await r.text();
writeFileSync('/tmp/r235-a3m/quote.html', html);
let plain = html.replace(/<script[\s\S]*?<\/script>/g, ' ').replace(/<style[\s\S]*?<\/style>/g, ' ');
plain = plain.replace(/<[^>]+>/g, '\n').replace(/&amp;/g, '&').replace(/&nbsp;/g, ' ').replace(/&#x27;/g, "'");
const rr = plain.split('\n').map(x => x.trim()).filter(x => x.length > 1);
writeFileSync('/tmp/r235-a3m/quote.plain.txt', rr.join('\n'));
console.log(`\nA3M [bme]: HTTP ${r.status} · ${rr.length} textrader`);
if (r.status !== 200 || rr.slice(0, 3).join(' ').includes('404')) {
  console.log('A3M: sidan saknas OCKSÅ — spanska kommunikationskandidater utanför stockanalysis BME-täckningen?');
  process.exit(0);
}
const v = {};
for (let i = 0; i < rr.length; i++) {
  if (['Market Cap', 'Revenue (ttm)', 'Net Income', 'EPS', 'PE Ratio', 'Forward PE', 'Dividend', 'Shares Out', 'Sector', 'Industry', 'Currency is'].includes(rr[i])) v[rr[i]] = rr[i + 1];
  if (rr[i] === 'Compare' && !v.PRISEN) v.PRISEN = `${rr[i + 1]} (${rr[i + 2] ?? ''})`;
}
const barar = v['Net Income'] && !v['Net Income'].startsWith('-') && v['Net Income'] !== 'n/a';
console.log(`  pris ${v.PRISEN ?? '?'} · mcap ${v['Market Cap'] ?? '?'} · netto ${v['Net Income'] ?? '?'} · P/E ${v['PE Ratio'] ?? '?'} · div ${v['Dividend'] ?? '?'} · sektor ${v['Sector'] ?? '?'}/${v['Industry'] ?? '?'}`);
console.log(`  ⇒ P/E-bärare ${barar ? 'GRÖN' : 'RÖD'}`);
// Tröskelbedömning: universumets minsta som referens
const minst = sorterad[0]?.marknadsKapitalMdr;
const mcapNum = parseFloat((v['Market Cap'] ?? '0').replace('B', '').replace('M', '0.001').replace(',', '')) || 0;
console.log(`\nTRÖSKELBEDÖMNING: universumets minsta ${minst} mdr; A3M ${v['Market Cap'] ?? '?'} (${mcapNum ? mcapNum.toFixed(2) : '?'} mdr) ⇒ ${mcapNum && mcapNum >= (minst * 0.5) ? 'INOM räckhåll för övervägande' : 'UNDER tröskeln — cellen lämnas ÖPEN med dokumenterad orsak'}`);
