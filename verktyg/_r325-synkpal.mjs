// r325: lever bygget/synken? processbild + .next-ny + crontab
import { execSync } from 'node:child_process';
import fs from 'node:fs';

function kort(cmd, timeoutMs = 60_000) {
  try {
    return { kod: 0, ut: execSync(cmd, { encoding: 'utf8', timeout: timeoutMs, stdio: ['ignore', 'pipe', 'pipe'] }).trim() };
  } catch (e) {
    return { kod: e.status ?? 1, ut: ((e.stdout || '') + (e.stderr || '')).trim() };
  }
}

const AK1 = '/home/ak1a/AK1';

const ps = kort(`ps aux | grep -E 'next build|prod-synk|node .*build' | grep -v grep | head -8`).ut || '(inga bygg-/synkprocesser)';
const pm2Alla = kort(`pm2 jlist`, 30_000).ut;
const pm2Namn = [...pm2Alla.matchAll(/"name":"([^"]+)"/g)].map(m => m[1]).join(', ');
const nextNy = fs.existsSync(`${AK1}/.next-ny`)
  ? kort(`ls -la --time-style=full-iso ${AK1}/.next-ny/ 2>/dev/null | head -6; stat -c '%y' ${AK1}/.next-ny/BUILD_ID 2>/dev/null || echo '(inget BUILD_ID i .next-ny)'`).ut
  : '(.next-ny finns EJ)';
const deployLock = kort(`ls -la /tmp/ak1a-deploy.lock 2>/dev/null; fuser -v /tmp/ak1a-deploy.lock 2>&1 | head -3`).ut;
const cronFull = kort(`crontab -l 2>&1 | head -20`).ut;
const buildLogTail = kort(`ls -t ${AK1}/data/vakten/*.log 2>/dev/null | head -5`).ut;

console.log('=== Bygg-/synkprocesser ===');
console.log(ps);
console.log('\n=== pm2-processer ===');
console.log(pm2Namn || '(pm2 jlist tomt?)');
console.log('\n=== .next-ny ===');
console.log(nextNy);
console.log('\n=== deploy-lås ===');
console.log(deployLock || '(inget lås)');
console.log('\n=== crontab (hela) ===');
console.log(cronFull);
console.log('\n=== senaste loggar i data/vakten ===');
console.log(buildLogTail);
