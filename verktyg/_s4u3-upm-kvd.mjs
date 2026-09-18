// KVD — s4-u3 UPM-Kymmene Q3-2026-läspaket (kör: node verktyg/_s4u3-upm-kvd.mjs)
import fs from 'node:fs';
const PAKET = '/home/ak1a/AK1/data/blogg-utkast/kvartal/2026-q3/sa-laser-du-upm-kymmene-q3-2026.json';
const d = JSON.parse(fs.readFileSync(PAKET, 'utf8'));
const U = JSON.parse(fs.readFileSync('/home/ak1a/AK1/data/portfolj-system/bolagsunivers.json', 'utf8')).find(x => x.ticker === 'UPM.HE');
const L = JSON.parse(fs.readFileSync('/home/ak1a/AK1/data/portfolj-system/bolagsunivers.json', 'utf8'));
const mat = L.filter(x => x.bransch === 'material');
let pass = 0, fel = 0;
const ok = (namn, cond, extra = '') => { if (cond) { pass++; } else { fel++; console.log('FEL:', namn, extra); } };
const approx = (a, b, tol) => Math.abs(a - b) <= tol;

// === 1. STRUKTUR ===
ok('rotfält', ['slug','title','description','pillar','author','publishedAt','readingMinutes','tags','body'].every(k => k in d));
ok('slug=filnamn', d.slug === 'sa-laser-du-upm-kymmene-q3-2026');
ok('title fmt', /^UPM-Kymmene Q3-rapport 2026: så läser du den —/.test(d.title));
ok('desc längd', d.description.length >= 150 && d.description.length <= 215, d.description.length);
ok('tags 6', Array.isArray(d.tags) && d.tags.length === 6);
ok('publishedAt = rappdag', d.publishedAt === '2026-10-28');
const ord = d.body.split(/\s+/).length;
ok('ord 2 500–3 400', ord >= 2500 && ord <= 3400, ord);
ok('readingMinutes', d.readingMinutes === Math.round(ord / 600), d.readingMinutes);
ok('pillar/author', d.pillar === 'Institutionell metodik' && d.author === 'AK1A Research Lab');
const rub = [...d.body.matchAll(/^## /gm)].map(m => m[0]);
ok('7 sektioner', rub.length === 7, rub.length);

// === 2. KÄLLTALSPARITET (universumposten + kvartal) ===
const v = U.vardering, t = U.tillvaxt, l = U.lonksamhet, s = U.stabilitet;
const par = (x) => d.body.includes(String(x).replace(/-/g, '\u2212')) || d.body.includes(String(x));
ok('pris 24,22', par('24,22'));
ok('PE 20,525', par('20,525'));
ok('PB 1,284', par('1,284'));
ok('EV/EBIT 17,728', par('17,728'));
ok('PEG 12,89', par('12,89'));
ok('ROE 6,21', par('6,21'));
ok('ROIC 6,76', par('6,76'));
ok('brutto 12,18', par('12,18'));
ok('EBITm 9,81', par('9,81'));
ok('netto 6,57', par('6,57'));
ok('fcfM 7,50', par('7,50'));
ok('skuld 0,3765', par('0,3765'));
ok('omsCAGR -6,25', par('-6,25'));
ok('resCAGR -31,99', par('-31,99'));
ok('TTM 0,6', par('0,6 procent'));
ok('prognos 27,61', par('27,61'));
ok('fcfY 5,59', par('5,59'));
ok('mcap 12,772', par('12,772'));
// kvartal
for (const q of ['2 355', '2 341', '212', '124', '9,0 procent', '5,3', '471', '9,8', '2 298', '2 521', '153', '291', '6,7 procent', '11,5', '7 344', '7 707', '566', '806', '7,7 procent', '218', '2 705', '2 312', '2 451', '259', '10,6'])
  ok('kvartalstal ' + q, d.body.includes(q));

// === 3. ARITMETIK (oberoende omräkning) ===
const id = v.pb / l.roe;
ok('identitet 20,68', approx(id, 20.6763, 0.001) && d.body.includes('20,68'));
ok('identitetsbrott +0,74', approx((id - v.pe) / v.pe * 100, 0.739, 0.01) && d.body.includes('+0,74'));
const pegK = v.pe / (t.prognosTillvaxt * 100);
ok('PEG-konv 0,74', approx(pegK, 0.7434, 0.001) && d.body.includes('0,74'));
ok('PEG-kvot 17,3', approx(v.peg / pegK, 17.35, 0.1) && d.body.includes('17,3'));
ok('implicit 1,59', approx(v.pe / v.peg, 1.592, 0.01) && d.body.includes('1,59'));
const o = U.serier.omsattning, r = U.serier.resultat;
ok('omsCAGR', approx(Math.pow(o[3] / o[0], 1 / 3) - 1, -0.062532, 1e-6));
ok('resCAGR', approx(Math.pow(r[3] / r[0], 1 / 3) - 1, -0.319917, 1e-6));
ok('årssteg oms', approx(o[1] / o[0] - 1, -0.1075, 1e-4) && approx(o[2] / o[1] - 1, -0.0116, 1e-4) && approx(o[3] / o[2] - 1, -0.0661, 1e-4));
ok('årssteg res V-form', approx(r[1] / r[0] - 1, -0.7457, 1e-3) && approx(r[2] / r[1] - 1, 0.1237, 1e-3) && approx(r[3] / r[2] - 1, 0.1009, 1e-3));
ok('netto/oms-serie', approx(r[0] / o[0], 0.1302, 1e-4) && approx(r[1] / o[1], 0.0371, 1e-4) && approx(r[3] / o[3], 0.0497, 1e-4) && d.body.includes('13,0 procent 2022'));
ok('Q2-26 marg', approx(212 / 2355 * 100, 9.00, 0.01) && approx(124 / 2341 * 100, 5.30, 0.01));
ok('Q2-26 EBIT-tillv', approx(212 / 124 - 1, 0.710, 0.001));
ok('Q3-25 marg', approx(153 / 2298 * 100, 6.66, 0.01) && approx(291 / 2521 * 100, 11.54, 0.01));
const H1oms = 471 / 0.098, Q1oms = H1oms - 2355;
ok('Q1-härledning', approx(H1oms, 4806.1, 0.5) && approx(Q1oms, 2451.1, 0.5) && d.body.includes('2 451') && d.body.includes('259'));
ok('Q1-marg', approx(259 / 2451 * 100, 10.56, 0.05) && d.body.includes('10,6'));
ok('Q4-25 härledd', o[3] / 1e6 - 7344 === 2312 && d.body.includes('2 312'));
ok('Q1-25 ur 9M', 7344 - 2341 - 2298 === 2705 && d.body.includes('2 705'));
const h = 1 + s.skuldEgenkapital, turn = l.roe / (l.nettoMarginal * h);
ok('DuPont turnover', approx(turn, 0.6867, 1e-4) && d.body.includes('0,687'));
ok('DuPont identitet', approx(l.nettoMarginal * turn * h, l.roe, 1e-9));
const peEbit = v.pe * (l.nettoMarginal / l.ebitMarginal);
ok('EV-led 13,75/1,290', approx(peEbit, 13.75, 0.01) && approx(v.evEbit / peEbit, 1.290, 0.001));
const EBIT25 = l.ebitMarginal * o[3];
ok('EBIT25 947', approx(EBIT25 / 1e6, 947.3, 0.1) && d.body.includes('947'));
ok('1pp=96,6 / 3%=28,4', approx(0.01 * o[3] / 1e6, 96.6, 0.05) && approx(0.03 * EBIT25 / 1e6, 28.4, 0.05));
ok('marginalvikt 3,40', approx(1 / (3 * l.ebitMarginal), 3.397, 0.001) && d.body.includes('3,40'));
const cell = (dm, dv) => (EBIT25 * (1 + dv) + dm * o[3] * (1 + dv)) / 1e6;
const cellTxt = [[-0.01, -0.03, '825'], [-0.01, 0, '851'], [-0.01, 0.03, '876'], [0, -0.03, '919'], [0, 0, '947'], [0, 0.03, '976'], [0.01, -0.03, '1 012'], [0.01, 0, '1 044'], [0.01, 0.03, '1 075']];
for (const [dm, dv, txt] of cellTxt) ok('cell ' + txt, approx(cell(dm, dv), parseFloat(txt.replace(' ', '')), 0.6) && d.body.includes(txt));
ok('multipl 16,08', approx(v.pe / (1 + t.prognosTillvaxt), 16.08, 0.01));
ok('multipl 21,89', approx(v.pe / (1 + t.omsattningCAGR5ar), 21.89, 0.01));
ok('fcf>netto kvot 1,14', approx(l.fcfMarginal / l.nettoMarginal, 1.142, 0.001) && d.body.includes('1,14'));
ok('ASSA-bruttokvot 3,54', approx(0.4314 / 0.1218, 3.542, 0.01) && d.body.includes('43,14'));

// === 4. MEDIANER/RANG ur 183-filen (omräknade) ===
const med = a => { const x = a.filter(v => typeof v === 'number').sort((p, q) => p - q); const n = x.length; return n % 2 ? x[(n - 1) / 2] : (x[n / 2 - 1] + x[n / 2]) / 2; };
const rng = (a, v) => a.filter(x => typeof x === 'number' && x < v).length + 1;
const medk = [['pe', 19.977, 20], ['pb', 1.58, 21], ['evEbit', 14.845, 20], ['roe', 0.0943, 21], ['roic', 0.0834, 20], ['bruttoMarginal', 0.3492, 21], ['ebitMarginal', 0.1241, 21], ['nettoMarginal', 0.0926, 21], ['skuldEgenkapital', 0.32, 21]];
for (const [f, expM, expN] of medk) {
  const a = mat.map(x => x.vardering?.[f] ?? x.lonksamhet?.[f] ?? x.stabilitet?.[f]);
  const m = med(a), n = a.filter(x => typeof x === 'number').length;
  ok('median ' + f, approx(m, expM, Math.abs(expM) * 0.002 + 1e-9) && n === expN, m + ' n=' + n);
}
ok('rang PEG 19/20', rng(mat.map(x => x.vardering?.peg), v.peg) === 19);
ok('rang brutto 2/21', rng(mat.map(x => x.lonksamhet?.bruttoMarginal), l.bruttoMarginal) === 2);
ok('rang fcfY 15/20', rng(mat.map(x => x.vardering?.fcfYield), v.fcfYield) === 15);
ok('matmedian CAGR -1,67', approx(med(mat.map(x => x.tillvaxt?.omsattningCAGR5ar)), -0.0167, 1e-4) && d.body.includes('\u22121,67'));
ok('text medianvärden', ['19,98', '1,58', '14,85', '9,43', '8,34', '34,92', '12,41', '9,26', '0,32'].every(x => d.body.includes(x)));

// === 5. JURIDIK ===
const lag = [...d.body.matchAll(/2007:528/g)].length;
ok('exakt ett lagrum', lag === 1, lag);
ok('2 kap 5 § närvarande', d.body.includes('2 kap 5 §'));
const rådsläge = [...d.body.matchAll(/(köp|sälj|rekommender|hållnings)[a-zåäö]*/gi)].map(m => m[0].toLowerCase());
const vit = ['säljer']; const forbjudna = rådsläge.filter(w => !vit.includes(w) && !d.body.slice(Math.max(0, d.body.toLowerCase().lastIndexOf(w) - 120), d.body.toLowerCase().lastIndexOf(w) + 140).match(/inte|inga|ingen|aldrig|utan|ej|frånkomst|neka/i));
ok('rådord endast negationskontext', forbjudna.length === 0, JSON.stringify(forbjudna));
ok('disclaimer', d.body.includes('inte investeringsrådgivning') && d.body.includes('publiceringen av detta paket är kundens beslut'));

// === 6. SPRÅK ===
ok('inga tabbar', !/\t/.test(d.body));
ok('inga dubbla mellanslag', !/  /.test(d.body));
ok('inga mjuka bindestreck', !/\u00AD/.test(d.body));
ok('inga CJK/kyrilliska', !/[\u4e00-\u9fff\u0400-\u04ff]/.test(d.body));
ok('inga typografiska citattecken', !/[""''«»]/.test(d.body));
for (const w of ['Combines', 'Kymmenes', 'bunkter', 'Mkr euro', 'undrar-procent', 'ränna'])
  ok('språkfel borta: ' + w, !(d.title + d.description + d.body).includes(w));

// === 7. INTERNLÄNKAR 200 ===
const lnkor = [...new Set([...d.body.matchAll(/\]\((\/[^)#\s]+)\)/g)].map(m => m[1]))];
ok('länkantal 19-20', lnkor.length >= 19 && lnkor.length <= 20, lnkor.length);
const BASE = 'http://localhost:3000';
const dodalänkar = [];
for (const u of lnkor) {
  try { const res = await fetch(BASE + u, { signal: AbortSignal.timeout(8000) }); if (res.status !== 200) dodalänkar.push(u + '=' + res.status); }
  catch { dodalänkar.push(u + '=ERR'); }
}
ok('samtliga interna länkar 200', dodalänkar.length === 0, dodalänkar.join(', '));

console.log(`\nKVD UPM: ${pass} PASS, ${fel} FEL`);
process.exit(fel ? 1 : 0);
