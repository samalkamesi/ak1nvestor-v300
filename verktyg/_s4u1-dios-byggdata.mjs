// _s4u1-dios-byggdata.mjs — beräkningsmotor för Diös Q3-2026-läspaketet.
// ALL aritmetik i paketet körs här och fryses i talbanken
// verktyg/_s4u1-dios-tal.json. KVD:n (_s4u1-dios-kvd.mjs) omräknar
// oberoende och jämför. Källor: bolagsunivers.json (2026-09-03) +
// sökverifierade officiella rapporttal (Q1 2026-04-29, Q2 2026-07-06).
import { readFileSync, writeFileSync } from 'node:fs';

const U = JSON.parse(readFileSync('/home/ak1a/AK1/data/portfolj-system/bolagsunivers.json', 'utf8'));
const list = Array.isArray(U) ? U : (U.bolag || U.universum || U);
const d = list.find(b => b.ticker === 'DIOS.ST');
if (!d) throw new Error('DIOS.ST saknas i universumet');
const fast = list.filter(b => b.bransch === 'fastighet');

// — officiella rapporttal (sökverifierade 2026-09-20) —
const off = {
  q1_26: { intakter: 663, intakter_fjol: 661, forvaltning: 220, forvaltning_fjol: 221,
           jamforbara_forvaltning_pct: 1.5, vardeFastighet: 13, vardeFastighet_fjol: 6,
           vardeDerivat: 61, vardeDerivat_fjol: -1, nettouthyrning: 15, epraNta: 100.20, epraNta_fjol: 99.90 },
  q2_26: { hyresintakter: 667, hyresintakter_fjol: 666, driftoverskott: 485,
           eps: 1.70, eps_fjol: 0.05, nettouthyrning: 10, nettouthyrning_fjol: 2 },
  h1_26: { hyresintakter: 1329, hyresintakter_fjol: 1327, hyresintakter_pct: 0.2,
           nettouthyrning: 25, nettouthyrning_fjol: 3 },
  utdelning: { krPerKvartal: 0.60, xdagNasta: '2027-01-08' },
  kalender: { q1: '2026-04-29 kl 07:00', q2: '2026-07-06 kl 13:00', q3: '2026-10-23 kl 13:00',
              bokslut: '2027-02-12 kl 07:00' },
};

// — universumfält (oförändrade genomgångar) —
const f = {
  pris: d.pris, mcapMkr: d.marknadsKapitalMdr * 1000,
  pe: d.vardering.pe, pb: d.vardering.pb, evEbit: d.vardering.evEbit,
  peg: d.vardering.peg, fcfYield: d.vardering.fcfYield,
  roic: d.lonksamhet.roic, roe: d.lonksamhet.roe,
  brutto: d.lonksamhet.bruttoMarginal, ebitMarg: d.lonksamhet.ebitMarginal,
  netto: d.lonksamhet.nettoMarginal,
  skuldEk: d.stabilitet.skuldEgenkapital,
  cagr5oms: d.tillvaxt.omsattningCAGR5ar, cagr5res: d.tillvaxt.resultatCAGR5ar,
  ttm: d.tillvaxt.omsattningTillvaxtTTM, prognos: d.tillvaxt.prognosTillvaxt,
  insider: d.aterkop.insiderkopSenaste6man,
  golvVarde: d.golv.vardePerAktie, golvMarginal: d.golv.marginal,
  serAr: d.serier.ar, serOms: d.serier.omsattning, serRes: d.serier.resultat,
};
// serierna ligger i fulla kronor — arbeta i Mkr
f.serOmsMkr = f.serOms.map(v => v / 1e6);
f.serResMkr = f.serRes.map(v => v / 1e6);

// — härledningar (ren aritmetik, avrundning sist) —
const r = {};
r.aktieAntalM = f.mcapMkr / f.pris;                       // 9 016/64,90
r.ekPerAktie_pb = f.pris / f.pb;                          // bokfört EK/aktie via P/B
r.pbViaGolv = f.pris / f.golvVarde;                       // P/B via golvvärdet
r.rabattGolv = 1 - f.pris / f.golvVarde;                  // substansrabatt mot golv
r.golvMarginalKonvention = 1 - f.pb;                      // konventionen mot golv-fältet
r.epsTtm = f.pris / f.pe;                                 // implicit TTM-vinst/aktie
r.vinstTtmMkr = r.epsTtm * r.aktieAntalM;
r.epsBokslut25 = f.serResMkr[3] / r.aktieAntalM;             // 808 Mkr 2025
r.peBokslut25 = f.pris / r.epsBokslut25;
r.gapVinstMkr = r.vinstTtmMkr - f.serResMkr[3];
r.gapVinstPct = r.gapVinstMkr / f.serResMkr[3];
r.roeHarled = r.epsTtm / r.ekPerAktie_pb;                 // ROE härled ur identiteten
r.identitetPbRoePe = f.pb / r.roeHarled;                  // ska = P/E-fältet
r.identitetGapPct = (f.pb / r.roeHarled - f.pe) / f.pe;
r.pegImplicitTillvaxt = f.pe / f.peg;                     // 8,194/1,37
r.pegKonventionCagr5 = f.pe / f.cagr5oms;                 // 8,194/6,42 % →Multipel
r.avkPe = 1 / f.pe;                                       // vinstavkastning trailing
r.avkPeBokslut = 1 / r.peBokslut25;
r.avkEvEbit = 1 / f.evEbit;
r.ttmIntaktMkr = f.serOmsMkr[3] * (1 + f.ttm);
r.ebitTtmMkr = r.ttmIntaktMkr * f.ebitMarg;
r.evMkr = f.evEbit * r.ebitTtmMkr;
r.nettoskuldImplicitMkr = r.evMkr - f.mcapMkr;
r.ekMkr = f.mcapMkr / f.pb;
r.totalskuldMkr = f.skuldEk * r.ekMkr;                    // totala skulder (Yahoo-begrepp)
r.totalskuldPerAktie = r.totalskuldMkr / r.aktieAntalM;
r.balansrakningTotalMkr = r.ekMkr + r.totalskuldMkr;      // EK + totala skulder
r.kassaImplicitMkr = r.totalskuldMkr - r.nettoskuldImplicitMkr;
r.utdelningAr = off.utdelning.krPerKvartal * 4;
r.dirAvk = r.utdelningAr / f.pris;
r.kursOverEpra = f.pris / off.q1_26.epraNta;
r.rabattEpra = 1 - f.pris / off.q1_26.epraNta;
r.golvTotalMkr = f.golvVarde * r.aktieAntalM;
r.epraTotalMkr = off.q1_26.epraNta * r.aktieAntalM;
r.q2VinstMkr = off.q2_26.eps * r.aktieAntalM;
r.q2VinstFjolMkr = off.q2_26.eps_fjol * r.aktieAntalM;
// årliga svängningar i serien
r.omstillvaxt = [0, 1, 2].map(i => (f.serOmsMkr[i + 1] - f.serOmsMkr[i]) / f.serOmsMkr[i]);
r.ressvingMkr = [0, 1, 2].map(i => f.serResMkr[i + 1] - f.serResMkr[i]);
r.svang2223PctAv22 = r.ressvingMkr[0] / f.serResMkr[0];
r.ebitÖverBruttoPp = (f.ebitMarg - f.brutto) * 100;
// scenarioruta 9/9: bas 2025-intäkter × EBIT-marginal (värderader inkluderade — paketets varning)
r.scenBas = { intakt: f.serOmsMkr[3], marg: f.ebitMarg };
r.scen = [];
for (const di of [0, 0.01, 0.03]) for (const dm of [0, 0.01, 0.02]) {
  r.scen.push({ di, dm, ebitMkr: f.serOmsMkr[3] * (1 + di) * (f.ebitMarg + dm) });
}
r.scenDelta3pct = f.serOmsMkr[3] * 0.03 * f.ebitMarg;       // 3 % intäkt i Mkr
r.scenDelta1pp = f.serOmsMkr[3] * 0.01;                     // +1 pp marginal i Mkr
r.scenHavstang = r.scenDelta3pct / r.scenDelta1pp;       // pp-ekvivalent

// — medianer + rang LIVE i fastighetsgrenen —
const val = (b, p) => b.vardering && b.vardering[p];
const num = (b, s, p) => b[s] && b[s][p] != null ? b[s][p] : null;
function med(a) { const x = a.filter(v => v != null).sort((p, q) => p - q); if (!x.length) return null;
  const m = Math.floor(x.length / 2); return x.length % 2 ? x[m] : (x[m - 1] + x[m]) / 2; }
function rang(v, a, lowBetter) { const x = a.filter(t => t != null).sort((p, q) => lowBetter ? p - q : q - p);
  return { rank: x.findIndex(t => Math.abs(t - v) < 1e-9) + 1, n: x.length }; }
const M = {
  pe: [val(d, 'pe'), fast.map(b => val(b, 'pe')), true, '%'],
  pb: [val(d, 'pb'), fast.map(b => val(b, 'pb')), true],
  evEbit: [val(d, 'evEbit'), fast.map(b => val(b, 'evEbit')), true],
  peg: [val(d, 'peg'), fast.map(b => val(b, 'peg')), true],
  roic: [num(d, 'lonksamhet', 'roic'), fast.map(b => num(b, 'lonksamhet', 'roic')), false],
  ebitMarg: [num(d, 'lonksamhet', 'ebitMarginal'), fast.map(b => num(b, 'lonksamhet', 'ebitMarginal')), false],
  brutto: [num(d, 'lonksamhet', 'bruttoMarginal'), fast.map(b => num(b, 'lonksamhet', 'bruttoMarginal')), false],
  netto: [num(d, 'lonksamhet', 'nettoMarginal'), fast.map(b => num(b, 'lonksamhet', 'nettoMarginal')), false],
  skuldEk: [num(d, 'stabilitet', 'skuldEgenkapital'), fast.map(b => num(b, 'stabilitet', 'skuldEgenkapital')), true],
  cagr5oms: [num(d, 'tillvaxt', 'omsattningCAGR5ar'), fast.map(b => num(b, 'tillvaxt', 'omsattningCAGR5ar')), false],
  ttm: [num(d, 'tillvaxt', 'omsattningTillvaxtTTM'), fast.map(b => num(b, 'tillvaxt', 'omsattningTillvaxtTTM')), false],
  prognos: [num(d, 'tillvaxt', 'prognosTillvaxt'), fast.map(b => num(b, 'tillvaxt', 'prognosTillvaxt')), false],
};
const medianRang = {};
for (const [k, [v, arr, lb]] of Object.entries(M)) {
  medianRang[k] = { dios: v, median: med(arr), ...(v != null ? rang(v, arr, lb) : { rank: null, n: null }) };
}

const talbank = { genererad: new Date().toISOString(), ticker: 'DIOS.ST',
  universumHamtad: d.hamtat, falt: f, harled: r, officiella: off,
  medianRang, fastighetN: fast.length,
  fastighetTickers: fast.map(b => b.ticker) };
writeFileSync('/home/ak1a/AK1/verktyg/_s4u1-dios-tal.json', JSON.stringify(talbank, null, 1));
console.log('talbank skriven — nyckeltal:');
for (const [k, v] of Object.entries(medianRang))
  console.log(` ${k}: Diös=${v.dios} median=${v.median} rang=${v.rank}/${v.n}`);
console.log('identitet P/B÷ROE =', r.identitetPbRoePe.toFixed(4), 'mot P/E-fältet', f.pe,
  '(gap', (r.identitetGapPct * 100).toFixed(2) + '%)');
console.log('golv-dubbelidentitet: P/B-via-golv', r.pbViaGolv.toFixed(4), 'mot fält', f.pb,
  '· 1−P/B', r.golvMarginalKonvention.toFixed(4), 'mot marginalfält', f.golvMarginal);
console.log('boksluts-P/E 2025:', r.peBokslut25.toFixed(3), '· trailing', f.pe,
  '· vinstgap', r.gapVinstMkr.toFixed(1), 'Mkr =', (r.gapVinstPct * 100).toFixed(1) + '%');
console.log('scenarioruta 9 celler:', r.scen.map(c => c.ebitMkr.toFixed(0)).join(' / '));
