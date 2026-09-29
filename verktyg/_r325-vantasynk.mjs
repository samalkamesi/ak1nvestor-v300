// r325: varför väntar synken? processträd + barnstatus.
import { execSync } from 'node:child_process';
import fs from 'node:fs';

function kort(cmd, timeoutMs = 60_000) {
  try {
    return { kod: 0, ut: execSync(cmd, { encoding: 'utf8', timeout: timeoutMs, stdio: ['ignore', 'pipe', 'pipe'] }).trim() };
  } catch (e) {
    return { kod: e.status ?? 1, ut: ((e.stdout || '') + (e.stderr || '')).trim() };
  }
}

// Synkens process + barn
console.log('=== synk 632623 ===');
console.log(kort('ps -o pid,ppid,etimes,time,stat,wchan:25 -p 632623').ut);
console.log('\n=== synkens barn (ppid 632623) ===');
console.log(kort('ps -o pid,etimes,time,stat,wchan:25,cmd --ppid 632623 | head -6').ut || '(inga barn)');
console.log('\n=== next-build-familjen ===');
console.log(kort('ps -o pid,ppid,etimes,time,stat,wchan:25,cmd -p 637223,637687 2>/dev/null').ut || '(borta)');
console.log('\n=== tsc just nu ===');
console.log(kort(`ps -o pid,ppid,etimes,time,stat,cmd -C node 2>/dev/null | grep -E 'tsc|next' | head -4`).ut || '(ingen tsc/next-node)');
console.log('\n=== .next-ny aktivitet senaste 5 min ===');
console.log(kort(`find /home/ak1a/AK1/.next-ny -newermt '5 minutes ago' 2>/dev/null | head -5`).ut || '(tyst)');
console.log('\n=== flock-innehavare (lsom låset) ===');
console.log(kort(`cat /proc/632623/wchan 2>/dev/null; echo; ls -la /proc/632623/fd 2>/dev/null | grep -c lock`).ut);
console.log('\n=== pm2 ak1a uptime (restart skett?) ===');
const j = kort('pm2 jlist', 30_000).ut;
const ak1a = (j.match(/\{[^{}]*"name":"ak1a"[^{}]*\}/) || [''])[0];
console.log('pm_uptime:', new Date(Number((ak1a.match(/"pm_uptime":(\d+)/) || [])[1] || 0)).toISOString(), '· status:', (ak1a.match(/"status":"([^"]+)"/) || [])[1]);
