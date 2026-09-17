#!/usr/bin/env node
// dr-index-prov.mjs — DR-fönstrets index-prov: ALTER-system_events-composite.sql
// testad mot ÄKTA data i skrap-PG (spår 10, 2026-09-16).
//
// Bakgrund (bokförd kö i SYSTEMKARTAN E33 gap 3 + s9-u3:s kö-rad): filen
// data/sql/ALTER-system_events-composite.sql (våg 63) ligger OKÖRD och kö-rad
// "kör vid nästa DR-fönster". Innan huvudagenten röra prod-DDL ska filen vara
// TESTAD — detta verktyg gör provet i isolerad skrap-DB utan att röra prod:
//
// Flöde: flock-lås (samma fil som dr-ovning/dr-kedja2/3/4) → grind → senaste
// SQL-dumpens system_events-DDL + index/PK råa ur dumpen (prodens EGET
// indexläge blir baslinjen — inga påhittade index) → senaste moln-JSON-arkivets
// rader via aterstall-system-events.mjs --db (u3:2:s bevisade verktyg) →
// kolumn-/indexinventering → baseline EXPLAIN ANALYZE på filens eget läsmönster
// (type=eq.X&order=created_at.desc) → RÅA FILEN ordagrant (förväntad RÖD vid
// schemadrift type→event_type) → KURERAD sats mot verklig kolumn CONCURRENTLY →
// efter-mätning → maskinellt protokoll → GARANTERAD städning (finally).
//
// Flaggor: --behall (lämna skrap-DB+PG för manuell undersökning) · --hjalp
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
const RAW_SQL = pathJoin(REPO_ROT, 'data', 'sql', 'ALTER-system_events-composite.sql');
const LAS_VAG = '/tmp/ak1a-dr-prov.lock';
const DB = 'ak1a_dr_index';
const PG_KLUSTER = ['17', 'main'];
const VERKTYG_NAMN = 'dr-index-prov.mjs';

function lasArgument() {
  const args = process.argv.slice(2);
  const opts = { behall: false };
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--behall') opts.behall = true;
    else if (args[i] === '--hjalp' || args[i] === '--help') {
      console.log('Användning: node verktyg/dr-index-prov.mjs [--behall]');
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

// --- Flock-lager: identiskt kontrakt som dr-ovning.mjs (u3:2 fynd 6-kur) ---

function flockStartaOm() {
  if (process.env.AK1A_DR_FLOCK === '1') return;
  const skriptVag = fileURLToPath(import.meta.url);
  const r = spawnSync('flock', ['-w', '900', LAS_VAG, process.execPath, skriptVag, ...process.argv.slice(2)], {
    stdio: 'inherit',
    env: { ...process.env, AK1A_DR_FLOCK: '1' },
    timeout: 960000,
  });
  if (r.error) {
    console.error(`FLOCK-KRITISKT: kunde inte starta om under flock (${r.error.message}) — provet vägras utan lås.`);
    process.exit(1);
  }
  process.exit(r.status ?? 1);
}

function taLas() {
  if (process.env.AK1A_DR_FLOCK === '1') {
    const fd = openSync(LAS_VAG, 'w');
    writeFileSync(fd, `pid=${process.pid} start=${new Date().toISOString()} verktyg=${VERKTYG_NAMN} flock=1\n`);
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
  writeFileSync(fd, `pid=${process.pid} start=${new Date().toISOString()} verktyg=${VERKTYG_NAMN}\n`);
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

function sqlTals(v) { return v.replace(/'/g, "''"); }

// Kör en SQL-sats mot skrap-DB:n som user ak1a (DB:ns owner).
function sql(fraga, opts = {}) {
  return kor('psql', ['-X', '-q', '-A', '-t', ...((opts.stopp ? ['-v', 'ON_ERROR_STOP=1'] : [])), '-d', DB, '-c', fraga], opts);
}

// EXPLAIN ANALYZE — returnerar { ms, planFynd, rader } ur psql-utdata.
function explainAnalys(fraga) {
  const r = sql('EXPLAIN (ANALYZE, BUFFERS) ' + fraga, { stopp: true, timeoutMs: 300000 });
  if (!r.ok) return { fel: r.stderr.slice(0, 500) };
  const ut = r.stdout || '';
  const ms = Number((ut.match(/Execution Time: ([0-9.]+) ms/) || [])[1] || NaN);
  const planFynd = [
    ut.includes('Seq Scan') ? 'Seq Scan' : null,
    ut.includes('Index Scan') ? (ut.includes('Backward') ? 'Index Scan Backward' : 'Index Scan') : null,
    ut.includes('Sort Method') ? 'Sort' : null,
  ].filter(Boolean).join(' + ');
  return { ms, planFynd, ut: ut.slice(0, 1600) };
}

function skrivProtokoll(dom) {
  let vag = pathJoin(REPO_ROT, 'data', 'forskning', `DR-INDEX-PROV-${dom.datumIso}.md`);
  let n = 2;
  while (existsSync(vag)) vag = pathJoin(REPO_ROT, 'data', 'forskning', `DR-INDEX-PROV-${dom.datumIso}-${n++}.md`);
  const m = dom.mat || {};
  const v = dom.verifiering || {};
  const text = `# DR-INDEX-PROV ${dom.datumIso} — ALTER-system_events-composite.sql mot äkta data (AUTO)

Körd av \`verktyg/${VERKTYG_NAMN}\` (spår 10). Testobjekt: data/sql/ALTER-system_events-composite.sql
(våg 63, okörd sedan dess). DDL-källa: ${dom.dumpNamn} · rader: ${dom.arkivNamn}.
Skrap-DB: ${DB} (isolerad PG17; prod RÖRDES ALDRIG — prod-DDL förblir huvudagentens).

| Moment | Resultat |
|---|---|
| Tabell-DDL ur dumpen | ${m.ddlKolumner ?? 'nåddes ej'} |
| Sekundära index i dumpen (prodens läge) | ${m.indexUrDump ?? 'nåddes ej'} |
| COPY rader (verktyg u3:2) | ${m.kopyRader ?? 'nåddes ej'} · totalt fönster ${m.kopySek ?? '?'} s |
| PK-mätning (kedja 1 + 2 i sekvens = katastrofens väg) | ${m.pkDom ?? 'nåddes ej'} |
| Dublett-id i datat | ${v.dublettId ?? 'nåddes ej'} |
| Testfråga (filens eget läsmönster) | ${m.fraga ?? 'nåddes ej'} |
| Baseline (före index) | ${m.baseMs ?? '?'} ms · plan: ${m.basePlan ?? '?'} |
| RÅA FILEN ordagrant | ${m.rawDom} ${m.rawFel ? '— fel: `' + m.rawFel + '`' : ''}
| Kurera sats (kolumn ${m.kurKolumn ? m.kurKolumn : '—'}, CONCURRENTLY) | ${m.kurDom} ${m.kurSek ? '· bygg_tid ' + m.kurSek : ''} |
| Efter index | ${m.efterMs ?? '?'} ms · plan: ${m.efterPlan ?? '?'} |
| Vinst | ${m.vinst ?? '?'} |
| Tabellstorlek (före index) | ${v.tabellStorlek ?? 'nåddes ej'} |
| Index-/tabellstorlek (efter) | ${v.storlekar ?? 'nåddes ej'} |
| Index aktivt (pg_indexes) | ${v.indexAktiva ?? 'nåddes ej'} |
| Dom | ${dom.dom} (exit ${dom.exit}) |
| Städning | ${dom.stadning} |

Rå filens sats (ordagrant testad):
\`\`\`sql
${m.rawSql || '(nåddes ej)'}
\`\`\`

Kurerad sats (verifierad GRÖN här — kandidat för ny fil):
\`\`\`sql
${m.kurSql || '(behövdes ej — rå filen körbar)'}
\`\`\`

Baseline-plan (klipp):
\`\`\`
${m.baseUt || '(nåddes ej)'}
\`\`\`

Efter-plan (klipp):
\`\`\`
${m.efterUt || '(nåddes ej)'}
\`\`\`

Avbrottsorsak: ${dom.avbrots || 'ingen'}

SLUT — maskinellt genererat av ${VERKTYG_NAMN} ${new Date().toISOString()}
`;
  writeFileSync(vag, text);
  log(`[9] Protokoll: ${path.relative(REPO_ROT, vag)}`);
}

function main() {
  const opts = lasArgument();
  flockStartaOm();
  taLas();
  if (!grind()) { slappLas(); process.exit(75); }
  const dom = { datumIso: new Date().toISOString().slice(0, 10), dom: 'RÖD', exit: 1, stadning: '' };
  const m = dom.mat = {};
  let gron = false;
  let pgStartadAvOss = false;
  try {
    const dump = hittaSenaste(DUMP_KATALOG, /^db-\d{4}-\d{2}-\d{2}\.sql\.gz$/);
    const arkiv = hittaSenaste(ARKIV_KATALOG, /^system-events-full-.*\.json\.gz$/);
    if (!dump) throw new Error('ingen db-*.sql.gz i ' + DUMP_KATALOG);
    if (!arkiv) throw new Error('inget system-events-full-*.json.gz i ' + ARKIV_KATALOG);
    dom.dumpNamn = pathBasename(dump);
    dom.arkivNamn = pathBasename(arkiv);
    if (!existsSync(RAW_SQL)) throw new Error('testobjektet saknas: ' + RAW_SQL);
    log(`DR-INDEX-PROV ${dom.datumIso} — objekt: data/sql/ALTER-system_events-composite.sql · DDL ur ${dom.dumpNamn} · rader ur ${dom.arkivNamn}`);

    if (!pgUpp()) {
      const r = sudo(['pg_ctlcluster', ...PG_KLUSTER, 'start']);
      if (!r.ok && !pgUpp()) throw new Error('pg_ctlcluster start: ' + r.stderr);
      pgStartadAvOss = true;
      log('[1] PG17 startad (korrekt viloläge emellan).');
    } else {
      log('[1] PG17 var uppe vid ankomst (protokollfynd — oväntat).');
    }

    const roll = sudo(['-u', 'postgres', 'psql', '-X', '-q', '-A', '-t', '-c', "SELECT 1 FROM pg_roles WHERE rolname='ak1a'"]);
    if (roll.stdout !== '1') {
      const r = sudo(['-u', 'postgres', 'createuser', '-s', 'ak1a']);
      if (!r.ok) throw new Error('createuser: ' + r.stderr);
    }
    let r = sudo(['-u', 'postgres', 'dropdb', '--if-exists', DB]);
    if (!r.ok) throw new Error('dropdb: ' + r.stderr);
    r = sudo(['-u', 'postgres', 'createdb', '--owner=ak1a', DB]);
    if (!r.ok) throw new Error('createdb: ' + r.stderr);
    log(`[2] ${DB} skapad färsk (owner ak1a).`);

    // Tabell-DDL rå ur dumpen (prodens egen definition) + uuid-kirurgen.
    const z = (pipeCmd) => kor('bash', ['-c', `zcat '${dump.replace(/'/g, "'\\''")}' | ${pipeCmd}`], { timeoutMs: 180000 });
    const ddlR = z(`awk '/^CREATE TABLE public.system_events /{f=1} f{print} f&&/\\);/{exit}'`);
    if (!ddlR.ok || !ddlR.stdout.includes('CREATE TABLE')) throw new Error('DDL-extraktion: ' + ddlR.stderr);
    const ddl = ddlR.stdout.replace(/extensions\.uuid_generate_v4\(\)/g, 'gen_random_uuid()');
    r = sql(ddl, { stopp: true });
    if (!r.ok) throw new Error('CREATE TABLE: ' + r.stderr);
    m.ddlKolumner = ddl.split('\n').slice(1, -1).map((l) => l.trim().split(/\s+/)[0]).filter((n) => !n.startsWith(')')).join(', ');
    log('[3] Tabell skapad enligt dumpens DDL. Kolumner: ' + m.ddlKolumner);

    // Prodens EGET indexläge ur dumpen (inventeras nu, appliceras EFTER COPY —
    // se PK-fyndet nedan: COPY mot PK-bärande tabell dör på arkivets dublett-id).
    const pkR = z(`awk '/^ALTER TABLE ONLY public.system_events$/{f=1} f{print} f&&/;$/{exit}'`);
    const indexR = z(`grep -E '^CREATE (UNIQUE )?INDEX [^;]*ON public\\.system_events ' || true`);
    m.indexUrDump = indexR.stdout ? indexR.stdout.split('\n').filter(Boolean).length + ' st (se nedan)' : '0 st — INGA sekundära index i prod';
    if (pkR.stdout) m.indexUrDump += ' · PK: ' + pkR.stdout.split('\n').map((l) => l.trim()).join(' ').slice(0, 120);
    log(`[4] Dumpens indexläge för system_events: ${m.indexUrDump}`);

    // Rader ur moln-JSON-arkivet (kedja 2:s bevisade verktyg; tabellen ännu
    // utan PK — exakt dr-kedja2-kontraktet, annars dör COPY på dublett-id).
    const t0 = Date.now();
    const rv = kor('node', [pathJoin(REPO_ROT, 'verktyg', 'aterstall-system-events.mjs'), '--fil', arkiv, '--db', DB], { timeoutMs: 600000 });
    m.kopySek = ((Date.now() - t0) / 1000).toFixed(1);
    console.log(rv.stdout || '');
    if (rv.stderr) console.error(rv.stderr);
    m.kopyRader = (rv.stdout.match(/COPY-n=(\d+)/) || [])[1] || (rv.stdout.match(/Läst:\s+(\d+) rader/) || [])[1] || '?';
    if (rv.status !== 0) throw new Error('aterstall-system-events.mjs exit ' + rv.status + ' (kedja 2-verktyget RÖT)');
    log(`[5] ${m.kopyRader} rader inlästa på ${m.kopySek} s.`);

    // PK-FYND-MÄTNING: prodens PK (ur dumpen) mot arkivets rader. En full
    // kedja-1-restore föder tabellen MED PK — detta steg bevisar om kedja-2-
    // importen då överlever (prod-katastrofens verkliga sekvens).
    if (pkR.stdout) {
      const pkSats = pkR.stdout.replace(/extensions\.uuid_generate_v4\(\)/g, 'gen_random_uuid()');
      const pkF = sql(pkSats, { stopp: true, timeoutMs: 300000 });
      m.pkDom = pkF.ok
        ? 'PK LAGD GRÖNT (0 dublett-id detta arkiv)'
        : 'PK UNDERKÄND — ' + (pkF.stderr.split('\n').find((l) => /ERROR|DETAIL/.test(l)) || pkF.stderr).slice(0, 220);
      log(`[5b] PK-mätning: ${m.pkDom}`);
    }

    // Oberoende verifiering.
    const v = dom.verifiering = {};
    const vFragor = {
      rader: 'SELECT count(*) FROM public.system_events',
      unikaId: 'SELECT count(distinct id) FROM public.system_events',
      fonster: "SELECT min(created_at)||' … '||max(created_at) FROM public.system_events",
      indexAktiva: "SELECT coalesce(string_agg(indexname, ', ' ORDER BY indexname), '(inga)') FROM pg_indexes WHERE tablename='system_events'",
      tabellStorlek: `SELECT pg_size_pretty(pg_relation_size('public.system_events'))`,
    };
    log('[6] Oberoende verifiering:');
    for (const [namn, f] of Object.entries(vFragor)) {
      const q = sql(f, { timeoutMs: 300000 });
      if (!q.ok) throw new Error('verifiering ' + namn + ': ' + q.stderr);
      v[namn] = q.stdout.replace(/\n/g, ' ').slice(0, 400);
      log(`    ${namn}: ${v[namn]}`);
    }
    v.dublettId = `${Number(v.rader) - Number(v.unikaId)} (rader ${v.rader} − unika ${v.unikaId})`;

    // Kolumninventering → filens förutsättning doms.
    const koll = sql("SELECT string_agg(column_name, ',' ORDER BY ordinal_position) FROM information_schema.columns WHERE table_name='system_events'", { stopp: true });
    if (!koll.ok) throw new Error('kolumninventering: ' + koll.stderr);
    const kolumner = koll.stdout.split(',');
    const harEventType = kolumner.includes('event_type');
    const harType = kolumner.includes('type');
    m.kurKolumn = harEventType ? 'event_type' : harType ? 'type' : null;
    log(`[7] Kolumner: ${kolumner.join(', ')} → filens 'type' ${harType ? 'FINNS' : 'FINNS EJ'}${harEventType ? " · verklig kolumn 'event_type'" : ''}.`);

    // Testfråga = filens eget motiverade läsmönster (type=eq.X&order=created_at.desc) på den största typen.
    const kolumn = m.kurKolumn;
    const toppR = sql(`SELECT ${kolumn}, count(*) FROM public.system_events GROUP BY ${kolumn} ORDER BY count(*) DESC LIMIT 1`, { stopp: true });
    if (!toppR.ok) throw new Error('topp-typ: ' + toppR.stderr);
    const [toppTyp, toppN] = toppR.stdout.split('|').map((s) => s.trim());
    m.fraga = `SELECT id, ${kolumn}, severity, created_at FROM system_events WHERE ${kolumn}='${sqlTals(toppTyp)}' ORDER BY created_at DESC LIMIT 20 (topp-typ ${toppTyp}, ${toppN} rader)`;
    const fragaSql = `SELECT id, ${kolumn}, severity, created_at FROM public.system_events WHERE ${kolumn}='${sqlTals(toppTyp)}' ORDER BY created_at DESC LIMIT 20`;

    const base = explainAnalys(fragaSql);
    if (base.fel) throw new Error('baseline EXPLAIN: ' + base.fel);
    m.baseMs = base.ms?.toFixed?.(1); m.basePlan = base.planFynd; m.baseUt = base.ut;
    log(`[7] Baseline: ${m.baseMs} ms · plan: ${m.basePlan}`);

    // RÅA FILEN — ordagrant, exakt som huvudagenten skulle klistra in den.
    m.rawSql = readFileSync(RAW_SQL, 'utf8').split('\n').filter((l) => /^\s*CREATE INDEX/.test(l)).join('\n');
    const rawR = kor('psql', ['-X', '-v', 'ON_ERROR_STOP=1', '-d', DB, '-f', RAW_SQL], { timeoutMs: 600000 });
    m.rawDom = rawR.ok ? 'KÖRBAR (GRÖN)' : 'UNDERKÄND (RÖD)';
    if (!rawR.ok) {
      m.rawFel = (rawR.stderr.split('\n').find((l) => /ERROR/.test(l)) || rawR.stderr).slice(0, 200);
      log(`[8] RÅA FILEN RÖD som förmodat: ${m.rawFel}`);
    } else {
      log('[8] RÅA FILEN KÖRBAR GRÖN (schemadrift ej aktuell).');
    }

    // Kurera sats ENDAST om rå filen underkändes — mot verklig kolumn, med
    // korrekt PG-syntax (rå filens "IF NOT EXISTS CONCURRENTLY" är ett
    // bevisat syntaxfel). Kandidatordning: CONCURRENTLY IF NOT EXISTS →
    // CONCURRENTLY → vanlig. Misslyckad CONCURRENTLY kan lämna INVALID
    // index — städas med DROP IF EXISTS mellan försöken.
    let indexByggt = rawR.ok;
    if (!rawR.ok) {
      if (!kolumn) throw new Error('kur kräver kolumn type/event_type — ingen finns');
      const kandidater = [
        `CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_system_events_type_created\n  ON public.system_events(${kolumn}, created_at desc);`,
        `CREATE INDEX CONCURRENTLY idx_system_events_type_created\n  ON public.system_events(${kolumn}, created_at desc);`,
        `CREATE INDEX IF NOT EXISTS idx_system_events_type_created\n  ON public.system_events(${kolumn}, created_at desc);`,
      ];
      for (let i = 0; i < kandidater.length && !indexByggt; i++) {
        const tb = Date.now();
        const kandR = sql(kandidater[i], { stopp: true, timeoutMs: 600000 });
        const sek = ((Date.now() - tb) / 1000).toFixed(1);
        if (kandR.ok) {
          indexByggt = true;
          m.kurSql = kandidater[i];
          m.kurSek = sek + ' s (kandidat ' + (i + 1) + ')';
          m.kurDom = `KÖRD GRÖN — kandidat ${i + 1} av ${kandidater.length}`;
        } else {
          log(`[8] kandidat ${i + 1} RÖD på ${sek} s: ${(kandR.stderr.split('\n').find((l) => /ERROR/.test(l)) || kandR.stderr).slice(0, 160)} — städar och provar nästa form`);
          sql('DROP INDEX IF EXISTS idx_system_events_type_created', { timeoutMs: 120000 });
        }
      }
      if (!indexByggt) m.kurDom = 'UNDERKÄND — samtliga kandidatformer RÖDA';
      log(`[8] Kurera sats (${kolumn}): ${m.kurDom}${m.kurSek ? ' på ' + m.kurSek : ''}`);
    } else {
      m.kurDom = '(behövdes ej)';
    }

    // Efter-mätning + dom.
    if (indexByggt) {
      const efter = explainAnalys(fragaSql);
      if (efter.fel) throw new Error('efter EXPLAIN: ' + efter.fel);
      m.efterMs = efter.ms?.toFixed?.(1); m.efterPlan = efter.planFynd; m.efterUt = efter.ut;
      const forbattring = Number.isFinite(base.ms) && Number.isFinite(efter.ms) && base.ms > 0 ? (base.ms / Math.max(efter.ms, 0.001)).toFixed(1) : null;
      m.vinst = forbattring ? `${m.baseMs} ms → ${m.efterMs} ms = ${forbattring}× snabbare · ${m.basePlan} → ${m.efterPlan}` : `${m.baseMs} ms → ${m.efterMs} ms`;
      log(`[9] Efter: ${m.efterMs} ms · plan: ${m.efterPlan} · vinst: ${m.vinst}`);
      const storl = sql(`SELECT pg_size_pretty(pg_relation_size('public.system_events'))||' / '||pg_size_pretty(pg_relation_size('public.idx_system_events_type_created'))`, { timeoutMs: 120000 });
      if (storl.ok) v.storlekar = storl.stdout + ' (tabell / index)';
      const idxAktiv = sql(vFragor.indexAktiva, { timeoutMs: 120000 });
      if (idxAktiv.ok) v.indexAktiva = idxAktiv.stdout;
      gron = efter.planFynd.includes('Index Scan') || (Number.isFinite(base.ms) && Number.isFinite(efter.ms) && efter.ms < base.ms);
    } else {
      m.vinst = 'inget index byggt — rå filen underkänd OCH kurerad sats underkänd';
    }
  } catch (e) {
    console.error('DR-INDEX-PROV AVBRUTET: ' + e.message);
    dom.avbrots = e.message;
  } finally {
    const d = sudo(['-u', 'postgres', 'dropdb', '--if-exists', DB]);
    let stopPad = false;
    if (pgStartadAvOss && !opts.behall) stopPad = sudo(['pg_ctlcluster', ...PG_KLUSTER, 'stop']).ok || !pgUpp();
    const nere = !pgUpp();
    dom.stadning = `${DB} ${d.ok ? 'raderad' : 'KUNDE EJ RADERAS: ' + d.stderr} · PG17 ${nere ? 'stoppad/nere' : opts.behall ? 'lämnad uppe (--behall)' : (pgStartadAvOss ? 'STOP MISSLYCKADES' : 'var uppe vid ankomst — lämnas')}`;
    log(`[10] Städning: ${dom.stadning}`);
    dom.dom = gron ? 'GRÖN' : 'RÖD';
    dom.exit = gron ? 0 : 1;
    try { skrivProtokoll(dom); } catch (e2) { console.error('Protokoll kunde ej skrivas: ' + e2.message); }
    slappLas();
  }
  process.exit(dom.exit);
}

main();
