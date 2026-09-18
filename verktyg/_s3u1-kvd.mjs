// KVD-sond för s3-u1: kryptoaktier-guide (mall SEO-GUIDER-2026-09.md)
import { readFileSync, readdirSync } from 'node:fs';

const fil = '/home/ak1a/AK1/data/blogg-utkast/kryptoaktier-sa-analyserar-du-kryptobolag.json';
const rå = readFileSync(fil, 'utf8');
const p = JSON.parse(rå);
const fel = [], varningar = [];

// 1. Exakt BlogPost-schema (9 fält, rätt namn, inga extra)
const fält = ['slug','title','description','pillar','author','publishedAt','readingMinutes','tags','body'];
const nycklar = Object.keys(p);
if (JSON.stringify(nycklar) !== JSON.stringify(fält)) fel.push(`Schema: ${nycklar.join(',')} ≠ ${fält.join(',')}`);
for (const k of fält) if (p[k] === undefined || p[k] === null || p[k] === '') fel.push(`Fält tomt: ${k}`);

// 2. Ordantal (whitespace-token med bokstäver/siffror)
const ord = p.body.split(/\s+/).filter(w => /[a-zA-Z0-9åäöÅÄÖ]/.test(w));
console.log(`Ord (body): ${ord.length}`);
if (ord.length < 1150 || ord.length > 1400) fel.push(`Ordantal ${ord.length} utanför 1150–1400`);

// 3–4. Längder
console.log(`Title: ${p.title.length} tkn; Description: ${p.description.length} tkn`);
if (p.title.length > 60) fel.push(`Title ${p.title.length} > 60`);
if (p.description.length > 155) fel.push(`Description ${p.description.length} > 155`);

// 5. Sökordsdisciplin: primärt ord i H1 + ingress + ≥1 H2
const sokord = 'kryptoaktier';
const H1 = (p.body.match(/^# .+$/m) || [])[0] || '';
const ingress = ord.slice(0, 130).join(' ');
const H2 = p.body.match(/^## .+$/gm) || [];
if (!H1.toLowerCase().includes(sokord)) fel.push('Primärt sökord saknas i H1');
if (!ingress.toLowerCase().includes(sokord)) fel.push('Primärt sökord saknas i ingress (första 130 orden)');
if (!H2.some(h => h.toLowerCase().includes(sokord))) fel.push('Primärt sökord saknas i H2');
console.log(`Sökord "${sokord}": H1=${H1.toLowerCase().includes(sokord)} ingress=${ingress.toLowerCase().includes(sokord)} H2-antalet med ord=${H2.filter(h=>h.toLowerCase().includes(sokord)).length}`);
const total = (p.body.toLowerCase().match(/kryptoaktier/g) || []).length;
console.log(`Förekomst av "${sokord}" i body: ${total}`);

// 6. Disclaimer exakt sista rad
const rader = p.body.split('\n').map(r => r.trim()).filter(r => r !== '');
const sista = rader[rader.length - 1];
if (sista !== '_Detta är pedagogisk finansanalys, inte investeringsråd._') fel.push(`Disclaimer-sista-rad fel: "${sista}"`);

// 7. Rådgivningsglossor (juridikgrind 2007:528)
const glossor = ['rekommenderar','aktietips','vi tipsar','bör köpa','bör sälja','köp aktie','sälj aktie','investera i','ska du köpa','köper du aktien'];
for (const g of glossor) if (p.body.toLowerCase().includes(g)) fel.push(`Rådgivningsglossa träff: "${g}"`);

// 8. Korslänkar: kurser mot deep-courses.json, blogg mot publicerade poster
const kurser = JSON.parse(readFileSync('/home/ak1a/AK1/public/deep-courses.json', 'utf8'));
const kursSlugs = new Set(Object.keys(kurser));
const bloggSlugs = new Set(readdirSync('/home/ak1a/AK1/data/blogg').filter(f => f.endsWith('.json')).map(f => f.replace(/\.json$/, '')));
const länkar = [...p.body.matchAll(/\]\((\/(?:kurser|blogg)\/[^)]+)\)/g)].map(m => m[1]);
console.log(`Korslänkar: ${länkar.join(', ')}`);
for (const l of länkar) {
  const slug = l.replace(/^\/(kurser|blogg)\//, '').replace(/\/$/, '');
  if (l.startsWith('/kurser/') && !kursSlugs.has(slug)) fel.push(`Kurslänk ej verifierad: ${l}`);
  if (l.startsWith('/blogg/') && !bloggSlugs.has(slug)) fel.push(`Blogglänk till ej publicerad post: ${l}`);
}
// Inga länkar mellan utkast
if (/\/blogg-utkast\//.test(p.body)) fel.push('Länk till utkastsmapp i body');

// 9. Superlativsond (manuell motivering krävs per träff)
const sup = ['högst ','lägst ','störst ','första ','enda ','bäst ','största ','minst '];
for (const s of sup) { const n = (p.body.toLowerCase().split(s).length - 1); if (n > 0) varningar.push(`Superlativ "${s.trim()}" ×${n} — motivera mot källa`); }

// 10–11. Datum + läsminuter
if (p.publishedAt !== '2026-09-18') fel.push(`publishedAt ${p.publishedAt} ≠ skapandedatum`);
const rm = Math.round(ord.length / 600);
if (p.readingMinutes !== rm) fel.push(`readingMinutes ${p.readingMinutes} ≠ round(${ord.length}/600)=${rm}`);

// Taggar 2–6
if (!Array.isArray(p.tags) || p.tags.length < 2 || p.tags.length > 6) fel.push(`Tags-antal ${p.tags?.length} utanför 2–6`);

console.log('\n--- RESULTAT ---');
if (varningar.length) console.log('VARNINGAR (motivera):'); varningar.forEach(v => console.log('  ⚠ ' + v));
if (fel.length) { console.log('FEL:'); fel.forEach(f => console.log('  ✗ ' + f)); process.exit(1); }
console.log('KVD GRÖN — alla kontroller passerade');
