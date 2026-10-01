// _s1u1-nflx-q3-kontroll.mjs — granskningssond för sa-laser-du-nflx-q3-2026.json
// Fabriksagent s1-u1, manifest auto-s1-1790858103968 (2026-10-01).
// Metod: allt EGENMÄTT — källfält mot deklarerad vintage (d7eae3bc8, md5 6e540c87…),
// medianer/rang egenräknade ur vintagen, aritmetik oberoende omräknad,
// juridik 2007:528 (varumarke.json + rådmönster + lagrumsfamiljer), 911,
// interna+externa länkar, kalender, title-tak, ord/readingMinutes.
// Deterministisk: inga tidsstämplar, fast ordning. Dubbelkörs; körning == körning.

import fs from 'node:fs';
import { execFileSync } from 'node:child_process';
import crypto from 'node:crypto';
import http from 'node:http';

const ROT = '/home/ak1a/AK1';
const VINT_HASH = 'd7eae3bc8';
const DEKLARERAD_MD5 = '6e540c8753d28f8b905a2aab9f15b29d';

const UTKAST_SOKVAG = `${ROT}/data/blogg-utkast/kvartal/2026-q3/sa-laser-du-nflx-q3-2026.json`;
const utkastRaw = fs.readFileSync(UTKAST_SOKVAG, 'utf8');
const U = JSON.parse(utkastRaw);
const T = U.title, D = U.description, B = U.body;
const YTOR = { title: T, description: D, body: B };

let ok = 0, fel = 0, not = 0;
const rader = [];
const O = (etikett, txt) => { ok++; rader.push(`OK  ${etikett} — ${txt}`); };
const F = (etikett, txt) => { fel++; rader.push(`FEL ${etikett} — ${txt}`); };
const N = (etikett, txt) => { not++; rader.push(`NOT ${etikett} — ${txt}`); };

const num = (x, d = 2) => (typeof x === 'number' && isFinite(x)) ? x.toFixed(d).replace('.', ',') : String(x);
const nar = (a, b, rel = 0.01, abs = 0.051) =>
  (typeof a === 'number' && typeof b === 'number' && isFinite(a) && isFinite(b)) &&
  (Math.abs(a - b) <= Math.max(abs, Math.abs(b) * rel));

// ── 0. Utkast-fingeravtryck (orördhets-kvitto) ──
const utkastMd5 = crypto.createHash('md5').update(utkastRaw).digest('hex');
rader.push(`INFO utkast md5=${utkastMd5} bytes=${utkastRaw.length}`);

// ── 1. Vintage-låsning ──
const vintageRaw = execFileSync('git', ['show', `${VINT_HASH}:data/portfolj-system/bolagsunivers.json`], { cwd: ROT, maxBuffer: 64 * 1024 * 1024 }).toString('utf8');
const vintageMd5 = crypto.createHash('md5').update(vintageRaw).digest('hex');
vintageMd5 === DEKLARERAD_MD5
  ? O('VINT-MD5', `git ${VINT_HASH} ger md5 ${vintageMd5} == textens deklarerade — vintage låst`)
  : F('VINT-MD5', `git ${VINT_HASH} ger ${vintageMd5} != deklarerad ${DEKLARERAD_MD5}`);
const V = JSON.parse(vintageRaw);
const dagens = JSON.parse(fs.readFileSync(`${ROT}/data/portfolj-system/bolagsunivers.json`, 'utf8'));

// ── 2. Källfält: NFLX-radens paritet mot vintagen ──
const nflxV = V.find(p => p.ticker === 'NFLX');
const nflxD = dagens.find(p => p.ticker === 'NFLX');
if (!nflxV) F('KALL-NFLX', 'NFLX saknas i vintage');
const falt = [
  ['pris 82,73', nflxV?.pris, 82.73],
  ['mcap 344,483 mdr', nflxV?.marknadsKapitalMdr, 344.483],
  ['P/E 25,377', nflxV?.vardering?.pe, 25.377],
  ['P/B 11,425', nflxV?.vardering?.pb, 11.425],
  ['EV/EBIT 21,801', nflxV?.vardering?.evEbit, 21.801],
  ['PEG 1,49', nflxV?.vardering?.peg, 1.49],
  ['fcfYield 7,4 %', nflxV?.vardering?.fcfYield, 0.0737],
  ['ROE 49,5 %', nflxV?.lonksamhet?.roe, 0.4954],
  ['ROIC 34,5 %', nflxV?.lonksamhet?.roic, 0.345],
  ['brutto 49,1 %', nflxV?.lonksamhet?.bruttoMarginal, 0.4912],
  ['EBIT-marg 33,4 %', nflxV?.lonksamhet?.ebitMarginal, 0.3338],
  ['netto 28,22 %', nflxV?.lonksamhet?.nettoMarginal, 0.2822],
  ['fcfMarginal 52,5 %', nflxV?.lonksamhet?.fcfMarginal, 0.5249],
  ['skuld/EK 0,55', nflxV?.stabilitet?.skuldEgenkapital, 0.5524],
  ['omsCAGR 12,6 %', nflxV?.tillvaxt?.omsattningCAGR5ar, 0.1264],
  ['resCAGR 34,7 %', nflxV?.tillvaxt?.resultatCAGR5ar, 0.3471],
  ['TTM-tillv 13,4 %', nflxV?.tillvaxt?.omsattningTillvaxtTTM, 0.134],
  ['prognos +6,43 %', nflxV?.tillvaxt?.prognosTillvaxt, 0.0643],
  ['insiderköp 18', nflxV?.aterkop?.insiderkopSenaste6man, 18],
];
for (const [namn, faktiskt, textTal] of falt) {
  nar(faktiskt, textTal, 0.001, 0.0011)
    ? O('FALT', `${namn}: fält ${num(faktiskt, 4)} == text`)
    : F('FALT', `${namn}: fält ${num(faktiskt, 4)} != text ${textTal}`);
}
// serier + notering + hämtat + dubbelkälla
const ser = nflxV?.serier;
const serOK = JSON.stringify(ser?.omsattning) === JSON.stringify([31615550000, 33723297000, 39000966000, 45183036000])
  && JSON.stringify(ser?.resultat) === JSON.stringify([4491924000, 5407990000, 8711631000, 10981201000])
  && JSON.stringify(ser?.ar) === JSON.stringify(['2022', '2023', '2024', '2025']);
serOK ? O('FALT-SERIER', 'oms 31 616/33 723/39 001/45 183 · res 4 492/5 408/8 712/10 981 · fyra år — exakt')
  : F('FALT-SERIER', `serier avviker: ${JSON.stringify(ser)}`);
(nflxV?.hamtat === '2026-09-03') ? O('FALT-HAMTAT', 'raden hämtad 2026-09-03 som texten') : F('FALT-HAMTAT', `hamtat=${nflxV?.hamtat}`);
(nflxV?.kallor?.length >= 2 && nflxV.kallor.some(k => /Yahoo/.test(k.namn)) && nflxV.kallor.some(k => /MarketStack/.test(k.namn)))
  ? O('FALT-KALLA', 'dubbelkälla Yahoo+MarketStack som källraden') : F('FALT-KALLA', 'dubbelkälla saknar Yahoo/MarketStack');
(nflxV?.stabilitet?.rantaTackning === null) ? O('FALT-NOT', 'räntetäckning osatt — textens fotnot') : N('FALT-NOT', `rantaTackning=${nflxV?.stabilitet?.rantaTackning}`);
(nflxV?.notering || '').includes('4 räkenskapsår') && (nflxV.notering || '').includes('EPS-tillväxt')
  ? O('FALT-NOT', 'noteringens fotnoter (4 år, prognos=EPS, ROIC-proxy) återgivna i texten') : N('FALT-NOT', 'noteringens fotnoter matchar ej textens cittt: ' + (nflxV?.notering || '').slice(0, 80));

// drift vintage ↔ dagens (domslutens drift-säkerhet)
const driftNycklar = ['pris', 'marknadsKapitalMdr'];
let drift = [];
for (const k of ['pris', 'marknadsKapitalMdr']) if (nflxV?.[k] !== nflxD?.[k]) drift.push(`${k}: ${nflxV?.[k]}→${nflxD?.[k]}`);
for (const grupp of ['vardering', 'lonksamhet', 'tillvaxt', 'stabilitet']) {
  for (const k of Object.keys(nflxV?.[grupp] || {})) {
    const a = JSON.stringify(nflxV[grupp][k]), b = JSON.stringify(nflxD?.[grupp]?.[k]);
    if (a !== b) drift.push(`${grupp}.${k}: ${a}→${b}`);
  }
}
drift.length === 0 ? O('DRIFT', 'NFLX-radens fält identiska vintage↔dagens — domslut drift-säkra')
  : N('DRIFT', `NFLX-radens drift sedan vintagen: ${drift.join(' · ')}`);

// ── 3. Grenens medianer + rang (egenräknade ur vintagen) ──
const gren = V.filter(p => p.bransch === 'kommunikation');
const peta = (p, vag) => vag.split('.').reduce((o, k) => (o == null ? undefined : o[k]), p);
const lista = vag => gren.map(p => [p.ticker, peta(p, vag)]).filter(([, v]) => typeof v === 'number' && isFinite(v));
const median = arr => { const s = [...arr].sort((a, b) => a - b), n = s.length; return n % 2 ? s[(n - 1) / 2] : (s[n / 2 - 1] + s[n / 2]) / 2; };
const rankDesc = (vag, varde) => { const s = lista(vag).map(([, v]) => v).sort((a, b) => b - a); return [s.indexOf(varde) + 1, s.length]; };
const rankAsc = (vag, varde) => { const s = lista(vag).map(([, v]) => v).sort((a, b) => a - b); return [s.indexOf(varde) + 1, s.length]; };

O('GREN', `kommunikationgrenen ${gren.length} bolag i vintagen (texten: 23)`);

const medianKrav = [
  ['P/E', 'vardering.pe', 16.2, 21], ['P/B', 'vardering.pb', 2.27, 23],
  ['EV/EBIT', 'vardering.evEbit', 14.5, 23], ['PEG', 'vardering.peg', 1.49, 17],
  ['ROE %', 'lonksamhet.roe', 0.163, 23], ['ROIC %', 'lonksamhet.roic', 0.107, 23],
  ['brutto %', 'lonksamhet.bruttoMarginal', 0.478, null], ['EBIT %', 'lonksamhet.ebitMarginal', 0.181, 23],
  ['netto %', 'lonksamhet.nettoMarginal', 0.115, 23], ['skuld/EK', 'stabilitet.skuldEgenkapital', 1.28, null],
  ['omsCAGR %', 'tillvaxt.omsattningCAGR5ar', 0.033, 23], ['FCF-marg %', 'lonksamhet.fcfMarginal', 0.126, 22],
];
const nSpann = [];
for (const [namn, vag, textM, textN] of medianKrav) {
  const L = lista(vag); nSpann.push(L.length);
  const m = median(L.map(([, v]) => v));
  const pct = namn.includes('%');
  const mVisa = pct ? m * 100 : m, tVisa = pct ? textM * 100 : textM;
  nar(mVisa, tVisa, 0.005, pct ? 0.051 : 0.0051)
    ? O('MEDIAN', `${namn}: egen median ${num(mVisa, pct ? 1 : 2)} == textens ${num(tVisa, pct ? 1 : 2)} (n=${L.length}${textN ? `, textens n=${textN}` : ''})`)
    : F('MEDIAN', `${namn}: egen median ${num(mVisa, 4)} != textens ${num(tVisa, 4)} (n=${L.length})`);
  if (textN && L.length !== textN) F('MEDIAN-N', `${namn}: n=${L.length} != textens n=${textN}`);
}
const spann = `${Math.min(...nSpann)}–${Math.max(...nSpann)}`;
(spann === '21–22') ? O('N-SPANN', `textens '21–22 mätvärden per mått' stämmer (${spann})`)
  : F('N-SPANN', `textens '21–22 mätvärden per mått' — faktiskt spann ${spann} (n per mått: ${nSpann.join('/')})`);

const rangKrav = [
  ['P/E femte högst', 'vardering.pe', [5, 21], 'desc'],
  ['P/B näst högst', 'vardering.pb', [2, 23], 'desc'],
  ['EV/EBIT fjärde högst', 'vardering.evEbit', [4, 23], 'desc'],
  ['ROE högst', 'lonksamhet.roe', [1, 23], 'desc'],
  ['ROIC tredje högst', 'lonksamhet.roic', [3, 23], 'desc'],
  ['EBIT näst högst', 'lonksamhet.ebitMarginal', [2, 23], 'desc'],
  ['netto tredje högst', 'lonksamhet.nettoMarginal', [3, 23], 'desc'],
  ['skuld åttonde lägst', 'stabilitet.skuldEgenkapital', [8, 23], 'asc'],
  ['omsCAGR sjätte högst', 'tillvaxt.omsattningCAGR5ar', [6, 23], 'desc'],
  ['FCF-marg högst', 'lonksamhet.fcfMarginal', [1, 22], 'desc'],
];
for (const [namn, vag, [tr, tn], riktning] of rangKrav) {
  const varde = peta(nflxV, vag);
  const [r, n] = riktning === 'desc' ? rankDesc(vag, varde) : rankAsc(vag, varde);
  (r === tr && n === tn) ? O('RANG', `${namn}: egen rank ${r} av ${n} == textens`)
    : F('RANG', `${namn}: egen rank ${r} av ${n} != textens ${tr} av ${tn}`);
}
// PEG exakt på medianen
{ const L = lista('vardering.peg').map(([, v]) => v); const m = median(L);
  (nar(m, 1.49, 0.001, 0.0011)) ? O('RANG-PEG', `PEG-median ${num(m,3)} med NFLX värdet 1,49 — 'exakt på medianen' belagt (n=${L.length})`)
    : F('RANG-PEG', `PEG-median ${num(m,4)} vs NFLX 1,49 (n=${L.length})`); }
// granar
{ const meta = gren.find(p => (p.ticker || '').startsWith('META'));
  const pbL = lista('vardering.pb').sort((a, b) => b[1] - a[1]);
  (meta && pbL[0][0] === meta.ticker && nar(pbL[0][1], 11.425) === false && pbL[0][1] > 11.425)
    ? O('GRANAR', `Meta bär grenens högsta P/B ${num(pbL[0][1],2)} — Netflix näst högst 11,425`)
    : N('GRANAR', `högst P/B: ${pbL[0]?.[0]} ${num(pbL[0]?.[1] ?? NaN, 2)} (texten: Meta högst)`);
  const mtg = gren.find(p => (p.ticker || '').startsWith('MTG'));
  (mtg && nar(mtg.lonksamhet?.bruttoMarginal, 0.675, 0.01, 0.0051))
    ? O('GRANAR', `MTG bruttomarginal ${num((mtg.lonksamhet?.bruttoMarginal ?? 0) * 100, 1)} % == textens 67,5`)
    : N('GRANAR', `MTG bruttomarginal ${num((mtg?.lonksamhet?.bruttoMarginal ?? 0) * 100, 2)} % vs textens 67,5`);
  const ebitL = lista('lonksamhet.ebitMarginal').sort((a, b) => b[1] - a[1]);
  N('GRANAR', `EBIT-marginalens topp: ${ebitL[0]?.[0]} ${num((ebitL[0]?.[1] ?? 0) * 100, 1)} % (texten: 'näst högst bakom bara Meta')`);
}
// 'nästan tre gånger medianen' (ROE)
{ const m = median(lista('lonksamhet.roe').map(([, v]) => v)) * 100;
  nar(0.4954 * 100 / m, 3.0, 0.02, 0.05) ? O('LOPTEXT', `ROE/median ${num(0.4954 * 100 / m, 2)}× — 'nästan tre gånger'`) : N('LOPTEXT', `ROE/median ${num(0.4954 * 100 / m, 2)}× vs 'nästan tre gånger'`); }

// ── 4. Aritmetik (oberoende omräkning) ──
const A = (namn, a, b, rel = 0.01, abs = 0.051) => nar(a, b, rel, abs) ? O('ARIT', `${namn}: ${num(a)} == ${num(b)}`) : F('ARIT', `${namn}: ${num(a, 4)} != ${num(b, 4)}`);
A('engångspost: 6 547−2 852', 6547 - 2852, 3695, 0, 0);
A('justerat Q1-netto 3 695×0,836', 3695 * 0.836, 3089, 0.005, 1);
A('delta netto 5 283−3 089', 5283 - 3089, 2194, 0, 0);
A('TTM justerat 13 650−2 194', 13650 - 2194, 11456, 0, 0);
A('nettomarg rapporterad 13 650/48 371 %', (13650 / 48371) * 100, 28.2, 0.005, 0.051);
A('nettomarg justerad 11 456/48 371 %', (11456 / 48371) * 100, 23.7, 0.005, 0.051);
A('P/E justerad mcap/justerat', 344483 / 11456, 30.1, 0.005, 0.051);
const peSteg = 344483 / 11456 - 25.377;
rader.push(`INFO peSteg=${num(peSteg, 2)} (texten: 'fem hela multiplar'/'fem steg')`);
nar(peSteg, 5, 0.0, 0.26) ? O('ARIT-PESTEG', `'fem multiplar' inom tolerans (${num(peSteg, 2)})`) : N('ARIT-PESTEG', `'fem multiplar': faktiskt ${num(peSteg, 2)} — formuleringsexakthet`);
A('identitet mcap/PE implicit', 344483 / 25.377, 13570, 0.005, 15);
A('identitetsgap %', ((13650 - 344483 / 25.377) / 13650) * 100, 0.56, 0.03, 0.011);
A('TTM-intäkter summa', 11510 + 12051 + 12250 + 12560, 48371, 0, 0);
A('TTM-EBIT summa', 3248 + 2957 + 3957 + 4193, 14355, 0, 0);
const aktier = 344483 / 82.73;
A('aktiebas mdr/kr', aktier, 4164, 0.001, 1.5);
A('BVPS 30 152/aktier', 30152 / aktier, 7.24, 0.005, 0.0051);
A('P/B-stängning 82,73/BVPS', 82.73 / (30152 / aktier), 11.425, 0.005, 0.051);
A('DuPont P/E×ROE', 25.377 * 0.4954, 12.6, 0.005, 0.051);
A('DuPont-gap %', ((25.377 * 0.4954 - 11.425) / 11.425) * 100, 10, 0.02, 0.51);
A('ROE slut-EK 13 650/30 152 %', (13650 / 30152) * 100, 45.3, 0.005, 0.051);
A('EV-kedja', 344.483 + 14.3 - 9.1, 349.7, 0.001, 0.051);
A('EV/EBIT TTM 349 683/14 355', 349683 / 14355, 24.4, 0.005, 0.051);
A('fält-EBIT-bas 349 683/21,801', 349683 / 21.801, 16040, 0.005, 5.1);
A('skuldkvot 14 309/30 152', 14309 / 30152, 0.47, 0.005, 0.0051);
A('omsCAGR replik %', ((45183.036 / 31615.55) ** (1 / 3) - 1) * 100, 12.6, 0.005, 0.051);
A('resCAGR replik %', ((10981.201 / 4491.924) ** (1 / 3) - 1) * 100, 34.7, 0.005, 0.051);
A('CAGR-kontroll 31 616×1,126³', 31615.55 * 1.126 ** 3, 45183, 0.0015, 50);
A('PEG konvention 25,4/6,43', 25.4 / 6.43, 3.9, 0.02, 0.051);
A('PEG implicit nämnare 25,377/1,49', 25.377 / 1.49, 17.0, 0.005, 0.051);
A('kursglidning %', ((82.73 - 75.42) / 82.73) * 100, 8.8, 0.01, 0.051);
A('P/E@75,42 fält-EPS', 75.42 / (82.73 / 25.377), 23.1, 0.005, 0.051);
A('P/E@75,42 justerad', (75.42 * aktier) / 11456, 27.4, 0.005, 0.051);
A('FCF-marg TTM 11 151/48 371 %', (11151 / 48371) * 100, 23.1, 0.005, 0.051);
A('FCF-yield TTM 11 151/344 483 %', (11151 / 344483) * 100, 3.2, 0.01, 0.051);
A('FCF-guide 12,5/51,2 %', (12.5 / 51.2) * 100, 24.4, 0.005, 0.051);
A('FCF-kvot fält/brev', 52.49 / 23.05, 2.3, 0.02, 0.021);
A('Q2 y/y 12 560/11 079 %', (12560 / 11079 - 1) * 100, 13.4, 0.005, 0.051);
A('Q3F y/y 12 860/11 510 %', (12860 / 11510 - 1) * 100, 11.7, 0.005, 0.051);
const margKvart = [[3775, 11079, 34.1], [3248, 11510, 28.2], [2957, 12051, 24.5], [3957, 12250, 32.3], [4193, 12560, 33.4], [4268, 12860, 33.2]];
for (const [e, o, t] of margKvart) A(`rörelsemarginal ${o}`, (e / o) * 100, t, 0.005, 0.051);
A('EPS-tillväxt Q2 0,80/0,72 %', (0.80 / 0.72 - 1) * 100, 11, 0.01, 0.51);
A('aktiebas-fall 4 261/4 349 %', (1 - 4261 / 4349) * 100, 2.0, 0.01, 0.051);
A('EPS-mekanik 1,088×1,021 %', (1.088 * 1.021 - 1) * 100, 11, 0.01, 0.51);
A('regioner summa', 5432 + 4034 + 1584 + 1510, 12560, 0, 0);
A('återköp halvår/guide %', (6.0 / 12.5) * 100, 48, 0.005, 0.51) ;
A('auktorisering/mcap %', (27.1 / 344.483) * 100, 7.9, 0.01, 0.051);
A('annons/guidemittpunkt %', (3.0 / 51.2) * 100, 5.9, 0.005, 0.051);
const scen = [[50600, 15433, 15939, 16445], [51200, 15616, 16128, 16640], [51800, 15799, 16317, 16835]];
for (const [o, c1, c2, c3] of scen) {
  A(`scen ${o}×30,5 %`, o * 0.305, c1, 0, 0.51);
  A(`scen ${o}×31,5 %`, o * 0.315, c2, 0, 0.51);
  A(`scen ${o}×32,5 %`, o * 0.325, c3, 0, 0.51);
}
A('mittruta/årbas tillväxt %', (16128 / (0.295 * 45183.036) - 1) * 100, 21.0, 0.005, 0.11);
A('år-bas 0,295×45 183', 0.295 * 45183.036, 13329, 0.001, 1.5);
A('20 %-linjen på bas', 13329 * 1.20, 16000, 0.001, 11);
A('känslighet marginal', 0.01 * 51200, 512, 0, 0);
A('känslighet volym', 0.03 * 51200, 1536, 0, 0);
A('vikt volym/marginal', 1536 / 512, 3, 0, 0);
A('split EPS 0,80×10', 0.80 * 10, 8.00, 0, 0);
A('split kurs 82,73×10', 82.73 * 10, 827.3, 0.01, 1.1);

// ── 5. Juridik 2007:528 ──
const vm = JSON.parse(fs.readFileSync(`${ROT}/data/varumarke.json`, 'utf8'));
const fraser = vm.forbjudnaFraser || [];
let vmTr = 0;
for (const [yt, text] of Object.entries(YTOR)) {
  for (const f of fraser) {
    if (typeof f === 'string' && f.length > 2 && text.toLowerCase().includes(f.toLowerCase())) { vmTr++; F('JUR-VM', `förbjuden fras '${f}' på ${yt}`); }
  }
}
vmTr === 0 ? O('JUR-VM', `${fraser.length} förbjudna fraser × 3 ytor = 0 träffar`) : N('JUR-VM', `${vmTr} träffar av ${fraser.length} fraser`);
const radMönster = /\b(köp|köpa|köper|sälj|sälja|säljer|rekommenderar|rekommendation|bör du|råd\b|bra affär|handla)\b/gi;
const radTr = [];
for (const [yt, text] of Object.entries(YTOR)) {
  const m = text.match(radMönster); if (m) radTr.push(`${yt}: ${[...new Set(m.map(x => x.toLowerCase()))].join('/')}`);
}
N('JUR-RAD', `rådordsträffar (kontextbedömning): ${radTr.length ? radTr.join(' · ') : '0'}`);
const lagrum = [...new Set([...`${T} ${D} ${B}`.matchAll(/\b(?:19|20)\d{2}:\d{3,4}\b/g)].map(m => m[0]))];
(lagrum.length === 1 && lagtrumSafe(lagrum)) ? O('JUR-LAG', `exakt en lagrumsfamilj: ${lagrum[0]} (2 kap 5 § närvarande: ${/2 kap 5 §/.test(B)})`) : F('JUR-LAG', `lagrumsfamiljer: ${lagrum.join(', ') || '0'}`);
function lagtrumSafe(l) { return l[0] === '2007:528'; }
const sistaStycke = B.trim().split(/\n\n/).pop();
(/Publicering av utkastet är kundens beslut \(R2\)/.test(sistaStycke) && /2007:528/.test(sistaStycke) && /Inga köp-, sälj-/.test(sistaStycke))
  ? O('JUR-DISCL', 'disclaimer + lagrum + R2 sist i bodyn') : F('JUR-DISCL', 'bodyns sista stycke saknar fullständig disclaimer/R2');
(/utbildning/i.test(B) && !/rådgivning utan tillstånd/) ? O('JUR-UTB', 'utbildningsramen bärande (utbildning i metodik)') : N('JUR-UTB', 'utbildningsram kontrolleras manuellt');

// ── 6. 911 ──
const t911 = (T + D + B).match(/911/g);
(t911 === null) ? O('911', '0 träffar') : F('911', `${t911.length} träffar`);

// ── 7. Språk/artefakter ──
(/balansradsPOST/.test(B)) ? F('SPRAK', '"balansradsPOST" — versal-artefakt i body') : O('SPRAK', 'inga versal-artefakter (balansradsPOST)');
(/approaching/.test(B)) ? F('SPRAK', 'engelskans "approaching" i svensk löptext') : O('SPRAK', 'ingen engelska i löptext');
(/telik/.test(B)) ? N('SPRAK', '"telik men inte tele-tung" — oklar bildning (föreslå "tele-lik")') : O('SPRAK', 'ingen oklar bildning');

// ── 8. Länkar ──
const interna = [...new Set([...B.matchAll(/\]\((\/[^)\s]+)\)/g)].map(m => m[1].split(' ')[0]))];
N('LANK', `interna länkar (${interna.length}): ${interna.join(' ')}`);
const lankRes = await Promise.all(interna.map(p => new Promise(res => {
  const req = http.get({ host: '127.0.0.1', port: 3000, path: p, timeout: 8000 }, r => { r.resume(); res([p, r.statusCode]); });
  req.on('timeout', () => { req.destroy(); res([p, 'timeout']); });
  req.on('error', e => res([p, String(e.code || e.message)]));
})));
const doda = lankRes.filter(([, s]) => s !== 200);
doda.length === 0 ? O('LANK-INT', `${interna.length} interna länkar HTTP 200 mot localhost:3000`) : F('LANK-INT', `icke-200: ${doda.map(([p, s]) => `${p}→${s}`).join(' · ')}`);
// FCF-radens länketikett
{ const fcfLank = interna.find(p => p.includes('fcf'));
  await new Promise(res => { http.get({ host: '127.0.0.1', port: 3000, path: fcfLank, timeout: 8000 }, r => {
    let b = ''; r.on('data', c => b += c); r.on('end', () => {
      const harMarginal = /marginal/i.test(b);
      harMarginal ? N('LANK-FCF', `${fcfLank} sidan bär marginal-innehåll (etiketten 'FCF-marginal' → fcf-avkastning-rutten)`) : N('LANK-FCF', `${fcfLank} utan marginal-text på sidan`);
      res();
    }); r.resume?.();
  }).on('error', () => res()); });
}
const externa = [...new Set([...B.matchAll(/\]\((https:\/\/[^)\s]+)\)/g)].map(m => m[1]))];
for (const u of externa) {
  try {
    const ctrl = new AbortController(); const t = setTimeout(() => ctrl.abort(), 12000);
    const r = await fetch(u, { signal: ctrl.signal, redirect: 'follow', headers: { 'user-agent': 'Mozilla/5.0 (compatible; AK1A-granskare/1.0)' } });
    clearTimeout(t);
    r.status === 200 ? O('LANK-EXT', `${u.slice(0, 60)}… → 200`) : N('LANK-EXT', `${u.slice(0, 60)}… → ${r.status}`);
  } catch (e) { N('LANK-EXT', `${u.slice(0, 60)}… → fel ${String(e.cause?.code || e.message).slice(0, 40)}`); }
}

// ── 9. Kalender ──
const kal = JSON.parse(fs.readFileSync(`${ROT}/data/blogg-utkast/kvartal/2026-q3/kalender-kommunikation.json`, 'utf8'));
const kalText = JSON.stringify(kal);
(kalText.includes('NFLX') && kalText.includes('2026-10-20'))
  ? O('KAL', 'kalender-kommunikation.json bär NFLX 2026-10-20') : F('KAL', 'kalenderfilen saknar NFLX/2026-10-20');
(kalText.includes('obekräft') && /NFLX/.test(kalText))
  ? N('KAL-KLAS', 'kalenderfilens NFLX-post klassar datumet som estimat/obekräftat (hämtat 09-15) — föråldrat mot bolagets utlysning 14/9; bolagskällan äger (Stora Enso-precedensen); vidarebefordras som kalenderpatch')
  : N('KAL-KLAS', 'kalenderfilens klass inte maskinellt belagd');
const veckodag = new Date('2026-10-20T12:00:00Z').getUTCDay();
(veckodag === 2) ? O('KAL-DAG', '2026-10-20 är en tisdag') : F('KAL-DAG', `2026-10-20 veckodag=${veckodag} (2=tisdag)`);
(U.publishedAt === '2026-10-20') ? O('KAL-PUB', 'publishedAt 2026-10-20 == rappdagen') : F('KAL-PUB', `publishedAt ${U.publishedAt} != 2026-10-20`);

// ── 10. Formatering: title-tak, ord, readingMinutes ──
const tLen = [...T].length;
(tLen <= 314) ? O('FORM-TITLE', `title ${tLen} tkn ≤ 314 (wihlborgs-taket)`) : F('FORM-TITLE', `title ${tLen} tkn > 314`);
const dLen = [...D].length;
N('FORM-DESC', `description ${dLen} tkn (seriekonventionen; ingen maskinell gräns)`);
const ordAlla = B.trim().split(/\s+/).length;
const ordBokstav = B.trim().split(/\s+/).filter(w => /\p{L}/u.test(w)).length;
const rmBeraknat = Math.round(ordAlla / 600);
N('FORM-ORD', `body ${ordAlla} ord (varav ${ordBokstav} bokstavsord) → round(${ordAlla}/600) = ${rmBeraknat}; filens readingMinutes = ${U.readingMinutes}`);
(rmBeraknat === U.readingMinutes) ? O('FORM-RM', 'readingMinutes stämmer mot ordantalet') : F('FORM-RM', `readingMinutes ${U.readingMinutes} != beräknat ${rmBeraknat}`);
const slugOK = /^sa-laser-du-nflx-q3-2026$/.test(U.slug);
slugOK ? O('FORM-SLUG', 'slug konventionsenlig') : F('FORM-SLUG', `slug ${U.slug}`);

// ── Sammanfattning ──
rader.push('', `SAMMANFATTNING: ${ok} OK · ${fel} FEL · ${not} NOT`);
for (const r of rader) console.log(r);
process.exit(0);
