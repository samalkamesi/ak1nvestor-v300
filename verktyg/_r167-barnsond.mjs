#!/usr/bin/env node
// _r167-barnsond.mjs — lever de föräldralösa 12:25-barnen? CPU-tid + senaste aktivitet + prod-ytans smuts.
import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';

const out = { ts: new Date().toISOString() };
function sh(c) { try { return execFileSync('bash', ['-c', c], { encoding: 'utf8', timeout: 20000 }).trim(); } catch (e) { return 'ERR ' + e.message.slice(0, 150); } }

// 12:25-klassens kända pid:er + alla Agentfabrik-barn
out.barn = sh("ps -eo pid,ppid,rss,etimes,times,args | grep 'Agentfabrik' | grep -v grep | awk '{printf \"pid=%s ppid=%s rssMB=%d alderMin=%d cpuSek=%d\n\", $1, $2, $3/1024, $4/60, $5}'");
// Fabrikens nuvarande process
out.fabrik = sh("ps -eo pid,etimes,args | grep 'agentfabrik.mjs' | grep -v grep | awk '{printf \"pid=%s alderMin=%d\n\", $1, $2/60}'") || 'fabriken lever ej';
// Prod-ytans smuts: vilka filer?
out.prodYta = sh("cd /home/ak1a/AK1 && git status --porcelain | head -12");
out.prodYtaAntal = sh("cd /home/ak1a/AK1 && git status --porcelain | wc -l");
// Dirigentens senaste rad
try { out.dirigentSvans = readFileSync('/tmp/r163-dirigent.txt', 'utf8').trimEnd().split('\n').slice(-3); } catch (e) { out.dirigentSvans = 'saknas'; }
const mi = readFileSync('/proc/meminfo', 'utf8');
out.ramMB = Math.round(parseInt(mi.match(/MemAvailable:\s+(\d+)/)[1], 10) / 1024);
console.log(JSON.stringify(out, null, 1));
