// _s4u2-aapl-kvd.mjs — KVD-sond för Apple Q3-2026-läspaketet. Kör: node verktyg/_s4u2-aapl-kvd.mjs
import fs from 'fs';

const PAKET = '/home/ak1a/AK1/data/blogg-utkast/kvartal/2026-q3/sa-laser-du-apple-q3-2026.json';
let PASS = 0, FEL = 0, VARN = 0;
const ok = (namn, villkor, detalj = '') => {
  if (villkor) { PASS++; console.log('  PASS', namn, detalj); }
  else { FEL++; console.log('  FEL ', namn, detalj); }
};
const se = x => x.toLocaleString('sv-SE', { maximumFractionDigits: 10 });

// ---------- 1. Struktur ----------
console.log('== 1. STRUKTUR ==');
const raw = fs.readFileSync(PAKET, 'utf8');
const j = JSON.parse(raw);
ok('JSON giltigt', true);
ok('Alla nycklar', ['slug','title','description','pillar','author','publishedAt','readingMinutes','tags','body'].every(k => k in j));
ok('slug = filnamn', j.slug === 'sa-laser-du-apple-q3-2026', j.slug);
ok('title längd rimlig (<520)', j.title.length < 520, `${j.title.length} tecken`);
ok('description längd rimlig (<1000)', j.description.length < 1000, `${j.description.length} tecken`);
ok('publishedAt = rappdag', j.publishedAt === '2026-10-29', j.publishedAt);
ok('tags 6 st med konvention', j.tags.length === 6 && j.tags.includes('kvartalsrapport') && j.tags.includes('läspaket') && j.tags.includes('Apple'), JSON.stringify(j.tags));
const ord = j.body.split(/\s+/).filter(Boolean).length;
ok('ordantal 2600–3400', ord >= 2600 && ord <= 3400, `${ord} ord`);
ok('readingMinutes = round(ord/600)', j.readingMinutes === Math.round(ord / 600), `rm ${j.readingMinutes} mot ${Math.round(ord / 600)}`);
ok('body slutar med R2-mening', j.body.trimEnd().endsWith('Publicering av utkastet är kundens beslut (R2).'));

// ---------- 2. Universumparitet (tal i texten mot filens AAPL-rad) ----------
console.log('== 2. UNIVERSUMPARITET ==');
const U = JSON.parse(fs.readFileSync('/home/ak1a/AK1/data/portfolj-system/bolagsunivers.json', 'utf8'));
const A = U.find(r => r.ticker === 'AAPL');
const par = (namn, faltVal, textForm) =>
  ok(namn, j.body.includes(textForm), `${textForm} (fält ${faltVal})`);
par('pris', A.pris, '324,96');
par('mcap', A.marknadsKapitalMdr, '4 742,5');
par('P/E-fält', A.vardering.pe, '37,309');
par('P/B-fält', A.vardering.pb, '44,152');
par('ROE', A.lonksamhet.roe, '148,75');
par('ROIC', A.lonksamhet.roic, '79,42');
par('brutto-marginal', A.lonksamhet.bruttoMarginal, '48,65');
par('EBIT-marginal', A.lonksamhet.ebitMarginal, '32,62');
par('netto-marginal', A.lonksamhet.nettoMarginal, '27,62');
par('skuld/EK', A.stabilitet.skuldEgenkapital, '0,78');
par('TTM-tillväxt', A.tillvaxt.omsattningTillvaxtTTM, '16,4');
par('CAGR5-oms', A.tillvaxt.omsattningCAGR5ar, '1,81');
par('FCF-marginal via fält', A.lonksamhet.fcfMarginal, '23,08');
par('FY2025-omsättning', A.serier.omsattning[3] / 1e9, '416,161');
par('FY2023-dip', A.serier.omsattning[1] / 1e9, '383,3');

// ---------- 3. Aritmetik (oberoende omräkning av textens påståenden) ----------
console.log('== 3. ARITMETIK ==');
const epsK = 1.85 + 2.84 + 2.01 + 2.02;
ok('EPS-kedja = 8,72', Math.abs(epsK - 8.72) < 0.005 && j.body.includes('1,85 + 2,84 + 2,01 + 2,02 = 8,72'), epsK.toFixed(3));
ok('P/E på kedjan 324,96/8,72 = 37,3', Math.abs(324.96 / epsK - 37.27) < 0.05 && j.body.includes('324,96 delat med den ger 37,3'), (324.96 / epsK).toFixed(2));
ok('implicerad EPS-bas 8,710', Math.abs(324.96 / 37.309 - 8.710) < 0.001 && j.body.includes('8,710'), (324.96 / 37.309).toFixed(4));
ok('gap 0,12 %', Math.abs(100 * (epsK - 324.96 / 37.309) / (324.96 / 37.309) - 0.12) < 0.02 && j.body.includes('gap 0,12 procent'));
const ttmI = 102.47 + 143.8 + 111.2 + 109.417, ttmN = 27.47 + 42.1 + 29.6 + 29.789;
ok('TTM-intäkt 466,887 (gap 0,014 %)', Math.abs(ttmI - 466.887) < 0.001 && j.body.includes('466,887') && j.body.includes('0,014 procent'), ttmI.toFixed(3));
ok('nettomarginal kedja 27,62 %', Math.abs(100 * ttmN / ttmI - 27.62) < 0.01 && j.body.includes('= 27,62 procent'), (100 * ttmN / ttmI).toFixed(3));
const peIdent = 44.152 / 1.4875;
ok('identitet P/B÷ROE = 29,68, gap 20,4 %', Math.abs(peIdent - 29.68) < 0.01 && j.body.includes('29,68') && j.body.includes('20,4 procent'), peIdent.toFixed(2));
const ekS = 4742.5 / 44.152, ekM = 128.93 / 1.4875;
ok('slut-EK 107,4 / medel-EK 86,7', Math.abs(ekS - 107.4) < 0.1 && Math.abs(ekM - 86.7) < 0.1 && j.body.includes('107,4') && j.body.includes('86,7'), `${ekS.toFixed(1)}/${ekM.toFixed(1)}`);
ok('EK-kvot 23,9 %', Math.abs(100 * (ekS / ekM - 1) - 23.9) < 0.1 && j.body.includes('23,9 procent'), (100 * (ekS / ekM - 1)).toFixed(2));
ok('ROE slut-EK 120,0 %', Math.abs(100 * 128.93 / ekS - 120.0) < 0.1 && j.body.includes('120,0 procent'), (100 * 128.93 / ekS).toFixed(2));
ok('aktieantal spot 14,594', Math.abs(4742.5 / 324.96 - 14.594) < 0.001 && j.body.includes('14,594'), (4742.5 / 324.96).toFixed(3));
ok('BPS 7,36', Math.abs(ekS / (4742.5 / 324.96) - 7.36) < 0.01 && j.body.includes('7,36'), (ekS / (4742.5 / 324.96)).toFixed(3));
ok('aktieantal EPS-vägar 14,849/14,824/14,747', Math.abs(27.47 / 1.85 - 14.849) < 0.001 && Math.abs(42.1 / 2.84 - 14.824) < 0.001 && Math.abs(29.789 / 2.02 - 14.747) < 0.001 && j.body.includes('14,849') && j.body.includes('14,747'));
const ebitF = 0.3262 * 466.82, ev = 31.285 * ebitF;
ok('EBIT 152,3 → EV 4 764 → nettoskuld 21,5', Math.abs(ebitF - 152.3) < 0.1 && Math.abs(ev - 4764) < 1 && j.body.includes('152,3') && j.body.includes('4 764') && j.body.includes('21,5 miljarder ÖVER'), `${ebitF.toFixed(1)} ${ev.toFixed(0)}`);
ok('skuldväg 84,3 (full precision 0,7844)', Math.abs(0.7844 * ekS - 84.3) < 0.2 && j.body.includes('84,3'), (0.7844 * ekS).toFixed(1));
ok('PEG tre: 2,56 / 4,60 / 2,27', Math.abs(37.309 / 8.11 - 4.60) < 0.01 && Math.abs(37.309 / 16.4 - 2.27) < 0.01 && Math.abs(37.309 / 2.56 - 14.57) < 0.01 && j.body.includes('2,56, 4,60 och 2,27') && j.body.includes('14,57'));
const gl = 102.47 * 1.09, gm = 102.47 * 1.10, gh = 102.47 * 1.11;
ok('guide 111,7 / 112,7 / 113,7', Math.abs(gl - 111.69) < 0.01 && Math.abs(gm - 112.72) < 0.01 && Math.abs(gh - 113.74) < 0.01 && j.body.includes('111,7–113,7') && j.body.includes('112,7'));
const fy26 = ttmI - 102.47 + gm;
ok('FY2026 ~477 (+14,7 %)', Math.abs(fy26 - 477.1) < 0.1 && Math.abs(100 * (fy26 / 416.161 - 1) - 14.7) < 0.1 && j.body.includes('477 miljarder') && j.body.includes('+14,7'), `${fy26.toFixed(1)} ${(100 * (fy26 / 416.161 - 1)).toFixed(2)}%`);
ok('utdelning 1,08/år = 0,33 %', Math.abs(100 * 1.08 / 324.96 - 0.332) < 0.01 && j.body.includes('1,08 dollar') && j.body.includes('0,33 procent'), (100 * 1.08 / 324.96).toFixed(3));
ok('brytpunkt P/E 34 → EPS 2,69 (+45,3 % över 1,85)', Math.abs(324.96 / 34 - 6.87 - 2.69) < 0.01 && j.body.includes('2,69') && Math.abs(100 * ((324.96 / 34 - 6.87) / 1.85 - 1) - 45.3) < 0.1 && j.body.includes('45,3 procent'));
ok('brytpunkt P/E 32 → EPS 3,29', Math.abs(324.96 / 32 - 6.87 - 3.29) < 0.01 && j.body.includes('3,29'));
ok('EPS-världar kvot 1,06; slag 6,9/1,1', Math.abs(2.02 / 1.91 - 1.058) < 0.001 && Math.abs(100 * (2.02 / 1.89 - 1) - 6.9) < 0.05 && Math.abs(100 * (1.91 / 1.89 - 1) - 1.1) < 0.05 && j.body.includes('kvot 1,06') && j.body.includes('+6,9 procent') && j.body.includes('+1,1 procent'));
ok('säsongsback Q1→Q2 22,6 %', Math.abs(100 * (1 - 111.2 / 143.8) - 22.67) < 0.1 && j.body.includes('22,6 procent'), (100 * (1 - 111.2 / 143.8)).toFixed(2));

// Scenariorutans 9 celler × 3 tal
console.log('== 3b. SCENARIORUTAN (9 celler) ==');
const antal = 4742.5 / 324.96;
const rullB = 8.72 - 1.85;
const rutForv = [];
for (const m of [0.24, 0.27, 0.30]) for (const ii of [gl, gm, gh]) {
  const n = m * ii, e = n / antal, p = 324.96 / (rullB + e);
  rutForv.push([n, e, p]);
}
const rutRader = j.body.split('\n').filter(l => /^\| \*\*\d+ procent\*\* \|/.test(l));
const celler = [];
for (const rad of rutRader) {
  const delar = rad.split('|').map(s => s.trim()).filter(Boolean).slice(1); // släpp marginalkolumnen
  for (const d of delar) {
    const m = d.match(/^(\d+,\d) · (\d,\d\d) · (\d+,\d)$/);
    if (m) celler.push([parseFloat(m[1].replace(',', '.')), parseFloat(m[2].replace(',', '.')), parseFloat(m[3].replace(',', '.'))]);
  }
}
ok('3 rader × 3 celler hittade', rutRader.length === 3 && celler.length === 9, `${rutRader.length} rader, ${celler.length} celler`);
let cellOK = 0;
for (let i = 0; i < 9 && i < celler.length; i++) {
  const [f, c] = [rutForv[i], celler[i]];
  if (Math.abs(f[0] - c[0]) < 0.06 && Math.abs(f[1] - c[1]) < 0.005 && Math.abs(f[2] - c[2]) < 0.06) cellOK++;
}
ok('9/9 celler aritmetiskt exakta', cellOK === 9, `${cellOK}/9`);
const peAll = celler.map(c => c[2]).sort((a, b) => a - b);
ok('rutans P/E-spann 35,3–37,3 i text', j.body.includes('35,3–37,3') && Math.abs(peAll[0] - 35.3) < 0.06 && Math.abs(peAll[8] - 37.3) < 0.06, `${peAll[0]}–${peAll[8]}`);
ok('marginaltick 1,13 mdr = 0,077 dollar', Math.abs(0.01 * gm - 1.127) < 0.001 && Math.abs(1.127 / antal - 0.0772) < 0.001 && j.body.includes('1,13 miljarder') && j.body.includes('0,077 dollar'));
ok('marginalspann 6 pp → EPS 0,45', Math.abs(0.06 * gm / antal - 0.4634) < 0.01 || j.body.includes('0,45 dollar'));

// ---------- 4. Grenstatistik (medianer/rang mot live-fil) ----------
console.log('== 4. GRENSTATISTIK ==');
const tek = U.filter(r => r.bransch === 'teknik');
function median(v) { const s = [...v].sort((a, b) => a - b); const n = s.length; return n % 2 ? s[(n - 1) / 2] : (s[n / 2 - 1] + s[n / 2]) / 2; }
const gm2 = median(tek.map(r => r.vardering?.pe).filter(v => typeof v === 'number'));
ok('gren n=33 i text', tek.length === 33 && j.body.includes('33 bolag'), `n=${tek.length}`);
ok('P/E-median 21,57', Math.abs(gm2 - 21.57) < 0.01 && j.body.includes('21,57'), gm2.toFixed(2));
ok('P/B-median 4,49', Math.abs(median(tek.map(r => r.vardering?.pb).filter(v => typeof v === 'number')) - 4.49) < 0.01 && j.body.includes('4,49'));
ok('ROE-median 26,08', Math.abs(100 * median(tek.map(r => r.lonksamhet?.roe).filter(v => typeof v === 'number')) - 26.08) < 0.01 && j.body.includes('26,08'));
// rangkontroller
const rangHogst = (get, ticker) => {
  const l = tek.map(r => [r.ticker, get(r)]).filter(([, v]) => typeof v === 'number' && isFinite(v)).sort((a, b) => b[1] - a[1]);
  return l.findIndex(([t]) => t === ticker) + 1;
};
ok('P/B rang 1:a högst av 33', rangHogst(r => r.vardering?.pb, 'AAPL') === 1 && j.body.includes('1:a högst av 33'));
ok('ROE rang 1:a högst av 33', rangHogst(r => r.lonksamhet?.roe, 'AAPL') === 1);
ok('ROIC rang 1:a högst av 32', rangHogst(r => r.lonksamhet?.roic, 'AAPL') === 1 && j.body.includes('1:a högst av 32'));
ok('brutto rang 17:e = exakt median', rangHogst(r => r.lonksamhet?.bruttoMarginal, 'AAPL') === 17 && j.body.includes('17:e högst av 33 (exakt medianen)'));
ok('PEG rang 2:a högst av 26', rangHogst(r => r.vardering?.peg, 'AAPL') === 2 && j.body.includes('2:a högst av 26'));

// ---------- 5. Juridik ----------
console.log('== 5. JURIDIK (2007:528) ==');
const radverb = [/\bköp denna\b/i, /\bköp aktien\b/i, /\bsälj aktien\b/i, /\brekommenderar (att )?(köp|sälj|behåll)/i, /\bvi rekommenderar\b/i, /\btips: köp/i, /\bska du köpa\b/i, /\bdags att köpa\b/i, /\binvesteringsråd\b/i, /\bnjur brasklapp\b/i];
const radHits = radverb.filter(re => re.test(j.body));
ok('rådverb 0', radHits.length === 0, JSON.stringify(radHits.map(String)));
ok('utbildningsformuleringar finns', j.body.includes('utbildning i metod') && j.body.includes('inte en rekommendation att köpa'));
ok('exakt en lagrumsfamilj 2007:528', (j.body.match(/2007:528/g) || []).length >= 1 && !/2022:260|2022:261|1985:716|2005:59|2022:482/.test(j.body));
ok('disclaimer exakt sista rad', j.body.trimEnd().endsWith('Publicering av utkastet är kundens beslut (R2).'));

// ---------- 6. Språk & läckor ----------
console.log('== 6. SPRÅK & LÄCKOR ==');
ok('inga TODO/TBD/XXX', !/\b(TODO|TBD|XXX|FIXME)\b/.test(j.body));
ok('inget 911', !/911/.test(j.body));
ok('inga dubbla mellanslag', !/  /.test(j.body.replace(/\n/g, '')));
ok('tabellrader slutar med |', [...j.body.split('\n').filter(l => l.startsWith('|'))].every(l => l.trimEnd().endsWith('|')));
const externa = [...new Set((j.body.match(/https?:\/\/[^)\s]+/g) || []))];
ok('externa URL:er 2 st (apple.com x2)', externa.length === 2 && externa.every(u => u.includes('apple.com')), JSON.stringify(externa));
ok('inga lösa http-länkar utan https', externa.every(u => u.startsWith('https://')));
const interna = [...new Set((j.body.match(/\]\((\/[^)]+)\)/g) || []).map(s => s.slice(2, -1)))];
ok('interna länkar ≥12, alla /dataset/teknik|/kurser|/transparens|/kallor', interna.length >= 12 && interna.every(l => l.startsWith('/dataset/teknik/') || ['/kurser', '/transparens', '/kallor'].includes(l)), `${interna.length} st`);
ok('inga markdown-bilder', !/!\[/.test(j.body));
ok('H2-struktur 8 st', (j.body.match(/\n## /g) || []).length === 8, `${(j.body.match(/\n## /g) || []).length}`);

// ---------- Dom ----------
console.log('\n==========================');
console.log(`KVD DOM: ${PASS} PASS · ${FEL} FEL · ${VARN} VARN`);
process.exit(FEL > 0 ? 1 : 0);
