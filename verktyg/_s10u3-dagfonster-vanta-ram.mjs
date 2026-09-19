#!/usr/bin/env node
// _s10u3-dagfonster-vanta-ram.mjs — vänta på RAM över dr-ovning.mjs:s grind
// (1 000 MB), kör sedan dr-ovning.mjs med dess argument. Tillfälligt
// fabriksverktyg för DAGFONSTER-övningen 2026-09-19; pollar var 20:e s,
// tak 14 min, skriver tidsstämplar så att flock-väntan och RAM-läge är
// protokollförbara.
import { readFileSync } from 'node:fs';
import { spawn } from 'node:child_process';

const TAK_MS = 14 * 60 * 1000;
const POLL_MS = 20 * 1000;
const GRANS_MB = 1050; // marginal över verktygets egen 1 000 MB-grind

function memTillgangligtMB() {
  const m = /MemAvailable:\s+(\d+) kB/.exec(readFileSync('/proc/meminfo', 'utf8'));
  return Math.floor(Number(m[1]) / 1024);
}

function kl(t) { return new Date(t).toISOString(); }
const start = Date.now();
console.log(`[${kl(start)}] vänteloop start: gräns ${GRANS_MB} MB, tak ${TAK_MS / 60000} min`);

let mem = memTillgangligtMB();
while (mem < GRANS_MB) {
  if (Date.now() - start > TAK_MS) {
    console.log(`[${kl(Date.now())}] TAK — minnet nådde aldrig ${GRANS_MB} MB (sista ${mem} MB). Avbryter utan restore.`);
    process.exit(75);
  }
  await new Promise((r) => setTimeout(r, POLL_MS));
  mem = memTillgangligtMB();
  console.log(`[${kl(Date.now())}] MemAvailable ${mem} MB`);
}
console.log(`[${kl(Date.now())}] RAM-gräns passerad (${mem} MB) — startar dr-ovning.mjs`);

const barn = spawn('node', ['verktyg/dr-ovning.mjs', '--fil', 'data/backups/supabase/db-2026-09-19.sql.gz'], {
  stdio: ['ignore', 'inherit', 'inherit'],
});
barn.on('exit', (kod, signal) => {
  console.log(`[${kl(Date.now())}] dr-ovning.mjs exit ${kod}${signal ? ' signal ' + signal : ''}`);
  process.exit(kod ?? 1);
});
