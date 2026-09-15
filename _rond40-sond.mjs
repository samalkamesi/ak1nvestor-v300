// Rond 40 — sond: RAD-raden, MÅL-502, pipeline, gap-register, externa larm
import { execSync } from 'node:child_process';
import fs from 'node:fs';
const PROD = '/home/ak1a/AK1', ARB = '/home/ak1a/agent/ak1';
const rad = (t) => console.log(t);
const las = (p) => { try { return fs.readFileSync(p, 'utf8'); } catch { return null; } };

// 1. Vad är RAD? — hälsoprovets källa (styrelse-rond.mjs)
const sr = las(ARB + '/verktyg/styrelse-rond.mjs') || '';
const rader = sr.split('\n');
rader.forEach((r, i) => { if (/RAD/.test(r)) rad(`styrelse-rond.mjs:${i + 1}: ${r.trim().slice(0, 150)}`); });

// 2. Mål-motorns status (var skriver målmotorn? mal-state)
for (const p of ['data/vakten/mal-state.json', 'data/vakten/mal.json']) {
  const j = las(PROD + '/' + p);
  if (j) { rad(`${p}: ${j.slice(0, 400)}`); break; }
}

// 3. Hjärtatsloggs svans — RAD-källan kan vara hjärtslagsloggen
const hj = las(PROD + '/data/vakten/hjartslag.log');
if (hj) { rad('=== hjartslag.log sista 8 ==='); hj.trim().split('\n').slice(-8).forEach((r) => rad(r.slice(0, 180))); }

// 4. API svarar nu? (MÅL-502 kl 20:43)
try {
  const kod = execSync('curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/api/studio/stream', { timeout: 15_000, encoding: 'utf8' }).trim();
  rad('/api/studio/stream nu: ' + kod);
} catch (e) { rad('stream-fel: ' + String(e).slice(0, 80)); }
try {
  const kod = execSync('curl -s -o /dev/null -w "%{http_code}" https://lab.ak1nvestor.com/', { timeout: 15_000, encoding: 'utf8' }).trim();
  rad('https prod nu: ' + kod);
} catch (e) { rad('https-fel: ' + String(e).slice(0, 80)); }

// 5. PIPELINE-KO.md — kön
const pipe = las(ARB + '/data/forskning/PIPELINE-KO.md');
if (pipe) {
  rad('=== PIPELINE-KO (KÖ-sektion, första 40 rader efter rubrik) ===');
  const idx = pipe.indexOf('KÖ');
  rad(pipe.slice(Math.max(0, idx - 200), idx + 2400));
}

// 6. Gap-register — öppna poster (footer)
const gap = las(ARB + '/data/forskning/ZCODE-GAP-REGISTER.md');
if (gap) {
  rad('=== GAP-REGISTER (sista 1800 tecken) ===');
  rad(gap.slice(-1800));
}

// 7. Externa larm (ronden kunde inte läsa dem)
for (const p of ['data/vakten/externa-larm.json', 'data/vakten/externa-larm.jsonl', 'data/vakten/ext-larm.jsonl']) {
  const j = las(PROD + '/' + p);
  if (j) { rad(`${p} sista 400: ${j.slice(-400)}`); }
}
rad('externa larm-sökning klar');
