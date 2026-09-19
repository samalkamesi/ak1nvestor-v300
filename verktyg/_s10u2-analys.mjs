#!/usr/bin/env node
// _s10u2-analys.mjs — s10-u2 (manifest auto-s10-1789802729714): hela analysfönstret
// (restore blad 09-14 → SQL-analyser → städning) under EN yttre flock på
// /tmp/ak1a-dr-prov.lock.
//
// ROT: syskonkörning 09:42:38 (pid 2785720) raderade den skrap-DB som MIN
// --behall-körning lämnat kvar 09:41 — dr-ovning.mjs släpper flocken vid
// verktygsexit även med --behall, så "lämna för manuell undersökning" är en
// öppen tavla för nästa agents "skapa färsk skrap-DB"-steg (bevis:
// PG-loggen 09:41–09:43: dropdb → ny restore → full städning). KUR (tills
// verktyget lär sig hålla flocken genom --behall): konsumenter av --behall
// håller EGEN flock över hela undersökningsfönstret — detta skript är det
// bevisade mönstret.
//
// Anropas:  exec flock -w 300 /tmp/ak1a-dr-prov.lock node verktyg/_s10u2-analys.mjs
//           (flock(1) äger inoden; pid-raden nedan är kontraktets information.)
// Skriver:  ENDAST stdout + /tmp-fellogg (krockimmunt namn: blad+pid+ms).
// Rör ej:   src/, data/, .env, .pgpass. Prod berörs ej alls i detta skript.

import { execSync } from 'node:child_process';
import { writeFileSync } from 'node:fs';

const SKRAP_DB = 'ak1a_dr_test';
const KLUSTER = ['17', 'main'];
const DUMP = '/home/ak1a/AK1/data/backups/supabase/db-2026-09-14.sql.gz';
const LOCK_INFO = '/tmp/ak1a-dr-prov.lock';
const TZ = 'Europe/Stockholm';
const KLASS = `CASE WHEN question ~ '^[A-Z0-9]{1,6} 20[0-9]{2}-' THEN 'aktie' ELSE 'strategi' END`;
const KVART = `date_trunc('hour', created_at AT TIME ZONE '${TZ}') + interval '15 min' * floor(extract(minute from (created_at AT TIME ZONE '${TZ}'))/15)`;

const T0 = Date.now();
const felFil = `/tmp/dr-ovning-fel-blad-2026-09-14-p${process.pid}-${T0}.log`;

function sh(cmd, opts = {}) {
  return execSync(cmd, { encoding: 'utf8', maxBuffer: 64 * 1024 * 1024, stdio: ['ignore', 'pipe', 'pipe'], ...opts });
}
function trySh(label, cmd) {
  try { return { ok: true, out: sh(cmd) }; }
  catch (e) { console.log(`FEL ${label}: ${(e.stderr || e.message || '').toString().slice(0, 200)}`); return { ok: false, out: '' }; }
}
function sql(fraga) {
  const enr = fraga.replace(/\s+/g, ' ').trim();
  return sh(`sudo -n -u postgres psql -d ${SKRAP_DB} -X -q -A -t -F'|' -c ${JSON.stringify(enr)}`).trim();
}
function sektion(namn) { console.log(`\n##### ${namn} #####`); }

// --- 0. låsfilens pid-rad (information — yttre flock äger inoden) -----------
try { writeFileSync(LOCK_INFO, `pid=${process.pid} start=${new Date().toISOString()} verktyg=_s10u2-analys.mjs flock=1\n`); } catch { /* information endast */ }

// --- 1. PG17 upp ------------------------------------------------------------
if (trySh('pg-status', `pg_isready -q -h /var/run/postgresql -p 5432`).ok) {
  console.log('PG17: redan uppe.');
} else {
  const r = trySh('pg-start', `sudo -n pg_ctlcluster ${KLUSTER.join(' ')} start`);
  if (r.ok) console.log('PG17: startad.');
}

// --- 2. färsk skrap-DB --------------------------------------------------------
trySh('dropdb', `sudo -n -u postgres dropdb --if-exists ${SKRAP_DB}`);
sh(`sudo -n -u postgres createdb ${SKRAP_DB}`);
console.log(`Skrap-DB ${SKRAP_DB} skapad färsk.`);

// --- 3. restore + RTO ---------------------------------------------------------
console.log(`Restore: zcat ${DUMP.split('/').pop()} → psql (RTO-mätning) …`);
const tR = Date.now();
try {
  sh(`zcat '${DUMP}' | sudo -n -u postgres psql -d ${SKRAP_DB} -X -q 2>'${felFil}'`);
} catch (e) {
  console.log(`RESTORE FEL: ${e.message}`);
  process.exit(2);
}
const rto = ((Date.now() - tR) / 1000).toFixed(1);
console.log(`Restore KLART på ${rto} s.`);

// --- 4. analyser (felsäkrade — städningen MÅSTE nås även vid SQL-fel) ----------
try {
sektion('A. radkontrakt (public) — ska vara 60 tabeller / 1 226 931 rader');
console.log(sql(`SELECT count(*) FROM pg_tables WHERE schemaname='public'`) + ' tabeller');
console.log(sql(`SELECT (SELECT count(*) FROM board_decisions)||' board · '||(SELECT count(*) FROM organ_health_logs)||' organ · '||(SELECT count(*) FROM section_data_snapshots)||' snapshots'`));

sektion('B. board per kalenderdag (replik — determinism mot mitt första instrument)');
console.log(sql(`SELECT (created_at AT TIME ZONE '${TZ}')::date, count(*) FROM board_decisions GROUP BY 1 ORDER BY 1`));

sektion('C. 09-13 komplett kvartsregister med klass (avvikande fack markerade)');
console.log(sql(`SELECT to_char(${KVART},'HH24:MI') AS kvart, count(*) AS n, count(*) FILTER (WHERE ${KLASS}='aktie') AS aktie
FROM board_decisions WHERE (created_at AT TIME ZONE '${TZ}')::date='2026-09-13'
GROUP BY 1 HAVING count(*)<>8 OR count(*) FILTER (WHERE ${KLASS}='aktie')>0 ORDER BY 1`));

function riderLed(s) { return s.split('\n').filter(Boolean).join(' ; ') || '(inga)'; }

sektion('D. avvikardagarnas facklokalisering (07-18 · 07-22 · 07-23 · 07-24 · 08-04 · 08-17)');
for (const dag of ['2026-07-18', '2026-07-22', '2026-07-23', '2026-07-24', '2026-08-04', '2026-08-17']) {
  const rader = sql(`SELECT to_char(${KVART},'HH24:MI'), count(*), count(*) FILTER (WHERE ${KLASS}='aktie')
    FROM board_decisions WHERE (created_at AT TIME ZONE '${TZ}')::date='${dag}'
    GROUP BY 1 HAVING count(*)<>8 OR count(*) FILTER (WHERE ${KLASS}='aktie')>0 ORDER BY 1`);
  console.log(`${dag}: ${rader.split('\n').filter(Boolean).length} avvikande/aktiefack → ${riderLed(rader)}`);
}

sektion('E. aktie-klassens fackpositioner per dag (07-17→09-13, finns mönstret?)');
console.log(sql(`SELECT dag, string_agg(kvart||'='||n, ' ' ORDER BY kvart) FROM (
  SELECT (created_at AT TIME ZONE '${TZ}')::date AS dag, to_char(${KVART},'HH24:MI') AS kvart, count(*) AS n
  FROM board_decisions WHERE question ~ '^[A-Z0-9]{1,6} 20[0-9]{2}-'
  GROUP BY 1,2) s GROUP BY 1 ORDER BY 1`));

sektion('F. organ_health_logs: kolumner');
console.log(sql(`SELECT string_agg(column_name,', ' ORDER BY ordinal_position) FROM information_schema.columns WHERE table_name='organ_health_logs'`));

sektion('G. organ-klockan: pulstider per dag (string_agg HH:MI×n)');
console.log(sql(`SELECT (created_at AT TIME ZONE '${TZ}')::date AS dag, count(*) AS n,
  string_agg(to_char(created_at AT TIME ZONE '${TZ}','HH24:MI')||'×'||c, ' ' ORDER BY tid) AS pulser
FROM (SELECT created_at, to_char(created_at AT TIME ZONE '${TZ}','HH24:MI') AS tid, count(*) OVER (PARTITION BY (created_at AT TIME ZONE '${TZ}')::date, to_char(created_at AT TIME ZONE '${TZ}','HH24:MI')) AS c
      FROM organ_health_logs) s
GROUP BY 1 ORDER BY 1`));

sektion('H. organ: första raden + total');
console.log(sql(`SELECT min(created_at AT TIME ZONE '${TZ}')||' → '||max(created_at AT TIME ZONE '${TZ}')||' · '||count(*)||' rader' FROM organ_health_logs`));
} catch (e) { console.log(`ANALYSFEL (fortsätter till städning): ${String(e.message).slice(0, 300)}`); }

// --- 5. städning (--behall-kontraktet: anroparen städar) -----------------------
sektion('STÄDNING');
const d = trySh('dropdb-slut', `sudo -n -u postgres dropdb --if-exists ${SKRAP_DB}`);
console.log(`skrap-DB raderad: ${d.ok}`);
const s = trySh('pg-stop', `sudo -n pg_ctlcluster ${KLUSTER.join(' ')} stop`);
console.log(`PG17 stoppad: ${s.ok}`);
console.log(`\nAnalyssvit klar på ${((Date.now() - T0) / 1000).toFixed(1)} s (RTO ${rto} s · fellogg ${felFil}).`);
