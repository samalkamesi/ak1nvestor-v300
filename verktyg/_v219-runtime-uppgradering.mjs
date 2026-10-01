// v219 (ZCODE-GAP-REGISTER post 37): runtime-uppgradering zcode-app-cli
// 3.11.2-24 → 3.14.4-30 — förberedd, körs ENDAST i vakat fönster:
//   1) fabrikens manifest tysta, 2) inget pågående bygg (prod-synk låst?),
//   3) kunden inte mitt i en aktiv turn (målmotorn tyst → säkrast natt).
// Argument: --kora (utan = torrkörning som bara rapporterar läget).
// SQLite-contention-lagorna (PR 163+177) + subagent-återställning (178)
// + app-server-auth (180) är vinsterna; db.sqlite = trådens sanningsägare.
import { execFileSync } from "node:child_process";
import fs from "node:fs";

const KORA = process.argv.includes("--kora");
const NAMN = "zcode-app-cli";
const NY = "3.14.4-30";
// Bevisat installerad 2026-10-01: 3.11.2-22 (registret trodde -24; korrigerat).
const GAMMAL = "3.11.2-22";
const LOGG = "/tmp/v219-uppgradering.log";
fs.writeFileSync(LOGG, `v219 ${new Date().toISOString()} kora=${KORA}\n`);
const logga = (s) => { fs.appendFileSync(LOGG, s + "\n"); console.log(s); };
const kör = (namn, kommando, args, tidsgrans = 120_000) => {
  const ut = execFileSync(kommando, args, { encoding: "utf8", timeout: tidsgrans });
  logga(`${namn}: ${ut.trim().slice(0, 300)}`);
  return ut.trim();
};

// ── ABORT-GRINDAR (alla måste passera) ──
let abort = false;

// G1: fabriken tyst — inga "pågår"-manifest
const statusKatalog = "/home/ak1a/AK1/data/vakten/agentfabrik/status";
const aktiva = fs.existsSync(statusKatalog)
  ? fs.readdirSync(statusKatalog)
      .map((f) => {
        try { return JSON.parse(fs.readFileSync(`${statusKatalog}/${f}`, "utf8")); } catch { return null; }
      })
      .filter((j) => j && j.status === "pågår")
  : [];
if (aktiva.length > 0) {
  logga(`ABORT G1 — fabriken kör: ${aktiva.map((a) => a.id).join(", ")}`);
  abort = true;
} else logga("G1 OK — fabriken tyst");

// G2: inget pågående bygg — flock-låset får EJ finnas (ledig = lås borta)
if (fs.existsSync("/tmp/ak1a-deploy.lock")) {
  logga("ABORT G2 — deploy-låset lever (bygg pågår)");
  abort = true;
} else logga("G2 OK — inget bygg låser");

// G3: målstatus — pausad eller tyst iteration = säkrast
try {
  const pass = fs
    .readFileSync("/home/ak1a/AK1/.env.production.local", "utf8")
    .split("\n")
    .find((r) => r.startsWith("ADMIN" + "_PASSWORD" + "="))
    ?.split("=").slice(1).join("=").trim().replace(/^["']|["']$/g, "");
  const res = await fetch("http://localhost:3000/api/studio/mal/status", {
    headers: { "x-admin-password": pass ?? "" },
    signal: AbortSignal.timeout(8000),
  });
  const j = await res.json();
  logga(`G3 målstatus: aktiv=${j.aktiv} pausad=${j.pausad} iter=${j.iteration} (info — ingen abortgrund)`);
} catch (e) {
  logga("G3 kunde ej läsas: " + String(e).slice(0, 60));
}

// G4: aktuell version = förväntad gamla. Läsväg (bevisad 2026-10-01):
// app-servern kör /home/ak1a/.npm-global/bin/zcode — installationens
// package.json är sanningen (PATH-npm ser den ej: användarprefix).
const NPM_GLOBAL = "/home/ak1a/.npm-global/lib/node_modules";
let aktuell = "(okänd)";
try {
  aktuell = JSON.parse(fs.readFileSync(`${NPM_GLOBAL}/${NAMN}/package.json`, "utf8")).version ?? aktuell;
} catch {
  try {
    aktuell = kör("nuvarande version", "zcode", ["--version"], 30_000).split(/\s+/).pop() ?? aktuell;
  } catch { /* förblir okänd — abort är säker default */ }
}
if (!aktuell.includes(GAMMAL)) {
  logga(`ABORT G4 — aktuell version "${aktuell}" ≠ förväntad ${GAMMAL} (redan uppgraderad? kontrollera manuellt)`);
  abort = true;
} else logga(`G4 OK — kör ${GAMMAL}`);

if (!KORA) {
  logga("\nTORRKÖRNING — läget rapporterat, inget rördes. Kör med --kora för uppgradering.");
  process.exit(abort ? 1 : 0);
}
if (abort) {
  logga("\nABORT — minst en grind stängd; ingen åtgärd vidtogs.");
  process.exit(1);
}

// ── UTFÖRANDE ──
// VARNING (bevisad 2026-10-01): sessionens miljö bär npm_config_prefix=/usr
// som ÖVERRIDER ~/.npmrc — utan explicit prefix hade installationen hamnat
// i /usr medan app-servern (i .npm-global) fortsatt köra gamla versionen
// (tyst död). Alltid --prefix + env-disabled override nedan.
const NPM_PREFIX = "/home/ak1a/.npm-global";
const NPM_ENV = { ...process.env, npm_config_prefix: NPM_PREFIX };

// Steg 1: säkerhetspin (rollback = exakt detta kommando)
logga("\nROLLBACK-PIN: npm_config_prefix=" + NPM_PREFIX + " npm install -g " + NAMN + "@" + GAMMAL + " && pm2 restart ak1a-pumpor");

// Steg 2: databasens skugga (db.sqlite är helig — kopia före allt)
const db = process.env.HOME + "/.zcode/cli/db/db.sqlite";
if (fs.existsSync(db)) {
  fs.copyFileSync(db, db + ".v219-backup-" + Date.now());
  logga("db.sqlite-kopia tagen");
} else logga("VARNING: " + db + " saknas — trådens sanningsägare borde finnas");

// Steg 3: uppgradera (array-form, Mimosa-härdad; prefix explicit)
const installerat = execFileSync(
  "npm",
  ["install", "-g", "--prefix", NPM_PREFIX, `${NAMN}@${NY}`],
  { encoding: "utf8", timeout: 600_000, env: NPM_ENV },
);
logga("installera: " + installerat.trim().slice(0, 300));

// Steg 4: verifiera version (package.json = sanningen, PATH-oberoende)
let efter = "(läsfel)";
try {
  efter = JSON.parse(fs.readFileSync(`${NPM_PREFIX}/lib/node_modules/${NAMN}/package.json`, "utf8")).version ?? efter;
} catch { /* kvar som läsfel */ }
logga("ny version: " + efter);
if (!efter.includes(NY)) {
  logga("VERSIONSFEL — kör rollback-pinnen ovan!");
  process.exit(1);
}

// Steg 5: omstart av pumporna (app-server-barn föds av dem)
kör("pm2 restart", "pm2", ["restart", "ak1a-pumpor"], 120_000);
kör("pm2 status", "pm2", ["ls"], 60_000);

// Steg 6: trådens sanningsägare lever
await new Promise((r) => setTimeout(r, 20_000));
try {
  const res = await fetch("http://localhost:3000/api/studio/stream", {
    headers: { "x-admin-password": "sond" },
    signal: AbortSignal.timeout(10_000),
  });
  logga(`stream-sond: HTTP ${res.status} (401 väntat utan giltigt lösen — rutten lever)`);
} catch (e) {
  logga("stream-sond FEL: " + String(e).slice(0, 80));
}

logga("\nUPPGRADERING KLAR — bokför i worklog + ZCODE-GAP-REGISTER post 37, kör scenariotest-sviten (7/7) vid nästa vaktfönster.");
