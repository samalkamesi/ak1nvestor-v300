#!/usr/bin/env node
// ROND 104 sond — verifiera r103-push + lokalisera ISR-varmen och dess 03:11-fynd
import { readFileSync, readdirSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
const ARB = '/home/ak1a/agent/ak1';
const PROD = '/home/ak1a/AK1';
const run = (c, a, cwd = ARB) => { try { return execFileSync(c, a, { cwd, encoding: 'utf-8' }).trim(); } catch { return 'FEL'; } };
const las = (p) => { try { return readFileSync(p, 'utf-8'); } catch { return null; } };

console.log('prod-HEAD:', run('git', ['log', 'prod/develop', '-1', '--format=%h %s']).slice(0, 120));
console.log('r103 i prod:', run('git', ['merge-base', '--is-ancestor', 'cbe4b2d8', 'prod/develop']) === '' ? 'JA ✓' : 'NEJ');

const vakter = readdirSync(`${PROD}/data/vakten`).filter((f) => /isr|varm/i.test(f));
console.log('\nvakten/ISR-filer:', vakter.join(', ') || '(inga)');
const verktygISR = readdirSync(`${PROD}/verktyg`).filter((f) => /isr|varm/i.test(f));
console.log('verktyg/ISR-filer:', verktygISR.join(', ') || '(inga)');

// Senaste ISR-rapportens innehåll (om JSON — visa nyckeltal)
for (const f of vakter.filter((x) => x.endsWith('.json')).slice(-2)) {
  const r = las(`${PROD}/data/vakten/${f}`);
  if (r) { try { const j = JSON.parse(r); console.log(`\n=== ${f}:`, JSON.stringify(j).slice(0, 500)); } catch { console.log(`\n=== ${f} (rå):`, r.slice(0, 400)); } }
}
