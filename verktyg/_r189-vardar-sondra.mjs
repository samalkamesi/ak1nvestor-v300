#!/usr/bin/env node
// _r189-vardar-sondra.mjs — vård-ar (AR28): inventering BÅDA träd + originalet + malläge
import fs from 'node:fs';
const ROT = '/home/ak1a/agent/ak1';
const PROD = '/home/ak1a/AK1';
const ut = [];

// 1. Hitta B25-originalet + släktfilerna i båda träden
ut.push('=== VÅRD-FILURI (workspace + prod) ===');
for (const [namn, rot] of [['WS', ROT], ['PROD', PROD]]) {
  const filer = fs.readdirSync(`${rot}/data/blogg-utkast`).filter((f) => /v[aå]rd/i.test(f));
  ut.push(`${namn}: ${filer.join(' · ') || '(inga)'}`);
}
// klaimer
ut.push('\n=== KLAIMER (vård/ar28/vard) workspace ===');
ut.push(fs.readdirSync(`${ROT}/data/vakten`).filter((f) => /v[aå]rd|ar28/i.test(f)).join(' · ') || '(inga)');
ut.push('=== KLAIMER prod ===');
ut.push(fs.readdirSync(`${PROD}/data/vakten`).filter((f) => /v[aå]rd|ar28/i.test(f)).join(' · ') || '(inga)');

// 2. Originalet: hela kroppen (vård-en hette "vård-en (B25-en)" — originalet är B25)
const kandidater = fs.readdirSync(`${ROT}/data/blogg-utkast`).filter((f) => /^v[aå]rdaktier.*\.json$/.test(f) && !/-en\.json$/.test(f) && !/-ar\.json$/.test(f));
ut.push(`\n=== ORIGINAL-KANDIDATER: ${kandidater.join(', ') || 'INGA'} ===`);
if (kandidater.length === 1) {
  const o = JSON.parse(fs.readFileSync(`${ROT}/data/blogg-utkast/${kandidater[0]}`, 'utf8'));
  const ord = o.body.match(/\S+/g).length;
  ut.push(`slug=${o.slug} · publishedAt=${o.publishedAt} · ord=${ord} · H2=${(o.body.match(/^## /gm) || []).length} · H1=${(o.body.match(/^# /gm) || []).length} · tags=${o.tags.join('|')}`);
  ut.push('--- KROPPEN (hela) ---');
  ut.push(o.body);
}
fs.writeFileSync('/tmp/r189-vardar-sondra.txt', ut.join('\n') + '\n');
console.log('skrev /tmp/r189-vardar-sondra.txt');
