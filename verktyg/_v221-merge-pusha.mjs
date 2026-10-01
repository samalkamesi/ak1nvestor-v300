// _v221-merge-pusha.mjs — merge prod/develop (82626725+d76a3db2) in i develop + push, i ett svep.
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';

const ROT = '/home/ak1a/agent/ak1';
const LOGG = '/tmp/v221-merge-pusha.log';
fs.writeFileSync(LOGG, `start ${new Date().toISOString()}\n`);
const logga = (s) => { fs.appendFileSync(LOGG, s + '\n'); console.log(s); };
const git = (args, t = 30000) => execFileSync('git', args, { encoding: 'utf8', timeout: t, cwd: ROT }).trim();

try {
  // Diff-omfång: rör mina 265 commits src/?
  const srcStat = git(['diff', '--stat', 'aa2f35eb..develop', '--', 'src/']);
  logga('src-diff aa2f35eb..develop: ' + (srcStat ? srcStat.split('\n').slice(-2).join(' | ').slice(0, 200) : '(ingen — endast data/verktyg)'));

  // Merge explicit mot prod/develop (inte FETCH_HEAD)
  const mergeUt = git(['merge', '--no-edit', '-m',
    'merge: prod -> develop — v221 lärvägsleverans (82626725) + organ:Z r359-notis (d76a3db2) inhämtade',
    'prod/develop'], 60000);
  logga('merge OK: ' + mergeUt.slice(0, 300));

  // Push direkt
  const pushUt = git(['push', 'prod', 'develop'], 120000);
  logga('push OK: ' + pushUt.slice(0, 300));

  logga('HEAD: ' + git(['log', '--oneline', '-1']).slice(0, 150));
  const kvar = git(['rev-list', '--count', 'prod/develop..develop']);
  logga(`commits prod fortfarande saknar: ${kvar}`);
  logga('KLAR');
} catch (e) {
  logga('FEL: ' + String(e.message).slice(0, 400));
  logga('stdout: ' + String(e.stdout || '').slice(0, 600));
  logga('stderr: ' + String(e.stderr || '').slice(0, 600));
  process.exit(1);
}
