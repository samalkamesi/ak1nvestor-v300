#!/usr/bin/env node
// dr-rpo-diff.mjs — RPO-diff: dumpens per-tabellvärde vs LEVANDE prod (spår 10, s10-u2, 2026-09-17)
//
// Mäter spårets enda levande RPO-exponering: hur många rader finns i prod
// just nu SOM INTE FINNS i senaste dumpbladet (dvs det som förloras om
// prod dör innan nästa 02:30-dump). Två instrument, samma tabellnamn:
//   A) dumpen:  strömmande COPY-blocksräkning per tabell (zcat, aldrig i minnet)
//   B) levande: psql COUNT(*) per public-tabell via PGPASSFILE i EN fråga
//               (UNION ALL) — läsandåtgärd, tabellägaren postgres bypassar RLS
//               (doktrinerat i DR-KVARTAL-2026-09-16-FYRAKEDJOR.md).
//
// Lägen:
//   (inget arg)     senaste db-*.sql.gz i data/backups/supabase
//   --fil <väg>     given dumpfil
//   --json <väg>    skriv hela diff-tabellen som JSON (maskinellt delprotokoll)
//
// Kontrakt:
//   - PGPASSFILE pekas ut av anroparen (aldrig hårdkodad väg i verktyget,
//     lösenordet läses ALDRIG in i processen — psql äger hanteringen).
//   - Tabellnamn normaliseras till schemalös form (dump: "public.x" → "x")
//     eftersom live-frågan är fast mot public.
//   - Tabeller som ENDAST finns på ena sidan redovisas separat (schema-
//     drift är ett fynd, inte ett diffvärde).
//   - GDPR: endast antal och tabellnamn — inga personvärden rörs.
//
// Exit-kod: 0 = mätning komplett (diffvärdena är fakta, inte domar);
//           1 = tekniskt fel (psql/dump oåtkomlig).

import { spawn, spawnSync } from 'node:child_process';
import {
  readdirSync, statSync, writeFileSync,
} from 'node:fs';
import { createInterface } from 'node:readline';
import { dirname as pathDirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const REPO_ROT = path.resolve(pathDirname(fileURLToPath(import.meta.url)), '..');
const DUMP_KATALOG = path.join(REPO_ROT, 'data', 'backups', 'supabase');
const PSQL = '/usr/lib/postgresql/17/bin/psql';
const PG_TARGET = 'host=db.rkaqmulgoubvewwnwxrw.supabase.co port=5432 dbname=postgres user=postgres sslmode=require';

const args = process.argv.slice(2);
let dumpArg = null;
let jsonArg = null;
for (let i = 0; i < args.length; i++) {
  if (args[i] === '--fil') dumpArg = args[++i];
  else if (args[i] === '--json') jsonArg = args[++i];
}

function senasteDump() {
  const filer = readdirSync(DUMP_KATALOG)
    .filter((f) => /^db-\d{4}-\d{2}-\d{2}\.sql\.gz$/.test(f))
    .sort();
  if (filer.length === 0) throw new Error(`Inga db-*.sql.gz i ${DUMP_KATALOG}`);
  return path.join(DUMP_KATALOG, filer[filer.length - 1]);
}

const dumpVag = dumpArg ? path.resolve(dumpArg) : senasteDump();
const dumpStorlek = statSync(dumpVag).size;
const dumpNamn = path.basename(dumpVag);

// --- A) dumpens per-tabell COPY-räkning (strömmande) -----------------------
async function raknaDump() {
  const zcat = spawn('zcat', [dumpVag], { stdio: ['ignore', 'pipe', 'pipe'] });
  const rader = createInterface({ input: zcat.stdout });
  const perTabell = new Map();
  let aktiv = null;
  let ignorerarBlock = false;
  let n = 0;
  for await (const rad of rader) {
    if (ignorerarBlock) {
      if (rad === '\\.') ignorerarBlock = false; // konsumera hela blocket — datarader får likna COPY
    } else if (aktiv === null) {
      if (rad.startsWith('COPY ')) {
        // "COPY schema.tabell (kolumner) FROM stdin;" — ENDAST public-
        // blocken räknas: live-frågan och restore-kontraktet (60 tabeller)
        // är fast mot public; auth/storage-blocken är Supabase-plattform.
        const mal = rad.slice(5).trim().split(' ')[0];
        if (mal.startsWith('public.')) {
          aktiv = mal.replace(/^public\./, '');
          n = 0;
        } else {
          ignorerarBlock = true;
        }
      }
    } else if (rad === '\\.') {
      perTabell.set(aktiv, n);
      aktiv = null;
    } else {
      n++;
    }
  }
  const felText = await new Promise((ores) => { let ut = ''; zcat.stderr.on('data', (d) => { ut += d; }); zcat.on('close', (kod) => ores(`exit ${kod}${ut ? `: ${ut.slice(0, 200)}` : ''}`)); });
  if (aktiv !== null) throw new Error(`Dumpen oavslutad mitt i COPY-block för ${aktiv} — slutmarkör saknas`);
  if (zcat.exitCode !== 0) throw new Error(`zcat misslyckades (${felText})`);
  return perTabell;
}

// --- B) levande prod: COUNT(*) per public-tabell i EN fråga ----------------
function raknaLive(tabellNamn) {
  if (tabellNamn.length === 0) return new Map();
  const union = tabellNamn
    .map((t) => `SELECT '${t.replace(/'/g, "''")}' AS t, count(*)::bigint AS n FROM public."${t.replace(/"/g, '""')}"`)
    .join(' UNION ALL ');
  const psql = spawnSync(PSQL, [PG_TARGET, '-At', '-F', '\t', '-c', union], {
    env: { ...process.env },
    timeout: 240000,
  });
  if (psql.status !== 0) {
    throw new Error(`psql live-count misslyckades (exit ${psql.status}): ${psql.stderr.toString().slice(0, 400)}`);
  }
  const live = new Map();
  for (const rad of psql.stdout.toString('utf8').trim().split('\n')) {
    if (!rad) continue;
    const [t, n] = rad.split('\t');
    live.set(t, Number(n));
  }
  return live;
}

try {
  if (!process.env.PGPASSFILE) {
    console.error('FEL: PGPASSFILE måste sättas av anroparen (pointer till .pgpass — verktyget läser aldrig lösenordet).');
    process.exit(1);
  }
  console.log(`RPO-DIFF ${new Date().toISOString()} — blad: ${dumpNamn} (${(dumpStorlek / 1024 / 1024).toFixed(1)} MB gz)`);

  console.log('[1/3] Dumpens COPY-räkning per tabell …');
  const dump = await raknaDump();
  const dumpTotal = [...dump.values()].reduce((a, b) => a + b, 0);
  console.log(`      ${dump.size} public-tabeller · ${dumpTotal.toLocaleString('sv-SE')} COPY-rader`);

  console.log('[2/3] Levande prod: COUNT(*) per tabell (psql, EN UNION ALL-fråga) …');
  const live = raknaLive([...dump.keys()].sort());
  const liveTotal = [...live.values()].reduce((a, b) => a + b, 0);
  console.log(`      ${live.size} tabeller svarade · ${liveTotal.toLocaleString('sv-SE')} rader levande`);

  console.log('[3/3] Diff per tabell …');
  const endastDump = [...dump.keys()].filter((t) => !live.has(t)).sort();
  const endastLive = [...live.keys()].filter((t) => !dump.has(t)).sort();
  const diff = [...dump.keys()]
    .filter((t) => live.has(t))
    .map((t) => ({ tabell: t, dump: dump.get(t), live: live.get(t), delta: live.get(t) - dump.get(t) }))
    .sort((a, b) => Math.abs(b.delta) - Math.abs(a.delta));
  const deltaTotal = diff.reduce((a, d) => a + d.delta, 0);
  const medRorelse = diff.filter((d) => d.delta !== 0);

  console.log('\n== RPO-SAMMANFATTNING ==');
  console.log(`Bladets total:   ${dumpTotal.toLocaleString('sv-SE')} rader (dumpens COPY)`);
  console.log(`Levande total:   ${liveTotal.toLocaleString('sv-SE')} rader (psql COUNT)`);
  console.log(`RPO-delta:       ${deltaTotal >= 0 ? '+' : ''}${deltaTotal.toLocaleString('sv-SE')} rader oskyddade sedan bladets 02:30`);
  console.log(`Tabeller i rörelse: ${medRorelse.length} av ${diff.length} (|delta| > 0)`);

  console.log('\n== Topp 15 |delta| ==');
  for (const d of diff.slice(0, 15)) {
    console.log(`${d.delta >= 0 ? '+' : ''}${String(d.delta).padStart(8)}  ${d.tabell}  (dump ${d.dump.toLocaleString('sv-SE')} → live ${d.live.toLocaleString('sv-SE')})`);
  }
  if (endastDump.length) console.log(`\nENDAST I DUMPEN (${endastDump.length}): ${endastDump.join(', ')}`);
  if (endastLive.length) console.log(`\nENDAST LEVANDE (${endastLive.length}): ${endastLive.join(', ')}`);

  if (jsonArg) {
    writeFileSync(jsonArg, JSON.stringify({
      verktyg: 'dr-rpo-diff.mjs', ts: new Date().toISOString(), blad: dumpNamn,
      dumpTotal, liveTotal, deltaTotal, diff, endastDump, endastLive,
    }, null, 2));
    console.log(`\nJSON-delprotokoll: ${jsonArg}`);
  }
  process.exit(0);
} catch (fel) {
  console.error(`FEL: ${fel.message}`);
  process.exit(1);
}
