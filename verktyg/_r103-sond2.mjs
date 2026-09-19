#!/usr/bin/env node
// ROND 103 sond 2 — fabrikens auto-s10-status + frågelagerläge (våg 210-premiss)
import { readFileSync, readdirSync } from 'node:fs';
const PROD = '/home/ak1a/AK1';
const ARB = '/home/ak1a/agent/ak1';

const s = JSON.parse(readFileSync(`${PROD}/data/vakten/agentfabrik/status/auto-s10-1789849506241.json`, 'utf-8'));
console.log('auto-s10 status:', s.status);
for (const u of s.uppgifter || []) console.log(`  ${u.id}: ${u.status ?? '?'} exit=${u.exitkod ?? u.exit ?? '?'} ${u.leverans ? 'LEVERANS✓' : ''}`);

// Våg 210-premissen: antal frågelager-filer i src/lib (båda träden)
for (const [namn, rot] of [['PROD', PROD], ['ARB', ARB]]) {
  const lib = `${rot}/src/lib`;
  const fragor = readdirSync(lib).filter((f) => /fragor/.test(f) && f.endsWith('.ts'));
  console.log(`${namn}: ${fragor.length} frågelager-filer i src/lib`);
}
