// r325: commit + merge hem prod — med tidsrym för pre-commit-tsc.
import { execSync } from 'node:child_process';

function kort(cmd, timeoutMs = 420_000) {
  try {
    return { kod: 0, ut: execSync(cmd, { encoding: 'utf8', timeout: timeoutMs, stdio: ['ignore', 'pipe', 'pipe'] }).trim() };
  } catch (e) {
    return { kod: e.status ?? 1, ut: ((e.stdout || '') + (e.stderr || '')).trim() };
  }
}

const c1 = kort('git add worklog.md');
const c2 = kort('git commit -F verktyg/_r325-msg1.txt');
console.log('commit worklog:', c2.kod === 0 ? 'OK' : `FEL ${c2.kod}`);
console.log(c2.ut.slice(-400));
const topp = kort('git log --oneline -1').ut;
console.log('HEAD:', topp);

// Merge hem prod/develop — worklog-konflikt trolig; lös enligt _r323-mönstret (theirs före ours)
const m = kort('git merge prod/develop --no-edit 2>&1 | tail -4');
console.log('\nmerge:', m.kod === 0 ? 'OK' : `FEL ${m.kod}`);
console.log(m.ut.slice(0, 400));
if (m.kod !== 0) {
  const status = kort('git status --porcelain | grep -E "^(UU|AA|DD)" | head -5').ut;
  console.log('konfliktfiler:', status || '(inga markerade)');
}
