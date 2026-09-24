#!/usr/bin/env node
// _r160-bygg.mjs — startar byggwrapper FRISTÅENDE (detached) efter säkerhetskontroller.
import { execFileSync, spawn } from 'node:child_process';
import { readFileSync } from 'node:fs';

function sh(cmd, args) {
  return execFileSync(cmd, args, { encoding: 'utf8', timeout: 15000 }).trim();
}

// 1. RAM-kontroll (kallbyggets behov enligt synkens erfarenhet)
const mi = readFileSync('/proc/meminfo', 'utf8');
const ramMB = Math.round(parseInt(mi.match(/MemAvailable:\s+(\d+)/)[1], 10) / 1024);
if (ramMB < 2200) { console.log('AVBRYT: bara ' + ramMB + ' MB fritt (< 2200)'); process.exit(1); }
console.log('RAM: ' + ramMB + ' MB fritt — OK');

// 2. Ingen pågående bygge får finnas (våg 100-regeln)
let ps = '';
try { ps = sh('bash', ['-c', "ps -eo args | grep -E 'next build|npm run build|synk' | grep -v grep || true"]); } catch {}
if (ps) { console.log('AVBRYT: pågående bygge/synk:\n' + ps); process.exit(1); }
console.log('Inga pågående byggen — OK');

// 3. Starta wrappern detached — överlever sessionen, skriver /tmp/r160-bygg-status.txt
const barn = spawn('bash', ['/home/ak1a/agent/ak1/verktyg/_r160-byggwrapper.sh'], {
  detached: true, stdio: 'ignore', cwd: '/tmp',
});
barn.unref();
console.log('Bygget startat FRISTÅENDE (pid ' + barn.pid + ') — status i /tmp/r160-bygg-status.txt, logg i /tmp/r160-build.log');
