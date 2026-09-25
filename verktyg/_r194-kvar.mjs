#!/usr/bin/env node
// _r194-kvar.mjs — de 7 kvarvarande GUL:ns skäl + metas källciteringar (för textkuren)
import fs from 'node:fs';
const DIR = '/home/ak1a/agent/ak1/data/blogg-utkast/kvartal/2026-q3';
const ut = [];

const resultat = JSON.parse(fs.readFileSync('/tmp/r172-granskning-resultat.json', 'utf8'));
ut.push('=== KVARVARANDE GUL (7) ===');
for (const r of resultat.filter((x) => x.dom === 'GUL')) ut.push(`${r.slug}: ${r.gul.join(' · ')}`);

// metas källciteringar i kontext (för att skriva sektionsrader som speglar kroppens egna uppgifter)
const meta = JSON.parse(fs.readFileSync(`${DIR}/sa-laser-du-meta-q3-2026.json`, 'utf8'));
ut.push('\n=== META: satser med kalender/hämtad/Yahoo/MarketStack ===');
const satser = meta.body.split(/(?<=[.!?])\s+/).filter((s) => /kalender|hämtad|Yahoo|MarketStack|IR\b|investor\.|atmeta|data\//i.test(s));
for (const s of satser.slice(0, 10)) ut.push('· ' + s.trim().slice(0, 230));
// sektionen "Övningar, källor och juridik" — hur börjar den?
const i = meta.body.indexOf('Övningar, källor');
ut.push('\n=== META: sektionens första 700 tkn ===');
ut.push(meta.body.slice(i, i + 700));

fs.writeFileSync('/tmp/r194-kvar.txt', ut.join('\n') + '\n');
console.log('skrev /tmp/r194-kvar.txt');
