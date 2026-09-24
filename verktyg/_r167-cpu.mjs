#!/usr/bin/env node
// _r167-cpu.mjs — två CPU-sampel 90 s isär på föräldralösa fabriksbarn: arbetar eller hänger?
import { execFileSync } from 'node:child_process';

function sampel() {
  const rader = execFileSync('bash', ['-c', "ps -eo pid,ppid,etimes,times,args | grep 'Agentfabrik' | grep -v grep"], { encoding: 'utf8', timeout: 20000 }).trim().split('\n');
  const m = new Map();
  for (const r of rader) {
    const f = r.trim().split(/\s+/);
    m.set(f[0], { ppid: f[1], alderSek: +f[2], cpuSek: +f[3], huvud: (f[4] || '').slice(0, 20) });
  }
  return m;
}
const a = sampel();
await new Promise((r) => setTimeout(r, 90000));
const b = sampel();
const ut = [];
for (const [pid, s] of b) {
  const f = a.get(pid);
  ut.push({ pid, ppid: s.ppid, alderMin: Math.round(s.alderSek / 60), cpuSek: s.cpuSek, deltaCpuSek: f ? s.cpuSek - f.cpuSek : 'NY' });
}
console.log(JSON.stringify({ ts: new Date().toISOString(), barn: ut }, null, 1));
