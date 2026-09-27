#!/usr/bin/env node
// _r188-diagnos.mjs — hitta obalanserad parentes i _r188-adopt.mjs (crud räknare, pekar på misstänkta rader)
import fs from 'node:fs';
const rader = fs.readFileSync('/home/ak1a/agent/ak1/verktyg/_r188-adopt.mjs', 'utf8').split('\n');
let djup = 0;
const rapport = [];
for (let i = 0; i < rader.length; i++) {
  const r = rader[i];
  const öppna = [...r.matchAll(/\(/g)].length;
  const stäng = [...r.matchAll(/\)/g)].length;
  const före = djup;
  djup += öppna - stäng;
  if (djup < 0) { rapport.push(`RAD ${i + 1}: NEGATIVT djup ${djup} (före ${före}, +${öppna} −${stäng}) — ${r.slice(0, 120)}`); djup = 0; }
  else if (före !== 0 && djup === 0) rapport.push(`RAD ${i + 1}: åter till 0 från ${före} — ${r.slice(0, 100)}`);
  else if (djup !== 0) rapport.push(`RAD ${i + 1}: djup ${djup} (före ${före}) — ${r.slice(0, 100)}`);
}
rapport.push(`SLUTDJUP: ${djup}`);
fs.writeFileSync('/tmp/r188-diagnos.txt', rapport.join('\n') + '\n');
console.log('skrev /tmp/r188-diagnos.txt');
