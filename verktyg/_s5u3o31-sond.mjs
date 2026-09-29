#!/usr/bin/env node
// _s5u3o31-sond.mjs — sond mot public/deep-courses.json (495 kurser, ALLA textfält):
// räknar kursägare per term (case-insensitive, svensk+engelsk stavning).
// Vit fläck = 0 kursägare. Kandidater: mt-09 regleringsmoat (o27-könotans reserv),
// kt-11 indexinklusionen, rs-10 eventualförpliktelser/garantier, ek-08 survivorship m.fl.
import { readFileSync } from 'node:fs';

const reg = JSON.parse(readFileSync('/home/ak1a/AK1/public/deep-courses.json', 'utf8'));
const slugs = Object.keys(reg);

function textOf(kurs) {
  // Samla ALLA textfält rekursivt
  const out = [];
  (function walk(v) {
    if (typeof v === 'string') out.push(v);
    else if (Array.isArray(v)) v.forEach(walk);
    else if (v && typeof v === 'object') Object.values(v).forEach(walk);
  })(kurs);
  return out.join('\n');
}
const corpus = new Map(); // slug -> fulltext
for (const s of slugs) corpus.set(s, textOf(reg[s]).toLowerCase());

function owners(term) {
  const t = term.toLowerCase();
  const hits = [];
  for (const [s, txt] of corpus) if (txt.includes(t)) hits.push(s);
  return hits;
}

const termer = [
  // mt-09-regleringsmoat-kandidater
  ['regleringsmoat', 'reglerad moat'], ['regleringsmoat', 'moat från lagstiftaren'],
  ['tillåten avkastning'], ['reglerad avkastning'], ['pristak'], ['inkelåsning'],
  ['tillståndsmarknad'], ['licensmoat'],
  // kt-11-indexinklusionen-kandidater
  ['indexinklusion'], ['indexinklusion (s&p'], ['tas in i index'], ['indexförändring'],
  ['rebalanseringsflöde'], ['terminsstyrelse'],
  // rs-10-eventualförpliktelser-kandidater
  ['eventualförpliktelse'], ['borgen'], ['garantiåtagande'], ['processrisk'],
  ['eventualförpliktelser'],
  // ek-08-survivorship-kandidater
  ['survivorship'], ['överlevnadsbias'], ['urvalsbias'],
  // reservkandidater
  ['nyckelperson'], ['ägarkoncentration'], ['större ägare'],
];

console.log('ANTAL KURSER I REGISTRET:', slugs.length, '\n');
for (const [t, alias] of termer) {
  const hits = owners(t);
  console.log(`«${t}» ${alias ? `(alias: ${alias})` : ''} — ${hits.length} kursägare${hits.length ? ': ' + hits.join(', ') : '  <<VIT FLÄCK>>'}`);
}
