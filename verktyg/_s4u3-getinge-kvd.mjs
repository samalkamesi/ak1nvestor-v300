#!/usr/bin/env node
// s4-u3 GETINGE Q3 2026 — KVD: kvalitetsverifiering av läspaketet FÖRE commit.
// Oberoende omräkning: läser bolagsunivers.json direkt (ej /tmp-beräkningen) och
// testar paketets tal, medianer, rang, aritmetik, struktur, juridik och länkar.
import { readFileSync } from 'node:fs';

const PAKET = '/home/ak1a/AK1/data/blogg-utkast/kvartal/2026-q3/sa-laser-du-getinge-q3-2026.json';
const KAL = '/home/ak1a/AK1/data/blogg-utkast/kvartal/2026-q3/kalender-halso.json';
const p = JSON.parse(readFileSync(PAKET, 'utf8'));
const u = JSON.parse(readFileSync('/home/ak1a/AK1/data/portfolj-system/bolagsunivers.json', 'utf8'));
const list = Array.isArray(u) ? u : (u.bolag || u.poster || Object.values(u).find(Array.isArray));
const b = list.find(x => x.ticker === 'GETI-B.ST');

let PASS = 0, FEL = 0, VARN = 0;
const ok = (villkor, namn, detalj = '') => {
  if (villkor) { PASS++; }
  else { FEL++; console.log('FEL:', namn, detalj); }
};
const warn = (villkor, namn, detalj = '') => {
  if (!villkor) { VARN++; console.log('VARNING:', namn, detalj); }
};
const body = p.body;

// ---------- 1. STRUKTUR ----------
ok(['slug','title','description','pillar','author','publishedAt','readingMinutes','tags','body'].every(k => k in p), '9 fält');
ok(p.slug === 'sa-laser-du-getinge-q3-2026', 'slug');
const ord = body.replace(/\|/g, ' ').replace(/[#*[\]()\/`—-]/g, ' ').split(/\s+/).filter(w => w.length > 0 && /[a-zA-ZåäöÅÄÖ0-9]/.test(w)).length;
ok(ord >= 1068 && ord <= 3400, 'ord i spannet', String(ord));
ok(p.readingMinutes === Math.round(ord / 600), 'readingMinutes = round(ord/600)', `${p.readingMinutes} mot ${Math.round(ord / 600)}`);
ok(p.title.length <= 300, 'titlelängd', String(p.title.length));
ok(p.description.length <= 380, 'desclängd', String(p.description.length));
ok(p.publishedAt === '2026-10-20', 'publishedAt = rappdagen (primär läsning)', p.publishedAt);
ok(!/\u00A0/.test(body) && !/\u00A0/.test(p.title) && !/\u00A0/.test(p.description), '0 osynliga mellanslag (U+00A0)');
ok(!/[\u2010\u2011]/.test(body), '0 mjuka bindestreck');
ok(body.trimEnd().endsWith('är kundens beslut.*'), 'disclaimer sista raden');
// Tabeller: blockvis välformade
const rader = body.split('\n');
let block = [], kolumnfel = 0;
for (const r of rader) {
  if (r.trim().startsWith('|')) block.push(r);
  else { if (block.length) { const n = block[0].split('|').length; if (!block.every(x => x.split('|').length === n)) kolumnfel++; } block = []; }
}
if (block.length) { const n = block[0].split('|').length; if (!block.every(x => x.split('|').length === n)) kolumnfel++; }
ok(kolumnfel === 0, 'tabeller blockvis välformade', kolumnfel + ' felaktiga block');
ok(/## Urvalet/.test(body) && /## Nyckeltalen/.test(body) && /## Källkritik/.test(body) && /## Tre sätt/.test(body) && /## Praktiskt/.test(body) && /## Källor/.test(body), 'sex huvudsektioner');

// ---------- 2. JURIDIK ----------
const lagrum = body.match(/lagen \(2007:528\)/g) || [];
ok(lagrum.length === 1, 'exakt ett lagrum 2007:528', String(lagrum.length));
ok(/2 kap 5 §/.test(body), 'utbildningsparagrafen med');
const frammande = /(2005:59|2022:260|2022:261|1985:716|2022:482|1985:716|5 kap|4 kap|3 kap|1 kap)/.test(body);
ok(!frammande, '0 främmande lagrum');
// Råverb: varje träff måste stå i negations- eller nyckeltalskontext (fönster 120 tkn för negationer)
const radVerb = [...body.matchAll(/[^\n]{0,120}(köp|sälj|rekommender|rådgivn|hållnings?|bör du)/gi)].map(m => m[0]);
const tillatna = /(försälj|utbildning enligt|inte investeringsrådgivning|inga köp|sälj- eller hållnings|insiderköp|återköp|orderintag|köps|säljs)/i;
const elakaTrad = radVerb.filter(t => !tillatna.test(t));
ok(elakaTrad.length === 0, 'råverb endast i negations-/faktakontext', JSON.stringify(elakaTrad));

// ---------- 3. KÄLLTALSPARITET mot GETI-posten ----------
const f = {
  pe: b.vardering.pe, pb: b.vardering.pb, evEbit: b.vardering.evEbit, peg: b.vardering.peg,
  fcfYield: b.vardering.fcfYield, roe: b.lonksamhet.roe, roic: b.lonksamhet.roic,
  brutto: b.lonksamhet.bruttoMarginal, ebit: b.lonksamhet.ebitMarginal, netto: b.lonksamhet.nettoMarginal,
  fcfMarg: b.lonksamhet.fcfMarginal, skuldEK: b.stabilitet.skuldEgenkapital,
  omsCAGR: b.tillvaxt.omsattningCAGR5ar, resCAGR: b.tillvaxt.resultatCAGR5ar,
  ttm: b.tillvaxt.omsattningTillvaxtTTM, prognos: b.tillvaxt.prognosTillvaxt,
};
const sv = n => n.toLocaleString('sv-SE', { minimumFractionDigits: 0, maximumFractionDigits: 3 });
const norm = s => s.replace(/\u00A0/g, ' ').replace(/-/g, '−');
const paritet = [
  [String(f.pe.toFixed(3)).replace('.', ','), 'P/E 24,818'],
  [String(f.pb.toFixed(3)).replace('.', ','), 'P/B 2,163'],
  [String(f.evEbit.toFixed(2)).replace('.', ','), 'EV/EBIT 13,74'],
  [String(f.peg.toFixed(2)).replace('.', ','), 'PEG 1,54'],
  [(f.fcfYield * 100).toFixed(2).replace('.', ','), 'FCF-avkastning 4,25'],
  [(f.roe * 100).toFixed(2).replace('.', ','), 'ROE 8,95'],
  [(f.roic * 100).toFixed(2).replace('.', ','), 'ROIC 13,81'],
  [(f.brutto * 100).toFixed(1).replace('.', ','), 'brutto 48,6'],
  [(f.ebit * 100).toFixed(2).replace('.', ','), 'EBIT 16,12'],
  [(f.netto * 100).toFixed(2).replace('.', ','), 'netto 7,82'],
  [(f.fcfMarg * 100).toFixed(2).replace('.', ','), 'FCF-marginal 8,31'],
  [String(f.skuldEK.toFixed(3)).replace('.', ','), 'skuld/EK 0,358'],
  [(f.prognos * 100).toFixed(2).replace('.', ','), 'prognos 8,77'],
  [(f.resCAGR * 100).toFixed(2).replace('.', ','), 'resCAGR −3,22'],
  [(f.omsCAGR * 100).toFixed(2).replace('.', ','), 'omsCAGR 7,32'],
  [(f.ttm * 100).toFixed(1).replace('.', ','), 'TTM 1,7'],
  ['245,70', 'kurs'],
  ['66,9', 'mcap mdr'],
];
for (const [str, namn] of paritet) ok(norm(body).includes(norm(str)), 'källtalsparitet: ' + namn, 'saknar ' + str);
// serier (Mkr, hela kronor → tusentalsgrupp sv-SE)
for (const v of [...b.serier.omsattning, ...b.serier.resultat]) {
  const mkr = Math.round(v / 1e6);
  ok(norm(body).includes(norm(mkr.toLocaleString('sv-SE'))), 'källtalsparitet serie ' + mkr);
}
// kalenderfakta
const kal = JSON.parse(readFileSync(KAL, 'utf8')).bolag.find(x => x.ticker === 'GETI-B.ST');
ok(kal.rapportfenster.includes('2026-10-20') && kal.rapportfenster.includes('2026-10-21'), 'kalendern bär båda datumen');
ok(/20 oktober/.test(body) && /21 oktober|21:a/.test(body), 'body bär båda datumläsningarna');
// Q2-tal med divergens
ok(/2,7 procent \(5,1\)/.test(body) && /5,0 procent \(3,6\)/.test(body), 'Q2 pressrelease-tal med förraårets värde');
ok(/4,6/.test(body) && /6,2 procent/.test(body), 'källdivergensen redovisad');

// ---------- 4. ARITMETIK: oberoende omräkning ----------
const oms = b.serier.omsattning.map(v => v / 1e6), res = b.serier.resultat.map(v => v / 1e6);
const mcap = b.marknadsKapitalMdr * 1000;
const oms25 = oms[3], res25 = res[3];
const approx = (a, b2, tol, namn, enhet = '') => ok(Math.abs(a - b2) <= tol, namn, `${a.toFixed(4)} mot ${b2.toFixed(4)}${enhet}`);
approx(f.pb / f.roe, 24.17, 0.01, 'identitet P/B÷ROE = 24,17');
approx((f.pe - f.pb / f.roe) / f.pe, 0.0262, 0.0005, 'identitetsdiff 2,6 %');
approx(f.pe * res25, 56039, 1, 'absolut P/E×res = 56 039 Mkr');
approx((f.pe * res25 - mcap) / mcap, -0.163, 0.001, 'absolutresidual −16,3 %');
approx(mcap / f.pe, 2696, 1, 'implicit resultat 2 696 Mkr');
const ebit25 = f.ebit * oms25, ek = mcap / f.pb, skuld = ek * f.skuldEK, ev = mcap + skuld;
approx(ebit25, 5637, 1, 'EBIT 2025 = 5 637 Mkr');
approx(ek, 30939, 1, 'EK = 30 939 Mkr');
approx(skuld, 11079, 1, 'skuld = 11 079 Mkr');
approx(ev, 78000, 1, 'EV = 78 000 Mkr');
approx(ev / ebit25, 13.84, 0.01, 'EV-kedja 13,84');
approx((ev / ebit25 - f.evEbit) / f.evEbit, 0.0071, 0.0005, 'EV-kedjediff 0,71 %');
approx(f.evEbit * ebit25, 77452, 1, 'implicit EV 77 452 Mkr');
approx(ev - f.evEbit * ebit25, 548, 1, 'nettokassa-utläsning 548 Mkr');
approx(res25 / ek, 0.0730, 0.0005, 'TTM-detektiv bokförd 7,30 %');
approx((mcap / f.pe) / ek, 0.0872, 0.0005, 'TTM-detektiv implicit 8,72 %');
approx(f.fcfMarg * oms25, 2906, 1, 'FCF 2025 = 2 906 Mkr');
approx((f.fcfMarg * oms25) / mcap, 0.0434, 0.0005, 'FCF-yield beräknad 4,34 %');
approx(f.pe / (f.prognos * 100), 2.83, 0.01, 'PEG-konvention 2,83');
approx(f.pe / f.peg, 16.1, 0.1, 'PEG implicit nämnare 16,1');
approx(Math.pow(oms25 / oms[0], 1 / 3) - 1, f.omsCAGR, 0.0005, 'omsCAGR replikerad');
approx(Math.pow(res25 / res[0], 1 / 3) - 1, f.resCAGR, 0.0005, 'resCAGR replikerad');
const nm = res.map((r, i) => r / oms[i]);
approx(nm[0], 0.0880, 0.0005, 'nettomarginal 2022 8,80 %');
approx(nm[1], 0.0758, 0.0005, 'nettomarginal 2023 7,58 %');
approx(nm[2], 0.0471, 0.0005, 'nettomarginal 2024 4,71 %');
approx(nm[3], 0.0646, 0.0005, 'nettomarginal 2025 6,46 %');
approx(oms[1] / oms[0] - 1, 0.1249, 0.0005, 'omssteg 2023 +12,49 %');
approx(oms[2] / oms[1] - 1, 0.0921, 0.0005, 'omssteg 2024 +9,21 %');
approx(oms[3] / oms[2] - 1, 0.0060, 0.0005, 'omssteg 2025 +0,60 %');
approx(res[1] / res[0] - 1, -0.0317, 0.0005, 'ressteg 2023 −3,17 %');
approx(res[2] / res[1] - 1, -0.3209, 0.0005, 'ressteg 2024 −32,09 %');
approx(res[3] / res[2] - 1, 0.3785, 0.0005, 'ressteg 2025 +37,85 %');
approx(oms25 / oms[0] - 1, 0.236, 0.001, 'total intäktstillväxt +23,6 %');
// scenarioruta
const basM = nm[3];
const cell = (dv, dm) => Math.round(oms25 * (1 + dv) * (basM + dm));
const rutor = [-0.03, 0, 0.03].flatMap(dv => [-0.02, 0, 0.02].map(dm => cell(dv, dm)));
for (const r of rutor) ok(norm(body).includes(norm(r.toLocaleString('sv-SE'))), 'scenariecell ' + r);
approx(0.01 * oms25, 349.7, 0.1, '1 pp marginal = 349,7 Mkr');
approx(0.03 * oms25 * basM, 67.7, 0.1, '3 % volym = 67,7 Mkr');
approx((0.01 * oms25) / (0.03 * oms25 * basM), 5.16, 0.01, 'marginalvikt netto 5,16');
approx(1 / (3 * f.ebit), 2.07, 0.01, 'marginalvikt EBIT 2,07');
// median-P/E övning
const gren = list.filter(x => x.bransch === 'halso');
const peV = gren.map(x => x.vardering?.pe).filter(x => x !== null && x !== undefined).sort((a, c) => a - c);
const medPE = peV.length % 2 ? peV[(peV.length - 1) / 2] : (peV[peV.length / 2 - 1] + peV[peV.length / 2]) / 2;
approx(medPE, 26.08, 0.01, 'grenens P/E-median 26,08');
approx(mcap / medPE, 2566, 1, 'multiplövning 2 566 Mkr');
approx(mcap / medPE / res25 - 1, 0.137, 0.001, 'medianavstånd +13,7 %');
approx(1 / f.fcfYield, 23.5, 0.05, 'P/FCF 23,5');
approx(f.brutto - f.ebit, 0.3248, 0.0005, 'DuPont-klipp brutto→EBIT 32,5 pp');
approx(f.ebit - f.netto, 0.0830, 0.0005, 'DuPont-klipp EBIT→netto 8,3 pp');
ok(body.includes('−16,3') || body.includes('-16,3'), 'residualtext −16,3');
ok(/19,4 procent över/.test(body), 'TTM-avstånd 19,4 procent över');

// ---------- 5. MEDIANER + RANG i body ----------
const kollar = [
  ['pe', '26,08', '13/21'], ['pb', '3,620', '18/21'], ['evEbit', '17,86', '19/22'], ['peg', '0,79', '3/21'],
  ['fcfYield', '4,31', '12/21'], ['roe', '15,41', '16/21'], ['roic', '16,24', '13/21'],
  ['brutto', '71,0', '18/22'], ['ebit', '24,85', '17/22'], ['netto', '12,97', '16/22'],
  ['fcfMarg', '14,37', '19/22'], ['skuldEK', '0,642', '5/21'], ['prognos', '24,22', '17/22'],
  ['resCAGR', '4,54', '15/20'], ['omsCAGR', '7,30', '11/22'], ['ttm', '4,59', '17/22'],
];
for (const [namn, medS, rangS] of kollar) {
  ok(body.includes(medS), 'median ' + namn + ' = ' + medS);
  ok(body.includes(rangS), 'rang ' + namn + ' = ' + rangS);
}
// gren-n
ok(body.includes('20–22 bolag i hälsogrenen') || /20–22 bolag/.test(body), 'gren-n redovisad');
ok(body.includes('155–195'), 'universum-n redovisad');

// ---------- 6. LÄNKAR ----------
const lnkar = [...body.matchAll(/\]\((\/[^)]+)\)/g)].map(m => m[1]);
const unika = [...new Set(lnkar)];
ok(unika.length >= 18, 'unika interna länkar >= 18', String(unika.length));
ok(!unika.some(x => x.includes('blogg-utkast') || x.includes('localhost') || x.startsWith('http')), '0 utkast-/externa länkar');
ok(unika.includes('/bolag/geti-b-st') && unika.includes('/transparens') && unika.includes('/kallor') && unika.includes('/kurser'), 'kärnlänkar');
console.log('Länkkontroll mot localhost (' + unika.length + ' unika) …');
const koder = {};
for (const x of unika) {
  try {
    const r = await fetch('http://localhost:3000' + x, { redirect: 'manual' });
    koder[x] = r.status;
  } catch (e) { koder[x] = 'ERR:' + e.code; }
}
const dalliga = Object.entries(koder).filter(([k2, v]) => v !== 200);
ok(dalliga.length === 0, 'alla interna länkar HTTP 200', JSON.stringify(dalliga));
// loopback-transient? (Nokia-precedensen: om alla faller, verifiera servern)
if (unika.length > 0 && Object.values(koder).every(v => v !== 200)) {
  console.log('ALLA länkar fel — loopback-transient misstänkt (Nokia-precedensen), kör igen innan felsökning i filen.');
}

// ---------- 7. KVD-SAMMANDRAG ----------
console.log('\n=== KVD GETINGE: ' + PASS + ' PASS · ' + FEL + ' FEL · ' + VARN + ' VARNING ===');
console.log('ord:', ord, '| readingMinutes:', p.readingMinutes, '| title:', p.title.length, 'tkn | desc:', p.description.length, 'tkn');
process.exit(FEL > 0 ? 1 : 0);
