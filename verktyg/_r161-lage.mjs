#!/usr/bin/env node
// _r161-lage.mjs — standby-sond: dirigentläge, fabriksbarn, RAM, prod-hälsa, git-läge.
import { execFileSync } from 'node:child_process';
import { readFileSync, existsSync } from 'node:fs';

const PROD = '/home/ak1a/AK1';
const WS = '/home/ak1a/agent/ak1';
const out = { ts: new Date().toISOString() };

function sh(cmd, args, opts = {}) {
  return execFileSync(cmd, args, { encoding: 'utf8', timeout: 20000, ...opts }).trim();
}

out.nu = sh('date', ['+%%Y-%%m-%%dT%%H:%%M:%%S %%z']).replace(/%%/g, '%');
const mi = readFileSync('/proc/meminfo', 'utf8');
out.ramMB = Math.round(parseInt(mi.match(/MemAvailable:\s+(\d+)/)[1], 10) / 1024);

// Fabriksbarn
try {
  const ps = sh('ps', ['-eo', 'args']);
  out.fabriksbarn = ps.split('\n').filter((l) => l.includes('zcode -p') && l.includes('fabriksagent')).length;
} catch (e) { out.fabriksbarn = 'ERR ' + e.message; }

// Dirigent + byggstatus
out.dirigentStatus = existsSync('/tmp/r160-dirigent-status.txt')
  ? readFileSync('/tmp/r160-dirigent-status.txt', 'utf8').trim().split('\n') : 'saknas';
out.byggStatus = existsSync('/tmp/r160-bygg-status.txt')
  ? readFileSync('/tmp/r160-bygg-status.txt', 'utf8').trim() : 'saknas';
out.dirigentLever = (() => {
  try { sh('bash', ['-c', 'kill -0 $(pgrep -f _r160-dirigent.sh | head -1) 2>/dev/null']); return true; } catch { return false; }
})();

// Prod-hälsa (loopback)
try { const r = await fetch('http://localhost:3000/'); out.prod = r.status; } catch (e) { out.prod = 'ERR ' + e.message; }

// Git båda träd
out.ws = { head: sh('git', ['-C', WS, 'rev-parse', '--short', 'HEAD']), dirty: sh('git', ['-C', WS, 'status', '--porcelain']).split('\n').filter(Boolean) };
out.prodHead = sh('git', ['-C', PROD, 'rev-parse', '--short', 'HEAD']);
out.wsHeadIProd = out.ws.head === out.prodHead;

console.log(JSON.stringify(out, null, 1));
