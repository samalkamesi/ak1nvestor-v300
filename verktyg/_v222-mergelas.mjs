// _v222-mergelas.mjs — läs konfliktläget i kvalitetsvakt.mjs efter främde ändring.
import fs from 'node:fs';
import { execFileSync } from 'node:child_process';
const src = fs.readFileSync('/home/ak1a/agent/ak1/verktyg/kvalitetsvakt.mjs', 'utf8');
const rad = src.split('\n').findIndex(r => r.includes('SITEMAP_EXKLUDERA'));
console.log(src.split('\n').slice(Math.max(0, rad - 14), rad + 3).map((r, i) => `${Math.max(0, rad - 14) + i + 1}\t${r}`).join('\n'));
console.log('\nkonfliktmarkörer:', (src.match(/<<<<<<</g) || []).length);
try { console.log(execFileSync('git', ['-C', '/home/ak1a/agent/ak1', 'status', '--short'], { encoding: 'utf8', timeout: 15000 }).trim().split('\n').slice(0, 8).join('\n')); } catch (e) { console.log('(status fel)'); }
