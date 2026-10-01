// _v222-langpollare.mjs — långväntare: pusha v222-leveransen när prod-ytan renar.
// Konservativ: endast fast-forward + ren yta; prod-egna commits → merge --no-edit,
// konflikt → git merge --abort och rapport (trädet lämnas ALDRIG konflikterigt).
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';

function ko(kommando, takSek = 30, cwd = '/home/ak1a/agent/ak1') {
  try { return execFileSync('bash', ['-c', kommando], { encoding: 'utf8', timeout: takSek * 1000, cwd }).trim(); }
  catch (e) { return null; }
}
const kort = (h) => (h || '').slice(0, 8);
const LOGG = '/tmp/v222-langpollare.log';
const logga = (s) => { fs.appendFileSync(LOGG, `${new Date().toISOString()} ${s}\n`); console.log(s); };

fs.writeFileSync(LOGG, `start ${new Date().toISOString()}\n`);
const minStart = kort(ko('git rev-parse HEAD'));
logga(`mål: pusha ${minStart} till prod när ytan renar (tak 60 min)`);

for (let i = 0; i < 30; i++) {
  await new Promise(r => setTimeout(r, 120000)); // var 2:a minut
  const statusUt = ko('git status --short | head -3', 15, '/home/ak1a/AK1');
  const ren = statusUt === null || statusUt === '';
  if (!ren) { if (i % 5 === 0) logga(`[${(i + 1) * 2} min] prod-ytan upptagen — väntar`); continue; }

  logga(`[${(i + 1) * 2} min] RENT FÖNSTER — hämtar prod-läge`);
  ko('git fetch prod develop 2>&1', 120);
  const prodRef = kort(ko('git rev-parse prod/develop', 15));
  const min = kort(ko('git rev-parse HEAD', 15));
  const arFar = ko(`git merge-base --is-ancestor ${prodRef} HEAD && echo JA`, 20);

  let resultat;
  if (arFar === 'JA') {
    resultat = ko('git push prod develop 2>&1', 180);
  } else {
    logga(`prod har egen commit (${prodRef}) — mergar`);
    resultat = ko('git merge prod/develop --no-edit 2>&1', 120);
    const konf = ko('git status --short | grep -c "^UU"', 15);
    if (konf && konf !== '0') {
      ko('git merge --abort 2>&1', 30);
      logga('MERGE-KONFLIKT — avbröts rent; kräver huvudsessionen (rapporteras)');
      break;
    }
    resultat = ko('git push prod develop 2>&1', 180);
  }

  const prodEfter = kort(ko('git log --format=%h -1', 15, '/home/ak1a/AK1'));
  logga('push-svar: ' + String(resultat).split('\n').slice(-2).join(' | '));
  if (prodEfter === kort(ko('git rev-parse HEAD', 15))) { logga(`LANDAD — prod=${prodEfter}`); break; }
  logga(`ännu ej framme (prod=${prodEfter}) — fortsätter`);
}
logga('langpollare slut');
