#!/usr/bin/env node
// _r188-hex.mjs — teckenkoder på rad 125 runt readFileSync(
import fs from 'node:fs';
const r = fs.readFileSync('/home/ak1a/agent/ak1/verktyg/_r188-adopt.mjs', 'utf8').split('\n')[124];
const pos = r.indexOf('readFileSync(');
const seg = r.slice(pos, pos + 40);
fs.writeFileSync('/tmp/r188-hex.txt',
  `längd rad 125: ${r.length}\n` +
  [...seg].map((c) => `${c} U+${c.codePointAt(0).toString(16).padStart(4, '0')}`).join(' · ') + '\n' +
  `backticks totalt: ${[...r.matchAll(/`/g)].length}\n` +
  [...r].map((c) => c.codePointAt(0)).filter((cp) => cp > 126).map((cp) => `icke-ascii U+${cp.toString(16)}`).join(', ') + '\n');
console.log('skrev /tmp/r188-hex.txt');
