#!/usr/bin/env node
// _r172-roda.mjs — de tre RÖDA: konkreta träffar
import fs from 'node:fs';
const DIR = '/home/ak1a/agent/ak1/data/blogg-utkast/kvartal/2026-q3';
const ut = [];

// 1. hm-b: varumärkesgrindens träff i kontext
const hm = JSON.parse(fs.readFileSync(`${DIR}/sa-laser-du-hm-b-q3-2026.json`, 'utf8'));
ut.push('=== hm-b: satser med (köp|sälj)+rekommendation ===');
for (const s of hm.body.split(/(?<=[.!?])\s+/).filter((s) => /(k[oö]p|s[aä]lj)[\s\-–]*rekommendation/i.test(s))) ut.push('· ' + s.trim().slice(0, 220));
ut.push('(title/description-träffar: ' + (String(hm.title).match(/(k[oö]p|s[aä]lj)[\s\-–]*rekommendation/i) || []) + (String(hm.description).match(/(k[oö]p|s[aä]lj)[\s\-–]*rekommendation/i) || []) + ')');

// 2. meta + volvo-car: källsektionens faktiska utformning
for (const slug of ['sa-laser-du-meta-q3-2026', 'sa-laser-du-volvo-car-q3-2026']) {
  const p = JSON.parse(fs.readFileSync(`${DIR}/${slug}.json`, 'utf8'));
  ut.push(`\n=== ${slug} ===`);
  const i = p.body.toLowerCase().lastIndexOf('käll');
  ut.push(i >= 0 ? 'käll-området (500 tkn):\n' + p.body.slice(Math.max(0, i - 100), i + 400) : 'ordet "käll" förekommer ej — sista 500 tkn:\n' + p.body.slice(-500));
}

fs.writeFileSync('/tmp/r172-roda.txt', ut.join('\n') + '\n');
console.log('skrev /tmp/r172-roda.txt');
