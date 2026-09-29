// r325: byggframsteg-sampling — växer CPU-tid/filer? + fabriksbarn S4 + RAM
import { execSync } from 'node:child_process';
import fs from 'node:fs';

function kort(cmd, timeoutMs = 60_000) {
  try {
    return { kod: 0, ut: execSync(cmd, { encoding: 'utf8', timeout: timeoutMs, stdio: ['ignore', 'pipe', 'pipe'] }).trim() };
  } catch (e) {
    return { kod: e.status ?? 1, ut: ((e.stdout || '') + (e.stderr || '')).trim() };
  }
}
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

function procbild() {
  const ut = kort(`ps -o pid,etimes,time,pcpu,pmem,stat,wchan:30,cmd -p 642188 2>/dev/null | tail -1`).ut;
  return ut;
}

console.log('prov 1:', procbild() || '(pid borta)');
const m1 = fs.existsSync('/home/ak1a/AK1/.next-ny/cache/.tsbuildinfo')
  ? fs.statSync('/home/ak1a/AK1/.next-ny/cache/.tsbuildinfo')
  : null;
const mem = kort(`grep MemAvailable /proc/meminfo`).ut;
const synkEt = kort(`ps -o pid,etimes,time,stat -p 632623,637223,637687 2>/dev/null`).ut;
await sleep(60_000);
console.log('prov 2 (60 s senare):', procbild() || '(pid borta)');
const m2 = fs.existsSync('/home/ak1a/AK1/.next-ny/cache/.tsbuildinfo')
  ? fs.statSync('/home/ak1a/AK1/.next-ny/cache/.tsbuildinfo')
  : null;
const nySkrivning = kort(`find /home/ak1a/AK1/.next-ny -newermt '3 minutes ago' 2>/dev/null | head -5`).ut || '(inga filer yngre än 3 min)';

console.log('\ntsbuildinfo:', m1 ? `${m1.size} byte, mtime ${m1.mtime.toISOString()}` : 'finns ej',
  '→', m2 ? `${m2.size} byte, ${m2.mtime.toISOString()}` : 'finns ej');
console.log('filer skrivna i .next-ny senaste 3 min:', nySkrivning);
console.log('\nRAM:', mem);
console.log('\nsynk/build/pool-processer:\n' + synkEt);
const fabrik = kort(`ls -t /home/ak1a/AK1/data/vakten/agentfabrik/status/ 2>/dev/null | head -4`).ut;
console.log('\nsenaste fabriksstatus:', fabrik);
