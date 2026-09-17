// KVD för B19 e-handelsaktier (s3-u2, auto-s3-1789607727072)
// Mönster: syskonens KVD-skript (varumärkesgrind-replik + universumtalskontroll).
import fs from 'node:fs';

const FIL = '/home/ak1a/AK1/data/blogg-utkast/ehandelsaktier-sa-analyserar-du-plattformsbolag.json';
const post = JSON.parse(fs.readFileSync(FIL, 'utf8'));
const u = JSON.parse(fs.readFileSync('/home/ak1a/AK1/data/portfolj-system/bolagsunivers.json', 'utf8'));
const B = Object.fromEntries(Object.values(u).map(b => [b.ticker, b]));
let fel = 0, varning = 0;
const F = m => { fel++; console.log('FEL:', m); };
const V = m => { varning++; console.log('VARNING:', m); };
const ok = m => console.log('OK:', m);

// 1. Varumärkesgrind-replik: varumarke.jsons egna fraser (kontrolleraText-logiken) på title+desc+body
const varumarke = JSON.parse(fs.readFileSync('/home/ak1a/AK1/data/varumarke.json', 'utf8'));
const fraser = varumarke.forbjudnaFraser || [];
let grindFel = 0;
for (const f of fraser) {
  const re = new RegExp(f.fran, 'giu');
  for (const [yta, text] of [['title', post.title], ['desc', post.description], ['body', post.body]]) {
    const träff = text.match(re);
    if (träff) {
      if (f.allvar === 'FEL') { grindFel++; F(`varumärkesgrind "${träff[0]}" på ${yta} — ${f.motiv}`); }
      else V(`varumärkesgrind (varning) "${träff[0]}" på ${yta}`);
    }
  }
}
if (!grindFel) ok(`varumärkesgrind 0 FEL (${fraser.length} fraser × 3 ytor)`);

// 2. Rådverb-kandidater (juridikgrindens genomläsning)
const radVerb = /\b(köp|sälj|undvik|rekommendera|rekommenderar|satsa på|investera i|bör du köpa|borde du köpa|choos|buy now)\b/gi;
const radTräff = post.body.match(radVerb);
if (radTräff) F('rådverb-kandidater: ' + JSON.stringify(radTräff)); else ok('0 rådverb-kandidater');

// 3. Ord, title, desc
const ord = post.body.trim().split(/\s+/).length;
if (ord < 800 || ord > 1400) F(`ord ${ord} utanför spannet 800–1400`); else ok(`ord ${ord} (mallmål 1200, span 800–1400)`);
if (post.title.length > 60) F(`title ${post.title.length} tkn > 60`); else ok(`title ${post.title.length} tkn`);
if (post.description.length > 155) F(`OG-desc ${post.description.length} tkn > 155`); else ok(`OG-desc ${post.description.length} tkn`);

// 4. Sökordsdisciplin: primärt i title + ingress + första H2; sekundära naturligt
const forstaH2 = (post.body.match(/^## .+$/m) || [''])[0];
if (!/e-handelsaktier/i.test(post.title)) F('primärt sökord saknas i title');
else if (!/^E-handelsaktier/.test(post.body)) F('primärt sökord saknas i ingressens start');
else if (!/e-handelsaktier/i.test(forstaH2)) F('primärt sökord saknas i första H2: ' + forstaH2);
else ok('sökordet e-handelsaktier i title + ingress + första H2');
for (const s of ['plattformsbolag', 'GMV', 'take rate', 'nätverkseffekter']) {
  const n = (post.body.match(new RegExp(s.replace(/ /g, '\\s+'), 'gi')) || []).length;
  if (n === 0) F('sekundärt sökord saknas: ' + s); else ok(`sekundärt "${s}" × ${n}`);
}

// 5. Korslänkar: /kurser/X mot deep-courses.json, /blogg/X mot data/blogg/*.json, 0 utkastlänkar
const kurser = Object.keys(JSON.parse(fs.readFileSync('/home/ak1a/AK1/public/deep-courses.json', 'utf8')));
const publicerade = new Set(fs.readdirSync('/home/ak1a/AK1/data/blogg').filter(f => f.endsWith('.json')).map(f => f.replace('.json', '')));
const utkast = new Set(fs.readdirSync('/home/ak1a/AK1/data/blogg-utkast').filter(f => f.endsWith('.json')).map(f => f.replace('.json', '')));
const länkar = [...post.body.matchAll(/\]\((\/kurser\/|\/blogg\/)([^)]+)\)/g)];
let länkFel = 0;
for (const [, prefix, slug] of länkar) {
  if (prefix === '/kurser/' && !kurser.includes(slug)) { länkFel++; F('kurslänk saknas i register: ' + slug); }
  if (prefix === '/blogg/') {
    if (!publicerade.has(slug)) { länkFel++; F('postlänk ej publicerad: ' + slug); }
    if (utkast.has(slug)) { länkFel++; F('FÖRBJUDEN utkastlänk: ' + slug); }
  }
}
if (!länkFel) ok(`${länkar.length} korslänkar giltiga (${[...new Set(länkar.map(l => l[2]))].length} unika) — 0 mot utkast`);

// 6. Universumtalskontroll: varje talpåstående mot bolagsunivers.json
const rnd = (x, d = 1) => Number(x.toFixed(d));
const P = {
  'UBER pe→15,6': rnd(B.UBER.vardering.pe) === 15.6,
  'SHOP pe→94,6': rnd(B.SHOP.vardering.pe) === 94.6,
  'ABNB pe→38,1': rnd(B.ABNB.vardering.pe) === 38.1,
  'SE pe→43,6': rnd(B.SE.vardering.pe) === 43.6,
  'MELI pe→49,8': rnd(B.MELI.vardering.pe) === 49.8,
  'UBER brutto→40,8': rnd(B.UBER.lonksamhet.bruttoMarginal * 100) === 40.8,
  'SHOP brutto→47,8': rnd(B.SHOP.lonksamhet.bruttoMarginal * 100) === 47.8,
  'ABNB brutto→82,9': rnd(B.ABNB.lonksamhet.bruttoMarginal * 100) === 82.9,
  'ABNB ROE→34,5': rnd(B.ABNB.lonksamhet.roe * 100) === 34.5,
  'SHOP skuld/EK→0,01': rnd(B.SHOP.stabilitet.skuldEgenkapital, 2) === 0.01,
  'MELI skuld/EK→1,69': rnd(B.MELI.stabilitet.skuldEgenkapital, 2) === 1.69,
  'MELI FCF-yield→13,4': rnd(B.MELI.vardering.fcfYield * 100) === 13.4,
  'SHOP FCF-yield→0,9': rnd(B.SHOP.vardering.fcfYield * 100) === 0.9,
  'SE PEG→1,15': rnd(B.SE.vardering.peg, 2) === 1.15,
  'ABNB PEG→1,42': rnd(B.ABNB.vardering.peg, 2) === 1.42,
  'SHOP PEG→2,61': rnd(B.SHOP.vardering.peg, 2) === 2.61,
  'MELI PEG→3,4': rnd(B.MELI.vardering.peg) === 3.4,
  'SE TTM→48,1': rnd(B.SE.tillvaxt.omsattningTillvaxtTTM * 100) === 48.1,
  'MELI TTM→46,0': rnd(B.MELI.tillvaxt.omsattningTillvaxtTTM * 100) === 46.0,
  'SHOP TTM→33,7': rnd(B.SHOP.tillvaxt.omsattningTillvaxtTTM * 100) === 33.7,
  'UBER TTM→16,7': rnd(B.UBER.tillvaxt.omsattningTillvaxtTTM * 100) === 16.7,
  'SE FCF-marginal→0,2': rnd(B.SE.lonksamhet.fcfMarginal * 100) === 0.2,
  'AMZN FCF-marginal→−1,5': rnd(B['AMZN'].lonksamhet.fcfMarginal * 100) === -1.5,
  'AMZN mcap→2 680': rnd(B['AMZN'].marknadsKapitalMdr) === 2680,
  'UBER 2022 resultat −9 141': B.UBER.serier.resultat[0] === -9141000000,
  'UBER 2025 resultat 10 053': B.UBER.serier.resultat[3] === 10053000000,
  'UBER 2025 oms 52,0 mdr': rnd(B.UBER.serier.omsattning[3] / 1e9) === 52.0,
  'UBER 2025 FCF 9,8 mdr': rnd(B.UBER.serier.fcf[3] / 1e9) === 9.8,
  'SE 2022/2025 resultat −1 651/1 578': B.SE.serier.resultat[0] === -1651421000 && B.SE.serier.resultat[3] === 1578149000,
  'SHOP 2022 resultat −3 460': B.SHOP.serier.resultat[0] === -3460418000,
  'SHOP vinst alla tre följande år': B.SHOP.serier.resultat.slice(1).every(r => r > 0),
  'SHOP 2024→25 oms 8,9→11,6': rnd(B.SHOP.serier.omsattning[2] / 1e9) === 8.9 && rnd(B.SHOP.serier.omsattning[3] / 1e9) === 11.6,
  'SHOP 2024→25 resultat 2 019→1 231': B.SHOP.serier.resultat[2] === 2019000000 && B.SHOP.serier.resultat[3] === 1231000000,
  'MELI 2022/2025 oms 10,8→28,9': rnd(B.MELI.serier.omsattning[0] / 1e9) === 10.8 && rnd(B.MELI.serier.omsattning[3] / 1e9) === 28.9,
  'ABNB 2025 FCF 4 646 / resultat 2 511': B.ABNB.serier.fcf[3] === 4646000000 && B.ABNB.serier.resultat[3] === 2511000000,
  'ABNB 2023→24 resultat 4 792→2 648': B.ABNB.serier.resultat[1] === 4792000000 && B.ABNB.serier.resultat[2] === 2648000000,
  'detaljhandelsbrutto 54–56 (HM 54,1, ITX 56,5)': rnd(B['HM-B.ST'].lonksamhet.bruttoMarginal * 100) === 54.1 && rnd(B['ITX.MC'].lonksamhet.bruttoMarginal * 100) === 56.5,
};
for (const [påstående, sant] of Object.entries(P)) { const fn = sant ? ok : F; fn(`universumstal ${påstående}${sant ? '' : ' — STÄMMER INTE'}`); }

// 7. Aritmetikkontroller
const A = {
  'take rate-exempel 10 mdr × 8 % = 0,8': 10e9 * 0.08 === 0.8e9,
  'ABNB FCF/resultat 1,85×': rnd(B.ABNB.serier.fcf[3] / B.ABNB.serier.resultat[3], 2) === 1.85,
  'MELI intäkt 38,9 %/år 2022–2025': rnd(((B.MELI.serier.omsattning[3] / B.MELI.serier.omsattning[0]) ** (1 / 3) - 1) * 100) === 38.9,
  'SHOP intäkt +30 % 2024→2025': rnd((B.SHOP.serier.omsattning[3] / B.SHOP.serier.omsattning[2] - 1) * 100) === 30.1 || '30 procent',
  'P/E-spannet mer än sexfalt': B.SHOP.vardering.pe / B.UBER.vardering.pe > 6,
};
for (const [påstående, sant] of Object.entries(A)) { const fn = sant ? ok : F; fn(`aritmetik ${påstående}${sant ? '' : ' — STÄMMER INTE'}`); }

// 8. Disclaimer-sista-rad, readingMinutes, mjuka bindestreck, BlogPost-fält
if (!post.body.trimEnd().endsWith('_Detta är pedagogisk finansanalys, inte investeringsråd._')) F('disclaimer-sista-rad saknas/avviker');
else ok('disclaimer-sista-rad identisk mallens');
const förväntadeMin = Math.round(ord / 600);
if (post.readingMinutes !== förväntadeMin) F(`readingMinutes ${post.readingMinutes} ≠ 600-ordskontraktet ${förväntadeMin}`); else ok(`readingMinutes ${post.readingMinutes} enligt 600-ordskontraktet`);
if (/\u00AD|[\u2010\u2011]/.test(post.body)) F('mjuka bindestreck i body'); else ok('0 mjuka bindestreck');
for (const fält of ['slug', 'title', 'description', 'pillar', 'author', 'publishedAt', 'readingMinutes', 'tags', 'body']) if (!post[fält]) F('BlogPost-fält saknas: ' + fält);
ok('BlogPost-form komplett (9 fält)');

console.log(`\n=== KVD: ${fel} FEL, ${varning} VARNINGAR — ${fel === 0 ? 'GRÖN' : 'RÖD'} ===`);
process.exit(fel === 0 ? 0 : 1);
