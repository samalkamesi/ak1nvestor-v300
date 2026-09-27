#!/usr/bin/env node
// ROND 255 — prod-reparation efter OOM-dödat bygge (r247-receptet, ordagrant adopterat).
// Kur: pm2 STOPPAD under bygget (max RAM), rent .next, GARANTERAT återstart i finally.
// Detacherad (överlever studio-häng): föräldern spawnar barnet och avslutar.
// npm ci SKIPPAS medvetet: 19:49-försöket nådde next-bygget = npm-stadiet grönt.
// Tillägg mot r247: bygget under deploy-låset (flock -n, en retry efter 60 s).
import { spawn, execSync } from 'node:child_process';
import fs from 'node:fs';

const STATUS = '/tmp/r255-repair-status.txt';
const LOG = '/tmp/r255-repair.log';
const PROD = '/home/ak1a/AK1';

if (!process.env.R255_CHILD) {
  const out = fs.openSync(LOG, 'a');
  const child = spawn(process.execPath, [import.meta.filename], {
    env: { ...process.env, R255_CHILD: '1' },
    detached: true,
    stdio: ['ignore', out, out],
  });
  child.unref();
  fs.writeFileSync(STATUS, `R255-REPAIR-STARTAD pid=${child.pid} ts=${Date.now()}\n`);
  console.log(`R255-REPAIR-STARTAD pid=${child.pid}`);
  process.exit(0);
}

const line = (s) => fs.appendFileSync(STATUS, `${s} ts=${Date.now()}\n`);
const run = (cmd) =>
  execSync(cmd, {
    cwd: PROD,
    stdio: ['ignore', 'inherit', 'inherit'],
    timeout: 20 * 60 * 1000,
  });

line('R255-BARN-UPPE');
try {
  run('pm2 stop ak1a');
  line('R255-PM2-STOPPAD');
  fs.rmSync(`${PROD}/.next`, { recursive: true, force: true });
  line('R255-NEXT-RENSAT');
  line('R255-BYGG-KOR');
  try {
    run('flock -n /tmp/ak1a-deploy.lock npm run build');
  } catch (eLas) {
    line('R255-LAS-UPPTAGEN-VANTAR-60');
    execSync('sleep 60');
    run('flock -n /tmp/ak1a-deploy.lock npm run build');
  }
  line('R255-BYGG-KLART');
} catch (e) {
  line(`R255-FEL ${String(e && e.message ? e.message : e).slice(0, 300)}`);
  try {
    run('pm2 start ak1a');
    line('R255-PM2-ATERSTARTAD-EFTER-FEL');
  } catch (e2) {
    line(`R255-PM2-START-FEL ${String(e2 && e2.message ? e2.message : e2.message).slice(0, 200)}`);
  }
  process.exit(1);
}
try {
  run('pm2 restart ak1a');
  line('R255-PM2-OMSTARTAD');
  line('R255-REPAIR-KLAR');
} catch (e) {
  line(`R255-PM2-RESTART-FEL ${String(e && e.message ? e.message : e.message).slice(0, 200)}`);
  process.exit(1);
}
