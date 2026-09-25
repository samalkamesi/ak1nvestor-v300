#!/usr/bin/env node
/** _r233-u35-sond.mjs — U35-SOND: Spaniens kvarvarande 1-grenar — Puig (konsument,
 *  ITX-partner) och Telefónica (kommunikation, Cellnex-partner) enligt rond 229:s mönster:
 *  (a) kollisionskontroll primär+sekundär (AZN-läxan), (b) färsk P/E-bärarkontroll (TTM-netto > 0). */
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { join } from "node:path";

const ROT = '/home/ak1a/agent/ak1';
const rader = JSON.parse(readFileSync(`${ROT}/data/portfolj-system/bolagsunivers.json`, 'utf8'));
console.log(`UNIVERSUM: ${rader.length} rader`);

// (a) Kollisionskontroll primär+sekundär
const KAND = [
  ['PUIG', /Puig\b|Puig Brands/i],
  ['TEF', /Telef[oó]nica/i],
];
console.log('KOLLISIONSKONTROLL (hela universumet, primär+sekundär):');
const rena = [];
for (const [t, namnRe] of KAND) {
  const traf = rader.filter(r => (r.ticker || '').toUpperCase() === t || (r.ticker || '').toUpperCase().startsWith(t + '.') || namnRe.test(r.namn || ''));
  if (traf.length) for (const r of traf) console.log(`  TRÄFF ${t}: ${r.ticker} — ${r.namn} [${r.land}/${r.bransch}]`);
  else { console.log(`  REN: ${t}`); rena.push(t); }
}

// (b) Färsk P/E-bärarkontroll
const KA = {
  PUIG: 'https://stockanalysis.com/quote/bme/PUIG/',
  TEF: 'https://stockanalysis.com/quote/bme/TEF/',
};
const UA = "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36";
mkdirSync('/tmp/r233-u35', { recursive: true });
console.log('\nP/E-BÄRARKONTROLL (färsk quote-panel):');
for (const t of rena) {
  try {
    const r = await fetch(KA[t], { headers: { "user-agent": UA, "accept": "text/html", "cache-control": "no-cache" }, redirect: "follow" });
    const html = await r.text();
    writeFileSync(join('/tmp/r233-u35', `${t}.html`), html);
    let plain = html.replace(/<script[\s\S]*?<\/script>/g, ' ').replace(/<style[\s\S]*?<\/style>/g, ' ');
    plain = plain.replace(/<[^>]+>/g, '\n').replace(/&amp;/g, '&').replace(/&nbsp;/g, ' ').replace(/&#x27;/g, "'");
    const rr = plain.split('\n').map(x => x.trim()).filter(x => x.length > 1);
    writeFileSync(join('/tmp/r233-u35', `${t}.plain.txt`), rr.join('\n'));
    const v = {};
    for (let i = 0; i < rr.length; i++) {
      if (['Market Cap', 'Revenue (ttm)', 'Net Income', 'EPS', 'PE Ratio', 'Forward PE', 'Dividend', 'Shares Out', 'Sector', 'Industry', 'Currency is'].includes(rr[i])) v[rr[i]] = rr[i + 1];
      if (rr[i] === 'Compare' && !v.PRISEN) v.PRISEN = `${rr[i + 1]} (${rr[i + 2] ?? ''})`;
      if (rr[i].startsWith('At close') || rr[i].startsWith('Sep ')) { if (!v.DAG) v.DAG = rr[i]; }
    }
    const barar = v['Net Income'] && !v['Net Income'].startsWith('-') && v['Net Income'] !== 'n/a';
    console.log(`  ${t} [bme]: ${v.PRISEN ?? '?'} · mcap ${v['Market Cap'] ?? '?'} · netto ${v['Net Income'] ?? '?'} · P/E ${v['PE Ratio'] ?? '?'} · div ${v['Dividend'] ?? '?'} · sektor ${v['Sector'] ?? '?'}/${v['Industry'] ?? '?'} · valuta ${v['Currency is'] ?? '?'} ⇒ P/E-bärare ${barar ? 'GRÖN' : 'RÖD'}`);
  } catch (e) {
    console.log(`  ${t}: FEL ${e.message}`);
  }
}
console.log('\nHTML+plain sparade i /tmp/r233-u35/.');
