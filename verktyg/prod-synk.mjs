#!/usr/bin/env node
/**
 * PROD-SYNKEN (våg 122) — kundens direktiv: "allt nytt som byggs här [i
 * Z Code] skall per automatik byggas där i studio"
 * =====================================================================
 * Pollar GitHub origin/develop var 10:e minut (via pumpor-daemonen) och
 * deployar NYA commits AUTOMATISKT till produktion — med hela
 * stoppregelverket (ALDRIG lämna prod trasig):
 *
 *   1. git fetch origin develop — inget nytt ⇒ tyst exit (99 % av runsen)
 *   2. rent träd (checkout + clean data/cache — ALDRIG röra data/vakten)
 *   3. merge origin/develop — konflikt ⇒ AVBRYT + larm (prod orörd)
 *   4. sparar känd-good-HEAD; bygger under flock-låset (npm ci + build)
 *   5. fail ⇒ revert + ombygge ⇒ fortfarande fail ⇒ återställ good-HEAD
 *      + ombygge; misslyckas ÄVEN det ⇒ KRITISKT-larm, pm2 orörd
 *   6. pm2 restart ak1a + HTTPS-kontroll (4 försök) + version-stämpel
 *
 * Version-meddelandet (kundens "berätta att vi har en ny version — tyst,
 * utan att påverka produktionen"): appenderar rad till
 * data/vakten/versionsloggen.jsonl som studions Organismen-panel visar.
 *
 * Logg: data/vakten/prod-synk.log · Körs: pumpor-daemonen var 10:e min.
 */
import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const ROT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const VAKT = path.join(ROT, "data", "vakten");
const LOGG = path.join(VAKT, "prod-synk.log");

function logga(rad) {
  fs.mkdirSync(VAKT, { recursive: true });
  fs.appendFileSync(LOGG, `${new Date().toISOString().slice(0, 19)} ${rad}\n`);
  console.log(rad);
}

function git(args, alternativ = {}) {
  return execFileSync("git", args, {
    cwd: ROT,
    encoding: "utf8",
    timeout: 120_000,
    ...alternativ,
  }).trim();
}

async function httpsOk() {
  for (let i = 1; i <= 4; i++) {
    try {
      const r = await fetch("https://lab.ak1nvestor.com/", {
        headers: { "User-Agent": "ak1a-prod-synk" },
        signal: AbortSignal.timeout(20_000),
      });
      const t = await r.text();
      if (r.status === 200 && t.includes("AK1A")) return true;
    } catch { /* försök igen */ }
    await new Promise((s) => setTimeout(s, 8000));
  }
  return false;
}

async function main() {
  // 1) VÅG 123b: hämtning från GitHub kräver autentisering (repo privat,
  //    servern saknar PAT) — BEHÖVS EJ: huvudagentens och agentens pushar
  //    levererar trädet DIREKT till servern (updateInstead). Synken jämför
  //    HEAD mot senaste DEPLOYADE hash och bygger vid skillnad.
  const lokal = git(["rev-parse", "HEAD"]);
  const senasteFil = path.join(VAKT, "senaste-deployad.txt");
  let senaste = "";
  try { senaste = fs.readFileSync(senasteFil, "utf8").trim(); } catch { /* första körningen */ }
  if (lokal === senaste) return; // inget nytt — tyst (99 % av runsen)

  logga(`NY KOD: ${senaste.slice(0, 8) || "(första)"} → ${lokal.slice(0, 8)}`);

  // 2) rent träd (data/vakten = runtime, orörd; data/cache = runtime-artefakter)
  try { git(["checkout", "--", "."]); } catch { /* inget att återställa */ }
  try { git(["clean", "-fd", "data/cache"]); } catch { /* fanns ej */ }

  // 3) good-HEAD = senaste deployade (eller nuvarande om aldrig deployat)
  const goodHead = senaste || lokal;
  const nya = git(["log", "--oneline", `${goodHead}..HEAD`]);

  // 4-5) bygg under flock — VÅG 123d: UTAN node-timeout (execSync-tak dödade
  // byggprocessen med SIGTERM; deploylåset serialiserar ändå, daemonen
  // övervakar). Logg till eigen fil för efteranalys.
  const bygg = "npm ci --no-audit --no-fund >> /tmp/synk-npmci.log 2>&1 && npm run build >> /tmp/synk-build.log 2>&1";
  const { spawn } = await import("node:child_process");
  const korBygg = () =>
    new Promise((lyckas) => {
      const barn = spawn(
        "bash",
        ["-c", `exec flock -w 900 /tmp/ak1a-deploy.lock bash -c ${JSON.stringify(bygg)}`],
        { cwd: ROT, stdio: "ignore", detached: false },
      );
      barn.on("exit", (kod) => lyckas(kod === 0));
      barn.on("error", () => lyckas(false));
    });
  let ok = false;
  try { fs.writeFileSync("/tmp/synk-npmci.log", ""); } catch { /* */ }
  try { fs.writeFileSync("/tmp/synk-build.log", ""); } catch { /* */ }
  if (await korBygg()) {
    ok = true;
  } else {
    logga("bygg MISSLYCKADES (se /tmp/synk-*.log) — revert + ombygge");
    try {
      git(["revert", "HEAD", "--no-edit"]);
      if (await korBygg()) {
        ok = true;
        logga("revert+ombygge OK — prod bygger på föregående commit");
      } else throw new Error("revert-bygget failade");
    } catch {
      logga("ombygge efter revert MISSLYCKADES — återställer känd-good HEAD");
      try {
        git(["reset", "--hard", goodHead]);
        if (await korBygg()) {
          ok = true;
          logga("good-HEAD återställd + ombyggd");
        } else throw new Error("good-HEAD-bygget failade");
      } catch {
        logga("KRITISKT: även good-HEAD-bygget failar — pm2 orörd, kräver manuell granskning");
        return;
      }
    }
  }

  // 6) restart + verifiering
  if (ok) {
    try { execFileSync("pm2", ["restart", "ak1a"], { timeout: 60_000, stdio: "ignore" }); } catch { /* pm2 pw */ }
    await new Promise((s) => setTimeout(s, 6000));
    if (await httpsOk()) {
      const deployadHash = git(["rev-parse", "HEAD"]);
      try { fs.writeFileSync(senasteFil, deployadHash + "\n"); } catch { /* markör får vänta */ }
      logga(`DEPLOYAD automatiskt: ${nya.split("\n").length} commits (${deployadHash.slice(0, 8)}) — prod 200`);
      // Version-meddelandet (tyst, icke-störande — panelen visar det)
      try {
        const vfil = path.join(VAKT, "versionsloggen.jsonl");
        fs.appendFileSync(
          vfil,
          JSON.stringify({ ts: new Date().toISOString(), commits: nya.split("\n").slice(0, 6) }) + "\n",
        );
      } catch { /* logg får vänta */ }
    } else {
      logga("VARNING: deployad men HTTPS ej verifierad — kontrollera manuellt");
    }
  }
}

main().catch((fel) => logga("FEL: " + String(fel).slice(0, 200)));
