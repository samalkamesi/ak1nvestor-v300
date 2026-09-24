// _s4u2-meta-byggdata.mjs — beräkningsmotor för META Q3-2026-läspaketet (spår 4, s4-u2).
// Källor: data/portfolj-system/bolagsunivers.json (META-post 2026-09-03) + sökverifierade
// rapporttal (investor.atmeta.com via sök 2026-09-21). Motorn räknar ALLT som paketet
// påstår — ABORT-grind: någon skillnad mot fasta referensTal = stopp innan disk.
import { readFileSync, writeFileSync } from 'node:fs';

const U = JSON.parse(readFileSync('/home/ak1a/AK1/data/portfolj-system/bolagsunivers.json', 'utf8'));
const M = U.find(x => x.ticker === 'META');
if (!M) { console.error('ABORT: META-post saknas'); process.exit(1); }
const GREN = U.filter(x => x.bransch === 'kommunikation');
const fel = [];
const avr = (x, n = 4) => Math.round(x * 10 ** n) / 10 ** n;

// — median (null-tolerant) och rang (1 = högst / lägst) —
const med = arr => { const v = arr.filter(x => x !== null && x !== undefined && Number.isFinite(x)).sort((a, b) => a - b); if (!v.length) return null; const m = Math.floor(v.length / 2); return v.length % 2 ? v[m] : (v[m - 1] + v[m]) / 2; };
const rang = (tick, path, riktning) => { // riktning 'högst' | 'lägst'
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

// — rapportvärlden (sökverifierad 2026-09-21 mot investor.atmeta.com + bevismaterial) —
const Q = {
  q3_25: { oms: 51242, omsPy: 40589, kostn: 30707, op: 20535, opMargPy: 0.43, netto: 2710, eps: 1.05, skattepost: -15930, nettoUtan: 18640, epsUtan: 7.25, epsEst: 6.66, dag: '2025-10-29' },
  q4_25: { oms: 59893, omsPy: 48385, op: 24745, opMargPy: 0.48, eps: 8.88, epsPy: 8.02, dag: '2026-01-28' },
  q1_26: { oms: 56311, omsPy: 42314, op: 22872, opPy: 17555, netto: 26773, nettoPy: 16644, eps: 10.44, epsPy: 6.43, skattefond: 8030, epsUtan: 7.31, epsEst: 8.15, annons: 55020, dag: '2026-04-29' },
  q2_26: { oms: 60801, kostn: 42026, op: 18775, opPy: 20441, skatt: 2908, eps: 6.18, epsEst: 7.14, rlIntakt: 431, rlForlust: 4620, dag: '2026-07-29' },
  q3_26: { omsEst: 63250, guideLo: 61000, guideHi: 64000, epsEst: 6.50, dag: '2026-10-28 (estimat)' },
  guidans: { kostn26: [165000, 169000], capex26: [130000, 145000], capex25: [70000, 72000], q3revLo: 61000, q3revHi: 64000 },
};
const KURS_FRISK = { pris: 668.57, datum: '2026-09-20', kalla: 'Robinhood via sök' };

// — härledningar —
const R = {};
R.aktieAntal = avr(F.mcap * 1e9 / F.pris / 1e9, 4);            // mdr aktier
R.epsTtmFalt = avr(F.pris / F.pe, 3);                            // USD
R.nettoTtmFalt = avr(F.mcap / F.pe, 2);                          // mdr USD
R.q4_25_netto = avr(F.serRes[3] / 1e6 - 16644 - 18337 - 2710, 2); // 2025-helår minus Q1–Q3 2025 (Q2 2025 netto 18 337 MUSD, Meta Q2-25-rapporten)
R.q2_26_netto = avr(Q.q2_26.eps * R.aktieAntal * 1000, 1);       // MUSD
R.nettoTtmRapport = avr((Q.q3_25.netto + R.q4_25_netto + Q.q1_26.netto + R.q2_26_netto) / 1000, 2); // mdr
R.epsTtmRapport = avr(Q.q3_25.eps + Q.q4_25.eps + Q.q1_26.eps + Q.q2_26.eps, 2);
R.gapEpsPct = avr((R.epsTtmFalt - R.epsTtmRapport) / R.epsTtmRapport * 100, 2);
R.omsTtm = (Q.q3_25.oms + Q.q4_25.oms + Q.q1_26.oms + Q.q2_26.oms) / 1000;       // mdr
R.omsTtmPy = (Q.q3_25.omsPy + Q.q4_25.omsPy + Q.q1_26.omsPy + 47516) / 1000;     // mdr (Q2 2025 = 47 516)
R.omsTtmVaxt = avr((R.omsTtm / R.omsTtmPy - 1) * 100, 2);
R.opMarg = q => avr(q.op / q.oms * 100, 2);
R.q3_25_marg = R.opMarg(Q.q3_25); R.q4_25_marg = R.opMarg(Q.q4_25); R.q1_26_marg = R.opMarg(Q.q1_26); R.q2_26_marg = R.opMarg(Q.q2_26);
R.q2_25_marg = avr(Q.q2_26.opPy / 47516 * 100, 2);
R.kostnVaxtQ2 = avr(42026 / (47516 - 20441) * 100 - 100, 1);    // kostnader +55 %-kontroll: Q2-25-kostn = oms − op = 27 075
R.kostnadArstaktQ2 = avr(Q.q2_26.kostn * 4 / 1000, 1);          // mdr — mot guidansen 165–169
R.rlForlustArstakt = avr(Q.q2_26.rlForlust * 4 / 1000, 2);      // mdr
R.peRengjord = avr(F.mcap / ((Q.q3_25.netto + R.q4_25_netto + Q.q1_26.netto + R.q2_26_netto + 15930 - 8030) / 1000), 2);
R.pegKonv = avr(F.pe / (F.prognos * 100), 3);
R.pegKvot = avr(F.peg / R.pegKonv, 3);
R.capexKvotLo = avr(130 / 72, 3); R.capexKvotHi = avr(145 / 70, 3);
R.omsvaxtKvartal = {
  q3_25: avr((Q.q3_25.oms / Q.q3_25.omsPy - 1) * 100, 1),
  q4_25: avr((Q.q4_25.oms / Q.q4_25.omsPy - 1) * 100, 1),
  q1_26: avr((Q.q1_26.oms / Q.q1_26.omsPy - 1) * 100, 1),
  q2_26: avr((Q.q2_26.oms / 47516 - 1) * 100, 1),
};
R.epsKonsensusMotFjol = avr((6.50 / 1.05 - 1) * 100, 1);
R.serOmsCagr = avr(((F.serOms[3] / F.serOms[0]) ** (1 / 3) - 1) * 100, 2);
R.serResCagr = avr(((F.serRes[3] / F.serRes[0]) ** (1 / 3) - 1) * 100, 2);
R.resFall2025 = avr((F.serRes[3] / F.serRes[2] - 1) * 100, 2);
R.omsvaxt2025 = avr((F.serOms[3] / F.serOms[2] - 1) * 100, 2);
R.franQ2GuidansTillKonsensus = { lo: avr((61000 / 51242 - 1) * 100, 1), hi: avr((64000 / 51242 - 1) * 100, 1), kons: avr((63250 / 51242 - 1) * 100, 1) };
R.kursRorelse = avr((KURS_FRISK.pris / F.pris - 1) * 100, 1);

// — scenarioruta: bas 2025 (fältvärldens EBIT-marginal 34,83 % på omsättning 200 966 MUSD) —
const bas = { oms: F.serOms[3] / 1e6, marg: F.ebit }; // MUSD, andel
R.scenBasEbit = avr(bas.oms * bas.marg / 1000, 2); // mdr
R.scen = {};
for (const [dv, dvn] of [[-0.03, '-3%'], [0, '0'], [0.03, '+3%']]) {
  for (const [dm, dmn] of [[-0.01, '-1pp'], [0, '0'], [0.01, '+1pp']]) {
    R.scen[`${dvn}/${dmn}`] = avr(bas.oms * (1 + dv) * (bas.marg + dm) / 1000, 2); // mdr EBIT
  }
}
R.enhetMarginal = avr(bas.oms * 0.01 / 1000, 3); // mdr per 1 pp marginal
R.enhetVolym = avr(bas.oms * 0.01 / 1000, 3);    // mdr per 1 % volym — samma tal, poängen

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
  medianer[namn] = { median: med(GREN.map(val)), meta: med(GREN.map(val)), n: GREN.filter(b => Number.isFinite(val(b))).length, varde: val(M) };
  const ho = rang('META', path, 'högst'); const la = rang('META', path, 'lägst');
  ranglista[namn] = { hogst: ho ? `${ho.rang}/${ho.av}` : null, lagst: la ? `${la.rang}/${la.av}` : null, top3: ho ? ho.lista.slice(0, 3) : [] };
}
R.universumMedian = {}; // medianer över HELA universumet för källkritik-raderna
for (const [namn, path] of faltTabell) {
  const val = x => path.split('.').reduce((o, k) => (o == null ? undefined : o[k]), x);
  R.universumMedian[namn] = med(U.map(val));
}

// — ABORT-grindar: fasta referenstal som INGÅR i pakettexten —
const grillar = [
  ['aktieAntal', R.aktieAntal, 2.5478, 0.01],
  ['epsTtmFalt', R.epsTtmFalt, 27.205, 0.02],
  ['nettoTtmFalt', R.nettoTtmFalt, 69.32, 0.05],
  ['q4_25_netto', R.q4_25_netto, 22767, 5],
  ['q2_26_netto', R.q2_26_netto, 15745, 60],
  ['omsTtmVaxt', R.omsTtmVaxt, 27.66, 0.05],
  ['q2_26_marg', R.q2_26_marg, 30.88, 0.05],
  ['q3_25_marg', R.q3_25_marg, 40.08, 0.05],
  ['q1_26_marg', R.q1_26_marg, 40.62, 0.05],
  ['q4_25_marg', R.q4_25_marg, 41.32, 0.05],
  ['kostnVaxtQ2', R.kostnVaxtQ2, 55.2, 0.3],
  ['pegKonv', R.pegKonv, 1.786, 0.005],
  ['serOmsCagr', R.serOmsCagr, 19.89, 0.05], // motorräknat 19,895 % — matchar källfältet 0,1989 exakt (första grindsättningen 19,99 var huvudräkningsfel; motorn vann)
  ['serResCagr', R.serResCagr, 37.63, 0.05],
  ['resFall2025', R.resFall2025, -3.05, 0.05],
  ['omsvaxt2025', R.omsvaxt2025, 22.17, 0.05],
  ['scenBasEbit', R.scenBasEbit, 70.0, 0.1],
  ['epsgapRapportMotFalt', R.gapEpsPct, 2.4, 0.3],
];
for (const [namn, räkna, vill, tol] of grillar) if (!Number.isFinite(räkna) || Math.abs(räkna - vill) > tol) fel.push(`${namn}: räknat ${räkna} mot förväntat ${vill} (tol ${tol})`);
if (GREN.length !== 23) fel.push(`grenen ${GREN.length} != 23`);

const ref = {
  genererad: new Date().toISOString(), falt: F, rapport: Q, harledd: R, medianer, ranglista,
  grenBolag: GREN.map(b => b.ticker), kursFrisk: KURS_FRISK,
  kontrollFelfree: fel.length === 0,
};
if (fel.length) { console.error('ABORT — grinda missad:\n' + fel.join('\n')); process.exit(1); }
writeFileSync('/home/ak1a/AK1/verktyg/_s4u2-meta-byggdata-referens.json', JSON.stringify(ref, null, 1));
console.log('GRÖN — motor konsistent. Gren', GREN.length, 'bolag. Scenarieceller:', JSON.stringify(R.scen));
console.log('rang brutto högst:', JSON.stringify(ranglista.brutto), ' pe:', JSON.stringify(ranglista.pe), ' roe:', JSON.stringify(ranglista.roe));
console.log('medianer:', JSON.stringify(Object.fromEntries(Object.entries(medianer).map(([k, v]) => [k, v.median]))));
