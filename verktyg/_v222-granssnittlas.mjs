// _v222-granssnittlas.mjs — sammanfatta senaste gränsnittsvaktsrapporten (prod).
import fs from 'node:fs';
const fil = '/home/ak1a/AK1/data/vakten/granssnitt-2026-10-01T013944.json';
const j = JSON.parse(fs.readFileSync(fil, 'utf8'));
console.log('nycklar:', Object.keys(j).join(', '));
console.log('status:', j.status, '· antal fynd:', (j.fynd || []).length, '· kombinationer:', j.kombinationer || j.antalKombinationer || '?');
for (const f of (j.fynd || []).slice(0, 8)) console.log('FUND:', JSON.stringify(f).slice(0, 220));
if (j.sammanfattning) console.log('sammanfattning:', String(j.sammanfattning).slice(0, 400));
