#!/usr/bin/env node
// dr-kedja7.mjs — KEDJA 7: KIRURGIRECEPTET FÖR TRIGGERBLOCKERADE TABELLER (spår 10, s10-u2, 2026-09-17)
//
// Bakgrund (kedja 5:s FYND 1, 2026-09-16 — spårets äldsta öppna köpost):
//   public.board_decisions (organens beslutsregister) kan EJ kirurgeras med
//   kedja 5:s recept (DELETE + COPY i EN transaktion): den inkommande FK:n
//   forecast_log.board_decision_id → board_decisions(id) ON DELETE SET NULL
//   gör att DELETE:n försöker UPDATE:a forecast_log — där trigghern
//   trg_forecast_log_immutable (forecast_immutable(), BEFORE DELETE OR UPDATE)
//   vägrar ALLA ändringar ("registret är oföränderligt"). Skyddet är korrekt
//   drift (olycksradering av prognosloggen stoppas) men lämnar tabellen
//   okirurgisk — detta verktyg bevisar specialreceptet.
//
// RECEPTET som bevisas: SET LOCAL session_replication_role = replica i samma
//   transaktion som kirurgin. Replica-läget stänger av användartriggrar OCH
//   FK-enforsering (det är dess syfte: logiska replikeringar ska få skriva)
//   — SET LOCAL dör med transaktionen, ingen DDL, inga bestående spår.
//   Konsekvensen som mäts: kaskaden eldas ALDRIG → forecast_log får INGA
//   SET NULL-ärr (till skillnad från naiva FK-paus-varianter) — men FK-
//   enforseringen var avstängd under appliceringen, så verktyget VERIFIERAR
//   referensintegriteten manuellt efteråt (hängande-referenssond) och att
//   skyddstriggern LEVER (live-bevis: en engångs-UPDATE som SKALL vägras).
//
// Övningens moment (DR-övning: återställ, mät tid/rader, protokoll, städa PG):
//   1. RETENTIONSSVEP: gzip -t på varje dumpblad (kedja 5:s stående kontrakt).
//   2. KÄLLA: full restore av färskaste blad i skrap-DB (RTO-mätning).
//   3. FÖRKONTROLL: radantal + checksumma + inkommande FK + kollateralbaslinje
//      (forecast_log-rader med board_decision_id NOT NULL) + att skydds-
//      triggrarna finns (de är övningens förutsättning).
//   4. EXTRAKTION: tabellens COPY-block ur dumpfilen (zcat+awk, antalskontrakt).
//   5. KATASTROF: realistisk datakorruption — en "buggig migrering" MUTERAR
//      consensus_level på 500 rader (mutation LANDAR: board_decisions är själv
//      triggerfri; not: en olycks-DELETE av samma tabell stoppas redan av
//      skyddet via kaskaden — dubbelt skydd, protokollförs).
//   6. NAIV KIRURGI (bevis-delen): kedja 5:s recept mot den skadade tabellen
//      SKALL RÖTA på forecast_immutable() och rullas tillbaka helt — fynd 1
//      mekaniskt återbevisat, katastrofen kvar.
//   7. SABOTAGE: mitt-rads-kolumnfel i receptfilen SKALL vägras (ON_ERROR_STOP
//      gäller även under replica-läge — kedja 5:s tyst-trunkeringsläxa).
//   8. RECEPET: SET LOCAL session_replication_role = replica; DELETE + COPY
//      i EN transaktion — läker tabellen.
//   9. EFTERKONTRAKT: rader == källa · checksumma == källa · kollateral ==
//      baslinje (0 ärr) · 0 hängande referenser · skyddstriggrarna aktiva
//      (2/2, tgenabled=O) · LIVE-triggerbevis (UPDATE vägras) · roll origin.
//
// Lägen/flaggor:
//   (inget arg)    kör mot SENASTE natt-dump, tabell public.board_decisions
//   --fil <väg>    kör mot given dumpfil (.sql.gz)
//   --behall       städa EJ (lämna skrap-DB + PG17 för manuell granskning)
//
// Lås/grind/exit-koder = familjekontraktet (dr-ovning.mjs / dr-kedja5.mjs):
// flock-kö på /tmp/ak1a-dr-prov.lock, låsvägran (3), RAM-/diskgrind (75).
// Felhantering: kända Supabase-restore-fel kategoriseras; okända är fynd.
// Städning körs ALLTID (finally) om inte --behall.
//
// OBS prod: övningen sker ENDAST i lokal PG17 skrap-DB (superuser postgres,
// krav för replica-läge). Applicering mot Supabase vid verklig incident kräver
// motsvarande rättigheter + huvudagentens ägande (R2: ALDRIG här).

import { spawnSync } from 'node:child_process';
import {
  existsSync, openSync, closeSync, readFileSync, writeFileSync, unlinkSync,
  readdirSync, statSync,
} from 'node:fs';
import { dirname as pathDirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const REPO_ROT = path.resolve(pathDirname(fileURLToPath(import.meta.url)), '..');
const DUMP_KATALOG = path.join(REPO_ROT, 'data', 'backups', 'supabase');
const LAS_VAG = '/tmp/ak1a-dr-prov.lock';
const SKRAP_DB = 'ak1a_dr_k7';
const PG_KLUSTER = ['17', 'main'];
const STANDARD_TABELL = 'public.board_decisions';
// Tabellen vars immutability-triggn gör naiva kirurgin omöjlig (kontraktets
// förutsättning) + triggnamnen som efterkontraktet verifierar lever.
const SKYDDS_TABELL = 'public.forecast_log';
const SKYDDS_TRIGGERS = ['trg_forecast_log_immutable', 'trg_forecast_outcomes_immutable'];
const KATASTROF_RADER = 500;
const LAS_MAX_ALDER_MS = 30 * 60 * 1000; // dött lås (död agent) tas över efter 30 min

function lasArgument() {
  const args = process.argv.slice(2);
  const opts = { fil: null, behall: false };
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--fil') opts.fil = args[++i];
    else if (args[i] === '--behall') opts.behall = true;
    else if (args[i] === '--hjalp' || args[i] === '--help') {
      console.log('Användning: node verktyg/dr-kedja7.mjs [--fil <dump.sql.gz>] [--behall]  (tabell = public.board_decisions, specialreceptet)');
      process.exit(0);
    } else {
      console.error(`Okänt argument: ${args[i]} (se --hjalp)`);
      process.exit(2);
    }
  }
  return opts;
}

// --- Lås: EN agent äger PG17 DR-fönstret (familjekontraktet, dr-ovning.mjs) ---

function taLas() {
  if (process.env.AK1A_DR_FLOCK === '1') {
    const fdFlock = openSync(LAS_VAG, 'w');
    writeFileSync(fdFlock, `pid=${process.pid} start=${new Date().toISOString()} verktyg=dr-kedja7.mjs flock=1\n`);
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
  writeFileSync(fd, `pid=${process.pid} start=${new Date().toISOString()} verktyg=dr-kedja7.mjs\n`);
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

// --- Processhjälp ----------------------------------------------------------------

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

// --- Steg 1-2: dumpval + retentionssvep + förkontroll -----------------------------

function hittaSenasteDump() {
  if (!existsSync(DUMP_KATALOG)) {
    console.error(`Dumpkatalogen saknas: ${DUMP_KATALOG}`);
    process.exit(1);
  }
  const filer = readdirSync(DUMP_KATALOG)
    .filter((n) => /^db-\d{4}-\d{2}-\d{2}\.sql\.gz$/.test(n))
    .sort();
  if (filer.length === 0) {
    console.error(`Inga db-*.sql.gz i ${DUMP_KATALOG} — inget att återställa.`);
    process.exit(1);
  }
  return path.join(DUMP_KATALOG, filer[filer.length - 1]);
}

function retentionSvep() {
  console.log('[1/9] Retentionssvep: gzip -t på varje dump i fönstret …');
  const filer = readdirSync(DUMP_KATALOG)
    .filter((n) => /^db-\d{4}-\d{2}-\d{2}\.sql\.gz$/.test(n))
    .sort();
  const rader = filer.map((namn) => {
    const vag = path.join(DUMP_KATALOG, namn);
    const t0 = process.hrtime.bigint();
    const r = kor('gzip', ['-t', vag], { timeoutMs: 120000 });
    const ms = tidMs(t0);
    const dagar = Math.floor((Date.now() - statSync(vag).mtimeMs) / 86400000);
    return { namn, storlekMB: statSync(vag).size / 1048576, alderDagar: dagar, gzipOk: r.ok, testSek: ms / 1000 };
  });
  for (const r of rader) {
    console.log(`      ${r.namn} · ${r.storlekMB.toFixed(1)} MB · ${r.alderDagar} d · gzip ${r.gzipOk ? 'OK' : 'FEL'} (${r.testSek.toFixed(1)} s)`);
  }
  const trasiga = rader.filter((r) => !r.gzipOk);
  console.log(`      Svep: ${rader.length} dumpar · ${trasiga.length === 0 ? 'ALLA GRÖNA' : `${trasiga.length} TRASIGA — FYND`}`);
  return { rader, gron: trasiga.length === 0, trasiga: trasiga.map((t) => t.namn) };
}

function forkontrollDump(dump) {
  console.log('[2/9] Dumpkontroll (kolla-dump-markorer.mjs --fil) …');
  const r = kor('node', [path.join(REPO_ROT, 'verktyg', 'kolla-dump-markorer.mjs'), '--fil', dump], { timeoutMs: 120000 });
  console.log(r.stdout.split('\n').map((l) => `      ${l}`).join('\n'));
  if (r.stderr) console.log(r.stderr.split('\n').map((l) => `      ${l}`).join('\n'));
  if (r.status !== 0) {
    console.error('DUMPEN UNDERKÄND — återställning vägras (en ofullständig dump är ingen backup).');
    return false;
  }
  return true;
}

// --- Steg 3-4: PG17 + skrap-DB -----------------------------------------------------

function pgUpp() {
  return sudo(['-u', 'postgres', 'pg_isready', '-q', '-p', '5432']).ok;
}

function startaPg17(dom) {
  console.log('[3/9] Startar lokal PG17 …');
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
  console.log(`[4/9] Skapar färsk skrap-DB ${SKRAP_DB} (dropdb --if-exists + createdb) …`);
  const drop = sudo(['-u', 'postgres', 'dropdb', '--if-exists', SKRAP_DB]);
  if (!drop.ok) throw new Error(`dropdb misslyckades: ${drop.stderr}`);
  const skapa = sudo(['-u', 'postgres', 'createdb', SKRAP_DB]);
  if (!skapa.ok) throw new Error(`createdb misslyckades: ${skapa.stderr}`);
  console.log(`      ${SKRAP_DB} skapad färsk.`);
}

function stadaPg17(dom) {
  console.log('[9/9] Städning: skrap-DB + PG17 + tmp-filer …');
  const drop = sudo(['-u', 'postgres', 'dropdb', '--if-exists', SKRAP_DB]);
  dom.stadning = { skrapDbBort: drop.ok, pgStoppad: null, tmpRaderade: true, meddelande: '' };
  if (!drop.ok) dom.stadning.meddelande += `dropdb misslyckades: ${drop.stderr} `;
  if (dom.behall) {
    dom.stadning.meddelande += '--behall givet: skrap-DB/PG17 lämnas för manuell undersökning (viloläget brutet).';
    dom.stadning.pgStoppad = false;
    console.log('      --behall: lämnar skrap-DB + PG17 uppe (viloläget brutet — städa manuellt).');
  } else {
    const stop = sudo(['pg_ctlcluster', ...PG_KLUSTER, 'stop']);
    dom.stadning.pgStoppad = stop.ok || !pgUpp();
    if (!dom.stadning.pgStoppad) dom.stadning.meddelande += `pg_ctlcluster stop misslyckades: ${stop.stderr} `;
    console.log(`      skrap-DB ${dom.stadning.skrapDbBort ? 'raderad' : 'KUNDE EJ RADERAS'} · PG17 ${dom.stadning.pgStoppad ? 'stoppad' : 'KUNDE EJ STOPPAS'}.`);
  }
  for (const f of dom.tmpFiler || []) {
    try { unlinkSync(f); } catch { /* redan borta */ }
  }
}

// --- Steg 5: full restore + felkategorisering ---------------------------------------

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
  console.log('[5/9] FULL ÅTERSTÄLLNING i skrap-DB (källmåttstocken) — RTO-mätning …');
  const felFil = `/tmp/dr-kedja7-fel-${dom.datumIso}.log`;
  const t0 = process.hrtime.bigint();
  const r = spawnSync('bash', ['-c',
    `zcat '${dump.replace(/'/g, "'\\''")}' | sudo -n -u postgres psql -d ${SKRAP_DB} -X -q 2>'${felFil}'`],
  { encoding: 'utf8', timeout: 600000, maxBuffer: 64 * 1024 * 1024 });
  const ms = tidMs(t0);
  dom.fullRto = { ms, sek: ms / 1000, felFil };
  dom.restoreOk = r.status === 0;
  let felrader = [];
  try { felrader = readFileSync(felFil, 'utf8').split('\n'); } catch { felrader = []; }
  dom.fel = kategoriseraFel(felrader);
  dom.fel.antalRader = felrader.filter((l) => l.trim() !== '').length;
  console.log(`      ${dom.restoreOk ? 'KLART' : 'PSLYFEL'} på ${(ms / 1000).toFixed(1)} s · felrader ${dom.fel.antalRader} (okända ${dom.fel.okanda.length}) → ${felFil}`);
  if (!dom.restoreOk) throw new Error(`psql-restore avslutades med kod ${r.status}`);
}

// --- Steg 6: förkontroll av måltabellen + skyddskontraktets förutsättningar ----------

function checksumma(tabell) {
  return sql(`SELECT md5(string_agg(md5(t::text), '' ORDER BY md5(t::text))) FROM ${tabell} t;`).trim();
}

function tabellForkontroll(dom) {
  const T = dom.tabell;
  console.log(`[6/9] Tabellförkontroll: ${T} + skyddstabell ${SKYDDS_TABELL} …`);
  if (sql(`SELECT to_regclass('${T}') IS NOT NULL;`).trim() !== 't') {
    throw new Error(`tabellen ${T} saknas i den återställda dumpen.`);
  }
  if (sql(`SELECT to_regclass('${SKYDDS_TABELL}') IS NOT NULL;`).trim() !== 't') {
    throw new Error(`skyddstabellen ${SKYDDS_TABELL} saknas — övningens förutsättning (triggerblockad kirurgi) finns inte i detta blad.`);
  }

  dom.kalla = { rader: Number(sql(`SELECT count(*) FROM ${T};`).trim()), checksumma: checksumma(T) };
  console.log(`      källa: ${dom.kalla.rader.toLocaleString('sv-SE')} rader · checksumma ${dom.kalla.checksumma.slice(0, 12)}…`);

  // Skyddstriggrarna SKALL finnas och vara aktiva — annars är övningen meningslös.
  const aktiva = Number(sql(
    `SELECT count(*) FROM pg_trigger t JOIN pg_class c ON c.oid = t.tgrelid ` +
    `WHERE t.tgname IN (${SKYDDS_TRIGGERS.map((n) => `'${n}'`).join(',')}) ` +
    `AND c.relname IN ('forecast_log','forecast_outcomes') AND t.tgenabled = 'O' AND NOT t.tgisinternal;`,
  ).trim());
  dom.skyddsTriggrarAktiva = aktiva;
  console.log(`      skyddstriggrar aktiva: ${aktiva}/${SKYDDS_TRIGGERS.length} (tgenabled=O)`);
  if (aktiva !== SKYDDS_TRIGGERS.length) {
    throw new Error(`skyddstriggrarna ej alla aktiva (${aktiva}/${SKYDDS_TRIGGERS.length}) — bladet bär inte övningens förutsättning.`);
  }

  // Inkommande FK: kontraktet kräver SET NULL-mönstret (det är kaskadens väg in
  // i skyddstabellen). Rapportera samtliga.
  const fkRader = sql(
    `SELECT conrelid::regclass::text || '|' || ` +
    `(SELECT string_agg(a.attname, ',' ORDER BY x.ord) FROM unnest(conkey) WITH ORDINALITY x(attnum, ord) ` +
    ` JOIN pg_attribute a ON a.attrelid = conrelid AND a.attnum = x.attnum) || '|' || confdeltype::text ` +
    `FROM pg_constraint WHERE contype = 'f' AND confrelid = '${T}'::regclass ORDER BY 1;`,
  ).split('\n').filter((l) => l.trim() !== '');
  dom.inkommandeFk = fkRader.map((rad) => {
    const [tabell, kolumner, typ] = rad.split('|');
    return { tabell, kolumner, typ, typText: { a: 'NO ACTION', r: 'RESTRICT', c: 'CASCADE', n: 'SET NULL', d: 'SET DEFAULT' }[typ] || typ };
  });
  for (const f of dom.inkommandeFk) console.log(`      inkommande FK: ${f.tabell}(${f.kolumner}) → ${f.typText}`);
  // Normalisera schema-prefix: conrelid::regclass::text utelämnar "public." när
  // schemat ligger i search_path (känt PG-beteende — kör 1:s RÖT orsak, bokförd).
  const utanPrefix = (n) => n.replace(/^public\./, '');
  const fliken = dom.inkommandeFk.find((f) => utanPrefix(f.tabell) === utanPrefix(SKYDDS_TABELL) && f.typ === 'n');
  if (!fliken) {
    throw new Error(`förväntad FK (${SKYDDS_TABELL} → ${T} ON DELETE SET NULL) hittades ej — bladets schema avviker från receptets förutsättning.`);
  }
  dom.skyddsFk = fliken;

  // Kollateralbaslinje: rader i skyddstabellen som refererar måltabellen.
  dom.kollateral = {
    refererarFore: Number(sql(`SELECT count(*) FROM ${SKYDDS_TABELL} WHERE ${fliken.kolumner.split(',')[0]} IS NOT NULL;`).trim()),
    totaltFore: Number(sql(`SELECT count(*) FROM ${SKYDDS_TABELL};`).trim()),
  };
  console.log(`      kollateralbaslinje: ${SKYDDS_TABELL} ${dom.kollateral.totaltFore.toLocaleString('sv-SE')} rader, varav ${dom.kollateral.refererarFore.toLocaleString('sv-SE')} refererar ${T}`);
  if (dom.kollateral.refererarFore === 0) {
    throw new Error(`${SKYDDS_TABELL} saknar referenser till ${T} i detta blad — naiva kirurgin kommer INTE konfrontera triggern och receptet blir obevisat (välj äldre blad eller avstå).`);
  }

  // Katastrofkolumnen (buggig migrerings mutation).
  const harKolumn = sql(`SELECT count(*) FROM information_schema.columns WHERE table_schema='public' AND table_name='${T.split('.')[1]}' AND column_name='consensus_level';`).trim();
  if (harKolumn !== '1') {
    throw new Error(`kolumnen consensus_level saknas i ${T} — katastrof-simuleringens mutation har inget mål (bladet avviker).`);
  }
}

// --- Steg 7: kirurgi-extraktion (COPY-blocket ur dumpFILen) --------------------------

function extraheraUrDump(dump, dom) {
  console.log(`[7/9] KIRURGI-EXTRAKTION: ${dom.tabell} COPY-block ur ${path.basename(dump)} (zcat | awk) …`);
  const utFil = `/tmp/dr-kedja7-${process.pid}-tabell.sql`;
  const t0 = process.hrtime.bigint();
  const awk = `index($0, "COPY ${dom.tabell} (") == 1 { inne=1; print; next } inne && $0 == "\\\\." { print; inne=0; exit } inne { print }`;
  const r = spawnSync('bash', ['-c',
    `zcat '${dump.replace(/'/g, "'\\''")}' | awk '${awk.replace(/'/g, "'\\''")}' > '${utFil}'`],
  { encoding: 'utf8', timeout: 300000, maxBuffer: 64 * 1024 * 1024 });
  const ms = tidMs(t0);
  dom.tmpFiler.push(utFil);
  if (r.status !== 0) throw new Error(`extraktion misslyckades: ${r.stderr || 'okänt fel'}`);
  const innehall = readFileSync(utFil, 'utf8').split('\n');
  const copyRad = innehall.find((l) => l.startsWith(`COPY ${dom.tabell} (`));
  const slutIndex = innehall.findIndex((l) => l === '\\.');
  if (!copyRad || slutIndex === -1) {
    throw new Error(`COPY-block för ${dom.tabell} hittades ej i dumpen (fel tabellnamn?)`);
  }
  const dataRader = slutIndex - innehall.indexOf(copyRad) - 1;
  dom.extraktion = { utFil, ms, sek: ms / 1000, byte: statSync(utFil).size, dataRader, copyRad: copyRad.slice(0, 120) + (copyRad.length > 120 ? '…' : '') };
  console.log(`      ${dataRader.toLocaleString('sv-SE')} datarader · ${(dom.extraktion.byte / 1024).toFixed(0)} KiB · ${dom.extraktion.sek.toFixed(1)} s`);
  if (dataRader !== dom.kalla.rader) {
    throw new Error(`extraktionsraderna (${dataRader}) ≠ källans rader (${dom.kalla.rader}) — extraktionen är inte komplett`);
  }
}

// --- Steg 8: katastrof → naivt försök (RÖT-bevis) → sabotage → recept → kontrakt -------

function applicera(filVag) {
  // EN transaktion (--single-transaction) + ON_ERROR_STOP: allt eller inget.
  return sudo(['-u', 'postgres', 'psql', '-d', SKRAP_DB, '-X', '-q',
    '--single-transaction', '-v', 'ON_ERROR_STOP=1', '-f', filVag], { timeoutMs: 300000 });
}

function katastrofOchRecept(dom) {
  const T = dom.tabell;
  const skyddKolumn = dom.skyddsFk.kolumner.split(',')[0];
  const naivFil = `/tmp/dr-kedja7-${process.pid}-naiv.sql`;
  const sabFil = `/tmp/dr-kedja7-${process.pid}-recept-sabotage.sql`;
  const receptFil = `/tmp/dr-kedja7-${process.pid}-recept.sql`;
  dom.tmpFiler.push(naivFil, sabFil, receptFil);
  const deleteRad = `DELETE FROM ${T};\n`;
  const copyBlock = readFileSync(dom.extraktion.utFil, 'utf8');
  // Detta är specialreceptet: replica-läget i transaktionen (superuser krävs —
  // lokal PG-postgres är det; psql mot Supabase vid incident kräver motsvarande).
  const replikaRad = 'SET LOCAL session_replication_role = replica;\n';
  writeFileSync(naivFil, deleteRad + copyBlock);
  writeFileSync(receptFil, replikaRad + deleteRad + copyBlock);

  // KATASTROF: buggig migrering muterar consensus_level (realistisk datakorruption;
  // mutation LANDAR — board_decisions är själv triggerfri. Not: en olycks-DELETE
  // av T stoppas redan av skyddet via SET NULL-kaskaden — dubbelt skydd, se protokoll).
  // Mätning: OBEROENDE sond (räkna katastrofsignaturen före/efter) — kör 2:s läxa:
  // psql -q undertrycker "UPDATE n"-ekot, rowcount-parsning är INTE ett mått.
  console.log(`      KATASTROF-SIMULERING: muterar consensus_level på ${KATASTROF_RADER} rader (buggig migrering) …`);
  const signaturFore = Number(sql(`SELECT count(*) FROM ${T} WHERE consensus_level = -1;`).trim());
  const katR = sudo(['-u', 'postgres', 'psql', '-d', SKRAP_DB, '-X', '-A', '-t', '-c',
    `UPDATE ${T} SET consensus_level = -1 WHERE id IN (SELECT id FROM ${T} ORDER BY created_at DESC LIMIT ${KATASTROF_RADER});`], { timeoutMs: 120000 });
  if (!katR.ok) throw new Error(`katastrof-simuleringen misslyckades: ${katR.stderr}`);
  dom.katastrof = {
    muteradeRader: Number(sql(`SELECT count(*) FROM ${T} WHERE consensus_level = -1;`).trim()) - signaturFore,
    raderEfter: Number(sql(`SELECT count(*) FROM ${T};`).trim()),
    checksummaEfter: checksumma(T),
  };
  dom.katastrof.checksummaForandrad = dom.katastrof.checksummaEfter !== dom.kalla.checksumma;
  dom.katastrof.landade = dom.katastrof.muteradeRader > 0 && dom.katastrof.checksummaForandrad;
  console.log(`      muterade ${dom.katastrof.muteradeRader.toLocaleString('sv-SE')} rader (sond) · checksumma ${dom.katastrof.checksummaForandrad ? 'FÖRÄNDRAD (katastrofen landade)' : 'OFÖRÄNDRAD (!)'}`);
  if (!dom.katastrof.landade) throw new Error('katastrofen landade inte — övningen saknar skadat utgångsläge');

  // NAIVT FÖRSÖK (kedja 5:s recept): SKALL RÖTA på forecast_immutable().
  console.log('      NAIV KIRURGI (DELETE+COPY, kedja 5:s recept) — SKALL vägras av skyddstriggern …');
  const t0 = process.hrtime.bigint();
  const naivR = applicera(naivFil);
  dom.naiv = {
    sek: tidMs(t0) / 1000,
    pslyVagrade: naivR.status !== 0,
    raderEfter: Number(sql(`SELECT count(*) FROM ${T};`).trim()),
    felutdrag: (naivR.stderr || naivR.stdout || '').split('\n').filter((l) => /ERROR|prognosmotor|förbjuden/i.test(l)).slice(0, 3).join(' | '),
  };
  dom.naiv.rulladesTillbaka = dom.naiv.raderEfter === dom.katastrof.raderEfter && checksumma(T) === dom.katastrof.checksummaEfter;
  dom.naiv.gripet = dom.naiv.pslyVagrade && dom.naiv.rulladesTillbaka && /prognosmotor|forecast_immutable|förbjuden/i.test(dom.naiv.felutdrag);
  console.log(`      psql ${dom.naiv.pslyVagrade ? 'VÄGRADE' : 'ACCEPTERADE (!)'} · ${dom.naiv.rulladesTillbaka ? 'transaktionen rullades tillbaka (katastrofen kvar)' : 'tabellen PÅVERKAD (!)'} · ${dom.naiv.felutdrag || 'ingen feltext'}`);
  if (!dom.naiv.gripet) {
    throw new Error(`NAIVA KIRURGIN greps ej som förväntat (vägrade=${dom.naiv.pslyVagrade}, rullbak=${dom.naiv.rulladesTillbaka}) — fynd 1:s förutsättning håller inte mot detta blad; receptet FÅR INTE fortsättas (dom RÖT)`);
  }

  // SABOTAGE av receptfilen: mitt-rads-kolumnfel — även replica-läge skyddas av
  // ON_ERROR_STOP (kedja 5:s läxa: datafel är den farliga klassen, inte trunkering).
  console.log('      SABOTAGE: korrumperar en mitt-rad i RECEPTFILON — applicering SKALL vägras …');
  const rader = copyBlock.split('\n');
  const copyIndex = rader.findIndex((l) => l.startsWith(`COPY ${T} (`));
  const slutIndex = rader.findIndex((l) => l === '\\.');
  const kolumnantal = rader[copyIndex].slice(rader[copyIndex].indexOf('(') + 1, rader[copyIndex].lastIndexOf(')')).split(',').length;
  const dataStart = copyIndex + 1;
  const mittIndex = dataStart + Math.floor((slutIndex - dataStart) / 2);
  const korrumperad = kolumnantal > 1 ? rader[mittIndex].replace(/\t/g, '') : `${rader[mittIndex]}\tX`;
  const sabotadeRader = [...rader];
  sabotadeRader[mittIndex] = korrumperad;
  writeFileSync(sabFil, replikaRad + deleteRad + sabotadeRader.join('\n'));
  const t1 = process.hrtime.bigint();
  const sabR = applicera(sabFil);
  dom.sabotage = {
    sek: tidMs(t1) / 1000,
    psqlVagrade: sabR.status !== 0,
    rulladesTillbaka: Number(sql(`SELECT count(*) FROM ${T};`).trim()) === dom.katastrof.raderEfter && checksumma(T) === dom.katastrof.checksummaEfter,
    felutdrag: (sabR.stderr || sabR.stdout || '').split('\n').filter((l) => /ERROR/i.test(l)).slice(0, 2).join(' | '),
  };
  dom.sabotage.gripet = dom.sabotage.psqlVagrade && dom.sabotage.rulladesTillbaka;
  console.log(`      psql ${dom.sabotage.psqlVagrade ? 'VÄGRADE' : 'ACCEPTERADE (!)'} · ${dom.sabotage.rulladesTillbaka ? 'rullades tillbaka (katastrofen kvar)' : 'PÅVERKAD (!)'} · ${dom.sabotage.felutdrag || 'ingen feltext'}`);
  if (!dom.sabotage.gripet) {
    throw new Error('SABOTAGET EJ GRIPET — atomicitetskontraktet brister ens under replica-läge; receptet FÅR INTE köras (dom RÖT)');
  }

  // RECEPET: replica-läge i transaktionen → kirurgi landar utan kaskad-ärr.
  console.log('      RECEPET: SET LOCAL session_replication_role=replica + DELETE + COPY i EN transaktion …');
  const t2 = process.hrtime.bigint();
  const recR = applicera(receptFil);
  dom.recept = { sek: tidMs(t2) / 1000, ok: recR.ok, stderr: recR.ok ? '' : (recR.stderr || '').slice(0, 300) };
  if (!dom.recept.ok) throw new Error(`recept-appliceringen misslyckades: ${dom.recept.stderr}`);

  // EFTERKONTRAKT (receptets hela poäng — skyddet ska vara OBERÖRT och läket HELT):
  dom.recept.raderEfter = Number(sql(`SELECT count(*) FROM ${T};`).trim());
  dom.recept.checksummaEfter = checksumma(T);
  dom.recept.innehallIdentiskt = dom.recept.checksummaEfter === dom.kalla.checksumma;
  dom.recept.kollateralEfter = {
    refererar: Number(sql(`SELECT count(*) FROM ${SKYDDS_TABELL} WHERE ${skyddKolumn} IS NOT NULL;`).trim()),
    totalt: Number(sql(`SELECT count(*) FROM ${SKYDDS_TABELL};`).trim()),
  };
  dom.recept.kollateralObe_rord = dom.recept.kollateralEfter.refererar === dom.kollateral.refererarFore
    && dom.recept.kollateralEfter.totalt === dom.kollateral.totaltFore;
  dom.recept.hangande = Number(sql(
    `SELECT count(*) FROM ${SKYDDS_TABELL} s LEFT JOIN ${T} t ON s.${skyddKolumn} = t.id ` +
    `WHERE s.${skyddKolumn} IS NOT NULL AND t.id IS NULL;`,
  ).trim());
  dom.recept.triggrarAktiva = Number(sql(
    `SELECT count(*) FROM pg_trigger t2 JOIN pg_class c ON c.oid = t2.tgrelid ` +
    `WHERE t2.tgname IN (${SKYDDS_TRIGGERS.map((n) => `'${n}'`).join(',')}) ` +
    `AND c.relname IN ('forecast_log','forecast_outcomes') AND t2.tgenabled = 'O' AND NOT t2.tgisinternal;`,
  ).trim());
  // LIVE-triggerbevis: en engångs-UPDATE i skyddstabellen SKALL vägras (enytransaktion → auto-rullbak).
  const livR = sudo(['-u', 'postgres', 'psql', '-d', SKRAP_DB, '-X', '-q', '-A', '-t', '-c',
    `UPDATE ${SKYDDS_TABELL} SET ${skyddKolumn} = ${skyddKolumn} WHERE ctid = (SELECT ctid FROM ${SKYDDS_TABELL} LIMIT 1);`], { timeoutMs: 120000 });
  dom.recept.liveTrigger = {
    vgrades: livR.status !== 0 && /prognosmotor|förbjuden/i.test((livR.stderr || '') + (livR.stdout || '')),
    felutdrag: (livR.stderr || '').split('\n').filter((l) => /ERROR|prognosmotor/i.test(l)).slice(0, 2).join(' | '),
  };
  dom.recept.roll = sql('SHOW session_replication_role;').trim();
  console.log(`      ${dom.recept.raderEfter.toLocaleString('sv-SE')} rader tillbaka på ${dom.recept.sek.toFixed(1)} s · checksumma ${dom.recept.innehallIdentiskt ? 'IDENTISK med källan' : 'SKILJER (!)'}`);
  console.log(`      kollateral ${dom.recept.kollateralObe_rord ? 'OBERÖRD (0 SET NULL-ärr — kaskaden eldades aldrig)' : 'PÅVERKAD (!)'} · hängande referenser ${dom.recept.hangande} · triggrar aktiva ${dom.recept.triggrarAktiva}/${SKYDDS_TRIGGERS.length} · live-skydd ${dom.recept.liveTrigger.vgrades ? 'VÄGRAR (lever)' : 'UTE (!)'} · roll ${dom.recept.roll}`);

  const kontraktFel =
    (dom.recept.raderEfter !== dom.kalla.rader ? `rader ${dom.recept.raderEfter}≠${dom.kalla.rader}; ` : '') +
    (!dom.recept.innehallIdentiskt ? 'checksumma skiljer; ' : '') +
    (!dom.recept.kollateralObe_rord ? 'kollateral påverkad; ' : '') +
    (dom.recept.hangande !== 0 ? `hängande ${dom.recept.hangande}; ` : '') +
    (dom.recept.triggrarAktiva !== SKYDDS_TRIGGERS.length ? `triggrar ${dom.recept.triggrarAktiva}; ` : '') +
    (!dom.recept.liveTrigger.vgrades ? 'live-skydd lever ej; ' : '') +
    (dom.recept.roll !== 'origin' ? `roll "${dom.recept.roll}"; ` : '');
  if (kontraktFel) throw new Error(`receptets efterkontrakt brast: ${kontraktFel}`);
}

// --- Protokoll -----------------------------------------------------------------------

function skrivProtokoll(dom) {
  console.log('Protokoll …');
  let vag = path.join(REPO_ROT, 'data', 'forskning', `DR-KEDJA7-${dom.datumIso}-AUTO.md`);
  let n = 2;
  while (existsSync(vag)) vag = path.join(REPO_ROT, 'data', 'forskning', `DR-KEDJA7-${dom.datumIso}-AUTO-${n++}.md`);
  const svepRader = dom.retention.rader.map((r) =>
    `| ${r.namn} | ${r.storlekMB.toFixed(1)} MB | ${r.alderDagar} d | ${r.gzipOk ? 'GRÖN' : '**TRASIG**'} | ${r.testSek.toFixed(1)} s |`).join('\n');
  const naiv = dom.naiv || {};
  const sab = dom.sabotage || {};
  const rec = dom.recept || {};
  const kat = dom.katastrof || {};
  const kol = dom.kollateral || {};
  const gron = dom.retention.gron && dom.dumpGron && dom.restoreOk && (dom.fel?.okanda.length ?? 1) === 0
    && dom.extraktion?.dataRader === dom.kalla?.rader
    && dom.katastrof?.landade === true
    && dom.naiv?.gripet === true
    && dom.sabotage?.gripet === true
    && dom.recept?.ok === true
    && dom.recept?.raderEfter === dom.kalla?.rader && dom.recept?.innehallIdentiskt === true
    && dom.recept?.kollateralObe_rord === true && dom.recept?.hangande === 0
    && dom.recept?.triggrarAktiva === SKYDDS_TRIGGERS.length && dom.recept?.liveTrigger?.vgrades === true
    && dom.recept?.roll === 'origin'
    && dom.stadning.skrapDbBort && (dom.behall || dom.stadning.pgStoppad);

  const text = `# DR-KEDJA 7 ${dom.datumIso} — KIRURGIRECEPTET FÖR TRIGGERBLOCKERADE TABELLER (AUTO)

Körd av \`verktyg/dr-kedja7.mjs\` (spår 10, s10-u2). Löser kedja 5:s FYND 1
(spårets äldsta öppna köpost): **public.board_decisions kan EJ kirurgeras med
kedja 5:s recept** — FK:n \`forecast_log.board_decision_id → board_decisions(id)
ON DELETE SET NULL\` gör att DELETE:n UPDATE:a ${SKYDDS_TABELL}, där
\`trg_forecast_log_immutable\` (BEFORE DELETE OR UPDATE) vägrar allt. Detta prov
bevisar specialreceptet **SET LOCAL session_replication_role = replica** i
kirurgins transaktion. Allt sker i skrap-DB ${SKRAP_DB} på lokal PG17 —
**prod RÖRDES ALDRIG** (receptet mot Supabase vid verklig incident = samma fil +
psql med motsvarande rättigheter, huvudagentens ägande enligt R2).

Dump: ${dom.dumpNamn} · Tabell: ${dom.tabell} · Rader i källan: ${dom.kalla ? dom.kalla.rader.toLocaleString('sv-SE') : 'nåddes ej'}

## 1. Retentionssvep (kedja 5:s stående kontrakt)

| Dump | Storlek | Ålder | gzip -t | Tid |
|---|---|---|---|---|
${svepRader}

${dom.retention.gron ? 'Samtliga dumpar i fönstret integritetsgröna.' : `**FYND: ${dom.retention.trasiga.join(', ')} trasiga.**`}

## 2. Moment

| Moment | Resultat |
|---|---|
| Slutmarkörskontroll (kolla-dump-markorer) | ${dom.dumpGron ? 'GRÖN' : 'RÖD'} |
| Full restore i skrap-DB (källmåttstock) | ${(dom.fullRto?.sek ?? NaN).toFixed(1)} s · felrader ${dom.fel?.antalRader ?? 0} (okända ${dom.fel?.okanda.length ?? 0}) |
| Källchecksumma (md5, ordningsbeständigt textaggregat) | ${dom.kalla ? dom.kalla.checksumma : 'nåddes ej'} |
| Skyddstriggrar aktiva före (tgenabled=O) | ${dom.skyddsTriggrarAktiva ?? 'nåddes ej'}/${SKYDDS_TRIGGERS.length} |
| Kollateralbaslinje (${SKYDDS_TABELL}) | ${kol.totaltFore !== undefined ? `${kol.totaltFore.toLocaleString('sv-SE')} rader, varav ${kol.refererarFore.toLocaleString('sv-SE')} refererar ${dom.tabell}` : 'nåddes ej'} |
| Kirurgi-extraktion (zcat+awk ur dumpFILen) | ${dom.extraktion ? `${dom.extraktion.sek.toFixed(1)} s · ${dom.extraktion.dataRader.toLocaleString('sv-SE')} datarader · ${(dom.extraktion.byte / 1024).toFixed(0)} KiB` : 'nåddes ej'} |
| Extraktion komplett (datarader == källrader) | ${dom.extraktion ? (dom.extraktion.dataRader === dom.kalla.rader ? 'GRÖN' : 'RÖD') : 'nåddes ej'} |
| KATASTROF: mutation (buggig migrering, consensus_level=-1 på ${KATASTROF_RADER} senaste) | ${kat.landade ? `LANDADE — ${kat.muteradeRader.toLocaleString('sv-SE')} muterade, checksumma förändrad` : 'LANDADE EJ — RÖT'} |
| NAIV KIRURGI (kedja 5:s recept — SKALL vägras) | ${naiv.gripet ? `**VÄGRAD på ${(naiv.sek ?? NaN).toFixed(1)} s — rullades tillbaka, katastrofen kvar** (${naiv.felutdrag})` : 'EJ GRIPET — RÖT'} |
| SABOTAGE (mitt-rads-kolumnfel i receptfilen) | ${sab.gripet ? `GRIPET — psql vägrade (${(sab.sek ?? NaN).toFixed(1)} s), rullades tillbaka` : 'EJ GRIPET — RÖT'} |
| **RECEPET: replica-läge + DELETE + COPY i EN transaktion** | ${rec.ok ? `**${(rec.sek ?? NaN).toFixed(1)} s**` : `MISSLYCKADES: ${rec.stderr}`} |
| **Verifiering rader** | ${rec.raderEfter !== undefined ? `${rec.raderEfter.toLocaleString('sv-SE')} == ${dom.kalla.rader.toLocaleString('sv-SE')} ${rec.raderEfter === dom.kalla.rader ? 'GRÖN' : 'RÖD'}` : 'nåddes ej'} |
| **Verifiering checksumma** | ${rec.innehallIdentiskt !== undefined ? (rec.innehallIdentiskt ? 'IDENTISK med källan — GRÖN' : 'SKILJER — RÖT') : 'nåddes ej'} |
| **Kollateral oberörd (0 SET NULL-ärr)** | ${rec.kollateralObe_rord !== undefined ? (rec.kollateralObe_rord ? `${rec.kollateralEfter.refererar.toLocaleString('sv-SE')} referenser == baslinjen — kaskaden eldades ALDRIG` : `PÅVERKAD: ${JSON.stringify(rec.kollateralEfter)} vs ${JSON.stringify(kol)}`) : 'nåddes ej'} |
| **Hängande referenser (FK verifierad manuellt)** | ${rec.hangande !== undefined ? `${rec.hangande} ${rec.hangande === 0 ? '— GRÖN' : '— RÖT'}` : 'nåddes ej'} |
| **Skyddstriggrar aktiva efter** | ${rec.triggrarAktiva !== undefined ? `${rec.triggrarAktiva}/${SKYDDS_TRIGGERS.length} ${rec.triggrarAktiva === SKYDDS_TRIGGERS.length ? 'GRÖN' : 'RÖT'}` : 'nåddes ej'} |
| **LIVE-triggerbevis (UPDATE vägras i skyddstabellen)** | ${rec.liveTrigger ? (rec.liveTrigger.vgrades ? `VÄGRADE — skyddet LEVER (${rec.liveTrigger.felutdrag})` : 'UTE — RÖT') : 'nåddes ej'} |
| Replicationsrollen efter (SET LOCAL dog med transaktionen) | ${rec.roll ? `\`${rec.roll}\` ${rec.roll === 'origin' ? 'GRÖN' : 'RÖT'}` : 'nåddes ej'} |
| Städning | skrap-DB ${dom.stadning.skrapDbBort ? 'raderad' : 'EJ raderad'} · PG17 ${dom.stadning.pgStoppad ? 'stoppad' : dom.behall ? 'lämnad (--behall)' : 'EJ stoppad'} · tmp raderade |

## 3. Varför receptet är säkert (kontraktets kärna)

Replica-läget stänger av användartriggrar OCH FK-enforsering — därför (a) eldas
SET NULL-kaskaden aldrig (grannen får inga ärr, till skillnad från naiva
FK-paus-varianter där DELETE ändå springer in i triggern), (b) FK:n validerar
inte under appliceringen — därför VERIFIERAR verktyet referensintegriteten
manuellt efteråt (hängande-sonden: ${rec.hangande ?? 'nåddes ej'} hängande) och
(b) SET LOCAL dör med transaktionen: rollen är \`${rec.roll ?? '?'}\` efteråt,
triggrarna är ${rec.triggrarAktiva ?? '?'}/${SKYDDS_TRIGGERS.length} aktiva och
live-provet visar att skyddet fortfarande VÄGRAR skrivningar i ${SKYDDS_TABELL}.
Katastrof-not: en olycks-DELETE av ${dom.tabell} stoppas dessutom REDAN av
skyddet via kaskaden (dubbelt skydd) — den realistiska katastrofen är MUTATION
(triggerfri tabell), och den läker bara med detta recept.

## 4. Runbook — kirurgi av triggerblockad tabell vid verklig incident

1. \`node verktyg/dr-kedja7.mjs\` — bevisar att dagens dump bär tabellen hel +
   att receptet håller kontraktet (mot skrap-DB).
2. Receptfilen: \`SET LOCAL session_replication_role = replica;\` + \`DELETE FROM
   ${dom.tabell};\` + tabellens COPY-block — EN transaktion, ON_ERROR_STOP.
3. Applicera mot Supabase först efter kollateral-analys, i lågtrafik, med
   motsvarande superuser-rättigheter — huvudagentens ägande (R2).
4. Verifiera EFTERÅT (obligatoriskt eftersom FK:n var avstängd): rader +
   checksumma + hängande-referenssonden + att immutability-triggern lever
   (engångs-UPDATE som SKALL vägras).
5. Gräns: replica-läget pausar ALLA triggrar under transaktionen — kör ALDRIG
   mot en tabell vars triggrar utför affärslogik som COPY-datan förlitar sig på,
   och håll transaktionen minimal (endast DELETE + COPY).

## 5. Felkategorisering (full restore)

Kända ofarliga: roller ${Object.keys(dom.fel?.kanda.roller || {}).length} · scheman ${Object.keys(dom.fel?.kanda.scheman || {}).length} · övrigt ${dom.fel?.kanda.ovrigtKant ?? 0} · fortsättningsrader ${dom.fel?.kanda.fortsattning ?? 0}. ${dom.fel?.okanda.length ? `OKÄNDA ${dom.fel.okanda.length} — FYND.` : 'Okända 0.'}

## 6. Dom

**${gron ? `GRÖN — kirurgireceptet för ${dom.tabell} BEVISAT: naiv kirurgi vägras av skyddet, replica-receptet läker tabellen identiskt med 0 ärr och skyddet lever` : 'RÖT — se tabell ovan'}**

SLUT — maskinellt genererat av dr-kedja7.mjs ${new Date().toISOString()}
`;
  writeFileSync(vag, text);
  dom.protokollVag = path.relative(REPO_ROT, vag);
  console.log(`      ${dom.protokollVag}`);
  return gron;
}

// --- Huvudflöde ------------------------------------------------------------------------

function main() {
  const opts = lasArgument();
  flockStartaOm();
  taLas();
  if (!grind()) { slappLas(); process.exit(75); }
  const dom = {
    datumIso: new Date().toISOString().slice(0, 10),
    behall: opts.behall,
    tabell: STANDARD_TABELL,
    pgStartadesAvOss: false,
    tmpFiler: [],
    stadning: { skrapDbBort: false, pgStoppad: false, meddelande: '' },
  };
  let gron = false;
  try {
    dom.dumpVag = opts.fil ? path.resolve(opts.fil) : hittaSenasteDump();
    dom.dumpNamn = path.basename(dom.dumpVag);
    console.log(`DR-KEDJA 7 ${dom.datumIso} — kirurgirecept för triggerblockad tabell · dump ${dom.dumpNamn} · tabell ${dom.tabell}${opts.behall ? ' (--behall)' : ''}`);

    dom.retention = retentionSvep();
    dom.dumpGron = forkontrollDump(dom.dumpVag);
    if (!dom.dumpGron) {
      dom.avbrots = 'dumpen underkändes av slutmarkörskontrollen — återställning vägrades, PG17 rördes ej';
      dom.stadning = { skrapDbBort: true, pgStoppad: true, meddelande: 'PG17/skrap-DB rördes ej (avbrott före start)' };
      gron = skrivProtokoll(dom);
      slappLas();
      process.exit(1);
    }
    startaPg17(dom);
    try {
      skapaSkrapDb();
      aterstall(dom.dumpVag, dom);
      tabellForkontroll(dom);
      extraheraUrDump(dom.dumpVag, dom);
      katastrofOchRecept(dom);
    } finally {
      stadaPg17(dom);
    }
    gron = skrivProtokoll(dom);
  } catch (e) {
    console.error(`DR-ÖVNINGEN AVBRUTEN: ${e.message}`);
    dom.avbrots = e.message;
    try { skrivProtokoll(dom); } catch (e2) { console.error(`Protokoll kunde ej skrivas: ${e2.message}`); }
  } finally {
    slappLas();
  }
  process.exit(gron ? 0 : 1);
}

main();
