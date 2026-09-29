// r328 sond 3 (v205-kärna): bevisa vilka jobb som verkligen uteblev + vaktblindhet + serveridentitet
import { execSync } from 'node:child_process';
import fs from 'node:fs';

const sh = (cmd, timeout = 60000) => {
  try { return execSync(cmd, { cwd: '/bin', shell: '/bin/bash', encoding: 'utf8', timeout }).trim(); }
  catch (e) { return 'FEL: ' + (e.stdout || e.message).toString().slice(0, 300); }
};
const AK1 = '/home/ak1a/AK1';

console.log('=== SERVERIDENTITET ===');
console.log(sh('hostname; date; hostname -I 2>/dev/null | cut -d" " -f1-3'));

console.log('\n=== KEDJA 1: SUPABASE-DUMPAR (väntas 1 per dag, senaste 29/9) ===');
console.log(sh(`ls -lt ${AK1}/data/backups/supabase/ 2>/dev/null | head -6`));
console.log('loggsvans: ' + sh('tail -4 /tmp/supabase-backup.log 2>/dev/null'));

console.log('\n=== KEDJA 2: MOLN-EXPORT 02:40 ===');
console.log(sh('tail -4 /tmp/moln-backup.log 2>/dev/null'));
console.log(sh(`find ${AK1}/data/backups -name '*system-events*' -mmin -900 2>/dev/null | head -3`));

console.log('\n=== KEDJA 2b: APP-DB-DUMP 02:50 ===');
console.log(sh('tail -4 /tmp/supabase-appdump.log 2>/dev/null'));

console.log('\n=== NATT-TBT 03:27 ===');
console.log(sh(`tail -4 ${AK1}/data/forskning/OPTIMERING/lighthouse/o151-natt-cron.log 2>/dev/null || echo 'LOGG SAKNAS'`));

console.log('\n=== DÖDA LÄNKAR 04:17 ===');
console.log(sh(`tail -3 ${AK1}/data/vakten/doda-lankar-externa-cron.log 2>/dev/null || echo 'LOGG SAKNAS'`));

console.log('\n=== BERKENDEVAKT 05:37 ===');
console.log(sh(`ls -lt ${AK1}/data/vakten/beroende-vakt-*.json 2>/dev/null | head -3`));

console.log('\n=== BACKUP-OFFSITE via daemon 04:52 ===');
console.log(sh(`grep -i 'backup-offsite' /home/ak1a/.pm2/logs/ak1a-pumpor-out.log 2>/dev/null | tail -4`));

console.log('\n=== MANUELL KONFIGVAKT (blir den RÖD?) ===');
console.log(sh(`cd ${AK1} && node verktyg/konfigintegritet-vakt.mjs 2>&1 | tail -20`));

console.log('\n=== CRONTAB-SPOOL MTIME (när ändrades den?) ===');
console.log(sh('ls -la /var/spool/cron/crontabs/ 2>/dev/null || echo spool ej läsbar'));

console.log('\n=== AUTOMATION-MOTORNS SENASTE BESLUT (crontab-synk?) ===');
console.log(sh(`grep -iE 'crontab|beslut' /home/ak1a/.pm2/logs/ak1a-pumpor-out.log 2>/dev/null | tail -8`));
