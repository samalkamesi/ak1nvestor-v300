#!/usr/bin/env node
// _r160-byggfel.mjs — diagnos: varför failar byggloopen även på good-HEAD?
import { execFileSync } from 'node:child_process';
import { readdirSync, statSync, readFileSync } from 'node:fs';

const PROD = '/home/ak1a/AK1';
const out = { ts: new Date().toISOString() };

function sh(cmd, args, opts = {}) {
  return execFileSync(cmd, args, { encoding: 'utf8', timeout: 30000, ...opts }).trim();
}

// --- synk-loggar i /tmp, nyaste först
try {
  const filer = readdirSync('/tmp')
    .filter((f) => f.startsWith('synk-') || f.includes('bygg'))
    .map((f) => `/tmp/${f}`)
    .filter((f) => { try { return statSync(f).isFile(); } catch { return false; } });
  filer.sort((a, b) => statSync(b).mtimeMs - statSync(a).mtimeMs);
  out.loggfiler = filer.slice(0, 8).map((p) => `${p} (${Math.round(statSync(p).size / 1024)} kB, ${statSync(p).mtime.toISOString()})`);
  out.svansar = {};
  for (const p of filer.slice(0, 2)) {
    const t = readFileSync(p, 'utf8').trimEnd().split('\n');
    out.svansar[p] = t.slice(-60);
  }
} catch (e) { out.loggfiler = 'ERR ' + e.message; }

// --- diskutrymme
try { out.df = sh('df', ['-h', '/', '/tmp', PROD]).split('\n'); } catch (e) { out.df = 'ERR ' + e.message; }

// --- inode
try { out.dfI = sh('df', ['-i', '/']).split('\n'); } catch (e) { out.dfI = 'ERR ' + e.message; }

// --- prod HEAD-historik
try { out.prodLogg = sh('git', ['-C', PROD, 'log', '--oneline', '-5']).split('\n'); } catch (e) { out.prodLogg = 'ERR ' + e.message; }

// --- deploylås + eventuella byggprocesser
try { out.las = sh('bash', ['-c', 'ls -la /tmp/ak1a-deploy.lock 2>/dev/null; fuser -v /tmp/ak1a-deploy.lock 2>&1 | head -5']) || 'inga ägare'; } catch (e) { out.las = 'ERR ' + e.message; }
try { out.psBygg = sh('bash', ['-c', 'ps -eo pid,rss,etime,args --sort=-rss | grep -E "next|node.*build|npm" | grep -v grep | head -8']) || 'inga byggprocesser'; } catch (e) { out.psBygg = 'ERR ' + e.message; }

// --- .next-läge
try {
  const st = statSync(`${PROD}/.next`);
  out.next = { mtime: st.mtime.toISOString() };
} catch (e) { out.next = 'saknas: ' + e.message; }

console.log(JSON.stringify(out, null, 1));
