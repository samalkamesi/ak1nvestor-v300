#!/usr/bin/env node
// kolla-dump-markorer.mjs — dump-slutmarkörsvakt för AK1A (spår 10, s10-u1, 2026-09-15)
//
// Verifierar att Supabase-nattdumparna (data/backups/supabase/db-ÅÅÅÅ-MM-DD.sql.gz)
// är KOMPLETTA — inte bara giltiga gzip-arkiv. En avbruten pg_dump (nätverk,
// omstart, OOM) lämnar en giltig men trunkerad gzip;Restore skulle misslyckas
// först vid katastrofen. Kontraktet (bevisat empiriskt 2026-09-15, pg_dump 17.11
// med restrict/unrestrict-skyddet mot skadliga dumpar):
//   start:  \restrict <token>            (rad ~5, efter "-- PostgreSQL database dump")
//   slut:   "-- PostgreSQL database dump complete" följt av sista icke-tomma raden
//           \unrestrict <SAMMA token>
//
// Lägen:
//   (inget arg)      kontrollera ALLA db-*.sql.gz i dumpkatalogen (baslinje/kvartal)
//   --natt           kontrollera endast DAGENS dump (cron-läge; saknas = RÖD)
//   --fil <sökväg>   kontrollera en enda fil (testläge)
//   --katalog <väg>  annan dumpkatalog (default data/backups/supabase)
//
// Exit-kod: 0 = alla kontrollerade dumpar GRÖNA; 1 = minst en RÖD; 2 = usage-fel.
// Streaming hela vägen (createGunzip + radsplitting) — konstant minne, ~5 s/dump.

import { createGunzip } from 'node:zlib';
import { createReadStream } from 'node:fs';
import { readdirSync, statSync } from 'node:fs';
import { dirname as pathDirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const REPO_ROT = path.resolve(pathDirname(fileURLToPath(import.meta.url)), '..');

function lasArgument() {
  const args = process.argv.slice(2);
  const opts = { mode: 'alla', fil: null, katalog: null };
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--natt') opts.mode = 'natt';
    else if (args[i] === '--fil') opts.fil = args[++i];
    else if (args[i] === '--katalog') opts.katalog = args[++i];
    else {
      console.error(`Okänt argument: ${args[i]}`);
      process.exit(2);
    }
  }
  return opts;
}

function defaultKatalog() {
  return path.join(REPO_ROT, 'data', 'backups', 'supabase');
}

function listaDumpfiler(katalog) {
  return readdirSync(katalog)
    .filter((n) => /^db-\d{4}-\d{2}-\d{2}\.sql\.gz$/.test(n))
    .sort()
    .map((n) => path.join(katalog, n));
}

function dagensDumpnamn() {
  const d = new Date();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `db-${d.getFullYear()}-${mm}-${dd}.sql.gz`;
}

// Kontrollerar en dumpfil. Returnerar dom-objekt; kastar ALDRIG (fel = RÖD dom).
async function kollaFil(filvag) {
  const dom = {
    fil: path.basename(filvag),
    storlekByte: 0,
    rader: 0,
    createTable: 0,
    copyBlock: 0,
    version: '?',
    gron: false,
    orsaker: [],
  };
  try {
    dom.storlekByte = statSync(filvag).size;
  } catch {
    dom.orsaker.push('Filen kunde inte läsas (finns den?)');
    return dom;
  }

  let gzFel = null;
  // Version + startmarkör fångas i de första ~15 raderna; slutet hålls som
  // ringbuffer av de sista 8 icke-tomma raderna.
  const forstaRader = [];
  const svansRader = [];
  let restrictToken = null;

  function hanteraRad(rad) {
    dom.rader++;
    if (dom.rader <= 15) forstaRader.push(rad);
    if (rad.startsWith('CREATE TABLE ')) dom.createTable++;
    if (rad.startsWith('COPY ')) dom.copyBlock++;
    if (/^-- Dumped by pg_dump version /.test(rad)) dom.version = rad.replace(/^-- Dumped by pg_dump version /, '');
    if (rad.startsWith('\\restrict ') && restrictToken === null) {
      restrictToken = rad.slice('\\restrict '.length).trim();
    }
    if (rad.trim() !== '') {
      svansRader.push(rad);
      if (svansRader.length > 8) svansRader.shift();
    }
  }

  await new Promise((resolve) => {
    let buffert = '';
    const kalla = createReadStream(filvag);
    const gunzip = createGunzip();
    kalla.on('error', (e) => { gzFel = `läsfel: ${e.message}`; gunzip.destroy(); resolve(); });
    gunzip.on('error', (e) => { gzFel = `gzip-strömmen avbröts (trunkerad/fel arkiv): ${e.message}`; resolve(); });
    gunzip.on('data', (bit) => {
      buffert += bit.toString('utf8');
      let nl = buffert.indexOf('\n');
      while (nl !== -1) {
        hanteraRad(buffert.slice(0, nl));
        buffert = buffert.slice(nl + 1);
        nl = buffert.indexOf('\n');
      }
      // Radbufferten kan växa om en "rad" är enorm (DATA-rader är långa men
      // ändliga ~KB); kapa extrema outliers som ändå aldrig är markörer.
      if (buffert.length > 10 * 1024 * 1024) buffert = buffert.slice(-1024);
    });
    gunzip.on('end', () => {
      if (buffert.length > 0 && !gzFel) hanteraRad(buffert);
      resolve();
    });
    gunzip.on('close', () => resolve());
    kalla.pipe(gunzip);
  });

  const sistaRad = svansRader.length > 0 ? svansRader[svansRader.length - 1] : '';
  const svansText = svansRader.join('\n');
  const unrestrictMatch = sistaRad.match(/^\\unrestrict\s+(\S+)\s*$/);

  if (gzFel) dom.orsaker.push(gzFel);
  if (restrictToken === null) dom.orsaker.push('startmarkör \\restrict saknas — dumpen börjar inte som en pg_dump');
  if (!unrestrictMatch) dom.orsaker.push('slutmarkör \\unrestrict saknas — dumpen är troligen trunkerad');
  else if (restrictToken !== null && unrestrictMatch[1] !== restrictToken) {
    dom.orsaker.push(`token-matchning saknas: \\restrict "${restrictToken}" ≠ \\unrestrict "${unrestrictMatch[1]}"`);
  }
  if (!svansText.includes('-- PostgreSQL database dump complete')) {
    dom.orsaker.push('raden "-- PostgreSQL database dump complete" saknas i slutet');
  }

  dom.gron = dom.orsaker.length === 0;
  return dom;
}

function formateraStorlek(byte) {
  return byte >= 1024 * 1024 ? `${(byte / (1024 * 1024)).toFixed(1)} MB` : `${Math.round(byte / 1024)} kB`;
}

async function main() {
  const opts = lasArgument();
  const katalog = opts.katalog ? path.resolve(opts.katalog) : defaultKatalog();
  let filer = [];

  if (opts.fil) {
    filer = [path.resolve(opts.fil)];
  } else if (opts.mode === 'natt') {
    filer = [path.join(katalog, dagensDumpnamn())];
  } else {
    try {
      filer = listaDumpfiler(katalog);
    } catch {
      console.error(`Katalogen kunde inte läsas: ${katalog}`);
      process.exit(2);
    }
    if (filer.length === 0) {
      console.error(`Inga db-*.sql.gz i ${katalog}`);
      process.exit(1);
    }
  }

  const t0 = Date.now();
  console.log(`MARKÖRKOLL ${new Date().toISOString()} — ${opts.mode === 'natt' ? 'nattläge' : 'baslinje'} — ${filer.length} fil(er)`);
  const domer = [];
  for (const f of filer) domer.push(await kollaFil(f));
  const ms = Date.now() - t0;

  console.log('');
  for (const d of domer) {
    const status = d.gron ? 'GRÖN' : 'RÖD';
    console.log(
      `${status}  ${d.fil}  ${formateraStorlek(d.storlekByte)}  ${d.rader.toLocaleString('sv-SE')} rader  ` +
        `CREATE TABLE ${d.createTable}  COPY ${d.copyBlock}  pg_dump ${d.version}`
    );
    for (const orsak of d.orsaker) console.log(`     ↳ ${orsak}`);
  }

  const grona = domer.filter((d) => d.gron).length;
  const roda = domer.length - grona;
  console.log('');
  console.log(
    `SUMMERING: ${grona}/${domer.length} GRÖNA${roda > 0 ? `, ${roda} RÖDA` : ''} — ` +
      `${roda === 0 ? 'alla dumpar kompletta enligt markörkontraktet' : 'OFULLSTÄNDIGA DUMPAR FINNS — katastrofåterställning ej garanterad från RÖDA filer'} (${(ms / 1000).toFixed(1)} s)`
  );
  process.exit(roda > 0 || domer.length === 0 ? 1 : 0);
}

main().catch((e) => {
  console.error(`Oväntat fel: ${e.message}`);
  process.exit(1);
});
