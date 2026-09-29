#!/usr/bin/env node
// _s5u3o31-kvd.mjs — KVD för s5-u3 o31: tre kurser (mt-09, kt-11, bk-09).
// Kontroller: struktur (18 fält + chapters_list-paritet + blockkonvention),
// aritmetik (oberoende omräkning av kursens ekvationer), språkgrind
// (CJK/kyrilliska/grekiska, dubbelord, dubbla mellanslag, kända stavfel),
// juridikgrind (rådsfraser, R2-pristal), sondbelägg (kärntermer ägs av nya kurser),
// korslänkar (grannkurser registeräkta).
import { readFileSync } from 'node:fs';

const ROTT = '/home/ak1a/AK1';
const reg = JSON.parse(readFileSync(`${ROTT}/public/deep-courses.json`, 'utf8'));
const nya = {};
for (const slug of ['mt-09-regleringsmoat', 'kt-11-indexinklusionen', 'bk-09-valutadifferenserna']) {
  nya[slug] = JSON.parse(readFileSync(`${ROTT}/data/kurser-tillagg/${slug}.json`, 'utf8'));
}
let pass = 0, fel = 0, varn = 0;
const P = (ok, namn, detalj) => { if (ok) { pass++; } else { fel++; console.log(`  FEL: ${namn} — ${detalj}`); } };

// ── 1. STRUKTUR ─────────────────────────────────────────────────────────────
console.log('== STRUKTUR ==');
const falt = ['slug','category','weight','chapterCount','totalMinutes','title','summary','minutes','xp','level','why','learn','history','chapters_list','lynchSection','grahamSection','ak1Section','chapters'];
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
  P(typeof k.history === 'object' && ['origin','evolution','modern'].every(f => typeof k.history[f] === 'string' && k.history[f].length > 100), `${slug} history-block`, 'ofullständigt');
  const kat = { 'mt-09-regleringsmoat': 'MOAT', 'kt-11-indexinklusionen': 'KATALYSATOR', 'bk-09-valutadifferenserna': 'BOKFÖRING & ÅRSREDOVISNING' }[slug];
  P(k.category === kat, `${slug} kategori`, k.category);
  const niva = { 'mt-09-regleringsmoat': 'Intermediär', 'kt-11-indexinklusionen': 'Intermediär', 'bk-09-valutadifferenserna': 'Intermediär' }[slug];
  P(k.level === niva, `${slug} nivå`, k.level);
}

// ── 2. ARITMETIK (oberoende omräkning av de ekvationer texterna bär) ────────
console.log('== ARITMETIK ==');
const ekv = [
  // mt-09
  ['mt: intäktsram', 5000 * 0.064, 320],
  ['mt: kapitalkostnad', 5000 * 0.058, 290],
  ['mt: glapp', 320 - 290, 30],
  ['mt: capex-paradox', (5000 + 400) * 0.064, 345.6],
  ['mt: capex-bidrag', 400 * 0.064, 25.6],
  ['mt: takträning ram', 5000 * 0.059, 295],
  ['mt: takträning glapp', 295 - 290, 5],
  ['mt: duplication per nät', 320 / 2, 160],
  ['mt: duplication resultat', 160 - 290, -130],
  ['mt: duplication avk', 160 / 5000, 0.032],
  ['mt: svea inc', 18 / 10000, 0.0018],
  ['mt: svea utmanare', 18 / 1000, 0.018],
  ['mt: inträde', 250 + 18, 268],
  ['mt: utm1 ram', 5400 * 0.061, 329.4],
  ['mt: utm1 glapp', 329.4 - 5400 * 0.058, 329.4 - 313.2],
  ['mt: utm2', 18 / 2000, 0.009],
  ['mt: utm3', 3000 * 0.058, 174],
  // kt-11
  ['kt: justerat', 48000 * 0.80, 38400],
  ['kt: vikt', 38400 / 3840000, 0.01],
  ['kt: köp', 0.22 * 38400, 8448],
  ['kt: dagar', 8448 / 120, 70.4],
  ['kt: per dag', 8448 / 20, 422.4],
  ['kt: multiplikator', 422.4 / 120, 3.52],
  ['kt: rykte', 0.60 * 6, 3.6],
  ['kt: bergslagen sälj', 0.22 * 12000, 2640],
  ['kt: bergslagen dagar', 2640 / 40, 66],
  ['kt: u1 köp', 0.25 * 25000, 6250],
  ['kt: u1 dagar', 6250 / 250, 25],
  ['kt: u2 rykte', 0.50 * 8, 4],
  ['kt: u3 sälj', 0.20 * 6000, 1200],
  ['kt: u3 dagar', 1200 / 30, 40],
  // bk-09
  ['bk: tillgångar', 320 * 9.70, 3104],
  ['bk: skulder', 220 * 9.70, 2134],
  ['bk: transit', 320 * 9.70 - 220 * 9.70, 970],
  ['bk: resultat', 12 * 9.45, 113.4],
  ['bk: ingEK', 88 * 9.20, 809.6],
  ['bk: differens', 970 - 809.6 - 113.4, 47],
  ['bk: kontroll', 100 * 9.70 - (809.6 + 113.4), 970 - 923],
  ['bk: känslighet upp', 100 * 10.10 - 923, 87],
  ['bk: känslighet ned', 100 * 9.40 - 923, 17],
  ['bk: realisation', 47 + 23, 70],
  ['bk: fallet/fykt fritt', (500 - 350) * 9.50 - (140 * 8.90 + 10 * 9.10), 88],
  ['bk: år2', 150 * 9.20 - 1337, 43],
  ['bk: år2 krymp', 88 - 43, 45],
  ['bk: euro-spegel', 50 * (10.60 - 10.90), -15],
];
for (const [namn, beräknad, text] of ekv) {
  P(Math.abs(beräknad - text) < 0.051, `aritmetik ${namn}`, `beräkning ${beräknad} mot textens ${text}`);
}

// ── 3. SPRÅKGRIND ───────────────────────────────────────────────────────────
console.log('== SPRÅKGRIND ==');
for (const [slug, k] of Object.entries(nya)) {
  const allt = JSON.stringify(k);
  P(!/[\u4e00-\u9fff\u3040-\u30ff]/.test(allt), `${slug} CJK`, (allt.match(/[\u4e00-\u9fff\u3040-\u30ff]/g) || []).join(''));
  P(!/[\u0400-\u04ff]/.test(allt), `${slug} kyrilliska`, (allt.match(/[\u0400-\u04ff]/g) || []).join(''));
  P(!/  +/.test(allt), `${slug} dubbla mellanslag`, JSON.stringify((allt.match(/.{0,25}  +.{0,25}/) || [''])[0]));
  const dubbel = allt.match(/\b(\w{3,})\s+\1\b/g) || [];
  P(dubbel.length === 0, `${slug} dubbelord`, dubbel.join(', '));
  // kända felstavningar som processen tidigare kurat
  const felOrd = ['approximately','settingen','tolerance','STRUCTUR','own-risk','NOLLPRiset','INKusionseffekten','främde valutas','BARriär','omliggande','klyfga','ämer','snarlikt än','bärbara fall'];
  for (const f of felOrd) P(!allt.includes(f), `${slug} stavfel «${f}»`, 'finns i texten');
  // utmaningens svarssiffror i utmaningsblocken — kontroller att varje utmaning har tre svar
  const utm = k.chapters[5].blocks.find(b => b.type === 'utmaning').content;
  P((utm.match(/svar:/g) || []).length >= 3, `${slug} utmaningssvar`, `${(utm.match(/svar:/g) || []).length} svar`);
}

// ── 4. JURIDIKGRIND ─────────────────────────────────────────────────────────
console.log('== JURIDIKGRIND ==');
const radsFrasor = [/du bör köpa/i, /köp aktien/i, /sälj dina aktier/i, /vi rekommenderar/i, /placera i/i, /investera i denna/i, /detta är en köp/i, /ta position i/i];
for (const [slug, k] of Object.entries(nya)) {
  const allt = JSON.stringify(k);
  for (const r of radsFrasor) P(!r.test(allt), `${slug} rådsfras ${r}`, 'träff');
  P(/aldrig placeringsråd/.test(allt) || /aldrig placeringsråd/.test(k.summary + k.why), `${slug} utbildningsmarkering`, 'markering saknas');
  P(!/\b(19|20)\d{2}:\d{3}\b/.test(allt), `${slug} lagrumsformat`, 'tal ser ut som lagrum');
  // R2: inga priser/tier/publicering
  P(!/9 ?999|13 ?999|249|449|799/.test(allt), `${slug} R2-pristal`, 'prisserie i texten');
}

// ── 5. SONDBELÄGG: kärntermer ägs nu av de nya kurserna (mot gamla registret UTAN nya) ──
console.log('== SONDBELÄGG ==');
function textOf(k) { const o = []; (function w(v){ if(typeof v==='string') o.push(v); else if(Array.isArray(v)) v.forEach(w); else if(v&&typeof v==='object') Object.values(v).forEach(w); })(k); return o.join('\n').toLowerCase(); }
const arKurs = s => /^(v\d{2}|[a-z]{2,4}-\d{1,3})-/.test(s); // bokkanon-slugar (the-little-book …) är inte kursägare — se-19-presedensen
const gamlaAgare = t => { const hits = []; for (const [s, k] of Object.entries(reg)) if (arKurs(s) && !(s in nya) && textOf(k).includes(t.toLowerCase())) hits.push(s); return hits; };
for (const [term, slug] of [['tillåten avkastning','mt-09-regleringsmoat'],['inklåsning','mt-09-regleringsmoat'],['tillståndsmarknad','mt-09-regleringsmoat'],['indexinklusion','kt-11-indexinklusionen'],['inklusionseffekten','kt-11-indexinklusionen'],['terminsstyrelse','kt-11-indexinklusionen'],['funktionell valuta','bk-09-valutadifferenserna'],['valutadifferens','bk-09-valutadifferenserna']]) {
  const ga = gamlaAgare(term).filter(s => !nya[s]);
  P(ga.length === 0, `sond «${term}» 0 gamla kursägare`, ga.join(', '));
  P(textOf(nya[slug]).includes(term.toLowerCase()), `sond «${term}» ägs av ${slug}`, 'termen saknas i den nya kursen');
}

// ── 6. KORSLÄNKAR: nämnda grannkurser finns i registret (prefixmatch) ───────
console.log('== KORSLÄNKAR ==');
const regSlugs = Object.keys(reg).concat(Object.keys(nya));
for (const [slug, k] of Object.entries(nya)) {
  const allt = textOf(k);
  const ref = [...new Set((allt.match(/\b[a-z]{2}(?:-[a-zäåö0-9]+){1,3}-\d{1,3}|\b[a-z]{2}-\d{1,3}|\bv\d{2}\b/g) || []))];
  // hämta också (xx-NN)-mönster i parenteser
  const ref2 = [...new Set((allt.match(/\((\w{2,4}-\d{1,3})\)/g) || []).map(s => s.slice(1, -1)))];
  const alla = [...new Set([...ref, ...ref2])];
  for (const r of alla) {
    if (/^(am|bk|bf|bn|ek|ib|kt|km|ks|ln|ma|mk|mt|od|pc|pe|pf|rk|roic|rp|rs|se|st|s[je]|ts|tx|ud|vm|vr|v)-?\d{1,3}$/.test(r)) {
      const finns = regSlugs.some(s => s.startsWith(r));
      P(finns, `korslänk ${r} i ${slug}`, 'kursen finns inte i registret');
    }
  }
}

console.log(`\nKVD: ${pass} PASS, ${fel} FEL, ${varn} VARNING`);
process.exit(fel ? 1 : 0);
