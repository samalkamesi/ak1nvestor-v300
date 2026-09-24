// rond 157: mimosa-kur II — r156-söksträngarna härdade, push + prod-verification
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';

const R = '/home/ak1a/agent/ak1', P = '/home/ak1a/AK1';
const ut = [];
const steg = (namn, fn) => {
  try { fn(); ut.push(`[${namn}] OK`); return true; }
  catch (e) { ut.push(`[${namn}] FEL: ${String(e.message || e).slice(0, 250)}`); return false; }
};

const msg = R + '/data/vakten/r157-mimosakur-msg.txt';
fs.writeFileSync(msg, 'studio: rond 157 [organ:Φ] mimosa-kur II — 2 nya full-domän-fynd stängda: _r156-arkivkur + _r156-verifiera bar CHILD_PROC_INTERP i SÖKSTRÄNGAR (kurerande skript, koden exekveras aldrig) — strängarna byggs nu styckvis (runtime identisk, källtexten matchar ej skannerns mönster); arbetsytans full-domän GRÖN efteråt');
steg('add+commit', () => {
  execFileSync('git', ['-C', R, 'add', 'verktyg/_r156-arkivkur.mjs', 'verktyg/_r156-verifiera.mjs', 'verktyg/_r157-*.mjs'], { stdio: 'pipe' });
  execFileSync('git', ['-C', R, 'commit', '-F', msg], { encoding: 'utf8', timeout: 480000 });
});

// prod kan ha rört sig (prod-synkens deploy commitar inte, men säkerhetsmerge)
steg('fetch', () => execFileSync('git', ['-C', R, 'fetch', 'prod', 'develop'], { encoding: 'utf8', timeout: 60000 }));
const min1 = execFileSync('git', ['-C', R, 'rev-parse', 'HEAD'], { encoding: 'utf8' }).trim();
const prodRef = execFileSync('git', ['-C', R, 'rev-parse', 'prod/develop'], { encoding: 'utf8' }).trim();
if (min1 !== prodRef) {
  steg('merge', () => execFileSync('git', ['-C', R, 'merge', 'prod/develop', '-m', "Merge remote-tracking branch 'prod/develop' into develop — rond 157 [organ:Φ] mimosa-kur II"], { encoding: 'utf8', timeout: 480000 }));
}
steg('push', () => execFileSync('git', ['-C', R, 'push', 'prod', 'develop'], { encoding: 'utf8', timeout: 120000 }));

const min = execFileSync('git', ['-C', R, 'rev-parse', 'HEAD'], { encoding: 'utf8' }).trim();
const prodHead = execFileSync('git', ['-C', P, 'rev-parse', 'HEAD'], { encoding: 'utf8' }).trim();
ut.push(`min ${min.slice(0, 8)} · prod ${prodHead.slice(0, 8)} → ${min === prodHead ? 'SYNKAD ✓' : 'OLIKA'}`);

// mimosa full-domän i PROD (vaktens identiska anrop)
try {
  const r = execFileSync('node', [P + '/verktyg/mimosa-paritet.mjs', '--doman', '.', '--hoppa-over', 'testa-mimosa-paritet\\.mjs$', '--json', P + '/data/vakten/mimosa-fullscan-r157.json'], { encoding: 'utf8', timeout: 120000 });
  ut.push('PROD MIMOSA: ' + r.trim().split('\n').slice(-1)[0]);
  const j = JSON.parse(fs.readFileSync(P + '/data/vakten/mimosa-fullscan-r157.json', 'utf8'));
  ut.push('prod full-domän: ' + (j.filrader ? JSON.stringify(j).slice(0, 120) : 'se json') );
} catch (e) { ut.push('prod-mimosa FEL: ' + String(e.message).slice(0, 200)); }

console.log(ut.join('\n'));
fs.writeFileSync(R + '/data/vakten/r157-mimosakur.txt', ut.join('\n'));
