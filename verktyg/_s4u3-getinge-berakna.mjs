#!/usr/bin/env node
// s4-u3 GETINGE Q3 2026 — beräkningsskript (motorräknade tal för läspaketet)
// Läser bolagsunivers.json, räknar medianer/rang för hälsogrenen + universum,
// samt seriens fasta kontroller: identitet, absolut, EV-kedja, TTM-detektiv,
// FCF-par, PEG-konvention, CAGR-replikering, marginalserie, scenarioruta,
// marginalvikt, multiplövning. Skriver /tmp/s4u3-getinge-berakning.json.
import { readFileSync, writeFileSync } from 'node:fs';

const UNIVERSUM = '/home/ak1a/AK1/data/portfolj-system/bolagsunivers.json';
const T = 'GETI-B.ST';
const u = JSON.parse(readFileSync(UNIVERSUM, 'utf8'));
const list = Array.isArray(u) ? u : (u.bolag || u.poster || Object.values(u).find(Array.isArray));
const b = list.find(x => x.ticker === T);
if (!b) throw new Error('GETI-post saknas');

const gren = list.filter(x => x.bransch === b.bransch); // halso
const median = (arr) => {
  const v = arr.filter(x => x !== null && x !== undefined && Number.isFinite(x)).sort((a, c) => a - c);
  if (!v.length) return { med: null, n: 0 };
  const m = v.length % 2 ? v[(v.length - 1) / 2] : (v[v.length / 2 - 1] + v[v.length / 2]) / 2;
  return { med: m, n: v.length };
};
// Rang i grenen: fallande (1 = högst) för alla utom skuld/EK (stigande, 1 = lägst)
const rang = (gett, desc = true) => {
  const v = gren.map(x => gett(x)).filter(x => x !== null && x !== undefined && Number.isFinite(x)).sort((a, c) => desc ? c - a : a - c);
  const i = v.indexOf(gett(b));
  return i < 0 ? null : [i + 1, v.length];
};

const f = {
  pe: b.vardering.pe, pb: b.vardering.pb, evEbit: b.vardering.evEbit, peg: b.vardering.peg,
  fcfYield: b.vardering.fcfYield,
  roe: b.lonksamhet.roe, roic: b.lonksamhet.roic, brutto: b.lonksamhet.bruttoMarginal,
  ebit: b.lonksamhet.ebitMarginal, netto: b.lonksamhet.nettoMarginal, fcfMarg: b.lonksamhet.fcfMarginal,
  skuldEK: b.stabilitet.skuldEgenkapital,
  omsCAGR: b.tillvaxt.omsattningCAGR5ar, resCAGR: b.tillvaxt.resultatCAGR5ar,
  ttm: b.tillvaxt.omsattningTillvaxtTTM, prognos: b.tillvaxt.prognosTillvaxt,
};
const g = x => ({
  pe: x.vardering.pe, pb: x.vardering.pb, evEbit: x.vardering.evEbit, peg: x.vardering.peg,
  fcfYield: x.vardering.fcfYield,
  roe: x.lonksamhet.roe, roic: x.lonksamhet.roic, brutto: x.lonksamhet.bruttoMarginal,
  ebit: x.lonksamhet.ebitMarginal, netto: x.lonksamhet.nettoMarginal, fcfMarg: x.lonksamhet.fcfMarginal,
  skuldEK: x.stabilitet.skuldEgenkapital,
  omsCAGR: x.tillvaxt.omsattningCAGR5ar, resCAGR: x.tillvaxt.resultatCAGR5ar,
  ttm: x.tillvaxt.omsattningTillvaxtTTM, prognos: x.tillvaxt.prognosTillvaxt,
});
const pick = k => gren.map(x => g(x)[k]);
const upick = k => list.map(x => g(x)?.[k]);

const oms = b.serier.omsattning.map(v => v / 1e6); // Mkr (källserien i SEK)
const res = b.serier.resultat.map(v => v / 1e6);   // Mkr
const ar = b.serier.ar;
const mcap = b.marknadsKapitalMdr * 1000; // Mkr
const oms25 = oms[oms.length - 1], res25 = res[res.length - 1];

// — Seriens fasta kontroller —
const identitet = f.pb / f.roe;                       // P/B ÷ ROE
const identDiff = (f.pe - identitet) / f.pe;
const implicitRes = mcap / f.pe;                       // Mkr
const absolut = f.pe * res25;                          // Mkr
const absolutResidual = (absolut - mcap) / mcap;
const ebit25 = f.ebit * oms25;
const ek = mcap / f.pb;
const skuld = ek * f.skuldEK;
const ev = mcap + skuld;
const evKedja = ev / ebit25;
const evKedjaDiff = (evKedja - f.evEbit) / f.evEbit;
const implicitEv = f.evEbit * ebit25;
const kassaImplicit = ev - implicitEv;                 // kedjans EV minus fältets implicita EV
const roeBokford = res25 / ek;
const roeImplicit = implicitRes / ek;
const fcf25 = f.fcfMarg * oms25;
const fcfYieldBeraknad = fcf25 / mcap;
const fcfDiff = (fcfYieldBeraknad - f.fcfYield) / f.fcfYield;
const pegKonvention = f.pe / (f.prognos * 100);
const pegKvot = f.peg / pegKonvention;
const pegImplicitNamnare = f.pe / f.peg;
const cagrOmsBer = Math.pow(oms25 / oms[0], 1 / (oms.length - 1)) - 1;
const cagrResBer = Math.pow(res25 / res[0], 1 / (res.length - 1)) - 1;
const nettoMarg = res.map((r, i) => r / oms[i]);
const stegOms = oms.slice(1).map((v, i) => v / oms[i] - 1);
const stegRes = res.slice(1).map((v, i) => v / res[i] - 1);
// Scenarioruta netto: oms ±3 %, marginal ±2 pp kring 2025-basen
const basMarg = nettoMarg[nettoMarg.length - 1];
const cell = (dv, dm) => oms25 * (1 + dv) * (basMarg + dm);
const rutor = [-0.03, 0, 0.03].flatMap(dv => [-0.02, 0, 0.02].map(dm => cell(dv, dm)));
const enPpMarginal = 0.01 * oms25;                     // Mkr per procentenhet marginal
const treProcVolymNetto = 0.03 * oms25 * basMarg;      // Mkr
const marginalviktNetto = enPpMarginal / treProcVolymNetto;
const marginalviktEbit = 1 / (3 * f.ebit);
const medianPeGren = median(pick('pe')).med;
const resVidMedianPe = mcap / medianPeGren;            // TTM-resultat som möter median-P/E
const peFCF = 1 / f.fcfYield;
const dupontKlipp1 = f.brutto - f.ebit;                // brutto→EBIT, percentage points
const dupontKlipp2 = f.ebit - f.netto;                 // EBIT→netto

const ut = {
  genererad: new Date().toISOString(),
  universumPoster: list.length, grenNamn: b.bransch, grenN: gren.length,
  b: { ticker: b.ticker, namn: b.namn, pris: b.pris, mcapMdr: b.marknadsKapitalMdr, valuta: b.valuta, hamtat: b.hamtat, insider: b.aterkop?.insiderkopSenaste6man },
  f, ar, oms, res, // Mkr
  medianer: Object.fromEntries(Object.keys(f).map(k => [k, { gren: median(pick(k)), univ: median(upick(k)), rang: rang(x => g(x)[k], k !== 'skuldEK') }])),
  kontroller: {
    identitet, identDiff, implicitRes, absolut, absolutResidual,
    ebit25, ek, skuld, ev, evKedja, evKedjaDiff, implicitEv, kassaImplicit,
    roeBokford, roeImplicit, fcf25, fcfYieldBeraknad, fcfDiff,
    pegKonvention, pegKvot, pegImplicitNamnare, cagrOmsBer, cagrResBer,
    nettoMarg, stegOms, stegRes, basMarg, rutor, enPpMarginal, treProcVolymNetto,
    marginalviktNetto, marginalviktEbit, medianPeGren, resVidMedianPe, peFCF, dupontKlipp1, dupontKlipp2,
  },
};
writeFileSync('/tmp/s4u3-getinge-berakning.json', JSON.stringify(ut, null, 1));
console.log('=== GETINGE BERÄKNING GRÖN — skrev /tmp/s4u3-getinge-berakning.json');
console.log('medianer (gren n=' + gren.length + '):', Object.entries(ut.medianer).map(([k, v]) => `${k}=${v.gren.med?.toFixed(4) ?? 'NULL'} (n=${v.gren.n}, rang ${v.rang ? v.rang.join('/') : '—'})`).join(' · '));
console.log('identitet:', identitet.toFixed(3), 'diff', (identDiff * 100).toFixed(2) + '%', '| EV-kedja:', evKedja.toFixed(3), 'diff', (evKedjaDiff * 100).toFixed(2) + '%', '| FCF:', fcfYieldBeraknad.toFixed(4), 'diff', (fcfDiff * 100).toFixed(2) + '%');
console.log('PEG fält', f.peg, 'konv', pegKonvention.toFixed(2), 'kvot', pegKvot.toFixed(3), 'implicit nämnare', pegImplicitNamnare.toFixed(1) + '%');
console.log('nettoMarg:', nettoMarg.map(m => (m * 100).toFixed(2) + '%').join(' → '), '| marginalvikt netto', marginalviktNetto.toFixed(2), 'ebit', marginalviktEbit.toFixed(2));
console.log('rutor:', rutor.map(r => r.toFixed(1)).join(' / '));
