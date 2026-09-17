#!/usr/bin/env node
// dr-kedja5.mjs — KIRURGISK TABELL-ÅTERSTÄLLNING ur nattdumpen (spår 10, s10-u2 O5, 2026-09-16)
//
// Scenariot kedja 1-4 INTE täcker: EN tabell skadas i prod (felaktig migrering,
// olycksvikt DELETE) medan övriga tabeller är friska och NYARE än dumpen. Full
// restore (kedja 1) är rätt vapen vid totalförlust men fel vid tabellolycka —
// den skriver över ALLT och offrar dygnets skrivningar i friska tabeller.
// Detta verktyg bevisar den kirurgiska vägen: plocka ENDA tabellens data ur
// natt-dumpen (streamad zcat+awk — ingen pg_dump-roundtrip) och applicera den
// atomiskt (DELETE + COPY i EN transaktion) i en levande databas.
//
// Övningen mäter och bevisar:
//   1. RETENTIONSSVEP: varje dump i fönstret gzip-testas (kedja 3:s läxa — en
//      korrupt arkivfil satt 7 dygn oupptäckt; dumparna har aldrig svepits).
//   2. KÄLLA: full restore i skrap-DB (jämförbar med kedja 1:s RTO-serie) —
//      måttstocken för det kirurgiska resultatet.
//   3. KIRURGI-EXTRAKTION: COPY-blocket för tabellen ur dumpfilen (tid, rader).
//   4. SABOTAGE: en datakorrupt extraktion (kolumnfel i mitt-rad — ser hel ut,
//      är oläslig) FÅR ALDRI landa — verktyget skadar egen export och bevisar
//      att psql (ON_ERROR_STOP + EN transaktion) griper den och rullar tillbaka
//      HELA appliceringen (atomicitetsbeviset). Bevisat 2026-09-16: en utan
//      \.-terminator trunkerad COPY accepteras TYST av psql vid EOF — därför
//      är datafelet (inte trunkeringen) den sabotageklass som testas.
//   5. KATASTROF + KIRURGI: tabellen töms (simulerad olycka, med mätning av
//      KOLLATERAL — inkommande FK:s ON DELETE-beteende) och återställs sedan
//      ur extraktionen; radantal + innehållschecksumma SKALL matcha källan.
//   6. KOLLATERALRAPPORT: kirurgin läker sin tabell men ALDRIG sidoeffekter i
//      grannar (t.ex. ON DELETE SET NULL-värden) — mäts före/efter, redovisas
//      i protokollet som runbook-kunskap.
//
// Lägen/flaggor:
//   (inget arg)             kör mot SENASTE natt-dump, tabell public.section_data_snapshots
//                           (organismens minne — 1,18 M rader, ingen inkommande
//                           FK, ingen trigger; bevisat 2026-09-16 att default-
//                           kandidaten board_decisions BLOCKERAS av
//                           forecast_immutable-triggern via sin SET NULL-kaskad)
//   --tabell <schema.namn>  välj annan tabell (måste finnas i dumpens COPY-block;
//                           vägrar tabeller med blockerande inkommande FK)
//   --fil <väg>             kör mot given dumpfil (.sql.gz)
//   --behall                städa EJ (lämna skrap-DB + PG17 för manuell granskning)
//
// Lås/grind/exit-koder = familjekontraktet (dr-ovning.mjs): flock på
// /tmp/ak1a-dr-prov.log .lock-vägran (3) och RAM-/diskgrind (75) ärvs rakt av.
// Felhantering: kända Supabase-restore-fel kategoriseras (v98 F3 + s10-u2);
// okända fel är fynd. Städning körs ALLTID (finally) om inte --behall gavs.
//
// OBS prod: övningen sker ENDAST i lokal PG17 skrap-DB. Att applicera en
// extraktion mot Supabase-prod är samma fil + psql med anslutningsnyckel —
// nycklarna tillförs av huvudagenten vid verklig incident (R2: ALDRIG här).

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
const SKRAP_DB = 'ak1a_dr_k5';
const PG_KLUSTER = ['17', 'main'];
const STANDARD_TABELL = 'public.section_data_snapshots';
const LAS_MAX_ALDER_MS = 30 * 60 * 1000; // dött lås (död agent) tas över efter 30 min

function lasArgument() {
  const args = process.argv.slice(2);
  const opts = { fil: null, behall: false, tabell: STANDARD_TABELL };
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--fil') opts.fil = args[++i];
    else if (args[i] === '--behall') opts.behall = true;
    else if (args[i] === '--tabell') opts.tabell = args[++i];
    else if (args[i] === '--hjalp' || args[i] === '--help') {
      console.log('Användning: node verktyg/dr-kedja5.mjs [--tabell public.<tabell>] [--fil <dump.sql.gz>] [--behall]');
      process.exit(0);
    } else {
      console.error(`Okänt argument: ${args[i]} (se --hjalp)`);
      process.exit(2);
    }
  }
  // Injektionsskydd: tabellnamnet byggs in i SQL/awk — endast [a-z_0-9.]
  if (!/^[a-z_][a-z0-9_]*(\.[a-z_][a-z0-9_]*)?$/.test(opts.tabell)) {
    console.error(`OGILTIGT TABELLNAMN: "${opts.tabell}" — format schema.namn med a-z/_/0-9.`);
    process.exit(2);
  }
  if (!opts.tabell.includes('.')) opts.tabell = `public.${opts.tabell}`;
  return opts;
}

// --- Lås: EN agent äger PG17 DR-fönstret (familjekontraktet, dr-ovning.mjs) ---

function taLas() {
  if (process.env.AK1A_DR_FLOCK === '1') {
    const fdFlock = openSync(LAS_VAG, 'w');
    writeFileSync(fdFlock, `pid=${process.pid} start=${new Date().toISOString()} verktyg=dr-kedja5.mjs flock=1\n`);
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
  writeFileSync(fd, `pid=${process.pid} start=${new Date().toISOString()} verktyg=dr-kedja5.mjs\n`);
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

// --- Grind: ram + disk FÖRE allt tungt (familjekontraktet) -------------------

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

// --- Processhjälp -------------------------------------------------------------

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

// --- Steg 1: dumpval + retentionssvep + förkontroll ---------------------------

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

// Kedja 3:s läxa (korrupt tarball 7 dygn oupptäckt) tillämpad på dumparna:
// VARJE dump i fönstret gzip-testas vid varje övning — integritet är inte bara
// en egenskap hos den nyaste filen.
function retentionSvep() {
  console.log('[1/8] Retentionssvep: gzip -t på varje dump i fönstret …');
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
  console.log(`[2/8] Dumpkontroll (kolla-dump-markorer.mjs --fil) …`);
  const r = kor('node', [path.join(REPO_ROT, 'verktyg', 'kolla-dump-markorer.mjs'), '--fil', dump], { timeoutMs: 120000 });
  console.log(r.stdout.split('\n').map((l) => `      ${l}`).join('\n'));
  if (r.stderr) console.log(r.stderr.split('\n').map((l) => `      ${l}`).join('\n'));
  if (r.status !== 0) {
    console.error('DUMPEN UNDERKÄND — återställning vägras (en ofullständig dump är ingen backup).');
    return false;
  }
  return true;
}

// --- Steg 3-4: PG17 + skrap-DB -------------------------------------------------

function pgUpp() {
  return sudo(['-u', 'postgres', 'pg_isready', '-q', '-p', '5432']).ok;
}

function startaPg17(dom) {
  console.log('[3/8] Startar lokal PG17 …');
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
  console.log(`[4/8] Skapar färsk skrap-DB ${SKRAP_DB} (dropdb --if-exists + createdb) …`);
  const drop = sudo(['-u', 'postgres', 'dropdb', '--if-exists', SKRAP_DB]);
  if (!drop.ok) throw new Error(`dropdb misslyckades: ${drop.stderr}`);
  const skapa = sudo(['-u', 'postgres', 'createdb', SKRAP_DB]);
  if (!skapa.ok) throw new Error(`createdb misslyckades: ${skapa.stderr}`);
  console.log(`      ${SKRAP_DB} skapad färsk.`);
}

function stadaPg17(dom) {
  console.log('[8/8] Städning: skrap-DB + PG17 + tmp-filer …');
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

// --- Steg 5: full restore (källmåttstocken) + felkategorisering -----------------

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
  console.log('[5/8] FULL ÅTERSTÄLLNING i skrap-DB (källmåttstocken) — RTO-mätning …');
  const felFil = `/tmp/dr-kedja5-fel-${dom.datumIso}.log`;
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

// --- Steg 6: tabellförkontroll (källa, checksumma, inkommande FK, kollateral) ---

function tabellForkontroll(dom) {
  const T = dom.tabell;
  console.log(`[6/8] Tabellförkontroll: ${T} …`);
  const finns = sql(`SELECT to_regclass('${T}') IS NOT NULL;`).trim();
  if (finns !== 't') throw new Error(`tabellen ${T} saknas i den återställda dumpen — välj en tabell som finns (COPY-block).`);

  dom.kalla = {
    rader: Number(sql(`SELECT count(*) FROM ${T};`).trim()),
    // Per-rad-md5 aggregatat (32 tecken/rad) i stället för råtext — minnessäkert
    // även vid miljonradstabeller, fortfarande innehålls- och ordningsbestämt.
    checksumma: sql(`SELECT md5(string_agg(md5(t::text), '' ORDER BY md5(t::text))) FROM ${T} t;`).trim(),
  };
  console.log(`      källa: ${dom.kalla.rader.toLocaleString('sv-SE')} rader · checksumma ${dom.kalla.checksumma.slice(0, 12)}…`);

  // Inkommande FK:ar avgör om katastrof-simuleringen (DELETE) alls kan köras och
  // vilka grannar som drabbas av sidoeffekter. confdeltype: a/r/d = blockerande
  // (DELETE:s nekas eller ersätts med ogiltig default), n = SET NULL, c = CASCADE
  // (cascade är INTE blockerande men raderar grannrader — protokollförs tydligt).
  const fkRader = sql(
    `SELECT conrelid::regclass::text || '|' || ` +
    `(SELECT string_agg(a.attname, ',' ORDER BY x.ord) FROM unnest(conkey) WITH ORDINALITY x(attnum, ord) ` +
    ` JOIN pg_attribute a ON a.attrelid = conrelid AND a.attnum = x.attnum) || '|' || confdeltype::text ` +
    `FROM pg_constraint WHERE contype = 'f' AND confrelid = '${T}'::regclass ORDER BY 1;`,
  ).split('\n').filter((l) => l.trim() !== '');
  dom.inkommandeFk = fkRader.map((rad) => {
    const [tabell, kolumner, typ] = rad.split('|');
    return { tabell, kolumner, typ,
      typText: { a: 'NO ACTION', r: 'RESTRICT', c: 'CASCADE', n: 'SET NULL', d: 'SET DEFAULT' }[typ] || typ };
  });
  const blockerande = dom.inkommandeFk.filter((f) => ['a', 'r', 'd'].includes(f.typ));
  for (const f of dom.inkommandeFk) {
    console.log(`      inkommande FK: ${f.tabell}(${f.kolumner}) → ${f.typText}`);
  }
  if (blockerande.length > 0) {
    throw new Error(`tabellen ${T} har blockerande inkommande FK (${blockerande.map((b) => `${b.tabell}:${b.typText}`).join(', ')}) — DELETE nekas/faller tillbaka felaktigt; kirurgi kräver manuell FK-hantering (se protokoll); välj annan tabell`);
  }
  dom.kaskadFarlig = dom.inkommandeFk.some((f) => f.typ === 'c');
  if (dom.kaskadFarlig) {
    throw new Error(`tabellen ${T} har CASCADE-FK — katastrof-simuleringen skulle RADERA grannrader; vägra (kirurgi-övningskontraktet: bara mätbara sidoeffekter)`);
  }

  // Kollateralbaslinje: icke-null-refererande rader per granne (före katastrof).
  dom.kollateral = dom.inkommandeFk.map((f) => {
    const antal = Number(sql(`SELECT count(*) FROM ${f.tabell} WHERE ${f.kolumner.split(',')[0]} IS NOT NULL;`).trim());
    return { ...f, refererarFore: antal, sattnullVidSkada: null, efterKirurgi: null };
  });
  for (const k of dom.kollateral) {
    console.log(`      kollateralbaslinje: ${k.tabell} refererar i ${k.refererarFore.toLocaleString('sv-SE')} rader`);
  }
}

// --- Kirurgi-extraktion: COPY-blocket ur dumpFILEN (streamad, ingen pg_dump) ---

function extraheraUrDump(dump, dom) {
  console.log(`[7/8] KIRURGI-EXTRAKTION: ${dom.tabell} COPY-block ur ${path.basename(dump)} (zcat | awk) …`);
  const utFil = `/tmp/dr-kedja5-${process.pid}-tabell.sql`;
  const t0 = process.hrtime.bigint();
  // Endast direkta strängjämförelser i awk-programmet (index/== — ingen regex,
  // inga escape-väggar); tabellnamnet är regex-validerat (a-z/_/0-9/.) i
  // lasArgument — ingen injektionsväg.
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
  dom.extraktion = {
    utFil, ms, sek: ms / 1000,
    byte: statSync(utFil).size,
    dataRader,
    copyRad: copyRad.slice(0, 120) + (copyRad.length > 120 ? '…' : ''),
  };
  console.log(`      ${dataRader.toLocaleString('sv-SE')} datarader · ${(dom.extraktion.byte / 1024).toFixed(0)} KiB · ${dom.extraktion.sek.toFixed(1)} s`);
  if (dataRader !== dom.kalla.rader) {
    throw new Error(`extraktionsraderna (${dataRader}) ≠ källans rader (${dom.kalla.rader}) — extraktionen är inte komplett`);
  }
}

// --- Katastrof + sabotage + kirurgi ----------------------------------------------

function applicera(filVag, dom) {
  // EN transaktion: DELETE + COPY tillsammans — alt eller inget.
  const r = sudo(['-u', 'postgres', 'psql', '-d', SKRAP_DB, '-X', '-q',
    '--single-transaction', '-v', 'ON_ERROR_STOP=1', '-f', filVag], { timeoutMs: 300000 });
  return r;
}

function katastrofOchKirurgi(dom) {
  const T = dom.tabell;
  const renFil = `/tmp/dr-kedja5-${process.pid}-applicera.sql`;
  const sabFil = `/tmp/dr-kedja5-${process.pid}-sabotage.sql`;
  dom.tmpFiler.push(renFil, sabFil);
  const deleteRad = `DELETE FROM ${T};\n`;
  writeFileSync(renFil, deleteRad + readFileSync(dom.extraktion.utFil, 'utf8'));

  // Katastrof-simulering: tabellen töms av en felaktig operation.
  console.log(`      KATASTROF-SIMULERING: tömmer ${T} i skrap-DB:n (den "levande prod") …`);
  sql(`DELETE FROM ${T};`);
  const raderEfterSkada = Number(sql(`SELECT count(*) FROM ${T};`).trim());
  if (raderEfterSkada !== 0) throw new Error(`katastrof-simuleringen misslyckades (räknare ${raderEfterSkada} ≠ 0)`);
  for (const k of dom.kollateral) {
    k.sattnullVidSkada = k.refererarFore - Number(sql(`SELECT count(*) FROM ${k.tabell} WHERE ${k.kolumner.split(',')[0]} IS NOT NULL;`).trim());
    console.log(`      kollateral vid skada: ${k.tabell} fick ${k.sattnullVidSkada.toLocaleString('sv-SE')} referenser bort (ON DELETE ${k.typText})`);
  }

  // SABOTAGE: en mitt-rad korrumperas till oläsbart datafel (tabseparatorerna
  // bort — flerkolumnstabeller får "missing data for column"; enkolumnstabeller
  // får i stället en extra tabb → "extra data"). Detta är den farliga klassen:
  // en skadad överföring som strukturellt SER hel ut. Kontraktet: appliceringen
  // SKALL misslyckas (ON_ERROR_STOP) OCH transaktionen rullas tillbaka helt —
  // tabellen får förbli i sitt skadade läge (0 rader), inget partiellt data
  // landar. (Bevisat 2026-09-16: en utan \.-terminator TRUNKERAD COPY accepteras
  // tyst av psql vid EOF — den varianten är INTE ett giltigt sabotage.)
  console.log('      SABOTAGE: korrumperar en mitt-rad i extraktionen (kolumnfel) — applicering SKALL vägras …');
  const rader = readFileSync(dom.extraktion.utFil, 'utf8').split('\n');
  const copyIndex = rader.findIndex((l) => l.startsWith(`COPY ${T} (`));
  const slutIndex = rader.findIndex((l) => l === '\\.');
  const kolumnantal = (rader[copyIndex].match(/\(/g) || []).length >= 1
    ? rader[copyIndex].slice(rader[copyIndex].indexOf('(') + 1, rader[copyIndex].lastIndexOf(')')).split(',').length
    : 1;
  const dataStart = copyIndex + 1;
  const mittIndex = dataStart + Math.floor((slutIndex - dataStart) / 2);
  const korrumperad = kolumnantal > 1
    ? rader[mittIndex].replace(/\t/g, '')
    : `${rader[mittIndex]}\tX`;
  const sabotadeRader = [...rader];
  sabotadeRader[mittIndex] = korrumperad;
  writeFileSync(sabFil, deleteRad + sabotadeRader.join('\n'));
  const t0 = process.hrtime.bigint();
  const sabR = applicera(sabFil, dom);
  dom.sabotage = {
    sek: tidMs(t0) / 1000,
    psqlVagrade: sabR.status !== 0,
    tabellOrord: Number(sql(`SELECT count(*) FROM ${T};`).trim()) === 0,
    felutdrag: (sabR.stderr || sabR.stdout || '').split('\n').filter((l) => l.includes('ERROR') || l.includes(' kopplat')).slice(0, 3).join(' | '),
  };
  dom.sabotage.gripet = dom.sabotage.psqlVagrade && dom.sabotage.tabellOrord;
  console.log(`      psql ${dom.sabotage.psqlVagrade ? 'VÄGRADE' : 'ACCEPTERADE (!)'} · tabellen ${dom.sabotage.tabellOrord ? 'orörd (0 rader — transaktionen rullades tillbaka)' : 'PÅVERKAD (!)'} · ${dom.sabotage.felutdrag || 'ingen feltext'}`);
  if (!dom.sabotage.gripet) {
    throw new Error('SABOTAGET EJ GRIPET — atomicitetskontraktet brister; kirurgin FÅR INTE fortsättas (dom RÖT)');
  }

  // ÄKTA KIRURGI: applicera den rena extraktionen atomiskt.
  console.log('      KIRURGI: applicerar ren extraktion (DELETE + COPY i EN transaktion) …');
  const t1 = process.hrtime.bigint();
  const kirR = applicera(renFil, dom);
  dom.kirurgi = {
    sek: tidMs(t1) / 1000,
    ok: kirR.ok,
    stderr: kirR.ok ? '' : (kirR.stderr || '').slice(0, 300),
  };
  if (!kirR.ok) throw new Error(`kirurgi-appliceringen misslyckades: ${dom.kirurgi.stderr}`);
  dom.kirurgi.raderEfter = Number(sql(`SELECT count(*) FROM ${T};`).trim());
  dom.kirurgi.checksummaEfter = sql(`SELECT md5(string_agg(md5(t::text), '' ORDER BY md5(t::text))) FROM ${T} t;`).trim();
  dom.kirurgi.innehallIdentiskt = dom.kirurgi.checksummaEfter === dom.kalla.checksumma;
  for (const k of dom.kollateral) {
    k.efterKirurgi = k.refererarFore - Number(sql(`SELECT count(*) FROM ${k.tabell} WHERE ${k.kolumner.split(',')[0]} IS NOT NULL;`).trim());
  }
  console.log(`      ${dom.kirurgi.raderEfter.toLocaleString('sv-SE')} rader tillbaka på ${dom.kirurgi.sek.toFixed(1)} s · checksumma ${dom.kirurgi.innehallIdentiskt ? 'IDENTISK med källan' : 'SKILJER (!)'}`);
  for (const k of dom.kollateral) {
    console.log(`      kollateral efter kirurgi: ${k.tabell} saknar fortfarande ${k.efterKirurgi.toLocaleString('sv-SE')} referenser (kirurgin läker EJ grannar — runbook-fynd)`);
  }
  if (dom.kirurgi.raderEfter !== dom.kalla.rader || !dom.kirurgi.innehallIdentiskt) {
    throw new Error(`kirurgin verifierades ej: rader ${dom.kirurgi.raderEfter}/${dom.kalla.rader} · checksumma ${dom.kirurgi.innehallIdentiskt ? 'ok' : 'avvikande'}`);
  }
}

// --- Protokoll -------------------------------------------------------------------

function skrivProtokoll(dom) {
  console.log('Protokoll …');
  let vag = path.join(REPO_ROT, 'data', 'forskning', `DR-KEDJA5-${dom.datumIso}-AUTO.md`);
  let n = 2;
  while (existsSync(vag)) vag = path.join(REPO_ROT, 'data', 'forskning', `DR-KEDJA5-${dom.datumIso}-AUTO-${n++}.md`);
  const svepRader = dom.retention.rader.map((r) =>
    `| ${r.namn} | ${r.storlekMB.toFixed(1)} MB | ${r.alderDagar} d | ${r.gzipOk ? 'GRÖN' : '**TRASIG**'} | ${r.testSek.toFixed(1)} s |`).join('\n');
  // Avbrott mitt i övningen får aldrig krascha protokollet — okända fält är
  // "nåddes ej", aldrig undefined (familjekontraktet: även RÖT körs protokollförs).
  const fkLista = dom.inkommandeFk || [];
  const kollLista = dom.kollateral || [];
  const fkRader = fkLista.length === 0
    ? '| (ingen) | — | — | ingen kollateral |'
    : kollLista.map((k) =>
        `| ${k.tabell}(${k.kolumner}) | ${k.typText} | ${k.refererarFore.toLocaleString('sv-SE')} | ${k.sattnullVidSkada === null || k.sattnullVidSkada === undefined ? 'nåddes ej' : k.sattnullVidSkada.toLocaleString('sv-SE')} | ${k.efterKirurgi === null || k.efterKirurgi === undefined ? 'nåddes ej' : k.efterKirurgi.toLocaleString('sv-SE')} |`).join('\n');
  const gron = dom.retention.gron && dom.dumpGron && dom.restoreOk && dom.fel.okanda.length === 0
    && dom.sabotage?.gripet === true && dom.kirurgi?.ok === true
    && dom.kirurgi?.raderEfter === dom.kalla?.rader && dom.kirurgi?.innehallIdentiskt === true
    && dom.stadning.skrapDbBort && (dom.behall || dom.stadning.pgStoppad);

  const text = `# DR-KEDJA 5 ${dom.datumIso} — KIRURGISK TABELL-ÅTERSTÄLLNING (AUTO)

Körd av \`verktyg/dr-kedja5.mjs\` (spår 10, s10-u2 O5). Scenario: EN tabell skadas
i prod (felaktig migrering/DELETE) medan övriga tabeller är friska och nyare än
dumpen — full restore (kedja 1) skulle offra dygnets skrivningar; detta prov
bevisar den kirurgiska vägen. Allt sker i skrap-DB ${SKRAP_DB} på lokal PG17 —
**prod RÖRDES ALDRIG** (applicering mot Supabase vid verklig incident = samma fil
+ psql med nyckel, huvudagentens ägande enligt R2).

Dump: ${dom.dumpNamn} · Tabell: ${dom.tabell} · Rader i källan: ${dom.kalla ? dom.kalla.rader.toLocaleString('sv-SE') : 'nåddes ej'}

## 1. Retentionssvep (kedja 3:s läxa på dumparna)

| Dump | Storlek | Ålder | gzip -t | Tid |
|---|---|---|---|---|
${svepRader}

${dom.retention.gron ? 'Samtliga dumpar i fönstret integritetsgröna.' : `**FYND: ${dom.retention.trasiga.join(', ')} trasiga — fönstret är INTE helt återställningsbart.**`}

## 2. Moment

| Moment | Resultat |
|---|---|
| Slutmarkörskontroll (kolla-dump-markorer) | ${dom.dumpGron ? 'GRÖN' : 'RÖD'} |
| Full restore i skrap-DB (källmåttstock) | ${(dom.fullRto?.sek ?? NaN).toFixed(1)} s · felrader ${dom.fel?.antalRader ?? 0} (okända ${dom.fel?.okanda.length ?? 0}) |
| Källchecksumma (md5, ordningsbestemd textaggr.) | ${dom.kalla ? dom.kalla.checksumma : 'nåddes ej'} |
| Kirurgi-extraktion (zcat+awk ur dumpFILen) | ${dom.extraktion ? `${dom.extraktion.sek.toFixed(1)} s · ${dom.extraktion.dataRader.toLocaleString('sv-SE')} datarader · ${(dom.extraktion.byte / 1024).toFixed(0)} KiB` : 'nåddes ej'} |
| Extraktion komplett (datarader == källrader) | ${dom.extraktion ? (dom.extraktion.dataRader === dom.kalla.rader ? 'GRÖN' : 'RÖD') : 'nåddes ej'} |
| Katastrof-simulering (DELETE i "prod") | ${kollLista.some((k) => k.sattnullVidSkada !== null && k.sattnullVidSkada !== undefined) ? 'tabellen tömd (0 rader) — kollateral se §3' : 'tabellen tömd (0 rader)'} |
| SABOTAGE (kolumnfel i mitt-rad — strukturellt hel, oläslig data) | ${dom.sabotage ? (dom.sabotage.gripet ? `GRIPET — psql vägrade (${dom.sabotage.sek.toFixed(1)} s), transaktionen rullades tillbaka, tabellen orörd` : 'EJ GRIPET — RÖT') : 'nåddes ej'} |
| **Kirurgi: applicering (DELETE+COPY i EN transaktion)** | ${dom.kirurgi ? `**${dom.kirurgi.sek.toFixed(1)} s**` : 'nåddes ej'} |
| **Kirurgi: verifiering rader** | ${dom.kirurgi ? `${dom.kirurgi.raderEfter.toLocaleString('sv-SE')} == ${dom.kalla.rader.toLocaleString('sv-SE')} ${dom.kirurgi.raderEfter === dom.kalla.rader ? 'GRÖN' : 'RÖD'}` : 'nåddes ej'} |
| **Kirurgi: verifiering checksumma** | ${dom.kirurgi ? (dom.kirurgi.innehallIdentiskt ? 'IDENTISK med källan — GRÖN' : 'SKILJER — RÖT') : 'nåddes ej'} |
| Städning | skrap-DB ${dom.stadning.skrapDbBort ? 'raderad' : 'EJ raderad'} · PG17 ${dom.stadning.pgStoppad ? 'stoppad' : dom.behall ? 'lämnad (--behall)' : 'EJ stoppad'} · tmp raderade |

## 3. Kollateral — kirurgins gränser (runbook-kunskap)

En tabellkirurgi läker SIN tabell men ALDRIG sidoeffekter som katastrofen
orsakade i grannar (här: ON DELETE SET NULL). Per inkommande FK:

| Inkommande FK | ON DELETE | Refererade före | Förlorade vid skada | Fortfarande förlorade efter kirurgi |
|---|---|---|---|---|
${fkRader}

${kollLista.some((k) => (k.efterKirurgi ?? 0) > 0) ? '**SLUTSATS: grannarnas förlorade referenser kvarstår efter kirurgin — komplett läkning kräver separata åtgärder (full restore i värsta fallet).**' : '(ingen kollateral kvarstod)'}

## 4. Runbook — tabellkirurgi vid verklig incident

1. \`node verktyg/dr-kedja5.mjs --tabell <schema.tabell>\` — bevisar att Dagens dump bär tabellen hel (extraktion+checksumma mot skrap-DB).
2. Ta fram extraktionen i prod-format: verktygets /tmp-fil (ren ${dom.tabell}-COPY) + prefix \`DELETE FROM ${dom.tabell};\` — EN transaktion, ON_ERROR_STOP.
3. Applicera mot Supabase först efter kollateral-analys (pg_constraint-frågan i verktyget) och i lågtrafik — nyckel tillförs av huvudagenten (R2).
4. Verifiera: rader + checksumma mot skrap-DB:n; grannar enligt §3.
5. Viktiga gränser: FK med NO ACTION/RESTRICT blockerar; CASCADE raderar grannrader; SET NULL lämnar ärr efter sig — alla tre syns i verktygets förkontroll. **Triggerfynd (bevisat 2026-09-16): public.board_decisions kan INTE kirurgeras på detta sätt — dess SET NULL-kaskad mot forecast_log träffar immutabilitetstriggern forecast_immutable() som VÄGRAR UPDATE ("registret är oföränderligt") — hela DELETE:n rullas tillbaka. Skyddet är korrekt drift (olycksradering stoppas) men kräver specialrecept (FK-paus eller tabellbyte-swap) som bara huvudagenten äger.**

## 5. Felkategorisering (full restore)

Kända ofarliga: roller ${Object.keys(dom.fel?.kanda.roller || {}).length} · scheman ${Object.keys(dom.fel?.kanda.scheman || {}).length} · övrigt ${dom.fel?.kanda.ovrigtKant ?? 0} · fortsättningsrader ${dom.fel?.kanda.fortsattning ?? 0}. ${dom.fel?.okanda.length ? `OKÄNDA ${dom.fel.okanda.length} — FYND.` : 'Okända 0.'}

## 6. Dom

**${gron ? 'GRÖN — kirurgisk tabellåterställning bevisad: extraktion ur dumpfil, sabotage gripen, innehåll identiskt' : 'RÖT — se tabell ovan'}**

SLUT — maskinellt genererat av dr-kedja5.mjs ${new Date().toISOString()}
`;
  writeFileSync(vag, text);
  dom.protokollVag = path.relative(REPO_ROT, vag);
  console.log(`      ${dom.protokollVag}`);
  return gron;
}

// --- Huvudflöde --------------------------------------------------------------------

function main() {
  const opts = lasArgument();
  flockStartaOm();
  taLas();
  if (!grind()) { slappLas(); process.exit(75); }
  const dom = {
    datumIso: new Date().toISOString().slice(0, 10),
    behall: opts.behall,
    tabell: opts.tabell,
    pgStartadesAvOss: false,
    tmpFiler: [],
    stadning: { skrapDbBort: false, pgStoppad: false, meddelande: '' },
  };
  let gron = false;
  try {
    dom.dumpVag = opts.fil ? path.resolve(opts.fil) : hittaSenasteDump();
    dom.dumpNamn = path.basename(dom.dumpVag);
    console.log(`DR-KEDJA 5 ${dom.datumIso} — kirurgisk tabellåterställning · dump ${dom.dumpNamn} · tabell ${dom.tabell}${opts.behall ? ' (--behall)' : ''}`);

    dom.retention = retentionSvep();
    dom.dumpGron = forkontrollDump(dom.dumpVag);
    if (!dom.dumpGron) {
      dom.avbrots = 'dumpen underkändes av slutmarkörskontrollen — återställning vägrades, PG17 rördes ej';
      dom.stadning = { skrapDbBort: true, pgStoppad: true, meddelande: 'PG17/skrap-DB rördes ej (avbrot före start)' };
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
      katastrofOchKirurgi(dom);
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
