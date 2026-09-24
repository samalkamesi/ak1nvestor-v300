// _s1u1-sandvik-prep.mjs — snabbkontroller före sondbygge (läser, skriver ej)
import { readFileSync } from 'node:fs';
const d = JSON.parse(readFileSync('/home/ak1a/AK1/data/blogg-utkast/kvartal/2026-q3/sa-laser-du-sandvik-q3-2026.json', 'utf8'));
const b = d.body;
const all = d.title + ' ' + d.description + ' ' + b;

const tests = [
  ['B1 tre år i rad', 'föll tre år i rad'],
  ['B2 stavfel mätte', 'senaste mätte värden'],
  ['B3 nettobmargin', 'nettobmargin'],
  ['nettomarginal över', 'nettomarginal över medianen'],
  ['(13,1 mot 12,2)', '(13,1 mot 12,2)'],
  ['(0,43 mot 0,46)', '(0,43 mot 0,46)'],
  ['(19,7 mot 16,9)', '(19,7 mot 16,9)'],
];
for (const [n, s] of tests) console.log(n, ':', b.split(s).length - 1, 'träffar');

console.log('---911---');
for (const m of ['911', '11 september', 'september 2001', '9/11', 'terror', 'terrordåd'])
  console.log(m, all.toLowerCase().split(m.toLowerCase()).length - 1);

console.log('---LAGRUM---');
for (const m of ['2007:528', '2022:260', '2022:261', '1985:716', '2005:59', '2022:482', '2 kap 5'])
  console.log(m, b.split(m).length - 1);

console.log('---RÄDGLOSSOR med kontext---');
for (const m of ['rekommendation', 'rekommendera', 'köpa', 'sälja', 'bör du', 'bra affär', 'handssignal', 'handla']) {
  let i = -1;
  while ((i = b.toLowerCase().indexOf(m, i + 1)) !== -1)
    console.log('[' + m + '] …' + b.slice(Math.max(0, i - 55), i + m.length + 35).replace(/\n/g, ' ') + '…');
}

console.log('---STRUKTUR---');
const h2 = b.match(/^## .*/gm) || [];
console.log('H2 (' + h2.length + '):', h2.map(s => s.slice(3)).join(' | '));
console.log('title tkn:', d.title.length, '| desc tkn:', d.description.length);
const ren = b.replace(/\[[^\]]*\]\([^)]*\)/g, ' ').replace(/[#*|`>-]/g, ' ');
console.log('ord (länktext+markdown rensat):', ren.split(/\s+/).filter(Boolean).length);
console.log('mjuka bindestreck:', (b.match(/\u00ad/g) || []).length);
console.log('dubbla mellanslag:', (b.match(/  /g) || []).length);
console.log('typogr citat »«“”: ', (b.match(/[»«“”]/g) || []).length);
console.log('raka citat i body:', (b.match(/"/g) || []).length);
console.log('decimalpunkt mellan siffror:', (b.match(/\d\.\d/g) || []).length);

console.log('---LÄNKAR---');
const ls = [...new Set([...b.matchAll(/\]\((\/[^)]+)\)/g)].map(m => m[1]))];
console.log('unika:', ls.length);
for (const l of ls) console.log(' ', l);
