#!/usr/bin/env node
// KVD för s3-u1 (auto-s3-1789653328370): B6-EN industriaktier (engelsk översättning av B6)
// Kontroller enligt Ö1–Ö4-presedenserna (verktyg/_s3u3-kvd-teknik-en.mjs som mall): varumärkesgrind,
// rådverb (EN+SV), ord/spann, title/OG, sökord, korslänkar mot register, länkparitet (multiset) +
// talparitet mot originalet, disclaimer, readingMinutes, mjuka bindestreck, BlogPost-form.
// NOT: tillämpar s1-u1:s dokumenterade B6-rättningar B1 (readingMinutes = round(ord/600)) och
// B2 (Sandvik-källänk www.sandvik.com — extern källa, utanför länkpariteten).
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

const ROOT = '/home/ak1a/AK1';
const FIL = join(ROOT, 'data/blogg-utkast/industriaktier-sa-analyserar-du-industribolag-en.json');
const ORIG = join(ROOT, 'data/blogg-utkast/industriaktier-sa-analyserar-du-industribolag.json');

let fel = 0, varning = 0;
const F = (m) => { fel++; console.log('FEL:', m); };
const V = (m) => { varning++; console.log('VARNING:', m); };
const OK = (m) => console.log('PASS:', m);

// ── 0. Form ─────────────────────────────────────────────────────────────────
const p = JSON.parse(readFileSync(FIL, 'utf8'));
const ov = JSON.parse(readFileSync(ORIG, 'utf8'));
const FALT = ['slug','title','description','pillar','author','publishedAt','readingMinutes','tags','body'];
const extra = Object.keys(p).filter(k => !FALT.includes(k) && k !== 'updatedAt');
if (extra.length) F('okända fält i BlogPost-formen: ' + extra.join(',')); else OK('BlogPost-form exakt (9 fält, 0 okända)');
if (p.slug !== ov.slug + '-en') F('slug != originalets + -en'); else OK('slug = originalet + -en');
if (p.pillar !== ov.pillar) F('pillar avviker från originalet'); else OK('pillar identisk originalet (systemfält): ' + p.pillar);
if (p.author !== ov.author) F('author avviker'); else OK('author identisk: ' + p.author);
if (!/^\d{4}-\d{2}-\d{2}$/.test(p.publishedAt)) F('publishedAt fel format'); else OK('publishedAt ISO: ' + p.publishedAt);
if (!Array.isArray(p.tags) || p.tags.length < 3) F('tags < 3'); else OK('tags: ' + p.tags.length + ' st');

// ── 1. Varumärkesgrind (kontrolleraText-replik) ─────────────────────────────
const vm = JSON.parse(readFileSync(join(ROOT, 'data/varumarke.json'), 'utf8'));
const ytor = { title: p.title, description: p.description, body: p.body };
let vmFel = 0;
for (const r of vm.forbjudnaFraser) {
  const re = new RegExp(r.fran, 'giu');
  for (const [namn, text] of Object.entries(ytor)) {
    if (re.test(text)) { vmFel++; console.log(`  varumärke [${r.allvar}] ${namn}: /${r.fran}/ — ${r.motiv}`); }
  }
}
if (vmFel) F('varumärkesgrind: ' + vmFel + ' träffar'); else OK('varumärkesgrind: 0 FEL av ' + vm.forbjudnaFraser.length + ' regexer × 3 ytor');

// ── 2. Rådverb (EN + SV) ────────────────────────────────────────────────────
const radRe = /\b(you should (?:buy|sell|invest)|should (?:buy|sell) (?:this|the) (?:stock|share)|we recommend (?:buying|selling|that you)|our recommendation is (?:to )?(?:buy|sell)|köp aktien|sälj aktien|vi rekommenderar köp|investera i den här aktien)\b/gi;
const radTräff = p.body.match(radRe) || [];
if (radTräff.length) F('rådverb: ' + radTräff.join(', ')); else OK('rådverb (EN+SV-mönster): 0 träffar');

// ── 3. Ord, title, OG ───────────────────────────────────────────────────────
const ord = p.body.split(/\s+/).filter(Boolean).length;
const oord = ov.body.split(/\s+/).filter(Boolean).length;
if (ord < 800 || ord > 1400) F('ord ' + ord + ' utanför spannet 800–1400'); else OK('ord: ' + ord + ' (mallmål 1200, span 800–1400; originalet ' + oord + ')');
if (p.title.length > 60) F('title ' + p.title.length + ' > 60'); else OK('title: ' + p.title.length + ' tkn — "' + p.title + '"');
if (p.description.length > 155) F('OG-desc ' + p.description.length + ' > 155'); else OK('OG-desc: ' + p.description.length + ' tkn');
const rm = Math.round(ord / 600);
if (p.readingMinutes !== rm) F('readingMinutes ' + p.readingMinutes + ' != round(' + ord + '/600) = ' + rm); else OK('readingMinutes ' + p.readingMinutes + ' = round(ord/600) — s1-u1:s B1-rättning tillämpad');

// ── 4. Sökord ───────────────────────────────────────────────────────────────
const PRIM = 'industrial stocks';
const ingress = p.body.split(/\n\n/)[0];
if (!p.title.toLowerCase().includes(PRIM)) F('primärt sökord saknas i title'); else OK('primärt sökord i title');
if (!ingress.toLowerCase().includes(PRIM)) F('primärt sökord saknas i ingressen'); else OK('primärt sökord i ingressen');
const h2or = [...p.body.matchAll(/^## (.+)$/gm)].map(m => m[1]);
if (!h2or.some(h => h.toLowerCase().includes(PRIM))) F('primärt sökord saknas i H2'); else OK('primärt sökord i H2: "' + h2or.find(h => h.toLowerCase().includes(PRIM)) + '"');
for (const sek of ['industrial companies', 'order intake', 'cyclical', 'aftermarket']) {
  const n = (p.body.toLowerCase().match(new RegExp(sek.toLowerCase().replace(/ /g, '\\s+').replace(/\//g, '\\/'), 'g')) || []).length;
  if (n === 0) F('sekundärt sökord saknas: ' + sek); else OK('sekundärt "' + sek + '": ' + n + ' förekomster');
}

// ── 5. Korslänkar mot register ──────────────────────────────────────────────
const kurser = new Set(Object.keys(JSON.parse(readFileSync(join(ROOT, 'public/deep-courses.json'), 'utf8'))));
const poster = new Set(readdirSync(join(ROOT, 'data/blogg')).filter(f => f.endsWith('.json')).map(f => JSON.parse(readFileSync(join(ROOT, 'data/blogg', f), 'utf8')).slug));
const utkast = new Set(readdirSync(join(ROOT, 'data/blogg-utkast')).filter(f => f.endsWith('.json')).map(f => f.slice(0, -5)));
const links = [...p.body.matchAll(/\]\((\/[^)]+)\)/g)].map(m => m[1]);
let linkFel = 0;
for (const l of links) {
  if (l.startsWith('/kurser/')) { if (!kurser.has(l.slice('/kurser/'.length))) { linkFel++; console.log('  död kurslänk:', l); } }
  else if (l.startsWith('/blogg/')) {
    const s = l.slice('/blogg/'.length);
    if (!poster.has(s)) { linkFel++; console.log('  död/utkast-länk:', l, poster.has(s) ? '' : '(ej publicerad)'); }
    if (utkast.has(s)) { linkFel++; console.log('  FÖRBJUDEN utkast-länk:', l); }
  } else { linkFel++; console.log('  okänd länktyp:', l); }
}
if (linkFel) F(linkFel + ' länkfel'); else OK('korslänkar: ' + links.length + ' st alla levande (kurser ' + kurser.size + ' + poster ' + poster.size + '), 0 mot utkast');

// Länkparitet mot originalet (multiset: sorterade förekomster, dubletter med)
const olinks = [...ov.body.matchAll(/\]\((\/[^)]+)\)/g)].map(m => m[1]).sort();
const nlinks = [...links].sort();
if (JSON.stringify(olinks) !== JSON.stringify(nlinks)) {
  const saknas = olinks.filter(l => !nlinks.includes(l));
  const extraL = nlinks.filter(l => !olinks.includes(l));
  F('länkparitet avviker — saknas: ' + (saknas.join(', ') || '–') + ' | extra: ' + (extraL.join(', ') || '–'));
} else OK('länkparitet: identiskt multiset med originalet (' + nlinks.length + ' förekomster)');

// ── 6. Talparitet + aritmetik ───────────────────────────────────────────────
const tal = ['AB Volvo', 'ABB', 'Atlas Copco', 'Sandvik', 'SKF', 'Alfa Laval', 'Hexagon', 'Skanska', 'GE Aerospace', 'Eaton', 'ASSA ABLOY', 'Industrivärden', 'median P/E in the universe is 28', '20.2', '16.9 percent', '10.8 percent', '8.4 percent', '2026-09-15', 'SEK 10 billion', 'SEK 11 billion', 'stands at 1.1', 'book-to-bill', '15 percent EBIT margin', 'SEK 1.5 billion', 'SEK 8.5 billion', '8 percent', 'SEK 0.7 billion', 'SEK 12', 'SEK 240', '240 ÷ 12 = 20', 'SEK 6', 'SEK 180', '180 ÷ 6 = 30', '40 percent aftermarket', '5 percent', '18.2–35.8', 'P/B of 4.9', 'EBIT falls 40 percent', 'five years back'];
const saknadeTal = tal.filter(t => !p.body.includes(t));
if (saknadeTal.length) F('tal från originalet saknas: ' + saknadeTal.join(' | ')); else OK('talparitet: samtliga ' + tal.length + ' nyckeltal/namn från originalet närvarande');
const arit = [
  [11 / 10, 1.1, 'book-to-bill'],
  [10 * 0.15, 1.5, 'toppresultat'],
  [10 * 0.85, 8.5, 'nedgångens volym'],
  [8.5 * 0.08, 0.68, 'bottenresultat (text: ≈ 0.7)'],
  [(1.5 - 0.68) / 1.5, 0.547, 'vinstförsvinnandet >50 % (text: more than half)'],
  [240 / 12, 20, 'P/E topp'],
  [180 / 6, 30, 'P/E botten'],
];
for (const [r, e, n] of arit) if (Math.abs(r - e) > 0.01) F('aritmetikfel ' + n + ': ' + r + ' != ' + e); else OK('aritmetik ' + n + ': ' + r.toFixed(2) + ' ✓');
// bottenresultatets avrundning i text: 0,68 → "≈ SEK 0.7 billion" (0,3 Mdr avstånd = avrundningskonvention)
if (Math.abs(8.5 * 0.08 - 0.7) > 0.05) F('bottenresultat avviker >0,05 från textens 0,7'); else OK('bottenresultat 0,68 inom avrundningskonvention mot textens ≈ 0,7');

// ── 7. Disclaimer, bindestreck ──────────────────────────────────────────────
const sista = p.body.trim().split('\n').pop().trim();
if (sista !== '_This is educational financial analysis, not investment advice._') F('disclaimer-sista-rad avviker: "' + sista + '"'); else OK('disclaimer-sista-rad korrekt (översatt, samma budskap)');
if (p.body.includes('\u00AD')) F('mjukt bindestreck finns'); else OK('0 mjuka bindestreck');
if (/[\u2010\u2011]/.test(p.body)) V('hårdat bindestreck (U+2010/2011) — kontrollera'); else OK('0 hårdbindestreck');

// ── 8. B2-rättningen (s1-u1:s granskningsdiff) ─────────────────────────────
if (p.body.includes('home.sandvik.com')) F('B2: döda Sandvik-länken kvar (home.sandvik.com)'); else OK('B2-rättning tillämpad: 0 home.sandvik.com (www.sandvik.com enligt diff)');
if (p.body.includes('www.sandvik.com/en/investors')) OK('B2: rättad käll-URL närvarande'); else F('B2: rättad käll-URL saknas');

console.log('\n──── KVD UTFALL: ' + fel + ' FEL, ' + varning + ' VARNING ' + (fel === 0 && varning === 0 ? '— GRÖN' : fel === 0 ? '— GRÖN med varningar' : '— RÖD') + ' ────');
process.exit(fel === 0 ? 0 : 1);
