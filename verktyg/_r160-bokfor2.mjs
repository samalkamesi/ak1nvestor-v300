#!/usr/bin/env node
// _r160-bokfor2.mjs — commitar pipeline-bokningar + dirigentverktyg.
import { execFileSync } from 'node:child_process';
import { unlinkSync, existsSync, appendFileSync } from 'node:fs';

const WS = '/home/ak1a/agent/ak1';
function sh(cmd, args, opts = {}) {
  return execFileSync(cmd, args, { encoding: 'utf8', timeout: 180000, cwd: WS, ...opts }).trim();
}
try {
  sh('git', ['add', 'data/forskning/PIPELINE-KO.md', 'verktyg/_r160-dirigent.sh', 'verktyg/_r160-dirigent-start.mjs', 'verktyg/_r160-commit.mjs']);
  sh('git', ['commit', '-m', 'studio: iteration bokforing [organ:Φ] — PIPELINE-KO v160 P2.5+P3+v164 bokade + deploy-dirigent + rondens sonder']);
  console.log('Commit: ' + sh('git', ['rev-parse', '--short', 'HEAD']));
  for (const f of ['verktyg/_r160-commitmsg.txt']) if (existsSync(`${WS}/${f}`)) unlinkSync(`${WS}/${f}`);
  console.log('Yta: ' + (sh('git', ['status', '--porcelain']) || 'ren'));
} catch (e) { console.log('FEL: ' + e.message); process.exit(1); }
