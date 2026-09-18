#!/usr/bin/env node
// KVD för s3-u1 (auto-s3-1789653328370): B5-EN telekomaktier (engelsk översättning av B5)
// Kontroller enligt Ö1–Ö4-presedenserna (verktyg/_s3u3-kvd-teknik-en.mjs som mall): varumärkesgrind,
// rådverb (EN+SV), ord/spann, title/OG, sökord, korslänkar mot register, länkparitet +
// talparitet mot originalet, disclaimer, readingMinutes, mjuka bindestreck, BlogPost-form.
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

const ROOT = '/home/ak1a/AK1';
const FIL = join(ROOT, 'data/blogg-utkast/telekomaktier-sa-analyserar-du-telekom-och-mediabolag-en.json');
const ORIG = join(ROOT, 'data/blogg-utkast/telekomaktier-sa-analyserar-du-telekom-och-mediabolag.json');

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
if (p.readingMinutes !== rm) F('readingMinutes ' + p.readingMinutes + ' != round(' + ord + '/600) = ' + rm); else OK('readingMinutes ' + p.readingMinutes + ' = round(ord/600)');

// ── 4. Sökord ───────────────────────────────────────────────────────────────
const PRIM = 'telecom stocks';
const ingress = p.body.split(/\n\n/)[0];
if (!p.title.toLowerCase().includes(PRIM)) F('primärt sökord saknas i title'); else OK('primärt sökord i title');
if (!ingress.toLowerCase().includes(PRIM)) F('primärt sökord saknas i ingressen'); else OK('primärt sökord i ingressen');
const h2or = [...p.body.matchAll(/^## (.+)$/gm)].map(m => m[1]);
if (!h2or.some(h => h.toLowerCase().includes(PRIM))) F('primärt sökord saknas i H2'); else OK('primärt sökord i H2: "' + h2or.find(h => h.toLowerCase().includes(PRIM)) + '"');
for (const sek of ['media companies', 'ARPU', 'churn', 'capex']) {
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
const tal = ['7.6 trillion dollars', '6.4 percent of world GDP', 'SEK 2.3 billion', 'SEK 760 million', '120 megahertz', 'SEK 4.2 billion', '15–20 percent', 'three billion', '6.4 billion', '2031', 'SEK 150 per month', 'SEK 1,800', '1.5 percent', '67 months', 'five and a half years', 'SEK 10,000', '325 million paying households', '50.7–51.7 billion dollars', '761 million', '293 million paying', 'Viaplay', '2023', 'SEK 30 billion', 'SEK 12 billion', '40 percent margin', 'SEK 6 billion', '20 percent of revenue', 'SEK 1.2 billion', 'SEK 4.8 billion', '2.5× EBITDA', '2–3×', '2022:482'];
const saknadeTal = tal.filter(t => !p.body.includes(t));
if (saknadeTal.length) F('tal från originalet saknas: ' + saknadeTal.join(' | ')); else OK('talparitet: samtliga ' + tal.length + ' nyckeltal från originalet närvarande');
const arit = [
  [150 * 12, 1800, 'ARPU årsbelopp'],
  [Math.round(1 / 0.015), 67, 'churn ⇒ månader (text: ≈ 67)'],
  [1800 * (67 / 12), 10050, 'värde per relation (text: roughly SEK 10,000)'],
  [12 - 6, 6, 'EBITDA − capex'],
  [6 - 1.2, 4.8, 'efter ränta'],
  [30 / 12, 2.5, 'nettoskuld/EBITDA'],
  [(12 / 30) * 100, 40, 'EBITDA-marginal %'],
  [(6 / 30) * 100, 20, 'capexandel %'],
];
for (const [r, e, n] of arit) if (Math.abs(r - e) > 0.01) F('aritmetikfel ' + n + ': ' + r + ' != ' + e); else OK('aritmetik ' + n + ': ' + r.toFixed(2) + ' ✓');
// churn-relationens gränsvärde: 10050 avrundat i text till 10 000 (0,5 % avvikelse, "roughly")
if (Math.abs(1800 * (67 / 12) - 10000) / 10000 > 0.01) F('relationens värde avviker >1 % från textens 10 000'); else OK('relationens värde 10 050 inom 1 % av textens "roughly SEK 10,000"');

// ── 7. Disclaimer, bindestreck ──────────────────────────────────────────────
const sista = p.body.trim().split('\n').pop().trim();
if (sista !== '_This is educational financial analysis, not investment advice._') F('disclaimer-sista-rad avviker: "' + sista + '"'); else OK('disclaimer-sista-rad korrekt (översatt, samma budskap)');
if (p.body.includes('\u00AD')) F('mjukt bindestreck finns'); else OK('0 mjuka bindestreck');
if (/[\u2010\u2011]/.test(p.body)) V('hårdat bindestreck (U+2010/2011) — kontrollera'); else OK('0 hårdbindestreck');

console.log('\n──── KVD UTFALL: ' + fel + ' FEL, ' + varning + ' VARNING ' + (fel === 0 && varning === 0 ? '— GRÖN' : fel === 0 ? '— GRÖN med varningar' : '— RÖD') + ' ────');
process.exit(fel === 0 ? 0 : 1);
