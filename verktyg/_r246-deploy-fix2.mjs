#!/usr/bin/env node
/** _r246-deploy-fix2.mjs — rond 246 prod-reparation försök 2: bygg med pm2 STOPPAD
 *  (O48-mönstret: byggfönstret skrivarfritt) + NODE_OPTIONS-heap-cap 3 GB mot
 *  turbopack-topparna. Detacherat (studiotal kan aldrig döda det). pm2 återstartas
 *  MEKANISKT i kedjans slut OAVSETT byggets utfall (synkens finally-mönster).
 *  Logg: /tmp/r246-deploy-fix2.log · märken: R246-FIX2-BYGG-OK / R246-FIX2-BYGG-FEL. */
import { spawn } from "node:child_process";
import { openSync, appendFileSync } from "node:fs";

const LOG = "/tmp/r246-deploy-fix2.log";
appendFileSync(LOG, `\n=== r246-deploy-fix2 start ${new Date().toISOString()} ===\n`);

const inre =
  "free -m >> " + LOG + " 2>&1; " +
  "pm2 stop ak1a >> " + LOG + " 2>&1; " +
  "cd /home/ak1a/AK1 && NODE_OPTIONS=--max-old-space-size=3072 npm run build >> " + LOG + " 2>&1 && " +
  "pm2 restart ak1a >> " + LOG + " 2>&1 && echo R246-FIX2-BYGG-OK >> " + LOG + " || " +
  "(pm2 restart ak1a >> " + LOG + " 2>&1; echo R246-FIX2-BYGG-FEL >> " + LOG + ")";

const kedja = "exec flock -w 900 /tmp/ak1a-deploy.lock bash -c " + JSON.stringify(inre);
const fd = openSync(LOG, "a");
const barn = spawn("bash", ["-c", kedja], { detached: true, stdio: ["ignore", fd, fd] });
barn.unref();
console.log(`DEPLOY-FIX2 STARTAD (pid ${barn.pid}, detached) — polla ${LOG}`);
