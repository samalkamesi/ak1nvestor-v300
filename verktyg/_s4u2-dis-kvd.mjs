// _s4u2-dis-kvd.mjs — KVD för DIS Q3-2026-läspaketet. Oberoende omräkning av ALLA tal i texten
// mot universumet + sökverifierad rapportkedja. --http kör internlänkskontroll mot localhost:3000.
import { readFileSync } from 'node:fs';

const P = JSON.parse(readFileSync('/home/ak1a/AK1/data/blogg-utkast/kvartal/2026-q3/sa-laser-du-disney-q3-2026.json', 'utf8'));
const U = JSON.parse(readFileSync('/home/ak1a/AK1/data/portfolj-system/bolagsunivers.json', 'utf8'));
const M = U.find(x => x.ticker === 'DIS');
const GREN = U.filter(x => x.bransch === 'kommunikation');
const B = P.body;
const HTTP = process.argv.includes('--http');
let pass = 0, fel = 0, varn = 0;
const ok = (namn, villkor, extra = '') => { if (villkor) { pass++; } else { fel++; console.log('FEL:', namn, extra); } };
const warn = (namn) => { varn++; console.log('VARNING:', namn); };
const avr = (x, n = 2) => Math.round(x * 10 ** n) / 10 ** n;
const med = arr => { const v = arr.filter(Number.isFinite).sort((a, b) => a - b); const m = Math.floor(v.length / 2); return v.length % 2 ? v[m] : (v[m - 1] + v[m]) / 2; };

// — struktur —
ok('slug', P.slug === 'sa-laser-du-disney-q3-2026');
ok('pillar', P.pillar === 'Institutionell metodik');
ok('author', P.author === 'AK1A Research Lab');
ok('publishedAt', P.publishedAt === '2026-11-12');
ok('tags 6', Array.isArray(P.tags) && P.tags.length === 6 && P.tags.includes('Disney') && P.tags.includes('kvartalsrapport'));
ok('readingMinutes', P.readingMinutes === 6);
const h2 = (B.match(/^## /gm) || []).length;
ok('H2-struktur 8', h2 === 8, `fann ${h2}`);
for (const ord of ['Urvalet', 'Nyckeltalen', 'Källkritiken', 'Kvartalskedjan', 'branschen', 'övningar', 'Praktiskt', 'Källor']) ok('H2-ord ' + ord, B.includes(ord));
ok('disclaimer sista', B.trimEnd().endsWith('Publicering av utkastet är kundens beslut (R2).'));
ok('utbildningsrad', B.includes('inte en rekommendation att köpa, sälja eller behålla'));
const lagrum = (B.match(/2007:528/g) || []).length;
ok('exakt ett lagrum', lagrum === 1, `fann ${lagrum}`);
ok('endast rätt paragraf', (B.match(/2 kap/g) || []).length === 1);
ok('inga andra lagrum', !/1992:|1991:|2005:59|2022:260|2022:261|2022:482|4 kap|5 kap|1985:716/.test(B));
ok('inga rådord', !/köp denna|sälj denna|vi rekommenderar|vårt råd|du bör köpa|undvik att köpa|målkurs|väntas stiga|väntas falla/.test(B));
ok('kinesiska läckor', !/[\u4e00-\u9fff]/.test(B));

// — fälttalsparitet: tvångstal ur universumraden ska finnas i texten —
const tvang = [
  ['pris', '107,98'], ['mcap', '186,4'], ['pe', '21,90'], ['pe-raw', '21,903'], ['pb', '1,698'],
  ['evEbit', '12,27'], ['evEbit-raw', '12,269'], ['peg', '2,63'], ['fcfYield', '2,61'],
  ['roe', '8,01'], ['roic', '12,24'], ['brutto', '37,60'], ['ebit', '19,30'], ['netto', '8,70'],
  ['fcfMarg', '4,92'], ['skuldEk', '0,394'], ['omsCagr', '4,51'], ['resCagr', '58,0'],
  ['ttm', '6,8 procent'], ['prognos', '8,2'], ['insider', ' 30 '],
  ['serOms0', '82,722'], ['serOms3', '94,425'], ['serRes1', '2,354'], ['serRes3', '12,404'],
];
for (const [namn, str] of tvang) ok('fält i text: ' + namn, B.includes(str));
// fältens parametrar stämmer mot universumraden (oberoende)
ok('F.pris', M.pris === 107.98); ok('F.mcap', M.marknadsKapitalMdr === 186.448);
ok('F.pe', M.vardering.pe === 21.903); ok('F.pb', M.vardering.pb === 1.698);
ok('F.evEbit', M.vardering.evEbit === 12.269); ok('F.peg', M.vardering.peg === 2.63);
ok('F.fcfYield', M.vardering.fcfYield === 0.0261); ok('F.roe', M.lonksamhet.roe === 0.0801);
ok('F.roic', M.lonksamhet.roic === 0.1224); ok('F.brutto', M.lonksamhet.bruttoMarginal === 0.376);
ok('F.ebit', M.lonksamhet.ebitMarginal === 0.193); ok('F.netto', M.lonksamhet.nettoMarginal === 0.087);
ok('F.fcfMarg', M.lonksamhet.fcfMarginal === 0.0492); ok('F.skuldEk', M.stabilitet.skuldEgenkapital === 0.394);
ok('F.ttm', M.tillvaxt.omsattningTillvaxtTTM === 0.068); ok('F.prognos', M.tillvaxt.prognosTillvaxt === 0.082);
ok('F.insider', M.aterkop.insiderkopSenaste6man === 30);
ok('F.serOms', JSON.stringify(M.serier.omsattning) === JSON.stringify([82722000000, 88898000000, 91361000000, 94425000000]));
ok('F.serRes', JSON.stringify(M.serier.resultat) === JSON.stringify([3145000000, 2354000000, 4972000000, 12404000000]));

// — aritmetikmotor: oberoende omräkning av textens härledda tal —
const A = {};
A.aktieAntal = M.marknadsKapitalMdr / M.pris;
A.epsFalt = M.pris / M.vardering.pe;
A.epsGaap = 0.73 + 1.34 + 1.27 + 1.52;
A.epsJust = 1.11 + 1.63 + 1.57 + 2.06;
A.nettoFalt = M.marknadsKapitalMdr / M.vardering.pe;
A.nettoGaap = A.epsGaap * A.aktieAntal;
A.ttmMot2025 = (A.nettoGaap / 12.404 - 1) * 100;
A.peGaap = M.pris / A.epsGaap;
A.peJust = M.pris / A.epsJust;
A.pegKonv = M.vardering.pe / (M.tillvaxt.prognosTillvaxt * 100);
A.pegImplicit = M.vardering.pe / M.vardering.peg;
A.resFyraGgr = 12.404 / 2.354;
A.omsFyraAr = (94425000000 / 82722000000 - 1) * 100;
A.serOmsCagr = ((94425000000 / 82722000000) ** (1 / 3) - 1) * 100;
A.serResCagr = ((12404000000 / 3145000000) ** (1 / 3) - 1) * 100;
A.omsTtm = 22.46 + 25.981 + 25.17 + 25.25;
A.omsTtmPy = 22.574 + 24.69 + 23.621 + 23.646;
A.omsTtmVaxt = (A.omsTtm / A.omsTtmPy - 1) * 100;
A.nettoOmsKvot = 8.70 / 4.92;
A.ekPb = 186.448 / 1.698;
A.ekRoe = A.nettoFalt / 0.0801;
A.ebitTtm = A.nettoFalt * 0.193 / 0.087;
A.ev = 12.269 * A.ebitTtm;
A.evKvot = A.ev / 186.448;
A.nottoskuldPekare = A.ev - 186.448;
A.skuldUrKvot = A.ekPb * 0.394;
A.fy26Guide = 5.93 * 1.16;
A.q4Implicit = A.fy26Guide - (1.63 + 1.57 + 2.06);
A.q4Vaxt = (A.q4Implicit / 1.11 - 1) * 100;
A.dtcVaxt = (0.582 / 0.352 - 1) * 100;
A.veckaExtra = (14 / 13 - 1) * 100;
A.fcfTtm = A.omsTtm * 0.0492;
A.fcfMotMal = A.fcfTtm / 8 * 100;
// scenarieceller
const basOms = 94.425, basM = 19.30;
const cell = (dv, dm) => avr(basOms * (1 + dv) * (basM + dm) / 100, 2);
A.cell00 = cell(0, 0); A.cellpp = cell(0, 1); A.cellnp = cell(0, -1);
A.cellpp3 = cell(0.03, 1); A.cellnp3 = cell(0.03, -1); A.cell0n3 = cell(0.03, 0);
A.cellnpm3 = cell(-0.03, -1); A.cellpm3 = cell(-0.03, 1); A.cell0m3 = cell(-0.03, 0);
A.enhetMarginal = basOms * 0.01;
A.enhetVolym = basOms * 0.01 * basM / 100;
A.margVager = A.enhetMarginal / A.enhetVolym;

const kontroller = [
  ['aktieAntal 1,727', Math.abs(A.aktieAntal - 1.727) < 0.005],
  ['epsFalt 4,93', Math.abs(A.epsFalt - 4.93) < 0.005],
  ['epsGaap 4,86', Math.abs(A.epsGaap - 4.86) < 0.005],
  ['epsJust 6,37', Math.abs(A.epsJust - 6.37) < 0.005],
  ['gap 1,51', Math.abs((A.epsJust - A.epsGaap) - 1.51) < 0.005],
  ['gap andel 23,7', Math.abs((A.epsJust - A.epsGaap) / A.epsJust * 100 - 23.7) < 0.1],
  ['nettoFalt 8,51', Math.abs(A.nettoFalt - 8.51) < 0.01],
  ['nettoGaap 8,39', Math.abs(A.nettoGaap - 8.39) < 0.01],
  ['ttmMot2025 −32,4', Math.abs(A.ttmMot2025 + 32.4) < 0.15],
  ['peGaap 22,22', Math.abs(A.peGaap - 22.22) < 0.01],
  ['peJust 16,95', Math.abs(A.peJust - 16.95) < 0.01],
  ['pegKonv 2,67', Math.abs(A.pegKonv - 2.67) < 0.005],
  ['pegKvot 0,985', Math.abs(M.vardering.peg / A.pegKonv - 0.985) < 0.002],
  ['pegImplicit 8,33', Math.abs(A.pegImplicit - 8.33) < 0.01],
  ['resFyraGgr 5,27', Math.abs(A.resFyraGgr - 5.27) < 0.01],
  ['omsFyraAr 14,1', Math.abs(A.omsFyraAr - 14.1) < 0.1],
  ['serOmsCagr 4,51', Math.abs(A.serOmsCagr - 4.51) < 0.01],
  ['serResCagr 58,0', Math.abs(A.serResCagr - 58.0) < 0.1],
  ['omsTtm 98,86', Math.abs(A.omsTtm - 98.86) < 0.005],
  ['omsTtmVaxt +4,6', Math.abs(A.omsTtmVaxt - 4.6) < 0.1],
  ['nettoOmsKvot 1,77', Math.abs(A.nettoOmsKvot - 1.77) < 0.01],
  ['ekPb 109,8', Math.abs(A.ekPb - 109.8) < 0.1],
  ['ekRoe 106,2', Math.abs(A.ekRoe - 106.2) < 0.1],
  ['ebitTtm 18,88', Math.abs(A.ebitTtm - 18.88) < 0.01],
  ['ev 232', Math.abs(A.ev - 232) < 1],
  ['evKvot 1,24', Math.abs(A.evKvot - 1.24) < 0.01],
  ['nottoskuldPekare 46', Math.abs(A.nottoskuldPekare - 46) < 1],
  ['skuldUrKvot 43', Math.abs(A.skuldUrKvot - 43) < 1],
  ['fy26Guide 6,88', Math.abs(A.fy26Guide - 6.88) < 0.005],
  ['q4Implicit 1,62', Math.abs(A.q4Implicit - 1.62) < 0.005],
  ['q4Vaxt 45,9', Math.abs(A.q4Vaxt - 45.9) < 0.1],
  ['dtcVaxt +65', Math.abs(A.dtcVaxt - 65.3) < 0.5],
  ['veckaExtra +7,7', Math.abs(A.veckaExtra - 7.7) < 0.1],
  ['fcfTtm 4,9', Math.abs(A.fcfTtm - 4.86) < 0.05],
  ['cell 0/0 18,22', Math.abs(A.cell00 - 18.22) < 0.005],
  ['cell 0/+1 19,17', Math.abs(A.cellpp - 19.17) < 0.005],
  ['cell 0/−1 17,28', Math.abs(A.cellnp - 17.28) < 0.005],
  ['cell +3/+1 19,74', Math.abs(A.cellpp3 - 19.74) < 0.005],
  ['cell +3/−1 17,80', Math.abs(A.cellnp3 - 17.80) < 0.005],
  ['cell +3/0 18,77', Math.abs(A.cell0n3 - 18.77) < 0.005],
  ['cell −3/−1 16,76', Math.abs(A.cellnpm3 - 16.76) < 0.005],
  ['cell −3/+1 18,59', Math.abs(A.cellpm3 - 18.59) < 0.005],
  ['cell −3/0 17,68', Math.abs(A.cell0m3 - 17.68) < 0.005],
  ['enhetMarginal 0,944', Math.abs(A.enhetMarginal - 0.944) < 0.001],
  ['enhetVolym 0,182', Math.abs(A.enhetVolym - 0.182) < 0.001],
  ['margVager 5,2', Math.abs(A.margVager - 5.18) < 0.05],
];
for (const [namn, villkor] of kontroller) ok('aritmetik: ' + namn, villkor);

// — härledda tal som måste finnas I TEXTEN —
const iText = ['4,93', '4,86', '6,37', '22,22', '16,95', '2,67', '0,985', '8,33', '5,27', '14,1', '98,86', '94,53', '4,6', '1,77', '109,8', '106,2', '18,88', '232', '46', '43', '6,88', '1,62', '45,9', '5,26', '0,352', '0,450', '0,582', '7,7', '0,944', '0,182', '5,2', '32,4', '18,22', '1,727', '1,51', '23,7', '12,404', '8,39', '8,51'];
for (const t of iText) ok('text innehåller ' + t, B.includes(t));

// — grenmedianer + rang LIVE (oberoende omräkning) —
const val = (o, p) => p.split('.').reduce((x, k) => (x == null ? undefined : x[k]), o);
const kont = [
  ['pe', 'vardering.pe', 16.20, false, 'sjätte högsta av 21'],
  ['pb', 'vardering.pb', 2.27, false, 'åttonde lägsta av 23'],
  ['evEbit', 'vardering.evEbit', 14.50, false, 'sjätte lägsta av 23'],
  ['peg', 'vardering.peg', 1.49, false, 'femte högsta av 17'],
  ['fcfYield', 'vardering.fcfYield', 7.37, true, 'femte lägsta av 23'],
  ['roe', 'lonksamhet.roe', 16.30, true, 'fjärde lägsta av 23'],
  ['roic', 'lonksamhet.roic', 10.74, true, 'åttonde högsta av 23'],
  ['brutto', 'lonksamhet.bruttoMarginal', 47.81, true, null],
  ['ebit', 'lonksamhet.ebitMarginal', 18.10, true, null],
  ['netto', 'lonksamhet.nettoMarginal', 11.45, true, null],
  ['fcfMarg', 'lonksamhet.fcfMarginal', 12.58, true, 'tredje lägsta av 22'],
  ['skuldEk', 'stabilitet.skuldEgenkapital', 1.28, false, 'femte lägsta av 23'],
  ['omsCagr', 'tillvaxt.omsattningCAGR5ar', 3.32, true, null],
  ['resCagr', 'tillvaxt.resultatCAGR5ar', 3.78, true, 'näst högst av 16'],
  ['ttm', 'tillvaxt.omsattningTillvaxtTTM', 4.60, true, null],
  ['prognos', 'tillvaxt.prognosTillvaxt', 8.89, true, null],
];
for (const [namn, path, expMed, pct, rangTxt] of kont) {
  const m = med(GREN.map(b => val(b, path)));
  const mVis = pct ? m * 100 : m;
  ok('grenmedian ' + namn + ' ' + expMed, Math.abs(mVis - expMed) < 0.015, `fick ${avr(mVis, 3)}`);
  ok('medianvärde i text: ' + expMed, B.includes(String(expMed).replace('.', ',')));
  if (rangTxt) ok('rangtext: ' + rangTxt, B.toLowerCase().includes(rangTxt));
}
// rangkontroller mot textens påståenden
{
  const lista = p => GREN.map(b => ({ t: b.ticker, v: val(b, p) })).filter(o => Number.isFinite(o.v)).sort((a, b) => b.v - a.v);
  ok('rang pe = 6/21 högst', lista('vardering.pe').findIndex(o => o.t === 'DIS') + 1 === 6 && lista('vardering.pe').length === 21);
  ok('rang pb = 8/23 lägst', [...lista('vardering.pb')].reverse().findIndex(o => o.t === 'DIS') + 1 === 8);
  ok('rang evEbit = 6/23 lägst', [...lista('vardering.evEbit')].reverse().findIndex(o => o.t === 'DIS') + 1 === 6);
  ok('rang roe = 4/23 lägst', [...lista('lonksamhet.roe')].reverse().findIndex(o => o.t === 'DIS') + 1 === 4);
  ok('rang fcfMarg = 3/22 lägst', [...lista('lonksamhet.fcfMarginal')].reverse().findIndex(o => o.t === 'DIS') + 1 === 3 && lista('lonksamhet.fcfMarginal').length === 22);
  ok('rang resCagr = 2/16 högst', lista('tillvaxt.resultatCAGR5ar').findIndex(o => o.t === 'DIS') + 1 === 2 && lista('tillvaxt.resultatCAGR5ar').length === 16);
  ok('rang skuldEk = 5/23 lägst', [...lista('stabilitet.skuldEgenkapital')].reverse().findIndex(o => o.t === 'DIS') + 1 === 5);
}
// universummedianer i text
ok('uni P/E 20,37', B.includes('20,37'));
ok('uni P/B 2,70', B.includes('2,70'));
ok('uni EV/EBIT 17,58', B.includes('17,58'));
ok('uni FCF-yield 4,27', B.includes('4,27'));
ok('uni ROIC 12,87', B.includes('12,87'));

// — bibliotekspost —
const L = JSON.parse(readFileSync('/home/ak1a/AK1/data/forskningsbiblioteket/DIS.json', 'utf8'));
ok('bib status GUL', L.urval.status === 'gul');
ok('bib täckning 0,7113', L.urval.datatackning === 0.7113 && B.includes('0,7113'));
ok('bib AKM1 46,4/71,1', L.akm1.totalt === 46.4 && L.akm1.maxMojligt === 71.1 && B.includes('46,4 av 71,1'));
ok('bib relativ 0,6526', Math.abs(L.akm1.relativ - 0.6526) < 0.0001 && B.includes('0,6526'));
ok('bib starkast värdering 3,67', L.akm1.starkast === 'vardering' && L.akm1.perKategori.vardering === 3.67 && B.includes('3,67'));
ok('bib svagast katalysator 0', L.akm1.perKategori.katalysator === 0 && B.includes('katalysatorn svagast (0 av 5'));
ok('bib topp intäktsstabilitet 5/5', L.akm1.topp3Motiveringar.some(m => m.variabel === 'V12') && B.includes('intäktsstabilitet 5 av 5'));
ok('bib botten ROE 0/5', L.akm1.botten3Motiveringar.some(m => m.variabel === 'V09') && B.includes('ROE 0 av 5'));

// — externa URL:er endast Disney —
const ext = [...new Set((B.match(/\]\((https?:\/\/[^)]+)\)/g) || []).map(s => s.slice(2, -1)))];
for (const u of ext) ok('extern URL tillåten: ' + u, /thewaltdisneycompany\.com/.test(u));

// — internlänkar —
const intern = [...new Set((B.match(/\]\((\/[^)]+)\)/g) || []).map(s => s.slice(2, -1)))];
const tillatna = ['/dataset/kommunikation/pe', '/dataset/kommunikation/pb', '/dataset/kommunikation/peg', '/dataset/kommunikation/ev-ebit', '/dataset/kommunikation/brutto-marginal', '/dataset/kommunikation/netto-marginal', '/dataset/kommunikation/fcf-avkastning', '/dataset/kommunikation/roe', '/dataset/kommunikation/roic', '/dataset/kommunikation/skuldsattning', '/dataset/kommunikation/omsattningstillvaxt-ttm', '/dataset/kommunikation/universumjamforelse', '/transparens', '/kallor', '/kurser'];
for (const l of intern) ok('internlänk känd: ' + l, tillatna.includes(l));

// — kvartalstabellens sökverifierade tal —
for (const t of ['0,73', '1,11', '22,46', '1,44', '0,564', '196', '132', '0,691', '6,85', '1,34', '1,63', '25,98', '3,69', '5,35', '1,27', '1,57', '25,17', '3,90', '1,52', '2,06', '25,25', '4,9', '13/11 2025', '2/2 2026', '6/5 2026', '5/8 2026', '12 november']) ok('kedjetalet: ' + t, B.includes(t));

// — rapportkedjans aritmetik —
ok('kedjesumma intäkt', Math.abs((22.46 + 25.981 + 25.17 + 25.25) - 98.861) < 0.005 && B.includes('98,86'));
ok('9M FY26 = 5,26', Math.abs((1.63 + 1.57 + 2.06) - 5.26) < 0.005);
ok('Q4FY25 netto +155%', Math.abs((1.44 / 0.564 - 1) * 100 - 155.3) < 0.5);
ok('Q3FY26 just +28%', Math.abs((2.06 / 1.61 - 1) * 100 - 27.9) < 0.5);
ok('fcf mot mål 61%', Math.abs(A.fcfMotMal - 61) < 1);

if (HTTP) {
  const base = 'http://localhost:3000';
  const res = await Promise.all(intern.map(async l => {
    try { const r = await fetch(base + l); return [l, r.status]; } catch { return [l, 0]; }
  }));
  for (const [l, s] of res) ok('HTTP ' + s + ' ' + l, s === 200);
}

console.log(`\nKVD DIS: ${pass} PASS, ${fel} FEL, ${varn} VARNING`);
process.exit(fel > 0 ? 1 : 0);
