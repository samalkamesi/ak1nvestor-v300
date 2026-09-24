// rond 157: slutled — commit worklog + merge prod + push + mimosa-kontroll
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';

const R = '/home/ak1a/agent/ak1', P = '/home/ak1a/AK1';
const ut = [];
const steg = (namn, fn) => {
  try { fn(); ut.push(`[${namn}] OK`); return true; }
  catch (e) { ut.push(`[${namn}] FEL: ${String(e.message || e).slice(0, 250)}`); return false; }
};

// 1. worklog + nya r157-sonder commitas (smutsigt eget träd blockerar merge)
const msg = R + '/data/vakten/r157-slutled-msg.txt';
fs.writeFileSync(msg, 'studio: rond 157 [organ:Φ] slutled — worklog-raden för ronden + r157-slutled/lage3/prodyta/prodstad-sonderna (prod-ytstädningen av avslutat auto-s9-barn bevisad: grind + städ-commit 526b2bdd i prod)');
steg('add+commit', () => {
  execFileSync('git', ['-C', R, 'add', '-A'], { stdio: 'pipe' });
  execFileSync('git', ['-C', R, 'commit', '-F', msg], { encoding: 'utf8', timeout: 480000 });
});
ut.push('min HEAD: ' + execFileSync('git', ['-C', R, 'rev-parse', 'HEAD'], { encoding: 'utf8' }).trim().slice(0, 8));

// 2. merge prod/develop (städ-commiten 526b2bdd) + push
steg('fetch', () => execFileSync('git', ['-C', R, 'fetch', 'prod', 'develop'], { encoding: 'utf8', timeout: 60000 }));
steg('merge', () => execFileSync('git', ['-C', R, 'merge', 'prod/develop', '-m', "Merge remote-tracking branch 'prod/develop' into develop — rond 157 [organ:Φ] slutled (prod-städ 526b2bdd emottagen)"], { encoding: 'utf8', timeout: 480000 }));
steg('push', () => execFileSync('git', ['-C', R, 'push', 'prod', 'develop'], { encoding: 'utf8', timeout: 120000 }));

// 3. verifiering
const min = execFileSync('git', ['-C', R, 'rev-parse', 'HEAD'], { encoding: 'utf8' }).trim();
const prodHead = execFileSync('git', ['-C', P, 'rev-parse', 'HEAD'], { encoding: 'utf8' }).trim();
ut.push(`min ${min.slice(0, 8)} · prod ${prodHead.slice(0, 8)} → ${min === prodHead ? 'SYNKAD ✓' : 'OLIKA (prod-synkpoll väntas)'}`);
for (const f of ['_r147-dod', '_r147-omstart', '_r153-dod-sond', '_s1u2-wihlborgs-q3-kontroll', '_s7u2o139efter-kor']) {
  const kod = fs.readFileSync(`${P}/verktyg/${f}.mjs`, 'utf8');
  ut.push(`prod ${f}.mjs: interpolerad execSync = ${(kod.match(/execSync\(`[^`]*\$\{/g) || []).length}`);
}
const ren = execFileSync('git', ['-C', P, 'status', '--porcelain'], { encoding: 'utf8' }).trim() === '';
ut.push('prod-yta: ' + (ren ? 'REN ✓' : 'smutsig (vänta — ev. ny pumpa igång)'));

console.log(ut.join('\n'));
fs.writeFileSync(R + '/data/vakten/r157-slutled.txt', ut.join('\n'));
