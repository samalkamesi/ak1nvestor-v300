// r328 sond 1 (v205): hitta crontab-referens + DRIFTSBOK + jobbens utdatavägar
import { execSync } from 'node:child_process';
import fs from 'node:fs';

const sh = (cmd, timeout = 20000) => {
  try { return execSync(cmd, { cwd: '/bin', shell: '/bin/bash', encoding: 'utf8', timeout }).trim(); }
  catch (e) { return 'FEL: ' + (e.stdout || e.message).toString().slice(0, 300); }
};
const AK1 = '/home/ak1a/AK1';

console.log('=== CRONTAB-FILER I AK1 ===');
console.log(sh(`find ${AK1}/data/infra -maxdepth 3 -iname '*crontab*' 2>/dev/null`));
console.log(sh(`find ${AK1} -maxdepth 2 -iname '*crontab*' 2>/dev/null | head -5`));

console.log('\n=== DRIFTSBOKEN ===');
console.log(sh(`find ${AK1} -maxdepth 3 -iname '*driftsbok*' 2>/dev/null | head -5`));

console.log('\n=== AKTUELL CRONTAB (system) ===');
console.log(sh('crontab -l 2>&1 | head -40'));

console.log('\n=== /etc/crontab-raderna ===');
console.log(sh("grep -v '^#' /etc/crontab 2>/dev/null | grep -v '^$' | head -20"));
