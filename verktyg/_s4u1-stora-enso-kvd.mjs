#!/usr/bin/env node
// KVD s4-u1 (manifest auto-s4-1789786525981) — Stora Enso Q3-läspaket (pivot från Kinnevik).
// Oberoende omräkning av ALLA tal i paketet mot bolagsuniversumet + sökverifierade rapportfakta.
// Utgångskod 0 = GRÖN (0 FEL, 0 VARNING). Alla kontroller räknas och rapporteras.
// LÄNKGRIND under deploy-fönster (våg 195 bevakas i worklog): giltighet = HTTP 200 ELLER URL i
// sitemap.xml (plattformens sanna URL-uppsättning); HTTP-avvikelser loggas som INFO, ej FEL.
import { readFileSync } from 'node:fs';

const PAKET = '/home/ak1a/AK1/data/blogg-utkast/kvartal/2026-q3/sa-laser-du-stora-enso-q3-2026.json';
const UNI = '/home/ak1a/AK1/data/portfolj-system/bolagsunivers.json';
let PASS = 0, FEL = 0, VARN = 0;
const ok = (namn, villkor, detalj = '') => { if (villkor) { PASS++; } else { FEL++; console.log('FEL: ' + namn + (detalj ? ' — ' + detalj : '')); } };
const warn = (namn, villkor, detalj = '') => { if (villkor) PASS++; else { VARN++; console.log('VARNING: ' + namn + (detalj ? ' — ' + detalj : '')); } };
const nra = (x, d = 2) => Number(x.toFixed(d));
const sv = x => x.toLocaleString('sv-SE').replace(/\u00A0/g, ' ');

const j = JSON.parse(readFileSync(PAKET, 'utf8'));
const b = j.body;
const u = JSON.parse(readFileSync(UNI, 'utf8'));
const list = Array.isArray(u) ? u : (u.bolag || u.universum);
const p = list.find(x => x.ticker === 'STERV.HE');

// ===== 1. STRUKTUR =====
ok('JSON tolkar', true);
for (const f of ['slug', 'title', 'description', 'pillar', 'author', 'publishedAt', 'readingMinutes', 'tags', 'body']) ok('fält ' + f, typeof j[f] !== 'undefined' && j[f] !== null && j[f] !== '');
ok('slug = filnamn', j.slug === 'sa-laser-du-stora-enso-q3-2026');
ok('pillar', j.pillar === 'Institutionell metodik');
ok('author', j.author === 'AK1A Research Lab');
ok('publishedAt = rappdag', j.publishedAt === '2026-10-30');
ok('tags innehåller kvartalsrapport + Stora Enso', j.tags.includes('kvartalsrapport') && j.tags.some(t => /stora enso/i.test(t)));
const ord = b.split(/\s+/).filter(Boolean).length;
ok('ordantal > 1500', ord > 1500, 'ord=' + ord);
ok('readingMinutes = round(ord/600)', j.readingMinutes === Math.round(ord / 600), ord + ' ord => ' + Math.round(ord / 600));
ok('description 140–155 tecken', j.description.length >= 140 && j.description.length <= 155, j.description.length + ' tecken');
const h2 = b.split('\n').filter(l => /^## /.test(l)).map(l => l.replace(/^## /, ''));
ok('7 H2-rubriker', h2.length === 7, h2.length + ' st');
for (const rub of ['Urvalet', 'Nyckeltalen', 'Datavakten', 'Så står sig bolaget mot branschen', 'Tre sätt att läsa utfallet', 'Praktiskt inför 30 oktober', 'Källor']) ok('rubrik ' + rub, h2.some(h => h.includes(rub)));

// ===== 2. KÄLLTALSPARITET mot STERV.HE-posten =====
const P = { pris: p.pris, mcap: p.marknadsKapitalMdr, pe: p.vardering.pe, pb: p.vardering.pb, evEbit: p.vardering.evEbit, peg: p.vardering.peg, fcfY: p.vardering.fcfYield, roe: p.lonksamhet.roe, roic: p.lonksamhet.roic, brutto: p.lonksamhet.bruttoMarginal, ebit: p.lonksamhet.ebitMarginal, netto: p.lonksamhet.nettoMarginal, fcf: p.lonksamhet.fcfMarginal, sk: p.stabilitet.skuldEgenkapital, cagr: p.tillvaxt.omsattningCAGR5ar, resCagr: p.tillvaxt.resultatCAGR5ar, ttm: p.tillvaxt.omsattningTillvaxtTTM, prog: p.tillvaxt.prognosTillvaxt };
ok('pris 10,15', b.includes('10,15'));
ok('mcap 8,004', b.includes('8,004'));
ok('P/E 14,097', b.includes('14,097'));
ok('P/B 0,741', b.includes('0,741'));
ok('EV/EBIT 27,983', b.includes('27,983'));
ok('PEG 41,2', b.includes('41,2'));
ok('fcfYield 9,42', b.includes('9,42'));
ok('ROE 5,44', b.includes('5,44'));
ok('ROIC 2,98', b.includes('2,98'));
ok('brutto 24,69', b.includes('24,69'));
ok('EBIT-marg 4,04', b.includes('4,04'));
ok('netto 6,19', b.includes('6,19'));
ok('FCF-marg 8,09', b.includes('8,09'));
ok('skuldkvot 0,3636', b.includes('0,3636'));
ok('omsCAGR −7,23', b.includes('7,23'));
ok('resCAGR −23,23', b.includes('23,23'));
ok('TTM −0,1', b.includes('0,1 procent'));
ok('prognos 52,68', b.includes('52,68'));
// serier
ok('oms 11 680', b.includes('11 680'));
ok('oms 9 396', b.includes('9 396'));
ok('oms 9 049', b.includes('9 049'));
ok('oms 9 326', b.includes('9 326'));
ok('res +1 536', b.includes('1 536'));
ok('res −357', b.includes('357'));
ok('res −136', b.includes('136'));
ok('res +695', b.includes('695'));
// nullfält redovisas öppet
ok('räntetäckning osatt', /räntetäckningsfältet är osatt|räntetäckning[^.]*osatt/i.test(b));
ok('enkelkällat MarketStack redovisat', b.includes('MarketStack'));
ok('utanför motor+vågvalidering redovisat', /varken av analysmotorn|mäts varken av analysmotorn/.test(b) && /vågvalideringens tolvbolagsuniversum/.test(b));

// ===== 3. ARITMETIK — oberoende omräkning =====
const oms = p.serier.omsattning.map(x => x / 1e6), res = p.serier.resultat.map(x => x / 1e6);
// årssteg omsättning
const steg = oms.slice(1).map((v, i) => v / oms[i] - 1);
ok('årssteg −19,55', b.includes('19,55') && nra(steg[0] * 100) === -19.55, (steg[0] * 100).toFixed(2));
ok('årssteg −3,69', b.includes('3,69') && nra(steg[1] * 100) === -3.69, (steg[1] * 100).toFixed(2));
ok('årssteg +3,06', b.includes('3,06') && nra(steg[2] * 100) === 3.06, (steg[2] * 100).toFixed(2));
ok('totalt −20,15', b.includes('20,15') && nra(oms[3] / oms[0] * 100 - 100, 2) === -20.15, (oms[3] / oms[0] * 100 - 100).toFixed(2));
// nettomarginalserie
const nm = res.map((r, i) => r / oms[i]);
ok('nettomarginalserie 13,15', b.includes('13,15') && nra(nm[0] * 100) === 13.15, (nm[0] * 100).toFixed(2));
ok('nettomarginalserie −3,80', b.includes('3,80') && nra(nm[1] * 100) === -3.8, (nm[1] * 100).toFixed(2));
ok('nettomarginalserie −1,50', b.includes('1,50') && nra(nm[2] * 100) === -1.5, (nm[2] * 100).toFixed(2));
ok('nettomarginalserie 7,45', b.includes('7,45') && nra(nm[3] * 100) === 7.45, (nm[3] * 100).toFixed(2));
// CAGR-kontroll (datavakt: källfält vs egen omräkning)
const egenCagr = (oms[3] / oms[0]) ** 0.25 - 1;
ok('egen omsCAGR −5,47', b.includes('5,47') && nra(egenCagr * 100) === -5.47, (egenCagr * 100).toFixed(2));
const egenResCagr = (res[3] / res[0]) ** 0.25 - 1;
ok('egen resCAGR −17,98', b.includes('17,98') && nra(egenResCagr * 100) === -17.98, (egenResCagr * 100).toFixed(2));
ok('CAGR-kvoter 1,32/1,29', b.includes('1,32') && b.includes('1,29') && nra(Math.abs(P.cagr / egenCagr), 2) === 1.32 && nra(Math.abs(P.resCagr / egenResCagr), 2) === 1.29, (Math.abs(P.cagr / egenCagr)).toFixed(2) + '/' + (Math.abs(P.resCagr / egenResCagr)).toFixed(2));
// resultatsteg
ok('res-steg 2022→2023 −123,24', b.includes('123,24') && nra(res[1] / res[0] * 100 - 100) === -123.24, (res[1] / res[0] * 100 - 100).toFixed(2));
ok('vändning −136 → +695: klipp 831 M€ = 611 % av förlusten', b.includes('831') && b.includes('611') && Math.round(res[3] - res[2]) === 831 && Math.round(Math.abs(res[3] / res[2] * 100 - 100)) === 611, (res[3] - res[2]).toFixed(0) + '/' + Math.abs(res[3] / res[2] * 100 - 100).toFixed(2));
// identitet P/E = P/B / ROE
const ident = P.pb / P.roe;
ok('identitet 13,62', b.includes('13,62') && nra(ident) === 13.62, ident.toFixed(3));
const identAvv = Math.abs(ident - P.pe) / P.pe * 100;
ok('identitetsavvikelse 3,37', b.includes('3,37') && nra(identAvv) === 3.37, identAvv.toFixed(2));
// PEG-datavakt
const pegConv = P.pe / (P.prog * 100);
ok('PEG-konvention 0,27', b.includes('0,27') && nra(pegConv) === 0.27, pegConv.toFixed(4));
const pegKvot = P.peg / pegConv;
ok('PEG-kvot 154', b.includes('154') && Math.round(pegKvot) === 154, pegKvot.toFixed(1));
const pegImpl = P.pe / P.peg;
ok('implicit PEG-tillväxt 0,34', b.includes('0,34') && nra(pegImpl, 2) === 0.34, pegImpl.toFixed(4));
// EV-kedja
const ttmOms = oms[3] * (1 + P.ttm);
ok('TTM-oms 9 317', b.includes('9 317') && Math.round(ttmOms) === 9317, ttmOms.toFixed(0));
const ebitTTM = P.ebit * ttmOms;
ok('EBIT TTM 376', b.includes('376') && nra(ebitTTM, 0) === 376, ebitTTM.toFixed(0));
const ek = P.mcap / P.pb;
ok('EK härled 10,80', b.includes('10,80') && nra(ek, 2) === 10.8, ek.toFixed(2));
const skuld = ek * P.sk;
ok('skuld 3,93', b.includes('3,93') && nra(skuld, 2) === 3.93, skuld.toFixed(2));
const evFalt = P.evEbit * ebitTTM / 1000;
ok('EV ur fält 10,53', b.includes('10,53') && nra(evFalt, 2) === 10.53, evFalt.toFixed(3));
const resid = evFalt - skuld;
ok('EV − skuld 6,61', b.includes('6,61') && nra(resid, 2) === 6.61, resid.toFixed(3));
const residGap = (resid - P.mcap) / P.mcap * 100;
ok('residualgap −17,5', b.includes('17,5') && nra(residGap, 1) === -17.5, residGap.toFixed(2));
// substansrabatt + P/B-kvot
ok('substansrabatt 25,9', b.includes('25,9') && nra((1 - P.pb) * 100, 1) === 25.9, ((1 - P.pb) * 100).toFixed(1));
const pbMedianKvot = 1.58 / P.pb;
ok('P/B-mediankvot 2,13', b.includes('2,13') && nra(pbMedianKvot) === 2.13, pbMedianKvot.toFixed(2));
// utdelning
const dir = 0.25 / P.pris * 100;
ok('direktavkastning 2,46', b.includes('2,46') && nra(dir) === 2.46, dir.toFixed(2));
// kvartalsfakta-marginaler
ok('Q3-2025-marginal 5,52', b.includes('5,52') && nra(126 / 2283 * 100) === 5.52, (126 / 2283 * 100).toFixed(2));
ok('Q2-2026-marginal 6,60', b.includes('6,60') && nra(160 / 2423 * 100) === 6.6, (160 / 2423 * 100).toFixed(2));
ok('Q2-2025-marginal 5,19', b.includes('5,19') && nra(126 / 2426 * 100) === 5.19, (126 / 2426 * 100).toFixed(2));
ok('Q1-2026-marginal 6,74', b.includes('6,74') && nra(159 / 2358 * 100) === 6.74, (159 / 2358 * 100).toFixed(2));
ok('H1-2026 4 781 mot 4 788', b.includes('4 781') && b.includes('4 788') && (2358 + 2423 === 4781) && (2362 + 2426 === 4788));
ok('H1-EBIT 319 mot 301 (+6,0)', b.includes('319') && b.includes('301') && b.includes('6,0') && nra(319 / 301 * 100 - 100, 1) === 6.0, (319 / 301 * 100 - 100).toFixed(1));
ok('EBIT-steg Q2 +27 %', b.includes('plus 27 procent') && Math.round(160 / 126 * 100 - 100) === 27);
ok('9M-2025 7 071 / 427', b.includes('7 071') && b.includes('427') && (2362 + 2426 + 2283 === 7071) && (175 + 126 + 126 === 427));

// ===== 4. MEDIANER + RANG (färsk omräkning ur 195-postfilen) =====
const mat = list.filter(x => x.bransch === 'material');
const median = a => { const s = a.filter(Number.isFinite).sort((x, y) => x - y); const m = Math.floor(s.length / 2); return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2; };
const rankDesc = (a, v) => a.filter(Number.isFinite).sort((x, y) => y - x).indexOf(v) + 1;
const nAv = a => a.filter(Number.isFinite).length;
const t = {
  'P/E median 19,977 (n=20)': { arr: mat.map(x => x.vardering?.pe), medTxt: '19,977', rang: '16/20', v: P.pe },
  'P/B median 1,58 rang 20/21': { arr: mat.map(x => x.vardering?.pb), medTxt: '1,58', rang: '20/21', v: P.pb },
  'EV/EBIT median 14,845 rang 4/20': { arr: mat.map(x => x.vardering?.evEbit), medTxt: '14,845', rang: '4/20', v: P.evEbit },
  'PEG median 1,01 rang 1/20': { arr: mat.map(x => x.vardering?.peg), medTxt: '1,01', rang: '1/20', v: P.peg },
  'fcfYield median 3,03 rang 3/20': { arr: mat.map(x => x.vardering?.fcfYield), medTxt: '3,03', rang: '3/20', v: P.fcfY, frac: true },
  'ROE median 9,43 rang 15/21': { arr: mat.map(x => x.lonksamhet?.roe), medTxt: '9,43', rang: '15/21', v: P.roe, frac: true },
  'ROIC median 8,34 rang 17/20': { arr: mat.map(x => x.lonksamhet?.roic), medTxt: '8,34', rang: '17/20', v: P.roic, frac: true },
  'brutto median 34,92 rang 15/21': { arr: mat.map(x => x.lonksamhet?.bruttoMarginal), medTxt: '34,92', rang: '15/21', v: P.brutto, frac: true },
  'EBIT-marginal median 12,41 rang 19/21': { arr: mat.map(x => x.lonksamhet?.ebitMarginal), medTxt: '12,41', rang: '19/21', v: P.ebit, frac: true },
  'netto median 9,26 rang 14/21': { arr: mat.map(x => x.lonksamhet?.nettoMarginal), medTxt: '9,26', rang: '14/21', v: P.netto, frac: true },
  'FCF-marginal median 8,09 rang 11/21': { arr: mat.map(x => x.lonksamhet?.fcfMarginal), medTxt: '8,09', rang: '11/21', v: P.fcf, frac: true },
  'skuld/EK median 0,32 rang 10/21': { arr: mat.map(x => x.stabilitet?.skuldEgenkapital), medTxt: '0,32', rang: '10/21', v: P.sk },
  'omsCAGR median −1,67': { arr: mat.map(x => x.tillvaxt?.omsattningCAGR5ar), medTxt: '1,67', v: P.cagr, frac: true, neg: true },
  'TTM median 5,8 rang 19/21': { arr: mat.map(x => x.tillvaxt?.omsattningTillvaxtTTM), medTxt: '5,8', rang: '19/21', v: P.ttm, frac: true },
  'prognos median 25,53 rang 7/21': { arr: mat.map(x => x.tillvaxt?.prognosTillvaxt), medTxt: '25,53', rang: '7/21', v: P.prog, frac: true },
  'resCAGR median −21,71 rang 11/18': { arr: mat.map(x => x.tillvaxt?.resultatCAGR5ar), medTxt: '21,71', rang: '11/18', v: P.resCagr, frac: true, neg: true },
};
for (const [namn, d] of Object.entries(t)) {
  const med = median(d.arr);
  const expected = parseFloat(d.medTxt.replace(',', '.'));
  const berk = d.frac ? med * 100 : med;
  const negOk = d.neg ? b.includes('−' + d.medTxt) : true;
  ok('median ' + namn + ' => ' + (d.neg ? '−' : '') + d.medTxt + ' (n=' + nAv(d.arr) + ')', b.includes(d.medTxt) && negOk && Math.abs(Math.abs(berk) - expected) < 0.005, 'beräknad ' + berk.toFixed(4) + ' sökt ' + d.medTxt);
  if (d.rang) { const r = rankDesc(d.arr, d.v); ok('rang ' + namn, d.rang === r + '/' + nAv(d.arr), r + '/' + nAv(d.arr)); }
}
// median-själv på FCF-marginal
const fcfMed = median(mat.map(x => x.lonksamhet?.fcfMarginal));
ok('STERV = FCF-medianen exakt', fcfMed === P.fcf, fcfMed + ' mot ' + P.fcf);
ok('median-själv-formulerat', /exakt grenens medianbelopp/.test(b));

// ===== 5. SCENARIORUTA — 9 celler + marginalvikt =====
const bas = 2283, m = 126 / 2283;
const cell = (dm, do_) => Math.round(bas * (1 + do_) * (m + dm));
let cellsOk = 0;
for (const dm of [-0.01, 0, 0.01]) for (const do_ of [-0.03, 0, 0.03]) { if (b.includes(String(cell(dm, do_)))) cellsOk++; }
ok('scenarioruta 9/9 celler', cellsOk === 9, cellsOk + '/9');
ok('1 pp = 23 M€', b.includes('23 miljoner') && Math.round(bas * 0.01) === 23);
ok('3 % = 3,8 M€', b.includes('3,8 miljoner') && nra(bas * m * 0.03, 1) === 3.8, (bas * m * 0.03).toFixed(2));
ok('marginalvikt 6,04', b.includes('6,04') && nra(1 / (3 * m)) === 6.04, (1 / (3 * m)).toFixed(3));
ok('jämförelsetal 2,6 och 5,16', b.includes('2,6') && b.includes('5,16'));

// ===== 6. SÖKVERIFIERADE RAPPORTFAKTA (paritet mot källraderna) =====
const fakta = ['30 oktober', '08:30 finsk tid', '07:30 svensk', '3 november', '21 dagar', '7 maj', '23 juli', '24 mars 2026', '0,25 euro', 'två omgångar', '2 358', '2 362', '2 423', '2 426', '2 283', '2 261', '175', '159', '160', '126', '16 M€', '64', '12 procent', 'Junnikkala', 'Optimising our portfolio', 'Good progress in a challenging market environment', 'storaenso.com/en/calendar', 'webcast'];
for (const f of fakta) ok('faktatalet ' + f + ' finns', b.includes(f));
ok('serieordning 51', b.includes('nummer 51'));
ok('materialgrenens åttonde', b.includes('åttonde paket'));
ok('tredje Helsingfors-noterade', b.includes('tredje Helsingfors-noterade'));
ok('EUR hela vägen', b.includes('Hela posten är i euro'));
ok('Getinge levererat av syskon', b.includes('leverages') === false && b.includes('levererades av ett syskon'));
ok('gallringskedjan namngiven', b.includes('Wihlborgs-precedensen') && b.includes('Fabege-gallran'));

// ===== 7. JURIDIKGRIND =====
ok('exakt ett lagrum 2007:528', (b.match(/2007:528/g) || []).length === 1);
ok('2 kap 5 § citeras', b.includes('2 kap 5 §'));
const FORBUDNA_LAGRUM = ['2022:260', '2022:261', '1985:716', '2022:482', '2005:59', '4 kap', '1 kap'];
for (const lg of FORBUDNA_LAGRUM) ok('inget främmande lagrum ' + lg, !b.includes(lg));
const radMatches = [...b.matchAll(/.{80}\b(köpa|köper|sälja|säljer|rekommendera|rekommenderar|råd till att)\b/gi)].map(x => x[0]);
const tveksamma = radMatches.filter(ctx => !/inte investeringsrådgivning|Inga köp-, sälj-|nej|aldrig|förbjud|utanför/i.test(ctx));
ok('rådverb endast i nekningskontext', tveksamma.length === 0, tveksamma.length + ' misstänkta: ' + tveksamma.slice(0, 1).join('||').slice(0, 200));
ok('disclaimer-kursiv sista stycke', /\*Detta är pedagogisk finansutbildning/.test(b));

// ===== 8. LÄNKAR (deploy-tolerant grind: 200 ELLER sitemap) =====
const lnkar = [...new Set([...b.matchAll(/\]\((\/[^)#\s]+)\)/g)].map(x => x[1]))];
ok('minst 20 unika interna länkar', lnkar.length >= 20, lnkar.length + ' st');
let sitemap = '';
try { sitemap = (await (await fetch('http://localhost:3000/sitemap.xml')).text()); } catch { sitemap = ''; }
const http = await Promise.all(lnkar.map(async l => {
  try { const r = await fetch('http://localhost:3000' + l); return { l, code: r.status }; } catch { return { l, code: 0 }; }
}));
let driftInfo = [];
for (const h of http) {
  const giltig = h.code === 200 || sitemap.includes(h.l);
  if (h.code !== 200 && giltig) driftInfo.push(h.l + ' (HTTP ' + h.code + ', giltig enligt sitemap — deploy våg 195 pågår)');
  ok('länk giltig: ' + h.l, giltig, 'HTTP ' + h.code + ' och ej i sitemap');
}
if (driftInfo.length) console.log('INFO (drift, ej KVD-fel): ' + driftInfo.join('; '));
ok('bolagssidan länkas', lnkar.includes('/bolag/sterv-he'));
ok('kurser/transparens/kallor', ['/kurser', '/transparens', '/kallor'].every(l => lnkar.includes(l)));
ok('material-aspekter representerade', ['pe', 'pb', 'ev-ebit', 'roe', 'roic', 'brutto-marginal', 'netto-marginal', 'fcf-avkastning', 'skuldsattning', 'vardering', 'universumjamforelse'].every(a => lnkar.includes('/dataset/material/' + a)));

// ===== 9. TECKENGRUND — endast svenska/latinska tecken =====
const susTa = [...b.matchAll(/[\u0400-\u04FF\u4E00-\u9FFF\u3040-\u30FF\u0105\u0104\u0119\u0118\u0142\u0141\u017C\u017B]/g)].map(x => x[0]);
ok('inga kyrilliska/CJK/polska specialtecken', susTa.length === 0, susTa.slice(0, 5).join(' '));

console.log('\n===== KVD STORA ENSO: ' + PASS + ' PASS / ' + FEL + ' FEL / ' + VARN + ' VARNING =====');
console.log('Ord: ' + ord + ' | readingMinutes ' + j.readingMinutes + ' | unika länkar ' + lnkar.length);
process.exit(FEL === 0 && VARN === 0 ? 0 : 1);
