#!/usr/bin/env node
// _s5u3o33-sond2.mjs — sond v2: kandidater efter sond v1:s fall (vm-05 realoptioner,
// bf-05/km-020 ankare, kt-07 aktivism, v15 nätverk, v20 återköp).
import { readFileSync } from 'node:fs';

const reg = JSON.parse(readFileSync('/home/ak1a/AK1/public/deep-courses.json', 'utf8'));
const slugs = Object.keys(reg);

function textOf(kurs) {
  const out = [];
  (function walk(v) {
    if (typeof v === 'string') out.push(v);
    else if (Array.isArray(v)) v.forEach(walk);
    else if (v && typeof v === 'object') Object.values(v).forEach(walk);
  })(kurs);
  return out.join('\n');
}
const corpus = new Map();
for (const s of slugs) corpus.set(s, textOf(reg[s]).toLowerCase());

function owners(term) {
  const t = term.toLowerCase();
  const hits = [];
  for (const [s, txt] of corpus) if (txt.includes(t)) hits.push(s);
  return hits;
}

const termer = [
  // bf-19-kandidater (generation 2)
  ['dispositionseffekt'], ['mentala konton'], ['mental redovisning'],
  ['sunk cost'], ['fallkostnad'], ['bekräftelsebias'], ['ånger'],
  ['representativitet'], ['haltering'], ['småningom'],
  // od-12-kandidater (generation 2)
  ['variansswap'], ['volatilitetsindex'], ['vix'], ['open interest'],
  ['gammablage'], ['inlösen'], ['amerikansk option'], ['europeisk option'],
  ['0dte'], ['förfallostruktur'],
  // kt-12-kandidater (generation 2)
  ['aktiesplit'], ['vd-byte'], ['ledarskapsbyte'], ['rekonstruktion'],
  ['konkurs'], ['utdelningshöjning'], ['utdelningsinitiering'], ['kapitalmarknadsdag'],
  ['investeringsträff'], ['UTDOWN'],
  // bk-10-kandidater (generation 2)
  ['nedskrivning'], ['nedskrivningstest'], ['impairment'], ['värde i användning'],
  ['segment'], ['segmentrapportering'], ['segmentmarginal'],
  // ln-07/mt-kontroller
  ['avskrivningspolitik'], ['nyttjandeperiod'], ['skalfördelar'],
  ['underhållsinvestering'], ['restvärde'],
];

console.log('ANTAL KURSER I REGISTRET:', slugs.length, '\n');
for (const [t] of termer) {
  const hits = owners(t);
  console.log(`«${t}» — ${hits.length} kursägare${hits.length ? ': ' + hits.slice(0, 10).join(', ') + (hits.length > 10 ? ` (+${hits.length - 10} till)` : '') : '  <<VIT FLÄCK>>'}`);
}
