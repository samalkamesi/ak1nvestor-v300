// r333 pushpollare: väntar ut AK1:s rent-yta-fönster och pushar develop (setsid, tak 45 min)
import { execSync } from 'node:child_process';
import fs from 'node:fs';

const YTA = '/home/ak1a/agent/ak1';
const LOGG = `${YTA}/data/vakten/r333-slutpush.log`;
const sh = (cmd, timeout = 120000) => {
  try { return { ok: true, ut: execSync(cmd, { cwd: YTA, shell: '/bin/bash', encoding: 'utf8', timeout, stdio: ['ignore', 'pipe', 'pipe'] }).toString().trim() }; }
  catch (e) { return { ok: false, ut: ((e.stdout || '') + '\n' + (e.stderr || e.message)).trim().split('\n').filter(l => !l.startsWith('hint:')).join(' | ').slice(0, 250) }; }
};
const logga = (rad) => {
  fs.appendFileSync(LOGG, `${new Date().toISOString().slice(11, 19)}Z ${rad}\n`);
  console.log(rad);
};
const sleep = (ms) => new Promise(r => setTimeout(r, ms));

logga(`START — väntar rent AK1-fönster (tak 45 min, poll 45 s)`);
const tak = Date.now() + 45 * 60 * 1000;

while (Date.now() < tak) {
  const status = sh('git -C /home/ak1a/AK1 status --porcelain');
  if (!status.ok) { logga('AK1-status fel: ' + status.ut.slice(0, 120)); await sleep(45000); continue; }
  const rader = status.ut ? status.ut.split('\n') : [];

  if (rader.length === 0) {
    logga(`AK1-yta REN (${rader.length} rader) — fetch+merge+push`);
    const f = sh('git fetch prod 2>&1');
    if (!f.ok) { logga('fetch-fel: ' + f.ut); await sleep(45000); continue; }
    const div = sh('git log --oneline develop..prod/develop');
    if (div.ok && div.ut) {
      const m = sh('git merge prod/develop --no-edit 2>&1');
      logga('merge: ' + (m.ok ? 'OK' : 'FEL ' + m.ut));
      if (!m.ok) process.exit(1);
    }
    const p = sh('git push prod develop 2>&1');
    if (p.ok) {
      const v = sh('git ls-remote prod develop');
      const h = sh('git rev-parse develop');
      logga('PUSH GRÖN — remote ' + (v.ut || '').slice(0, 10) + ' = lokal ' + (h.ut || '').slice(0, 10) + ' — LEVERERAT');
      process.exit(0);
    }
    logga('push fortfarande blockerad: ' + p.ut.slice(0, 160));
  } else {
    // räkna bara rader som blockerar updateInstead: modifierade tracked (M) — untracked (?) blockerar ej alltid, men visa
    logga(`AK1-yta upptagen (${rader.length} rader): ${rader.slice(0, 3).join(' | ').slice(0, 140)}`);
  }
  await sleep(45000);
}
logga('TAK UPPNÅTT — fönstret öppnades ej på 45 min; nästa session/hjärtslag försöker igen');
process.exit(1);
