// r325: bygg-vs-byte-truth — .next-ny/byggtillstånd, pm2, synkens processäge.
import { execSync } from 'node:child_process';
import fs from 'node:fs';

function kort(cmd, timeoutMs = 30_000) {
  try {
    return { kod: 0, ut: execSync(cmd, { encoding: 'utf8', timeout: timeoutMs, stdio: ['ignore', 'pipe', 'pipe'] }).trim() };
  } catch (e) {
    return { kod: e.status ?? 1, ut: ((e.stdout || '') + (e.stderr || '')).trim() };
  }
}

const ny = '/home/ak1a/AK1/.next-ny';
console.log('.next-ny BUILD_ID:', fs.existsSync(`${ny}/BUILD_ID`) ? fs.statSync(`${ny}/BUILD_ID`).mtime.toISOString() : '(saknas)');
console.log('.next-ny senaste skrivning:', kort(`find ${ny} -newermt '10 minutes ago' 2>/dev/null | head -3`).ut || '(tyst sedan 10 min)');
console.log('\nRIKTIGA byggprocesser (exkl grep-själva):');
console.log(kort(`ps -eo pid,etimes,cmd | grep -E '(/next[ /]|next-build|prod-synk\\.mjs)' | grep -v grep | head -6`).ut || '(INGA — synken bygger ej just nu)');
console.log('\npm2 ak1a:');
const j = JSON.parse(kort('pm2 jlist', 30_000).ut || '[]');
const ak1a = j.filter((p) => p.name === 'ak1a')[0];
if (ak1a) {
  console.log('status:', ak1a.pm2_env.status, '· pm_uptime:', new Date(ak1a.pm2_env.pm_uptime).toISOString(), '· restarts:', ak1a.pm2_env.restart_time);
} else {
  console.log('(hittades ej)');
}
console.log('\nprod 200-koll:', kort(`curl -s -o /dev/null -w '%{http_code}' --max-time 15 http://localhost:3000/`).ut, '(localhost)');
console.log('\nsynkloggs-svans:');
console.log(kort('tail -3 /home/ak1a/AK1/data/vakten/prod-synk.log').ut);
