#!/usr/bin/env node
// Byggskript s4-u1 (manifest auto-s4-1789742101501) — SSAB Q3-läspaket (pivot v2).
// Motorräknar samtliga tal ur bolagsuniversumets SSAB-B.ST-post + materialmedianer.
// KVD:n (verktyg/_s4u1-kvd-ssab.mjs) räknar OM allt oberoende.
import { readFileSync } from 'node:fs';

const UNI = '/home/ak1a/AK1/data/portfolj-system/bolagsunivers.json';
const u = JSON.parse(readFileSync(UNI, 'utf8'));
const list = Array.isArray(u) ? u : (u.bolag || u.universum);
const p = list.find(x => x.ticker === 'SSAB-B.ST');

const pct = (x, d = 2) => (x * 100).toFixed(d);
const sv = (x, d = 0) => x.toLocaleString('sv-SE', { minimumFractionDigits: d, maximumFractionDigits: d }).replace(/\u00A0/g, ' ');

console.log('===== SSAB-B.ST-post (källa ' + p.hamtat + ') =====');
console.log('pris:', p.pris, 'SEK | mcap-fält:', p.marknadsKapitalMdr);
console.log('vardering:', JSON.stringify(p.vardering));
console.log('lonksamhet:', JSON.stringify(p.lonksamhet));
console.log('stabilitet:', JSON.stringify(p.stabilitet));

// ===== Serier =====
const ar = p.serier.ar, oms = p.serier.omsattning.map(x => x / 1e6), res = p.serier.resultat.map(x => x / 1e6);
console.log('\n===== Serier (Mkr) =====');
for (let i = 0; i < ar.length; i++) console.log(ar[i], 'oms', sv(oms[i]), 'res', sv(res[i]), 'nettomarginal härledd', pct(res[i] / oms[i]));
const cagr = (a, b, n) => Math.pow(b / a, 1 / n) - 1;
console.log('oms-CAGR replik (3 steg):', pct(cagr(oms[0], oms[3], 3), 2), '| fält:', pct(p.tillvaxt.omsattningCAGR5ar, 2));
console.log('res-CAGR-fält:', p.tillvaxt.resultatCAGR5ar, '(null — negativt basår)');
console.log('oms-steg:', oms.slice(1).map((v, i) => pct(v / oms[i] - 1, 2)).join(' / '));
console.log('res-steg 2023→2024→2025:', pct(res[2] / res[1] - 1, 2), '/', pct(res[3] / res[2] - 1, 2));
const ttmOms = oms[3] * (1 + p.tillvaxt.omsattningTillvaxtTTM);
console.log('TTM-omsättning:', sv(ttmOms), 'Mkr');

// ===== Datavakten =====
console.log('\n===== Datavakten =====');
const { pe, pb, evEbit, peg } = p.vardering;
const { roe, nettoMarginal, ebitMarginal, fcfMarginal } = p.lonksamhet;
const ident = pb / roe;
console.log('IDENTITET: P/B ÷ ROE =', pb, '÷', roe, '=', ident.toFixed(3), 'mot P/E', pe, '=> avvikelse', pct(Math.abs(pe - ident) / pe, 2), '%');
console.log('  omvänd väg: P/E × ROE =', (pe * roe).toFixed(3), 'mot P/B', pb);
console.log('  implicit EPS = pris ÷ P/E =', (p.pris / pe).toFixed(2), 'kr');
const nettoTTM = nettoMarginal * ttmOms;
const mcapPE = pe * nettoTTM / 1000, ekROE = nettoTTM / roe / 1000, mcapPB = pb * ekROE;
console.log('netto TTM (5,73 % × TTM-oms):', sv(nettoTTM), 'Mkr | bokförd 2025:', sv(res[3]));
console.log('MCAP P/E-vägen:', mcapPE.toFixed(1), 'mdr | EK ur ROE:', ekROE.toFixed(1), 'mdr | MCAP P/B-vägen:', mcapPB.toFixed(1), 'mdr');
console.log('  spridning mellan vägarna:', pct(Math.abs(mcapPE - mcapPB) / mcapPE, 1), '%');
console.log('  P/E på bokförd 2025-vinst: P/E-vägen', (mcapPE * 1000 / res[3]).toFixed(1), '| P/B-vägen', (mcapPB * 1000 / res[3]).toFixed(1));
console.log('  TTM netto över bokförd:', pct(nettoTTM / res[3] - 1, 1));
const pegConv = pe / (p.tillvaxt.prognosTillvaxt * 100);
console.log('PEG: källa', peg, 'mot konvention P/E ÷ prognos% =', pe, '÷', pct(p.tillvaxt.prognosTillvaxt, 2), '=', pegConv.toFixed(2), '| kvot', (peg / pegConv).toFixed(2));
console.log('  implicit tillväxt i källans PEG: P/E ÷ 3,76 =', pct(pe / peg, 1));
const skuldKvot = p.stabilitet.skuldEgenkapital;
const skuld = ekROE * skuldKvot, evKedja = ekROE + skuld;
const ebitTTM = ebitMarginal * ttmOms;
console.log('EV-KEDJA: EK', ekROE.toFixed(1), '+ skuld (' + skuldKvot + ' × EK)', skuld.toFixed(1), '= EV', evKedja.toFixed(1), 'mdr');
console.log('  EBIT TTM (9,67 % × TTM-oms):', sv(ebitTTM), 'Mkr');
console.log('  kedje-multipel EV ÷ EBIT-TTM =', (evKedja * 1000 / ebitTTM).toFixed(2), 'mot fält', evEbit, '=> kvot', (evKedja * 1000 / ebitTTM / evEbit).toFixed(2));
const evFalt = evEbit * ebitTTM / 1000;
console.log('  fältvägens EV:', evFalt.toFixed(1), 'mdr — residual mot kedjan:', (evFalt - evKedja).toFixed(1), 'mdr (= kassapost-hypotes)');
console.log('  fältvägan − skuld =', (evFalt - skuld).toFixed(1), 'mdr mot mcap P/E-vägen', mcapPE.toFixed(1));
console.log('FCF-PARET: fcfYield null — enbent; marginalvägen', pct(fcfMarginal, 2), '% × 96 220 =', sv(fcfMarginal * oms[3]), 'Mkr (2025-bas)');
console.log('  netto 5,73 % − FCF −2,91 % = kassagap', pct(nettoMarginal - fcfMarginal, 2), 'pp |', sv(nettoMarginal * oms[3] - fcfMarginal * oms[3]), 'Mkr');
console.log('  på TTM-bas:', sv(fcfMarginal * ttmOms), 'Mkr | P/FCF:', (mcapPE * 1000 / (fcfMarginal * ttmOms)).toFixed(1), '(negativ — meningslöst som multipel)');
console.log('DUPONT: ROE', pct(roe, 2), '= netto', pct(nettoMarginal, 2), '× kapitalomsättning', (ttmOms / (ekROE * 1000)).toFixed(2), '× hävstång', (1 + skuldKvot).toFixed(3));

// ===== Medianer + rang (material + universum) =====
console.log('\n===== Medianer ur 183-postfilen (2026-09-18) =====');
const gren = list.filter(x => x.bransch === 'material');
console.log('materialgrenen:', gren.length, 'bolag');
const med = (arr) => { const v = arr.filter(x => x !== null && x !== undefined && Number.isFinite(x)).sort((a, b) => a - b); const n = v.length; if (!n) return null; return n % 2 ? v[(n - 1) / 2] : (v[n / 2 - 1] + v[n / 2]) / 2; };
const rang = (arr, mine, dir) => { const v = arr.filter(x => x !== null && x !== undefined && Number.isFinite(x)).sort((a, b) => dir === 'desc' ? b - a : a - b); return [v.indexOf(mine) + 1, v.length]; };
const specs = [
  ['pe', x => x.vardering?.pe, 'asc'],
  ['pb', x => x.vardering?.pb, 'asc'],
  ['evEbit', x => x.vardering?.evEbit, 'asc'],
  ['peg', x => x.vardering?.peg, 'asc'],
  ['roe', x => x.lonksamhet?.roe, 'desc'],
  ['bruttoMarginal', x => x.lonksamhet?.bruttoMarginal, 'desc'],
  ['ebitMarginal', x => x.lonksamhet?.ebitMarginal, 'desc'],
  ['nettoMarginal', x => x.lonksamhet?.nettoMarginal, 'desc'],
  ['fcfMarginal', x => x.lonksamhet?.fcfMarginal, 'desc'],
  ['skuldEgenkapital', x => x.stabilitet?.skuldEgenkapital, 'asc'],
  ['prognosTillvaxt', x => x.tillvaxt?.prognosTillvaxt, 'desc'],
];
for (const [namn, f, dir] of specs) {
  const mine = f(p);
  const gV = gren.map(f), uniV = list.map(f);
  const mG = med(gV), mU = med(uniV);
  const r = mine !== null && mine !== undefined ? rang(gV, mine, dir) : [null, gV.filter(x => x != null).length];
  console.log(namn.padEnd(18), 'SSAB:', mine === null ? 'null' : +mine.toFixed(4),
    '| mat-median:', mG === null ? 'null' : +mG.toFixed(4), '(n=' + gV.filter(x => x != null).length + ')',
    '| uni-median:', mU === null ? 'null' : +mU.toFixed(4), '(n=' + uniV.filter(x => x != null).length + ')',
    '| rang:', r[0] + '/' + r[1]);
}

// ===== Scenarioruta 3×3 på 2025-basen (EBIT) =====
console.log('\n===== Scenarioruta EBIT (2025-bas', sv(oms[3]), 'Mkr × marginal 9,67 %) =====');
const basEbit = oms[3] * ebitMarginal;
console.log('bas-EBIT:', sv(basEbit, 1), 'Mkr');
const omsNiva = [-0.03, 0, 0.03].map(d => oms[3] * (1 + d));
const marNiva = [ebitMarginal - 0.01, ebitMarginal, ebitMarginal + 0.01];
for (const m of marNiva) console.log('marginal', pct(m, 2) + '%:', omsNiva.map(o => sv(Math.round(o * m), 1)).join(' | '));
console.log('intäktsnivåer:', omsNiva.map(o => sv(Math.round(o))).join(' | '));
console.log('1 pp marginal =', sv(oms[3] * 0.01, 1), 'Mkr | 3 % intäkter =', sv(oms[3] * 0.03, 1), 'Mkr');
console.log('marginalvikt = 1 ÷ (3 × marginalnivå) =', (1 / (3 * ebitMarginal)).toFixed(2));
console.log('multiplövning: P/E ÷ (1 + prognos) = 18,491 ÷ 1,2553 =', (pe / (1 + p.tillvaxt.prognosTillvaxt)).toFixed(2));
