// r329 test: syntax + GRÖN (exit 0) + RÖD (exit 1 via testreferens, notis av)
import { execSync, spawnSync } from 'node:child_process';
import fs from 'node:fs';

const YTA = '/home/ak1a/agent/ak1';
const sh = (cmd, env = {}, timeout = 60000) => {
  const r = spawnSync('/bin/bash', ['-c', cmd], { cwd: YTA, encoding: 'utf8', timeout, env: { ...process.env, ...env } });
  return { kod: r.status, ut: (r.stdout || '') + (r.stderr || '') };
};

console.log('=== 1. SYNTAX (node --check) ===');
const syn = sh('node --check verktyg/konfigintegritet-vakt.mjs');
console.log(syn.kod === 0 ? 'OK — syntax giltig' : 'FEL: ' + syn.ut.slice(0, 400));

console.log('\n=== 2. GRÖN-VÄGEN (äkta referens, äkta crontab-läsning, journal i /tmp) ===');
fs.rmSync('/tmp/r329-gron', { recursive: true, force: true });
fs.mkdirSync('/tmp/r329-gron', { recursive: true });
const gron = sh('node verktyg/konfigintegritet-vakt.mjs', { AK1A_LARM_DIR: '/tmp/r329-gron' });
console.log(`exitkod: ${gron.kod} (väntat 0)`);
console.log(gron.ut.trim().split('\n').slice(-3).join('\n'));

console.log('\n=== 3. RÖD-VÄGEN (testreferens med extra rad ⇒ SAKNAD, notis av) ===');
fs.rmSync('/tmp/r329-rod', { recursive: true, force: true });
fs.mkdirSync('/tmp/r329-rod', { recursive: true });
// Testreferens = äkta referens + en rad som ALDRIG finns i crontaben
const ref = fs.readFileSync(`${YTA}/data/infra/konfig-referens/crontab.reference`, 'utf8');
fs.writeFileSync('/tmp/r329-testref.reference', ref + '\n59 23 31 2 * /usr/bin/echo R329-TESTRAD-SAKNAS-ALDRIG\n');
const rod = sh('node verktyg/konfigintegritet-vakt.mjs', {
  AK1A_CRONTAB_REF: '/tmp/r329-testref.reference',
  AK1A_LARM_DIR: '/tmp/r329-rod',
  AK1A_KONFIG_NOTIS: 'av',
});
console.log(`exitkod: ${rod.kod} (väntat 1)`);
const saknadRad = rod.ut.includes('SAKNAD crontab-rad');
const blockerad = rod.ut.includes('BLOCKERAD');
console.log(`SAKNAD-rad i utdata: ${saknadRad} · notis BLOCKERAD-rad: ${blockerad}`);
console.log(rod.ut.trim().split('\n').filter(l => /SAKNAD|BLOCKERAD|larm/.test(l)).slice(-4).join('\n'));

console.log('\n=== 4. DOM ===');
const pass = syn.kod === 0 && gron.kod === 0 && rod.kod === 1 && saknadRad && blockerad;
console.log(pass ? 'ALLA TEST GRÖNA — kuren är bevisad på båda vägarna' : 'TESTFEL — se ovan');
process.exit(pass ? 0 : 1);
