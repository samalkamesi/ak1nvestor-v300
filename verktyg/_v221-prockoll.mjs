// _v221-prockoll.mjs — listar alla byggprocesser med PID + ålder.
import { execFileSync } from 'node:child_process';
try {
  const ut = execFileSync('bash', ['-c', "ps -eo pid,ppid,etime,cmd | grep -E 'npm|next' | grep -v grep | grep -v 'zcode' | grep -v pm2"], { encoding: 'utf8', timeout: 15000 }).trim();
  console.log(ut);
} catch (e) { console.log('(inga) ' + e.message); }
