// Rond 160 (iteration): restverifiering r159 — deploy, live-sitemap /fas2, v159-status, träd.
import { execFileSync } from 'node:child_process';
import { readdirSync, readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';

const ws = '/home/ak1a/agent/ak1';
const prod = '/home/ak1a/AK1';

function git(args, cwd = ws) {
  return execFileSync('git', args, { cwd, encoding: 'utf8' }).trim();
}
function prodGit(args) {
  return execFileSync('git', ['--git-dir', `${prod}/.git`, '--work-tree', prod, ...args], { cwd: ws, encoding: 'utf8' }).trim();
}

console.log('== TRÄD ==');
console.log('ws-HEAD  :', git(['log', '-1', '--format=%h %ci %s']).slice(0, 110));
console.log('prod-HEAD:', prodGit(['log', '-1', '--format=%h %ci %s']).slice(0, 110));
console.log('ws-yta   :', git(['status', '--porcelain']) || '(ren)');
console.log('prod-yta :', prodGit(['status', '--porcelain']).slice(0, 200) || '(ren)');

console.log('\n== PROD LIVE ==');
const bas = 'https://lab.ak1nvestor.com';
for (const sok of ['/', '/fas2', '/blogg']) {
  try {
    const r = await fetch(bas + sok, { redirect: 'follow' });
    console.log(sok, '=>', r.status);
  } catch (e) { console.log(sok, '=> FEL', e.message.slice(0, 80)); }
}
try {
  const sm = await (await fetch(bas + '/sitemap.xml')).text();
  console.log('sitemap.xml:', sm.length, 'tecken | /fas2 finns:', sm.includes('<loc>' + bas + '/fas2</loc>'));
} catch (e) { console.log('sitemap FEL:', e.message.slice(0, 80)); }

console.log('\n== FABRIKEN: v159 ==');
const stDir = `${prod}/data/vakten/agentfabrik/status`;
const v159 = readdirSync(stDir).filter((f) => f.includes('v159'));
if (v159.length) {
  for (const f of v159) {
    const j = JSON.parse(readFileSync(join(stDir, f), 'utf8'));
    console.log(f, '=> status:', j.status, '| klara:', (j.klara || []).length, '/', j.totalt ?? '?');
  }
} else {
  console.log('(väntar fortfarande i ko:)');
  console.log('ko:', readdirSync(`${prod}/data/vakten/agentfabrik/ko`).join(', ') || '(tom)');
}

console.log('\n== PROD-SYNK-LOGG (sista 8) ==');
console.log(readFileSync(`${prod}/data/vakten/prod-synk.log`, 'utf8').trim().split('\n').slice(-8).join('\n'));
