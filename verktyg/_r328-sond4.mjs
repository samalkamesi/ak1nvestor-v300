// r328 sond 4: exakta datum för TBT/rop-hälsa/dagens vaktutslag — vilka jobb uteblev Egentligen?
import { execSync } from 'node:child_process';
import fs from 'node:fs';

const sh = (cmd, timeout = 20000) => {
  try { return execSync(cmd, { cwd: '/bin', shell: '/bin/bash', encoding: 'utf8', timeout }).trim(); }
  catch (e) { return 'FEL: ' + (e.stdout || e.message).toString().slice(0, 200); }
};
const AK1 = '/home/ak1a/AK1';

console.log('=== NATT-TBT-loggens huvud + mtime ===');
console.log(sh(`stat -c '%y' ${AK1}/data/forskning/OPTIMERING/lighthouse/o151-natt-cron.log`));
console.log(sh(`head -3 ${AK1}/data/forskning/OPTIMERING/lighthouse/o151-natt-cron.log`));

console.log('\n=== ROP-HÄLSA senaste (innehåll + mtime) ===');
console.log(sh(`stat -c '%y' ${AK1}/data/vakten/rop-halsa-senaste.txt`));
console.log(sh(`head -4 ${AK1}/data/vakten/rop-halsa-senaste.txt`));

console.log('\n=== DAGENS KONFIGVAKTSUTSLAG (29/9, ur pumploggen) ===');
console.log(sh(`grep '2026-09-29' /home/ak1a/.pm2/logs/ak1a-pumpor-out.log 2>/dev/null | grep -i 'konfig' | tail -6`));

console.log('\n=== KEDJA-1-DUMPAR: senaste rkaq-dumpens datum (db-YYYY-MM-DD) ===');
console.log(sh(`ls -lt ${AK1}/data/backups/supabase/ | grep -E 'db-[0-9]' | head -3`));

console.log('\n=== MOLN-ARKIV senaste ===');
console.log(sh(`ls -lt ${AK1}/data/backups/moln* 2>/dev/null | head -4; ls -lt ${AK1}/data/backups/system-events* 2>/dev/null | head -3`));
console.log(sh(`find ${AK1}/data/backups -maxdepth 2 -type d | head -8`));

console.log('\n=== CRON-SYSTEMLOGG (vad hände med crontaben?) ===');
console.log(sh(`grep -iE 'crontab|CRON' /var/log/syslog 2>/dev/null | grep -v 'CRON\[' | tail -6 || echo 'syslog ej läsbar'`));
console.log(sh(`grep 'CRON' /var/log/syslog 2>/dev/null | tail -4 || echo 'CRON-rader ej läsbara'`));
