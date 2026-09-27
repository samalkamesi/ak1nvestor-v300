#!/usr/bin/env node
// _r191-byggar-sondra.mjs — bygg-ar (AR29): inventering BÅDA träd + originalet B27 i sin helhet
import fs from 'node:fs';
const ROT = '/home/ak1a/agent/ak1';
const PROD = '/home/ak1a/AK1';
const ut = [];

// 1. Båda träden: bygg-filer + klaimer
for (const [namn, rot] of [['WS', ROT], ['PROD', PROD]]) {
  const filer = fs.readdirSync(`${rot}/data/blogg-utkast`).filter((f) => /bygg/i.test(f));
  ut.push(`${namn} bygg-filer: ${filer.join(' · ') || '(inga)'}`);
  const klaimer = fs.readdirSync(`${rot}/data/vakten`).filter((f) => /bygg.*ar\b|ar29/i.test(f));
  ut.push(`${namn} klaimer (bygg-ar/ar29): ${klaimer.join(' · ') || '(inga)'}`);
}

// 2. Originalet B27: hela kroppen + meta
const o = JSON.parse(fs.readFileSync(`${ROT}/data/blogg-utkast/byggaktier-sa-analyserar-du-byggbolag.json`, 'utf8'));
ut.push(`\nMETA: slug=${o.slug} · publishedAt=${o.publishedAt} · pillar=${o.pillar} · author=${o.author} · readingMinutes=${o.readingMinutes} · tags=${o.tags.join('|')}`);
ut.push(`title=${o.title} (${[...o.title].length} tkn)`);
ut.push(`description=${o.description}`);
ut.push(`ord=${o.body.match(/\S+/g).length} · H2=${(o.body.match(/^## /gm) || []).length} · H1=${(o.body.match(/^# /gm) || []).length}`);
ut.push('--- KROPPEN (hela) ---');
ut.push(o.body);

fs.writeFileSync('/tmp/r191-byggar-sondra.txt', ut.join('\n') + '\n');
console.log('skrev /tmp/r191-byggar-sondra.txt');
