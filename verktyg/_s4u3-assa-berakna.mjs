// Beräkningsunderlag s4-u3 ASSA ABLOY — medianer, rang, aritmetik (körs av KVD igen)
import fs from 'node:fs';
const L = JSON.parse(fs.readFileSync('/home/ak1a/AK1/data/portfolj-system/bolagsunivers.json', 'utf8'));
const A = L.find(x => x.ticker === 'ASSA-B.ST');
const ind = L.filter(x => x.bransch === 'industri');

const med = (arr) => { const s = arr.filter(v => v !== null && v !== undefined).sort((a, b) => a - b); const n = s.length;
  if (!n) return { n: 0 }; const m = n % 2 ? s[(n - 1) / 2] : (s[n / 2 - 1] + s[n / 2]) / 2; return { n, m }; };
const rang = (arr, val) => arr.filter(v => v !== null && v !== undefined).filter(v => v < val).length + 1;

const falt = [
  ['P/E', x => x.vardering?.pe], ['P/B', x => x.vardering?.pb], ['EV/EBIT', x => x.vardering?.evEbit],
  ['PEG', x => x.vardering?.peg],
  ['ROE', x => x.lonksamhet?.roe], ['brutto', x => x.lonksamhet?.bruttoMarginal], ['EBIT', x => x.lonksamhet?.ebitMarginal],
  ['netto', x => x.lonksamhet?.nettoMarginal],
  ['omsCAGR', x => x.tillvaxt?.omsattningCAGR5ar], ['resCAGR', x => x.tillvaxt?.resultatCAGR5ar],
  ['skuldEK', x => x.stabilitet?.skuldEgenkapital],
];
console.log('=== INDUSTRIMEDIANER (n=' + ind.length + ') + ASSA rang ===');
for (const [namn, f] of falt) {
  const iV = ind.map(f).map(v => typeof v === 'number' ? v : null);
  const uV = L.map(f).map(v => typeof v === 'number' ? v : null);
  const av = f(A);
  const mi = med(iV), mu = med(uV);
  console.log(`${namn.padEnd(10)} ASSA=${av ?? 'null'}  indMed=${mi.m?.toFixed?.(4) ?? '?'} (n=${mi.n}) rang=${av != null ? rang(iV, av) + '/' + mi.n : '-'}  uniMed=${mu.m?.toFixed?.(4) ?? '?'} (n=${mu.n})`);
}

console.log('\n=== ASSA CENTRALA TAL ===');
const v = A.vardering, t = A.tillvaxt, l = A.lonksamhet, s = A.stabilitet;
console.log('pris', A.pris, 'PE', v.pe, 'PB', v.pb, 'EVEBIT', v.evEbit, 'PEG', v.peg);
console.log('ROE', l.roe, 'brutto', l.bruttoMarginal, 'EBIT', l.ebitMarginal, 'netto', l.nettoMarginal, 'fcfM', l.fcfMarginal);
console.log('skuldEK', s.skuldEgenkapital, 'omsCAGR', t.omsattningCAGR5ar, 'resCAGR', t.resultatCAGR5ar, 'TTM', t.omsattningTillvaxtTTM, 'prognos', t.prognosTillvaxt);

console.log('\n=== EGENA BERÄKNINGAR ===');
const id = v.pb / l.roe;
console.log('identitet PB/ROE =', id.toFixed(4), 'mot PE', v.pe, 'brott %', ((id - v.pe) / v.pe * 100).toFixed(2));
console.log('PEG-konvention PE/prognos =', (v.pe / (t.prognosTillvaxt * 100)).toFixed(4), 'källa', v.peg, 'kvot', (v.peg / (v.pe / (t.prognosTillvaxt * 100))).toFixed(3), 'implicit tillväxt ur källa =', (v.pe / v.peg).toFixed(2) + '%');
console.log('omsCAGR check =', (Math.pow(A.serier.omsattning[3] / A.serier.omsattning[0], 1 / 3) - 1).toFixed(6));
console.log('resCAGR check =', (Math.pow(A.serier.resultat[3] / A.serier.resultat[0], 1 / 3) - 1).toFixed(6));
const o = A.serier.omsattning, r = A.serier.resultat;
console.log('årssteg oms %:', o.slice(1).map((x, i) => ((x / o[i] - 1) * 100).toFixed(2)).join(' '));
console.log('årssteg res %:', r.slice(1).map((x, i) => ((x / r[i] - 1) * 100).toFixed(2)).join(' '));
// kvartal
console.log('Q2-26 EBITmarg', (6680 / 39259 * 100).toFixed(3), 'Q2-25', (6155 / 38015 * 100).toFixed(3), 'diff bp', ((6680 / 39259 - 6155 / 38015) * 10000).toFixed(0));
console.log('Q1-26 EBITmarg', (5461 / 35751 * 100).toFixed(3), 'Q3-25', (6416 / 38146 * 100).toFixed(3));
console.log('Q1-26 oms YoY', ((35751 / 37940 - 1) * 100).toFixed(2), 'kvartalskomponenter 2+2-10 = -6');
console.log('Q2-26 oms YoY', ((39259 / 38015 - 1) * 100).toFixed(2), '4+2-3 = +3');
console.log('Q3-25 oms YoY', ((38146 / 37418 - 1) * 100).toFixed(2), '3+5+FX', ((38146 / 37418 - 1) * 100 - 8).toFixed(1));
console.log('Q2-26 ex-FX oms', 39259 + 2753, 'YoY ex-FX %', ((42012 / 38015 - 1) * 100).toFixed(2));
console.log('2025 Q1-Q3 summa', 37940 + 38015 + 38146, 'Q4-25 härledd =', o[3] - (37940 + 38015 + 38146));
console.log('TTM-oms jul25-jun26 härledd =', o[3] - 37940 - 38015 + 35751 + 39259);
// EBIT 2025 + scenarioruta
const EBIT25 = l.ebitMarginal * o[3];
console.log('\nEBIT2025 = 0,1687 × 152409 =', (EBIT25 / 1e6).toFixed(1), 'MSEK', '(exakt', EBIT25.toFixed(0), ')');
console.log('1 pp marginal =', (0.01 * o[3] / 1e6).toFixed(1), 'MSEK; 3 % oms =', (0.03 * EBIT25 / 1e6).toFixed(1), 'MSEK');
console.log('marginalvikt = 1/(3×0,1687) =', (1 / (3 * l.ebitMarginal)).toFixed(3));
for (const dm of [-0.01, 0, 0.01]) for (const dv of [-0.03, 0, 0.03])
  console.log(`cell m${(dm * 100).toFixed(0)}pp v${(dv * 100).toFixed(0)}%:`, ((EBIT25 * (1 + dv) + dm * o[3] * (1 + dv)) / 1e6).toFixed(0));
console.log('multipl PE/(1+prognos) =', (v.pe / (1 + t.prognosTillvaxt)).toFixed(2), ' PE/(1+omsCAGR) =', (v.pe / (1 + t.omsattningCAGR5ar)).toFixed(2));
// DuPont
const net = l.nettoMarginal, h = 1 + s.skuldEgenkapital;
const turn = l.roe / (net * h);
console.log('DuPont: ROE = netto × turnover × hävstång:', (net * turn * h).toFixed(6), 'turnover härledd =', turn.toFixed(4), 'hävstång = EK+skuld/EK =', h.toFixed(3));
// EV-kedja
console.log('PE × (netto/EBIT) =', (v.pe * (net / l.ebitMarginal)).toFixed(2), '→ P/E på EIT-bas; fält EVEBIT =', v.evEbit, 'kvot fält/bas =', (v.evEbit / (v.pe * net / l.ebitMarginal)).toFixed(3));
// brutto→EBIT klipp
console.log('brutto-EBIT klipp =', ((l.bruttoMarginal - l.ebitMarginal) * 100).toFixed(1), 'pp; EBIT-netto =', ((l.ebitMarginal - l.nettoMarginal) * 100).toFixed(1), 'pp');
