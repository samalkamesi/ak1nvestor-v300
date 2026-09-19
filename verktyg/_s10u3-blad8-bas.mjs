#!/usr/bin/env node
// _s10u3-blad8-bas.mjs — födelsebevis blad 9 (s10-u3, manifest auto-s10-1789779315763)
// Steg 1 av 2: basmätning av blad 8 (db-2026-09-18) DIREKT på dumpen (zcat +
// COPY-radräkning — spårets oberoende fjärde instrument, validerad mot restore
// 2026-09-18) + förregistrerade prediktioner för blad 9 skrivna till disk FÖRE
// restore-körningen (ärlighetskonventionen: prediktionstabell före mätstart).
//
// DAGSTEGSSERIEN (public-total per bladväxling, ur worklog/DRIFTSBOKEN):
//   19 805 · 19 797 · 19 797 · 19 800 · 19 800 · 19 791  (blad 3→8)
//   komponenter senaste dygnet: snapshots +18 984 (08:00-batchen, pump-noll)
//   · board_decisions +768 (kvartsklockan 8/kvart) · övriga +39.
import { spawn } from 'node:child_process';
import { createInterface } from 'node:readline';
import { writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const DUMP_BLAD8 = path.join(ROT, 'data/backups/supabase/db-2026-09-18.sql.gz');
const UT_JSON = path.join(ROT, 'data/forskning/DR-PREDIKTION-2026-09-19-NATT-BLAD9.json');

function raknaDump(fil) {
  return new Promise((resolve, reject) => {
    const barn = spawn('zcat', [fil]);
    const rl = createInterface({ input: barn.stdout, crlfDelay: Infinity });
    const perTabell = new Map();
    let aktiv = null;
    rl.on('line', (rad) => {
      if (aktiv !== null) {
        if (rad === '\\.') { aktiv = null; return; }
        perTabell.set(aktiv, (perTabell.get(aktiv) || 0) + 1);
        return;
      }
      const m = /^COPY ([^\s(]+)\s*\(/.exec(rad);
      if (m) aktiv = m[1];
    });
    rl.on('close', () => resolve(perTabell));
    barn.stderr.on('data', () => {});
    barn.on('error', reject);
    barn.on('close', (kod) => { if (kod !== 0) reject(new Error(`zcat exit ${kod}`)); });
  });
}

const t0 = Date.now();
const perTabell = await raknaDump(DUMP_BLAD8);
const publicTabeller = [...perTabell.keys()].filter((n) => n.startsWith('public.'));
const publicTotal = publicTabeller.reduce((s, n) => s + perTabell.get(n), 0);
// Notera: protokollens "snapshots" = tabellen public.section_data_snapshots
// (förkortning); kartan ovan registrerar ENBART tabeller med ≥1 datarad —
// tomma tabeller får ingen nyckel (därav lägre tabellantal än restore-
// instrumentets 60, som räknar hela schemat).
const nycklar = {};
for (const n of ['public.section_data_snapshots', 'public.board_decisions', 'public.organ_health_logs']) {
  nycklar[n] = perTabell.get(n) ?? -1;
}

// Prediktioner (förregistrerade, skrivs till disk FÖRE dr-ovning.mjs körs)
const prediktion = {
  skapad: new Date().toISOString(),
  uppgift: 'Födelsebevis blad 9 — restore db-2026-09-19.sql.gz i födelsetimmen',
  bas: {
    kalla: 'db-2026-09-18.sql.gz (blad 8) — zcat + COPY-radräkning ( detta skript)',
    publicTabeller: publicTabeller.length,
    publicTotal,
    ...nycklar,
  },
  dagstegserie: [19805, 19797, 19797, 19800, 19800, 19791],
  prediktioner: {
    'publicTotal blad 9': publicTotal + 19791,
    'publicTotal tolerans': 25,
    'section_data_snapshots blad 9': nycklar['public.section_data_snapshots'] + 18984,
    'section_data_snapshots tolerans': 0,
    'board_decisions blad 9': nycklar['public.board_decisions'] + 768,
    'board_decisions tolerans': 0,
    'RTO s (spann)': [10, 18],
    'fel kända/okända': '788/0',
    'tabeller public/+storage/alla': '60/68/99',
  },
};
writeFileSync(UT_JSON, JSON.stringify(prediktion, null, 2) + '\n');

console.log(`BLAD 8 BAS (zcat, ${(Date.now() - t0) / 1000 | 0} s):`);
console.log(`  public-tabeller: ${publicTabeller.length} · public-total: ${publicTotal}`);
for (const [k, v] of Object.entries(nycklar)) console.log(`  ${k}: ${v}`);
console.log('PREDIKTIONER blad 9 (låsta på disk):');
console.log(JSON.stringify(prediktion.prediktioner, null, 2));
console.log(`JSON: ${UT_JSON}`);
