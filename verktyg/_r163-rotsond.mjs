#!/usr/bin/env node
// _r163-rotsond.mjs — F6 rot-analys: zcode-processernas släktträd + fabriksstatus + synkloggsvans.
import { execFileSync, execSync } from 'node:child_process';
import { readFileSync, existsSync } from 'node:fs';

const out = { ts: new Date().toISOString() };
function sh(c) { try { return execFileSync('bash', ['-c', c], { encoding: 'utf8', timeout: 20000 }).trim(); } catch (e) { return 'ERR ' + e.message.slice(0, 200); } }

// 1) Alla zcode-relaterade processer med förälder och ålder
out.proc = sh("ps -eo pid,ppid,rss,etimes,args --sort=-rss | grep -E 'zcode' | grep -v grep | awk '{printf \"%s ppid=%s rssMB=%d alderMin=%d \", $1, $2, $3/1024, $4/60; for(i=5;i<=7;i++) printf \"%s \", $i; print \"\"}' | head -30");

// 2) Finns fabriken (agentfabrik.mjs) och pumporna levande?
out.fabrik = sh("ps -eo pid,ppid,etimes,args | grep -E 'agentfabrik|pumpa|evighetsmotor|prod-?synk|kraschvakt' | grep -v grep | head -10") || 'ingen fabriksprocess syns';

// 3) Fabrikens status
try {
  const st = JSON.parse(readFileSync('/home/ak1a/AK1/data/vakten/agentfabrik/status/auto-s6.json', 'utf8'));
  out.status_s6 = { status: st.status, uppdaterad: st.uppdaterad, klara: (st.uppgifter || []).filter(u => u.status === 'klar').length, totalt: (st.uppgifter || []).length };
} catch (e) {
  out.status_s6 = 'saknas/läsfel — listar katalogen';
  out.statusFiler = sh("ls -t /home/ak1a/AK1/data/vakten/agentfabrik/status/ 2>/dev/null | head -5");
}

// 4) Prod-synkens loggsvans (vad säger den om byggplanen?)
out.synkSvans = sh("tail -12 /home/ak1a/AK1/data/infra/prod-synk.log 2>/dev/null || tail -12 /home/ak1a/agent/ak1/data/infra/prod-synk.log 2>/dev/null");

// 5) RAM nu
const mi = readFileSync('/proc/meminfo', 'utf8');
out.ramMB = Math.round(parseInt(mi.match(/MemAvailable:\s+(\d+)/)[1], 10) / 1024);
console.log(JSON.stringify(out, null, 1));
