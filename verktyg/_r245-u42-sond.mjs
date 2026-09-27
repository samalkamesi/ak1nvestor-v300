#!/usr/bin/env node
/** _r245-u42-sond.mjs — U42-SOND: Frankrikes två sista 1-grenar — fastighet (URW-partner:
 *  Klepierre LI.PA · Gecina GFC.PA) och kommunikation (ORA-partner: Teleperformance TEP.PA)
 *  enligt rond 240:s mönster: kollisionskontroll + färsk P/E-bärarkontroll + sektor-verifiering. */
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { join } from "node:path";

const rader = JSON.parse(readFileSync('data/portfolj-system/bolagsunivers.json', 'utf8'));
const KAND = [
  ['LI', /klepierre/i, 'https://stockanalysis.com/quote/epa/LI/'],
  ['GFC', /gecina/i, 'https://stockanalysis.com/quote/epa/GFC/'],
  ['TEP', /teleperformance/i, 'https://stockanalysis.com/quote/epa/TEP/'],
];
console.log('KOLLISIONSKONTROLL (hela universumet, primär+sekundär):');
const UA = "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36";
mkdirSync('/tmp/r245-sond', { recursive: true });
console.log('\nP/E-BÄRARKONTROLL (färsk quote-panel EPA):');
for (const [t, namnRe, url] of KAND) {
  const traf = rader.filter(r => (r.ticker || '').toUpperCase() === t || (r.ticker || '').toUpperCase().startsWith(t + '.') || namnRe.test(r.namn || ''));
  if (traf.length) { console.log(`  ${t}: TRÄFF — ${traf.map(r => `${r.ticker} [${r.land}/${r.bransch}]`).join(' | ')}`); continue; }
  try {
    const r = await fetch(url, { headers: { "user-agent": UA, "accept": "text/html", "cache-control": "no-cache" }, redirect: "follow" });
    const html = await r.text();
    writeFileSync(join('/tmp/r245-sond', `${t}.html`), html);
    let plain = html.replace(/<script[\s\S]*?<\/script>/g, ' ').replace(/<style[\s\S]*?<\/style>/g, ' ');
    plain = plain.replace(/<[^>]+>/g, '\n').replace(/&amp;/g, '&').replace(/&nbsp;/g, ' ').replace(/&#x27;/g, "'");
    const rr = plain.split('\n').map(x => x.trim()).filter(x => x.length > 1);
    writeFileSync(join('/tmp/r245-sond', `${t}.plain.txt`), rr.join('\n'));
    if (rr.slice(0, 3).join(' ').includes('404')) { console.log(`  ${t} [epa]: 404 — kod fel?`); continue; }
    const v = {};
    const NYCKLAR = ["Market Cap", "Net Income", "EPS", "PE Ratio", "Forward PE", "Dividend", "Sector", "Industry"];
    for (let i = 0; i < rr.length; i++) {
      if (NYCKLAR.includes(rr[i]) && !(rr[i] in v)) {
        const nasta = (rr[i + 1] ?? '').trim();
        if (/^-?[\d.,]+[%BM]?$|^-/.test(nasta) || /n\/a/i.test(nasta)) v[rr[i]] = nasta;
      }
      if (rr[i] === 'Compare' && !v.pris) v.pris = rr[i + 1];
    }
    const barar = v['Net Income'] && !v['Net Income'].startsWith('-') && v['Net Income'] !== 'n/a';
    console.log(`  ${t} [epa]: REN · pris ${v.pris ?? '?'} · mcap ${v['Market Cap'] ?? '?'} · netto ${v['Net Income'] ?? '?'} · P/E ${v['PE Ratio'] ?? '?'} · div ${v['Dividend'] ?? '?'} · sektor ${v['Sector'] ?? '?'}/${v['Industry'] ?? '?'} ⇒ P/E-bärare ${barar ? 'GRÖN' : 'RÖD'}`);
  } catch (e) { console.log(`  ${t}: FEL ${e.message}`); }
}
