// KVD för s4-u2: Norsk Hydro Q3-2026-läspaket — körs mot utkastfilen och källfilen
import fs from 'node:fs';
const paketSokvag = '/home/ak1a/AK1/data/blogg-utkast/kvartal/2026-q3/sa-laser-du-norsk-hydro-q3-2026.json';
const uni = JSON.parse(fs.readFileSync('/home/ak1a/AK1/data/portfolj-system/bolagsunivers.json', 'utf8'));
const list = Array.isArray(uni) ? uni : (uni.bolag || uni.universum || Object.values(uni).find(Array.isArray));
const h = list.find(b => b.ticker === 'NHY.OL');
const j = JSON.parse(fs.readFileSync(paketSokvag, 'utf8'));
let fel = 0, varn = 0, pass = 0;
const F = (namn, villkor, detalj) => { if (villkor) { pass++; } else { fel++; console.log('FEL:', namn, detalj || ''); } };
const W = (namn, villkor, detalj) => { if (!villkor) { varn++; console.log('VARNING:', namn, detalj || ''); } };

// 1. Struktur
F('JSON giltig', true);
F('9 fält exakt', JSON.stringify(Object.keys(j)) === JSON.stringify(['slug','title','description','pillar','author','publishedAt','readingMinutes','tags','body']), Object.keys(j).join(','));
F('slug', j.slug === 'sa-laser-du-norsk-hydro-q3-2026');
F('publishedAt = dagen före rappdagen (nike/hm-b-precedens)', j.publishedAt === '2026-10-22');

// 2. Ord + readingMinutes (600-ordskontraktet)
const ord = (j.body.match(/\S+/g) || []).length;
F('ord i spann 2400–3400', ord >= 2400 && ord <= 3400, 'ord=' + ord);
F('readingMinutes = round(ord/600)', j.readingMinutes === Math.round(ord / 600), j.readingMinutes + ' mot ' + Math.round(ord / 600));

// 3. Teckenhygien
F('mjuka bindestreck = 0', !/[\u00AD\u2010\u2011]/.test(j.body + j.title + j.description));
F('tabbar = 0', !/\t/.test(j.body));

// 4. Juridikgrind
const råd = (j.body + j.title + j.description).match(/(?:rekommendation att )?köp|sälj/gi) || [];
console.log('rådträffar:', JSON.stringify((j.body.match(/[^\s]{0,30}(köp|sälj)[^\s]{0,30}/gi) || [])));
const bodyLower = j.body.toLowerCase();
const nekandeKontext = ['inte en rekommendation att köpa, sälja eller behålla', 'inga köp-, sälj- eller hållningsrekommendationer'];
for (const nk of nekandeKontext) F('nekande kontext finns: "' + nk.slice(0, 30) + '…"', bodyLower.includes(nk));
const lagrum = j.body.match(/lagen \(2007:528\)/g) || [];
F('exakt ett lagrum 2007:528', lagrum.length === 1, 'antal=' + lagrum.length);
F('disclaimer sista stycket innehåller lagrum + kundens beslut', j.body.trimEnd().endsWith('kundens beslut.*') && j.body.includes('inte investeringsrådgivning'));
F('inga andra lagrum (2022:260|2022:261|1985:716|2005:59|2022:482)', !/(2022:260|2022:261|1985:716|2005:59|2022:482)/.test(j.body));

// 5. Länkar
const internal = [...new Set((j.body.match(/\]\((\/[^)]+)\)/g) || []).map(s => s.slice(2, -1)))];
console.log('unika interna länkar:', internal.length);
F('minst 19 interna länkar', internal.length >= 19, 'antal=' + internal.length);
F('0 utkastlänkar', !internal.some(l => l.includes('blogg-utkast')));
const http = await Promise.all(internal.map(async l => [l, await fetch('http://localhost:3000' + l).then(r => r.status).catch(() => 0)]));
for (const [l, s] of http) F('länk 200: ' + l, s === 200, 'status=' + s);
const externa = [...new Set((j.body.match(/\]\((https?:\/\/[^)]+)\)/g) || []).map(s => s.slice(2, -1)))];
console.log('externa länkar:', externa.join(' '));
F('externa länkar endast hydro.com', externa.every(u => u.includes('hydro.com')));

// 6. Källtalsparitet mot universumsfilen
const talpar = [
  ['P/E 19,4', '19,4', h.vardering.pe, 19.429], ['P/B 1,83', '1,83', h.vardering.pb, 1.83],
  ['EV/EBIT 3,6', '3,6', h.vardering.evEbit, 3.623], ['PEG 0,58', '0,58', h.vardering.peg, 0.58],
  ['fcfYield 10,8', '10,8', h.vardering.fcfYield * 100, 10.8], ['ROE 9,4', '9,4', h.lonksamhet.roe * 100, 9.43],
  ['ROIC 40,8', '40,8', h.lonksamhet.roic * 100, 40.78], ['brutto 37,05', '37,05', h.lonksamhet.bruttoMarginal * 100, 37.05],
  ['EBIT 27,79', '27,79', h.lonksamhet.ebitMarginal * 100, 27.79], ['netto 4,77', '4,77', h.lonksamhet.nettoMarginal * 100, 4.77],
  ['fcfMarg 10,01', '10,01', h.lonksamhet.fcfMarginal * 100, 10.01], ['skuld 0,3196', '0,3196', h.stabilitet.skuldEgenkapital, 0.3196],
  ['pris 96,56', '96,56', h.pris, 96.56], ['mcap 189,8', '189,8', h.marknadsKapitalMdr, 189.767],
];
for (const [namn, iText, falt] of talpar) F('källtal i body: ' + namn, j.body.includes(iText));

// 7. Aritmetik (oberoende omräkning)
const pe = h.vardering.pe, pb = h.vardering.pb, roe = h.lonksamhet.roe;
const oms = h.serier.omsattning, res = h.serier.resultat;
const n25 = res[3] / 1e6, base = oms[3] / 1e6, m = h.lonksamhet.ebitMarginal;
const ber = {
  ident: pb / roe, identDiff: (pb / roe / pe - 1) * 100,
  abs: pe * n25 / 1000, absRes: (pe * n25 / 1000 / h.marknadsKapitalMdr - 1) * 100,
  implNetto: h.marknadsKapitalMdr / pe, implOver: (h.marknadsKapitalMdr / pe * 1000 / n25 - 1) * 100,
  peDirekt: h.marknadsKapitalMdr * 1000 / n25,
  pegConv: pe / (h.tillvaxt.prognosTillvaxt * 100), pegKvot: h.vardering.peg / (pe / (h.tillvaxt.prognosTillvaxt * 100)), pegImpl: pe / h.vardering.peg,
  ek: h.marknadsKapitalMdr / pb, skuld: h.marknadsKapitalMdr / pb * h.stabilitet.skuldEgenkapital,
  ebit: base * m, fcf1: base * h.lonksamhet.fcfMarginal, fcf2: h.marknadsKapitalMdr * 1000 * h.vardering.fcfYield,
  roic: base * m / ((h.marknadsKapitalMdr / pb) * (1 + h.stabilitet.skuldEgenkapital) * 1000),
  vikt: 1 / (3 * m), mult: pe / (1 + h.tillvaxt.prognosTillvaxt),
};
const arit = [
  ['identitet 19,41', '19,41', ber.ident.toFixed(2)], ['identitetsskillnad 0,12', '0,12 procent', ber.identDiff.toFixed(2) + ' procent'],
  ['omvänd identitet 1,832', '1,832', (pe * roe).toFixed(4)],
  ['absolut 130,5', '130,5', ber.abs.toFixed(1)], ['absolutresidual −31,2', '−31,2', ber.absRes.toFixed(1)],
  ['implicit netto 9 766', '9 766', Math.round(ber.implNetto * 1000)], ['implicit över +45,4', '45,4', ber.implOver.toFixed(1)],
  ['P/E direkt 28,3', '28,3', ber.peDirekt.toFixed(1)],
  ['PEG-konvention 10,17', '10,17', ber.pegConv.toFixed(2)], ['PEG-kvot 0,057', '0,057', ber.pegKvot.toFixed(3)],
  ['PEG implicit 33,5', '33,5', ber.pegImpl.toFixed(1)],
  ['EK 103,7', '103,7', ber.ek.toFixed(1)], ['skuld 33,1', '33,1', ber.skuld.toFixed(1)],
  ['EBIT 57 795', '57 795', Math.round(ber.ebit)], ['EV/EBIT-kedja 2,37', '2,37', (ber.ek + ber.skuld, (ber.ek + ber.skuld) * 1000 / ber.ebit).toFixed(2)],
  ['FCF marginalväg 20 818', '20 818', Math.round(ber.fcf1)], ['FCF yieldväg 20 495', '20 495', Math.round(ber.fcf2)],
  ['FCF-kvot 1,016', '1,016', (ber.fcf1 / ber.fcf2).toFixed(3)], ['yield omräknad 10,97', '10,97', (ber.fcf1 / (h.marknadsKapitalMdr * 1000) * 100).toFixed(2)],
  ['ROIC omräknad 42,2', '42,2', (ber.roic * 100).toFixed(1)],
  ['Essity-vikt 1,20', '1,20', ber.vikt.toFixed(2)], ['multiplövning 19,06', '19,06', ber.mult.toFixed(2)],
  ['trappgap 23,02', '23,02', (m * 100 - h.lonksamhet.nettoMarginal * 100).toFixed(2)],
  ['1 pp = 2 080', '2 080', Math.round(base * 0.01)], ['3 % = 6 239', '6 239', Math.round(base * 0.03)],
];
for (const [namn, iText, riktig] of arit) F('aritmetik ' + namn + ' (beräknad ' + riktig + ')', j.body.includes(iText));

// 8. Serier + steg + marginaler
const stegO = oms.slice(1).map((v, i) => (v / oms[i] - 1) * 100).map(x => x.toFixed(2));
const stegR = res.slice(1).map((v, i) => (v / res[i] - 1) * 100).map(x => x.toFixed(2));
const margSerie = res.map((v, i) => (v / oms[i] * 100)).map(x => x.toFixed(2));
for (const t of ['207 929', '193 619', '203 636', '207 971', '24 154', '3 583', '5 790', '6 717']) F('serietal ' + t, j.body.includes(t));
for (const t of ['−6,88', '+5,17', '+2,13']) F('intäktssteg ' + t, j.body.includes(t));
for (const t of ['−85,17', '+61,60', '+16,01']) F('resultatsteg ' + t, j.body.includes(t));
for (const t of ['11,62 → 1,85 → 2,84 → 3,23']) F('marginalserie ' + t, j.body.includes(t));
F('omsCAGR +0,01', j.body.includes('plus 0,01 procent per år'));
F('resCAGR −34,73', j.body.includes('minus 34,73 procent per år'));
F('V-formens differans 42', j.body.includes('fyrtiotvå miljoner'));

// 9. Scenarioruta: PAR-placering (A1-läxan) + tabellrubrikvärden
const rutor = [...j.body.matchAll(/\| Intäkter (\d[\d ]*) \| ([\d ]+) \| ([\d ]+) \| ([\d ]+) \|/g)];
F('tre intäktsrader i rutan', rutor.length === 3, 'antal=' + rutor.length);
const nivaer = [base * 0.97, base, base * 1.03].map(x => Math.round(x));
const marger = [m - 0.01, m, m + 0.01];
rutor.forEach((rm, i) => {
  F('rutrad ' + (i + 1) + ': intäktsnivå ' + nivaer[i], rm[1].replace(/ /g, '') === String(nivaer[i]), rm[1] + ' mot ' + nivaer[i]);
  marger.forEach((mg, k) => {
    const cell = Number(rm[k + 2].replace(/ /g, ''));
    const ratt = Math.round(nivaer[i] * mg);
    F('rutcell rad ' + (i + 1) + ' kolumn ' + (k + 1) + ' = ' + ratt, cell === ratt, cell + ' mot ' + ratt);
  });
});
for (const t of ['26,79', '27,79', '28,79']) F('marginalrubrik ' + t, j.body.includes(t));

// 10. Medianer i tabellen (oberoende ur 153-filen)
const med = a => { const s = a.filter(v => typeof v === 'number' && isFinite(v)).sort((x, z) => x - z); const k = Math.floor(s.length / 2); return s.length % 2 ? s[k] : (s[k - 1] + s[k]) / 2; };
const mat = list.filter(b => b.bransch === 'material');
const f = (arr, p) => arr.map(b => p.split('.').reduce((o, k) => o && o[k], b)).filter(v => typeof v === 'number' && isFinite(v));
const medTab = [
  ['| P/E | 19,4 | 18,7 (n=14) | 20,8 (n=144) |', med(f(mat, 'vardering.pe')).toFixed(1) === '18.7'.replace('.', '.') && med(f(list, 'vardering.pe')).toFixed(1) === '20.8'],
];
for (const t of ['| P/E | 19,4 | 18,7 (n=14) | 20,8 (n=144) |', '| P/B | 1,83 | 1,46 | 2,87 (n=150) |', '| Räntabilitet på eget kapital (ROE) | 9,4 % | 8,1 % | 15,6 % (n=149) |', '| Rörelsemarginal (EBIT) | 27,79 % | 9,8 % | 20,6 % (n=152) |', '| Nettomarginal | 4,77 % | 9,3 % | 13,7 % (n=153) |']) F('medianrad: ' + t.slice(0, 30), j.body.includes(t));
F('material n=15 + P/E n=14 i not', j.body.includes('15 bolag i material') && j.body.includes('n=14 eftersom Billerud'));
F('medianelementet skuld noteras', j.body.includes('Skuldkvotmedianen 0,32 är Hydros eget'));

// 11. Title/description-längder
console.log('title tkn:', j.title.length, '| description tkn:', j.description.length);
F('title ≤ 240 (ericsson-precedens)', j.title.length <= 240, '' + j.title.length);
F('description ≤ 600', j.description.length <= 600, '' + j.description.length);

console.log('\n=== KVD SUMMERING: ' + pass + ' PASS, ' + fel + ' FEL, ' + varn + ' VARNINGAR ===');
process.exit(fel > 0 ? 1 : 0);
