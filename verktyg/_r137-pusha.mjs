#!/usr/bin/env node
// Rond 137-pushare: merge-retry mot prod (fabriksomgång kan äga ytan)
import { spawnSync } from 'node:child_process';
const ROOT = '/home/ak1a/agent/ak1';
for (let i = 1; i <= 20; i++) {
  spawnSync('git', ['-C', ROOT, 'fetch', 'prod', 'develop'], { encoding: 'utf8' });
  const m = spawnSync('git', ['-C', ROOT, 'merge', '--no-edit', 'FETCH_HEAD'], { encoding: 'utf8' });
  if (m.status !== 0) console.log(`försök ${i} merge-fel:`, (m.stderr || '').slice(0, 200));
  const p = spawnSync('git', ['-C', ROOT, 'push', 'prod', 'develop'], { encoding: 'utf8' });
  console.log(`försök ${i}:`, ((p.stdout || '') + (p.stderr || '')).trim().slice(-300));
  if (p.status === 0) { console.log('PUSH GRÖN'); process.exit(0); }
  await new Promise(r => setTimeout(r, 90000));
}
console.log('Cykel uttömd — ytan öppnade sig inte (nästa rond tar över)');
