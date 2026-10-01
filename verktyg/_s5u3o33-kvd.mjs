#!/usr/bin/env node
// _s5u3o33-kvd.mjs — KVD för s5-u3 o33: tre kurser (kt-12, mt-10, bk-10).
// Kontroller: struktur (18 fält + chapters_list-paritet + blockkonvention),
// aritmetik (oberoende omräkning av kursens ekvationer), språkgrind
// (CJK/kyrilliska/grekiska, dubbelord, dubbla mellanslag, kända felord),
// juridikgrind (rådsfraser, R2-pristal), sondbelägg (kärntermer ägs av nya
// kurserna), korslänkar (registeräkta med diskbackade undantag för o31:s
// väntade återföring), round-trip (kursfil == registerpost).
import { readFileSync, existsSync } from 'node:fs';

const ROTT = '/home/ak1a/AK1';
const reg = JSON.parse(readFileSync(`${ROTT}/public/deep-courses.json`, 'utf8'));
const slugs = Object.keys(reg);
const nya = {};
for (const slug of ['kt-12-vd-bytet', 'mt-10-erfarenhetskurvan', 'bk-10-verkligt-varde-hierarkin']) {
  nya[slug] = JSON.parse(readFileSync(`${ROTT}/data/kurser-tillagg/${slug}.json`, 'utf8'));
}
let pass = 0, fel = 0, varn = 0;
const P = (ok, namn, detalj) => { if (ok) { pass++; } else { fel++; console.log(`  FEL: ${namn} — ${detalj}`); } };
const W = (ok, namn, detalj) => { if (ok) { pass++; } else { varn++; console.log(`  VARN: ${namn} — ${detalj}`); } };
const approx = (faktisk, väntad, tolerans = 0.006) => Math.abs(faktisk - väntad) <= tolerans;

// ── 1. STRUKTUR ─────────────────────────────────────────────────────────────
console.log('== STRUKTUR ==');
const falt = ['slug','category','weight','chapterCount','totalMinutes','title','summary','minutes','xp','level','why','learn','history','chapters_list','lynchSection','grahamSection','ak1Section','chapters'];
const kat = { 'kt-12-vd-bytet': 'KATALYSATOR', 'mt-10-erfarenhetskurvan': 'MOAT', 'bk-10-verkligt-varde-hierarkin': 'BOKFÖRING & ÅRSREDOVISNING' };
for (const [slug, k] of Object.entries(nya)) {
  P(JSON.stringify(Object.keys(k)) === JSON.stringify(falt), `${slug} fält`, Object.keys(k).join(','));
  P(k.chapterCount === 6 && k.chapters.length === 6 && k.chapters_list.length === 6, `${slug} kapitelantal`, `${k.chapters?.length}/${k.chapters_list?.length}`);
  const sumMin = k.chapters.reduce((a, c) => a + c.minutes, 0);
  P(sumMin === k.totalMinutes && k.totalMinutes === 24, `${slug} minuter`, `summa ${sumMin} mot ${k.totalMinutes}`);
  P(k.chapters.every((c, i) => c.num === i + 1 && c.title === k.chapters_list[i].title && c.minutes === k.chapters_list[i].minutes), `${slug} chapters_list-paritet`, 'title/minutes/num');
  P(k.chapters[0].blocks.some(b => b.type === 'definition'), `${slug} kap1-definition`, 'saknas');
  P(k.chapters[5].blocks.some(b => b.type === 'utmaning'), `${slug} kap6-utmaning`, 'saknas');
  P(k.chapters.slice(1, 5).every(c => c.blocks.some(b => b.type === 'tabell')), `${slug} kap2-5-tabell`, 'saknas');
  P(k.weight === '—' && k.xp === 50 && k.minutes === 24, `${slug} vikt/xp/minutes`, `${k.weight}/${k.xp}/${k.minutes}`);
  P(k.level === 'Intermediär', `${slug} nivå`, k.level);
  P(k.category === kat[slug], `${slug} kategori`, k.category);
  P(typeof k.history === 'object' && ['origin','evolution','modern'].every(f => typeof k.history[f] === 'string' && k.history[f].length > 100), `${slug} history-block`, 'ofullständigt');
  P(k.chapters.every(c => c.blocks.every(b => Object.keys(b).length === 2 && b.type && typeof b.content === 'string' && b.content.length > 50)), `${slug} blockfält`, 'okonventionella block');
}

// ── 2. ARITMETIK (oberoende omräkning) ─────────────────────────────────────
console.log('== ARITMETIK ==');
const ekv = [
  // kt-12: reaktionstrappan
  ['kt12 steg1', 84.00 * 0.939, 78.88], ['kt12 steg2', 78.88 * 1.042, 82.19],
  ['kt12 steg3', 82.19 * 1.004, 82.52], ['kt12 steg4', 82.52 * 0.902, 74.43],
  ['kt12 total', 74.43 / 84.00, 0.886], ['kt12 kök klipp', 5.40 / 6.20, 0.871],
  ['kt12 blödning', 6.20 * 0.97 ** 4, 5.49], ['kt12 diff', 5.49 - 5.40, 0.09],
  ['kt12 bas ny', 5.40 * 13.5, 72.90], ['kt12 bas gammal', 6.20 * 13.5, 83.70],
  ['kt12 premie', 74.43 / 72.90, 1.021], ['kt12 pe', 84.00 / 6.20, 13.548],
  // kt-12 utmaning
  ['kt12 u1a', 156.00 * 0.955, 148.98], ['kt12 u1b', 148.98 * 1.028, 153.15],
  ['kt12 u1c', 153.2 / 156.0, 0.982], ['kt12 u2a', 8.40 * 0.97 ** 4, 7.44],
  ['kt12 u2b', 7.44 - 7.10, 0.34], ['kt12 u2c', 7.10 * 11.0, 78.1],
  // mt-10: fördubblingarna
  ['mt10 d1', 1000 * 0.85, 850.00], ['mt10 d2', 850 * 0.85, 722.50],
  ['mt10 d3', 722.50 * 0.85, 614.13], ['mt10 d4', 614.13 * 0.85, 522.01],
  ['mt10 total', 0.85 ** 4, 0.522], ['mt10 marginal', 0.522 * 100, 52.2],
  ['mt10 tb', 640 - 522.01, 117.99], ['mt10 tbproc', 117.99 / 640, 0.184],
  ['mt10 utm1', 940 * 0.85, 799.00], ['mt10 utm2', 799 * 0.85, 679.15],
  ['mt10 utm3', 679.15 * 0.85, 577.28], ['mt10 utm4', 577.28 * 0.85, 490.69],
  ['mt10 år', Math.log(16) / Math.log(1.08), 36.03],
  ['mt10 glömm1', 0.88 ** 5, 0.528], ['mt10 glömm2', 0.94 ** 5, 0.734],
  ['mt10 glömmdiff', 73.4 - 52.8, 20.6],
  // mt-10 utmaning
  ['mt10 u1a', 2400 * 0.85, 2040], ['mt10 u1b', 2040 * 0.85, 1734],
  ['mt10 u1c', 1734 * 0.85, 1473.9], ['mt10 u1d', 1473.9 / 2400, 0.614],
  ['mt10 u2a', 820 * 0.85, 697.00], ['mt10 u2b', 697 * 0.85, 592.45],
  ['mt10 u3a', 0.85 ** 5, 0.444], ['mt10 u3b', 0.93 ** 5, 0.696], ['mt10 u3c', 69.6 - 44.4, 25.2],
  // bk-10: portföljen, rullningen, överföringen
  ['bk10 summa', 610 + 290 + 100, 1000], ['bk10 kvot', 100 / 380, 0.263],
  ['bk10 andel', 100 / 1000, 0.10],
  ['bk10 roll', 92 + 18 - 6 - 4, 100], ['bk10 split', 1.0 / 4.0, 0.25],
  ['bk10 överf', 46.0 - 40.0, 6.0],
  // bk-10 utmaning
  ['bk10 u1a', 50 / 200, 0.25], ['bk10 u1b', 50 / 800, 0.0625],
  ['bk10 u2a', 60 + 12 - 4 - 8, 60], ['bk10 u2b', 3.0 / 8.0, 0.375],
  ['bk10 u3a', 29.5 - 25.0, 4.5],
];
for (const [namn, a, b] of ekv) P(approx(a, b), `aritmetik ${namn}`, `${a} ≠ ${b}`);

// text-talmarkörer (de tal texten UTTRYCKLIGT skriver måste finnas med)
console.log('== TEXTTALMARKÖRER ==');
const markorer = {
  'kt-12-vd-bytet': ['78,88', '82,19', '82,52', '74,43', '0,886', '5,40', '5,49', '72,90', '83,70', '2,1', '12,9'],
  'mt-10-erfarenhetskurvan': ['850,00', '722,50', '614,13', '522,01', '47,8', '117,99', '18,4', '799,00', '679,15', '577,28', '490,69', '36', '52,8', '73,4', '20,6'],
  'bk-10-verkligt-varde-hierarkin': ['610', '290', '100', '1 000', '26,3', '92,0', '18,0', '6,0', '4,0', '100,0', '25 procent', '40,0', '46,0', '6,0'],
};
for (const [slug, tal] of Object.entries(markorer)) {
  const txt = JSON.stringify(nya[slug]);
  for (const t of tal) P(txt.includes(t), `${slug} tal "${t}"`, 'saknas i texten');
}

// ── 3. SPRÅKGRIND ───────────────────────────────────────────────────────────
console.log('== SPRÅKGRIND ==');
const forbjudna = /[\u4e00-\u9fff\u3040-\u30ff\u0400-\u04ff\u0370-\u03ff]/;
const kandaFel = ['breeka', 'omprounering', 'counterbalanserad', 'farkosten', 'bakgrdet', 'skelet:', 'aldrigplacerings', 'ARIKMETIK', 'kurman ', ' Entire ', 'ärpris', 'FIRST ', 'second ', 'mormodern', 'Godwill', 'tvåläkardocument', 'S Köl', 'insight_placeholder', 'Tvingar', 'ochär', 'siffrian', 'diversiverat', 'sparochlåne'];
for (const [slug, k] of Object.entries(nya)) {
  const allt = JSON.stringify(k);
  P(!forbjudna.test(allt), `${slug} CJK/kyrilliska/grekiska`, 'läcka hittad');
  const dubbel = allt.match(/\b(\w{3,})\s+\1\b/g) || [];
  P(dubbel.length === 0, `${slug} dubbelord`, dubbel.slice(0, 3).join('; '));
  const mellanslag = (allt.match(/[^"\\]  /g) || []).length;
  P(mellanslag === 0, `${slug} dubbla mellanslag`, `${mellanslag} st`);
  for (const f of kandaFel) P(!allt.includes(f), `${slug} felord "${f}"`, 'kvar');
}

// ── 4. JURIDIKGRIND ────────────────────────────────────────────────────────
console.log('== JURIDIKGRIND ==');
const radsMönster = [/köp (aktien|detta|bolaget|nu)/i, /sälj (aktien|nu)/i, /rekommenderar (köp|att köpa|sälj)/i, /bör du (köpa|sälja)/i, /slå till på/i, /dags att köpa/i];
const pristal = [9999, 13999, '249 kr', '449 kr', '799 kr'];
for (const [slug, k] of Object.entries(nya)) {
  const allt = JSON.stringify(k);
  for (const m of radsMönster) P(!m.test(allt), `${slug} rådsfras ${m}`, 'träff');
  for (const p of pristal) P(!allt.includes(String(p)), `${slug} R2-pristal ${p}`, 'träff');
  const utbildning = allt.toLowerCase().includes('aldrig placeringsråd');
  P(utbildning, `${slug} utbildningsframing`, 'saknar "aldrig placeringsråd"');
}

// ── 5. SONDBELÄGG ──────────────────────────────────────────────────────────
console.log('== SONDBELÄGG ==');
function textOf(kurs) {
  const out = [];
  (function walk(v) { if (typeof v === 'string') out.push(v); else if (Array.isArray(v)) v.forEach(walk); else if (v && typeof v === 'object') Object.values(v).forEach(walk); })(kurs);
  return out.join('\n').toLowerCase();
}
const corpus = new Map();
for (const s of slugs) corpus.set(s, textOf(reg[s]));
const ägare = (t) => [...corpus].filter(([, txt]) => txt.includes(t)).map(([s]) => s);
const sond = [
  ['vd-avgång', 'kt-12-vd-bytet'], ['köksinköp', 'kt-12-vd-bytet'],
  ['styrelseputs', 'kt-12-vd-bytet'], ['reaktionstrappa', 'kt-12-vd-bytet'],
  ['erfarenhetskurva', 'mt-10-erfarenhetskurvan'], ['85-procentsregeln', 'mt-10-erfarenhetskurvan'],
  ['ackumulerad volym', 'mt-10-erfarenhetskurvan'], ['glömskekurvan', 'mt-10-erfarenhetskurvan'],
  ['pris-saxen', 'mt-10-erfarenhetskurvan'],
  ['värderingshierarki', 'bk-10-verkligt-varde-hierarkin'], ['nivå 3-rullningen', 'bk-10-verkligt-varde-hierarkin'],
  ['överföringseffekten', 'bk-10-verkligt-varde-hierarkin'], ['mark to model', 'bk-10-verkligt-varde-hierarkin'],
];
for (const [term, slug] of sond) {
  const träffar = ägare(term);
  P(träffar.includes(slug), `sond «${term}» ägs av ${slug}`, 'saknar termen');
  const passing = { 'ackumulerad volym': ['technical-analysis-financial-markets', 'teknisk-analys-med-johnny-torssell', 'mt-06-kostnadsoverlagsenhet'], 'värderingshierarki': ['foretagsvardering-med-fundamental-analys'] }[term] || [];
  P(träffar.every(s => s === slug || s.startsWith('kt-1') || s.startsWith('mt-1') || s.startsWith('bk-1') || passing.includes(s)), `sond «${term}» ej andra ägare`, `även: ${träffar.filter(s => s !== slug && !passing.includes(s)).join(', ')}`);
}

// ── 6. KORSLÄNKKAR ─────────────────────────────────────────────────────────
console.log('== KORSLÄNKKAR ==');
// o31-kurser som finns på disk men väntar organets återföring (trädincident 13:12)
const väntarÅterföring = new Set(['kt-11-indexinklusionen', 'mt-09-regleringsmoat', 'bk-09-valutadifferenserna']);
for (const [slug, k] of Object.entries(nya)) {
  const txt = JSON.stringify(k);
  const toks = [...new Set([...txt.matchAll(/\b([a-z]{1,5}-\d{1,3})\b/g)].map(m => m[1].toLowerCase()))];
  for (const t of toks) {
    const registeräkta = slugs.some(s => s.toLowerCase().startsWith(t));
    const återföringsväntad = [...väntarÅterföring].some(s => s.startsWith(t));
    if (återföringsväntad && !registeräkta) { W(false, `${slug} länk ${t} — o31-återföring väntar`, 'trädincident aa2f35eb: reflog-commits återförs av trädägaren; prose-referens korrekt mot levererade registret (worklog o31)'); continue; }
    P(registeräkta, `${slug} länk ${t}`, 'varken register eller o31-uppsättning');
  }
}

// ── 7. ROUND-TRIP ──────────────────────────────────────────────────────────
console.log('== ROUND-TRIP ==');
for (const [slug, k] of Object.entries(nya)) {
  P(JSON.stringify(reg[slug]) === JSON.stringify(k), `${slug} register == kursfil`, 'avviker');
}

console.log(`\nKVD: ${pass} PASS · ${fel} FEL · ${varn} VARNINGAR`);
process.exit(fel > 0 ? 1 : 0);
