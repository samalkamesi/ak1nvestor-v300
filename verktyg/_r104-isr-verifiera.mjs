#!/usr/bin/env node
// ROND 104 — verifiera värmarens rotkur: syntax + full kör + loggvitto
import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
const ARB = '/home/ak1a/agent/ak1';
const run = (c, a, t = 30_000) => execFileSync(c, a, { cwd: ARB, encoding: 'utf-8', timeout: t }).trim();

console.log('bash -n:', run('bash', ['-n', 'data/infra/contabo/ak1a-varm.sh']) === '' ? 'SYNTAX OK' : '?');
console.log('kör värmaren (full, ~60-90 s)…');
run('bash', ['data/infra/contabo/ak1a-varm.sh'], 240_000);
const log = readFileSync('/tmp/ak1a-varm.log', 'utf-8').trim().split('\n');
console.log('LOGG-SVANS:');
for (const r of log.slice(-3)) console.log(' ', r);
