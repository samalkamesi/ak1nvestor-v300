// r333 slutpush: loop { fetch → merge vid divergens → push } tills fönstret öppnas (r330-mönstret)
import { execSync } from 'node:child_process';

const YTA = '/home/ak1a/agent/ak1';
const sh = (cmd, timeout = 150000) => {
  try { return { ok: true, ut: execSync(cmd, { cwd: YTA, shell: '/bin/bash', encoding: 'utf8', timeout, stdio: ['ignore', 'pipe', 'pipe'] }).toString().trim() }; }
  catch (e) { return { ok: false, ut: ((e.stdout || '') + '\n' + (e.stderr || e.message)).trim().split('\n').filter(l => !l.startsWith('hint:') && !l.startsWith(' ') && l !== '').join(' | ').slice(0, 300) }; }
};
const sleep = (ms) => new Promise(r => setTimeout(r, ms));

for (let försök = 1; försök <= 6; försök++) {
  console.log(`── försök ${försök} (${new Date().toISOString().slice(11, 19)}Z) ──`);
  const f = sh('git fetch prod 2>&1');
  if (!f.ok) { console.log('fetch: ' + f.ut); await sleep(20000); continue; }

  const divergens = sh('git log --oneline develop..prod/develop');
  if (divergens.ok && divergens.ut) {
    console.log('divergens (' + divergens.ut.split('\n').length + ' st): ' + divergens.ut.split('\n').map(l => l.slice(0, 60)).join(' ;; '));
    const m = sh('git merge prod/develop --no-edit 2>&1');
    console.log('merge: ' + (m.ok ? 'OK ' + m.ut.split('\n')[0] : 'FEL ' + m.ut));
    if (!m.ok) { console.log('MERGE-KONFLIKT — manuell lösning krävs'); process.exit(1); }
  } else {
    console.log('ingen divergens');
  }

  const p = sh('git push prod develop 2>&1');
  if (p.ok) {
    console.log('PUSH GRÖN');
    const v = sh('git ls-remote prod develop');
    const h = sh('git rev-parse develop');
    console.log('remote: ' + (v.ut || '').slice(0, 12) + ' · lokal: ' + (h.ut || '').slice(0, 12) +
      ' · ' + ((v.ut || '').startsWith(h.ut || '?') ? 'SAMMA — LEVERERAT' : 'OLIKA'));
    process.exit(0);
  }
  console.log('push: ' + p.ut);
  await sleep(20000);
}
console.log('FÖRSÖKEN UTTÖMDA — fabrikens committar tätare än fönstret; kör igen nästa hjärtslag');
process.exit(1);
