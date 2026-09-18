// KVD för Nokia Q3-2026-läspaketet — maskinell kvalitetsverifiering.
// Krav: 0 FEL, 0 VARNING. Kontroller: struktur, källtalsparitet mot universumfilen,
// aritmetik (oberoende omräkning), medianer+rang med n, juridikgrind, ord/rm,
// interna länkar HTTP 200 mot localhost (loopback whitelistad i middleware).
import fs from 'node:fs';
const PAKET = '/home/ak1a/AK1/data/blogg-utkast/kvartal/2026-q3/sa-laser-du-nokia-q3-2026.json';
const UNI = '/home/ak1a/AK1/data/portfolj-system/bolagsunivers.json';
let pass = 0, fel = 0, varn = 0;
const ok = (namn, villkor, detalj = '') => { if (villkor) { pass++; } else { fel++; console.log('FEL:', namn, detalj); } };
const v = (namn, villkor, detalj = '') => { if (villkor) { pass++; } else { varn++; console.log('VARNING:', namn, detalj); } };
const r2 = (x) => Math.round(x * 100) / 100;
const j = JSON.parse(fs.readFileSync(PAKET, 'utf8'));
const U = JSON.parse(fs.readFileSync(UNI, 'utf8'));
const n = U.find(x => x.ticker === 'NOKIA.HE');
const er = U.find(x => x.ticker === 'ERIC-B.ST');
const body = j.body;
const pct = (a, b) => (a - b) / b * 100; // a mot b i procent

// 1. STRUKTUR
ok('JSON giltig', true);
ok('slug', j.slug === 'sa-laser-du-nokia-q3-2026', j.slug);
ok('title längd 60-200', j.title.length >= 60 && j.title.length <= 200, j.title.length);
ok('description längd 120-320', j.description.length >= 120 && j.description.length <= 320, j.description.length);
ok('pillar', j.pillar === 'Institutionell metodik');
ok('author', j.author === 'AK1A Research Lab');
ok('publishedAt 2026-10-20', j.publishedAt === '2026-10-20');
ok('readingMinutes heltal 3-8', Number.isInteger(j.readingMinutes) && j.readingMinutes >= 3 && j.readingMinutes <= 8);
ok('tags 6', Array.isArray(j.tags) && j.tags.length === 6);
ok('ingress har rappdag+officiell', body.includes('22 oktober') && body.includes('officiellt'));
ok('disclaimer sista stycket', body.trimEnd().endsWith('kundens beslut.*'));
ok('0 mjuka bindestreck', !body.includes('­'));
ok('sökbart H2-antal >= 8', (body.match(/\n## /g) || []).length >= 8, (body.match(/\n## /g) || []).length);

// 2. KÄLLTALSPARITET (textens tal måste finnas i bodyn OCH stämma med filen)
const K = { pris: 8.5, mcap: 47.588, pe: 70.833, pb: 2.245, evEbit: 28.404, peg: 0.84, fcfY: 0.0249, roe: 0.0345, roic: 0.0659, brutto: 0.455, ebitM: 0.0793, nettoM: 0.0347, fcfM: 0.058, skuldEk: 0.1578, progT: 0.1834, ttm: 0.084, omsCagr: -0.0721, resCagr: -0.4649 };
ok('fil pris', n.pris === K.pris); ok('fil mcap', n.marknadsKapitalMdr === K.mcap); ok('fil pe', n.vardering.pe === K.pe); ok('fil pb', n.vardering.pb === K.pb); ok('fil evEbit', n.vardering.evEbit === K.evEbit); ok('fil peg', n.vardering.peg === K.peg); ok('fil fcfY', n.vardering.fcfYield === K.fcfY);
ok('fil roe', n.lonksamhet.roe === K.roe); ok('fil roic', n.lonksamhet.roic === K.roic); ok('fil brutto', n.lonksamhet.bruttoMarginal === K.brutto); ok('fil ebitM', n.lonksamhet.ebitMarginal === K.ebitM); ok('fil nettoM', n.lonksamhet.nettoMarginal === K.nettoM); ok('fil fcfM', n.lonksamhet.fcfMarginal === K.fcfM); ok('fil skuldEk', n.stabilitet.skuldEgenkapital === K.skuldEk);
ok('fil progT', n.tillvaxt.prognosTillvaxt === K.progT); ok('fil ttm', n.tillvaxt.omsattningTillvaxtTTM === K.ttm); ok('fil omsCagr', n.tillvaxt.omsattningCAGR5ar === K.omsCagr); ok('fil resCagr', n.tillvaxt.resultatCAGR5ar === K.resCagr);
ok('fil serier oms', JSON.stringify(n.serier.omsattning) === JSON.stringify([24911000000, 22258000000, 20279000000, 19904000000]));
ok('fil serier res', JSON.stringify(n.serier.resultat) === JSON.stringify([4250000000, 665000000, 1277000000, 651000000]));
// textens tal finns i bodyn
for (const [namn, str] of Object.entries({ pe: '70,833', pb: '2,245', evEbit: '28,404', pegK: '0,84', roeP: '3,45', roicP: '6,59', bruttoP: '45,50', ebitP: '7,93', nettoP: '3,47', fcfP: '5,80', skuld: '0,1578', progP: '18,34', ttmP: '8,4', omsC: '−7,21', resC: '−46,49', pris: '8,50', mcap: '47,588' })) ok('text innehåller ' + namn + ' (' + str + ')', body.includes(str));

// 3. ARITMETIK — oberoende omräkning
ok('identitet fram 2,245/0,0345=65,07', r2(K.pb / K.roe) === 65.07, r2(K.pb / K.roe));
ok('identitet avv −8,13 %', r2(pct(K.pb / K.roe, K.pe)) === -8.13, r2(pct(K.pb / K.roe, K.pe)));
ok('identitet bak 70,833×0,0345=2,44', r2(K.pe * K.roe) === 2.44, r2(K.pe * K.roe));
ok('identitet bak avv +8,85 %', r2(pct(K.pe * K.roe, K.pb)) === 8.85, r2(pct(K.pe * K.roe, K.pb)));
ok('implicit EPS 0,12', r2(K.pris / K.pe) === 0.12, r2(K.pris / K.pe));
ok('implicit vinst 671,8', r2(K.mcap * 1000 / K.pe) === 671.79 || Math.round(K.mcap * 1000 / K.pe) === 672, r2(K.mcap * 1000 / K.pe));
ok('absolut 70,833×651=46,11 mdr', r2(K.pe * 651 / 1000) === 46.11, r2(K.pe * 651 / 1000));
ok('absolut residual −3,10 %', r2(pct(K.pe * 651 / 1000, K.mcap)) === -3.1, r2(pct(K.pe * 651 / 1000, K.mcap)));
ok('ttm-avvik +3,20 %', r2(pct(K.mcap * 1000 / K.pe, 651)) === 3.2, r2(pct(K.mcap * 1000 / K.pe, 651)));
ok('implicit EK 21,2', r2(K.mcap / K.pb) === 21.2, r2(K.mcap / K.pb));
ok('roe-kors 3,17', r2((K.mcap / K.pe) / (K.mcap / K.pb) * 100) === 3.17, r2((K.mcap / K.pe) / (K.mcap / K.pb) * 100));
ok('peg konvention 3,86', r2(K.pe / (K.progT * 100)) === 3.86, r2(K.pe / (K.progT * 100)));
ok('peg kvot 0,22', r2(K.peg / (K.pe / (K.progT * 100))) === 0.22, r2(K.peg / (K.pe / (K.progT * 100))));
ok('peg implicit 84,33', r2(K.pe / K.peg) === 84.32 || r2(K.pe / K.peg) === 84.33, r2(K.pe / K.peg));
ok('cagr oms −7,21', r2(((19904 / 24911) ** (1 / 3) - 1) * 100) === -7.21, r2(((19904 / 24911) ** (1 / 3) - 1) * 100));
ok('cagr res −46,49', r2(((651 / 4250) ** (1 / 3) - 1) * 100) === -46.49, r2(((651 / 4250) ** (1 / 3) - 1) * 100));
const stegO = [r2((22258 / 24911 - 1) * 100), r2((20279 / 22258 - 1) * 100), r2((19904 / 20279 - 1) * 100)];
const stegR = [r2((665 / 4250 - 1) * 100), r2((1277 / 665 - 1) * 100), r2((651 / 1277 - 1) * 100)];
ok('steg oms −10,65/−8,89/−1,85', JSON.stringify(stegO) === JSON.stringify([-10.65, -8.89, -1.85]), JSON.stringify(stegO));
ok('steg res −84,35/+92,03/−49,02', JSON.stringify(stegR) === JSON.stringify([-84.35, 92.03, -49.02]), JSON.stringify(stegR));
const nettoSerie = [r2(4250 / 24911 * 100), r2(665 / 22258 * 100), r2(1277 / 20279 * 100), r2(651 / 19904 * 100)];
ok('netto-serie 17,06/2,99/6,30/3,27', JSON.stringify(nettoSerie) === JSON.stringify([17.06, 2.99, 6.3, 3.27]), JSON.stringify(nettoSerie));
const ekMdr = K.mcap / K.pb, skuldMdr = ekMdr * K.skuldEk, ebit25 = 19904 * K.ebitM;
ok('ev-kedja EK 21,2', r2(ekMdr) === 21.2); ok('ev-kedja skuld 3,3', r2(skuldMdr) === 3.34 || Math.round(skuldMdr * 10) / 10 === 3.3, r2(skuldMdr));
ok('ev-kedja summa 24,5', r2(ekMdr + skuldMdr) === 24.54 || Math.round((ekMdr + skuldMdr) * 10) / 10 === 24.5, r2(ekMdr + skuldMdr));
ok('ev-kedja mult 15,55', r2((ekMdr + skuldMdr) * 1000 / ebit25) === 15.55, r2((ekMdr + skuldMdr) * 1000 / ebit25));
ok('ev-fältväg 44,8', r2(K.evEbit * ebit25 / 1000) === 44.83, r2(K.evEbit * ebit25 / 1000));
ok('ev-residual 20,3', r2((ekMdr + skuldMdr) - K.evEbit * ebit25 / 1000) === -20.29 || Math.abs(r2((ekMdr + skuldMdr) - K.evEbit * ebit25 / 1000) + 20.29) < 0.02, r2((ekMdr + skuldMdr) - K.evEbit * ebit25 / 1000));
ok('ebit25 1578,4', r2(ebit25) === 1578.39 || Math.round(ebit25) === 1578, r2(ebit25));
const fcfM = 19904 * K.fcfM, fcfYv = fcfM / (K.mcap * 1000) * 100;
ok('fcf-marginalväg 1 154 M', Math.round(fcfM) === 1154, Math.round(fcfM));
ok('fcf-yield 2,43', r2(fcfYv) === 2.43, r2(fcfYv));
ok('fcf-kvot håller (<5 % avvik)', Math.abs(pct(fcfYv, K.fcfY * 100)) < 5, r2(pct(fcfYv, K.fcfY * 100)));
ok('peg text konvention 3,86 finns', body.includes('3,86'));
ok('implicit tillväxt 84,33 i text', body.includes('84,33'));
ok('multipl 70,833/1,1834=59,86', r2(K.pe / (1 + K.progT)) === 59.86, r2(K.pe / (1 + K.progT)));
ok('nämnarövning P/E vid universum-ROE: 2,245/0,1554=14,4', r2(K.pb / 0.1554) === 14.45 || body.includes('14,4'));
ok('nämnarövning P/B vid oförändrad P/E: 70,833×0,1554=11,0', r2(K.pe * 0.1554) === 11.01 || body.includes('11,0'));

// 4. MEDIANER + RANG
const med = (a) => { const s = a.filter(x => typeof x === 'number' && isFinite(x)).sort((x, y) => x - y); const m = Math.floor(s.length / 2); return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2; };
const rank = (a, own) => a.filter(x => typeof x === 'number' && isFinite(x) && x < own).length + 1;
const T = U.filter(x => x.bransch === 'teknik');
ok('teknik n=21', T.length === 21, T.length);
ok('median teknik P/E 22,01', r2(med(T.map(x => x.vardering.pe))) === 22.01, r2(med(T.map(x => x.vardering.pe))));
ok('median teknik P/B 6,10', r2(med(T.map(x => x.vardering.pb))) === 6.1, r2(med(T.map(x => x.vardering.pb))));
ok('median teknik ROE 26,80 %', r2(med(T.map(x => x.lonksamhet.roe)) * 100) === 26.8);
ok('median teknik EBIT 24,89 %', r2(med(T.map(x => x.lonksamhet.ebitMarginal)) * 100) === 24.89);
ok('median teknik netto 20,25 %', r2(med(T.map(x => x.lonksamhet.nettoMarginal)) * 100) === 20.25);
ok('median teknik brutto 52,73 %', r2(med(T.map(x => x.lonksamhet.bruttoMarginal)) * 100) === 52.73);
ok('median teknik EV/EBIT 23,81', r2(med(T.map(x => x.vardering.evEbit))) === 23.81);
ok('median teknik PEG 1,24 (n=17)', T.filter(x => x.vardering.peg != null).length === 17 && r2(med(T.map(x => x.vardering.peg))) === 1.24);
ok('universum P/E 20,52 (n=162)', U.filter(x => x.vardering.pe != null).length === 162 && r2(med(U.map(x => x.vardering.pe))) === 20.52);
ok('universum P/B 2,81 (n=168)', U.filter(x => x.vardering.pb != null).length === 168 && r2(med(U.map(x => x.vardering.pb))) === 2.81);
ok('universum ROE 15,54 % (n=167)', U.filter(x => x.lonksamhet.roe != null).length === 167 && r2(med(U.map(x => x.lonksamhet.roe)) * 100) === 15.54);
ok('rang P/E 19 av 21', rank(T.map(x => x.vardering.pe), K.pe) === 19, rank(T.map(x => x.vardering.pe), K.pe));
ok('rang P/B 4 (lägst) av 21', rank(T.map(x => x.vardering.pb), K.pb) === 4);
ok('rang ROE 2 (lägst) av 21', rank(T.map(x => x.lonksamhet.roe), K.roe) === 2);
ok('rang netto 2 (lägst) av 21', rank(T.map(x => x.lonksamhet.nettoMarginal), K.nettoM) === 2);
ok('rang brutto 5 (lägst) av 21', rank(T.map(x => x.lonksamhet.bruttoMarginal), K.brutto) === 5);

// 5. SCENARIORUTA
const rutor = [[19904 * 0.97, 19904, 19904 * 1.03], [K.ebitM - 0.01, K.ebitM, K.ebitM + 0.01]];
const cell = (i, k) => r2(rutor[0][i] * rutor[1][k]);
ok('cell C11 1338,0', cell(0, 0) === 1337.97 || Math.round(cell(0, 0)) === 1338, cell(0, 0));
ok('cell C12 1531,0', Math.round(cell(0, 1)) === 1531, cell(0, 1));
ok('cell C13 1724,1', Math.round(cell(0, 2)) === 1724, cell(0, 2));
ok('cell C21 1379,3', Math.round(cell(1, 0)) === 1379, cell(1, 0));
ok('cell C22 1578,4', Math.round(cell(1, 1)) === 1578, cell(1, 1));
ok('cell C23 1777,4', Math.round(cell(1, 2)) === 1777, cell(1, 2));
ok('cell C31 1420,7', Math.round(cell(2, 0)) === 1421, cell(2, 0));
ok('cell C32 1625,7', Math.round(cell(2, 1)) === 1626, cell(2, 1));
ok('cell C33 1830,8', Math.round(cell(2, 2)) === 1831, cell(2, 2));
for (const s of ['1 338,0', '1 531,0', '1 724,1', '1 379,3', '1 578,4', '1 777,4', '1 420,7', '1 625,7', '1 830,8']) ok('text-cell ' + s, body.includes(s));
ok('1 pp = 199 M', Math.round(19904 * 0.01) === 199);
ok('3 % intäkter = 47 M', Math.round(19904 * 0.03 * K.ebitM) === 47);
ok('marginalvikt 4,20', r2(1 / (3 * K.ebitM)) === 4.2, r2(1 / (3 * K.ebitM)));
ok('ratt 0,24 i text', body.includes('4,2 gånger'));

// 6. ERICSSON-KOLUMNEN
ok('ericsson P/E 13,163', er.vardering.pe === 13.163); ok('ericsson P/B 3,087', er.vardering.pb === 3.087); ok('ericsson EV/EBIT 10,759', er.vardering.evEbit === 10.759);
ok('ericsson ROE 26,08', r2(er.lonksamhet.roe * 100) === 26.08); ok('ericsson EBIT 12,48', r2(er.lonksamhet.ebitMarginal * 100) === 12.48); ok('ericsson netto 10,83', r2(er.lonksamhet.nettoMarginal * 100) === 10.83);
ok('ericsson brutto 48,13', r2(er.lonksamhet.bruttoMarginal * 100) === 48.13); ok('ericsson fcf 13,49', r2(er.lonksamhet.fcfMarginal * 100) === 13.49); ok('ericsson mcap 317,505', er.marknadsKapitalMdr === 317.505);
ok('ericsson serier tomma (lucknot)', (!er.serier.omsattning || er.serier.omsattning.length === 0) && body.includes('seriefält är tomma'));

// 7. JURIDIKGRIND
const lagrum = (body.match(/2007:528/g) || []).length;
ok('exakt ett lagrum', lagrum === 1, lagrum);
for (const m of body.matchAll(/(?:köp|köpa|sälj|sälja|rekommendation|rekommendera|väntas|undvik|målkurs)/gi)) {
  const start = Math.max(0, m.index - 90), ctx = body.slice(start, m.index + 110);
  ok('rådord i godkänd kontext: "' + m[0] + '"', /inte en rekommendation|aldrig|inte en handssignal|Inga köp-, sälj-|inte vår prognos|konsensus|återköps|vad de säljer/i.test(ctx), ctx.slice(0, 120));
}
ok('inga köp/sälj-påbud', !/köp denna|sälj denna|bör du köpa|bör du sälja/i.test(body));

// 8. ORD + READINGMINUTES
const ord = body.replace(/\[([^\]]*)\]\([^)]*\)/g, '$1').replace(/[#*|>`]/g, ' ').split(/\s+/).filter(Boolean).length;
ok('ord 2400-3600', ord >= 2400 && ord <= 3600, ord);
ok('readingMinutes = round(ord/600)', j.readingMinutes === Math.round(ord / 600), j.readingMinutes + ' mot ' + Math.round(ord / 600));

// 9. INTERNA LÄNKAR HTTP 200
const links = [...new Set([...body.matchAll(/\((\/[^)#\s]+)\)/g)].map(m => m[1]))];
ok('interna länkar 19-22 st', links.length >= 19 && links.length <= 22, links.length);
const externa = [...body.matchAll(/\((https?:[^)]+)\)/g)].map(m => m[1]);
ok('externa länkar endast nokia.com-kalendrar i källor', externa.every(u => u.includes('nokia.com')), externa.join(' '));
const res = await Promise.all(links.map(async (p) => [p, await fetch('http://localhost:3000' + p, { redirect: 'manual' }).then(r => r.status).catch(() => 'ERR')]));
for (const [p, s] of res) ok('länk 200: ' + p, s === 200, s);

console.log('\n=== KVD Nokia Q3-2026: ' + pass + ' PASS, ' + fel + ' FEL, ' + varn + ' VARNING ===');
console.log('Ord: ' + ord + ' · readingMinutes: ' + j.readingMinutes + ' · interna länkar: ' + links.length + ' · externa: ' + externa.length);
process.exit(fel > 0 ? 1 : 0);
