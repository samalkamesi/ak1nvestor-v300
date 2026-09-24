#!/usr/bin/env node
// Rond 140-pushare: 60 varv à 90 s (90 min) — täcker fabrikens omgångstakt.
// Kurerna (nr 5+nr 6) MÅSTE landa i prod-trädet: FYNN kör där och övereskalerar
// annars nästa lås/svält. Idempotent — dör vid grön push.
import { spawnSync } from 'node:child_process';
const ROOT = '/home/ak1a/agent/ak1';
for (let i = 1; i <= 60; i++) {
  spawnSync('git', ['-C', ROOT, 'fetch', 'prod', 'develop'], { encoding: 'utf8' });
  const m = spawnSync('git', ['-C', ROOT, 'merge', '--no-edit', 'FETCH_HEAD'], { encoding: 'utf8' });
  if (m.status !== 0) console.log(`försök ${i} merge-fel:`, (m.stderr || '').slice(0, 200));
  const p = spawnSync('git', ['-C', ROOT, 'push', 'prod', 'develop'], { encoding: 'utf8' });
  const svar = ((p.stdout || '') + (p.stderr || '')).trim();
  if (p.status === 0) { console.log(`försök ${i}: PUSH GRÖN —`, svar.slice(-200)); process.exit(0); }
  if (i % 10 === 0 || !/unstaged changes/.test(svar)) console.log(`försök ${i}:`, svar.slice(-200));
  await new Promise(r => setTimeout(r, 90000));
}
console.log('Cykel uttömd efter 90 min — nästa rond tar över');
