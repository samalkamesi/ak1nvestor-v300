// v167-sond 4: chapters_list-format, filformat-rondtrip, ts-motpart, renderare
import { readFileSync } from 'node:fs';
const rå = readFileSync('public/deep-courses.json', 'utf8');
const j = JSON.parse(rå);
const v = j['v09-roe'];
console.log('chapters_list[0..2]:', JSON.stringify(v.chapters_list.slice(0, 3)));
console.log('chapters_list[sista]:', JSON.stringify(v.chapters_list.at(-1)));
console.log('chapters_list-längd:', v.chapters_list.length, '· kapitel:', v.chapters.length);
console.log('rondtrip (x, null, 2):', JSON.stringify(j, null, 2) === rå ? 'JA — rent 2-space' : 'NEJ');
console.log('rondtrip (x, null, 1):', JSON.stringify(j, null, 1) === rå ? 'JA — rent 1-space' : 'NEJ');
console.log('rondtrip minifierad:', JSON.stringify(j) === rå.trim() ? 'JA — minifierad' : 'NEJ');
console.log('slutnyrad:', rå.endsWith('\n'));
// ts-motpartens innehåll: vad exporterar den?
const ts = readFileSync('src/lib/ak1a/deep-courses-data.ts', 'utf8');
console.log('\nTS-fil:', ts.length, 'tecken');
console.log('export-rader:', ts.split('\n').filter(l => /^export /.test(l)).join(' | ').slice(0, 300));
const hits = ['slugToVariableId', 'deep-courses.json', 'fetch(', 'chapters'].map(h => `${h}: ${(ts.match(new RegExp(h.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g')) || []).length}`);
console.log(hits.join(' · '));
