#!/usr/bin/env node
// ROND 104 — ISR-värmarens fullständiga vägdiagnostik
import { execFileSync } from 'node:child_process';
const PROD = '/home/ak1a/AK1';
const run = (c, a, cwd = PROD) => execFileSync(c, a, { cwd, encoding: 'utf-8', timeout: 40_000 }).trim();
const kod = (v) => { try { return run('curl', ['-s', '-o', '/dev/null', '-w', '%{http_code}', '--max-time', '20', `http://127.0.0.1:3000${v}`]); } catch { return 'TIMEOUT'; } };

// crontab — vilken fil är live?
try { console.log('CRONTAB:', run('crontab', ['-l']).split('\n').filter((r) => /varm/i.test(r)).join(' · ') || '(ingen varm-rad)'); } catch (e) { console.log('CRONTAB: kunde ej läsas'); }

const statiska = ['/', '/kurser', '/dataset', '/blogg', '/en/', '/en/kurser', '/en/dataset', '/ar/', '/ar/kurser', '/ar/dataset', '/data/nyckeltalsguide', '/om-oss', '/prenumeration', '/logga-in'];
console.log('\n--- STATISKA (14):');
for (const v of statiska) console.log(`  ${kod(v)}  ${v}`);

// Blogg-sluggarna exakt som värmarformen hämtar dem
const sm = run('curl', ['-s', '--max-time', '20', 'http://127.0.0.1:3000/sitemap.xml']);
const slugs = [...new Set((sm.match(/\/blogg\/[a-z0-9-]*/g) || []))].sort().slice(0, 10);
console.log('\n--- SITEMAP-blogg (10 st):', slugs.map((s) => s.replace('/blogg/', '')).join(', '));
let ok = 0, tot = 0;
for (const s of slugs) for (const pre of ['/blogg/', '/en/blogg/', '/ar/blogg/']) { tot++; const k = kod(pre + s.replace('/blogg/', '')); if (k === '200') ok++; else console.log(`  ${k}  ${pre}${s.replace('/blogg/', '')}`); }
console.log(`\nBLOGG: ${ok}/${tot} svarar 200`);
