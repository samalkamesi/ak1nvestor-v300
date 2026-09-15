// Steg 2: Pusha ARB develop -> prod (max 3 försök, 60 s mellan)
import { execFileSync } from 'node:child_process';
import { writeFileSync, readFileSync } from 'node:fs';

const logg = [];
function logga(s) { logg.push(s); console.log(s); }

let pushad = false;
let sistaFel = '';
for (let forsok = 1; forsok <= 3 && !pushad; forsok++) {
  try {
    logga(`--- Push-försök ${forsok} ---`);
    const ut = execFileSync('git', ['-C', '/home/ak1a/agent/ak1', 'push', 'prod', 'develop'], {
      encoding: 'utf8',
      timeout: 120000,
    });
    logga('PUSH-UTDATA: ' + ut.trim());
    pushad = true;
  } catch (e) {
    sistaFel = String(e && e.message ? e.message : e);
    logga('PUSH-FEL: ' + sistaFel);
    if (forsok < 3) {
      logga('Väntar 60 s innan nytt försök...');
      Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, 60000);
    }
  }
}

// Bevis: prod-HEAD efter push
let prodHead = '';
try {
  prodHead = execFileSync('git', ['-C', '/home/ak1a/AK1', 'log', '-1', '--format=%h %s'], {
    encoding: 'utf8',
    timeout: 30000,
  }).trim();
} catch (e) { prodHead = 'KUNDE INTE LÄSA: ' + String(e && e.message ? e.message : e); }

let arbHead = '';
try {
  arbHead = execFileSync('git', ['-C', '/home/ak1a/agent/ak1', 'log', '-1', '--format=%h %s'], {
    encoding: 'utf8',
    timeout: 30000,
  }).trim();
} catch (e) { arbHead = 'KUNDE INTE LÄSA: ' + String(e && e.message ? e.message : e); }

const resultat = { pushad, sistaFel, arbHead, prodHead };
writeFileSync('/home/ak1a/agent/ak1/.tmp-deploy-steg2-push.txt', JSON.stringify(resultat, null, 2) + '\n\nLOGG:\n' + logg.join('\n'));
console.log('RESULTAT: ' + JSON.stringify(resultat, null, 2));
