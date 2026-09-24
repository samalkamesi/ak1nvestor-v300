#!/usr/bin/env node
// _r164-pushpoll.mjs — väntar in fabrikens s6-barn (ren prod-yta), emottar + pushar rond-162-committen.
import { execFileSync } from 'node:child_process';

const WS = '/home/ak1a/agent/ak1';
const P = '/home/ak1a/AK1';
function sh(cmd, args, cwd = WS, t = 300000) {
  return execFileSync(cmd, args, { encoding: 'utf8', timeout: t, cwd }).trim();
}
const t0 = Date.now();
for (let i = 0; i < 24; i++) {
  try {
    const yta = sh('git', ['status', '--porcelain'], P, 30000);
    if (yta === '') {
      // Ytan ren — emottag ev. nya commits och pusha
      try { sh('git', ['push', 'prod', 'develop']); } catch {
        sh('git', ['fetch', 'prod']);
        if (sh('git', ['rev-parse', 'HEAD']) !== sh('git', ['rev-parse', 'prod/develop'])) {
          sh('git', ['merge', 'prod/develop', '--no-edit']);
        }
        sh('git', ['push', 'prod', 'develop']);
      }
      console.log('PUSH GRÖN ' + new Date().toISOString() + ' HEAD=' + sh('git', ['rev-parse', '--short', 'HEAD']) + ' prod=' + sh('git', ['rev-parse', '--short', 'prod/develop']));
      process.exit(0);
    }
    if (i % 4 === 0) console.log('vantar (' + Math.round((Date.now() - t0) / 60000) + ' min): prod-ytan smutsig (' + yta.split('\n').length + ' rader)');
  } catch (e) { console.log('sondfel: ' + e.message.slice(0, 120)); }
  await new Promise((r) => setTimeout(r, 90000));
}
console.log('PUSH EJ LANDAD inom 36 min — prod-ytan fortfarande upptagen av fabriksarbete');
process.exit(1);
