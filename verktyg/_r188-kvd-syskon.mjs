#!/usr/bin/env node
// _r188-kvd-syskon.mjs — kör syskonets KVD-skript mot deras fil i prod + klaimprovenans
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';

const PROD = '/home/ak1a/AK1';
const ut = [];

// ── 1. Svanskontroll: skriver skriptet något? ──
const skript = fs.readFileSync(`${PROD}/verktyg/_s3u2-b24-ar-kvd-medtech.mjs`, 'utf8');
const skrivYaw = [...skript.matchAll(/writeFileSync|appendFileSync|createWriteStream/g)].map((m) => m[0]);
ut.push('skript-skrivningar: ' + (skrivYaw.length ? skrivYaw.join(',') : 'INGA (ren läsare)'));

// ── 2. Kör syskonets KVD i prod-trädet ──
try {
  const svar = execFileSync('node', ['_s3u2-b24-ar-kvd-medtech.mjs'], {
    cwd: `${PROD}/verktyg`, encoding: 'utf8', timeout: 120000, stdio: ['ignore', 'pipe', 'pipe'],
  });
  ut.push('=== KVD-UTDATA ===');
  ut.push(svar);
} catch (e) {
  ut.push('KVD FEL: ' + String(e.stdout || e.message).slice(0, 3000));
}

// ── 3. Klaimfilens innehåll (provenans) ──
ut.push('\n=== klaimfil s3-b24-ar-medtech-ansprak-2026-09-24.md ===');
ut.push(fs.readFileSync(`${PROD}/data/vakten/s3-b24-ar-medtech-ansprak-2026-09-24.md`, 'utf8').slice(0, 2500));

fs.writeFileSync('/tmp/r188-kvd-syskon.txt', ut.join('\n') + '\n');
console.log('skrev /tmp/r188-kvd-syskon.txt');
