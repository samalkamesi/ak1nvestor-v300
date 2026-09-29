// r328 verkställ del 2: rotbevis (u5-filerna) + kedja 1 manuellt + referens-ändringsprotokoll
import { execSync, spawn } from 'node:child_process';
import fs from 'node:fs';

const sh = (cmd, timeout = 30000) => {
  try { return execSync(cmd, { cwd: '/bin', shell: '/bin/bash', encoding: 'utf8', timeout }).trim(); }
  catch (e) { return 'FEL: ' + (e.stdout || e.message).toString().slice(0, 250); }
};
const YTA = '/home/ak1a/agent/ak1';

console.log('=== ROTBEVIS: u5-installatörens tre crontab-filer ===');
for (const f of ['backup', 'ny', 'efter']) {
  const p = `/tmp/crontab-ak1a-u5-${f}.txt`;
  if (fs.existsSync(p)) {
    const txt = fs.readFileSync(p, 'utf8');
    const aktiva = txt.split('\n').filter(l => l.trim() && !l.startsWith('#'));
    console.log(`--- ${f} (mtime ${fs.statSync(p).mtime.toISOString()}, ${aktiva.length} aktiva rader) ---`);
    aktiva.slice(0, 12).forEach(l => console.log('  ' + l.slice(0, 110)));
  } else console.log(`${f}: saknas`);
}

console.log('\n=== RPO-JOBBENS FÖRSTA LOGGRADER ===');
for (const j of ['appdump', 'molnexport']) {
  const p = `/tmp/r328-${j}.log`;
  console.log(`--- ${j} ---`);
  console.log(fs.existsSync(p) ? fs.readFileSync(p, 'utf8').slice(-300) : '(tom ännu)');
}

// ── Kedja 1 manuellt (dagens rkaq-dump): exekvera cron-raden ur crontab -l ──
console.log('\n=== KEDJA 1 MANUELL KÖRNING (detacherad) ===');
const crontab = sh('crontab -l');
const rad = crontab.split('\n').find(l => l.startsWith('30 2'));
if (rad) {
  const kommando = rad.replace(/^30 2 \* \* \* /, '');
  fs.writeFileSync('/tmp/r328-kedja1.sh', 'cd /home/ak1a/AK1 && ' + kommando + '\n');
  const log = fs.openSync('/tmp/r328-kedja1.log', 'a');
  const p = spawn('/bin/bash', ['/tmp/r328-kedja1.sh'], { detached: true, stdio: ['ignore', log, log] });
  p.unref();
  console.log(`kedja 1 startad (pid ${p.pid})`);
} else {
  console.log('FEL: kedja 1-rad hittades inte i crontab');
}

// ── Referensens ändringsprotokoll: desk-raderna in i crontab.reference (min yta) ──
console.log('\n=== REFERENS-ÄNDRING (ändringsprotokollet: verkligheten först, filen I SAMMA ändring) ===');
const refSokvag = `${YTA}/data/infra/konfig-referens/crontab.reference`;
const ref = fs.readFileSync(refSokvag, 'utf8');
if (!ref.includes('desk-lakare')) {
  const tillagg = `
# ── Rad 10: desk-läkaren var 30:e minut (v198-u5+r315: halsa var 30:e min; 2 fel
# i foljd => restart zdesk-zcode via vitlistad sudo; journalfors i desk-halsa.log)
# Tillagd i referensen r328 (2026-09-29): raden installerats i crontaben av
# desk-spåret men bokfördes aldrig här (samma blindhetsklass som G1) — och
# crontab-massförlusten r328 (se worklog ROND 328) visade att referensen är
# återställningskällan: ALLA aktiva crontab-rader MÅSTE finnas här.
*/30 * * * * /home/ak1a/desk-lakare >> /home/ak1a/desk-halsa.log 2>&1
#
# ── Rad 11: loginpersistens-backup 03:47 lokal, dagligen (v201-u3 DESK-U7;
# keep 7; fritt fönster efter natt-TBT 03:27, före döda länkar 04:17) ──
47 3 * * * /home/ak1a/desk-login-backup/spara-login.sh >> /home/ak1a/desk-login-backup/cron.log 2>&1
`;
  fs.appendFileSync(refSokvag, tillagg);
  console.log('2 desk-rader APPENDADE till crontab.reference');
} else {
  console.log('desk-rader finns redan i referensen');
}
