#!/usr/bin/env node
import { appendFileSync, writeFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
const ARB = '/home/ak1a/agent/ak1';
const LOG = ARB + '/data/vakten/r105-pushlogg.txt';
const KVT = ARB + '/data/vakten/r105-push-kvitto.json';
const run = (c, a) => execFileSync(c, a, { cwd: ARB, encoding: 'utf-8' }).trim();
const isPAD = () => { try { run('git', ['merge-base', '--is-ancestor', 'HEAD', 'prod/develop']); return true; } catch { return false; } };
const log = (s) => appendFileSync(LOG, new Date().toISOString() + ' ' + s + '\n');
for (let i = 1; i <= 30; i++) {
  if (isPAD()) { writeFileSync(KVT, JSON.stringify({ status: 'PUSHAD', hash: run('git', ['rev-parse', '--short', 'HEAD']), ts: new Date().toISOString() }, null, 2)); log('KLAR'); process.exit(0); }
  try { run('git', ['push', 'prod', 'develop']); if (isPAD()) { writeFileSync(KVT, JSON.stringify({ status: 'PUSHAD', hash: run('git', ['rev-parse', '--short', 'HEAD']), ts: new Date().toISOString() }, null, 2)); log('PUSHAD försök ' + i); process.exit(0); } }
  catch (e) { log('försök ' + i + ' fel: ' + String(e).split('\n').filter((r) => r.includes('rejected')).join(' | ').slice(0, 120)); try { run('git', ['fetch', 'prod', 'develop']); run('git', ['merge', '--no-edit', 'prod/develop']); } catch (m) { log('mergekonflikt: ' + String(m).slice(0, 100)); } }
  await new Promise((r) => setTimeout(r, 60_000));
}
writeFileSync(KVT, JSON.stringify({ status: 'UPPGIVEN', ts: new Date().toISOString() }, null, 2));
