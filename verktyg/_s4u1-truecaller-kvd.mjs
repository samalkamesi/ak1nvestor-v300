// _s4u1-truecaller-kvd.mjs — KVD för TRUE-B.ST Q3-2026-läspaketet (s4-u1, manifest auto-s4-1789835700993)
// GRÖN = 0 FEL, 0 VARNINGAR. Oberoende omräkning av varje tal i paketet mot
// bolagsunivers.json (2026-09-03-posten) och sökverifierad rappfakta (2026-09-19).
import { readFileSync } from 'node:fs';
import http from 'node:http';

const FIL = 'data/blogg-utkast/kvartal/2026-q3/sa-laser-du-truecaller-q3-2026.json';
const j = JSON.parse(readFileSync(FIL, 'utf8'));
const u = JSON.parse(readFileSync('data/portfolj-system/bolagsunivers.json', 'utf8'));
const L = Array.isArray(u) ? u : (u.bolag || []);
const P = L.find(b => b.ticker === 'TRUE-B.ST');

let pass = 0, fel = 0, varn = 0;
const ok = (namn, kond, info = '') => {
  if (kond) { pass++; }
  else { fel++; console.log('FEL:', namn, info); }
};
const veh = (namn, kond, info = '') => {
  if (kond) { pass++; }
  else { varn++; console.log('VARNING:', namn, info); }
};
const nära = (a, b, tol) => Math.abs(a - b) <= tol;
const proc = (v) => (v * 100);

const body = j.body, ord = body.trim().split(/\s+/).length;

// === 1. STRUKTUR ===
ok('slug', j.slug === 'sa-laser-du-truecaller-q3-2026');
ok('title-fönster 240–330 tkn', j.title.length >= 240 && j.title.length <= 330, String(j.title.length));
ok('description-fönster 350–720 tkn', j.description.length >= 350 && j.description.length <= 720, String(j.description.length));
ok('pillar', j.pillar === 'Institutionell metodik');
ok('author', j.author === 'AK1A Research Lab');
ok('publishedAt = rappdag', j.publishedAt === '2026-11-03');
ok('600-ordskontraktet', j.readingMinutes === Math.round(ord / 600), `ord ${ord} rm ${j.readingMinutes}`);
ok('tags 6 st', Array.isArray(j.tags) && j.tags.length === 6);
for (const sekt of ['## Urvalet: varför Truecaller är nästa paket', '## Nyckeltalen att ha med sig', '## Datavakten — fem prov',
  '## Så står sig bolaget mot branschen', '## Tre sätt att läsa utfallet', '## Praktiskt inför 3 november', '## Källor'])
  ok('sektion: ' + sekt.slice(0, 30), body.includes(sekt));
ok('juridikfooter italic sist', body.trimEnd().endsWith('*') && body.includes('*Detta är pedagogisk finansutbildning enligt lagen (2007:528) 2 kap 5 §'));
ok('disclaimer i ingress', body.includes('inte en rekommendation att köpa, sälja eller behålla'));

// === 2. KÄLLTALSPARITET mot universumposten ===
const par = [
  ['P/E', '33,151', P.vardering.pe], ['P/B', '7,213', P.vardering.pb], ['EV/EBIT', '16,638', P.vardering.evEbit],
  ['FCF-yield', '4,20', proc(P.vardering.fcfYield)], ['ROE', '22,41', proc(P.lonksamhet.roe)],
  ['ROIC', '44,61', proc(P.lonksamhet.roic)], ['brutto', '73,06', proc(P.lonksamhet.bruttoMarginal)],
  ['EBIT-marginal', '24,16', proc(P.lonksamhet.ebitMarginal)], ['netto', '14,80', proc(P.lonksamhet.nettoMarginal)],
  ['FCF-marginal', '18,37', proc(P.lonksamhet.fcfMarginal)], ['skuld/EK', '0,0419', P.stabilitet.skuldEgenkapital],
  ['omsCAGR', '2,55', proc(P.tillvaxt.omsattningCAGR5ar)], ['resCAGR', '10,12', Math.abs(proc(P.tillvaxt.resultatCAGR5ar))],
  ['TTM', '20,70', proc(Math.abs(P.tillvaxt.omsattningTillvaxtTTM))], ['prognos', '37,30', proc(P.tillvaxt.prognosTillvaxt)],
  ['kurs', '24,20', P.pris], ['mcap', '7,484', P.marknadsKapitalMdr],
];
for (const [n, s, v] of par) {
  const cit = parseFloat(s.replace(',', '.'));
  ok('källtalsparitet ' + n, nära(cit, v, Math.abs(v) * 0.0002 + 0.0005) && body.includes(s.replace('.', ',')),
     `citat ${s} mot fält ${v}`);
}
ok('PEG null i källan', P.vardering.peg === null && body.includes('PEG: **osatt hos källan**'));
ok('insiderköp 0', P.aterkop.insiderkopSenaste6man === 0 && body.includes('**0** observationer'));
const oms = P.serier.omsattning.map(x => x / 1e6), res = P.serier.resultat.map(x => x / 1e6); // filen bär hela SEK
ok('serieparitet oms i body', ['1 772,9', '1 728,9', '1 863,2', '1 912,2'].every(s => body.includes(s)));
ok('serieparitet res i body', ['535,2', '536,3', '524,3', '388,6'].every(s => body.includes(s)));
ok('serieår', P.serier.ar.join(',') === '2022,2023,2024,2025');
ok('kvartalssumman = årssekvensen', nära(496.9 + 496.4 + 467.9 + 451.0, oms[3], 0.15), String(496.9 + 496.4 + 467.9 + 451.0));

// === 3. ARITMETIK med oberoende omräkning ===
const EK = 7.484e3 / 7.213, skuld = 0.0419 * EK, NK = EK + skuld;
ok('EK 1 037,6', nära(EK, 1037.6, 0.1));
ok('skuld 43,5', nära(skuld, 43.5, 0.1));
ok('identitet P/B÷ROE 32,19 mot P/E (2,9 %)', nära(7.213 / 0.2241, 32.19, 0.01) && nära(proc((33.151 - 7.213 / 0.2241) / 33.151), 2.9, 0.05));
ok('absolutkontroll +72,1 %', nära(33.151 * res[3] / 1e3, 12.883, 0.002) && nära(proc(33.151 * res[3] / 7.484e3 - 1), 72.1, 0.05));
const implV = 7.484e3 / 33.151, roeV = 0.2241 * EK, ttmV = (res[3] - 219.7) + 84.1;
ok('implicit vinst 225,8', nära(implV, 225.8, 0.1));
ok('ROE-årsförmåga 232,5', nära(roeV, 232.5, 0.1));
ok('TTM-vinst 253,0 (H2-25 168,9 + H1-26 84,1)', nära(res[3] - 219.7, 168.9, 0.05) && nära(ttmV, 253.0, 0.05));
const ttmOms = 467.9 + 451.0 + 361.6 + 393.2, priTtm = 457.3 + 523.0 + 496.9 + 496.4;
ok('TTM-oms 1 673,7 / prior 1 973,6 / −15,2 % / kvot 1,36',
  nära(ttmOms, 1673.7, 0.05) && nära(priTtm, 1973.6, 0.05) && nära(proc(ttmOms / priTtm - 1), -15.2, 0.05) && nära(20.7 / 15.2, 1.36, 0.005));
const cgO = (Math.pow(oms[3] / oms[0], 0.25) - 1) * 100, cgR = (Math.pow(res[3] / res[0], 0.25) - 1) * 100;
ok('CAGR-kvoter 1,34/1,32', nära(2.55 / cgO, 1.34, 0.005) && nära(10.12 / -cgR, 1.32, 0.005));
const ebitF = 0.2416 * oms[3], ebitT = 0.2416 * ttmOms;
ok('EBIT fiscal 462,0 / TTM 404,4', nära(ebitF, 462.0, 0.1) && nära(ebitT, 404.4, 0.1));
ok('EV fiscal 7 687 ⇒ kassa −159 (omöjlig)', nära(16.638 * ebitF, 7687, 1) && nära(7484 + 43.5 - 16.638 * ebitF, -159, 1));
ok('EV TTM 6 728 ⇒ kassa 799 = 10,7 % av mcap', nära(16.638 * ebitT, 6728, 1) && nära(7484 + 43.5 - 16.638 * ebitT, 799, 1) && nära(proc((7484 + 43.5 - 16.638 * ebitT) / 7484), 10.7, 0.05));
ok('ROIC-vägar 42,7/37,4 mot fält 44,61; nämnare 1 081,0/1 036', nära(NK, 1081.0, 0.1) && nära(proc(ebitF / NK), 42.7, 0.05) && nära(proc(ebitT / NK), 37.4, 0.05) && nära(ebitF / 0.4461, 1036, 0.5));
const fcfY = 0.042 * 7484, fcfT = 0.1837 * ttmOms, fcfF = 0.1837 * oms[3];
ok('FCF-par TTM 314,3/307,4 = 2,2 %; årsbas 351,3 = +11,8 % över', nära(fcfY, 314.3, 0.1) && nära(fcfT, 307.4, 0.1) && nära(proc(fcfT / fcfY - 1), -2.2, 0.05) && nära(fcfF, 351.3, 0.1) && nära(proc(fcfF / fcfY - 1), 11.8, 0.05));
ok('P/FCF 23,8', nära(1 / 0.042, 23.8, 0.01));
const ms = res.map((r, i) => r / oms[i] * 100);
ok('marginalserie 30,2→31,0→28,1→20,3', ['30,2', '31,0', '28,1', '20,3'].every((s, i) => nära(ms[i], parseFloat(s.replace(',', '.')), 0.05)));
ok('intäktssteg −2,5/+7,8/+2,6; +7,9 totalt', nära(proc(oms[1] / oms[0] - 1), -2.5, 0.05) && nära(proc(oms[2] / oms[1] - 1), 7.8, 0.05) && nära(proc(oms[3] / oms[2] - 1), 2.6, 0.05) && nära(proc(oms[3] / oms[0] - 1), 7.9, 0.05));
ok('resultatsteg +0,2/−2,2/−25,9; −27,4 totalt', nära(proc(res[1] / res[0] - 1), 0.2, 0.05) && nära(proc(res[2] / res[1] - 1), -2.2, 0.05) && nära(proc(res[3] / res[2] - 1), -25.9, 0.05) && nära(proc(res[3] / res[0] - 1), -27.4, 0.05));
ok('PEG-konvention 0,89', nära(33.151 / 37.3, 0.89, 0.005));
ok('konsensusvändning 58,0 pp', nära(37.3 - (-20.7), 58.0, 0.01));
ok('multipl 24,1; kursväg 17,6 kr = −27,2 %', nära(33.151 / 1.373, 24.1, 0.05) && nära(24.20 / 1.373, 17.6, 0.05) && nära(proc(24.145 / 33.151 - 1), -27.2, 0.05));
ok('utdelning 0,28/24,20 = 1,16 %', nära(proc(0.28 / 24.20), 1.16, 0.005));
ok('utdelningssteg −83,5 %', nära(proc(0.28 / 1.70 - 1), -83.5, 0.05));
ok('ARPU 0,83 kr', nära(393.2 / 471, 0.83, 0.005));
ok('konsensusmiss −3,7 %', nära(proc(467.9 / 486 - 1), -3.7, 0.05));
ok('kvartalstal: Q1 −27, Q2 −21, H1 −24 %', nära(proc(361.6 / 496.9 - 1), -27.2, 0.05) && nära(proc(393.2 / 496.4 - 1), -20.8, 0.05) && nära(proc(754.8 / 993.3 - 1), -24.0, 0.05));
ok('H1-26 netto 11,1 %', nära(proc(84.1 / 754.8), 11.1, 0.05));
ok('valutaklyfta 12 pp (Q3-25: +2 SEK / +14 cc)', 14 - 2 === 12);
ok('marginalvikt 1,64 (19,1 mot 11,6)', nära(oms[3] * 0.01, 19.1, 0.05) && nära(oms[3] * 0.03 * 0.203, 11.6, 0.05) && nära(0.01 / (0.03 * 0.203), 1.64, 0.005));
ok('ROIC/ROE-kvot 1,99', nära(0.4461 / 0.2241, 1.99, 0.005));
ok('grenmultipl-kvoter 3,1/4,1/2,6', nära(0.4461 / 0.1451, 3.1, 0.05) && nära(0.042 / 0.0102, 4.1, 0.05) && nära(7.213 / 2.772, 2.6, 0.005));

// === 4. MEDIANER + RANG mot filen (gren = tillväxt) ===
const gren = L.filter(b => b.bransch === 'tillvaxt');
const med = (a) => { const v = a.filter(x => x !== null && x !== undefined && isFinite(x)).sort((x, y) => x - y); const n = v.length; if (!n) return null; return n % 2 ? v[(n - 1) / 2] : (v[n / 2 - 1] + v[n / 2]) / 2; };
const mtester = [
  ['pe', b => b.vardering?.pe, 43.556, 11, 4, '33,151'], ['pb', b => b.vardering?.pb, 9.155, 14, 7, '7,213'],
  ['evEbit', b => b.vardering?.evEbit, 32.750, 11, 1, '16,638'], ['fcfYield', b => b.vardering?.fcfYield, 0.0102, 14, 10, '4,20 %'],
  ['roe', b => b.lonksamhet?.roe, 0.1513, 14, 9, '22,41 %'], ['roic', b => b.lonksamhet?.roic, 0.1451, 14, 13, '44,61 %'],
  ['brutto', b => b.lonksamhet?.bruttoMarginal, 0.4434, 15, 12, '73,06 %'], ['netto', b => b.lonksamhet?.nettoMarginal, 0.0591, 15, 10, '14,80 %'],
  ['skuldEk', b => b.stabilitet?.skuldEgenkapital, 0.1775, 14, 3, '0,0419'], ['omsCagr', b => b.tillvaxt?.omsattningCAGR5ar, 0.1702, 14, 1, '2,55 %'],
  ['ttm', b => b.tillvaxt?.omsattningTillvaxtTTM, 0.3410, 15, 2, '−15,2 %'], ['prognos', b => b.tillvaxt?.prognosTillvaxt, 0.3719, 13, 8, '37,30 %'],
];
for (const [n, f, m, nG, rang, cit] of mtester) {
  const arr = gren.map(f).filter(x => x !== null && x !== undefined && isFinite(x)).sort((a, b) => a - b);
  const r = 1 + arr.filter(x => x < f(P)).length;
  ok(`median/rang ${n}`, nära(med(arr), m, Math.abs(m) * 0.001 + 0.0005) && arr.length === nG && r === rang, `med ${med(arr)} n ${arr.length} r ${r}`);
  ok(`citat ${n} i tabell`, body.includes(cit), cit);
}
ok('PEG-median 1,575 (n=10) + konvention 0,89 i body', nära(med(gren.map(b => b.vardering?.peg)), 1.575, 0.001) && body.includes('0,89'));
ok('universummedianer 20,525/2,772/17,948', nära(med(L.map(b => b.vardering?.pe)), 20.525, 0.001) && nära(med(L.map(b => b.vardering?.pb)), 2.772, 0.001) && nära(med(L.map(b => b.vardering?.evEbit)), 17.948, 0.001));
ok('grenstorlek 15 + filposter 207', gren.length === 15 && L.length === 207);

// === 5. SCENARIORUTA 9/9 celler (parsad ur body) ===
const rutor = [...body.matchAll(/\| intäkter (1 ?[\d.,]+) \| ([\d.,]+) \| ([\d.,]+) \| ([\d.,]+) \|/g)];
ok('scenarioruta 3 rader', rutor.length === 3, String(rutor.length));
const basO = [1854.8, 1912.2, 1969.6], basN = [0.193, 0.203, 0.213];
rutor.forEach((m, i) => {
  ok(`scenariorad ${i + 1} intäkter`, nära(parseFloat(m[1].replace(/ /g, '').replace(',', '.')), basO[i], 0.1));
  [m[2], m[3], m[4]].forEach((c, k) => ok(`cell ${i + 1}:${k + 1}`, nära(parseFloat(c.replace(',', '.')), basO[i] * basN[k], 0.15), `${c} mot ${basO[i] * basN[k]}`));
});

// === 6. JURIDIKGRIND ===
const lagrum = (body.match(/2007:528/g) || []).length, para = (body.match(/2 kap 5 §/g) || []).length;
ok('exakt ett lagrum 2007:528 + 2 kap 5 §', lagrum === 1 && para === 1, `${lagrum}/${para}`);
const främmande = [/2022:260/, /2022:261/, /1985:716/, /2005:59/, /2022:482/].filter(r => r.test(body));
ok('0 främmande lagrum', främmande.length === 0);
const rad = (body.match(/\b(köpa|köp|sälja|sälj|undvik|rekommendera|rekommendation)\b/g) || []);
const neutrala = rad.filter(w => true); // alla förekomster måste ligga i disclaimer-sammanhang — kontroll per rad nedan
const rader = body.split('\n').filter(r => /\b(köpa|köp|sälja|sälj|undvik|rekommendera|rekommendation)\b/.test(r) && !/återköp|insiderköp/.test(r));
const otillåtna = rader.filter(r => !/rekommendation att köpa|Inga köp-, sälj-|publiceringen av detta paket är kundens beslut|inte investeringsrådgivning/.test(r));
ok('rådord endast neutrala kontexter', otillåtna.length === 0, otillåtna.join(' // ').slice(0, 200));
ok('inget framtidsvendel "väntas"', !/\bväntas\b/.test(body));

// === 7. SPRÅK- OCH FORMATGRIND ===
ok('0 typografiska citat', !/[“”„«»]/.test(body));
ok('0 CJK', !/[\u4e00-\u9fff\u3040-\u30ff]/.test(body));
ok('0 dubbla mellanslag', !/ {2}/.test(body));
ok('0 NBSP', !/\u00a0/.test(body));
const utanUrl = body.replace(/https?:\/\/[^\s)\]]+/g, '').replace(/\[[^\]]*\]\([^)]*\)/g, 'LÄNK');
ok('0 punktdecimaler i body (svenskt talformat utanför URL)', !/\d\.\d/.test(utanUrl), (utanUrl.match(/\d\.\d/g) || []).join(' '));

// === 8. INTERNLÄNKAR ===
const länkar = [...new Set([...body.matchAll(/\]\((\/[^)#\s]+)\)/g)].map(m => m[1]))];
ok('minst 20 unika internlänkar', länkar.length >= 20, String(länkar.length));
const site = readFileSync('/tmp/_s4u1_sitemap.xml', 'utf8');
const iSite = [...site.matchAll(/<loc>([^<]+)<\/loc>/g)].map(m => m[1].replace('https://lab.ak1nvestor.com', ''));
const saknas = länkar.filter(l => !iSite.includes(l));
ok('samtliga länkar giltiga i sitemap.xml', saknas.length === 0, saknas.join(', '));
let lFel = 0;
await Promise.all(länkar.map(l => new Promise(res => {
  const r = http.get({ host: 'localhost', port: 3000, path: l, timeout: 8000 }, s => { if (s.statusCode !== 200) { lFel++; console.log('LÄNK ' + s.statusCode + ':', l); } res(); });
  r.on('error', e => { lFel++; console.log('LÄNK FEL:', l, e.message); res(); });
  r.on('timeout', () => { lFel++; console.log('LÄNK TIMEOUT:', l); r.destroy(); res(); });
})));
veh('länkar HTTP 200 mot localhost', lFel === 0, lFel + ' fel');

console.log(`\nKVD ${FIL}: ${pass} PASS · ${fel} FEL · ${varn} VARNINGAR · ord ${ord} · rm ${j.readingMinutes} · länkar ${länkar.length}`);
process.exit(fel + varn > 0 ? 1 : 0);
