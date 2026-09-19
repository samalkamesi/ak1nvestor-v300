#!/usr/bin/env node
// ROND 103 vänta-pusher — försöker pusha develop→prod var 60:e s tills ren-yta-grinden öppnar
import { appendFileSync, writeFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';

const ARB = '/home/ak1a/agent/ak1';
const LOG = `${ARB}/data/vakten/r103-pushlogg.txt`;
const KVT = `${ARB}/data/vakten/r103-push-kvitto.json`;
const run = (cmd, args) => execFileSync(cmd, args, { cwd: ARB, encoding: 'utf-8' }).trim();
const isPAD = () => { try { run('git', ['merge-base', '--is-ancestor', 'HEAD', 'prod/develop']); return true; } catch { return false; } };
const log = (s) => appendFileSync(LOG, `${new Date().toISOString()} ${s}\n`);

log('startar — HEAD vid start: ' + run('git', ['log', '-1', '--format=%h']));
for (let i = 1; i <= 30; i++) {
  if (isPAD()) { log(`KLAR (försök ${i}): HEAD redan i prod/develop`); writeFileSync(KVT, JSON.stringify({ status: 'PUSHAD', hash: run('git', ['rev-parse', '--short', 'HEAD']), ts: new Date().toISOString() }, null, 2)); process.exit(0); }
  try {
    run('git', ['push', 'prod', 'develop']);
    if (isPAD()) {
      const h = run('git', ['rev-parse', '--short', 'HEAD']);
      log(`PUSHAD (försök ${i}): ${h}`);
      writeFileSync(KVT, JSON.stringify({ status: 'PUSHAD', hash: h, ts: new Date().toISOString() }, null, 2));
      process.exit(0);
    }
  } catch (e) {
    const fel = String(e).split('\n').filter((r) => r.includes('rejected') || r.includes('error')).join(' | ').slice(0, 160);
    log(`försök ${i} fel: ${fel || 'okänd'}`);
    try { run('git', ['fetch', 'prod', 'develop']); run('git', ['merge', '--no-edit', 'prod/develop']); } catch (m) { log('MERGEKONFLIKT: ' + String(m).slice(0, 120)); }
  }
  await new Promise((r) => setTimeout(r, 60_000));
}
log('GAV UPP efter 30 försök — lämna till nästa rond');
writeFileSync(KVT, JSON.stringify({ status: 'UPPGIVEN', ts: new Date().toISOString() }, null, 2));
