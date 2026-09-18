#!/usr/bin/env node
// s4-u3 VÅR ENERGI — beräkningsunderlag för Q3-läspaketet (2026-09-18)
// Källa: data/portfolj-system/bolagsunivers.json post VAR.OL (hämtad 2026-09-03)
import fs from 'node:fs';

const U = JSON.parse(fs.readFileSync('/home/ak1a/AK1/data/portfolj-system/bolagsunivers.json', 'utf8'));
const p = U.find(x => x.ticker === 'VAR.OL');
const E = U.filter(x => x.bransch === 'energi');
const r = (x, d = 2) => Number(Number(x).toFixed(d));
const pct = (x, d = 2) => r(x * 100, d);
const p1 = (x, d = 1) => r(x, d);

console.log('=== POST ===');
console.log('poster i filen:', U.length, '| energi:', E.length);
console.log('pris', p.pris, 'NOK | mcap', p.marknadsKapitalMdr, 'mdr NOK');

console.log('\n=== HÄRLEDDA GRUNDER ===');
const aktier = p.marknadsKapitalMdr * 1000 / p.pris; // miljoner
console.log('aktier (mcap/pris):', r(aktier, 1), 'miljoner');
const ek = p.marknadsKapitalMdr / p.vardering.pb; // "P/B-enheter" (mdr)
console.log('EK härlett (mdr, mcap/P/B):', r(ek, 1));
console.log('BV/aktie (pris/P/B):', r(p.pris / p.vardering.pb, 4));
const skuld = p.stabilitet.skuldEgenkapital * ek;
console.log('skuld härledd (skuld/EK × EK):', r(skuld, 1), 'mdr');
const ev = ek + skuld;
console.log('EV kedja:', r(ev, 1), 'mdr');
const ebit25 = p.serier.omsattning[3] * p.lonksamhet.ebitMarginal;
console.log('EBIT 2025 (oms × EBITmarg):', r(ebit25, 1), 'M; fält EBITmarg', pct(p.lonksamhet.ebitMarginal), '%');

console.log('\n=== KONTROLL 1: IDENTITET P/E = P/B ÷ ROE ===');
const idVag = p.vardering.pb / p.lonksamhet.roe;
const idVagOmv = p.vardering.pe * p.lonksamhet.roe;
console.log('P/B ÷ ROE =', r(idVag, 3), 'mot P/E', p.vardering.pe, '→ gap', pct(idVag / p.vardering.pe - 1, 1), '% | kvot', r(idVag / p.vardering.pe, 3));
console.log('omvänt P/E × ROE =', r(idVagOmv, 3), 'mot P/B', p.vardering.pb, '→ faktor', r(p.vardering.pb / idVagOmv, 3));
console.log('implicit EPS (pris/P/E):', r(p.pris / p.vardering.pe, 4));
console.log('valutafria testet: (EPS-underlag P/E) ÷ (ROE × BV-underlag P/B) =', r((p.pris / p.vardering.pe) / (p.lonksamhet.roe * (p.pris / p.vardering.pb)), 3), '(växelkursen förkortas ut — brottet är inte NOK/USD i sig)');

console.log('\n=== KONTROLL 2: TTM-DETEKTIV ===');
console.log('omsTTM-fält', pct(p.tillvaxt.omsattningTillvaxtTTM, 1), '% mot senaste årssteg', pct(p.serier.omsattning[3] / p.serier.omsattning[2] - 1, 2), '%');

console.log('\n=== KONTROLL 3: PEG ===');
console.log('PEG-fält:', p.vardering.peg, '| prognostillväxt', pct(p.tillvaxt.prognosTillvaxt, 2), '% | konvention P/E÷tillväxt =', r(p.vardering.pe / pct(p.tillvaxt.prognosTillvaxt, 2), 2), '(negativt — formeln vägrar)');

console.log('\n=== KONTROLL 4: EV-KEDJA 5 STEG ===');
console.log('steg1 EK', r(ek, 1), '| steg2 skuld', r(skuld, 1), '| steg3 EV', r(ev, 1), '| steg4 EBIT25', r(ebit25, 1), '| steg5 EV/EBIT', r(ev * 1000 / ebit25, 3));
const kvot = (ev * 1000 / ebit25) / p.vardering.evEbit;
console.log('mot fält', p.vardering.evEbit, '→ kvot', r(kvot, 3), '(Yarkvot 0,12 — nytt extrem om lägre)');
console.log('fältets implicerade EV = fält × EBIT25 =', r(p.vardering.evEbit * ebit25 / 1000, 1), 'mdr, mot mcap', p.marknadsKapitalMdr, '→ implicerad nettokassa', r(p.marknadsKapitalMdr - p.vardering.evEbit * ebit25 / 1000, 0), 'mdr i fältvärlden');

console.log('\n=== KONTROLL 5: FCF-PAR ===');
const fcf = p.serier.omsattning[3] * p.lonksamhet.fcfMarginal;
console.log('FCF (marginal × oms2025):', r(fcf, 1), 'M → yield', pct(fcf / (p.marknadsKapitalMdr * 1000), 2), '% mot fältets', pct(p.vardering.fcfYield, 2), '% → kvot', r((fcf / (p.marknadsKapitalMdr * 1000)) / p.vardering.fcfYield, 3));
console.log('omvänt: yieldfält × mcap =', r(p.vardering.fcfYield * p.marknadsKapitalMdr * 1000, 1), 'M → marginal', pct(p.vardering.fcfYield * p.marknadsKapitalMdr * 1000 / p.serier.omsattning[3], 2), '% mot fältets', pct(p.lonksamhet.fcfMarginal, 2), '%');

console.log('\n=== KONTROLL 6: ROIC-PROXY ===');
console.log('proxy enlig not: EBIT/(skuld+EK) =', pct(ebit25 / (ev * 1000), 2), '% mot fältets', pct(p.lonksamhet.roic, 2), '% → kvot', r((ebit25 / (ev * 1000)) / p.lonksamhet.roic, 3));

console.log('\n=== KONTROLL 7: DUPONT ===');
const omsPerEk = p.serier.omsattning[3] / (ek * 1000);
console.log('oms/EK =', r(omsPerEk, 3), '| netto×oms/EK (ROE före hävstång) =', pct(p.lonksamhet.nettoMarginal * omsPerEk, 1), '%');
console.log('full DuPont ×(1+skuld/EK) =', pct(p.lonksamhet.nettoMarginal * omsPerEk * (1 + p.stabilitet.skuldEgenkapital), 1), '% mot ROE-fält', pct(p.lonksamhet.roe, 1), '% → faktor', r(p.lonksamhet.nettoMarginal * omsPerEk * (1 + p.stabilitet.skuldEgenkapital) / p.lonksamhet.roe, 2));

console.log('\n=== KONTROLL 8: CAGR-REPLIKERING ===');
const cagr = (a, b, n) => (Math.pow(b / a, 1 / n) - 1);
console.log('omsCAGR eigen', pct(cagr(p.serier.omsattning[0], p.serier.omsattning[3], 3), 2), '% mot fält', pct(p.tillvaxt.omsattningCAGR5ar, 2), '%');
console.log('resCAGR eigen', pct(cagr(p.serier.resultat[0], p.serier.resultat[3], 3), 2), '% mot fält', pct(p.tillvaxt.resultatCAGR5ar, 2), '%');
console.log('årssteg oms:', p.serier.omsattning.slice(1).map((v, i) => pct(v / p.serier.omsattning[i] - 1, 2)).join(' / '), '%');
console.log('årssteg res:', p.serier.resultat.slice(1).map((v, i) => pct(v / p.serier.resultat[i] - 1, 2)).join(' / '), '%');
console.log('nettomarginalserie:', p.serier.resultat.map((v, i) => pct(v / p.serier.omsattning[i], 2)).join(' / '), '%');

console.log('\n=== TRAPPA ===');
const b = p.lonksamhet.bruttoMarginal, eb = p.lonksamhet.ebitMarginal, ne = p.lonksamhet.nettoMarginal;
console.log('brutto', pct(b, 2), '→ EBIT', pct(eb, 2), '(−' + p1(pct(b - eb, 1), 1) + ' pp) → netto', pct(ne, 2), '(−' + p1(pct(eb - ne, 1), 1) + ' pp)');
console.log('EBIT→netto andel:', pct((eb - ne) / eb, 1), '% av EBIT försvinner i skatt+finans');
console.log('brutto→netto totalt:', pct(b - ne, 1), 'pp');

console.log('\n=== SCENARIORUTA (2025-bas EBIT) ===');
const oms25 = p.serier.omsattning[3];
for (const df of [-0.03, 0, 0.03]) for (const dm of [-0.01, 0, 0.01]) {
  console.log('intäkter', r(oms25 * (1 + df), 1), '× marginal', pct(eb + dm, 2), '% =', r(oms25 * (1 + df) * (eb + dm), 1), 'M');
}
console.log('1 pp marginal =', r(oms25 * 0.01, 2), 'M | 3 % intäkter =', r(oms25 * 0.03, 2), 'M | marginalvikt 1/(3×marg) =', r(1 / (3 * eb), 3));
console.log('multiplövning P/E ÷ (1+prognos):', r(p.vardering.pe / (1 + p.tillvaxt.prognosTillvaxt), 2));

console.log('\n=== MEDIANER & RANG (ur ' + U.length + '-postfilen 2026-09-18) ===');
const med = arr => { const v = arr.filter(x => typeof x === 'number' && isFinite(x)).sort((a, c) => a - c); return v.length ? { m: v[(v.length - 1) >> 1], n: v.length } : { m: null, n: 0 }; };
const maatt = {
  'P/E': [x => x.vardering?.pe, p.vardering.pe], 'P/B': [x => x.vardering?.pb, p.vardering.pb],
  'EV/EBIT': [x => x.vardering?.evEbit, p.vardering.evEbit], 'PEG': [x => x.vardering?.peg, p.vardering.peg],
  'FCF-yield': [x => x.vardering?.fcfYield, p.vardering.fcfYield],
  'ROE': [x => x.lonksamhet?.roe, p.lonksamhet.roe], 'ROIC': [x => x.lonksamhet?.roic, p.lonksamhet.roic],
  'brutto': [x => x.lonksamhet?.bruttoMarginal, p.lonksamhet.bruttoMarginal],
  'EBIT': [x => x.lonksamhet?.ebitMarginal, p.lonksamhet.ebitMarginal],
  'netto': [x => x.lonksamhet?.nettoMarginal, p.lonksamhet.nettoMarginal],
  'skuld/EK': [x => x.stabilitet?.skuldEgenkapital, p.stabilitet.skuldEgenkapital],
  'omsCAGR': [x => x.tillvaxt?.omsattningCAGR5ar, p.tillvaxt.omsattningCAGR5ar],
  'prognos': [x => x.tillvaxt?.prognosTillvaxt, p.tillvaxt.prognosTillvaxt]
};
for (const [namn, [fn, eget]] of Object.entries(maatt)) {
  const gm = med(E.map(fn)), um = med(U.map(fn));
  const sort = E.map(fn).filter(x => typeof x === 'number' && isFinite(x)).sort((a, c) => a - c);
  const rang = sort.indexOf(eget) + 1;
  console.log(namn.padEnd(9), 'eget', String(eget).padEnd(9), '| gren', String(r(gm.m, 3)).padEnd(8), 'n=' + String(gm.n).padStart(2), '| univ', String(r(um.m, 4)).padEnd(8), 'n=' + String(um.n).padStart(3), '| rang i gren', rang + '/' + sort.length);
}
