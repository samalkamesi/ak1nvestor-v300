// r329 sond 1 (v212): 07:17Z-gränssnittsvaktsbevis + klocka + crontab-läge + daemon-felhantering
import { execSync } from 'node:child_process';
import fs from 'node:fs';

const sh = (cmd, timeout = 30000) => {
  try { return execSync(cmd, { cwd: '/bin', shell: '/bin/bash', encoding: 'utf8', timeout }).trim(); }
  catch (e) { return 'FEL: ' + (e.stdout || e.message).toString().slice(0, 250); }
};
const AK1 = '/home/ak1a/AK1';

console.log('=== KLOCKA ===');
console.log(sh("date -u '+%Y-%m-%d %H:%M:%SZ'"));

console.log('\n=== GRÄNSSNITTSVAKTSRAPPORTER (senaste 3) ===');
console.log(sh(`ls -lt ${AK1}/data/vakten/granssnitt-*.json 2>/dev/null | head -3`));
const senaste = sh(`ls -t ${AK1}/data/vakten/granssnitt-*.json 2>/dev/null | head -1`);
if (senaste && !senaste.startsWith('FEL')) {
  console.log(`\n--- ${senaste.split('/').pop()} (innehåll kort) ---`);
  try {
    const j = JSON.parse(fs.readFileSync(senaste, 'utf8'));
    console.log('status: ' + (j.status ?? '?') + ' · fynd: ' + (j.fynd?.length ?? j.antalFynd ?? '?') + ' · nycklar: ' + Object.keys(j).slice(0, 8).join(','));
  } catch (e) { console.log('parse: ' + e.message); }
}

console.log('\n=== CRONTAB-LÄGE (rader: ' + sh('crontab -l | grep -c . ') + ') ===');
console.log(sh('crontab -l | head -3'));

console.log('\n=== PUMPOR-DAEMONENS korEnGang: vad händer vid exit != 0? ===');
const daemon = fs.readFileSync(`${AK1}/verktyg/pumpor-daemon.mjs`, 'utf8');
const idx = daemon.indexOf('function korEnGang');
if (idx >= 0) console.log(daemon.slice(idx, idx + 1800));
else {
  const idx2 = daemon.indexOf('korEnGang');
  console.log(daemon.slice(Math.max(0, idx2 - 200), idx2 + 1600));
}
