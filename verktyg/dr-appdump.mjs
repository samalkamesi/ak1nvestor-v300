#!/usr/bin/env node
// dr-appdump.mjs — KEDJA-0: första dump+restore av APPENS Supabase-projekt (aufr)
//
// Bakgrund (DR-OVNING-2026-09-19-DUBBELPROJEKT, s10-u1): dump-kedjan (kedja 1,
// crontab 02:30) läser projekt rkaq = pump-universumet — appens data (aufr,
// ref suhvlsbp enligt AGENTS.md) har ALDRIG dumpats eller återställts. Detta
// verktyg bevisar (eller motbevisar) att appens data KAN fångas i en pg_dump
// och återställas i lokal PG17 — engångsövning UTAN persistenta ändringar:
// .pgpass/crontab/.env orörs (R2-nära ytor ägs av huvudagenten).
//
// Behörighet: lösenordet läses VID KÖRNING ur .env.production.local:s
// DATABASE_URL (förs ENBART som PGPASSWORD-miljövariabel till barnprocessen —
// aldrig argv, aldrig loggat; argv är synlig i ps). Bevisat 2026-09-19: samma
// lösenord gäller båda kundens projekt (aufr + rkaq) — sidofynd lösenords-
// återanvändning, protokollförs.
//
// Mål-värd härleds ur .env:s NEXT_PUBLIC_SUPABASE_URL (ref → db.<ref>…).
//
// Lägen:   (inget arg)  hel övning · --behall  städa ej (manuell inspektion)
// Exit:    0 GRÖN · 1 RÖT (protokoll skrivs ändå) · 3 lås upptaget · 75 grind.
//
// Kontrakt ärvt från dr-ovning.mjs (bevisat): flock-omstart på
// /tmp/ak1a-dr-prov.lock (syskon-serialisering), ram/disk-grind, tredelat
// mätkontrakt (public / public+storage / alla scheman), felkategorisering
// (kända Supabase-roller/scheman/extensions vs OKÄNDA), garanterad städning.

import { spawnSync } from 'node:child_process';
import {
  existsSync, openSync, closeSync, readFileSync, writeFileSync, unlinkSync,
  readdirSync, statSync, chmodSync, mkdirSync, rmdirSync,
} from 'node:fs';
import { gunzipSync } from 'node:zlib';
import { createHash } from 'node:crypto';
import { dirname as pathDirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const REPO_ROT = path.resolve(pathDirname(fileURLToPath(import.meta.url)), '..');
const LAS_VAG = '/tmp/ak1a-dr-prov.lock';
const SKRAP_DB = 'ak1a_dr_app'; // ändrat namn mot dr-ovning.mjs (ak1a_dr_test) — skilda världar
const PG_KLUSTER = ['17', 'main'];
const LAS_MAX_ALDER_MS = 30 * 60 * 1000;
const ENV_KALLA = path.join(REPO_ROT, '.env.production.local'); // DATABASE_URL (lösenord)
const ENV_APP = path.join(REPO_ROT, '.env'); // NEXT_PUBLIC_SUPABASE_URL (mål-ref)

// Referensvärden (rkaq-världen) för protokollets jämförelsekolumner —
// DR-PROV-2026-09-19-AUTO-10 + DR-OVNING-2026-09-19-DUBBELPROJEKT §3.
const REFERENS_RKAQ = { blad: 'db-2026-09-19.sql.gz', rtoSek: 15.5, publicTabeller: 60, publicRader: 1325919 };

function lasArgument() {
  const args = process.argv.slice(2);
  const opts = { behall: false };
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--behall') opts.behall = true;
    else if (args[i] === '--hjalp' || args[i] === '--help') {
      console.log('Användning: node verktyg/dr-appdump.mjs [--behall]');
      process.exit(0);
    } else {
      console.error(`Okänt argument: ${args[i]} (se --hjalp)`);
      process.exit(2);
    }
  }
  return opts;
}

// --- Lås (samma kontrakt som dr-ovning.mjs — EN agent äger PG17-fönstret) ---

function taLas() {
  if (process.env.AK1A_DR_FLOCK === '1') {
    const fdFlock = openSync(LAS_VAG, 'w');
    writeFileSync(fdFlock, `pid=${process.pid} start=${new Date().toISOString()} verktyg=dr-appdump.mjs flock=1\n`);
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
      process.exit(3);
    }
    console.log(`VARNING: låsfil ${(alder / 60000).toFixed(0)} min gammal (död agent?) — tas över.`);
    unlinkSync(LAS_VAG);
  }
  const fd = openSync(LAS_VAG, 'wx');
  writeFileSync(fd, `pid=${process.pid} start=${new Date().toISOString()} verktyg=dr-appdump.mjs\n`);
  closeSync(fd);
}

function slappLas() {
  if (process.env.AK1A_DR_FLOCK === '1') return; // se dr-ovning.mjs: rör ej inoden under yttre flock
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

// --- Processhjälp -----------------------------------------------------------

function kor(kommando, args, opts = {}) {
  const r = spawnSync(kommando, args, {
    encoding: 'utf8',
    timeout: opts.timeoutMs ?? 120000,
    maxBuffer: 64 * 1024 * 1024,
    env: opts.env,
  });
  return { ok: r.status === 0, status: r.status, stdout: (r.stdout || '').trim(), stderr: (r.stderr || '').trim() };
}

function sudo(args, opts = {}) { return kor('sudo', ['-n', ...args], opts); }

function sql(fraga, opts = {}) {
  const r = sudo(['-u', 'postgres', 'psql', '-d', SKRAP_DB, '-X', '-q', '-A', '-t', '-c', fraga], opts);
  if (!r.ok) throw new Error(`psql misslyckades: ${r.stderr || r.stdout || 'okänt fel'}`);
  return r.stdout;
}

// --- Behörighet + mål (värden läses, loggas ALDRIG) --------------------------

function lasBehorighet(dom) {
  const txt = readFileSync(ENV_KALLA, 'utf8');
  const rad = txt.split('\n').find((l) => l.startsWith('DATABASE_URL='));
  if (!rad) throw new Error('DATABASE_URL saknas i .env.production.local');
  const u = new URL(rad.slice('DATABASE_URL='.length).trim());
  const losenord = decodeURIComponent(u.password || '');
  if (!losenord) throw new Error('DATABASE_URL bär inget lösenord');

  const appTxt = readFileSync(ENV_APP, 'utf8');
  const appRad = appTxt.split('\n').find((l) => l.startsWith('NEXT_PUBLIC_SUPABASE_URL='));
  if (!appRad) throw new Error('NEXT_PUBLIC_SUPABASE_URL saknas i .env');
  const ref = new URL(appRad.slice('NEXT_PUBLIC_SUPABASE_URL='.length).trim()).hostname.split('.')[0];
  const malVard = `db.${ref}.supabase.co`;

  dom.behorighet = {
    kalla: { fil: '.env.production.local', variabel: 'DATABASE_URL', vard: u.hostname, user: decodeURIComponent(u.username) },
    mal: { ref, vard: malVard, port: '5432', db: 'postgres', user: 'postgres' },
    losenordsLangd: losenord.length, // längd endast — värdet förs via env, loggas aldrig
  };
  return losenord;
}

// --- Steg: nåbarhet + dump ---------------------------------------------------

function sonderaMal(dom, losenord) {
  // Värdarna är IPv6-enskilda (endast AAAA) — tillfälliga dips förekommer
  // (bevisat 2026-09-19: "no response" i övning, "accepting" minuterna före
  // och efter) — tre försök med 3 s mellanrum innan övningen viker.
  for (let forsok = 1; forsok <= 3; forsok++) {
    const r = kor('pg_isready', ['-h', dom.behorighet.mal.vard, '-p', '5432', '-t', '8'], { timeoutMs: 15000 });
    dom.malNabar = `${r.stdout || r.stderr} (försök ${forsok}/3)`;
    console.log(`      mål ${dom.behorighet.mal.vard}: ${dom.malNabar}`);
    if (/accepting connections/.test(dom.malNabar)) return;
    if (forsok < 3) spawnSync('sleep', ['3']);
  }
  throw new Error(`målvärden tar ej emot anslutningar efter 3 försök: ${dom.malNabar} (IPv6-dip? kör igen)`);
}

function dumpa(dom, losenord) {
  console.log('[2/7] pg_dump av APPENS projekt (aufr) — tidmätning startar …');
  const stampel = new Date().toISOString().slice(0, 10);
  // Dumpen bär personuppgifter (auth.users): skyddad katalog medan pg_dump skriver
  const dumpKatalog = `/tmp/dr-appdump-aufr-${stampel}-p${process.pid}`;
  mkdirSync(dumpKatalog, { recursive: true, mode: 0o700 });
  chmodSync(dumpKatalog, 0o700); // mkdir-läge förutsätter ej utskrift av umask-begränsningar
  const sqlFil = `${dumpKatalog}/app-aufr.sql`;
  const gzFil = `${sqlFil}.gz`;
  const t0 = process.hrtime.bigint();
  const r = spawnSync('pg_dump', [
    '--no-owner', '--no-privileges', // mät APP-DATA-restorbarhet — rolluniversum är kedja 1:s problem (788 kända fel)
    '-h', dom.behorighet.mal.vard, '-p', '5432', '-U', 'postgres', '-d', 'postgres',
    '--file', sqlFil,
  ], { encoding: 'utf8', timeout: 600000, env: { ...process.env, PGPASSWORD: losenord } });
  const ms = Number(process.hrtime.bigint() - t0) / 1e6;
  dom.dumpTid = { ms, sek: ms / 1000 };
  // pg_dump skriver varningar (t.ex. collation mismatch) på stderr utan att felkoda — stderr bevaras ren
  dom.dumpStderrRader = (r.stderr || '').split('\n').filter((l) => l.trim() !== '').length;
  if (r.status !== 0 || !existsSync(sqlFil)) {
    throw new Error(`pg_dump misslyckades (kod ${r.status}): ${(r.stderr || '').split('\n')[0]} — KEDJA-0 RÖD: appens data kan INTE dumpas med serverns befintliga behörighet`);
  }
  chmodSync(sqlFil, 0o600); // dumpen bär personuppgifter (auth.users) — endast ägaren läser
  const gz = kor('gzip', ['-f', sqlFil], { timeoutMs: 300000 });
  if (!gz.ok) throw new Error(`gzip misslyckades: ${gz.stderr}`);

  // Slutmarkör + strukturbevis (kedja 1:s kontrakt från kolla-dump-markorer.mjs)
  const markor = kor('bash', ['-c', `zcat '${gzFil}' | tail -c 400 | grep -c 'PostgreSQL database dump complete'`], { timeoutMs: 60000 });
  const copyR = kor('bash', ['-c', `zgrep -c '^COPY ' '${gzFil}'`], { timeoutMs: 120000 });
  const createR = kor('bash', ['-c', `zgrep -c '^CREATE TABLE' '${gzFil}'`], { timeoutMs: 120000 });
  const storlek = statSync(gzFil).size;
  const sum = kor('sha256sum', [gzFil]);
  dom.dump = {
    fil: gzFil,
    storlekBytes: storlek,
    storlekMb: Number((storlek / 1024 / 1024).toFixed(1)),
    sha256: (sum.stdout || '').split(/\s+/)[0] || '(hash saknas)',
    slutmarkor: Number(markor.stdout || '0') >= 1,
    copyBlock: Number(copyR.stdout || '0'),
    createTable: Number(createR.stdout || '0'),
  };
  console.log(`      dumpad på ${(dom.dumpTid.sek).toFixed(1)} s · ${dom.dump.storlekMb} MB gz · slutmarkör ${dom.dump.slutmarkor ? 'GRÖN' : 'SAKNAS'} · COPY ${dom.dump.copyBlock} · CREATE TABLE ${dom.dump.createTable}`);
  if (!dom.dump.slutmarkor) throw new Error('dumpen saknar slutmarkör — ofullständig dump är ingen backup (KEDJA-0 RÖD)');
}

// --- PG17 + skrap-DB + restore (arv från dr-ovning.mjs) ----------------------

function pgUpp() { return sudo(['-u', 'postgres', 'pg_isready', '-q', '-p', '5432']).ok; }

function startaPg17(dom) {
  console.log('[3/7] Startar lokal PG17 …');
  dom.pgStartadesAvOss = !pgUpp();
  if (dom.pgStartadesAvOss) {
    const r = sudo(['pg_ctlcluster', ...PG_KLUSTER, 'start']);
    if (!r.ok && !pgUpp()) throw new Error(`pg_ctlcluster start misslyckades: ${r.stderr}`);
    console.log('      PG17 online (var stoppad — korrekt viloläge).');
  } else {
    console.log('      VARNING: PG17 var REDAN uppe vid ankomst (oväntat med lås — protokollförs).');
  }
}

function skapaSkrapDb() {
  console.log('[4/7] Skapar färsk skrap-DB (dropdb --if-exists + createdb) …');
  const drop = sudo(['-u', 'postgres', 'dropdb', '--if-exists', SKRAP_DB]);
  if (!drop.ok) throw new Error(`dropdb misslyckades: ${drop.stderr}`);
  const skapa = sudo(['-u', 'postgres', 'createdb', SKRAP_DB]);
  if (!skapa.ok) throw new Error(`createdb misslyckades: ${skapa.stderr}`);
  console.log(`      ${SKRAP_DB} skapad färsk.`);
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

function aterstall(dom) {
  console.log('[5/7] ÅTERSTÄLLER app-dumpen i skrap-DB (zcat | psql) — RTO-mätning …');
  const felFil = `/tmp/dr-appdump-fel-aufr-p${process.pid}-${Date.now()}.log`;
  const t0 = process.hrtime.bigint();
  const r = spawnSync('bash', ['-c',
    `zcat '${dom.dump.fil.replace(/'/g, "'\\''")}' | sudo -n -u postgres psql -d ${SKRAP_DB} -X -q 2>'${felFil}'`],
  { encoding: 'utf8', timeout: 600000, maxBuffer: 64 * 1024 * 1024 });
  const ms = Number(process.hrtime.bigint() - t0) / 1e6;
  dom.rto = { ms, sek: ms / 1000, felFil };
  dom.restoreOk = r.status === 0;
  let felrader = [];
  try { felrader = readFileSync(felFil, 'utf8').split('\n'); } catch { felrader = []; }
  dom.fel = kategoriseraFel(felrader);
  dom.fel.antalRader = felrader.filter((l) => l.trim() !== '').length;
  console.log(`      ${dom.restoreOk ? 'KLART' : 'PSLYFEL'} på ${(ms / 1000).toFixed(1)} s · felrader ${dom.fel.antalRader} (kända ${dom.fel.antalRader - dom.fel.okanda.length}, okända ${dom.fel.okanda.length}) → ${felFil}`);
  if (!dom.restoreOk) throw new Error(`psql-restore avslutades med kod ${r.status}`);
}

// --- Mätning (tredelat kontrakt + appens nyckeltabeller) ---------------------

function matDatabas(dom) {
  console.log('[6/7] Mäter tabeller och rader …');
  const tabeller = sql(
    `SELECT table_schema || '.' || table_name FROM information_schema.tables ` +
    `WHERE table_type = 'BASE TABLE' AND table_schema NOT IN ('pg_catalog','information_schema') ORDER BY 1;`,
  ).split('\n').filter((l) => l.trim() !== '');

  const raderPerTabell = {};
  // Tabellnamn kan bära mellanslag (bevisat: public.analytiska sidan i aufr)
  // — identifierare citteras alltid, strängliteraler escapas.
  const citera = (t) => t.split('.').map((p) => `"${p.replace(/"/g, '""')}"`).join('.');
  for (let i = 0; i < tabeller.length; i += 50) {
    const del = tabeller.slice(i, i + 50);
    const fraga = del.map((t) => `SELECT '${t.replace(/'/g, "''")}' AS t, count(*) AS n FROM ${citera(t)}`).join(' UNION ALL ') + ';';
    for (const rad of sql(fraga, { timeoutMs: 300000 }).split('\n')) {
      const sep = rad.indexOf('|');
      if (sep > 0) raderPerTabell[rad.slice(0, sep)] = Number(rad.slice(sep + 1));
    }
  }

  const summera = (filter) => {
    const namn = tabeller.filter(filter);
    return { tabeller: namn.length, rader: namn.reduce((s, t) => s + (raderPerTabell[t] || 0), 0) };
  };
  dom.mat = {
    public: summera((t) => t.startsWith('public.')),
    publicStorage: summera((t) => t.startsWith('public.') || t.startsWith('storage.')),
    allaScheman: summera(() => true),
    perSchema: {},
    nyckeltabeller: {},
    topp: Object.entries(raderPerTabell).sort((a, b) => b[1] - a[1]).slice(0, 8),
  };
  for (const t of tabeller) {
    const schema = t.split('.')[0];
    dom.mat.perSchema[schema] = dom.mat.perSchema[schema] || { tabeller: 0, rader: 0 };
    dom.mat.perSchema[schema].tabeller += 1;
    dom.mat.perSchema[schema].rader += raderPerTabell[t] || 0;
  }
  // Appens nyckeltabeller (DUBBELPROJEKT-tabellens aufr-kolumn + kurser/moduler generöst)
  const nyckelmönster = [
    /^public\.system_events$/, /^public\.members$/, /^public\.profiles$/, /^public\.courses$/,
    /^public\.board_decisions$/, /^auth\.users$/, /^public\.section_data_snapshots$/,
    /kurs|course/i, /modul|module|section/i, /event/i,
  ];
  for (const t of tabeller) {
    if (nyckelmönster.some((re) => re.test(t))) dom.mat.nyckeltabeller[t] = raderPerTabell[t] || 0;
  }
  console.log(`      public ${dom.mat.public.tabeller} tabeller / ${dom.mat.public.rader.toLocaleString('sv-SE')} rader · ` +
    `public+storage ${dom.mat.publicStorage.tabeller} / ${dom.mat.publicStorage.rader.toLocaleString('sv-SE')} · ` +
    `alla scheman ${dom.mat.allaScheman.tabeller} / ${dom.mat.allaScheman.rader.toLocaleString('sv-SE')}`);
}

// --- Kedja-2-jämförelse: den ENDA befintliga kopian av appens händelser ------

function kedja2Jamforelse(dom) {
  console.log('      Kedja 2 (JSON 02:40): läser senaste kopiornas radantal …');
  const lasAntalJson = (mönster) => {
    try {
      const filer = readdirSync(path.join(REPO_ROT, 'data', 'backups')).filter((n) => mönster.test(n)).sort();
      if (filer.length === 0) return { fil: '(saknas)', antal: null };
      const fil = filer[filer.length - 1];
      const raw = /\.gz$/.test(fil) ? gunzipSync(readFileSync(path.join(REPO_ROT, 'data', 'backups', fil))) : readFileSync(path.join(REPO_ROT, 'data', 'backups', fil));
      const data = JSON.parse(raw.toString('utf8'));
      // Kedja 2:s filer är OBJEKT {typ,datum,antal,truncerad,rader[,totaltFranApi]}
      // — räkna d.rader, ALDRIG toppnycklar (kurs-2-körningens falska "7 rader"
      // mot 27,7 MB gz var nyckelantal — ärlighetskontraktet fångade det).
      let antal = null;
      let totaltFranApi = null;
      let truncerad = null;
      if (Array.isArray(data)) antal = data.length;
      else if (data && Array.isArray(data.rader)) {
        antal = data.rader.length;
        totaltFranApi = data.totaltFranApi ?? data.antal ?? null;
        truncerad = data.truncerad ?? null;
      } else if (data && typeof data === 'object') antal = Object.keys(data).length;
      return { fil, antal, totaltFranApi, truncerad, storlekBytes: statSync(path.join(REPO_ROT, 'data', 'backups', fil)).size };
    } catch (e) {
      return { fil: `(läsfel: ${e.message.slice(0, 60)})`, antal: null };
    }
  };
  dom.kedja2 = {
    systemEvents: lasAntalJson(/^system-events-full-\d{4}-\d{2}-\d{2}\.json(\.gz)?$/),
    medlemmar: lasAntalJson(/^medlemmar-\d{4}-\d{2}-\d{2}\.json$/),
  };
  console.log(`      system-events-full: ${dom.kedja2.systemEvents.antal} rader (api-total ${dom.kedja2.systemEvents.totaltFranApi ?? '?'}, truncerad ${dom.kedja2.systemEvents.truncerad ?? '?'}) · medlemmar: ${dom.kedja2.medlemmar.antal}`);
}

// --- Städning + protokoll -----------------------------------------------------

function stada(dom) {
  console.log('[7/7] Städning: skrap-DB + PG17 + dumpfil …');
  if (dom.behall) {
    dom.stadning = {
      skrapDbBort: false, pgStoppad: false, dumpBort: false,
      meddelande: '--behall givet: skrap-DB/PG17/dump lämnas för manuell inspektion (städas av anroparen).',
    };
    console.log('      --behall: lämnar allt (viloläget brutet — städa manuellt).');
    return;
  }
  // Övning som avbröts FÖRE PG17-start öppnade aldrig något fönster — ärlig
  // nej-inte-förpackning i stället för kosmetiska dropdb/stop-fel (kur efter
  // 2026-09-19:s första körning: "dropdb misslyckades … No such file or
  // directory" fast PG17 aldrig startats).
  if (!dom.pgStartadesAvOss && !pgUpp()) {
    dom.stadning = {
      skrapDbBort: true, pgStoppad: true, dumpBort: true,
      pgOppnades: false,
      meddelande: 'övningen nådde aldrig PG17 — inget fönster öppnades, inget att städa.',
    };
    if (dom.dump && dom.dump.fil) {
      try { unlinkSync(dom.dump.fil); try { rmdirSync(path.dirname(dom.dump.fil)); } catch { } } catch { }
    }
    console.log('      PG17 var aldrig startad av övningen — inget att städa (dumppartiklar rensade).');
    return;
  }
  const drop = sudo(['-u', 'postgres', 'dropdb', '--if-exists', SKRAP_DB]);
  dom.stadning = { skrapDbBort: drop.ok, pgStoppad: null, dumpBort: null, meddelande: '', pgOppnades: true };
  if (!drop.ok) dom.stadning.meddelande += `dropdb misslyckades: ${drop.stderr} `;
  const stop = sudo(['pg_ctlcluster', ...PG_KLUSTER, 'stop']);
  dom.stadning.pgStoppad = stop.ok || !pgUpp();
  if (!dom.stadning.pgStoppad) dom.stadning.meddelande += `pg_ctlcluster stop misslyckades: ${stop.stderr} `;
  // Dumpen bär personuppgifter (GDPR): raderas — sha256 + storlek är protokollets bevis
  if (dom.dump && dom.dump.fil) {
    try {
      unlinkSync(dom.dump.fil);
      dom.stadning.dumpBort = true;
      try { rmdirSync(path.dirname(dom.dump.fil)); } catch { /* katalog kan dela namnrymd — bäst-effort */ }
    } catch { dom.stadning.dumpBort = false; }
  } else dom.stadning.dumpBort = true;
  console.log(`      skrap-DB ${dom.stadning.skrapDbBort ? 'raderad' : 'KUNDE EJ RADERAS'} · PG17 ${dom.stadning.pgStoppad ? 'stoppad' : 'KUNDE EJ STOPPAS'} · dumpfil ${dom.stadning.dumpBort ? 'raderad (GDPR)' : 'KUNDE EJ RADERAS'}.`);
  if (dom.stadning.meddelande) console.error(`      STÄDNINGSFYND: ${dom.stadning.meddelande.trim()}`);
}

function unikVag(bas, suffix) {
  if (!existsSync(path.join(REPO_ROT, 'data', 'forskning', `${bas}${suffix}`))) {
    return path.join(REPO_ROT, 'data', 'forskning', `${bas}${suffix}`);
  }
  let n = 2;
  while (existsSync(path.join(REPO_ROT, 'data', 'forskning', `${bas}-${n}${suffix}`))) n += 1;
  return path.join(REPO_ROT, 'data', 'forskning', `${bas}-${n}${suffix}`);
}

function skrivProtokoll(dom) {
  console.log('Skriver protokoll (maskinellt) …');
  if (!dom.rto) dom.rto = { sek: NaN, felFil: '(restore nåddes ej)' };
  if (!dom.fel) dom.fel = { antalRader: 0, kanda: { roller: {}, scheman: {}, extensions: {}, ovrigtKant: 0 }, okanda: [] };
  if (!dom.mat) dom.mat = { public: { tabeller: 0, rader: 0 }, publicStorage: { tabeller: 0, rader: 0 }, allaScheman: { tabeller: 0, rader: 0 }, perSchema: {}, nyckeltabeller: {}, topp: [] };
  const gron = dom.restoreOk === true && dom.fel.okanda.length === 0
    && (dom.behall || (dom.stadning && dom.stadning.skrapDbBort && dom.stadning.pgStoppad && dom.stadning.dumpBort));
  dom.gron = gron;

  const mdVag = unikVag(`DR-APPDUMP-${dom.datumIso}-KEDJA0`, '.md');
  const jsonVag = unikVag(`DR-APPDUMP-${dom.datumIso}-KEDJA0`, '.json');
  const kandaRoller = Object.entries(dom.fel.kanda.roller).sort((a, b) => b[1] - a[1]).map(([n, a]) => `${n} ${a}`).join(', ') || 'inga';
  const kandaScheman = Object.entries(dom.fel.kanda.scheman).sort((a, b) => b[1] - a[1]).map(([n, a]) => `${n} ${a}`).join(', ') || 'inga';
  const nycklar = Object.entries(dom.mat.nyckeltabeller).sort().map(([t, n]) => `| ${t} | ${n.toLocaleString('sv-SE')} |`).join('\n');
  const scheman = Object.entries(dom.mat.perSchema).sort((a, b) => b[1].rader - a[1].rader).map(([s, m]) => `| ${s} | ${m.tabeller} | ${m.rader.toLocaleString('sv-SE')} |`).join('\n');
  const topp = dom.mat.topp.map(([t, n]) => `| ${t} | ${n.toLocaleString('sv-SE')} |`).join('\n');

  const text = `# DR-APPDUMP ${dom.datumIso} — KEDJA-0: första dump+restore av APPENS projekt (${gron ? 'GODKÄNT' : 'UNDERKÄNT'})

**Körd av:** \`verktyg/dr-appdump.mjs\` (s10-u2, manifest auto-s10-1789826700636).
**Mål:** ${dom.behorighet ? dom.behorighet.mal.vard : '(mål ej läst)'} — appens projekt (aufr, ref suhvlsbp).
**Behörighetskälla:** ${dom.behorighet ? `${dom.behorighet.kalla.fil}:s ${dom.behorighet.kalla.variabel} (värd ${dom.behorighet.kalla.vard}) — lösenord ${dom.behorighet.losenordsLangd ? `finns (${dom.behorighet.losenordsLangd} tecken)` : 'SAKNAS'}, läst vid körning, ALDRIG loggat` : '(ej läst)'}.

> Bakgrund: DUBBELPROJEKT-övningen 2026-09-19 bevisade att kedja 1 (db-dumpar
> 02:30) läser projekt rkaq och ALDRIG fångat appens data. Detta är spårets
> första dump+restore av appens projekt — beviset huvudagentens kedjekur
> (DUBBELPROJEKT §7.1) bygger på.

## Mätetal

| Moment | Värde |
|---|---|
| pg_dump-tid (aufr) | ${dom.dumpTid ? `${dom.dumpTid.sek.toFixed(1)} s` : '(nåddes ej)'} |
| Dumpstorlek (gz) | ${dom.dump ? `${dom.dump.storlekMb} MB · sha256 ${dom.dump.sha256.slice(0, 16)}…` : '(nåddes ej)'} |
| Slutmarkör / COPY / CREATE TABLE | ${dom.dump ? `${dom.dump.slutmarkor ? 'GRÖN' : 'SAKNAS'} / ${dom.dump.copyBlock} / ${dom.dump.createTable}` : '(nåddes ej)'} |
| RTO (restore i skrap-PG17) | ${Number.isFinite(dom.rto.sek) ? `${dom.rto.sek.toFixed(1)} s` : '(restore nåddes ej)'} |
| Restore-fel | ${dom.fel.antalRader} rader (kända ${dom.fel.antalRader - dom.fel.okanda.length}, OKÄNDA ${dom.fel.okanda.length}) → ${dom.rto.felFil} |
| Kända roller | ${kandaRoller} |
| Kända scheman | ${kandaScheman} |

## Radkontrakt (tredelat, jämförbart med rkaq-bladen)

| Nivå | Tabeller | Rader | rkaq-blad 09-19 (referens) |
|---|---|---|---|
| public | ${dom.mat.public.tabeller} | ${dom.mat.public.rader.toLocaleString('sv-SE')} | ${REFERENS_RKAQ.publicTabeller} / ${REFERENS_RKAQ.publicRader.toLocaleString('sv-SE')} |
| public+storage | ${dom.mat.publicStorage.tabeller} | ${dom.mat.publicStorage.rader.toLocaleString('sv-SE')} | 68 / 1 326 055 |
| alla scheman | ${dom.mat.allaScheman.tabeller} | ${dom.mat.allaScheman.rader.toLocaleString('sv-SE')} | 99 / 1 326 315 |

## Appens nyckeltabeller (återställda)

${nycklar || '(inga matchande tabeller)'}

## Schema-fördelning

${scheman || '(tom)'}

## Topp-8 tabeller

${topp || '(tom)'}

## Kedja-2-jämförelse (den ENDA befintliga kopian av appens händelser)

| Kopia | Rader | API-total | Truncerad | Fil (gz-storlek) |
|---|---|---|---|---|
| system-events-full (JSON 02:40) | ${dom.kedja2 && dom.kedja2.systemEvents.antal !== null ? dom.kedja2.systemEvents.antal.toLocaleString('sv-SE') : '?'} | ${dom.kedja2 && dom.kedja2.systemEvents.totaltFranApi !== null && dom.kedja2.systemEvents.totaltFranApi !== undefined ? dom.kedja2.systemEvents.totaltFranApi.toLocaleString('sv-SE') : '?'} | ${dom.kedja2 ? String(dom.kedja2.systemEvents.truncerad ?? '?') : '?'} | ${dom.kedja2 ? `${dom.kedja2.systemEvents.fil} (${Math.round((dom.kedja2.systemEvents.storlekBytes || 0) / 1024 / 1024)} MB)` : '?'} |
| medlemmar (JSON 02:40) | ${dom.kedja2 && dom.kedja2.medlemmar.antal !== null ? dom.kedja2.medlemmar.antal.toLocaleString('sv-SE') : '?'} | ${dom.kedja2 && dom.kedja2.medlemmar.totaltFranApi !== null && dom.kedja2.medlemmar.totaltFranApi !== undefined ? dom.kedja2.medlemmar.totaltFranApi.toLocaleString('sv-SE') : '?'} | ${dom.kedja2 ? String(dom.kedja2.medlemmar.truncerad ?? '?') : '?'} | ${dom.kedja2 ? dom.kedja2.medlemmar.fil : '?'} |
| system_events (DUMP, nu) | ${dom.mat.nyckeltabeller['public.system_events'] !== undefined ? dom.mat.nyckeltabeller['public.system_events'].toLocaleString('sv-SE') : '(tabell saknas)'} | — | — | pg_dump ${dom.datumIso} ${dom.dump ? `(${dom.dump.storlekMb} MB HELA databasen)` : ''} |

## Städning

${dom.stadning ? `- skrap-DB ${dom.stadning.skrapDbBort ? 'raderad' : 'KVAR'} · PG17 ${dom.stadning.pgStoppad ? 'stoppad' : 'KVAR'} · dumpfil ${dom.stadning.dumpBort ? 'raderad (GDPR)' : 'KVAR'}${dom.stadning.meddelande ? `\n- FYND: ${dom.stadning.meddelande.trim()}` : ''}` : '(stadning nåddes ej)'}

## Gränser

- .pgpass / crontab / .env* orörda (skriv) — lösenord läst vid körning ur
  .env.production.local, förs endast som PGPASSWORD-env, aldrig loggat.
- Dumpfilen i /tmp chmod 600, raderad efter mätning (bär personuppgifter).
- Protokollet bär ENDAST antal och tabell-/kolumnnamn — GDPR-rent.
- src/ orörd — inget bygge. PG17-fönstret under ${LAS_VAG} (flock).

${dom.avbrots ? `> **AVBROTSBANNER:** ${dom.avbrots}\n` : ''}
SLUT — DR-APPDUMP KEDJA-0, genererad ${new Date().toISOString()}
`;
  writeFileSync(mdVag, text);
  writeFileSync(jsonVag, JSON.stringify(dom, null, 2) + '\n');
  dom.protokollVagar = { md: path.basename(mdVag), json: path.basename(jsonVag) };
  console.log(`      ${path.basename(mdVag)} + ${path.basename(jsonVag)}`);
}

// --- Main ---------------------------------------------------------------------

function main() {
  const opts = lasArgument();
  const mem = /MemAvailable:\s+(\d+) kB/.exec(readFileSync('/proc/meminfo', 'utf8'));
  const mb = mem ? Math.round(Number(mem[1]) / 1024) : 0;
  if (mb < 1000) {
    console.error(`RAMGRIND: MemAvailable ${mb} MB < 1000 MB — övningen SKIPPAS (exit 75).`);
    process.exit(75);
  }
  const df = kor('df', ['-k', '/']);
  const falt = ((df.stdout || '').split('\n')[1] || '').trim().split(/\s+/);
  if (Number(falt[3] || 0) / 1024 / 1024 < 5) {
    console.error(`DISKGRIND: ${falt[3]} kB ledigt — övningen SKIPPAS (exit 75).`);
    process.exit(75);
  }
  console.log(`Grind OK: MemAvailable ${mb} MB · ${(Number(falt[3]) / 1024 / 1024).toFixed(0)} GB ledigt på /`);
  flockStartaOm(); // allt nedan körs under flock
}

main();

// flock-barnet fortsätter här (AK1A_DR_FLOCK=1) — se flockStartaOm
if (process.env.AK1A_DR_FLOCK === '1') {
  const dom = {
    verktyg: 'dr-appdump.mjs',
    datumIso: new Date().toISOString().slice(0, 10),
    startad: new Date().toISOString(),
    behall: process.argv.includes('--behall'),
  };
  taLas();
  try {
    console.log('[1/7] Läser behörighet + sonderar mål …');
    const losenord = lasBehorighet(dom);
    console.log(`      källa ${dom.behorighet.kalla.fil}:s ${dom.behorighet.kalla.variabel} (värd ${dom.behorighet.kalla.vard}) → mål ${dom.behorighet.mal.vard} · lösenord finns (${dom.behorighet.losenordsLangd} tecken), loggas aldrig`);
    sonderaMal(dom, losenord);
    dumpa(dom, losenord);
    startaPg17(dom);
    skapaSkrapDb();
    aterstall(dom);
    matDatabas(dom);
    kedja2Jamforelse(dom);
  } catch (e) {
    dom.avbrots = e.message;
    console.error(`ÖVNINGEN AVBRÖTS: ${e.message}`);
  } finally {
    // Städning FÖRE protokoll: protokollet skall bära städningsbeviset, och
    // grön kräver fullbordad städning (avbrott FÖRE restore ger därför aldrig
    // grönt — kur efter körning 2:s tysta protokollkrasch: grön-kontrollen
    // läste dom.stadning innan stada körts).
    try { stada(dom); } catch (e) { console.error(`STÄDNINGSFEL: ${e.message}`); }
    try { skrivProtokoll(dom); } catch (e) { console.error(`PROTOKOLLFEL: ${e.message}`); }
    slappLas();
  }
  process.exit(dom.gron === true ? 0 : 1);
}
