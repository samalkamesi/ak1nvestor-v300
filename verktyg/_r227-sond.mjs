#!/usr/bin/env node
// Rond 227 — sond: kartlägg prod-trädets 26+ smutsiga filer (varifrån, vad, hur färska)
import { execFileSync } from 'node:child_process';
import { readFileSync, statSync } from 'node:fs';

const PROD = '/home/ak1a/AK1';
const ut = execFileSync('git', ['-C', PROD, 'status', '--porcelain'], { encoding: 'utf8' });
const rader = ut.split('\n').filter(r => r.trim());
console.log(`PROD-SMUTS: ${rader.length} rader`);
for (const r of rader) {
  const status = r.slice(0, 2);
  const fil = r.slice(3).replace(/"/g, '');
  let storlek = '?';
  try { storlek = statSync(`${PROD}/${fil}`).size; } catch {}
  console.log(`${status} | ${String(storlek).padStart(9)} B | ${fil}`);
}
// De tre första untracked: visa huvudet av innehållet (vad innehåller lighthouse-filerna?)
const untracked = rader.filter(r => r.startsWith('??')).map(r => r.slice(3).replace(/"/g, ''));
for (const f of untracked.slice(0, 3)) {
  console.log(`\n─── INNEHÅLL ${f} (första 600 tecknen) ───`);
  try { console.log(readFileSync(`${PROD}/${f}`, 'utf8').slice(0, 600)); } catch (e) { console.log(`(kunde inte läsa: ${e.message})`); }
}
