#!/usr/bin/env node
// ROND 106 — universumstöd för nästa branschomgång (skog? energi? råvaru?)
import { readFileSync } from 'node:fs';
const uni = JSON.parse(readFileSync('/home/ak1a/AK1/data/portfolj-system/bolagsunivers.json', 'utf-8'));
console.log('universum:', uni.length, 'bolag');
const bransch = {};
for (const r of uni) { const b = r.bransch || '?'; bransch[b] = (bransch[b] || 0) + 1; }
console.log('branscher:', JSON.stringify(bransch));
const hitta = (txt) => uni.filter((r) => JSON.stringify(r).toLowerCase().includes(txt)).map((r) => r.ticker + ' ' + r.namn);
for (const sok of ['skog', 'virke', 'forest', 'sca', 'holmen', 'vestas', 'öresund', 'energi', 'olja', 'gruva', 'mining']) {
  const t = hitta(sok);
  if (t.length) console.log(sok + ':', t.slice(0, 6).join(' · '));
}
