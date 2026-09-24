#!/usr/bin/env node
// Rond 137: riktad vaktsvepning av /rapportakademin med KURERADE vakten
// (rond 135:s villkor: ny riktad sweep EFTER pull — prod develop = 04346672)
import { spawnSync } from 'node:child_process';

const PROD = '/home/ak1a/AK1';
const SIDA = '/rapportakademin';

const free = spawnSync('free', ['-m'], { encoding: 'utf8' });
const avail = parseInt((free.stdout.match(/MemAvailable:\s+(\d+)/) || [])[1] || '0', 10);
console.log('RAM available:', avail, 'MB');
if (avail < 2200) {
  console.log('RAM-fönster stängt — avbryter (ingen svepning)');
  process.exit(2);
}

const r = spawnSync('node', ['verktyg/granssnittsvakt.mjs', '--bas=http://localhost:3000', `--sidor=${SIDA}`], {
  cwd: PROD, encoding: 'utf8', timeout: 300000, maxBuffer: 128 * 1024 * 1024
});
console.log('vakt-exit:', r.status);
if (r.stdout) console.log('SVAR:', r.stdout.slice(-12000));
if (r.stderr) console.log('STDERR-tail:', r.stderr.slice(-3000));
if (r.error) console.log('FEL:', r.error.message);
