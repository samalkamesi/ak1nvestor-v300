// Rond 158: kundprioritet 1 — verifiera att /blogg renderar alla inlägg live.
import { execFileSync } from 'node:child_process';
import { readdirSync, statSync, existsSync } from 'node:fs';
import { join } from 'node:path';

const ws = '/home/ak1a/agent/ak1';
const prod = '/home/ak1/AK1';

function git(args, cwd) {
  try {
    return execFileSync('git', args, { cwd, encoding: 'utf8' }).trim();
  } catch (e) {
    return 'FEL: ' + String(e.stdout || e.message);
  }
}

function raknaJson(dir) {
  let n = 0;
  if (!existsSync(dir)) return 0;
  for (const f of readdirSync(dir)) {
    const p = join(dir, f);
    if (statSync(p).isDirectory()) n += raknaJson(p);
    else if (f.endsWith('.json')) n++;
  }
  return n;
}

console.log('== GIT ==');
console.log('ws-HEAD :', git(['log', '-1', '--format=%h %s'], ws));
console.log('ws-yta  :', git(['status', '--porcelain'], ws) || '(ren)');
console.log('prod-HEAD:', git(['log', '-1', '--format=%h %s'], prod));

console.log('\n== BLOGGDATA (disk) ==');
console.log('ws   data/blogg *.json:', raknaJson(join(ws, 'data/blogg')));
console.log('prod data/blogg *.json:', raknaJson(join(prod, 'data/blogg')));

console.log('\n== LIVE /blogg ==');
const svar = await fetch('https://lab.ak1nvestor.com/blogg');
const html = await svar.text();
const slugLankar = new Set(
  [...html.matchAll(/href="\/blogg\/([^"?#]+)"/g)].map((m) => m[1])
);
console.log('status:', svar.status, '| html-längd:', html.length);
console.log('unika /blogg/<slug>-länkar i svaret:', slugLankar.size);
const alla = [...slugLankar];
console.log('första 5:', alla.slice(0, 5).join(', '));
console.log('sista 5 :', alla.slice(-5).join(', '));
