#!/usr/bin/env node
// dr-ovning.mjs — mekaniserad kvartals-DR-övning för AK1A (spår 10, s10-u4, 2026-09-15)
//
// Gör hela DR-övningen (v98 F3-mönstret, vidareutvecklat av s10-u2/u3) till
// ETT kommando: lås → dumpkontroll → återställ i skrap-DB med RTO-mätning →
// tabell-/radmätning → protokoll i data/forskning/ → garanterad städning.
// Syfte: nästa kvartalsövning (senast 2026-12-15) ska vara ett rutinsamt
// kommando, inte en handflödesövning — och PG17-fönstret får bara ägas av
// EN agent i taget (s10-u3:s fabriksslusionskur: låsfil + vägran).
//
// Lägen/flaggor:
//   (inget arg)   kör övningen mot SENASTE natt-dump i data/backups/supabase
//   --fil <väg>   kör mot en given dumpfil (.sql.gz)
//   --behall      städa EJ efteråt (lämna skrap-DB + PG17 uppe för manuell
//                 efterundersökning — protokollet noterar brutet viloläge)
//
// Mätkontrakt (s10-u3:s instrumentdiff): tabeller/rader redovisas på TRE
// nivåer var för sig — public / public+storage / alla scheman.
//
// Felhantering: restore-fel kategoriseras (kända ofarliga Supabase-roller/
// scheman/extensions enligt v98 F3 + s10-u2) mot OKÄNDA fel; okända > 0
// ger VARNING i protokollet. Städning körs ALLTID (även vid fel) om inte
// --behall gavs — en misslyckad övning lämnar aldrig skräp i PG17.
//
// Exit-kod: 0 = GRÖN övning (restore, mätning, protokoll, städning klart);
//           1 = RÖD (dump underkänd, restore-fel eller okända fel — proto-
//             koll skrivs ändå; misslyckade övningar SKALL protokollföras);
//           3 = låset upptaget (annan agent äger DR-fönstret just nu);
//          75 = ram-/diskgrind stängd (incidenten 16:42:s läxa) — kör igen senare.

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
const SKRAP_DB = 'ak1a_dr_test';
const PG_KLUSTER = ['17', 'main'];
const LAS_MAX_ALDER_MS = 30 * 60 * 1000; // dött lås (död agent) tas över efter 30 min

// Tidigare bevisade övningar — protokollets jämförelsebas (worklog + DRIFTSBOKEN).
const TIDIGARE_OVNINGAR = [
  { namn: 'v98 F3 (godkänd mall)', datum: '2026-09-11', rtoSek: 20.0, publicRader: 1187291, publicTabeller: 60 },
  { namn: 's10-u2 (kvartalsövning)', datum: '2026-09-15', rtoSek: 17.7, publicRader: 1246728, publicTabeller: 60 },
  { namn: 's10-u3 (oberoende replik)', datum: '2026-09-15', rtoSek: 14.7, publicRader: 1246728, publicTabeller: 60 },
];

function lasArgument() {
  const args = process.argv.slice(2);
  const opts = { fil: null, behall: false };
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--fil') opts.fil = args[++i];
    else if (args[i] === '--behall') opts.behall = true;
    else if (args[i] === '--hjalp' || args[i] === '--help') {
      console.log('Användning: node verktyg/dr-ovning.mjs [--fil <dump.sql.gz>] [--behall]');
      process.exit(0);
    } else {
      console.error(`Okänt argument: ${args[i]} (se --hjalp)`);
      process.exit(2);
    }
  }
  return opts;
}

// --- Lås: EN agent äger PG17 DR-fönstret (s10-u3:s kur) -------------------

function taLas() {
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
  const fd = openSync(LAS_VAG, 'wx'); // atomär skapande — kapplöpnings­säker
  writeFileSync(fd, `pid=${process.pid} start=${new Date().toISOString()} verktyg=dr-ovning.mjs\n`);
  closeSync(fd);
}

function slappLas() {
  try { unlinkSync(LAS_VAG); } catch { /* redan borta */ }
}

// --- Grind: ram + disk FÖRE allt tungt (incidenten 2026-09-15 16:42 — en   ---
// --- DR-övning får ALDRIG svälta prod på minne; mönster: verktyg/ram-grind) ---

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

// --- Processhjälp -----------------------------------------------------------

function kor(kommando, args, opts = {}) {
  const r = spawnSync(kommando, args, {
    encoding: 'utf8',
    timeout: opts.timeoutMs ?? 120000,
    maxBuffer: 64 * 1024 * 1024,
  });
  return {
    ok: r.status === 0,
    status: r.status,
    stdout: (r.stdout || '').trim(),
    stderr: (r.stderr || '').trim(),
  };
}

function sudo(args, opts = {}) { return kor('sudo', ['-n', ...args], opts); }

// Kör en SQL-fråga mot skrap-DB:n, returnerar råa rader (psql -A -t).
function sql(fraga, opts = {}) {
  const r = sudo(['-u', 'postgres', 'psql', '-d', SKRAP_DB, '-X', '-q', '-A', '-t', '-c', fraga], opts);
  if (!r.ok) throw new Error(`psql misslyckades: ${r.stderr || r.stdout || 'okänt fel'}`);
  return r.stdout;
}

// --- Steg 1: dumpval + förkontroll (s10-u1:s verktyg, komposition) ---------

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

function forkontrollDump(dump) {
  console.log(`[1/7] Dumpkontroll (kolla-dump-markorer.mjs --fil) …`);
  const r = kor('node', [path.join(REPO_ROT, 'verktyg', 'kolla-dump-markorer.mjs'), '--fil', dump], { timeoutMs: 120000 });
  console.log(r.stdout.split('\n').map((l) => `      ${l}`).join('\n'));
  if (r.stderr) console.log(r.stderr.split('\n').map((l) => `      ${l}`).join('\n'));
  if (r.status !== 0) {
    console.error('DUMPEN UNDERKÄND — återställning vägras (en ofullständig dump är ingen backup).');
    return false;
  }
  return true;
}

// --- Steg 2-3: PG17 + skrap-DB ----------------------------------------------

function pgUpp() {
  return sudo(['-u', 'postgres', 'pg_isready', '-q', '-p', '5432']).ok;
}

function startaPg17(dom) {
  console.log('[2/7] Startar lokal PG17 …');
  dom.pgStartadesAvOss = !pgUpp();
  if (dom.pgStartadesAvOss) {
    const r = sudo(['pg_ctlcluster', ...PG_KLUSTER, 'start']);
    if (!r.ok && !pgUpp()) throw new Error(`pg_ctlcluster start misslyckades: ${r.stderr}`);
    console.log('      PG17 online (var stoppad — korrekt viloläge).');
  } else {
    console.log('      VARNING: PG17 var REDAN uppe vid ankomst (oväntat med låsfil — protokollförs).');
  }
}

function stadaPg17(dom) {
  console.log('[7/7] Städning: skrap-DB + PG17 …');
  const drop = sudo(['-u', 'postgres', 'dropdb', '--if-exists', SKRAP_DB]);
  dom.stadning = {
    skrapDbBort: drop.ok,
    pgStoppad: null,
    meddelande: '',
  };
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
  if (dom.stadning.meddelande && !dom.behall) {
    console.error(`      STÄDNINGSFYND: ${dom.stadning.meddelande.trim()}`);
  }
}

function skapaSkrapDb() {
  console.log('[3/7] Skapar färsk skrap-DB (dropdb --if-exists + createdb) …');
  const drop = sudo(['-u', 'postgres', 'dropdb', '--if-exists', SKRAP_DB]);
  if (!drop.ok) throw new Error(`dropdb misslyckades: ${drop.stderr}`);
  const skapa = sudo(['-u', 'postgres', 'createdb', SKRAP_DB]);
  if (!skapa.ok) throw new Error(`createdb misslyckades: ${skapa.stderr}`);
  console.log(`      ${SKRAP_DB} skapad färsk.`);
}

// --- Steg 4: återställning med RTO-mätning + felkategorisering ------------

// Kända ofarliga fel vid återställning av Supabase-dump i lokal PG (v98 F3 +
// s10-u2:s kategorisering, 780 rader): saknade moln-roller, moln-scheman,
// extensions. OKÄNDA fel är däremot fynd som SKALL upp i protokollet.
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

function aterstall(dump, dom) {
  console.log('[4/7] ÅTERSTÄLLER (zcat | psql) — RTO-mätning startar …');
  const felFil = `/tmp/dr-ovning-fel-${dom.datumIso}.log`;
  const t0 = process.hrtime.bigint();
  const r = spawnSync('bash', ['-c',
    `zcat '${dump.replace(/'/g, "'\\''")}' | sudo -n -u postgres psql -d ${SKRAP_DB} -X -q 2>'${felFil}'`],
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

// --- Steg 5: mätning (u3:s tredelade kontrakt) ------------------------------

function matDatabas(dom) {
  console.log('[5/7] Mäter tabeller och rader …');
  const tabeller = sql(
    `SELECT table_schema || '.' || table_name FROM information_schema.tables ` +
    `WHERE table_type = 'BASE TABLE' AND table_schema NOT IN ('pg_catalog','information_schema') ORDER BY 1;`,
  ).split('\n').filter((l) => l.trim() !== '');

  // En enda UNION ALL-fråga — exakta count(*) per tabell (pg_stat-uppskattningar
  // är inte bevis nog för DR).
  const raderPerTabell = {};
  for (let i = 0; i < tabeller.length; i += 50) {
    const del = tabeller.slice(i, i + 50);
    const fraga = del.map((t) => `SELECT '${t}' AS t, count(*) AS n FROM ${t}`).join(' UNION ALL ') + ';';
    for (const rad of sql(fraga, { timeoutMs: 300000 }).split('\n')) {
      const sep = rad.indexOf('|');
      if (sep > 0) raderPerTabell[rad.slice(0, sep)] = Number(rad.slice(sep + 1));
    }
  }

  const summera = (filter) => {
    const namn = tabeller.filter(filter);
    return {
      tabeller: namn.length,
      rader: namn.reduce((summa, t) => summa + (raderPerTabell[t] || 0), 0),
    };
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
  // Nyckeltabeller enligt tidigare protokoll (u2/u3) — kurser/moduler fångas
  // generöst eftersom exakta namn varierar.
  const nyckelmönster = [
    /^auth\.users$/, /^public\.profiles$/, /^public\.section_data_snapshots$/,
    /^public\.board_decisions$/, /^public\.members$/,
    /kurs|course/i, /modul|module|section/i,
  ];
  for (const t of tabeller) {
    if (nyckelmönster.some((re) => re.test(t))) dom.mat.nyckeltabeller[t] = raderPerTabell[t] || 0;
  }
  console.log(`      public ${dom.mat.public.tabeller} tabeller / ${dom.mat.public.rader.toLocaleString('sv-SE')} rader · ` +
    `public+storage ${dom.mat.publicStorage.tabeller} / ${dom.mat.publicStorage.rader.toLocaleString('sv-SE')} · ` +
    `alla scheman ${dom.mat.allaScheman.tabeller} / ${dom.mat.allaScheman.rader.toLocaleString('sv-SE')}`);
}

// --- Kontextmätningar --------------------------------------------------------

function lasDisk() {
  const r = kor('df', ['-h', '/']);
  // Kolumner: Filesystem Size Used Avail Use% Mounted — ledigt och använt % är
  // OLIKA kolumner; att blanda dem får servern att se nästan full ut.
  const falt = ((r.stdout || '').split('\n')[1] || '').trim().split(/\s+/);
  if (falt.length >= 5) return `${falt[3]} ledigt (${falt[4].replace('%', '')} % använt)`;
  return 'okänt läge';
}

function raknaRetention() {
  try {
    const filer = readdirSync(DUMP_KATALOG)
      .filter((n) => /^db-\d{4}-\d{2}-\d{2}\.sql\.gz$/.test(n))
      .sort();
    if (filer.length === 0) return { antal: 0, aldstaDagar: null };
    const aldsta = statSync(path.join(DUMP_KATALOG, filer[0]));
    const dagar = Math.floor((Date.now() - aldsta.mtimeMs) / 86400000);
    return { antal: filer.length, aldstaDagar: dagar, period: `${filer[0]} … ${filer[filer.length - 1]}` };
  } catch {
    return { antal: 0, aldstaDagar: null };
  }
}

// --- Steg 6: protokoll -------------------------------------------------------

function nastaOvning() {
  const d = new Date();
  const nasta = new Date(d.getFullYear(), d.getMonth() + 3, d.getDate());
  const mm = String(nasta.getMonth() + 1).padStart(2, '0');
  const dd = String(nasta.getDate()).padStart(2, '0');
  return `${nasta.getFullYear()}-${mm}-${dd}`;
}

function skrivProtokoll(dom) {
  console.log('[6/7] Skriver protokoll …');
  // Robusthet: ett avbrott FÖRE restore/mätning ska ändå ge ett protokoll.
  if (!dom.rto) dom.rto = { sek: NaN, felFil: '(restore nåddes ej)' };
  if (!dom.fel) dom.fel = { antalRader: 0, kanda: { roller: {}, scheman: {}, extensions: {}, ovrigtKant: 0 }, okanda: [] };
  if (!dom.mat) dom.mat = {
    public: { tabeller: 0, rader: 0 }, publicStorage: { tabeller: 0, rader: 0 },
    allaScheman: { tabeller: 0, rader: 0 }, perSchema: {}, nyckeltabeller: {}, topp: [],
  };
  let vag = path.join(REPO_ROT, 'data', 'forskning', `DR-PROV-${dom.datumIso}-AUTO.md`);
  let n = 2;
  while (existsSync(vag)) vag = path.join(REPO_ROT, 'data', 'forskning', `DR-PROV-${dom.datumIso}-AUTO-${n++}.md`);
  const referens = TIDIGARE_OVNINGAR.map((o) =>
    `| ${o.namn} | ${o.datum} | ${o.rtoSek.toFixed(1)} s | ${o.publicTabeller} | ${o.publicRader.toLocaleString('sv-SE')} |`).join('\n');
  const kandaRoller = Object.entries(dom.fel.kanda.roller).sort((a, b) => b[1] - a[1])
    .map(([namn, antal]) => `${namn} ${antal}`).join(', ') || 'inga';
  const kandaScheman = Object.entries(dom.fel.kanda.scheman).sort((a, b) => b[1] - a[1])
    .map(([namn, antal]) => `${namn} ${antal}`).join(', ') || 'inga';
  const nycklar = Object.entries(dom.mat.nyckeltabeller).sort()
    .map(([t, n]) => `| ${t} | ${n.toLocaleString('sv-SE')} |`).join('\n');
  const scheman = Object.entries(dom.mat.perSchema).sort((a, b) => b[1].rader - a[1].rader)
    .map(([s, m]) => `| ${s} | ${m.tabeller} | ${m.rader.toLocaleString('sv-SE')} |`).join('\n');
  const topp = dom.mat.topp.map(([t, n]) => `| ${t} | ${n.toLocaleString('sv-SE')} |`).join('\n');
  const gron = dom.restoreOk && dom.fel.okanda.length === 0 && dom.stadning.skrapDbBort
    && (dom.behall || dom.stadning.pgStoppad);
  // Ärlighetskontrakt: avbrot FÖRE restore får aldrig rendera mätetal som ser
  // ut att komma från en genomförd återställning (NaN s / 0 rader-lögner).
  const foreRestore = Boolean(dom.avbrots) && dom.restoreOk !== true;

  const text = `# DR-PROV ${dom.datumIso} — AUTOMATISK kvartalsövning (${gron ? 'GODKÄNT' : 'UNDERKÄNT'})
${dom.avbrots ? `\n> **ÖVNINGEN AVBRÖTS:** ${dom.avbrots}\n` : ''}

**Körd av:** \`verktyg/dr-ovning.mjs\` (spår 10, s10-u4) — hela övningen som
ett kommando; detta protokoll genererades av verktyget vid körningen.

**Uppdrag:** Evighetskatalogen spår 10 (DATAINTEGRITET & BACKUP) —
återställningsövning per kvartal. Tidigare prov: v98 F3 (2026-09-11),
s10-u2 + s10-u3 (2026-09-15, manuella). Detta är spårets nästa steg:
övningen MEKANISERAD — mätmetodiken från u3 (tre nivåer) inbyggd,
u3:s låsfilskur implementerad.

---

## 1. Sammanfattning för kunden (5 rader)

1. ${foreRestore ? 'Övningen avbröts **före** återställningen (se banderollen) — inga återställningsmätetal framställdes; produktionen påverkades inte.' : `Vi återställde **hela databasen från en backup** i en avskild testdatabas
   på servern: **${dom.rto.sek.toFixed(1)} sekunder** — sedan raderade vi
   testdatabasen igen. Produktionen påverkades inte.`}
2. ${foreRestore ? 'Orsak och dom: banderollen + §2.' : `Kontrollen: **${dom.mat.public.tabeller} publika tabeller och
   ${dom.mat.public.rader.toLocaleString('sv-SE')} rader** kom tillbaka${dom.mat.public.rader >= 1246728 ? ' — datat växer som väntat' : ''}.`}
3. Nytt från den här övningen: hela provet körs nu av **ett enda verktyg**
   i stället för en handflödesövning — nästa kvartalsprov är ett rutinkommando,
   och ett lås ser till att bara en agent i taget får använda testdatabasen.
4. Backupen kontrolleras först (är den komplett ända till sista raden?) —
   ett underkännande stoppar provet innan något händer. ${dom.fel.okanda.length === 0 ? 'Inga okända fel uppstod.' : `OKÄNDA fel uppstod: ${dom.fel.okanda.length} — se §4, fynd att utreda.`}
5. Nästa övning: **senast ${nastaOvning()}** — kör \`node verktyg/dr-ovning.mjs\`.

## 2. Genomförande (verktygets steg)

| Steg | Resultat |
|---|---|
| 0. Lås ${LAS_VAG} | taget (pid ${process.pid}) — EN agent äger PG17-fönstret |
| 1. Dumpkontroll | ${dom.dumpNamn} — ${dom.dumpGron ? 'GRÖN' : 'RÖD'} enligt markörkontraktet (s10-u1:s verktyg) |
| 2. PG17 | ${dom.pgRordesEj ? 'rördes ej (avbrot före start)' : dom.pgStartadesAvOss ? 'startad av verktyget (låg stoppad — korrekt viloläge)' : 'var REDAN uppe vid ankomst (oväntat — protokollfynd)'} |
| 3. Skrap-DB | ${foreRestore ? 'nåddes ej' : `${SKRAP_DB} skapad färsk`} |
| 4. **Återställning (RTO)** | ${foreRestore ? 'nåddes ej' : `**${dom.rto.sek.toFixed(1)} s** (${(statSync(dom.dumpVag).size / 1048576).toFixed(1)} MB gz) · fellogg ${dom.fel.antalRader} rader → ${dom.rto.felFil}`} |
| 5. Mätning | ${foreRestore ? 'nåddes ej' : 'se §3'} |
| 6. Protokoll | denna fil |
| 7. Städning | ${foreRestore ? 'PG17/skrap-DB rördes ej (avbrot före start)' : `skrap-DB ${dom.stadning.skrapDbBort ? 'raderad' : 'EJ raderad'} · PG17 ${dom.stadning.pgStoppad ? 'stoppad (redo)' : dom.behall ? 'lämnad uppe (--behall)' : 'EJ stoppad — FYND'}`} |

## 3. Mätning (tre nivåer — u3:s kontrakt)

| Nivå | Tabeller | Rader |
|---|---|---|
| public | ${dom.mat.public.tabeller} | ${dom.mat.public.rader.toLocaleString('sv-SE')} |
| public + storage | ${dom.mat.publicStorage.tabeller} | ${dom.mat.publicStorage.rader.toLocaleString('sv-SE')} |
| alla scheman | ${dom.mat.allaScheman.tabeller} | ${dom.mat.allaScheman.rader.toLocaleString('sv-SE')} |

Per schema:

| Schema | Tabeller | Rader |
|---|---|---|
${scheman}

Nyckeltabeller:

| Tabell | Rader |
|---|---|
${nycklar}

Största tabellerna:

| Tabell | Rader |
|---|---|
${topp}

Jämförelse mot tidigare protokoll:

| Övning | Datum | RTO | public-tabeller | public-rader |
|---|---|---|---|---|
${referens}
| **denna (automatisk)** | ${dom.datumIso} | **${dom.rto.sek.toFixed(1)} s** | ${dom.mat.public.tabeller} | ${dom.mat.public.rader.toLocaleString('sv-SE')} |

## 4. Felloggen (${dom.fel.antalRader} rader)

Kända ofarliga (Supabase-molnets roller/scheman/extension finns inte i lokal
PG; vid äkta katastrof återskapas de i målmiljön först — v98 F3-slutsatsen):

- Roller: ${kandaRoller}
- Scheman: ${kandaScheman}
- Övrigt kända mönster ("does not exist"/"must be owner"/"already exists"): ${dom.fel.kanda.ovrigtKant}
- Fortsättningsrader (HINT/DETAIL/LINE — tillhör ovanstående): ${dom.fel.kanda.fortsattning}
${dom.fel.okanda.length > 0 ? `
**OKÄNDA fel (${dom.fel.okanda.length}) — FYND ATT UTREDA:**

\`\`\`
${dom.fel.okanda.slice(0, 10).join('\n')}
${dom.fel.okanda.length > 10 ? `… (+${dom.fel.okanda.length - 10} till)` : ''}
\`\`\`
` : '- Okända fel: 0'}
- Full logg: ${dom.rto.felFil}

## 5. Kontext

- Dumpkällor: ${dom.retention.antal} natt-dumpar på disk (${dom.retention.period}; äldsta ${dom.retention.aldstaDagar} dagar) — 30-dagarsretentionen sköts av cron-raden (find -mtime +30).
- Disk (${lasDisk()}) — oförändrat av övningen (skrap-DB städad).
- GDPR: protokollet redovisar endast antal, tabell-/fältnamn och tider — inga personvärden.
- Prod opåverkad: skrap-DB på lokal PG17 (port 5432); prod-data lever i Supabase-molnet.

## 6. Status

- Verktyget: \`verktyg/dr-ovning.mjs\` — kvartalsövningen är härmed ETT kommando
  (nästa: **senast ${nastaOvning()}**, \`node verktyg/dr-ovning.mjs\`).
- Kod i src/ berördes ej — tsc-baslinjen orörd; inga byggen.
- Slutdom: **${gron ? 'GRÖN — övningen godkänd' : 'RÖD — se fynd ovan'}**.

SLUT — maskinellt genererat av dr-ovning.mjs ${new Date().toISOString()}
`;
  writeFileSync(vag, text);
  dom.protokollVag = path.relative(REPO_ROT, vag);
  console.log(`      ${dom.protokollVag}`);
  return gron;
}

// --- Huvudflöde --------------------------------------------------------------

function main() {
  const opts = lasArgument();
  taLas();
  if (!grind()) { slappLas(); process.exit(75); }
  const dom = {
    datumIso: new Date().toISOString().slice(0, 10),
    behall: opts.behall,
    pgStartadesAvOss: false,
    pgRordesEj: false,
    stadning: { skrapDbBort: false, pgStoppad: false, meddelande: '' },
  };
  let gron = false;
  try {
    dom.dumpVag = opts.fil ? path.resolve(opts.fil) : hittaSenasteDump();
    dom.dumpNamn = path.basename(dom.dumpVag);
    dom.retention = raknaRetention();
    console.log(`DR-ÖVNING ${dom.datumIso} — dump: ${dom.dumpNamn}${opts.behall ? ' (--behall)' : ''}`);

    dom.dumpGron = forkontrollDump(dom.dumpVag);
    if (!dom.dumpGron) {
      // Kontraktet: misslyckade övningar SKALL protokollföras — även här,
      // innan PG17 rörs (städningen redovsas sanningsenligt som orörd).
      dom.avbrots = 'dumpen underkändes av slutmarkörskontrollen — återställning vägrades, PG17 rördes ej';
      dom.pgRordesEj = true;
      dom.stadning = { skrapDbBort: true, pgStoppad: true, meddelande: 'PG17/skrap-DB rördes ej (avbrot före start)' };
      skrivProtokoll(dom);
      slappLas();
      process.exit(1);
    }
    startaPg17(dom);
    try {
      skapaSkrapDb(); // inne i städnings-scope: ett createdb-fel får inte lämna PG17 uppe
      aterstall(dom.dumpVag, dom);
      matDatabas(dom);
      gron = true;
    } finally {
      stadaPg17(dom); // --behall hanteras inuti: protokollför brutet viloläge
    }
    gron = skrivProtokoll(dom) && gron;
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
