#!/usr/bin/env node
// ROND 102 — vänta-pusher: prod-ytans ren-grind är stängd av aktivt fabriksbarn (auto-s6-u3).
// Försöker push var 60:e minut... nej, var 60:e SEKUND, i upp till 40 min; skriver kvitto vid grön.
import { writeFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';

const ROT = '/home/ak1a/agent/ak1';
const KVITTO = `${ROT}/data/vakten/r102-push-kvitto.json`;
const cd = (arr) => execFileSync(arr[0], arr.slice(1).flat(3), { encoding: 'utf-8', cwd: ROT }).trim();
const log = (m) => console.log(`[r102p] ${new Date().toISOString().slice(11, 19)} ${m}`);
const deadline = Date.now() + 40 * 60 * 1000;

while (Date.now() < deadline) {
  try {
    cd(['git', ['push', 'prod', 'develop']]);
    const h = cd(['git', ['rev-parse', 'HEAD']]);
    cd(['git', ['fetch', 'prod', 'develop']]);
    execFileSync('git', ['merge-base', '--is-ancestor', h, 'prod/develop'], { cwd: ROT });
    writeFileSync(KVITTO, JSON.stringify({ status: 'PUSHAD', ts: new Date().toISOString(), head: h.slice(0, 8), prodDevelop: cd(['git', ['rev-parse', '--short', 'prod/develop']]) }, null, 2) + '\n');
    log(`PUSH GRÖN — prod/develop innehåller ${h.slice(0, 8)}`);
    process.exit(0);
  } catch (e) {
    const medd = String(e).split('\n').find((l) => /rejected|error|denied/i.test(l)) || 'okänd felbild';
    log(`push väntar: ${medd.slice(0, 110)}`);
    try { cd(['git', ['fetch', 'prod', 'develop']]); cd(['git', ['merge', 'FETCH_HEAD', '-m', 'Merge prod/develop (ROND 102 pushare)']]); } catch { /* merge-konflikt: nästa varv försöker igen efter ny fetch */ }
  }
  await new Promise((r) => setTimeout(r, 60_000));
}
writeFileSync(KVITTO, JSON.stringify({ status: 'VÄNTAR-FORTFARANDE', ts: new Date().toISOString(), notering: '40 min passerade — prod-ytan fortfarande låst av aktivt fabriksbarn; nästa rond tar pushen' }, null, 2) + '\n');
process.exit(3);
