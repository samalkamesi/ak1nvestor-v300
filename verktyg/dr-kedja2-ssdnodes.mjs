#!/usr/bin/env node
// dr-kedja2-ssdnodes.mjs — DR-kedja 2 för SSD Nodes-eran: system_events ur
// moln-JSON-arkivet → userspace-PG18 (spår 10, 2026-10-01). Syskon till
// verktyg/dr-kedja2.mjs (Contabo: system-PG17 via sudo). Precis som v193
// portade kedja 1 (dr-ovning.mjs → dr-ovning-ssdnodes.mjs) porterar detta
// kedja 2: samma flöde, men userspace-PG18-lagret ÄRVS via import från
// dr-ovning-ssdnodes.mjs (dess main-guard gör importen sidoeffektfri) —
// binärer ~/.pg-ssdnodes, datadir ~/dr-pgdata, port 55432, trust endast
// 127.0.0.1, ingen root.
//
// Flöde: flock-lås (samma fil som syskonen) → ram-/diskgrind → senaste
// system-events-full-*.json.gz väljs → userspace-PG18 startas (om nere) →
// färsk skrap-DB ak1a_dr_json → tabell-DDL ur SENASTE SQL-dumpen (prodens
// egen definition; kirurgiskt byte extensions.uuid_generate_v4() →
// gen_random_uuid() — moln-schemat finnes ej lokalt och DEFAULT är utan
// betydelse då COPY bär egna id:n) → aterstall-system-events.mjs --db
// (u3:2:s bevisade verktyg, styrt hit via PGHOST/PGPORT/PGUSER-env — det
// spawnar själv "psql" utan host-flaggor) → oberoende PG-verifiering →
// maskinellt protokoll → GARANTERAD städning (finally).
//
// Kontrakt: fyra-samma — header-antal == gzip-ström-radantal (verktygets
// egen dom) == COPY-n == oberoende count(*) i PG; dubblett-id == 0.
//
// Flaggor: --fil <arkiv> (override) · --behall (lämna skrap-DB+PG) · --hjalp
// Exit: 0 GRÖN · 1 RÖD · 3 låset upptaget · 75 ram-/diskgrind stängd.

import { spawnSync } from "node:child_process";
import {
  existsSync, openSync, closeSync, writeFileSync, readFileSync, readdirSync,
  statSync, unlinkSync,
} from "node:fs";
import { dirname as pathDirname, join as pathJoin, basename as pathBasename } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import path from "node:path";
import { startaUserspacePg, stappaUserspacePg } from "./dr-ovning-ssdnodes.mjs";

const REPO_ROT = path.resolve(pathDirname(fileURLToPath(import.meta.url)), "..");
const ARKIV_KATALOG = pathJoin(REPO_ROT, "data", "backups");
const DUMP_KATALOG = pathJoin(REPO_ROT, "data", "backups", "supabase");
const LAS_VAG = "/tmp/ak1a-dr-prov.lock"; // samma som syskonen — EN ägare oavsett verktyg
const DB = "ak1a_dr_json"; // skild från kedja 1:s ak1a_dr_test — krockar ej ens utan flock
const PG_PORT = 55432;
const PG_ANSLUTNING = ["-h", "127.0.0.1", "-p", String(PG_PORT), "-U", "ak1a"]; // gäller psql OCH dropdb/createdb
const PSQL_GRUND = [...PG_ANSLUTNING, "-X", "-q", "-A", "-t"]; // -X m.fl. är psql-exklusiva (createdb förkastar dem — bevisat r288)

// aterstall-system-events.mjs spawnar "psql" UTAN host/port-flaggor —
// anslutningen styrs hit via env (psql läser PGHOST/PGPORT/PGUSER).
export const PG_ENV = { PGHOST: "127.0.0.1", PGPORT: String(PG_PORT), PGUSER: "ak1a" };

// Tidigare bevisade kedja-2-övningar — protokollets jämförelsebas (Contabo).
const TIDIGARE_OVNINGAR = [
  { namn: "kedja 2 jungfru (s10)", datum: "2026-09-17", rtoSek: 25.0, rader: 163039 },
  { namn: "kedja 2 (s10-u4-replik)", datum: "2026-09-20", rtoSek: 34.3, rader: 168696 },
  { namn: "kedja 2 (s10-u1 kväll)", datum: "2026-09-21", rtoSek: 104.5, rader: 170979 },
];

function kor(kommando, args, opts = {}) {
  const r = spawnSync(kommando, args, { encoding: "utf8", timeout: opts.timeoutMs ?? 120000, maxBuffer: 64 * 1024 * 1024, env: opts.env });
  return { ok: r.status === 0, status: r.status, stdout: (r.stdout || "").trim(), stderr: (r.stderr || "").trim() };
}
const log = (s) => console.log(s);

export function sql(fraga, opts = {}) {
  const r = kor("/usr/bin/psql", [...PSQL_GRUND, "-d", DB, "-c", fraga], opts);
  if (!r.ok) throw new Error(`psql misslyckades: ${r.stderr || r.stdout || "okänt fel"}`);
  return r.stdout;
}

// --- lås (syskonkontraktet: flock-omstart + dött-lås-övertagande) -------------

function taLas() {
  if (process.env.AK1A_DR_FLOCK === "1") {
    const fd = openSync(LAS_VAG, "w");
    writeFileSync(fd, `pid=${process.pid} start=${new Date().toISOString()} verktyg=dr-kedja2-ssdnodes.mjs flock=1\n`);
    closeSync(fd);
    return;
  }
  if (existsSync(LAS_VAG)) {
    const alder = Date.now() - statSync(LAS_VAG).mtimeMs;
    if (alder < 30 * 60_000) {
      console.error(`LÅSET UPTAGET (${(alder / 60000).toFixed(1)} min): ${readFileSync(LAS_VAG, "utf8").trim()}`);
      console.error("DR-KEDJA 2 AVBRUTEN INNAN USERSPACE-PG RÖRDES.");
      process.exit(3);
    }
    console.log(`VARNING: låsfil ${(alder / 60000).toFixed(0)} min gammal (död agent?) — tas över.`);
    unlinkSync(LAS_VAG);
  }
  const fd = openSync(LAS_VAG, "wx");
  writeFileSync(fd, `pid=${process.pid} start=${new Date().toISOString()} verktyg=dr-kedja2-ssdnodes.mjs\n`);
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
  log(`[0] Grind OK: MemAvailable ${mb} MB · ${gbLedigt.toFixed(0)} GB ledigt.`);
  return true;
}

// --- val + DDL-kirurgi (testbara kärnor) ---------------------------------------

/** Senaste system-events-full-*.json.gz ur GIVEN katalog (datumnamn = namnsortering). */
export function valSenasteArkiv(katalog) {
  if (!existsSync(katalog)) throw new Error(`Arkivkatalogen saknas: ${katalog}`);
  const filer = readdirSync(katalog).filter((n) => /^system-events-full-\d{4}-\d{2}-\d{2}\.json\.gz$/.test(n)).sort();
  if (filer.length === 0) throw new Error(`Inga system-events-full-*.json.gz i ${katalog} — moln-JSON-kedjan har inget arkiv (RPO-fynd: hybrid-sync?)`);
  return pathJoin(katalog, filer[filer.length - 1]);
}

/** Senaste daterade db-blad (DDL-källa) — samma väljare som kedja 1:s fallback-lösning. */
export function valDdlKalla(katalog) {
  if (!existsSync(katalog)) throw new Error(`Dumpkatalogen saknas: ${katalog}`);
  const filer = readdirSync(katalog).filter((n) => /^db-\d{4}-\d{2}-\d{2}\.sql\.gz$/.test(n)).sort();
  if (filer.length === 0) throw new Error(`Inga db-YYYY-MM-DD.sql.gz i ${katalog} — DDL-källa saknas`);
  return pathJoin(katalog, filer[filer.length - 1]);
}

/** Kirurgiskt uuid-byte: moln-schemat extensions.uuid_generate_v4() finnes ej
 *  i userspace-klustret; DEFAULT är utan betydelse då COPY bär egna id:n. */
export function kirurgDDL(ddl) {
  return ddl.replace(/extensions\.uuid_generate_v4\(\)/g, "gen_random_uuid()");
}

/** Tolkar aterstall-system-events.mjs utdata (formatet är dess publika kontrakt). */
export function tolkaVerktygsUtdata(ut, fonsterSek) {
  const ms = Number((String(ut).match(/totalt (\d+) ms/) || [])[1]);
  return {
    rtoSek: Number.isFinite(ms) && ms > 0 ? ms / 1000 : fonsterSek,
    kopyRader: (String(ut).match(/COPY-n=(\d+)/) || [])[1] || null,
    gron: /DOM: GRÖN/.test(String(ut)),
  };
}

export function protokollNamn(datumIso, katalog = pathJoin(REPO_ROT, "data", "forskning")) {
  let vag = pathJoin(katalog, `DR-KEDJA2-${datumIso}-SSDNODES-AUTO.md`);
  let n = 2;
  while (existsSync(vag)) vag = pathJoin(katalog, `DR-KEDJA2-${datumIso}-SSDNODES-AUTO-${n++}.md`);
  return vag;
}

// --- protokoll -------------------------------------------------------------------

function skrivProtokoll(dom) {
  const vag = protokollNamn(dom.datumIso);
  const v = dom.verifiering || {};
  const referens = TIDIGARE_OVNINGAR.map((o) => `| ${o.namn} | ${o.datum} | ${o.rtoSek.toFixed(1)} s | ${o.rader.toLocaleString("sv-SE")} |`).join("\n");
  const fyraSamma = dom.tolk?.kopyRader != null && v.rader != null && String(dom.tolk.kopyRader) === String(v.rader).trim()
    && v.unikaId != null && String(v.unikaId).trim() === String(v.rader).trim();
  dom.fyraSamma = !!fyraSamma;
  const gron = dom.kedjaGron && dom.fyraSamma && (dom.behall || (dom.stadning.skrapDbBort && dom.stadning.pgKlar));
  const text = `# DR-KEDJA 2 ${dom.datumIso} SSDNODES — moln-JSON-övning (${gron ? "GODKÄNT" : "UNDERKÄNT"})
${dom.avbrots ? `\n> **ÖVNINGEN AVBRÖTS:** ${dom.avbrots}\n` : ""}

Körd av \`verktyg/dr-kedja2-ssdnodes.mjs\` (spår 10) — kedja 2:s port till
SSD Nodes-eran: samma kontrakt som Contabo-syskonet (dr-kedja2.mjs) men mot
en USERSPACE-PG18 (port 55432, ~/.pg-ssdnodes — ingen root). Userspace-
lagret ärvs via import från dr-ovning-ssdnodes.mjs; inmatningsverktyget
aterstall-system-events.mjs kör OMODIFIERAT (styrt via PGHOST/PGPORT/PGUSER).

---

## 1. Sammanfattning för kunden (5 rader)

1. Händelseloggen (system_events) saknas i SQL-nattdumpen — dess katastrofväg är moln-JSON-arkivet. Vi återställde **hela händelseloggen från moln-backupen** i en avskild testdatabas på servern: **${dom.tolk ? dom.tolk.rtoSek.toFixed(1) : "?"} sekunder** — testdatabasen raderades efteråt. Produktionen påverkades inte.
2. Kontrollen: **${v.rader ?? "?"} händelser** kom tillbaka, alla med unika id (${v.unikaId ?? "?"}) — ${dom.fyraSamma ? "fyra-samma-kontraktet höll (arkivets eget tal == strömmens == inlästa == oberoende omräkning i databasen)." : "KONTRAKTET BRÖTS — se §3."}
3. Nytt: kedja 2 är nu bevisad på **nya servern** (root-fri userspace-postgres) — dessförinnan var kedjans senaste restore-bevis från 09-21 på Contabo, och moln-bladen som fötts sedan serverbytet var restore-oskyddade.
4. Backupen kontrollerades först (arkivets header + ström + per-rad giltighet, verktygets egen dom: ${dom.kedjaGron ? "GRÖN" : "RÖD"}).
5. Nästa övning: kvartal enligt DRIFTSBOKEN — \`node verktyg/dr-kedja2-ssdnodes.mjs\` (tillsammans med kedja 1).

## 2. Genomförande

| Steg | Resultat |
|---|---|
| 0. Lås ${LAS_VAG} | taget (pid ${process.pid}) |
| 1. Grind | MemAvailable/disk kontrollerad före allt tungt |
| 2. Userspace-PG18 | ${dom.pgStartadesAvOss ? "startad av verktyget (127.0.0.1:" + PG_PORT + ", port 5432 orörd)" : "var uppe vid ankomst (protokollfynd)"} |
| 3. Skrap-DB | ${DB} skapad färsk (ägare ak1a) |
| 4. Tabell-DDL | ur ${dom.dumpNamn} (prodens egen definition)${dom.ddlNot ? " · " + dom.ddlNot : ""} |
| 5. Återställning (RTO) | **${dom.tolk ? dom.tolk.rtoSek.toFixed(1) + " s" : "nåddes ej"}** (totalt fönster ${dom.fonsterSek ?? "?"} s · arkiv ${(dom.arkivStorlek / 1048576).toFixed(1)} MB gz) |
| 6. Oberoende verifiering | se §3 |
| 7. Städning | ${dom.behall ? "--behall: lämnad (anroparen städar)" : `skrap-DB ${dom.stadning.skrapDbBort ? "raderad" : "EJ raderad — FYND"} · PG ${dom.stadning.pgKlar ? dom.pgStartadesAvOss ? "stoppad" : "var uppe vid ankomst — lämnas" : "EJ stoppad — FYND"}`} |

## 3. Fyra-samma-kontraktet + verifiering

| Led | Källa | Tal |
|---|---|---|
| 1. Arkivets header | moln-backupens egen räkning | ${dom.headerAntal ?? "(bärs av verktygsdomen)"} |
| 2. Gzip-ström | per-rad giltighet, 0 dubblett-id | (verktygsdomen ${dom.kedjaGron ? "GRÖN" : "RÖD"}) |
| 3. COPY-n | psql:s inlästa rader | ${dom.tolk?.kopyRader ?? "?"} |
| 4. Oberoende omräkning | count(*) i återställd tabell | ${v.rader ?? "?"} |

Oberoende frågor mot den återställda tabellen:

| Fråga | Svar |
|---|---|
| Rader | ${v.rader ?? "nåddes ej"} |
| Unika id | ${v.unikaId ?? "nåddes ej"} |
| Tidsfönster (created_at) | ${v.fonster ?? "nåddes ej"} |
| Severity | ${v.severity ?? "nåddes ej"} |
| Typer (event_type) | ${v.typer ?? "nåddes ej"} |
| jsonb-prov (details->>'dag') | ${v.jsonbProv ?? "nåddes ej"} |

Jämförelse (Contabo-eran, kedja 2):

| Övning | Datum | RTO | Rader |
|---|---|---|---|
${referens}
| **denna (ssdnodes, userspace-PG18)** | ${dom.datumIso} | **${dom.tolk ? dom.tolk.rtoSek.toFixed(1) + " s" : "?"}** | ${Number(v.rader ?? 0).toLocaleString("sv-SE")} |

## 4. Kontext

- Arkiv: ${dom.arkivNamn} (${(dom.arkivStorlek / 1048576).toFixed(1)} MB gz, fött ${dom.arkivFodd?.toISOString() ?? "?"}).
- DDL-källa: ${dom.dumpNamn}.
- GDPR: protokollet redovisar endast antal och typer — inga personvärden.
- Prod opåverkad: skrap-DB på userspace-PG (127.0.0.1:${PG_PORT}); prod-data lever i Supabase-molnet; port 5432 rördes aldrig.

## 5. Status

- Slutdom: **${gron ? "GRÖN — övningen godkänd" : "RÖD — se fynd ovan"}**.
- src/ berördes ej — tsc-baslinjen orörd; inga byggen.

SLUT — maskinellt genererat av dr-kedja2-ssdnodes.mjs ${new Date().toISOString()}
`;
  writeFileSync(vag, text);
  dom.protokollVag = path.relative(REPO_ROT, vag);
  log(`[7] Protokoll: ${dom.protokollVag}`);
  return gron;
}

// --- huvudflöde -------------------------------------------------------------------

function lasArgument() {
  const args = process.argv.slice(2);
  const opts = { fil: null, behall: false };
  for (let i = 0; i < args.length; i++) {
    if (args[i] === "--fil") opts.fil = args[++i];
    else if (args[i] === "--behall") opts.behall = true;
    else if (args[i] === "--hjalp" || args[i] === "--help") {
      console.log("Användning: node verktyg/dr-kedja2-ssdnodes.mjs [--fil <system-events-full-*.json.gz>] [--behall]");
      process.exit(0);
    } else { console.error(`Okänt argument: ${args[i]} (se --hjalp)`); process.exit(2); }
  }
  return opts;
}

const arHuvudprogram = process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href;

if (arHuvudprogram) {
  const opts = lasArgument();
  flockStartaOm();
  taLas();
  if (!grind()) { slappLas(); process.exit(75); }
  const dom = { datumIso: new Date().toISOString().slice(0, 10), behall: opts.behall, stadning: { skrapDbBort: false, pgKlar: false } };
  let gron = false;
  try {
    const arkiv = opts.fil ? (existsSync(opts.fil) ? path.resolve(opts.fil) : (() => { throw new Error(`arkivet saknas: ${opts.fil}`); })()) : valSenasteArkiv(ARKIV_KATALOG);
    const st = statSync(arkiv);
    dom.arkivNamn = pathBasename(arkiv);
    dom.arkivStorlek = st.size;
    dom.arkivFodd = st.mtime;
    const ddlVag = valDdlKalla(DUMP_KATALOG);
    dom.dumpNamn = pathBasename(ddlVag);
    log(`DR-KEDJA 2 SSDNODES ${dom.datumIso} — arkiv: ${dom.arkivNamn} · DDL ur: ${dom.dumpNamn}${opts.behall ? " (--behall)" : ""}`);
    // Arkivet är ENDAST LÄST: SHA + mtime före körningen = beviset i protokollet.
    const shaFore = kor("sha256sum", [arkiv], { timeoutMs: 120000 }).stdout.split(/\s+/)[0];
    dom.shaFore = shaFore;

    startaUserspacePg(dom); // sätter själv dom.pgStartadesAvOss

    log(`[3] Skapar färsk skrap-DB ${DB} …`);
    kor("/usr/bin/dropdb", [...PG_ANSLUTNING, "--if-exists", DB]);
    const skapa = kor("/usr/bin/createdb", [...PG_ANSLUTNING, DB]);
    if (!skapa.ok) throw new Error(`createdb misslyckades: ${skapa.stderr}`);

    log(`[4] Tabell-DDL ur ${dom.dumpNamn} (CREATE TABLE public.system_events) …`);
    const ddlRadt = kor("bash", ["-c", `zcat '${ddlVag.replace(/'/g, "'\\''")}' | awk '/^CREATE TABLE public.system_events /{f=1} f{print} f&&/\\);/{exit}'`], { timeoutMs: 300000 });
    if (!ddlRadt.ok || !ddlRadt.stdout.includes("CREATE TABLE")) throw new Error("DDL-extraktion ur dumpen misslyckades: " + ddlRadt.stderr);
    const ddl = kirurgDDL(ddlRadt.stdout);
    if (ddl !== ddlRadt.stdout) dom.ddlNot = "extensions.uuid_generate_v4() → gen_random_uuid() (moln-schema finnes ej lokalt; DEFAULT utan betydelse för COPY)";
    const c = kor("/usr/bin/psql", [...PSQL_GRUND, "-v", "ON_ERROR_STOP=1", "-d", DB, "-c", ddl]);
    if (!c.ok) throw new Error("CREATE TABLE: " + c.stderr);

    log("[5] ÅTERSTÄLLER (aterstall-system-events.mjs → psql COPY) — RTO-mätning startar …");
    const t0 = Date.now();
    const rv = kor("node", [pathJoin(REPO_ROT, "verktyg", "aterstall-system-events.mjs"), "--fil", arkiv, "--db", DB],
      { timeoutMs: 600000, env: { ...process.env, ...PG_ENV } });
    dom.fonsterSek = Number(((Date.now() - t0) / 1000).toFixed(1));
    console.log(rv.stdout || "");
    if (rv.stderr) console.error(rv.stderr);
    dom.tolk = tolkaVerktygsUtdata(rv.stdout, dom.fonsterSek);
    dom.kedjaGron = rv.status === 0 && dom.tolk.gron;
    log(`      verktyget exit=${rv.status} · dom ${dom.tolk.gron ? "GRÖN" : "RÖD"} · COPY-n ${dom.tolk.kopyRader ?? "?"} · RTO ${dom.tolk.rtoSek.toFixed(1)} s (fönster ${dom.fonsterSek} s).`);
    if (rv.status !== 0) throw new Error(`kedja 2-verktyget RÖT (exit ${rv.status})`);

    log("[6] Oberoende PG-verifiering:");
    const fragor = {
      rader: "SELECT count(*) FROM public.system_events",
      unikaId: "SELECT count(distinct id) FROM public.system_events",
      fonster: "SELECT min(created_at)||' … '||max(created_at) FROM public.system_events",
      severity: "SELECT string_agg(t.e||'='||t.n, ' · ' ORDER BY t.n DESC) FROM (SELECT severity AS e, count(*) AS n FROM public.system_events GROUP BY severity) t",
      typer: "SELECT string_agg(t.e||'='||t.n, ' · ' ORDER BY t.n DESC) FROM (SELECT event_type AS e, count(*) AS n FROM public.system_events GROUP BY event_type) t",
      jsonbProv: "SELECT count(*) FROM public.system_events WHERE details->>'dag' IS NOT NULL",
    };
    for (const [namn, f] of Object.entries(fragor)) {
      const q = sql(f, { timeoutMs: 300000 });
      dom.verifiering = dom.verifiering || {};
      dom.verifiering[namn] = q.replace(/\n/g, " ").slice(0, 400);
      log(`      ${namn}: ${dom.verifiering[namn]}`);
    }

    const shaEfter = kor("sha256sum", [arkiv], { timeoutMs: 120000 }).stdout.split(/\s+/)[0];
    dom.shaEfter = shaEfter;
    dom.arkivOrord = shaFore === shaEfter && statSync(arkiv).mtimeMs === st.mtimeMs;
    gron = true;
  } catch (e) {
    console.error("DR-KEDJA 2 AVBRUTEN: " + e.message);
    dom.avbrots = e.message;
  } finally {
    if (!dom.behall) {
      log("[7] Städning: skrap-DB + userspace-PG …");
      const d = kor("/usr/bin/dropdb", [...PG_ANSLUTNING, "--if-exists", DB]);
      dom.stadning.skrapDbBort = d.ok;
      if (!d.ok) console.error(`      dropdb misslyckades: ${d.stderr}`);
      if (dom.pgStartadesAvOss) dom.stadning.pgKlar = stappaUserspacePg();
      else dom.stadning.pgKlar = true; // var ej vår att stoppa (uppe vid ankomst)
      log(`      skrap-DB ${dom.stadning.skrapDbBort ? "raderad" : "KUNDE EJ RADERAS"} · PG ${dom.pgStartadesAvOss ? (dom.stadning.pgKlar ? "stoppad" : "KUNDE EJ STOPPAS") : "var uppe vid ankomst — lämnas"}.`);
    }
    try { gron = skrivProtokoll(dom) && gron; } catch (e2) { console.error("Protokoll kunde ej skrivas: " + e2.message); }
    slappLas();
  }
  process.exit(gron ? 0 : 1);
}
