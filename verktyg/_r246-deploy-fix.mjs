#!/usr/bin/env node
/** _r246-deploy-fix.mjs — rond 246 prod-reparation: bygg om .next i prod-repot under
 *  deploy-låset och restarta pm2 — körd DETACHED så studioskalets 30s-häng aldrig kan döda
 *  bygget (OOM-roten var subagenternas RAM-last; inga agenter körs nu — 6,8 GB ledigt).
 *  Logg: /tmp/r246-deploy-fix.log · KLAR-markör: "R246-DEPLOY-FIX-KLAR" (vid framgång)
 *  eller "R246-DEPLOY-FIX-FEL" (vid misslyckande — huvudagenten revertar enligt protokollet). */
import { spawn } from "node:child_process";
import { openSync, appendFileSync } from "node:fs";

const LOG = "/tmp/r246-deploy-fix.log";
appendFileSync(LOG, `\n=== r246-deploy-fix start ${new Date().toISOString()} (available RAM vid start via free) ===\n`);

const kedja = [
  "free -m",
  "exec flock -n /tmp/ak1a-deploy.lock bash -c 'cd /home/ak1a/AK1 && npm run build && pm2 restart ak1a && echo R246-BUILD-OK'",
  "echo R246-DEPLOY-FIX-KLAR",
].join(" && ") + " || echo R246-DEPLOY-FIX-FEL";

const fd = openSync(LOG, "a");
const barn = spawn("bash", ["-c", kedja], { detached: true, stdio: ["ignore", fd, fd] });
barn.unref();
console.log(`DEPLOY-FIX STARTAD (pid ${barn.pid}, detached) — polla ${LOG}`);
