#!/usr/bin/env node
/** _r229-u32-sond.mjs — U32-SOND: Kanada (energi CNQ+Enbridge / finans RY+TD) och
 *  Spanien (finans Santander+BBVA / konsument ITX+?) enligt rond 228:s mönster:
 *  (a) cellstatus per land+bransch, (b) kollisionskontroll primär+sekundär (AZN-läxan),
 *  (c) färsk P/E-bärarkontroll (TTM-netto > 0) för kollisionsrena kandidater. */
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { join } from "node:path";

const ROT = '/home/ak1a/agent/ak1';
const rader = JSON.parse(readFileSync(`${ROT}/data/portfolj-system/bolagsunivers.json`, 'utf8'));
console.log(`UNIVERSUM: ${rader.length} rader`);

// (a) Cellstatus Kanada + Spanien
for (const land of ['Kanada', 'Spanien']) {
  const lr = rader.filter(r => r.land === land);
  const g = {};
  for (const r of lr) g[r.bransch] = (g[r.bransch] ?? 0) + 1;
  const en = Object.entries(g).filter(([, n]) => n < 2).map(([k]) => k);
  console.log(`\n${land.toUpperCase()}: ${lr.length} rader — ${Object.entries(g).sort().map(([k, n]) => `${k} ${n}`).join(' · ')}`);
  console.log(`  1-grenar: ${en.length ? en.join(', ') : '(inga)'}`);
  for (const r of lr) console.log(`  · ${r.ticker} — ${r.namn} [${r.bransch}]`);
}

// (b) Kollisionskontroll primär+sekundär (ticker + namn i HELA universumet)
const KAND = [
  ['CNQ', /Canadian Natural/i],
  ['ENB', /Enbridge/i],
  ['RY', /Royal Bank of Canada/i],
  ['TD', /Toronto.?Dominion/i],
  ['SAN', /Santander/i],
  ['BBVA', /\bBBVA\b|Banco Bilbao/i],
  ['ITX', /Inditex/i],
];
console.log('\nKOLLISIONSKONTROLL (hela universumet, primär+sekundär):');
const rena = [];
for (const [t, namnRe] of KAND) {
  const traf = rader.filter(r => (r.ticker || '').toUpperCase() === t || (r.ticker || '').toUpperCase().startsWith(t + '.') || namnRe.test(r.namn || ''));
  if (traf.length) for (const r of traf) console.log(`  TRÄFF ${t}: ${r.ticker} — ${r.namn} [${r.land}/${r.bransch}]`);
  else { console.log(`  REN: ${t}`); rena.push(t); }
}

// (c) Färsk P/E-bärarkontroll för kollisionsrena kandidater
const KA = {
  CNQ: ['tsx', 'https://stockanalysis.com/quote/tsx/CNQ/'],
  ENB: ['tsx', 'https://stockanalysis.com/quote/tsx/ENB/'],
  RY: ['tsx', 'https://stockanalysis.com/quote/tsx/RY/'],
  TD: ['tsx', 'https://stockanalysis.com/quote/tsx/TD/'],
  SAN: ['bme', 'https://stockanalysis.com/quote/bme/SAN/'],
  BBVA: ['bme', 'https://stockanalysis.com/quote/bme/BBVA/'],
  ITX: ['bme', 'https://stockanalysis.com/quote/bme/ITX/'],
};
const UA = "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36";
mkdirSync('/tmp/r229-u32', { recursive: true });
console.log('\nP/E-BÄRARKONTROLL (färsk quote-panel):');
for (const t of rena) {
  const [bors, url] = KA[t];
  try {
    const r = await fetch(url, { headers: { "user-agent": UA, "accept": "text/html", "cache-control": "no-cache" }, redirect: "follow" });
    const html = await r.text();
    writeFileSync(join('/tmp/r229-u32', `${t}.html`), html);
    let plain = html.replace(/<script[\s\S]*?<\/script>/g, ' ').replace(/<style[\s\S]*?<\/style>/g, ' ');
    plain = plain.replace(/<[^>]+>/g, '\n').replace(/&amp;/g, '&').replace(/&nbsp;/g, ' ').replace(/&#x27;/g, "'");
    const rr = plain.split('\n').map(x => x.trim()).filter(x => x.length > 1);
    writeFileSync(join('/tmp/r229-u32', `${t}.plain.txt`), rr.join('\n'));
    const v = {};
    for (let i = 0; i < rr.length; i++) {
      if (['Market Cap', 'Revenue (ttm)', 'Net Income', 'EPS', 'PE Ratio', 'Forward PE', 'Dividend', 'Sector', 'Industry', 'Currency is', 'Price in'].includes(rr[i])) v[rr[i]] = rr[i + 1];
      if (rr[i] === 'Compare' && !v.PRISEN) v.PRISEN = `${rr[i + 1]} (${rr[i + 2] ?? ''})`;
    }
    const barar = v['Net Income'] && !v['Net Income'].startsWith('-') && v['Net Income'] !== 'n/a';
    console.log(`  ${t} [${bors}]: ${v.PRISEN ?? '?'} · mcap ${v['Market Cap'] ?? '?'} · netto ${v['Net Income'] ?? '?'} · P/E ${v['PE Ratio'] ?? '?'} · div ${v['Dividend'] ?? '?'} · sektor ${v['Sector'] ?? '?'}/${v['Industry'] ?? '?'} · valuta ${v['Currency is'] ?? '?'}${v['Price in'] ? ' (' + v['Price in'] + ')' : ''} ⇒ P/E-bärare ${barar ? 'GRÖN' : 'RÖD'}`);
  } catch (e) {
    console.log(`  ${t} [${bors}]: FEL ${e.message}`);
  }
}
console.log('\nHTML+plain sparade i /tmp/r229-u32/ för rondens hämtningssteg.');
