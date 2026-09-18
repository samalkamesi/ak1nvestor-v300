#!/usr/bin/env node
// dr-pumpvakt.mjs — PUMPSIGNATUR-VAKTEN + restore-puls på yngsta bladet (spår 10, 2026-09-18)
//
// Gapet detta verktyg stänger (ARKIVSVEP:ns köpost 4, ordagrant): "Pumpsignaturen
// (+18 984/dag i section_data_snapshots) som vaktpost: avvikande blad-par =
// pumpstopp-slarm i nästa övningsrunda." Tillväxttrappan i ARKIVSVEP/FÖNSTERDJUP
// är KÄND mekanik: epokparet 09-11→09-12 (+439 rader totalt, +0 snapshots),
// därefter varje dygn section_data_snapshots +18 984 EXAKT (tre oberoende vägar:
// retro blad-diff · captured_at-sond · realtids-RPO-diff) + beslutsklockan
// ~768/dag + episoden ~9–48/dag. ETT blad-par som avviker = pumpen stannad
// (eller dubbelkört) — tills detta verktyg fanns INGEN vaktpost som kontrollerar
// signaturen; avvikelsen skulle upptäckas först vid en DR-övning med radkontrakt.
//
// Verktyget gör två saker i EN flockskyddad sekvens:
//   1. PUMPSIGNATUR-SVEP: blockräkning (per tabell COPY-rader) på SAMTLIGA
//      db-*.sql.gz — inget värde litas på utan instrumentbevis — därefter
//      signaturkontroll per blad-par: Δsnapshots skall vara EXAKT
//      snapshotsPerDag × dagar för par där yngre bladet är ≥ pumpens födelse;
//      epokpar (före födelsen) bärs ingen förväntan. Board/organ redovisas mot
//      observationsband (VARNING, ej dom).
//   2. RESTORE-PULS: yngsta bladet återställs i färsk skrap-DB med FULLT
//      familjekontrakt: slutmarkörer (kolla-dump-markorer) → RTO →
//      per-tabell-RADKONTRAKT (dumpens COPY-räkning == psql count(*);
//      KANDA_SCHEMA_UNDANTAG cron + vault, kodifierat av ARKIVSVEP FYND 1) →
//      felkategorisering (kända Supabase-molnfel vs OKÄNDA fynd).
// Plus: JSON-baslinje (maskinläsbar för nästa runda), maskinellt AUTO-protokoll,
// garanterad städning (skrap-DB bort · PG17 tillbaka i viloläge · lås släppt).
//
// Lås/grind/exit = familjekontraktet (dr-ovning.mjs/dr-arkivsvep.mjs, ordagrant arv):
//   0 = GRÖNT · 1 = RÖTT (restore-fel, signatur-slarm eller städningsfynd —
//   protokoll skrivs ändå; misslyckade övningar SKALL protokollföras) ·
//   3 = låset upptaget · 75 = ram-/diskgrind stängd. Prod RÖRS ALDRIG — hela
//   övningen sker i lokal PG17-skrap-DB + läsning av dumpfiler.

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
const SKRAP_DB = 'ak1a_dr_pumpvakt';
const PG_KLUSTER = ['17', 'main'];
const LAS_MAX_ALDER_MS = 30 * 60 * 1000; // dött lås (död agent) tas över efter 30 min

// Schema som ägs av EXTENSIONER som inte finns i lokal PG17 skapas ej av dumpen
// i en färsk skrap-DB — deras rader är inte kunddata (ARKIVSVEP FYND 1,
// kodifierat; dessutom radräkningsformelns kända undantag = cron OCH vault):
//   cron  — pg_cron:s kördhistorik (6 266 rader).
//   vault — supabase_vault-extensionens hemlighetstabell; blocket är TOMT
//           (0 rader) i samtliga blad och CREATE EXTENSION failar lokalt.
const KANDA_SCHEMA_UNDANTAG = new Set(['cron', 'vault']);

// PUMPSIGNATUREN — spårets samlade mätning (ARKIVSVEP FYND 3 · DAGPULS dag-2 ·
// MORGON-PUMP realtid; tre oberoende vägar == samma tal). HÅRD dom: avvikelse
// på snapshots = PUMPSTOPP-SLARM (exit 1). Board/organ = observationsband
// (VARNING i protokollet; inte dom — banden är mekaniska men episodiska).
const SIGNATUR = {
  pumpFoddYngreBlad: '2026-09-13', // första paret som bär en pumpdag: 09-12→09-13
  snapshotsPerDag: 18984,
  boardBand: [760, 780],  // 8 rader/kvart = 768/dag; historisk avvikelse 765 (09-13)
  organBand: [0, 100],    // rondstyrd episod: observerade pardiff 9–48
};

function lasArgument() {
  const args = process.argv.slice(2);
  const opts = { etikett: '', behall: false };
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--etikett' && args[i + 1]) { opts.etikett = args[++i]; }
    else if (args[i] === '--behall') opts.behall = true;
    else if (args[i] === '--hjalp' || args[i] === '--help') {
      console.log('Användning: node verktyg/dr-pumpvakt.mjs [--etikett <namn>] [--behall]');
      console.log('  Pumpsignatur-svep över SAMTLIGA db-*.sql.gz + restore-puls på yngsta bladet.');
      process.exit(0);
    } else {
      console.error(`Okänt argument: ${args[i]} (se --hjalp)`);
      process.exit(2);
    }
  }
  return opts;
}

// --- Lås: familjekontraktet (ordagrant arv från dr-arkivsvep.mjs) ----------------

function taLas() {
  if (process.env.AK1A_DR_FLOCK === '1') {
    const fdFlock = openSync(LAS_VAG, 'w');
    writeFileSync(fdFlock, `pid=${process.pid} start=${new Date().toISOString()} verktyg=dr-pumpvakt.mjs flock=1\n`);
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
      console.error('PUMPVAKTEN AVBRUTEN INNAN PG17 RÖRDES (låsfilsskyddet verkade).');
      process.exit(3);
    }
    console.log(`VARNING: låsfil ${(alder / 60000).toFixed(0)} min gammal (död agent?) — tas över.`);
    unlinkSync(LAS_VAG);
  }
  const fd = openSync(LAS_VAG, 'wx'); // atomär skapande — kapplöpnings­säker
  writeFileSync(fd, `pid=${process.pid} start=${new Date().toISOString()} verktyg=dr-pumpvakt.mjs\n`);
  closeSync(fd);
}

function slappLas() {
  // Flock-läge: RÖR EJ filen — en unlink medan yttre flock håller inoden låter
  // en tredje part flock:a en NY inod och köra parallellt (spränger skyddet).
  if (process.env.AK1A_DR_FLOCK === '1') return;
  try { unlinkSync(LAS_VAG); } catch { /* redan borta */ }
}

function flockStartaOm() {
  if (process.env.AK1A_DR_FLOCK === '1') return;
  const skriptVag = fileURLToPath(import.meta.url);
  // -w 900: köa bakom eventuell syskon-agent (fabriksfönster om 3) i upp till 15 min.
  const r = spawnSync('flock', ['-w', '900', LAS_VAG, process.execPath, skriptVag, ...process.argv.slice(2)], {
    stdio: 'inherit',
    env: { ...process.env, AK1A_DR_FLOCK: '1' },
    timeout: 1500000,
  });
  if (r.error) {
    console.error(`FLOCK-KRITISKT: kunde inte starta om under flock (${r.error.message}) — övningen vägras utan lås.`);
    process.exit(1);
  }
  if (r.status !== 0 && r.status !== null) {
    console.error(`FLOCK: väntan/fönstret slutades med status ${r.status} — försök igen när syskonens DR-fönster klivit av.`);
  }
  process.exit(r.status ?? 1);
}

// --- Grind: ram + disk (familjekontraktet) ----------------------------------------

function grind(etikett) {
  const mem = /MemAvailable:\s+(\d+) kB/.exec(readFileSync('/proc/meminfo', 'utf8'));
  const mb = mem ? Math.round(Number(mem[1]) / 1024) : 0;
  if (mb < 1000) {
    console.error(`RAMGRIND${etikett ? ` (${etikett})` : ''}: MemAvailable ${mb} MB < 1000 MB — övningen avbryts (exit 75). Kör igen när minnet frigjorts.`);
    return false;
  }
  const df = kor('df', ['-k', '/']);
  const falt = ((df.stdout || '').split('\n')[1] || '').trim().split(/\s+/);
  const gbLedigt = Number(falt[3] || 0) / 1024 / 1024;
  if (gbLedigt < 5) {
    console.error(`DISKGRIND${etikett ? ` (${etikett})` : ''}: ${gbLedigt.toFixed(1)} GB ledigt < 5 GB — övningen avbryts (exit 75).`);
    return false;
  }
  return { mb, gbLedigt };
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

// --- Blockräknaren: per tabell COPY-rader ur en dumpfil (dr-fonsterdjup-arv) -----

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

// --- Signaturkontrollen: instrumentet detta verktyg tillför spåret ---------------

function bladDatum(namn) { return namn.replace(/^db-/, '').replace(/\.sql\.gz$/, ''); }

function dagarMellan(a, b) {
  return Math.max(1, Math.round((Date.parse(b) - Date.parse(a)) / 86400000));
}

// Ren funktion (självtestbar): ett blad-par → lista domrader. Tom lista = GRÖN.
// HÅRD: snapshots EXAKT snapshotsPerDag × dagar (pump-epoken har inget krav —
// signaturen föddes 09-12→09-13; ett äldre par kan inte bära pumpdata).
// MJUK: board/organ-band per DAG × dagar (födda-läxa 2, AUTO-12: ett 2-dagars
// par vid hål i arkivet bär 2 dagars beslut — oskalat band VARNING:ade falskt).
function vaktSignatur(par) {
  const notiser = [];
  const vantan = SIGNATUR.snapshotsPerDag * par.dagar;
  if (par.tillDatum >= SIGNATUR.pumpFoddYngreBlad) {
    if (par.snapshots !== vantan) {
      notiser.push(`PUMPSTOPP-SLARM: Δsnapshots ${par.snapshots} ≠ väntat ${vantan} (par ${par.fran}→${par.till}) — pumpen stannad, dubbelkörd eller dess data förlorad`);
    }
  } else {
    notiser.push(`epok-par (yngre blad ${par.tillDatum} före pumpens födelse ${SIGNATUR.pumpFoddYngreBlad}) — inget pumpkrav`);
  }
  const boardBand = [SIGNATUR.boardBand[0] * par.dagar, SIGNATUR.boardBand[1] * par.dagar];
  if (par.board < boardBand[0] || par.board > boardBand[1]) {
    notiser.push(`VARNING: Δboard_decisions ${par.board} utanför observationsband ${boardBand[0]}–${boardBand[1]} (${par.dagar} dag${par.dagar > 1 ? 'ar' : ''}; par ${par.fran}→${par.till})`);
  }
  const organMax = SIGNATUR.organBand[1] * par.dagar;
  if (par.organ < 0 || par.organ > organMax) {
    notiser.push(`VARNING: Δorgan_health_logs ${par.organ} utanför observationsband 0–${organMax} (${par.dagar} dag${par.dagar > 1 ? 'ar' : ''}; par ${par.fran}→${par.till})`);
  }
  return { notiser, slarm: notiser.some((n) => n.startsWith('PUMPSTOPP-SLARM')), vantan };
}

// --- Självtest: blockräknarens fixtures + signaturkontrollens fixtures ------------

function sjalvtest() {
  console.log('[0] Självtest mot fixtures (blockräknare + signaturkontroll) …');
  let pass = 0;
  const fall = [];

  // (a) blockräknaren: frisk fixture + trunkeringsvägran (dr-fonsterdjup-arv)
  const dir = `/tmp/dr-pumpvakt-test-${process.pid}`;
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
  // Fixtures skrivs RÅA (riktiga nyrader) och gzip:as via omdirigering
  // (binär stdout överlever ej kor():s utf8 — dr-fonsterdjup:s engångsbugg).
  kor('mkdir', ['-p', dir]);
  const gzip = (namn, text) => {
    const rå = path.join(dir, namn.replace(/\.gz$/, ''));
    writeFileSync(rå, text);
    const g = kor('bash', ['-c', `gzip -c ${JSON.stringify(rå)} > ${JSON.stringify(path.join(dir, namn))}`]);
    if (!g.ok) throw new Error(`fixture-gzip misslyckades: ${g.stderr}`);
  };
  try {
    gzip('frisk.sql.gz', frisk);
    gzip('trunkerad.sql.gz', trunkerad);
    const m = raknaBlock(path.join(dir, 'frisk.sql.gz'));
    fall.push({ namn: 'blockräknare: frisk fixture a=3 b=0 s=2', ok: m.get('public.a') === 3 && m.get('public.b') === 0 && m.get('storage.s') === 2 && m.size === 3 });
    let vangrade = false;
    try { raknaBlock(path.join(dir, 'trunkerad.sql.gz')); } catch { vangrade = true; }
    fall.push({ namn: 'blockräknare: trunkerat block (kedja 5:s läxa) vägras', ok: vangrade });
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }

  // (b) signaturkontrollen: frisk sekvens som SPÄNNER födelsen (epok · exakt
  //     1-dag · exakt 2-dag med hål i arkivet). Födda-läxan (kör 1, AUTO-11):
  //     januaridatum döms alla som epok — pump-paren testades ALDRIG; datum
  //     skall ligga OMKRING pumpFoddYngreBlad, inte bara "före".
  const friskSekvens = [
    { fran: '2026-09-11', till: '2026-09-12', dagar: 1, snapshots: 0, board: 768, organ: 12 },
    { fran: '2026-09-12', till: '2026-09-13', dagar: 1, snapshots: 18984, board: 765, organ: 48 },
    { fran: '2026-09-13', till: '2026-09-15', dagar: 2, snapshots: 37968, board: 1536, organ: 24 },
  ].map((p) => vaktSignatur({ ...p, tillDatum: p.till }));
  fall.push({
    namn: 'signatur: frisk sekvens (epok · exakt 1-dag · exakt 2-dag med hål) = 0 slarm, pump-paren helt rena',
    ok: friskSekvens.every((d) => !d.slarm) && friskSekvens[1].notiser.length === 0 && friskSekvens[2].notiser.length === 0,
  });
  fall.push({
    namn: 'signatur: epok-paret bärs inget pumpkrav (notis, ej slarm)',
    ok: friskSekvens[0].notiser.length === 1 && friskSekvens[0].notiser[0].startsWith('epok-par') && !friskSekvens[0].slarm,
  });

  // (c) signaturkontrollen: sabotage — pump-par (yngre blad ≥ födelsen) bruten.
  const sabotage = vaktSignatur({ fran: '2026-09-16', till: '2026-09-17', dagar: 1, snapshots: 9000, board: 768, organ: 12, tillDatum: '2026-09-17' });
  fall.push({
    namn: 'signatur: brutet pump-par (Δ9 000 ≠ 18 984) = PUMPSTOPP-SLARM',
    ok: sabotage.slarm && sabotage.notiser.some((n) => n.startsWith('PUMPSTOPP-SLARM')),
  });

  // (d) signaturkontrollen: bands-larmet är VARNING, ej slarm (pump-par exakt).
  const band = vaktSignatur({ fran: '2026-09-16', till: '2026-09-17', dagar: 1, snapshots: 18984, board: 0, organ: 500, tillDatum: '2026-09-17' });
  fall.push({
    namn: 'signatur: board/organ utanför band = 2 VARNINGAR men 0 slarm',
    ok: !band.slarm && band.notiser.filter((n) => n.startsWith('VARNING')).length === 2,
  });

  for (const f of fall) { if (f.ok) pass++; console.log(`      ${f.ok ? 'PASS' : 'FAIL'} · ${f.namn}`); }
  console.log(`      Självtest: ${pass}/${fall.length} ${pass === fall.length ? 'PASS' : 'FAIL'}`);
  return pass === fall.length;
}

// Tyst slutmätning — grind() är en VÄGRANDE grind, inte en mätare.
function lasMemMb() {
  const mem = /MemAvailable:\s+(\d+) kB/.exec(readFileSync('/proc/meminfo', 'utf8'));
  return mem ? Math.round(Number(mem[1]) / 1024) : 0;
}

// --- Markörkontroll (s10-u1:s verktyg — spårets entrégrind) ------------------------

function forkontroll(dump) {
  const r = kor('node', [path.join(REPO_ROT, 'verktyg', 'kolla-dump-markorer.mjs'), '--fil', dump], { timeoutMs: 120000 });
  return { gron: r.status === 0, utdata: r.stdout };
}

// --- PG17 + skrap-DB (familjekontraktet) -------------------------------------------

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

// --- Felkategorisering (familjekontraktet, ordagrant arv) --------------------------

// Kända ofarliga fel vid återställning av Supabase-dump i lokal PG (v98 F3 +
// s10-u2:s kategorisering): saknade moln-roller/scheman/extensions. OKÄNDA fel
// är däremot fynd som SKALL upp i protokollet.
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

// --- Restore med RTO (familjekontraktet; fellogg per BLAD = krockimmun) ------------

function aterstall(dump, bladNamn) {
  const felFil = `/tmp/dr-pumpvakt-fel-${bladNamn}.log`;
  const t0 = process.hrtime.bigint();
  const r = spawnSync('bash', ['-c',
    `zcat '${dump.replace(/'/g, "'\\''")}' | sudo -n -u postgres psql -d ${SKRAP_DB} -X -q 2>'${felFil}'`],
  { encoding: 'utf8', timeout: 600000, maxBuffer: 64 * 1024 * 1024 });
  const ms = Number(process.hrtime.bigint() - t0) / 1e6;
  let felrader = [];
  try { felrader = readFileSync(felFil, 'utf8').split('\n'); } catch { felrader = []; }
  const fel = kategoriseraFel(felrader);
  fel.antalRader = felrader.filter((l) => l.trim() !== '').length;
  return { rtoSek: ms / 1000, restoreOk: r.status === 0, fel, felFil };
}

// --- Mätning: psql-count per tabell + radkontrakt mot blockräkningen ---------------

function matOchKontrakt(block) {
  const tabeller = sql(
    `SELECT table_schema || '.' || table_name FROM information_schema.tables ` +
    `WHERE table_type = 'BASE TABLE' AND table_schema NOT IN ('pg_catalog','information_schema') ORDER BY 1;`,
  ).split('\n').filter((l) => l.trim() !== '');

  // En enda UNION ALL-fråga i omgångar — exakta count(*) per tabell
  // (pg_stat-uppskattningar är inte bevis nog för DR).
  const psql = new Map();
  for (let i = 0; i < tabeller.length; i += 50) {
    const del = tabeller.slice(i, i + 50);
    const fraga = del.map((t) => `SELECT '${t}' AS t, count(*) AS n FROM ${t}`).join(' UNION ALL ') + ';';
    for (const rad of sql(fraga, { timeoutMs: 300000 }).split('\n')) {
      const sep = rad.indexOf('|');
      if (sep > 0) psql.set(rad.slice(0, sep), Number(rad.slice(sep + 1)));
    }
  }

  const summera = (filter) => {
    const namn = tabeller.filter(filter);
    return { tabeller: namn.length, rader: namn.reduce((s, t) => s + (psql.get(t) || 0), 0) };
  };
  const mat = {
    public: summera((t) => t.startsWith('public.')),
    allaScheman: summera(() => true),
  };

  // RADKONTRAKT: varje tabell i dumpens blockräkning (utom kända schema-
  // undantag) skall finnas i psql-mängden med EXAKT samma radtal —
  // två instrument, samma tal.
  const avvikelser = [];
  let kontrakterade = 0;
  for (const [tabell, rader] of block) {
    const schema = tabell.split('.')[0];
    if (KANDA_SCHEMA_UNDANTAG.has(schema)) continue;
    const p = psql.get(tabell);
    if (p === undefined) avvikelser.push(`${tabell}: SAKNAS i skrap-DB (dumpen bar ${rader} rader)`);
    else if (p !== rader) avvikelser.push(`${tabell}: dump ${rader} ≠ psql ${p} (Δ ${p - rader})`);
    else kontrakterade += 1;
  }
  return { mat, perTabell: psql, kontrakterade, avvikelser };
}

// --- Protokoll + JSON ----------------------------------------------------------------

function nastaLedigaAuto(datumIso) {
  let vag = path.join(REPO_ROT, 'data', 'forskning', `DR-PROV-${datumIso}-AUTO.md`);
  let n = 2;
  while (existsSync(vag)) vag = path.join(REPO_ROT, 'data', 'forskning', `DR-PROV-${datumIso}-AUTO-${n++}.md`);
  return vag;
}

function nastaLedigJson(datumIso, etikett) {
  const bas = `DR-PUMPSIGNATUR-${datumIso}${etikett ? `-${etikett}` : ''}`;
  let vag = path.join(REPO_ROT, 'data', 'forskning', `${bas}.json`);
  let n = 2;
  while (existsSync(vag)) vag = path.join(REPO_ROT, 'data', 'forskning', `${bas}-${n++}.json`);
  return vag;
}

function skrivProtokoll(dom) {
  // Födda-läxa 3 (AUTO-13): json-vägen BERÄKNAS FÖRST — annars refererar
  // protokollet den som "—" (texten byggdes före tilldelningen).
  const jsonVag = nastaLedigJson(dom.datumIso, dom.etikett);
  const parRader = dom.par.map((p) => {
    const d = p.dom;
    const statusText = d.slarm ? 'SLARM' : (d.notiser.length === 0 ? 'GRÖN' : d.notiser.every((n) => n.startsWith('epok') || n.startsWith('VARNING')) ? 'GRÖN (notis)' : 'RÖD');
    return `| ${p.fran} → ${p.till} | ${p.dagar} | ${d.vantan.toLocaleString('sv-SE')} | ${p.snapshots.toLocaleString('sv-SE')} | ${p.board.toLocaleString('sv-SE')} | ${p.organ.toLocaleString('sv-SE')} | ${p.dPublic.toLocaleString('sv-SE')} | ${statusText}${d.notiser.length ? ` — ${d.notiser.join('; ')}` : ''} |`;
  }).join('\n');

  const r = dom.restore;
  const signaturSlarm = dom.par.some((p) => p.dom.slarm);
  const restoreGron = r && r.markorGron && r.restoreOk && r.kontrakt && r.kontrakt.avvikelser.length === 0 && r.fel.okanda.length === 0;
  const gron = restoreGron && !signaturSlarm && dom.stadning.skrapDbBort && (dom.behall || dom.stadning.pgStoppad) && dom.sjalvtestOk;

  const text = `# DR-PROV ${dom.datumIso} — PUMPVAKT: pumpsignatur-svep + restore-puls (${gron ? 'GODKÄNT' : 'UNDERKÄNT'})

**Körd av:** \`verktyg/dr-pumpvakt.mjs\` (spår 10; ARKIVSVEP:ns köpost 4 — pumpsignaturen
som vaktpost). Detta protokoll genererades maskinellt av verktyget vid körningen.

**Vaktpostens kontrakt:** blad-parets Δ section_data_snapshots skall vara EXAKT
${SIGNATUR.snapshotsPerDag.toLocaleString('sv-SE')} × dagar när yngre bladet är ≥ ${SIGNATUR.pumpFoddYngreBlad}
(pumpens födelsepar 09-12→09-13; äldre par = epok utan pumpkrav). Avvikelse =
PUMPSTOPP-SLARM (vakten väcker, restore-kedjan är oskodd men dataströmmen är avbruten).
Board/organ redovisas mot observationsband (${SIGNATUR.boardBand.join('–')} resp ${SIGNATUR.organBand.join('–')}) — VARNING, ej dom.

---

## 1. Sammanfattning för kunden (5 rader)

1. Maskinens dagliga dataström har en känd puls (bildas kl 08:00, exakt ${SIGNATUR.snapshotsPerDag.toLocaleString('sv-SE')} rader per dag) —
   den har nu en **vaktpost**: varje ny backup kontrolleras mot pulsen, par för par.
2. ${dom.par.length} blad-par granskades: ${dom.par.filter((p) => !p.dom.slarm).length} bar signaturen${signaturSlarm ? ` — MEN minst ett par AVVIK (SLARM — se §3)` : ' utan avvikelse'}.
3. Senaste backupen återställdes dessutom i en avskild testdatabas (${r ? r.rtoSek.toFixed(1) : '?'} s) och
   radräknades med två oberoende instrument ${restoreGron ? '— alla tal matchade exakt' : '— FYND, se §2'}.
4. Produktionen påverkades inte; testdatabasen raderades och serverns viloläge återställdes.
5. Kommandon för nästa runda: \`node verktyg/dr-pumpvakt.mjs\` (vakten + pulsen i ett).

## 2. Restore-pulsen (yngsta bladet ${r ? r.namn : '—'})

| Moment | Resultat |
|---|---|
| Slutmarkörer | ${r ? (r.markorGron ? 'GRÖN' : 'RÖD — restore vägrades') : '—'} |
| RTO | ${r && r.rtoSek !== null ? r.rtoSek.toFixed(1) + ' s' : '—'} |
| public | ${r && r.kontrakt ? `${r.kontrakt.mat.public.tabeller} tabeller / ${r.kontrakt.mat.public.rader.toLocaleString('sv-SE')} rader` : '—'} |
| alla scheman | ${r && r.kontrakt ? `${r.kontrakt.mat.allaScheman.tabeller} / ${r.kontrakt.mat.allaScheman.rader.toLocaleString('sv-SE')}` : '—'} |
| Radkontrakt (dump == psql) | ${r && r.kontrakt ? (r.kontrakt.avvikelser.length === 0 ? `EXAKT (${r.kontrakt.kontrakterade} tabeller)` : `${r.kontrakt.avvikelser.length} AVVIKELSER`) : '—'} |
| Fel kända/okända | ${r && r.fel ? `${r.fel.antalRader - r.fel.okanda.length}/${r.fel.okanda.length}` : '—'} |

Undantag i radkontraktet: scheman ägda av extensioner som saknas lokalt (${[...KANDA_SCHEMA_UNDANTAG].join(', ')}).
Kända fel = Supabase-molnets roller/scheman/extensions (ofarliga; återskapas i målmiljön).

## 3. Pumpsignatur-svepet (${dom.blad.length} blad, ${dom.par.length} par)

| Par | Dagar | Väntat Δsnap | Δsnap | Δboard | Δorgan | Δpublic | Dom |
|---|---|---|---|---|---|---|---|
${parRader || '(enstaka blad — ingen diff)'}

## 4. Städning (kontraktet)

- Skrap-DB \`${SKRAP_DB}\`: ${dom.stadning.skrapDbBort ? 'raderad' : 'KUNDE EJ RADERAS — FYND'}.
- PG17: ${dom.behall ? 'lämnad uppe (--behall — brutet viloläge, städa manuellt)' : dom.stadning.pgStoppad ? 'stoppad (viloläge återställt)' : 'KUNDE EJ STOPPAS — FYND'}.
- Lås ${LAS_VAG}: släppt${process.env.AK1A_DR_FLOCK === '1' ? ' (flock-läget lämnar den tomma filen åt nästa tagare — oskyldigt)' : ''}.
- Självtest-fixturen i tmp: bortstädad i självtestet. Fellogg kvar i /tmp/dr-pumpvakt-fel-*.log (medvetet — bevismaterial).
${dom.stadning.meddelande ? `- STÄDNINGSFYND: ${dom.stadning.meddelande.trim()}` : ''}

## 5. Kontext

- Självtest (blockräknare + signaturkontroll): ${dom.sjalvtestOk ? 'PASS' : 'FAIL — FYND'}.
- Signaturinstrumentet = dumpens egna COPY-radräkning (självtestad blockräknare);
  för yngsta bladet gör restore-kontraktet siffran DUBBELBEVISAD (dump == psql).
- Grind: ${dom.grindStart ? `MemAvailable ${dom.grindStart.mb} MB · ${dom.grindStart.gbLedigt.toFixed(0)} GB ledigt vid start` : '—'}${dom.grindSlut ? ` · vid slut ${dom.grindSlut.mb} MB` : ''}.
- JSON-baslinje (maskinläsbar, för nästa rundas diff): ${path.relative(REPO_ROT, jsonVag)}.
- Prod opåverkad: skrap-DB på lokal PG17; prod-data lever i Supabase-molnet.
- GDPR: protokollet redovisar endast antal, tabellnamn och tider — inga personvärden.

## 6. Status

- Verktyget: \`verktyg/dr-pumpvakt.mjs\` — vakten + pulsen i ETT kommando.
- Kod i src/ berördes ej — tsc-baslinjen orörd; inga byggen.
- Slutdom: **${gron ? 'GRÖN — signaturen lever och yngsta bladet är restore-bevisat' : 'RÖD — se fynd ovan'}**.

SLUT — maskinellt genererat av dr-pumpvakt.mjs ${new Date().toISOString()}
`;
  const vag = nastaLedigaAuto(dom.datumIso);
  writeFileSync(vag, text);
  dom.protokollVag = path.relative(REPO_ROT, vag);
  console.log(`      Protokoll: ${dom.protokollVag}`);

  writeFileSync(jsonVag, JSON.stringify({
    skapad: new Date().toISOString(),
    verktyg: 'verktyg/dr-pumpvakt.mjs',
    signaturKonstanter: SIGNATUR,
    kandaSchemaUndantag: [...KANDA_SCHEMA_UNDANTAG],
    blad: dom.blad.map((b) => ({
      namn: b.namn, markorerGron: b.markorGron, snapshots: b.snapshots,
      board: b.board, organ: b.organ, publicRader: b.publicRader,
    })),
    par: dom.par.map((p) => ({
      fran: p.fran, till: p.till, dagar: p.dagar, vantanSnapshots: p.dom.vantan,
      snapshots: p.snapshots, board: p.board, organ: p.organ, dPublic: p.dPublic,
      slarm: p.dom.slarm, notiser: p.dom.notiser,
    })),
    restore: r ? {
      blad: r.namn, rtoSek: Number(r.rtoSek.toFixed(2)), markorGron: r.markorGron,
      publicTabeller: r.kontrakt ? r.kontrakt.mat.public.tabeller : null,
      publicRader: r.kontrakt ? r.kontrakt.mat.public.rader : null,
      kontrakteradeTabeller: r.kontrakt ? r.kontrakt.kontrakterade : null,
      avvikelser: r.kontrakt ? r.kontrakt.avvikelser : null,
      felKanda: r.fel ? r.fel.antalRader - r.fel.okanda.length : null,
      felOkanda: r.fel ? r.fel.okanda.length : null,
    } : null,
    dom: gron ? 'GRÖN' : 'RÖD',
    protokoll: dom.protokollVag,
  }, null, 2));
  dom.jsonVag = jsonVag;
  console.log(`      JSON-baslinje: ${path.relative(REPO_ROT, jsonVag)}`);
  return gron;
}

// --- Huvudflöde ------------------------------------------------------------------------

function main() {
  const opts = lasArgument();
  flockStartaOm(); // yttre flock på LAS_VAG — barnet fortsätter nedan
  taLas();
  const grindStart = grind('start');
  if (!grindStart) { slappLas(); process.exit(75); }

  const dom = {
    datumIso: new Date().toISOString().slice(0, 10),
    etikett: opts.etikett,
    behall: opts.behall,
    blad: [],
    par: [],
    pgStartadesAvOss: false,
    sjalvtestOk: false,
    grindStart,
    grindSlut: null,
    stadning: { skrapDbBort: false, pgStoppad: false, meddelande: '' },
    protokollVag: null,
    jsonVag: null,
    restore: null,
  };
  let gron = false;
  try {
    dom.sjalvtestOk = sjalvtest();
    if (!dom.sjalvtestOk) throw new Error('självtestet misslyckades — övningens instrument är opålitliga');

    const filer = readdirSync(DUMP_KATALOG)
      .filter((n) => /^db-\d{4}-\d{2}-\d{2}\.sql\.gz$/.test(n))
      .sort();
    if (filer.length === 0) throw new Error(`inga db-*.sql.gz i ${DUMP_KATALOG}`);
    console.log(`\nPUMPSIGNATUR-SVEP ${dom.datumIso} — ${filer.length} blad (äldst→yngst): ${filer[0]} … ${filer[filer.length - 1]}`);

    // Signatur-svepet: markörer + blockräkning på SAMTLIGA blad (ingen PG behövs).
    const blockMaptor = new Map();
    for (let i = 0; i < filer.length; i++) {
      const namn = filer[i];
      const vagFil = path.join(DUMP_KATALOG, namn);
      console.log(`[${i + 1}/${filer.length}] ${namn}`);
      const mk = forkontroll(vagFil);
      if (!mk.gron) console.log('      MARKÖRER RÖDA — bladet redovisas, signaturvärdena bär varning.');
      try {
        const block = raknaBlock(vagFil);
        blockMaptor.set(namn, block);
        const pub = [...block.entries()].filter(([t]) => t.startsWith('public.')).reduce((s, [, n]) => s + n, 0);
        const v = (t) => block.get(t) ?? null;
        dom.blad.push({
          namn, markorGron: mk.gron, publicRader: pub,
          snapshots: v('public.section_data_snapshots'),
          board: v('public.board_decisions'),
          organ: v('public.organ_health_logs'),
        });
        console.log(`      markörer ${mk.gron ? 'GRÖN' : 'RÖD'} · public ${pub.toLocaleString('sv-SE')} rader · snapshots ${v('public.section_data_snapshots')?.toLocaleString('sv-SE') ?? '—'} · board ${v('public.board_decisions')?.toLocaleString('sv-SE') ?? '—'} · organ ${v('public.organ_health_logs')?.toLocaleString('sv-SE') ?? '—'}`);
      } catch (e) {
        dom.blad.push({ namn, markorGron: mk.gron, publicRader: null, snapshots: null, board: null, organ: null, fel: e.message });
        console.log(`      BLOCKRÄKNING VÄGRADES: ${e.message}`);
      }
    }

    // Blad-paren (enbart par där BÅDA blad har värden).
    for (let i = 1; i < dom.blad.length; i++) {
      const a = dom.blad[i - 1];
      const b = dom.blad[i];
      if (a.snapshots === null || b.snapshots === null) continue;
      const fran = bladDatum(a.namn);
      const till = bladDatum(b.namn);
      const p = {
        fran, till, tillDatum: till,
        dagar: dagarMellan(fran, till),
        snapshots: b.snapshots - a.snapshots,
        board: (b.board ?? 0) - (a.board ?? 0),
        organ: (b.organ ?? 0) - (a.organ ?? 0),
        dPublic: (b.publicRader ?? 0) - (a.publicRader ?? 0),
      };
      p.dom = vaktSignatur(p);
      dom.par.push(p);
      const statusText = p.dom.slarm ? 'PUMPSTOPP-SLARM' : p.dom.notiser.length === 0 ? 'GRÖN' : 'notis';
      console.log(`      par ${p.fran}→${p.till}: Δsnap ${p.snapshots.toLocaleString('sv-SE')} (väntat ${p.dom.vantan.toLocaleString('sv-SE')}) · Δboard ${p.board} · Δorgan ${p.organ} · Δpublic ${p.dPublic.toLocaleString('sv-SE')} → ${statusText}${p.dom.notiser.length ? ` (${p.dom.notiser.join('; ')})` : ''}`);
    }
    const slarmPar = dom.par.filter((p) => p.dom.slarm);
    if (slarmPar.length === 0) console.log('SIGNATUR: GRÖN — samtliga par utan pumpstopps-slarm.');
    else for (const p of slarmPar) console.log(`SIGNATUR: ${p.dom.notiser.join('; ')}`);

    // Restore-pulsen: yngsta bladet med FULLT kontrakt.
    const yngst = dom.blad[dom.blad.length - 1];
    const yngstFil = path.join(DUMP_KATALOG, yngst.namn);
    console.log(`\nRESTORE-PULS: ${yngst.namn}`);
    if (!grind(yngst.namn)) {
      dom.stadning.meddelande += 'restore avbröts av ram-/diskgrind (signatur-svepet levererat). ';
    } else {
      const r = { namn: yngst.namn, markorGron: yngst.markorGron, rtoSek: null, restoreOk: false, fel: null, kontrakt: null };
      dom.restore = r;
      try {
        if (!yngst.markorGron) throw new Error('slutmarkörer RÖDA — restore vägrades (familjekontraktet)');
        startaPg17(dom);
        skapaSkrapDb();
        const res = aterstall(yngstFil, yngst.namn.replace(/\.sql\.gz$/, ''));
        r.rtoSek = res.rtoSek;
        r.restoreOk = res.restoreOk;
        r.fel = res.fel;
        console.log(`      Restore ${res.restoreOk ? 'KLART' : 'PSLYFEL'} på ${res.rtoSek.toFixed(1)} s · felrader ${res.fel.antalRader} (kända ${res.fel.antalRader - res.fel.okanda.length}, okända ${res.fel.okanda.length}).`);
        if (!res.restoreOk) throw new Error(`pslugång kod != 0 (se ${res.felFil})`);
        r.kontrakt = matOchKontrakt(blockMaptor.get(yngst.namn));
        console.log(`      psql: public ${r.kontrakt.mat.public.tabeller} tabeller / ${r.kontrakt.mat.public.rader.toLocaleString('sv-SE')} rader · kontrakt ${r.kontrakt.kontrakterade} tabeller EXAKTA${r.kontrakt.avvikelser.length ? ` · ${r.kontrakt.avvikelser.length} AVVIKELSER` : ''}.`);
        for (const a of r.kontrakt.avvikelser.slice(0, 10)) console.log(`        AVVIKELSE: ${a}`);
        for (const o of r.fel.okanda.slice(0, 5)) console.log(`        OKÄNT FEL: ${o}`);
      } catch (e) {
        r.avbruten = e.message;
        console.log(`      RESTORE AVBRUTEN: ${e.message}`);
      }
    }

    dom.grindSlut = { mb: lasMemMb() };
  } catch (e) {
    console.error(`PUMPVAKTEN AVBRUTEN: ${e.message}`);
  } finally {
    // Städning (familjekontraktet): skrap-DB skall bort; PG17 tillbaka i viloläge.
    // Födda-läxan (kör 1, AUTO-11): dropdb mot NERE server failar och dömde
    // falskt "KUNDE EJ RADERAS" i abortfånget — skrap-DB kan bara finnas om
    // PG17 varit uppe i VÅRT fönster (createdb sker endast efter startaPg17).
    console.log('\nStädning …');
    if (pgUpp()) {
      const drop = sudo(['-u', 'postgres', 'dropdb', '--if-exists', SKRAP_DB]);
      dom.stadning.skrapDbBort = drop.ok;
      if (!drop.ok) dom.stadning.meddelande += `slut-dropdb misslyckades: ${drop.stderr} `;
    } else if (dom.pgStartadesAvOss) {
      dom.stadning.skrapDbBort = false;
      dom.stadning.meddelande += 'PG17 dog under övningen — skrap-DB:s öde okänt (FYND). ';
    } else {
      dom.stadning.skrapDbBort = true; // PG17 var aldrig uppe i vårt fönster
      dom.stadning.meddelande += 'PG17 nere hela fönstret — skrap-DB kan ej finnas. ';
    }
    if (dom.behall) {
      dom.stadning.meddelande += '--behall givet: PG17 lämnas uppe (viloläget brutet).';
      dom.stadning.pgStoppad = false;
    } else if (dom.pgStartadesAvOss) {
      const stop = sudo(['pg_ctlcluster', ...PG_KLUSTER, 'stop']);
      dom.stadning.pgStoppad = stop.ok || !pgUpp();
      if (!dom.stadning.pgStoppad) dom.stadning.meddelande += `pg_ctlcluster stop misslyckades: ${stop.stderr} `;
    } else {
      dom.stadning.pgStoppad = !pgUpp();
      if (!dom.stadning.pgStoppad) dom.stadning.meddelande += 'PG17 var uppe vid ankomst och är det fortfarande (ägarskap oklart — protokollförs). ';
    }
    console.log(`      skrap-DB ${dom.stadning.skrapDbBort ? 'raderad' : 'KUNDE EJ RADERAS'} · PG17 ${dom.stadning.pgStoppad ? 'stoppad' : dom.behall ? 'lämnad uppe (--behall)' : 'KUNDE EJ STOPPAS'}.`);
    try { gron = skrivProtokoll(dom); } catch (e2) { console.error(`Protokoll kunde ej skrivas: ${e2.message}`); }
    slappLas();
  }
  process.exit(gron ? 0 : 1);
}

main();
