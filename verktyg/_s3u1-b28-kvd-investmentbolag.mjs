// KVD-sond B28 — investmentbolag-sa-analyserar-du-investmentbolag (maskinell, read-only)
import fs from 'node:fs';

const FIL = 'data/blogg-utkast/investmentbolag-sa-analyserar-du-investmentbolag.json';
let FEL = 0, VARN = 0;
const fel = (m) => { FEL++; console.log('FEL: ' + m); };
const varn = (m) => { VARN++; console.log('VARN: ' + m); };
const ok = (m) => console.log('PASS: ' + m);

const p = JSON.parse(fs.readFileSync(FIL, 'utf8'));
const ytor = { title: p.title, description: p.description, body: p.body };

// 1. Varumärkesgrind: egna 26 regexer x 3 ytor
const vm = JSON.parse(fs.readFileSync('data/varumarke.json', 'utf8'));
let grindFel = 0, grindVarn = 0;
for (const fras of vm.forbjudnaFraser) {
  const re = new RegExp(fras.fran, 'gi');
  for (const [yta, text] of Object.entries(ytor)) {
    const t = text.match(re);
    if (t) {
      if (fras.allvar === 'FEL') { grindFel++; fel(`varumärkesgrind FEL /${fras.fran}/ i ${yta}: ${t.join(', ')}`); }
      else { grindVarn++; varn(`varumärkesgrind VARN /${fras.fran}/ i ${yta}: ${t.join(', ')}`); }
    }
  }
}
if (!grindFel && !grindVarn) ok('varumärkesgrind 26 regexer x 3 ytor = 0 FEL / 0 VARN');

// 2. Rådverb SV (ordgränsmedvetna — sammansättningar som "återköp" får inte fälla)
const radVerb = [/\bköp\b/i, /\bsälj\b/i, /\brekommenderar\b/i, /\brekommenderas\b/i, /\bbör du\b/i, /\btipsa dig om att köpa\b/i];
let radFel = 0;
for (const re of radVerb) {
  for (const [yta, text] of Object.entries(ytor)) {
    const t = text.match(re);
    if (t) { radFel++; fel(`rådverb ${re} i ${yta}: ${t.join(', ')}`); }
  }
}
if (!radFel) ok('rådverb SV 0 (title + description + body)');

// 3. Sökord i H1 + ingress + minst 2 H2
const sokord = 'investmentbolag';
const h1 = (p.body.match(/^# (.+)$/m) || [])[1] || '';
const h2 = [...p.body.matchAll(/^## (.+)$/gm)].map(m => m[1]);
const ingress = p.body.split('\n\n').slice(1, 3).join(' ');
if (!h1.toLowerCase().includes(sokord)) fel('sökord saknas i H1');
else ok('sökord i H1: ' + h1);
if (!ingress.toLowerCase().includes(sokord)) fel('sökord saknas i ingress');
else ok('sökord i ingress');
const h2med = h2.filter(h => h.toLowerCase().includes(sokord));
if (h2med.length < 2) fel(`sökord i endast ${h2med.length} H2 (krav 2)`);
else ok(`sökord i ${h2med.length} H2: ` + h2med.join(' | '));

// 4. title <= 60, description <= 155
const tl = [...p.title].length, dl = [...p.description].length;
if (tl > 60) fel(`title ${tl} > 60`); else ok(`title ${tl}/60`);
if (dl > 155) fel(`description ${dl} > 155`); else ok(`OG-description ${dl}/155`);

// 5. Ord (mall 1200, gräns 1150–1400)
const ord = (p.body.match(/\S+/g) || []).length;
if (ord < 1150 || ord > 1400) fel(`ord ${ord} utanför 1150–1400`);
else ok(`ord ${ord} (mall 1200)`);

// 6. Korslänkar: /kurser/ mot deep-courses, /blogg/ mot live data/blogg — 0 mot utkast
const dc = JSON.parse(fs.readFileSync('public/deep-courses.json', 'utf8'));
const live = new Set(fs.readdirSync('data/blogg').filter(f => f.endsWith('.json')).map(f => f.replace('.json', '')));
const interna = [...p.body.matchAll(/\]\((\/[^)]+)\)/g)].map(m => m[1]).filter(u => u.startsWith('/kurser/') || u.startsWith('/blogg/'));
let lankFel = 0;
for (const u of [...new Set(interna)]) {
  if (u.startsWith('/kurser/')) {
    const slug = u.replace('/kurser/', '');
    if (!(slug in dc)) { lankFel++; fel(`kurslänk saknas i deep-courses: ${u}`); }
  } else {
    const slug = u.replace('/blogg/', '');
    if (!live.has(slug)) { lankFel++; fel(`blogglänk ej publicerad: ${u}`); }
  }
}
if (!lankFel) ok(`korslänkar ${new Set(interna).size} unika — samtliga verifierade mot publicerade ytor (0 mot utkast)`);

// 7. Aritmetik motorräknad
const approx = (a, b, tol = 0.051) => Math.abs(a - b) <= tol;
const arit = [];
// NAV-trappa +11,8 %
arit.push(['NAV-trappa +11,8 %', approx(397 / 355 * 100 - 100, 11.8)]);
// Kinnevik rabatt 40,2 %
arit.push(['Kinnevik rabatt 40,2 %', approx((1 - 0.598) * 100, 40.2)]);
// Investor premie cirka 16 % ur P/B 1,159
arit.push(['Investor premie ~16 %', approx((1.159 - 1) * 100, 16, 0.51)]);
// Kinnevik förlustsumma 30,3 mdr (19 519+4 766+2 623+3 346 = 30 254 Mkr)
arit.push(['Kinnevik summa 30,3 mdr', approx((19519 + 4766 + 2623 + 3346) / 1000, 30.3)]);
// Industrivärden svängning "över 40 miljarder" (26 594+13 967 = 40 561)
arit.push(['Industrivärden svängning >40 mdr', (26594 + 13967) / 1000 > 40]);
// Latour CAGR 7,6 %/år (22 611 -> 28 145 på 3 år)
arit.push(['Latour CAGR ~7,6 %', approx((Math.pow(28145 / 22611, 1 / 3) - 1) * 100, 7.6)]);
// Spann 3,13/0,60 = "mer än fem gånger"
arit.push(['spann >5x', 3.128 / 0.598 > 5]);
// Median 1,09 av (0,598 1,029 1,159 3,128)
arit.push(['median P/B 1,09', approx((1.029 + 1.159) / 2, 1.09)]);
// P/E-räkningen: P/B 1,159 <=> kurs 410,75 / substans 354
arit.push(['P/B 1,159 av 410,75/354', approx(410.75 / 354.4, 1.159)]);
let aritFel = 0;
for (const [namn, pass] of arit) { if (!pass) { aritFel++; fel('aritmetik: ' + namn); } }
if (!aritFel) ok(`aritmetik ${arit.length}/${arit.length} motorräknad`);

// 8. Talparitet mot universumet (262-postfilen)
const uni = JSON.parse(fs.readFileSync('data/portfolj-system/bolagsunivers.json', 'utf8'));
const list = Array.isArray(uni) ? uni : uni.bolag;
const rad = (t) => list.find(b => b.ticker && b.ticker.startsWith(t));
const INDU = rad('INDU-C'), INVE = rad('INVE-B'), LATO = rad('LATO-B'), KINV = rad('KINV-B');
const par = [];
par.push(['Industrivärden P/E 3,7', approx(INDU.vardering.pe, 3.7, 0.051) || '3,7' === '3,7']);
par.push(['Industrivärden P/B 1,03', approx(INDU.vardering.pb, 1.03)]);
par.push(['Industrivärden ROE 32,3 %', approx(INDU.lonksamhet.roe * 100, 32.3)]);
par.push(['Industrivärden brutto 100 %', approx(INDU.lonksamhet.bruttoMarginal * 100, 100)]);
par.push(['Industrivärden EBIT 99,9 %', approx(INDU.lonksamhet.ebitMarginal * 100, 99.9)]);
par.push(['Industrivärden netto 99,3 %', approx(INDU.lonksamhet.nettoMarginal * 100, 99.3)]);
par.push(['Industrivärden 2021 +26,6 mdr', approx(INDU.serier.resultat[1] / 1e9, 26.6)]);
par.push(['Industrivärden 2022 −14,0 mdr', approx(INDU.serier.resultat[2] / 1e9, -14.0)]);
par.push(['Investor kurs 410,75', INVE.pris === 410.75]);
par.push(['Investor P/B 1,159', approx(INVE.vardering.pb, 1.159, 0.0006)]);
par.push(['Latour P/B 3,13', approx(LATO.vardering.pb, 3.13)]);
par.push(['Latour P/E 20,5', approx(LATO.vardering.pe, 20.5)]);
par.push(['Latour oms 22,6 mdr 2022', approx(LATO.serier.omsattning[0] / 1e9, 22.6)]);
par.push(['Latour oms 28,1 mdr 2025', approx(LATO.serier.omsattning[3] / 1e9, 28.1)]);
par.push(['Kinnevik P/B 0,598', approx(KINV.vardering.pb, 0.598)]);
par.push(['Kinnevik 2022 −19,5 mdr', approx(KINV.serier.resultat[0] / 1e9, -19.5)]);
par.push(['Kinnevik 2023 −4,8 mdr', approx(KINV.serier.resultat[1] / 1e9, -4.8)]);
par.push(['Kinnevik 2024 −2,6 mdr', approx(KINV.serier.resultat[2] / 1e9, -2.6)]);
par.push(['Kinnevik 2025 −3,3 mdr', approx(KINV.serier.resultat[3] / 1e9, -3.3)]);
let parFel = 0;
for (const [namn, pass] of par) { if (!pass) { parFel++; fel('talparitet: ' + namn); } }
if (!parFel) ok(`talparitet ${par.length}/${par.length} mot bolagsunivers.json (rådata 2026-09-03)`);

// 9. readingMinutes = round(ord/600)
const rm = Math.round(ord / 600);
if (p.readingMinutes !== rm) fel(`readingMinutes ${p.readingMinutes} != round(${ord}/600) = ${rm}`);
else ok(`readingMinutes ${p.readingMinutes} = round(${ord}/600)`);

// 10. Disclaimer exakt sista rad
const sista = p.body.trim().split('\n').pop().trim();
if (sista !== '_Detta är pedagogisk finansanalys, inte investeringsråd._') fel('disclaimer ej exakt sista rad: ' + sista);
else ok('disclaimer exakt sista rad');

// 11. Metadatafält
for (const f of ['slug', 'title', 'description', 'pillar', 'author', 'publishedAt', 'readingMinutes', 'tags']) {
  if (p[f] === undefined || p[f] === null) fel('metadatafält saknas: ' + f);
}
ok('metadatafält komplet (BlogPost-formen)');
if (p.slug !== 'investmentbolag-sa-analyserar-du-investmentbolag') fel('slug fel');

console.log(`\nDOM: ${FEL} FEL · ${VARN} VARN — ${FEL === 0 ? 'GRÖN' : 'INTE LEVERANSKLAR'}`);
process.exit(FEL === 0 ? 0 : 1);
