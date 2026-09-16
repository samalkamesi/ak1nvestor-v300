#!/usr/bin/env node
// dr-kedja6.mjs — STORAGE-RESTORE: objektlagrets bägge halvor (spår 10, s10-u3, 2026-09-16)
//
// Kedjorna 1-5 bevisar DATABASEN (SQL-dumpen) och system_events (moln-JSON).
// Supabase STORAGE är det enda lagret utan bevisad innehålls-återställning:
//   - SQL-dumpen bär METADATA (storage.buckets/objects) men ALDRIG blobbar.
//   - moln-JSON-exporten (backup-fran-molnet.mjs) läser system_events — inte blobbar.
// Blobbarna lever ALLTSÅ bara i molnet. Detta verktyg mäter och bevisar
// återställningsvägen för BÅDA halvorna:
//   1. RETENTIONSSVEP: gzip -t på varje dump (familjekontraktet sedan kedja 5).
//   2. METADATA-lagret: full restore i skrap-DB (källmåttstocken) + mätning av
//      storage-schemat: buckets, objekt, summa metadata.size, checksumma på
//      storage.objects — restores bevisar att dumpen bär metadata-lagret hel.
//   3. LEVANDE KÄLLAN: ENDAST läsanrop mot Storage REST (GET /bucket,
//      POST /object/list = listning, GET /object/... = nerladdning). Prod RÖRS
//      ALDRIG med skrivning. Korsning dump↔live: buckets/objekt som tillkommit
//      eller försvunnit sedan dumpen = Storage-lagrets verkliga RPO-läge.
//   4. INNEHÅLLS-PROV: ett NEUTRALT objekt (aldrig .env*/pem/key/rsa/secret —
//      R2) laddas ner och dess byte-tal verifieras MOT BÅDA källorna (listans
//      metadata.size och dumpens storage.objects.metadata->>size). Detta är
//      första gången innehålls-vägen bevisas.
//
// Skydd (familjekontraktet dr-ovning.mjs/dr-kedja5.mjs): flock på
// /tmp/ak1a-dr-prov.lock, låsfilsvägran (3), RAM-/diskgrind (75), fel-
// kategorisering, maskinellt protokoll, städning ALLTID i finally.
// Nycklar: läses ENDAST ur env (Mimosa-kontraktet) och loggas ALDRIG;
// protokollet redovisar antal, namn, storlekar, tider — aldrig nyckelvärden,
// aldrig innehållet i nedladdade objekt.
//
// Lägen/flaggor:
//   (inget arg)   kör mot SENASTE natt-dump
//   --fil <väg>   kör mot given dumpfil (.sql.gz)
//   --behall      städa EJ (lämna skrap-DB + PG17 för manuell granskning)

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
const SKRAP_DB = 'ak1a_dr_k6';
const PG_KLUSTER = ['17', 'main'];
const LAS_MAX_ALDER_MS = 30 * 60 * 1000; // dött lås (död agent) tas över efter 30 min
// R2: dessa namnmönster väljs ALDRIG som innehålls-prov (och deras innehåll
// läses aldrig — namnen listas endast som metadata i protokollet).
const KANSLIGT_NAMN = /\.(env|pem|key|rsa|secret)/i;

function lasArgument() {
  const args = process.argv.slice(2);
  const opts = { fil: null, behall: false };
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--fil') opts.fil = args[++i];
    else if (args[i] === '--behall') opts.behall = true;
    else if (args[i] === '--hjalp' || args[i] === '--help') {
      console.log('Användning: node verktyg/dr-kedja6.mjs [--fil <dump.sql.gz>] [--behall]');
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
    writeFileSync(fdFlock, `pid=${process.pid} start=${new Date().toISOString()} verktyg=dr-kedja6.mjs flock=1\n`);
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
  writeFileSync(fd, `pid=${process.pid} start=${new Date().toISOString()} verktyg=dr-kedja6.mjs\n`);
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

// --- Steg 1-2: dumpval + retentionssvep + förkontroll (familjekontraktet) -----

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
  console.log(`[2/9] Dumpkontroll (kolla-dump-markorer.mjs --fil) …`);
  const r = kor('node', [path.join(REPO_ROT, 'verktyg', 'kolla-dump-markorer.mjs'), '--fil', dump], { timeoutMs: 120000 });
  console.log(r.stdout.split('\n').map((l) => `      ${l}`).join('\n'));
  if (r.stderr) console.log(r.stderr.split('\n').map((l) => `      ${l}`).join('\n'));
  if (r.status !== 0) {
    console.error('DUMPEN UNDERKÄND — återställning vägras (en ofullständig dump är ingen backup).');
    return false;
  }
  return true;
}

// --- Steg 3-4: PG17 + skrap-DB + full restore (källmåttstocken) ---------------

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
  const felFil = `/tmp/dr-kedja6-fel-${dom.datumIso}.log`;
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

// --- Steg 6: storage-METADATA ur skrap-DB:n (dumpens bild) ---------------------

function metaStatistik(dom) {
  console.log('[6/9] STORAGE-METADATA i återställd dump (storage-schemat) …');
  const saknas = sql(`SELECT to_regclass('storage.objects') IS NULL;`).trim();
  if (saknas === 't') throw new Error('storage.objects saknas i den återställda dumpen — dumpen bär inte metadata-lagret');
  const buckets = sql(`SELECT id, name, public FROM storage.buckets ORDER BY name;`).split('\n').filter(Boolean)
    .map((rad) => { const [id, namn, pub] = rad.split('|'); return { id, namn, publik: pub === 't' }; });
  const objektRader = Number(sql(`SELECT count(*) FROM storage.objects;`).trim());
  const objektPerBucket = sql(`SELECT bucket_id, count(*) FROM storage.objects GROUP BY 1 ORDER BY 2 DESC;`).split('\n').filter(Boolean)
    .map((rad) => { const [b, n] = rad.split('|'); return { bucketId: b, rader: Number(n) }; });
  const summaByte = Number(sql(`SELECT coalesce(sum((metadata->>'size')::bigint), 0) FROM storage.objects;`).trim());
  const checksumma = sql(`SELECT md5(string_agg(md5(o::text), '' ORDER BY md5(o::text))) FROM storage.objects o;`).trim();
  // Objektlista (bucket|namn|size) för korsningen mot levande källan.
  const objektLista = sql(`SELECT b.name, o.name, coalesce((o.metadata->>'size')::bigint, -1) FROM storage.objects o JOIN storage.buckets b ON b.id = o.bucket_id ORDER BY 2;`, { timeoutMs: 180000 })
    .split('\n').filter(Boolean)
    .map((rad) => { const [bucket, namn, storlek] = rad.split('|'); return { bucket, namn, storlek: Number(storlek) }; });
  dom.dumpStorage = { buckets, objektRader, objektPerBucket, summaByte, checksumma, objektLista };
  console.log(`      ${buckets.length} buckets · ${objektRader.toLocaleString('sv-SE')} objekt · ${(summaByte / 1024 / 1024).toFixed(2)} MB metadata-storlek · checksumma ${checksumma.slice(0, 12)}…`);
  for (const b of buckets) console.log(`      bucket "${b.namn}" public=${b.publik}`);
}

// --- Steg 7: LEVANDE källan (ENDAST läsande anrop) + korsning ------------------

function lasEnv() {
  try { process.loadEnvFile(path.join(REPO_ROT, '.env')); } catch { /* saknas ok */ }
  try { process.loadEnvFile(path.join(REPO_ROT, '.env.local')); } catch { /* saknas ok */ }
  const bas = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const nyckel = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  // Mimosa-kontraktet: fast https-literal-validerad bas, nyckelvärde loggas ALDRIG.
  if (!bas || !nyckel || !/^https:\/\/[a-z0-9][a-z0-9-]*\.supabase\.co$/.test(bas)) return null;
  return { bas, headers: { apikey: nyckel, Authorization: 'Bearer ' + nyckel } };
}

async function levandeStorage(dom, env) {
  console.log('[7/9] LEVANDE Storage-källan (endast läsande anrop: lista + räkna) …');
  const t0 = process.hrtime.bigint();
  const rB = await fetch(env.bas + '/storage/v1/bucket', { headers: env.headers });
  dom.live = { bucketHttp: rB.status, buckets: [], objekt: [], fel: null };
  if (!rB.ok) {
    dom.live.fel = `bucket-lista HTTP ${rB.status}: ${(await rB.text()).slice(0, 120)}`;
    throw new Error(dom.live.fel);
  }
  for (const b of (await rB.json())) {
    const r = await fetch(`${env.bas}/storage/v1/object/list/${encodeURIComponent(b.name)}`, {
      method: 'POST', // listning — Supabases list-endpoint är POST, skapar ALDRIG något
      headers: { ...env.headers, 'Content-Type': 'application/json' },
      body: JSON.stringify({ prefix: '', limit: 1000, offset: 0, sortBy: { column: 'name', order: 'asc' } }),
    });
    if (!r.ok) {
      dom.live.buckets.push({ namn: b.name, publik: !!b.public, listHttp: r.status, objekt: [] });
      continue;
    }
    const filer = (await r.json()).filter((o) => o.id !== null); // kataloger har id null
    dom.live.buckets.push({ namn: b.name, publik: !!b.public, listHttp: r.status, objekt: filer });
    for (const f of filer) dom.live.objekt.push({ bucket: b.name, namn: f.name, storlek: Number(f.metadata?.size ?? -1) });
  }
  dom.live.sek = tidMs(t0) / 1000;
  dom.live.summaByte = dom.live.objekt.reduce((s, o) => s + Math.max(0, o.storlek), 0);
  console.log(`      ${dom.live.buckets.length} buckets · ${dom.live.objekt.length} objekt · ${(dom.live.summaByte / 1024 / 1024).toFixed(2)} MB · ${dom.live.sek.toFixed(1)} s`);
  for (const b of dom.live.buckets) {
    console.log(`      bucket "${b.namn}" public=${b.publik} · ${b.objekt.length} objekt${b.listHttp !== 200 ? ` · list HTTP ${b.listHttp}` : ''}`);
  }

  // Korsning dump ↔ live (RPO-bilden för metadata-lagret).
  const dumpNyckel = new Set(dom.dumpStorage.objektLista.map((o) => `${o.bucket}/${o.namn}`));
  const liveNyckel = new Set(dom.live.objekt.map((o) => `${o.bucket}/${o.namn}`));
  dom.korsning = {
    baraIDumpen: [...dumpNyckel].filter((k) => !liveNyckel.has(k)),
    baraLevande: [...liveNyckel].filter((k) => !dumpNyckel.has(k)),
    gemensamma: [...dumpNyckel].filter((k) => liveNyckel.has(k)),
  };
  console.log(`      korsning: ${dom.korsning.gemensamma.length} gemensamma · ${dom.korsning.baraIDumpen.length} bara i dumpen (försvunnet/raderat sedan ${dom.dumpNamn}) · ${dom.korsning.baraLevande.length} bara levande (nytt sedan dumpen)`);
}

// --- Steg 8: INNEHÅLLS-PROV — nerladdning + byte-kontrakt mot BÅDA källorna ----

async function innehallsProv(dom, env) {
  console.log('[8/9] INNEHÅLLS-PROV: laddar ner ett NEUTRALT objekt (R2-filter: aldrig .env*/pem/key/rsa/secret) …');
  // Kandidater: gemensamma med dumpen först (då kan byte-talet korsas MOT BÅDA
  // källorna), störst först — en stor fil bevisar mer överföring än en pytteliten.
  const gemensammaSet = new Set(dom.korsning.gemensamma);
  const kandidater = dom.live.objekt
    .filter((o) => !KANSLIGT_NAMN.test(`/${o.namn}`))
    .sort((a, b) => (gemensammaSet.has(`${b.bucket}/${b.namn}`) ? 1 : 0) - (gemensammaSet.has(`${a.bucket}/${a.namn}`) ? 1 : 0) || b.storlek - a.storlek);
  if (kandidater.length === 0) {
    dom.innehall = { hoppat: 'inget neutralt objekt att testa (endast känsliga namn eller tomt lager)' };
    console.log('      HOPPAT: inget neutralt objekt.');
    return;
  }
  const vald = kandidater[0];
  const vag = `${env.bas}/storage/v1/object/${encodeURIComponent(vald.bucket)}/${vald.namn.split('/').map(encodeURIComponent).join('/')}`;
  const utFil = `/tmp/dr-kedja6-${process.pid}-objekt.bin`;
  dom.tmpFiler.push(utFil);
  const t0 = process.hrtime.bigint();
  const r = await fetch(vag, { headers: env.headers });
  if (!r.ok) throw new Error(`nerladdning HTTP ${r.status} för ${vald.bucket}/${vald.namn}`);
  const kropp = Buffer.from(await r.arrayBuffer());
  writeFileSync(utFil, kropp);
  const sek = tidMs(t0) / 1000;
  const dumpRad = dom.dumpStorage.objektLista.find((o) => o.bucket === vald.bucket && o.namn === vald.namn);
  dom.innehall = {
    hoppat: null,
    objekt: `${vald.bucket}/${vald.namn}`,
    http: r.status,
    sek,
    byteNedladdat: kropp.length,
    byteLiveLista: vald.storlek,
    byteDumpMetadata: dumpRad ? dumpRad.storlek : null,
    finnsIDumpen: !!dumpRad,
    kontrakt: null,
    kandestra: kandidater.some((k) => KANSLIGT_NAMN.test(`/${k.namn}`))
      ? `${kandidater.filter((k) => KANSLIGT_NAMN.test(`/${k.namn}`)).length} känsliga namn (R2-filter) sorterades BORT som provobjekt`
      : null,
  };
  dom.innehall.kontrakt = dom.innehall.byteNedladdat === dom.innehall.byteLiveLista
    && (!dumpRad || dumpRad.storlek === dom.innehall.byteNedladdat);
  console.log(`      ${dom.innehall.objekt}: ${dom.innehall.byteNedladdat.toLocaleString('sv-SE')} B på ${sek.toFixed(2)} s · live-lista ${dom.innehall.byteLiveLista.toLocaleString('sv-SE')} B · dump-metadata ${dom.innehall.byteDumpMetadata === null ? '(ej i dumpen)' : dom.innehall.byteDumpMetadata.toLocaleString('sv-SE') + ' B'} → ${dom.innehall.kontrakt ? 'KONTRAKT GRÖNT (byte == källorna)' : 'KONTRAKT RÖTT'}`);
}

// --- Protokoll -----------------------------------------------------------------

function skrivProtokoll(dom) {
  console.log('Protokoll …');
  let vag = path.join(REPO_ROT, 'data', 'forskning', `DR-KEDJA6-${dom.datumIso}-AUTO.md`);
  let n = 2;
  while (existsSync(vag)) vag = path.join(REPO_ROT, 'data', 'forskning', `DR-KEDJA6-${dom.datumIso}-AUTO-${n++}.md`);
  const svepRader = dom.retention.rader.map((r) =>
    `| ${r.namn} | ${r.storlekMB.toFixed(1)} MB | ${r.alderDagar} d | ${r.gzipOk ? 'GRÖN' : '**TRASIG**'} | ${r.testSek.toFixed(1)} s |`).join('\n');
  const ds = dom.dumpStorage;
  const liveBucketRader = (dom.live?.buckets || []).map((b) => `| ${b.namn} | ${b.publik ? 'JA' : 'nej'} | ${b.objekt.length} | ${(b.objekt.reduce((s, o) => s + Math.max(0, Number(o.metadata?.size ?? 0)), 0) / 1024).toFixed(1)} KiB |`).join('\n');
  const dumpBucketRader = (ds?.buckets || []).map((b) => `| ${b.namn} | ${b.publik ? 'JA' : 'nej'} | ${(ds.objektPerBucket.find((p) => p.bucketId === b.id)?.rader ?? 0)} |`).join('\n');
  const inh = dom.innehall || {};
  const gron = dom.retention.gron && dom.dumpGron && dom.restoreOk && dom.fel.okanda.length === 0
    && ds && ds.objektRader >= 0
    && dom.live && !dom.live.fel
    && inh.hoppat === null && inh.kontrakt === true
    && dom.stadning.skrapDbBort && (dom.behall || dom.stadning.pgStoppad);

  const text = `# DR-KEDJA 6 ${dom.datumIso} — STORAGE-RESTORE (AUTO)

Körd av \`verktyg/dr-kedja6.mjs\` (spår 10, s10-u3). Scenario: Supabase STORAGE är
det enda lagret utan bevisad innehålls-återställning — SQL-dumpen bär METADATA
(storage.buckets/objects) men aldrig blobbar; moln-JSON-exporten läser
system_events. Övningen bevisar bägge halvorna: metadata-lagret återställt ur
dumpen i skrap-DB ${SKRAP_DB} på lokal PG17, innehålls-lagret hämtat med LÄSANDE
anrop mot Storage REST. **Prod RÖRDES ALDRIG med skrivning** (R2).

Dump: ${dom.dumpNamn}${dom.avbrots ? `\nAVBROT: ${dom.avbrots}` : ''}

## 1. Retentionssvep (familjekontraktet)

| Dump | Storlek | Ålder | gzip -t | Tid |
|---|---|---|---|---|
${svepRader}

${dom.retention.gron ? 'Samtliga dumpar i fönstret integritetsgröna.' : `**FYND: ${dom.retention.trasiga.join(', ')} trasiga.**`}

## 2. Moment

| Moment | Resultat |
|---|---|
| Slutmarkörskontroll (kolla-dump-markorer) | ${dom.dumpGron ? 'GRÖN' : 'RÖD'} |
| Full restore i skrap-DB (källmåttstock) | ${(dom.fullRto?.sek ?? NaN).toFixed(1)} s · felrader ${dom.fel?.antalRader ?? 0} (okända ${dom.fel?.okanda.length ?? 0}) |
| **Metadata-lagret: storage.buckets i dumpen** | ${ds ? `${ds.buckets.length} buckets` : 'nåddes ej'} |
| **Metadata-lagret: storage.objects i dumpen** | ${ds ? `${ds.objektRader.toLocaleString('sv-SE')} rader · ${(ds.summaByte / 1024 / 1024).toFixed(2)} MB · checksumma ${ds.checksumma}` : 'nåddes ej'} |
| **Levande källan (läsanrop)** | ${dom.live ? `${dom.live.buckets.length} buckets · ${dom.live.objekt.length} objekt · ${(dom.live.summaByte / 1024 / 1024).toFixed(2)} MB · ${dom.live.sek.toFixed(1)} s · bucket-lista HTTP ${dom.live.bucketHttp}` : 'nåddes ej'} |
| **Innehålls-prov (nerladdning)** | ${inh.hoppat !== undefined && inh.hoppat !== null ? `HOPPAT: ${inh.hoppat}` : inh.objekt ? `HTTP ${inh.http} · ${inh.byteNedladdat.toLocaleString('sv-SE')} B på ${inh.sek.toFixed(2)} s` : 'nåddes ej'} |
| **Byte-kontrakt (nedladdat == live-lista == dump-metadata)** | ${inh.kontrakt === true ? `GRÖNT (${inh.byteNedladdat.toLocaleString('sv-SE')} B == live ${inh.byteLiveLista.toLocaleString('sv-SE')} B${inh.byteDumpMetadata !== null ? ` == dump ${inh.byteDumpMetadata.toLocaleString('sv-SE')} B` : ' (objektet ej i dumpen — endast live korsat)'})` : inh.kontrakt === false ? 'RÖTT' : inh.hoppat ? 'n/a' : 'nåddes ej'} |
| Städning | skrap-DB ${dom.stadning.skrapDbBort ? 'raderad' : 'EJ raderad'} · PG17 ${dom.stadning.pgStoppad ? 'stoppad' : dom.behall ? 'lämnad (--behall)' : 'EJ stoppad'} · tmp raderade |

## 3. Metadata-lagret (dumpen ${dom.dumpNamn})

| Bucket (dumpen) | Publik | Objekt |
|---|---|---|
${dumpBucketRader || '| (inga) | | |'}

## 4. Levande källan (läsanrop, ${new Date().toISOString()})

| Bucket (levande) | Publik | Objekt | Storlek |
|---|---|---|---|
${liveBucketRader || '| (inga) | | | |'}

## 5. Korsning dump ↔ live — Storage-lagrets RPO-bild

- Gemensamma objekt: ${dom.korsning ? dom.korsning.gemensamma.length : 'nåddes ej'}
- Bara i dumpen (försvunnit/raderats sedan dumpen): ${dom.korsning ? dom.korsning.baraIDumpen.length : 'nåddes ej'}
- Bara levande (nytt sedan dumpen): ${dom.korsning ? dom.korsning.baraLevande.length : 'nåddes ej'}
${dom.korsning && dom.korsning.baraIDumpen.length > 0 ? `\n${dom.korsning.baraIDumpen.slice(0, 20).map((k) => `- ${k}`).join('\n')}${dom.korsning.baraIDumpen.length > 20 ? `\n- … (${dom.korsning.baraIDumpen.length - 20} fler)` : ''}\n` : ''}
${dom.korsning && dom.korsning.baraLevande.length > 0 ? `Nya sedan dumpen:\n${dom.korsning.baraLevande.map((k) => `- ${k}`).join('\n')}\n` : ''}

## 6. Runbook — Storage-återställning vid verklig incident

1. Metadata: nattdumpens storage-schemat restore:as med databasen (kedja 1) —
   buckets/objekt/namn/storlekar finns där (bevisat denna övning).
2. Innehåll: blobbar hämtas med läsanrop \`GET /storage/v1/object/<bucket>/<sökväg>\`
   per objekt ur metadata-listan (service-nyckel tillförs av huvudagenten, R2) —
   byte-tal ska matcha metadata.size (kontrakt bevisat denna övning).
3. VIKTIG GRÄNS: blobbarna har INGEN historik — dumparna bevarar metadata per
   natt, men raderade blobbar är BORTA (se §5: objekt som försvunnit sedan
   dumpen). Verklig blob-backup kräver en egen exportör (kö till huvudagenten).

## 7. Felkategorisering (full restore)

Kända ofarliga: roller ${Object.keys(dom.fel?.kanda.roller || {}).length} · scheman ${Object.keys(dom.fel?.kanda.scheman || {}).length} · övrigt ${dom.fel?.kanda.ovrigtKant ?? 0} · fortsättningsrader ${dom.fel?.kanda.fortsattning ?? 0}. ${dom.fel?.okanda.length ? `OKÄNDA ${dom.fel.okanda.length} — FYND.` : 'Okända 0.'}

## 8. Dom

**${gron ? 'GRÖN — storage-restore bevisad: metadata ur dumpen + innehåll via läsanrop, byte-kontrakt grönt' : 'RÖT — se tabell ovan'}**

SLUT — maskinellt genererat av dr-kedja6.mjs ${new Date().toISOString()}
`;
  writeFileSync(vag, text);
  dom.protokollVag = path.relative(REPO_ROT, vag);
  console.log(`      ${dom.protokollVag}`);
  return gron;
}

// --- Huvudflöde ------------------------------------------------------------------

async function main() {
  const opts = lasArgument();
  flockStartaOm();
  taLas();
  if (!grind()) { slappLas(); process.exit(75); }
  const dom = {
    datumIso: new Date().toISOString().slice(0, 10),
    behall: opts.behall,
    pgStartadesAvOss: false,
    tmpFiler: [],
    stadning: { skrapDbBort: false, pgStoppad: false, meddelande: '' },
  };
  let gron = false;
  try {
    dom.dumpVag = opts.fil ? path.resolve(opts.fil) : hittaSenasteDump();
    dom.dumpNamn = path.basename(dom.dumpVag);
    console.log(`DR-KEDJA 6 ${dom.datumIso} — storage-restore · dump ${dom.dumpNamn}${opts.behall ? ' (--behall)' : ''}`);

    dom.retention = retentionSvep();
    dom.dumpGron = forkontrollDump(dom.dumpVag);
    if (!dom.dumpGron) {
      dom.avbrots = 'dumpen underkändes av slutmarkörskontrollen — återställning vägrades, PG17 rördes ej';
      dom.stadning = { skrapDbBort: true, pgStoppad: true, meddelande: 'PG17/skrap-DB rördes ej (avbrott före start)' };
      gron = skrivProtokoll(dom);
      slappLas();
      process.exit(1);
    }
    const env = lasEnv();
    if (!env) {
      dom.avbrots = 'env saknas (NEXT_PUBLIC_SUPABASE_URL/SUPABASE_SERVICE_ROLE_KEY) — levande källan kan inte läsas';
      gron = skrivProtokoll(dom);
      slappLas();
      process.exit(1);
    }
    startaPg17(dom);
    try {
      skapaSkrapDb();
      aterstall(dom.dumpVag, dom);
      metaStatistik(dom);
      await levandeStorage(dom, env);
      await innehallsProv(dom, env);
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
