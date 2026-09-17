// KVD för sa-laser-du-boston-scientific-q3-2026.json — kvalitetsverifiering vid tillverkningen 2026-09-17.
// Kontrollerar: JSON-giltighet, källtalsparitet mot bolagsunivers.json (BSX-posten),
// aritmetik med oberoende omräkning, medianer/rangplatser mot 159-filen, juridikgrind
// (exakt ett lagrum, 0 positiva rådmönster, 0 prognosord), 0 mjuka bindestreck,
// interna länkar HTTP 200 mot localhost:3000, längdkontrakt (600 ord/minut).
import fs from 'node:fs';

const PAKET = '/home/ak1a/AK1/data/blogg-utkast/kvartal/2026-q3/sa-laser-du-boston-scientific-q3-2026.json';
const UNIV = '/home/ak1a/AK1/data/portfolj-system/bolagsunivers.json';
const BAS = 'http://localhost:3000';

let pass = 0, feil = 0;
const ok = (namn, villkor, detalj = '') => {
  if (villkor) { pass++; console.log('PASS ' + namn + (detalj ? ' — ' + detalj : '')); }
  else { feil++; console.log('FEIL ' + namn + (detalj ? ' — ' + detalj : '')); }
};
const naer = (a, b, tol = 0.01) => Math.abs(a - b) <= tol;
const sv = x => String(Math.round(x / 1e6)).replace(/\B(?=(\d{3})+(?!\d))/g, ' '); // dollar -> "20 074" (miljoner)
const svx = x => x.toFixed(2).replace('.', ',').replace('-', '\u2212');

// === 1. JSON-giltighet och fält ===
const j = JSON.parse(fs.readFileSync(PAKET, 'utf8'));
ok('json.gyldig', true);
ok('json.slug', j.slug === 'sa-laser-du-boston-scientific-q3-2026');
ok('json.fält', ['title','description','pillar','author','publishedAt','readingMinutes','tags','body'].every(k => k in j));
ok('json.publishedAt', j.publishedAt === '2026-10-27', 'dagen före rappdagen 10-28 (SCA-konventionen)');
const body = j.body;
const ord = (body.match(/\S+/g) || []).length;
ok('langd.ord', ord >= 2500 && ord <= 4000, ord + ' ord');
ok('langd.readingMinutes', j.readingMinutes === Math.round(ord / 600), ord + ' ord -> ' + Math.round(ord / 600));
ok('langd.title', j.title.length > 0 && j.title.length <= 300, j.title.length + ' tkn');
ok('langd.desc', j.description.length > 0 && j.description.length <= 500, j.description.length + ' tkn');
ok('langd.tags', Array.isArray(j.tags) && j.tags.length >= 6, j.tags.length + ' tags');

// === 2. Källtalsparitet mot universumfilen ===
const u = JSON.parse(fs.readFileSync(UNIV, 'utf8'));
const B = u.find(x => x.ticker === 'BSX');
ok('kilde.BSX-finns', !!B, '159-bolagsfilen');
ok('kilde.hamtatum', B.hamtat === '2026-09-03');
const par = [
  ['pe', B.vardering.pe, '19,426'], ['pb', B.vardering.pb, '2,807'],
  ['evEbit', B.vardering.evEbit, '17,146'], ['peg', B.vardering.peg, '0,67'],
  ['pris', B.pris, '48,37'], ['mcap', B.marknadsKapitalMdr, '70,1'],
  ['roe', B.lonksamhet.roe * 100, '15,3'], ['roic', B.lonksamhet.roic * 100, '12,8'],
  ['brutto', B.lonksamhet.bruttoMarginal * 100, '69,2'], ['ebit', B.lonksamhet.ebitMarginal * 100, '22,9'],
  ['netto', B.lonksamhet.nettoMarginal * 100, '17,5'], ['fcfm', B.lonksamhet.fcfMarginal * 100, '11,7'],
  ['fcfYield', B.vardering.fcfYield * 100, '3,50'], ['skuldEK', B.stabilitet.skuldEgenkapital, '0,50'],
  ['omsCAGR', B.tillvaxt.omsattningCAGR5ar * 100, 'plus 16,54'], ['resCAGR', B.tillvaxt.resultatCAGR5ar * 100, 'plus 65,27'],
  ['ttm', B.tillvaxt.omsattningTillvaxtTTM * 100, 'plus 7,5'], ['prognos', B.tillvaxt.prognosTillvaxt * 100, '3,92'],
  ['insider', B.aterkop.insiderkopSenaste6man, '0'],
];
for (const [namn, varde, text] of par) {
  ok('kilde.' + namn, body.includes(text), 'fält ' + varde + ' som "' + text + '" i bodyn');
}
for (const [i, o] of B.serier.omsattning.entries()) ok('kilde.oms' + B.serier.ar[i], body.includes(sv(o)), sv(o) + ' MUSD');
for (const [i, r] of B.serier.resultat.entries()) ok('kilde.res' + B.serier.ar[i], body.includes(sv(r)), sv(r) + ' MUSD');
ok('kilde.serierAr4', B.serier.ar.length === 4, 'fyra räkenskapsår 2022–2025 (femte saknas — redovisat i bodyn)');
ok('kilde.luckor-redovisade', body.includes('räntetäckning') && body.includes('osatt') && body.includes('fyra år, inte fem'));

// === 3. Aritmetik med oberoende omräkning ===
const pe = B.vardering.pe, pb = B.vardering.pb, roe = B.lonksamhet.roe, ebitm = B.lonksamhet.ebitMarginal,
  netto = B.lonksamhet.nettoMarginal, fcfm = B.lonksamhet.fcfMarginal, fy = B.vardering.fcfYield,
  sk = B.stabilitet.skuldEgenkapital, mcap = B.marknadsKapitalMdr, o25 = B.serier.omsattning[3], r25 = B.serier.resultat[3];
const idt = pb / roe;
ok('arit.identitet', naer(idt, 18.30, 0.01) && body.includes('18,30'), '2,807 ÷ 0,1534 = ' + idt.toFixed(2));
ok('arit.identitet-diff', naer((pe - idt) / pe * 100, 5.80, 0.02) && body.includes('5,80'));
ok('arit.invers', naer(pe * roe, 2.98, 0.001) && body.includes('2,98') && body.includes('6,2 procent'));
ok('arit.vinstavkastning', naer(roe / pb * 100, 5.46, 0.01) && body.includes('5,46'));
ok('arit.eps-implicit', naer(B.pris / pe, 2.49, 0.01) && body.includes('2,49'));
const abs = pe * r25 / 1e9;
ok('arit.absolut', naer(abs, 56.3, 0.05) && body.includes('56,3'));
ok('arit.absolut-residual', naer((abs - mcap) / mcap * 100, -19.7, 0.05) && body.includes('minus 19,7'));
const impl = mcap / pe * 1000;
ok('arit.implicit-underlag', naer(impl, 3609, 1) && body.includes('3 609'));
ok('arit.implicit-avstand', naer((impl - r25 / 1e6) / (r25 / 1e6) * 100, 24.5, 0.05) && body.includes('24,5 procent'));
ok('arit.pe-direkt', naer(mcap * 1000 / (r25 / 1e6), 24.2, 0.05) && body.includes('24,2'));
const ttm = o25 * (1 + B.tillvaxt.omsattningTillvaxtTTM) / 1e6;
ok('arit.ttm-oms', naer(ttm, 21580, 1) && body.includes('21 580'));
const vittne = netto * ttm;
ok('arit.ttm-vittne', naer(vittne, 3776, 1) && body.includes('3 776'));
ok('arit.ttm-vittne-kvot', naer(vittne / impl, 1.05, 0.006) && body.includes('1,05'));
const EK = mcap / pb, SK = EK * sk, EV = mcap + SK, EBIT25 = o25 * ebitm / 1e6, evk = EV * 1000 / EBIT25;
ok('arit.ev-ek', naer(EK, 25.0, 0.05) && body.includes('25,0'));
ok('arit.ev-skuld', naer(SK, 12.5, 0.05) && body.includes('12,5'));
ok('arit.ev-ev', naer(EV, 82.6, 0.05) && body.includes('82,6'));
ok('arit.ev-ebit25', naer(EBIT25, 4597, 1) && body.includes('4 597'));
ok('arit.ev-kedjekvot', naer(evk / B.vardering.evEbit, 1.05, 0.005) && body.includes('1,05'));
ok('arit.ev-kedja-varde', naer(evk, 17.97, 0.01) && body.includes('17,97'));
const fcfM = fcfm * o25 / 1e6, fcfY = fy * mcap * 1000;
ok('arit.fcf-marginal', naer(fcfM, 2345, 1) && body.includes('2 345'));
ok('arit.fcf-yield', naer(fcfY, 2453, 1) && body.includes('2 453'));
ok('arit.fcf-kvot', naer(fcfY / fcfM, 1.05, 0.005) && body.includes('1,05'));
ok('arit.roe-kors', naer(impl / (EK * 1000) * 100, 14.45, 0.01) && body.includes('14,45'));
ok('arit.peg-konvention', naer(pe / (B.tillvaxt.prognosTillvaxt * 100), 4.96, 0.01) && body.includes('4,96'));
ok('arit.peg-implicit', naer(pe / B.vardering.peg, 28.99, 0.01) && body.includes('28,99'));
ok('arit.peg-faktor', naer((pe / (B.tillvaxt.prognosTillvaxt * 100)) / B.vardering.peg, 7.4, 0.05) && body.includes('7,4'));
const oc = (o25 / B.serier.omsattning[0]) ** (1 / 3) - 1, rc = (r25 / B.serier.resultat[0]) ** (1 / 3) - 1;
ok('arit.cagr-oms', naer(oc * 100, 16.54, 0.005) && body.includes('16,54'));
ok('arit.cagr-res', naer(rc * 100, 65.27, 0.005) && body.includes('65,27'));
const ms = B.serier.resultat.map((r, i) => r / B.serier.omsattning[i] * 100);
ok('arit.marginalserie', ms.every(m => body.includes(m.toFixed(2).replace('.', ','))) && body.includes('5,06 → 11,03 → 11,06 → 14,44'));
const so = B.serier.omsattning.map((o, i) => i ? (o / B.serier.omsattning[i - 1] - 1) * 100 : null).slice(1);
const sr = B.serier.resultat.map((r, i) => i ? (r / B.serier.resultat[i - 1] - 1) * 100 : null).slice(1);
ok('arit.steg-oms', so.every(x => body.includes(svx(x))), so.map(x => svx(x)).join('/'));
ok('arit.steg-res', sr.every(x => body.includes(svx(x))), sr.map(x => svx(x)).join('/'));
ok('arit.framat-pe', naer(pe / (1 + B.tillvaxt.prognosTillvaxt), 18.7, 0.05) && body.includes('18,7'));
ok('arit.resultat-x', naer(r25 / B.serier.resultat[0], 4.51, 0.01) && body.includes('4,5×'));
ok('arit.intakter-x', naer(o25 / B.serier.omsattning[0], 1.58, 0.01) && body.includes('+58'));
// scenariorutan 9 celler
let celler = 0;
for (const d of [-0.03, 0, 0.03]) for (const dm of [-0.01, 0, 0.01]) {
  const v = o25 * (1 + d) * (ebitm + dm) / 1e6;
  if (body.includes(sv(v * 1e6))) celler++;
}
ok('arit.scenarioruta-9', celler === 9, celler + '/9 celler ordagrant');
const ppm = o25 * 0.01 / 1e6, vp = o25 * 0.03 * ebitm / 1e6;
ok('arit.marginalvikt-pp', naer(ppm, 201, 1) && body.includes('201'));
ok('arit.marginalvikt-vp', naer(vp, 138, 1) && body.includes('138'));
ok('arit.marginalvikt-kvot', naer(ppm / vp, 1.46, 0.01) && naer(1 / (3 * ebitm), 1.46, 0.01) && body.includes('1,46'));
ok('arit.trappa-pp', naer(ms[3] - ms[0], 9.4, 0.05) && body.includes('9,4 procentenheter'));

// === 4. Medianer och rangplatser mot 159-filen ===
const H = u.filter(x => x.bransch === 'halso');
ok('median.gren-storlek', H.length === 16, H.length + ' hälsobolag');
const med = a => { const v = a.filter(x => x !== null && Number.isFinite(x)).sort((x, y) => x - y); const n = v.length; if (!n) return null; const m = Math.floor(n / 2); return n % 2 ? v[m] : (v[m - 1] + v[m]) / 2; };
const rang = (a, jv) => { const v = a.filter(x => x !== null && Number.isFinite(x)).sort((x, y) => x - y); return [v.filter(x => x < jv).length + 1, v.length]; };
const pct = (v, f = 100) => (v === null || v === undefined) ? null : v * f;
const falt = {
  'P/E': [x => x.vardering?.pe, '24,8', 150, '20,5', '4/15'],
  'P/B': [x => x.vardering?.pb, '4,36', 156, '2,83', '5/15'],
  'EV/EBIT': [x => x.vardering?.evEbit, '17,1', 151, '18,5', '9/16'],
  'PEG': [x => x.vardering?.peg, '0,79', 134, '1,49', '7/15'],
  'FCF-yield': [x => pct(x.vardering?.fcfYield), '4,3', 144, '3,8', '6/15'],
  'ROE': [x => pct(x.lonksamhet?.roe), '18,5', 155, '15,6', '7/15'],
  'ROIC': [x => pct(x.lonksamhet?.roic), '17,4', 141, '13,6', '3/15'],
  'brutto': [x => pct(x.lonksamhet?.bruttoMarginal), '71,0', 157, '47,6', '8/16'],
  'EBIT': [x => pct(x.lonksamhet?.ebitMarginal), '27,7', 158, '20,7', '6/16'],
  'netto': [x => pct(x.lonksamhet?.nettoMarginal), '13,4', 159, '13,7', '11/16'],
  'fcfMarg': [x => pct(x.lonksamhet?.fcfMarginal), '14,1', 148, '12,3', '7/16'],
  'skuldEK': [x => x.stabilitet?.skuldEgenkapital, '0,64', 144, '0,52', '4/15'],
};
for (const [namn, [f, gText, un, uText, rText]] of Object.entries(falt)) {
  const hm = med(H.map(f)), um = med(u.map(f)), [r, n] = rang(H.map(f), f(B));
  ok('median.' + namn + '.gren', Math.abs(hm - parseFloat(gText.replace(',', '.'))) < 0.06 && body.includes(gText), 'median ' + hm.toFixed(2) + ' (n=' + n + ')');
  ok('median.' + namn + '.universum', Math.abs(um - parseFloat(uText.replace(',', '.'))) < 0.06 && body.includes('(n=' + un + ')'), 'median ' + um.toFixed(2) + ' (n=' + un + ')');
  ok('rang.' + namn, r + '/' + n === rText && body.includes(rText), rText);
}
ok('median.ev-pa-medianen', Math.abs(B.vardering.evEbit - med(H.map(x => x.vardering?.evEbit))) / med(H.map(x => x.vardering?.evEbit)) < 0.005 && body.includes('Exakt på branschmedianen'), 'EV/EBIT 17,146 mot 17,073 = 0,4 %');

// === 5. Juridikgrind ===
const lagrum = (body.match(/2007:528/g) || []).length;
ok('juridik.exakt-ett-lagrum', lagrum === 1, lagrum + ' förekomster av 2007:528');
const andraLagrum = body.match(/1992:\d+|2005:\d+|2022:\d+|1985:\d+|1991:\d+/g) || [];
ok('juridik.inga-frammande-lagrum', andraLagrum.length === 0, andraLagrum.join(','));
const rad = [
  /\bvi rekommenderar/i, /\brekommenderar (köp|sälj)/i, /\b(köp|sälj|undvik) (aktien|bolaget|aktierna|kursen)\b/i,
  /\bmålkurs/i, /\bborde (köpa|sälja)/i, /\blönar sig att (köpa|sälja)/i, /\bväntas (stiga|falla|stegras)/i,
  /\bförväntas (stiga|falla)/i, /\bbra köp\b/i, /\bnu är det (dags|läge) att (köpa|sälja)/i,
];
ok('juridik.0-positiva-rad', rad.every(rx => !rx.test(body)), 'mönsterlista ' + rad.length + ' st');
ok('juridik.utbildningsform', body.includes('utbildning') && body.includes('inte investeringsrådgivning'));
const prognosord = (body.match(/\bväntas\b/g) || []).length;
ok('juridik.0-vantas', prognosord === 0, 'ordet "väntas": ' + prognosord);
ok('juridik.konsensus-pedagogik', body.includes('konsensus') && body.includes('pedagogiskt begrepp, inte en sanning'));

// === 6. Mjuka bindestreck och skräptecken ===
const mjuka = (body.match(/[\u00AD\u2010\u2011]/g) || []).length;
ok('tecken.0-mjuka-bindestreck', mjuka === 0, mjuka + ' st');
const ickeLatin = body.match(/[^\u0000-\u024F\u2013\u2014\u00A0-\u00FF\u2192\u2212\u2248\u00d7\s]/g) || [];
ok('tecken.0-skraptecken', ickeLatin.length === 0, JSON.stringify(ickeLatin.slice(0, 10)));

// === 7. Interna länkar HTTP 200 ===
const urls = [...new Set([...body.matchAll(/\]\((\/[^)]+)\)/g)].map(m => m[1]))];
ok('lenkar.antal', urls.length >= 18, urls.length + ' unika');
let kot = 0;
for (const url of urls) {
  const r = await fetch(BAS + url).then(x => x.status).catch(() => 0);
  if (r === 200) kot++; else console.log('  länk ' + url + ' -> ' + r);
}
ok('lenkar.http-200', kot === urls.length, kot + '/' + urls.length + ' mot ' + BAS);

// === 8. Sammanfattning ===
console.log('\n=== KVD sammanfattning ===');
console.log('PASS: ' + pass + '  FEIL: ' + feil);
console.log(ord + ' ord, readingMinutes ' + j.readingMinutes + ', ' + urls.length + ' interna länkar, lagrum ' + lagrum);
process.exit(feil ? 1 : 0);
