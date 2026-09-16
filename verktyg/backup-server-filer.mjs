/**
 * BACKUP SERVER-FILER — kopierar serverns repo + .env till datorns
 * backup-valv (data/backups/ — lokalt + gitignorat; kundens egen maskin).
 *
 * (1) tar-cz över ssh av /home/ak1a/AK1 (exkluderingslista nedan) →
 *     data/backups/server-repo-<datum>.tar.gz (streamad, vakt max 500 MB,
 *     gzip-integritetsverifierad FÖRE filen godtas).
 * (2) /home/ak1a/AK1/.env → data/backups/server-env-backup (chmod 600 lokalt).
 *
 * Mimosa-kontraktet: fasta literaler för värd/katalog/fjärrkommando (inga
 * sökvägar ur variabler), BatchMode (aldrig interaktiv prompt), nycklar och
 * .env-innehåll loggas ALDRIG — bara byte-antal och status.
 *
 * Idempotent: omkörning samma dag skriver om samma filer. Ärliga fel:
 * trasiga/partiella filer raderas, exit-kod 1 vid hårt fel.
 *
 * s10-u3 2026-09-16 (DR-PROV-2026-09-16-KEDJA3.md): tre kurer efter att
 * 09-09-arkivet visade sig KORRUPT (bruten gzip, oupptäckt i 7 dygn) —
 * contabo_key-rättning, gzip-integritetskoll före godkännande, härdad
 * exkluderingslista.
 *
 * Användning: node verktyg/backup-server-filer.mjs   (körs av hybrid-sync)
 */
import { spawn, spawnSync } from "node:child_process";
import { chmodSync, closeSync, createReadStream, existsSync, mkdirSync, openSync, renameSync, rmSync, writeFileSync, writeSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import { pipeline } from "node:stream/promises";
import { Writable } from "node:stream";
import { createGunzip } from "node:zlib";

// s10-u3 2026-09-16: hetzner_key → contabo_key — Contabo-flyttningen lämnade
// verktyget på den gamla leverantörens nyckelnamn; .cmd-steget kontrollerar
// contabo_key, verktyget letade hetzner_key ⇒ tar+env-steget har hopats
// tyst sedan 2026-09-09 (bevis: hybrid-sync.log sista körningen).
const NYCKELFIL = path.join(os.homedir(), ".ssh", "contabo_key");
const DATUM = new Date().toISOString().slice(0, 10);
const MAX_BYTE_TAR = 500 * 1024 * 1024; // 500 MB-vakten

// Fasta literaler — Mimosa-kontraktet (ändras endast här, aldrig via variabler)
const SSH_MAL = "ak1a@5.189.162.162";
// s10-u3 2026-09-16: exkluderingslistan härdad mot bevisade problem —
// .git (502 MB, växer okontrollerat; historiken täcks av git-spegeln/bundle —
// med .git passerade arkivet 500 MB-vakten), tool-results (tempfiler),
// data/cache (rörlig), data/backups (annars hamnar 500 MB gamla arkiv
// inuti det nya). Kontrakt bevisat i DR-PROV-2026-09-16-KEDJA3.md.
const KOMMANDO_TAR = "tar czf - -C /home/ak1a/AK1 --exclude=node_modules --exclude=.next --exclude=.git --exclude=tool-results --exclude=data/cache --exclude=data/backups .";
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

/**
 * s10-u3 2026-09-16: gzip-integritetsbevis FÖRE arkivet godtas. Beviset som
 * fattades: 09-09-arkivet lämnade ssh-exit 0 och full storlek men bar en
 * bruten gzip-ström ("invalid compressed data") — upptäcktes först 7 dagar
 * senare vid restore-provet. Strömmande zlib-koll (konstant minne, portabel
 * — inget gzip-binär-krav på Windows); exit-kod + storlek bevisar inte strömmen.
 */
async function gzipIntakt(fil) {
  const sluk = new Writable({ write(_post, _kod, klar) { klar(); } });
  try {
    await pipeline(createReadStream(fil), createGunzip(), sluk);
    return true;
  } catch {
    return false;
  }
}

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
    barn.on("close", async (kod) => {
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
      if (!(await gzipIntakt(tmpFil))) {
        rmSync(tmpFil, { force: true }); // ärligt: trasig ström blir ALDRIG arkiv (09-09-fallet)
        redig("server-repo: FEL gzip-integriteten underkänd på " + (byte / 1048576).toFixed(0) +
          " MB — mottagen ström är trasig/partiell, filen raderad");
        return;
      }
      renameSync(tmpFil, malFil);
      redig("server-repo: OK " + (byte / 1048576).toFixed(1) + " MB (gzip verifierad) → " + malFil);
    });
  });
}

/** (2) Hämta .env — stdout är hemligheten: loggas ALDRIG, bara byte-antal. */
function hamtaServerEnv() {
  const malFil = "data/backups/server-env-backup";
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
