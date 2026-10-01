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
// o574: fuser (psmisc) saknas på SSD Nodes — fd-ägandet läses ur /proc i
// stället (o570:s mönster): en flock-hållare bär alltid en öppen fd mot
// låsfilen. readdir/readlink/stat öppnar ingen fd — sonden ser aldrig sig själv.
function lasHollare(lasFil) {
  let sokvag;
  try { sokvag = fs.realpathSync(lasFil); } catch { return null; }
  const pids = [];
  for (const pid of fs.readdirSync('/proc')) {
    if (!/^\d+$/.test(pid)) continue;
    let fds; try { fds = fs.readdirSync(`/proc/${pid}/fd`); } catch { continue; }
    for (const fd of fds) {
      let mal; try { mal = fs.readlinkSync(`/proc/${pid}/fd/${fd}`); } catch { continue; }
      if (mal === sokvag) { pids.push(pid); break; }
    }
  }
  return pids.length > 0 ? pids.join(',') : null;
}
const lasAgare = lasHollare('/tmp/ak1a-deploy.lock');
const deployLock = kort(`ls -la /tmp/ak1a-deploy.lock 2>/dev/null`).ut
  + (lasAgare ? `\nägare (fd i /proc): PID ${lasAgare}` : '\n(fd-ägare: ingen — /proc-sond o574)');
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
