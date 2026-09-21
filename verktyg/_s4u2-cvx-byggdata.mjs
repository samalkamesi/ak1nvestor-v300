// _s4u2-cvx-byggdata.mjs — beräkningsmotor för CVX (Chevron) Q3-2026-läspaketet (spår 4, s4-u2).
// Källor: data/portfolj-system/bolagsunivers.json (CVX-post 2026-09-03) + sökverifierade
// rapporttal (chevron.com/SEC via sök 2026-09-21). ABORT-grind: avvikelse = stopp före disk.
import { readFileSync, writeFileSync } from 'node:fs';

const U = JSON.parse(readFileSync('/home/ak1a/AK1/data/portfolj-system/bolagsunivers.json', 'utf8'));
const M = U.find(x => x.ticker === 'CVX');
if (!M) { console.error('ABORT: CVX-post saknas'); process.exit(1); }
const GREN = U.filter(x => x.bransch === 'energi');
const fel = [];
const avr = (x, n = 4) => Math.round(x * 10 ** n) / 10 ** n;

const med = arr => { const v = arr.filter(x => x !== null && x !== undefined && Number.isFinite(x)).sort((a, b) => a - b); if (!v.length) return null; const m = Math.floor(v.length / 2); return v.length % 2 ? v[m] : (v[m - 1] + v[m]) / 2; };
const rang = (tick, path, riktning) => {
  const val = x => path.split('.').reduce((o, k) => (o == null ? undefined : o[k]), x);
  const lista = GREN.map(b => ({ t: b.ticker, v: val(b) })).filter(o => Number.isFinite(o.v)).sort((a, b) => riktning === 'högst' ? b.v - a.v : a.v - b.v);
  const i = lista.findIndex(o => o.t === tick);
  return i < 0 ? null : { rang: i + 1, av: lista.length, lista: lista.map(o => o.t) };
};

// — fältvärlden (universumet 2026-09-03) —
const F = {
  pris: M.pris, mcap: M.marknadsKapitalMdr,
  pe: M.vardering.pe, pb: M.vardering.pb, evEbit: M.vardering.evEbit,
  peg: M.vardering.peg, fcfYield: M.vardering.fcfYield,
  roe: M.lonksamhet.roe, roic: M.lonksamhet.roic, brutto: M.lonksamhet.bruttoMarginal,
  ebit: M.lonksamhet.ebitMarginal, netto: M.lonksamhet.nettoMarginal, fcfMarg: M.lonksamhet.fcfMarginal,
  skuldEk: M.stabilitet.skuldEgenkapital,
  omsCagr: M.tillvaxt.omsattningCAGR5ar, resCagr: M.tillvaxt.resultatCAGR5ar,
  ttm: M.tillvaxt.omsattningTillvaxtTTM, prognos: M.tillvaxt.prognosTillvaxt,
  insider: M.aterkop.insiderkopSenaste6man,
  serAr: M.serier.ar, serOms: M.serier.omsattning, serRes: M.serier.resultat,
};

// — rapportvärlden (sökverifierad 2026-09-21: chevron.com pressreleaser, Fortune-transkript, Reuters, CNBC, Yahoo/Investing) —
const Q = {
  q3_25: { netto: 3.5, eps: 1.82, justNetto: 3.6, justEps: 1.85, justEpsEst: 1.70, oms: 49.73, omsEst: 48.4, dag: '2025-10-31', noterat: 'rekordproduktion; aktien +2,6–3 % på rappdagen' },
  q4_25: { netto: 2.8, eps: 1.39, justNetto: 3.0, justEps: 1.52, justEpsEst: 1.45, oms: 46.87, dag: '2026-01-30' },
  q1_26: { netto: 2.2, eps: 1.11, justNetto: 2.8, justEps: 1.41, justEpsEst: 0.95, oms: 48.61, omsEst: 52, dag: '2026-05-01', agare: 6.0, boed: 3.86, dagKbd: '+500' },
  q2_26: { netto: 12.1, eps: 6.11, justNetto: 12.0, justEps: 6.06, justEpsEst: 5.11, oms: 70.06, omsPy: 44.8, agare: 12.0, dag: '2026-07-31', boed: 4.07, roce: 21 },
  q3_26: { dag: '2026-10-30 (estimat)' },
  hess: { synergier: 1.5, fcfVsDividend: 'dubbel' },
};

// — härledningar —
const R = {};
R.aktieAntal = avr(F.mcap * 1e9 / F.pris / 1e9, 4);
R.epsTtmFalt = avr(F.pris / F.pe, 3);
R.epsTtmRapport = avr(Q.q3_25.eps + Q.q4_25.eps + Q.q1_26.eps + Q.q2_26.eps, 2);
R.epsGapPct = avr((R.epsTtmFalt - R.epsTtmRapport) / R.epsTtmRapport * 100, 2);
R.nettoTtmFalt = avr(F.mcap / F.pe, 2);
R.nettoTtmRapport = avr(Q.q3_25.netto + Q.q4_25.netto + Q.q1_26.netto + Q.q2_26.netto, 2);
R.q2AndelTtm = avr(Q.q2_26.eps / R.epsTtmRapport * 100, 1);
R.netto2025 = avr(F.serRes[3] / 1e9, 2); // MUSD → mdr (12 299 MUSD = 12,30 mdr)
R.ttmMot2025 = avr((R.nettoTtmRapport / R.netto2025 - 1) * 100, 1);
R.omsTtm = avr(Q.q3_25.oms + Q.q4_25.oms + Q.q1_26.oms + Q.q2_26.oms, 2);
R.omsTtmPy = avr(50.5 + 52.2 + 47.6 + 44.8, 2);
R.omsTtmVaxt = avr((R.omsTtm / R.omsTtmPy - 1) * 100, 1);
R.q2OmsVaxt = avr((Q.q2_26.oms / Q.q2_26.omsPy - 1) * 100, 1);
R.pegKonv = avr(F.pe / Math.abs(F.prognos * 100), 3);
R.pegKvot = avr(F.peg / R.pegKonv, 3);
R.peEvKvot = avr(F.pe / F.evEbit, 3);
R.fcfOverNetto = avr((F.fcfMarg - F.netto) * 100, 2);
R.h1Netto = avr(Q.q1_26.netto + Q.q2_26.netto, 2);
R.h1Agare = avr(Q.q1_26.agare + Q.q2_26.agare, 2);
R.h1AgareMotNetto = avr(R.h1Agare / R.h1Netto * 100, 1);
R.q2KontrollAktier = avr(Q.q2_26.eps * R.aktieAntal, 2); // ≈ Q2-netto
R.serOmsCagr = avr(((F.serOms[3] / F.serOms[0]) ** (1 / 3) - 1) * 100, 2);
R.serResCagr = avr(((F.serRes[3] / F.serRes[0]) ** (1 / 3) - 1) * 100, 2);
R.q2MotQ1 = avr((Q.q2_26.justEps / Q.q1_26.justEps - 1) * 100, 1);
R.q1Beat = avr((Q.q1_26.justEps / Q.q1_26.justEpsEst - 1) * 100, 1);
R.q2Beat = avr((Q.q2_26.justEps / Q.q2_26.justEpsEst - 1) * 100, 1);
R.q3Beat = avr((Q.q3_25.justEps / Q.q3_25.justEpsEst - 1) * 100, 1);

// — scenarioruta: bas 2025 (fält: oms 189 031 MUSD, EBIT-marginal 21,87 %) —
const bas = { oms: F.serOms[3] / 1e6, marg: F.ebit };
R.scenBasEbit = avr(bas.oms * bas.marg / 1000, 2);
R.scen = {};
for (const [dv, dvn] of [[-0.03, '-3%'], [0, '0'], [0.03, '+3%']]) {
  for (const [dm, dmn] of [[-0.01, '-1pp'], [0, '0'], [0.01, '+1pp']]) {
    R.scen[`${dvn}/${dmn}`] = avr(bas.oms * (1 + dv) * (bas.marg + dm) / 1000, 2);
  }
}
R.enhetMarginal = avr(bas.oms * 0.01 / 1000, 3);
R.enhetVolymEbit = avr(bas.oms * 0.01 * bas.marg / 1000, 3);

// — medianer + rang —
const faltTabell = [
  ['pe', 'vardering.pe'], ['pb', 'vardering.pb'], ['evEbit', 'vardering.evEbit'], ['peg', 'vardering.peg'],
  ['fcfYield', 'vardering.fcfYield'], ['roe', 'lonksamhet.roe'], ['roic', 'lonksamhet.roic'],
  ['brutto', 'lonksamhet.bruttoMarginal'], ['ebit', 'lonksamhet.ebitMarginal'], ['netto', 'lonksamhet.nettoMarginal'],
  ['fcfMarg', 'lonksamhet.fcfMarginal'], ['skuldEk', 'stabilitet.skuldEgenkapital'],
  ['omsCagr', 'tillvaxt.omsattningCAGR5ar'], ['resCagr', 'tillvaxt.resultatCAGR5ar'],
  ['ttm', 'tillvaxt.omsattningTillvaxtTTM'], ['prognos', 'tillvaxt.prognosTillvaxt'],
];
const medianer = {}; const ranglista = {};
for (const [namn, path] of faltTabell) {
  const val = x => path.split('.').reduce((o, k) => (o == null ? undefined : o[k]), x);
  medianer[namn] = { median: med(GREN.map(val)), n: GREN.filter(b => Number.isFinite(val(b))).length, varde: val(M) };
  const ho = rang('CVX', path, 'högst'); const la = rang('CVX', path, 'lägst');
  ranglista[namn] = { hogst: ho ? `${ho.rang}/${ho.av}` : null, lagst: la ? `${la.rang}/${la.av}` : null, top3: ho ? ho.lista.slice(0, 3) : [] };
}
R.universumMedian = {};
for (const [namn, path] of faltTabell) {
  const val = x => path.split('.').reduce((o, k) => (o == null ? undefined : o[k]), x);
  R.universumMedian[namn] = med(U.map(val));
}

// — ABORT-grindar —
const grillar = [
  ['aktieAntal', R.aktieAntal, 1.9626, 0.005],
  ['epsTtmFalt', R.epsTtmFalt, 10.40, 0.02],
  ['epsTtmRapport', R.epsTtmRapport, 10.43, 0.01],
  ['epsGapPct', R.epsGapPct, -0.29, 0.15],
  ['nettoTtmRapport', R.nettoTtmRapport, 20.6, 0.05],
  ['nettoTtmFalt', R.nettoTtmFalt, 20.40, 0.05],
  ['q2AndelTtm', R.q2AndelTtm, 58.6, 0.2],
  ['ttmMot2025', R.ttmMot2025, 67.5, 0.5],
  ['omsTtm', R.omsTtm, 215.27, 0.05],
  ['omsTtmVaxt', R.omsTtmVaxt, 10.3, 0.3],
  ['q2OmsVaxt', R.q2OmsVaxt, 56.4, 0.3],
  ['pegKonv', R.pegKonv, 1.204, 0.005],
  ['peEvKvot', R.peEvKvot, 2.073, 0.01],
  ['fcfOverNetto', R.fcfOverNetto, 0.65, 0.02],
  ['h1AgareMotNetto', R.h1AgareMotNetto, 125.9, 0.6],
  ['serOmsCagr', R.serOmsCagr, -8.44, 0.05],
  ['serResCagr', R.serResCagr, -29.74, 0.05],
  ['scenBasEbit', R.scenBasEbit, 41.34, 0.05],
  ['q2KontrollAktier', R.q2KontrollAktier, 11.99, 0.06],
];
for (const [namn, räkna, vill, tol] of grillar) if (!Number.isFinite(räkna) || Math.abs(räkna - vill) > tol) fel.push(`${namn}: räknat ${räkna} mot förväntat ${vill} (tol ${tol})`);
if (GREN.length !== 22) fel.push(`grenen ${GREN.length} != 22`);

const ref = { genererad: new Date().toISOString(), falt: F, rapport: Q, harledd: R, medianer, ranglista, grenBolag: GREN.map(b => b.ticker), kontrollFelfree: fel.length === 0 };
if (fel.length) { console.error('ABORT — grinda missad:\n' + fel.join('\n')); process.exit(1); }
writeFileSync('/home/ak1a/AK1/verktyg/_s4u2-cvx-byggdata-referens.json', JSON.stringify(ref, null, 1));
console.log('GRÖN — motor konsistent. Gren', GREN.length, 'bolag. Scenarieceller:', JSON.stringify(R.scen));
console.log('rang:', JSON.stringify(Object.fromEntries(Object.entries(ranglista).map(([k, v]) => [k, v.hogst + ' H / ' + v.lagst + ' L']))));
console.log('medianer:', JSON.stringify(Object.fromEntries(Object.entries(medianer).map(([k, v]) => [k, v.median]))));
