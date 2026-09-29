// r330 test: auto-läkning (emulator-crontab) + flock (dubbelkanal) + GRÖN-regression
import { execSync, spawnSync } from 'node:child_process';
import fs from 'node:fs';

const YTA = '/home/ak1a/agent/ak1';
const sh = (cmd, env = {}, timeout = 90000) => {
  const r = spawnSync('/bin/bash', ['-c', cmd], { cwd: YTA, encoding: 'utf8', timeout, env: { ...process.env, ...env } });
  return { kod: r.status, ut: (r.stdout || '') + (r.stderr || '') };
};

// ── Förbered: emulator-crontab + testkataloger ──
fs.rmSync('/tmp/r330', { recursive: true, force: true });
fs.mkdirSync('/tmp/r330/larm', { recursive: true });
// Emulatorn: -l ekar testfilen; <fil>-argument ersätter testfilen
fs.writeFileSync('/tmp/r330/crontab-emul.sh', `#!/bin/bash
FIL=/tmp/r330/crontab-testfil
if [ "$1" = "-l" ]; then cat "$FIL" 2>/dev/null; exit 0; fi
if [ -n "$1" ] && [ -f "$1" ]; then cp "$1" "$FIL"; exit 0; fi
exit 1
`);
fs.chmodSync('/tmp/r330/crontab-emul.sh', 0o755);
// Start-crontab = äkta crontab-rådata + en testkommentar (äkta crontab saknar
// kommentarer sedan r328-återställningen — kommentarsbevarandet måste alltså
// bevisas med en inplanterad sådan)
const rå = sh('crontab -l');
fs.writeFileSync('/tmp/r330/crontab-testfil', rå.ut.trimEnd() + '\n# R330-KOMMENTAR-BEVARAS\n');
const ref = fs.readFileSync(`${YTA}/data/infra/konfig-referens/crontab.reference`, 'utf8');
// Testreferens: äkta + en omaskerad testrad + en maskerad (kan ej beläggas)
fs.writeFileSync('/tmp/r330/testref.reference', ref + '\n59 23 31 2 * /usr/bin/echo R330-TESTRAD-LAKS\n52 2 * * * cd /x && verktyg /usr/bin/tar "<R330_TEST_URL>" >> /tmp/x.log 2>&1\n');

console.log('=== 1. SYNTAX ===');
const syn = sh('node --check verktyg/konfigintegritet-vakt.mjs');
console.log(syn.kod === 0 ? 'OK' : 'FEL: ' + syn.ut.slice(0, 300));

console.log('\n=== 2. AUTO-LÄKNING partiell (omaskerad läks, maskerad lämnas) ⇒ exit 1 ===');
const p1 = sh('node verktyg/konfigintegritet-vakt.mjs', {
  AK1A_CRONTAB_BIN: '/tmp/r330/crontab-emul.sh',
  AK1A_CRONTAB_REF: '/tmp/r330/testref.reference',
  AK1A_LARM_DIR: '/tmp/r330/larm',
  AK1A_KONFIG_NOTIS: 'av',
});
console.log(`exitkod: ${p1.kod} (väntat 1)`);
const lakt = /AUTO-LÄKT 1 crontab-rad/.test(p1.ut);
const blockerad = p1.ut.includes('BLOCKERAD');
console.log(`AUTO-LÄKT-rad: ${lakt} · notis BLOCKERAD: ${blockerad}`);
const testfil = fs.readFileSync('/tmp/r330/crontab-testfil', 'utf8');
const radLakts = testfil.includes('R330-TESTRAD-LAKS');
const maskeradInteLakts = !testfil.includes('R330_TEST_URL');
const kommentarerBevarade = testfil.includes('R330-KOMMENTAR-BEVARAS');
console.log(`TESTRAD inlagd i emulator-crontab: ${radLakts} · maskerad rad EJ inlagd: ${maskeradInteLakts} · kommentarer bevarade: ${kommentarerBevarade}`);
const journal = fs.readFileSync('/tmp/r330/larm/konfig-larm.jsonl', 'utf8');
console.log(`journal har konfig-autolakning-rad: ${journal.includes('konfig-autolakning')}`);

console.log('\n=== 3. FULL LÄKNING ⇒ exit 0 + lakat-notis-väg ===');
// Ny testfil: äkta crontab UTAN testraden; referens = äkta + endast TESTRAD
fs.writeFileSync('/tmp/r330/crontab-testfil', rå.ut.replace(/^.*R330-TESTRAD-LAKS.*\n?$/m, ''));
fs.writeFileSync('/tmp/r330/testref2.reference', ref + '\n59 23 31 2 * /usr/bin/echo R330-TESTRAD-LAKS\n');
const p2 = sh('node verktyg/konfigintegritet-vakt.mjs', {
  AK1A_CRONTAB_BIN: '/tmp/r330/crontab-emul.sh',
  AK1A_CRONTAB_REF: '/tmp/r330/testref2.reference',
  AK1A_LARM_DIR: '/tmp/r330/larm',
  AK1A_KONFIG_NOTIS: 'av',
});
console.log(`exitkod: ${p2.kod} (väntat 0)`);
console.log(`AUTO-LÄKT: ${/AUTO-LÄKT 1/.test(p2.ut)}`);
console.log(`testfilen har raden efter läkning: ${fs.readFileSync('/tmp/r330/crontab-testfil', 'utf8').includes('R330-TESTRAD-LAKS')}`);

console.log('\n=== 4. GRÖN-regression (äkta bin+referens, journal i /tmp) ⇒ exit 0, ingen läkning ===');
fs.mkdirSync('/tmp/r330/gron', { recursive: true });
const g = sh('node verktyg/konfigintegritet-vakt.mjs', { AK1A_LARM_DIR: '/tmp/r330/gron' });
console.log(`exitkod: ${g.kod} (väntat 0) · GRÖN 11/11: ${g.ut.includes('11/11')} · ingen AUTO-LÄKT: ${!g.ut.includes('AUTO-LÄKT')}`);

console.log('\n=== 5. FLOCK (dubbelkanal): låst ⇒ LÅST-rad + exit 0, snabbt ===');
fs.mkdirSync('/tmp/r330/gk', { recursive: true });
// Håll låset 12 s i bakgrunden
spawnSync('/bin/bash', ['-c', 'exec 9>/tmp/ak1a-granssnittsvakt.lock; flock 9; sleep 12 &'], { timeout: 3000 });
const start = Date.now();
const f = sh('GRANSSNITT_KATALOG=/tmp/r330/gk GRANSSNITT_TORRKORNING=ja timeout 8 bash data/infra/contabo/granssnittsvakt-cron.sh', {}, 15000);
const snabb = Date.now() - start < 8000;
const lastRad = (fs.readFileSync('/tmp/r330/gk/cron.log', 'utf8') || '').includes('LÅST');
console.log(`exitkod: ${f.kod} (väntat 0) · gick snabbt: ${snabb} · LÅST-rad i loggen: ${lastRad}`);

console.log('\n=== DOM ===');
const pass = syn.kod === 0 && p1.kod === 1 && lakt && blockerad && radLakts && maskeradInteLakts && kommentarerBevarade &&
  p2.kod === 0 && g.kod === 0 && g.ut.includes('11/11') && f.kod === 0 && snabb && lastRad;
console.log(pass ? 'ALLA TEST GRÖNA — auto-läkning + flock bevisade' : 'TESTFEL — se raderna ovan');
process.exit(pass ? 0 : 1);
