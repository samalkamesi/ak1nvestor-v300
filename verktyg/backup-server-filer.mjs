/**
 * BACKUP SERVER-FILER — kopierar serverns repo + .env till datorns
 * backup-valv (data/backups/ — lokalt + gitignorat; kundens egen maskin).
 *
 * (1) tar-cz över ssh av /home/ak1a/AK1 UTAN node_modules/.next →
 *     data/backups/server-repo-<datum>.tar.gz (streamad, vakt max 500 MB).
 * (2) /home/ak1a/AK1/.env → data/backups/server-env-backup (chmod 600 lokalt).
 *
 * Mimosa-kontraktet: fasta literaler för värd/katalog/fjärrkommando (inga
 * sökvägar ur variabler), BatchMode (aldrig interaktiv prompt), nycklar och
 * .env-innehåll loggas ALDRIG — bara byte-antal och status.
 *
 * Idempotent: omkörning samma dag skriver om samma filer. Ärliga fel:
 * trasiga/partiella filer raderas, exit-kod 1 vid hårt fel.
 *
 * Användning: node verktyg/backup-server-filer.mjs   (körs av hybrid-sync)
 */
import { spawn, spawnSync } from "node:child_process";
import { chmodSync, closeSync, existsSync, mkdirSync, openSync, renameSync, rmSync, writeFileSync, writeSync } from "node:fs";
import os from "node:os";
import path from "node:path";

const NYCKELFIL = path.join(os.homedir(), ".ssh", "hetzner_key");
const DATUM = new Date().toISOString().slice(0, 10);
const MAX_BYTE_TAR = 500 * 1024 * 1024; // 500 MB-vakten

// Fasta literaler — Mimosa-kontraktet (ändras endast här, aldrig via variabler)
const SSH_MAL = "ak1a@5.189.162.162";
const KOMMANDO_TAR = "tar czf - -C /home/ak1a/AK1 --exclude=node_modules --exclude=.next .";
const KOMMANDO_ENV = "cat /home/ak1a/AK1/.env";

if (!existsSync(NYCKELFIL)) {
  console.log("backup-server-filer " + DATUM + ": ssh-nyckel saknas (" + NYCKELFIL + ") — hoppar");
  process.exit(0);
}
try {
  chmodSync(NYCKELFIL, 0o600); // ssh vägrar nycklar med öppna rättigheter
} catch {}
mkdirSync("data/backups", { recursive: true });

const grundFlaggor = ["-i", NYCKELFIL, "-o", "BatchMode=yes", "-o", "ConnectTimeout=15"];

/** (1) Streama tar-cz från servern till lokal fil med storleksvakt. */
function hamtaServerRepo() {
  return new Promise((redig) => {
    const malFil = path.join("data/backups", "server-repo-" + DATUM + ".tar.gz");
    const tmpFil = malFil + ".del";
    rmSync(tmpFil, { force: true });

    const barn = spawn("ssh", [...grundFlaggor, SSH_MAL, KOMMANDO_TAR], { windowsHide: true });
    const fd = openSync(tmpFil, "w");
    let byte = 0;
    let forStort = false;
    let felText = "";
    barn.stdout.on("data", (b) => {
      if (forStort) return;
      byte += b.length;
      if (byte > MAX_BYTE_TAR) {
        forStort = true;
        barn.kill("SIGKILL");
        return;
      }
      writeSync(fd, b);
    });
    barn.stderr.on("data", (b) => {
      if (felText.length < 300) felText += b.toString(); // ssh/tar-feltext, aldrig data
    });
    barn.on("error", (e) => {
      felText = (felText + " " + (e?.message ?? String(e))).slice(0, 300);
    });
    barn.on("close", (kod) => {
      closeSync(fd);
      if (forStort) {
        rmSync(tmpFil, { force: true }); // ärligt: aldrig behålla trunkerad tar
        redig("server-repo: FEL överstiger " + (MAX_BYTE_TAR / 1048576) + " MB-gränsen (" +
          (byte / 1048576).toFixed(0) + " MB mottaget) — partiell fil raderad");
        return;
      }
      if (kod !== 0) {
        rmSync(tmpFil, { force: true });
        redig("server-repo: FEL ssh avslutades med kod " + kod + (felText.trim() ? " — " + felText.trim().split("\n")[0].slice(0, 120) : ""));
        return;
      }
      if (byte === 0) {
        rmSync(tmpFil, { force: true });
        redig("server-repo: FEL 0 byte mottaget (tom ström) — kontrollera ssh/mål");
        return;
      }
      renameSync(tmpFil, malFil);
      redig("server-repo: OK " + (byte / 1048576).toFixed(1) + " MB → " + malFil);
    });
  });
}

/** (2) Hämta .env — stdout är hemligheten: loggas ALDRIG, bara byte-antal. */
function hamtaServerEnv() {
  const malFil = path.join("data/backups", "server-env-backup");
  const r = spawnSync("ssh", [...grundFlaggor, SSH_MAL, KOMMANDO_ENV], {
    encoding: "buffer", maxBuffer: 4 * 1024 * 1024, timeout: 30000, windowsHide: true,
  });
  if (r.error) return "server-env: FEL " + (r.error.message ?? String(r.error)).slice(0, 80);
  if (r.status !== 0) {
    const t = (r.stderr ? r.stderr.toString() : "").trim().split("\n")[0].slice(0, 120);
    return "server-env: FEL ssh avslutades med kod " + r.status + (t ? " — " + t : "");
  }
  const innehall = r.stdout;
  if (!innehall || innehall.length === 0) return "server-env: FEL 0 byte (finns .env på servern?)";
  // Idempotens på Windows: chmod 600 gör filen skrivskyddad — öppna innan omkörning.
  try { chmodSync(malFil, 0o666); } catch {}
  try { rmSync(malFil, { force: true }); } catch {}
  try {
    writeFileSync(malFil, innehall);
  } catch (e) {
    return "server-env: FEL kunde ej skriva " + malFil + " — " + (e?.message ?? String(e)).slice(0, 60);
  }
  try { chmodSync(malFil, 0o600); } catch {} // endast ägaren läser/skriver
  return "server-env: OK " + innehall.length + " byte → " + malFil + " (chmod 600)";
}

const resultat = [];
resultat.push(await hamtaServerRepo());
resultat.push(hamtaServerEnv());

const misslyckades = resultat.some(r => r.includes(": FEL"));
console.log("backup-server-filer " + DATUM + ":\n  " + resultat.join("\n  "));
process.exit(misslyckades ? 1 : 0);
