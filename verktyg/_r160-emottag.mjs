#!/usr/bin/env node
// _r160-emottag.mjs — fas A: emotta prod:s nya commits (s1-granskningar), pusha hela kedjan tillbaka.
import { execFileSync } from 'node:child_process';

const WS = '/home/ak1a/agent/ak1';
function sh(cmd, args, opts = {}) {
  return execFileSync(cmd, args, { encoding: 'utf8', timeout: 120000, cwd: WS, ...opts }).trim();
}
const log = (m) => console.log(m);

try {
  log('Före:   ws=' + sh('git', ['rev-parse', '--short', 'HEAD']));
  sh('git', ['fetch', 'prod', 'develop']);
  {
    try {
      sh('git', ['merge', 'prod/develop', '-m', 'merge: iteration emottag prod — s1-granskningar (fastighetsaktier-en, B24 medtech, INVESTOR Q3) efter byggloopens good-HEAD-reset']);
      log('Merge: OK (ren)');
    } catch (e) {
      log('Merge-konflikt? ' + e.message.split('\n').slice(0, 3).join(' | '));
      const status = sh('git', ['status', '--porcelain']);
      log('Status:\n' + status);
      const konflikter = status.split('\n').filter((l) => l.startsWith('AA') || l.startsWith('UU'));
      for (const k of konflikter) {
        const fil = k.slice(3).trim();
        sh('git', ['checkout', '--theirs', fil]);
        sh('git', ['add', fil]);
        log('Löst --theirs (prod auktoritär): ' + fil);
      }
      sh('git', ['commit', '--no-edit']);
      log('Merge: slutförd efter konfliktlösning');
    }
  }
  log('Efter:  ws=' + sh('git', ['rev-parse', '--short', 'HEAD']));
  log('Yta:    ' + (sh('git', ['status', '--porcelain']) || 'ren (utöver sonder)'));
  sh('git', ['push', 'prod', 'develop']);
  log('PUSH: grön');
  const prodHead = sh('git', ['--git-dir', '/home/ak1a/AK1/.git', 'rev-parse', '--short', 'HEAD']);
  const wsHead = sh('git', ['rev-parse', '--short', 'HEAD']);
  log('wsHeadIProd: ' + (wsHead === prodHead) + ' (ws=' + wsHead + ', prod=' + prodHead + ')');
} catch (e) {
  console.log('FEL: ' + e.message);
  process.exit(1);
}
