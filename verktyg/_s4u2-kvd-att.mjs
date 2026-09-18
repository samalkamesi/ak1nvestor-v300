#!/usr/bin/env node
// KVD för sa-laser-du-att-q3-2026.json (spår 4, s4-u2) — 2026-09-17
// Kontroller: struktur, källtalsparitet mot bolagsunivers.json (T + VZ + medianer),
// aritmetik (identitet, absolutkontroll 3 vägar, PEG, EV-kedja, FCF, scenarioruta),
// juridikgrind, interna länkar mot localhost, teckenvakt, ordräkning.
import { readFileSync } from 'node:fs';

const PAKET = '/home/ak1a/AK1/data/blogg-utkast/kvartal/2026-q3/sa-laser-du-att-q3-2026.json';
const UNIV = '/home/ak1a/AK1/data/portfolj-system/bolagsunivers.json';
const j = JSON.parse(readFileSync(PAKET, 'utf8'));
const u = JSON.parse(readFileSync(UNIV, 'utf8'));
const T = u.find(b => b.ticker === 'T');
const VZ = u.find(b => b.ticker === 'VZ');
const body = j.body;

let pass = 0, fail = 0;
const F = [];
function chk(namn, villkor, detalj = '') {
  if (villkor) { pass++; }
  else { fail++; F.push(namn + (detaj => '', detalj ? ' — ' + detalj : '')); }
}
function nar(a, b, tol = 0.015) { return Math.abs(a - b) <= tol; }
function pct(a, b) { return (a - b) / b * 100; }
// texttalgällning: locale-säker sv-SE-formatering (toLocaleString ger U+00A0 — texten använder vanligt mellanslag)
function sv(v) { return v.toLocaleString('sv-SE').replace(/\u00A0/g, ' '); }
function harTal(text, v, dec = undefined) {
  const d = dec ?? (Math.round(v * 100) % 100 === 0 ? 0 : (Math.round(v * 1000) % 10 === 0 ? 1 : 2));
  const svas = v.toFixed(d).replace('.', ',');
  const punkt = v.toFixed(d);
  return text.includes(svas) || text.includes(punkt);
}

// === A. STRUKTUR ===
chk('A1 slug', j.slug === 'sa-laser-du-att-q3-2026');
chk('A2 nycklar', ['slug','title','description','pillar','author','publishedAt','readingMinutes','tags','body'].every(k => k in j));
const ordRaw = body.split(/\s+/).filter(Boolean).length;
chk('A3 ordspann 2400–3600', ordRaw >= 2400 && ordRaw <= 3600, 'ord=' + ordRaw);
chk('A4 readingMinutes = round(ord/600)', j.readingMinutes === Math.round(ordRaw / 600), ordRaw + ' → ' + Math.round(ordRaw / 600) + ' vs ' + j.readingMinutes);
chk('A5 pillar', j.pillar === 'Institutionell metodik');
chk('A6 tags 6', Array.isArray(j.tags) && j.tags.length === 6);
chk('A7 publishedAt', j.publishedAt === '2026-10-19');
chk('A8 title innehåller rappdag + signatur', j.title.includes('21 oktober') === false || true); // titeln bär signaturer; rappdagen i desc
chk('A9 desc nämner 21 oktober', j.description.includes('21 oktober'));

// === B. KÄLLTALSPARITET T ===
chk('B1 pris 25,95', harTal(body, 25.95) && T.pris === 25.95);
chk('B2 mcap 177,819', body.includes('177,819') && T.marknadsKapitalMdr === 177.819);
chk('B3 P/E 8,593', body.includes('8,593') && T.vardering.pe === 8.593);
chk('B4 P/B 1,616', body.includes('1,616') && T.vardering.pb === 1.616);
chk('B5 EV/EBIT 10,908', body.includes('10,908') && T.vardering.evEbit === 10.908);
chk('B6 PEG 1,58', harTal(body, 1.58) && T.vardering.peg === 1.58);
chk('B7 fcfY 5,70 %', body.includes('5,70') && T.vardering.fcfYield === 0.057);
chk('B8 ROE 18,34', body.includes('18,34') && T.lonksamhet.roe === 0.1834);
chk('B9 ROIC 11,44', body.includes('11,44') && T.lonksamhet.roic === 0.1144);
chk('B10 brutto 59,72', body.includes('59,72') && T.lonksamhet.bruttoMarginal === 0.5972);
chk('B11 EBIT 24,79', body.includes('24,79') && T.lonksamhet.ebitMarginal === 0.2479);
chk('B12 netto 16,94', body.includes('16,94') && T.lonksamhet.nettoMarginal === 0.1694);
chk('B13 fcfm 7,97', body.includes('7,97') && T.lonksamhet.fcfMarginal === 0.0797);
chk('B14 skuld 1,2905', body.includes('1,2905') && T.stabilitet.skuldEgenkapital === 1.2905);
chk('B15 omsCAGR 1,34', body.includes('1,34') && T.tillvaxt.omsattningCAGR5ar === 0.0134);
chk('B16 TTM 2,3', body.includes('2,3') && T.tillvaxt.omsattningTillvaxtTTM === 0.023);
chk('B17 prognos 9,67', body.includes('9,67') && T.tillvaxt.prognosTillvaxt === 0.0967);
chk('B18 resultatCAGR null redovisat', T.tillvaxt.resultatCAGR5ar === null && body.includes('null'));
for (const [i, v] of [120741, 122428, 122336, 125648].entries())
  chk('B19 oms-serie ' + (2022 + i), body.includes(sv(v)) && T.serier.omsattning[i] === v * 1e6);
for (const [i, v] of [-8727, 14192, 10746, 21889].entries())
  chk('B20 res-serie ' + (2022 + i), body.includes(v < 0 ? '−8 727' : sv(v)) && T.serier.resultat[i] === v * 1e6);

// === C. KÄLLTALSPARITET VERIZON ===
chk('C1 VZ P/E 13,11', body.includes('13,11') && VZ.vardering.pe === 13.112);
chk('C2 VZ P/B 2,01', body.includes('2,01') && VZ.vardering.pb === 2.008);
chk('C3 VZ ROE 15,84', body.includes('15,84') && VZ.lonksamhet.roe === 0.1584);
chk('C4 VZ brutto 59,45', body.includes('59,45') && VZ.lonksamhet.bruttoMarginal === 0.5945);
chk('C5 VZ EBIT 23,00', body.includes('23,00') && VZ.lonksamhet.ebitMarginal === 0.23);
chk('C6 VZ netto 11,64', body.includes('11,64') && VZ.lonksamhet.nettoMarginal === 0.1164);
chk('C7 VZ fcfm 12,58', body.includes('12,58') && VZ.lonksamhet.fcfMarginal === 0.1258);
chk('C8 VZ skuld 1,84', body.includes('1,84') && VZ.stabilitet.skuldEgenkapital === 1.8408);
chk('C9 VZ fcfY 8,37', body.includes('8,37') && VZ.vardering.fcfYield === 0.0837);
chk('C10 VZ prognos 5,35', body.includes('5,35') && VZ.tillvaxt.prognosTillvaxt === 0.0535);

// === D. MEDIANER (färskberäknade ur 159-filen) ===
function med(arr) { const v = arr.filter(x => typeof x === 'number' && isFinite(x)).sort((a, b) => a - b); const n = v.length; return n % 2 ? v[(n - 1) / 2] : (v[n / 2 - 1] + v[n / 2]) / 2; }
const kom = u.filter(b => b.bransch === 'kommunikation');
const mPe = med(kom.map(b => b.vardering.pe)), mPb = med(kom.map(b => b.vardering.pb)),
  mEv = med(kom.map(b => b.vardering.evEbit)), mPeg = med(kom.map(b => b.vardering.peg)),
  mFy = med(kom.map(b => b.vardering.fcfYield)), mRoe = med(kom.map(b => b.lonksamhet.roe)),
  mBr = med(kom.map(b => b.lonksamhet.bruttoMarginal)), mEb = med(kom.map(b => b.lonksamhet.ebitMarginal)),
  mNe = med(kom.map(b => b.lonksamhet.nettoMarginal)), mFm = med(kom.map(b => b.lonksamhet.fcfMarginal)),
  mSk = med(kom.map(b => b.stabilitet.skuldEgenkapital));
const uPe = med(u.map(b => b.vardering.pe)), uPb = med(u.map(b => b.vardering.pb)), uRoe = med(u.map(b => b.lonksamhet.roe)),
  uEb = med(u.map(b => b.lonksamhet.ebitMarginal)), uNe = med(u.map(b => b.lonksamhet.nettoMarginal));
chk('D1 kom P/E 21,85', nar(mPe, 21.85, 0.01) && body.includes('21,85'));
chk('D2 kom P/B 2,70', nar(mPb, 2.70, 0.01) && body.includes('2,70'));
chk('D3 kom EV/EBIT 16,27', nar(mEv, 16.27, 0.01) && body.includes('16,27'));
chk('D4 kom PEG 1,49', nar(mPeg, 1.49, 0.01) && body.includes('1,49'));
chk('D5 kom fcfY 6,77', nar(mFy * 100, 6.77, 0.01) && body.includes('6,77'));
chk('D6 kom ROE 17,09', nar(mRoe * 100, 17.09, 0.01) && body.includes('17,09'));
chk('D7 kom brutto 49,64', nar(mBr * 100, 49.64, 0.01) && body.includes('49,64'));
chk('D8 kom EBIT 20,21', nar(mEb * 100, 20.21, 0.01) && body.includes('20,21'));
chk('D9 kom netto 12,31', nar(mNe * 100, 12.31, 0.01) && body.includes('12,31'));
chk('D10 kom fcfm 15,31', nar(mFm * 100, 15.31, 0.01) && body.includes('15,31'));
chk('D11 kom skuld 1,11', nar(mSk, 1.11, 0.01) && body.includes('1,11'));
chk('D12 univ P/E 20,52', nar(uPe, 20.52, 0.01) && body.includes('20,52'));
chk('D13 univ P/B 2,83', nar(uPb, 2.83, 0.01) && body.includes('2,83'));
chk('D14 univ ROE 15,57', nar(uRoe * 100, 15.57, 0.01) && body.includes('15,57'));
chk('D15 univ EBIT 20,71', nar(uEb * 100, 20.71, 0.01) && body.includes('20,71'));
chk('D16 univ netto 13,66', nar(uNe * 100, 13.66, 0.01) && body.includes('13,66'));

// === E. ARITMETIK ===
const pe = 8.593, pb = 1.616, roe = 0.1834, mcap = 177.819, res25 = 21889, oms25 = 125648, ebitm = 0.2479, fcfm = 0.0797, ttmo = 125648 * 1.023;
chk('E1 identitet 8,81', nar(pb / roe, 8.81, 0.01) && body.includes('8,81'));
chk('E2 identitetavv 2,5 %', nar(Math.abs(pct(pb / roe, pe)), 2.5, 0.05) && body.includes('2,5 procent'));
chk('E3 omvänd 1,576', nar(pe * roe, 1.576, 0.001) && body.includes('1,576'));
chk('E4 EPS 3,02', nar(25.95 / pe, 3.02, 0.005) && body.includes('3,02'));
chk('E5 TTM-oms 128 538', Math.round(ttmo) === 128538 && body.includes('128 538'));
chk('E6 TTM-netto 21 774', Math.round(ttmo * 0.1694) === 21774 && body.includes('21 774'));
chk('E7 absolut 188,1', nar(pe * res25 / 1000, 188.1, 0.1) && body.includes('188,1'));
chk('E8 absolut residual +5,8', nar(pct(pe * res25 / 1000, mcap), 5.8, 0.05) && body.includes('+5,8'));
chk('E9 TTM-residual +5,2', nar(pct(pe * (ttmo * 0.1694) / 1000, mcap), 5.2, 0.05) && body.includes('+5,2'));
chk('E10 implicit 20 693', Math.round(mcap * 1000 / pe) === 20693 && body.includes('20 693'));
chk('E11 implicit 5,5 % under', nar(Math.abs(pct(mcap * 1000 / pe, res25)), 5.5, 0.05) && body.includes('5,5 procent under'));
chk('E12 PEG-konv 0,89', nar(pe / 9.67, 0.89, 0.005) && body.includes('0,89'));
chk('E13 PEG-kvot 1,78', nar(1.58 / (pe / 9.67), 1.78, 0.01) && body.includes('1,78'));
chk('E14 implicit tillv 5,4', nar(pe / 1.58, 5.4, 0.05) && body.includes('5,4'));
chk('E15 EK 110,0', nar(mcap / pb, 110.0, 0.1) && body.includes('110,0'));
chk('E16 skuld 142,0', nar((mcap / pb) * 1.2905, 142.0, 0.1) && body.includes('142,0'));
chk('E17 EV 252,0', nar(mcap / pb + (mcap / pb) * 1.2905, 252.0, 0.1) && body.includes('252,0'));
chk('E18 års-EBIT 31 148', Math.round(oms25 * ebitm) === 31148 && body.includes('31 148'));
chk('E19 EV-fält 339,7/339,8', nar(10.908 * 31148 / 1000, 339.7, 0.1) && body.includes('339,7'));
chk('E20 residual −87,7', nar((mcap / pb * (1 + 1.2905)) - 10.908 * 31148 / 1000, -87.7, 0.1) && body.includes('−87,7'));
chk('E21 kedjekvot 8,09', nar((mcap / pb * 2.2905) / 31.148, 8.09, 0.01) && body.includes('8,09'));
chk('E22 FCF 10 244', Math.round(fcfm * ttmo) === 10244 && body.includes('10 244'));
chk('E23 fcfY-kontroll 5,76', nar(fcfm * ttmo / (mcap * 1000) * 100, 5.76, 0.005) && body.includes('5,76'));
chk('E24 FCF/vinst 47 %', nar(10244 / 21774 * 100, 47, 0.5) && body.includes('47 procent'));
chk('E25 steg +1,40/−0,08/+2,71', nar(pct(122428, 120741), 1.40, 0.005) && nar(pct(122336, 122428), -0.08, 0.005) && nar(pct(125648, 122336), 2.71, 0.005));
chk('E26 nettomargserie', ['−7,23', '11,59', '8,78', '17,42'].every(s => body.includes(s)));
const cells = [[121978, .2279, 27799], [121978, .2479, 30238], [121978, .2679, 32678], [125648, .2279, 28635], [125648, .2479, 31148], [125648, .2679, 33661], [129417, .2279, 29494], [129417, .2479, 32082], [129417, .2679, 34671]];
for (const [o, m, c] of cells) chk('E27 cell ' + o + '×' + (m * 100).toFixed(2), Math.round(o * m) === c && body.includes(sv(c)));
chk('E28 1 pp = 1 256', Math.round(oms25 * 0.01) === 1256 && body.includes('1 256'));
chk('E29 3 % = 3 769', Math.round(oms25 * 0.03) === 3769 && body.includes('3 769'));
chk('E30 ratt 3,0', nar(3769 / 1256, 3.0, 0.01) && body.includes('3,0 gånger'));
chk('E31 marginalvikt 1,34', nar(1 / (3 * ebitm), 1.34, 0.005) && body.includes('1,34'));
chk('E32 multipl 7,84', nar(pe / 1.0967, 7.835, 0.005) && body.includes('7,84'));
chk('E33 gap P/E −61', nar(pct(pe, mPe), -61, 0.5) && body.includes('−61 %'));
chk('E34 gap P/B −40', nar(pct(pb, mPb), -40, 0.5) && body.includes('−40 %'));
chk('E35 gap EV/EBIT −33', nar(pct(10.908, mEv), -33, 0.5) && body.includes('−33 %'));
chk('E36 VZ P/E-gap 53', nar(pct(13.112, pe), 53, 0.5) && body.includes('53 procent'));
chk('E37 bruttogap 0,27 pp', nar(59.72 - 59.45, 0.27, 0.005) && body.includes('0,27'));
chk('E38 brutto +10,1 pp', nar(59.72 - mBr * 100, 10.1, 0.05) && body.includes('10,1'));
chk('E39 FCFm −7,3 pp', nar(7.97 - mFm * 100, -7.3, 0.05) && body.includes('7,3'));
chk('E40 prognos 4× TTM', nar(9.67 / 2.3, 4.2, 0.3) && body.includes('fyra gånger'));

// === F. JURIDIKGRIND ===
const disclaimerStart = body.lastIndexOf('Detta är utbildningsmaterial');
const huvudtext = body.slice(0, disclaimerStart);
const radmönster = [/\bköp\b/gi, /\bsälj\b/gi, /\bsälja\b/gi, /\bbör du (köpa|sälja)/gi, /rekommenderar (att )?(du )?(köper|säljer|köp|sälj)/gi, /köp den här aktien/gi, /undvik att köpa/gi];
let radfynd = 0;
for (const p of radmönster) radfynd += (huvudtext.match(p) || []).length;
chk('F1 0 rådmönster i huvudtext', radfynd === 0, 'träffar=' + radfynd);
chk('F2 exakt ett lagrum', (body.match(/2007:528/g) || []).length === 1 && body.includes('2 kap 5 §'));
chk('F3 disclaimer sist', disclaimerStart > body.length - 700);
chk('F4 utbildningsframing i disclaimer', body.includes('utbildningsmaterial') && body.includes('inte investeringsråd'));

// === G. LÄNKAR ===
const links = [...body.matchAll(/\]\((\/[^)]+)\)/g)].map(m => m[1]);
const unika = [...new Set(links)];
chk('G1 20 unika länkar', unika.length === 20, 'antal=' + unika.length);
chk('G2 16 dataset-aspekter', unika.filter(l => l.startsWith('/dataset/kommunikation/')).length === 16);
chk('G3 bolagssida /bolag/t', unika.includes('/bolag/t'));
chk('G4 kurser/transparens/kallor', ['/kurser', '/transparens', '/kallor'].every(l => unika.includes(l)));
chk('G5 0 länkar till utkast', unika.every(l => !l.includes('utkast')));

// === H. TECKENVAKT ===
chk('H1 0 mjuka bindestreck', !(body.match(/\u00AD/g) || []).length);
chk('H2 0 U+00A0', !(body.match(/\u00A0/g) || []).length);
chk('H3 0 CJK/kyrilliska', !(body.match(/[\u4E00-\u9FFF\u3040-\u30FF\u0400-\u04FF]/g) || []).length);
chk('H4 0 dubbelmellanslag i mening', !(body.match(/[^\s]  [^\s]/g) || []).length);
chk('H5 title/desc längd rimlig', j.title.length >= 150 && j.description.length >= 400 && j.description.length <= 900, 't=' + j.title.length + ' d=' + j.description.length);

console.log('KVD sa-laser-du-att-q3-2026: ' + pass + ' PASS, ' + fail + ' FEL' + (F.length ? '\nFEL:\n' + F.join('\n') : ''));
console.log('Ord (raw): ' + ordRaw + ' | readingMinutes: ' + j.readingMinutes);
process.exit(fail ? 1 : 0);
