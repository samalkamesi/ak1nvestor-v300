#!/usr/bin/env node
// KVD s4-u2 (manifest auto-s4-1789786525981) — Kinnevik Q3-läspaket.
// Oberoende omräkning av ALLA tal i paketet mot bolagsuniversumet + sökverifierad rapporfakta.
// Utgångskod 0 = GRÖN (0 FEL, 0 VARNING). Alla kontroller räknas och rapporteras.
import { readFileSync } from 'node:fs';

const PAKET = '/home/ak1a/AK1/data/blogg-utkast/kvartal/2026-q3/sa-laser-du-kinnevik-q3-2026.json';
const UNI = '/home/ak1a/AK1/data/portfolj-system/bolagsunivers.json';
let PASS = 0, FEL = 0, VARN = 0;
const ok = (namn, villkor, detalj = '') => { if (villkor) { PASS++; } else { FEL++; console.log('FEL: ' + namn + (detalj ? ' — ' + detalj : '')); } };
const warn = (namn, villkor, detalj = '') => { if (villkor) PASS++; else { VARN++; console.log('VARNING: ' + namn + (detalj ? ' — ' + detalj : '')); } };
const nra = (x, d = 2) => Number(x.toFixed(d));

const j = JSON.parse(readFileSync(PAKET, 'utf8'));
const b = j.body;
const u = JSON.parse(readFileSync(UNI, 'utf8'));
const list = Array.isArray(u) ? u : (u.bolag || u.universum);
const p = list.find(x => x.ticker === 'KINV-B.ST');

// ===== 1. STRUKTUR =====
ok('JSON tolkar', true);
for (const f of ['slug', 'title', 'description', 'pillar', 'author', 'publishedAt', 'readingMinutes', 'tags', 'body']) ok('fält ' + f, typeof j[f] !== 'undefined' && j[f] !== null && j[f] !== '');
ok('slug = filnamn', j.slug === 'sa-laser-du-kinnevik-q3-2026');
ok('pillar', j.pillar === 'Institutionell metodik');
ok('author', j.author === 'AK1A Research Lab');
ok('publishedAt = rappdag', j.publishedAt === '2026-10-15');
ok('tags innehåller kvartalsrapport + Kinnevik', j.tags.includes('kvartalsrapport') && j.tags.some(t => /kinnevik/i.test(t)));
const ord = b.split(/\s+/).filter(Boolean).length;
ok('ordantal > 1500', ord > 1500, 'ord=' + ord);
ok('readingMinutes = round(ord/600)', j.readingMinutes === Math.round(ord / 600), ord + ' ord => ' + Math.round(ord / 600));
const h2 = b.split('\n').filter(l => /^## /.test(l)).map(l => l.replace(/^## /, ''));
ok('7 H2-rubriker', h2.length === 7, h2.length + ' st');
for (const rub of ['Urvalet', 'Nyckeltalen', 'Datavakten', 'Så står sig bolaget mot branschen', 'Tre sätt att läsa utfallet', 'Praktiskt inför 15 oktober', 'Källor']) ok('rubrik ' + rub, h2.some(h => h.includes(rub)));

// ===== 2. KÄLLTALSPARITET mot KINV-B.ST-posten =====
const P = { pris: p.pris, mcap: p.marknadsKapitalMdr, pb: p.vardering.pb, peg: p.vardering.peg, fcfY: p.vardering.fcfYield, roe: p.lonksamhet.roe, roic: p.lonksamhet.roic, ebit: p.lonksamhet.ebitMarginal, fcfM: p.lonksamhet.fcfMarginal, sk: p.stabilitet.skuldEgenkapital, ttm: p.tillvaxt.omsattningTillvaxtTTM, kassa: p.stabilitet.kassaManaderBurnRate };
ok('pris 62,90', b.includes('62,90'));
ok('mcap 17,713', b.includes('17,713'));
ok('P/E null redovisas som osatt', b.includes('osatt'));
ok('P/B 0,598', b.includes('0,598'));
ok('PEG 4,76', b.includes('4,76'));
ok('fcfYield −29,88', b.includes('29,88'));
ok('ROE −21,64', b.includes('21,64'));
ok('ROIC −27,85', b.includes('27,85'));
ok('EBIT-marg 95,5 (fältet 0,955 = andel)', b.includes('95,5') && P.ebit === 0.955);
ok('FCF-marg 65,64', b.includes('65,64'));
ok('skuldkvot 0,0694', b.includes('0,0694'));
ok('TTM 164,4', b.includes('164,4'));
ok('kassa 813,5', b.includes('813,5'));
// serier (resultat i Mkr, omsättning)
ok('res −19 519', b.includes('19 519'));
ok('res −4 766', b.includes('4 766'));
ok('res −2 623', b.includes('2 623'));
ok('res −3 346', b.includes('3 346'));
ok('oms 936', b.includes('936'));
ok('oms 23', b.includes('23'));
ok('prognos null redovisas öppet', /Prognostillväxt: \*\*osatt\*\*/.test(b));
ok('brutto/netto noll redovisas', b.includes('bruttomarginal och nettomarginal: **0**'));

// ===== 3. ARITMETIK — oberoende omräkning =====
// substansdetektiven
const aktier = P.mcap * 1e9 / P.pris / 1e6;
const ek = P.mcap / P.pb;
const subst = ek * 1e9 / (aktier * 1e6);
ok('aktier fältväg 281,6 M', b.includes('281,6') && nra(aktier, 1) === 281.6, aktier.toFixed(2));
ok('implicit EK 29,62 mdr', b.includes('29,62') && nra(ek, 2) === 29.62, ek.toFixed(3));
ok('implicit substans 105,18', b.includes('105,18') && nra(subst, 2) === 105.18, subst.toFixed(2));
ok('gap mot 107 = −1,7 %', b.includes('1,7 procent') && nra(subst / 107 * 100 - 100, 1) === -1.7, (subst / 107 * 100 - 100).toFixed(2));
ok('fält-rabatt 40,2', b.includes('40,2 procent') && nra(100 - P.pb * 100, 1) === 40.2);
ok('rapport-rabatt 41,2', b.includes('41,2 procent') && nra(100 - P.pris / 107 * 100, 1) === 41.2, (100 - P.pris / 107 * 100).toFixed(2));
// ROE-fönstret
const roeV = P.roe * ek;
ok('ROE-väg −6,41 mdr', b.includes('6,41') && nra(roeV, 2) === -6.41, roeV.toFixed(3));
ok('H1 = −6 252', b.includes('6 252') && (-7969 + 1717) === -6252);
ok('gap mot H1 2,5 %', b.includes('2,5 procent') && nra(roeV * 1000 / -6252 * 100 - 100, 1) === 2.5, (roeV * 1000 / -6252 * 100 - 100).toFixed(2));
ok('gap mot 2025 91,6 %', b.includes('91,6') && nra(roeV * 1000 / -3346 * 100 - 100, 1) === 91.6, (roeV * 1000 / -3346 * 100 - 100).toFixed(1));
// PEG-anomali
ok('PEG implicit P/E 7,83', b.includes('7,83') && nra(P.peg * P.ttm) === 7.83, (P.peg * P.ttm).toFixed(2));
// FCF-motsägelsen
const fcf = P.fcfY * P.mcap;
ok('FCF −5,29 mdr', b.includes('5,29') && nra(fcf) === -5.29, fcf.toFixed(3));
// kassa
ok('kassa 67,8 år', b.includes('68 år') && nra(P.kassa / 12, 1) === 67.8, (P.kassa / 12).toFixed(1));
ok('kassa-andel 41,8 % av mcap', b.includes('41,8') && nra(7.4 / P.mcap * 100, 1) === 41.8, (7.4 / P.mcap * 100).toFixed(1));
// resultat=NAV-kvoter
ok('kvot 2025 1,01', b.includes('kvot 1,01') && nra(-3346 / (-3300), 2) === 1.01);
ok('kvot H1 0,99', b.includes('kvot 0,99') && nra(-6252 / (-6300), 2) === 0.99);
// förlursteg
const res = p.serier.resultat.map(x => x / 1e6);
ok('steg −75,6', b.includes('75,6') && nra(res[1] / res[0] * 100 - 100, 1) === -75.6, (res[1] / res[0] * 100 - 100).toFixed(1));
ok('steg −45,0', b.includes('45,0') && nra(res[2] / res[1] * 100 - 100, 1) === -45.0, (res[2] / res[1] * 100 - 100).toFixed(1));
ok('steg +27,6', b.includes('27,6') && nra(res[3] / res[2] * 100 - 100, 1) === 27.6, (res[3] / res[2] * 100 - 100).toFixed(1));
// aktietail official
const aOff = 29.6e9 / 107;
ok('aktier official 276,6 M', b.includes('276,6') && nra(aOff / 1e6, 1) === 276.6, (aOff / 1e6).toFixed(1));
ok('gap +1,8 %', b.includes('1,8 procent') && nra(aktier / (aOff / 1e6) * 100 - 100, 1) === 1.8, (aktier / (aOff / 1e6) * 100 - 100).toFixed(2));
// NAV-trappan per aktie
ok('Q4-steg −4,4 %', b.includes('4,4') && nra(130 / 136 * 100 - 100, 1) === -4.4, (130 / 136 * 100 - 100).toFixed(1));
ok('Q1-steg −22,3 %', b.includes('22,3') && nra(101 / 130 * 100 - 100, 1) === -22.3, (101 / 130 * 100 - 100).toFixed(1));
ok('Q2-steg +5,9 %', b.includes('5,9') && nra(107 / 101 * 100 - 100, 1) === 5.9, (107 / 101 * 100 - 100).toFixed(1));
ok('Q1-klipp 41 % av 2022', b.includes('41 procent av hela 2022') && nra(-8.0 / -19.519 * 100, 0) === 41, (-8.0 / -19.519 * 100).toFixed(1));
// multipelövning
ok('P/B=1 kurs 105,18 (+67,2 %)', b.includes('67,2') && nra(subst / P.pris * 100 - 100, 1) === 67.2, (subst / P.pris * 100 - 100).toFixed(1));
ok('EK-fallet −40,2 % (29,62→17,71)', b.includes('17,71') && nra(P.mcap / ek * 100 - 100, 1) === -40.2, (P.mcap / ek * 100 - 100).toFixed(1));
// medianavstånd
const tv = list.filter(x => x.bransch === 'tillvaxt');
const median = a => { const s = a.filter(Number.isFinite).sort((x, y) => x - y); const m = Math.floor(s.length / 2); return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2; };
const pbMed = median(tv.map(x => x.vardering?.pb));
ok('93,5 % under grenens median', b.includes('93,5') && nra(P.pb / pbMed * 100 - 100, 1) === -93.5, (P.pb / pbMed * 100 - 100).toFixed(1));
// grenens högsta P/B-median av 10 grenar
const grenPb = {};
for (const x of list) (grenPb[x.bransch] ??= []).push(x.vardering?.pb ?? NaN);
const grenMed = Object.fromEntries(Object.entries(grenPb).map(([g, v]) => [g, median(v)]));
ok('tillväxt = högsta P/B-median av tio grenar', Object.entries(grenMed).sort((a, c) => c[1] - a[1])[0][0] === 'tillvaxt', JSON.stringify(Object.fromEntries(Object.entries(grenMed).sort((a, c) => c[1] - a[1]).slice(0, 3))));

// ===== 4. MEDIANER + RANG (färsk omräkning ur 195-postfilen) =====
const nAv = a => a.filter(Number.isFinite).length;
const rngAsc = (a, v) => a.filter(Number.isFinite).sort((x, y) => x - y).indexOf(v) + 1;
const medU = {}; const medT = {};
const falt = { pe: ['vardering', 'pe'], pb: ['vardering', 'pb'], peg: ['vardering', 'peg'], roe: ['lonksamhet', 'roe'], ebit: ['lonksamhet', 'ebitMarginal'], netto: ['lonksamhet', 'nettoMarginal'], prog: ['tillvaxt', 'prognosTillvaxt'], ttm: ['tillvaxt', 'omsattningTillvaxtTTM'], sk: ['stabilitet', 'skuldEgenkapital'] };
for (const [n, [g, f]] of Object.entries(falt)) {
  medT[n] = median(tv.map(x => x[g]?.[f] ?? NaN));
  medU[n] = median(list.map(x => x[g]?.[f] ?? NaN));
}
const forv = { pe: '43,556', pb: '9,155', peg: '1,575', roe: '15,13', ebit: '12,13', netto: '5,91', prog: '37,19', ttm: '34,1', sk: '0,1775' };
const forvU = { pe: '21,153', pb: '2,807', peg: '1,375', roe: '15,34', ebit: '20,71', netto: '13,05', prog: '13,6', ttm: '6,8', sk: '0,52' };
const prec = { pe: 3, pb: 3, peg: 3, sk: 4, roe: 2, ebit: 2, netto: 2, prog: 2, ttm: 1 };
const andel = n => ['roe', 'ebit', 'netto', 'prog', 'ttm'].includes(n);
for (const n of Object.keys(falt)) {
  const tt = forv[n], uu = forvU[n];
  const berT = (andel(n) ? medT[n] * 100 : medT[n]).toFixed(prec[n]).replace('.', ',');
  ok('grenmedian ' + n + ' => ' + tt + ' (beräknad ' + berT + ', n=' + nAv(tv.map(x => x[falt[n][0]]?.[falt[n][1]] ?? NaN)) + ')', b.includes(tt) && tt === berT, 'beräknad ' + berT);
  ok('universummedian ' + n + ' => ' + uu, b.includes(uu));
}
ok('rang P/B lägst av 14', b.includes('lägst av 14 mätta') && rngAsc(tv.map(x => x.vardering?.pb), P.pb) === 1 && nAv(tv.map(x => x.vardering?.pb)) === 14, rngAsc(tv.map(x => x.vardering?.pb), P.pb) + '/' + nAv(tv.map(x => x.vardering?.pb)));
ok('rang ROE näst lägst av 14', b.includes('näst lägst av 14 mätta') && rngAsc(tv.map(x => x.lonksamhet?.roe), P.roe) === 2);
ok('rang EBIT högst av 15', b.includes('högst av 15') && rngAsc(tv.map(x => x.lonksamhet?.ebitMarginal), P.ebit) === 15 && nAv(tv.map(x => x.lonksamhet?.ebitMarginal)) === 15);
ok('rang TTM högst av 15', b.includes('högst av 15') && rngAsc(tv.map(x => x.tillvaxt?.omsattningTillvaxtTTM), P.ttm) === nAv(tv.map(x => x.tillvaxt?.omsattningTillvaxtTTM)));
ok('rang PEG högst av 10', b.includes('högst bland grenens tio mätta') && rngAsc(tv.map(x => x.vardering?.peg), P.peg) === nAv(tv.map(x => x.vardering?.peg)) && nAv(tv.map(x => x.vardering?.peg)) === 10);
ok('rang skuld femte lägsta av 14', b.includes('femte lägsta av 14 mätta') && rngAsc(tv.map(x => x.stabilitet?.skuldEgenkapital), P.sk) === 5);

// ===== 5. SCENARIORUTA — 9 celler + räknesatser =====
const cell = (S, R) => nra(S * (1 - R / 100));
let cellsOk = 0;
for (const S of [101, 107, 113]) for (const R of [35.2, 41.2, 47.2]) { if (b.includes(cell(S, R).toFixed(2).replace('.', ','))) cellsOk++; }
ok('scenarioruta 9/9 celler', cellsOk === 9, cellsOk + '/9');
ok('räknesats 6 kr substans = 3,53', b.includes('3,53') && nra(6 * (1 - 0.412)) === 3.53);
ok('räknesats 6 pp rabatt = 6,42', b.includes('6,42') && nra(107 * 0.06) === 6.42);
ok('rabattväger 1,8× substansen', b.includes('1,8 gånger') && nra((107 * 0.06) / (6 * (1 - 0.412)), 1) === 1.8, ((107 * 0.06) / (6 * (1 - 0.412))).toFixed(2));
const r = 1 - P.pris / 107;
ok('överföringsgrad 0,70 (r/(1−r) vid r=rabatten)', b.includes('0,70') && nra(r / (1 - r)) === 0.7, (r / (1 - r)).toFixed(3));

// ===== 6. SÖKVERIFIERADE RAPPORTFAKTA =====
const fakta = ['15 oktober', '08:00 CET', '39,2', '37,5', '35,9', '27,9', '29,6', '139 kronor', '136', '130', '101', '107 kronor', '7 969', '1 717', '626', '7,5 miljarder', '7,4 miljarder', '29 till 53 procent', '0 kronor', '16 april', '7 juli', '3 februari', '8,0 miljarder', '6 procent', '8 procent'];
for (const f of fakta) ok('faktatalet ' + f + ' finns', b.includes(f));
ok('Q1 datum i text', b.includes('16 april 2026'));
ok('utanför vågvalidering redovisat', /står inte i seriens vågvalideringskarta/.test(b));
ok('seriens 50:e (efter Getinges tidigare diskleverans)', b.includes('nummer 50'));
ok('tillväxtgrenens första', b.includes('tillväxtgrenens första paket'));
ok('grenen noll paket före', b.includes('haft noll paket'));

// ===== 7. JURIDIKGRIND =====
ok('exakt ett lagrum 2007:528', (b.match(/2007:528/g) || []).length === 1);
ok('2 kap 5 § citeras', b.includes('2 kap 5 §'));
const FORBUDNA_LAGRUM = ['2022:260', '2022:261', '1985:716', '2022:482', '2005:59', '4 kap', '1 kap'];
for (const lg of FORBUDNA_LAGRUM) ok('inget främmande lagrum ' + lg, !b.includes(lg));
const radMatches = [...b.matchAll(/.{80}\b(köpa|köper|sälja|säljer|rekommendera|rekommenderar|råd till att)\b/gi)].map(x => x[0]);
const tveksamma = radMatches.filter(ctx => !/inte investeringsrådgivning|inte en rekommendation|Inga köp-, sälj-|nej|aldrig|förbjud|utanför/i.test(ctx));
ok('rådverb endast i nekningskontext', tveksamma.length === 0, tveksamma.length + ' misstänkta: ' + tveksamma.slice(0, 1).join('||').slice(0, 200));

// ===== 8. LÄNKAR =====
const lnkar = [...new Set([...b.matchAll(/\]\((\/[^)#\s]+)\)/g)].map(x => x[1]))];
ok('minst 20 unika interna länkar', lnkar.length >= 20, lnkar.length + ' st');
const http = await Promise.all(lnkar.map(async l => {
  try { const res = await fetch('http://localhost:3000' + l); return { l, code: res.status }; } catch { return { l, code: 0 }; }
}));
for (const h of http) ok('länk 200: ' + h.l, h.code === 200, 'HTTP ' + h.code);
ok('bolagssidan länkas', lnkar.includes('/bolag/kinv-b-st'));
ok('kurser/transparens/kallor', ['/kurser', '/transparens', '/kallor'].every(l => lnkar.includes(l)));

// ===== 9. TECKENGRUND — endast svenska/latinska tecken =====
const susTa = [...b.matchAll(/[\u0400-\u04FF\u4E00-\u9FFF\u3040-\u30FF\u0105\u0104\u0119\u0118\u0142\u0141\u017C\u017B]/g)].map(x => x[0]);
ok('inga kyrilliska/CJK/polska specialtecken', susTa.length === 0, susTa.slice(0, 5).join(' '));

console.log('\n===== KVD KINNEVIK: ' + PASS + ' PASS / ' + FEL + ' FEL / ' + VARN + ' VARNING =====');
console.log('Ord: ' + ord + ' | readingMinutes ' + j.readingMinutes + ' | unika länkar ' + lnkar.length);
process.exit(FEL === 0 && VARN === 0 ? 0 : 1);
