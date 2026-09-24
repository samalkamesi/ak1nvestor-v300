#!/usr/bin/env node
// ROND 105 — beslutsminne (båda träd) + deploy-bevakare för v210-live-kvitto
import { appendFileSync, writeFileSync, readFileSync, existsSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { spawn } from 'node:child_process';
const ARB = '/home/ak1a/agent/ak1';
const PROD = '/home/ak1a/AK1';
const run = (c, a, o = {}) => execFileSync(c, a, { cwd: ARB, encoding: 'utf-8', ...o }).trim();

// 1. beslutsminne båda träden
const rad = JSON.stringify({ ts: new Date().toISOString(), rond: 105, beslut: 'våg 210 VALUTAMEKANIK levererad: frågelager #57 (10 monsters, ma-07+rk-07 aktiverade, kärnord disjunkta mot portfoljgrund/realekonomi/makro/bas) — sviter 57/57+236/236+tsc 0; v209 plockad av fabriken (u1 VESTAS+u2 SMFG/AXA klara)', landat: '78126d51' }) + '\n';
for (const rot of [ARB, PROD]) appendFileSync(`${rot}/data/vakten/beslutsminne.jsonl`, rad);
console.log('beslutsminne: båda träden ✓');

// 2. deploy-bevakare (fromkopplad): väntar push-kvitto → bygg → chunk-sond (ASCII-funktionnamn) → live-kvitto
const V = `${ARB}/verktyg/_r105-deploybevakare.mjs`;
writeFileSync(V, `#!/usr/bin/env node
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { readdirSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
const ARB = '${ARB}';
const PROD = '${PROD}';
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
`);
const p = spawn('node', [V], { detached: true, stdio: 'ignore' });
p.unref();
console.log('deploy-bevakare pid', p.pid);
