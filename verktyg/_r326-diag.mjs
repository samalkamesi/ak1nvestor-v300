// r326: integritetslarm-diagnostik — samlar allt om byggrace-fyndet i EN node-körning.
import { execSync } from 'node:child_process';
import fs from 'node:fs';

function kort(cmd, timeoutMs = 45_000) {
  try {
    return execSync(cmd, { encoding: 'utf8', timeout: timeoutMs, stdio: ['ignore', 'pipe', 'pipe'] }).trim();
  } catch (e) {
    return ((e.stdout || '') + (e.stderr || '')).trim() || `(fel kod ${e.status ?? '?'})`;
  }
}

const L = [];
const log = (s) => L.push(s);

log('=== KLOCKAN ===');
log(new Date().toISOString());

log('\n=== PÅGÅENDE PROCESSER (synk/bygg) ===');
log('prod-synk: ' + (kort(`ps aux | grep 'prod-synk' | grep -v grep`) || '(ingen)'));
log('next build: ' + (kort(`ps aux | grep 'next build' | grep -v grep`) || '(ingen)'));
log('npm bygg: ' + (kort(`ps aux | grep -E 'npm (ci|run build)' | grep -v grep`) || '(ingen)'));

log('\n=== .next / .next-ny ===');
const nx = '/home/ak1a/AK1/.next/BUILD_ID';
const nynx = '/home/ak1a/AK1/.next-ny/BUILD_ID';
log(`.next BUILD_ID: ${fs.readFileSync(nx, 'utf8').trim()} (mtime ${fs.statSync(nx).mtime.toISOString()})`);
log(`.next-ny: ${fs.existsSync(nynx) ? fs.readFileSync(nynx, 'utf8').trim() + ' (mtime ' + fs.statSync(nynx).mtime.toISOString() + ')' : 'borta (byte skett)'}`);
log(`.next-ny-katalog: ${fs.existsSync('/home/ak1a/AK1/.next-ny') ? 'FINNS, ' + fs.readdirSync('/home/ak1a/AK1/.next-ny').length + ' poster' : 'borta'}`);

log('\n=== pm2 ak1a ===');
const j = kort('pm2 jlist');
const ak1a = (j.match(/\{[^{}]*"name":"ak1a"[^{}]*\}/) || [''])[0];
if (ak1a) {
  log('status: ' + ((ak1a.match(/"status":"([^"]+)"/) || [])[1] ?? '?'));
  log('pm_uptime: ' + new Date(Number((ak1a.match(/"pm_uptime":(\d+)/) || [])[1] || 0)).toISOString());
  log('restarts: ' + ((ak1a.match(/"restart_time":(\d+)/) || [])[1] ?? '?'));
  log('unstable_restarts: ' + ((ak1a.match(/"unstable_restarts":(\d+)/) || [])[1] ?? '?'));
} else {
  log('kunde inte parse:a pm2 jlist — svans: ' + j.slice(-300));
}

log('\n=== PROD-TRÄDET (git) ===');
log('HEAD: ' + kort('git -C /home/ak1a/AK1 log --oneline -3'));
log('smutsig: ' + kort('git -C /home/ak1a/AK1 status --porcelain | head -15'));
log('rev: ' + kort('git -C /home/ak1a/AK1 rev-parse --short HEAD'));

log('\n=== synk-build.log (svans 30 rader) ===');
log(kort('tail -30 /tmp/synk-build.log'));

log('\n=== prod-synk.log (svans 15 rader) ===');
log(kort('tail -15 /home/ak1a/AK1/data/vakten/prod-synk.log'));

log('\n=== deploy-bokföring ===');
log('vaktenfiler: ' + kort('ls /home/ak1a/agent/ak1/data/vakten/ | grep -iE "integritet|deploy"'));
log('prod-trädet: ' + kort('ls /home/ak1a/AK1/data/vakten/ | grep -iE "deploy|synk"'));

log('\n=== integritetsvaktens jämförelsekälla ===');
log(kort(`grep -rn "senaste-deployad\\|senasteDeployad" /home/ak1a/agent/ak1/verktyg/*.mjs | head -8`));

log('\n=== prod-hälsa ===');
log('https /: ' + kort(`curl -s -o /dev/null -w '%{http_code}' --max-time 20 https://lab.ak1nvestor.com/`));
log('https /kurser: ' + kort(`curl -s -o /dev/null -w '%{http_code}' --max-time 20 https://lab.ak1nvestor.com/kurser`));
log('localhost:3000: ' + kort(`curl -s -o /dev/null -w '%{http_code}' --max-time 10 http://localhost:3000/`));

const ut = L.join('\n');
fs.writeFileSync('/tmp/r326-diag.txt', ut);
console.log(ut);
