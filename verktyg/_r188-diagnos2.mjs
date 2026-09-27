#!/usr/bin/env node
// _r188-diagnos2.mjs — bakstyckes-paritet per rad (crud: ignorerar string-literaler, letar efter lång obruten template)
import fs from 'node:fs';
const rader = fs.readFileSync('/home/ak1a/agent/ak1/verktyg/_r188-adopt.mjs', 'utf8').split('\n');
let inuti = false;
const rapport = [];
for (let i = 0; i < rader.length; i++) {
  const antal = [...rader[i].matchAll(/`/g)].length;
  const varInuti = inuti;
  if (antal % 2 === 1) inuti = !inuti;
  if (inuti) rapport.push(`RAD ${i + 1}: OBRUTEN template efter denna rad (${antal} backticks, var inuti=${varInuti}) — ${rader[i].slice(0, 90)}`);
}
rapport.push(`SLUTLÄGE inuti-template: ${inuti}`);
fs.writeFileSync('/tmp/r188-diagnos2.txt', rapport.join('\n') + '\n');
console.log('skrev /tmp/r188-diagnos2.txt');
