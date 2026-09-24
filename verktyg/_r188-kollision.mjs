#!/usr/bin/env node
// _r188-kollision.mjs — medtech-ar-kollisionen + push-hook-blockeraren (fil-skrivande)
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import fs from 'node:fs';

const ROT = '/home/ak1a/agent/ak1';
const PROD = '/home/ak1a/AK1';
const ut = [];
const sha = (p) => createHash('sha256').update(fs.readFileSync(p)).digest('hex').slice(0, 16);
const git = (args, cwd) => execFileSync('git', args, { cwd, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] }).trim();

// ── 1. Push-hooken: vad kontrollerar den exakt? ──
ut.push('=== prod hooks ===');
for (const h of ['pre-receive', 'update']) {
  const p = `${PROD}/.git/hooks/${h}`;
  if (fs.existsSync(p)) {
    const innehåll = fs.readFileSync(p, 'utf8');
    ut.push(`--- ${h} (${innehåll.length} tecken) ---`);
    ut.push(innehåll.slice(0, 1500));
  } else ut.push(`--- ${h}: finns ej`);
}

// ── 2. Blockerande tracked-ändring: motorervalidering ──
ut.push('\n=== prod: diff av motorervalidering-2026-09-02.md ===');
try {
  ut.push(git(['diff', '--stat', 'data/rapporter/motorervalidering-2026-09-02.md'], PROD));
  ut.push(git(['diff', 'data/rapporter/motorervalidering-2026-09-02.md'], PROD).slice(0, 2000));
} catch (e) { ut.push('diff fel: ' + e.message); }
const mvStat = fs.statSync(`${PROD}/data/rapporter/motorervalidering-2026-09-02.md`);
ut.push(`mtime: ${mvStat.mtime.toISOString()} · size ${mvStat.size}`);

// ── 3. Medtech-ar: min fil vs prod-trädets främmande fil ──
ut.push('\n=== medtech-ar-jämförelse ===');
const min = `${ROT}/data/blogg-utkast/medtechaktier-sa-analyserar-du-medicintekniska-bolag-ar.json`;
const deras = `${PROD}/data/blogg-utkast/medtechaktier-sa-analyserar-du-medicintekniska-bolag-ar.json`;
const dStat = fs.statSync(deras);
ut.push(`MIN:   ${fs.statSync(min).size} byte · mtime ${fs.statSync(min).mtime.toISOString()} · sha ${sha(min)}`);
ut.push(`DERAS: ${dStat.size} byte · mtime ${dStat.mtime.toISOString()} · sha ${sha(deras)}`);
if (sha(min) === sha(deras)) {
  ut.push('=> BITIDENTISKA (samma leverans)');
} else {
  ut.push('=> SKILDLIGA — deras nyckelfält:');
  const d = JSON.parse(fs.readFileSync(deras, 'utf8'));
  const m = JSON.parse(fs.readFileSync(min, 'utf8'));
  const kropp = (o) => String(o.content ?? o.body ?? o.innehall ?? JSON.stringify(o));
  const ord = (s) => s.replace(/<[^>]+>/g, ' ').split(/\s+/).filter(Boolean).length;
  for (const [namn, o] of [['DERAS', d], ['MIN', m]]) {
    ut.push(`${namn}: slug=${o.slug} · title=${String(o.title).slice(0, 70)} · publishedAt=${o.publishedAt} · ord≈${ord(kropp(o))} · nycklar=${Object.keys(o).join(',')}`);
  }
}

// ── 4. Syskonens tidsfönster i prod-trädet ──
ut.push('\n=== syskonfilers mtimes i prod ===');
for (const f of [
  'verktyg/_s3u2-b24-ar-kvd-medtech.mjs',
  'verktyg/_s3u1-b28-kvd-investmentbolag.mjs',
  'verktyg/_s3u1-b28-underlag.mjs',
  'data/blogg-utkast/investmentbolag-sa-analyserar-du-investmentbolag.json',
]) {
  const p = `${PROD}/${f}`;
  const s = fs.statSync(p);
  ut.push(`${f}: mtime ${s.mtime.toISOString()} · ${s.size} byte`);
}

fs.writeFileSync('/tmp/r188-kollision.txt', ut.join('\n') + '\n');
console.log('skrev /tmp/r188-kollision.txt');
