// r312-sond5: synliga <a>-länkar till tunga rutter i SSR-HTML (prefetch-kandidater)
import { execSync } from 'node:child_process';

const bas = 'http://localhost:3000';
const tunga = /href="(\/(?:en\/|ar\/)?(?:superanalys|konfluens|kalkylator|netnet|portfoljbyggare|vagfundament|topplista)[^"]*)"/g;
const sidor = ['/', '/kurser', '/blogg', '/dataset', '/fas3', '/medlemskap'];
for (const s of sidor) {
  const html = execSync(`curl -s ${bas}${s}`, { encoding: 'utf8', maxBuffer: 32 * 1024 * 1024 });
  const traff = [...html.matchAll(tunga)].map((m) => m[1]);
  console.log(`${s}:`, traff.length ? [...new Set(traff)].join(', ') : '(inga tunga länkar)');
}
// startsidans alla interna länkar (översikt)
const hem = execSync(`curl -s ${bas}/`, { encoding: 'utf8', maxBuffer: 32 * 1024 * 1024 });
const alla = [...hem.matchAll(/href="(\/[a-z0-9\-/]*)"/g)].map((m) => m[1]);
const rakn = {};
for (const a of alla) rakn[a] = (rakn[a] || 0) + 1;
console.log('\nStartsidans interna länkar:');
console.log(Object.entries(rakn).map(([k, v]) => `${k}×${v}`).join(' '));
