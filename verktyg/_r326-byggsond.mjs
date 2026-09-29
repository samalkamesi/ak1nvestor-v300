// r326: byggsond — lever 05:17-bygget? processtäthet, loggb advisableörelse, .next-ny-aktivitet.
import { execSync } from 'node:child_process';
import fs from 'node:fs';

function kort(cmd, timeoutMs = 30_000) {
  try {
    return execSync(cmd, { encoding: 'utf8', timeout: timeoutMs, stdio: ['ignore', 'pipe', 'pipe'] }).trim();
  } catch (e) {
    return ((e.stdout || '') + (e.stderr || '')).trim() || '(fel)';
  }
}

console.log('KLOCKAN:', new Date().toISOString());
console.log('\n=== next-build-familjen (pid, alder, cpu-tid, stat) ===');
console.log(kort(`ps -eo pid,ppid,etimes,time,stat,rss,cmd | grep -E 'next build|next-build|prod-synk\\.mjs' | grep -v grep | head -8`) || '(INGA processer!)');

console.log('\n=== .next-ny aktivitet senaste 3 min ===');
console.log(kort(`find /home/ak1a/AK1/.next-ny -newermt '3 minutes ago' 2>/dev/null | head -6`) || '(tyst sedan 3 min)');
console.log('.next-ny BUILD_ID:', fs.existsSync('/home/ak1a/AK1/.next-ny/BUILD_ID') ? fs.statSync('/home/ak1a/AK1/.next-ny/BUILD_ID').mtime.toISOString() : '(saknas ännu)');

console.log('\n=== synk-build.log svans (6 rader) ===');
console.log(kort('tail -6 /tmp/synk-build.log'));
console.log('\nloggens mtime:', fs.statSync('/tmp/synk-build.log').mtime.toISOString());

console.log('\n=== RAM (available) ===');
console.log(kort("awk '/MemAvailable/ {printf \"%.1f GB\\n\", $2/1048576}' /proc/meminfo"));

console.log('\n=== pm2 ak1a (drift under bygget) ===');
console.log(kort(`curl -s -o /dev/null -w '%{http_code}' --max-time 10 http://localhost:3000/`), '(localhost)');
