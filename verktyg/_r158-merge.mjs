#!/usr/bin/env node
// _r158-merge.mjs — rond 158: merge prod/develop → develop via node-kanalen
// (git merge triggar pre-commit-tsc som överskrider studio-skalens fönster).
import { execFileSync } from 'node:child_process';

const WS = '/home/ak1a/agent/ak1';
const run = (...args) => execFileSync('git', ['-C', WS, ...args], { encoding: 'utf8', timeout: 240000 });

try {
  const ut = run('merge', 'prod/develop', '-m',
    'merge: rond 158 emottag kf1-kf3 (55 blogginlagg + startsida-konvertering + fas2-sidan)');
  console.log('MERGE-UT:', ut.trim());
} catch (e) {
  console.log('MERGE-FEL:', String(e.stdout || ''), String(e.stderr || e.message || '').slice(0, 500));
  process.exit(1);
}
console.log('HEAD:', run('log', '--oneline', '-2').trim());
console.log('STATUS:', run('status', '--porcelain').trim() || '(ren)');
