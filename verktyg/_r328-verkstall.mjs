// r328 VERKSTÄLL: återinstallera crontab (norm + desk-rader) + RPO-täppning
import { execSync, spawn } from 'node:child_process';
import fs from 'node:fs';

const sh = (cmd, timeout = 30000) => {
  try { return execSync(cmd, { cwd: '/bin', shell: '/bin/bash', encoding: 'utf8', timeout }).trim(); }
  catch (e) { return 'FEL: ' + (e.stdout || e.message).toString().slice(0, 250); }
};
const AK1 = '/home/ak1a/AK1';

// ── Steg 0: hitta den lösenordslösa DATABASE_URL ur egen konfigsnapshot ──
console.log('=== SÖK CRONTAB-SNAPSHOT (arkivera-serverns konfigfärskningar) ===');
console.log(sh(`grep -n 'crontab' ${AK1}/verktyg/arkivera-server.mjs | head -6`));
console.log(sh(`find ${AK1}/data/backups/offsite -iname '*crontab*' 2>/dev/null | head -5`));
console.log(sh(`find /tmp -maxdepth 1 -iname '*crontab*' -mtime -9 2>/dev/null | head -5`));

let kedja1Rad = null;
// Snapshot-kandidater: senaste först
const kandidater = [
  ...sh(`find ${AK1}/data/backups/offsite -iname '*crontab*' 2>/dev/null`).split('\n'),
  ...sh(`find /tmp -maxdepth 1 -iname '*crontab*' 2>/dev/null`).split('\n'),
].filter(s => s && !s.startsWith('FEL'));
for (const k of [...kandidater].reverse()) {
  try {
    const txt = fs.readFileSync(k, 'utf8');
    const m = txt.match(/^30 2 \* \* \*.*pg_dump.*$/m);
    if (m && m[0].includes('pg_dump') && !m[0].includes('<DATABASE_URL>') && !m[0].includes('"')) {
      kedja1Rad = m[0]; console.log(`URL BELAGD i ${k}`); break;
    }
    if (m && !m[0].includes('<DATABASE_URL>')) { kedja1Rad = m[0]; console.log(`rad belagd i ${k}`); break; }
  } catch {}
}
console.log('kedja1-rad belagd: ' + (kedja1Rad ? 'JA' : 'NEJ — appliceras utan kedja 1, raden bokförs som eftersläpare'));

// ── Steg 1: bygg nya crontab (desk 2 + referensens 8 URL-fria + kedja 1 om belagd) ──
const referens = fs.readFileSync(`${AK1}/data/infra/konfig-referens/crontab.reference`, 'utf8');
const refRader = referens.split('\n').filter(l => /^[0-9*]/.test(l) && !l.startsWith('#'));
const refKedja1 = refRader.find(r => r.startsWith('30 2'));
const ovriga = refRader.filter(r => r !== refKedja1);

const desk = sh('crontab -l').split('\n').filter(l => l.trim() && !l.startsWith('#'));
const nyaRader = [...desk, ...ovriga];
if (kedja1Rad) nyaRader.push(kedja1Rad);

console.log(`\n=== APPLICERAR ${nyaRader.length} RADER (desk ${desk.length} + referens ${ovriga.length}${kedja1Rad ? ' + kedja1' : ''}) ===`);
fs.writeFileSync('/tmp/r328-crontab.txt', nyaRader.join('\n') + '\n');
console.log(sh('crontab /tmp/r328-crontab.txt && echo APPLICERAD'));
console.log('efter: ' + sh('crontab -l | wc -l') + ' rader i crontab');

// ── Steg 2: verifiera vakten ──
console.log('\n=== KONFIGVAKT EFTER KUR ===');
console.log(sh(`cd ${AK1} && node verktyg/konfigintegritet-vakt.mjs 2>&1 | tail -4`));

// ── Steg 3: RPO-täppning NU (detacherade barn, loggar till /tmp) ──
const detached = (namn, cmd, args) => {
  const log = fs.openSync(`/tmp/r328-${namn}.log`, 'a');
  const p = spawn(cmd, args, { cwd: AK1, detached: true, stdio: ['ignore', log, log] });
  p.unref();
  console.log(`startad (pid ${p.pid}): ${namn}`);
};
detached('appdump', '/bin/bash', ['verktyg/dumpa-app-db.sh']);
detached('molnexport', '/usr/bin/node', ['verktyg/backup-fran-molnet.mjs']);
console.log('\nKLAR — verkställse del 1');
