#!/usr/bin/env node
// _r162-bygglage.mjs — byggframsteg, processhälsa, RAM.
import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';

const out = { ts: new Date().toISOString() };
function sh(cmd, args, opts = {}) {
  return execFileSync(cmd, args, { encoding: 'utf8', timeout: 15000, ...opts }).trim();
}
out.nu = sh('date', ['+']);
try {
  out.psBuild = sh('bash', ['-c', "ps -eo pid,rss,etime,args | grep -E 'next build|npm run build' | grep -v grep | head -3"]) || 'inget byggProcess';
} catch (e) { out.psBuild = 'inget byggProcess'; }
const mi = readFileSync('/proc/meminfo', 'utf8');
out.ramMB = Math.round(parseInt(mi.match(/MemAvailable:\s+(\d+)/)[1], 10) / 1024);
try {
  const logg = readFileSync('/tmp/r160-build.log', 'utf8').trimEnd().split('\n');
  out.bygglogSvans = logg.slice(-8);
} catch (e) { out.bygglogSvans = 'ERR ' + e.message; }
console.log(JSON.stringify(out, null, 1));
