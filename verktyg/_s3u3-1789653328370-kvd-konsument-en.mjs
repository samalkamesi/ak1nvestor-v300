#!/usr/bin/env node
// KVD för s3-u3 (auto-s3-1789653328370): Ö7 = B7-EN konsumentaktier (engelsk översättning av B7)
// Kontroller enligt Ö1/Ö4-precedenserna: varumärkesgrind, rådverb (EN+SV), ord/spann,
// title/OG, sökord, korslänkar mot register, länkparitet + talparitet mot originalet,
// aritmetik, disclaimer, readingMinutes, mjuka bindestreck, BlogPost-form.
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

const ROOT = '/home/ak1a/AK1';
const FIL = join(ROOT, 'data/blogg-utkast/konsumentaktier-sa-analyserar-du-konsumentbolag-en.json');
const ORIG = join(ROOT, 'data/blogg-utkast/konsumentaktier-sa-analyserar-du-konsumentbolag.json');

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
if (ord < 800 || ord > 1400) F('ord ' + ord + ' utanför spannet 800–1400'); else OK('ord: ' + ord + ' (mallmål 1200, span 800–1400; originalet ' + ov.body.split(/\s+/).filter(Boolean).length + ')');
if (p.title.length > 60) F('title ' + p.title.length + ' > 60'); else OK('title: ' + p.title.length + ' tkn — "' + p.title + '"');
if (p.description.length > 155) F('OG-desc ' + p.description.length + ' > 155'); else OK('OG-desc: ' + p.description.length + ' tkn');
const rm = Math.round(ord / 600);
if (p.readingMinutes !== rm) F('readingMinutes ' + p.readingMinutes + ' != round(' + ord + '/600) = ' + rm); else OK('readingMinutes ' + p.readingMinutes + ' = round(ord/600)');

// ── 4. Sökord ───────────────────────────────────────────────────────────────
const PRIM = 'consumer stocks';
const ingress = p.body.split(/\n\n/)[0];
if (!p.title.toLowerCase().includes(PRIM)) F('primärt sökord saknas i title'); else OK('primärt sökord i title');
if (!ingress.toLowerCase().includes(PRIM)) F('primärt sökord saknas i ingressen'); else OK('primärt sökord i ingressen');
const h2or = [...p.body.matchAll(/^## (.+)$/gm)].map(m => m[1]);
if (!h2or.some(h => h.toLowerCase().includes(PRIM))) F('primärt sökord saknas i H2'); else OK('primärt sökord i H2: "' + h2or.find(h => h.toLowerCase().includes(PRIM)) + '"');
for (const sek of ['consumer companies', 'gross margin', 'DuPont', 'pricing power']) {
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
    if (!poster.has(s)) { linkFel++; console.log('  död/utkast-länk:', l, '(ej publicerad)'); }
    if (utkast.has(s)) { linkFel++; console.log('  FÖRBJUDEN utkast-länk:', l); }
  } else { linkFel++; console.log('  okänd länktyp:', l); }
}
if (linkFel) F(linkFel + ' länkfel'); else OK('korslänkar: ' + links.length + ' st alla levande (kurser ' + kurser.size + ' + poster ' + poster.size + '), 0 mot utkast');

// Länkparitet mot originalet
const olinks = [...ov.body.matchAll(/\]\((\/[^)]+)\)/g)].map(m => m[1]).sort();
const nlinks = [...links].sort();
if (JSON.stringify(olinks) !== JSON.stringify(nlinks)) {
  const saknas = olinks.filter(l => !nlinks.includes(l));
  const extraL = nlinks.filter(l => !olinks.includes(l));
  F('länkparitet avviker — saknas: ' + (saknas.join(', ') || '–') + ' | extra: ' + (extraL.join(', ') || '–'));
} else OK('länkparitet: identisk uppsättning med originalet (' + nlinks.length + ' länkar)');

// ── 6. Talparitet + aritmetik ───────────────────────────────────────────────
const tal = [
  '13 companies', 'median ROE 24 percent', 'second highest', '14.6 versus 21.1 percent',
  '66 percent gross margin', '46 percent EBIT margin', 'P/E of 6.0',
  'LVMH 66, Inditex 56 and H&M 54 percent', 'Axfood 15, Electrolux 14 and Volvo Cars 16',
  '2026-09-15', '3 percent net margin', '3 × 4 × 2 = 24 percent', '30 × 0.5 × 1.2 = 18 percent',
  "the universe's 15", '95 − 71.25 − 21 = 2.75', '31 percent', 'Inditex stands at 28',
  '(−3.2 percent)', '2.6', '20.4 against', '(18.1–22.3)', '15.7 against 19.0', '3.9 against 2.8',
  '0.69', 'Nestlé 2.1, H&M 2.3, Carlsberg 1.3 against Evolution 0.02', '9.3 percent', '14–66 percent',
  'H&M', 'Inditex', 'Nike', 'LVMH', 'Nestlé', 'Procter & Gamble', 'Essity', 'Axfood', 'Electrolux',
  'Volvo Cars', "McDonald's", 'Carlsberg', 'Evolution',
];
const saknadeTal = tal.filter(t => !p.body.includes(t));
if (saknadeTal.length) F('tal från originalet saknas: ' + saknadeTal.join(' | ')); else OK('talparitet: samtliga ' + tal.length + ' nyckeltal/namn från originalet närvarande');
const arit = [
  [3 * 4 * 2, 24, 'DuPont handel'],
  [30 * 0.5 * 1.2, 18, 'DuPont varumärke'],
  [100 - 75 - 21, 4, 'rörelseresultat bas'],
  [75 * 0.95, 71.25, 'varukostnad efter −5 %'],
  [95 - 71.25 - 21, 2.75, 'resultat efter volymnedgång'],
  [(4 - 2.75) / 4 * 100, 31.25, 'vinstnedslag ≈ 31 % (text: 31)'],
];
for (const [r, e, n] of arit) if (Math.abs(r - e) > 0.01) F('aritmetikfel ' + n + ': ' + r + ' != ' + e); else OK('aritmetik ' + n + ': ' + r.toFixed(2) + ' ✓');

// ── 7. Disclaimer, bindestreck ──────────────────────────────────────────────
const sista = p.body.trim().split('\n').pop().trim();
if (sista !== '_This is educational financial analysis, not investment advice._') F('disclaimer-sista-rad avviker: "' + sista + '"'); else OK('disclaimer-sista-rad korrekt (översatt, samma budskap)');
if (p.body.includes('\u00AD')) F('mjukt bindestreck finns'); else OK('0 mjuka bindestreck');
if (/[\u2010\u2011]/.test(p.body)) V('hårdat bindestreck (U+2010/2011) — kontrollera'); else OK('0 hårdbindestreck');

console.log('\n──── KVD UTFALL: ' + fel + ' FEL, ' + varning + ' VARNING ' + (fel === 0 && varning === 0 ? '— GRÖN' : fel === 0 ? '— GRÖN med varningar' : '— RÖD') + ' ────');
process.exit(fel === 0 ? 0 : 1);
