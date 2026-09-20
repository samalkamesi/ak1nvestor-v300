#!/usr/bin/env node
// s4-u1 Catena — KVD (kvalitetsverifiering, oberoende omräkning)
// Läser PAKETET + källorna, omräknar varenda tal med egen aritmetik
// (importerar INTE byggdatamotorn), kontrollerar struktur, juridik,
// språk, länkar (HTTP mot localhost) och källtalsparitet.
// Utgångskod 0 = GRÖN (0 FEL, 0 VARNING), annars 1.
import { readFileSync } from 'node:fs';

const P = JSON.parse(readFileSync('data/blogg-utkast/kvartal/2026-q3/sa-laser-du-catena-q3-2026.json', 'utf8'));
const U = JSON.parse(readFileSync('data/portfolj-system/bolagsunivers.json', 'utf8'));
const list = Array.isArray(U) ? U : (U.bolag || U.poster || U.universum || Object.values(U).find(Array.isArray));
const C = list.find(p => p.ticker === 'CATE.ST');
const NN = JSON.parse(readFileSync('data/cache/netnet-CATE_ST.json', 'utf8')).data;
const body = P.body;

let pass = 0, fel = [], varning = [];
const ok = (villkor, namn, detalj = '') => { if (villkor) pass++; else fel.push(`${namn}${detajSuffix(detalj)}`); };
const warn = (villkor, namn, detalj = '') => { if (villkor) pass++; else varning.push(`${namn}${detajSuffix(detalj)}`); };
function detajSuffix(d) { return d ? ` — ${d}` : ''; }
// flyttalsdamm-säker jämförelse (Kambi-klassens lärdom)
const approx = (faktisk, forv, tol, namn) => ok(Math.abs(faktisk - forv) <= tol + 1e-9, namn, `faktiskt ${faktisk} förväntat ${forv} ±${tol}`);

// ---------- 1. STRUKTUR ----------
ok(P.slug === 'sa-laser-du-catena-q3-2026', 'slug korrekt');
ok(P.pillar === 'Institutionell metodik', 'pillar');
ok(P.author === 'AK1A Research Lab', 'author');
ok(P.publishedAt === '2026-10-23', 'publishedAt = rappdagen');
ok(Array.isArray(P.tags) && P.tags.length >= 5, 'tags ≥ 5', P.tags?.length + '');
const h2 = (body.match(/^## /gm) || []).length;
ok(h2 >= 7 && h2 <= 13, 'H2 7–13 (familjepraxis: AT&T 13, Balder 7)', h2 + '');
const tabeller = (body.match(/^\|---/gm) || []).length;
ok(tabeller === 2, 'tabeller = 2 (bransch + scenario)', tabeller + '');
const ord = body.replace(/\[([^\]]*)\]\([^)]*\)/g, '$1').replace(/[#|*`>]/g, ' ').split(/\s+/).filter(Boolean).length;
ok(ord >= 2200 && ord <= 3900, 'ordtal 2200–3900 (familjepraxis: AT&T 2266 – Vår Energi 3784)', ord + '');
ok(P.readingMinutes === Math.max(1, Math.round(ord / 600)), 'readingMinutes = round(ord/600)', `${P.readingMinutes} mot ${Math.round(ord / 600)}`);
ok(typeof P.description === 'string' && P.description.length > 300 && P.description.length < 1100, 'description-längd', P.description?.length + '');
ok(P.title.length > 100 && P.title.length < 400, 'title-längd', P.title.length + '');

// ---------- 2. KÄLLTALSPARITET (paketets tal == källornas fält) ----------
const paritet = [
  ['390', C.pris], ['25,9', C.marknadsKapitalMdr],
  ['11,437', C.vardering.pe], ['0,946', C.vardering.pb], ['20,824', C.vardering.evEbit],
  ['9,17', C.vardering.peg], ['5,26', C.vardering.fcfYield * 100],
  ['8,51', C.lonksamhet.roe * 100], ['4,60', C.lonksamhet.roic * 100],
  ['82,79', C.lonksamhet.bruttoMarginal * 100], ['84,86', C.lonksamhet.ebitMarginal * 100],
  ['75,04', C.lonksamhet.nettoMarginal * 100], ['47,57', C.lonksamhet.fcfMarginal * 100],
  ['0,93', C.stabilitet.skuldEgenkapital], ['25,5', C.tillvaxt.omsattningTillvaxtTTM * 100],
  ['5,81', C.tillvaxt.prognosTillvaxt * 100],
  ['19,74', C.tillvaxt.omsattningCAGR5ar * 100], ['6,26', Math.abs(C.tillvaxt.resultatCAGR5ar) * 100],
  ['412,46', C.golv.vardePerAktie], ['5,45', C.golv.marginal * 100],
  ['366,40', NN.kurs], ['0,8883', NN.pb], ['10,7638', NN.pe], ['−297,91', -NN.ncavPerAktie],
];
for (const [str, falt] of paritet) {
  const iText = body.includes(str) || P.description.includes(str) || P.title.includes(str);
  ok(iText, `källtal ${str} finns i texten`);
  const siffra = parseFloat(str.replace(/[−\s]/g, '').replace(',', '.'));
  approx(siffra, falt, Math.abs(falt) < 10 ? 0.005 + Math.abs(falt) * 0.0005 : 0.05, `källtal ${str} == fältet ${falt}`);
}
// serier (svensk tusentalsseparator med vanligt mellanslag är seriens konvention)
const tusen = (x) => String(x).replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
for (const [ar, oms, res] of [[2022, 1544, 1996], [2023, 1808, 986], [2024, 2193, 1080], [2025, 2651, 1644]]) {
  ok((body.includes(String(oms)) || body.includes(tusen(oms))) && (body.includes(String(res)) || body.includes(tusen(res))), `serien ${ar} (${oms}/${res}) i texten`);
  const post = C.serier.ar.indexOf(String(ar));
  approx(oms, C.serier.omsattning[post] / 1e6, 0.5, `serietal oms ${ar}`);
  approx(res, C.serier.resultat[post] / 1e6, 0.5, `serietal res ${ar}`);
}

// ---------- 3. ARITMETIK (oberoende omräkning av paketets påståenden) ----------
const A = (x) => Math.round(x * 10000) / 10000;
const arit = [
  [() => A(C.vardering.pb / C.lonksamhet.roe), '11,12', 0.005, 'identitet P/B÷ROE = 11,12'],
  [() => A(C.vardering.pe / (C.vardering.pb / C.lonksamhet.roe) - 1) * 100, '2,9', 0.05, 'källan 2,9 % över identiteten'],
  [() => A(C.vardering.pe * C.lonksamhet.roe), '0,9733', 0.0001, 'omvänd identitet 0,9733'],
  [() => A(C.pris / C.vardering.pe), '34,10', 0.005, 'implicit EPS 34,10'],
  [() => A(C.pris / C.vardering.pb), '412,26', 0.005, 'implicit EK 412,26'],
  [() => A(NN.kurs / NN.pb), '412,47', 0.005, 'netnet EK 412,47'],
  [() => A(Math.max(C.pris / C.vardering.pb, C.golv.vardePerAktie, NN.kurs / NN.pb) - Math.min(C.pris / C.vardering.pb, C.golv.vardePerAktie, NN.kurs / NN.pb)), '0,21', 0.005, 'tre-vägs spänn 0,21 kr'],
  [() => A((NN.kurs / NN.pb) / (C.pris / C.vardering.pb) - 1) * 100, '0,05', 0.006, 'spänn 0,05 %'],
  [() => A(NN.kurs / C.pris - 1) * 100, '−6,05', 0.005, 'kursdelta −6,05'],
  [() => A(NN.pb / C.vardering.pb - 1) * 100, '−6,10', 0.005, 'P/B-delta −6,10'],
  [() => A(NN.pe / C.vardering.pe - 1) * 100, '−5,89', 0.005, 'P/E-delta −5,89'],
  [() => A((NN.kurs / NN.pe) / (C.pris / C.vardering.pe) - 1) * 100, '−0,18', 0.005, 'EPS-nämnare −0,18'],
  [() => A(C.marknadsKapitalMdr * 1000 / C.vardering.pe), '2 264', 0.5, 'trailing-vinst 2 264 Mkr'],
  [() => A((C.marknadsKapitalMdr * 1000 / C.vardering.pe) / 1644 - 1) * 100, '37,7', 0.05, 'vinstgap +37,7 %'],
  [() => A(C.marknadsKapitalMdr * 1e9 / C.serier.resultat[3]), '15,75', 0.005, 'P/E på bokslut 15,75'],
  [() => A((C.marknadsKapitalMdr * 1000 / C.vardering.pe) / C.lonksamhet.nettoMarginal), '3 017', 0.5, 'trailing-intäkt 3 017'],
  [() => A((C.marknadsKapitalMdr * 1000 / C.vardering.pe) / C.lonksamhet.nettoMarginal - 2873), '144', 0.5, 'intäkts-gap 144 Mkr'],
  [() => A(C.vardering.pe / (C.tillvaxt.prognosTillvaxt * 100)), '1,97', 0.005, 'PEG-konvention 1,97'],
  [() => A(C.vardering.peg / (C.vardering.pe / (C.tillvaxt.prognosTillvaxt * 100))), '4,66', 0.005, 'PEG-kvot 4,66'],
  [() => A(1 - C.pris / C.golv.vardePerAktie) * 100, '5,4', 0.05, 'golvrabatt 5,4 %'],
  [() => A(Math.pow(2651 / 1544, 1 / 3) - 1) * 100, '19,74', 0.005, 'oms-CAGR 19,74'],
  [() => A(Math.pow(1644 / 1996, 1 / 3) - 1) * 100, '−6,26', 0.005, 'res-CAGR −6,26'],
  [() => A(1808 / 1544 - 1) * 100, '17,1', 0.05, 'årssteg 2023 +17,1'],
  [() => A(2193 / 1808 - 1) * 100, '21,3', 0.05, 'årssteg 2024 +21,3'],
  [() => A(2651 / 2193 - 1) * 100, '20,9', 0.05, 'årssteg 2025 +20,9'],
  [() => A(1644 / 1996 - 1) * 100, '−17,6', 0.05, 'ändpunkter −17,6 %'],
  [() => A(1996 / 1544) * 100, '129,3', 0.05, '2022-kvot 129,3 %'],
  [() => A(809 / 644 - 1) * 100, '25,6', 0.05, 'Q2-kvartal +25,6 %'],
  [() => A(701 / 644 - 1) * 100, '8,9', 0.05, 'Q1-kvartal +8,9 %'],
  [() => 675 + 688 + 701 + 809, '2 873', 0.0001, 'rullande fyra 2 873'],
  [() => A(2651 - 1963), '688', 0.0001, 'Q4-25 = 688 (härledning)'],
  [() => A(1510 - 701), '809', 0.0001, 'Q2-26 = 809 (härledning)'],
  [() => A(1963 - 1288), '675', 0.0001, 'Q3-25 = 675 (härledning)'],
  [() => A(916 - 424), '492', 0.0001, 'förv Q2-26 = 492'],
  [() => A(464 - 424), '40', 0.0001, 'värdeposter Q1 +40 Mkr'],
  [() => A(2651 * 0.8486), '2 249,6', 0.05, 'bas-EBIT 2 249,6'],
  [() => A(2651 * 0.01), '26,5', 0.05, '1 pp = 26,5 Mkr'],
  [() => A(2651 * 0.03 * 0.8486), '67,5', 0.05, '3 % intäkter = 67,5 Mkr'],
  [() => A(1 / (3 * 0.8486)), '0,39', 0.005, 'marginalvikt 0,39'],
  [() => A(0.8486 * 100 - 0.8279 * 100), '2,1', 0.05, 'EBIT−brutto 2,1 pp'],
  [() => A(84.86 - 75.04), '9,8', 0.05, 'EBIT−netto 9,8 pp'],
  [() => A(C.vardering.pe / (1 + C.tillvaxt.prognosTillvaxt)), '10,81', 0.005, 'multipelövning 10,81'],
];
for (const [fn, str, tol, namn] of arit) {
  const forv = parseFloat(str.replace(/[−\s]/g, '').replace(',', '.'));
  const negativ = str.includes('−');
  const faktisk = fn();
  // seriens konvention: negativa tal skrivs "minus X" i löptext, "−X" i tabeller — båda söks
  const ordForm = str.replace('−', 'minus ');
  ok(body.includes(str) || body.includes(ordForm) || P.description.includes(str) || P.title.includes(str), `talet ${str} i texten (${namn})`);
  approx(negativ ? -faktisk : faktisk, forv, tol, namn);
}
// scenarioruta 9/9 celler (oberoende, på EXAKT bas 2651×(1±0,03) — ej avrundade radetiketter)
const celler = [];
for (const dO of [-0.03, 0, 0.03]) for (const dM of [-0.01, 0, 0.01]) celler.push([2651 * (1 + dO), 0.8486 + dM, '']);
const cellTal = ['2 156,4', '2 182,1', '2 207,9', '2 223,1', '2 249,6', '2 276,1', '2 289,8', '2 317,1', '2 344,4'];
celler.forEach((c, i) => { c[2] = cellTal[i]; });
for (const [o, m, s] of celler) { approx(Math.round(o * m * 10) / 10, parseFloat(s.replace(/\s/g, '').replace(',', '.')), 0.05, `cell ${s}`); ok(body.includes(s), `cell ${s} i texten`); }

// ---------- 4. MEDIANER OCH RANG (live ur dagens fil) ----------
const fast = list.filter(p => p.bransch === 'fastighet');
const med = (a) => { const v = a.filter(x => x !== null && x !== undefined).sort((x, y) => x - y); const m = Math.floor(v.length / 2); return v.length % 2 ? v[m] : (v[m - 1] + v[m]) / 2; };
const medTest = [
  ['14,38', med(fast.map(p => p.vardering?.pe))], ['0,946', med(fast.map(p => p.vardering?.pb))],
  ['8,57', med(fast.map(p => p.lonksamhet?.roe)) * 100], ['57,37', med(fast.map(p => p.lonksamhet?.ebitMarginal)) * 100],
  ['43,58', med(fast.map(p => p.lonksamhet?.nettoMarginal)) * 100], ['1,10', med(fast.map(p => p.stabilitet?.skuldEgenkapital))],
  ['20,52', med(list.map(p => p.vardering?.pe))], ['2,73', med(list.map(p => p.vardering?.pb))],
  ['14,66', med(list.map(p => p.lonksamhet?.roe)) * 100], ['21,11', med(list.map(p => p.lonksamhet?.ebitMarginal)) * 100],
  ['14,00', med(list.map(p => p.lonksamhet?.nettoMarginal)) * 100], ['0,53', med(list.map(p => p.stabilitet?.skuldEgenkapital))],
];
for (const [s, v] of medTest) { const f = parseFloat(s.replace(',', '.')); approx(A(v) * (Math.abs(f) < 1 ? 1 : 1), f, Math.abs(f) > 10 ? 0.05 : 0.005, `median ${s}`); ok(body.includes(s), `median ${s} i texten`); }
// rang: EBIT högst av 17, netto 2:a, skuld 5:e lägst (13:e högst), P/B rang 9 = medianpost, TTM högst i grenen, FCF 4:a
const rangDesc = (get) => [...fast.map(get).filter(x => x !== null && x !== undefined)].sort((a, b) => b - a).indexOf(get(C)) + 1;
ok(rangDesc(p => p.lonksamhet?.ebitMarginal) === 1, 'EBIT högst av grenen', rangDesc(p => p.lonksamhet?.ebitMarginal) + '');
ok(rangDesc(p => p.lonksamhet?.nettoMarginal) === 2, 'netto 2:a av grenen', rangDesc(p => p.lonksamhet?.nettoMarginal) + '');
ok(rangDesc(p => p.stabilitet?.skuldEgenkapital) === 13, 'skuld 13:e högst = 5:e lägst av 17', rangDesc(p => p.stabilitet?.skuldEgenkapital) + '');
ok(rangDesc(p => p.vardering?.pb) === 9, 'P/B rang 9 av 17 = medianposten', rangDesc(p => p.vardering?.pb) + '');
ok(rangDesc(p => p.tillvaxt?.omsattningTillvaxtTTM) === 1, 'TTM-tillväxt högst av grenen', rangDesc(p => p.tillvaxt?.omsattningTillvaxtTTM) + '');
ok(rangDesc(p => p.vardering?.fcfYield) === 4, 'FCF-yield 4:e högst av 16', rangDesc(p => p.vardering?.fcfYield) + '');
const pegG = [...fast.map(p => p.vardering?.peg).filter(Boolean)].sort((a, b) => b - a);
ok(pegG.indexOf(C.vardering.peg) === 1, 'PEG 2:a i grenen', pegG.indexOf(C.vardering.peg) + 1 + '');
ok(body.includes('231 poster'), 'universum-n 231 redovisat');
ok(body.includes('129,3 procent av intäkterna') || body.includes('129,3 procent'), '2022-kvoten 129,3 %');

// ---------- 5. JURIDIKGRINDEN ----------
const lagrum = body.match(/2007:528/g) || [];
ok(lagrum.length === 1, 'exakt ett lagrum 2007:528', lagrum.length + '');
const frammande = ['2022:260', '2022:261', '1985:716', '2005:59', 'LEK 2022', '2 kap 5 §'].filter(s => body.includes(s));
ok(frammande.length === 0, 'inga främmande lagrum', frammande.join(',') || '0');
const radUtan = body.split('.');
const radglosor = ['rekommenderar att du köper', 'bör du köpa', 'bör du sälja', 'vi tipsar', 'köp aktien', 'sälj aktien', ' stark köp', 'strong buy'].filter(s => body.toLowerCase().includes(s));
ok(radglosor.length === 0, '0 rådglosor', JSON.stringify(radglosor));
const negeringskontext = ['inte en rekommendation att köpa', 'aldrig råd', 'inga köp-, sälj-'];
ok(negeringskontext.some(s => body.includes(s)), 'utbildningsdisclaimer närvarande');
const sistaRad = body.trimEnd().split('\n').pop();
ok(sistaRad.includes('2007:528') && sistaRad.includes('R2'), 'disclaimer-juridikrad är sista raden');
ok(body.includes('kundens beslut'), 'publicering = kundens beslut (R2)');

// ---------- 6. SPRÅKGRIND ----------
ok(!/[\u201c\u201d\u2018\u2019]/.test(body), 'inga typografiska citat');
ok(!/\t/.test(body), 'inga tabbar');
ok(!/[\u4e00-\u9fff\u3040-\u30ff\u0400-\u04ff]/.test(body), 'ingen CJK/kyrilliska');
const dubbel = (body.match(/[^|\n] {2,}[^|\n]/g) || []).length;
ok(dubbel === 0, 'inga dubbla mellanslag utanför tabeller', dubbel + '');

// ---------- 7. LÄNKAR ----------
const interna = [...new Set([...body.matchAll(/\]\((\/[^)]+)\)/g)].map(m => m[1]))];
const tillatnaPrefix = ['/dataset/fastighet/', '/bolag/', '/kurser', '/transparens', '/kallor'];
const otillata = interna.filter(l => !tillatnaPrefix.some(p => l.startsWith(p)));
ok(otillata.length === 0, 'interna länkar inom tillåtna uppsättningar', otillata.join(',') || '0');
const externa = [...new Set([...body.matchAll(/\]\((https?:\/\/[^)]+)\)/g)].map(m => m[1]))];
const otillataExt = externa.filter(l => !/^https:\/\/www\.catena\.se/.test(l));
ok(otillataExt.length === 0, 'externa URL:er endast catena.se', otillataExt.join(',') || '0');

// HTTP 200 mot localhost (prod-servern)
const res = [];
for (const l of interna) {
  try { const r = await fetch('http://localhost:3000' + l); res.push([l, r.status]); } catch (e) { res.push([l, 'ERR ' + e.message]); }
}
const doda = res.filter(([l, s]) => s !== 200);
ok(doda.length === 0, `interna länkar HTTP 200 (${res.filter(r => r[1] === 200).length}/${res.length})`, doda.map(d => d.join(' ')).join(', ') || '0 döda');

// ---------- RAPPORT ----------
console.log(`KVD Catena: ${pass} PASS, ${varning.length} VARNING, ${fel.length} FEL`);
if (varning.length) console.log('VARNINGAR:\n' + varning.map(v => ' - ' + v).join('\n'));
if (fel.length) console.log('FEL:\n' + fel.map(f => ' - ' + f).join('\n'));
console.log(`ord: ${ord} | H2: ${h2} | interna länkar: ${res.length} (200: ${res.filter(r => r[1] === 200).length}) | externa: ${externa.length}`);
process.exit(fel.length ? 1 : 0);
