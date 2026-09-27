#!/usr/bin/env node
// _r192-v172-kal.mjs — kalendrarnas struktur + vecka 40–44-sammanställning ur alla 10 branchkalendrar
import fs from 'node:fs';
const ROT = '/home/ak1a/agent/ak1';
const dir = `${ROT}/data/blogg-utkast/kvartal/2026-q3`;
const ut = [];

const kalFiler = fs.readdirSync(dir).filter((f) => f.startsWith('kalender-')).sort();
ut.push('=== KALENDER-STRUKTUR (kalender-finans.json, första 1800 tecknen) ===');
ut.push(fs.readFileSync(`${dir}/kalender-finans.json`, 'utf8').slice(0, 1800));

// Sammanställ alla kalendrar: extrahera bolag + datum
ut.push('\n=== SAMMANSTÄLLNING: rapportdatum ur alla kalendrar ===');
const rader = [];
for (const f of kalFiler) {
  const k = JSON.parse(fs.readFileSync(`${dir}/${f}`, 'utf8'));
  const nycklar = Object.keys(k);
  ut.push(`${f}: toppnycklar=${nycklar.join(',')}`);
  // vanliga mönster: k.bolag[].{namn,datum} eller k.poster — sondera
  const arr = Array.isArray(k) ? k : (k.bolag || k.poster || k.kalender || k.rader || null);
  if (Array.isArray(arr)) {
    for (const p of arr) rader.push({ kal: f.replace('kalender-', '').replace('.json', ''), ...p });
  }
}
ut.push(`\nextraherade poster: ${rader.length}`);
if (rader.length > 0) {
  ut.push('exempelpost: ' + JSON.stringify(rader[0]));
  // datumfält — hitta det som ser ut som datum
  for (const r of rader.slice(0, 30)) ut.push(JSON.stringify(r).slice(0, 220));
}

fs.writeFileSync('/tmp/r192-kal.txt', ut.join('\n') + '\n');
console.log('skrev /tmp/r192-kal.txt');
