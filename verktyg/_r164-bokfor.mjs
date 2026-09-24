#!/usr/bin/env node
// _r164-bokfor.mjs — rond 162: F6 rot-analys + kur; emottag, worklog-rad, commit, push.
import { execFileSync } from 'node:child_process';
import { appendFileSync } from 'node:fs';

const WS = '/home/ak1a/agent/ak1';
function sh(cmd, args, opts = {}) {
  return execFileSync(cmd, args, { encoding: 'utf8', timeout: 300000, cwd: WS, ...opts }).trim();
}
const RAD = `
## ROND 162 [organ:Φ] — F6-driftlarm RAM 271 MB rotorsakat + sekvens-kur — 2026-09-24 ~12:3x lokal
Bevis (Lag 2): /tmp/r160-build.log slutar "Creating an optimized production build ... Killed" = OOM-mord (INTE ENOTEMPTY — r160:s segmentkur höll); ps-familjeanalys visar bygget 10:52 konkurrerande med fabrikens omgång + sessionfamiljer om samma 8 GB. Rot (Lag 1): byggloop och agentfabrik saknar gemensam minnessekvensering — bygget startar mitt i en omgång och mördas av kärnan. Kur (Lag 6): _r163-dirigent.mjs (fristående bakgrund, logg /tmp/r163-dirigent.txt) sekvenserar autonomt: väntar fabriksbarn klara + RAM>=5000 -> ev. segmentstäd -> flock-bygg + pm2 restart -> verifierar 8 sidor + sitemap /fas2 -> färsk kvalitetsvakt. F6-transienten = fabrikens legitima s6-omgång (AI-Mentorn 3 barn) + sessionens egen familj; fynd för senare städ: 4 idle subagent-cli à 334 MB. Ytan bokförd: sonder _r160-_r164 + data/forskning/beslutsminne.jsonl.
`;
try {
  // 1) Emottag prod först om den gått framåt (s6-barnens commits)
  const head = sh('git', ['rev-parse', 'HEAD']);
  const prodHead = sh('git', ['rev-parse', 'prod/develop']);
  if (head !== prodHead) {
    sh('git', ['merge', 'prod/develop', '--no-edit']);
    console.log('EMOTTAG: merge prod/develop -> ' + sh('git', ['rev-parse', '--short', 'HEAD']));
  } else console.log('EMOTTAG: ingen divergens');

  // 2) Worklog-rad + commit + push (en retry vid kapplöpning)
  appendFileSync(`${WS}/worklog.md`, RAD);
  sh('git', ['add', 'worklog.md', 'data/forskning/beslutsminne.jsonl',
    'verktyg/_r160-bokfor2.mjs', 'verktyg/_r161-verifiera-start.mjs', 'verktyg/_r161-verifiera.mjs',
    'verktyg/_r162-bygglage.mjs', 'verktyg/_r162-vanta.mjs',
    'verktyg/_r163-rotsond.mjs', 'verktyg/_r163-dirigent.mjs', 'verktyg/_r164-bokfor.mjs']);
  sh('git', ['commit', '-m', 'studio: rond 162 [organ:Φ] — F6 OOM-rot belagd (Killed i bygglog) + sekvensdirigent _r163 + sonder + beslutsminne bokfort']);
  console.log('Commit: ' + sh('git', ['rev-parse', '--short', 'HEAD']));
  try {
    sh('git', ['push', 'prod', 'develop']);
    console.log('PUSH: grön');
  } catch (e1) {
    sh('git', ['fetch', 'prod']);
    sh('git', ['merge', 'prod/develop', '--no-edit']);
    sh('git', ['push', 'prod', 'develop']);
    console.log('PUSH: grön efter emottags-retry (' + sh('git', ['rev-parse', '--short', 'HEAD']) + ')');
  }
  console.log('Yta: ' + (sh('git', ['status', '--porcelain']) || 'ren'));
} catch (e) { console.log('FEL: ' + e.message); process.exit(1); }
