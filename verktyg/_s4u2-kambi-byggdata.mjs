// _s4u2-kambi-byggdata.mjs — Kambi Q3-2026-läspaketets beräkningsmotor.
// Alla pakettal härleds här EN gång; bodyn och KVD:n (verktyg/_s4u2-kambi-kvd.mjs)
// läser samma motor. Källor: bolagsunivers.json KAMBI.ST 2026-09-03 (Yahoo
// quoteSummary; MarketStack saknade färsk kurs), Kambis egna rapporter sökverifierade
// 2026-09-20, EUR/SEK 11,15 (Investing.com slutkurs 2026-09-02; ECB september-medel
// 10,9035, topp 11,2915 den 18/9).
import { readFileSync } from 'node:fs';

const U = JSON.parse(readFileSync('/home/ak1a/AK1/data/portfolj-system/bolagsunivers.json', 'utf8'));
const arr = Array.isArray(U) ? U : (U.bolag || U.universum || U.poster || []);
const K = arr.find(b => b.ticker === 'KAMBI.ST');
const tek = arr.filter(b => b.bransch === 'teknik');

const med = v => { const s = v.filter(x => typeof x === 'number' && isFinite(x)).sort((a, b) => a - b); const m = Math.floor(s.length / 2); return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2; };
const rangStig = (v, val) => { const s = v.filter(x => typeof x === 'number' && isFinite(x)).sort((a, b) => a - b); return s.findIndex(x => Math.abs(x - val) < 1e-9) + 1; }; // 1 = lägst
const rangFall = (v, val) => { const s = v.filter(x => typeof x === 'number' && isFinite(x)).sort((a, b) => b - a); return s.findIndex(x => Math.abs(x - val) < 1e-9) + 1; }; // 1 = högst

// — universumfält —
const F = {
  pris: K.pris, mcap: K.marknadsKapitalMdr, mcapM: K.marknadsKapitalMdr * 1000,  // miljoner SEK
  pe: K.vardering.pe, pb: K.vardering.pb, evEbit: K.vardering.evEbit, peg: K.vardering.peg,
  fcfYield: K.vardering.fcfYield,
  roe: K.lonksamhet.roe, roic: K.lonksamhet.roic, brutto: K.lonksamhet.bruttoMarginal,
  ebitM: K.lonksamhet.ebitMarginal, nettoM: K.lonksamhet.nettoMarginal, fcfM: K.lonksamhet.fcfMarginal,
  skuldEk: K.stabilitet.skuldEgenkapital, insider: K.aterkop.insiderkopSenaste6man,
  omsCagr: K.tillvaxt.omsattningCAGR5ar, resCagr: K.tillvaxt.resultatCAGR5ar,
  ttm: K.tillvaxt.omsattningTillvaxtTTM, prog: K.tillvaxt.prognosTillvaxt,
  serAr: K.serier.ar, serOms: K.serier.omsattning, serRes: K.serier.resultat,
  serOmsM: K.serier.omsattning.map(x => x / 1e6), serResM: K.serier.resultat.map(x => x / 1e6),  // miljoner
};

// — medianer och rang (teknikgren n=22, universum n enligt fil) —
const M = {};
for (const [namn, f, dir] of [
  ['pe', b => b.vardering?.pe, 'fall'], ['pb', b => b.vardering?.pb, 'fall'],
  ['evEbit', b => b.vardering?.evEbit, 'fall'], ['peg', b => b.vardering?.peg, 'fall'],
  ['fcfYield', b => b.vardering?.fcfYield, 'fall'], ['roe', b => b.lonksamhet?.roe, 'fall'],
  ['roic', b => b.lonksamhet?.roic, 'fall'], ['brutto', b => b.lonksamhet?.bruttoMarginal, 'fall'],
  ['ebitM', b => b.lonksamhet?.ebitMarginal, 'fall'], ['nettoM', b => b.lonksamhet?.nettoMarginal, 'fall'],
  ['fcfM', b => b.lonksamhet?.fcfMarginal, 'fall'], ['skuldEk', b => b.stabilitet?.skuldEgenkapital, 'stig'],
  ['prog', b => b.tillvaxt?.prognosTillvaxt, 'fall'], ['omsCagr', b => b.tillvaxt?.omsattningCAGR5ar, 'fall'],
  ['resCagr', b => b.tillvaxt?.resultatCAGR5ar, 'fall'], ['ttm', b => b.tillvaxt?.omsattningTillvaxtTTM, 'fall'],
]) {
  const tv = tek.map(f), av = arr.map(f);
  M[namn] = {
    kambi: F[namn],
    tekMed: med(tv), tekN: tv.filter(x => x != null && isFinite(x)).length,
    univMed: med(av), univN: av.filter(x => x != null && isFinite(x)).length,
    rang: F[namn] == null ? null : (dir === 'fall' ? rangFall(tv, F[namn]) : rangStig(tv, F[namn])),
  };
}
const bruttoTopp = arr.map(b => ({ t: b.ticker, v: b.lonksamhet?.bruttoMarginal })).filter(o => typeof o.v === 'number').sort((a, b) => b.v - a.v);
const evTop = arr.map(b => ({ t: b.ticker, v: b.vardering?.evEbit })).filter(o => typeof o.v === 'number').sort((a, b) => b.v - a.v);

// — växelkurs och rapportfakta (sökverifierad 2026-09-20) —
const X = 11.15;                 // EUR/SEK 2026-09-02 (Investing.com)
const R = {
  q1_oms: 43.5, q1_omsPy: 41.5, q1_ebit: 4.2, q1_ebita: 5.7,     // M€, 2026-04-29
  q2_oms: 45.9, q2_omsPy: 40.5, q2_ebit: 5.8, q2_ebita: 7.6, q2_ebitaPy: 3.7, // 2026-07-22
  h1_oms: 89.4, guide: [23, 27], guideOld: [20, 25],             // adj EBITA (acq) M€
  aktierTot: 26911049, egna: 706785,                             // 2026-09-11
  vmMargin: 18, vmOmsSteg: 20,                                   // procent
};

// — egna beräkningar —
const E = {};
E.ttmVinstSEK = F.mcapM / F.pe;                          // 120,72 MSEK
E.ttmVinstEUR = E.ttmVinstSEK / X;                      // 10,83 M€
E.vpa2025_SEK = F.serResM[3] * X / ((R.aktierTot - R.egna) / 1e6); // 2,90
E.peBokslut = F.mcapM / (F.serResM[3] * X);               // 60,36
E.pePrognos = F.pe / (1 + F.prog);                      // 26,69
E.peValutafalla = F.mcapM / F.serResM[3];                 // 672,9 — SEK/EUR-blandning
E.ekPB = F.mcapM / F.pb;                                 // 157,0 MSEK = 14,1 M€
E.ekROE = (F.serResM[3] * X) / F.roe;                    // 1091 MSEK = 97,9 M€
E.ekKvot = E.ekROE / E.ekPB;                            // 6,95
E.pbEgen = F.mcapM / E.ekROE;                            // 4,20
E.identitetFalt = F.pb / F.roe;                         // 419,3
E.identitetKvot = E.identitetFalt / F.pe;               // 11,0
E.identitetKonsekvent = E.pbEgen / F.roe;               // 60,34
E.identGap = Math.abs(E.identitetKonsekvent / E.peBokslut - 1) * 100; // %
E.skurd = E.ekROE * F.skuldEk;                          // 56,7 MSEK
E.ev = F.mcapM + E.skurd;                                // 4639,7
E.ebitFalt = E.ev / F.evEbit;                           // 23,6 MSEK = 2,1 M€
E.ebitMarginalVag = F.ebitM * (F.serOmsM[3] + R.h1_oms - (R.q1_omsPy + R.q2_omsPy)) * X; // TTM-oms-vägen, MSEK
E.evEbitEgen = E.ev / E.ebitMarginalVag;                // ≈ 18
E.ttmOms = F.serOmsM[3] + R.h1_oms - (R.q1_omsPy + R.q2_omsPy); // 169,4 M€
E.nettoVag = F.nettoM * E.ttmOms * X;                   // 127,7 MSEK
E.nettoKvot = E.nettoVag / E.ttmVinstSEK;               // 1,06
E.fcfYieldKonsistens = F.fcfM * (E.ttmOms * X / F.mcapM) * 100; // % (krav 2,51 mot fält 0,22)
E.fcfKvot = (F.fcfM * (E.ttmOms * X / F.mcapM)) / F.fcfYield; // 11,4
E.pegKonv = F.pe / (F.prog * 100);                      // 0,90
E.pegBokslut = E.peBokslut / (F.prog * 100);            // 1,43
E.vpaTTM = F.pris / F.pe;                               // 4,60 SEK
E.aktierMcap = F.mcapM / F.pris;  // miljoner aktier                         // 26,25 M
E.aktierEx = (R.aktierTot - R.egna) / 1e6;              // 26,20 M
E.aktieGap = Math.abs(E.aktierMcap / E.aktierEx - 1) * 100; // 0,18 %
E.egnaAndel = R.egna / R.aktierTot * 100;               // 2,63 %
E.h1SEK = R.h1_oms * X;                                 // 996,8
E.h1Andel = R.h1_oms / F.serOmsM[3] * 100;               // 55,2 % av 2025
E.q1marg = R.q1_ebita / R.q1_oms * 100;                 // 13,1
E.q2marg = R.q2_ebita / R.q2_oms * 100;                 // 16,6 (rapporten 16,5)
E.h1ebita = R.q1_ebita + R.q2_ebita;                    // 13,3
E.h1ebitaPy = R.q1_ebita / 1.64 + R.q2_ebitaPy;         // ≈ 7,2
E.h1steg = (E.h1ebita / E.h1ebitaPy - 1) * 100;         // ≈ +85 %
E.vpaSteg = [0, 1, 2, 3].map(i => i < 3 ? (F.serRes[i + 1] / F.serRes[i] - 1) * 100 : null);
E.omsSteg = [0, 1, 2].map(i => (F.serOms[i + 1] / F.serOms[i] - 1) * 100);
E.res2025vs2022 = (F.serRes[3] / F.serRes[0] - 1) * 100; // −74,2
E.vandning = (E.ttmVinstEUR / F.serResM[3] - 1) * 100;    // +58,9
E.spread = (F.prog - F.resCagr) * 100;                   // 78,6 pp
E.margVikt2025 = F.serOmsM[3] * 0.01;                     // 1,62 M€/pp
E.margViktH1 = (R.h1_oms * 2) * 0.01;                    // 1,79 M€/pp
E.guideBredd = (R.guide[1] - R.guide[0]) / (R.h1_oms * 2) * 100; // 2,24 pp
// scenarioruta VPA × P/E (mittencell = kursen)
E.peKol = [F.pe * 0.8, F.pe, F.pe * 1.2];
E.vpaRad = [E.vpaTTM * 0.9, E.vpaTTM, E.vpaTTM * 1.1];
E.ruta = E.vpaRad.map(v => E.peKol.map(p => +(v * p).toFixed(2)));
// multiplövning
E.peTillMedian = E.vpaTTM * M.pe.tekMed;                 // 114,3
E.peNed = (E.peTillMedian / F.pris - 1) * 100;           // −34,5
E.vpaUpp = (F.pe / M.pe.tekMed - 1) * 100;               // +52,7
E.pbNed = (M.pb.tekMed / F.pb - 1) * 100;                // −78,2
E.evNed = (M.evEbit.tekMed / F.evEbit - 1) * 100;        // −87,6

const ut = { F, M, X, R, E, bruttoTop: bruttoTopp.slice(0, 6).map(o => `${o.t}:${(o.v * 100).toFixed(2)}%`), evTop: evTop.slice(0, 5).map(o => `${o.t}:${o.v.toFixed(1)}`) };
console.log(JSON.stringify(ut, null, 1));
