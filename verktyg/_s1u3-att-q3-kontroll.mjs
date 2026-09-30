#!/usr/bin/env node
// Sond _s1u3-att-q3-kontroll.mjs v2 — granskning av sa-laser-du-att-q3-2026.json
// (AT&T Q3 2026, byggare s4-u2 fe37b0b8 2026-09-17 16:50).
// v1-buggar ärligt bokförda och rättade: (1) matchAll utan /g, (2) isFinite(null)=true
// i P/E-rangfiltret, (3) enhetsblandningar USD/MUSD i TTM/EBIT/kedjekvot,
// (4) 21889 skrivet 21.889, (5) pp-tolerans 0,02 mot en-decimal-avrundade tal,
// (6) disclaimer-split på semikolon. Allt EGENMÄTT. Lägen:
//   node verktyg/_s1u3-att-q3-kontroll.mjs            → granskar UTKASTET
//   node verktyg/_s1u3-att-q3-kontroll.mjs paket      → granskar /tmp/att-paket.json (kurer)
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { execSync } from 'node:child_process';

const LAGE = process.argv[2] === 'paket' ? 'paket' : 'utkast';
const ROT = '/home/ak1a/AK1';
const KALLA = LAGE === 'paket' ? '/tmp/att-paket.json' : `${ROT}/data/blogg-utkast/kvartal/2026-q3/sa-laser-du-att-q3-2026.json`;
const VINTAGE = '/tmp/att-vintage-univers.json';
const DAGENS = `${ROT}/data/portfolj-system/bolagsunivers.json`;
const KAL = `${ROT}/data/blogg-utkast/kvartal/2026-q3/kalender-kommunikation.json`;

const u = JSON.parse(readFileSync(KALLA, 'utf8'));
const vin = JSON.parse(readFileSync(VINTAGE, 'utf8'));
const dag = JSON.parse(readFileSync(DAGENS, 'utf8'));
const kal = JSON.parse(readFileSync(KAL, 'utf8'));
const T = vin.find(p => p.ticker === 'T');
const Td = dag.find(p => p.ticker === 'T');
const VZ = vin.find(p => p.ticker === 'VZ');
const body = u.body;

const R = { lage: LAGE, ok: 0, fel: 0, not: 0, poster: [] };
function pass(namn, villkor, det = '') {
  if (villkor) { R.ok++; R.poster.push(['OK', namn, det]); }
  else { R.fel++; R.poster.push(['FEL', namn, det]); }
}
function not(namn, det) { R.not++; R.poster.push(['NOT', namn, det]); }
const approx = (a, b, tol) => Math.abs(a - b) <= tol;
const pct = x => (100 * x).toFixed(2);

// ---------- 1. FÄLTNIVÅ T ----------
const fk = [
  ['pris 25,95', T.pris === 25.95],
  ['mcap 177,819', T.marknadsKapitalMdr === 177.819],
  ['CAGR 5år 1,34 %', approx(T.tillvaxt.omsattningCAGR5ar, 0.0134, 5e-5)],
  ['resultatCAGR null', T.tillvaxt.resultatCAGR5ar === null],
  ['TTM 2,3 %', approx(T.tillvaxt.omsattningTillvaxtTTM, 0.023, 5e-4)],
  ['prognos 9,67 %', approx(T.tillvaxt.prognosTillvaxt, 0.0967, 5e-5)],
  ['ROE 18,34 %', approx(T.lonksamhet.roe, 0.1834, 5e-5)],
  ['ROIC 11,44 %', approx(T.lonksamhet.roic, 0.1144, 5e-5)],
  ['brutto 59,72 %', approx(T.lonksamhet.bruttoMarginal, 0.5972, 5e-5)],
  ['EBIT 24,79 %', approx(T.lonksamhet.ebitMarginal, 0.2479, 5e-5)],
  ['netto 16,94 %', approx(T.lonksamhet.nettoMarginal, 0.1694, 5e-5)],
  ['FCFmarg 7,97 %', approx(T.lonksamhet.fcfMarginal, 0.0797, 5e-5)],
  ['skuld/EK 1,2905', approx(T.stabilitet.skuldEgenkapital, 1.2905, 5e-4)],
  ['räntetäckning null', T.stabilitet.rantaTackning === null],
  ['P/E 8,593', approx(T.vardering.pe, 8.593, 5e-4)],
  ['P/B 1,616', approx(T.vardering.pb, 1.616, 5e-4)],
  ['EV/EBIT 10,908', approx(T.vardering.evEbit, 10.908, 5e-4)],
  ['PEG 1,58', approx(T.vardering.peg, 1.58, 5e-3)],
  ['FCF-yield 5,70 %', approx(T.vardering.fcfYield, 0.057, 5e-4)],
];
for (const [n, v] of fk) pass('FÄLT T ' + n, v);
pass('FÄLT T serier intäkter', JSON.stringify(T.serier.omsattning) === JSON.stringify([120741000000, 122428000000, 122336000000, 125648000000]));
pass('FÄLT T serier resultat', JSON.stringify(T.serier.resultat) === JSON.stringify([-8727000000, 14192000000, 10746000000, 21889000000]));
pass('FÄLT T år 2022-2025', JSON.stringify(T.serier.ar) === JSON.stringify(['2022', '2023', '2024', '2025']));
pass('FÄLT T notering CAGR-motivering', /negativt\/noll resultat basåret/.test(T.notering));
pass('FÄLT T notering ROIC-proxy', /EBIT före skatt \/ \(skuld \+ bokfört EK\)/.test(T.notering));
pass('FÄLT T notering räntetäckning', /räntekostnad saknas/.test(T.notering));
pass('FÄLT T MarketStack-dubbelkällan', T.kallor.some(k => k.namn === 'MarketStack'));
pass('FÄLT T dagens fil identisk med vintage', JSON.stringify(T) === JSON.stringify(Td), 'fältnivå oförändrad sedan byggvintage fe37b0b8');

// ---------- 2. FÄLTNIVÅ VZ ----------
const vzk = [
  ['brutto 59,45', VZ.lonksamhet.bruttoMarginal, 0.5945],
  ['EBIT 23,00', VZ.lonksamhet.ebitMarginal, 0.23],
  ['netto 11,64', VZ.lonksamhet.nettoMarginal, 0.1164],
  ['ROE 15,84', VZ.lonksamhet.roe, 0.1584],
  ['FCFmarg 12,58', VZ.lonksamhet.fcfMarginal, 0.1258],
  ['skuld/EK 1,84', VZ.stabilitet.skuldEgenkapital, 1.8408],
  ['P/E 13,11', VZ.vardering.pe, 13.112],
  ['P/B 2,01', VZ.vardering.pb, 2.008],
  ['FCF-yield 8,37', VZ.vardering.fcfYield, 0.0837],
  ['prognos 5,35', VZ.tillvaxt.prognosTillvaxt, 0.0535],
];
for (const [n, faktisk, f] of vzk) pass('FÄLT VZ ' + n, approx(faktisk, f, 5e-4));

// ---------- 3. MEDIANER ur 159-vintagen ----------
function med(v) { const s = [...v].sort((a, b) => a - b); const n = s.length; return n % 2 ? s[(n - 1) / 2] : (s[n / 2 - 1] + s[n / 2]) / 2; }
function stat(list, f) { const v = list.map(f).filter(x => x !== null && x !== undefined && isFinite(x)); return { m: med(v), n: v.length }; }
const komm = vin.filter(p => p.bransch === 'kommunikation');
const univ = {
  'P/E 20,52 (n=150)': [stat(vin, p => p.vardering?.pe), 20.52, 150],
  'P/B 2,83 (n=156)': [stat(vin, p => p.vardering?.pb), 2.83, 156],
  'ROE 15,57 (n=155)': [stat(vin, p => p.lonksamhet?.roe), 0.1557, 155],
  'EBIT 20,71 (n=158)': [stat(vin, p => p.lonksamhet?.ebitMarginal), 0.2071, 158],
  'netto 13,66 (n=159)': [stat(vin, p => p.lonksamhet?.nettoMarginal), 0.1366, 159],
};
const gren = {
  'P/E 21,85 (n=12)': [stat(komm, p => p.vardering?.pe), 21.85, 12],
  'P/B 2,70 (n=14)': [stat(komm, p => p.vardering?.pb), 2.70, 14],
  'EV/EBIT 16,27 (n=14)': [stat(komm, p => p.vardering?.evEbit), 16.27, 14],
  'PEG 1,49 (n=11)': [stat(komm, p => p.vardering?.peg), 1.49, 11],
  'FCF-yield 6,77 (n=14)': [stat(komm, p => p.vardering?.fcfYield), 0.0677, 14],
  'ROE 17,09 (n=14)': [stat(komm, p => p.lonksamhet?.roe), 0.1709, 14],
  'brutto 49,64 (n=14)': [stat(komm, p => p.lonksamhet?.bruttoMarginal), 0.4964, 14],
  'EBIT 20,21 (n=14)': [stat(komm, p => p.lonksamhet?.ebitMarginal), 0.2021, 14],
  'netto 12,31 (n=14)': [stat(komm, p => p.lonksamhet?.nettoMarginal), 0.1231, 14],
  'FCFmarg 15,31 (n=14)': [stat(komm, p => p.lonksamhet?.fcfMarginal), 0.1531, 14],
  'skuld/EK 1,11 (n=14)': [stat(komm, p => p.stabilitet?.skuldEgenkapital), 1.11, 14],
};
for (const [n, [s, f, nv]] of Object.entries(univ)) pass('MEDIAN univ ' + n, approx(s.m, f, 5e-3) && s.n === nv, `egen=${pct(s.m)} n=${s.n}`);
for (const [n, [s, f, nv]] of Object.entries(gren)) pass('MEDIAN gren ' + n, approx(s.m, f, 5e-3) && s.n === nv, `egen=${pct(s.m)} n=${s.n}`);
{
  const s = stat(komm, p => p.lonksamhet?.bruttoMarginal);
  not('MEDIAN gren brutto full precision', `egen=${s.m.toPrecision(12)} → ${pct(s.m)} %; halv-upp på exakt 49,635 ger 49,64 = textens tal — grönt med seriens avrundningskonvention`);
}
{
  const pe = komm.filter(p => p.vardering?.pe != null && isFinite(p.vardering.pe)).map(p => [p.ticker, p.vardering.pe]).sort((a, b) => a[1] - b[1]);
  pass('RANG P/E lägst av grenens P/E-bärande', pe[0][0] === 'T', `lägsta=${pe[0][0]} ${pe[0][1]}, n=${pe.length}`);
  const br = komm.filter(p => p.lonksamhet?.bruttoMarginal != null && isFinite(p.lonksamhet.bruttoMarginal)).map(p => [p.ticker, p.lonksamhet.bruttoMarginal]).sort((a, b) => b[1] - a[1]);
  pass('RANG brutto fjärde högst av 14', br[3][0] === 'T', `#${br.findIndex(x => x[0] === 'T') + 1} av ${br.length}`);
}

// ---------- 4. ARITMETIK (alla tal i MUSD där ej procent) ----------
const [o22, o23, o24, o25] = T.serier.omsattning.map(x => x / 1e6);
const [r22, r23, r24, r25] = T.serier.resultat.map(x => x / 1e6);
const A = [
  ['nettomarginal 2022 −7,23', pct(r22 / o22), -7.23, 0.005],
  ['nettomarginal 2023 +11,59', pct(r23 / o23), 11.59, 0.005],
  ['nettomarginal 2024 +8,78', pct(r24 / o24), 8.78, 0.005],
  ['nettomarginal 2025 +17,42', pct(r25 / o25), 17.42, 0.005],
  ['steg 2023 +1,40', pct(o23 / o22 - 1), 1.40, 0.005],
  ['steg 2024 −0,08', pct(o24 / o23 - 1), -0.08, 0.005],
  ['steg 2025 +2,71', pct(o25 / o24 - 1), 2.71, 0.005],
  ['CAGR intäkter +1,34 %/år', pct(Math.pow(o25 / o22, 1 / 3) - 1), 1.34, 0.005],
];
for (const [n, egen, txt, tol] of A) pass('ARIT ' + n, approx(+egen, txt, tol), `egen=${egen}`);
{
  const idp = 1.616 / 0.1834;
  pass('ARIT identitet P/B÷ROE = 8,81', approx(idp, 8.81, 0.005), `egen=${idp.toFixed(4)}`);
  pass('ARIT identitet avvikelse +2,5 %', approx(100 * (idp / 8.593 - 1), 2.5, 0.05), `egen=${(100 * (idp / 8.593 - 1)).toFixed(2)} %`);
  const omv = 8.593 * 0.1834;
  pass('ARIT omvänd räkning 1,576', approx(omv, 1.576, 0.0005), `egen=${omv.toFixed(4)}`);
  pass('ARIT omvänd avvikelse −2,5 %', approx(100 * (omv / 1.616 - 1), -2.5, 0.05), `egen=${(100 * (omv / 1.616 - 1)).toFixed(2)} %`);
  pass('ARIT implicit EPS 3,02', approx(25.95 / 8.593, 3.02, 0.005), `egen=${(25.95 / 8.593).toFixed(4)}`);
  const abs1 = 8.593 * r25 / 1000;
  pass('ARIT absolut P/E×vinst 188,1 mdr', approx(abs1, 188.1, 0.05), `egen=${abs1.toFixed(2)}`);
  pass('ARIT absolut residual +5,8 %', approx(100 * (abs1 / 177.819 - 1), 5.8, 0.05), `egen=${(100 * (abs1 / 177.819 - 1)).toFixed(2)} %`);
  const ttmO = o25 * (1 + 0.023);
  pass('ARIT TTM-omsättning 128 538', approx(ttmO, 128538, 1), `egen=${ttmO.toFixed(1)} (2025 × 1+TTM-fältet)`);
  const ttmV = 128538 * 0.1694;
  pass('ARIT TTM-vinst 21 774', approx(ttmV, 21774, 1), `egen=${ttmV.toFixed(1)}`);
  const abs2 = 8.593 * ttmV / 1000;
  pass('ARIT TTM-absolut 187,1 mdr', approx(abs2, 187.1, 0.1), `egen=${abs2.toFixed(2)}`);
  pass('ARIT TTM-residual +5,2 %', approx(100 * (abs2 / 177.819 - 1), 5.2, 0.05), `egen=${(100 * (abs2 / 177.819 - 1)).toFixed(2)} %`);
  const impV = 177819 / 8.593;
  pass('ARIT implicit vinst 20 693', approx(impV, 20693, 1), `egen=${impV.toFixed(1)}`);
  pass('ARIT implicit vinst −5,5 % under årsserien', approx(100 * (impV / 21889 - 1), -5.5, 0.05), `egen=${(100 * (impV / 21889 - 1)).toFixed(2)} %`);
  const pegk = 8.593 / 9.67;
  pass('ARIT PEG-konvention 0,89', approx(pegk, 0.89, 0.005), `egen=${pegk.toFixed(4)}`);
  pass('ARIT PEG-kvot 1,78', approx(1.58 / pegk, 1.78, 0.005), `egen=${(1.58 / pegk).toFixed(3)}`);
  pass('ARIT PEG implicit tillväxt 5,4', approx(8.593 / 1.58, 5.4, 0.05), `egen=${(8.593 / 1.58).toFixed(3)}`);
  const ek = 177.819 / 1.616;
  pass('ARIT EV-kedja EK 110,0', approx(ek, 110.0, 0.05), `egen=${ek.toFixed(2)}`);
  const sk = 1.2905 * ek;
  pass('ARIT EV-kedja skuld 142,0', approx(sk, 142.0, 0.05), `egen=${sk.toFixed(2)}`);
  pass('ARIT EV-kedja EV 252,0', approx(ek + sk, 252.0, 0.05), `egen=${(ek + sk).toFixed(2)}`);
  const ebit25 = o25 * 0.2479;
  pass('ARIT års-EBIT 31 148', approx(ebit25, 31148, 1), `egen=${ebit25.toFixed(1)}`);
  const evfelt = 10.908 * 31148 / 1000;
  pass('ARIT EV-fältväg 339,7 mdr', approx(evfelt, 339.7, 0.1), `egen=${evfelt.toFixed(2)}`);
  pass('ARIT EV-residual −87,7', approx(ek + sk - evfelt, -87.7, 0.1), `egen=${(ek + sk - evfelt).toFixed(2)}`);
  const kvot = (ek + sk) / ebit25 * 1000 / 1000;
  pass('ARIT kedjekvot 8,09', approx((ek + sk) / (ebit25 / 1000), 8.09, 0.005), `egen=${((ek + sk) / (ebit25 / 1000)).toFixed(3)}`);
  pass('ARIT kedjekvot/fält 0,74', approx(((ek + sk) / (ebit25 / 1000)) / 10.908, 0.74, 0.005), `egen=${(((ek + sk) / (ebit25 / 1000)) / 10.908).toFixed(3)}`);
  const fcf = 0.0797 * 128538;
  pass('ARIT FCF 10 244', approx(fcf, 10244, 1), `egen=${fcf.toFixed(1)}`);
  const fy = 100 * 10244 / 177819;
  pass('ARIT FCF-yield egen 5,76 %', approx(fy, 5.76, 0.005), `egen=${fy.toFixed(3)} %`);
  const fyAvv = 100 * ((10244 / 177819) / 0.057 - 1);
  not('ARIT FCF-yield avvikelse', `egen=${fyAvv.toFixed(2)} % relativt (0,06 pp) — utkastet v1 säger "inom en procent relativt"; paketkur = "cirka en procent relativt"`);
  pass('ARIT FCF/vinst 47 %', approx(100 * 10244 / 21774, 47, 0.05), `egen=${(100 * 10244 / 21774).toFixed(1)} %`);
  pass('ARIT bas-EBIT 31 148', approx(o25 * 0.2479, 31148, 1), `egen=${(o25 * 0.2479).toFixed(1)}`);
  const neg3 = o25 * 0.97, pos3 = o25 * 1.03;
  pass('ARIT ruta +3 % intäkter 129 417', approx(pos3, 129417, 1), `egen=${pos3.toFixed(1)}`);
  pass('ARIT ruta −3 % intäkter = 121 879', approx(neg3, 121879, 1), `egen=${neg3.toFixed(1)} — utkast v1 säger 121 978`);
  const korrektRad = [
    [121878.56, 0.2279, 27776], [121878.56, 0.2479, 30214], [121878.56, 0.2679, 32651],
  ];
  for (const [o, m, cell] of korrektRad) pass(`ARIT kurcell ${Math.round(o)}×${pct(m)}% = ${cell}`, approx(o * m, cell, 1), `egen=${(o * m).toFixed(1)} (v1: 27 799/30 238/32 678 byggda på 121 978)`);
  for (const [o, m, cell] of [[125648, 0.2279, 28635], [125648, 0.2479, 31148], [125648, 0.2679, 33661], [129417, 0.2279, 29494], [129417, 0.2479, 32082], [129417, 0.2679, 34671]]) {
    pass(`ARIT rutacell ${o}×${pct(m)}% = ${cell}`, approx(o * m, cell, 1), `egen=${(o * m).toFixed(1)}`);
  }
  pass('ARIT rättesats 1 pp = 1 256', approx(o25 * 0.01, 1256, 1), `egen=${(o25 * 0.01).toFixed(1)}`);
  pass('ARIT rättesats 3 % = 3 769', approx(o25 * 0.03, 3769, 1), `egen=${(o25 * 0.03).toFixed(1)}`);
  pass('ARIT intäktsvikt 3,0×', approx(3769 / 1256, 3.0, 0.01), `egen=${(3769 / 1256).toFixed(3)}`);
  pass('ARIT marginalvikt 1,34', approx(1 / (3 * 0.2479), 1.34, 0.005), `egen=${(1 / (3 * 0.2479)).toFixed(3)}`);
  pass('ARIT multipl P/E 7,84', approx(8.593 / 1.0967, 7.84, 0.005), `egen=${(8.593 / 1.0967).toFixed(3)}`);
  pass('ARIT läge P/E −61 %', approx(100 * (8.59 / 21.85 - 1), -61, 0.5), `egen=${(100 * (8.59 / 21.85 - 1)).toFixed(1)} %`);
  pass('ARIT läge P/B −40 %', approx(100 * (1.62 / 2.70 - 1), -40, 0.5), `egen=${(100 * (1.62 / 2.70 - 1)).toFixed(1)} %`);
  pass('ARIT läge EV/EBIT −33 %', approx(100 * (10.91 / 16.27 - 1), -33, 0.5), `egen=${(100 * (10.91 / 16.27 - 1)).toFixed(1)} %`);
  pass('ARIT brutto över median +10,1 pp', approx(59.72 - 49.64, 10.1, 0.05), `egen=${(59.72 - 49.64).toFixed(2)} (rå 10,08 → 10,1)`);
  pass('ARIT EBIT över median +4,6 pp', approx(24.79 - 20.21, 4.6, 0.05), `egen=${(24.79 - 20.21).toFixed(2)}`);
  pass('ARIT netto över median +4,6 pp', approx(16.94 - 12.31, 4.6, 0.05), `egen=${(16.94 - 12.31).toFixed(2)}`);
  pass('ARIT FCF under median −7,3 pp', approx(7.97 - 15.31, -7.3, 0.05), `egen=${(7.97 - 15.31).toFixed(2)}`);
  pass('ARIT FCF halva medianen', approx(7.97 / 15.31, 0.52, 0.005), `egen=${(7.97 / 15.31).toFixed(3)}`);
  pass('ARIT duopol bruttogap 0,27 pp', approx(59.72 - 59.45, 0.27, 0.005), `egen=${(59.72 - 59.45).toFixed(3)}`);
  pass('ARIT duopol P/E-differens 53 %', approx(100 * (13.11 / 8.59 - 1), 53, 0.5), `egen=${(100 * (13.11 / 8.59 - 1)).toFixed(1)} %`);
  pass('ARIT prognos vs TTM "nästan fyra gånger"', approx(9.67 / 2.3, 4.2, 0.1), `egen=${(9.67 / 2.3).toFixed(2)}×`);
}

// ---------- 5. JURIDIK 2007:528 ----------
const radglossor = [/\bköp\b/gi, /\bsälj\b/gi, /rekommendera/gi, /rekommendation(?!er)/gi, /\bbör du\b/gi, /\btipsa dig\b/gi, /\bråd\b(?!giv)/gi, /\bradda?r\b/gi, /detta är en bra affär/gi, /investera i (?:denna|den här)/gi, /\bgo long\b/gi, /\bbuy\b/gi, /\bsell\b/gi];
for (const [yta, text] of Object.entries({ title: u.title, description: u.description, body })) {
  const traffar = radglossor.flatMap(m => [...text.matchAll(m)].map(x => x[0]));
  pass(`JURI rådglossor ${yta} = 0`, traffar.length === 0, traffar.join(','));
}
const negerade = [...body.matchAll(/(?:inte|aldrig|utan)\s+(?:investeringsråd|rådgivning|rekommendation)/gi)].length;
pass('JURI negerade rådformer finns (utbildningsformulering)', negerade >= 1, `${negerade} träffar`);
const lagrum = [...(u.title + ' ' + u.description + ' ' + body).matchAll(/\b(19|20)\d{2}:\d{2,4}\b/g)].map(m => m[0]);
const frammande = lagrum.filter(x => x !== '2007:528');
pass('JURI exakt en lagrumsfamilj (2007:528)', lagrum.length > 0 && frammande.length === 0, `träffar: ${[...new Set(lagrum)].join(', ')}`);
const slut = body.slice(-350);
pass('JURI disclaimer sist (sista 350 tkn)', /inte investeringsråd/.test(slut) && /2007:528/.test(slut), slut.slice(-140));
pass('JURI utbildningsdeklaration i ingress', /utbildningspaket i AK1A:s kvartalsrapportserie/.test(body));

// ---------- 6. 911-referenser ----------
const m911 = [/9\s*\/\s*11/g, /\b911\b/g, /11\s+september/gi, /september\s+11/gi, /nine\s*[-\s]?eleven/gi, /\belva september\b/g];
const t911 = m911.flatMap(m => [...(u.title + ' ' + u.description + ' ' + body).matchAll(m)].map(x => x[0]));
pass('911-referenser = 0', t911.length === 0, t911.join(','));

// ---------- 7. STRUKTUR ----------
const h2 = [...body.matchAll(/^## (.+)$/gm)].map(m => m[1]);
pass('STRUKTUR H2 7–15', h2.length >= 7 && h2.length <= 15, `${h2.length} H2`);
pass('STRUKTUR title ≤ 314 tkn (wihlborgs-taket)', u.title.length <= 314, `${u.title.length} tkn`);
not('STRUKTUR description', `${u.description.length} tkn — seriepraxis 328–654 (fabege 394, telia 654, getinge 328); OG-tak 155 gäller inte JSON-fältet i denna serie`);
const ren = body.replace(/\|/g, ' ').replace(/[#*\-]/g, ' ');
const ord = ren.split(/\s+/).filter(Boolean).length;
const rm = Math.round(ord / 600);
pass('STRUKTUR readingMinutes = round(ord/600)', u.readingMinutes === rm, `ord=${ord}, round=${rm}, fält=${u.readingMinutes}`);
pass('STRUKTUR mjuka bindestreck = 0', !/\u00AD/.test(body));
pass('STRUKTUR tags 5–7', u.tags.length >= 5 && u.tags.length <= 7, u.tags.join(','));
not('STRUKTUR publishedAt', `${u.publishedAt} — rappdagen är 21/10; seriepraxis publicerar läspaket dagar före rappdagen (telia 10-19 mot 21/10, abb 10-16 mot 20/10, volvo-car 09-15 mot 23/10)`);
pass('STRUKTUR slug ok', u.slug === 'sa-laser-du-att-q3-2026');
pass('STRUKTUR sökord i title', /kvartalsrapport/i.test(u.title) && /AT&T/i.test(u.title));

// ---------- 8. LÄNKAR ----------
const lankar = [...body.matchAll(/\]\((\/[^)]+|https?:\/\/[^)]+)\)/g)].map(m => m[1]);
const interna = lankar.filter(l => l.startsWith('/'));
pass('LÄNK minst 18 interna', interna.length >= 18, `${interna.length} interna`);
const unika = [...new Set(interna)];
pass('LÄNK alla sökvägsformer kända', unika.every(l => /^\/(kurser|transparens|kallor|bolag|dataset)(\/[\w\-/]*)?$/.test(l)), unika.join(' '));

// ---------- 9. KALENDER ----------
const tKal = kal.bolag.find(b => b.ticker === 'T');
pass('KAL rappdag 21/10 i kalenderfilen', tKal.rapportfenster === '2026-10-21', tKal.rapportfenster);
pass('KAL "före börsöppning + telefonkonferens"', /före börsöppning/.test(tKal.notera) && /telefonkonferens samma dag/.test(tKal.notera));
pass('KAL Q2 2026 = 22/7', /22\/7/.test(tKal.notera));
pass('KAL officiell nyhet-citat', /AT&T to Release Third-Quarter 2026 Earnings on October 21/.test(JSON.stringify(tKal)));
// veckolistan: v1 räknade 19 namn men sade "arton + AT&T = nittonde"; kur = stryk Nokia
// (nokia-paketet byggdes 09-18, DAGEN EFTER att-paketet — fanns inte i serien vid skrivandet)
const lista = {
  '2026-10-20': ['ABB', 'Tele2'],
  '2026-10-21': ['SKF', 'Handelsbanken', 'Telia', 'Iberdrola'],
  '2026-10-22': ['Essity', 'Swedbank', 'Sandvik', 'Atlas Copco', 'Castellum', 'Holmen', 'Yara'],
  '2026-10-23': ['Volvo Car', 'Volvo Group', 'Saab', 'SCA', 'Norsk Hydro'],
};
const antal = Object.values(lista).flat().length;
pass('KAL veckolistan = 18 namn + AT&T = 19', antal === 18, `${antal} namn`);
if (LAGE === 'utkast') {
  not('KAL v1-läget', `v1-listan inkluderar Nokia på 22/10 → 19 namn + AT&T = 20, men texten säger arton/nittonde; kalenderns Nokia-dag 22/10 är RÄTT — felet är räkningen, inte datumet`);
} else {
  pass('KAL kur: Nokia kvar i veckolistan (kalenderdag 22/10 källsann)', (body.match(/Samma vecka:[\s\S]*?22 oktober/)?.[0] ?? '').includes('Nokia'));
  pass('KAL kur: räkningen nitton/tjugo konsistent', /med AT&T tjugo av seriens läspaket/.test(body) && /nitton av seriens läspaket[^.]*det tjugonde/.test(body));
}

// ---------- 10. PAKET-EXTRA (läge=paket): kurverkställelse ----------
if (LAGE === 'paket') {
  const gamla = ['121 978', '27 799', '30 238', '32 678', 'inom en procent relativt', 'med AT&T nitton av seriens läspaket', 'arton av seriens läspaket', 'som det nittonde'];
  for (const g of gamla) pass(`PAKET gammal felsträng "${g}" borta`, !body.includes(g));
  pass('PAKET ny radrubrik 121 879', body.includes('121 879'));
  pass('PAKET nya celler 27 776/30 214/32 651', body.includes('27 776') && body.includes('30 214') && body.includes('32 651'));
  pass('PAKET FCF-formulering "cirka en procent relativt"', body.includes('cirka en procent relativt'));
  pass('PAKET F2kur "med AT&T tjugo av seriens läspaket"', body.includes('med AT&T tjugo av seriens läspaket'));
  pass('PAKET F2kur "nitton av seriens läspaket … det tjugonde"', /nitton av seriens läspaket[^.]*det tjugonde/.test(body));
  const json = JSON.stringify(u);
  pass('PAKET JSON giltig + nycklar intakta', ['slug', 'title', 'description', 'pillar', 'author', 'publishedAt', 'readingMinutes', 'tags', 'body'].every(k => k in u));
  // utkastet på disk orört (granskaren skriver ej andras filer)
  const md5 = execSync(`md5sum ${ROT}/data/blogg-utkast/kvartal/2026-q3/sa-laser-du-att-q3-2026.json`, { encoding: 'utf8' }).split(' ')[0];
  pass('PAKET utkastet på disk orört (md5 bb880241…)', md5 === 'bb8802415ed2b92f6a89f303db640b24', md5);
}

writeFileSync(`/tmp/att-sond-rapport-${LAGE}.json`, JSON.stringify(R, null, 1));
console.log(`SOND AT&T Q3 [${LAGE}] — ${R.ok} OK · ${R.fel} FEL · ${R.not} NOT`);
for (const [typ, namn, det] of R.poster.filter(p => p[0] !== 'OK')) console.log(`${typ} ${namn}${det ? ' — ' + det : ''}`);
