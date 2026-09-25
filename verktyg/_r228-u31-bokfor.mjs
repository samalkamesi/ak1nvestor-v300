#!/usr/bin/env node
// Rond 228 — U31-sondens bokföring: worklog-rad + commit + push (rond 227:s mekanik).
import { execFileSync } from 'node:child_process';
import { copyFileSync, readFileSync, statSync, writeFileSync, appendFileSync } from 'node:fs';

const ROT = '/home/ak1a/agent/ak1';
const PROD = '/home/ak1a/AK1';
const RAPPORT = 'data/rapporter/motorervalidering-2026-09-02.md';
const kvitto = [];
const steg = (namn, fn) => {
  try { kvitto.push(`OK ${namn} — ${fn() ?? ''}`); }
  catch (e) { kvitto.forEach(k => console.log(k)); console.log(`FEL ${namn} — ${e.message}`); process.exit(1); }
};

steg('worklog', () => {
  const nu = readFileSync(`${ROT}/worklog.md`, 'utf8');
  if (nu.includes('ROND 228 [organ:Φ] — U31-SOND')) return 'redan bokförd';
  const rad = `

## ROND 228 [organ:Φ] — U31-SOND LEVERERAD: UK/kommunikation-kandidaten avgjord — VOD.L P/E-bärarkontroll RÖD på färsk källa (FY26-netto −397 M EUR, FY25 −4 169 M EUR med goodwill-nedskrivning 4 515) → AVVISAD (BT-radens OMG24-varning bekräftad; Sony/Honda-doktrinen); WPP.L reserv GRÖN preliminärt (TTM +203 M GBP — men stockanalysis-vyn för WPP föråldrad, färsk TTM MÅSTE verifieras i hämtningssteget) — 2026-09-25

BESLUTSUNDERLAG för U31 (UK/kommunikation 1→2 — UK:s sista 1-gren enligt U30-kön):
(1) CELLSTATUS (bolagsunivers.json 292 rader): Storbritannien 16 rader — finans 5, teknik 2, hälsa 2, konsument 2, industri 2, energi 2, KOMMUNIKATION 1 (BT.L rad 274). Grenen är cellens sista 1-gren.
(2) KOLLISIONSKONTROLL (hela universumet, primär+sekundär): VOD/Vodafone 0 träffar — ren; WPP 0 träffar — ren; BT.L bär cellen.
(3) VOD.L — P/E-BÄRARKONTROLL RÖD (stockanalysis.com/quote/lon/VOD/financials/, hämtat 2026-09-25): FY2026 (period slut mar-2026): netto −397 M EUR; FY2025: −4 169 M EUR (impairment of goodwill 4 515 M EUR); FY2024: +1 140; FY2023: +11 838 (engångs Vantage-försäljning 9 349 — Tokyo Gas/FY23-klassen); FY2022: +2 237. TTM-netto < 0 → P/E obefintlig → VOD ÄR FORTFARANDE P/E-död; BT-radens notering från BCE-OMG24 §10 ("VOD var P/E-död, BT bär") håller även på 2026-tal. AVVISAD som U31-bärare.
(4) WPP.L — RESERV GRÖN PRELIMINÄRT: TTM +203,4 M GBP netto (positiv P/E-bärare), FY2023 +110,4, FY2022 +682,7, FY2021 +637,7, FY2020 −2 965 (pandemi-året). VARNING: stockanalysis-vyn för WPP visade en FÖRÅLDRAD tabell (TTM jun-2024, FY-rader t.o.m. 2023) — WPP FY2024/FY2025-siffror MÅSTE hämtas färskt och verifieras i hämtningssteget innan universum-append (risken: nedskrivningar i FY24 vänder TTM-tecknet — i så fall fall till reserv 2).
(5) RESERV 2: RELX.L (informationsanalytik — GICS kommunikationstjänster) — inte sonderad denna rond.
(6) DUO-PEDAGOGIK: BT (nätinfrastruktur: fast nät + EE-mobil) mot WPP (reklam/byrå: TRAFIKENS MONETARISERING utanför nätet) — kommunikationens två sidor: rören mot innehållet som betalar för rören; speglar GSK+S&N-mönstret (pipeline mot kapitalcykel).
NÄSTA VÅG: _r228-u31-hämtnings-skript (WPP.L komplett: pris/mcap/tillväxt/lönsamhet/stabilitet/återköp/moat/värdering/serier/notering + färsk TTM-verifiering), tretton lås, kirurgisk append 292→293, llms HELREGEN 293, läckagevakt, tsc, protokoll V173-U31-WPP-UTOKNING.md.
KVD denna rond: sond read-only (universumet orört) · källor stockanalysis (VOD färsk FY26-tabell · WPP föråldrad vy — dokumenterat) · ingen push pågår-pågående; commit av sond+bokföring via rond 227:s mekanik.
`;
  appendFileSync(`${ROT}/worklog.md`, rad, 'utf8');
  return 'rond 228-sond bokförd';
});

const FILER = ['worklog.md', 'verktyg/_r228-u31-sond.mjs', 'verktyg/_r228-u31-bokfor.mjs'];
const MSG = `studio: [organ:Φ] rond 228 U31-SOND — UK/kommunikation-kandidaten avgjord: VOD.L P/E-bärarkontroll RÖD på färsk källa (FY26-netto −397 M EUR; FY25 −4 169 M EUR goodwill-nedskrivning; FY23:s +11 838 = engångs Vantage-försäljning) → AVVISAD (BT-radens OMG24-varning bekräftad, Sony/Honda-doktrinen); WPP.L reserv GRÖN preliminärt (TTM +203 M GBP) men stockanalysis-vyn föråldrad — färsk TTM-verifiering krävs i hämtningssteget; reserv 2 RELX.L osonderad. Cellstatus: UK 16 rader, kommunation 1 (BT.L) = sista UK-1-grenen. Duo-pedagogik dokumenterad (rören mot trafikens monetarisering). Sond read-only, universumet orört. Ren dataleverans — src orörd, inget bygge.`;
steg('commitmsg', () => { writeFileSync('/tmp/r228-msg.txt', MSG + '\n', 'utf8'); return 'skriven'; });

let pushad = false;
for (let forsok = 1; forsok <= 3 && !pushad; forsok++) {
  const prodLangd = statSync(`${PROD}/${RAPPORT}`).size;
  const lokalLangd = statSync(`${ROT}/${RAPPORT}`).size;
  if (prodLangd > lokalLangd) {
    copyFileSync(`${PROD}/${RAPPORT}`, `${ROT}/${RAPPORT}`);
    if (!FILER.includes(RAPPORT)) FILER.push(RAPPORT);
    kvitto.push(`  försök ${forsok}: rapporten adopterad (${lokalLangd}→${prodLangd} B)`);
  }
  try {
    execFileSync('git', ['-C', ROT, 'add', ...new Set(FILER)]);
    if (forsok === 1) {
      const ut = execFileSync('git', ['-C', ROT, 'commit', '-F', '/tmp/r228-msg.txt'], { encoding: 'utf8' });
      kvitto.push(`  commit ${(ut.match(/\[develop ([0-9a-f]+)\]/) || [])[1] || 'okänd'} genom tsc-grinden`);
    } else {
      execFileSync('git', ['-C', ROT, 'commit', '--amend', '-F', '/tmp/r228-msg.txt']);
      kvitto.push(`  commit amend:ad (försök ${forsok})`);
    }
  } catch (e) { kvitto.forEach(k => console.log(k)); console.log(`FEL git commit — ${String(e.message).split('\n')[0]}`); process.exit(1); }
  try {
    const mRader = execFileSync('git', ['-C', PROD, 'status', '--porcelain'], { encoding: 'utf8' }).split('\n').filter(r => r.startsWith(' M ') || r.startsWith('M '));
    if (mRader.length === 1 && mRader[0].includes('motorervalidering')) {
      execFileSync('git', ['-C', PROD, 'checkout', '--', RAPPORT]);
      kvitto.push('  prods M-rad rensad (innehållet säkrat i commiten)');
    }
    const ut = execFileSync('git', ['-C', ROT, 'push', 'prod', 'develop'], { encoding: 'utf8' });
    kvitto.push(`OK git push (försök ${forsok}) — ${ut.trim().split('\n').pop().slice(0, 120)}`);
    pushad = true;
  } catch (e) {
    kvitto.push(`  push försök ${forsok} avvisad — ${String(e.message).split('\n').filter(r => r.includes('rejected') || r.includes('error'))[0]?.slice(0, 160) || 'okänt fel'}`);
  }
}
if (!pushad) { kvitto.forEach(k => console.log(k)); console.log('FEL push.'); process.exit(1); }

steg('prodverif', () => {
  const lokal = execFileSync('git', ['-C', ROT, 'rev-parse', 'HEAD'], { encoding: 'utf8' }).trim();
  const prodH = execFileSync('git', ['-C', PROD, 'rev-parse', 'HEAD'], { encoding: 'utf8' }).trim();
  if (lokal !== prodH) throw new Error(`HEAD divergerar: ${lokal.slice(0, 8)} vs ${prodH.slice(0, 8)}`);
  return `prods HEAD = ${prodH.slice(0, 10)} (identisk)`;
});
steg('prod 200', () => {
  const kod = execFileSync('curl', ['-s', '-o', '/dev/null', '-w', '%{http_code}', 'https://lab.ak1nvestor.com/'], { encoding: 'utf8' }).trim();
  if (kod !== '200') throw new Error(`prod svarade ${kod}`);
  return 'HTTPS 200';
});
kvitto.forEach(k => console.log(k));
console.log('LEVERANS: rond 228 U31-sond bokförd och pushad');
