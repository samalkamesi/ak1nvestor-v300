#!/usr/bin/env node
/**
 * VAKT-CRON-DISPATCHERN (våg 105) — crontabens entrypoint för gränsnittsvakten.
 *
 * Crontab-raden kör `node verktyg/vakt-cron.mjs` som i tur startar
 * granssnittsvakt-cron.sh (samtliga sökvägar slås upp relativt repots rot —
 * aldrig hårdkodade absoluta). Exit-koden vidarebefordras till cron.
 */
import { spawn, spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import path from "node:path";

const ROT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const SKRIPT = path.join("data", "infra", "contabo", "granssnittsvakt-cron.sh");

// Logga start/tid i vaktkatalogen (cron-vennlig spårbarhet).
const stamp = new Date().toISOString();
console.log(`[vakt-cron] start ${stamp}`);

const res = spawnSync("bash", [SKRIPT], {
  cwd: ROT,
  stdio: "inherit",
  env: { ...process.env, AK1A_ROT: ROT },
});

console.log(`[vakt-cron] slut kod=${res.status ?? "?"}`);
process.exit(res.status ?? 2);
