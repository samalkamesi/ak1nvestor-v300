#!/usr/bin/env node
// Rond 141: kör FYNN:s LÄGE-byggare i prod-trädet + visa färsk bild
import { spawnSync } from 'node:child_process';
const r = spawnSync('node', ['verktyg/feljakt-lage.mjs'], {
  cwd: '/home/ak1a/AK1', encoding: 'utf8', timeout: 120000, maxBuffer: 32 * 1024 * 1024
});
console.log('exit:', r.status);
if (r.stdout) console.log(r.stdout.slice(-2500));
if (r.stderr) console.log('STDERR:', r.stderr.slice(-1500));
if (r.error) console.log('FEL:', r.error.message);
