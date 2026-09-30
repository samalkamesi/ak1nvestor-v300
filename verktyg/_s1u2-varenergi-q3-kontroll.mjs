#!/usr/bin/env node
// _s1u2-varenergi-q3-kontroll.mjs — granskningssond för sa-laser-du-var-energi-q3-2026.json
// Spår 1 (granskare) s1-u2, manifest auto-s1-1790796926223. LÄSER ENDAST utkastet —
// rättningar levereras som diff. Kontroller: källtalsparitet mot BYGGVINTAGE
// (texten deklarerar 177-postfilen 2026-09-18 = 75d04140), aritmetik, medianer/rang,
// juridik 2007:528 (varumarke.json + rådmönster + lagrumsfamiljer), 911, interna +
// externa länkar, struktur, kalender, gallring, korsreferenser.
import { execSync } from 'node:child_process';
import fs from 'node:fs';
import http from 'node:http';

const ROT = '/home/ak1a/AK1';
const UTKAST = JSON.parse(fs.readFileSync(`${ROT}/data/blogg-utkast/kvartal/2026-q3/sa-laser-du-var-energi-q3-2026.json`, 'utf8'));
const BODY = UTKAST.body;

let ok = 0, fel = 0, not = 0;
const rader = [];
const O = (id, txt) => { ok++; rader.push(`OK   ${id}: ${txt}`); };
const F = (id, txt) => { fel++; rader.push(`FEL  ${id}: ${txt}`); };
const N = (id, txt) => { not++; rader.push(`NOT  ${id}: ${txt}`); };
const num = (v, d = 2) => Number(v.toFixed(d));
const pct = (a, b) => Math.abs(a - b) / Math.abs(b) * 100;

// ── Universum: dagens fil + byggvintage 75d04140 (textens "samma 177-postfil") ──
const dagens = JSON.parse(fs.readFileSync(`${ROT}/data/portfolj-system/bolagsunivers.json`, 'utf8'));
const VINT_HASH = '75d04140';
const vintageRaw = execSync(`git show ${VINT_HASH}:data/portfolj-system/bolagsunivers.json`, { cwd: ROT, maxBuffer: 64 * 1024 * 1024 }).toString('utf8');
const vintage = JSON.parse(vintageRaw);
O('V01', `byggvintage ${VINT_HASH} inläst: ${vintage.length} poster (texten deklarerar 177-postfil)`);
const V = vintage.find(p => p.ticker === 'VAR.OL');
const Vd = dagens.find(p => p.ticker === 'VAR.OL');
if (!V || !Vd) F('V02', 'VAR.OL saknas i vintage/dagens universum');
else {
  const falt = [
    ['pris', p => p.pris], ['mcap', p => p.marknadsKapitalMdr], ['pe', p => p.vardering.pe],
    ['pb', p => p.vardering.pb], ['evEbit', p => p.vardering.evEbit], ['peg', p => p.vardering.peg],
    ['fcfYield', p => p.vardering.fcfYield], ['roe', p => p.lonksamhet.roe], ['roic', p => p.lonksamhet.roic],
    ['brutto', p => p.lonksamhet.bruttoMarginal], ['ebit', p => p.lonksamhet.ebitMarginal],
    ['netto', p => p.lonksamhet.nettoMarginal], ['fcfMarg', p => p.lonksamhet.fcfMarginal],
    ['skuldEK', p => p.stabilitet.skuldEgenkapital], ['prognos', p => p.tillvaxt.prognosTillvaxt],
    ['resCAGR', p => p.tillvaxt.resultatCAGR5ar], ['omsCAGR', p => p.tillvaxt.omsattningCAGR5ar],
    ['ttm', p => p.tillvaxt.omsattningTillvaxtTTM], ['serier', p => p.serier],
  ];
  const skillda = falt.filter(([n, f]) => JSON.stringify(f(V)) !== JSON.stringify(f(Vd))).map(([n]) => n);
  if (skillda.length === 0) O('V02', `VAR-rad identisk vintage↔dagens fil på alla ${falt.length} fält (drift-fri)`);
  else N('V02', `VAR-rad skillda fält vintage↔dagens: ${skillda.join(', ')}`);
}

// VAR:s egna tal ur vintagen
const pe = V.vardering.pe, pb = V.vardering.pb, evEbit = V.vardering.evEbit, peg = V.vardering.peg;
const fcfY = V.vardering.fcfYield, roe = V.lonksamhet.roe, roic = V.lonksamhet.roic;
const brutto = V.lonksamhet.bruttoMarginal, ebitM = V.lonksamhet.ebitMarginal, nettoM = V.lonksamhet.nettoMarginal;
const fcfM = V.lonksamhet.fcfMarginal, skuldEK = V.stabilitet.skuldEgenkapital;
const prog = V.tillvaxt.prognosTillvaxt, resC = V.tillvaxt.resultatCAGR5ar, omsC = V.tillvaxt.omsattningCAGR5ar;
const ttm = V.tillvaxt.omsattningTillvaxtTTM;
const mcapMkr = V.marknadsKapitalMdr * 1000; // 126,011 mdr → 126 011 Mkr
const oms = V.serier.omsattning.map(v => v / 1e6), res = V.serier.resultat.map(v => v / 1e6);
const ar = V.serier.ar.map(Number);

// Utkastets tabellvärden
const tabell = {
  'P/E 10,177': pe === 10.177, 'P/B 57,915': pb === 57.915, 'EV/EBIT 20,373': evEbit === 20.373,
  'PEG null': peg === null, 'FCF-avk 3,94 %': fcfY === 0.0394, 'ROE 93,98 %': roe === 0.9398,
  'ROIC 76,52 %': roic === 0.7652, 'brutto 88,11 %': brutto === 0.8811, 'EBIT 59,41 %': ebitM === 0.5941,
  'netto 13,02 %': nettoM === 0.1302, 'FCF-marg 46,51 %': fcfM === 0.4651, 'skuld/EK 3,0773': skuldEK === 3.0773,
  'prognos −34,05 %': prog === -0.3405, 'resCAGR −5,70 %': resC === -0.057, 'omsCAGR −6,26 %': omsC === -0.0626,
  'TTM +102,7 %': ttm === 1.027, 'kurs 50,48': V.pris === 50.48, 'mcap 126 011 Mkr': mcapMkr === 126011,
};
for (const [k, v] of Object.entries(tabell)) (v ? O : F)(`T:${k}`, v ? 'fältet matchar vintage-raden' : `AVVIKELSE mot ${VINT_HASH}`);

// Serier
const serOK = JSON.stringify(oms) === JSON.stringify([9827.63, 6849.716, 7450.056, 8095.6])
  && JSON.stringify(res.map(v => num(v, 1))) === JSON.stringify([936.4, 610.2, 311.5, 785.2])
  && JSON.stringify(ar) === JSON.stringify([2022, 2023, 2024, 2025]);
serOK ? O('S01', `serien 2022–2025 exakt: oms ${oms.map(v => num(v, 1)).join('/')} res ${res.map(v => num(v, 1)).join('/')} M$`)
  : F('S01', `serien avviker: oms ${oms.join('/')} res ${res.join('/')}`);

// ── Medianer mot vintagen (median(): jämnt → medel av två mittersta) ──
function median(vs) { const v = vs.filter(x => x !== null && x !== undefined && Number.isFinite(x)).sort((a, b) => a - b); if (!v.length) return { m: null, n: 0 }; const m = v.length % 2 ? v[(v.length - 1) / 2] : (v[v.length / 2 - 1] + v[v.length / 2]) / 2; return { m, n: v.length }; }
const energi = vintage.filter(p => p.bransch === 'energi');
// [textvärde energi, textvärde univ, väntatOK?] — null = texten anger ej
const medianKontroll = [
  ['P/E', p => p.vardering?.pe, 16.05, 21.15, 167],
  ['P/B', p => p.vardering?.pb, 2.28, 2.81, 174],
  ['EV/EBIT', p => p.vardering?.evEbit, 13.44, 18.17, null],
  ['FCF-avk', p => p.vardering?.fcfYield, 0.0528, 0.0380, null],
  ['ROE', p => p.lonksamhet?.roe, 0.1291, 0.1534, 173],
  ['ROIC', p => p.lonksamhet?.roic, 0.1163, null, null],
  ['brutto', p => p.lonksamhet?.bruttoMarginal, 0.4013, 0.4775, null],
  ['EBIT', p => p.lonksamhet?.ebitMarginal, 0.1822, 0.2111, 176],
  ['netto', p => p.lonksamhet?.nettoMarginal, 0.0908, 0.1409, 177],
  ['skuld/EK', p => p.stabilitet?.skuldEgenkapital, 0.50, 0.51, 162],
  ['prognos', p => p.tillvaxt?.prognosTillvaxt, null, 0.123, null],
  ['omsCAGR', p => p.tillvaxt?.omsattningCAGR5ar, -0.0844, null, null],
];
for (const [namn, f, te, tu, nuVantat] of medianKontroll) {
  const e = median(energi.map(f)), u = median(vintage.map(f));
  const eOK = te === null || (e.m !== null && pct(e.m, te) < 0.6);
  const uOK = tu === null || (u.m !== null && pct(u.m, tu) < 0.6);
  const nOK = nuVantat === null || u.n === nuVantat;
  const exaktE = te !== null && e.m !== null && pct(e.m, te) < 0.25;
  const exaktU = tu !== null && u.m !== null && pct(u.m, tu) < 0.25;
  if (eOK && uOK && nOK) O(`M:${namn}`, `energi ${e.m} (n=${e.n}) | univ ${u.m} (n=${u.n}) — textens ${te ?? '–'}/${tu ?? '–'}${exaktE && exaktU ? '' : ' (SE NOT: textvärde avviker >0,25 % men <0,6 %)'}`);
  else F(`M:${namn}`, `energi ${e.m} (n=${e.n}) | univ ${u.m} (n=${u.n}) mot textens ${te ?? '–'}/${tu ?? '–'}${nOK ? '' : `; univ-n ${u.n} ≠ deklarerat ${nuVantat}`}`);
}
// energi-P/E utan VAR (för rot-analys av textens 16,05)
const peLista = energi.map(p => ({ t: p.ticker, v: p.vardering?.pe })).filter(x => Number.isFinite(x.v));
const peSort = [...peLista.filter(x => x.t !== 'VAR.OL')].sort((a, b) => a.v - b.v);
const medUtanVAR = median(peSort.map(x => x.v));
N('M:pe-rot', `energi-P/E med VAR: ${median(peLista.map(x => x.v)).m} (n=${peLista.length}); UTAN VAR: ${medUtanVAR.m} (n=${peSort.length}); textens 16,05 — rot: 174-vintagen ${median(JSON.parse(execSync('git show 7b122639:data/portfolj-system/bolagsunivers.json', { cwd: ROT, maxBuffer: 64e6 }).toString()).filter(p => p.bransch === 'energi').map(p => p.vardering?.pe)).m}`);

// ── Rang-påståenden mot vintagen ──
function rang(f, desc = true) {
  const lista = energi.map(p => ({ t: p.ticker, v: f(p) })).filter(x => Number.isFinite(x.v)).sort((a, b) => desc ? b.v - a.v : a.v - b.v);
  const pos = lista.findIndex(x => x.t === 'VAR.OL') + 1;
  return { pos, n: lista.length, topp: lista.slice(0, 3).map(x => `${x.t}:${num(x.v, 3)}`).join(' '), botten: lista.slice(-3).map(x => `${x.t}:${num(x.v, 3)}`).join(' ') };
}
let r1 = rang(p => p.vardering?.pe, false);
(r1.pos === 2) ? O('R:pe-nast-lagsta', `P/E ${pe} = näst lägsta av ${r1.n} stigande (lägsta tre: ${r1.botten})`) : F('R:pe-nast-lagsta', `P/E position ${r1.pos} av ${r1.n} stigande — inte näst lägsta (botten: ${r1.botten})`);
let r2 = rang(p => p.vardering?.pb);
(r2.pos === 1) ? O('R:pb-hogsta', `P/B ${pb} = grenens högsta (topp: ${r2.topp})`) : F('R:pb-hogsta', `P/B position ${r2.pos} — inte högsta (topp: ${r2.topp})`);
let r3 = rang(p => p.lonksamhet?.bruttoMarginal);
(r3.pos === 2) ? O('R:brutto-nast-hogsta', `brutto ${num(brutto * 100, 2)} % = näst högsta (topp: ${r3.topp})`) : F('R:brutto-nast-hogsta', `brutto position ${r3.pos} (topp: ${r3.topp})`);
let r4 = rang(p => p.lonksamhet?.ebitMarginal);
(r4.pos === 2) ? O('R:ebit-nast-hogsta', `EBIT ${num(ebitM * 100, 2)} % = näst högsta (topp: ${r4.topp})`) : F('R:ebit-nast-hogsta', `EBIT position ${r4.pos} (topp: ${r4.topp})`);
let r5 = rang(p => p.lonksamhet?.roe);
(r5.pos === 1) ? O('R:roe-hogsta', `ROE ${num(roe * 100, 2)} % = grenens högsta (topp: ${r5.topp})`) : F('R:roe-hogsta', `ROE position ${r5.pos} (topp: ${r5.topp})`);
let r6 = rang(p => p.stabilitet?.skuldEgenkapital);
(r6.pos === 1) ? O('R:skuld-hogsta', `skuld/EK ${skuldEK} = grenens högsta (topp: ${r6.topp})`) : F('R:skuld-hogsta', `skuld/EK position ${r6.pos} (topp: ${r6.topp})`);
let r7 = rang(p => p.tillvaxt?.prognosTillvaxt, false);
(r7.pos === 1 && r7.n === 18) ? O('R:prognos-mest-neg', `prognos ${num(prog * 100, 2)} % = grenens mest negativa av ${r7.n} (botten: ${r7.botten})`) : F('R:prognos-mest-neg', `prognos position ${r7.pos} av ${r7.n} (botten: ${r7.botten})`);
const roicKvot = roic / 0.1163;
(roicKvot > 6.5 && roicKvot < 6.7) ? O('R:roic-65x', `ROIC ${num(roic * 100, 2)} % = ${num(roicKvot, 2)}× medianen 11,63 %`) : F('R:roic-65x', `ROIC-kvot ${num(roicKvot, 2)}≠6,5×`);

// ── Aritmetik: textens egna beräkningar ──
const A = (id, expect, got, tolPct = 0.5) => { const d = pct(got, expect); (d <= tolPct ? O : F)(id, `räknat ${num(got, 4)} mot textens ${num(expect, 4)} (${num(d, 2)} %)`); };
// Identitetstestet
A('A:identitet', 61.63, pb / roe);
A('A:identitet-kvot', 6.06, (pb / roe) / pe, 0.5);
A('A:identitet-diff%', 505, pct(pb / roe, pe), 2);
A('A:identitet-omv', 9.56, pe * roe);
A('A:eps', 4.96, V.pris / pe);
// Valutatestet
A('A:bvps', 0.8716, V.pris / pb, 0.05);
A('A:valuta-underlag', 0.819, roe * (V.pris / pb), 0.3);
A('A:valuta-kvot', 6.055, (V.pris / pe) / (roe * (V.pris / pb)), 0.3);
// DuPont
A('A:omsek', 3.72, oms[3] / 2176.3, 0.3);
A('A:dupont1', 48.4, (nettoM * (oms[3] / 2176.3)) * 100, 0.5);
A('A:dupont2', 197.5, (nettoM * (oms[3] / 2176.3)) * (1 + skuldEK) * 100, 0.5);
A('A:dupont-faktor', 2.10, ((nettoM * (oms[3] / 2176.3)) * (1 + skuldEK)) / roe, 1);
// EV-kedjan (jämförelse i mdr: textens 2,176/6,697/8,873 = mdr)
const ekMdr = mcapMkr / pb, skuldMdr = ekMdr * skuldEK, evMdr = ekMdr + skuldMdr, ebit25 = ebitM * oms[3];
A('A:ek', 2.176, ekMdr / 1000, 0.05);
A('A:skuld', 6.697, skuldMdr / 1000, 0.05);
A('A:ev', 8.873, evMdr / 1000, 0.05);
A('A:ebit2025', 4810, ebit25, 0.05);
A('A:ev-ebit-kedja', 1.85, evMdr / ebit25, 0.3);
A('A:ev-kvot', 0.091, (evMdr / ebit25) / evEbit, 1);
A('A:ev-falt', 98.0, evEbit * (ebit25 / 1000), 0.05);
A('A:nettokassa', 28, 126.011 - evEbit * (ebit25 / 1000), 1);
A('A:nettoskuld', 4.5, (skuldMdr - ekMdr) / 1000, 1);
// FCF-paret
A('A:fcf', 3766, fcfM * oms[3], 0.05);
A('A:fcf-yield', 2.99, (fcfM * oms[3] / mcapMkr) * 100, 0.5);
A('A:fcf-kvot', 0.76, ((fcfM * oms[3] / mcapMkr) * 100) / (fcfY * 100), 1);
// CAGR + steg + marginalserie
A('A:cagr-oms', -6.26, ((oms[3] / oms[0]) ** (1 / 3) - 1) * 100, 0.3);
A('A:cagr-res', -5.70, ((res[3] / res[0]) ** (1 / 3) - 1) * 100, 0.3);
const omsteg = [-30.30, 8.76, 8.66], ressteg = [-34.83, -48.95, 152.06];
for (let i = 0; i < 3; i++) {
  A(`A:omsteg-${ar[i + 1]}`, omsteg[i], (oms[i + 1] / oms[i] - 1) * 100, 0.3);
  A(`A:ressteg-${ar[i + 1]}`, ressteg[i], (res[i + 1] / res[i] - 1) * 100, 0.3);
}
const nmarg = [9.53, 8.91, 4.18, 9.70];
for (let i = 0; i < 4; i++) A(`A:nmarg-${ar[i]}`, nmarg[i], (res[i] / oms[i]) * 100, 0.3);
// Klipp + skatt
A('A:klipp1', 28.7, (brutto - ebitM) * 100, 0.5);
A('A:klipp2', 46.39, (ebitM - nettoM) * 100, 0.2);
A('A:klipp2-andel', 78.1, ((ebitM - nettoM) / ebitM) * 100, 0.3);
A('A:skatt', 78, 22 + 56, 0.01);
// Scenarioruta: rader = intäkter, kolumner = marginaler
const marg = [0.5841, 0.5941, 0.6041];
const omr = [oms[3] * 0.97, oms[3], oms[3] * 1.03];
A('A:scen-int-97', 7852.7, omr[0], 0.05);
A('A:scen-int-103', 8338.5, omr[2], 0.05);
const textRuta = [[4587, 4665, 4744], [4729, 4810, 4891], [4870, 4954, 5037]];
let cellOK = 0, transpOK = 0;
for (let i = 0; i < 3; i++) for (let j = 0; j < 3; j++) {
  if (Math.abs(textRuta[i][j] - omr[i] * marg[j]) <= 1) cellOK++;
  if (Math.abs(textRuta[i][j] - omr[j] * marg[i]) <= 1) transpOK++;
}
if (cellOK === 9) O('A:scenario', 'alla 9 celler korrekta och RÄTT PLACERADE (rader=intäkter × kolumner=marginaler)');
else if (transpOK === 9) F('A:scenario', 'scenariorutan TRANSPOSERAD');
else F('A:scenario', `scenarioruta: ${cellOK}/9 korrekta`);
A('A:scen-marg', 81, oms[3] * 0.01, 1);
A('A:scen-volym', 243, oms[3] * 0.03, 1);
A('A:scen-vikt', 0.56, 1 / (3 * ebitM), 1);
A('A:botten', 338, oms[3] * 0.0418, 1);
A('A:botten-kvot', 14, (ebitM * oms[3]) / (oms[3] * 0.0418), 2);
A('A:mult', 15.43, pe / 0.6595, 0.3);
A('A:peg-konv', 0.30, pe / 34.05, 0.5);
A('A:aktier', 2496, mcapMkr / V.pris, 0.3);
A('A:roic-kedja', 54.2, (ebit25 / (skuldMdr + ekMdr)) * 100, 0.5);
A('A:roic-kvot', 0.71, ((ebit25 / (skuldMdr + ekMdr))) / roic, 1);
// Härledda procent/kvot-påståenden i löptexten (heltalsavrundade → tolerans 5 %)
const P = (id, expect, got, tol = 5) => A(id, expect, got, tol);
P('P:pe-under-gren', 37, (1 - pe / 16.05) * 100, 1.5);
P('P:pe-under-univ', 52, (1 - pe / 21.153) * 100, 1);
P('P:pb-over-gren', 25, pb / 2.275, 2);
P('P:pb-over-univ', 21, pb / 2.8065, 2);
P('P:evebit-over-gren', 52, (evEbit / 13.44 - 1) * 100, 1);
P('P:evebit-over-univ', 12, (evEbit / 18.22 - 1) * 100, 2);
P('P:brutto-over-gren', 120, (brutto / 0.4013 - 1) * 100, 1);
P('P:brutto-over-univ', 85, (brutto / 0.4775 - 1) * 100, 1);
P('P:ebit-over-gren', 226, (ebitM / 0.1822 - 1) * 100, 1);
P('P:ebit-over-univ', 182, (ebitM / 0.21165 - 1) * 100, 1);
P('P:netto-over-gren', 43, (nettoM / 0.0908 - 1) * 100, 1);
P('P:netto-under-univ', 8, (1 - nettoM / 0.1409) * 100, 6);
P('P:roe-7x', 7, roe / 0.1291);
P('P:roe-6x', 6, roe / 0.1534);
P('P:skuld-6x', 6, skuldEK / 0.5037);
P('P:fcfm-36x', 3.6, fcfM / nettoM, 1);

// ── Struktur ──
const ord = BODY.split(/\s+/).filter(Boolean).length;
const h2 = (BODY.match(/^## /gm) || []).length;
const titelLangd = [...UTKAST.title].length;
const descLangd = [...UTKAST.description].length;
const rmKonv = Math.round(ord / 600);
rmKonv === UTKAST.readingMinutes ? O('ST:rm', `${ord} ord → round(${ord}/600) = ${rmKonv} = readingMinutes ${UTKAST.readingMinutes}`) : F('ST:rm', `${ord} ord → konventionen round(/600) = ${rmKonv} men filen säger ${UTKAST.readingMinutes}`);
h2 === 7 ? O('ST:h2', '7 H2-sektioner (familjestilen)') : N('ST:h2', `${h2} H2-sektioner`);
titelLangd <= 314 ? O('ST:titel', `${titelLangd} tkn ≤ taket 314`) : F('ST:titel', `${titelLangd} tkn > taket 314 (getinge/fabege-precedensen)`);
UTKAST.publishedAt === '2026-10-21' ? O('ST:pub', 'publishedAt 2026-10-21 = rappdagen') : F('ST:pub', 'publishedAt ≠ rappdag');
UTKAST.tags.length === 7 ? O('ST:tags', '7 tags') : N('ST:tags', `${UTKAST.tags.length} tags`);
/disclaimer|utbildning/i.test(BODY.slice(-900)) && /2007:528/.test(BODY.slice(-900)) ? O('ST:disclaimer', 'disclaimer med 2007:528 sist i bodyn') : F('ST:disclaimer', 'disclaimer saknas/slutet');
N('ST:desc', `description ${descLangd} tkn (kvartalspaketens convention — syskonjämförelse i KONTROLL)`);

// ── Juridik 2007:528 ──
const vm = JSON.parse(fs.readFileSync(`${ROT}/data/varumarke.json`, 'utf8'));
let vmTraff = 0;
for (const frasa of vm.forbjudnaFraser) {
  const re = new RegExp(frasa.fran, 'i');
  if (re.test(BODY) || re.test(UTKAST.title) || re.test(UTKAST.description)) { vmTraff++; F('J:vm', `förbjuden fras "${frasa.fran}" (${frasa.motiv})`); }
}
vmTraff === 0 && O('J:vm', `varumärkesgrinden: 0 träffar av ${vm.forbjudnaFraser.length} förbjudna fraser på title+description+body`);
const rådsTräff = [];
const rekoHits = (BODY + ' ' + UTKAST.title + ' ' + UTKAST.description).match(/.{60}rekommend.{60}/gis) || [];
for (const h of rekoHits) rådsTräff.push(h.replace(/\n/g, ' '));
const negerad = rådsTräff.every(t => /inga|inte|aldrig|utan|fri från/i.test(t));
if (rådsTräff.length === 0) O('J:rad', '0 förekomster av rekommend-form');
else (negerad ? O : F)('J:rad', `${rådsTräff.length} rekommend-förekomster, ${negerad ? 'alla negerade' : 'ICKE negerade'}: "${rådsTräff[0].slice(0, 90)}…"`);
const familjer = ['2007:528', '2022:260', '2022:261', '1985:716', '2005:59', '2022:482'].filter(L => new RegExp(L.replace(':', '\\s*:?\\s*')).test(BODY));
familjer.join(',') === '2007:528' ? O('J:lagrum', 'exakt en lagrumsfamilj: 2007:528') : F('J:lagrum', `lagrumsfamiljer: ${familjer.join(',') || 'INGA'}`);
(/utbildning/i.test(BODY) && /inte investeringsrådgivning/i.test(BODY)) ? O('J:utbildning', 'utbildningsgrunden bärande') : F('J:utbildning', 'utbildningsformen ej deklarerad');
// köp/sälj-former
const kopHits = (BODY).match(/.{50}\b(köp|köpa|sälj|sälja)\b.{50}/gis) || [];
const kopOK = kopHits.every(t => /inte|aldrig|ingen|inga|utbildning|övning|exempel/i.test(t));
kopHits.length === 0 ? O('J:kop-salj', '0 förekomster av köp/sälj-form') : (kopOK ? O('J:kop-salj', `${kopHits.length} köp/sälj-förekomster, alla pedagogiskt inramade`) : F('J:kop-salj', `icke inramad köp/sälj: "${kopHits.find(t => !/inte|aldrig|ingen|inga|utbildning|övning|exempel/i.test(t)).slice(0, 100)}"`));

// ── 911 ──
const rå911 = (BODY + UTKAST.title + UTKAST.description).match(/.{40}911.{40}/g) || [];
const text911 = rå911.filter(t => !/https?:\/\/\S*911/i.test(t));
text911.length === 0 ? O('911', `0 textträffar (${rå911.length} råträff(ar), URL-klass filtrerad)`) : F('911', `${text911.length} textträff(ar): "${text911[0]}"`);

// ── Interna länkar (localhost) + externa (fetch) ──
const paths = [...new Set((BODY.match(/\]\((\/[^)\s]+)\)/g) || []).map(m => m.slice(2, -1).split(' ')[0]))];
const länkResultat = await Promise.all(paths.map(p => new Promise(resolve => {
  const req = http.get({ host: '127.0.0.1', port: 3000, path: p, timeout: 8000 }, r => { r.resume(); resolve([p, r.statusCode]); });
  req.on('timeout', () => { req.destroy(); resolve([p, 'TIMEOUT']); });
  req.on('error', e => resolve([p, String(e.code || e.message)]));
})));
for (const [p, s] of länkResultat) { if (s === 200) O('L:' + p, '200'); else F('L:' + p, String(s)); }
const extUrls = [...new Set((BODY.match(/\]\((https?:\/\/[^)\s]+)\)/g) || []).map(m => m.slice(2, -1).split(' ')[0]))];
for (const u of extUrls) {
  try {
    const ctrl = new AbortController(); const t = setTimeout(() => ctrl.abort(), 10000);
    const r = await fetch(u, { signal: ctrl.signal, redirect: 'follow', headers: { 'user-agent': 'Mozilla/5.0 (compatible; AK1A-granskare/1.0)' } });
    clearTimeout(t);
    (r.status >= 200 && r.status < 400) ? O('L:' + u.slice(0, 60), String(r.status)) : N('L:' + u.slice(0, 60), `${r.status} (bot-skydd/värd svar — döms i KONTROLL)`);
  } catch (e) { N('L:' + u.slice(0, 60), `fel ${String(e).slice(0, 60)}`); }
}

// ── Kalender ──
const kal = JSON.parse(fs.readFileSync(`${ROT}/data/blogg-utkast/kvartal/2026-q3/kalender-energi.json`, 'utf8'));
const kvar = (kal.bolag || []).find(b => b.ticker === 'VAR.OL');
(kvar && /2026-10-21 kl 07:00 norsk tid/.test(kvar.rapportfenster) && /2026-10-12/.test(kvar.notera) && /2026-09-15/.test(JSON.stringify(kvar.kallor)))
  ? O('KAL', 'kalender-energi.json: 21/10 kl 07:00 + trading update 12/10 + hämtdatum 09-15 — alla kalenderpåståenden belagda')
  : F('KAL', 'kalendern avviker: ' + JSON.stringify(kvar).slice(0, 200));
(kal.bolag || []).length === 10 ? O('KAL:gren', 'energikalendern bär 10 bolag ("ett paketerat bolag av tio i kalendern")') : N('KAL:gren', `energikalendern ${(kal.bolag || []).length} bolag mot textens "tio"`);
// dagen delas med Handelsbanken/Iberdrola/SKF/Telia
const lasK = f => { try { return JSON.parse(fs.readFileSync(`${ROT}/data/blogg-utkast/kvartal/2026-q3/${f}`, 'utf8')); } catch { return null; } };
const delar = [
  ['Handelsbanken', 'kalender-finans.json', 'SHB'],
  ['Iberdrola', 'kalender-energi.json', 'IBE'],
  ['SKF', 'kalender-industri.json', 'SKF'],
  ['Telia', 'kalender-kommunikation.json', 'TELIA'],
];
let dagOK = 0;
for (const [namn, fil, tick] of delar) {
  const k = lasK(fil);
  const post = k && (k.bolag || []).find(b => new RegExp(tick, 'i').test(b.ticker || ''));
  if (post && /2026-10-21/.test(post.rapportfenster)) { dagOK++; O(`KAL:delar-${namn}`, `21/10 belagt (${post.rapportfenster.slice(0, 40)})`); }
  else N(`KAL:delar-${namn}`, `kalenderpost saknar 21/10: ${post ? post.rapportfenster : 'post/fil saknas'}`);
}
// paketen på disk för de fyra + var-energi = "femton/arton-påståendena" NOT-klass

// ── Gallringspåståenden mot vintagen ──
const kin = vintage.find(p => /KINV/i.test(p.ticker || ''));
if (kin) {
  const kinOms = (kin.serier?.omsattning || []).map(v => v / 1e6);
  const nollar = kinOms.filter(v => v === 0).length;
  const narNoll = kinOms.filter(v => v > 0 && v < 50).length;
  const negBas = (kin.serier?.resultat || [])[0] / 1e6 < 0;
  O('GA:kinnevik-serie', `Kinnevik-serien ${kinOms.join('/')} Mkr + negativt basår ${negBas ? '✓' : '✗'} — gallransunderlaget`)
  ;(nollar === 3 || (nollar === 2 && narNoll === 1)) ? O('GA:kinnevik-nollor', `textens "nollor tre av fyra år": ${nollar} exakta nollor + ${narNoll} nära noll (<50 Mkr) — läsbar som tre`) : F('GA:kinnevik-nollor', `textens "nollor tre av fyra år": faktiska nollor ${nollar} av 4, nära noll ${narNoll} — serie ${kinOms.join('/')}`);
} else N('GA:kinnevik', 'Kinnevik saknas i vintagen');
// Yara "behöll 68 procent av EBIT" + VAR "behålls 22" — beräkning ur vintagen
const yaraP = vintage.find(p => /YAR/i.test(p.ticker));
if (yaraP) {
  const behallYara = yaraP.lonksamhet.nettoMarginal / yaraP.lonksamhet.ebitMarginal * 100;
  const behallVar = nettoM / ebitM * 100;
  (Math.round(behallYara) === 68) ? O('X:yara-68', `Yara behöll ${num(behallYara, 1)} % av EBIT → "68 procent" ✓ (beräkning, ej korsref)`) : F('X:yara-68', `Yara ${num(behallYara, 1)} % ≠ 68`);
  (Math.round(behallVar) === 22) ? O('X:var-22', `VAR behåller ${num(behallVar, 1)} % → "här behålls 22" ✓`) : F('X:var-22', `VAR ${num(behallVar, 1)} % ≠ 22`);
}
// Holmen 4,60 ur kvartalsrapportseriens Holmen-granskning
const holmenG = (() => { try { return fs.readFileSync(`${ROT}/data/blogg-utkast/granskning/kvartal-2026-q3-holmen.md`, 'utf8'); } catch { return null; } })();
holmenG && holmenG.includes('4,60') ? O('X:holmen-460', 'Holmen 4,60 belagt i granskning/kvartal-2026-q3-holmen.md') : N('X:holmen-460', 'Holmen 4,60 ej belagt');

// ── Korsreferenser till syskonpaket ──
const las = f => { try { return fs.readFileSync(`${ROT}/data/blogg-utkast/kvartal/2026-q3/${f}`, 'utf8'); } catch { return null; } };
const kors = [
  ['yara', 'sa-laser-du-yara-q3-2026.json', ['0,12', '2,47', '2,53', 'NOK hela vägen']],
  ['iberdrola', 'sa-laser-du-iberdrola-q3-2026.json', ['1,36', 'Vår Energi', 'nästa']],
  ['np3', 'sa-laser-du-np3-q3-2026.json', ['14 procent']],
  ['nokia', 'sa-laser-du-nokia-q3-2026.json', ['8 %', '4,20']],
  ['nordea', 'sa-laser-du-nordea-q3-2026.json', ['21,5', '2,0', '10,8']],
  ['telia', 'sa-laser-du-telia-q3-2026.json', ['1,89']],
  ['tele2', 'sa-laser-du-tele2-q3-2026.json', ['1,37']],
  ['hydro', 'sa-laser-du-norsk-hydro-q3-2026.json', ['1,20']],
  ['sca', 'sa-laser-du-sca-q3-2026.json', ['8,55']],
  ['boliden', 'sa-laser-du-boliden-q3-2026.json', ['2,69']],
  ['volvo-group-trappa', 'sa-laser-du-volvo-group-q3-2026.json', ['3,2', 'Alfa Laval 2,1 ≈ ABB 2,0', 'Sandvik/Atlas Copco 1,6–1,7', '0,5–0,6']],
  ['atlas', 'sa-laser-du-atlas-copco-q3-2026.json', ['1,7']],
  ['nike', 'sa-laser-du-nike-q3-2026.json', ['2,6']],
  ['essity', 'sa-laser-du-essity-q3-2026.json', ['2,6']],
  ['wallenstam', 'sa-laser-du-wallenstam-q3-2026.json', ['0,5']],
];
for (const [namn, fil, tal] of kors) {
  const t = las(fil);
  if (!t) { N(`X:${namn}`, 'syskonfil saknas på disk'); continue; }
  const saknas = tal.filter(x => !t.includes(x));
  saknas.length === 0 ? O(`X:${namn}`, `${tal.length} korsreferenstal belagda`) : N(`X:${namn}`, `ej funna i syskonfilen: ${saknas.join(', ')} (döms manuellt)`);
}
// "seriens största identitetsbrott" — NP3 14 % + Nokia 8 % som jämförelse
const np3t = las('sa-laser-du-np3-q3-2026.json');
if (np3t) {
  const m14 = np3t.match(/.{80}14 ?(procent|%).{40}/i);
  m14 ? N('X:np3-14', `NP3-brotteckning: "…${m14[0].replace(/\n/g, ' ').slice(0, 120)}…"`) : N('X:np3-14', 'NP3 14 %-träff ej maskinellt belagd');
}

// ── Sammanfattning ──
console.log(rader.join('\n'));
console.log(`\n=== SOND s1-u2 VÅR ENERGI Q3: ${ok} OK · ${fel} FEL · ${not} NOT ===`);
process.exit(fel > 0 ? 1 : 0);
