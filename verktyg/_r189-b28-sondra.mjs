#!/usr/bin/env node
// _r189-b28-sondra.mjs — B28 investmentbolag adoptionsprob (fil-skrivande enligt skal-kvoten)
import fs from 'node:fs';

const PROD = '/home/ak1a/AK1';
const ROT = '/home/ak1a/agent/ak1';
const ut = [];

// ── 1. Guidens nyckelfält ──
const gp = `${PROD}/data/blogg-utkast/investmentbolag-sa-analyserar-du-investmentbolag.json`;
const g = JSON.parse(fs.readFileSync(gp, 'utf8'));
const ord = g.body.trim().split(/\s+/).length;
const h2 = (g.body.match(/^## .*$/gm) || []);
const h1 = (g.body.match(/^# .*$/gm) || []);
const rader = g.body.trim().split('\n');
ut.push('=== GUIDEN ===');
ut.push(`slug=${g.slug} · publishedAt=${g.publishedAt} · readingMinutes=${g.readingMinutes} · pillar=${g.pillar} · author=${g.author}`);
ut.push(`title=${g.title} (${[...g.title].length} tkn)`);
ut.push(`description=${g.description} (${[...g.description].length} tkn)`);
ut.push(`tags(${g.tags.length})=${g.tags.join('|')} · ord=${ord} · H1=${h1.length} · H2=${h2.length}`);
ut.push(`H2-rubriker: ${h2.join(' / ')}`);
ut.push(`sista raden: ${rader[rader.length - 1].slice(0, 120)}`);
ut.push(`fält: ${Object.keys(g).join(',')}`);

// ── 2. Syskonets KVD-skript: paths + skrivningar + kontrollista ──
const kp = `${PROD}/verktyg/_s3u1-b28-kvd-investmentbolag.mjs`;
const k = fs.readFileSync(kp, 'utf8');
ut.push('\n=== KVD-SKRIPTET ===');
ut.push(`skrivningar: ${[...k.matchAll(/writeFileSync|appendFileSync|createWriteStream/g)].map((m) => m[0]).join(',') || 'INGA (ren läsare)'}`);
ut.push(`paths: ${[...k.matchAll(/['"]([^'"]*(?:AK1|agent)[^'"]*)['"]/g)].map((m) => m[1]).join(' ; ')}`);
ut.push(`kontroller (K-anrop): ${(k.match(/^K\(/gm) || []).length}`);
ut.push('K-rader:');
ut.push(k.split('\n').filter((l) => /^K\(/.test(l.trim())).map((l) => '  ' + l.trim().slice(0, 150)).join('\n'));

// ── 3. Underlagsverktyget ──
const up = `${PROD}/verktyg/_s3u1-b28-underlag.mjs`;
ut.push('\n=== UNDERLAGSVERKTYGET (huvud) ===');
ut.push(fs.readFileSync(up, 'utf8').split('\n').slice(0, 25).join('\n'));

// ── 4. Klaimfiler i prod:s vakten ──
ut.push('\n=== KLAIMFILER (b28/investment) ===');
const klaim = fs.readdirSync(`${PROD}/data/vakten`).filter((f) => /b28|investment/i.test(f));
if (klaim.length === 0) ut.push('(inga)');
for (const f of klaim) {
  ut.push(`--- ${f} ---`);
  ut.push(fs.readFileSync(`${PROD}/data/vakten/${f}`, 'utf8').slice(0, 1800));
}

// ── 5. Bokningspunkt: B-tabellens slut i workspace SEO-GUIDER ──
const seo = fs.readFileSync(`${ROT}/data/forskning/SEO-GUIDER-2026-09.md`, 'utf8').split('\n');
const b27 = seo.findIndex((l) => l.startsWith('| B27 |'));
const b28 = seo.findIndex((l) => l.startsWith('| B28 |'));
ut.push('\n=== B-TABELLEN ===');
ut.push(`B27-rad: ${b27 >= 0 ? `rad ${b27 + 1} — ${seo[b27].slice(0, 90)}…` : 'SAKNAS'} · B28-rad: ${b28 >= 0 ? `rad ${b28 + 1} FINNS REDAN` : 'saknas (öppen)'}`);
// vad följer efter B27-raden?
const efter = seo.slice(b27 + 1, b27 + 6).map((l, i) => `  +${i + 1}: ${l.slice(0, 100)}`);
ut.push('efter B27-raden:'); ut.push(efter.join('\n'));

fs.writeFileSync('/tmp/r189-b28-sondra.txt', ut.join('\n') + '\n');
console.log('skrev /tmp/r189-b28-sondra.txt');
