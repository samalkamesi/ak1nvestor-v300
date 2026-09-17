#!/usr/bin/env node
// KVD för s3-u3 (auto-s3-1789630527583): B4-EN teknikaktier (engelsk översättning av B4)
// Kontroller enligt Ö1-presedensen (verktyg/_s3u3o7-kvd-fastighets-en.mjs): varumärkesgrind,
// rådverb (EN+SV), ord/spann, title/OG, sökord, korslänkar mot register, länkparitet +
// talparitet mot originalet, disclaimer, readingMinutes, mjuka bindestreck, BlogPost-form.
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

const ROOT = '/home/ak1a/AK1';
const FIL = join(ROOT, 'data/blogg-utkast/teknikaktier-sa-analyserar-du-teknikbolag-en.json');
const ORIG = join(ROOT, 'data/blogg-utkast/teknikaktier-sa-analyserar-du-teknikbolag.json');

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
const PRIM = 'tech stocks';
const ingress = p.body.split(/\n\n/)[0];
if (!p.title.toLowerCase().includes(PRIM)) F('primärt sökord saknas i title'); else OK('primärt sökord i title');
if (!ingress.toLowerCase().includes(PRIM)) F('primärt sökord saknas i ingressen'); else OK('primärt sökord i ingressen');
const h2or = [...p.body.matchAll(/^## (.+)$/gm)].map(m => m[1]);
if (!h2or.some(h => h.toLowerCase().includes(PRIM))) F('primärt sökord saknas i H2'); else OK('primärt sökord i H2: "' + h2or.find(h => h.toLowerCase().includes(PRIM)) + '"');
for (const sek of ['technology companies', 'annual recurring revenue', 'gross margin', 'P/S']) {
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

// Länkparitet mot originalet
const olinks = [...ov.body.matchAll(/\]\((\/[^)]+)\)/g)].map(m => m[1]).sort();
const nlinks = [...links].sort();
if (JSON.stringify(olinks) !== JSON.stringify(nlinks)) {
  const saknas = olinks.filter(l => !nlinks.includes(l));
  const extraL = nlinks.filter(l => !olinks.includes(l));
  F('länkparitet avviker — saknas: ' + (saknas.join(', ') || '–') + ' | extra: ' + (extraL.join(', ') || '–'));
} else OK('länkparitet: identisk uppsättning med originalet (' + nlinks.length + ' länkar)');

// ── 6. Talparitet + aritmetik ───────────────────────────────────────────────
const tal = ['61 points out of 100', '37–78', 'Sinch', 'Logitech', 'Truecaller', 'Ericsson', 'Nokia', 'ASM International', '6.37 trillion', '14.2 percent', '90 percent', 'SEK 1,000 million', '110 percent', 'SEK 1,100 million', 'SEK 100 million', '70–85 percent', '30–50', '30 percent growth', '12 percent EBITDA margin', '42', 'P/S of 3', '80 percent gross margin', 'P/S of 5', 'SEK 5,000 million', '25 percent', 'SEK 250 million', 'just under 17', '20 percent per year', '3.5', '4 percent', '20 million euros', '10 percent'];
const saknadeTal = tal.filter(t => !p.body.includes(t));
if (saknadeTal.length) F('tal från originalet saknas: ' + saknadeTal.join(' | ')); else OK('talparitet: samtliga ' + tal.length + ' nyckeltal från originalet närvarande');
const arit = [
  [1000 * 1.10, 1100, 'NRR-ARR'],
  [1100 - 1000, 100, 'expansion'],
  [30 + 12, 42, 'Rule of 40'],
  [1000 * 0.25, 250, 'vinst'],
  [5000 / 250, 20, 'implicit P/E'],
  [5000 / 300, 16.67, 'P/E vid 30 % marginal (text: just under 17)'],
  [5 / 1.44, 3.47, 'P/S efter två år (text: 3.5)'],
];
for (const [r, e, n] of arit) if (Math.abs(r - e) > 0.01) F('aritmetikfel ' + n + ': ' + r + ' != ' + e); else OK('aritmetik ' + n + ': ' + r.toFixed(2) + ' ✓');

// ── 7. Disclaimer, bindestreck ──────────────────────────────────────────────
const sista = p.body.trim().split('\n').pop().trim();
if (sista !== '_This is educational financial analysis, not investment advice._') F('disclaimer-sista-rad avviker: "' + sista + '"'); else OK('disclaimer-sista-rad korrekt (översatt, samma budskap)');
if (p.body.includes('\u00AD')) F('mjukt bindestreck finns'); else OK('0 mjuka bindestreck');
if (/[\u2010\u2011]/.test(p.body)) V('hårdat bindestreck (U+2010/2011) — kontrollera'); else OK('0 hårdbindestreck');

console.log('\n──── KVD UTFALL: ' + fel + ' FEL, ' + varning + ' VARNING ' + (fel === 0 && varning === 0 ? '— GRÖN' : fel === 0 ? '— GRÖN med varningar' : '— RÖD') + ' ────');
process.exit(fel === 0 ? 0 : 1);
