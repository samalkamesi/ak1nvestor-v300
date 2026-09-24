// _r167-pushpoll3.mjs — push-poll + v164-släpp (rond 167 [Φ])
// SEKVENS: vänta REN prod-yta → emottag (merge) → push → färsk kvalitetsvakt i prod → släpp v164-manifest till fabrikskön.
// SEKVENSREGEL: push FÖRE v164-släpp — annars svälter pushen bakom 8 omgångars smutsig yta.
// Logg: /tmp/r167-pushpoll-status.txt (append per steg)
import { execSync } from 'node:child_process';
import fs from 'node:fs';

const WS = '/home/ak1a/agent/ak1';
const PROD = '/home/ak1a/AK1';
const LOGG = '/tmp/r167-pushpoll-status.txt';
const KO = PROD + '/data/vakten/agentfabrik/ko/v164-fas3-djup.json';
const MANIFEST = PROD + '/data/forskning/KURS-FAS3/manifest-v164-fas3-djup.json';
const MAX_MIN = 60;

const logg = (rad) => fs.appendFileSync(LOGG, `${new Date().toISOString()} ${rad}\n`);
const run = (cmd, cwd, okKod = 0) => {
  try { const ut = execSync(cmd, { cwd, encoding: 'utf8', timeout: 120000, stdio: ['ignore', 'pipe', 'pipe'] }); return { ok: true, ut }; }
  catch (e) { return { ok: false, ut: (e.stdout || '') + (e.stderr || '') }; }
};
const yta = (cwd) => { const r = run('git status --porcelain', cwd); if (!r.ok) return 'OGILTIG'; return r.ut.trim().split('\n').filter(l => l && !l.startsWith('??')).join('\n'); };

logg(`START pushpoll3 — max ${MAX_MIN} min`);
for (let min = 0; min <= MAX_MIN; min++) {
  if (min > 0) await new Promise(r => setTimeout(r, 60000));

  const wsYta = yta(WS);
  if (wsYta !== '') { logg(`AVBRYTER: arbetsytan smutsig (${wsYta.split('\n').length} rader) — huvudagenten committar först`); process.exit(3); }

  const prodYta = yta(PROD);
  if (prodYta !== '') { logg(`vantar yta: prod ${prodYta.split('\n').length} rader smutsig (min ${min})`); continue; }

  // 1) emotta
  run('git fetch prod develop', WS);
  const merge = run('git merge prod/develop -m "merge: iteration emottag prod — s7-prestanda + mimosakurer (rond 167)"', WS);
  if (!merge.ok) {
    run('git merge --abort', WS);
    logg(`MERGE-KONFLIKT — avbruten, huvudagenten löser manuellt: ${merge.ut.slice(-300)}`);
    process.exit(2);
  }
  logg(`EMOTTAGEN: ${merge.ut.trim().split('\n').slice(-1)[0].slice(0, 120)}`);

  // 2) pusha
  const push = run('git push prod develop', WS);
  if (!push.ok) { logg(`push avvisad (min ${min}): ${push.ut.slice(-160)} — försök igen nästa varv`); continue; }

  const wsHead = run('git rev-parse --short HEAD', WS).ut.trim();
  const prodHead = run('git rev-parse --short HEAD', PROD).ut.trim();
  if (wsHead !== prodHead) { logg(`push ok men HEAD divergerar ws=${wsHead} prod=${prodHead} — nytt varv`); continue; }
  logg(`PUSH-GRON: ws=prod=${wsHead}`);

  // 3) färsk kvalitetsvakt i prod-trädet
  logg('VAKT-START (färsk körning i prod)');
  const vakt = run('node verktyg/kvalitetsvakt.mjs', PROD);
  const vaktUts = vakt.ut || '';
  const statusRad = (vaktUts.match(/## ANTAL FEL[^\n]*/) || ['?'])[0];
  logg(`VAKT: ${statusRad}`);

  // 4) släpp v164 till fabrikskön (push först — regeln hålls)
  try {
    const m = JSON.parse(fs.readFileSync(MANIFEST, 'utf8'));
    if (!m.uppgifter || m.uppgifter.length < 20) throw new Error('manifest ogiltigt (<20 uppgifter)');
    fs.copyFileSync(MANIFEST, KO);
    const koll = JSON.parse(fs.readFileSync(KO, 'utf8'));
    logg(`SLAPP-V164: ko/v164-fas3-djup.json (${koll.uppgifter.length} uppgifter) — fabriken plockar vid nästa :x5-rop`);
  } catch (e) {
    logg(`V164-SLAPP FEL: ${String(e.message).slice(0, 200)} — manifest: ${MANIFEST}`);
  }

  logg(`KLAR — push=${wsHead} vakt="${statusRad}"`);
  process.exit(0);
}
logg('TIMEOUT efter ' + MAX_MIN + ' min — prod-ytan blev aldrig ren; kör om eller eskalera');
process.exit(1);
