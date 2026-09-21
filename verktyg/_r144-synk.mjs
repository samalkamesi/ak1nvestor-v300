#!/usr/bin/env node
// Rond 144: synkens byggfönster-läge (snittets DoD)
import { execSync } from 'node:child_process';
import fs from 'node:fs';
const run = (cmd, cwd = '/home/ak1a/AK1', t = 15000) => {
  try { return execSync(cmd, { cwd, encoding: 'utf8', timeout: t }).trim(); } catch (e) { return 'ERR ' + String(e.stdout || e.message).slice(0, 120); }
};
console.log('RAM:', run('grep MemAvailable /proc/meminfo', '/', 5000));
console.log('\npm2 ak1a:', run("pm2 jlist 2>/dev/null | node -e \"const d=JSON.parse(require('fs').readFileSync(0,'utf8'));const a=d.find(p=>p.name==='ak1a');console.log(a.pm2_env.status+' · restarts '+a.pm2_env.restart_time+' · up '+Math.round((Date.now()-a.pm2_env.pm_uptime)/60000)+' min')\""));
console.log('\nsnittet:', run('curl -s -o /dev/null -w "%{http_code}" -m 10 https://lab.ak1nvestor.com/rapportakademin'));
console.log('\nprod HEAD:', run('git log --oneline -1'));
for (const f of ['/tmp/synk-build.log', '/tmp/synk-npmci.log']) {
  try {
    const st = fs.statSync(f);
    console.log(`\n${f}: skrivet ${Math.round((Date.now() - st.mtimeMs) / 60000)} min sedan`);
    console.log(fs.readFileSync(f, 'utf8').trim().split('\n').slice(-3).join('\n').slice(0, 250));
  } catch { console.log(`\n${f}: saknas`); }
}
// fabrikens barn (äter RAM?)
console.log('\nzcode-barn:', run('pgrep -c -f "zcode -p" || echo 0'));
