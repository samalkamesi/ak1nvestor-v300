#!/usr/bin/env node
// _r194-sista.mjs — atlas-copcos kunder-sats, investor/latour läs-innehåll, vz/wihlborgs datum
import fs from 'node:fs';
const DIR = '/home/ak1a/agent/ak1/data/blogg-utkast/kvartal/2026-q3';
const ut = [];

const ac = JSON.parse(fs.readFileSync(`${DIR}/sa-laser-du-atlas-copco-q3-2026.json`, 'utf8'));
ut.push('=== ATLAS-COPCO: satser med "kunder" ===');
for (const s of ac.body.split(/(?<=[.!?])\s+/).filter((s) => /\bkunder\b/i.test(s))) ut.push('· ' + s.trim().slice(0, 220));

for (const slug of ['sa-laser-du-investor-ab-q3-2026', 'sa-laser-du-latour-q3-2026']) {
  const p = JSON.parse(fs.readFileSync(`${DIR}/${slug}.json`, 'utf8'));
  ut.push(`\n=== ${slug}: H2 ===`);
  ut.push((p.body.match(/^## .*$/gm) || []).join(' | '));
  ut.push('läs-tolka-träffar: ' + (p.body.match(/[^.\n]{0,60}(l[aä]s|tolka|tolkar)[^.\n]{0,60}/gi) || []).slice(0, 4).join(' || '));
}

for (const slug of ['sa-laser-du-vz-q3-2026', 'sa-laser-du-wihlborgs-q3-2026']) {
  const p = JSON.parse(fs.readFileSync(`${DIR}/${slug}.json`, 'utf8'));
  ut.push(`\n=== ${slug}: kroppens okt/nov-datum ===`);
  ut.push([...new Set([...p.body.matchAll(/2026-(09|10|11)-\d{2}|(\d{1,2}) (september|oktober|november)/gi)].map((m) => m[0]))].join(' · '));
}

// kalenderns fönster för de två (alla datum i fönstret)
const STOPP = new Set(['sa', 'laser', 'du', 'q3', '2026', 'a', 'b', 'ab', 'publ', 'the', 'inc']);
const kalRader = [];
for (const f of fs.readdirSync(DIR).filter((f) => f.startsWith('kalender-'))) for (const b of JSON.parse(fs.readFileSync(`${DIR}/${f}`, 'utf8')).bolag || []) kalRader.push(b);
for (const slug of ['sa-laser-du-vz-q3-2026', 'sa-laser-du-wihlborgs-q3-2026']) {
  const delar = slug.split('-').filter((d) => d.length >= 2 && !STOPP.has(d)).sort((a, b) => b.length - a.length);
  for (const del of delar) {
    const t = kalRader.find((b) => String(b.ticker).toLowerCase().includes(del) || String(b.namn).toLowerCase().includes(del));
    if (t) { ut.push(`${slug} → kalender: ${t.namn} — "${String(t.rapportfenster).slice(0, 120)}"`); break; }
  }
}

fs.writeFileSync('/tmp/r194-sista.txt', ut.join('\n') + '\n');
console.log('skrev /tmp/r194-sista.txt');
