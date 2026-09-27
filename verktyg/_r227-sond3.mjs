#!/usr/bin/env node
// Rond 227 — sond 3: varför försvann prods M-rad? Status + log + diff för motorervalidering
import { execFileSync } from 'node:child_process';
import { readFileSync, statSync } from 'node:fs';

const PROD = '/home/ak1a/AK1';
const ROT = '/home/ak1a/agent/ak1';
const RAPPORT = 'data/rapporter/motorervalidering-2026-09-02.md';

console.log('── PROD status ──');
console.log(execFileSync('git', ['-C', PROD, 'status', '--porcelain'], { encoding: 'utf8' }) || '(rent)');
console.log('── PROD log (sista 3) ──');
console.log(execFileSync('git', ['-C', PROD, 'log', '--oneline', '-3'], { encoding: 'utf8' }));
console.log('── PROD diff namn ──');
console.log(execFileSync('git', ['-C', PROD, 'diff', '--name-only'], { encoding: 'utf8' }) || '(ingen diff)');
console.log('── Rapportfilen ──');
console.log(`prod ${statSync(`${PROD}/${RAPPORT}`).size} B (mtime ${statSync(`${PROD}/${RAPPORT}`).mtime.toISOString()})`);
console.log(`arbetsyta ${statSync(`${ROT}/${RAPPORT}`).size} B (mtime ${statSync(`${ROT}/${RAPPORT}`).mtime.toISOString()})`);
const prodText = readFileSync(`${PROD}/${RAPPORT}`, 'utf8');
const rubriker = [...prodText.matchAll(/^# Motorervalidering — 100%-väktaren — (\S+)$/gm)].map(m => m[1]);
console.log(`prod rapporter: ${rubriker.length}, sista 3: ${rubriker.slice(-3).join(' | ')}`);
// Är prods rapport innehållen i prods HEAD? (dvs commitades den?)
const headRapport = execFileSync('git', ['-C', PROD, 'show', `HEAD:${RAPPORT}`], { encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 });
const headRubriker = [...headRapport.matchAll(/^# Motorervalidering — 100%-väktaren — (\S+)$/gm)].map(m => m[1]);
console.log(`HEAD:s rapporter: ${headRubriker.length}, sista 3: ${headRubriker.slice(-3).join(' | ')}`);
console.log(`prod-fil vs HEAD-fil: ${prodText === headRapport ? 'IDENTISKA (M-raden borta pga commit eller likriktning)' : 'SKILJER'}`);
console.log('── ARBETSYTA log (sista 2) ──');
console.log(execFileSync('git', ['-C', ROT, 'log', '--oneline', '-2'], { encoding: 'utf8' }));
