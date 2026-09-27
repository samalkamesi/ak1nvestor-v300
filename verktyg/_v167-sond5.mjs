// v167-sond 5: exakt formatavvikelse + fetchDeepCourse + chapters_list-konsumenter
import { readFileSync } from 'node:fs';
const rå = readFileSync('public/deep-courses.json', 'utf8');
const j = JSON.parse(rå);
const s2 = JSON.stringify(j, null, 2) + '\n';
// första avvikelsen
let p = 0;
const max = Math.min(rå.length, s2.length);
while (p < max && rå[p] === s2[p]) p++;
console.log('fil:', rå.length, 'tecken · stringify2:', s2.length, '· första avvikelse vid', p);
console.log('FIL  …', JSON.stringify(rå.slice(Math.max(0, p - 60), p + 80)));
console.log('GEN  …', JSON.stringify(s2.slice(Math.max(0, p - 60), p + 80)));
// fetchDeepCourse
const ts = readFileSync('src/lib/ak1a/deep-courses-data.ts', 'utf8');
const m = ts.match(/export async function fetchDeepCourse[\s\S]{0,600}/);
console.log('\nfetchDeepCourse:\n' + (m ? m[0].slice(0, 500) : 'ej hittad'));
