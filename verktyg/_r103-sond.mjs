#!/usr/bin/env node
// ROND 103 sond — auto-s2-mönstret + dataset-djup-mekanismen
import { readFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
const PROD = '/home/ak1a/AK1';
const m = JSON.parse(readFileSync(`${PROD}/data/vakten/agentfabrik/klara/auto-s2-1789496108375.json`, 'utf-8'));
console.log('MANIFEST:', m.id, '|', m.titel, '| auto:', m.auto, '| spår:', m.spar);
for (const u of m.uppgifter) console.log(`\n=== ${u.id}: ${u.titel}\n${u.prompt}`);
// En faktisk dataset-djup-commit: vad rörde den?
console.log('\n--- COMMIT 48916d8c (auto s2-u3 dataset-djup +3) — filer:');
try {
  const ut = execFileSync('git', ['show', '--stat', '--format=%s', '48916d8c'], { cwd: PROD, encoding: 'utf-8' }).trim();
  console.log(ut.split('\n').slice(0, 14).join('\n'));
} catch (e) { console.log('commit ej funnen i prod-trädet:', String(e).slice(0, 100)); }
// Universets aktuella tillväxtläge
const uni = JSON.parse(readFileSync(`${PROD}/data/portfolj-system/bolagsunivers.json`, 'utf-8'));
console.log('\nUNIVERS (prod):', uni.length, 'bolag');
const tickers = new Set(uni.map((r) => r.ticker));
console.log('exempel-tickers:', [...tickers].slice(0, 5).join(', '), '…');
