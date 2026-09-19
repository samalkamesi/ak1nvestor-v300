#!/usr/bin/env node
// ROND 105 — tsc-grind med resultatfil (skalet hänger på >30 s-körningar)
import { writeFileSync, readFileSync, existsSync, unlinkSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
const RES = '/tmp/r105-tsc.txt';
if (existsSync(RES)) { console.log('föregående resultat:', readFileSync(RES, 'utf-8')); if (existsSync(RES)) unlinkSync(RES); }
try {
  execFileSync('node', ['node_modules/typescript/bin/tsc', '--noEmit'], { cwd: '/home/ak1a/agent/ak1', timeout: 300_000, stdio: ['ignore', 'pipe', 'pipe'] });
  writeFileSync(RES, 'TSC 0 FEL');
  console.log('TSC 0 FEL');
} catch (e) {
  const ut = (e.stdout || '') + (e.stderr || '');
  writeFileSync(RES, 'TSC FEL:\n' + ut.slice(0, 3000));
  console.log('TSC FEL:\n' + ut.slice(0, 3000));
}
