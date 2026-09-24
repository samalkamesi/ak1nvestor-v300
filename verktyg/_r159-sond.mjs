// Styrelserond 159: lägessond — fabrik (s10 + v159), prod-läge, synk-logg, pipeline, RAM.
import { execFileSync } from 'node:child_process';
import { readdirSync, readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';

const ws = '/home/ak1a/agent/ak1';
const prod = '/home/ak1a/AK1';

function git(args, cwd = ws) {
  return execFileSync('git', args, { cwd, encoding: 'utf8' }).trim();
}
function prodGit(args) {
  return execFileSync('git', ['--git-dir', `${prod}/.git`, '--work-tree', prod, ...args], {
    cwd: ws, encoding: 'utf8',
  }).trim();
}

console.log('== TRÄD ==');
console.log('ws-HEAD  :', git(['log', '-1', '--format=%h %ci %s']).slice(0, 120));
console.log('prod-HEAD:', prodGit(['log', '-1', '--format=%h %ci %s']).slice(0, 120));
console.log('ws-yta   :', git(['status', '--porcelain']) || '(ren)');
console.log('prod-yta :', prodGit(['status', '--porcelain']).slice(0, 300) || '(ren)');

console.log('\n== FABRIKEN: s10 + v159 ==');
const stDir = `${prod}/data/vakten/agentfabrik/status`;
for (const f of readdirSync(stDir)) {
  if (f.includes('auto-s10') || f.includes('v159')) {
    try {
      const j = JSON.parse(readFileSync(join(stDir, f), 'utf8'));
      const klara = (j.klara || []).length;
      console.log(`${f} => status=${j.status} klara=${klara}/${j.totalt ?? '?'}`);
      if (j.status === 'pågår') {
        for (const info of j.uppgiftsinfo || []) console.log('   -', info.id, info.status || '?');
      }
    } catch { console.log(f, '(oläsbart)'); }
  }
}
console.log('ko-katalogen:', readdirSync(`${prod}/data/vakten/agentfabrik/ko`).join(', ') || '(tom)');

console.log('\n== PROD-SYNK-LOGG (sista raderna — GUL-källan?) ==');
const kandidater = [
  'data/vakten/prod-synk.log',
  'data/infra/prod-synk.log',
  'data/infra/contabo/prod-synk.log',
  'prod-synk.log',
];
let hittad = null;
for (const k of kandidater) if (existsSync(join(prod, k))) { hittad = join(prod, k); break; }
console.log(hittad ? readFileSync(hittad, 'utf8').trim().split('\n').slice(-5).join('\n') : '(synk-logg hittades ej på gissade vägar)');

console.log('\n== PIPELINE-KO.md ==');
const pipe = join(ws, 'PIPELINE-KO.md');
if (existsSync(pipe)) {
  const rader = readFileSync(pipe, 'utf8').split('\n');
  console.log('(totalt', rader.length, 'rader — visar sista 25)');
  console.log(rader.slice(-25).join('\n'));
} else console.log('(PIPELINE-KO.md saknas i ws)');

console.log('\n== RAM ==');
console.log(execFileSync('free', ['-m'], { encoding: 'utf8' }).split('\n').slice(0, 2).join(' | '));
