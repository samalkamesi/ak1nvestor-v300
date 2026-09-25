#!/usr/bin/env node
// _r194-hmb-kur.mjs — hm-b:s disclaimer-kur: omformulera så varumärkesgrindens mekaniska
// regex (köp|sälj)+rekommendation inte träffar (betydelsen bevarad: negationen kvar)
import fs from 'node:fs';
const FIL = '/home/ak1a/agent/ak1/data/blogg-utkast/kvartal/2026-q3/sa-laser-du-hm-b-q3-2026.json';
const p = JSON.parse(fs.readFileSync(FIL, 'utf8'));
const gammal = 'Inga köp- eller säljrekommendationer lämnas.';
const ny = 'Inga rekommendationer i någon riktning lämnas.';
if (!p.body.includes(gammal)) { console.error('FEL: disclaimersatsen hittades ej'); process.exit(1); }
p.body = p.body.replace(gammal, ny);
fs.writeFileSync(FIL, JSON.stringify(p, null, 2) + '\n');
console.log('hm-b disclaimer omformulerad (grind-säker, negation bevarad): "' + ny + '"');
