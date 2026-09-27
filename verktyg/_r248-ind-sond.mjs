#!/usr/bin/env node
/** _r248-ind-sond.mjs — INDEN-SVEPET SOND (rond 248): Indiens sju ensamgrenar (rond 237:s
 *  karta, verifierad mot universumet denna rond) — duopartners prövas enligt rond 240:s
 *  mönster på NSE: primär + reserv per gren. Kollisionskontroll (ticker = hård; namnträff
 *  på utländsk förälder noteras som släktskap — ULVR/HUL-precedensen) + färsk P/E-bärarkontroll. */
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { join } from "node:path";

const rader = JSON.parse(readFileSync('data/portfolj-system/bolagsunivers.json', 'utf8'));
const KAND = [
  // [NSE-ticker, namnregex, URL, gren, partner, motivering]
  ['INFY', /infosys/i, 'https://stockanalysis.com/quote/nse/INFY/', 'teknik', 'TCS', 'IT-konsultduopolet: personalens skala mot margin-ledarskapet'],
  ['HCLTECH', /hcl.?tech/i, 'https://stockanalysis.com/quote/nse/HCLTECH/', 'teknik', 'TCS', 'reserv: infrastruktur-tjänstesidan'],
  ['ICICIBANK', /icici/i, 'https://stockanalysis.com/quote/nse/ICICIBANK/', 'finans', 'HDFCBANK', 'private banking-duopolet: två bankkulturer'],
  ['SBIN', /state.?bank/i, 'https://stockanalysis.com/quote/nse/SBIN/', 'finans', 'HDFCBANK', 'reserv: statlig jätte mot privat'],
  ['ITC', /^itc/i, 'https://stockanalysis.com/quote/nse/ITC/', 'konsument', 'HINDUNILVR', 'FMCG-duopolet: portföljbredd mot märkesfokus'],
  ['NESTLEIND', /nestl/i, 'https://stockanalysis.com/quote/nse/NESTLEIND/', 'konsument', 'HINDUNILVR', 'reserv (förälder/barn-precedens: NESN i universumet)'],
  ['ONGC', /ongc|oil.?&.?natural.?gas/i, 'https://stockanalysis.com/quote/nse/ONGC/', 'energi', 'RELIANCE', 'uppströms-oljan/gasen mot raffinaderi+digital'],
  ['NTPC', /ntpc|thermal/i, 'https://stockanalysis.com/quote/nse/NTPC/', 'energi', 'RELIANCE', 'reserv: elkraften'],
  ['INDUSTOWER', /indus.?towers/i, 'https://stockanalysis.com/quote/nse/INDUSTOWER/', 'kommunikation', 'BHARTIARTL', 'operatören mot nätets fysiska skikt (tornen)'],
  ['TATACOMM', /tata.?communications/i, 'https://stockanalysis.com/quote/nse/TATACOMM/', 'kommunikation', 'BHARTIARTL', 'reserv: data/carrier-sidan'],
  ['APOLLOHOSP', /apollo.?hospitals/i, 'https://stockanalysis.com/quote/nse/APOLLOHOSP/', 'halso', 'SUNPHARMA', 'läkemedlet mot vården — hälsans två ben'],
  ['CIPLA', /cipla/i, 'https://stockanalysis.com/quote/nse/CIPLA/', 'halso', 'SUNPHARMA', 'reserv: generika-grannen'],
  ['HAL', /hindustan.?aeronautics/i, 'https://stockanalysis.com/quote/nse/HAL/', 'industri', 'LT', 'civil infrastruktur mot försvar/aero'],
  ['SIEMENS', /siemens/i, 'https://stockanalysis.com/quote/nse/SIEMENS/', 'industri', 'LT', 'reserv (förälder/barn-precedens: SIE.DE i universumet)'],
];
const UA = "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36";
mkdirSync('/tmp/r248-sond', { recursive: true });
const sov = (ms) => new Promise(r => setTimeout(r, ms));
console.log('INDIEN-SOND: sju grenar, primär + reserv, NSE/INR (rond 240-mönstret):\n');
for (const [t, namnRe, url, gren, partner, motiv] of KAND) {
  const tTraff = rader.filter(r => (r.ticker || '').toUpperCase().startsWith(t + '.'));
  const nTraff = rader.filter(r => namnRe.test(r.namn || ''));
  if (tTraff.length) { console.log(`  ${t} [${gren}/${partner}]: TICKER-KROCK — ${tTraff.map(r => r.ticker).join(', ')}`); continue; }
  const slaktskap = nTraff.length ? ` · SLÄKTSKAP: ${nTraff.map(r => `${r.ticker} (${r.land})`).join(', ')}` : '';
  try {
    const r = await fetch(url, { headers: { "user-agent": UA, "accept": "text/html", "cache-control": "no-cache" }, redirect: "follow" });
    const html = await r.text();
    writeFileSync(join('/tmp/r248-sond', `${t}.html`), html);
    let plain = html.replace(/<script[\s\S]*?<\/script>/g, ' ').replace(/<style[\s\S]*?<\/style>/g, ' ');
    plain = plain.replace(/<[^>]+>/g, '\n').replace(/&amp;/g, '&').replace(/&nbsp;/g, ' ').replace(/&#x27;/g, "'");
    const rr = plain.split('\n').map(x => x.trim()).filter(x => x.length > 1);
    writeFileSync(join('/tmp/r248-sond', `${t}.plain.txt`), rr.join('\n'));
    const ar404 = rr.slice(0, 3).join(' ').includes('404');
    if (ar404) { console.log(`  ${t} [nse/${gren}/${partner}]: 404 — kod fel?${slaktskap}`); continue; }
    const v = {};
    const NYCKLAR = ["Market Cap", "Net Income", "PE Ratio", "Forward PE", "Dividend", "Sector", "Industry", "Employees"];
    for (let i = 0; i < rr.length; i++) {
      if (NYCKLAR.includes(rr[i]) && !(rr[i] in v)) {
        const nasta = (rr[i + 1] ?? '').trim();
        if (/^-?[\d.,]+[%BM]?$|^-/.test(nasta) || /n\/a/i.test(nasta)) v[rr[i]] = nasta;
      }
      if (rr[i] === 'Compare' && !v.pris) v.pris = rr[i + 1];
    }
    const barar = v['Net Income'] && !v['Net Income'].startsWith('-') && v['Net Income'] !== 'n/a';
    console.log(`  ${t} [${gren}/${partner}]: REN · mcap ${v['Market Cap'] ?? '?'} · netto ${v['Net Income'] ?? '?'} · P/E ${v['PE Ratio'] ?? '?'} · fwd ${v['Forward PE'] ?? '?'} · sektor ${v['Sector'] ?? '?'}/${v['Industry'] ?? '?'} ⇒ ${barar ? 'GRÖN' : 'RÖD'}${slaktskap} — ${motiv}`);
  } catch (e) { console.log(`  ${t} [${gren}/${partner}]: FEL ${e.message}${slaktskap}`); }
  await sov(400);
}
