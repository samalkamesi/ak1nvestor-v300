#!/usr/bin/env node
// s4-u1 Catena — beräkningsmotor (källa till varenda tal i läspaketet)
// Läser: data/portfolj-system/bolagsunivers.json (universumpost CATE.ST)
//        data/cache/netnet-CATE_ST.json (andra mätpunkten)
// Räknar: medianer, rang, identiteter, kvartalskedja, scenarioruta.
// Skriver: JSON till stdout. KVD:t omräknar oberoende och jämför.
import { readFileSync } from 'node:fs';

const U = JSON.parse(readFileSync('data/portfolj-system/bolagsunivers.json', 'utf8'));
const list = Array.isArray(U) ? U : (U.bolag || U.poster || U.universum || Object.values(U).find(Array.isArray));
const C = list.find(p => p.ticker === 'CATE.ST');
if (!C) throw new Error('CATE.ST saknas i universumet');
const NN = JSON.parse(readFileSync('data/cache/netnet-CATE_ST.json', 'utf8'));

const r1 = (x) => Math.round(x * 10) / 10;
const r2 = (x) => Math.round(x * 100) / 100;
const r4 = (x) => Math.round(x * 10000) / 10000;
const pct = (x, d = 1) => (x * 100).toFixed(d);

// ---------- Universummedianer (dagens fil, n redovisas) ----------
const fast = list.filter(p => p.bransch === 'fastighet');
const med = (arr) => { const v = arr.filter(x => x !== null && x !== undefined).sort((a, b) => a - b); if (!v.length) return null; const m = Math.floor(v.length / 2); return v.length % 2 ? v[m] : (v[m - 1] + v[m]) / 2; };
const g = (p, path) => path.split('.').reduce((o, k) => (o == null ? undefined : o[k]), p) ?? null;

const falt = {
  pe:    { get: p => g(p, 'vardering.pe'),    c: C.vardering.pe },
  pb:    { get: p => g(p, 'vardering.pb'),    c: C.vardering.pb },
  roe:   { get: p => g(p, 'lonksamhet.roe'),   c: C.lonksamhet.roe },
  ebit:  { get: p => g(p, 'lonksamhet.ebitMarginal'), c: C.lonksamhet.ebitMarginal },
  netto: { get: p => g(p, 'lonksamhet.nettoMarginal'), c: C.lonksamhet.nettoMarginal },
  skuld: { get: p => g(p, 'stabilitet.skuldEgenkapital'), c: C.stabilitet.skuldEgenkapital },
  fcfy:  { get: p => g(p, 'vardering.fcfYield'), c: C.vardering.fcfYield },
  peg:   { get: p => g(p, 'vardering.peg'),   c: C.vardering.peg },
};
const medianer = {}, rang = {}, n = {};
for (const [k, f] of Object.entries(falt)) {
  const fv = fast.map(f.get), av = list.map(f.get);
  medianer[k] = { fastighet: med(fv), universum: med(av) };
  n[k] = { fastighet: fv.filter(x => x !== null).length, universum: av.filter(x => x !== null).length };
  // rang i grenen: sortera fallande, Catenas position (1 = högst)
  const sortDesc = [...fv.filter(x => x !== null)].sort((a, b) => b - a);
  rang[k] = { hosDesc: sortDesc.indexOf(f.c) + 1, av: sortDesc.length };
}

// ---------- Identitetstest och implicitvärden ----------
const peF = C.vardering.pe, pbF = C.vardering.pb, roeF = C.lonksamhet.roe;
const id = {
  peUrrPbDivRoe: pbF / roeF,                    // P/E = P/B ÷ ROE
  peAvvikProc: peF / (pbF / roeF) - 1,
  pbUrrPeGgrRoe: peF * roeF,                    // omvänd väg
  implicitEPS: C.pris / peF,                    // kr/aktie (universumfönstret)
  implicitEKperAktie: C.pris / pbF,
  nettoTTMviaPE: C.marknadsKapitalMdr * 1000 / peF,   // Mkr; P/E × netto = mcap
  ttmOmsattning: (C.marknadsKapitalMdr * 1000 / peF) / C.lonksamhet.nettoMarginal,
  ttmOmsForetiden: ((C.marknadsKapitalMdr * 1000 / peF) / C.lonksamhet.nettoMarginal) / (1 + C.tillvaxt.omsattningTillvaxtTTM),
  pePaBokslut2025: C.marknadsKapitalMdr * 1e9 / C.serier.resultat[3],
};
// PEG
const pegKonv = peF / (C.tillvaxt.prognosTillvaxt * 100);
const pegKvot = C.vardering.peg / pegKonv;

// ---------- Golv (NAV-proxy) ----------
const golv = { falt: C.golv.vardePerAktie, marginalFalt: C.golv.marginal, kurs: C.pris,
  kursPerGolv: C.pris / C.golv.vardePerAktie, rabatt: 1 - C.pris / C.golv.vardePerAktie,
  implicitEKviaPB: C.pris / pbF };

// ---------- Netnet — andra mätpunkten ----------
const nn = NN.data;
const nnDelta = {
  kurs: nn.kurs / C.pris - 1,
  pb: nn.pb / pbF - 1,
  pe: nn.pe / peF - 1,
  implicitEK: (nn.kurs / nn.pb) / (C.pris / pbF) - 1,
  implicitEPS: (nn.kurs / nn.pe) / (C.pris / peF) - 1,
};
const treVagarEK = { viaUniversumPB: C.pris / pbF, viaGolvfalt: C.golv.vardePerAktie, viaNetnetPB: nn.kurs / nn.pb,
  spannKronor: Math.max(C.pris / pbF, C.golv.vardePerAktie, nn.kurs / nn.pb) - Math.min(C.pris / pbF, C.golv.vardePerAktie, nn.kurs / nn.pb) };
treVagarEK.spannProc = treVagarEK.spannKronor / treVagarEK.viaGolvfalt;

// ---------- Serier och CAGR ----------
const S = C.serier;
const cagr = (a, b, steg) => Math.pow(b / a, 1 / steg) - 1;
const serier = {
  ar: S.ar, oms: S.omsattning.map(x => x / 1e6), res: S.resultat.map(x => x / 1e6),
  omsCAGR: cagr(S.omsattning[0], S.omsattning[3], 3),
  resCAGR: cagr(S.resultat[0], S.resultat[3], 3),
  omsSteg: [1, 2, 3].map(i => S.omsattning[i] / S.omsattning[i - 1] - 1),
  resPerOms: S.resultat.map((x, i) => x / S.omsattning[i]),
};

// ---------- Kvartalskedja (officiella rapporter, sökverifierade 2026-09-20) ----------
// Q1-25 644 (Inderes) | jan–jun-25 1 288 (Investing) | jan–sep-25 1 963 (Cision/finansavisen) | helår-25 2 651 (universum)
// Q1-26 701, jan–jun-26 1 510 (catena.se/Cision) | förvaltning: Q1-26 424, Q1-25 398, Q3-25 401, jan–jun-26 916 (+14 % ⇒ jan–jun-25 803,5)
const kv = {
  hyra: { q1_25: 644, q2_25: 1288 - 644, q3_25: 1963 - 1288, q4_25: 2651 - 1963, q1_26: 701, q2_26: 1510 - 701 },
  forv: { q1_25: 398, q2_25: Math.round((916 / 1.14) - 398), q3_25: 401, q1_26: 424, q2_26: 916 - 424, janJun26: 916, janJun25: 916 / 1.14 },
  vinst: { q1_26: 464 },
  epraEPS: { q1_26: 6.26, q1_26_forv: 6.53 },
};
kv.rullande4 = kv.hyra.q3_25 + kv.hyra.q4_25 + kv.hyra.q1_26 + kv.hyra.q2_26;
kv.hyraSteg = { q1: kv.hyra.q1_26 / kv.hyra.q1_25 - 1, q2: kv.hyra.q2_26 / kv.hyra.q2_25 - 1 };
kv.ttmFaltGap = id.ttmOmsattning - kv.rullande4; // totala intäkter (Yahoo) minus hyresintäkter (rapporter)

// ---------- Scenarioruta på 2025 års bas ----------
const bas = { oms: S.omsattning[3] / 1e6, ebitM: C.lonksamhet.ebitMarginal };
const rutor = [];
for (const dOms of [-0.03, 0, 0.03]) for (const dM of [-0.01, 0, 0.01]) {
  rutor.push({ oms: bas.oms * (1 + dOms), marg: bas.ebitM + dM, ebit: bas.oms * (1 + dOms) * (bas.ebitM + dM) });
}
const scen = {
  basEBIT: bas.oms * bas.ebitM,
  pp1: bas.oms * 0.01,
  proc3intakter: bas.oms * 0.03 * bas.ebitM,
  marginalvikt: 1 / (3 * bas.ebitM),
  kvot: (bas.oms * 0.03 * bas.ebitM) / (bas.oms * 0.01),
  rutor: rutor.map(r => ({ ...r, oms: r1(r.oms), ebit: r1(r.ebit), marg: r4(r.marg) })),
};

// ---------- 2022-kvoten: resultat per omsättningskrona i universumet ----------
const poster = [];
for (const p of list) {
  const s = p.serier; if (!s || !s.resultat || !s.omsattning) continue;
  let maxKvot = null;
  for (let i = 0; i < s.resultat.length; i++) {
    if (s.omsattning[i] > 0) { const k = s.resultat[i] / s.omsattning[i]; if (k > 0 && (maxKvot === null || k > maxKvot)) maxKvot = k; }
  }
  if (maxKvot !== null) poster.push({ ticker: p.ticker, maxKvot });
}
poster.sort((a, b) => b.maxKvot - a.maxKvot);
const kvot2022 = { catena: 1996 / 1544, rang: poster.findIndex(p => p.ticker === 'CATE.ST') + 1, av: poster.length,
  topp: poster.slice(0, 6).map(p => `${p.ticker} ${p.maxKvot.toFixed(3)}`) };

// ---------- PEG-rang i universumet ----------
const pegLista = list.map(p => p?.vardering?.peg).filter(x => x !== null && x !== undefined).sort((a, b) => b - a);
const pegRang = { catena: C.vardering.peg, rangDesc: pegLista.indexOf(C.vardering.peg) + 1, av: pegLista.length, hogst: pegLista[0], median: med(pegLista) };

const ut = {
  universum: { antalPoster: list.length, fastighetPoster: fast.length, hamtat: C.hamtat },
  falt: { pris: C.pris, mcap: C.marknadsKapitalMdr,
    pe: peF, pb: pbF, evEbit: C.vardering.evEbit, peg: C.vardering.peg, fcfYield: C.vardering.fcfYield,
    roe: roeF, roic: C.lonksamhet.roic, brutto: C.lonksamhet.bruttoMarginal, ebit: C.lonksamhet.ebitMarginal, netto: C.lonksamhet.nettoMarginal, fcfMarg: C.lonksamhet.fcfMarginal,
    skuldEK: C.stabilitet.skuldEgenkapital, ttm: C.tillvaxt.omsattningTillvaxtTTM, prognos: C.tillvaxt.prognosTillvaxt,
    omsCAGRfalt: C.tillvaxt.omsattningCAGR5ar, resCAGRfalt: C.tillvaxt.resultatCAGR5ar, insider: C.aterkop.insiderkopSenaste6man },
  medianer, rang, n,
  id, pegKonv, pegKvot, golv, nn, nnDelta, treVagarEK, serier, kv, scen, kvot2022, pegRang,
};
console.log(JSON.stringify(ut, null, 1));
