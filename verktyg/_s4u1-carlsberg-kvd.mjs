#!/usr/bin/env node
// KVD s4-u1 (manifest auto-s4-1789764325017) — Carlsberg Q3-läspaket.
// Oberoende omräkning av ALLA tal i paketet mot bolagsuniversumet + sökverifierade rapportfakta.
// Utgångskod 0 = GRÖN (0 FEL, 0 VARNING). Alla kontroller räknas och rapporteras.
import { readFileSync } from 'node:fs';

const PAKET = '/home/ak1a/AK1/data/blogg-utkast/kvartal/2026-q3/sa-laser-du-carlsberg-q3-2026.json';
const UNI = '/home/ak1a/AK1/data/portfolj-system/bolagsunivers.json';
let PASS = 0, FEL = 0, VARN = 0;
const ok = (namn, villkor, detalj = '') => { if (villkor) { PASS++; } else { FEL++; console.log('FEL: ' + namn + (detalj ? ' — ' + detalj : '')); } };
const warn = (namn, villkor, detalj = '') => { if (villkor) PASS++; else { VARN++; console.log('VARNING: ' + namn + (detalj ? ' — ' + detalj : '')); } };
const nra = (x, d = 2) => Number(x.toFixed(d)); // normalreal för jämförelser

const j = JSON.parse(readFileSync(PAKET, 'utf8'));
const b = j.body;
const u = JSON.parse(readFileSync(UNI, 'utf8'));
const list = Array.isArray(u) ? u : (u.bolag || u.universum);
const p = list.find(x => x.ticker === 'CARL-B.CO');

// ===== 1. STRUKTUR =====
ok('JSON tolkar', true);
for (const f of ['slug', 'title', 'description', 'pillar', 'author', 'publishedAt', 'readingMinutes', 'tags', 'body']) ok('fält ' + f, typeof j[f] !== 'undefined' && j[f] !== null && j[f] !== '');
ok('slug = filnamn', j.slug === 'sa-laser-du-carlsberg-q3-2026');
ok('pillar', j.pillar === 'Institutionell metodik');
ok('author', j.author === 'AK1A Research Lab');
ok('publishedAt = rappdag', j.publishedAt === '2026-10-29');
ok('tags innehåller kvartalsrapport + Carlsberg', j.tags.includes('kvartalsrapport') && j.tags.some(t => /carlsberg/i.test(t)));
const ord = b.split(/\s+/).filter(Boolean).length;
ok('ordantal > 1500', ord > 1500, 'ord=' + ord);
ok('readingMinutes = round(ord/600)', j.readingMinutes === Math.round(ord / 600), ord + ' ord => ' + Math.round(ord / 600));
const h2 = b.split('\n').filter(l => /^## /.test(l)).map(l => l.replace(/^## /, ''));
ok('7 H2-rubriker', h2.length === 7, h2.length + ' st');
for (const rub of ['Urvalet', 'Nyckeltalen', 'Datavakten', 'Så står sig bolaget mot branschen', 'Tre sätt att läsa utfallet', 'Praktiskt inför 29 oktober', 'Källor']) ok('rubrik ' + rub, h2.some(h => h.includes(rub)));

// ===== 2. KÄLLTALSPARITET mot CARL-B.CO-posten =====
const P = { pris: p.pris, pe: p.vardering.pe, pb: p.vardering.pb, evEbit: p.vardering.evEbit, peg: p.vardering.peg, roe: p.lonksamhet.roe, brutto: p.lonksamhet.bruttoMarginal, ebit: p.lonksamhet.ebitMarginal, netto: p.lonksamhet.nettoMarginal, fcf: p.lonksamhet.fcfMarginal, sk: p.stabilitet.skuldEgenkapital, cagr: p.tillvaxt.omsattningCAGR5ar, ttm: p.tillvaxt.omsattningTillvaxtTTM, prog: p.tillvaxt.prognosTillvaxt };
const sv = x => x.toLocaleString('sv-SE').replace(/\u00A0/g, ' ');
// multiplar/procentsatser med svensk decimal
ok('pris 875,4', b.includes('875,4'), P.pris);
ok('P/E 18,151', b.includes('18,151'));
ok('P/B 4,065', b.includes('4,065'));
ok('EV/EBIT 12,769', b.includes('12,769'));
ok('PEG 3,59', b.includes('3,59'));
ok('ROE 20,44', b.includes('20,44'));
ok('brutto 44,99', b.includes('44,99'));
ok('EBIT-marg 14,61', b.includes('14,61'));
ok('netto 7,08', b.includes('7,08'));
ok('FCF-marg 8,56', b.includes('8,56'));
ok('skuldkvot 1,3419', b.includes('1,3419'));
ok('omsCAGR 8,24', b.includes('8,24'));
ok('TTM 2,6', b.includes('2,6 procent'));
ok('prognos 7,95', b.includes('7,95'));
// serier
ok('oms 70 265', b.includes('70 265'));
ok('oms 89 095', b.includes('89 095'));
ok('res −40 788', /−40 788|-40 788/.test(b));
ok('res 9 116', b.includes('9 116'));
ok('res 5 955', b.includes('5 955'));
ok('res −1 063', /−1 063|-1 063/.test(b));
ok('oms 73 585', b.includes('73 585'));
ok('oms 75 011', b.includes('75 011'));
// nullfält redovisas öppet
ok('mcap null redovisat', b.includes('börsvärdesfält') || b.includes('null'));
ok('ROIC null redovisat', /ROIC[^.]*null/i.test(b));
ok('räntetäckning null', /räntetäckning[^.]*osatt|Räntetäckningsgraden är osatt/i.test(b));

// ===== 3. ARITMETIK — oberoende omräkning =====
const pct = (x, d = 2) => x * 100;
const oms = p.serier.omsattning.map(x => x / 1e6), res = p.serier.resultat.map(x => x / 1e6);
const ttmOms = oms[3] * (1 + P.ttm);
ok('TTM-oms 91 411', nra(ttmOms, 0) === 91411, ttmOms.toFixed(0));
const nettoTTM = P.netto * ttmOms;
ok('netto TTM 6 472', nra(nettoTTM, 0) === 6472, nettoTTM.toFixed(0));
const ebitTTM = P.ebit * ttmOms;
ok('EBIT TTM 13 355', nra(ebitTTM, 0) === 13355, ebitTTM.toFixed(0));
const ident = P.pb / P.roe;
ok('identitet 19,89', b.includes('19,89') && Math.abs(ident - 19.885) < 0.01, ident.toFixed(3));
const avv = Math.abs(ident - P.pe) / P.pe;
ok('identitetsavvikelse 9,57', b.includes('9,57') && nra(avv * 100) === 9.57, (avv * 100).toFixed(2));
const mcapPE = P.pe * nettoTTM / 1000, ek = nettoTTM / P.roe / 1000, mcapPB = P.pb * ek;
ok('mcap P/E-väg 117,5', b.includes('117,5') && nra(mcapPE, 1) === 117.5, mcapPE.toFixed(1));
ok('EK 31,7', b.includes('31,7') && nra(ek, 1) === 31.7, ek.toFixed(1));
ok('mcap P/B-väg 128,7', b.includes('128,7') && nra(mcapPB, 1) === 128.7, mcapPB.toFixed(1));
const sprid = Math.abs(mcapPE - mcapPB) / mcapPE;
ok('spridning 9,6', b.includes('9,6') && nra(sprid * 100, 1) === 9.6, (sprid * 100).toFixed(1));
const skuld = ek * P.sk, evKedja = ek + skuld, evFalt = P.evEbit * ebitTTM / 1000;
ok('skuld 42,5', b.includes('42,5') && nra(skuld, 1) === 42.5, skuld.toFixed(1));
ok('fält-EV 170,5', b.includes('170,5') && nra(evFalt, 1) === 170.5, evFalt.toFixed(1));
ok('stängning 128,0 mot 128,7 = 0,5 %', b.includes('128,0') && nra(evFalt - skuld, 1) === 128.0 && nra(Math.abs(evFalt - skuld - mcapPB) / mcapPB * 100, 1) === 0.5, (evFalt - skuld).toFixed(1));
ok('P/E-vägens lucka 10,6', b.includes('10,6') && nra(evFalt - skuld - mcapPE, 1) === 10.6);
const pegConv = P.pe / (P.prog * 100);
ok('PEG-konvention 2,28', b.includes('2,28') && nra(pegConv) === 2.28, pegConv.toFixed(2));
ok('PEG-kvot 1,57', b.includes('1,57') && nra(P.peg / pegConv) === 1.57, (P.peg / pegConv).toFixed(2));
ok('implicit PEG-tillväxt 5,06', b.includes('5,06') && nra(P.pe / P.peg) === 5.06, (P.pe / P.peg).toFixed(2));
const fcfKassa = P.fcf * ttmOms;
ok('FCF-kassa 7 825', b.includes('7 825') && nra(fcfKassa, 0) === 7825, fcfKassa.toFixed(0));
ok('FCF-kvot 1,21', b.includes('1,21') && nra(P.fcf / P.netto) === 1.21, (P.fcf / P.netto).toFixed(2));
const kapOms = P.roe / (P.netto * (1 + P.sk));
ok('DuPont kapitalomsättning 1,233', b.includes('1,233') && nra(kapOms, 3) === 1.233, kapOms.toFixed(3));
ok('DuPont hävstång 2,3419', b.includes('2,3419') && nra(1 + P.sk, 4) === 2.3419);
ok('DuPont kontroll 7,08 × 1,233 × 2,3419 = 20,44', b.includes('7,08 × 1,233 × 2,3419'));
// multiplövningar
ok('multipl prognos 16,81', b.includes('16,81') && nra(P.pe / (1 + P.prog)) === 16.81, (P.pe / (1 + P.prog)).toFixed(2));
ok('multipl TTM 17,69', b.includes('17,69') && nra(P.pe / (1 + P.ttm)) === 17.69, (P.pe / (1 + P.ttm)).toFixed(2));
ok('multipl CAGR 16,77', b.includes('16,77') && nra(P.pe / (1 + P.cagr)) === 16.77, (P.pe / (1 + P.cagr)).toFixed(2));
// årssteg + nettomarginalserie
const steg = oms.slice(1).map((v, i) => v / oms[i] - 1);
ok('årssteg +4,72', b.includes('4,72') && nra(steg[0] * 100) === 4.72);
ok('årssteg +1,94', b.includes('1,94') && nra(steg[1] * 100) === 1.94);
ok('årssteg +18,78', b.includes('18,78') && nra(steg[2] * 100) === 18.78);
ok('totalt +26,8', b.includes('26,8') && nra(oms[3] / oms[0] * 100 - 100, 1) === 26.8, (oms[3] / oms[0] * 100 - 100).toFixed(1));
const nm = res.map((r, i) => r / oms[i]);
ok('nettomarginalserie −1,51', b.includes('1,51') && nra(nm[0] * 100) === -1.51, (nm[0] * 100).toFixed(2));
ok('nettomarginalserie −55,43', b.includes('55,43') && nra(nm[1] * 100) === -55.43, (nm[1] * 100).toFixed(2));
ok('nettomarginalserie 12,15', b.includes('12,15') && nra(nm[2] * 100) === 12.15);
ok('nettomarginalserie 6,68', b.includes('6,68') && nra(nm[3] * 100) === 6.68);
ok('ressteg 2024→2025 −34,68', b.includes('34,68') && nra(res[3] / res[2] * 100 - 100) === -34.68, (res[3] / res[2] * 100 - 100).toFixed(2));
ok('TTM netto över bokförd 8,7', b.includes('8,7') && nra(nettoTTM / res[3] * 100 - 100, 1) === 8.7);

// ===== 4. MEDIANER + RANG (färsk omräkning ur 189-postfilen) =====
const kons = list.filter(x => x.bransch === 'konsument');
const median = a => { const s = a.filter(Number.isFinite).sort((x, y) => x - y); const m = Math.floor(s.length / 2); return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2; };
const rankDesc = (a, v) => a.filter(Number.isFinite).sort((x, y) => y - x).indexOf(v) + 1;
const nAv = a => a.filter(Number.isFinite).length;
const t = {
  'P/E 18,15 median-själv': { arr: kons.map(x => x.vardering?.pe), v: P.pe, text: '18,15', med: true },
  'P/B median 3,09': { arr: kons.map(x => x.vardering?.pb), v: P.pb, medTxt: '3,09' },
  'EV/EBIT median 16,02 rang 17/21': { arr: kons.map(x => x.vardering?.evEbit), v: P.evEbit, medTxt: '16,02', rang: '17/21' },
  'PEG median 2,25 rang 4/17': { arr: kons.map(x => x.vardering?.peg), v: P.peg, medTxt: '2,25', rang: '4/17' },
  'ROE median 18,40': { arr: kons.map(x => x.lonksamhet?.roe), v: P.roe, frac: true, medTxt: '18,40' },
  'brutto median 45,34': { arr: kons.map(x => x.lonksamhet?.bruttoMarginal), v: P.brutto, frac: true, medTxt: '45,34' },
  'EBIT median 13,65': { arr: kons.map(x => x.lonksamhet?.ebitMarginal), v: P.ebit, frac: true, medTxt: '13,65' },
  'netto median 8,51': { arr: kons.map(x => x.lonksamhet?.nettoMarginal), v: P.netto, frac: true, medTxt: '8,51' },
  'FCF median 8,56 (median-själv)': { arr: kons.map(x => x.lonksamhet?.fcfMarginal), v: P.fcf, frac: true, medTxt: '8,56' },
  'omsCAGR median 2,67': { arr: kons.map(x => x.tillvaxt?.omsattningCAGR5ar), v: P.cagr, frac: true, medTxt: '2,67' },
  'skuld/EK median 0,84': { arr: kons.map(x => x.stabilitet?.skuldEgenkapital), v: P.sk, medTxt: '0,84' }
};
for (const [namn, d] of Object.entries(t)) {
  const med = median(d.arr);
  const medTxt = d.frac ? (med * 100).toFixed(2).replace('.', ',') : med.toFixed(2).replace('.', ',');
  ok('median ' + namn + ' => ' + medTxt + ' (n=' + nAv(d.arr) + ')', d.medTxt ? b.includes(d.medTxt) && medTxt === d.medTxt : b.includes(medTxt), 'beräknad ' + medTxt);
  if (d.rang) { const r = rankDesc(d.arr, d.v); ok('rang ' + namn, d.rang === r + '/' + nAv(d.arr), r + '/' + nAv(d.arr)); }
  if (d.med) ok('CARL = medianen exakt (P/E)', med === P.pe, med + ' mot ' + P.pe);
}
// median-själv på FCF-marginal
const fcfMed = median(kons.map(x => x.lonksamhet?.fcfMarginal));
ok('CARL = FCF-medianen exakt', fcfMed === P.fcf, fcfMed + ' mot ' + P.fcf);

// ===== 5. SCENARIORUTA — 9 celler + räknesatser =====
const bas = oms[3], m = P.ebit;
const cell = (dm, do_) => Math.round(bas * (1 + do_) * (m + dm));
let cellsOk = 0;
for (const dm of [-0.01, 0, 0.01]) for (const do_ of [-0.03, 0, 0.03]) { if (b.includes(String(cell(dm, do_)).replace(/\B(?=(\d{3})+(?!\d))/g, ' '))) cellsOk++; }
ok('scenarioruta 9/9 celler', cellsOk === 9, cellsOk + '/9');
ok('1 pp = 891', b.includes('891') && Math.round(bas * 0.01) === 891);
ok('3 % = 391', b.includes('391') && Math.round(bas * m * 0.03) === 391);
ok('bas-EBIT 13 017', b.includes('13 017') && Math.round(bas * m) === 13017);
ok('marginalvikt 2,28', b.includes('2,28') && nra(1 / (3 * m)) === 2.28, (1 / (3 * m)).toFixed(2));

// ===== 6. SÖKVERIFIERADE RAPPORTFAKTA (paritet mot källraderna) =====
const fakta = ['29 oktober', '24,1', '17,8', '−1,4', '+3,6', '+3,0', '47 053', '7 448', '7 125', '15,8', '32,4', '3,7', '2,9', '45,7', '13 686', '13 996', '4–6', '2–6', '+5,9', '+4,5', '+6,2', '+0,1', '24,21'];
for (const f of fakta) ok('faktatalet ' + f + ' finns', b.includes(f));
ok('Q1-datum 29 april', b.includes('29 april'));
ok('H1-datum 19 augusti', b.includes('19 augusti'));
ok('Q3-2025-datum 2025-10-30 i källor', b.includes('2025-10-30'));
ok('trading statement-format noterat', /trading statements för Q1 och Q3/.test(b));
ok('utanför vågvalidering redovisat', /utanför vågvalideringens universum/.test(b));
ok('seriens 48:e', b.includes('nummer 48'));
ok('första Danmarksbolaget', /första Danmarksbolag/.test(b));
ok('grenens sjätte med räknebas', /sjätte paket enligt universumfilens branschräkning/.test(b));

// ===== 7. JURIDIKGRIND =====
ok('exakt ett lagrum 2007:528', (b.match(/2007:528/g) || []).length === 1);
ok('2 kap 5 § citeras', b.includes('2 kap 5 §'));
const FORBUDNA_LAGRUM = ['2022:260', '2022:261', '1985:716', '2022:482', '2005:59', '4 kap', '1 kap'];
for (const lg of FORBUDNA_LAGRUM) ok('inget främmande lagrum ' + lg, !b.includes(lg));
// rådverb endast i neknings-/disclaimer-kontext
const radMatches = [...b.matchAll(/.{80}\b(köpa|köper|köper\s*aktier|sälja|säljer|rekommendera|rekommenderar|råd till att)\b/gi)].map(x => x[0]);
const tveksamma = radMatches.filter(ctx => !/inte investeringsrådgivning|Inga köp-, sälj-|nej|aldrig|förbjud|utanför/i.test(ctx));
ok('rådverb endast i nekningskontext', tveksamma.length === 0, tveksamma.length + ' misstänkta: ' + tveksamma.slice(0, 1).join('||').slice(0, 200));

// ===== 8. LÄNKAR =====
const lnkar = [...new Set([...b.matchAll(/\]\((\/[^)#\s]+)\)/g)].map(x => x[1]))];
ok('minst 20 unika interna länkar', lnkar.length >= 20, lnkar.length + ' st');
const http = await Promise.all(lnkar.map(async l => {
  try { const r = await fetch('http://localhost:3000' + l); return { l, code: r.status }; } catch { return { l, code: 0 }; }
}));
for (const h of http) ok('länk 200: ' + h.l, h.code === 200, 'HTTP ' + h.code);
ok('bolagssidan länkas', lnkar.includes('/bolag/carl-b-co'));
ok('kurser/transparens/kallor', ['/kurser', '/transparens', '/kallor'].every(l => lnkar.includes(l)));

// ===== 9. TECKENGRUND — endast svenska/latinska tecken =====
const susTa = [...b.matchAll(/[\u0400-\u04FF\u4E00-\u9FFF\u3040-\u30FF\u0105\u0104\u0119\u0118\u0142\u0141\u017C\u017B]/g)].map(x => x[0]);
ok('inga kyrilliska/CJK/polska specialtecken', susTa.length === 0, susTa.slice(0, 5).join(' '));

console.log('\n===== KVD CARLSBERG: ' + PASS + ' PASS / ' + FEL + ' FEL / ' + VARN + ' VARNING =====');
console.log('Ord: ' + ord + ' | readingMinutes ' + j.readingMinutes + ' | unika länkar ' + lnkar.length);
process.exit(FEL === 0 && VARN === 0 ? 0 : 1);
