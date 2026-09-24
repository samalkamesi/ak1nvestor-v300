#!/usr/bin/env node
// _s10u2-offsite-steg2.mjs — s10-u2 OFFSITE-DR steg 2: push-diagnos + byte-paritet + PG-viloläge
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

const ROT = "/home/ak1a/AK1";
const UT = "/tmp/s10u2-offsite-steg2-utdata.txt";
const linjer = [];
const logga = (s) => { linjer.push(s); fs.appendFileSync(UT, s + "\n"); };
try { fs.unlinkSync(UT); } catch { /* */ }
logga(`STEG2 START ${new Date().toISOString()}`);

// --- E. GitHub-push-diagnos (ENDAST läsande: ls-remote, ingen push, nycklar orörda) ---
try {
  const t0 = Date.now();
  const ut = execFileSync("git", ["ls-remote", "--heads", "origin", "develop"], {
    cwd: ROT, timeout: 30_000, encoding: "utf8", stderr: "pipe",
  });
  logga(`E. ls-remote OK på ${Date.now() - t0} ms: ${ut.trim().slice(0, 120)}`);
} catch (e) {
  const stderr = e.stderr ? String(e.stderr).slice(0, 400) : "";
  const status = e.status !== undefined ? `exit ${e.status}` : e.code || "timeout?";
  logga(`E. ls-remote FEL (${status}): ${stderr || String(e.message).slice(0, 200)}`);
}
// Lokalt känt fjärr-läge (senaste fetch) för referens
try {
  const lok = execFileSync("git", ["rev-parse", "origin/develop"], { cwd: ROT, encoding: "utf8" });
  logga(`E. lokal origin/develop-referens: ${lok.trim()}`);
} catch (e) { logga(`E. ingen lokal origin/develop-referens`); }

// --- F. Byte-paritet: arkivets db-snapshot == serverns snapshot-kopia? ---
const tCmp0 = Date.now();
try {
  execFileSync("cmp", ["-s",
    "/tmp/s10u2-offsite-aterstallning/data/backups/db-snapshot.sqlite",
    path.join(ROT, "data/backups/db-snapshot.sqlite")], { timeout: 300_000 });
  logga(`F. cmp arkiv-DB == server-snapshot: IDENTISKA (${(Date.now() - tCmp0) / 1000}s)`);
} catch (e) {
  logga(`F. cmp SKILJER eller fel (${(Date.now() - tCmp0) / 1000}s): ${String(e.status ?? e.message).slice(0, 120)}`);
}
// sha256 av arkivet (integritetsattest för protokollet)
try {
  const h = execFileSync("sha256sum", ["data/backups/offsite/ak1a-offsite-2026-09-19.tar.gz.tar.gz"],
    { cwd: ROT, timeout: 300_000, encoding: "utf8" });
  logga(`F. sha256(arkiv): ${h.trim()}`);
} catch (e) { logga(`F. sha256 FEL: ${String(e.message).slice(0, 120)}`); }

// --- G. PG-viloläge-bevis (P7): övningen rör ALDRIG PG ---
try {
  const ls = execFileSync("pg_lsclusters", { encoding: "utf8" }).trim();
  logga(`G. pg_lsclusters: ${ls.replace(/\n/g, " | ")}`);
} catch (e) { logga(`G. pg_lsclusters FEL: ${String(e.message).slice(0, 120)}`); }
try {
  execFileSync("psql", ["-h", "/var/run/postgresql", "-U", "postgres", "-c", "SELECT 1"], { timeout: 10_000 });
  logga(`G. psql svarar — PG UPP (OVÄNTAT)`);
} catch (e) {
  logga(`G. psql kopplingsvägran = skrap-DB frånvaro/viloläge: ${String(e.message).split("\n")[0].slice(0, 100)}`);
}
logga(`STEG2 SLUT ${new Date().toISOString()}`);
console.log("STEG2 KLAR — utdata i " + UT);
