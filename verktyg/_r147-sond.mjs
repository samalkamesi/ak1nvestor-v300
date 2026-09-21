// rond 147-sond: lägesbild för standby-sessionen (worklog-svans, träd, prod-synk, mål)
import fs from 'node:fs';
import { execSync } from 'node:child_process';

const las = (p, n) => {
  try {
    const t = fs.readFileSync(p, 'utf8').split('\n');
    return t.slice(-n).join('\n');
  } catch { return `(saknas: ${p})`; }
};

console.log('══ WORKLOG (sista 45) ══');
console.log(las('worklog.md', 45));

console.log('\n══ ARBETSTRÄD git status (kort) ══');
try {
  console.log(execSync('git status --porcelain', { cwd: '/home/ak1a/agent/ak1', encoding: 'utf8', timeout: 15000 }));
} catch (e) { console.log('FEL: ' + e.message); }

console.log('══ PROD-TRÄD (/home/ak1a/AK1) ══');
try {
  console.log(execSync('git log --oneline -3 && git status --porcelain | head -20', { cwd: '/home/ak1a/AK1', encoding: 'utf8', timeout: 15000 }));
} catch (e) { console.log('FEL: ' + e.message); }

console.log('\n══ PROD-SYNK-LOGG (kandidater, sista 25 rader) ══');
const kandidater = [
  'data/vakten/prod-synk.log',
  'data/infra/contabo/prod-synk.log',
  '/home/ak1a/AK1/data/vakten/prod-synk.log',
  '/home/ak1a/agent/ak1/data/vakten/prod-synk.log',
];
for (const k of kandidater) {
  if (fs.existsSync(k)) {
    console.log(`--- ${k} ---`);
    console.log(las(k, 25));
  }
}

console.log('\n══ MÅL-TILLSTÅND ══');
for (const p of ['data/vakten/mal-state.json', '/home/ak1a/AK1/data/vakten/mal-state.json']) {
  if (fs.existsSync(p)) console.log(p + ': ' + fs.readFileSync(p, 'utf8').slice(0, 400));
}

console.log('\n══ SENASTE BYGG (BUILD_ID i prod) ══');
try {
  const bid = fs.readFileSync('/home/ak1a/AK1/.next/BUILD_ID', 'utf8').trim();
  const stat = fs.statSync('/home/ak1a/AK1/.next/BUILD_ID');
  console.log('BUILD_ID: ' + bid + ' · mtime: ' + stat.mtime.toISOString());
} catch (e) { console.log('FEL: ' + e.message); }
