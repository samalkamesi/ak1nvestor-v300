#!/usr/bin/env node
// ROND 105 — ISR live-kvitto-vaktpost: väntar på 03:10-daemonraden (max till 04:00), skriver kvitto
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
const LOG = '/tmp/ak1a-varm.log';
const KVT = '/home/ak1a/AK1/data/vakten/isr-live-kvitto.json';
const deadline = Date.now() + 6 * 3600_000; // från start (≈21:10Z) → 03:10Z rymmer nattens 01:10Z-körning (03:10 lokal) med marginal
while (Date.now() < deadline) {
  try {
    const rader = readFileSync(LOG, 'utf-8').trim().split('\n');
    const sista = rader[rader.length - 1] || '';
    const m = sista.match(/^2026-09-20T03:\d+:\d+ varmade (\d+)\/(\d+) vagar(.*)$/);
    if (m) {
      writeFileSync(KVT, JSON.stringify({ status: m[1] === m[2] ? 'LIVE-GRÖN' : 'LIVE-AVVIKELSE', rad: sista, ts: new Date().toISOString() }, null, 2));
      process.exit(0);
    }
  } catch { /* loggen läsbar när daemonen skrivit */ }
  await new Promise((r) => setTimeout(r, 60_000));
}
writeFileSync(KVT, JSON.stringify({ status: 'INGEN-0310-RAD', ts: new Date().toISOString() }, null, 2));
