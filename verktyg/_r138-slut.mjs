#!/usr/bin/env node
// Rond 138-slut: syntaxgrind + dom-skrivning (endast om syntax grön)
import { spawnSync } from 'node:child_process';
const filer = ['verktyg/feljagaren.mjs', 'verktyg/testa-f3-nr5.mjs'];
for (const f of filer) {
  const r = spawnSync('node', ['--check', f], { cwd: '/home/ak1a/agent/ak1', encoding: 'utf8' });
  console.log(f, r.status === 0 ? 'SYNTAX GRÖN' : `FEL: ${r.stderr}`);
  if (r.status !== 0) process.exit(1);
}
const d = spawnSync('node', ['verktyg/_r138-dom.mjs'], { cwd: '/home/ak1a/agent/ak1', encoding: 'utf8' });
console.log((d.stdout || '') + (d.stderr || ''));
