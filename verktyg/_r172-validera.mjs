#!/usr/bin/env node
// _r172-validera.mjs — validera mätverktygets tre RÖD-klasser mot verkliga exempel
import fs from 'node:fs';
const ROT = '/home/ak1a/agent/ak1';
const DIR = `${ROT}/data/blogg-utkast/kvartal/2026-q3`;
const ut = [];

// 1. "inga externa käll-URL:er" — hur ser ABB:s källor ut?
const abb = JSON.parse(fs.readFileSync(`${DIR}/sa-laser-du-abb-q3-2026.json`, 'utf8'));
const abbKällor = abb.body.indexOf('Källor');
ut.push('=== ABB: källsektionen (600 tecken) ===');
ut.push(abb.body.slice(abbKällor >= 0 ? abbKällor : -600, (abbKällor >= 0 ? abbKällor : abb.body.length - 600) + 600));
ut.push('\nABB: URL-förekomster i hela kroppen: ' + (abb.body.match(/https?:\/\//g) || []).length);
ut.push('ABB: "www."/".com"/".se"-förekomster: ' + (abb.body.match(/(www\.|[a-z0-9.-]+\.(com|se|net|org|io))/gi) || []).slice(0, 8).join(', '));

// 2. rådverb — vilka satser?
for (const slug of ['sa-laser-du-assa-abloy-q3-2026', 'sa-laser-du-nflx-q3-2026', 'sa-laser-du-tele2-q3-2026']) {
  const p = JSON.parse(fs.readFileSync(`${DIR}/${slug}.json`, 'utf8'));
  ut.push(`\n=== ${slug}: satser med köp/sälj/bör du ===`);
  const satser = p.body.split(/(?<=[.!?])\s+/).filter((s) => /\b(köp|sälj|bör du)\b/i.test(s));
  for (const s of satser.slice(0, 6)) ut.push('· ' + s.trim().slice(0, 180));
}

// 3. överlånga — vz:s struktur
const vz = JSON.parse(fs.readFileSync(`${DIR}/sa-laser-du-vz-q3-2026.json`, 'utf8'));
ut.push(`\n=== vz: ${vz.body.match(/\S+/g).length} ord · H2: ${(vz.body.match(/^## /gm) || []).join(' | ')}`);
ut.push('vz: har disclaimer: ' + /inte (en )?(rekommendation|investeringsråd)|pedagogisk finansanalys/i.test(vz.body));
ut.push('vz: URL:er: ' + (vz.body.match(/https?:\/\//g) || []).length);

fs.writeFileSync('/tmp/r172-validera.txt', ut.join('\n') + '\n');
console.log('skrev /tmp/r172-validera.txt');
