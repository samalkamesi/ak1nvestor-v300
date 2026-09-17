#!/usr/bin/env node
// dr-total.mjs — TOTAL-kvartalsövningen: samtliga DR-kedjor som ETT kommando
// (spår 10, s10-u2 omgång 3, 2026-09-16 · kirurgi-vävning s10-u1 O7, 2026-09-17)
//
// Läge efter O5-leveranserna: varje kedja är kommandoradisierad och bevisad
// (kedja 1 dr-ovning.mjs · kedja 2 dr-kedja2.mjs · kedja 3 dr-kedja3.mjs ·
// kedja 4 dr-kedja4.mjs · kedja 5 dr-kedja5.mjs) men kvartalsmallen är FEM
// kommandon. Detta verktyg gör HELA kvartalsövningen till ett enda: kör
// kedjorna sekventiellt i DRIFTSBOKENs mallordning, mäter TOTAL-RTO (kundens
// fråga: hur lång tid tar det att få tillbaka ALLT?), skriver ETT
// totalprotokoll och garanterar vilolägeskontraktet (PG17 nere, inga
// skrap-DB:er, tmp städad) även vid avbrott.
//
// Ordningsval 1 → 5 → 2 → 4 → 3 (dokumenterat i totalprotokollet): de fyra
// PG-burna datakedjorna först, serverfilsarkivet sist — samma ordning som
// DRIFTSBOKENs mallrad från JUNGRUNATT-omgången (dr-ovning + dr-kedja2 +
// dr-kedja4 + kedja 3), med kirurgin (O7)placerad direkt efter sin källkedja:
// kedja 5 extraherar ur samma SQL-dump som kedja 1 återställer, och PG-
// fönstret hålls sammanhängande före moln-/per-typ-/serverfilsstegen.
//
// Kirurgi-steget (s10-u2 O5:s bokförda kö, vävt av s10-u1 O7): kedja 5
// bevisar EN-tabells-scenariot (extraktion ur dumpfilen + atomisk DELETE+COPY
// + sabotagegripande + innehållschecksumma) i sin EGEN skrap-DB under samma
// barnlås som övriga PG-kedjor. --utan-kirurgi hoppar över steget: vid verklig
// tabellincident körs dr-kedja5 MANUELLT med --tabell, och i en pågående
// katastrof vill man inte betala övningstiden för ett scenario man redan är
// mitt uppe i.
//
// Lås: EGEN fil /tmp/ak1a-dr-total.lock (re-exec under flock(1), samma
// mönster som dr-ovning.mjs). Barnen tar själva /tmp/ak1a-dr-prov.lock —
// dr-total FÅR ALDRIG hålla barnens låsfil (dödläge: barnet väntar på ett
// lås föräldern håller). Total-låset utesluter bara andra total-körningar.
//
// Fail-fast: en RÖD kedja avbryter övningen (protokollet anger avbrotts-
// orsaken; nästa kedja testas inte förrän den trasiga är kurad) — en kedja
// som exit 75 (RAM-grind) väntar 90 s och får EN ny chans (JUNGRUNATT-
// precedenten: omkörning när minnet frigjorts).
//
// Exit: 0 GRÖN (samtliga kedjor gröna) · 1 RÖD/avbrott (protokoll
// skrivs alltid) · 3 total-låset upptaget · 75 ram-/diskgrind stängd.

import { spawnSync } from 'node:child_process';
import {
  existsSync, openSync, closeSync, readFileSync, writeFileSync, unlinkSync,
  readdirSync, statSync, rmSync, mkdirSync,
} from 'node:fs';
import { dirname as pathDirname, join as pathJoin, basename as pathBasename } from 'node:path';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const REPO_ROT = path.resolve(pathDirname(fileURLToPath(import.meta.url)), '..');
const FORSKNING = pathJoin(REPO_ROT, 'data', 'forskning');
const LAS_VAG = '/tmp/ak1a-dr-total.lock'; // EGEN — se låskommentaren ovan
const LAS_MAX_ALDER_MS = 30 * 60 * 1000;
const BARN_TIMEOUT_MS = 960_000; // barnens eget flock-wait-tak är 900 s
const RAM_VANTA_MS = 90_000; // väntan före omkörning efter barn-exit 75

const KEDJOR = [
  {
    n: 1, verktyg: 'dr-ovning.mjs',
    namn: 'SQL-dumpen (Supabase → PG17-skrap)',
    monster: /^DR-PROV-\d{4}-\d{2}-\d{2}-AUTO(-\d+)?\.md$/,
    kalla: () => senasteFil('data/backups/supabase', /^db-.*\.sql\.gz$/),
  },
  {
    // s10-u1 O7: kirurgin direkt efter sin källkedja (samma SQL-dump).
    n: 5, verktyg: 'dr-kedja5.mjs',
    namn: 'Kirurgisk tabell-återställning (EN-tabells-scenariot)',
    monster: /^DR-KEDJA5-\d{4}-\d{2}-\d{2}-AUTO(-\d+)?\.md$/,
    kalla: () => senasteFil('data/backups/supabase', /^db-.*\.sql\.gz$/),
    valbar: true, // --utan-kirurgi hoppar över (rescue-läge, se filhuvudet)
  },
  {
    n: 2, verktyg: 'dr-kedja2.mjs',
    namn: 'Moln-JSON: system_events (fullarkiv)',
    monster: /^DR-KEDJA2-\d{4}-\d{2}-\d{2}-AUTO(-\d+)?\.md$/,
    kalla: () => senasteFil('data/backups', /^system-events-full-.*\.json\.gz$/),
  },
  {
    n: 4, verktyg: 'dr-kedja4.mjs',
    namn: 'Per-typ-snapshots (typvyerna)',
    monster: /^DR-PROV-\d{4}-\d{2}-\d{2}-KEDJA4(-\d+)?\.md$/,
    kalla: () => senasteFil('data/backups', /^(blogg|kurs)-[^/]*\.json$/),
  },
  {
    n: 3, verktyg: 'dr-kedja3.mjs',
    namn: 'Serverfils-arkivet (tar.gz + git bundle)',
    monster: /^DR-KEDJA3-\d{4}-\d{2}-\d{2}-AUTO(-\d+)?\.md$/,
    kalla: () => senasteFil('data/backups', /^server-(repo|git)-.*\.(tar\.gz|bundle)$/),
  },
];

function lasArgument() {
  const args = process.argv.slice(2);
  const utanKirurgi = args.includes('--utan-kirurgi');
  for (const a of args) {
    if (a === '--hjalp' || a === '--help') {
      console.log('Användning: node verktyg/dr-total.mjs [--utan-kirurgi]');
      console.log('Kör HELA kvartals-DR-övningen (kedja 1→5→2→4→3) som ett kommando.');
      console.log('Flaggor: --utan-kirurgi (hoppa över kirurgi-steget — rescue-läge) ·');
      console.log('--hjalp (denna text). Barnverktygens flaggor styrs ej härvid —');
      console.log('de kör mot senaste arkivet var och en (kvartalsmallens kontrakt).');
      process.exit(0);
    }
    if (a === '--utan-kirurgi') continue;
    console.error(`Okänt argument: ${a} (se --hjalp)`);
    process.exit(2);
  }
  return { utanKirurgi };
}

// --- Lås: EN total-körning i taget (dr-ovning.mjs:s bevisade mönster) ------

function taLas() {
  if (process.env.AK1A_DR_TOTAL_FLOCK === '1') {
    const fdFlock = openSync(LAS_VAG, 'w');
    writeFileSync(fdFlock, `pid=${process.pid} start=${new Date().toISOString()} verktyg=dr-total.mjs flock=1\n`);
    closeSync(fdFlock);
    return;
  }
  if (existsSync(LAS_VAG)) {
    const alder = Date.now() - statSync(LAS_VAG).mtimeMs;
    if (alder < LAS_MAX_ALDER_MS) {
      let innehall = '';
      try { innehall = readFileSync(LAS_VAG, 'utf8').trim(); } catch { innehall = '?'; }
      console.error(`TOTAL-LÅSET UPTAGET (${(alder / 60000).toFixed(1)} min gammalt): ${innehall}`);
      console.error('En annan total-körning pågår — vänta och försök igen.');
      process.exit(3);
    }
    console.log(`VARNING: total-låsfil ${(alder / 60000).toFixed(0)} min gammal (dött barn?) — tas över.`);
    unlinkSync(LAS_VAG);
  }
  const fd = openSync(LAS_VAG, 'wx');
  writeFileSync(fd, `pid=${process.pid} start=${new Date().toISOString()} verktyg=dr-total.mjs\n`);
  closeSync(fd);
}

function slappLas() {
  if (process.env.AK1A_DR_TOTAL_FLOCK === '1') return; // flock äger inoden — rör ej
  try { unlinkSync(LAS_VAG); } catch { /* redan borta */ }
}

function flockStartaOm() {
  if (process.env.AK1A_DR_TOTAL_FLOCK === '1') return;
  const skriptVag = fileURLToPath(import.meta.url);
  const r = spawnSync('flock', ['-w', '900', LAS_VAG, process.execPath, skriptVag], {
    stdio: 'inherit',
    env: { ...process.env, AK1A_DR_TOTAL_FLOCK: '1' },
    timeout: BARN_TIMEOUT_MS + 60_000,
  });
  if (r.error) {
    console.error(`FLOCK-KRITISKT: kunde inte starta om under flock (${r.error.message}) — totalövningen vägras utan lås.`);
    process.exit(1);
  }
  process.exit(r.status ?? 1);
}

// --- Grind + småhjälp --------------------------------------------------------

function kor(kommando, args, opts = {}) {
  const r = spawnSync(kommando, args, {
    encoding: 'utf8',
    timeout: opts.timeoutMs ?? 120_000,
    maxBuffer: 64 * 1024 * 1024,
  });
  return { ok: r.status === 0, status: r.status, stdout: r.stdout || '', stderr: r.stderr || '', fel: r.error ? r.error.message : null };
}

function grind() {
  const mem = /MemAvailable:\s+(\d+) kB/.exec(readFileSync('/proc/meminfo', 'utf8'));
  const mb = mem ? Math.round(Number(mem[1]) / 1024) : 0;
  if (mb < 1000) {
    console.error(`RAMGRIND: MemAvailable ${mb} MB < 1000 MB — totalövningen SKIPPAS (exit 75). Kör igen när minnet frigjorts.`);
    return false;
  }
  const df = kor('df', ['-k', '/']);
  const falt = ((df.stdout || '').split('\n')[1] || '').trim().split(/\s+/);
  const gbLedigt = Number(falt[3] || 0) / 1024 / 1024;
  if (gbLedigt < 5) {
    console.error(`DISKGRIND: ${gbLedigt.toFixed(1)} GB ledigt < 5 GB — totalövningen SKIPPAS (exit 75).`);
    return false;
  }
  console.log(`Grind OK: MemAvailable ${mb} MB · ${gbLedigt.toFixed(0)} GB ledigt på /`);
  return true;
}

function senasteFil(relKatalog, monster) {
  try {
    const katalog = pathJoin(REPO_ROT, relKatalog);
    const kandidater = readdirSync(katalog)
      .filter((f) => monster.test(f))
      .map((f) => ({ f, mtime: statSync(pathJoin(katalog, f)).mtimeMs }))
      .sort((a, b) => b.mtime - a.mtime);
    return kandidater[0] ? kandidater[0].f : null;
  } catch { return null; }
}

// --- Barnkörning --------------------------------------------------------------

function nyckelrader(utdata) {
  // Kvantitativa rader (RTO/rader/tabeller) först — de är protokollets kärna;
  // dom-/väckelse-rader fyller ut inom taket.
  const alla = utdata.split('\n').filter((l) =>
    /(RTO|rader|tabeller|public |Dom\b|GRÖN|RÖD|VARNING|Protokoll)/.test(l));
  const kvant = alla.filter((l) => /(RTO|rader|tabeller|public )/.test(l));
  const ovriga = alla.filter((l) => !kvant.includes(l));
  return [...kvant, ...ovriga].slice(0, 8).map((l) => (l.length > 160 ? `${l.slice(0, 157)}…` : l).trim());
}

function hittaDelprotokoll(kedja, startTs, utdata) {
  const urStdout = /Protokoll:\s*(\S+\.md)/.exec(utdata);
  if (urStdout && urStdout[1].includes('forskning')) {
    const vag = pathJoin(REPO_ROT, urStdout[1].replace(/^\.\//, ''));
    if (existsSync(vag)) return pathBasename(vag);
  }
  try {
    const kandidater = readdirSync(FORSKNING)
      .filter((f) => kedja.monster.test(f))
      .map((f) => ({ f, mtime: statSync(pathJoin(FORSKNING, f)).mtimeMs }))
      .filter((x) => x.mtime >= startTs - 5_000)
      .sort((a, b) => b.mtime - a.mtime);
    if (kandidater[0]) return kandidater[0].f;
  } catch { /* nedan */ }
  return null;
}

function korKedja(kedja, loggKatalog, startTs) {
  const resultat = {
    n: kedja.n, verktyg: kedja.verktyg, namn: kedja.namn,
    exit: null, vaggSek: null, dom: '—', delprotokoll: null,
    nyckel: [], omkoring: false, utdata: '',
  };
  for (let forsok = 1; forsok <= 2; forsok++) {
    const t0 = Date.now();
    const r = spawnSync(process.execPath, [pathJoin(REPO_ROT, 'verktyg', kedja.verktyg)], {
      cwd: REPO_ROT,
      encoding: 'utf8',
      maxBuffer: 64 * 1024 * 1024,
      timeout: BARN_TIMEOUT_MS,
    });
    const vaggSek = (Date.now() - t0) / 1000;
    const utdata = `${r.stdout || ''}\n${r.stderr || ''}`;
    writeFileSync(pathJoin(loggKatalog, `kedja-${kedja.n}-forsok-${forsok}.log`), utdata);
    resultat.exit = r.status;
    resultat.vaggSek = (resultat.vaggSek || 0) + vaggSek;
    resultat.utdata += utdata;
    console.log(`[kedja ${kedja.n}] ${kedja.verktyg} exit ${r.status} på ${vaggSek.toFixed(1)} s${forsok > 1 ? ` (försök ${forsok})` : ''}`);
    if (r.status === 75 && forsok === 1) {
      console.log(`[kedja ${kedja.n}] RAM-grind stängd — väntar ${RAM_VANTA_MS / 1000} s och kör OM en gång (JUNGRUNATT-precedensen).`);
      resultat.omkoring = true;
      const t = Date.now() + RAM_VANTA_MS;
      while (Date.now() < t) spawnSync('sleep', ['5']);
      continue;
    }
    break;
  }
  resultat.nyckel = nyckelrader(resultat.utdata);
  resultat.delprotokoll = hittaDelprotokoll(kedja, startTs, resultat.utdata);
  resultat.dom = resultat.exit === 0 ? 'GRÖN' : 'RÖD';
  return resultat;
}

// --- Vilolägeskontrakt --------------------------------------------------------

function vilolage(noteringar) {
  // PG17 skall vara NERE (ett nere kluster kan inte bära skrap-DB:er). Ett
  // barn som dog hårt (timeout/kill) kan ha lämnat det uppe — då stoppar
  // dr-total det som säkerhet och protokollför brytandet.
  const r = kor('pg_lsclusters', ['--no-header']);
  const rader = (r.stdout || '').split('\n').map((l) => l.trim()).filter((l) => l.length > 0);
  let nere = true;
  for (const rad of rader) {
    if (/^17\s+main\s/.test(rad) && /\bonline\b/i.test(rad)) nere = false;
  }
  if (nere) {
    noteringar.push('PG17 NERE vid övningens slut — korrekt viloläge (skrap-DB:er kan ej finnas i ett nere kluster).');
    return true;
  }
  noteringar.push('PG17 VAR UPP vid övningens slut (barn dog före sin finally?) — dr-total stoppade den som säkerhet: brytande av vilolägeskontraktet protokollförs.');
  kor('sudo', ['pg_ctlcluster', '17', 'main', 'stop'], { timeoutMs: 120_000 });
  const r2 = kor('pg_lsclusters', ['--no-header']);
  return !/\bonline\b/i.test(r2.stdout || '');
}

// --- Protokoll -----------------------------------------------------------------

function skrivProtokoll(dom) {
  let vag = pathJoin(FORSKNING, `DR-TOTAL-${dom.datumIso}-AUTO.md`);
  let nro = 2;
  while (existsSync(vag)) vag = pathJoin(FORSKNING, `DR-TOTAL-${dom.datumIso}-AUTO-${nro++}.md`);
  const gron = dom.kedjor.every((k) => k.exit === 0) && dom.avbrottsorsak === null;
  const summaSek = dom.kedjor.reduce((s, k) => s + (k.vaggSek || 0), 0);
  const rader = [];
  rader.push(`# DR-TOTAL ${dom.datumIso} — KOMPLETT kvartalsövning, samtliga ${dom.kedjor.length} kedjor (${gron ? 'GODKÄNT' : 'UNDERKÄNT'})`);
  rader.push('');
  rader.push('Körd av `verktyg/dr-total.mjs` (spår 10) — kvartalsmallens steg som ETT');
  rader.push(`kommando, i DRIFTSBOKENs mallordning ${dom.kedjor.map((k) => k.n).join(' → ')} (PG-kedjorna`);
  rader.push('först, serverfilsarkivet sist). Barnverktygen äger sina egna DR-lås');
  rader.push('(/tmp/ak1a-dr-prov.lock) och sina egna delprotokoll — detta är överprotokollet.');
  rader.push('');
  rader.push('| Kedja | Vad | Verktyg | Exit | Väggtid | Dom | Delprotokoll |');
  rader.push('|---|---|---|---|---|---|---|');
  for (const k of dom.kedjor) {
    rader.push(`| ${k.n} | ${k.namn} | ${k.verktyg} | ${k.exit} | ${(k.vaggSek || 0).toFixed(1)} s | ${k.dom} | ${k.delprotokoll || '(saknas)'} |`);
  }
  rader.push('');
  rader.push(`| TOTALT | **summa kedjor ${(summaSek).toFixed(1)} s · väggklocka ${(dom.vaggTotalSek).toFixed(1)} s** | — | — | — | **${gron ? 'GRÖN' : 'RÖD'}** | denna fil |`);
  rader.push('');
  rader.push('RPO-läge övningen testades mot (nyaste källa per kedja, mätt på disk):');
  rader.push('');
  for (const k of dom.kedjor) {
    rader.push(`- Kedja ${k.n} (${k.namn}): ${k.kalla || '(ingen källa hittad)'}${k.omkoring ? ' · OMKÖRD en gång efter RAM-grind' : ''}`);
  }
  rader.push('');
  rader.push('Nyckelrader per kedja (ur barnens loggar — fullständig bevisning i delprotokollen):');
  rader.push('');
  for (const k of dom.kedjor) {
    rader.push(`**Kedja ${k.n} — ${k.verktyg}** (ur barnets stdout; tmp-loggarna städas):`);
    for (const l of k.nyckel) rader.push(`- ${l.replace(/\|/g, '\\|')}`);
    if (k.nyckel.length === 0) rader.push('- (inga nyckelrader fångade — se delprotokoll)');
    rader.push('');
  }
  if (dom.avbrottsorsak) {
    rader.push(`Avbrottsorsak: ${dom.avbrottsorsak}`);
    rader.push('');
  } else {
    rader.push('Avbrottsorsak: ingen');
    rader.push('');
  }
  if (dom.skippade.length > 0) {
    rader.push('Skippade steg (flagga):');
    for (const s of dom.skippade) rader.push(`- ${s}`);
    rader.push('');
  }
  for (const not of dom.noteringar) rader.push(`- ${not}`);
  rader.push('');
  rader.push(`Dom: **${gron ? 'GRÖN (exit 0)' : 'RÖD (exit 1)'}** — ${gron
    ? `samtliga ${dom.kedjor.length} kedjor restore-bevisade i EN sekvens; TOTAL-RTO ovan är plattformens återställningstid för data+kod (nätverksflytt till ny VPS tillkommer i verklig katastrof).`
    : 'minst en kedja underkänd eller övningen avbröts — se avbrottsorsak och delprotokoll.'}`);
  rader.push('');
  rader.push(`SLUT — maskinellt genererat av dr-total.mjs ${new Date().toISOString()}`);
  writeFileSync(vag, `${rader.join('\n')}\n`);
  console.log(`Totalprotokoll: ${path.relative(REPO_ROT, vag)}`);
  return gron;
}

// --- Huvud ---------------------------------------------------------------------

function main() {
  const opts = lasArgument();
  flockStartaOm(); // hela totalövningen under EGET flock (dokumenterat ovan)
  taLas();
  const tmp = `/tmp/dr-total-${process.pid}`;
  mkdirSync(tmp, { recursive: true });
  const startTs = Date.now();
  const datumIso = new Date().toISOString().slice(0, 10);
  const dom = {
    datumIso, kedjor: [], skippade: [], avbrottsorsak: null, noteringar: [],
    vaggTotalSek: 0,
  };
  let exit = 0;
  try {
    if (!grind()) {
      slappLas(); rmSync(tmp, { recursive: true, force: true });
      process.exit(75); // protokoll lät bli att skriva: inget rördes, inget hänt
    }
    const start = Date.now();
    for (const kedja of KEDJOR) {
      if (kedja.valbar && opts.utanKirurgi) {
        dom.skippade.push(`kedja ${kedja.n} (${kedja.verktyg}) — flagga --utan-kirurgi (rescue-läge)`);
        console.log(`=== KEDJA ${kedja.n}: ${kedja.namn} SKIPPAD (--utan-kirurgi) ===`);
        continue;
      }
      console.log(`=== KEDJA ${kedja.n}: ${kedja.namn} (${kedja.verktyg}) ===`);
      const resultat = korKedja(kedja, tmp, startTs);
      resultat.kalla = kedja.kalla();
      dom.kedjor.push(resultat);
      if (resultat.exit !== 0) {
        dom.avbrottsorsak = `kedja ${kedja.n} (${kedja.verktyg}) exit ${resultat.exit} — fail-fast: efterföljande kedjor kördes ej`;
        if (resultat.exit === 75) exit = 75;
        else exit = 1;
        break;
      }
    }
    dom.vaggTotalSek = (Date.now() - start) / 1000;
    vilolage(dom.noteringar);
  } finally {
    try { rmSync(tmp, { recursive: true, force: true }); } catch { /* tmp får åldras bort */ }
    slappLas();
  }
  const gron = skrivProtokoll(dom) && exit === 0;
  process.exit(gron ? 0 : (exit || 1));
}

main();
