// r330 sond 1: 07:17Z-gränssnittsvaktsbevis + dubbelkanalens skript (flock-status)
import { execSync } from 'node:child_process';
import fs from 'node:fs';

const sh = (cmd, timeout = 30000) => {
  try { return execSync(cmd, { cwd: '/bin', shell: '/bin/bash', encoding: 'utf8', timeout }).trim(); }
  catch (e) { return 'FEL: ' + (e.stdout || e.message).toString().slice(0, 250); }
};
const AK1 = '/home/ak1a/AK1';

console.log('=== KLOCKA ===');
console.log(sh("date -u '+%H:%M:%SZ'"));

console.log('\n=== GRÄNSSNITTSRAPPORTER (senaste 2) ===');
console.log(sh(`ls -lt ${AK1}/data/vakten/granssnitt-*.json | head -2`));
const senaste = sh(`ls -t ${AK1}/data/vakten/granssnitt-*.json | head -1`);
if (!senaste.startsWith('FEL')) {
  const j = JSON.parse(fs.readFileSync(senaste, 'utf8'));
  console.log(`${senaste.split('/').pop()}`);
  console.log('status: ' + j.status);
  console.log('fynd: ' + JSON.stringify(j.fynd ?? j.antalFynd ?? 'fält?') .slice(0, 200));
  console.log('kombinationer: ' + JSON.stringify(j.kombinationer ?? '?').slice(0, 150));
}

console.log('\n=== PUMPOR-LOGGEN RUNT 07:17 (gränssnittsvakt + konfig) ===');
console.log(sh("grep -E '^07:1[5-9]|gränssnittsvakt|granssnitt' /home/ak1a/.pm2/logs/ak1a-pumpor-out.log | tail -8"));

console.log('\n=== VAKT-CRON.MJS — huvud + ev. lås (pumpor-kanalen) ===');
const vc = fs.readFileSync(`${AK1}/verktyg/vakt-cron.mjs`, 'utf8');
console.log(`(fil ${vc.length} tecken)`);
console.log(vc.slice(0, 1800));

console.log('\n=== GRÄNSSNITTSVAKT-CRON.SH — kör delen (flock?) ===');
const shInn = fs.readFileSync(`${AK1}/data/infra/contabo/granssnittsvakt-cron.sh`, 'utf8');
const exec = shInn.indexOf('node');
console.log(shInn.slice(Math.max(0, exec - 600), exec + 500));
