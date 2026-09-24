#!/usr/bin/env node
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { readdirSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
const ARB = '/home/ak1a/agent/ak1';
const PROD = '/home/ak1a/AK1';
const KVT = PROD + '/data/vakten/v210-live-kvitto.json';
const PUSHKVT = ARB + '/data/vakten/r105-push-kvitto.json';
const run = (c, a, o = {}) => { try { return execFileSync(c, a, { encoding: 'utf-8', timeout: 20_000, ...o }).trim(); } catch { return ''; } };
const sond = () => {
  // ASCII-säkert funktionsnamn ur våg 210 — bundlern kan inte hex-escape:a identifierare
  for (const f of readdirSync(PROD + '/.next/static/chunks')) {
    if (!f.endsWith('.js')) continue;
    try { if (readFileSync(PROD + '/.next/static/chunks/' + f, 'utf-8').includes('svaraLokaltValutamekanik')) return f; } catch {}
  }
  return '';
};
for (let i = 0; i < 60; i++) {
  await new Promise((r) => setTimeout(r, 120_000));
  // vänta först på pushen
  let pushad = false;
  try { pushad = JSON.parse(readFileSync(PUSHKVT, 'utf-8')).status === 'PUSHAD'; } catch {}
  if (!pushad) continue;
  const f = sond();
  if (f) {
    const kod = run('curl', ['-s', '-o', '/dev/null', '-w', '%{http_code}', 'https://lab.ak1nvestor.com/']);
    writeFileSync(KVT, JSON.stringify({ status: kod === '200' ? 'LIVE-GRÖN' : 'LIVE-' + kod, chunk: f, ts: new Date().toISOString() }, null, 2));
    process.exit(0);
  }
}
writeFileSync(KVT, JSON.stringify({ status: 'UPPGIVEN', ts: new Date().toISOString() }, null, 2));
