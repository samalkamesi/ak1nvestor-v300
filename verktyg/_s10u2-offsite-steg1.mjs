#!/usr/bin/env node
// _s10u2-offsite-steg1.mjs — s10-u2 OFFSITE-DR: inventering + extraktion + integritet
// Engångsinstrument (fabrikskonvention _-prefix); all utdata till /tmp-filer, ALDRIG stdout-pipe.
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

const ROT = "/home/ak1a/AK1";
const ARKIV = path.join(ROT, "data/backups/offsite/ak1a-offsite-2026-09-19.tar.gz.tar.gz");
const SKRAP = "/tmp/s10u2-offsite-aterstallning";
const UT = "/tmp/s10u2-offsite-steg1-utdata.txt";
const linjer = [];
const logga = (s) => { linjer.push(s); fs.appendFileSync(UT, s + "\n"); };
try { fs.unlinkSync(UT); } catch { /* */ }
const t0 = Date.now();
logga(`STEG1 START ${new Date().toISOString()}`);

// --- A. Arkivinventering (tar -tvz, ALDRIG extrahering ännu) ---
let lista = "";
try {
  lista = execFileSync("tar", ["-tvzf", ARKIV], { timeout: 300_000, maxBuffer: 64 * 1024 * 1024, encoding: "utf8" });
  fs.writeFileSync("/tmp/s10u2-offsite-tarlista.txt", lista);
  logga(`A. tar-lista OK ${lista.length} tecken, ${lista.split("\n").filter(Boolean).length} rader`);
} catch (e) {
  logga(`A. tar-lista FEL: ${String(e).slice(0, 200)}`);
  process.exit(1);
}

// Delkontroll mot verktygets `delar` (10 kontrakterade)
const rader = lista.split("\n").filter(Boolean);
const namn = rader.map((r) => r.split(/\s+/).slice(-1)[0]);
const forvantade = [
  "data/vakten/huvudtrad.json", "data/vakten/mal-state.json", "data/vakten/trad-kontext.json",
  "data/vakten/audit-logg.jsonl", "data/vakten/uppdragslogg.jsonl", "data/vakten/juridik-larm.json",
  "data/forskning/", "data/blogg-utkast/", "data/kurser-tillagg/", "data/backups/db-snapshot.sqlite",
];
for (const f of forvantade) {
  logga(`A. del ${f}: ${namn.some((n) => n === f || n.startsWith(f)) ? "FINNS" : "SAKNAS"}`);
}

// Säkerhetsscan: inga hemligheter i arkivet
const farliga = namn.filter((n) => /(^|\/)(\.env|id_ed25519|id_rsa|\.pgpass|authorized_keys|.*\.pem)(\.|$)/.test(n));
logga(`A. säkerhetsscan: ${farliga.length} träffar på hemlighetliknande namn${farliga.length ? ": " + farliga.join(", ") : " (REN)"}`);

// Storlekstopp + total okomprimerad storlek
let totB = 0;
for (const r of rader) {
  const m = r.match(/^(\S+)\s+(\S+)\s+(\d+)\s+/);
  if (m) totB += Number(m[3]);
}
const dbRad = rader.find((r) => r.includes("db-snapshot.sqlite"));
logga(`A. total okomprimerad: ${(totB / 1024 / 1024).toFixed(1)} MB; db-snapshot-rad: ${dbRad}`);

// --- B. Extraktion till skrap-yta med RTO-mätning ---
fs.rmSync(SKRAP, { recursive: true, force: true });
fs.mkdirSync(SKRAP, { recursive: true });
const tExtr0 = Date.now();
try {
  execFileSync("tar", ["-xzf", ARKIV, "-C", SKRAP], { timeout: 590_000 });
  const rtoExtr = (Date.now() - tExtr0) / 1000;
  logga(`B. extraktion OK RTO ${rtoExtr.toFixed(1)} s`);
} catch (e) {
  logga(`B. extraktion FEL efter ${(Date.now() - tExtr0) / 1000}s: ${String(e).slice(0, 200)}`);
  process.exit(1);
}

// --- C. Den ÅTERSTÄLLDA db-snapshot.sqlite: integritet + radräkningar ---
const aterstallDb = path.join(SKRAP, "data/backups/db-snapshot.sqlite");
const statDb = fs.statSync(aterstallDb);
logga(`C. återställd db-snapshot.sqlite: ${statDb.size} B`);
const tInt0 = Date.now();
// python3 kan sqlite3 inbyggt; läsande öppning av SKRAP-KOPIAN (levande DB rörs aldrig)
const py = `
import sqlite3, sys, json
db = sqlite3.connect("file:${aterstallDb}?mode=ro", uri=True)
cur = db.cursor()
integ = cur.execute("PRAGMA integrity_check").fetchall()
taber = [r[0] for r in cur.execute("SELECT name FROM sqlite_master WHERE type='table' ORDER BY name").fetchall()]
out = {"integrity": [r[0] for r in integ], "tabeller": len(taber), "rakning": {}}
KANDIDATER = ["sessions", "session", "messages", "message", "threads", "thread", "conversations", "kv", "meta"]
for t in taber:
    try:
        out["rakning"][t] = cur.execute(f'SELECT COUNT(*) FROM "{t}"').fetchone()[0]
    except Exception as e:
        out["rakning"][t] = f"FEL {str(e)[:40]}"
print(json.dumps(out))
`;
try {
  const pyUt = execFileSync("python3", ["-c", py], { timeout: 590_000, maxBuffer: 16 * 1024 * 1024, encoding: "utf8" });
  logga(`C. integritet+räkning OK på ${(Date.now() - tInt0) / 1000 .toFixed(0)} s: ${pyUt.slice(0, 3000)}`);
} catch (e) {
  logga(`C. integritet FEL: ${String(e).slice(0, 300)}`);
}

// --- D. Radjämförelser mot levande ytor (arkiv ≤ levande väntat, snapshot 18:52Z) ---
const jamfor = [
  ["data/vakten/huvudtrad.json", (s) => `${s.length} tecken`],
  ["data/vakten/audit-logg.jsonl", (s) => `${s.split("\n").filter(Boolean).length} rader`],
  ["data/vakten/uppdragslogg.jsonl", (s) => `${s.split("\n").filter(Boolean).length} rader`],
  ["data/vakten/mal-state.json", (s) => `${s.length} tecken`],
];
for (const [rel, mata] of jamfor) {
  try {
    const ark = mata(fs.readFileSync(path.join(SKRAP, rel), "utf8"));
    const lev = mata(fs.readFileSync(path.join(ROT, rel), "utf8"));
    logga(`D. ${rel}: arkiv=${ark} | levande=${lev}`);
  } catch (e) {
    logga(`D. ${rel}: FEL ${String(e).slice(0, 120)}`);
  }
}
// forskning/blogg-utkast/kurser-tillagg: filantal arkiv vs levande
for (const kat of ["data/forskning", "data/blogg-utkast", "data/kurser-tillagg"]) {
  const rakna = (rot) => {
    let n = 0;
    const stack = [path.join(rot, kat)];
    while (stack.length) {
      const d = stack.pop();
      for (const f of fs.readdirSync(d)) {
        const p = path.join(d, f);
        if (fs.statSync(p).isDirectory()) stack.push(p); else n++;
      }
    }
    return n;
  };
  try { logga(`D. ${kat}: arkiv=${rakna(SKRAP)} | levande=${rakna(ROT)} filer`); }
  catch (e) { logga(`D. ${kat}: FEL ${String(e).slice(0, 120)}`); }
}
logga(`STEG1 SLUT ${((Date.now() - t0) / 1000).toFixed(1)} s totalt`);
console.log("STEG1 KLAR — utdata i " + UT);
