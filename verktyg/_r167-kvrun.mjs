// Runner: kör kvalitetsvakten i prod-trädet och skriver ut sammanfattningen
process.chdir('/home/ak1a/AK1');
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
const r = spawnSync('node', ['verktyg/kvalitetsvakt.mjs'], { encoding: 'utf8', timeout: 330000, maxBuffer: 32 * 1024 * 1024 });
const svans = (r.stdout || '').split('\n').slice(-14).join('\n');
console.log('EXIT:', r.status, r.error ? r.error.message : '');
console.log('--- sista raderna ---');
console.log(svans);
console.log('--- rapportfilens status ---');
const txt = fs.readFileSync('data/rapporter/kvalitetsrapport-SENASTE.md', 'utf8');
const gen = txt.match(/Genererad:\*\* ([^\s]+)/);
const fel = txt.match(/## ANTAL FEL.*/);
console.log('genererad:', gen ? gen[1] : '?', '|', fel ? fel[0] : '?');
