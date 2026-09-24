import fs from 'node:fs';
const j = JSON.parse(fs.readFileSync('/home/ak1a/agent/ak1/data/bokmaster/ak1ts-vaglarans-hierarki.json', 'utf8'));
console.log('nycklar:', Object.keys(j).join(', '));
const kap = j.kapitel || j.kap || [];
console.log('kapitel:', kap.length, kap[0] ? '(' + Object.keys(kap[0]).join(',') + ')' : '');
console.log('slug:', j.slug, '| fas/niva:', j.fas ?? j.niva ?? '?', '| totalMinutes:', j.totalMinutes ?? '?');
if (kap[0]) console.log('kap1 titel:', kap[0].titel ?? kap[0].namn ?? '?', '| längd text:', (kap[0].text ?? kap[0].innehall ?? '').length, 'tkn');
console.log('quiz?', !!(j.quiz || kap[0]?.quiz));
console.log('språknycklar:', j.sv ? 'sv' : (j.sprak ? Object.keys(j.sprak) : 'enkel'));
