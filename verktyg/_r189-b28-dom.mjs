#!/usr/bin/env node
// _r189-b28-dom.mjs — kör syskonets KVD mot utkastet (prod-root, read-only) + B27-radens format
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';

const PROD = '/home/ak1a/AK1';
const ROT = '/home/ak1a/agent/ak1';
const ut = [];

// 1. KVD-mot utkastet (relativa sökvägar ⇒ cwd = prod-root)
try {
  const svar = execFileSync('node', ['verktyg/_s3u1-b28-kvd-investmentbolag.mjs'], {
    cwd: PROD, encoding: 'utf8', timeout: 120000, stdio: ['ignore', 'pipe', 'pipe'],
  });
  ut.push('=== KVD-MOT UTKASTET (exit 0) ==='); ut.push(svar);
} catch (e) {
  ut.push('=== KVD-MOT UTKASTET (exit ' + e.status + ') ===');
  ut.push(String(e.stdout || '') + '\n[stderr] ' + String(e.stderr || '').slice(0, 500));
}

// 2. B27-radens hela text (formatmall för B28-raden)
const seo = fs.readFileSync(`${ROT}/data/forskning/SEO-GUIDER-2026-09.md`, 'utf8').split('\n');
const b27 = seo.findIndex((l) => l.startsWith('| B27 |'));
ut.push('\n=== B27-RADEN (formatmall, hela) ===');
ut.push(seo[b27]);
// tabellhuvudet också
const huvud = seo.findIndex((l, i) => i < b27 && /^\| # \| Slug/.test(l));
ut.push('\n=== TABELLHUVD ===');
ut.push(huvud >= 0 ? seo[huvud] + '\n' + seo[huvud + 1] : '(huvud hittades ej)');

fs.writeFileSync('/tmp/r189-b28-dom.txt', ut.join('\n') + '\n');
console.log('skrev /tmp/r189-b28-dom.txt');
