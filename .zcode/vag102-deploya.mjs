// VÅG 102 — BYGG PÅ PROD UNDER LÅS (AGENTS.md §MOLNUTVECKLING steg 2):
// exec flock -n /tmp/ak1a-deploy.lock bash -c 'cd /home/ak1a/AK1 && npm ci
// --no-audit --no-fund && npm run build && pm2 restart ak1a' + HTTPS-kontroll.
// Körs via node (mönstret från importera-prod-objekt.mjs/gränssnittsvakten).
// Stoppregler inbyggda: flock väntar upp till 8 min på annat bygge (ALDRIG
// olåst — våg 100); misslyckat bygge ⇒ git revert HEAD + ombygge (ALDRIG
// lämna prod trasig); logg till arbetsytan för pollning.
import { execSync } from "node:child_process";
import fs from "node:fs";

const PROD = "/home/ak1a/AK1";
const LOG = "/home/ak1a/agent/ak1/.zcode/vag102-deploy.log";

function log(rad) {
  fs.appendFileSync(LOG, new Date().toISOString().slice(11, 19) + " " + rad + "\n");
  console.log(rad);
}

function steg(namn, cmd, opts = {}) {
  log("▼ " + namn);
  try {
    const ut = execSync(cmd, { cwd: PROD, encoding: "utf8", timeout: opts.timeout ?? 600_000, stdio: ["ignore", "pipe", "pipe"] });
    const sista = ut.trim().split("\n").slice(-3).join(" | ");
    log("✓ " + namn + (sista ? " — " + sista.slice(0, 300) : ""));
    return true;
  } catch (e) {
    const detalj = String(e.stdout || "") + String(e.stderr || "");
    log("✗ " + namn + " FELL: " + detalj.trim().split("\n").slice(-5).join(" | ").slice(0, 600));
    return false;
  }
}

fs.writeFileSync(LOG, "=== VÅG 102 DEPLOY START ===\n");
log("HEAD före: " + execSync("git log --oneline -1", { cwd: PROD, encoding: "utf8" }).trim());

// 1) Lås (väntar upp till 8 min om annat bygge pågår — aldrig olåst)
if (!steg("flock-vantan", "exec flock -w 480 /tmp/ak1a-deploy.lock bash -c 'echo LÅS-FICK'", { timeout: 500_000 })) {
  log("DEPLOY AVBRUTEN — låset kunde inte tas (annat bygge > 8 min)");
  process.exit(1);
}

// 2) npm ci + build (inuti samma lås)
const bygg = "npm ci --no-audit --no-fund > /tmp/vag102-npmci.log 2>&1 && npm run build > /tmp/vag102-build.log 2>&1";
const flockBygg = `exec flock -w 30 /tmp/ak1a-deploy.lock bash -c ${JSON.stringify(bygg)}`;
if (!steg("npm-ci+build", flockBygg, { timeout: 600_000 })) {
  log("BYGGET MISSLYCKADES — stoppregeln: git revert HEAD + ombygge");
  if (!steg("revert", "git revert HEAD --no-edit")) {
    log("KRITISKT: revert misslyckades — prod kan vara trasig; eskalera till huvudagenten");
    process.exit(1);
  }
  if (!steg("ombygge", flockBygg, { timeout: 600_000 })) {
    log("KRITISKT: ombygget misslyckades efter revert — eskalera till huvudagenten");
    process.exit(1);
  }
  log("revert+ombygge OK — prod bygger på föregående commit (våg 102 ligger kvar i git)");
}

// 3) pm2 restart + hälsokontroll
if (!steg("pm2-restart", "pm2 restart ak1a --update-env && sleep 6 && pm2 ls | grep -o 'ak1a.*online' | head -1", { timeout: 120_000 })) {
  log("KRITISKT: pm2-restart misslyckades — eskalera");
  process.exit(1);
}

// 4) HTTPS-verifiering (deploy-skriptets steg 4)
let httpsOk = false;
for (let forsok = 1; forsok <= 4 && !httpsOk; forsok++) {
  try {
    const r = await fetch("https://lab.ak1nvestor.com/", { headers: { "User-Agent": "ak1a-deploy-check" }, signal: AbortSignal.timeout(20_000) });
    const t = await r.text();
    httpsOk = r.status === 200 && t.includes("AK1A");
    log(`https försök ${forsok}: ${r.status} ${httpsOk ? "OK" : "INNEHÅLL SAKNAS"}`);
  } catch (e) {
    log(`https försök ${forsok}: fel ${e.name}`);
  }
  if (!httpsOk) await new Promise((r) => setTimeout(r, 8000));
}
log(httpsOk ? "=== DEPLOY KLAR — prod 200 ===" : "=== VARNING: https ej verifierad ===");
process.exit(httpsOk ? 0 : 1);
