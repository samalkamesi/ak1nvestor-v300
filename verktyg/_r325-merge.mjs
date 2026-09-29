// r325: merge hem prod (fabrikens direkt-commits) — stegvis, med worklog-koll
import { execSync } from 'node:child_process';
import fs from 'node:fs';

function kort(cmd, timeoutMs = 120_000) {
  try {
    return { kod: 0, ut: execSync(cmd, { encoding: 'utf8', timeout: timeoutMs, stdio: ['ignore', 'pipe', 'pipe'] }).trim() };
  } catch (e) {
    return { kod: e.status ?? 1, ut: ((e.stdout || '') + (e.stderr || '')).trim() };
  }
}

// 1. Fetch (idempotent — kör om tyst)
const fetch = kort('git fetch prod develop 2>&1 | tail -2');
console.log('fetch:', fetch.ut || '(tyst = ok)');

// 2. Hur många commits efter? Rör mergen worklog.md?
const antal = kort('git log --oneline HEAD..prod/develop | wc -l').ut;
const worklogSkillnad = kort('git diff --stat HEAD..prod/develop -- worklog.md').ut;
console.log('commits att merga:', antal);
console.log('worklog berörs av mergen:', worklogSkillnad ? worklogSkillnad : 'NEJ');

// 3. Mina smutsiga filer som mergen KAN röra?
const smutsiga = kort('git status --porcelain').ut.split('\n').filter(Boolean);
const mergensFiler = kort('git diff --name-only HEAD..prod/develop').ut.split('\n').filter(Boolean);
const krock = smutsiga.filter((s) => {
  const f = s.slice(3).trim();
  return mergensFiler.includes(f);
});
console.log('smutsiga filer:', smutsiga.length, '· krockar med mergen:', krosslista(krock));

function krosslista(k) { return k.length ? k.join(', ') : 'INGA'; }

// 4. Merge (arbetsytans egna smutsiga filer som INTE krockar är ok för git)
if (!krock.length) {
  const merge = kort('git merge prod/develop --no-edit 2>&1 | tail -5');
  console.log('\nmerge:', merge.kod === 0 ? 'OK' : `FEL ${merge.kod}`, merge.ut.slice(0, 500));
  const topp = kort('git log --oneline -2').ut;
  console.log('ny HEAD:\n' + topp);
} else {
  console.log('\nMERGE SKJUTS UPP — krockande smutsiga filer måste committas först');
}
