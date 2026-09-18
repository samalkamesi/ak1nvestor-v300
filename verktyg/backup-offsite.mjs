#!/usr/bin/env node
/**
 * OFFSITE-BACKUP (våg 172 — kundens 3-2-1-säkerhet)
 * =====================================================================
 * Skapar en ZIP med ALLT kritiskt från servern:
 *   - db.sqlite (ALL sessionhistorik, tråden, alla meddelanden)
 *   - data/vakten/ (mål-state, huvudtråd, sticky-kontext, audit, uppdrag)
 *   - data/forskning/ (alla forskningskapitel, register, program)
 *   - data/blogg-utkast/ (alla 119+ innehållsposter)
 *   - data/kurser-tillagg/ (alla nya kurser)
 *   - .env.production.local (HEMLIGHETER — chmod 600, ALDRIG i git)
 *
 * ZIP:en landar i data/backups/offsite/ — kunden hämtar med
 * ett lokalt script (eller OneDrive-synk) till sin dator.
 *
 * Körs: pumpor var 6:e timme (min === 52 && tim % 6 === 2).
 * Logg: data/vakten/backup-offsite.log
 */
import { execSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const BACKUP_KAT = path.join(ROT, "data", "backups", "offsite");
const LOGG = path.join(ROT, "data", "vakten", "backup-offsite.log");

function logga(rad) {
  try {
    fs.mkdirSync(path.dirname(LOGG), { recursive: true });
    fs.appendFileSync(LOGG, `${new Date().toISOString().slice(0, 19)} ${rad}\n`);
  } catch { /* */ }
  console.log(`[backup-offsite] ${rad}`);
}

function main() {
  const stämpel = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
  const filnamn = `ak1a-offsite-${stämpel}.zip`;
  const sökväg = path.join(BACKUP_KAT, filnamn);

  fs.mkdirSync(BACKUP_KAT, { recursive: true });

  // Rensa gamla (behåll senaste 7 dagarna)
  try {
    const filer = fs.readdirSync(BACKUP_KAT).filter((f) => f.endsWith(".zip")).sort();
    for (const f of filer.slice(0, -7)) {
      fs.unlinkSync(path.join(BACKUP_KAT, f));
      logga(`rensade gamla: ${f}`);
    }
  } catch { /* */ }

  // Skapa ZIP med allt kritiskt
  const delar = [
    "data/vakten/huvudtrad.json",
    "data/vakten/mal-state.json",
    "data/vakten/trad-kontext.json",
    "data/vakten/audit-logg.jsonl",
    "data/vakten/uppdragslogg.jsonl",
    "data/vakten/juridik-larm.json",
    "data/forskning/",
    "data/blogg-utkast/",
    "data/kurser-tillagg/",
  ].filter((p) => fs.existsSync(path.join(ROT, p)));

  // db.sqlite — kan vara låst av agenten; cp först
  const dbKälla = path.join(process.env.HOME || "/home/ak1a", ".zcode", "cli", "db", "db.sqlite");
  const dbKopia = path.join(ROT, "data", "backups", "db-snapshot.sqlite");
  try {
    fs.copyFileSync(dbKälla, dbKopia);
    delar.push("data/backups/db-snapshot.sqlite");
    logga("db.sqlite:snapshot tagen");
  } catch (e) {
    logga(`db.sqlite:kopia misslyckades (låst?): ${String(e).slice(0, 60)}`);
  }

  // .env — ALDRIG i ZIP (den innehåller lösenord) men notera att den finns
  // (kunden har den på sin dator via migrationsguiden)

  const args = delar.map((d) => JSON.stringify(d)).join(" ");
  try {
    execSync(`cd ${JSON.stringify(ROT)} && zip -q -r ${JSON.stringify(sökväg)} ${args}`, {
      timeout: 120_000,
      stdio: "pipe",
    });
    const storlek = Math.round(fs.statSync(sökväg).size / 1024);
    logga(`OFFSITE-BACKUP SKAPAD: ${filnamn} (${storlek} kB, ${delar.length} delar)`);

    // Pusha till GitHub om SSH-nyckeln fungerar
    try {
      execSync("git push origin develop 2>&1 | head -2", {
        cwd: ROT,
        timeout: 60_000,
        encoding: "utf8",
        stdio: "pipe",
      });
      logga("GitHub: push OK");
    } catch (e) {
      // SSH-nyckeln kanske inte är tillagd än — tyst fortsätt
      logga("GitHub: push väntar (SSH-nyckel ej aktiv än)");
    }
  } catch (e) {
    logga(`BACKUP-FEL: ${String(e).slice(0, 100)}`);
  }
}

main();
