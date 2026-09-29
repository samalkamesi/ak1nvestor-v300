// r329 sond 2: kör-funktionen (daemon), automation-motor beslut 6, konfigvakten (exit/logik), vakt-cron flock
import { execSync } from 'node:child_process';
import fs from 'node:fs';

const sh = (cmd, timeout = 30000) => {
  try { return execSync(cmd, { cwd: '/bin', shell: '/bin/bash', encoding: 'utf8', timeout }).trim(); }
  catch (e) { return 'FEL: ' + (e.stdout || e.message).toString().slice(0, 250); }
};
const AK1 = '/home/ak1a/AK1';
const las = (p, från, till) => {
  const t = fs.readFileSync(p, 'utf8');
  const i = t.indexOf(från);
  return i < 0 ? '(sträng ej hittad)' : t.slice(i, i + till);
};

console.log('=== PUMPOR: funktion kör(...) — felhantering ===');
console.log(las(`${AK1}/verktyg/pumpor-daemon.mjs`, 'function kör', 1200));

console.log('\n=== AUTOMATION-MOTOR: beslut 6 (crontab) ===');
const am = `${AK1}/verktyg/automation-motor.mjs`;
console.log(las(am, 'crontab', 2600));

console.log('\n=== KONFIGVAKT: exit + SAKNADE-logik (svans) ===');
const kv = `${AK1}/verktyg/konfigintegritet-vakt.mjs`;
const kvt = fs.readFileSync(kv, 'utf8');
console.log(`(fil ${kvt.length} tecken)`);
const exitIdx = kvt.lastIndexOf('process.exit');
console.log('--- sista exit-blocket ---');
console.log(kvt.slice(Math.max(0, exitIdx - 900), exitIdx + 200));

console.log('\n=== GRÄNSSNITTSVAKT-CRON.SH (flock?) ===');
console.log(sh(`head -20 ${AK1}/data/infra/contabo/granssnittsvakt-cron.sh 2>/dev/null`));

console.log('\n=== konfig-larm.jsonl: finns innehåll? ===');
console.log(sh(`tail -3 ${AK1}/data/vakten/konfig-larm.jsonl 2>/dev/null || echo 'fil saknas'`));
