#!/usr/bin/env node
// _r162-vanta.mjs — pollar verifieringen till SLUT (max ~9 min), skriver ut resultatet.
import { readFileSync, existsSync } from 'node:fs';
const FIL = '/tmp/r161-verifiering.txt';
for (let i = 0; i < 54; i++) {
  const t = existsSync(FIL) ? readFileSync(FIL, 'utf8') : '';
  if (/^SLUT/m.test(t)) break;
  await new Promise((r) => setTimeout(r, 10000));
}
console.log(existsSync(FIL) ? readFileSync(FIL, 'utf8') : 'verifiering.txt saknas');
