// _s4u2-dis-byggdata.mjs — beräkningsmotor för DIS (Walt Disney) Q3-2026-läspaketet (spår 4, s4-u2).
// Källor: data/portfolj-system/bolagsunivers.json (DIS-post 2026-09-03, Yahoo+MarketStack) +
// sökverifierade rapporttal (thewaltdisneycompany.com/CNBC/Variety/WSJ/SEC via sök 2026-09-21).
// ABORT-grind: avvikelse = stopp före disk. EPS-vägen = redovisad utspädd EPS × aktieantal.
import { readFileSync, writeFileSync } from 'node:fs';

const U = JSON.parse(readFileSync('/home/ak1a/AK1/data/portfolj-system/bolagsunivers.json', 'utf8'));
const M = U.find(x => x.ticker === 'DIS');
if (!M) { console.error('ABORT: DIS-post saknas'); process.exit(1); }
const GREN = U.filter(x => x.bransch === 'kommunikation');
const avr = (x, n = 4) => Math.round(x * 10 ** n) / 10 ** n;

const med = arr => { const v = arr.filter(x => x !== null && x !== undefined && Number.isFinite(x)).sort((a, b) => a - b); if (!v.length) return null; const m = Math.floor(v.length / 2); return v.length % 2 ? v[m] : (v[m - 1] + v[m]) / 2; };
const rang = (tick, path, riktning) => {
  const val = x => path.split('.').reduce((o, k) => (o == null ? undefined : o[k]), x);
  const lista = GREN.map(b => ({ t: b.ticker, v: val(b) })).filter(o => Number.isFinite(o.v)).sort((a, b) => riktning === 'högst' ? b.v - a.v : a.v - b.v);
  const i = lista.findIndex(o => o.t === tick);
  return i < 0 ? null : { rang: i + 1, av: lista.length, lista: lista.map(o => o.t) };
};

// — fältvärlden (universumet 2026-09-03, slutkurs 2026-09-02) —
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

// — rapportvärlden (sökverifierad 2026-09-21; Disney räkenskapsår slutar sista lördagen i sept) —
const Q = {
  q4_25: { dag: '2025-11-13', oms: 22.46, omsEst: 22.75, eps: 0.73, epsPy: 0.25, justEps: 1.11, justEpsPy: 1.14, justEpsEst: 1.04, nettoTotalt: 1.44, nettoPy: 0.564, dtcOp: 0.352, dtcOpDelta: 0.099, subDh: 196, subDhDelta: 12.4, subD: 132, subDDelta: 3.8, entOp: 0.691, entOpDelta: -0.376 },
  q1_26: { dag: '2026-02-02', oms: 25.981, omsPy: 24.69, omsEst: 25.54, eps: 1.34, epsPy: 1.40, justEps: 1.63, justEpsPy: 1.76, justEpsEst: 1.57, foreSkatt: 3.693, dtcOms: 5.35, dtcOmsVaxt: 11, dtcOp: 0.450, dtcOpVaxt: 72 },
  q2_26: { dag: '2026-05-06', oms: 25.17, omsPy: 23.621, omsEst: 24.83, eps: 1.27, epsPy: 1.81, justEps: 1.57, justEpsPy: 1.45, justEpsEst: 1.49, op: 3.90, dtcOp: 0.582, dtcOpVaxt: 88, dtcOmsVaxt: 13 },
  q3_26: { dag: '2026-08-05', oms: 25.25, omsPy: 23.646, omsEst: 25.43, eps: 1.52, epsPy: 2.93, justEps: 2.06, justEpsEst: 1.86, nettoCirka: 2.64, segOpVaxt: 21, rekordExperiences: true },
  q4_26: { dag: '2026-11-12 (estimat, obekräftat)', segOpGuide: 4.9 },
  guide: { fy26JustEpsTillvaxt: 16, vecka53: true, kassaflodeMal: 8 },
  q3_25: { dag: '2025-08-06', oms: 23.646, eps: 2.93, justEps: 1.61, justEpsEst: 1.47, netto: 5.26, skattefordel: 'Hulu-relaterad engångspost (WSJ)' },
  fy25: { justEps9m: 4.82, justEpsAr: 5.93, gaepEpsAr: 6.85, nettoAr: 12.404 },
};

// — härledningar —
const R = {};
R.aktieAntal = avr(F.mcap / F.pris, 4); // mdr
R.epsTtmFalt = avr(F.pris / F.pe, 3);
R.epsTtmGaap = avr(Q.q4_25.eps + Q.q1_26.eps + Q.q2_26.eps + Q.q3_26.eps, 2);
R.epsGaapGapPct = avr((R.epsTtmFalt - R.epsTtmGaap) / R.epsTtmGaap * 100, 2);
R.epsTtmJust = avr(Q.q4_25.justEps + Q.q1_26.justEps + Q.q2_26.justEps + Q.q3_26.justEps, 2);
R.justGapMdr = avr(R.epsTtmJust - R.epsTtmGaap, 2); // USD per aktie
R.justGapAndel = avr((R.epsTtmJust - R.epsTtmGaap) / R.epsTtmJust * 100, 1);
R.pePaGaap = avr(F.pris / R.epsTtmGaap, 2);
R.pePaJust = avr(F.pris / R.epsTtmJust, 2);
R.nettoTtmFalt = avr(F.mcap / F.pe, 2);
R.nettoTtmGaap = avr(R.epsTtmGaap * R.aktieAntal, 2);
R.nettoGaapGapPct = avr((R.nettoTtmFalt - R.nettoTtmGaap) / R.nettoTtmGaap * 100, 2);
R.netto2025 = avr(F.serRes[3] / 1e9, 3); // USD → mdr (12 404 000 000 = 12,404)
R.ttmMot2025 = avr((R.nettoTtmGaap / R.netto2025 - 1) * 100, 1);
R.omsTtm = avr(Q.q4_25.oms + Q.q1_26.oms + Q.q2_26.oms + Q.q3_26.oms, 2);
R.omsTtmPy = avr(22.574 + 24.69 + 23.621 + 23.646, 2);
R.omsTtmVaxtKedja = avr((R.omsTtm / R.omsTtmPy - 1) * 100, 1);
R.ttmFaltPct = avr(F.ttm * 100, 1);
R.q3NettoHalvering = avr((Q.q3_26.nettoCirka / Q.q3_25.netto - 1) * 100, 0);
R.q4NettoDubbling = avr((Q.q4_25.nettoTotalt / Q.q4_25.nettoPy - 1) * 100, 0);
// identiteter och multiplar
R.pbRoeIdent = avr(F.pb / F.roe, 2);
R.identGapPct = avr((R.pbRoeIdent / F.pe - 1) * 100, 1);
R.ekPbVag = avr(F.mcap / F.pb, 1);
R.ekRoeVag = avr(R.nettoTtmFalt / F.roe, 1);
R.ekGapPct = avr((R.ekRoeVag / R.ekPbVag - 1) * 100, 1);
R.ebitTtm = avr(R.nettoTtmFalt * F.ebit / F.netto, 2);
R.ev = avr(F.evEbit * R.ebitTtm, 0);
R.evOverMcap = avr(R.ev / F.mcap, 3);
R.nettoskuldPekare = avr(R.ev - F.mcap, 0);
R.skuldUrkvot = avr(R.ekPbVag * F.skuldEk, 0);
R.pegKonv = avr(F.pe / Math.abs(F.prognos * 100), 3);
R.pegKvot = avr(F.peg / R.pegKonv, 3);
R.pegImplicit = avr(F.pe / F.peg, 2);
// serien
R.serOmsCagr = avr(((F.serOms[3] / F.serOms[0]) ** (1 / 3) - 1) * 100, 2);
R.serResCagr = avr(((F.serRes[3] / F.serRes[0]) ** (1 / 3) - 1) * 100, 2);
R.resFyraGanger = avr(F.serRes[3] / F.serRes[1], 2); // 2025 mot 2023 (botten)
R.omsFyraAr = avr((F.serOms[3] / F.serOms[0] - 1) * 100, 1);
// guideräkneri: vecka 53
R.fy26GuideEps = avr(Q.fy25.justEpsAr * (1 + Q.guide.fy26JustEpsTillvaxt / 100), 2);
R.niondeM26 = avr(Q.q1_26.justEps + Q.q2_26.justEps + Q.q3_26.justEps, 2);
R.q4Implicit = avr(R.fy26GuideEps - R.niondeM26, 2);
R.q4ImplicitVaxt = avr((R.q4Implicit / Q.q4_25.justEps - 1) * 100, 1);
// streamingtrappa
R.dtcTrappa = [Q.q4_25.dtcOp, Q.q1_26.dtcOp, Q.q2_26.dtcOp];
// utdelning/kassaflöde
R.fcfTtm = avr(R.omsTtm * F.fcfMarg, 1);
R.fcfMotMal = avr(R.fcfTtm / Q.guide.kassaflodeMal * 100, 0);
// — scenarioruta: bas FY2025 (fält: oms 94 425 MUSD, EBIT-marginal 19,3 %) —
const bas = { oms: F.serOms[3] / 1e9, marg: F.ebit * 100 }; // mdr, procent
R.scenBasEbit = avr(bas.oms * bas.marg / 100, 2);
R.scen = {};
for (const [dv, dvn] of [[-0.03, '-3%'], [0, '0'], [0.03, '+3%']]) {
  for (const [dm, dmn] of [[-0.01, '-1pp'], [0, '0'], [0.01, '+1pp']]) {
    R.scen[`${dvn}/${dmn}`] = avr(bas.oms * (1 + dv) * (bas.marg + dm * 100) / 100, 2);
  }
}
R.enhetMarginal = avr(bas.oms * 0.01, 3);
R.enhetVolymEbit = avr(bas.oms * 0.01 * bas.marg / 100, 3);
R.marginalVager = avr(R.enhetMarginal / R.enhetVolymEbit, 1);

// — medianer + rang (kommunikationsgrenen 23 bolag, live) —
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
  const ho = rang('DIS', path, 'högst'); const la = rang('DIS', path, 'lägst');
  ranglista[namn] = { hogst: ho ? `${ho.rang}/${ho.av}` : null, lagst: la ? `${la.rang}/${la.av}` : null, top3: ho ? ho.lista.slice(0, 3) : [] };
}
R.universumMedian = {};
for (const [namn, path] of faltTabell) {
  const val = x => path.split('.').reduce((o, k) => (o == null ? undefined : o[k]), x);
  R.universumMedian[namn] = med(U.map(val));
}

const ut = { F, Q, R, medianer, ranglista, grenStorlek: GREN.length, universumStorlek: U.length };
writeFileSync('/home/ak1a/AK1/verktyg/_s4u2-dis-tal.json', JSON.stringify(ut, null, 1));
console.log(JSON.stringify({ R, medianer, ranglista, grenStorlek: GREN.length }, null, 1));
