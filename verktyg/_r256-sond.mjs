#!/usr/bin/env node
// ROND 256 — lägessond: r255-reparationens status, prod-hälsa, HAL-data.
import fs from 'node:fs';
import { execSync } from 'node:child_process';

const las = (p) => { try { return fs.readFileSync(p, 'utf8').trim(); } catch { return '(saknas)'; } };

console.log('=== r255-repair-status.txt ===');
console.log(las('/tmp/r255-repair-status.txt') || '(tom/saknas)');
console.log('=== r255-repair.log (sista 15 raderna) ===');
try {
  const logg = las('/tmp/r255-repair.log').split('\n').filter(Boolean).slice(-15);
  console.log(logg.join('\n'));
} catch { console.log('(ingen logg)'); }

console.log('=== prod .next ===');
try { console.log('BUILD_ID:', las('/home/ak1a/AK1/.next/BUILD_ID') || '(SAKNAS — .next raderad?)'); } catch { console.log('BUILD_ID: SAKNAS'); }
try {
  const st = fs.statSync('/home/ak1a/AK1/.next');
  console.log('.next mtime:', st.mtime.toISOString());
} catch { console.log('.next mtime: (finns ej)'); }

console.log('=== pm2 ak1a ===');
try {
  const p = execSync("pm2 jlist", { timeout: 15000 }).toString();
  const j = JSON.parse(p).find((x) => x.name === 'ak1a');
  console.log(j ? `status=${j.pm2_env.status} restarts=${j.pm2_env.restart_time} uptime=${new Date(j.pm2_env.pm_uptime).toISOString()}` : '(ak1a finns ej i pm2)');
} catch (e) { console.log('pm2 jlist FEL:', String(e.message).slice(0, 120)); }

console.log('=== HTTP-sonder (localhost:3000) ===');
for (const sökväg of ['/', '/dataset', '/analys/INFY.NS', '/analys/APOLLOHOSP.NS']) {
  try {
    const kod = execSync(`curl -s -o /dev/null -w '%{http_code}' -m 8 http://localhost:3000${sökväg}`, { timeout: 12000 }).toString();
    console.log(`${sökväg} → ${kod}`);
  } catch (e) { console.log(`${sökväg} → FEL`); }
}

console.log('=== byggprocesser ===');
try {
  const ps = execSync("ps -eo pid,etimes,rss,args | grep -E 'next|npm run build' | grep -v grep", { timeout: 15000 }).toString().trim();
  console.log(ps || '(inga)');
} catch { console.log('(inga)'); }

console.log('=== RAM ===');
try { console.log(execSync("free -m | awk 'NR==2 {print $3 \" använd / \" $2 \" total, \" $7 \" tillgänglig (MB)\"}'", { timeout: 10000 }).toString().trim()); } catch {}

console.log('=== HAL-data ===');
try { console.log('/tmp/r255-hal:', fs.readdirSync('/tmp/r255-hal').join(', ')); } catch { console.log('/tmp/r255-hal: (saknas)'); }

console.log('=== deploy-lås ===');
try { console.log(execSync("fuser -v /tmp/ak1a-deploy.lock 2>&1 || echo '(lås fritt)'", { timeout: 10000 }).toString().trim()); } catch { console.log('(lås fritt)'); }
