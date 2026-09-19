// _s4u1-truecaller-underlag.mjs — beräkningsunderlag för TRUE-B.ST Q3-2026-läspaketet
// Källor: data/portfolj-system/bolagsunivers.json (2026-09-03-posten) + sökverifierad rappfakta 2026-09-19.
import { readFileSync } from 'node:fs';

const u = JSON.parse(readFileSync('data/portfolj-system/bolagsunivers.json', 'utf8'));
const L = Array.isArray(u) ? u : (u.bolag || []);
const gren = L.filter(b => b.bransch === 'tillvaxt');
const p = L.find(b => b.ticker === 'TRUE-B.ST');

const med = (arr) => {
  const v = arr.filter(x => x !== null && x !== undefined && isFinite(x)).sort((a, b) => a - b);
  const n = v.length;
  if (!n) return null;
  return { n, m: n % 2 ? v[(n - 1) / 2] : (v[n / 2 - 1] + v[n / 2]) / 2 };
};

console.log('Universumposter:', L.length, '| tillväxtgrenen:', gren.length);

const mål = [
  ['pe', b => b.vardering?.pe], ['pb', b => b.vardering?.pb], ['evEbit', b => b.vardering?.evEbit],
  ['peg', b => b.vardering?.peg], ['fcfYield', b => b.vardering?.fcfYield],
  ['roe', b => b.lonksamhet?.roe], ['roic', b => b.lonksamhet?.roic],
  ['brutto', b => b.lonksamhet?.bruttoMarginal], ['ebit', b => b.lonksamhet?.ebitMarginal],
  ['netto', b => b.lonksamhet?.nettoMarginal], ['fcfMarg', b => b.lonksamhet?.fcfMarginal],
  ['skuldEk', b => b.stabilitet?.skuldEgenkapital],
  ['omsCagr', b => b.tillvaxt?.omsattningCAGR5ar], ['resCagr', b => b.tillvaxt?.resultatCAGR5ar],
  ['ttm', b => b.tillvaxt?.omsattningTillvaxtTTM], ['prognos', b => b.tillvaxt?.prognosTillvaxt],
];
console.log('\n=== MEDIANER + RANG (gren/universum) ===');
for (const [namn, f] of mål) {
  const g = med(gren.map(f)), un = med(L.map(f)), val = f(p);
  const arr = gren.map(f).filter(x => x !== null && x !== undefined && isFinite(x)).sort((a, b) => a - b);
  const rang = val === null || val === undefined ? '—' : (1 + arr.filter(x => x < val).length) + '/' + arr.length;
  console.log(namn.padEnd(9), 'TRUE=', val === null ? 'NULL' : val.toFixed(4),
    '| gren', g ? g.m.toFixed(4) + ' (n=' + g.n + ')' : '—',
    '| univ', un ? un.m.toFixed(4) + ' (n=' + un.n + ')' : '—', '| rang', rang);
}

console.log('\n=== HÄRLEDNINGAR ===');
const mcap = 7.484, pris = 24.2, pe = 33.151, pb = 7.213, evEbit = 16.638, roe = 0.2241;
const oms = [1772.926, 1728.895, 1863.218, 1912.195], res = [535.23, 536.333, 524.323, 388.625];
const EK = mcap / pb;
const skuld = 0.0419 * EK;
console.log('EK = mcap/PB =', EK.toFixed(1), 'Mkr | skuld = 4,19 % × EK =', skuld.toFixed(1), 'Mkr');
console.log('Aktier: mcap/pris =', (mcap * 1000 / pris).toFixed(1), 'M | utdelningsvägen 91,0/0,28 =', (91.0 / 0.28).toFixed(1), 'M | kvot', ((91.0 / 0.28) / (mcap * 1000 / pris)).toFixed(3));

const id = pb / roe;
console.log('IDENTITET: P/B ÷ ROE =', id.toFixed(3), 'mot P/E', pe, '→ gap', ((pe - id) / pe * 100).toFixed(2), '%');
const absK = pe * res[3] / 1000;
console.log('ABSOLUTKONTROLL: P/E × res2025 =', absK.toFixed(3), 'mdr mot mcap', mcap, '→ residual +', ((absK / mcap - 1) * 100).toFixed(1), '%');
const implV = mcap * 1000 / pe;
console.log('Implicit fältvinst = mcap/P/E =', implV.toFixed(1), 'Mkr');
console.log('ROE-vägen årsförmåga = ROE × EK =', (roe * EK).toFixed(1), 'Mkr');
const h2_25 = res[3] - 219.7;
const ttmV = h2_25 + 84.1;
console.log('TTM-rapportvägen: H2-25', h2_25.toFixed(1), '+ H1-26 84,1 =', ttmV.toFixed(1), 'Mkr | mot implicit', implV.toFixed(1), '→ gap', ((ttmV / implV - 1) * 100).toFixed(1), '%');

const ttmOms = 467.9 + 451.0 + 361.6 + 393.2;
const priTtm = 457.3 + 523.0 + 496.9 + 496.4;
const ttmT = (ttmOms / priTtm - 1) * 100;
console.log('TTM-oms sök:', ttmOms.toFixed(1), '| prior TTM:', priTtm.toFixed(1), '| tillväxt', ttmT.toFixed(1), '% (fältet −20,7; kvot', (20.7 / -ttmT).toFixed(2) + ')');
console.log('FY2025-check: 496,9+496,4+467,9+451,0 =', (496.9 + 496.4 + 467.9 + 451.0).toFixed(1), 'mot serie', oms[3]);

const ebitF = 0.2416 * oms[3], ebitT = 0.2416 * ttmOms;
console.log('EV-väg fiscal: EBIT', ebitF.toFixed(1), '→ EV', (evEbit * ebitF).toFixed(0), '→ kassa', (mcap * 1000 + skuld - evEbit * ebitF).toFixed(0), '(omöjlig om <0)');
console.log('EV-väg TTM: EBIT', ebitT.toFixed(1), '→ EV', (evEbit * ebitT).toFixed(0), '→ kassa', (mcap * 1000 + skuld - evEbit * ebitT).toFixed(0), 'Mkr =', ((mcap * 1000 + skuld - evEbit * ebitT) / (mcap * 1000) * 100).toFixed(1), '% av mcap');

console.log('Netto-marginalserie 2022-2025:', oms.map((o, i) => (res[i] / o * 100).toFixed(1) + ' %').join(' → '));
console.log('Steg oms:', oms.slice(1).map((o, i) => ((o / oms[i] - 1) * 100).toFixed(2) + ' %').join(' | '));
console.log('Steg res:', res.slice(1).map((r, i) => ((r / res[i] - 1) * 100).toFixed(2) + ' %').join(' | '));
console.log('CAGR oms:', (((oms[3] / oms[0]) ** 0.25 - 1) * 100).toFixed(2), '% | CAGR res:', (((res[3] / res[0]) ** 0.25 - 1) * 100).toFixed(2), '% (fält: 2,55 / −10,12)');

const pegK = pe / 37.3;
console.log('PEG-konvention: P/E ÷ prognos = 33,151 ÷ 37,3 =', pegK.toFixed(2), '(fältet NULL)');
console.log('Multiplövning: 33,151 ÷ 1,373 =', (pe / 1.373).toFixed(1), '→ P/E om prognosen infrias vid oförändrad kurs');
console.log('Direktavkastning: 0,28 / 24,2 =', (0.28 / 24.2 * 100).toFixed(2), '%');

console.log('\n=== SCENARIORUTA (netto, bas 2025: oms 1912,195 × marginal) ===');
const bas = oms[3];
const rader = [bas * 0.97, bas, bas * 1.03], kolumner = [0.193, 0.203, 0.213];
const cell = [];
for (const r of rader) { const rr = []; for (const k of kolumner) rr.push((r * k / 1).toFixed(1)); cell.push(rr); }
console.log('            netto 19,3 %  netto 20,3 %  netto 21,3 %');
rader.forEach((r, i) => console.log('oms', r.toFixed(1).padStart(8), cell[i].map(c => c.padStart(10)).join(' ')));
console.log('1 pp marginal =', (bas * 0.01).toFixed(1), 'Mkr | 3 % volym =', (bas * 0.03 * 0.203).toFixed(1), 'Mkr resultat | marginalvikt =', (0.01 / (0.03 * 0.203)).toFixed(2));
console.log('H1-26 netto faktiskt: 84,1 / 754,8 =', (84.1 / 754.8 * 100).toFixed(1), '%');
