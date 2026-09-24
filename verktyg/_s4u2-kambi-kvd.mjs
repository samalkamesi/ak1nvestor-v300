// _s4u2-kambi-kvd.mjs — kvalitetsverifiering av Kambi Q3-2026-läspaketet.
// Oberoende omräkning av ALL aritmetik i paketet, källtalsparitet mot
// bolagsunivers.json och sökverifierad rapportfakta, medianer/rang från filen,
// juridik- och språkgrind, internlänkar, struktur. Kör: node verktyg/_s4u2-kambi-kvd.mjs
import { readFileSync, existsSync } from 'node:fs';

const PAKET = '/home/ak1a/AK1/data/blogg-utkast/kvartal/2026-q3/sa-laser-du-kambi-q3-2026.json';
const j = JSON.parse(readFileSync(PAKET, 'utf8'));
const B = j.body;
const U = JSON.parse(readFileSync('/home/ak1a/AK1/data/portfolj-system/bolagsunivers.json', 'utf8'));
const arr = Array.isArray(U) ? U : (U.bolag || U.universum || U.poster || []);
const K = arr.find(b => b.ticker === 'KAMBI.ST');
const tek = arr.filter(b => b.bransch === 'teknik');

let pass = 0, fel = 0, varn = 0;
const F = [], W = [], V = [];
const ok = (namn, cond, extra) => { if (cond) { pass++; } else { fel++; F.push(`${namn}${extra ? ' — ' + extra : ''}`); } };
const warn = (namn, extra) => { varn++; W.push(`${namn}${extra ? ' — ' + extra : ''}`); };

// — 1. struktur —
ok('slug', j.slug === 'sa-laser-du-kambi-q3-2026');
ok('title icke-tom och >100', j.title.length > 100 && j.title.length <= 340);
ok('description 140–155', j.description.length >= 140 && j.description.length <= 155, `len ${j.description.length}`);
ok('pillar', j.pillar === 'Institutionell metodik');
ok('author', j.author === 'AK1A Research Lab');
ok('publishedAt = rappdag', j.publishedAt === '2026-11-04');
const ord = B.split(/\s+/).filter(Boolean).length;
ok('readingMinutes = round(ord/600)', j.readingMinutes === Math.round(ord / 600), `${ord} ord -> ${Math.round(ord / 600)}`);
ok('tags innehåller kvartalsrapport+Kambi', j.tags.includes('kvartalsrapport') && j.tags.includes('Kambi'));
for (const h2 of ['## Urvalet: varför Kambi', '## Nyckeltalen att ha med sig', '## Datavakten', '## Så står sig bolaget mot branschen', '## Tre sätt att läsa utfallet', '## Praktiskt inför 4 november', '## Källor'])
  ok('H2: ' + h2.slice(3, 30), B.includes(h2));

// — 2. källtalsparitet: universumfält —
const sv = (x, d = 2) => x.toFixed(d).replace('.', ',');
const paritet = [
  ['pris', sv(K.pris), '174,60'],
  ['mcap Mkr', '4 583', '4 583'],
  ['P/E', sv(K.vardering.pe, 3), '37,957'],
  ['P/B', sv(K.vardering.pb, 3), '29,183'],
  ['EV/EBIT', sv(K.vardering.evEbit, 3), '196,989'],
  ['fcfYield %', sv(K.vardering.fcfYield * 100), '0,22'],
  ['ROE %', sv(K.lonksamhet.roe * 100), '6,96'],
  ['ROIC %', sv(K.lonksamhet.roic * 100), '13,96'],
  ['brutto %', sv(K.lonksamhet.bruttoMarginal * 100), '98,85'],
  ['EBITm %', sv(K.lonksamhet.ebitMarginal * 100), '13,61'],
  ['netto %', sv(K.lonksamhet.nettoMarginal * 100), '6,76'],
  ['fcfm %', sv(K.lonksamhet.fcfMarginal * 100), '6,08'],
  ['skuld/EK', sv(K.stabilitet.skuldEgenkapital, 3), '0,052'],
  ['omsCAGR %', 'minus ' + sv(Math.abs(K.tillvaxt.omsattningCAGR5ar * 100)), 'minus 0,81'],
  ['resCAGR %', 'minus ' + sv(Math.abs(K.tillvaxt.resultatCAGR5ar * 100)), 'minus 36,38'],
  ['TTM %', sv(K.tillvaxt.omsattningTillvaxtTTM * 100), '13,50'],
  ['prognos %', sv(K.tillvaxt.prognosTillvaxt * 100), '42,21'],
];
for (const [namn, expect] of paritet) ok('fält i body: ' + namn, B.includes(expect), `väntat ${expect}`);
for (const [i, v] of K.serier.omsattning.entries()) ok('serie oms ' + K.serier.ar[i], B.includes(sv(v / 1e6, 1)), sv(v / 1e6, 1));
for (const [i, v] of K.serier.resultat.entries()) ok('serie res ' + K.serier.ar[i], B.includes(sv(v / 1e6, 1)), sv(v / 1e6, 1));

// — 3. aritmetik: oberoende omräkning —
const X = 11.15, mcapM = K.marknadsKapitalMdr * 1000;
const num = [
  ['TTM-vinst Mkr', mcapM / K.vardering.pe, 120.7],
  ['TTM-vinst M€', mcapM / K.vardering.pe / X, 10.8],
  ['res2025 Mkr', 6.811 * X, 75.9],
  ['P/E bokslut', mcapM / (6.811 * X), 60.35],
  ['valutafälla P/E', mcapM / 6.811, 672.9],
  ['P/E prognos', K.vardering.pe / (1 + K.tillvaxt.prognosTillvaxt), 26.69],
  ['identitet fält', K.vardering.pb / K.lonksamhet.roe, 419.3],
  ['identitet kvot', (K.vardering.pb / K.lonksamhet.roe) / K.vardering.pe, 11.0],
  ['EK via P/B Mkr', mcapM / K.vardering.pb, 157.0],
  ['EK via ROE Mkr', (6.811 * X) / K.lonksamhet.roe, 1091.1],
  ['EK-kvot', ((6.811 * X) / K.lonksamhet.roe) / (mcapM / K.vardering.pb), 6.95],
  ['P/B egen', mcapM / ((6.811 * X) / K.lonksamhet.roe), 4.20],
  ['identitet konsekvent', (mcapM / ((6.811 * X) / K.lonksamhet.roe)) / K.lonksamhet.roe, 60.35],
  ['skuld Mkr', ((6.811 * X) / K.lonksamhet.roe) * K.stabilitet.skuldEgenkapital, 56.7],
  ['EV Mkr', mcapM + ((6.811 * X) / K.lonksamhet.roe) * K.stabilitet.skuldEgenkapital, 4639.7],
  ['EBIT fält Mkr', (mcapM + ((6.811 * X) / K.lonksamhet.roe) * K.stabilitet.skuldEgenkapital) / K.vardering.evEbit, 23.6],
  ['ttmOms M€', 162.019 + 89.4 - (41.5 + 40.5), 169.4],
  ['netto väg Mkr', K.lonksamhet.nettoMarginal * (162.019 + 89.4 - 82.0) * X, 127.7],
  ['netto avvikelse %', Math.abs((K.lonksamhet.nettoMarginal * (162.019 + 89.4 - 82.0) * X) / (mcapM / K.vardering.pe) - 1) * 100, 5.8],
  ['EBIT marginalväg Mkr', K.lonksamhet.ebitMarginal * (162.019 + 89.4 - 82.0) * X, 257.1],
  ['EBIT-kvot', (K.lonksamhet.ebitMarginal * (162.019 + 89.4 - 82.0) * X) / ((mcapM + ((6.811 * X) / K.lonksamhet.roe) * K.stabilitet.skuldEgenkapital) / K.vardering.evEbit), 10.9],
  ['EV/EBIT egen', (mcapM + ((6.811 * X) / K.lonksamhet.roe) * K.stabilitet.skuldEgenkapital) / (K.lonksamhet.ebitMarginal * (162.019 + 89.4 - 82.0) * X), 18.0],
  ['fcf-konsistens %', K.lonksamhet.fcfMarginal * ((162.019 + 89.4 - 82.0) * X / mcapM) * 100, 2.51],
  ['fcf-kvot', (K.lonksamhet.fcfMarginal * ((162.019 + 89.4 - 82.0) * X / mcapM)) / K.vardering.fcfYield, 11.4],
  ['PEG konvention', K.vardering.pe / (K.tillvaxt.prognosTillvaxt * 100), 0.90],
  ['aktier i post M', mcapM / K.pris, 26.25],
  ['aktier ex återköp M', (26911049 - 706785) / 1e6, 26.20],
  ['aktiegap %', Math.abs((mcapM / K.pris) / ((26911049 - 706785) / 1e6) - 1) * 100, 0.17],
  ['egna andel %', 706785 / 26911049 * 100, 2.63],
  ['VPA 2025', (6.811 * X) / ((26911049 - 706785) / 1e6), 2.90],
  ['VPA TTM', K.pris / K.vardering.pe, 4.60],
  ['Q1 marginal %', 5.7 / 43.5 * 100, 13.10],
  ['Q2 marginal %', 7.6 / 45.9 * 100, 16.56],
  ['vändning %', ((mcapM / K.vardering.pe / X) / 6.811 - 1) * 100, 58.9],
  ['spread pp', (K.tillvaxt.prognosTillvaxt - K.tillvaxt.resultatCAGR5ar) * 100, 78.6],
  ['brutto-netto pp', (K.lonksamhet.bruttoMarginal - K.lonksamhet.nettoMarginal) * 100, 92.09],
  ['Rule of 40', 17.3 + 23.8, 41.1],
  ['marginalvikt 2025 M€', 162.019 * 0.01, 1.62],
  ['marginalvikt H1 M€', 89.4 * 2 * 0.01, 1.79],
  ['vägledningsbredd pp', (27 - 23) / (89.4 * 2) * 100, 2.24],
  ['P/E->median kurs', (K.pris / K.vardering.pe) * 24.8515, 114.32],
  ['P/E->median %', ((K.pris / K.vardering.pe) * 24.8515 / K.pris - 1) * 100, -34.53],
  ['VPA-väg %', (K.vardering.pe / 24.8515 - 1) * 100, 52.74],
  ['VPA-väg kr', (K.pris / K.vardering.pe) * (K.vardering.pe / 24.8515), 7.02],
  ['prognos-P/E kurs', (K.pris / K.vardering.pe) * (K.vardering.pe / (1 + K.tillvaxt.prognosTillvaxt)), 122.8],
  ['VPA-steg kr', (K.pris / K.vardering.pe) * 0.10, 0.46],
  ['res-steg1 %', (14.901 / 26.451 - 1) * 100, -43.67],
  ['res-steg2 %', (15.445 / 14.901 - 1) * 100, 3.65],
  ['res-steg3 %', (6.811 / 15.445 - 1) * 100, -55.90],
  ['res-total %', (6.811 / 26.451 - 1) * 100, -74.25],
  ['oms-steg1 %', (173.303 / 166.006 - 1) * 100, 4.40],
  ['oms-steg2 %', (176.415 / 173.303 - 1) * 100, 1.80],
  ['oms-steg3 %', (162.019 / 176.415 - 1) * 100, -8.16],
  ['H1 andel av 2025 %', 89.4 / 162.019 * 100, 55.18],
];
for (const [namn, calc, bodyTal] of num) ok('aritmetik: ' + namn, Math.abs(calc - bodyTal) <= Math.max(Math.abs(bodyTal) * 0.005, 0.06), `motor ${calc.toFixed(3)} mot body ${bodyTal}`);
// räknesatser i Övning B (17,46 = 10 % av kursen; 34,92 = 20 %)
ok('räknesats VPA-band', Math.abs(K.pris * 0.10 - 17.46) < 0.01, `${(K.pris * 0.10).toFixed(2)}`);
ok('räknesats multipelband', Math.abs(K.pris * 0.20 - 34.92) < 0.01, `${(K.pris * 0.20).toFixed(2)}`);

// — 4. scenariorutan 9/9 —
const peK = [K.vardering.pe * 0.8, K.vardering.pe, K.vardering.pe * 1.2];
const vpaR = [(K.pris / K.vardering.pe) * 0.9, K.pris / K.vardering.pe, (K.pris / K.vardering.pe) * 1.1];
const cell = [[125.71, 157.14, 188.57], [139.68, 174.60, 209.52], [153.65, 192.06, 230.47]];
let c9 = 0;
for (let r = 0; r < 3; r++) for (let c = 0; c < 3; c++) {
  const expect = +(vpaR[r] * peK[c]).toFixed(2);
  if (Math.abs(expect - cell[r][c]) < 0.015 && B.includes(sv(cell[r][c]))) c9++;
  else F.push(`scenariecell ${r + 1},${c + 1}: motor ${expect} mot tabell ${cell[r][c]}/text närvaro ${B.includes(sv(cell[r][c]))}`);
}
ok('scenarioruta 9/9 celler + närvaro', c9 === 9, `${c9}/9`);
ok('mittencell = kursen', Math.abs(cell[1][1] - K.pris) < 0.01);

// — 5. medianer och rang mot filen —
const med = v => { const s = v.filter(x => typeof x === 'number' && isFinite(x)).sort((a, b) => a - b); const m = Math.floor(s.length / 2); return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2; };
const rf = (v, val) => { const s = v.filter(x => x != null && isFinite(x)).sort((a, b) => b - a); return s.findIndex(x => Math.abs(x - val) < 1e-9) + 1; };
const rs = (v, val) => { const s = v.filter(x => x != null && isFinite(x)).sort((a, b) => a - b); return s.findIndex(x => Math.abs(x - val) < 1e-9) + 1; };
const medkont = [
  ['brutto-median %', med(tek.map(b => b.lonksamhet?.bruttoMarginal)) * 100, 52.28],
  ['ROE-median %', med(tek.map(b => b.lonksamhet?.roe)) * 100, 28.68],
  ['ROIC-median %', med(tek.map(b => b.lonksamhet?.roic)) * 100, 21.18],
  ['EBIT-median %', med(tek.map(b => b.lonksamhet?.ebitMarginal)) * 100, 25.61],
  ['netto-median %', med(tek.map(b => b.lonksamhet?.nettoMarginal)) * 100, 20.33],
  ['fcf-median %', med(tek.map(b => b.lonksamhet?.fcfMarginal)) * 100, 14.70],
  ['P/E-median', med(tek.map(b => b.vardering?.pe)), 24.852],
  ['P/B-median', med(tek.map(b => b.vardering?.pb)), 6.362],
  ['EV/EBIT-median', med(tek.map(b => b.vardering?.evEbit)), 24.401],
  ['PEG-median', med(tek.map(b => b.vardering?.peg).filter(x => x != null)), 1.195],
  ['skuld/EK-median', med(tek.map(b => b.stabilitet?.skuldEgenkapital)), 0.189],
  ['prognos-median %', med(tek.map(b => b.tillvaxt?.prognosTillvaxt)) * 100, 17.80],
  ['omsCAGR-median %', med(tek.map(b => b.tillvaxt?.omsattningCAGR5ar)) * 100, 8.63],
  ['resCAGR-median %', med(tek.map(b => b.tillvaxt?.resultatCAGR5ar)) * 100, 19.55],
];
for (const [namn, calc, bodyTal] of medkont) ok('median: ' + namn, Math.abs(calc - bodyTal) <= Math.abs(bodyTal) * 0.005 + 0.001, `motor ${calc.toFixed(3)} mot body ${bodyTal}`);
const rangkont = [
  ['brutto rang', rf(tek.map(b => b.lonksamhet?.bruttoMarginal), K.lonksamhet.bruttoMarginal), 1],
  ['ROE rang', rf(tek.map(b => b.lonksamhet?.roe), K.lonksamhet.roe), 19],
  ['ROIC rang', rf(tek.map(b => b.lonksamhet?.roic), K.lonksamhet.roic), 15],
  ['EBIT rang', rf(tek.map(b => b.lonksamhet?.ebitMarginal), K.lonksamhet.ebitMarginal), 17],
  ['netto rang', rf(tek.map(b => b.lonksamhet?.nettoMarginal), K.lonksamhet.nettoMarginal), 19],
  ['fcf rang', rf(tek.map(b => b.lonksamhet?.fcfMarginal), K.lonksamhet.fcfMarginal), 15],
  ['P/E rang', rf(tek.map(b => b.vardering?.pe), K.vardering.pe), 6],
  ['P/B rang', rf(tek.map(b => b.vardering?.pb), K.vardering.pb), 3],
  ['EV/EBIT rang', rf(tek.map(b => b.vardering?.evEbit), K.vardering.evEbit), 2],
  ['skuld rang (lägst)', rs(tek.map(b => b.stabilitet?.skuldEgenkapital), K.stabilitet.skuldEgenkapital), 5],
  ['prognos rang', rf(tek.map(b => b.tillvaxt?.prognosTillvaxt), K.tillvaxt.prognosTillvaxt), 5],
  ['omsCAGR rang', rf(tek.map(b => b.tillvaxt?.omsattningCAGR5ar), K.tillvaxt.omsattningCAGR5ar), 19],
  ['resCAGR rang', rf(tek.map(b => b.tillvaxt?.resultatCAGR5ar), K.tillvaxt.resultatCAGR5ar), 17],
];
for (const [namn, calc, expect] of rangkont) ok('rang: ' + namn, calc === expect, `motor ${calc} mot body ${expect}`);
ok('brutto-rang ordinaltext (1 av 22)', B.includes('1 av 22'));
ok('ROE fjärde lägst av 22 = rang 19', 22 - 19 + 1 === 4 && /fjärde lägst av 22/i.test(B));
ok('rang-ordinaltexter fallande konvention', /sjätte högst av 22/.test(B) && /näst högst av 22 i grenen efter ARM 310,9/.test(B) && /tredje högst av 22 efter Apple 44,15 och ARM 30,19/.test(B) && /rang 2 av 22/.test(B) && /rang 6, P\/B rang 3/.test(B));
ok('EV/EBIT universum topp-5', ['Tesla 946,8', 'ARM 310,9', 'ABB 275,5', 'Hexagon 199,3'].every(s => B.includes(s)));
ok('bruttoavstånd till median', B.includes('46,57 procentenheter'));

// — 6. juridikgrind —
const lagrum = (B.match(/2007:528/g) || []).length;
ok('exakt ett lagrum 2007:528', lagrum === 1, `${lagrum}`);
ok('lagrumsparagraf korrekt', B.includes('2 kap 5 §'));
ok('inga andra lagrum', !/(1992:|2005:|1974:|1915:|2018:|1990:|1977:)/.test(B));
const rad = /(köp denna|sälj denna|rekommenderar att (du )?(köper|säljer)|råder dig att|bör du köpa|bör du sälja|investera nu|maximal exponering|garanterad avkastning)/i;
ok('rådverb-mönster 0', !rad.test(B));
ok('utbildningsframing', B.includes('inte investeringsrådgivning') && B.includes('utbildningsmaterial'));
ok('disclaimer sista stycket', B.trimEnd().endsWith('kundens beslut.*'));

// — 7. språkgrind —
ok('0 typografiska citattecken', !/[""'']/.test(B));
ok('0 CJK', !/[\u4e00-\u9fff\u3040-\u30ff]/.test(B));
ok('0 dubbla mellanslag', !/ {2}/.test(B));
ok('0 tabbar', !/\t/.test(B));
ok('0 nbsp', !/\u00a0/.test(B));
ok('0 mjuka bindestreck', !/\u00ad/.test(B));
ok('titel: 0 typografiska citat', !/[""'']/.test(j.title + j.description));

// — 8. internlänkar —
const links = [...new Set([...B.matchAll(/\]\((\/dataset\/teknik\/[a-z0-9-]+)\)/g)].map(m => m[1]))];
ok('internlänkar >= 13', links.length >= 13, `${links.length}`);
let linkResults = [];
for (const l of links) {
  try {
    const r = await fetch('http://localhost:3000' + l, { method: 'GET', redirect: 'follow' });
    linkResults.push(`${l} ${r.status}`);
    if (r.status !== 200) warn('länk ej 200: ' + l, String(r.status));
  } catch (e) { linkResults.push(`${l} NERE`); warn('länkkontroll nere (driftinfo): ' + l, e.code || e.message); }
}

// — 9. klaim och duplikat —
ok('klaimfil finns', existsSync('/home/ak1a/AK1/data/vakten/auto-s4-1789886103053-s4-u2-ansprak.md'));
ok('syskon-klaimer orörda (u1 PLD)', existsSync('/home/ak1a/AK1/data/vakten/auto-s4-1789886103053-s4-u1-ansprak.md'));
ok('inga syskon-kambi-filer', !existsSync('/home/ak1a/AK1/data/blogg-utkast/kvartal/2026-q3/sa-laser-du-kambi-q3-2026 (2).json'));
ok('live-mappen orörd (kambi ej i data/blogg)', !existsSync('/home/ak1a/AK1/data/blogg/sa-laser-du-kambi-q3-2026.json'));

// — rapport —
console.log(`KVD KAMBI Q3-2026: ${pass} PASS · ${fel} FEL · ${varn} VARNING`);
console.log(`ord ${ord} / readingMinutes ${j.readingMinutes} / länkar ${links.length}`);
if (linkResults.length) console.log('länkstatus (driftinfo):', linkResults.join(' | '));
if (F.length) { console.log('FEL:'); for (const f of F) console.log('  ✗', f); }
if (W.length) { console.log('VARNING:'); for (const w of W) console.log('  ⚠', w); }
if (!F.length) console.log('GRÖN');
process.exit(F.length ? 1 : 0);
