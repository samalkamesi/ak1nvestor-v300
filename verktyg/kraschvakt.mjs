#!/usr/bin/env node
// KRASCHLOOP-VAKTEN (våg 137) — bevisat behov 2026-09-13 ~22:12 lokal:
// ak1a fastnade i kraschloop (758 pm2-omstarter; "client reference
// manifest for route /studio does not exist" = korrupt .next efter en
// avbruten/krockad bygg). WEB-VAKTENS pm2-restart kan ALDRIG bota ett
// trasigt bygg — den snurrar bara (758 bevis). Denna vakt räknar
// omstarter mellan körningar: stiger räknaren med ≥4 på 10 min ELLER
// appen svarar ≥500/gör inget svar medan statussnurrar ⇒ RÄDDNINGSBYGG:
// stopp → rm -rf .next → npm ci + build under deploy-låset → restart →
// verifiera 200. Kooldown 2 h efter varje räddning (inte slåss med
// pågående deploy/läkning). State i data/vakten/ (deploy-säkert).
import { execSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const KATALOG = path.join(ROT, "data", "vakten");
const STATE = path.join(KATALOG, "kraschvakt-state.json");
const LOGG = path.join(KATALOG, "kraschvakt.log");

function logga(rad) {
  fs.mkdirSync(KATALOG, { recursive: true });
  const ts = new Date().toISOString();
  fs.appendFileSync(LOGG, `${ts} ${rad}\n`);
  console.log(`${ts.slice(11, 19)} ${rad}`);
}
function lasState() {
  try {
    return JSON.parse(fs.readFileSync(STATE, "utf8"));
  } catch {
    return {};
  }
}
function sparaState(s) {
  fs.mkdirSync(KATALOG, { recursive: true });
  fs.writeFileSync(STATE, JSON.stringify(s, null, 2));
}
function ak1aRad() {
  try {
    const lista = JSON.parse(execSync("pm2 jlist", { timeout: 15_000, encoding: "utf8" }));
    const p = lista.find((x) => x.name === "ak1a");
    if (!p) return null;
    return {
      restarts: p.restart_time ?? 0,
      status: p.pm2_env?.status ?? "?",
    };
  } catch {
    return null;
  }
}
async function svarar() {
  try {
    const r = await fetch("http://localhost:3000/", { signal: AbortSignal.timeout(10_000) });
    return r.status < 500;
  } catch {
    return false;
  }
}

const state = lasState();
const nu = Date.now();
const p = ak1aRad();
if (!p) {
  logga("ak1a finns inte i pm2 — lämnar över till daemonen");
  process.exit(0);
}

const okNu = await svarar();
const prevRestarts = typeof state.restarts === "number" ? state.restarts : p.restarts;
const oknad = p.restarts - prevRestarts;

// Kooldown efter en tidigare räddning: logga läget, håll räknaren färsk, gå.
if (state.senasteRaddning && nu - state.senasteRaddning < 2 * 3600_000) {
  logga(
    `kooldown ${Math.round((nu - state.senasteRaddning) / 60000)} min — svarar=${okNu} status=${p.status} omstarter+${oknad}`
  );
  sparaState({ ...state, restarts: p.restarts });
  process.exit(0);
}

// Friskt läge: online + svarar + ingen omstartsstegring ⇒ tyst lämnar.
if (okNu && p.status === "online" && oknad < 4) {
  sparaState({ restarts: p.restarts, senasteRaddning: state.senasteRaddning ?? null });
  process.exit(0);
}

// ── RÄDDNING ─────────────────────────────────────────────────────────────
logga(`KRASCHLOOP-MISSTANKE: svarar=${okNu} status=${p.status} omstarter +${oknad} ⇒ RÄDDNINGSBYGG`);
try {
  execSync("pm2 stop ak1a", { timeout: 60_000, stdio: "ignore" });
} catch {
  /* redan stoppad/errored */
}
try {
  execSync(
    `exec flock -w 1200 /tmp/ak1a-deploy.lock bash -c ${JSON.stringify(
      `cd ${JSON.stringify(ROT)} && rm -rf .next && npm ci --no-audit --no-fund --loglevel=error && npm run build`
    )}`,
    { timeout: 1_500_000, stdio: "inherit" }
  );
} catch (e) {
  logga(`RÄDDNINGSBYGG MISSLYCKADES: ${String(e).slice(0, 120)} — next run försöker igen`);
  sparaState({ restarts: p.restarts, senasteRaddning: nu });
  try {
    execSync("pm2 restart ak1a --time", { timeout: 60_000, stdio: "ignore" });
  } catch {
    /* pm2 avgör */
  }
  process.exit(1);
}
try {
  execSync("pm2 restart ak1a --time", { timeout: 60_000, stdio: "ignore" });
} catch {
  /* pm2 avgör */
}
await new Promise((sov) => setTimeout(sov, 15_000));
const friskEfter = await svarar();
logga(`RÄDDNING KLAR: appen svarar=${friskEfter} (mål: kunden märker max ~10-15 min)`);
const efter = ak1aRad();
sparaState({ restarts: efter ? efter.restarts : p.restarts, senasteRaddning: nu });
process.exit(friskEfter ? 0 : 1);
