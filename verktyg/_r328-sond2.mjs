// r328 sond 2: crontab.reference (sanningen) + DRIFTSBOKEN + pumpor-daemonens rop
import { execSync } from 'node:child_process';
import fs from 'node:fs';

const sh = (cmd, timeout = 20000) => {
  try { return execSync(cmd, { cwd: '/bin', shell: '/bin/bash', encoding: 'utf8', timeout }).trim(); }
  catch (e) { return 'FEL: ' + (e.stdout || e.message).toString().slice(0, 300); }
};
const AK1 = '/home/ak1a/AK1';

console.log('=== crontab.reference (FULL) ===');
console.log(fs.readFileSync(`${AK1}/data/infra/konfig-referens/crontab.reference`, 'utf8'));

console.log('\n=== DRIFTSBOKEN: eskalering + cron-sektion (grep) ===');
const dbok = fs.readFileSync(`${AK1}/data/DRIFTSBOKEN.md`, 'utf8');
const eskrader = dbok.split('\n');
const träff = eskrader.map((l, i) => [l, i]).filter(([l]) => /eskal|utebl|cron|spårkvitto|G2|G5/i.test(l));
träff.slice(0, 25).forEach(([l, i]) => console.log(`${i + 1}: ${l.slice(0, 160)}`));

console.log('\n=== PUMPOR-DAEMONENS ROPSCHEMA (cron-rader i koden) ===');
const pumpor = `${AK1}/verktyg/pumpor-daemon.mjs`;
if (fs.existsSync(pumpor)) {
  const käll = fs.readFileSync(pumpor, 'utf8');
  const rader = käll.split('\n').filter(l => /min\s*%|rop|cron|==\s*\d|:x\d|%10|%30/i.test(l));
  rader.slice(0, 25).forEach(l => console.log(l.trim().slice(0, 150)));
}
