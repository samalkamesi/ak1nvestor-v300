#!/usr/bin/env node
// _r188-koll2.mjs — syskonets KVD-skript, klaimfiler, publishedAt-konvention
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';

const ROT = '/home/ak1a/agent/ak1';
const PROD = '/home/ak1a/AK1';
const ut = [];

// ── 1. Syskonets KVD-skript: huvud + vägreferenser ──
const derasSkript = fs.readFileSync(`${PROD}/verktyg/_s3u2-b24-ar-kvd-medtech.mjs`, 'utf8');
ut.push('=== syskonets KVD-skript: första 60 rader ===');
ut.push(derasSkript.split('\n').slice(0, 60).map((r, i) => `${i + 1}: ${r}`).join('\n'));
ut.push('\n(absolute/relative paths): ' + JSON.stringify([...derasSkript.matchAll(/['"`]([^'"`]*(?:AK1|agent|data\/|verktyg\/)[^'"`]*)['"`]/g)].map((m) => m[1]).slice(0, 15)));

// ── 2. Klaimfiler i prod:s vakten för b24/medtech ──
ut.push('\n=== klaimfiler prod data/vakten (b24/medtech/ar24) ===');
for (const f of fs.readdirSync(`${PROD}/data/vakten`).filter((f) => /b24|medtech|ar24/i.test(f))) {
  const s = fs.statSync(`${PROD}/data/vakten/${f}`);
  ut.push(`${f}: mtime ${s.mtime.toISOString()}`);
}

// ── 3. publishedAt-konvention i -ar-spåret (workspace) ──
ut.push('\n=== publishedAt i -ar-speglarna (workspace) ===');
for (const f of [
  'fastighetsaktier-sa-analyserar-du-fastighetsbolag-ar.json',
  'skogsaktier-sa-analyserar-du-skogsbolag-ar.json',
  'sa-analyserar-du-energiaktier-ar.json',
  'ravarubolag-materialbranschens-cykel-ar.json',
]) {
  const p = `${ROT}/data/blogg-utkast/${f}`;
  if (fs.existsSync(p)) {
    const d = JSON.parse(fs.readFileSync(p, 'utf8'));
    ut.push(`${f}: publishedAt=${d.publishedAt}`);
  } else ut.push(`${f}: SAKNAS`);
}
// originalets dag för jämförelse
const orig = JSON.parse(fs.readFileSync(`${ROT}/data/blogg-utkast/medtechaktier-sa-analyserar-du-medicintekniska-bolag.json`, 'utf8'));
ut.push(`ORIGINAL B24 medtech: publishedAt=${orig.publishedAt}`);

fs.writeFileSync('/tmp/r188-koll2.txt', ut.join('\n') + '\n');
console.log('skrev /tmp/r188-koll2.txt');
