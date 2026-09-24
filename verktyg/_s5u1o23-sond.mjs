#!/usr/bin/env node
// Sond för spår 5 omgång 23, s5-u1: verifiera am-09 MARGINALHANDEL som vit fläck
// mot 464-registret. Söker titel+summary+why+learn+history+chapters i
// public/deep-courses.json efter kärntermer. 0 kursägare = vit fläck.
import { readFileSync } from 'node:fs';

const reg = JSON.parse(readFileSync('/home/ak1a/AK1/public/deep-courses.json', 'utf8'));

function soktext(p) {
  const kap = (p.chapters || []).map(c =>
    [c.title || '', ...(c.blocks || []).map(b => typeof b === 'string' ? b : (b.content || ''))].join(' ')
  ).join(' ');
  return [p.title, p.summary, p.why, p.learn, p.history, p.lynchSection, p.grahamSection, p.ak1Section, kap]
    .filter(Boolean).join(' ').toLowerCase();
}

const termer = {
  'am-09 MARGINALHANDEL (kandidat)': [
    'marginalhandel', 'belåningsgrad', 'marginalkrav', 'marginkrav', 'kontobelåning',
    'margin call', 'tvångsförsäljning', 'likvidationsrisk', 'hävstång på kontot',
    'belåna aktier', 'aktiebelåning', 'effekt'
  ],
  'vm-12 KÄNSLIGHETSMATRISEN (kandidat, gräns mot st-02)': [
    'känslighetsmatris', 'tornadodiagram', 'känslighetstabell'
  ],
  'gränstermer (VEM äger vad — differentiering)': [
    'hävstång', 'belåning', 'kortlage', 'stressa', 'stresstest', 'känslighetsanalys',
    'raketer', 'interstellar'
  ]
};

for (const [namn, lista] of Object.entries(termer)) {
  console.log(`\n=== ${namn} ===`);
  for (const t of lista) {
    const traefar = Object.entries(reg).filter(([slug, p]) => soktext(p).includes(t.toLowerCase()));
    if (traefar.length === 0) {
      console.log(`  "${t}": 0 träffar — VIT FLÄCK`);
    } else {
      console.log(`  "${t}": ${traefar.length} — ${traefar.slice(0, 6).map(([s]) => s).join(', ')}${traefar.length > 6 ? ' …' : ''}`);
    }
  }
}
console.log(`\nRegisterstorlek: ${Object.keys(reg).length}`);
