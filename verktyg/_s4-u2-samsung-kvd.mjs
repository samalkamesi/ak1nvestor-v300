// KVD för sa-laser-du-samsung-q3-2026.json — fabrik auto-s4-1789679729562 s4-u2
import { readFileSync } from 'node:fs';

const P = './data/blogg-utkast/kvartal/2026-q3/sa-laser-du-samsung-q3-2026.json';
const post = JSON.parse(readFileSync(P, 'utf8'));
const uni = JSON.parse(readFileSync('./data/portfolj-system/bolagsunivers.json', 'utf8'));
const arr = Array.isArray(uni) ? uni : uni.bolag;
const sam = arr.find(b => b.ticker === '005930.KS');
const body = post.body;

let pass = 0, fel = 0, varning = 0;
const ok = namn => { pass++; };
const nej = (namn, info) => { fel++; console.log('FEL: ' + namn + (info ? ' — ' + info : '')); };
const war = (namn, info) => { varning++; console.log('VARNING: ' + namn + (info ? ' — ' + info : '')); };
const chk = (namn, kond, info) => kond ? ok(namn) : nej(namn, info);
const approx = (a, b, tol) => Math.abs(a - b) <= tol;

// ---------- STRUKTUR ----------
const falt = ['slug','title','description','pillar','author','publishedAt','readingMinutes','tags','body'];
chk('9 fält', falt.every(f => f in post), 'saknas: ' + falt.filter(f => !(f in post)));
chk('slug', post.slug === 'sa-laser-du-samsung-q3-2026');
const ord = body.split(/\s+/).filter(Boolean).length;
chk('ord i span 1068–2742', ord >= 1068 && ord <= 2742, 'ord=' + ord);
chk('readingMinutes = round(ord/600)', post.readingMinutes === Math.max(1, Math.round(ord / 600)), ord + '→' + Math.round(ord / 600) + '≠' + post.readingMinutes);
chk('title <= 314 tkn', post.title.length <= 314, 'title=' + post.title.length);
chk('description <= 1057 tkn', post.description.length <= 1057, 'desc=' + post.description.length);
chk('title sökord', /Samsung/i.test(post.title) && /kvartalsrapport/i.test(post.title));
chk('tags 6', Array.isArray(post.tags) && post.tags.length === 6);
chk('publishedAt = 2026-10-27 (dagen före rappdagen 10-28)', post.publishedAt === '2026-10-27');
chk('0 mjuka bindestreck', !body.includes('­'));
chk('0 U+00A0', !body.includes(' '));
chk('sista raden = disclaimer', /inte investeringsråd/.test(body.trim().split('\n').pop()));
const h2 = (body.match(/^## /gm) || []).length;
chk('H2-sektioner >= 10', h2 >= 10, 'H2=' + h2);
// tabellvälformning: inga rader med ojämnt antal kolumner inuti block
const rader = body.split('\n');
let tabell = [], tabellfel = 0;
for (const r of rader) {
  if (r.includes('|')) tabell.push(r);
  else { if (tabell.length) { const n = tabell[0].split('|').length; if (!tabell.every(x => x.split('|').length === n)) tabellfel++; tabell = []; } }
}
if (tabell.length) { const n = tabell[0].split('|').length; if (!tabell.every(x => x.split('|').length === n)) tabellfel++; }
chk('tabeller välformade', tabellfel === 0, tabellfel + ' block skeva');

// ---------- JURIDIK (2007:528 — utbildning, aldrig råd) ----------
chk('disclaimer negerad rådgivning', /inte investeringsråd/.test(body));
chk('lagrum 2007:528', /2007:528/.test(body));
chk('2 kap 5 §', /2 kap 5 §/.test(body));
const forbud = [/köp denna/i, /sälj dina/i, /vi rekommenderar/i, /bör köpa/i, /bör sälja/i, /investera i samsung/i];
for (const f of forbud) chk('förbjudet mönster ' + f, !f.test(body));
chk('återköp endast som substantiv', !/(köp|sälj)\s+(aktien|aktierna|nu)/i.test(body));
// lagrumsblandning: endast 2007:528 får förekomma
const lagrum = body.match(/\b(19\d{3}|20\d{2}:\d{3})\b/g) || [];
chk('endast 2007:528 som lagrum', lagrum.every(l => l === '2007:528'), JSON.stringify(lagrum));

// ---------- LÄNKAR ----------
const lnkar = [...body.matchAll(/\]\((\/[^)]+)\)/g)].map(m => m[1]);
chk('länkar finns', lnkar.length >= 15, lnkar.length + ' länkar');
chk('0 utkastlänkar', !lnkar.some(l => l.includes('blogg-utkast') || l.includes('utkast')));
const unika = [...new Set(lnkar)];
let dl = '';
for (const l of unika) {
  const r = await fetch('http://localhost:3000' + l).catch(() => null);
  if (!r || r.status !== 200) dl += l + '(' + (r ? r.status : 'no-conn') + ') ';
}
chk('alla interna länkar 200', dl === '', dl);

// ---------- UNIVERSUMPOSTENS TAL I BODYN ----------
const siffror = [
  ['pris 252 500', '252 500'], ['mcap 1 610,8', '1 610,8'], ['P/E 12,39', '12,39'],
  ['P/B 2,78', '2,78'], ['EV/EBIT 8,10', '8,10'], ['PEG 0,06', '0,06'],
  ['FCF-yield 8,99', '8,99'], ['ROE 30,79', '30,79'], ['ROIC 36,86', '36,86'],
  ['brutto 57,48', '57,48'], ['EBIT 36,88', '36,88'], ['netto 30,84', '30,84'],
  ['FCF-marg 29,84', '29,84'], ['skuld/EK 0,04', '0,04'], ['CAGR +3,35', '+3,35'],
  ['CAGR −6,83', '−6,83'], ['TTM +57,3', '+57,3'], ['prognos +205,17', '+205,17'],
  ['oms 302,2', '302,2'], ['oms 258,9', '258,9'], ['oms 300,9', '300,9'], ['oms 333,6', '333,6'],
  ['res 54,7', '54,7'], ['res 14,5', '14,5'], ['res 33,6', '33,6'], ['res 44,3', '44,3'],
  ['fcf 12,8', '12,8'], ['fcf −13,5', '−13,5'], ['fcf 21,6', '21,6'], ['fcf 37,8', '37,8'],
  ['kapex 49,4', '49,4'], ['kapex 57,6', '57,6'], ['kapex 51,4', '51,4'], ['kapex 47,5', '47,5'],
  ['TTM-oms 485,3', '485,3'], ['TTM-res 135,3', '135,3'], ['TTM-EBIT 179,0', '179,0'],
  ['kassa 190,0', '190,0'], ['skuld 22,4', '22,4'], ['nettokassa 167,6', '167,6'],
  ['WACC 12,6', '12,6'], ['utdelning 2 264', '2 264'], ['payout 7,4', '7,4'],
  ['återköp 1,8', '1,8'], ['återköp 8,2', '8,2'], ['BVPS 86 052', '86 052'],
  ['brutto TTM 57,5', '57,5'], ['brutto FY25 39,4', '39,4'], ['forward 4,06', '4,06'],
  ['käll-PEG 0,04', '0,04'], ['medel 36,21', '36,21'], ['spread 9,04', '9,04'],
  ['USD-kors 1,18', '1,18'],
];
for (const [namn, s] of siffror) chk('body bär ' + namn, body.includes(s));
// mot filen
chk('fil: P/E', approx(sam.vardering.pe, 12.39, 0.005));
chk('fil: P/B', approx(sam.vardering.pb, 2.78, 0.005));
chk('fil: EV/EBIT', approx(sam.vardering.evEbit, 8.10, 0.005));
chk('fil: fcfY', approx(sam.vardering.fcfYield, 0.0899, 0.0005));
chk('fil: ROIC', approx(sam.lonksamhet.roic, 0.3686, 0.0005));
chk('fil: omsCAGR', approx(sam.tillvaxt.omsattningCAGR5ar, 0.0335, 0.0005));
chk('fil: resCAGR', approx(sam.tillvaxt.resultatCAGR5ar, -0.0683, 0.0005));
chk('fil: prognos', approx(sam.tillvaxt.prognosTillvaxt, 2.0517, 0.001));
chk('fil: serie oms2025', approx(sam.serier.omsattning[3] / 1e6, 333.6, 0.1));
chk('fil: serie res2025', approx(sam.serier.resultat[3] / 1e6, 44.26, 0.01));

// ---------- ARITMETIK (omräkning av bodyns härledningar ur FILens exakta serier) ----------
const O = sam.serier.omsattning, R = sam.serier.resultat; // miljoner KRW
const T = x => x / 1e6; // biljoner KRW
const A = (namn, v, expected, tol) => chk(namn, approx(v, expected, tol), v + '≠' + expected);
// steg + marginaler (exakta tal ur filen)
A('steg oms 23', (O[1] / O[0] - 1) * 100, -14.33, 0.005);
A('steg oms 24', (O[2] / O[1] - 1) * 100, 16.20, 0.005);
A('steg oms 25', (O[3] / O[2] - 1) * 100, 10.88, 0.005);
A('steg res 23', (R[1] / R[0] - 1) * 100, -73.55, 0.005);
A('steg res 24', (R[2] / R[1] - 1) * 100, 132.30, 0.005);
A('steg res 25', (R[3] / R[2] - 1) * 100, 31.65, 0.005);
A('marg 22', R[0] / O[0] * 100, 18.11, 0.005);
A('marg 23', R[1] / O[1] * 100, 5.59, 0.005);
A('marg 24', R[2] / O[2] * 100, 11.17, 0.005);
A('marg 25', R[3] / O[3] * 100, 13.27, 0.005);
A('CAGR oms', (Math.pow(O[3] / O[0], 1 / 3) - 1) * 100, 3.35, 0.005);
A('CAGR res', (Math.pow(R[3] / R[0], 1 / 3) - 1) * 100, -6.83, 0.005);
// identitet + absolut + PEG
A('identitet 2,78/0,3079', 2.78 / 0.3079, 9.03, 0.01);
A('identitet avv %', (9.03 / 12.39 - 1) * 100, -27.1, 0.1);
A('identitet 2,93/0,3079', 2.93 / 0.3079, 9.52, 0.01);
A('omvänd 12,39*0,3079', 12.39 * 0.3079, 3.815, 0.001);
A('absolut 12,39*44,3', 12.39 * T(R[3]), 548.4, 0.5);
A('absolut residual % (seriekonvention: PExres-mcap)/mcap', (12.39 * T(R[3]) - 1610.830) / 1610.830 * 100, -66.0, 0.05);
A('residualspegel FY-världen %', (1610.830 / (12.39 * T(R[3])) - 1) * 100, 193.7, 0.1);
A('implicit vinst', 1610.8 / 12.39, 130.0, 0.1);
A('implicit mot TTM %', (130.0 / 135.3 - 1) * 100, -3.9, 0.1);
A('FY-väg P/E', 1610.8 / 44.3, 36.4, 0.05);
A('PEG-konvention', 12.39 / 205.17, 0.060, 0.0005);
// EV-kedja
A('EK', 1610.8 / 2.78, 579.4, 0.1);
A('skuld', 0.04 * 579.4, 23.2, 0.1);
A('EV', 1610.8 + 23.2 - 190.0, 1444.0, 0.2);
A('EV fältväg', 8.10 * 179.0, 1449.9, 0.2);
A('EV residual %', (1444.0 / 1449.9 - 1) * 100, -0.4, 0.05);
A('kedjekvot', 1444.0 / 179.0, 8.07, 0.01);
A('källreplik 8,06', (1610.8 + 22.4 - 190.0) / 179.0, 8.06, 0.01);
// FCF + utdelning
A('FCF kronor', 0.2984 * 485.3, 144.8, 0.1);
A('FCF-yield', 144.8 / 1610.8 * 100, 8.99, 0.01);
A('direktavk %', 2264 / 252500 * 100, 0.896, 0.001);
A('nettokassa', 190.0 - 22.4, 167.6, 0.01);
A('ROIC-WACC pp', 36.86 - 12.6, 24.3, 0.05);
// scenarioruta
const sc = (o, m) => o * m;
A('cell 470,7/34,88', sc(470.7, .3488), 164.2, 0.1); A('cell 470,7/36,88', sc(470.7, .3688), 173.6, 0.1); A('cell 470,7/38,88', sc(470.7, .3888), 183.0, 0.1);
A('cell 485,3/34,88', sc(485.3, .3488), 169.2, 0.1); A('cell 485,3/36,88', sc(485.3, .3688), 179.0, 0.1); A('cell 485,3/38,88', sc(485.3, .3888), 188.7, 0.1);
A('cell 499,9/34,88', sc(499.9, .3488), 174.4, 0.1); A('cell 499,9/36,88', sc(499.9, .3688), 184.4, 0.1); A('cell 499,9/38,88', sc(499.9, .3888), 194.4, 0.1);
A('rättesats 1pp', 485.3 * .01, 4.853, 0.01);
A('rättesats 3%', 485.3 * .03, 14.6, 0.1);
A('marginalvikt', 1 / (3 * .3688), 0.90, 0.01);
A('FY-ruta mittruta', 333.6 * .3688, 123.0, 0.1);
A('skillnad TTM-FY', 179.0 - 123.0, 56, 0.5);
// multipl + trion + moat
A('multipl', 12.39 / 3.0517, 4.06, 0.01);
A('ASML PEG-konv', 50.07 / 76.7, 0.65, 0.01);
A('trion 4x', 50.07 / 12.39, 4.04, 0.01);
A('moat-avstånd pp', 57.5 - 36.21, 21.3, 0.05);
// medianlägen
A('P/E-läge %', (12.39 / 24.85 - 1) * 100, -50, 0.5);
A('P/B-läge %', (2.78 / 5.53 - 1) * 100, -50, 0.5);
A('EV-läge %', (8.10 / 24.40 - 1) * 100, -67, 0.5);
A('PEG-läge %', (0.06 / 1.19 - 1) * 100, -95, 0.6);
A('FCF 4,0x', 8.99 / 2.27, 3.96, 0.05);
A('ROIC 1,9x', 36.86 / 19.29, 1.91, 0.01);
A('FCFmarg 2,2x', 29.84 / 13.49, 2.21, 0.01);

// medianerna mot 165-filen (kodvägsreplik)
function med(v){const s=v.filter(x=>x!=null).sort((a,b)=>a-b);const n=s.length;if(!n)return null;const m=Math.floor(n/2);return n%2?s[m]:(s[m-1]+s[m])/2;}
const tek = arr.filter(b => b.bransch === 'teknik');
A('median tek P/E', med(tek.map(b=>b.vardering.pe)), 24.85, 0.01);
A('median tek P/B', med(tek.map(b=>b.vardering.pb)), 5.53, 0.01);
A('median tek EV/EBIT', med(tek.map(b=>b.vardering.evEbit)), 24.40, 0.01);
A('median tek PEG', med(tek.map(b=>b.vardering.peg)), 1.19, 0.01);
A('median tek FCFy %', med(tek.map(b=>b.vardering.fcfYield))*100, 2.27, 0.01);
A('median tek ROE %', med(tek.map(b=>b.lonksamhet.roe))*100, 26.44, 0.01);
A('median tek ROIC %', med(tek.map(b=>b.lonksamhet.roic))*100, 19.29, 0.01);
A('median tek brutto %', med(tek.map(b=>b.lonksamhet.bruttoMarginal))*100, 54.72, 0.01);
A('median tek EBIT %', med(tek.map(b=>b.lonksamhet.ebitMarginal))*100, 24.67, 0.01);
A('median tek netto %', med(tek.map(b=>b.lonksamhet.nettoMarginal))*100, 20.33, 0.01);
A('median tek FCFm %', med(tek.map(b=>b.lonksamhet.fcfMarginal))*100, 13.49, 0.01);
A('median tek skuldEK', med(tek.map(b=>b.stabilitet.skuldEgenkapital)), 0.20, 0.01);
A('median tek resCAGR %', med(tek.map(b=>b.tillvaxt.resultatCAGR5ar))*100, 19.57, 0.01);
A('median uni P/E', med(arr.map(b=>b.vardering.pe)), 20.45, 0.01);
A('median uni P/B', med(arr.map(b=>b.vardering.pb)), 2.81, 0.01);
A('median uni ROE %', med(arr.map(b=>b.lonksamhet.roe))*100, 15.54, 0.01);
A('median uni ROIC %', med(arr.map(b=>b.lonksamhet.roic))*100, 13.71, 0.01);
A('median uni brutto %', med(arr.map(b=>b.lonksamhet.bruttoMarginal))*100, 47.70, 0.01);
A('median uni EBIT %', med(arr.map(b=>b.lonksamhet.ebitMarginal))*100, 20.59, 0.01);
A('median uni netto %', med(arr.map(b=>b.lonksamhet.nettoMarginal))*100, 13.66, 0.01);
A('median uni FCFm %', med(arr.map(b=>b.lonksamhet.fcfMarginal))*100, 12.51, 0.01);
A('median uni FCFy %', med(arr.map(b=>b.vardering.fcfYield))*100, 3.75, 0.01);
A('median uni skuldEK', med(arr.map(b=>b.stabilitet.skuldEgenkapital)), 0.51, 0.01);
A('median uni resCAGR %', med(arr.map(b=>b.tillvaxt.resultatCAGR5ar))*100, 3.48, 0.01);
// n-storlekar i tabellen
const ntek = b => tek.filter(x => b(x) != null).length;
A('n tek P/E', ntek(b=>b.vardering.pe), 20, 0);
A('n tek P/B', ntek(b=>b.vardering.pb), 20, 0);
A('n tek EV/EBIT', ntek(b=>b.vardering.evEbit), 20, 0);
A('n tek PEG', ntek(b=>b.vardering.peg), 16, 0);
A('n tek FCFy', ntek(b=>b.vardering.fcfYield), 19, 0);
A('n tek ROIC', ntek(b=>b.lonksamhet.roic), 19, 0);
A('n tek FCFm', ntek(b=>b.lonksamhet.fcfMarginal), 19, 0);
A('n tek resCAGR', ntek(b=>b.tillvaxt.resultatCAGR5ar), 17, 0);
A('n uni P/E', arr.filter(b=>b.vardering.pe!=null).length, 156, 0);
A('n uni P/B', arr.filter(b=>b.vardering.pb!=null).length, 162, 0);
A('n uni ROE', arr.filter(b=>b.lonksamhet.roe!=null).length, 161, 0);
A('n uni ROIC', arr.filter(b=>b.lonksamhet.roic!=null).length, 146, 0);
A('n uni brutto', arr.filter(b=>b.lonksamhet.bruttoMarginal!=null).length, 163, 0);
A('n uni EBIT', arr.filter(b=>b.lonksamhet.ebitMarginal!=null).length, 164, 0);
A('n uni netto', arr.filter(b=>b.lonksamhet.nettoMarginal!=null).length, 165, 0);
A('n uni FCFm', arr.filter(b=>b.lonksamhet.fcfMarginal!=null).length, 153, 0);
A('n uni FCFy', arr.filter(b=>b.vardering.fcfYield!=null).length, 149, 0);
A('n uni skuldEK', arr.filter(b=>b.stabilitet.skuldEgenkapital!=null).length, 150, 0);
A('n uni resCAGR', arr.filter(b=>b.tillvaxt.resultatCAGR5ar!=null).length, 127, 0);
A('n uni PEG', arr.filter(b=>b.vardering.peg!=null).length, 138, 0);
A('n uni EV/EBIT', arr.filter(b=>b.vardering.evEbit!=null).length, 157, 0);

// triontal mot filen
const tsm = arr.find(b => b.ticker === 'TSM'), asml = arr.find(b => b.ticker === 'ASML.AS');
A('ASML P/E', asml.vardering.pe, 50.07, 0.01); A('TSMC P/E', tsm.vardering.pe, 27.83, 0.01);
A('ASML EV/EBIT', asml.vardering.evEbit, 41.08, 0.01); A('TSMC EV/EBIT', tsm.vardering.evEbit, 23.81, 0.01);
A('ASML brutto %', asml.lonksamhet.bruttoMarginal*100, 52.7, 0.05); A('TSMC brutto %', tsm.lonksamhet.bruttoMarginal*100, 64.2, 0.05);
A('ASML EBIT %', asml.lonksamhet.ebitMarginal*100, 35.4, 0.05); A('TSMC EBIT %', tsm.lonksamhet.ebitMarginal*100, 56.1, 0.05);
A('ASML ROIC %', asml.lonksamhet.roic*100, 66.0, 0.05); A('TSMC ROIC %', tsm.lonksamhet.roic*100, 54.0, 0.05);
A('ASML resCAGR %', asml.tillvaxt.resultatCAGR5ar*100, 19.55, 0.01); A('TSMC resCAGR %', tsm.tillvaxt.resultatCAGR5ar*100, 19.57, 0.01);
A('ASML prognos %', asml.tillvaxt.prognosTillvaxt*100, 76.7, 0.05); A('TSMC prognos %', tsm.tillvaxt.prognosTillvaxt*100, 45.5, 0.05);
A('ASML skuldEK', asml.stabilitet.skuldEgenkapital, 0.09, 0.005); A('TSMC skuldEK', tsm.stabilitet.skuldEgenkapital, 0.17, 0.005);

console.log('\nKVD: ' + pass + ' PASS, ' + fel + ' FEL, ' + varning + ' VARNING — ord ' + ord + ', länkar ' + unika.length + ' unika (alla kontrollerade mot localhost)');
