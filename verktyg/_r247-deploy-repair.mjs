#!/usr/bin/env node
// ROND 247 — prod-reparation av OOM-dödade byggen.
// Kur: pm2 STOPPAD under bygget (max RAM), rent .next, därefter GARANTERAT
// återstart i finally (stoppregel: aldrig lämna prod avstängd).
// Körs detacherat (överlever studio-häng): föräldern spawnar barnet och avslutar.
// npm ci SKIPPAS medvetet: node_modules friskt (puppeteer-core intakt; 09:50-försöket
// nådde next-bygget = npm-stadiet grönt). Dokumenteras i worklog.
import { spawn, execSync } from 'node:child_process';
import fs from 'node:fs';

const STATUS = '/tmp/r247-deploy-status.txt';
const LOG = '/tmp/r247-deploy-repair.log';
const PROD = '/home/ak1a/AK1';

if (!process.env.R247_CHILD) {
  const out = fs.openSync(LOG, 'a');
  const child = spawn(process.execPath, [import.meta.filename], {
    env: { ...process.env, R247_CHILD: '1' },
    detached: true,
    stdio: ['ignore', out, out],
  });
  child.unref();
  fs.writeFileSync(STATUS, `R247-DEPLOY-STARTAD pid=${child.pid} ts=${Date.now()}\n`);
  console.log(`R247-DEPLOY-STARTAD pid=${child.pid}`);
  process.exit(0);
}

const line = (s) => fs.appendFileSync(STATUS, `${s} ts=${Date.now()}\n`);
const run = (cmd) =>
  execSync(cmd, {
    cwd: PROD,
    stdio: ['ignore', 'inherit', 'inherit'],
    timeout: 20 * 60 * 1000,
  });

line('R247-BARN-UPPE');
try {
  run('pm2 stop ak1a');
  line('R247-PM2-STOPPAD');
  fs.rmSync(`${PROD}/.next`, { recursive: true, force: true });
  line('R247-NEXT-RENSAT');
  line('R247-BYGG-KOR');
  run('npm run build');
  line('R247-BYGG-KLART');
} catch (e) {
  line(`R247-FEL ${String(e && e.message ? e.message : e).slice(0, 300)}`);
  try {
    run('pm2 start ak1a');
    line('R247-PM2-ATERSTARTAD-EFTER-FEL');
  } catch (e2) {
    line(`R247-PM2-START-FEL ${String(e2 && e2.message ? e2.message : e2).slice(0, 200)}`);
  }
  process.exit(1);
}
try {
  run('pm2 restart ak1a');
  line('R247-PM2-OMSTARTAD');
  line('R247-DEPLOY-KLAR');
} catch (e) {
  line(`R247-PM2-RESTART-FEL ${String(e && e.message ? e.message : e).slice(0, 200)}`);
  process.exit(1);
}
