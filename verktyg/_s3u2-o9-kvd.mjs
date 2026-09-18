#!/usr/bin/env node
// KVD för Ö9 (bilaktier-en) — spår 3, s3-u2, manifest auto-s3-1789698329947
// Kontrollerar: form, ord, sökordsdisciplin, korslänksparitet (multiset),
// talparitet mot B10, varumärkesgrindens FEL-regexer + engelska rådverb.
import { readFileSync } from 'node:fs';

const en = JSON.parse(readFileSync('/home/ak1a/AK1/data/blogg-utkast/bilaktier-sa-analyserar-du-biltillverkare-en.json', 'utf8'));
const sv = JSON.parse(readFileSync('/home/ak1a/AK1/data/blogg-utkast/bilaktier-sa-analyserar-du-biltillverkare.json', 'utf8'));
const rader = [];
const ok = (namn, villkor, info = '') => rader.push(`${villkor ? 'GRÖN' : 'RÖD'} ${namn}${info ? ' — ' + info : ''}`);

// 1. Form
const falt = ['slug', 'title', 'description', 'pillar', 'author', 'publishedAt', 'readingMinutes', 'tags', 'body'];
ok('Form: alla BlogPost-fält', falt.every(f => en[f] !== undefined));
ok('Slug = originalets + -en', en.slug === sv.slug + '-en');
ok('Title ≤ 60 tkn', en.title.length <= 60, `${en.title.length}/60`);
ok('OG-description ≤ 155 tkn', en.description.length <= 155, `${en.description.length}/155`);
ok('Pillar/author identiska med originalet', en.pillar === sv.pillar && en.author === sv.author);
ok('publishedAt = leveransdag 2026-09-18', en.publishedAt === '2026-09-18');

// 2. Ord + readingMinutes
const ordRå = en.body.split(/\s+/).filter(Boolean).length;
ok('Ord rå ≥ 1200 (mål band ~1380–1450)', ordRå >= 1200, `${ordRå} (originalet ${sv.body.split(/\s+/).filter(Boolean).length})`);
ok('readingMinutes = round(ord/600)', en.readingMinutes === Math.round(ordRå / 600), `rm ${en.readingMinutes} = round(${ordRå}/600)`);

// 3. Sökordsdisciplin: "car stocks" i title + ingress (första stycket) + ≥1 H2
const primär = 'car stocks';
const ingress = en.body.split('\n\n')[0];
const h2 = en.body.split('\n').filter(l => l.startsWith('## '));
ok(`Primärt sökord "${primär}" i title`, en.title.toLowerCase().includes(primär));
ok(`Primärt sökord i ingress`, ingress.toLowerCase().includes(primär));
ok(`Primärt sökord i ≥1 H2`, h2.filter(l => l.toLowerCase().includes(primär)).length >= 1, `${h2.filter(l => l.toLowerCase().includes(primär)).length} st`);
ok('H2 ≥ 2', h2.length >= 2, `${h2.length} H2 (varav Sources)`);

// 4. Korslänkar multiset-identiska med originalet
const länkar = (b) => [...b.matchAll(/\]\((\/[^)]+)\)/g)].map(m => m[1]);
const ms = (a) => { const m = {}; a.forEach(x => m[x] = (m[x] || 0) + 1); return m; };
const msEn = ms(länkar(en.body)), msSv = ms(länkar(sv.body));
ok('Korslänkar MULTISET-identiska med B10', JSON.stringify(msEn) === JSON.stringify(msSv), `${länkar(en.body).length} länkar`);

// 5. Talparitet: B10:s tal (svensk form) → engelsk form måste finnas i -en
const par = [
  ['96,4', '96.4'], ['3,9', '3.9'], ['15,6', '15.6'], ['18,9', '18.9'],
  ['6,0', '6.0'], ['0,37', '0.37'], ['0,8', '0.8'], ['4,3', '4.3'],
  ['15,3', '15.3'], ['3,3', '3.3'], ['15,4', '15.4'], ['15,0', '15.0'],
  ['7,1', '7.1'], ['3,8', '3.8'], ['34,5', '34.5'], ['2,4', '2.4'], ['30,6', '30.6'],
  ['300 000', '300,000'], ['400 000', '400,000'], ['340 000', '340,000'],
  ['60 000', '60,000'], ['255 000', '255,000'], ['380 000', '380,000'],
  ['334', '334'], ['66 procent', '66 percent'], ['2024', '2024'], ['2025', '2025'], ['2023', '2023'],
  ['245', '245'], ['385', '385'], ['21 miljoner', '21 million'], ['23 miljoner', '23 million'],
];
const saknade = par.filter(([sve, eng]) => !en.body.includes(eng));
ok('Talparitet: samtliga B10-tal närvarande i engelsk form', saknade.length === 0, saknade.length ? 'SAKNAS: ' + saknade.map(x => x[1]).join(', ') : `${par.length}/${par.length}`);

// 6. Aritmetik (exempelblocket) — oberoende omräkning
const arit = [];
arit.push(['Intäkt 300,000 × 400,000 = 120 bn', 300000 * 400000 === 12000000000000 / 1000 || 300000 * 400000 / 1e9 === 120]);
arit.push(['TB 300,000 × 60,000 = 18 bn', 300000 * 60000 / 1e9 === 18]);
arit.push(['EBIT 18 − 12 = 6', 18 - 12 === 6]);
arit.push(['Volymfall: TB 255,000 × 60,000 = 15.3 bn', Math.abs(255000 * 60000 / 1e9 - 15.3) < 0.001]);
arit.push(['Volymfall: resultat 15.3 − 12 = 3.3', Math.abs(15.3 - 12 - 3.3) < 0.001]);
arit.push(['Hävstång 45/15 = 3×', 45 / 15 === 3]);
arit.push(['Prisfall: TB 300,000 × 40,000 = 12 bn', 300000 * 40000 / 1e9 === 12]);
arit.push(['Tesla −53 %: (15.0−7.1)/15.0', Math.abs((15.0 - 7.1) / 15.0 * 100 - 52.7) < 0.5]);
arit.push(['Tesla −46 %: (7.1−3.8)/7.1', Math.abs((7.1 - 3.8) / 7.1 * 100 - 46.5) < 0.5]);
arit.push(['LVMH 66 > 3× Volvo 15.6', 66 / 15.6 > 3]);
ok('Aritmetik 10/10', arit.every(([, v]) => v), arit.filter(([, v]) => !v).map(([n]) => n).join('; ') || '10/10');

// 7. Varumärkesgrind: FEL-regexer (svenska) + engelska rådverb — 0 träffar
const vm = JSON.parse(readFileSync('/home/ak1a/AK1/data/varumarke.json', 'utf8'));
const ytor = [en.title, en.description, en.body].join('\n');
const felTräffar = [];
for (const f of vm.forbjudnaFraser || []) {
  if (f.allvar !== 'FEL') continue;
  try { if (new RegExp(f.fran, 'giu').test(ytor)) felTräffar.push(f.fran); } catch { /* ogiltig regex hoppas */ }
}
ok('Varumärkesgrind FEL-regexer 0 träffar', felTräffar.length === 0, felTräffar.join(', ') || '0');
const rådEN = ['you should buy', 'should sell', 'buy this stock', 'sell this stock', 'we recommend buy', 'we recommend sell', 'guaranteed return', 'risk[- ]free investment', 'guaranteed profit', 'stock tips? for you', 'best stock to buy', 'invest in this stock'];
const rådTräff = rådEN.filter(p => new RegExp(p, 'i').test(ytor));
ok('Engelska rådverb 0 träffar', rådTräff.length === 0, rådTräff.join(', ') || `0/${rådEN.length} mönster`);

// 8. Disclaimer-sista-rad
ok('Disclaimer-sista-rad (engelsk form)', en.body.trimEnd().endsWith('_This is educational financial analysis, not investment advice._'));
// och att den negerade formuleringen är den ENDA "investment advice"-förekomsten
const iaCount = (ytor.match(/investment advice/gi) || []).length;
ok('"investment advice" enbart i negerad disclaimer-kontext', iaCount === 1, `${iaCount} förekomst(er)`);

// 9. Källor
const srcLänkar = [...en.body.matchAll(/\[([^\]]+)\]\((https?:\/\/[^)]+)\)/g)].map(m => m[2]);
ok('Sources-sektion med externa källor', h2.some(l => l === '## Sources') && srcLänkar.length >= 5, `${srcLänkar.length} externa källor`);

console.log(rader.join('\n'));
const röda = rader.filter(r => r.startsWith('RÖD')).length;
console.log(`\nSLUTSATS: ${röda === 0 ? 'KVD GRÖN — 0 röda av ' + rader.length : 'KVD RÖD — ' + röda + ' röda'}`);
process.exit(röda === 0 ? 0 : 1);
