// _s4u2-cvx-kvd.mjs — kvalitetsverifiering av CVX Q3-2026-läspaketet (s4-u2).
// Kör: node verktyg/_s4u2-cvx-kvd.mjs [--http]   (--http = internlänkar mot localhost:3000)
import { readFileSync } from 'node:fs';

const HTTP = process.argv.includes('--http');
const P = JSON.parse(readFileSync('/home/ak1a/AK1/data/blogg-utkast/kvartal/2026-q3/sa-laser-du-cvx-q3-2026.json', 'utf8'));
const REF = JSON.parse(readFileSync('/home/ak1a/AK1/verktyg/_s4u2-cvx-byggdata-referens.json', 'utf8'));
const U = JSON.parse(readFileSync('/home/ak1a/AK1/data/portfolj-system/bolagsunivers.json', 'utf8'));
const body = P.body;
const pass = []; const fell = [];
const OK = (namn, villkor, ev) => (villkor ? pass : fell).push(`${villkor ? 'PASS' : 'FEL'} ${namn}${villkor ? '' : ' — ' + (ev || '')}`);
const NUM = s => parseFloat(String(s).replace(/\u2212/g, '-').replace(/,/g, '.').replace(/\s/g, ''));

// 1) struktur
OK('slug', P.slug === 'sa-laser-du-cvx-q3-2026');
OK('title finns >100 tecken', (P.title || '').length > 100);
OK('description finns >200 tecken', (P.description || '').length > 200);
OK('pillar', P.pillar === 'Institutionell metodik');
OK('author', P.author === 'AK1A Research Lab');
OK('publishedAt = rappdagen', P.publishedAt === '2026-10-30');
OK('tags 6', Array.isArray(P.tags) && P.tags.length === 6);
OK('tags innehåller kvartalsrapport+läspaket', P.tags.includes('kvartalsrapport') && P.tags.includes('läspaket'));

// 2) ord & läsminuter
const ord = body.split(/\s+/).filter(w => /\p{L}/u.test(w)).length;
OK('ord >= 600 (600-ordskontraktet)', ord >= 600, `ord=${ord}`);
OK('readingMinutes = round(ord/600)', P.readingMinutes === Math.round(ord / 600), `rm=${P.readingMinutes} ord=${ord} → ${Math.round(ord / 600)}`);

// 3) sektioner
const h2 = [...body.matchAll(/^## (.+)$/gm)].map(m => m[1]);
OK('8 H2-sektioner', h2.length === 8, `antal=${h2.length}: ${h2.join(' | ')}`);
OK('H2-namn kronologi', ['Urvalet', 'Nyckeltalen', 'Källkritiken', 'Kvartalskedjan', 'mot branschen', 'övningar', 'Praktiskt', 'Källor'].every((k, i) => (h2[i] || '').includes(k)));

// 4) källtalsparitet — tvångstal ur fält-, rapport- och härled-världarna
const talLista = [
  ['pris 211,78', '211,78'], ['mcap 415,4', '415,4'], ['P/E 20,36', '20,36'], ['P/B 2,19', '2,19'],
  ['EV/EBIT 9,82', '9,82'], ['PEG 0,93', '0,93'], ['FCF-yield 5,28', '5,28'],
  ['ROE 12,23', '12,23'], ['ROIC 20,17', '20,17'], ['brutto 44,27', '44,27'], ['EBIT 21,87', '21,87'],
  ['netto 9,83', '9,83'], ['FCF-marg 10,48', '10,48'], ['skuld/EK 0,19', '0,19'],
  ['omsCAGR minus 8,44', 'minus 8,44'], ['resCAGR minus 29,74', 'minus 29,74'], ['TTM +53,5', '53,5'], ['prognos minus 16,91', 'minus 16,91'],
  ['EPS Q3-25 1,82', '1,82'], ['EPS Q4-25 1,39', '1,39'], ['EPS Q1-26 1,11', '1,11'], ['EPS Q2-26 6,11', '6,11'],
  ['Q3-25 netto 3,5', '3,5 mdr'], ['Q4-25 netto 2,8', '2,8 mdr'], ['Q1-26 netto 2,2', '2,2 mdr'], ['Q2-26 netto 12,1', '12,1'],
  ['Q3-25 intäkt 49,73', '49,73'], ['Q4-25 intäkt 46,87', '46,87'], ['Q1-26 intäkt 48,61', '48,61'], ['Q2-26 intäkt 70,06', '70,06'],
  ['Q2 est 5,11', '5,11'], ['Q1 est 0,95', '0,95'], ['Q3-25 est 1,70', '1,70'],
];
for (const [namn, n] of talLista) OK('tal: ' + namn, body.includes(n), `saknas: ${n}`);
OK('fält-EPS 10,40', body.includes('10,40'));
OK('rapport-EPS 10,43', body.includes('10,43'));
OK('netto-TTM 20,6', body.includes('20,6'));
OK('Q2-andel 58,6', body.includes('58,6'));
OK('aktieantal 1,96', body.includes('1,96'));
OK('seriens 2025-netto 12,3', body.includes('12,3'));
OK('2022-netto 35,5', body.includes('35,5'));
OK('Hess-synergi 1,5', body.includes('1,5'));
OK('boed-rekord 4,07', body.includes('4,07'));
OK('ROCE 21', body.includes('21 %'));

// 5) aritmetik — oberoende omräkning
const F = REF.falt, Q = REF.rapport;
OK('A1 epsTtmRapport', Math.abs((1.82 + 1.39 + 1.11 + 6.11) - 10.43) < 0.005);
OK('A2 epsTtmFalt = pris/pe', Math.abs(F.pris / F.pe - 10.40) < 0.005);
OK('A3 nettoTtm = 3,5+2,8+2,2+12,1', Math.abs((3.5 + 2.8 + 2.2 + 12.1) - 20.6) < 0.005);
OK('A4 nettoTtmFalt = mcap/pe', Math.abs(F.mcap / F.pe - 20.40) < 0.02);
OK('A5 Q2-andel = 6,11/10,43', Math.abs(6.11 / 10.43 * 100 - 58.6) < 0.1);
OK('A6 TTM-mot-2025 = 20,6/12,299', Math.abs((20.6 / 12.299 - 1) * 100 - 67.5) < 0.2);
OK('A7 omsTtm-summa 215,27', Math.abs((49.73 + 46.87 + 48.61 + 70.06) - 215.27) < 0.02);
OK('A8 omsTtm-växt +10,3', Math.abs((215.27 / 195.1 - 1) * 100 - 10.3) < 0.3);
OK('A9 Q2-intäktväxt +56,4', Math.abs((70.06 / 44.8 - 1) * 100 - 56.4) < 0.3);
OK('A10 pegKonv 1,20', Math.abs(F.pe / 16.91 - 1.204) < 0.005);
OK('A11 peEv-kvot 2,07', Math.abs(F.pe / F.evEbit - 2.073) < 0.01);
OK('A12 FCF över netto +0,65', Math.abs((F.fcfMarg - F.netto) * 100 - 0.65) < 0.02);
OK('A13 H1-utdelning 125,9 %', Math.abs(18.0 / 14.3 * 100 - 125.9) < 0.2);
OK('A14 aktieantal = mcap/pris', Math.abs(F.mcap / F.pris - 1.9626) < 0.001);
OK('A15 Q2-kontroll 6,11×1,96≈12,1', Math.abs(6.11 * 1.9626 - 11.99) < 0.02);
OK('A16 serie-omsCAGR −8,44', Math.abs(((189031 / 246252) ** (1 / 3) - 1) * 100 + 8.44) < 0.02);
OK('A17 serie-resCAGR −29,74', Math.abs(((12299 / 35465) ** (1 / 3) - 1) * 100 + 29.74) < 0.02);
OK('A18 scenBas 41,34', Math.abs(189.031 * 0.2187 - 41.34) < 0.02);
OK('A19 normaliserad EPS 8,64', Math.abs(10.40 * (1 - 0.1691) - 8.64) < 0.01);
OK('A20 framtidsmultipel 24,5', Math.abs(211.78 / 8.64 - 24.5) < 0.1);
// scenarieceller (9): oberoende
const scen = [[183.360, 0.2087, '38,27'], [183.360, 0.2187, '40,10'], [183.360, 0.2287, '41,93'], [189.031, 0.2087, '39,45'], [189.031, 0.2187, '41,34'], [189.031, 0.2287, '43,23'], [194.720, 0.2087, '40,63'], [194.720, 0.2187, '42,58'], [194.720, 0.2287, '44,53']];
let cellOK = 0;
for (const [o, m, s] of scen) { const v = o * m; const parset = NUM(s); if (Math.abs(v - parset) < 0.02 && body.includes(s)) cellOK++; }
OK('A21 scenarioruta 9/9 celler närvarande+aritmetik', cellOK === 9, `cellOK=${cellOK}`);
OK('A22 marginalgrundtal 1,89', body.includes('1,89') && Math.abs(189.031 * 0.01 - 1.89) < 0.01);
OK('A23 volymgrundtal i EBIT 0,41 + relation 4,6', body.includes('0,41') && body.includes('4,6') && Math.abs(189.031 * 0.01 * 0.2187 - 0.413) < 0.005 && Math.abs(1 / 0.2187 - 4.57) < 0.02);

// 6) medianer + rang LIVE ur universumet
const GREN = U.filter(x => x.bransch === 'energi');
const med = arr => { const v = arr.filter(Number.isFinite).sort((a, b) => a - b); const m = Math.floor(v.length / 2); return v.length % 2 ? v[m] : (v[m - 1] + v[m]) / 2; };
const g = p => med(GREN.map(b => p.split('.').reduce((o, k) => o?.[k], b)));
const rn = (p, rikt) => { const val = x => p.split('.').reduce((o, k) => o?.[k], x); const l = GREN.map(b => val(b)).filter(Number.isFinite).sort((a, b) => rikt === 'högst' ? b - a : a - b); return l.indexOf(val(U.find(x => x.ticker === 'CVX'))) + 1; };
const mediaKoll = [['pe', 17.61], ['pb', 2.26], ['evEbit', 13.48], ['fcfYield', 5.41], ['roe', 12.75], ['roic', 11.61], ['brutto', 39.22], ['ebit', 17.34], ['netto', 8.92], ['skuldEk', 0.53], ['prognos', 8.66]];
for (const [k, v] of mediaKoll) OK('M: grenmedian ' + k, Math.abs(g(k === 'fcfYield' ? 'vardering.fcfYield' : k === 'skuldEk' ? 'stabilitet.skuldEgenkapital' : k === 'prognos' ? 'tillvaxt.prognosTillvaxt' : (k === 'pe' || k === 'pb' || k === 'evEbit') ? 'vardering.' + k : k === 'roe' || k === 'roic' || k === 'brutto' || k === 'ebit' || k === 'netto' ? 'lonksamhet.' + (k === 'brutto' ? 'bruttoMarginal' : k === 'ebit' ? 'ebitMarginal' : k === 'netto' ? 'nettoMarginal' : k) : '') * (['fcfYield', 'roe', 'roic', 'brutto', 'ebit', 'netto', 'prognos'].includes(k) ? 100 : 1) - v) < 0.06);
OK('R: ROIC 3/22 högst', rn('lonksamhet.roic', 'högst') === 3);
OK('R: skuld 2/22 lägst', rn('stabilitet.skuldEgenkapital', 'lägst') === 2);
OK('R: EV/EBIT 7/22 lägst', rn('vardering.evEbit', 'lägst') === 7);
OK('R: prognos 4/21 lägst', rn('tillvaxt.prognosTillvaxt', 'lägst') === 4);
OK('R: TTM 3/22 högst', rn('tillvaxt.omsattningTillvaxtTTM', 'högst') === 3);
OK('R: P/E 10/21 högst', rn('vardering.pe', 'högst') === 10);

// 7) juridikgrind
const lagrum = (body.match(/2007:528/g) || []).length;
OK('juridik: exakt ett lagrum 2007:528', lagrum === 1, `antal=${lagrum}`);
OK('juridik: paragraf 2 kap 5 § finns', body.includes('2 kap 5 §'));
const raders = ['rekommenderar att köp', 'rekommenderar köp', 'bör köpa', 'ska köpa', 'köp aktien', 'sälj aktien', 'tidsinvestera', 'är ett köp', 'ge köpsignal'];
let radTr = 0; for (const r of raders) if (body.toLowerCase().includes(r)) radTr++;
OK('juridik: rådmönster 0', radTr === 0, `träffar=${radTr}`);
const disclaimer = 'inte en rekommendation att köpa, sälja eller behålla några värdepapper';
OK('juridik: standard-disclaimer i ingress', body.includes(disclaimer));
const sistaRad = body.trimEnd().split('\n').pop();
OK('disclaimer sista raden (R2 + utbildning)', sistaRad.includes('2007:528') && sistaRad.includes('kundens beslut (R2)'));

// 8) språkgrind — CJK/kyrilliska/grekiska läckor
const cjk = body.match(/[\u4e00-\u9fff\u3040-\u30ff\u0400-\u04ff\u0370-\u03ff]/g) || [];
OK('språkgrind: 0 icke-latinska läckor', cjk.length === 0, `tecken=${cjk.join('')}`);

// 9) externa URL:er endast chevron.com
const ext = [...body.matchAll(/https?:\/\/([^/)\s]+)/g)].map(m => m[1]);
OK('externa URL:er endast chevron.com', ext.every(h => h.endsWith('chevron.com')), `hittade: ${[...new Set(ext)].join(',')}`);

// 10) internlänkar
const traffade = [...body.matchAll(/\]\((\/[^)]+)\)/g)].map(m => m[1]);
const interna = [...new Set(traffade)].filter(u => !u.startsWith('/http'));
OK('internlänkar >= 18', interna.length >= 18, `antal=${interna.length}`);
if (HTTP) {
  for (const u of interna) {
    const kod = await fetch('http://localhost:3000' + u, { redirect: 'manual' }).then(r => r.status).catch(() => 'ERR');
    OK('HTTP ' + u, kod === 200 || kod === 308, `status=${kod}`);
  }
}

console.log(`KVD CVX — ${pass.length} kontroller gröna, ${fell.length} fel`);
for (const f of fell) console.log(f);
process.exit(fell.length ? 1 : 0);
