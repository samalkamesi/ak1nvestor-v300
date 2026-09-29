#!/usr/bin/env node
// _s1u2-getinge-q3-kontroll.mjs — granskningssond för sa-laser-du-getinge-q3-2026.json
// Spår 1 (granskare) s1-u2, manifest auto-s1-1790653512758. LÄSER ENDAST utkastet —
// rättningar levereras som diff. Kontroller: aritmetik, medianer/rang mot BYGGVINTAGE
// (Nordea-metoden: 73745b24 = textens egna 195-postfil), juridik 2007:528 (varumarke.json
// + rådmönster + lagrumsfamiljer), 911, interna länkar, struktur, kalender, korsreferenser.
import { execSync } from 'node:child_process';
import fs from 'node:fs';
import http from 'node:http';

const ROT = '/home/ak1a/AK1';
const UTKAST = JSON.parse(fs.readFileSync(`${ROT}/data/blogg-utkast/kvartal/2026-q3/sa-laser-du-getinge-q3-2026.json`, 'utf8'));
const BODY = UTKAST.body;

let ok = 0, fel = 0, not = 0;
const rader = [];
const O = (id, txt) => { ok++; rader.push(`OK   ${id}: ${txt}`); };
const F = (id, txt) => { fel++; rader.push(`FEL  ${id}: ${txt}`); };
const N = (id, txt) => { not++; rader.push(`NOT  ${id}: ${txt}`); };
const num = (v, d = 2) => Number(v.toFixed(d));
const pct = (a, b) => Math.abs(a - b) / Math.abs(b) * 100; // relativ differens i %

// ── Universum: dagens fil + byggvintage 73745b24 (textens "samma 195-postfil") ──
const dagens = JSON.parse(fs.readFileSync(`${ROT}/data/portfolj-system/bolagsunivers.json`, 'utf8'));
const vintageRaw = execSync('git show 73745b24:data/portfolj-system/bolagsunivers.json', { cwd: ROT, maxBuffer: 64 * 1024 * 1024 }).toString('utf8');
const vintage = JSON.parse(vintageRaw);
O('V01', `byggvintage 73745b24 inläst: ${vintage.length} poster (texten deklarerar 195-postfil)`);
const G = vintage.find(p => p.ticker === 'GETI-B.ST');
const Gd = dagens.find(p => p.ticker === 'GETI-B.ST');
if (!G || !Gd) { F('V02', 'GETI-B.ST saknas i vintage/dagens universum'); }
else {
  const falt = [
    ['pris', p => p.pris], ['mcap', p => p.marknadsKapitalMdr], ['pe', p => p.vardering.pe],
    ['pb', p => p.vardering.pb], ['evEbit', p => p.vardering.evEbit], ['peg', p => p.vardering.peg],
    ['fcfYield', p => p.vardering.fcfYield], ['roe', p => p.lonksamhet.roe], ['roic', p => p.lonksamhet.roic],
    ['brutto', p => p.lonksamhet.bruttoMarginal], ['ebit', p => p.lonksamhet.ebitMarginal],
    ['netto', p => p.lonksamhet.nettoMarginal], ['fcfMarg', p => p.lonksamhet.fcfMarginal],
    ['skuldEK', p => p.stabilitet.skuldEgenkapital], ['prognos', p => p.tillvaxt.prognosTillvaxt],
    ['resCAGR', p => p.tillvaxt.resultatCAGR5ar], ['omsCAGR', p => p.tillvaxt.omsattningCAGR5ar],
    ['ttm', p => p.tillvaxt.omsattningTillvaxtTTM],
  ];
  const skillda = falt.filter(([n, f]) => JSON.stringify(f(G)) !== JSON.stringify(f(Gd))).map(([n]) => n);
  if (skillda.length === 0) O('V02', `GETI-rad identisk vintage↔dagens fil på alla ${falt.length} nyckeltal (drift-fri)`);
  else N('V02', `GETI-rad skillda fält vintage↔dagens: ${skillda.join(', ')} (texten ska stämma mot VINTAGEN)`);
}

// GETI:s egna tal ur vintagen — utkastets tabell
const pe = G.vardering.pe, pb = G.vardering.pb, evEbit = G.vardering.evEbit, peg = G.vardering.peg;
const fcfY = G.vardering.fcfYield, roe = G.lonksamhet.roe, roic = G.lonksamhet.roic;
const brutto = G.lonksamhet.bruttoMarginal, ebitM = G.lonksamhet.ebitMarginal, nettoM = G.lonksamhet.nettoMarginal;
const fcfM = G.lonksamhet.fcfMarginal, skuldEK = G.stabilitet.skuldEgenkapital;
const prog = G.tillvaxt.prognosTillvaxt, resC = G.tillvaxt.resultatCAGR5ar, omsC = G.tillvaxt.omsattningCAGR5ar;
const ttm = G.tillvaxt.omsattningTillvaxtTTM;
const mcapMkr = G.marknadsKapitalMdr * 1000; // 66,921 mdr → 66 921 Mkr
const oms = G.serier.omsattning.map(v => v / 1e6), res = G.serier.resultat.map(v => v / 1e6);
const ar = G.serier.ar.map(Number);

const tabell = {
  'P/E 24,818': pe === 24.818, 'P/B 2,163': pb === 2.163, 'EV/EBIT 13,74': evEbit === 13.74,
  'PEG 1,54': peg === 1.54, 'FCF-avk 4,25': fcfY === 0.0425, 'ROE 8,95': roe === 0.0895,
  'ROIC 13,81': roic === 0.1381, 'brutto 48,6': brutto === 0.486, 'EBIT 16,12': ebitM === 0.1612,
  'netto 7,82': nettoM === 0.0782, 'FCF-marg 8,31': fcfM === 0.0831, 'skuld/EK 0,358 (0,3581)': Math.abs(skuldEK - 0.3581) < 1e-9,
  'prognos 8,77': prog === 0.0877, 'resCAGR −3,22': resC === -0.0322, 'omsCAGR 7,32': omsC === 0.0732,
  'TTM 1,7': ttm === 0.017, 'kurs 245,70': G.pris === 245.7, 'mcap 66 921': mcapMkr === 66921,
};
for (const [k, v] of Object.entries(tabell)) (v ? O : F)(`T:${k}`, v ? 'fältet matchar vintage-raden' : `AVVIKELSE (filen: n/a)`);

// Serier
const serOK = JSON.stringify(oms) === JSON.stringify([28292, 31827, 34759, 34969]) && JSON.stringify(res) === JSON.stringify([2491, 2412, 1638, 2258]) && JSON.stringify(ar) === JSON.stringify([2022, 2023, 2024, 2025]);
serOK ? O('S01', `serien 2022–2025 exakt: oms ${oms.join('/')} res ${res.join('/')}`) : F('S01', `serien avviker: ${oms.join('/')}/${res.join('/')}`);

// ── Medianer + rang mot vintagen (projektets median(): jämnt → medel av två mittersta) ──
function median(vs) { const v = vs.filter(x => x !== null && x !== undefined && Number.isFinite(x)).sort((a, b) => a - b); if (!v.length) return { m: null, n: 0 }; const m = v.length % 2 ? v[(v.length - 1) / 2] : (v[v.length / 2 - 1] + v[v.length / 2]) / 2; return { m, n: v.length }; }
const halso = vintage.filter(p => p.bransch === 'halso');
const matt = [
  ['P/E', p => p.vardering?.pe, false], ['P/B', p => p.vardering?.pb, false], ['EV/EBIT', p => p.vardering?.evEbit, false],
  ['PEG', p => p.vardering?.peg, false], ['FCF-avk', p => p.vardering?.fcfYield, false], ['ROE', p => p.lonksamhet?.roe, false],
  ['ROIC', p => p.lonksamhet?.roic, false], ['brutto', p => p.lonksamhet?.bruttoMarginal, false],
  ['EBIT', p => p.lonksamhet?.ebitMarginal, false], ['netto', p => p.lonksamhet?.nettoMarginal, false],
  ['FCF-marg', p => p.lonksamhet?.fcfMarginal, false], ['skuld/EK', p => p.stabilitet?.skuldEgenkapital, false],
  ['prognos', p => p.tillvaxt?.prognosTillvaxt, false], ['resCAGR', p => p.tillvaxt?.resultatCAGR5ar, false],
  ['omsCAGR', p => p.tillvaxt?.omsattningCAGR5ar, false], ['TTM', p => p.tillvaxt?.omsattningTillvaxtTTM, false],
];
// textens medianer: [hälso, universum, rang, angiven n-gren]
const textMedian = {
  'P/E': [26.080, 21.153, '13/21', 21], 'P/B': [3.620, 2.806, '18/21', 21], 'EV/EBIT': [17.86, 18.26, '19/22', 22],
  'PEG': [0.79, 1.38, '3/21', 21], 'FCF-avk': [0.0431, 0.0394, '12/21', 21], 'ROE': [0.1541, 0.1534, '16/21', 21],
  'ROIC': [0.1624, 0.1349, '13/21', 21], 'brutto': [0.710, 0.478, '18/22', 22], 'EBIT': [0.2485, 0.2071, '17/22', 22],
  'netto': [0.1297, 0.1305, '16/22', 22], 'FCF-marg': [0.1437, 0.1251, '19/22', 22], 'skuld/EK': [0.642, 0.520, '5/21', 21],
  'prognos': [0.2422, 0.1360, '17/22', 22], 'resCAGR': [0.0454, 0.0392, '15/20', 20], 'omsCAGR': [0.0730, 0.0439, '11/22', 22],
  'TTM': [0.0459, 0.0680, '17/22', 22],
};
for (const [namn, f] of matt) {
  const h = median(halso.map(f)), u = median(vintage.map(f));
  const [th, tu, trang, tn] = textMedian[namn];
  const hOK = h.m !== null && pct(h.m, th) < 0.6; // tolerans för textens avrundning (3 signifikanta)
  const uOK = u.m !== null && pct(u.m, tu) < 0.6;
  // rang: GETI:s position i grenen, fallande (högst=1) och stigande (lägst=1)
  const gV = f(G);
  const sorterade = halso.map(f).filter(x => x !== null && x !== undefined && Number.isFinite(x)).sort((a, b) => b - a);
  const rangFallande = sorterade.indexOf(gV) + 1;
  const rangStigande = sorterade.length - rangFallande + 1;
  const [angivetNr, angivetN] = trang.split('/').map(Number);
  const rangOK = angivetNr === rangFallande || angivetNr === rangStigande;
  const nOK = h.n === angivetN || h.n === tn;
  const konv = angivetNr === rangFallande && angivetNr === rangStigande ? 'båda' : (angivetNr === rangFallande ? 'fallande(högst=1)' : 'stigande(lägst=1)');
  if (hOK && uOK && rangOK && h.n === angivetN) O(`M:${namn}`, `medianer ${num(h.m * 100, 2)} %/${num(u.m * 100, 2)} % (n ${h.n}/${u.n}) — textens ${th}/${tu}, rang ${trang} ✓ (${konv})`);
  else F(`M:${namn}`, `median ${num(h.m * 100, 3)} % (n ${h.n}) / ${num(u.m * 100, 3)} % (n ${u.n}) mot textens ${th}/${tu}; rang fallande=${rangFallande} stigande=${rangStigande} av ${sorterade.length} mot textens ${trang}${rangOK ? '' : ' — RANG AVVIKER'}`);
}

// ── Aritmetik: textens egna beräkningar ──
const A = (id, expect, got, tolPct = 0.5) => { const d = pct(got, expect); (d <= tolPct ? O : F)(id, `räknat ${num(got, 4)} mot textens ${num(expect, 4)} (${num(d, 2)} %)`); };

// Identitetstest: P/B ÷ ROE
A('A:identitet', 24.17, pb / roe);
A('A:identitet-diff%', 2.6, pct(pe, pb / roe), 6);
// Absolutkontroll
A('A:absolut', 56039, pe * res[3], 0.05);
A('A:absolut-residual%', -16.3, (pe * res[3] - mcapMkr) / mcapMkr * 100, 2);
A('A:implicit-vinst', 2696, mcapMkr / pe, 0.05);
// EV-kedjan
A('A:ebit2025', 5637, ebitM * oms[3], 0.05);
A('A:ek', 30939, mcapMkr / pb, 0.05);
A('A:skuld', 11079, (mcapMkr / pb) * skuldEK, 0.05); // fullprecision 0,3581
A('A:ev', 78000, mcapMkr + (mcapMkr / pb) * skuldEK, 0.05);
A('A:ev-ebit', 13.84, (mcapMkr + (mcapMkr / pb) * skuldEK) / (ebitM * oms[3]), 0.3);
A('A:ev-ebit-diff%', 0.71, pct(13.74, (mcapMkr + (mcapMkr / pb) * skuldEK) / (ebitM * oms[3])), 15);
A('A:ev-vand', 77452, 13.74 * (ebitM * oms[3]), 0.05);
A('A:ev-gap', 548, (mcapMkr + (mcapMkr / pb) * skuldEK) - 13.74 * (ebitM * oms[3]), 1);
// TTM-detektiv
A('A:ttm-bokford', 7.30, (res[3] / (mcapMkr / pb)) * 100, 1);
A('A:ttm-implicit', 8.72, ((mcapMkr / pe) / (mcapMkr / pb)) * 100, 1);
A('A:ttm-gap1', 0.23, 8.95 - ((mcapMkr / pe) / (mcapMkr / pb)) * 100, 8);
A('A:ttm-gap2', 1.65, 8.95 - (res[3] / (mcapMkr / pb)) * 100, 3);
A('A:ttm-upp', 19.4, ((mcapMkr / pe) / res[3] - 1) * 100, 1);
// FCF-paret
A('A:fcf', 2906, fcfM * oms[3], 0.05);
A('A:fcf-avk', 4.34, (fcfM * oms[3] / mcapMkr) * 100, 0.5);
A('A:fcf-diff%', 2.2, pct(0.0425, fcfM * oms[3] / mcapMkr), 8);
A('A:pfcf', 23.5, 1 / fcfY, 0.5);
// PEG
A('A:peg-konv', 2.83, pe / (prog * 100), 0.5);
A('A:peg-kvot', 0.54, peg / (pe / (prog * 100)), 2);
A('A:peg-implicit', 16.1, pe / peg, 0.5);
// CAGR-replikering
A('A:cagr-oms', 7.32, ((oms[3] / oms[0]) ** (1 / 3) - 1) * 100, 0.3);
A('A:cagr-res', -3.22, ((res[3] / res[0]) ** (1 / 3) - 1) * 100, 0.3);
// Marginalserie + steg
for (let i = 0; i < 4; i++) A(`A:nmarg-${ar[i]}`, [8.80, 7.58, 4.71, 6.46][i], (res[i] / oms[i]) * 100, 0.2);
A('A:omsteg-23', 12.49, (oms[1] / oms[0] - 1) * 100, 0.2);
A('A:omsteg-24', 9.21, (oms[2] / oms[1] - 1) * 100, 0.2);
A('A:omsteg-25', 0.60, (oms[3] / oms[2] - 1) * 100, 1);
A('A:ressteg-23', -3.17, (res[1] / res[0] - 1) * 100, 0.3);
A('A:ressteg-24', -32.09, (res[2] / res[1] - 1) * 100, 0.2);
A('A:ressteg-25', 37.85, (res[3] / res[2] - 1) * 100, 0.1);
A('A:total', 23.6, (oms[3] / oms[0] - 1) * 100, 1);
// Botten-notisen: "833 miljoner lägre resultat" 2024 vs 2022
A('A:botten-resgap', 833, res[0] - res[2], 0.05); // räknesanekt: 2 491−1 638 = 853
// DuPont
A('A:dupont-klipp1', 32.5, (brutto - ebitM) * 100, 0.5);
A('A:dupont-klipp2', 8.3, (ebitM - nettoM) * 100, 0.5);
A('A:dupont-tredjedel', 66.9, ((brutto - ebitM) / brutto) * 100, 1);
// Övning 2
A('A:ov2-medianvinst', 2566, mcapMkr / 26.08, 0.1);
A('A:ov2-upp', 13.7, (mcapMkr / 26.08 / res[3] - 1) * 100, 1);
// Scenarioruta: nio celler, basmarginal ostrunkerad
const basM = res[3] / oms[3];
const marg = [basM - 0.02, basM, basM + 0.02];
const om = [oms[3] * 0.97, oms[3], oms[3] * 1.03];
const korrekt = marg.map(m => om.map(o => Math.round(o * m))); // [marg][oms]
const textRuta = [[1512, 2190, 2869], [1559, 2258, 2957], [1605, 2326, 3046]];
let cellOK = 0, transpOK = 0;
for (let i = 0; i < 3; i++) for (let j = 0; j < 3; j++) {
  if (Math.abs(textRuta[i][j] - korrekt[i][j]) <= 1) cellOK++;
  if (Math.abs(textRuta[i][j] - korrekt[j][i]) <= 1) transpOK++;
}
if (cellOK === 9) O('A:scenario', 'alla 9 celler korrekt placerade');
else if (transpOK === 9) F('A:scenario', `scenariorutan TRANSPOSERAD: 0/9 celler rätt placerade (diagonalen orörd), men ${transpOK}/9 matchar det transponerade mönstret — etiketter och värden korsade`);
else F('A:scenario', `scenariorutan: ${cellOK}/9 celler korrekta, ${transpOK}/9 transponerat — okänt mönster`);
A('A:scen-margvikt', 5.16, (oms[3] * 0.01) / (oms[3] * 0.03 * basM), 1);
A('A:scen-volymnetto', 67.7, oms[3] * 0.03 * basM, 0.5);
A('A:scen-margmkr', 349.7, oms[3] * 0.01, 0.2);
A('A:scen-ebitvikt', 2.07, 1 / (3 * ebitM), 1);
// Marginalsteg 2025 och DuPont-notens tillskrivning
A('A:margsteg-25', 1.75, (basM - res[2] / oms[2]) * 100, 1); // 6,46−4,71
A('A:margsteg-24', 2.87, (res[1] / oms[1] - res[2] / oms[2]) * 100, 1); // 7,58−4,71 = 2024:S förlust

// ── Struktur ──
const ord = BODY.split(/\s+/).filter(Boolean).length;
const h2 = (BODY.match(/^## /gm) || []).length;
const titelLangd = [...UTKAST.title].length;
const rmKonv = Math.round(ord / 600);
rmKonv === UTKAST.readingMinutes ? O('ST:rm', `${ord} ord → round(${ord}/600) = ${rmKonv} = readingMinutes ${UTKAST.readingMinutes} (kvartalskonventionen)`) : F('ST:rm', `${ord} ord → konventionen round(/600) = ${rmKonv} men filen säger ${UTKAST.readingMinutes}`);
h2 === 7 ? O('ST:h2', `7 H2-sektioner`) : N('ST:h2', `${h2} H2-sektioner (0 FEL — ingen känd konvention med exakt antal)`);
titelLangd <= 314 ? O('ST:titel', `${titelLangd} tkn ≤ taket 314 (syskonmax Kinnevik 313)`) : F('ST:titel', `${titelLangd} tkn > taket 314`);
UTKAST.publishedAt === '2026-10-20' ? O('ST:pub', 'publishedAt 2026-10-20 = primära rappdagen (Kinnevik-konventionen; 21:e-alternativet redovisas öppet)') : F('ST:pub', 'publishedAt ≠ rappdag');
(UTKAST.tags.length === 8) ? O('ST:tags', '8 tags') : N('ST:tags', `${UTKAST.tags.length} tags`);
/disclaimer|utbildning/.test(BODY.slice(-900)) && /2007:528/.test(BODY.slice(-900)) ? O('ST:disclaimer', 'disclaimer med 2007:528 sist i bodyn') : F('ST:disclaimer', 'disclaimer saknas/slutet');

// ── Juridik 2007:528 ──
const vm = JSON.parse(fs.readFileSync(`${ROT}/data/varumarke.json`, 'utf8'));
let vmTraff = 0;
for (const frasa of vm.forbjudnaFraser) {
  const re = new RegExp(frasa.fran, 'i');
  if (re.test(BODY) || re.test(UTKAST.title) || re.test(UTKAST.description)) { vmTraff++; F('J:vm', `förbjuden fras "${frasa.fran}" (${frasa.motiv})`); }
}
vmTraff === 0 && O('J:vm', `varumärkesgrinden: 0 träffar av ${vm.forbjudnaFraser.length} förbjudna fraser på title+description+body`);
// rådsverb — varje träff måste vara negerad/pedagogisk
const radMönster = [[/\brekommend/i, /rekommend/i], [/^.*\bköp\b.*$/i, /\bköp\b/i], [/\bbör du\b/i, null], [/vi råder/i, null]];
const rådsTräff = [];
const rekoHits = BODY.match(/.{60}rekommend.{60}/gis) || [];
for (const h of rekoHits) rådsTräff.push(h.replace(/\n/g, ' '));
const negerad = rådsTräff.every(t => /inga|inte|aldrig|utan|fri från/i.test(t));
if (rådsTräff.length === 0) O('J:rad', '0 förekomster av rekommend-form');
else (negerad ? O : F)('J:rad', `${rådsTräff.length} rekommend-förekomster, alla negerade: "${rådsTräff[0].slice(0, 80)}…"`);
// lagrumsfamiljer — exakt en väntas (2007:528)
const familjer = ['2007:528', '2022:260', '2022:261', '1985:716', '2005:59', '2022:482'].filter(L => new RegExp(L.replace(':', '\\s*:?\\s*')).test(BODY));
familjer.join(',') === '2007:528' ? O('J:lagrum', 'exakt en lagrumsfamilj: 2007:528 (blandningsregeln hel)') : F('J:lagrum', `lagrumsfamiljer: ${familjer.join(', ') || 'INGA'}`);
// utbildningsgrunden
(/utbildning/i.test(BODY) && /inte investeringsrådgivning/i.test(BODY)) ? O('J:utbildning', 'utbildningsgrunden bärande (utbildning + icke-rådgivning deklarerat)') : F('J:utbildning', 'utbildningsformen ej deklarerad');

// ── 911 ──
const rå911 = (BODY + UTKAST.title + UTKAST.description).match(/.{40}911.{40}/g) || [];
const text911 = rå911.filter(t => !/https?:\/\/\S*911/i.test(t));
text911.length === 0 ? O('911', `0 träffar i textytan (${rå911.length} råträff(ar), samtliga URL-id-klass)`) : F('911', `${text911.length} textträff(ar): "${text911[0]}"`);

// ── Interna länkar ──
const paths = [...new Set((BODY.match(/\]\((\/[^)\s]+)\)/g) || []).map(m => m.slice(2, -1).split(' ')[0]))];
const länkResultat = await Promise.all(paths.map(p => new Promise(resolve => {
  const req = http.get({ host: '127.0.0.1', port: 3000, path: p, timeout: 8000 }, r => { r.resume(); resolve([p, r.statusCode]); });
  req.on('timeout', () => { req.destroy(); resolve([p, 'TIMEOUT']); });
  req.on('error', e => resolve([p, String(e.code || e.message)]));
})));
for (const [p, s] of länkResultat) { if (s === 200) O('L:' + p, '200'); else F('L:' + p, String(s)); }

// ── Kalender ──
const kal = JSON.parse(fs.readFileSync(`${ROT}/data/blogg-utkast/kvartal/2026-q3/kalender-halso.json`, 'utf8'));
const kgeti = kal.bolag.find(b => b.ticker === 'GETI-B.ST');
kgeti && /2026-10-20/.test(kgeti.rapportfenster) && /2026-10-21/.test(kgeti.rapportfenster) && /2026-04-21/.test(kgeti.notera) && /2026-07-17/.test(kgeti.notera) && /2026-09-15/.test(kgeti.notera)
  ? O('KAL', 'kalender-halso.json: 20/21-divergensen + Q1 04-21 + Q2 07-17 + pre-close 09-15 — alla fyra kalenderpåståenden belagda')
  : F('KAL', 'kalendern avviker: ' + JSON.stringify(kgeti).slice(0, 200));

// ── Gallringsunderlag: Kinnevik/Billerud/Viaplay i vintagen ──
const kin = vintage.find(p => /kinnevik/i.test(p.namn) || /KINV/i.test(p.ticker));
if (kin) {
  const kinOms = (kin.serier?.omsattning || []).map(v => v / 1e6);
  const kinRes = (kin.serier?.resultat || []).map(v => v / 1e6);
  const nollår = JSON.stringify(kinOms) === JSON.stringify([0, 936, 23, 0]);
  const negAlla = kinRes.every(v => v < 0);
  const peOsatt = kin.vardering?.pe == null;
  (nollår && negAlla && peOsatt) ? O('GA:kinnevik', 'nollår (0/936/23/0), negativt resultat alla år, P/E osatt — gallran belagd') : N('GA:kinnevik', `Kinnevik-data: oms ${kinOms.join('/')} res ${kinRes.join('/')} pe ${kin.vardering?.pe}`);
} else N('GA:kinnevik', 'Kinnevik saknas i vintagen');
const bil = vintage.find(p => /billerud/i.test(p.namn));
if (bil) {
  const rc = bil.tillvaxt?.resultatCAGR5ar;
  (bil.vardering?.pe == null && Math.abs(rc * 100 + 46.3) < 0.5) ? O('GA:billerud', 'P/E osatt + resultatCAGR −46,3 % belagt') : N('GA:billerud', `Billerud: pe ${bil.vardering?.pe} resCAGR ${rc}`);
} else N('GA:billerud', 'Billerud saknas i vintagen');
const via = vintage.find(p => /viaplay/i.test(p.namn));
if (via) {
  const vres = (via.serier?.resultat || []).map(v => v / 1e6);
  const f2023 = vres[via.serier.ar.indexOf('2023')];
  const roeV = via.lonksamhet?.roe;
  (Math.abs(f2023 + 9747) < 10 && Math.abs(roeV * 100 + 52.9) < 0.5) ? O('GA:viaplay', `2023: ${f2023} Mkr + ROE ${num(roeV * 100, 1)} % belagt`) : N('GA:viaplay', `Viaplay 2023 ${f2023}, ROE ${roeV}`);
} else N('GA:viaplay', 'Viaplay saknas i vintagen');

// ── Korsreferenser till syskonpaket ──
const las = f => { try { return fs.readFileSync(`${ROT}/data/blogg-utkast/kvartal/2026-q3/${f}`, 'utf8'); } catch { return null; } };
// Marginalvikts-rekordet: "seriens högsta netto-marginalvikt hittills" får bara stämma om
// inget tidigare paket deklarerar en högre netto-marginalvikt. Seriens topplista på disk
// FÖRE Getinge-bygget (09-19 03:09): Electrolux 10,45 (09-18 08:59) och SCA 8,55 (09-17).
const elec = las('sa-laser-du-electrolux-q3-2026.json'), sca = las('sa-laser-du-sca-q3-2026.json');
const elecRekord = elec && /1 ÷ \(3 × 0,0319\) = \*\*10,45\*\*[^"]{0,80}seriens nya rekord[^"]{0,40}SCA:s 8,55/.test(elec);
const scaRekord = sca && /8,55/.test(sca) && /(rekord|högst)/i.test(sca);
if (elecRekord) F('X:margvikt-rekord', '"seriens högsta netto-marginalvikt hittills" (5,16) MOTBEVISAD: Electrolux-paketet (på disk 09-18, ett dygn före Getinge-bygget) deklarerar 10,45 som "seriens nya rekord, slår SCA:s 8,55" — Getinge 5,16 är som bäst seriens TREDJE högsta');
else N('X:margvikt-rekord', `Electrolux-bevis ej maskinellt belagt (elec ${elec ? 'läst' : 'saknas'}: ${scaRekord})`);
const kors = [
  ['cellavision-q3', 'sa-laser-du-cellavision-q3-2026.json', ['3,8', '+18,9', '1,2', '1,65', '18,5', '20,2', '0,059', '1,6 procent']],
  ['novo-q3', 'sa-laser-du-novo-nordisk-q3-2026.json', ['13,9', '6,0', '1,01', 'under hälften']],
  ['goldman-q3', 'sa-laser-du-goldman-sachs-q3-2026.json', ['1,24', '3,31']],
  ['assa-q3', 'sa-laser-du-assa-abloy-q3-2026.json', ['1,45', '1,97', '1,98']],
];
for (const [namn, fil, tal] of kors) {
  const t = las(fil);
  if (!t) { N(`X:${namn}`, 'syskonfil saknas'); continue; }
  const saknas = tal.filter(x => !t.includes(x));
  saknas.length === 0 ? O(`X:${namn}`, `${tal.length} citerade korsreferenstal alla belagda i syskonpaketet`) : F(`X:${namn}`, `ej funna i syskonpaketet: ${saknas.join(', ')}`);
}

// ── Sammanfattning ──
console.log(rader.join('\n'));
console.log(`\n=== SOND s1-u2 GETINGE Q3: ${ok} OK · ${fel} FEL · ${not} NOT ===`);
process.exit(fel > 0 ? 1 : 0);
