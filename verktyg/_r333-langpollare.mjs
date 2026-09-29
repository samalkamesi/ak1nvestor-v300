// r333 långpollare: som pushpollare men tak 5 h, poll 90 s — eftervaktens tak är 6 h
import { execSync } from 'node:child_process';
import fs from 'node:fs';

const YTA = '/home/ak1a/agent/ak1';
const LOGG = `${YTA}/data/vakten/r333-slutpush.log`;
const sh = (cmd, timeout = 120000) => {
  try { return { ok: true, ut: execSync(cmd, { cwd: YTA, shell: '/bin/bash', encoding: 'utf8', timeout, stdio: ['ignore', 'pipe', 'pipe'] }).toString().trim() }; }
  catch (e) { return { ok: false, ut: ((e.stdout || '') + '\n' + (e.stderr || e.message)).trim().split('\n').filter(l => !l.startsWith('hint:')).join(' | ').slice(0, 250) }; }
};
const logga = (rad) => { fs.appendFileSync(LOGG, `${new Date().toISOString().slice(11, 19)}Z ${rad}\n`); };
const sleep = (ms) => new Promise(r => setTimeout(r, ms));

logga(`LÅNGPOLLARE start — tak 5 h, poll 90 s`);
const tak = Date.now() + 5 * 60 * 60 * 1000;

while (Date.now() < tak) {
  const status = sh('git -C /home/ak1a/AK1 status --porcelain');
  if (!status.ok) { await sleep(90000); continue; }
  // updateInstead blockerar endast unstagade TRACKED-ändringar (M/A/D); untracked (?) är ok
  const blockerare = status.ut ? status.ut.split('\n').filter(l => !l.startsWith('??')) : [];
  if (blockerare.length === 0) {
    logga(`AK1-yta ren nog (0 tracked-delta) — fetch+merge+push`);
    const f = sh('git fetch prod 2>&1');
    if (!f.ok) { await sleep(90000); continue; }
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
      logga('PUSH GRÖN — remote ' + (v.ut || '').slice(0, 10) + ' lokal ' + (h.ut || '').slice(0, 10) + ' — LEVERERAT');
      process.exit(0);
    }
    logga('push blockerad: ' + p.ut.slice(0, 150));
  }
  await sleep(90000);
}
logga('LÅNGPOLLARE tak 5 h uppnått — omlott till nästa session');
process.exit(1);
