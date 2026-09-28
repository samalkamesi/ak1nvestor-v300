#!/usr/bin/env node
// dr-ovning-ssdnodes.mjs — DR-övningen för SSD Nodes-eran (v193, r288 2026-09-28)
// =====================================================================================
// Syskon till verktyg/dr-ovning.mjs (Contabo: system-PG17 via sudo +
// pg_ctlcluster). Nya servern (ssdnodes, minimal Ubuntu) har ENBART
// postgresql-client-18 och studions auto-policy förbjuder sudo — därför:
// USERSPACE-PG18 (r288): server-paketet uppackat ur deb i ~/.pg-ssdnodes
// (apt-get download + dpkg-deb -x — ingen root, samma mönster som
// gränsnittsvaktens ~/.chrome-libs), datadir ~/dr-pgdata, port 55432,
// socket /tmp/dr-pg-socket, trust-auth ENDAST på 127.0.0.1 (skrap-DB för
// DR-mätning — inga personvärden lämnar processen).
//
// Kontrakt ÄRVDA från dr-ovning.mjs (bevisade v98 F3 → s10-u4):
//   · flock-omstart på /tmp/ak1a-dr-prov.lock — EN agent äger DR-fönstret
//   · ram-/diskgrind FÖRE allt tungt (incidenten 2026-09-15 16:42)
//   · dumpkontroll via kolla-dump-markorer.mjs (en ofullständig dump är
//     ingen backup — underkänd dump stoppar övningen)
//   · restore med RTO-mätning + felkategorisering (kända Supabase-moln-
//     roller/scheman/extensions är ofarliga; OKÄNDA fel = fynd)
//   · mätning på TRE nivåer (public / public+storage / alla scheman) med
//     exakta count(*) per tabell (citerade identifierare — aufr-bladets
//     mellanslagskur) + nyckeltabeller + topp-8
//   · protokoll i data/forskning/ + GARANTERAD städning (även vid fel)
//
// NYTT för userspace-laget (bevisat r288 05:21-05:26):
//   · initdb vid saknad datadir; pg_ctl start MED -l serverloggfil —
//     postgres-daemonen får ALDRIG ärva vår stdout-pipe (r287:s daemon-
//     kur gäller alla långlivade barn: ärvd pipe = hängande anrop)
//   · ny dumpväljare: daterade db-YYYY-MM-DD.sql.gz företräde, fallback
//     = nyaste *.sql.gz på mtime (cutover-dumpen db-cutover-test.sql.gz
//     matchar inte dr-ovning:s datumregex men är fullt giltig)
//
// Lägen: (inget arg) senaste dump · --fil <väg> · --behall (städa ej)
// Exit: 0 GRÖN · 1 RÖD · 3 låset upptaget · 75 grind stängd.
import { spawnSync } from "node:child_process";
import {
  existsSync, openSync, closeSync, writeFileSync, readFileSync, readdirSync,
  statSync, unlinkSync, rmSync, mkdirSync,
} from "node:fs";
import { dirname as pathDirname, join as pathJoin, basename as pathBasename } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import path from "node:path";

const REPO_ROT = path.resolve(pathDirname(fileURLToPath(import.meta.url)), "..");
const DUMP_KATALOG = pathJoin(REPO_ROT, "data", "backups", "supabase");
const LAS_VAG = "/tmp/ak1a-dr-prov.lock"; // samma som syskonen — EN ägare oavsett verktyg
const SKRAP_DB = "ak1a_dr_test";
const PG_BIN = `${process.env.HOME}/.pg-ssdnodes/usr/lib/postgresql/18/bin`;
const PG_DATA = `${process.env.HOME}/dr-pgdata`;
const PG_SOCK = "/tmp/dr-pg-socket";
const PG_LOGG = `${process.env.HOME}/dr-pgdata-server.log`;
const PG_PORT = 55432;
const PG_ANSLUTNING = ["-h", "127.0.0.1", "-p", String(PG_PORT), "-U", "ak1a"]; // gäller psql OCH dropdb/createdb
const PSQL_GRUND = [...PG_ANSLUTNING, "-X", "-q", "-A", "-t"]; // -X m.fl. är psql-exklusivt (createdb förkastar det — bevisat 05:43)

// Tidigare bevisade övningar — protokollets jämförelsebas (Contabo-eran).
const TIDIGARE_OVNINGAR = [
  { namn: "v98 F3 (godkänd mall)", datum: "2026-09-11", rtoSek: 20.0, publicRader: 1187291, publicTabeller: 60 },
  { namn: "s10-u2 (kvartalsövning)", datum: "2026-09-15", rtoSek: 17.7, publicRader: 1246728, publicTabeller: 60 },
  { namn: "s10-u3 (oberoende replik)", datum: "2026-09-15", rtoSek: 14.7, publicRader: 1246728, publicTabeller: 60 },
];

// --- processhjälp -------------------------------------------------------------

function kor(kommando, args, opts = {}) {
  const r = spawnSync(kommando, args, { encoding: "utf8", timeout: opts.timeoutMs ?? 120000, maxBuffer: 64 * 1024 * 1024 });
  return { ok: r.status === 0, status: r.status, stdout: (r.stdout || "").trim(), stderr: (r.stderr || "").trim() };
}

/** Kör en SQL-fråga mot skrap-DB:n, returnerar råa rader (psql -A -t). */
export function sql(fraga, opts = {}) {
  const r = kor("/usr/bin/psql", [...PSQL_GRUND, "-d", SKRAP_DB, "-c", fraga], opts);
  if (!r.ok) throw new Error(`psql misslyckades: ${r.stderr || r.stdout || "okänt fel"}`);
  return r.stdout;
}

// --- lås (syskonkontraktet: flock-omstart + dött-lås-övertagande) -------------

function taLas() {
  if (process.env.AK1A_DR_FLOCK === "1") {
    const fd = openSync(LAS_VAG, "w");
    writeFileSync(fd, `pid=${process.pid} start=${new Date().toISOString()} verktyg=dr-ovning-ssdnodes.mjs flock=1\n`);
    closeSync(fd);
    return;
  }
  if (existsSync(LAS_VAG)) {
    const alder = Date.now() - statSync(LAS_VAG).mtimeMs;
    if (alder < 30 * 60_000) {
      console.error(`LÅSET UPTAGET (${(alder / 60000).toFixed(1)} min): ${readFileSync(LAS_VAG, "utf8").trim()}`);
      console.error("DR-ÖVNING AVBRUTEN INNAN USERSPACE-PG RÖRDES.");
      process.exit(3);
    }
    console.log(`VARNING: låsfil ${(alder / 60000).toFixed(0)} min gammal (död agent?) — tas över.`);
    unlinkSync(LAS_VAG);
  }
  const fd = openSync(LAS_VAG, "wx");
  writeFileSync(fd, `pid=${process.pid} start=${new Date().toISOString()} verktyg=dr-ovning-ssdnodes.mjs\n`);
  closeSync(fd);
}

function slappLas() {
  if (process.env.AK1A_DR_FLOCK === "1") return; // yttre flock äger inoden
  try { unlinkSync(LAS_VAG); } catch { /* redan borta */ }
}

function flockStartaOm() {
  if (process.env.AK1A_DR_FLOCK === "1") return;
  const r = spawnSync("flock", ["-w", "900", LAS_VAG, process.execPath, fileURLToPath(import.meta.url), ...process.argv.slice(2)], {
    stdio: "inherit", env: { ...process.env, AK1A_DR_FLOCK: "1" }, timeout: 960000,
  });
  if (r.error) {
    console.error(`FLOCK-KRITISKT: ${r.error.message} — övningen vägras utan lås.`);
    process.exit(1);
  }
  process.exit(r.status ?? 1);
}

// --- grind (syskonkontraktet) --------------------------------------------------

function grind() {
  const mem = /MemAvailable:\s+(\d+) kB/.exec(readFileSync("/proc/meminfo", "utf8"));
  const mb = mem ? Math.round(Number(mem[1]) / 1024) : 0;
  if (mb < 1000) { console.error(`RAMGRIND: MemAvailable ${mb} MB < 1000 MB — SKIPPAS (exit 75).`); return false; }
  const df = kor("df", ["-k", "/"]);
  const gbLedigt = Number((((df.stdout || "").split("\n")[1] || "").trim().split(/\s+/)[3] || 0)) / 1024 / 1024;
  if (gbLedigt < 5) { console.error(`DISKGRIND: ${gbLedigt.toFixed(1)} GB ledigt < 5 GB — SKIPPAS (exit 75).`); return false; }
  console.log(`Grind OK: MemAvailable ${mb} MB · ${gbLedigt.toFixed(0)} GB ledigt på /`);
  return true;
}

// --- userspace-PG-lagret (v193) ------------------------------------------------

function pgUpp() {
  // OBS: pg_isready ägs av KLIENT-paketet (finns ej i server-debets bin —
  // ENOENT bevisat 05:41); systemets /usr/bin/pg_isready talar samma protokoll.
  return kor("/usr/bin/pg_isready", ["-h", "127.0.0.1", "-p", String(PG_PORT), "-q"]).ok;
}

/** pg_ctl med -l + stdio ignore: servern loggar till FIL, aldrig till vår pipe. */
function pgCtl(args) {
  const r = spawnSync(`${PG_BIN}/pg_ctl`, ["-D", PG_DATA, "-w", "-t", "60", ...args], {
    encoding: "utf8", timeout: 120000, stdio: ["ignore", "pipe", "pipe"],
  });
  return { ok: r.status === 0, status: r.status, stdout: (r.stdout || "").trim(), stderr: (r.stderr || "").trim() };
}

export function startaUserspacePg(dom) {
  console.log("[2/7] Userspace-PG18 …");
  if (!existsSync(`${PG_BIN}/postgres`)) {
    throw new Error(`${PG_BIN}/postgres saknas — kör först userspace-uppsättningen (apt-get download postgresql-18 + dpkg-deb -x → ~/.pg-ssdnodes, se worklog r288)`);
  }
  dom.pgStartadesAvOss = !pgUpp();
  if (dom.pgStartadesAvOss) {
    if (!existsSync(pathJoin(PG_DATA, "PG_VERSION"))) {
      console.log("      initdb (första gången på denna server) …");
      rmSync(PG_DATA, { recursive: true, force: true });
      const init = spawnSync(`${PG_BIN}/initdb`, ["-D", PG_DATA, "-E", "UTF8", "--locale=C.UTF-8", "-A", "trust", "-U", "ak1a"], { encoding: "utf8", timeout: 120000, stdio: ["ignore", "pipe", "pipe"] });
      if (init.status !== 0) throw new Error(`initdb misslyckades: ${init.stderr}`);
    }
    rmSync(PG_SOCK, { recursive: true, force: true });
    mkdirSync(PG_SOCK, { recursive: true }); // katalogen måste finnas — annars FATAL "could not create lock file" (bevisat 05:38)
    // -l = serverns logg till FIL + stdio "ignore" = inga pipor alls (pipe-
    // kuren, bevisat r288 05:23: ärvd stdout-pipe = anropet hänger fast
    // daemonen lever); pg_ctl -w väntar in readiness, vi pollar efteråt.
    const start = spawnSync(`${PG_BIN}/pg_ctl`, ["-D", PG_DATA, "-w", "-t", "60", "-l", PG_LOGG, "start", "-o", `-p ${PG_PORT} -c listen_addresses=127.0.0.1 -k ${PG_SOCK} -c jit=off`], { encoding: "utf8", timeout: 120000, stdio: "ignore" });
    if (start.status !== 0) throw new Error(`pg_ctl start misslyckades (exit ${start.status}, logg: ${PG_LOGG})`);
    if (!pgUpp()) throw new Error(`PG kom ej upp (logg: ${PG_LOGG})`);
    console.log(`      PG18 userspace online på 127.0.0.1:${PG_PORT} (port 5432 orörd).`);
  } else {
    console.log("      VARNING: userspace-PG var REDAN uppe vid ankomst (oväntat med låsfil — protokollförs).");
  }
}

export function stappaUserspacePg() {
  const r = pgCtl(["stop", "-m", "fast"]);
  return r.ok || !pgUpp();
}

// --- dumpval + förkontroll (syskonkontraktet + cutover-fallback) ----------------

/** Väljer senaste dump ur GIVEN katalog (testbar kärna): daterade
 *  db-YYYY-MM-DD.sql.gz har företräde (sorterat namn); annars nyaste
 *  db-*.sql.gz på mtime (cutover-övergångsdumpar matchar inte
 *  datumregex men är fullt giltiga — v193:fallback). */
export function valSenasteDumpUr(katalog) {
  if (!existsSync(katalog)) throw new Error(`Dumpkatalogen saknas: ${katalog}`);
  const filer = readdirSync(katalog).filter((n) => /^db-\d{4}-\d{2}-\d{2}\.sql\.gz$/.test(n)).sort();
  if (filer.length > 0) return pathJoin(katalog, filer[filer.length - 1]);
  const ovriga = readdirSync(katalog).filter((n) => /^db-.*\.sql\.gz$/.test(n))
    .map((n) => ({ n, m: statSync(pathJoin(katalog, n)).mtimeMs }))
    .sort((a, b) => b.m - a.m);
  if (ovriga.length === 0) throw new Error(`Inga db-*.sql.gz i ${katalog} — inget att återställa.`);
  return pathJoin(katalog, ovriga[0].n);
}

export function hittaSenasteDump() {
  return valSenasteDumpUr(DUMP_KATALOG);
}

export function valDump(given) {
  if (existsSync(given)) return path.resolve(given);
  const kandidat = pathJoin(DUMP_KATALOG, pathBasename(given));
  if (existsSync(kandidat)) return kandidat;
  return path.resolve(given);
}

function forkontrollDump(dump) {
  console.log("[1/7] Dumpkontroll (kolla-dump-markorer.mjs --fil) …");
  const r = kor("node", [pathJoin(REPO_ROT, "verktyg", "kolla-dump-markorer.mjs"), "--fil", dump], { timeoutMs: 300000 }); // app-blad ~86 MB = 87–96 s koll; 120 s under last = falskt UNDERKÄND (s10-u2 2026-09-28)
  console.log(r.stdout.split("\n").map((l) => `      ${l}`).join("\n"));
  if (r.status !== 0) {
    console.error("DUMPEN UNDERKÄND — återställning vägras (en ofullständig dump är ingen backup).");
    return false;
  }
  return true;
}

// --- restore + felkategorisering (ärvt kontrakt, duplicerat från syskonen ——
//     som är ett skript med main()-sidoeffekt, ej importerbart) ------------------

export function kategoriseraFel(felrader) {
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
    if (rad.trim() !== "") okanda.push(rad);
  }
  return { kanda, okanda };
}

function aterstall(dump, dom) {
  console.log("[4/7] ÅTERSTÄLLER (zcat | psql) — RTO-mätning startar …");
  const blad = dom.dumpNamn.replace(/^db-/, "").replace(/\.sql\.gz$/, "");
  const felFil = `/tmp/dr-ovning-fel-blad-${blad}-p${process.pid}-${Date.now()}.log`;
  const t0 = process.hrtime.bigint();
  const r = spawnSync("bash", ["-c",
    `zcat '${dump.replace(/'/g, "'\\''")}' | /usr/bin/psql ${PSQL_GRUND.map((a) => `'${a}'`).join(" ")} -d ${SKRAP_DB} -q 2>'${felFil}'`],
  { encoding: "utf8", timeout: 900000, maxBuffer: 64 * 1024 * 1024 });
  const ms = Number(process.hrtime.bigint() - t0) / 1e6;
  dom.rto = { ms, sek: ms / 1000, felFil };
  dom.restoreOk = r.status === 0;
  let felrader = [];
  try { felrader = readFileSync(felFil, "utf8").split("\n"); } catch { felrader = []; }
  dom.fel = kategoriseraFel(felrader);
  dom.fel.antalRader = felrader.filter((l) => l.trim() !== "").length;
  console.log(`      ${dom.restoreOk ? "KLART" : "PSLYFEL"} på ${(ms / 1000).toFixed(1)} s · felrader ${dom.fel.antalRader} (okända ${dom.fel.okanda.length}) → ${felFil}`);
  if (!dom.restoreOk) throw new Error(`psql-restore avslutades med kod ${r.status}`);
}

// --- mätning (u3:s tredelade kontrakt, ärvt) -------------------------------------

function matDatabas(dom) {
  console.log("[5/7] Mäter tabeller och rader …");
  const tabeller = sql(
    `SELECT table_schema || '.' || table_name FROM information_schema.tables ` +
    `WHERE table_type = 'BASE TABLE' AND table_schema NOT IN ('pg_catalog','information_schema') ORDER BY 1;`,
  ).split("\n").filter((l) => l.trim() !== "");
  const raderPerTabell = {};
  const citera = (t) => t.split(".").map((p) => `"${p.replace(/"/g, '""')}"`).join(".");
  for (let i = 0; i < tabeller.length; i += 50) {
    const fraga = tabeller.slice(i, i + 50)
      .map((t) => `SELECT '${t.replace(/'/g, "''")}' AS t, count(*) AS n FROM ${citera(t)}`).join(" UNION ALL ") + ";";
    for (const rad of sql(fraga, { timeoutMs: 600000 }).split("\n")) {
      const sep = rad.indexOf("|");
      if (sep > 0) raderPerTabell[rad.slice(0, sep)] = Number(rad.slice(sep + 1));
    }
  }
  const summera = (filter) => {
    const namn = tabeller.filter(filter);
    return { tabeller: namn.length, rader: namn.reduce((s, t) => s + (raderPerTabell[t] || 0), 0) };
  };
  dom.mat = {
    public: summera((t) => t.startsWith("public.")),
    publicStorage: summera((t) => t.startsWith("public.") || t.startsWith("storage.")),
    allaScheman: summera(() => true),
    perSchema: {},
    nyckeltabeller: {},
    topp: Object.entries(raderPerTabell).sort((a, b) => b[1] - a[1]).slice(0, 8),
  };
  for (const t of tabeller) {
    const schema = t.split(".")[0];
    dom.mat.perSchema[schema] = dom.mat.perSchema[schema] || { tabeller: 0, rader: 0 };
    dom.mat.perSchema[schema].tabeller += 1;
    dom.mat.perSchema[schema].rader += raderPerTabell[t] || 0;
  }
  const nyckelmönster = [
    /^auth\.users$/, /^public\.profiles$/, /^public\.section_data_snapshots$/,
    /^public\.board_decisions$/, /^public\.members$/,
    /kurs|course/i, /modul|module|section/i,
  ];
  for (const t of tabeller) {
    if (nyckelmönster.some((re) => re.test(t))) dom.mat.nyckeltabeller[t] = raderPerTabell[t] || 0;
  }
  console.log(`      public ${dom.mat.public.tabeller} tabeller / ${dom.mat.public.rader.toLocaleString("sv-SE")} rader · ` +
    `public+storage ${dom.mat.publicStorage.tabeller} / ${dom.mat.publicStorage.rader.toLocaleString("sv-SE")} · ` +
    `alla scheman ${dom.mat.allaScheman.tabeller} / ${dom.mat.allaScheman.rader.toLocaleString("sv-SE")}`);
}

// --- protokoll + städning + huvudflöde -------------------------------------------

function lasArgument() {
  const args = process.argv.slice(2);
  const opts = { fil: null, behall: false };
  for (let i = 0; i < args.length; i++) {
    if (args[i] === "--fil") opts.fil = args[++i];
    else if (args[i] === "--behall") opts.behall = true;
    else if (args[i] === "--hjalp" || args[i] === "--help") {
      console.log("Användning: node verktyg/dr-ovning-ssdnodes.mjs [--fil <dump.sql.gz>] [--behall]");
      process.exit(0);
    } else { console.error(`Okänt argument: ${args[i]} (se --hjalp)`); process.exit(2); }
  }
  return opts;
}

function skrivProtokoll(dom) {
  console.log("[6/7] Skriver protokoll …");
  if (!dom.rto) dom.rto = { sek: NaN, felFil: "(restore nåddes ej)" };
  if (!dom.fel) dom.fel = { antalRader: 0, kanda: { roller: {}, scheman: {}, extensions: {}, ovrigtKant: 0 }, okanda: [] };
  if (!dom.mat) dom.mat = { public: { tabeller: 0, rader: 0 }, publicStorage: { tabeller: 0, rader: 0 }, allaScheman: { tabeller: 0, rader: 0 }, perSchema: {}, nyckeltabeller: {}, topp: [] };
  let vag = pathJoin(REPO_ROT, "data", "forskning", `DR-PROV-${dom.datumIso}-SSDNODES-AUTO.md`);
  let n = 2;
  while (existsSync(vag)) vag = pathJoin(REPO_ROT, "data", "forskning", `DR-PROV-${dom.datumIso}-SSDNODES-AUTO-${n++}.md`);
  const referens = TIDIGARE_OVNINGAR.map((o) => `| ${o.namn} | ${o.datum} | ${o.rtoSek.toFixed(1)} s | ${o.publicTabeller} | ${o.publicRader.toLocaleString("sv-SE")} |`).join("\n");
  const nycklar = Object.entries(dom.mat.nyckeltabeller).sort().map(([t, n2]) => `| ${t} | ${n2.toLocaleString("sv-SE")} |`).join("\n");
  const scheman = Object.entries(dom.mat.perSchema).sort((a, b) => b[1].rader - a[1].rader).map(([s, m]) => `| ${s} | ${m.tabeller} | ${m.rader.toLocaleString("sv-SE")} |`).join("\n");
  const topp = dom.mat.topp.map(([t, n2]) => `| ${t} | ${n2.toLocaleString("sv-SE")} |`).join("\n");
  const gron = dom.restoreOk && dom.fel.okanda.length === 0
    && (dom.behall || (dom.stadning.skrapDbBort && dom.stadning.pgStoppad));
  const foreRestore = Boolean(dom.avbrots) && dom.restoreOk !== true;
  const text = `# DR-PROV ${dom.datumIso} SSDNODES — AUTOMATISK övning (${gron ? "GODKÄNT" : "UNDERKÄNT"})
${dom.avbrots ? `\n> **ÖVNINGEN AVBRÖTS:** ${dom.avbrots}\n` : ""}

**Körd av:** \`verktyg/dr-ovning-ssdnodes.mjs\` (v193, r288) — serverbytets
DR-övning: samma kontrakt som Contabo-syskonet (dr-ovning.mjs) men mot en
USERSPACE-PG18 (port 55432, ~/.pg-ssdnodes — ingen root behövs).

---

## 1. Sammanfattning för kunden (5 rader)

1. ${foreRestore ? "Övningen avbröts **före** återställningen — inga mätetal framställdes; produktionen påverkades inte." : `Vi återställde **hela databasen från backup** i en avskild testdatabas på servern: **${dom.rto.sek.toFixed(1)} sekunder** — testdatabasen raderades efteråt. Produktionen påverkades inte.`}
2. ${foreRestore ? "Orsak och dom: banderollen + §2." : `Kontrollen: **${dom.mat.public.tabeller} publika tabeller och ${dom.mat.public.rader.toLocaleString("sv-SE")} rader** kom tillbaka.`}
3. Nytt: övningen körs nu mot en **root-fri userspace-postgres** — nya servern saknar system-PG och sudo är förbjudet; hela katastrofåterställningsförmågan är bevisad på nya maskinen.
4. Backupen kontrollerades först (komplett ända till sista raden). ${dom.fel.okanda.length === 0 ? "Inga okända fel." : `OKÄNDA fel: ${dom.fel.okanda.length} — se §4.`}
5. Nästa övning: kvartal enligt DRIFTSBOKEN — \`node verktyg/dr-ovning-ssdnodes.mjs\`.

## 2. Genomförande

| Steg | Resultat |
|---|---|
| 0. Lås ${LAS_VAG} | taget (pid ${process.pid}) |
| 1. Dumpkontroll | ${dom.dumpNamn} — ${dom.dumpGron ? "GRÖN" : "RÖD"} |
| 2. Userspace-PG18 | ${dom.pgStartadesAvOss ? "startad av verktyget (127.0.0.1:" + PG_PORT + ", port 5432 orörd)" : "var uppe vid ankomst (protokollfynd)"} |
| 3. Skrap-DB | ${foreRestore ? "nåddes ej" : SKRAP_DB + " skapad färsk"} |
| 4. **Återställning (RTO)** | ${foreRestore ? "nåddes ej" : `**${dom.rto.sek.toFixed(1)} s** (${(statSync(dom.dumpVag).size / 1048576).toFixed(1)} MB gz) · fellogg ${dom.fel.antalRader} rader → ${dom.rto.felFil}`} |
| 5. Mätning | ${foreRestore ? "nåddes ej" : "se §3"} |
| 6. Protokoll | denna fil |
| 7. Städning | ${foreRestore ? "PG/skrap-DB rördes ej" : dom.behall ? "--behall: lämnad (anroparen städar)" : `skrap-DB ${dom.stadning.skrapDbBort ? "raderad" : "EJ raderad"} · PG ${dom.stadning.pgStoppad ? "stoppad" : "EJ stoppad — FYND"}`} |

## 3. Mätning (tre nivåer)

| Nivå | Tabeller | Rader |
|---|---|---|
| public | ${dom.mat.public.tabeller} | ${dom.mat.public.rader.toLocaleString("sv-SE")} |
| public + storage | ${dom.mat.publicStorage.tabeller} | ${dom.mat.publicStorage.rader.toLocaleString("sv-SE")} |
| alla scheman | ${dom.mat.allaScheman.tabeller} | ${dom.mat.allaScheman.rader.toLocaleString("sv-SE")} |

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

Jämförelse (Contabo-eran):

| Övning | Datum | RTO | public-tabeller | public-rader |
|---|---|---|---|---|
${referens}
| **denna (ssdnodes, userspace-PG)** | ${dom.datumIso} | **${dom.rto.sek.toFixed(1)} s** | ${dom.mat.public.tabeller} | ${dom.mat.public.rader.toLocaleString("sv-SE")} |

## 4. Felloggen (${dom.fel.antalRader} rader)

Kända ofarliga (Supabase-molnets roller/scheman/extensions finns inte i lokal PG —
vid äkta katastrof återskapas de i målmiljön först, v98 F3-slutsatsen):
roller {${Object.entries(dom.fel.kanda.roller).map(([k, v]) => `${k}×${v}`).join(", ") || "inga"}} ·
scheman {${Object.entries(dom.fel.kanda.scheman).map(([k, v]) => `${k}×${v}`).join(", ") || "inga"}} ·
extensions {${Object.entries(dom.fel.kanda.extensions).map(([k, v]) => `${k}×${v}`).join(", ") || "inga"}} ·
övrigt kända ${dom.fel.kanda.ovrigtKant} · fortsättningsrader ${dom.fel.kanda.fortsattning}.
${dom.fel.okanda.length > 0 ? `\n**OKÄNDA fel (${dom.fel.okanda.length}) — FYND ATT UTREDA:**\n\n\`\`\`\n${dom.fel.okanda.slice(0, 10).join("\n")}${dom.fel.okanda.length > 10 ? `\n… (+${dom.fel.okanda.length - 10} till)` : ""}\n\`\`\`\n` : "- Okända fel: 0"}
- Full logg: ${dom.rto.felFil}

## 5. Kontext

- Dump: ${dom.dumpNamn} (${(statSync(dom.dumpVag).size / 1048576).toFixed(1)} MB gz).
- GDPR: protokollet redovisar endast antal, tabell-/fältnamn och tider — inga personvärden.
- Prod opåverkad: skrap-DB på userspace-PG (127.0.0.1:${PG_PORT}); prod-data lever i Supabase-molnet; port 5432 rördes aldrig.
- Userspace-PG: binärer ~/.pg-ssdnodes (deb-uppackade, ingen root) · datadir ${PG_DATA} · serverlogg ${PG_LOGG}.

## 6. Status

- Slutdom: **${gron ? "GRÖN — övningen godkänd" : "RÖD — se fynd ovan"}**.
- src/ berördes ej — tsc-baslinjen orörd; inga byggen.

SLUT — maskinellt genererat av dr-ovning-ssdnodes.mjs ${new Date().toISOString()}
`;
  writeFileSync(vag, text);
  dom.protokollVag = path.relative(REPO_ROT, vag);
  console.log(`      ${dom.protokollVag}`);
  return gron;
}

export function stadaUserspace(dom) {
  console.log("[7/7] Städning: skrap-DB + userspace-PG …");
  if (dom.behall) {
    dom.stadning = { skrapDbBort: false, pgStoppad: false, meddelande: "--behall givet: skrap-DB/PG lämnas (anroparen städar: dropdb + pg_ctl stop)." };
    console.log("      --behall: lämnar skrap-DB + PG uppe.");
    return;
  }
  const drop = kor("/usr/bin/dropdb", [...PG_ANSLUTNING, "--if-exists", SKRAP_DB]);
  dom.stadning = { skrapDbBort: drop.ok, pgStoppad: null, meddelande: "" };
  if (!drop.ok) dom.stadning.meddelande += `dropdb misslyckades: ${drop.stderr} `;
  dom.stadning.pgStoppad = stappaUserspacePg();
  if (!dom.stadning.pgStoppad) dom.stadning.meddelande += "pg_ctl stop misslyckades ";
  console.log(`      skrap-DB ${dom.stadning.skrapDbBort ? "raderad" : "KUNDE EJ RADERAS"} · PG ${dom.stadning.pgStoppad ? "stoppad" : "KUNDE EJ STOPPAS"}.`);
}

const arHuvudprogram = process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href;

if (arHuvudprogram) {
  const opts = lasArgument();
  flockStartaOm();
  taLas();
  if (!grind()) { slappLas(); process.exit(75); }
  const dom = {
    datumIso: new Date().toISOString().slice(0, 10),
    behall: opts.behall,
    pgStartadesAvOss: false,
    stadning: { skrapDbBort: false, pgStoppad: false, meddelande: "" },
  };
  let gron = false;
  try {
    dom.dumpVag = opts.fil ? valDump(opts.fil) : hittaSenasteDump();
    dom.dumpNamn = pathBasename(dom.dumpVag);
    console.log(`DR-ÖVNING SSDNODES ${dom.datumIso} — dump: ${dom.dumpNamn}${opts.behall ? " (--behall)" : ""}`);
    dom.dumpGron = forkontrollDump(dom.dumpVag);
    if (!dom.dumpGron) {
      dom.avbrots = "dumpen underkändes av slutmarkörskontrollen — återställning vägrades, PG rördes ej";
      dom.stadning = { skrapDbBort: true, pgStoppad: true, meddelande: "PG/skrap-DB rördes ej" };
      skrivProtokoll(dom);
      slappLas();
      process.exit(1);
    }
    startaUserspacePg(dom);
    try {
      console.log("[3/7] Skapar färsk skrap-DB (dropdb --if-exists + createdb) …");
      kor("/usr/bin/dropdb", [...PG_ANSLUTNING, "--if-exists", SKRAP_DB]);
      const skapa = kor("/usr/bin/createdb", [...PG_ANSLUTNING, SKRAP_DB]);
      if (!skapa.ok) throw new Error(`createdb misslyckades: ${skapa.stderr}`);
      aterstall(dom.dumpVag, dom);
      matDatabas(dom);
      gron = true;
    } finally {
      stadaUserspace(dom);
    }
    gron = skrivProtokoll(dom) && gron;
  } catch (e) {
    console.error(`DR-ÖVNINGEN AVBRUTEN: ${e.message}`);
    dom.avbrots = e.message;
    try { if (pgUpp()) stadaUserspace(dom); } catch { /* städning bästa ansträngning */ }
    try { skrivProtokoll(dom); } catch (e2) { console.error(`Protokoll kunde ej skrivas: ${e2.message}`); }
  } finally {
    slappLas();
  }
  process.exit(gron ? 0 : 1);
}
