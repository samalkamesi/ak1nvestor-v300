// r331 test: crontab-installera.mjs — append/idempotens/backup/referens/torr + prefix-syntax
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';

const YTA = '/home/ak1a/agent/ak1';
const sh = (cmd, env = {}, timeout = 60000) => {
  const r = spawnSync('/bin/bash', ['-c', cmd], { cwd: YTA, encoding: 'utf8', timeout, env: { ...process.env, ...env } });
  return { kod: r.status, ut: (r.stdout || '') + (r.stderr || '') };
};

fs.rmSync('/tmp/r331', { recursive: true, force: true });
fs.mkdirSync('/tmp/r331/tmp', { recursive: true });
// Emulator + start-läge
fs.writeFileSync('/tmp/r331/crontab-emul.sh', `#!/bin/bash
FIL=/tmp/r331/crontab-testfil
if [ "$1" = "-l" ]; then cat "$FIL" 2>/dev/null; exit 0; fi
if [ -n "$1" ] && [ -f "$1" ]; then cp "$1" "$FIL"; exit 0; fi
exit 1
`);
fs.chmodSync('/tmp/r331/crontab-emul.sh', 0o755);
const äkta = sh('crontab -l');
fs.writeFileSync('/tmp/r331/crontab-testfil', äkta.ut.trimEnd() + '\n# R331-BEFINTLIG-KOMMENTAR\n');
const refStart = fs.readFileSync(`${YTA}/data/infra/konfig-referens/crontab.reference`, 'utf8');
fs.writeFileSync('/tmp/r331/testref.reference', refStart);

const ENV = {
  AK1A_CRONTAB_BIN: '/tmp/r331/crontab-emul.sh',
  AK1A_CRONTAB_REF: '/tmp/r331/testref.reference',
  AK1A_INSTALL_TMP: '/tmp/r331/tmp',
};
const RAD = '*/5 1 * * * /usr/bin/echo R331-INSTALLATOR-TEST';

console.log('=== 1. SYNTAX ===');
const s1 = sh('node --check verktyg/crontab-installera.mjs');
const s2 = sh('node --check verktyg/agentfabrik.mjs');
console.log(`installera: ${s1.kod === 0 ? 'OK' : 'FEL ' + s1.ut.slice(0, 200)} · agentfabrik: ${s2.kod === 0 ? 'OK' : 'FEL ' + s2.ut.slice(0, 200)}`);

console.log('\n=== 2. INSTALLATION (append) ===');
const ins = sh(`node verktyg/crontab-installera.mjs --rad '${RAD}' --beskrivning 'r331-testrad hermetisk'`, ENV);
console.log(`exitkod: ${ins.kod} (väntat 0)`);
const testfil = fs.readFileSync('/tmp/r331/crontab-testfil', 'utf8');
const refEfter = fs.readFileSync('/tmp/r331/testref.reference', 'utf8');
const radFinns = testfil.includes(RAD);
const kommentarBevarad = testfil.includes('R331-BEFINTLIG-KOMMENTAR');
const äktaRaderKvar = äkta.ut.split('\n').filter(l => l.trim() && !l.startsWith('#')).every(l => testfil.includes(l.trim()));
const refHarRad = refEfter.includes(RAD) && refEfter.includes('r331-testrad hermetisk');
const backup = fs.readdirSync('/tmp/r331/tmp').filter(f => f.startsWith('crontab-install-backup'));
console.log(`rad i crontab: ${radFinns} · befintlig kommentar bevarad: ${kommentarBevarad} · alla äkta rader kvar: ${äktaRaderKvar}`);
console.log(`referensen +rad med beskrivning: ${refHarRad} · backup skapad: ${backup.length === 1}`);

console.log('\n=== 3. IDEMPOTENS (samma rad igen) ===');
const ins2 = sh(`node verktyg/crontab-installera.mjs --rad '${RAD}' --beskrivning 'ignoreras'`, ENV);
const antal = (fs.readFileSync('/tmp/r331/crontab-testfil', 'utf8').match(/R331-INSTALLATOR-TEST/g) || []).length;
console.log(`exitkod: ${ins2.kod} (väntat 0) · IDEMPOTENT-rad i utdata: ${ins2.ut.includes('IDEMPOTENT')} · raden finns exakt ${antal} gång(er) (väntat 1)`);

console.log('\n=== 4. TORRKÖRNING ===');
const torr = sh(`node verktyg/crontab-installera.mjs --rad '59 23 31 2 * /usr/bin/echo R331-TORR' --torr`, ENV);
const torrInte = !fs.readFileSync('/tmp/r331/crontab-testfil', 'utf8').includes('R331-TORR');
console.log(`exitkod: ${torr.kod} (väntat 0) · TORRKÖRNING-rad: ${torr.ut.includes('TORRKÖRNING')} · inget skrivet: ${torrInte}`);

console.log('\n=== 5. PREFIX-REGELN syns i fabrikens komponerade text ===');
const grep = sh("grep -c 'crontab-installera' verktyg/agentfabrik.mjs");
console.log(`agentfabrik.mjs refererar verktyget: ${parseInt(grep.ut) >= 1 ? 'JA' : 'NEJ'}`);

console.log('\n=== DOM ===');
const pass = s1.kod === 0 && s2.kod === 0 && ins.kod === 0 && radFinns && kommentarBevarad && äktaRaderKvar && refHarRad &&
  backup.length === 1 && ins2.kod === 0 && ins2.ut.includes('IDEMPOTENT') && antal === 1 &&
  torr.kod === 0 && torr.ut.includes('TORRKÖRNING') && torrInte && parseInt(grep.ut) >= 1;
console.log(pass ? 'ALLA TEST GRÖNA — installatörsskyddet bevisat' : 'TESTFEL — se ovan');
process.exit(pass ? 0 : 1);
