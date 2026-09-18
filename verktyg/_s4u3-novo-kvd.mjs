// KVD för sa-laser-du-novo-nordisk-q3-2026.json — kvalitetsverifiering vid tillverkningen 2026-09-17.
// Kontrollerar: JSON-giltighet, källtalsparitet mot bolagsunivers.json (NOVO-B.CO-posten),
// aritmetik med oberoende omräkning, medianer/rangplatser mot 165-filen, juridikgrind,
// samt att utkastet ligger i blogg-utkast (ej data/blogg/). Länkar kontrolleras separat.
import { readFileSync } from 'node:fs';

const PAKET = '/home/ak1a/AK1/data/blogg-utkast/kvartal/2026-q3/sa-laser-du-novo-nordisk-q3-2026.json';
const UNIV = '/home/ak1a/AK1/data/portfolj-system/bolagsunivers.json';

let pass = 0, fel = 0, varning = 0;
const ok = (namn, villkor, not = '') => {
  if (villkor) { pass++; console.log(`PASS ${namn} ${not}`); }
  else { fel++; console.log(`FEL  ${namn} ${not}`); }
};

const P = JSON.parse(readFileSync(PAKET, 'utf8'));
const U = JSON.parse(readFileSync(UNIV, 'utf8'));
const B = U.find((b) => b.ticker === 'NOVO-B.CO');

// === 1. Struktur ===
ok('json.giltig', true);
for (const k of ['slug', 'title', 'description', 'pillar', 'author', 'publishedAt', 'readingMinutes', 'tags', 'body'])
  ok(`falt.${k}`, typeof P[k] === 'string' || typeof P[k] === 'number' || (k === 'tags' && Array.isArray(P[k]) && P[k].length >= 4));
ok('slug.korrekt', P.slug === 'sa-laser-du-novo-nordisk-q3-2026', P.slug);
ok('pillar.seriekonvention', P.pillar === 'Institutionell metodik');
ok('author.seriekonvention', P.author === 'AK1A Research Lab');
ok('publishedAt.rappdag', P.publishedAt === '2026-11-04', P.publishedAt);
ok('readingMinutes.formel', P.readingMinutes === Math.round(P.body.split(/\s+/).filter(Boolean).length / 600), `${P.readingMinutes} min`);
ok('tags.innehall', P.tags.includes('kvartalsrapport') && P.tags.includes('Novo Nordisk') && P.tags.includes('halso'));
ok('fil.läge.utkast', PAKET.includes('/data/blogg-utkast/kvartal/2026-q3/'));
ok('fil.EJ.live', !PAKET.includes('/data/blogg/'));

const body = P.body;
const har = (s) => body.includes(s);
const svt = (x, d = 2) => x.toFixed(d).replace('.', ',');

// === 2. Källtalsparitet mot 165-filen ===
const paritet = [
  ['kurs', svt(B.pris, 2)],
  ['mv', '1 368,309'],
  ['pe', svt(B.vardering.pe, 3)],
  ['pb', svt(B.vardering.pb, 3)],
  ['evEbit', svt(B.vardering.evEbit, 3)],
  ['peg', svt(B.vardering.peg, 2)],
  ['fcfYield', svt(B.vardering.fcfYield * 100, 2) + ' %'],
  ['roe', svt(B.lonksamhet.roe * 100, 2) + ' %'],
  ['roic', svt(B.lonksamhet.roic * 100, 2) + ' %'],
  ['brutto', svt(B.lonksamhet.bruttoMarginal * 100, 2) + ' %'],
  ['ebit', svt(B.lonksamhet.ebitMarginal * 100, 2) + ' %'],
  ['netto', svt(B.lonksamhet.nettoMarginal * 100, 2) + ' %'],
  ['fcfMarg', svt(B.lonksamhet.fcfMarginal * 100, 2) + ' %'],
  ['skuldEk', svt(B.stabilitet.skuldEgenkapital, 3)],
  ['progTillv', svt(B.tillvaxt.prognosTillvaxt * 100, 2) + ' %'],
  ['resCagr', svt(B.tillvaxt.resultatCAGR5ar * 100, 2) + ' %'],
  ['omsCagr', svt(B.tillvaxt.omsattningCAGR5ar * 100, 2) + ' %'],
  ['ttm', svt(B.tillvaxt.omsattningTillvaxtTTM * 100, 2) + ' %'],
];
for (const [namn, tal] of paritet) ok(`paritet.${namn}`, har(tal), `="${tal}"`);

const [o0, o1, o2, o3] = B.serier.omsattning.map((x) => x / 1e9);
const [r0, r1, r2, r3] = B.serier.resultat.map((x) => x / 1e9);
for (const [i, v] of B.serier.omsattning.entries()) ok(`paritet.oms${B.serier.ar[i]}`, har(svt(v / 1e9, 3)), svt(v / 1e9, 3));
for (const [i, v] of B.serier.resultat.entries()) ok(`paritet.res${B.serier.ar[i]}`, har(svt(v / 1e9, 3)), svt(v / 1e9, 3));
ok('notering.ar4', B.serier.ar.length === 4 && har('4 räkenskapsår'));

// === 3. Aritmetik med oberoende omräkning ===
const avvik = (beraknad, text, tol = 0.006) => Math.abs(Math.abs(beraknad) - Math.abs(parseFloat(text.replace(/,/g, '.').replace(/[^0-9.\-+]/g, '')))) / Math.abs(beraknad) <= tol;
const rakna = [
  ['omsSteg23', (o1 / o0 - 1) * 100, '+31,26 %'],
  ['omsSteg24', (o2 / o1 - 1) * 100, '+25,03 %'],
  ['omsSteg25', (o3 / o2 - 1) * 100, '+6,43 %'],
  ['resSteg23', (r1 / r0 - 1) * 100, '+50,71 %'],
  ['resSteg24', (r2 / r1 - 1) * 100, '+20,68 %'],
  ['resSteg25', (r3 / r2 - 1) * 100, '+1,43 %'],
  ['nettoMarg22', (r0 / o0) * 100, '31,38 %'],
  ['nettoMarg23', (r1 / o1) * 100, '36,03 %'],
  ['nettoMarg24', (r2 / o2) * 100, '34,78 %'],
  ['nettoMarg25', (r3 / o3) * 100, '33,14 %'],
  ['cagrOms', ((o3 / o0) ** (1 / 3) - 1) * 100, '20,43'],
  ['cagrRes', ((r3 / r0) ** (1 / 3) - 1) * 100, '22,65'],
  ['identitet', B.vardering.pb / B.lonksamhet.roe, '10,354'],
  ['vinstavk', (B.lonksamhet.roe / B.vardering.pb) * 100, '9,66'],
  ['absolut', B.vardering.pe * r3, '1 208,2'],
  ['residual', (B.marknadsKapitalMdr / (B.vardering.pe * r3) - 1) * 100, '+13,3'],
  ['implicit', B.marknadsKapitalMdr / B.vardering.pe, '116,0'],
  ['ek', B.marknadsKapitalMdr / B.vardering.pb, '220,9'],
  ['roeTtm', ((B.marknadsKapitalMdr / B.vardering.pe) / (B.marknadsKapitalMdr / B.vardering.pb)) * 100, '52,5'],
  ['roeBokf', (r3 / (B.marknadsKapitalMdr / B.vardering.pb)) * 100, '46,4'],
  ['ebit25', B.lonksamhet.ebitMarginal * o3, '131,5'],
  ['skuld', (B.marknadsKapitalMdr / B.vardering.pb) * B.stabilitet.skuldEgenkapital, '139,9'],
  ['evKedja', B.marknadsKapitalMdr + (B.marknadsKapitalMdr / B.vardering.pb) * B.stabilitet.skuldEgenkapital, '1 508,2'],
  ['evEbitKedja', (B.marknadsKapitalMdr + (B.marknadsKapitalMdr / B.vardering.pb) * B.stabilitet.skuldEgenkapital) / (B.lonksamhet.ebitMarginal * o3), '11,47'],
  ['evFalt', B.vardering.evEbit * B.lonksamhet.ebitMarginal * o3, '1 342,4'],
  ['nettokassa', B.vardering.evEbit * B.lonksamhet.ebitMarginal * o3 - B.marknadsKapitalMdr, '−25,9'],
  ['fcf25', B.lonksamhet.fcfMarginal * o3, '35,4'],
  ['fcfAvkBer', (B.lonksamhet.fcfMarginal * o3 / B.marknadsKapitalMdr) * 100, '2,58'],
  ['pegKonv', B.vardering.pe / (B.tillvaxt.prognosTillvaxt * 100), '5,11'],
  ['pegImpl', B.vardering.pe / B.vardering.peg, '3,66'],
  ['pegBakat', B.vardering.pe / (((r3 / r0) ** (1 / 3) - 1) * 100), '0,52'],
  ['pegKlyfta', B.vardering.peg / (B.vardering.pe / (((r3 / r0) ** (1 / 3) - 1) * 100)), '6,2'],
  ['pFcf', 1 / B.vardering.fcfYield, '36,4'],
  ['medianJamv', B.marknadsKapitalMdr / 24.818, '55,1'],
  ['nettoFcfKlyfta', (B.lonksamhet.nettoMarginal - B.lonksamhet.fcfMarginal) * 100, '23,9'],
  ['enPp', o3 * 0.01, '3,09'],
  ['treProc', o3 * 0.03 * (r3 / o3), '3,07'],
  ['marginalVikt', 1 / (3 * (r3 / o3)), '1,01'],
  ['omsResa', (o3 / o0 - 1) * 100, '+75'],
];
for (const [namn, beraknad, text] of rakna) {
  const ren = text.replace(/[+−%\s]/g, '');
  ok(`aritmetik.${namn}`, har(text) && avvik(beraknad, ren, 0.011), `ber=${svt(beraknad, Math.abs(beraknad) >= 1000 ? 1 : 2)} text="${text}"`);
}

// scenariorutan 9 celler
const basM = (r3 / o3) * 100;
let celler = 0;
for (const dm of [-2, 0, 2]) {
  for (const dvo of [-3, 0, 3]) {
    const v = o3 * (1 + dvo / 100) * ((basM + dm) / 100);
    if (har(svt(v, 1))) celler++;
  }
}
ok('aritmetik.scenarioruta9', celler === 9, `${celler}/9 celler`);

// === 4. Medianer + rang mot färsk fil ===
function med(v) { const s = v.filter(Number.isFinite).sort((a, b) => a - b); const m = Math.floor(s.length / 2); return { m: s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2, n: s.length }; }
// p100: null/undefined/NaN förblir NaN — null*100 vore 0 och förfalskar median och rang (ABBV-fallet)
const p100 = (x) => (Number.isFinite(x) ? x * 100 : NaN);
const gren = U.filter((b) => b.bransch === 'halso');
ok('gren.n16', gren.length === 16, `n=${gren.length}`);
const falt = {
  'P/E': [(b) => b.vardering?.pe, '24,818', 15, '1/15', false],
  'P/B': [(b) => b.vardering?.pb, '4,356', 15, '9/15', false],
  'EV/EBIT': [(b) => b.vardering?.evEbit, '17,073', 16, '1/16', false],
  PEG: [(b) => b.vardering?.peg, '0,79', 15, '14/15', false],
  'FCF-avk': [(b) => p100(b.vardering?.fcfYield), '4,25', 15, '11/15', true],
  ROE: [(b) => p100(b.lonksamhet?.roe), '18,53', 15, '2/15', true],
  ROIC: [(b) => p100(b.lonksamhet?.roic), '17,42', 15, '2/15', true],
  Brutto: [(b) => p100(b.lonksamhet?.bruttoMarginal), '70,99', 16, '2/16', true],
  EBIT: [(b) => p100(b.lonksamhet?.ebitMarginal), '27,71', 16, '2/16', true],
  Netto: [(b) => p100(b.lonksamhet?.nettoMarginal), '13,41', 16, '1/16', true],
  'FCF-marg': [(b) => p100(b.lonksamhet?.fcfMarginal), '14,08', 16, '11/16', true],
  'Skuld/EK': [(b) => b.stabilitet?.skuldEgenkapital, '0,642', 15, '7/15', false],
  'Prog.tillv': [(b) => p100(b.tillvaxt?.prognosTillvaxt), '15,62', 16, '16/16', true],
  'Res-CAGR': [(b) => p100(b.tillvaxt?.resultatCAGR5ar), '5,09', 14, '5/14', true],
  'Oms-CAGR': [(b) => p100(b.tillvaxt?.omsattningCAGR5ar), '7,295', 16, '2/16', true],
  'TTM': [(b) => p100(b.tillvaxt?.omsattningTillvaxtTTM), '4,85', 16, '11/16', true],
};
for (const [namn, [fn, textMed, nExp, rangExp, storst]] of Object.entries(falt)) {
  const g = med(gren.map(fn));
  ok(`median.${namn}`, Math.abs(g.m - parseFloat(textMed.replace(',', '.'))) < 0.006 && g.n === nExp && har(textMed) && har(rangExp), `med=${svt(g.m, 3)} n=${g.n} (text ${textMed} ${rangExp})`);
  const s = gren.map(fn).filter(Number.isFinite).sort((a, b) => (storst ? b - a : a - b));
  ok(`rang.${namn}`, `${s.indexOf(fn(B)) + 1}/${s.length}` === rangExp, `${s.indexOf(fn(B)) + 1}/${s.length} mot ${rangExp}`);
}
const uniPe = med(U.map((b) => b.vardering?.pe));
ok('universum.pe20', Math.abs(uniPe.m - 20.454) < 0.01 && har('20,454'), `uniPE=${svt(uniPe.m, 3)}`);
ok('universum.n165', U.length === 165);

// === 5. Juridikgrind ===
const lagrum = body.match(/\b\d{4}:\d+\b/g) ?? [];
ok('juridik.ettLagrum', lagrum.length === 1 && lagrum[0] === '2007:528', JSON.stringify(lagrum));
const disclaim = body.slice(-800);
const bodyUtanDisclaim = body.slice(0, -800);
const rad = bodyUtanDisclaim.match(/\bköpa?\b|\bsälja?\b|\brekommender\w*|\bundvik\w*\b|\bmålkurs\w*|\bhållnings\w*\b/gi) ?? [];
ok('juridik.0Rad', rad.length === 0, JSON.stringify(rad));
const prog = bodyUtanDisclaim.match(/\bväntas\b|\bförväntas\b|\bförvänta\b|\bkommer att\b|\btroligen\b|\btorde\b|\bspås\b|\btippas\b/gi) ?? [];
ok('juridik.0Prognosord', prog.length === 0, JSON.stringify(prog));
ok('juridik.disclaimerFinns', disclaim.includes('inte investeringsrådgivning') && disclaim.includes('kundens beslut'));
ok('juridik.utbildningsform', body.includes('så läster') || body.includes('så läser du') || P.title.includes('så läser du den'));

console.log(`\nSUMMA: ${pass} PASS, ${fel} FEL, ${varning} VARNING`);
process.exit(fel ? 1 : 0);
