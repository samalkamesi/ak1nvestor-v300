#!/usr/bin/env node
/** _r228-u31-triappel.mjs — tre kvarvarande UK-kommunikationskandidater: PSON.L, ITV.L, AAF.L — sektor + P/E-bärarkontroll + kollision. */
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
const ROT = '/home/ak1a/agent/ak1';
const rader = JSON.parse(readFileSync(`${ROT}/data/portfolj-system/bolagsunivers.json`, 'utf8'));

const UA = "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36";
const kandidater = [
  ['PSON', 'Pearson', /PSON|PEARSON/i],
  ['ITV', 'ITV', /\bITV\b/i],
  ['AAF', 'Airtel Africa', /AAF|AIRTEL/i],
];
mkdirSync('/tmp/r228-trio', { recursive: true });
for (const [tick, namn, re] of kandidater) {
  const traf = rader.filter(r => re.test(r.ticker || '') || re.test(r.namn || ''));
  console.log(`\n═══ ${tick} (${namn}) ═══`);
  console.log(`kollision: ${traf.length} träffar${traf.length ? ' — ' + traf.map(r => `${r.ticker} [${r.land}/${r.bransch}]`).join(' | ') : ' — REN'}`);
  try {
    const r = await fetch(`https://stockanalysis.com/quote/lon/${tick}/`, { headers: { "user-agent": UA, "accept": "text/html", "cache-control": "no-cache" }, redirect: "follow" });
    const html = await r.text();
    writeFileSync(`/tmp/r228-trio/${tick}.html`, html);
    let plain = html.replace(/<script[\s\S]*?<\/script>/g, ' ').replace(/<style[\s\S]*?<\/style>/g, ' ');
    plain = plain.replace(/<[^>]+>/g, '\n').replace(/&amp;/g, '&').replace(/&nbsp;/g, ' ').replace(/&#x27;/g, "'");
    const rr = plain.split('\n').map(x => x.trim()).filter(x => x.length > 1);
    writeFileSync(`/tmp/r228-trio/${tick}.plain.txt`, rr.join('\n'));
    const viktiga = ['Market Cap', 'Revenue (ttm)', 'Net Income', 'EPS', 'PE Ratio', 'Forward PE', 'Dividend', 'Shares Out', 'Sector', 'Industry', 'At close', '52-Week Range', 'Currency is', 'Price in'];
    const ut = [];
    for (let i = 0; i < rr.length; i++) if (viktiga.includes(rr[i])) ut.push(`  ${rr[i]}: ${rr[i + 1]}`);
    console.log(ut.join('\n'));
    // prisraden = första rena talet efter 'Compare'
    const ix = rr.indexOf('Compare');
    if (ix > 0) console.log(`  PRIS: ${rr[ix + 1]} (${rr[ix + 2] || ''} ${rr[ix + 3] || ''})`.trim());
  } catch (e) {
    console.log(`  FEL: ${e.message}`);
  }
}
