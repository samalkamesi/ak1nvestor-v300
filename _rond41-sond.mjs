// Rond 41 — orienteringssond (node-kanalen)
import { execSync } from 'node:child_process';
import fs from 'node:fs';
const run = (c, o = {}) => { try { return execSync(c, { encoding: 'utf8', timeout: 20_000, ...o }).trim(); } catch (e) { return 'FEL: ' + (e.stdout || e.message).toString().slice(0, 120); } };

console.log('tid:', new Date().toISOString());
console.log('ARB HEAD:', run('git -C /home/ak1a/agent/ak1 log -1 --format=%h'));
console.log('ARB status:', JSON.stringify(run('git -C /home/ak1a/agent/ak1 status --porcelain').split('\n').filter(Boolean).slice(0, 5)));
console.log('PROD HEAD:', run('git -C /home/ak1a/AK1 log -1 --format=%h'));
console.log('PROD status:', JSON.stringify(run('git -C /home/ak1a/AK1 status --porcelain').split('\n').filter(Boolean).slice(0, 5)));
console.log('RAM fritt MB:', Math.round(Number(run("awk '/MemAvailable/ {print $2}' /proc/meminfo")) / 1024));
console.log('prod localhost:', run("curl -s -o /dev/null -w '%{http_code}' -m 8 http://localhost:3000/"));
console.log('prod https:', run("curl -s -o /dev/null -w '%{http_code}' -m 10 https://lab.ak1nvestor.com/"));

// Fabrikens kö
const koDir = '/home/ak1a/agent/ak1/data/vakten/agentfabrik/ko';
try {
  const filer = fs.readdirSync(koDir).filter((f) => f.endsWith('.json'));
  console.log('fabriksskö:', filer.length ? filer.join(', ') : 'TOM');
} catch { console.log('fabriksskö: (katalog saknas)'); }
// Fabrikens senaste status
const stDir = '/home/ak1a/agent/ak1/data/vakten/agentfabrik/status';
try {
  const senaste = fs.readdirSync(stDir).filter((f) => f.endsWith('.json')).map((f) => ({ f, m: fs.statSync(stDir + '/' + f).mtimeMs })).sort((a, b) => b.m - a.m)[0];
  if (senaste) {
    const j = JSON.parse(fs.readFileSync(stDir + '/' + senaste.f, 'utf8'));
    console.log('fabrik senaste:', senaste.f, 'status=', j.status, 'progress=', JSON.stringify(j.progress || j.klara || '?').slice(0, 200));
  }
} catch { console.log('fabrik status: (inga)'); }
