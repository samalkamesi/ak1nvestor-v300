#!/usr/bin/env node
// _s5u3o33-sond.mjs — sond mot public/deep-courses.json (501 kurser, ALLA textfält):
// räknar kursägare per term (case-insensitive, svensk+engelsk stavning).
// Kandidater för omgång o33 (u3:s linjer bf/od/kt/ln/ks/mt):
//   kt-12 aktivismen · od-12 reala optioner · bf-19 ankaret
//   + reservlinjer ln-07 / ks-10 / mt-10.
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
  // kt-12-aktivismen-kandidater
  ['aktivist'], ['aktieägaraktivism'], ['aktivistfond'], ['engagemangsbrev'],
  ['proxy fight'], ['aktivistkampanj'], ['styrelsekupp'],
  // od-12-reala-optioner-kandidater
  ['reala optioner'], ['realoption'], ['real option'], ['expansionsoption'],
  ['övergivandeoption'], ['flexibilitetsvärde'], ['optionsvärde i kapital'],
  // bf-19-ankaret-kandidater
  ['ankare'], ['ankarne'], ['anchoring'], ['förankringseffekt'],
  ['förankrad'], ['52-veckors'], ['utgångspunktstal'],
  // ln-07-reservkandidater
  ['kapitalomsättningshastighet'], ['ebitda'], ['avskrivningsspelrum'],
  ['kapitalomsättning'],
  // ks-10-reservkandidater
  ['leasing'], ['sale and leaseback'], ['återköpsmekanism'], ['andelsåterköp'],
  ['återköp'],
  // mt-10-reservkandidater
  ['nätverkseffekt'], ['plattformseffekt'], ['tvåsidig marknad'],
  ['two-sided market'], ['varumärkesmoat'], ['nätverkseffekter'],
];

console.log('ANTAL KURSER I REGISTRET:', slugs.length, '\n');
for (const [t] of termer) {
  const hits = owners(t);
  console.log(`«${t}» — ${hits.length} kursägare${hits.length ? ': ' + hits.slice(0, 12).join(', ') + (hits.length > 12 ? ` (+${hits.length - 12} till)` : '') : '  <<VIT FLÄCK>>'}`);
}
