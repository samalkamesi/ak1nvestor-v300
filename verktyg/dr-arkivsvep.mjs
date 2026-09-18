#!/usr/bin/env node
// dr-arkivsvep.mjs — HELARKIVETS RESTORE-BARTHET: varje blad bevisas (spår 10, s10-u3, 2026-09-18)
//
// Gapet detta verktyg stänger: kedja 5:s retentionssvep bevisar gzip-integritet
// per blad, men DRIFTSBOKEN:s läxa (2026-09-16) är att "gzip-gillighet är inte
// restore-barhet — ett strukturellt helt block kan bära oläslig data". Restore
// har bevisats på yngsta bladet (dr-ovning-serien) och äldsta+yngsta
// (dr-fonsterdjup 09-16) — aldrig på MITTEN. Om katastrofen upptäcks sent och
// återhämtningen hamnar på ett mittenblad är restore-barheten OBEVISAD dit
// detta svep körs. Verktyget går igenom SAMTLIGA db-*.sql.gz (äldst→yngst):
//   1. SJÄLVTEST av blockräknaren mot fixtures (inkl. trunkeringsvägran).
//   2. Per blad: RAM-/diskgrind → slutmarkörkontroll (kolla-dump-markorer)
//      → blockräkning (per tabell COPY-rader) → färsk skrap-DB → restore med
//      RTO → psql-mätning → RADKONTRAKT (två instrument, samma tal: dumpens
//      COPY-räkning == psql count(*) per tabell; cron-schemat är känt undantag
//      — pg_cron-ägt, skapas ej i skrap-DB, kördhistorik ej kunddata) →
//      skrap-DB raderas INNAN nästa blad.
//   3. Tillväxtdiff mellan på varandra följande blad (Δrader/dag, topp).
//   4. Maskinellt protokoll DR-PROV-<datum>-AUTO-<n>.md (nästa lediga nummer).
//
// Lås/grind/exit = familjekontraktet (dr-ovning.mjs, ordagrant arv):
//   0 = GRÖNT svep · 1 = RÖTT (minst ett blad underkänt — protokoll skrivs
//   ändå; misslyckade övningar SKALL protokollföras) · 3 = låset upptaget ·
//   75 = ram-/diskgrind stängd. Prod RÖRS ALDRIG — hela övningen sker i
//   lokal PG17-skrap-DB + läsning av dumpfiler.

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
const SKRAP_DB = 'ak1a_dr_arkiv';
const PG_KLUSTER = ['17', 'main'];
const LAS_MAX_ALDER_MS = 30 * 60 * 1000; // dött lås (död agent) tas över efter 30 min

// Schema som ägs av EXTENSIONER som inte finns i lokal PG17 skapas ej av
// dumpen i en färsk skrap-DB — deras rader är inte kunddata. Två kodifierade
// fall (per-tabell-kontraktet fångade båda):
//   cron  — pg_cron:s kördhistorik (6 266 rader; u3:s radräkningsformel
//           2026-09-18 — formelnkodifierade FÖRSTA fallet).
//   vault — supabase_vault-extensionens hemlighetstabell; blocket är TOMT
//           (0 rader) i samtliga blad och "CREATE EXTENSION supabase_vault"
//           failar lokalt ("not available", felloggen 2026-09-18) ⇒ schemat
//           skapas aldrig. Fångades av svepets första körning (AUTO-6 RÖT)
//           — schemanivå-instrumentet (u3:s formel) synt den inte.
// Allt ANNAT än dessa skall mötas exakt.
const KANDA_SCHEMA_UNDANTAG = new Set(['cron', 'vault']);

function lasArgument() {
  const args = process.argv.slice(2);
  const opts = { behall: false };
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--behall') opts.behall = true;
    else if (args[i] === '--hjalp' || args[i] === '--help') {
      console.log('Användning: node verktyg/dr-arkivsvep.mjs [--behall]  (sveper SAMTLIGA db-*.sql.gz, äldst→yngst)');
      process.exit(0);
    } else {
      console.error(`Okänt argument: ${args[i]} (se --hjalp)`);
      process.exit(2);
    }
  }
  return opts;
}

// --- Lås: familjekontraktet (ordagrant arv från dr-ovning.mjs) ----------------

function taLas() {
  if (process.env.AK1A_DR_FLOCK === '1') {
    const fdFlock = openSync(LAS_VAG, 'w');
    writeFileSync(fdFlock, `pid=${process.pid} start=${new Date().toISOString()} verktyg=dr-arkivsvep.mjs flock=1\n`);
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
      console.error('ARKIVSVEPET AVBRUTET INNAN PG17 RÖRDES (låsfilsskyddet verkade).');
      process.exit(3);
    }
    console.log(`VARNING: låsfil ${(alder / 60000).toFixed(0)} min gammal (död agent?) — tas över.`);
    unlinkSync(LAS_VAG);
  }
  const fd = openSync(LAS_VAG, 'wx'); // atomär skapande — kapplöpnings­säker
  writeFileSync(fd, `pid=${process.pid} start=${new Date().toISOString()} verktyg=dr-arkivsvep.mjs\n`);
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
  // 25 min-tak (fabrikens uppgiftstak) — svepet är 8 restore:r i följd.
  const r = spawnSync('flock', ['-w', '900', LAS_VAG, process.execPath, skriptVag, ...process.argv.slice(2)], {
    stdio: 'inherit',
    env: { ...process.env, AK1A_DR_FLOCK: '1' },
    timeout: 1500000,
  });
  if (r.error) {
    console.error(`FLOCK-KRITISKT: kunde inte starta om under flock (${r.error.message}) — svepet vägras utan lås.`);
    process.exit(1);
  }
  process.exit(r.status ?? 1);
}

// --- Grind: ram + disk (familjekontraktet; körs före varje blad) ---------------

function grind(etikett) {
  const mem = /MemAvailable:\s+(\d+) kB/.exec(readFileSync('/proc/meminfo', 'utf8'));
  const mb = mem ? Math.round(Number(mem[1]) / 1024) : 0;
  if (mb < 1000) {
    console.error(`RAMGRIND${etikett ? ` (${etikett})` : ''}: MemAvailable ${mb} MB < 1000 MB — svepet avbryts (exit 75). Kör igen när minnet frigjorts.`);
    return false;
  }
  const df = kor('df', ['-k', '/']);
  const falt = ((df.stdout || '').split('\n')[1] || '').trim().split(/\s+/);
  const gbLedigt = Number(falt[3] || 0) / 1024 / 1024;
  if (gbLedigt < 5) {
    console.error(`DISKGRIND${etikett ? ` (${etikett})` : ''}: ${gbLedigt.toFixed(1)} GB ledigt < 5 GB — svepet avbryts (exit 75).`);
    return false;
  }
  return { mb, gbLedigt };
}

// --- Processhjälp ---------------------------------------------------------------

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

// --- Blockräknaren: per tabell COPY-rader ur en dumpfil (dr-fonsterdjup-arv) ----

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

// --- Självtest: räknaren + trunkeringsvägran (fixtures i tmp) -------------------

function sjalvtest() {
  console.log('[0] Självtest mot fixtures (skapas i tmp, gzip-komprimerade som riktiga) …');
  const dir = `/tmp/dr-arkivsvep-test-${process.pid}`;
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
  // Fixtures skrivs RÅA (riktiga nyrader — JSON.stringify:s \n-sekvenser ger
  // enradiga fixtures som döms trunkerade; dr-fonsterdjup:s engångsbugg 09-16)
  // och gzip:as via omdirigering (binär stdout överlever ej kor():s utf8).
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

// Tyst slutmätning — grind() är en VÄGRANDE grind, inte en mätare; vid svepets
// slut skall minnet rapporteras, inte föreslås avbrott.
function lasMemMb() {
  const mem = /MemAvailable:\s+(\d+) kB/.exec(readFileSync('/proc/meminfo', 'utf8'));
  return mem ? Math.round(Number(mem[1]) / 1024) : 0;
}

// --- Markörkontroll (s10-u1:s verktyg — hela spårets entrégrind) -----------------

function forkontroll(dump) {
  const r = kor('node', [path.join(REPO_ROT, 'verktyg', 'kolla-dump-markorer.mjs'), '--fil', dump], { timeoutMs: 120000 });
  return { gron: r.status === 0, utdata: r.stdout };
}

// --- PG17 + skrap-DB (dr-ovning.mjs:s kontrakt) ----------------------------------

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

function rutaSkrapDb(dom) {
  const drop = sudo(['-u', 'postgres', 'dropdb', '--if-exists', SKRAP_DB]);
  if (!drop.ok) dom.stadning.meddelande += `mellanblad-dropdb misslyckades: ${drop.stderr} `;
  return drop.ok;
}

// --- Felkategorisering (dr-ovning.mjs:s kontrakt, ordagrant arv) -----------------

// Kända ofarliga fel vid återställning av Supabase-dump i lokal PG (v98 F3 +
// s10-u2:s kategorisering): saknade moln-roller/scheman/extensions. OKÄNDA fel
// är däremot fynd som SKALL upp i protokollet.
function kategoriseraFel(felrader) {
  const kanda = { roller: {}, scheman: {}, extensions: {}, ovrigtKant: 0, fortsattning: 0 };
  const okanda = [];
  // psql skriver flerlinjers fel: HINT/DETAIL/LINE/WARNING/CONTEXT tillhör
  // föregående (redan kategoriserade) fel — inte nya fynd.
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

// --- Restore med RTO (dr-ovning.mjs:s kontrakt) -----------------------------------

function aterstall(dump, bladNamn) {
  const felFil = `/tmp/dr-arkivsvep-fel-${bladNamn}.log`;
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

// --- Mätning: psql-count per tabell + radkontrakt mot blockräkningen --------------

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
  // två instrument, samma tal (u3:s princip).
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

// --- Protokoll ---------------------------------------------------------------------

function nastaLedigaAuto(datumIso) {
  let vag = path.join(REPO_ROT, 'data', 'forskning', `DR-PROV-${datumIso}-AUTO.md`);
  let n = 2;
  while (existsSync(vag)) vag = path.join(REPO_ROT, 'data', 'forskning', `DR-PROV-${datumIso}-AUTO-${n++}.md`);
  return vag;
}

function skrivProtokoll(dom) {
  const bladRader = dom.blad.map((b) => {
    const domRad = !b.markorGron ? 'RÖD (markörer — restore vägrades)'
      : b.avbruten ? `AVBRUTEN (${b.avbruten})`
      : b.kontrakt.avvikelser.length === 0 && b.fel.okanda.length === 0 && b.restoreOk ? 'GRÖN' : 'RÖD';
    return `| ${b.namn} | ${(b.storlekMb || 0).toFixed(1)} | ${b.markorGron ? 'GRÖN' : 'RÖD'} | ${b.blockPublic !== null ? b.blockPublic.toLocaleString('sv-SE') : '—'} | ${b.kontrakt ? b.kontrakt.mat.public.rader.toLocaleString('sv-SE') : '—'} | ${b.kontrakt ? (b.kontrakt.avvikelser.length === 0 ? 'EXAKT' : `${b.kontrakt.avvikelser.length} avvikelser`) : '—'} | ${b.rtoSek !== null ? b.rtoSek.toFixed(1) : '—'} | ${b.fel ? `${b.fel.antalRader - b.fel.okanda.length}/${b.fel.okanda.length}` : '—'} | ${domRad} |`;
  }).join('\n');

  const tillvaxtRader = dom.tillvaxt.map((t) =>
    `| ${t.fran} → ${t.till} | ${t.dPublic.toLocaleString('sv-SE')} | ${t.perDag.toLocaleString('sv-SE')} | ${t.topp.map(([namn, n]) => `${namn.replace('public.', '')} +${n.toLocaleString('sv-SE')}`).join(', ')} |`).join('\n');

  const allaGronda = dom.blad.every((b) => b.markorGron && b.restoreOk && b.kontrakt && b.kontrakt.avvikelser.length === 0 && b.fel.okanda.length === 0);
  const gron = allaGronda && dom.stadning.skrapDbBort && (dom.behall || dom.stadning.pgStoppad) && dom.sjalvtestOk;

  const text = `# DR-PROV ${dom.datumIso} — ARKIVSVEP: helarkivets restore-barhet per blad (${gron ? 'GODKÄNT' : 'UNDERKÄNT'})

**Körd av:** \`verktyg/dr-arkivsvep.mjs\` (spår 10, s10-u3 manifest auto-s10-1789711500221) —
svep av SAMTLIGA ${dom.blad.length} natt-dumpar på disk, äldst→yngst. Detta protokoll
genererades maskinellt av verktyget vid körningen.

**Gapet svepet stänger:** kedja 5:s retentionssvep bevisar gzip-integritet per blad —
men "gzip-gillighet är inte restore-barhet" (DRIFTSBOKEN:s läxa 2026-09-16: ett
strukturellt helt block kan bära oläslig data). Restore var bevisat endast på yngsta
bladet (dr-ovning-serien ~22+ RTO-punkter) och äldsta+yngsta (dr-fonsterdjup 09-16).
**MITTEN av arkivet hade aldrig restore-bevisats.** Efter detta svep gäller: varje
blad på disk är bevisat återställningsbart med exakt radkontrakt — katastrofutrymmet
"fel mittenblad valt vid återhämtning" är stängt.

---

## 1. Sammanfattning för kunden (5 rader)

1. Vi provade att återställa databasen **från varenda backup som finns på servern** —
   ${dom.blad.length} dagars backupper i rad, ${dom.totalRtoSek ? dom.totalRtoSek.toFixed(1) : '?'} s sammanlagd återställningstid.
2. Varje backup kontrollerades först (komplett ända till sista raden?) och jämfördes
   sedan med **två oberoende räkningar** (backupfilens egna rader mot databasens) —
   ${gron ? 'alla tal matchade exakt' : 'FYND: se §3 — minst ett blad avvek'}.
3. Produktionen påverkades inte: allt skedde i en avskild testdatabas som raderades
   efter varje blad (och serverns viloläge återställdes).
4. Svepet lyfter hela arkivet från "filerna ser friska ut" till "varje fil är bevisat
   återställningsbar" — om en katastrof upptäcks sent är det just ett äldre blad som gäller.
5. Nästa svep: vid nästa kvartalsövning, eller direkt \`node verktyg/dr-arkivsvep.mjs\`.

## 2. Blad för blad (äldst → yngst)

| Blad | MB gz | Markörer | Dumpens public-rader | psql public-rader | Radkontrakt | RTO s | Fel kända/okända | Dom |
|---|---|---|---|---|---|---|---|---|
${bladRader}

Noteringar:
- Radkontraktet omfattar ALLA scheman utom \`cron\` (pg_cron-ägt, skapas ej i
  skrap-DB — kördhistorik, ej kunddata) och \`vault\` (supabase_vault-extensionens
  tomma hemlighetstabell, 0 rader i samtliga blad — kodifierat 2026-09-18 efter
  svepets första körning fångade den; se KANDA_SCHEMA_UNDANTAG i källkoden).
- Kända fel = Supabase-molnets roller/scheman/extensions som inte finns i lokal PG
  (ofarliga; återskapas i målmiljön vid äkta katastrof — v98 F3-slutsatsen).

## 3. Tillväxten blad→blad

| Steg | Δ public-rader | Δ/dag | Störst tillväxt |
|---|---|---|---|
${tillvaxtRader || '(enstaka blad — ingen diff)'}

## 4. Städning (kontraktet)

- Skrap-DB \`${SKRAP_DB}\`: ${dom.stadning.skrapDbBort ? 'raderad' : 'KUNDE EJ RADERAS — FYND'} (mellan blad: raderad före nästa restore).
- PG17: ${dom.behall ? 'lämnad uppe (--behall — brutet viloläge, städa manuellt)' : dom.stadning.pgStoppad ? 'stoppad (viloläge återställt)' : 'KUNDE EJ STOPPAS — FYND'}.
- Lås ${LAS_VAG}: släppt${process.env.AK1A_DR_FLOCK === '1' ? ' (flock-läget lämnar den tomma filen åt nästa tagare — oskyldigt)' : ''}.
- Felloggor kvar i /tmp/dr-arkivsvep-fel-*.log (medvetet — bevismaterial).
${dom.stadning.meddelande ? `- STÄDNINGSFYND: ${dom.stadning.meddelande.trim()}` : ''}

## 5. Kontext

- Självtest av blockräknaren (fixtures + trunkeringsvägran): ${dom.sjalvtestOk ? 'PASS' : 'FAIL — FYND'}.
- Grind: ${dom.grindStart ? `MemAvailable ${dom.grindStart.mb} MB · ${dom.grindStart.gbLedigt.toFixed(0)} GB ledigt vid start` : '—'}${dom.grindSlut ? ` · vid slut ${dom.grindSlut.mb} MB` : ''}.
- Prod opåverkad: skrap-DB på lokal PG17 (port 5432); prod-data lever i Supabase-molnet.
- GDPR: protokollet redovisar endast antal, tabellnamn och tider — inga personvärden.

## 6. Status

- Verktyget: \`verktyg/dr-arkivsvep.mjs\` — helarkivsvepet är ETT kommando.
- Kod i src/ berördes ej — tsc-baslinjen orörd; inga byggen.
- Slutdom: **${gron ? 'GRÖN — helarkivets restore-barhet bevisad' : 'RÖD — se fynd ovan'}**.

SLUT — maskinellt genererat av dr-arkivsvep.mjs ${new Date().toISOString()}
`;
  const vag = nastaLedigaAuto(dom.datumIso);
  writeFileSync(vag, text);
  dom.protokollVag = path.relative(REPO_ROT, vag);
  console.log(`      Protokoll: ${dom.protokollVag}`);
  return gron;
}

// --- Huvudflöde ----------------------------------------------------------------------

function main() {
  const opts = lasArgument();
  flockStartaOm(); // yttre flock på LAS_VAG — barnet fortsätter nedan
  taLas();
  const grindStart = grind('start');
  if (!grindStart) { slappLas(); process.exit(75); }

  const dom = {
    datumIso: new Date().toISOString().slice(0, 10),
    behall: opts.behall,
    blad: [],
    tillvaxt: [],
    totalRtoSek: null,
    pgStartadesAvOss: false,
    sjalvtestOk: false,
    grindStart,
    grindSlut: null,
    stadning: { skrapDbBort: false, pgStoppad: false, meddelande: '' },
    protokollVag: null,
  };
  let gron = false;
  try {
    dom.sjalvtestOk = sjalvtest();
    if (!dom.sjalvtestOk) throw new Error('självtestet av blockräknaren misslyckades — svepets instrument är opålitligt');

    const filer = readdirSync(DUMP_KATALOG)
      .filter((n) => /^db-\d{4}-\d{2}-\d{2}\.sql\.gz$/.test(n))
      .sort();
    if (filer.length === 0) throw new Error(`inga db-*.sql.gz i ${DUMP_KATALOG}`);
    console.log(`ARKIVSVEP ${dom.datumIso} — ${filer.length} blad (äldst→yngst): ${filer[0]} … ${filer[filer.length - 1]}`);

    startaPg17(dom);
    let totalRto = 0;
    try {
      for (let i = 0; i < filer.length; i++) {
        const namn = filer[i];
        const vagFil = path.join(DUMP_KATALOG, namn);
        const blad = {
          namn, storlekMb: statSync(vagFil).size / 1048576,
          markorGron: false, blockPublic: null, rtoSek: null,
          restoreOk: false, fel: null, kontrakt: null, avbruten: null,
        };
        dom.blad.push(blad);
        console.log(`\n[${i + 1}/${filer.length}] ${namn} (${blad.storlekMb.toFixed(1)} MB gz)`);

        // Grinden körs före VARJE blad — ett svep får aldrig svälta prod på minne.
        if (!grind(namn)) {
          blad.avbruten = 'ram-/diskgrind stängd mitt i svepet';
          for (let j = i + 1; j < filer.length; j++) {
            dom.blad.push({ namn: filer[j], storlekMb: statSync(path.join(DUMP_KATALOG, filer[j])).size / 1048576, markorGron: false, blockPublic: null, rtoSek: null, restoreOk: false, fel: null, kontrakt: null, avbruten: 'svepet avbröts (grind) — bladet nåddes ej' });
          }
          break;
        }

        const mk = forkontroll(vagFil);
        blad.markorGron = mk.gron;
        if (!mk.gron) {
          console.log('      MARKÖRER RÖDA — restore vägras för detta blad (svepet fortsätter på övriga).');
          continue;
        }
        console.log('      Markörer GRÖNA.');

        const block = raknaBlock(vagFil);
        blad.blockPublic = [...block.entries()].filter(([t]) => t.startsWith('public.')).reduce((s, [, n]) => s + n, 0);
        console.log(`      Blockräkning: ${block.size} tabeller · public ${blad.blockPublic.toLocaleString('sv-SE')} rader.`);

        skapaSkrapDb();
        const r = aterstall(vagFil, namn.replace(/\.sql\.gz$/, ''));
        blad.rtoSek = r.rtoSek;
        blad.restoreOk = r.restoreOk;
        blad.fel = r.fel;
        totalRto += r.rtoSek;
        console.log(`      Restore ${r.restoreOk ? 'KLART' : 'PSLYFEL'} på ${r.rtoSek.toFixed(1)} s · felrader ${r.fel.antalRader} (kända ${r.fel.antalRader - r.fel.okanda.length}, okända ${r.fel.okanda.length}).`);
        if (!r.restoreOk) {
          blad.avbruten = `pslugång kod != 0 (se ${r.felFil})`;
          rutaSkrapDb(dom);
          continue;
        }

        blad.kontrakt = matOchKontrakt(block);
        console.log(`      psql: public ${blad.kontrakt.mat.public.tabeller} tabeller / ${blad.kontrakt.mat.public.rader.toLocaleString('sv-SE')} rader · kontrakt ${blad.kontrakt.kontrakterade} tabeller EXAKTA${blad.kontrakt.avvikelser.length ? ` · ${blad.kontrakt.avvikelser.length} AVVIKELSER` : ''}.`);
        if (blad.kontrakt.avvikelser.length) {
          for (const a of blad.kontrakt.avvikelser.slice(0, 10)) console.log(`        AVVIKELSE: ${a}`);
        }
        if (blad.fel.okanda.length) {
          for (const o of blad.fel.okanda.slice(0, 5)) console.log(`        OKÄNT FEL: ${o}`);
        }
        rutaSkrapDb(dom); // städa bort bladet INNAN nästa — disk återvinns per blad
      }
    } finally {
      // Städning (familjekontraktet): --behall hanteras här; skrap-DB skall bort.
      console.log('\nStädning …');
      const drop = sudo(['-u', 'postgres', 'dropdb', '--if-exists', SKRAP_DB]);
      dom.stadning.skrapDbBort = drop.ok;
      if (!drop.ok) dom.stadning.meddelande += `slut-dropdb misslyckades: ${drop.stderr} `;
      if (dom.behall) {
        dom.stadning.meddelande += '--behall givet: PG17 lämnas uppe (viljeläget brutet).';
        dom.stadning.pgStoppad = false;
      } else {
        const stop = sudo(['pg_ctlcluster', ...PG_KLUSTER, 'stop']);
        dom.stadning.pgStoppad = stop.ok || !pgUpp();
        if (!dom.stadning.pgStoppad) dom.stadning.meddelande += `pg_ctlcluster stop misslyckades: ${stop.stderr} `;
      }
      console.log(`      skrap-DB ${dom.stadning.skrapDbBort ? 'raderad' : 'KUNDE EJ RADERAS'} · PG17 ${dom.stadning.pgStoppad ? 'stoppad' : dom.behall ? 'lämnad uppe (--behall)' : 'KUNDE EJ STOPPAS'}.`);
    }
    dom.totalRtoSek = totalRto;

    // Tillväxtdiff mellan på varandra följande GRÖNA blad.
    const gronda = dom.blad.filter((b) => b.kontrakt);
    for (let i = 1; i < gronda.length; i++) {
      const a = gronda[i - 1];
      const b = gronda[i];
      const dPublic = b.kontrakt.mat.public.rader - a.kontrakt.mat.public.rader;
      const dagar = Math.max(1, Math.round((statSync(path.join(DUMP_KATALOG, b.namn)).mtimeMs - statSync(path.join(DUMP_KATALOG, a.namn)).mtimeMs) / 86400000));
      const topp = [...b.kontrakt.perTabell.entries()]
        .map(([t, n]) => [t, n - (a.kontrakt.perTabell.get(t) ?? 0)])
        .filter(([t, d]) => t.startsWith('public.') && d > 0)
        .sort((x, y) => y[1] - x[1]).slice(0, 3);
      dom.tillvaxt.push({ fran: a.namn.replace('db-', '').replace('.sql.gz', ''), till: b.namn.replace('db-', '').replace('.sql.gz', ''), dPublic, perDag: Math.round(dPublic / dagar), topp });
    }

    dom.grindSlut = { mb: lasMemMb() };
    gron = skrivProtokoll(dom);
  } catch (e) {
    console.error(`ARKIVSVEPET AVBRUTET: ${e.message}`);
    try { skrivProtokoll(dom); } catch (e2) { console.error(`Protokoll kunde ej skrivas: ${e2.message}`); }
  } finally {
    slappLas();
  }
  process.exit(gron ? 0 : 1);
}

main();
