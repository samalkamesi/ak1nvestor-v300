// rond 157: lös merge-konflikt (motorervalidering = prod auktoritativ) + avsluta merge + push
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';

const R = '/home/ak1a/agent/ak1';
const FIL = 'data/rapporter/motorervalidering-2026-09-02.md';
const ut = [];
const steg = (namn, fn) => {
  try { fn(); ut.push(`[${namn}] OK`); return true; }
  catch (e) { ut.push(`[${namn}] FEL: ${String(e.message || e).slice(0, 300)}`); return false; }
};

// 1. prod:s version av konfliktfilen (väktarens dagliga 07:02-skrivning = auktoritär)
steg('checkout-theirs', () => execFileSync('git', ['-C', R, 'checkout', '--theirs', FIL], { stdio: 'pipe' }));
steg('add', () => execFileSync('git', ['-C', R, 'add', FIL], { stdio: 'pipe' }));

// 2. avsluta merge-commit (kort meddelande via -F; hooken kör tsc — o156 kvitterade tsc 0)
const msg = R + '/data/vakten/r157-mergemsg.txt';
fs.writeFileSync(msg, "Merge remote-tracking branch 'prod/develop' into develop — rond 157 [organ:Φ]: fabrikens o156/o157-leveranser mottagna; konflikt i motorervalidering-2026-09-02.md löst med prod:s version (väktarens auktoritativa dagliga skrivning); rondens mimosa-härdning (555625ac) följer med ut");
const fore = execFileSync('git', ['-C', R, 'rev-parse', 'HEAD'], { encoding: 'utf8' }).trim();
steg('merge-commit', () => execFileSync('git', ['-C', R, 'commit', '-F', msg], { encoding: 'utf8', timeout: 480000 }));
const efter = execFileSync('git', ['-C', R, 'rev-parse', 'HEAD'], { encoding: 'utf8' }).trim();
ut.push(`HEAD: ${fore.slice(0, 8)} → ${efter.slice(0, 8)} (${fore === efter ? 'OFÖRÄNDRAD' : 'merge-commit landad'})`);

// 3. push
if (fore !== efter) {
  steg('push', () => execFileSync('git', ['-C', R, 'push', 'prod', 'develop'], { encoding: 'utf8', timeout: 120000 }));
  const prodHead = execFileSync('git', ['-C', '/home/ak1a/AK1', 'rev-parse', 'HEAD'], { encoding: 'utf8' }).trim();
  ut.push(`prod HEAD: ${prodHead.slice(0, 8)} (${prodHead === efter ? 'SYNKAD ✓' : 'väntar prod-synkpoll'})`);
  // 4. mimosa-fyndfilerna i prod — härdningen ska nu nått fram
  for (const f of ['_r147-dod', '_r147-omstart', '_r153-dod-sond', '_s1u2-wihlborgs-q3-kontroll', '_s7u2o139efter-kor']) {
    const kod = fs.readFileSync(`/home/ak1a/AK1/verktyg/${f}.mjs`, 'utf8');
    const interp = (kod.match(/execSync\(`[^`]*\$\{/g) || []).length;
    ut.push(`prod ${f}.mjs: interpolerad execSync = ${interp}`);
  }
  ut.push('träd rent: ' + (execFileSync('git', ['-C', R, 'status', '--porcelain'], { encoding: 'utf8' }).trim() === '' ? 'JA ✓' : 'NEJ'));
}

const rapport = ut.join('\n');
fs.writeFileSync(R + '/data/vakten/r157-konfliktlos.txt', rapport);
console.log(rapport);
