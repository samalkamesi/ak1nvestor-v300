// Startar push-dirigenten fristående (detached) med logg till /tmp — ren ESM
import { spawn } from 'node:child_process';
import { openSync } from 'node:fs';
const out = openSync('/tmp/r173-pushdirigent.log', 'a');
const barn = spawn('node', ['/home/ak1a/agent/ak1/verktyg/_r173-pushdirigent.mjs'], {
  detached: true, stdio: ['ignore', out, out], env: process.env,
});
barn.unref();
console.log(`dirigent startad pid=${barn.pid}, logg=/tmp/r173-pushdirigent.log`);
