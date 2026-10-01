// _v221-slugdiff.mjs — slugdiff mellan develop och prod/develop för deep-courses.json (stor buffer).
import { execFileSync } from 'node:child_process';

const ROT = '/home/ak1a/agent/ak1';
const visa = (ref) => JSON.parse(execFileSync('git', ['show', `${ref}:public/deep-courses.json`], { encoding: 'utf8', timeout: 60000, cwd: ROT, maxBuffer: 64 * 1024 * 1024 }));

const A = visa('develop');
const B = visa('prod/develop');
const a = new Set(Object.keys(A)), b = new Set(Object.keys(B));
const baraMitt = [...a].filter((k) => !b.has(k));
const baraProd = [...b].filter((k) => !a.has(k));
console.log(`develop: ${a.size} kurser · prod/develop: ${b.size} kurser`);
console.log(`\nbara i develop (${baraMitt.length}):`);
console.log(baraMitt.join('\n'));
console.log(`\nbara i prod/develop (${baraProd.length}):`);
console.log(baraProd.join('\n'));
const gemensamma = [...a].filter((k) => b.has(k));
const skilda = gemensamma.filter((k) => JSON.stringify(A[k]) !== JSON.stringify(B[k]));
console.log(`\ngemensamma: ${gemensamma.length} · med olikt innehåll: ${skilda.length}`);
if (skilda.length) console.log('exempel: ' + skilda.slice(0, 10).join(', '));
