#!/usr/bin/env node
// dr-fonsterdjup.mjs — FÖNSTERDJUPET: äldsta bladet restore-bevisat (spår 10, s10-u1 O6, 2026-09-16)
//
// Scenariot ingen kedja täcker: katastrofen upptäcks SENT. Retentionen är
// 30 dagar och samtliga kedja 1-RTO-punkter (20,0 · 17,7 · 14,7 · 20,0 ·
// 23,9 · 11,2 · 12,2 · 17,3 s) mätte DAGENS eller gårdagens dump. Om prod
// dör tyst och upptäcks först på dag 29 är det FÖNSTRETS ÄLDSTA blad som
// gäller — det har ALDRIG restore-bevisats (kedja 5:s retentionssvep bevisar
// gzip-integritet på alla dumpar, men gzip-giltighet är inte restore-barhet;
// bevisat 2026-09-16 i kedja 5: ett strukturellt helt block kan bära oläslig
// data). Detta verktyg mäter och bevisar:
//   1. SJÄLVTEST: blockräknaren (per tabell COPY-rader ur dumpfilen) testas
//      mot fixtures — inklusive KEDJA 5:S LÄXA: ett trunkerat block (saknad
//      \.-terminator) SKALL vägra räkning (tyst trunkering är den farligaste
//      klassen: psql accepterade 705 881 rader med exit 0).
//   2. FÖNSTRET: äldsta + yngsta db-*.sql.gz identifieras; BÅDA slutmarkör-
//      kontrolleras (kolla-dump-markorer) innan något rörs.
//   3. BLOCKRÄKNING: per tabell COPY-radantal ur BÅDA filerna (zcat+awk,
//      indexbaserat — kedja 5:s prestandakur; ingen regex över 1,3 M rader).
//   4. RESTORE ÄLDSTA: zcat | psql i färsk skrap-DB med RTO-mätning och
//      dr-ovning.mjs:s felkategorisering (kända Supabase-roller/scheman/
//      extensions vs OKÄNDA fynd).
//   5. TVÅ INSTRUMENT: PG:s count(*) per public-tabell SKALL == dumpens
//      blockräkning (u3:s princip: två instrument, samma tal).
//   6. TILLVÄXTDIFF: äldsta→yngsta per tabell (Δrader, top-tilväxtare, nya/
//      borta tabeller, Δ/dag) — kapacitetsbilden dumparna annars döljer.
//
// Lägen/flaggor:
//   (inget arg)        fönstret = äldsta + yngsta i data/backups/supabase
//   --alder <väg>      override äldsta filen
//   --ny <väg>         override yngsta filen
//   --behall           städa EJ (skrap-DB + PG17 för manuell granskning)
//
// Lås/grind/exit = familjekontraktet (dr-ovning.mjs): flock på
// /tmp/ak1a-dr-prov.lock, låsvägran (3), RAM-/diskgrind (75). Prod RÖRS
// ALDRIG — hela övningen sker i lokal PG17-skrap-DB + läsning av dumpfiler.

import { spawnSync } from 'node:child_process';
import {
  existsSync, openSync, closeSync, readFileSync, writeFileSync, unlinkSync,
  readdirSync, statSync, rmSync,
} from 'node:fs';
import { dirname as pathDirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const REPO_ROT = path.resolve(pathDirname(fileURLToPath(import.meta.url)), '..');
const DUMP_KATALOG = path.join(REPO_ROT, 'data', 'backups', 'supabase');
const LAS_VAG = '/tmp/ak1a-dr-prov.lock';
const SKRAP_DB = 'ak1a_dr_fonster';
const PG_KLUSTER = ['17', 'main'];
const LAS_MAX_ALDER_MS = 30 * 60 * 1000; // dött lås (död agent) tas över efter 30 min

function lasArgument() {
  const args = process.argv.slice(2);
  const opts = { alder: null, ny: null, behall: false };
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--alder') opts.alder = args[++i];
    else if (args[i] === '--ny') opts.ny = args[++i];
    else if (args[i] === '--behall') opts.behall = true;
    else if (args[i] === '--hjalp' || args[i] === '--help') {
      console.log('Användning: node verktyg/dr-fonsterdjup.mjs [--alder <gammal.sql.gz>] [--ny <ny.sql.gz>] [--behall]');
      process.exit(0);
    } else {
      console.error(`Okänt argument: ${args[i]} (se --hjalp)`);
      process.exit(2);
    }
  }
  return opts;
}

// --- Lås (familjekontraktet, ordagrant arv från dr-kedja5.mjs) -----------------

function taLas() {
  if (process.env.AK1A_DR_FLOCK === '1') {
    const fdFlock = openSync(LAS_VAG, 'w');
    writeFileSync(fdFlock, `pid=${process.pid} start=${new Date().toISOString()} verktyg=dr-fonsterdjup.mjs flock=1\n`);
    closeSync(fdFlock);
    return;
  }
  if (existsSync(LAS_VAG)) {
    const alder = Date.now() - statSync(LAS_VAG).mtimeMs;
    if (alder < LAS_MAX_ALDER_MS) {
      let innehall = '';
      try { innehall = readFileSync(LAS_VAG, 'utf8').trim(); } catch { innehall = '?'; }
      console.error(`LÅSET UPTAGET (${(alder / 60000).toFixed(1)} min gammalt): ${innehall}`);
      console.error('En annan agent äger PG17 DR-fönstret just nu — vänta och försök igen.');
      console.error('DR-ÖVNING AVBRUTEN INNAN PG17 RÖRDES (låsfilsskyddet verkade).');
      process.exit(3);
    }
    console.log(`VARNING: låsfil ${(alder / 60000).toFixed(0)} min gammal (död agent?) — tas över.`);
    unlinkSync(LAS_VAG);
  }
  const fd = openSync(LAS_VAG, 'wx');
  writeFileSync(fd, `pid=${process.pid} start=${new Date().toISOString()} verktyg=dr-fonsterdjup.mjs\n`);
  closeSync(fd);
}

function slappLas() {
  if (process.env.AK1A_DR_FLOCK === '1') return; // RÖR EJ filen i flock-läge (se dr-ovning.mjs)
  try { unlinkSync(LAS_VAG); } catch { /* redan borta */ }
}

function flockStartaOm() {
  if (process.env.AK1A_DR_FLOCK === '1') return;
  const skriptVag = fileURLToPath(import.meta.url);
  const r = spawnSync('flock', ['-w', '900', LAS_VAG, process.execPath, skriptVag, ...process.argv.slice(2)], {
    stdio: 'inherit',
    env: { ...process.env, AK1A_DR_FLOCK: '1' },
    timeout: 960000,
  });
  if (r.error) {
    console.error(`FLOCK-KRITISKT: kunde inte starta om under flock (${r.error.message}) — övningen vägras utan lås.`);
    process.exit(1);
  }
  process.exit(r.status ?? 1);
}

// --- Grind: ram + disk FÖRE allt tungt (familjekontraktet) -----------------------

function grind() {
  const mem = /MemAvailable:\s+(\d+) kB/.exec(readFileSync('/proc/meminfo', 'utf8'));
  const mb = mem ? Math.round(Number(mem[1]) / 1024) : 0;
  if (mb < 1000) {
    console.error(`RAMGRIND: MemAvailable ${mb} MB < 1000 MB — övningen SKIPPAS (exit 75). Kör igen när minnet frigjorts.`);
    return false;
  }
  const df = kor('df', ['-k', '/']);
  const falt = ((df.stdout || '').split('\n')[1] || '').trim().split(/\s+/);
  const gbLedigt = Number(falt[3] || 0) / 1024 / 1024;
  if (gbLedigt < 5) {
    console.error(`DISKGRIND: ${gbLedigt.toFixed(1)} GB ledigt < 5 GB — övningen SKIPPAS (exit 75).`);
    return false;
  }
  console.log(`Grind OK: MemAvailable ${mb} MB · ${gbLedigt.toFixed(0)} GB ledigt på /`);
  return true;
}

// --- Processhjälp -----------------------------------------------------------------

function kor(kommando, args, opts = {}) {
  const r = spawnSync(kommando, args, {
    encoding: 'utf8',
    timeout: opts.timeoutMs ?? 120000,
    maxBuffer: 64 * 1024 * 1024,
  });
  return { ok: r.status === 0, status: r.status, stdout: (r.stdout || '').trim(), stderr: (r.stderr || '').trim() };
}

function sudo(args, opts = {}) { return kor('sudo', ['-n', ...args], opts); }

function sql(fraga, opts = {}) {
  const r = sudo(['-u', 'postgres', 'psql', '-d', SKRAP_DB, '-X', '-q', '-A', '-t', '-c', fraga], opts);
  if (!r.ok) throw new Error(`psql misslyckades: ${r.stderr || r.stdout || 'okänt fel'}`);
  return r.stdout;
}

function tidMs(t0) { return Number(process.hrtime.bigint() - t0) / 1e6; }

// --- Blockräknaren: per tabell COPY-rader ur en dumpfil (indexbaserad awk) -------

// Kontrakt: varje COPY-block inleds "COPY <schematabell> (" och avslutas med
// exakt "\.". Ett block UTAN terminator = trunkerad dump → vägran (kedja 5:s
// läxa: tyst trunkering är farligare än oläslig data).
function raknaBlock(fil) {
  const awk = [
    'BEGIN { inCopy=0 }',
    '{',
    '  if (inCopy==0) {',
    '    if (substr($0,1,5)=="COPY ") {',
    '      p=index($0," (");',
    '      if (p>6) { tabell=substr($0,6,p-6); n=0; inCopy=1 }',
    '    }',
    '  } else {',
    '    if ($0=="\\\\.") { rader[tabell]=n; inCopy=0 }',
    '    else n++',
    '  }',
    '}',
    'END {',
    '  if (inCopy==1) { print "TRUNKERAT\t" tabell; exit 9 }',
    '  for (t in rader) print t "\t" rader[t]',
    '}',
  ].join('\n');
  const r = kor('bash', ['-c', `zcat ${JSON.stringify(fil)} | awk '${awk.replace(/'/g, `'\\''`)}'`], { timeoutMs: 300000 });
  if (r.status === 9) throw new Error(`dumpen bär ett TRUNKERAT COPY-block (block utan \\.-terminator) — räkning vägras`);
  if (!r.ok) throw new Error(`blockräkning misslyckades: ${r.stderr}`);
  const mapa = new Map();
  for (const rad of r.stdout.split('\n').filter(Boolean)) {
    const i = rad.indexOf('\t');
    mapa.set(rad.slice(0, i), Number(rad.slice(i + 1)));
  }
  return mapa;
}

// --- Självtest: räknaren + trunkeringsvägran (fixtures i tmp) ---------------------

function sjalvtest() {
  console.log('[1/8] Självtest mot fixtures (skapas i tmp, gzip-komprimerade som riktiga) …');
  const dir = `/tmp/dr-fonsterdjup-test-${process.pid}`;
  rmSync(dir, { recursive: true, force: true });
  const frisk = [
    'COPY public.a (x) FROM stdin;',
    'r1', 'r2', 'r3', '\\.',
    'COPY public.b (x) FROM stdin;',
    '\\.',
    'COPY storage.s (y) FROM stdin;',
    's1', 's2', '\\.',
    '-- PostgreSQL database dump complete', '',
  ].join('\n');
  const trunkerad = [
    'COPY public.a (x) FROM stdin;',
    'r1', 'r2', '\\.',
    'COPY public.c (z) FROM stdin;',
    'c1', 'c2', 'c3', '',
  ].join('\n');
  // Fixtures skrivs RÅA (riktiga nyrader — JSON.stringify:n:s \n-sekvenser
  // gjorde engångsbuggen 2026-09-16: fixturen blev EN rad och dömdes trunkerad)
  // och gzip:as via omdirigering (binär stdout överlever ej kor():s utf8-avkodning).
  kor('mkdir', ['-p', dir]);
  const gzip = (namn, text) => {
    const rå = path.join(dir, namn.replace(/\.gz$/, ''));
    writeFileSync(rå, text);
    const g = kor('bash', ['-c', `gzip -c ${JSON.stringify(rå)} > ${JSON.stringify(path.join(dir, namn))}`]);
    if (!g.ok) throw new Error(`fixture-gzip misslyckades: ${g.stderr}`);
  };
  gzip('frisk.sql.gz', frisk);
  gzip('trunkerad.sql.gz', trunkerad);
  const fall = [];
  try {
    const m = raknaBlock(path.join(dir, 'frisk.sql.gz'));
    fall.push({ namn: 'frisk fixture: a=3 b=0 s=2', ok: m.get('public.a') === 3 && m.get('public.b') === 0 && m.get('storage.s') === 2 && m.size === 3 });
    let vangrade = false;
    try { raknaBlock(path.join(dir, 'trunkerad.sql.gz')); } catch { vangrade = true; }
    fall.push({ namn: 'sabotage: trunkerat block (kedja 5:s läxa) vägras', ok: vangrade });
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
  let pass = 0;
  for (const f of fall) { if (f.ok) pass++; console.log(`      ${f.ok ? 'PASS' : 'FAIL'} · ${f.namn}`); }
  console.log(`      Självtest: ${pass}/${fall.length} ${pass === fall.length ? 'PASS' : 'FAIL'}`);
  return pass === fall.length;
}

// --- Fönstret + dumpkontroll --------------------------------------------------------

function hittaFonster() {
  if (!existsSync(DUMP_KATALOG)) throw new Error(`Dumpkatalogen saknas: ${DUMP_KATALOG}`);
  const filer = readdirSync(DUMP_KATALOG)
    .filter((n) => /^db-\d{4}-\d{2}-\d{2}\.sql\.gz$/.test(n))
    .sort();
  if (filer.length < 2) throw new Error(`fönstret kräver minst 2 dumpar, fann ${filer.length}`);
  return { aldst: path.join(DUMP_KATALOG, filer[0]), yngst: path.join(DUMP_KATALOG, filer[filer.length - 1]), antal: filer.length, filer };
}

function forkontroll(dump) {
  const r = kor('node', [path.join(REPO_ROT, 'verktyg', 'kolla-dump-markorer.mjs'), '--fil', dump], { timeoutMs: 120000 });
  return { gron: r.status === 0, utdata: r.stdout };
}

// --- PG17 + restore (dr-ovning.mjs:s kontrakt) ---------------------------------------

function pgUpp() {
  return sudo(['-u', 'postgres', 'pg_isready', '-q', '-p', '5432']).ok;
}

function startaPg17(dom) {
  dom.pgStartadesAvOss = !pgUpp();
  if (dom.pgStartadesAvOss) {
    const r = sudo(['pg_ctlcluster', ...PG_KLUSTER, 'start']);
    if (!r.ok && !pgUpp()) throw new Error(`pg_ctlcluster start misslyckades: ${r.stderr}`);
    console.log('      PG17 online (var stoppad — korrekt viloläge).');
  } else {
    console.log('      VARNING: PG17 var REDAN uppe vid ankomst (oväntat med låsfil — protokollförs).');
  }
}

function skapaSkrapDb() {
  const drop = sudo(['-u', 'postgres', 'dropdb', '--if-exists', SKRAP_DB]);
  if (!drop.ok) throw new Error(`dropdb misslyckades: ${drop.stderr}`);
  const skapa = sudo(['-u', 'postgres', 'createdb', SKRAP_DB]);
  if (!skapa.ok) throw new Error(`createdb misslyckades: ${skapa.stderr}`);
}

function kategoriseraFel(felrader) {
  const kanda = { roller: {}, scheman: {}, extensions: {}, ovrigtKant: 0, fortsattning: 0 };
  const okanda = [];
  const fortsattningsRad = /^(HINT|DETAIL|LINE|CONTEXT|WARNING|NOTICE)\b|^\s+\^/;
  for (const rad of felrader) {
    if (fortsattningsRad.test(rad)) { kanda.fortsattning += 1; continue; }
    const mRole = rad.match(/role "([^"]+)" does not exist/);
    if (mRole) { kanda.roller[mRole[1]] = (kanda.roller[mRole[1]] || 0) + 1; continue; }
    const mSchema = rad.match(/schema "([^"]+)" does not exist/);
    if (mSchema) { kanda.scheman[mSchema[1]] = (kanda.scheman[mSchema[1]] || 0) + 1; continue; }
    const mExt = rad.match(/extension "([^"]+)"/);
    if (mExt) { kanda.extensions[mExt[1]] = (kanda.extensions[mExt[1]] || 0) + 1; continue; }
    if (/does not exist|must be owner|already exists/i.test(rad)) { kanda.ovrigtKant += 1; continue; }
    if (rad.trim() !== '') okanda.push(rad);
  }
  return { kanda, okanda };
}

function aterstall(dump, dom) {
  console.log(`[5/8] ÅTERSTÄLLER ÄLDSTA bladet (${path.basename(dump)}) i ${SKRAP_DB} — RTO-mätning …`);
  const felFil = `/tmp/dr-fonsterdjup-fel-${dom.datumIso}.log`;
  const t0 = process.hrtime.bigint();
  const r = spawnSync('bash', ['-c',
    `zcat '${dump.replace(/'/g, "'\\''")}' | sudo -n -u postgres psql -d ${SKRAP_DB} -X -q 2>'${felFil}'`],
  { encoding: 'utf8', timeout: 600000, maxBuffer: 64 * 1024 * 1024 });
  const ms = tidMs(t0);
  dom.restore = { sek: ms / 1000, exit: r.status, felFil };
  let felrader = [];
  try { felrader = readFileSync(felFil, 'utf8').split('\n').filter(Boolean); } catch { felrader = []; }
  dom.restore.fel = kategoriseraFel(felrader);
  const antalFel = felrader.length;
  console.log(`      restore exit ${r.status} · ${dom.restore.sek.toFixed(1)} s · felrader ${antalFel} (okända ${dom.restore.fel.okanda.length})`);
}

// --- PG-verifiering: två instrument (dumpblock == PG count) --------------------------

function raknaPg(dom, blockAldst) {
  const tabeller = [...blockAldst.keys()].filter((t) => t.startsWith('public.')).sort();
  if (tabeller.length === 0) throw new Error('ingen public.tabell i äldsta dumpens blockräkning');
  const union = tabeller.map((t) => `SELECT '${t.replace(/'/g, "''")}' AS t, count(*) AS n FROM "${t.split('.')[0]}"."${t.split('.')[1]}"`).join(' UNION ALL ');
  const svar = sql(union, { timeoutMs: 300000 });
  const pg = new Map();
  for (const rad of svar.split('\n').filter(Boolean)) {
    const i = rad.indexOf('|');
    pg.set(rad.slice(0, i), Number(rad.slice(i + 1)));
  }
  dom.pg = {
    publicTabeller: tabeller.length,
    perTabell: pg,
    avvikande: tabeller.filter((t) => pg.get(t) !== blockAldst.get(t)).map((t) => ({ tabell: t, dump: blockAldst.get(t), pg: pg.get(t) })),
  };
  const summaPg = [...pg.values()].reduce((a, b) => a + b, 0);
  const summaDump = tabeller.reduce((a, t) => a + blockAldst.get(t), 0);
  dom.pg.summaPgPublic = summaPg;
  dom.pg.summaDumpPublic = summaDump;
  console.log(`      public ${tabeller.length} tabeller · PG-summa ${summaPg.toLocaleString('sv-SE')} · dump-summa ${summaDump.toLocaleString('sv-SE')} · avvikande ${dom.pg.avvikande.length}`);
}

// --- Tillväxtdiff äldsta→yngsta --------------------------------------------------------

function diffa(dom, blockAldst, blockYngst) {
  const namn = new Set([...blockAldst.keys(), ...blockYngst.keys()]);
  const rader = [];
  for (const t of namn) {
    const a = blockAldst.get(t) ?? null;
    const y = blockYngst.get(t) ?? null;
    rader.push({ tabell: t, aldst: a, yngst: y, delta: (y ?? 0) - (a ?? 0), ny: a === null, borta: y === null });
  }
  rader.sort((x, y) => Math.abs(y.delta) - Math.abs(x.delta));
  dom.diff = {
    rader,
    totalAldst: [...blockAldst.values()].reduce((a, b) => a + b, 0),
    totalYngst: [...blockYngst.values()].reduce((a, b) => a + b, 0),
    nya: rader.filter((r) => r.ny).map((r) => r.tabell),
    borta: rader.filter((r) => r.borta).map((r) => r.tabell),
    minskande: rader.filter((r) => !r.ny && !r.borta && r.delta < 0),
  };
}

// --- Städning (familjekontraktet) -------------------------------------------------------

function stada(dom) {
  console.log('[8/8] Städning: skrap-DB + PG17 + tmp …');
  dom.stadning = { skrapDbBort: false, pgStoppad: false, tmpRaderade: true, meddelande: '' };
  try { if (dom.restore?.felFil) unlinkSync(dom.restore.felFil); } catch { /* borta */ }
  const drop = sudo(['-u', 'postgres', 'dropdb', '--if-exists', SKRAP_DB]);
  dom.stadning.skrapDbBort = drop.ok;
  if (!drop.ok) dom.stadning.meddelande += `dropdb misslyckades: ${drop.stderr} `;
  if (dom.behall) {
    dom.stadning.meddelande += '--behall: PG17 lämnas för manuell granskning (viloläget brutet).';
    console.log('      --behall: lämnar PG17 uppe (städa manuellt).');
  } else {
    const stop = sudo(['pg_ctlcluster', ...PG_KLUSTER, 'stop']);
    dom.stadning.pgStoppad = stop.ok || !pgUpp();
    if (!dom.stadning.pgStoppad) dom.stadning.meddelande += `pg_ctlcluster stop misslyckades: ${stop.stderr} `;
  }
  console.log(`      skrap-DB ${dom.stadning.skrapDbBort ? 'raderad' : 'EJ raderad'} · PG17 ${dom.stadning.pgStoppad ? 'stoppad' : dom.behall ? 'lämnad (--behall)' : 'EJ stoppad'} · tmp raderade`);
}

// --- Protokoll -----------------------------------------------------------------------------

function skrivProtokoll(dom) {
  const vag = path.join(REPO_ROT, 'data', 'forskning', `DR-FONSTERDJUP-${dom.datumIso}.md`);
  const d = dom.diff || { rader: [], totalAldst: 0, totalYngst: 0, nya: [], borta: [], minskande: [] };
  const dagar = dom.fonster ? Math.max(1, Math.round((statSync(dom.fonster.yngst).mtimeMs - statSync(dom.fonster.aldst).mtimeMs) / 86400000)) : 0;
  const topp = d.rader.slice(0, 10).map((r) =>
    `| ${r.tabell} | ${r.aldst === null ? '—' : r.aldst.toLocaleString('sv-SE')} | ${r.yngst === null ? '—' : r.yngst.toLocaleString('sv-SE')} | ${r.delta >= 0 ? '+' : ''}${r.delta.toLocaleString('sv-SE')} |${r.ny ? ' NY' : ''}${r.borta ? ' BORTA' : ''}${r.delta < 0 && !r.ny && !r.borta ? ' minskar' : ''} |`).join('\n');
  const gron = (dom.avbrots ? false
    : dom.sjalvtestOk
      && dom.gronAldst && dom.gronYngst
      && dom.restore && dom.restore.exit === 0
      && dom.restore.fel.okanda.length === 0
      && dom.pg && dom.pg.avvikande.length === 0
      && dom.pg.summaPgPublic === dom.pg.summaDumpPublic);
  const text = `# DR-FONSTERDJUP ${dom.datumIso} — äldsta bladet restore-bevisat (AUTO)

Körd av \`verktyg/dr-fonsterdjup.mjs\` (spår 10, s10-u1 O6). Kedja 1:s RTO-serie
(20,0 · 17,7 · 14,7 · 20,0 · 23,9 · 11,2 · 12,2 · 17,3 s) mäter DAGENS dumpar —
detta protokoll bevisar FÖNSTRETS ÄLDSTA blad: katastrofen som upptäcks först på
dag 29 återställs ur precis den filen. Kedja 5:s retentionssvep bevisar
gzip-integritet; detta bevisar RESTORE-BARHETEN (gzip-giltighet ≠ läsbart innehåll
— kedja 5 bevisade att ett heligt block kan bära oläslig data).

Fönster: ${dom.fonster ? `${path.basename(dom.fonster.aldst)} → ${path.basename(dom.fonster.yngst)} (${dom.fonster.antal} dumpar på disk, ${dagar} dagars spänn)` : 'nåddes ej'} · Skrap-DB: ${SKRAP_DB}${dom.behall ? ' · --behall' : ''}

## 1. Moment

| Moment | Resultat |
|---|---|
| Självtest (frisk fixture + trunkerat block vägras — kedja 5:s läxa) | ${dom.sjalvtestOk ? '2/2 PASS' : 'FAIL'} |
| Slutmarkörskontroll ÄLDSTA (kolla-dump-markorer) | ${dom.gronAldst ? 'GRÖN' : 'RÖD'} |
| Slutmarkörskontroll YNGSTA (kolla-dump-markorer) | ${dom.gronYngst ? 'GRÖN' : 'RÖD'} |
| Blockräkning äldsta (per tabell COPY-rader, zcat+awk) | ${dom.blockAldst ? `${dom.blockAldst.size} tabeller · ${d.totalAldst.toLocaleString('sv-SE')} rader` : 'nåddes ej'} |
| Blockräkning yngsta | ${dom.blockYngst ? `${dom.blockYngst.size} tabeller · ${d.totalYngst.toLocaleString('sv-SE')} rader` : 'nåddes ej'} |
| **Restore ÄLDSTA (zcat \| psql, RTO)** | ${dom.restore ? `**${dom.restore.sek.toFixed(1)} s** · exit ${dom.restore.exit}` : 'nåddes ej'} |
| Restore-fel (kategoriserade, dr-ovning-kontraktet) | ${dom.restore ? `${Object.values(dom.restore.fel.kanda.roller).reduce((a, b) => a + b, 0)} roller · ${Object.values(dom.restore.fel.kanda.scheman).reduce((a, b) => a + b, 0)} scheman · övrigt kända ${dom.restore.fel.kanda.ovrigtKant} · **okända ${dom.restore.fel.okanda.length}**` : 'nåddes ej'} |
| TVÅ INSTRUMENT: PG count == dumpblock per public-tabell | ${dom.pg ? `${dom.pg.publicTabeller} tabeller · ${dom.pg.avvikande.length === 0 ? 'ALLA IDENTISKA — GRÖN' : dom.pg.avvikande.length + ' AVVIKANDE — RÖT'}` : 'nåddes ej'} |
| PG-summa == dump-summa (public) | ${dom.pg ? `${dom.pg.summaPgPublic.toLocaleString('sv-SE')} == ${dom.pg.summaDumpPublic.toLocaleString('sv-SE')} ${dom.pg.summaPgPublic === dom.pg.summaDumpPublic ? 'GRÖN' : 'RÖD'}` : 'nåddes ej'} |
| Städning | skrap-DB ${dom.stadning?.skrapDbBort ? 'raderad' : 'EJ raderad'} · PG17 ${dom.stadning?.pgStoppad ? 'stoppad' : dom.behall ? 'lämnad' : 'EJ stoppad'} · tmp raderade${dom.stadning?.meddelande ? ' · ' + dom.stadning.meddelande.trim() : ''} |

## 2. Tillväxtdiff äldsta → yngsta (per tabell, top-10 |Δ|)

| Tabell | Äldsta | Yngsta | Δ | Not |
|---|---|---|---|---|
${topp || '(nåddes ej)'}

Totalt: ${d.totalAldst.toLocaleString('sv-SE')} → ${d.totalYngst.toLocaleString('sv-SE')} rader (${d.totalYngst - d.totalAldst >= 0 ? '+' : ''}${(d.totalYngst - d.totalAldst).toLocaleString('sv-SE')} på ${dagar} dagar ≈ ${Math.round((d.totalYngst - d.totalAldst) / dagar).toLocaleString('sv-SE')}/dag över ALLA scheman).
Nya tabeller: ${d.nya.length ? d.nya.join(', ') : 'inga'} · Borta: ${d.borta.length ? d.borta.join(', ') : 'inga'} · Minskande: ${d.minskande.length ? d.minskande.map((m) => `${m.tabell} (${m.delta})`).join(', ') : 'inga'}.

## 3. Tolkning (runbook-kunskap)

- ÄLDSTA bladet är restore-barbart med samma kontrakt som färska (okända fel
  0, två instrument identiska) ⇒ retentionens DJUP är bevisat, inte bara dess
  yta. Vid sen upptäckt: använd äldsta FUNGERANDE bladet i fönstret.
- Tillväxtdriften (§2) är kapacitetsbilden: dumpfilerna växer ${(dom.fonster ? ((statSync(dom.fonster.yngst).size - statSync(dom.fonster.aldst).size) / 1048576 / dagar).toFixed(2) : '?')} MiB/dag (uppmätt på fönstrets filer) och radtillväxten koncentreras till top-raderna ovan —
  planera utrymme efter TILLVÄXTARNA, inte snittet.
- Minskande tabeller = gallringsytor (händelseloggar etc.) — vid restore av
  ÄLDSTA bladet FÖRLORAS det som gallrats sedan: rader som finns i äldsta men
  ej i yngsta är ${d.rader.filter((r) => !r.ny && !r.borta && r.delta < 0).reduce((a, r) => a - r.delta, 0).toLocaleString('sv-SE')} stycken — kunskapen finns bara i gamla blad.

## 4. Dom

**${gron ? `GRÖN — fönstrets äldsta blad restore-bevisat: ${dom.restore ? dom.restore.sek.toFixed(1) : '?'} s, okända fel 0, två instrument identiska` : 'RÖT — se momenttabellen'}**

${dom.avbrots ? `Avbrottsorsak: ${dom.avbrots}` : 'Avbrottsorsak: ingen'}

SLUT — maskinellt genererat av dr-fonsterdjup.mjs ${new Date().toISOString()}
`;
  writeFileSync(vag, text);
  dom.protokollVag = path.relative(REPO_ROT, vag);
  console.log(`      ${dom.protokollVag}`);
  return gron;
}

// --- Huvudflöde -----------------------------------------------------------------------------

function main() {
  const opts = lasArgument();
  flockStartaOm();
  taLas();
  if (!grind()) { slappLas(); process.exit(75); }
  const dom = {
    datumIso: new Date().toISOString().slice(0, 10),
    behall: opts.behall,
    pgStartadesAvOss: false,
    sjalvtestOk: false,
    stadning: { skrapDbBort: false, pgStoppad: false, tmpRaderade: true, meddelande: '' },
  };
  let gron = false;
  try {
    dom.fonster = hittaFonster();
    if (opts.alder) dom.fonster.aldst = path.resolve(opts.alder);
    if (opts.ny) dom.fonster.yngst = path.resolve(opts.ny);
    console.log(`DR-FONSTERDJUP ${dom.datumIso} — äldsta bladet · ${path.basename(dom.fonster.aldst)} → ${path.basename(dom.fonster.yngst)}${opts.behall ? ' (--behall)' : ''}`);

    dom.sjalvtestOk = sjalvtest();
    if (!dom.sjalvtestOk) throw new Error('självtestet misslyckades — räknaren dömer inte utan giltigt kontrakt');

    console.log('[2/8] Slutmarkörkontroll BÅDA bladen …');
    const kA = forkontroll(dom.fonster.aldst);
    dom.gronAldst = kA.gron;
    console.log(`      äldsta: ${kA.gron ? 'GRÖN' : 'RÖD'}`);
    const kY = forkontroll(dom.fonster.yngst);
    dom.gronYngst = kY.gron;
    console.log(`      yngsta: ${kY.gron ? 'GRÖN' : 'RÖD'}`);
    if (!dom.gronAldst || !dom.gronYngst) throw new Error('en av bladen underkändes av slutmarkörskontrollen — fönstret är ingen backup');

    console.log('[4/8] Blockräkning per tabell (zcat+awk) äldsta …');
    dom.blockAldst = raknaBlock(dom.fonster.aldst);
    console.log(`      ${dom.blockAldst.size} tabeller · ${[...dom.blockAldst.values()].reduce((a, b) => a + b, 0).toLocaleString('sv-SE')} rader`);
    console.log('      … och yngsta …');
    dom.blockYngst = raknaBlock(dom.fonster.yngst);
    console.log(`      ${dom.blockYngst.size} tabeller · ${[...dom.blockYngst.values()].reduce((a, b) => a + b, 0).toLocaleString('sv-SE')} rader`);

    startaPg17(dom);
    try {
      console.log(`[4b/8] Skapar färsk skrap-DB ${SKRAP_DB} …`);
      skapaSkrapDb();
      aterstall(dom.fonster.aldst, dom);
      console.log('[6/8] PG-verifiering (två instrument) …');
      raknaPg(dom, dom.blockAldst);
      console.log('[7/8] Tillväxtdiff äldsta→yngsta …');
      diffa(dom, dom.blockAldst, dom.blockYngst);
      const top3 = (dom.diff.rader.slice(0, 3) || []).map((r) => `${r.tabell} ${r.delta >= 0 ? '+' : ''}${r.delta.toLocaleString('sv-SE')}`);
      console.log(`      top-tilväxtare: ${top3.join(' · ')}`);
    } finally {
      stada(dom);
    }
    gron = skrivProtokoll(dom);
  } catch (e) {
    console.error(`DR-ÖVNINGEN AVBRUTEN: ${e.message}`);
    dom.avbrots = e.message;
    try { stada(dom); } catch { /* städning får aldrig krascha avbrottsvägen */ }
    try { skrivProtokoll(dom); } catch (e2) { console.error(`Protokoll kunde ej skrivas: ${e2.message}`); }
  } finally {
    slappLas();
  }
  process.exit(gron ? 0 : 1);
}

main();
