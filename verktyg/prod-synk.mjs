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
 *   2. RAM-VAKT (10X-incidenten 2026-09-14): < 2200 MB tillgängligt ⇒
 *      vänta till nästa poll — HEAD lämnas ORÖTT (bygget OOM-dödas ändå
 *      när fabrikens zcode-barn + pm2 delar minnet)
 *   3. rent träd (checkout + clean data/cache — ALDRIG röra data/vakten)
 *   4. merge origin/develop — konflikt ⇒ AVBRYT + larm (prod orörd)
 *   5. sparar känd-good-HEAD; bygger under flock-låset (npm ci + build)
 *   6. OOM-dödat bygge ("Killed"/heap i loggen) = INFRAskal, inte kodfel
 *      ⇒ logga + vänta till nästa poll (HEAD orörd) — ALDRIG revert/reset
 *      av duglig kod. Äkta kodfel följer fortfarande stoppregeln:
 *      fail ⇒ revert + ombygge ⇒ fortfarande fail ⇒ återställ good-HEAD
 *      + ombygge; misslyckas ÄVEN det ⇒ KRITISKT-larm, pm2 orörd
 *   7. pm2 restart ak1a + HTTPS-kontroll (4 försök) + version-stämpel
 *
 * BEVISAT behov 2026-09-14 (10X-omgången): p4-p9-leveranscommitters
 * byggdes under minnestaket (7 zcode-barn + pm2 + npm ci ≈ 8 GB) →
 * "Killed" → den gamla kedjan revert → reset --hard goodHead raderade
 * DUGLIGA commits och fabrikens barn gjorde om arbetet i cirklar
 * (reflog 16:53/17:10/17:19 — p8:s 9d0213b1 och p9:s be86fcca togs
 * minuter efter landning; p7/p8 räddades av att barnen dog och RAM
 * frigjordes, deploy 15:29:59 UTC).
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
const MIN_RAM_MB = 2200;

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

/** Tillgängligt RAM i MB (MemAvailable ur /proc/meminfo) — null vid fel. */
function ramTillgangligtMB() {
  try {
    const meminfo = fs.readFileSync("/proc/meminfo", "utf8");
    const m = meminfo.match(/^MemAvailable:\s+(\d+) kB/m);
    return m ? Math.round(Number(m[1]) / 1024) : null;
  } catch {
    return null;
  }
}

/** Läs /tmp/synk-build.log — OOM-spår ("Killed", JS-heap)? */
function byggetOomDodades() {
  try {
    return /Killed|SIGKILL|heap out of memory|CBKilled/i.test(fs.readFileSync("/tmp/synk-build.log", "utf8"));
  } catch {
    return false;
  }
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

  // 2) RAM-VAKT (10X-incidenten): under taket OOM-dödas next build av
  //    minnesgränsen ("Killed") — felet är KAPACITET, inte kod. Vänta till
  //    nästa poll (10 min) i stället för att bygga dömt. HEAD orört.
  const ram = ramTillgangligtMB();
  if (ram !== null && ram < MIN_RAM_MB) {
    logga(`VÄNTAR-RAM: ${ram} MB tillgängligt (< ${MIN_RAM_MB}) — bygger när minnet frigjorts; HEAD orört, nytt försök nästa poll`);
    return;
  }

  // 3) rent träd (data/vakten = runtime, orörd; data/cache = runtime-artefakter)
  try { git(["checkout", "--", "."]); } catch { /* inget att återställa */ }
  try { git(["clean", "-fd", "data/cache"]); } catch { /* fanns ej */ }

  // 4) good-HEAD = senaste deployade (eller nuvarande om aldrig deployat)
  const goodHead = senaste || lokal;
  const nya = git(["log", "--oneline", `${goodHead}..HEAD`]);

  // 5-6) bygg under flock — VÅG 123d: UTAN node-timeout (execSync-tak dödade
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
  } else if (byggetOomDodades()) {
    // OOM = infraskal (OOM-killern/JS-heapet), INTE kodfel: HEAD lämnas
    // orött och senaste-deployad är oförändrad ⇒ automatiskt nytt försök
    // nästa poll när fabrikens barn frigjort minnet. ALDRIG revert/reset
    // av commits som aldrig fått ett ärligt byggtillfälle.
    logga("bygg OOM-dödat (Killed/heap i /tmp/synk-build.log) — infra, ej kodfel: HEAD orört, nytt försök nästa poll");
    return;
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

  // 7) restart + verifiering
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

      // VÅG 148D — STÅENDE RUTIN AUTONOM ("agentens hjärna får aldrig glida
      // ifrån koden"): varje deploy synkar OCKSÅ agentens arbetsyta
      // (/home/ak1a/agent/ak1) mot prod-trädet + färskt AGENTS.md. Bevisat
      // behov 2026-09-14: arbetsytan stod kvar på våg 140 medan prod nått 147
      // — agenten levde i en gammal kodvärld och gjorde om redan levererat
      // arbete. --ff-only skyddar agentens ev. pågående ocommittade arbete;
      // misslyckande LARMAR i loggen (ALDRIG tyst — det var så glidet uppstod).
      try {
        const AGENT_YTA = "/home/ak1a/agent/ak1";
        execFileSync(
          "git",
          ["-C", AGENT_YTA, "pull", "--ff-only", "/home/ak1a/AK1", "develop"],
          { timeout: 120_000, encoding: "utf8", stdio: "pipe" },
        );
        fs.copyFileSync(
          path.join(ROT, "data", "infra", "agent-arbetsyta", "AGENTS.md"),
          path.join(AGENT_YTA, "AGENTS.md"),
        );
        logga("AGENTARBETSYTA synkad (pull --ff-only + AGENTS.md) — agenten lever i aktuell kod");
      } catch (e) {
        logga("AGENTARBETSYTA-SYNK MISSLYCKADES (smutsigt träd? åtgärda nästa rond): " + String(e).slice(0, 120));
      }
    } else {
      logga("VARNING: deployad men HTTPS ej verifierad — kontrollera manuellt");
    }
  }
}

main().catch((fel) => logga("FEL: " + String(fel).slice(0, 200)));
