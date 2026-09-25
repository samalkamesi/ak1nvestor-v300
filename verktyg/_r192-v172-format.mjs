#!/usr/bin/env node
// _r192-v172-format.mjs — kvartal/2026-q3-fragmenten + en publicerad Q3-artikels format + seriens omfattning
import fs from 'node:fs';
const ROT = '/home/ak1a/agent/ak1';
const ut = [];

// 1. Fragmentkatalogen
const dir = `${ROT}/data/blogg-utkast/kvartal/2026-q3`;
ut.push('=== data/blogg-utkast/kvartal/2026-q3/ ===');
if (fs.existsSync(dir)) {
  for (const f of fs.readdirSync(dir)) {
    const s = fs.statSync(`${dir}/${f}`);
    ut.push(`${f}: ${s.size} byte · mtime ${s.mtime.toISOString()}`);
  }
} else ut.push('(finns ej)');

// 2. Publicerade serieartiklar: format + publishedAt
const blogg = fs.readdirSync(`${ROT}/data/blogg`).filter((f) => f.endsWith('.json'));
ut.push(`\n=== data/blogg: alla 'sa-laser-du'-artiklar (${blogg.filter((f) => f.startsWith('sa-laser-du')).length}) ===`);
for (const f of blogg.filter((f) => f.startsWith('sa-laser-du'))) {
  const d = JSON.parse(fs.readFileSync(`${ROT}/data/blogg/${f}`, 'utf8'));
  ut.push(`${f}: publishedAt=${d.publishedAt} · ord≈${String(d.body).match(/\S+/g).length} · H2=${(String(d.body).match(/^## /gm) || []).length}`);
}

// 3. En Q3-artikels struktur (rubriker + första sektionen)
const eric = JSON.parse(fs.readFileSync(`${ROT}/data/blogg/sa-laser-du-ericsson-q3-2026.json`, 'utf8'));
ut.push('\n=== sa-laser-du-ericsson-q3-2026 — struktur ===');
ut.push(`title: ${eric.title}`);
ut.push(`description: ${eric.description}`);
ut.push(`H2: ${(eric.body.match(/^## .*$/gm) || []).join(' | ')}`);
ut.push('kroppens första 1200 tecken:');
ut.push(eric.body.slice(0, 1200));

fs.writeFileSync('/tmp/r192-format.txt', ut.join('\n') + '\n');
console.log('skrev /tmp/r192-format.txt');
