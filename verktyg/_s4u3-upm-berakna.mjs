// Beräkningsunderlag s4-u3 UPM-Kymmene — medianer, rang, aritmetik
import fs from 'node:fs';
const L = JSON.parse(fs.readFileSync('/home/ak1a/AK1/data/portfolj-system/bolagsunivers.json', 'utf8'));
const U = L.find(x => x.ticker === 'UPM.HE');
const mat = L.filter(x => x.bransch === 'material');
const med = (a) => { const s = a.filter(v => typeof v === 'number').sort((x, y) => x - y); const n = s.length;
  if (!n) return { n: 0 }; return { n, m: n % 2 ? s[(n - 1) / 2] : (s[n / 2 - 1] + s[n / 2]) / 2 }; };
const rang = (a, v) => a.filter(x => typeof x === 'number' && x < v).length + 1;
const F = [['P/E', x => x.vardering?.pe], ['P/B', x => x.vardering?.pb], ['EV/EBIT', x => x.vardering?.evEbit], ['PEG', x => x.vardering?.peg],
  ['ROE', x => x.lonksamhet?.roe], ['ROIC', x => x.lonksamhet?.roic], ['brutto', x => x.lonksamhet?.bruttoMarginal], ['EBIT', x => x.lonksamhet?.ebitMarginal],
  ['netto', x => x.lonksamhet?.nettoMarginal], ['fcfM', x => x.lonksamhet?.fcfMarginal], ['omsCAGR', x => x.tillvaxt?.omsattningCAGR5ar],
  ['resCAGR', x => x.tillvaxt?.resultatCAGR5ar], ['skuldEK', x => x.stabilitet?.skuldEgenkapital], ['fcfY', x => x.vardering?.fcfYield]];
console.log('=== MATERIALMEDIANER (n=' + mat.length + ') + UPM rang ===');
for (const [n, f] of F) {
  const mV = mat.map(f), uV = L.map(f), uv = f(U), mi = med(mV), mu = med(uV);
  console.log(`${n.padEnd(9)} UPM=${uv ?? 'null'}  matMed=${mi.m?.toFixed(4) ?? '?'} (n=${mi.n}) rang=${uv != null ? rang(mV, uv) + '/' + mi.n : '-'}  uniMed=${mu.m?.toFixed(4) ?? '?'} (n=${mu.n})`);
}
const t = U.tillvaxt, l = U.lonksamhet, v = U.vardering, s = U.stabilitet;
console.log('\n=== EGENA BERÄKNINGAR ===');
const id = v.pb / l.roe;
console.log('identitet PB/ROE =', id.toFixed(4), 'mot PE', v.pe, 'brott %', ((id - v.pe) / v.pe * 100).toFixed(2));
console.log('PEG-konvention PE/prognos% =', (v.pe / (t.prognosTillvaxt * 100)).toFixed(4), 'källa', v.peg, 'kvot källa/konv =', (v.peg / (v.pe / (t.prognosTillvaxt * 100))).toFixed(1), 'implicit tillv % ur källa =', (v.pe / v.peg).toFixed(2));
const o = U.serier.omsattning, r = U.serier.resultat;
console.log('omsCAGR check =', (Math.pow(o[3] / o[0], 1 / 3) - 1).toFixed(6), 'resCAGR =', (Math.pow(r[3] / r[0], 1 / 3) - 1).toFixed(6));
console.log('årssteg oms %:', o.slice(1).map((x, i) => ((x / o[i] - 1) * 100).toFixed(2)).join(' '), ' totalt', ((o[3] / o[0] - 1) * 100).toFixed(1));
console.log('årssteg res %:', r.slice(1).map((x, i) => ((x / r[i] - 1) * 100).toFixed(2)).join(' '), ' totalt', ((r[3] / r[0] - 1) * 100).toFixed(1));
console.log('netto/oms per år %:', o.map((x, i) => (r[i] / x * 100).toFixed(2)).join(' '));
// kvartal
console.log('\nQ2-26: oms 2355 (2341)', ((2355 / 2341 - 1) * 100).toFixed(2) + '%', 'EBIT 212 (124)', ((212 / 124 - 1) * 100).toFixed(1) + '%', 'marg', (212 / 2355 * 100).toFixed(1), (124 / 2341 * 100).toFixed(1));
console.log('H1 EBIT 471 = 9,8% -> H1 oms =', (471 / 0.098).toFixed(0), 'Q1-26 härledd oms =', (471 / 0.098 - 2355).toFixed(0), 'EBIT =', 471 - 212, 'marg %', ((471 - 212) / (471 / 0.098 - 2355) * 100).toFixed(1));
console.log('Q3-25: oms 2298 (2521)', ((2298 / 2521 - 1) * 100).toFixed(2) + '%', 'EBIT 153 (291)', ((153 / 291 - 1) * 100).toFixed(1) + '%', 'marg', (153 / 2298 * 100).toFixed(1), (291 / 2521 * 100).toFixed(1));
console.log('Q1-25 härledd ur 9M: 7344-2341-2298 =', 7344 - 2341 - 2298);
console.log('Q4-25 härledd = 9656-7344 =', 9656 - 7344);
console.log('Q2-26 EBIT/oms-tolk: +71% på +0,6% oms = marginalmotorik');
// FCF/EBIT/valörer
console.log('\nFCF-marginal', l.fcfMarginal, 'mot netto', l.nettoMarginal, 'kvot =', (l.fcfMarginal / l.nettoMarginal).toFixed(3), '(Yara-klass omvänd: FCF ÖVER netto)');
console.log('ROIC', l.roic, 'ROE', l.roe, 'kvot =', (l.roic / l.roe).toFixed(3));
// DuPont
const h = 1 + s.skuldEgenkapital, turn = l.roe / (l.nettoMarginal * h);
console.log('DuPont: ROE = netto × turnover × hävstång =', (l.nettoMarginal * turn * h).toFixed(6), 'turnover härledd =', turn.toFixed(4), 'hävstång =', h.toFixed(4));
// EV-kedja
const peEbit = v.pe * (l.nettoMarginal / l.ebitMarginal);
console.log('PE × (netto/EBIT) =', peEbit.toFixed(2), 'fält EV/EBIT =', v.evEbit, 'kvot =', (v.evEbit / peEbit).toFixed(3), 'skuld/EK =', s.skuldEgenkapital);
// scenarioruta EBIT 2025
const EBIT25 = l.ebitMarginal * o[3];
console.log('\nEBIT2025 = 0,0981 × 9656 =', (EBIT25).toFixed(0), 'MEUR');
console.log('1 pp marginal =', (0.01 * o[3]).toFixed(0), 'MEUR; 3 % oms =', (0.03 * EBIT25).toFixed(0), 'MEUR; marginalvikt = 1/(3×0,0981) =', (1 / (3 * l.ebitMarginal)).toFixed(2));
for (const dm of [-0.01, 0, 0.01]) for (const dv of [-0.03, 0, 0.03])
  console.log(`cell m${(dm * 100).toFixed(0)}pp v${(dv * 100).toFixed(0)}%:`, (EBIT25 * (1 + dv) + dm * o[3] * (1 + dv)).toFixed(0));
console.log('multipl: PE/(1+prognos) =', (v.pe / (1 + t.prognosTillvaxt)).toFixed(2), ' PE/(1+CAGR-neg) =', (v.pe / (1 + t.omsattningCAGR5ar)).toFixed(2));
console.log('prognos vs fält: prognos', (t.prognosTillvaxt * 100).toFixed(2), 'TTM', (t.omsattningTillvaxtTTM * 100).toFixed(1), 'resCAGR-år', 'V-form +12,4/+10,1');
console.log('mcap', U.marknadsKapitalMdr, 'pris', U.pris);
