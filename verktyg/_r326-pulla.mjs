// r326: ff-pulla hem prod-trädets develop (nattens fabrikscommits) + visa bokföringsunderlag.
import { execSync } from 'node:child_process';
import fs from 'node:fs';

function kort(cmd, timeoutMs = 120_000) {
  try {
    return { kod: 0, ut: execSync(cmd, { encoding: 'utf8', timeout: timeoutMs, cwd: '/home/ak1a/agent/ak1', stdio: ['ignore', 'pipe', 'pipe'] }).trim() };
  } catch (e) {
    return { kod: e.status ?? 1, ut: ((e.stdout || '') + (e.stderr || '')).trim() };
  }
}

const pull = kort('git pull --ff-only prod develop 2>&1');
console.log('=== PULL (prod develop → arbetsyta) ===');
console.log(pull.kod === 0 ? pull.ut : `FEL kod ${pull.kod}:\n${pull.ut.slice(0, 800)}`);

console.log('\n=== HEAD EFTERÅT ===');
console.log(kort('git log --oneline -5').ut);

console.log('\n=== STATUS (untracked kvar?) ===');
console.log(kort('git status --short').ut || '(ren)');

console.log('\n=== worklog.md svans (20 rader) ===');
const wl = fs.readFileSync('/home/ak1a/agent/ak1/worklog.md', 'utf8');
console.log(wl.split('\n').slice(-20).join('\n'));

console.log('\n=== DRIFTSBOKEN svans (12 rader) ===');
if (fs.existsSync('/home/ak1a/agent/ak1/data/DRIFTSBOKEN.md')) {
  const db = fs.readFileSync('/home/ak1a/agent/ak1/data/DRIFTSBOKEN.md', 'utf8');
  console.log(db.split('\n').slice(-12).join('\n'));
} else {
  console.log('(data/DRIFTSBOKEN.md finns ej i arbetsytan)');
}

console.log('\n=== integritetsvaktens cron-anrop ===');
console.log(kort(`grep -rn "integritetsvakt" /home/ak1a/agent/ak1/data/infra/contabo/ 2>/dev/null | head -6`).ut || '(hittade inget cron-skripp i data/infra/contabo)');

console.log('\n=== synkens poll-cadence (crontab) ===');
console.log(kort(`crontab -l 2>/dev/null | grep -iE "synk|integritet" | head -8`).ut || '(inget i crontab)');
