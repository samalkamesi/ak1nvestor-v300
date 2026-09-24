// _s4u1-msft-kvd.mjs — KVD för Microsoft Q3-läspaket 2026 (fabrik auto-s4-1789959329360-s4-u1).
// Oberoende omräkning av paketets samtliga tal mot bolagsunivers.json (LIVE) och talbanken.
// Utgång: "KVD GRÖN/FEL: X PASS, Y FEL, Z VARNING".
import { readFileSync, readdirSync } from 'node:fs';

const P = '/home/ak1a/AK1/data/blogg-utkast/kvartal/2026-q3/sa-laser-du-microsoft-q3-2026.json';
const U = JSON.parse(readFileSync('/home/ak1a/AK1/data/portfolj-system/bolagsunivers.json', 'utf8'));
const list = Array.isArray(U) ? U : (U.bolag || U.universum || U);
const d = list.find(x => x.ticker === 'MSFT');
const TB = JSON.parse(readFileSync('/home/ak1a/AK1/verktyg/_s4u1-msft-tal.json', 'utf8'));
const pk = JSON.parse(readFileSync(P, 'utf8'));
const body = pk.body;

let PASS = 0, FEL = 0, VARN = 0;
const ok = (villkor, namn, detalj = '') => { if (villkor) { PASS++; } else { FEL++; console.log(`  FEL: ${namn} ${detalj}`); } };
const warn = (villkor, namn, detalj = '') => { if (!villkor) { VARN++; console.log(`  VARNING: ${namn} ${detalj}`); } };
const near = (a, b, tol, namn) => ok(Math.abs(a - b) <= tol, namn, `(${a} mot ${b}, tolerans ${tol})`);
const sv = (x) => String(x).replace('.', ',').replace(/\B(?=(\d{3})+(?!\d))/g, (m, o, s) => s.indexOf('.') > -1 && s.indexOf('.') < s.length - 4 ? m : m); // enkel — paketet använder kommaformat i löptext

console.log('— STRUKTUR —');
ok(pk.slug === 'sa-laser-du-microsoft-q3-2026', 'slug');
ok(pk.title.startsWith('Microsofts kvartalsrapport 2026'), 'title-prefix');
ok(pk.description.length > 400 && pk.description.length < 900, 'description-längd', `${pk.description.length} tkn`);
ok(pk.pillar === 'Institutionell metodik', 'pillar');
ok(pk.author === 'AK1A Research Lab', 'author');
ok(pk.publishedAt === '2026-10-28', 'publishedAt');
ok(Array.isArray(pk.tags) && pk.tags.length >= 5, 'tags');
const h2 = body.match(/^## /gm) || [];
ok(h2.length === 7, 'H2-antal = 7', `${h2.length}`);
ok(body.trimEnd().endsWith('*'), 'kursiv disclaimer sista raden');
const ord = body.replace(/\s+/g, ' ').trim().split(' ').length;
ok(ord >= 2200 && ord <= 3500, 'ord 2200–3500', `${ord}`);
ok(pk.readingMinutes === Math.round(ord / 600), 'readingMinutes = round(ord/600)', `${pk.readingMinutes} mot ${Math.round(ord / 600)}`);
const andraRad = body.trimEnd().split('\n').pop();
ok(andraRad.includes('inte investeringsrådgivning') && andraRad.includes('kundens beslut'), 'disclaimer-innehåll');

console.log('— KÄLLTALSPARITET: universumfält (värde i paketet) —');
const fält = [
  ['pris 496,82', d.pris === 496.82],
  ['3 689,16 mdr', d.marknadsKapitalMdr === 3689.16],
  ['P/E 27,693', d.vardering.pe === 27.693],
  ['P/B 8,341', d.vardering.pb === 8.341],
  ['EV/EBIT 24,992', d.vardering.evEbit === 24.992],
  ['PEG 1,63', d.vardering.peg === 1.63],
  ['FCF-yield 0,45 %', body.includes('0,45 procent') && d.vardering.fcfYield === 0.0045],
  ['ROE 34,04', body.includes('34,04') && d.lonksamhet.roe === 0.3404],
  ['ROIC 26,21', body.includes('26,21') && d.lonksamhet.roic === 0.2621],
  ['brutto 67,94', body.includes('67,94') && d.lonksamhet.bruttoMarginal === 0.6794],
  ['EBIT-marginal 45,11', body.includes('45,11') && d.lonksamhet.ebitMarginal === 0.4511],
  ['netto 40,31', body.includes('40,31') && d.lonksamhet.nettoMarginal === 0.4031],
  ['FCF-marginal 4,99', body.includes('4,99') && d.lonksamhet.fcfMarginal === 0.0499],
  ['skuld/EK 0,2912', body.includes('0,2912') && d.stabilitet.skuldEgenkapital === 0.2912],
  ['oms-CAGR 16,12', body.includes('16,12') && d.tillvaxt.omsattningCAGR5ar === 0.1612],
  ['res-CAGR 22,72', body.includes('22,72') && d.tillvaxt.resultatCAGR5ar === 0.2272],
  ['TTM 17,7', body.includes('17,7 procent') && d.tillvaxt.omsattningTillvaxtTTM === 0.177],
  ['prognos 19,34', body.includes('19,34') && d.tillvaxt.prognosTillvaxt === 0.1934],
  ['insider 6', body.includes(': 6 i källfältet') && d.aterkop.insiderkopSenaste6man === 6],
  ['serie 211,9', body.includes('211,9') && d.serier.omsattning[0] === 211915000000],
  ['serie 331,8', body.includes('331,8') && d.serier.omsattning[3] === 331839000000],
  ['serie 72,4', body.includes('72,4') && d.serier.resultat[0] === 72361000000],
  ['serie 133,7', body.includes('133,7') && d.serier.resultat[3] === 133749000000],
  ['serie 245,1', body.includes('245,1') && d.serier.omsattning[1] === 245122000000],
  ['serie 281,7', body.includes('281,7') && d.serier.omsattning[2] === 281724000000],
  ['serie 88,1', body.includes('88,1') && d.serier.resultat[1] === 88136000000],
  ['serie 101,8', body.includes('101,8') && d.serier.resultat[2] === 101832000000],
  ['hämtdatum 2026-09-03', body.includes('2026-09-03')],
  ['slutkurs 2026-09-02', body.includes('2026-09-02')],
];
for (const [namn, v] of fält) ok(v, `fält ${namn}`);

console.log('— KÄLLTALSPARITET: sökverifierade tal —');
const sökta = [
  ['90,01', 90.01], ['77,7', 77.7], ['38,0', 38.0], ['27,7', 27.7], ['3,72', 3.72],
  ['10,7 miljarder', 10.7], ['4,72', 4.72], ['0,98', 0.98], ['0,91', 0.91], ['0,83', 0.83],
  ['41 miljarder', 41], ['175 miljarder', 175], ['100 miljarder', 100], ['43 procent', 43], ['30 miljoner', 30],
  ['450 miljarder', 450], ['76,4', 76.4], ['2025-10-29', null], ['2026-10-28', null], ['2026-10-27', null],
  ['39 procent', 39], ['496,82', null],
];
for (const [txt] of sökta) ok(body.includes(txt), `sökbelagt tal ${txt} förekommer`);
const tbIds = TB.sokVerifierade.map(t => t.varde);
ok(tbIds.includes(0.98) && tbIds.includes(4.72) && tbIds.includes(90.01), 'talbanken bär nyckeltalen');

console.log('— ARITMETIK (oberoende omräkning) —');
const a = {};
a.aktier = d.marknadsKapitalMdr / d.pris;                       near(a.aktier, 7.43, 0.01, 'aktier 7,43 mdr');
a.ek = d.marknadsKapitalMdr / d.vardering.pb;                   near(a.ek, 442.3, 0.15, 'EK 442,3');
a.bvps = a.ek / a.aktier;                                       near(a.bvps, 59.56, 0.01, 'BVPS 59,56');
near(d.pris / a.bvps, 8.3410, 0.0005, 'P/B-kontroll 8,3410');
a.id = d.vardering.pb / d.lonksamhet.roe;                       near(a.id, 24.50, 0.01, 'identitet 24,50');
near((a.id / d.vardering.pe - 1) * 100, -11.5, 0.15, 'identitetsgap −11,5 %');
a.roeB = 133.749 / a.ek * 100;                                  near(a.roeB, 30.24, 0.05, 'ROE bokslut 30,24');
a.nettoTTM = d.marknadsKapitalMdr / d.vardering.pe;             near(a.nettoTTM, 133.22, 0.01, 'netto-TTM 133,22');
near((a.nettoTTM / 133.749 - 1) * 100, -0.40, 0.02, 'absolutkontroll −0,40 %');
near(a.nettoTTM / a.aktier, 17.94, 0.005, 'EPS TTM 17,94');
near(133.749 / a.aktier, 18.01, 0.005, 'EPS FY26 18,01');
a.kvot = d.lonksamhet.ebitMarginal / d.lonksamhet.nettoMarginal; near(a.kvot, 1.119, 0.001, 'EBIT/netto 1,119');
a.evM = (d.vardering.evEbit / d.vardering.pe) * a.kvot;         near(a.evM, 1.0099, 0.0005, 'EV/mcap 1,0099');
near(d.marknadsKapitalMdr * a.evM, 3726, 1.5, 'EV 3 726');
near(d.marknadsKapitalMdr * a.evM - d.marknadsKapitalMdr, 36.6, 0.2, 'nettoskuld 36,6');
a.skuld = 0.2912 * a.ek;                                        near(a.skuld, 128.8, 0.15, 'skuld 128,8');
near(a.skuld - 36.6, 92.2, 0.3, 'kassa 92,2');
near(1 / d.vardering.evEbit * 100, 4.00, 0.005, 'EV-avkastning 4,00 %');
near(1 / d.vardering.pe * 100, 3.61, 0.005, 'netto-avkastning 3,61 %');
a.vpk = d.lonksamhet.nettoMarginal / d.lonksamhet.fcfMarginal;  near(a.vpk, 8.08, 0.01, 'netto/FCF 8,08');
a.fcf = 0.0499 * 331.839;                                       near(a.fcf, 16.6, 0.05, 'FCF 16,6');
near(133.749 - a.fcf, 117.2, 0.15, 'gap 117,2');
a.cffo = a.fcf + 164;                                           near(a.cffo, 181, 0.5, 'CFFO 181 (heltal, ±0,5 enligt Shell-precedensen)');
near(164 / a.cffo * 100, 90.8, 0.1, 'capex/CFFO 90,8 %');
// marginalexpansion
const mar = [72361 / 211915, 88136 / 245122, 101832 / 281724, 133749 / 331839].map(x => x * 100);
near(mar[0], 34.15, 0.01, 'marginal FY23 34,15'); near(mar[1], 35.96, 0.01, 'marginal FY24 35,96');
near(mar[2], 36.15, 0.01, 'marginal FY25 36,15'); near(mar[3], 40.31, 0.01, 'marginal FY26 40,31');
const steg = [88136 / 72361 - 1, 101832 / 88136 - 1, 133749 / 101832 - 1].map(x => x * 100);
near(steg[0], 21.8, 0.05, 'steg +21,8'); near(steg[1], 15.5, 0.05, 'steg +15,5'); near(steg[2], 31.3, 0.05, 'steg +31,3');
// Q1-ekvationen
near(4.72 * a.aktier, 35.0, 0.1, 'konsensusnetto 35,0');
near((4.72 / 3.72 - 1) * 100, 26.9, 0.05, 'EPS-tillväxt 26,9 %');
near(77.7 * 1.18, 91.7, 0.05, 'bana18 oms 91,7');
near(4.72 * a.aktier / (77.7 * 1.18) * 100, 38.2, 0.15, 'bana18 marginal 38,2');
near(77.7 * 1.15, 89.4, 0.05, 'bana15 oms 89,4');
near(4.72 * a.aktier / (77.7 * 1.15) * 100, 39.2, 0.15, 'bana15 marginal 39,2');
near(77.7 * 1.18 * (27.7 / 77.7), 32.7, 0.05, 'bana-basmarginal vinst 32,7');
near(77.7 * 1.18 * (27.7 / 77.7) / a.aktier, 4.40, 0.005, 'EPS 4,40');
near(27.7 / 77.7 * 100, 35.65, 0.01, 'basmarginal 35,65');
// capex-övningen
near(a.cffo - 100, 81, 0.5, 'FCF vid capex 100 → 81 (heltal, ±0,5)');
near((a.cffo - 100) / 331.839 * 100, 24, 0.5, 'FCF-marginal ~24 %');
near((a.cffo - 100) / d.marknadsKapitalMdr * 100, 2.2, 0.05, 'yield ~2,2 %');
near(10 / 331.839 * 100, 3.0, 0.05, '10 mdr capex = ~3 pp marginal');
// utdelning
near(0.98 * 4, 3.92, 0.001, 'årsrad 3,92');
near(3.92 / 496.82 * 100, 0.79, 0.005, 'yield 0,79 %');
near(3.92 * a.aktier, 29.1, 0.15, 'kostnad 29,1');
near(3.92 * a.aktier / 133.749 * 100, 21.8, 0.15, 'payout 21,8 %');
near((0.91 / 0.83 - 1) * 100, 9.6, 0.05, 'höjning 1 +9,6 %');
near((0.98 / 0.91 - 1) * 100, 7.7, 0.05, 'höjning 2 +7,7 %');
near(175 / (3.92 * a.aktier), 6.0, 0.03, 'capex/utdelning 6,0×');
near(10.7 / d.marknadsKapitalMdr * 100, 0.29, 0.005, 'återbäring 0,29 %');
near(41 / d.marknadsKapitalMdr * 100, 1.11, 0.005, 'capex/kvartal 1,11 %');
// PEG-treen
near(d.vardering.pe / d.vardering.peg, 16.99, 0.01, 'PEG implicit 16,99');
near(d.vardering.pe / 19.34, 1.432, 0.001, 'PEG prognos 1,432');
near(d.vardering.pe / 22.72, 1.219, 0.001, 'PEG CAGR 1,219');
// kvartalskedja
near(90.01 / 331.839 * 100, 27.1, 0.05, 'Q4-andel 27,1 %');

console.log('— MEDIANER OCH RANG, LIVE ur universumfilen —');
const gren = list.filter(x => x.bransch === 'teknik');
const val = (arr) => arr.filter(v => typeof v === 'number' && Number.isFinite(v)).sort((x, y) => x - y);
const med = (arr) => { const s = val(arr); const m = Math.floor(s.length / 2); return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2; };
const rng = (arr, x, högre) => { const s = val(arr); return högre ? [...s].reverse().filter(v => v > x).length + 1 : s.filter(v => v < x).length + 1; };
const F = {
  'P/E 22,01/13 av 23': { fn: x => x.vardering?.pe, m: 22.01, r: 13, n: 23, h: 0 },
  'P/B 6,10/16 av 23': { fn: x => x.vardering?.pb, m: 6.099, r: 16, n: 23, h: 0 },
  'EV/EBIT 23,81/13 av 23': { fn: x => x.vardering?.evEbit, m: 23.81, r: 13, n: 23, h: 0 },
  'PEG 1,15/14 av 19': { fn: x => x.vardering?.peg, m: 1.15, r: 14, n: 19, h: 0 },
  'FCF-yield 2,38/19 av 22': { fn: x => x.vardering?.fcfYield, m: 0.0238, r: 19, n: 22, h: 1 },
  'ROE 30,56/9 av 23': { fn: x => x.lonksamhet?.roe, m: 0.3056, r: 9, n: 23, h: 1 },
  'ROIC 22,58/10 av 22': { fn: x => x.lonksamhet?.roic, m: 0.2258, r: 10, n: 22, h: 1 },
  'brutto 52,73/6 av 23': { fn: x => x.lonksamhet?.bruttoMarginal, m: 0.5273, r: 6, n: 23, h: 1 },
  'EBIT 26,34/3 av 23': { fn: x => x.lonksamhet?.ebitMarginal, m: 0.2634, r: 3, n: 23, h: 1 },
  'netto 20,41/4 av 23': { fn: x => x.lonksamhet?.nettoMarginal, m: 0.2041, r: 4, n: 23, h: 1 },
  'skuld 0,189/15 av 23': { fn: x => x.stabilitet?.skuldEgenkapital, m: 0.1886, r: 15, n: 23, h: 0 },
  'TTM 12,7/8 av 22': { fn: x => x.tillvaxt?.omsattningTillvaxtTTM, m: 0.1274, r: 8, n: 22, h: 1 },
  'CAGR 9,11/5 av 22': { fn: x => x.tillvaxt?.omsattningCAGR5ar, m: 0.0911, r: 5, n: 22, h: 1 },
  'FCF-marginal 14,80/19 av 22': { fn: x => x.lonksamhet?.fcfMarginal, m: 0.1480, r: 19, n: 22, h: 1 },
};
for (const [namn, { fn, m, r, n, h }] of Object.entries(F)) {
  const arr = gren.map(fn); const egen = fn(d);
  ok(egen !== null, `fält mäts ${namn}`);
  near(med(arr), m, h ? 0.0006 : 0.011, `median ${namn}`);
  ok(val(arr).length === n, `n ${namn}`, `${val(arr).length}`);
  ok(rng(arr, egen, h) === r, `rang ${namn}`, `${rng(arr, egen, h)}`);
}
ok(gren.length === 23, 'teknikgrenen 23 bolag', `${gren.length}`);

console.log('— JURIDIKGRIND —');
const lagrum = (body.match(/2007:528/g) || []).length;
ok(lagrum === 1, 'exakt ett lagrum 2007:528', `${lagrum}`);
ok(body.includes('2 kap 5 §'), 'paragraf 2 kap 5 §');
const råd = ['rekommenderar att köpa', 'bör köpa', 'sälj aktien', 'köp aktien', 'mycket gynnsamt köp', 'strong buy'];
const rådTräff = råd.filter(w => body.toLowerCase().includes(w));
ok(rådTräff.length === 0, 'rådverb 0', rådTräff.join(','));
const negerande = body.includes('Inga köp-, sälj- eller hållningsrekommendationer');
ok(negerande, 'disclaimerns negerande standardfras');

console.log('— INTERNLÄNKAR —');
const länkar = [...new Set((body.match(/\]\((\/[^)]+)\)/g) || []).map(s => s.slice(2, -1)))];
ok(länkar.every(l => l.startsWith('/dataset/teknik/')), 'alla internlänkar i teknikgrenen', länkar.join(' '));
const tillåtna = ['pe', 'pb', 'ev-ebit', 'fcf-avkastning', 'roe', 'roic', 'brutto-marginal', 'netto-marginal', 'skuldsattning', 'omsattningstillvaxt-ttm', 'omsattning-cagr-5ar', 'resultat-cagr-5ar', 'prognos-tillvaxt', 'universumjamforelse', 'vardering'];
ok(länkar.every(l => tillåtna.includes(l.split('/').pop())), 'länkarnas fält i tillåten uppsättning');
ok(!body.includes('](/dataset/teknik/peg)'), 'PEG länkas INTE — /dataset/teknik/peg svarar 404 (HTTP-verifierat 2026-09-21; SAP-paketet bär samma döda länk, deras yta, fynd bokförs i worklog)');
console.log(`  (${länkar.length} unika; HTTP-kontroll körs separat med --http)`);

console.log('— SPRÅKGRIND —');
const läckor = ['trustworthy', 'calenderår', 'bondnotis', 'revenue growth', 'market cap', 'earnings call', 'bestätigt', 'könnte'];
const t = läckor.filter(w => body.includes(w));
ok(t.length === 0, 'kända språkläckor 0', t.join(','));
warn(!body.includes('  '), 'inga dubbla mellanslag');

console.log('— SERIEPOSITION —');
const disk = readdirSync('/home/ak1a/AK1/data/blogg-utkast/kvartal/2026-q3').filter(f => /^sa-laser-du-.*-q3-2026\.json$/.test(f));
ok(disk.includes('sa-laser-du-microsoft-q3-2026.json'), 'paketet på disk');
console.log(`  paket på disk: ${disk.length} (Microsoft = ${disk.length}:a när sist bland syskonen)`);
ok(disk.length >= 72, 'minst 72 paket (71 + detta)', `${disk.length}`);

console.log(`\nKVD ${FEL === 0 ? 'GRÖN' : 'FEL'}: ${PASS} PASS, ${FEL} FEL, ${VARN} VARNING`);
process.exit(FEL === 0 ? 0 : 1);
