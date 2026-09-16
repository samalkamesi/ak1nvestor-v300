#!/usr/bin/env node
// dr-kedja2.mjs — mekaniserad DR-kedja 2: system_events ur moln-JSON-arkivet
// (spår 10, 2026-09-16). Komplement till dr-ovning.mjs (kedja 1 = SQL-dumpen):
// kvartalsmallen är BÅDA kedjorna — detta verktyg gör kedja 2 till ett
// kommando, precis som u4 gjorde kedja 1.
//
// Flöde: flock-lås (sama fil som dr-ovning.mjs) → senaste arkiv väljs →
// PG17-start (om nere) → färsk skrap-DB ak1a_dr_json (owner ak1a) → tabell-
// DDL ur SENASTE SQL-dumpen (prodens egen definition; kirurgiskt byte
// extensions.uuid_generate_v4() → gen_random_uuid() — moln-schemat finnes
// ej lokalt och DEFAULT är utan betydelse då COPY bär egna id:n) →
// aterstall-system-events.mjs --db (u3:2:s bevisade verktyg) → oberoende
// PG-verifiering → maskinellt protokoll → GARANTERAD städning (finally).
//
// Flaggor: --fil <arkiv> (override) · --behall (lämna skrap-DB+PG för
// manuell undersökning) · --hjalp
// Exit: 0 GRÖN · 1 RÖT (protokoll skrivs ändå) · 75 ram-/diskgrind stängd.

import { spawnSync } from 'node:child_process';
import {
  existsSync, openSync, closeSync, readFileSync, writeFileSync, unlinkSync,
  readdirSync, statSync,
} from 'node:fs';
import { dirname as pathDirname, join as pathJoin, basename as pathBasename } from 'node:path';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const REPO_ROT = path.resolve(pathDirname(fileURLToPath(import.meta.url)), '..');
const ARKIV_KATALOG = pathJoin(REPO_ROT, 'data', 'backups');
const DUMP_KATALOG = pathJoin(REPO_ROT, 'data', 'backups', 'supabase');
const LAS_VAG = '/tmp/ak1a-dr-prov.lock';
const DB = 'ak1a_dr_json';
const PG_KLUSTER = ['17', 'main'];

function lasArgument() {
  const args = process.argv.slice(2);
  const opts = { fil: null, behall: false };
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--fil') opts.fil = args[++i];
    else if (args[i] === '--behall') opts.behall = true;
    else if (args[i] === '--hjalp' || args[i] === '--help') {
      console.log('Användning: node verktyg/dr-kedja2.mjs [--fil <system-events-full-*.json.gz>] [--behall]');
      process.exit(0);
    } else {
      console.error(`Okänt argument: ${args[i]} (se --hjalp)`);
      process.exit(2);
    }
  }
  return opts;
}

function kor(kommando, args, opts = {}) {
  const r = spawnSync(kommando, args, { encoding: 'utf8', timeout: opts.timeoutMs ?? 120000, maxBuffer: 64 * 1024 * 1024 });
  return { ok: r.status === 0, status: r.status, stdout: (r.stdout || '').trim(), stderr: (r.stderr || '').trim() };
}
const sudo = (args, opts) => kor('sudo', ['-n', ...args], opts);
const log = (s) => console.log(s);

// --- Flock-lager: identiskt kontrakt som dr-ovning.mjs (u3:2:s fynd 6-kur) ---

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

function taLas() {
  if (process.env.AK1A_DR_FLOCK === '1') {
    const fd = openSync(LAS_VAG, 'w');
    writeFileSync(fd, `pid=${process.pid} start=${new Date().toISOString()} verktyg=dr-kedja2.mjs flock=1\n`);
    closeSync(fd);
    return;
  }
  if (existsSync(LAS_VAG)) {
    const innehall = (() => { try { return readFileSync(LAS_VAG, 'utf8').trim(); } catch { return '?'; } })();
    const alder = (Date.now() - statSync(LAS_VAG).mtimeMs) / 60000;
    if (alder < 30) {
      console.error(`LÅSET UPTAGET (${alder.toFixed(1)} min): ${innehall} — DR-fönstret ägs av annan agent.`);
      process.exit(3);
    }
    unlinkSync(LAS_VAG);
  }
  const fd = openSync(LAS_VAG, 'wx');
  writeFileSync(fd, `pid=${process.pid} start=${new Date().toISOString()} verktyg=dr-kedja2.mjs\n`);
  closeSync(fd);
}

function slappLas() {
  if (process.env.AK1A_DR_FLOCK === '1') return; // flock äger filens livslängd
  try { unlinkSync(LAS_VAG); } catch { /* redan borta */ }
}

function grind() {
  const mem = /MemAvailable:\s+(\d+) kB/.exec(readFileSync('/proc/meminfo', 'utf8'));
  const mb = mem ? Math.round(Number(mem[1]) / 1024) : 0;
  if (mb < 1000) {
    console.error(`RAMGRIND: MemAvailable ${mb} MB < 1000 MB — SKIPPAS (exit 75).`);
    return false;
  }
  const df = kor('df', ['-k', '/']);
  const gbLedigt = Number((((df.stdout || '').split('\n')[1] || '').trim().split(/\s+/)[3] || 0)) / 1024 / 1024;
  if (gbLedigt < 5) {
    console.error(`DISKGRIND: ${gbLedigt.toFixed(1)} GB ledigt < 5 GB — SKIPPAS (exit 75).`);
    return false;
  }
  log(`[0] Grind OK: MemAvailable ${mb} MB · ${gbLedigt.toFixed(0)} GB ledigt.`);
  return true;
}

function hittaSenaste(katalog, monster) {
  if (!existsSync(katalog)) return null;
  const filer = readdirSync(katalog).filter((n) => monster.test(n)).sort();
  return filer.length ? pathJoin(katalog, filer[filer.length - 1]) : null;
}

function pgUpp() { return sudo(['-u', 'postgres', 'pg_isready', '-q']).ok; }

function skrivProtokoll(dom) {
  let vag = pathJoin(REPO_ROT, 'data', 'forskning', `DR-KEDJA2-${dom.datumIso}-AUTO.md`);
  let n = 2;
  while (existsSync(vag)) vag = pathJoin(REPO_ROT, 'data', 'forskning', `DR-KEDJA2-${dom.datumIso}-AUTO-${n++}.md`);
  const v = dom.verifiering || {};
  const text = `# DR-KEDJA 2 ${dom.datumIso} — system_events ur moln-JSON (AUTO)

Körd av \`verktyg/dr-kedja2.mjs\` (spår 10). Arkiv: ${dom.arkivNamn} ·
DDL-källa: ${dom.dumpNamn}. Verktyg (u3:2): aterstall-system-events.mjs --db ${DB}.

| Moment | Resultat |
|---|---|
| RTO väggklocka | ${dom.rtoSek} (totalt fönster ${dom.fonsterSek} s) |
| COPY rader | ${dom.kopyRader} |
| Verktygsdom | ${dom.dom} (exit ${dom.exit}) |
| Rader i PG (oberoende) | ${v.rader ?? 'nåddes ej'} |
| Unika id | ${v.unikaId ?? 'nåddes ej'} |
| Tidsfönster | ${v.fonster ?? 'nåddes ej'} |
| Severity | ${v.severity ?? 'nåddes ej'} |
| Typer | ${v.typer ?? 'nåddes ej'} |
| jsonb-prov (details->>'dag') | ${v.jsonbProv ?? 'nåddes ej'} |
| Städning | ${dom.stadning} |

DDl-not: ${dom.ddlNot || 'ingen'}

SLUT — maskinellt genererat av dr-kedja2.mjs ${new Date().toISOString()}
`;
  writeFileSync(vag, text);
  log(`[7] Protokoll: ${path.relative(REPO_ROT, vag)}`);
}

function main() {
  const opts = lasArgument();
  flockStartaOm();
  taLas();
  if (!grind()) { slappLas(); process.exit(75); }
  const dom = { datumIso: new Date().toISOString().slice(0, 10), behall: opts.behall, stadning: '' };
  let gron = false;
  let pgStartadAvOss = false;
  try {
    const arkiv = opts.fil ? path.resolve(opts.fil) : hittaSenaste(ARKIV_KATALOG, /^system-events-full-.*\.json\.gz$/);
    if (!arkiv) throw new Error(`inget system-events-full-*.json.gz i ${ARKIV_KATALOG} — moln-JSON-kedjan har inget arkiv (RPO-fynd: hybrid-sync?)`);
    dom.arkivNamn = pathBasename(arkiv);
    dom.dumpNamn = pathBasename(hittaSenaste(DUMP_KATALOG, /^db-\d{4}-\d{2}-\d{2}\.sql\.gz$/) || '(ingen dump — DDL krävs)');
    log(`DR-KEDJA 2 ${dom.datumIso} — arkiv: ${dom.arkivNamn} · DDL ur: ${dom.dumpNamn}`);

    if (!pgUpp()) {
      const r = sudo(['pg_ctlcluster', ...PG_KLUSTER, 'start']);
      if (!r.ok && !pgUpp()) throw new Error('pg_ctlcluster start: ' + r.stderr);
      pgStartadAvOss = true;
      log('[1] PG17 startad (korrekt viloläge emellan).');
    } else {
      log('[1] PG17 var REDAN uppe vid ankomst (protokollfynd — oväntat).');
    }

    const roll = sudo(['-u', 'postgres', 'psql', '-X', '-q', '-A', '-t', '-c', "SELECT 1 FROM pg_roles WHERE rolname='ak1a'"]);
    if (roll.stdout !== '1') {
      const r = sudo(['-u', 'postgres', 'createuser', '-s', 'ak1a']);
      if (!r.ok) throw new Error('createuser: ' + r.stderr);
      log('[2] Roll ak1a skapad (superuser, endast lokala klustret).');
    } else {
      log('[2] Roll ak1a finns.');
    }

    let r = sudo(['-u', 'postgres', 'dropdb', '--if-exists', DB]);
    if (!r.ok) throw new Error('dropdb: ' + r.stderr);
    r = sudo(['-u', 'postgres', 'createdb', '--owner=ak1a', DB]);
    if (!r.ok) throw new Error('createdb: ' + r.stderr);
    log(`[3] ${DB} skapad färsk (owner ak1a).`);

    const dumpVag = pathJoin(DUMP_KATALOG, dom.dumpNamn);
    const ddlRadt = kor('bash', ['-c', `zcat '${dumpVag.replace(/'/g, "'\\''")}' | awk '/^CREATE TABLE public.system_events /{f=1} f{print} f&&/\\);/{exit}'`], { timeoutMs: 180000 });
    if (!ddlRadt.ok || !ddlRadt.stdout.includes('CREATE TABLE')) throw new Error('DDL-extraktion ur dumpen misslyckades: ' + ddlRadt.stderr);
    const ddl = ddlRadt.stdout.replace(/extensions\.uuid_generate_v4\(\)/g, 'gen_random_uuid()');
    if (ddl !== ddlRadt.stdout) dom.ddlNot = 'extensions.uuid_generate_v4() → gen_random_uuid() (moln-schema finnes ej lokalt; DEFAULT utan betydelse för COPY)';
    r = kor('psql', ['-X', '-v', 'ON_ERROR_STOP=1', '-d', DB, '-c', ddl]);
    if (!r.ok) throw new Error('CREATE TABLE: ' + r.stderr);
    log('[4] Tabell public.system_events skapad enligt dumpens DDL.');

    const t0 = Date.now();
    const rv = kor('node', [pathJoin(REPO_ROT, 'verktyg', 'aterstall-system-events.mjs'), '--fil', arkiv, '--db', DB], { timeoutMs: 600000 });
    dom.fonsterSek = ((Date.now() - t0) / 1000).toFixed(1);
    console.log(rv.stdout || '');
    if (rv.stderr) console.error(rv.stderr);
    const msMatch = Number((rv.stdout.match(/totalt (\d+) ms/) || [])[1]);
    dom.rtoSek = ((Number.isFinite(msMatch) && msMatch > 0 ? msMatch / 1000 : Number(dom.fonsterSek)).toFixed(1)) + ' s';
    dom.kopyRader = (rv.stdout.match(/COPY-n=(\d+)/) || [])[1] || '?';
    dom.dom = rv.stdout.includes('DOM: GRÖN') ? 'GRÖN' : 'RÖD';
    dom.exit = rv.status;
    log(`[5] Verktyget exit=${rv.status} · dom ${dom.dom} · totalt fönster ${dom.fonsterSek} s.`);
    if (rv.status !== 0) throw new Error('kedja 2-verktyget RÖT (exit ' + rv.status + ')');

    const fragor = {
      rader: 'SELECT count(*) FROM public.system_events',
      unikaId: 'SELECT count(distinct id) FROM public.system_events',
      typer: "SELECT string_agg(t.e||'='||t.n, ' · ' ORDER BY t.n DESC) FROM (SELECT event_type AS e, count(*) AS n FROM public.system_events GROUP BY event_type) t",
      fonster: "SELECT min(created_at)||' … '||max(created_at) FROM public.system_events",
      severity: "SELECT string_agg(t.e||'='||t.n, ' · ' ORDER BY t.n DESC) FROM (SELECT severity AS e, count(*) AS n FROM public.system_events GROUP BY severity) t",
      jsonbProv: "SELECT count(*) FROM public.system_events WHERE details->>'dag' IS NOT NULL",
    };
    log('[6] Oberoende PG-verifiering:');
    for (const [namn, f] of Object.entries(fragor)) {
      const q = sudo(['-u', 'postgres', 'psql', '-X', '-q', '-A', '-t', '-d', DB, '-c', f], { timeoutMs: 300000 });
      if (!q.ok) throw new Error('verifiering ' + namn + ': ' + q.stderr);
      dom.verifiering = dom.verifiering || {};
      dom.verifiering[namn] = q.stdout.replace(/\n/g, ' ').slice(0, 400);
      log(`    ${namn}: ${dom.verifiering[namn]}`);
    }
    gron = true;
  } catch (e) {
    console.error('DR-KEDJA 2 AVBRUTEN: ' + e.message);
    dom.avbrots = e.message;
  } finally {
    const d = sudo(['-u', 'postgres', 'dropdb', '--if-exists', DB]);
    let stopPad = false;
    if (pgStartadAvOss && !dom.behall) stopPad = sudo(['pg_ctlcluster', ...PG_KLUSTER, 'stop']).ok || !pgUpp();
    const nere = !pgUpp();
    dom.stadning = `${DB} ${d.ok ? 'raderad' : 'KUNDE EJ RADERAS: ' + d.stderr} · PG17 ${nere ? 'stoppad/nere' : dom.behall ? 'lämnad uppe (--behall)' : (pgStartadAvOss ? 'STOP MISSLYCKADES' : 'var uppe vid ankomst — lämnas')}`;
    log(`[7] Städning: ${dom.stadning}`);
    try { skrivProtokoll(dom); } catch (e2) { console.error('Protokoll kunde ej skrivas: ' + e2.message); }
    slappLas();
  }
  process.exit(gron ? 0 : 1);
}

main();
