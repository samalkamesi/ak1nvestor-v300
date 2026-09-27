#!/usr/bin/env node
// _r172-rapportvag-status.mjs — v172 kvartalsrapportsvågen: statusmätare (EMOTTAG-MONSTER-anpassning)
// Disk-läget är sanningen: data/blogg/*.json = PUBLICERAD · data/blogg-utkast/kvartal/2026-q3/ = VÄNTAR.
// RAPPORTBLOCK-sektionen i granskningsfilen byggs OM per körning (senaste mätningen gäller, regel 2).
// Stängdvakt (regel 3): bär filen STÄNGD vägrar verktyget skriva.
import fs from 'node:fs';

const ROT = '/home/ak1a/agent/ak1';
const GRANSK = `${ROT}/data/forskning/V172-GRANSKNING.md`;
const UTKAST_DIR = `${ROT}/data/blogg-utkast/kvartal/2026-q3`;
const BLOGG_DIR = `${ROT}/data/blogg`;

const las = (p) => fs.readFileSync(p, 'utf8');

// Publicerade (disk-läget)
const bloggSlugs = new Set(fs.readdirSync(BLOGG_DIR).filter((f) => /^sa-laser-du-.*-q3-2026\.json$/.test(f)).map((f) => f.replace('.json', '')));
// Utkast som väntar
const utkast = fs.readdirSync(UTKAST_DIR).filter((f) => /^sa-laser-du-.*\.json$/.test(f)).map((f) => f.replace('.json', ''));
// Kalendernas datum (för veckogruppering)
const kalRader = [];
for (const f of fs.readdirSync(UTKAST_DIR).filter((f) => f.startsWith('kalender-'))) {
  const k = JSON.parse(fs.readFileSync(`${UTKAST_DIR}/${f}`, 'utf8'));
  for (const b of k.bolag || []) kalRader.push(b);
}
const STOPP = new Set(['sa', 'laser', 'du', 'q3', '2026', 'a', 'b', 'ab', 'publ', 'the', 'inc']);
const datumFör = (slug) => {
  // slug-delar → kalenderträff (ticker/namn-innehåll, längsta delen först) — grupperingsheuristik,
  // exakta datum och källor lever i kalenderfilerna; ej träffad ⇒ spann/estimat-gruppen
  const delar = slug.split('-').filter((d) => d.length >= 2 && !STOPP.has(d)).sort((a, b) => b.length - a.length);
  for (const del of delar) {
    for (const b of kalRader) {
      if (String(b.ticker).toLowerCase().includes(del) || String(b.namn).toLowerCase().includes(del)) return b.rapportfenster;
    }
  }
  return null;
};
const vecka = (fenster) => {
  const m = String(fenster || '').match(/2026-(09|10|11)-(\d{2})/);
  if (!m) return 'spann/estimat';
  const d = new Date(Date.UTC(2026, Number(m[1]) - 1, Number(m[2])));
  const v = Math.ceil(((d - Date.UTC(2026, 0, 1)) / 86400000 + 3) / 7); // ISO-approx 2026-01-01 = torsdag
  return `v${v}`;
};

// Bygg blocket
const rader = [];
const publicerade = [...bloggSlugs].sort();
const vantar = utkast.filter((s) => !bloggSlugs.has(s)).sort();
const veckoGrupp = {};
for (const s of vantar) {
  const v = vecka(datumFör(s));
  (veckoGrupp[v] = veckoGrupp[v] || []).push(s);
}
rader.push(`LÄGE: ${publicerade.length} publicerade (i data/blogg/, schemalagda oktober-datum) · ${vantar.length} väntar (i data/blogg-utkast/kvartal/2026-q3/) — mätning ${new Date().toISOString().slice(0, 10)} (datumPrecision: verktyget är tidsidempotent; körningstidpunkterna lever i git-historiken)`);
rader.push('');
rader.push('### PUBLICERADE');
rader.push(publicerade.map((s) => `✓ ${s}`).join('\n'));
rader.push('');
rader.push('### VÄNTAR (grupperade efter kalenderns rapportvecka — estimat/spann i egen grupp)');
for (const v of Object.keys(veckoGrupp).sort()) rader.push(`**${v}** (${veckoGrupp[v].length}): ${veckoGrupp[v].join(' · ')}`);

const block = ['## RAPPORTBLOCK (maskinellt genererat — byggs om per körning, reglerna § 1–2)', ...rader, '', '<!-- SLUT-RAPPORTBLOCK -->'].join('\n');

// Stängdvakt + ombyggnad
if (!fs.existsSync(GRANSK)) { console.error('V172-GRANSKNING.md finns ej — skapa först via vågstarten.'); process.exit(1); }
const g = las(GRANSK);
if (g.includes('SAMMANFATTNING: STÄNGD')) { console.log('VÅG STÄNGD — granskningsfilen lämnas orörd (stängdvakten).'); process.exit(0); }
const start = g.indexOf('## RAPPORTBLOCK');
const slut = g.indexOf('<!-- SLUT-RAPPORTBLOCK -->');
if (start < 0 || slut < 0) { console.error('RAPPORTBLOCK-markörer saknas.'); process.exit(1); }
const ny = g.slice(0, start) + block + g.slice(slut + '<!-- SLUT-RAPPORTBLOCK -->'.length);
fs.writeFileSync(GRANSK, ny);
console.log(`RAPPORTBLOCK ombyggt: ${publicerade.length} publicerade · ${vantar.length} väntar (${Object.keys(veckoGrupp).length} veckogrupper). Dubbelkörning = bitidentisk (ombyggnad, aldrig append).`);
