#!/usr/bin/env node
// _r167-pushpoll2.mjs — push-poll v2: 75 min marginal (barnen arbetar aktivt, behöver tid).
import { execFileSync } from 'node:child_process';

const WS = '/home/ak1a/agent/ak1';
const P = '/home/ak1a/AK1';
function sh(cmd, args, cwd = WS, t = 300000) {
  return execFileSync(cmd, args, { encoding: 'utf8', timeout: t, cwd }).trim();
}
const t0 = Date.now();
for (let i = 0; i < 50; i++) {
  try {
    const yta = sh('git', ['status', '--porcelain'], P, 30000);
    if (yta === '') {
      try { sh('git', ['push', 'prod', 'develop']); } catch {
        sh('git', ['fetch', 'prod']);
        if (sh('git', ['rev-parse', 'HEAD']) !== sh('git', ['rev-parse', 'prod/develop'])) {
          sh('git', ['merge', 'prod/develop', '--no-edit']);
        }
        sh('git', ['push', 'prod', 'develop']);
      }
      console.log('PUSH GRÖN ' + new Date().toISOString() + ' HEAD=' + sh('git', ['rev-parse', '--short', 'HEAD']));
      process.exit(0);
    }
    if (i % 5 === 0) console.log('vantar (' + Math.round((Date.now() - t0) / 60000) + ' min): ' + yta.split('\n').length + ' rader smutsiga');
  } catch (e) { console.log('sondfel: ' + e.message.slice(0, 120)); }
  await new Promise((r) => setTimeout(r, 90000));
}
console.log('PUSH EJ LANDAD inom 75 min');
process.exit(1);
