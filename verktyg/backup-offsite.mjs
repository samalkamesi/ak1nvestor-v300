#!/usr/bin/env node
/**
 * OFFSITE-BACKUP (våg 172 — kundens 3-2-1-säkerhet)
 * =====================================================================
 * Skapar ett tar.gz-arkiv med ALLT kritiskt från servern:
 *   - db.sqlite-snapshot (ALL sessionhistorik, tråden, alla meddelanden)
 *   - data/vakten/ (mål-state, huvudtråd, sticky-kontext, audit, uppdrag)
 *   - data/forskning/ (alla forskningskapitel, register, program)
 *   - data/blogg-utkast/ (alla 119+ innehållsposter)
 *   - data/kurser-tillagg/ (alla nya kurser)
 *
 * .env* och nyckelfiler ingår ALDRIG i arkivet (s10-u2-offsite-DR
 * 2026-09-19: motbevisat mot gamla headerpåståenden — säkerhetsscannen
 * av det verkliga arkivet gav 0 hemlighetsträffar; .env finns bara på
 * kundens dator via migrationsguiden).
 *
 * Arkivet landar i data/backups/offsite/ — kunden hämtar med
 * ett lokalt script (eller OneDrive-synk) till sin dator.
 *
 * Körs: pumpor var 6:e timme (min === 52 && tim % 6 === 2).
 * Logg: data/vakten/backup-offsite.log
 *
 * o93 (spår 8 s8-u2, 2026-09-19): skalfri härdning — tar/git körs via
 * execFileSync med ARGUMENT-ARRAY (cwd i options) i stället för
 * interpolerad skalsträng; doktrin o15/o55 (Mimosa CHILD_PROC_INTERP
 * high, bokat av o80 §sidofynd). main() körs endast som entry — sviten
 * importerar byggTarArgv utan skarp backup/git-push.
 *
 * s10-u3 (spår 10 vakt 3/3, 2026-09-28): ATOMISKT KONTRAKT + konsistent
 * db-snapshot. Rotfyllet samma kväll: (A) fyra ETIMEDOUT-körningar
 * (02:57–20:55, alla exakt 120 s efter snapshot) lämnade ruin-arkiv —
 * gzip-trailern hann skrivas men tar-strömmen var avklippt — som skrev
 * ÖVER dagens fungerande arkiv eftersom namnet är daterat per dag;
 * (B) fs.copyFileSync på den LEVANDE db.sqlite gav integrity-fel i
 * snapshoten (invalid pages, out-of-order rowids) — arkiven bar en
 * trasig kärna. Kur: timeout 120→600 s, skriv till .part → läsverifiera
 * HELA strömmen → rename först vid grönt, snapshot via SQLite:s
 * backup-API (python3) + PRAGMA quick_check-grind innan kopian får
 * hamna i arkivet.
 */
import { execFileSync } from "node:child_process";
import { execFile as execFileCb } from "node:child_process";
import { promisify } from "node:util";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const execFilePromise = promisify(execFileCb);

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

/**
 * tar-argument för offsite-arkivet — ren funktion (svitens importyta).
 * Dubbelsuffixet .tar.gz.tar.gz på målfilen är BEVARAT medvetet: samtliga
 * arkiv på disk, rensningsfiltret (.endsWith(".tar.gz")) och kundens
 * hämtningsflöde är konsekventa på formen sedan våg 172 — härdningskursen
 * ändrar inte beteendet, bara angreppsytan.
 */
export function byggTarArgv(delar, malFil) {
  return ["-czf", malFil, ...delar];
}

/**
 * Atomiskt arkivkontrakt (s10-u3 2026-09-28): arkivet skrivs först till en
 * .part-fil och flyttas till sitt slutgiltiga namn FÖRST efter läsverifiering.
 * Bakgrund: fyra ETIMEDOUT-körningar (02:57–20:55) lämnade ruin-arkiv —
 * gzip-trailern hann skrivas men tar-strömmen var avklippt — som skrev
 * ÖVER dagens fungerande arkiv eftersom namnet är daterat per dag.
 */
export function byggArkivFilnamn(stämpel) {
  return `ak1a-offsite-${stämpel}.tar.gz.tar.gz`;
}

export function byggPartFilnamn(stämpel) {
  return `ak1a-offsite-${stämpel}.part.tar.gz`;
}

/**
 * Läsverifiering av ett skapat arkiv: listar hela innehållet (dekomprimerar
 * hela strömmen) och räknar posterna. En ruin (hel gzip, avklippt tar) ger
 * här "Unexpected EOF in archive" → false.
 */
export async function arArkivLasbart(fil) {
  try {
    const r = await execFilePromise("tar", ["-tzf", fil], {
      timeout: 300_000,
      maxBuffer: 64 * 1024 * 1024,
    });
    return r.stdout.trim().split("\n").filter(Boolean).length > 0;
  } catch {
    return false;
  }
}

async function main() {
  const stämpel = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
  const filnamn = byggArkivFilnamn(stämpel);
  const sökväg = path.join(BACKUP_KAT, filnamn);
  const partSökväg = path.join(BACKUP_KAT, byggPartFilnamn(stämpel));

  fs.mkdirSync(BACKUP_KAT, { recursive: true });

  // Rensa gamla (behåll senaste 7 dagarna) + ev. part-rester från avbruten körning
  try {
    const alla = fs.readdirSync(BACKUP_KAT);
    for (const f of alla.filter((x) => x.endsWith(".part.tar.gz"))) {
      fs.unlinkSync(path.join(BACKUP_KAT, f));
      logga(`rensade part-rest: ${f}`);
    }
    const arkiv = alla
      .filter((f) => /^ak1a-offsite-\d{4}-\d{2}-\d{2}\.tar\.gz\.tar\.gz$/.test(f))
      .sort();
    for (const f of arkiv.slice(0, -7)) {
      fs.unlinkSync(path.join(BACKUP_KAT, f));
      logga(`rensade gamla: ${f}`);
    }
  } catch { /* */ }

  // Skapa arkiv med allt kritiskt
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

  // db.sqlite — konsistent snapshot via SQLite:s backup-API (s10-u3-kur
  // 2026-09-28: copyFileSync på den levande DB:n gav integrity-fel — invalid
  // pages/out-of-order rowids — dvs arkiven bar en trasig kärna; backup-API:t
  // läser ett transaktionskonsistent tillstånd och quick_check grindar
  // resultatet innan det får hamna i arkivet)
  const dbKälla = path.join(process.env.HOME || "/home/ak1a", ".zcode", "cli", "db", "db.sqlite");
  const dbKopia = path.join(ROT, "data", "backups", "db-snapshot.sqlite");
  try {
    const t0 = Date.now();
    const kollResultat = execFileSync(
      "python3",
      [
        "-c",
        [
          "import sqlite3, sys, os",
          "kalla, mal = sys.argv[1], sys.argv[2]",
          "if os.path.exists(mal): os.remove(mal)",
          "src = sqlite3.connect(f'file:{kalla}?mode=ro', uri=True)",
          "dst = sqlite3.connect(mal)",
          "src.backup(dst)",
          "dst.close()",
          "kolla = sqlite3.connect(f'file:{mal}?mode=ro', uri=True)",
          "resultat = kolla.execute('PRAGMA quick_check').fetchone()[0]",
          "print(resultat)",
          "kolla.close(); src.close()",
        ].join("\n"),
        dbKälla,
        dbKopia,
      ],
      { timeout: 600_000, stdio: ["ignore", "pipe", "pipe"] }
    ).toString().trim();
    if (kollResultat !== "ok") {
      throw new Error(`quick_check underkände snapshot: ${kollResultat.slice(0, 200)}`);
    }
    delar.push("data/backups/db-snapshot.sqlite");
    logga(`db.sqlite:snapshot tagen via backup-API (${Math.round((Date.now() - t0) / 1000)} s, quick_check ok)`);
  } catch (e) {
    // Snapshot misslyckad = INGEN tyst degradering: logga och fortsätt utan,
    // men skapad-raden flaggar det (ett arkiv utan kärnan är ett halvt arkiv)
    logga(`db.sqlite:snapshot MISSLYCKAD — arkivet skapas UTAN db-snapshot: ${String(e).slice(0, 120)}`);
  }

  // .env — ALDRIG i arkivet (den innehåller lösenord) men notera att den finns
  // (kunden har den på sin dator via migrationsguiden)

  try {
    // ATOMISKT KONTRAKT (s10-u3-kur): skriv till .part → läsverifiera HELA
    // strömmen → rename först vid grönt. En avbruten/trasig körning kan
    // aldrig mer skriva en ruin på det slutgiltiga daterade namnet och därmed
    // radera dagens fungerande arkiv (fyra ETIMEDOUT-ruiner bevisade läget).
    execFileSync("tar", byggTarArgv(delar, partSökväg), {
      cwd: ROT,
      timeout: 600_000,
      stdio: "pipe",
    });
    const lasbar = await arArkivLasbart(partSökväg);
    if (!lasbar) {
      fs.unlinkSync(partSökväg);
      throw new Error("läsverifieringen underkände arkivet (ruin detekterad — part borttagen, slutgiltigt namn orört)");
    }
    fs.renameSync(partSökväg, sökväg);
    const storlek = Math.round(fs.statSync(sökväg).size / 1024);
    const utanDb = delar.some((p) => p.endsWith("db-snapshot.sqlite")) ? "" : " [VARNING: UTAN db-snapshot]";
    logga(`OFFSITE-BACKUP SKAPAD: ${filnamn} (${storlek} kB, ${delar.length} delar, läsverifierad)${utanDb}`);

    // Pusha till GitHub om SSH-nyckeln fungerar
    try {
      execFileSync("git", ["push", "origin", "develop"], {
        cwd: ROT,
        timeout: 60_000,
        stdio: "pipe",
      });
      logga("GitHub: push OK");
    } catch (e) {
      // SSH-nyckeln kanske inte är tillagd än — tyst fortsätt
      logga("GitHub: push väntar (SSH-nyckel ej aktiv än)");
    }
  } catch (e) {
    logga(`BACKUP-FEL: ${String(e).slice(0, 200)}`);
  }
}

// Endast entry-körning startar driftsidan (pumporna ropar "node verktyg/
// backup-offsite.mjs"); import — sviten — kör ALDRIG backup eller git push.
if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
  main().catch((e) => {
    logga(`BACKUP-FEL: ${String(e).slice(0, 200)}`);
    process.exitCode = 1;
  });
}
