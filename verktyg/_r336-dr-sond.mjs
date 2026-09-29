// r336 DR-sond: (1) läs offsiteloggen från nattens första autonoma pass (kur v2)
// (2) färskhetsprov av nattens tre blad (db 02:30 · moln 02:40 · app 02:50)
import { execSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const sh = (cmd, timeout = 30000) => {
  try { return execSync(cmd, { cwd: '/bin', shell: '/bin/bash', encoding: 'utf8', timeout }).trim(); }
  catch (e) { return 'FEL: ' + (e.stdout || e.message).toString().slice(0, 200); }
};
const BK = '/home/ak1a/AK1/data/backups';
console.log('=== BACKUPKATALOGERNA ===');
console.log(sh(`ls -la ${BK}/ 2>/dev/null | head -12`));
console.log(sh(`ls -la ${BK}/supabase 2>/dev/null | tail -8`));

console.log('\n=== DE TRE BLADEN (natten till 09-29 + senare) ===');
const nu = Date.now();
for (const kandidat of [
  `${BK}/supabase`,
  `${BK}`,
]) {
  try {
    const filer = fs.readdirSync(kandidat).filter(f => /2026-09-2[89]/.test(f));
    for (const f of filer) {
      const p = path.join(kandidat, f);
      const st = fs.statSync(p);
      const timmar = ((nu - st.mtime.getTime()) / 3600000).toFixed(1);
      console.log(`${p.replace(BK + '/', '')}: ${(st.size / 1048576).toFixed(1)} MB · ${st.mtime.toISOString()} · ${timmar} h gammal`);
    }
  } catch { /* nästa katalog */ }
}

console.log('\n=== OFFSITE-LOGGEN (kur v2:s första autonoma pass 02:52) ===');
// loggväg ur backup-offsite.mjs-källan
const kalla = ['/home/ak1a/AK1/verktyg/backup-offsite.mjs', '/home/ak1a/agent/ak1/verktyg/backup-offsite.mjs'];
for (const k of kalla) {
  if (!fs.existsSync(k)) continue;
  console.log('källa: ' + k);
  console.log(sh(`grep -nE 'appendFile|createWriteStream|\\.log' ${k} | head -6`));
}
// troliga loggplatser
for (const lg of [
  '/home/ak1a/AK1/data/vakten/backup-offsite.log',
  '/home/ak1a/AK1/data/vakten/offsite.log',
  '/home/ak1a/agent/ak1/data/vakten/backup-offsite.log',
]) {
  if (fs.existsSync(lg)) {
    console.log(`\n--- ${lg} (svans) ---`);
    console.log(fs.readFileSync(lg, 'utf8').trim().split('\n').slice(-14).join('\n'));
  }
}
console.log(sh(`find /home/ak1a/AK1/data -name '*offsite*' -newermt '2026-09-28' 2>/dev/null | head -6`));
