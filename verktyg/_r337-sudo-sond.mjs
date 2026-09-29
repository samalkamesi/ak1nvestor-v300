// r337 sudo-sond: PG-klusterläge + vad sudo tillåter (read-only underlag)
import { execSync } from 'node:child_process';

const sh = (cmd, timeout = 20000) => {
  try { return execSync(cmd, { cwd: '/bin', shell: '/bin/bash', encoding: 'utf8', timeout, stdio: ['ignore', 'pipe', 'pipe'] }).toString().trim(); }
  catch (e) { return 'FEL/NEKAD: ' + ((e.stdout || '') + (e.stderr || '')).trim().split('\n').slice(-2).join(' | ').slice(0, 200); }
};

console.log('=== pg_lsclusters ===');
console.log(sh('pg_lsclusters'));

console.log('\n=== sudo -n -l (tillåtna kommandon utan lösenord) ===');
console.log(sh('sudo -n -l 2>&1'));

console.log('\n=== protokollsfilen från avbruten övning (svans) ===');
console.log(sh('tail -8 /home/ak1a/agent/ak1/data/forskning/DR-PROV-2026-09-29-AUTO.md'));
