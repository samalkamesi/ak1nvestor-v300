#!/usr/bin/env node
// _r192-v172-djup.mjs — v172: läs Q3-planen, kvartalskartan, kallregistret + universum med rätt nycklar
import fs from 'node:fs';
const ROT = '/home/ak1a/agent/ak1';
const ut = [];

// 1. Q3-plankdokumentet
ut.push('=== data/blogg-utkast/kvartalsrapport-2026-Q3.md (hela) ===');
ut.push(fs.readFileSync(`${ROT}/data/blogg-utkast/kvartalsrapport-2026-Q3.md`, 'utf8'));

// 2. Kvartalskartan v152 (föregångaren)
ut.push('\n=== data/forskning/V152-KVARTALSKARTA.md (första 5000 tecknen) ===');
ut.push(fs.readFileSync(`${ROT}/data/forskning/V152-KVARTALSKARTA.md`, 'utf8').slice(0, 5000));

// 3. Kallregistret (rapportkalender?)
ut.push('\n=== kallregister-bolagsrapporter-2026-09-21.md (första 3000) ===');
ut.push(fs.readFileSync(`${ROT}/data/forskning/kallregister-bolagsrapporter-2026-09-21.md`, 'utf8').slice(0, 3000));

// 4. kvartal-katalogen i utkast?
const kvDir = `${ROT}/data/blogg-utkast/kvartal`;
ut.push('\n=== data/blogg-utkast/kvartal/ ===');
ut.push(fs.existsSync(kvDir) ? fs.readdirSync(kvDir).join('\n') : '(katalogen finns ej)');

// 5. Universum med rätt nycklar
const uni = JSON.parse(fs.readFileSync(`${ROT}/data/portfolj-system/bolagsunivers.json`, 'utf8'));
const list = Array.isArray(uni) ? uni : uni.bolag;
const brancher = {};
for (const b of list) brancher[b.branch] = (brancher[b.branch] || 0) + 1;
ut.push(`\n=== UNIVERSUM (rätt nycklar): ${list.length} bolag ===`);
ut.push('branscher: ' + Object.entries(brancher).sort((a, b) => b[1] - a[1]).map(([k, v]) => `${k}=${v}`).join(' · '));
const lands = {};
for (const b of list) lands[b.land] = (lands[b.land] || 0) + 1;
ut.push('länder: ' + Object.entries(lands).sort((a, b) => b[1] - a[1]).map(([k, v]) => `${k}=${v}`).join(' · '));
ut.push('notering-exempel: ' + JSON.stringify(list[0].notering).slice(0, 200));
ut.push('kallor-exempel: ' + JSON.stringify(list[0].kallor).slice(0, 200));

fs.writeFileSync('/tmp/r192-djup.txt', ut.join('\n') + '\n');
console.log('skrev /tmp/r192-djup.txt · ' + ut.join('\n').length + ' tecken');
