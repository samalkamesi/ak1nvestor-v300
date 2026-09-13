#!/usr/bin/env node
/**
 * DATA-HYGIENEN (våg 110) — kundens direktiv: "jobba alltid med att
 * optimera och rensa och komprimera datan".
 *
 * Körs via cron (söndagar 03:33) + kan köras manuellt:
 *   node verktyg/data-hygien.mjs
 *
 * Åtgärder (idempotenta, loggas, ALDRIG destruktiva mot live-data):
 *   1. git gc --auto — komprimerar objektdatabasen (safe).
 *   2. Vakt-rapporter > 30 dagar raderas (data/vakten/granssnitt-*.json;
 *      cron-retentionen gör detsamma — här som bälte+hängslen).
 *   3. Cron-loggar kapas till sista 200 raderna.
 *   4. tmux-zombiecheck: rapporterar (dödar ej) zcode-processer > 20 st.
 *
 * Logg: data/vakten/data-hygien.log
 */
import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const ROT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const VAKT = path.join(ROT, "data", "vakten");
const LOGG = path.join(VAKT, "data-hygien.log");
const RETENTION_DYGN = 30;

function logga(rad) {
  fs.mkdirSync(VAKT, { recursive: true });
  fs.appendFileSync(LOGG, `${new Date().toISOString().slice(0, 19)} ${rad}\n`);
  console.log(rad);
}

function git(args) {
  try {
    return execFileSync("git", args, { cwd: ROT, encoding: "utf8", timeout: 120_000 }).trim();
  } catch (e) {
    return "FEL: " + String(e).slice(0, 120);
  }
}

// 1) git gc — komprimering
const gc = git(["gc", "--auto"]);
logga("git gc: " + (gc.startsWith("FEL") ? gc : "ok"));

// 2) vakt-rapporter > 30 dygn
let raderade = 0;
const grans = Date.now() - RETENTION_DYGN * 24 * 3600_000;
try {
  for (const fil of fs.readdirSync(VAKT)) {
    if (!/^granssnitt-.*\.json$/.test(fil)) continue;
    const full = path.join(VAKT, fil);
    if (fs.statSync(full).mtimeMs < grans) {
      fs.unlinkSync(full);
      raderade++;
    }
  }
} catch { /* katalogen kan saknas */ }
logga(`vakt-rapporter raderade (>${RETENTION_DYGN} d): ${raderade}`);

// 3) loggkapning
for (const namn of ["styrelse-rond.log", "hjartslag.log", "cron.log", "hjartslag-cron.log", "styrelse-rond-cron.log"]) {
  const fil = path.join(VAKT, namn);
  try {
    const rader = fs.readFileSync(fil, "utf8").trim().split("\n");
    if (rader.length > 200) fs.writeFileSync(fil, rader.slice(-200).join("\n") + "\n");
  } catch { /* saknas — ok */ }
}
logga("loggar kapade (≤200 rader)");

// 4) processhälsa (rapport endast)
try {
  const ps = execFileSync("ps", ["aux"], { encoding: "utf8" });
  const n = (ps.match(/[z]code-cli/g) || []).length;
  logga(`zcode-cli-processer: ${n}${n > 20 ? " — VARNING: zombie-mängd, överväg städning" : " (hälsosamt)"}`);
} catch { /* ps ej tillgängligt */ }

// 5) VÅG 116 — organismens veckoarkiv: registret (runtime i data/vakten/)
// arkiveras versionerat till data/forskning/ — evolutionens historia bevaras
// i git utan att deployernas träduppdatering kan radera live-tillståndet.
try {
  const kalla = path.join(VAKT, "organ-registret.json");
  const arkiv = path.join(ROT, "data", "forskning", "organ-arkiv-SENASTE.json");
  if (fs.existsSync(kalla)) {
    fs.copyFileSync(kalla, arkiv);
    logga("organ-registret arkiverat → data/forskning/organ-arkiv-SENASTE.json");
  }
} catch (e) {
  logga("organ-arkiv FEL: " + String(e).slice(0, 100));
}

logga("data-hygien KLAR");
