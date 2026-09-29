// r325: deploy-verifiering — prod-träd vs develop-träd, pm2-friskhet, vaktkö.
import { execSync } from 'node:child_process';

function kort(cmd, timeoutMs = 60_000) {
  try {
    return { kod: 0, ut: execSync(cmd, { encoding: 'utf8', timeout: timeoutMs, stdio: ['ignore', 'pipe', 'pipe'] }).trim() };
  } catch (e) {
    return { kod: e.status ?? 1, ut: ((e.stdout || '') + (e.stderr || '')).trim() };
  }
}

const AK1 = '/home/ak1a/AK1';
const prodTop = kort(`git -C ${AK1} log --oneline -6`);
const devTop = kort('git -C /home/ak1a/agent/ak1 log --oneline -3');
const prodHash = kort(`git -C ${AK1} rev-parse HEAD`).ut;
const devHash = kort('git -C /home/ak1a/agent/ak1 rev-parse HEAD').ut;
const devInnehallerProd = kort(`git -C /home/ak1a/agent/ak1 merge-base --is-ancestor ${prodHash} HEAD`).kod;
const prodInnehallerDev = kort(`git -C ${AK1} merge-base --is-ancestor ${devHash} HEAD`).kod;
const pm2ak1a = kort(`pm2 jlist`, 30_000).ut.match(/\{[^{}]*"name":"ak1a"[^{}]*\}/);
const pmUptime = pm2ak1a ? Number((pm2ak1a[0].match(/"pm_uptime":(\d+)/) || [])[1] || 0) : 0;
const pmStatus = pm2ak1a ? (pm2ak1a[0].match(/"status":"([^"]+)"/) || [])[1] : '?';
const https = kort(`curl -s -o /dev/null -w '%{http_code}' --max-time 15 https://lab.ak1nvestor.com/`).ut;

console.log('=== PROD-TRÄD (AK1) ===');
console.log(prodTop.ut || `(fel ${prodTop.kod})`);
console.log('\n=== DEVELOP (agent-yta) ===');
console.log(devTop.ut || `(fel ${devTop.kod})`);
console.log(`\nprod-HEAD: ${prodHash.slice(0, 9)}`);
console.log(`dev-HEAD:  ${devHash.slice(0, 9)}`);
console.log(`develop innehåller prod-HEAD: ${devInnehallerProd === 0 ? 'JA' : 'NEJ'}`);
console.log(`prod innehåller dev-HEAD: ${prodInnehallerDev === 0 ? 'JA' : 'NEJ'}`);
console.log(`pm2 ak1a: ${pmStatus} · pm_uptime: ${pmUptime ? new Date(pmUptime).toISOString() : '?'}`);
console.log(`https://lab.ak1nvestor.com/: ${https || '?'}`);
