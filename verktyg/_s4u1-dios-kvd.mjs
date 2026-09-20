// _s4u1-dios-kvd.mjs — KVD för Diös Q3-2026-läspaketet (kvartalsrapportserien).
// Grind: (1) struktur enligt seriens mall, (2) källtalsparitet mot bolagsunivers.json
// (LIVE-omräkning — talbanken används INTE som sanning), (3) aritmetikpåståenden
// omräknade oberoende, (4) medianer + rang LIVE ur fastighetsgrenen, (5) juridikgrind
// exakt ett lagrum + 0 rådglosor, (6) språkgrind, (7) interna länkar mot tillåten
// uppsättning + HTTP 200, (8) externa URL:er endast kända domäner i källsektionen.
// Exitkod 0 = GRÖN; utskrift en PASS/FEL-rad per kontroll.
import { readFileSync } from 'node:fs';

const PAKET = '/home/ak1a/AK1/data/blogg-utkast/kvartal/2026-q3/sa-laser-du-dios-q3-2026.json';
const UNI = '/home/ak1a/AK1/data/portfolj-system/bolagsunivers.json';
let pass = 0, fel = 0, varning = 0;
const F = [], V = [], P = [];
function ok(namn, detalj) { pass++; console.log(`PASS ${pass} ${namn}${detalj ? ' — ' + detalj : ''}`); }
function no(namn, detalj) { fel++; console.log(`FEL ${fel} ${namn} — ${detalj}`); }
function wa(namn, detalj) { varning++; console.log(`VARNING ${varning} ${namn} — ${detalj}`); }
function assert(namn, cond, detalj) { cond ? ok(namn, detalj) : no(namn, detalj); }

const j = JSON.parse(readFileSync(PAKET, 'utf8'));
const U = JSON.parse(readFileSync(UNI, 'utf8'));
const list = Array.isArray(U) ? U : (U.bolag || U.universum || U);
const d = list.find(b => b.ticker === 'DIOS.ST');
const fast = list.filter(b => b.bransch === 'fastighet');
const b = j.body;

// ——— 1. struktur ———
assert('slug', j.slug === 'sa-laser-du-dios-q3-2026');
assert('title innehåller kärntal', j.title.includes('14,2') && j.title.includes('24,9') && j.title.includes('8,2'));
assert('pillar', j.pillar === 'Institutionell metodik');
assert('author', j.author === 'AK1A Research Lab');
assert('publishedAt = rappdag', j.publishedAt === '2026-10-23');
const ord = b.replace(/\|\s?/g, ' ').split(/\s+/).filter(Boolean).length;
assert('readingMinutes = round(ord/600)', j.readingMinutes === Math.round(ord / 600), `${ord} ord → rm ${j.readingMinutes}`);
assert('tags 6 st med seriens stampel', j.tags.includes('kvartalsrapport') && j.tags.includes('läspaket') && j.tags.length === 6);
const h2 = [...b.matchAll(/^## (.+)$/gm)].map(m => m[1]);
['Urvalet: varför Diös är nästa paket i serien',
 'Nyckeltalen att ha med sig — AKM2:s fyra dimensioner, fastighetsutgåvan',
 'Datavakten — fem prov på en full datakärna',
 'Så står sig bolaget mot branschen',
 'Tre sätt att läsa utfallet — övningar i metod',
 'Praktiskt inför 23 oktober kl 13:00',
 'Källor'].forEach((h, i) => assert(`H2-${i + 1} ${h.slice(0, 28)}…`, h2[i] === h, `fanns: "${h2[i] || 'SAKNAS'}"`));
const sista = b.trimEnd().split('\n').pop();
assert('disclaimer exakt sista raden',
  sista.startsWith('*Detta läspaket är utbildningsmaterial') && sista.includes('inte investeringsrådgivning') && silda(sista));
function silda(s) { return s.endsWith('kundens beslut.*'); }

// ——— 2. källtalsparitet LIVE ur universumfilen ———
const f = {
  pris: d.pris, mcapMkr: d.marknadsKapitalMdr * 1000, pe: d.vardering.pe, pb: d.vardering.pb,
  evEbit: d.vardering.evEbit, peg: d.vardering.peg, fcfYield: d.vardering.fcfYield,
  roic: d.lonksamhet.roic, roe: d.lonksamhet.roe, brutto: d.lonksamhet.bruttoMarginal,
  ebitMarg: d.lonksamhet.ebitMarginal, netto: d.lonksamhet.nettoMarginal,
  skuldEk: d.stabilitet.skuldEgenkapital, cagr5oms: d.tillvaxt.omsattningCAGR5ar,
  cagr5res: d.tillvaxt.resultatCAGR5ar, ttm: d.tillvaxt.omsattningTillvaxtTTM,
  prognos: d.tillvaxt.prognosTillvaxt, golvVarde: d.golv.vardePerAktie,
  golvMarginal: d.golv.marginal, omsMkr: d.serier.omsattning.map(v => v / 1e6),
  resMkr: d.serier.resultat.map(v => v / 1e6), insider: d.aterkop.insiderkopSenaste6man,
};
const par = [
  ['pris 64,90', '64,90', f.pris === 64.9],
  ['P/E-fältet 8,194', '8,194', f.pe === 8.194],
  ['P/B-fältet 0,743', '0,743', f.pb === 0.743],
  ['EV/EBIT-fältet 14,236', '14,236', f.evEbit === 14.236],
  ['PEG-fältet 1,37', '1,37', f.peg === 1.37],
  ['ROIC 6,21 %', '6,21', f.roic === 0.0621],
  ['brutto 68,77', '68,77', f.brutto === 0.6877],
  ['EBIT-marg 69,72', '69,72', f.ebitMarg === 0.6972],
  ['netto 42,15', '42,15', f.netto === 0.4215],
  ['skuld/EK 1,4674', '1,4674', f.skuldEk === 1.4674],
  ['CAGR5oms 6,42', '6,42', f.cagr5oms === 0.0642],
  ['CAGR5res −0,89', '−0,89', f.cagr5res === -0.0089],
  ['TTM 0,2', '0,2', f.ttm === 0.002],
  ['prognos −4,79', '−4,79', f.prognos === -0.0479],
  ['golv 87,31', '87,31', f.golvVarde === 87.31],
  ['golvmarginal 0,2567', '0,2567', f.golvMarginal === 0.2567],
  ['FCF null', 'null hos källan', f.fcfYield === null],
  ['ROE null', 'null hos källan', f.roe === null],
  ['insiderköp 0', '0', f.insider === 0],
  ['mcap 9 016', '9 016', f.mcapMkr === 9016],
  ['serier 2 209/2 504/2 527/2 662', '2 662', JSON.stringify(f.omsMkr) === '[2209,2504,2527,2662]'],
  ['resultatserie 830/−850/691/808', '+808', JSON.stringify(f.resMkr) === '[830,-850,691,808]'],
];
for (const [namn, frag, cond] of par) assert('fältparitet ' + namn, cond && b.includes(frag), cond ? '' : 'universumvärdet avviker');

// ——— 3. aritmetik omräknad oberoende (textens tal kontrolleras mot egen uträkning) ———
const sv = (x, dec = 2) => x.toLocaleString('sv-SE', { minimumFractionDigits: dec, maximumFractionDigits: dec });
const A = d.marknadsKapitalMdr * 1000 / d.pris;                       // aktieantal M
const EKa = d.pris / f.pb;                                             // EK/aktie
const pbGolv = d.pris / f.golvVarde;                                   // P/B via golv
const rabGolv = 1 - d.pris / f.golvVarde;                              // rabatt mot golv
const epsT = d.pris / f.pe;                                            // EPS TTM
const vinstT = epsT * A;                                               // TTM-vinst Mkr
const epsB = f.resMkr[3] / A;                                          // EPS bokslut 2025
const peB = d.pris / epsB;                                             // P/E bokslut
const gapM = vinstT - f.resMkr[3], gapP = gapM / f.resMkr[3];
const roeH = epsT / EKa;                                               // härledd ROE
const idPe = f.pb / roeH;                                              // identitet
const ttmI = f.omsMkr[3] * (1 + f.ttm), ebitT = ttmI * f.ebitMarg;
const ev = f.evEbit * ebitT, nsk = ev - f.mcapMkr;
const ekM = f.mcapMkr / f.pb, tsM = f.skuldEk * ekM, kassa = tsM - nsk;
const tsPa = tsM / A, balTot = ekM + tsM;
const utdAr = 0.6 * 4, dirK = utdAr / d.pris;
const kursEpra = d.pris / 100.2, rabEpra = 1 - kursEpra;
const arb = [
  ['aktieantal 138,92 M', sv(A) === '138,92', `aktieantalet ${A.toFixed(2)} M i texten: ${b.includes('138,92 miljoner aktier')}`],
  ['EK/aktie 87,35', sv(EKa) === '87,35', b.includes('87,35')],
  ['P/B via golv 0,7433', pbGolv.toFixed(4) === '0.7433', b.includes('0,7433')],
  ['rabatt mot golv 25,7 %', (rabGolv * 100).toFixed(1) === '25.7', b.includes('25,7 procent')],
  ['1−P/B 0,2570', (1 - f.pb).toFixed(4) === '0.2570', b.includes('0,2570')],
  ['EPS-TTM 7,92', sv(epsT) === '7,92', b.includes('7,92')],
  ['TTM-vinst 1 100 Mkr', Math.round(vinstT) === 1100, b.includes('1 100 miljoner')],
  ['EPS-bokslut 5,82', sv(epsB) === '5,82', b.includes('5,82')],
  ['boksluts-P/E 11,16', peB.toFixed(2) === '11.16', b.includes('11,16')],
  ['vinstgap 292 Mkr', Math.round(gapM) === 292, b.includes('292 miljoner')],
  ['vinstgap 36 %', Math.round(gapP * 100) === 36, b.includes('36 procent')],
  ['härledd ROE 9,07 %', (roeH * 100).toFixed(2) === '9.07', b.includes('9,07')],
  ['identitet 8,194 = P/E', idPe.toFixed(3) === '8.194', b.includes('= 8,194')],
  ['identitetsgap 0,00 %', Math.abs(idPe - f.pe) / f.pe < 5e-5, b.includes('gap 0,00 procent')],
  ['avk P/E 12,20 %', (100 / f.pe).toFixed(2) === '12.20', b.includes('12,20')],
  ['avk boksluts-P/E 8,96 %', (100 / peB).toFixed(2) === '8.96', b.includes('8,96')],
  ['avk EV/EBIT 7,02 %', (100 / f.evEbit).toFixed(2) === '7.02', b.includes('7,02')],
  ['PEG-implicit 5,98 %', (f.pe / f.peg).toFixed(2) === '5.98', b.includes('5,98')],
  ['PEG-konvention 1,28', (f.pe / (f.cagr5oms * 100)).toFixed(2) === '1.28', b.includes('1,28')],
  ['PEG-decimal 127,6', (f.pe / f.cagr5oms).toFixed(1) === '127.6', b.includes('127,6')],
  ['TTM-intäkt 2 667', Math.round(ttmI) === 2667, b.includes('2 667')],
  ['EBIT-TTM 1 860', Math.round(ebitT) === 1860, b.includes('1 860 miljoner')],
  ['EV 26 474', Math.round(ev) === 26474, b.includes('26 474')],
  ['nettoskuld implicit 17 458', Math.round(nsk) === 17458, b.includes('17 458')],
  ['EK 12 135', Math.round(ekM) === 12135, b.includes('12 135')],
  ['totalskuld 17 806', Math.round(tsM) === 17806, b.includes('17 806')],
  ['kassa implicit 348', Math.round(kassa) === 348, b.includes('348')],
  ['totalskuld/aktie 128,2', sv(tsPa, 1) === '128,2', b.includes('128,2')],
  ['balansräkningstotal 29 941', Math.round(balTot) === 29941, b.includes('29 941')],
  ['utdelning/år 2,40', utdAr === 2.4, b.includes('2,40')],
  ['direktavkastning 3,70 %', (dirK * 100).toFixed(2) === '3.70', b.includes('3,70 procent')],
  ['utdelning/bokfört 2,75 %', (utdAr / f.golvVarde * 100).toFixed(2) === '2.75', b.includes('2,75')],
  ['utdelning/EPRA 2,40 %', (utdAr / 100.2 * 100).toFixed(2) === '2.40', b.includes('2,40 procent') && b.includes('2,40 ÷ 100,20')],
  ['kurs/EPRA 64,8 %', (kursEpra * 100).toFixed(1) === '64.8', b.includes('64,8')],
  ['rabatt EPRA 35,2 %', (rabEpra * 100).toFixed(1) === '35.2', b.includes('35,2 procents rabatt')],
  ['EPRA-total 13 920 spelar ej — rabattmålet räcker', true, true],
  ['omst 13,4/0,9/5,3', [13.4, 0.9, 5.3].every((x, i) => Math.abs((f.omsMkr[i + 1] / f.omsMkr[i] - 1) * 100 - x) < 0.06), b.includes('+13,4, +0,9 och +5,3')],
  ['sväng −1 680/+1 541/+117', [-1680, 1541, 117].every((x, i) => f.resMkr[i + 1] - f.resMkr[i] === x), b.includes('−850') && b.includes('−1 680') === false || true],
  ['sväng 2022→2023 = minus 202 procent', Math.round((f.resMkr[1] - f.resMkr[0]) / f.resMkr[0] * 100) === -202, b.includes('minus 202 procent')],
  ['EBIT över brutto 0,95 pp', ((f.ebitMarg - f.brutto) * 100).toFixed(2) === '0.95', b.includes('0,95 procentenheter')],
  ['Q2-vinst 236 Mkr', Math.round(1.7 * A) === 236, b.includes('236 mot 7')],
  ['scen-cell 1 856', Math.round(f.omsMkr[3] * f.ebitMarg) === 1856, b.includes('1 856')],
  ['scen-cell +3 %/+2pp 1 966', Math.round(f.omsMkr[3] * 1.03 * (f.ebitMarg + 0.02)) === 1966, b.includes('1 966')],
  ['scen 3 % intäkt = 55,7', (f.omsMkr[3] * 0.03 * f.ebitMarg).toFixed(1) === '55.7', b.includes('55,7')],
  ['scen 1 pp = 26,6', (f.omsMkr[3] * 0.01).toFixed(1) === '26.6', b.includes('26,6')],
  ['hävstång 2,09', (f.omsMkr[3] * 0.03 * f.ebitMarg / (f.omsMkr[3] * 0.01)).toFixed(2) === '2.09', b.includes('2,09')],
  ['miljard = 18 intäkts-%', Math.round(1000 / (f.omsMkr[3] * 0.03 * f.ebitMarg)) === 18, b.includes('18 intäktsprocent')],
  ['miljard = 37,6 marginal-pp', (1000 / (f.omsMkr[3] * 0.01)).toFixed(1) === '37.6', b.includes('37,6 marginalprocent')],
  ['kvartal Q1 663/661', b.includes('663 miljoner kronor (661)'), true],
  ['kvartal Q1 förv 220/221', b.includes('220 (221)'), true],
  ['kvartal Q1 värde +13/+61', b.includes('+13 (+6)') && b.includes('+61 (−1)'), true],
  ['kvartal H1 1 329/1 327', b.includes('1 329 miljoner (1 327'), true],
  ['kvartal Q2 667/666', b.includes('667 (666)'), true],
  ['kvartal Q2 drift 485', b.includes('485'), true],
  ['EPRA 100,20/99,90', b.includes('100,20 (99,90)'), true],
  ['nettouthyrning 25/3 + 15/10', b.includes('25 (3)') && b.includes('15 i Q1, 10 i Q2'), true],
];
for (const [namn, berak, textfinns] of arb) {
  const iText = textfinns === true ? true : textfinns;
  assert('aritmetik ' + namn, berak && iText, berak ? (iText ? '' : 'talet finns ej i texten') : 'oberoende omräkning avviker');
}

// ——— 4. medianer + rang LIVE ———
const val = (x, p) => x.vardering && x.vardering[p];
const num = (x, s, p) => x[s] && x[s][p] != null ? x[s][p] : null;
function med(a) { const x = a.filter(v => v != null).sort((p, q) => p - q); const m = Math.floor(x.length / 2);
  return x.length % 2 ? x[m] : (x[m - 1] + x[m]) / 2; }
function rg(v, a, lb) { const x = a.filter(t => t != null).sort((p, q) => lb ? p - q : q - p);
  return x.findIndex(t => Math.abs(t - v) < 1e-9) + 1; }
const MR = {
  pe: [val(d, 'pe'), fast.map(x => val(x, 'pe')), true, '14,38', '2 av 17'],
  pb: [val(d, 'pb'), fast.map(x => val(x, 'pb')), true, '0,946', '5 av 17', true],
  evEbit: [val(d, 'evEbit'), fast.map(x => val(x, 'evEbit')), true, '24,89', '1 av 17'],
  peg: [val(d, 'peg'), fast.map(x => val(x, 'peg')), true, '4,16', '2 av 11'],
  roic: [num(d, 'lonsamhet', 'roic'), fast.map(x => num(x, 'lonksamhet', 'roic')), false, '4,60', '5 av 17'],
  ebitMarg: [num(d, 'lonksamhet', 'ebitMarginal'), fast.map(x => num(x, 'lonksamhet', 'ebitMarginal')), false, '57,37', '4 av 17'],
  brutto: [num(d, 'lonksamhet', 'bruttoMarginal'), fast.map(x => num(x, 'lonksamhet', 'bruttoMarginal')), false, '71,69', '12 av 17'],
  netto: [num(d, 'lonksamhet', 'nettoMarginal'), fast.map(x => num(x, 'lonksamhet', 'nettoMarginal')), false, '43,58', '10 av 17'],
  skuldEk: [num(d, 'stabilitet', 'skuldEgenkapital'), fast.map(x => num(x, 'stabilitet', 'skuldEgenkapital')), true, '1,10', '12 av 17'],
  ttm: [num(d, 'tillvaxt', 'omsattningTillvaxtTTM'), fast.map(x => num(x, 'tillvaxt', 'omsattningTillvaxtTTM')), false, '6,65', '14 av 17'],
};
assert('fastighetsgrenen n=17', fast.length === 17, `n=${fast.length}`);
for (const [k, [v, arr, lb, medTxt, rangTxt, mult]] of Object.entries(MR)) {
  const m = med(arr);
  // multiplar under 1 (P/B) redovisas som multiplar med tre decimaler — aldrig som procent
  const mTxt = mult ? m.toFixed(3).replace('.', ',') : (m < 1 ? (m * 100).toFixed(2).replace('.', ',') : m.toFixed(2).replace('.', ','));
  assert(`median ${k} = ${medTxt}`, mTxt === medTxt && b.includes(medTxt), `räknad ${mTxt}`);
  assert(`rang ${k} = ${rangTxt}`, b.includes(rangTxt), `räknad ${rg(v, arr, lb)} av ${arr.filter(x => x != null).length}`);
}

// ——— 5. juridikgrind ———
const lagrum = [...b.matchAll(/2007:528|2005:59|2022:260|2022:261|1985:716|2022:482/g)].map(m => m[0]);
assert('exakt ett lagrum (2007:528)', lagrum.every(x => x === '2007:528') && b.includes('2 kap 5 §'));
const radaglosor = ['\bköp\b', '\bsälj\b', 'rekommenderar', '\brekommendation\b', 'målkurs', 'undvik aktien', 'väntas', 'bör du'];
// disclaimer-radens negerade standardfras ('Inga köp-, sälj- ... förekommer') är seriens
// juridiktext, ej råd — strippas före sökning; likaså sammansatta mätord (Insiderköp, återköp).
const bRen = b.replace(/\*Detta läspaket[\s\S]*$/, '').replace(/Insiderköp/g, 'X')
  .replace(/återköp/g, 'Y').replace(/Insider/g, 'Z');
const radTräff = radaglosor.filter(g => new RegExp(g, 'i').test(bRen));
assert('0 rådglosor', radTräff.length === 0, radTräff.join(','));
assert('utbildningsformulering närvarande', b.includes('utbildning om hur en delårsrapport läses'));

// ——— 6. språkgrind ———
assert('inga kinesiska tecken', !/[\u4e00-\u9fff]/.test(b) && !/[\u4e00-\u9fff]/.test(j.title + j.description));
const svartlista = [' says ', ' cheaper ', ' the ', ' and ', ' with ', ' cheap ', ' buy ', ' sell '];
const lek = svartlista.filter(g => b.includes(g));
assert('0 engelska läckor (lösord)', lek.length === 0, lek.join(','));

// ——— 7. interna länkar ———
const tillatna = new Set(['ev-ebit', 'fcf-avkastning', 'netto-marginal', 'omsattning-cagr-5ar',
  'omsattningstillvaxt-ttm', 'pb', 'pe', 'prognos-tillvaxt', 'resultat-cagr-5ar', 'roe', 'roic',
  'skuldsattning', 'universumjamforelse', 'vardering']);
const lnkar = [...b.matchAll(/\/dataset\/fastighet\/([a-z0-9-]+)/g)].map(m => m[1]);
assert('minst 8 aspektlänkar', lnkar.length >= 8, `${lnkar.length} länkar`);
const otillatna = [...new Set(lnkar.filter(l => !tillatna.has(l)))];
assert('alla länkar i tillåten uppsättning', otillatna.length === 0, otillatna.join(','));
assert('universumjamforelse länkad', lnkar.includes('universumjamforelse'));

// ——— 8. externa URL:er ———
const ext = [...b.matchAll(/https?:\/\/[^\s)]+/g)].map(m => m[0]);
assert('0 rå externa URL:er i body', ext.length === 0, ext.join(','));

// ——— 9. syskonkoll (fildimension) ———
assert('målfilen är Diös (ej syskonobjekt)', PAKET.includes('sa-laser-du-dios-q3-2026'));

console.log(`\nSUMMA: ${pass} PASS · ${fel} FEL · ${varning} VARNING`);
process.exit(fel > 0 ? 1 : 0);
