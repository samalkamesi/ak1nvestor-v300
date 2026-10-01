// _v222-lagesond.mjs — avgör byggets öde: prod-hälsa, zcode-rutt, pm2, prod-yta.
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';

function ko(cmd, tak = 20000) {
  try { return execFileSync('bash', ['-c', cmd], { encoding: 'utf8', timeout: tak }).trim(); }
  catch (e) { return '(fel: ' + e.message.split('\n')[0] + ')'; }
}

console.log('== TID ==', new Date().toISOString());

console.log('\n== PROD-SYNKLOGG (sista 8) ==');
try { console.log(fs.readFileSync('/home/ak1a/AK1/data/vakten/prod-synk.log', 'utf8').split('\n').filter(r => r.trim()).slice(-8).join('\n')); } catch (e) { console.log('(saknas)'); }

console.log('\n== DEPLOY-LÅS ==');
console.log(ko("flock -w 2 /tmp/ak1a-deploy.lock true && echo LEDIGT || echo UPPTAGET"));

console.log('\n== PM2 ak1a ==');
console.log(ko("pm2 describe ak1a 2>/dev/null | grep -E 'status|restarts|uptime|script path' | head -6"));

console.log('\n== PROD-YTANS HEAD ==');
console.log(ko("cd /home/ak1a/AK1 && git log --oneline -1 && git status --short | head -5"));

console.log('\n== .next-ålder ==');
console.log(ko("stat -c '%y %n' /home/ak1a/AK1/.next/BUILD_ID 2>/dev/null && cat /home/ak1a/AK1/.next/BUILD_ID 2>/dev/null || echo '(saknas)'"));

async function sond(namn, url) {
  const t0 = Date.now();
  try {
    const sv = await fetch(url, { redirect: 'manual', signal: AbortSignal.timeout(15000) });
    const kropp = sv.status === 200 ? (await sv.text()).length : 0;
    console.log(`${namn}: ${sv.status} (${kropp} byte, ${Date.now() - t0} ms)`);
  } catch (e) { console.log(`${namn}: FEL ${e.message.split('\n')[0]}`); }
}

console.log('\n== HTTPS-SONDER ==');
await sond('prod /              ', 'https://lab.ak1nvestor.com/');
await sond('zcode /api/studio/stream', 'https://lab.ak1nvestor.com/api/studio/stream');
await sond('kurser JSON        ', 'https://lab.ak1nvestor.com/deep-courses.json');
