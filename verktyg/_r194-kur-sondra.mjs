#!/usr/bin/env node
// _r194-kur-sondra.mjs — GUL-landskapet + prioritetsuppsättningen (v41–v42 + hm-b + meta)
import fs from 'node:fs';
const ROT = '/home/ak1a/agent/ak1';
const DIR = `${ROT}/data/blogg-utkast/kvartal/2026-q3`;
const ut = [];

const resultat = JSON.parse(fs.readFileSync('/tmp/r172-granskning-resultat.json', 'utf8'));

// GUL-skälsaggregat
const skäl = {};
for (const r of resultat.filter((x) => x.dom === 'GUL')) {
  for (const g of r.gul) {
    const nyckel = g.replace(/[:;].*$/, '').replace(/\d{4}-\d{2}-\d{2}/g, 'DATUM').replace(/\d+ ord/g, 'N ord').slice(0, 60);
    skäl[nyckel] = (skäl[nyckel] || 0) + 1;
  }
}
ut.push('=== GUL-SKÄLSAGGREGAT (69 GULA) ===');
ut.push(Object.entries(skäl).sort((a, b) => b[1] - a[1]).map(([k, v]) => `${v}× ${k}`).join('\n'));

// prioriteringsgrupp: v41–v42 via kalenderträff (samma heuristik)
const STOPP = new Set(['sa', 'laser', 'du', 'q3', '2026', 'a', 'b', 'ab', 'publ', 'the', 'inc']);
const kalRader = [];
for (const f of fs.readdirSync(DIR).filter((f) => f.startsWith('kalender-'))) {
  for (const b of JSON.parse(fs.readFileSync(`${DIR}/${f}`, 'utf8')).bolag || []) kalRader.push(b);
}
const förstaDatumet = (t) => {
  const iso = String(t || '').match(/2026-(09|10|11)-\d{2}/);
  if (iso) return iso[0];
  return null;
};
const veckaFör = (slug) => {
  const delar = slug.split('-').filter((d) => d.length >= 2 && !STOPP.has(d)).sort((a, b) => b.length - a.length);
  for (const del of delar) {
    const t = kalRader.find((b) => String(b.ticker).toLowerCase().includes(del) || String(b.namn).toLowerCase().includes(del));
    if (t) {
      const d = förstaDatumet(t.rapportfenster);
      if (!d) return null;
      const dt = new Date(d + 'T00:00:00Z');
      return Math.ceil(((dt - Date.UTC(2026, 0, 1)) / 86400000 + 3) / 7);
    }
  }
  return null;
};

const prio = resultat.filter((r) => r.dom === 'GUL' && [41, 42].includes(veckaFör(r.slug)));
ut.push(`\n=== PRIORITET (GUL i v41–v42): ${prio.length} st ===`);
for (const r of prio) ut.push(`${r.slug} [v${veckaFör(r.slug)}]: ${r.gul.join(' · ')}`);
const resten = resultat.filter((r) => r.dom === 'GUL' && ![41, 42].includes(veckaFör(r.slug)));
ut.push(`\nÖvriga GUL (v43+ / utan träff): ${resten.length} st`);

// hm-b + meta
ut.push('\n=== hm-b (namngiven kur) ===');
ut.push(JSON.stringify(resultat.find((r) => r.slug === 'sa-laser-du-hm-b-q3-2026'), null, 1).slice(0, 700));
ut.push('\n=== meta (enda RÖDA) ===');
ut.push(JSON.stringify(resultat.find((r) => r.slug === 'sa-laser-du-meta-q3-2026'), null, 1).slice(0, 700));

// disclaimer-ej-påvisad: vilka slugs + hur deras text slutar
const discl = resultat.filter((r) => r.gul.some((g) => g.includes('disclaimer')));
if (discl.length) {
  ut.push(`\n=== DISCLAIMER-KLASSEN: ${discl.length} st — deras avslut (sista 260 tkn) ===`);
  for (const r of discl.slice(0, 8)) {
    const p = JSON.parse(fs.readFileSync(`${DIR}/${r.slug}.json`, 'utf8'));
    ut.push(`--- ${r.slug}: …${p.body.trim().slice(-260)}`);
  }
}

fs.writeFileSync('/tmp/r194-sondra.txt', ut.join('\n') + '\n');
console.log('skrev /tmp/r194-sondra.txt');
