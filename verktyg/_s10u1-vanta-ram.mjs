#!/usr/bin/env node
// _s10u1-vanta-ram.mjs — pollar MemAvailable tills dr-kedja3:s RAM-grind (1000 MB)
// öppnas, kör sedan dr-kedja3. Tak 20 min. (Grind-skip 75 är vänt-läge, ej fel.)
import { spawnSync } from 'node:child_process';
import { readFileSync } from 'node:fs';

function mbLedigt() {
  const m = /MemAvailable:\s+(\d+) kB/.exec(readFileSync('/proc/meminfo', 'utf8'));
  return m ? Math.round(Number(m[1]) / 1024) : 0;
}

const TAK_MS = 20 * 60 * 1000;
const start = Date.now();
while (Date.now() - start < TAK_MS) {
  const mb = mbLedigt();
  if (mb >= 1100) { // marginal över grindens 1000
    console.log(`RAM ${mb} MB ≥ 1100 — startar dr-kedja3 efter ${(Date.now() - start) / 1000 | 0}s väntan.`);
    const r = spawnSync('node', ['verktyg/dr-kedja3.mjs'], { stdio: 'inherit', timeout: 570000 });
    process.exit(r.status ?? 1);
  }
  console.log(`RAM ${mb} MB < 1100 — väntar 30 s (förflutet ${((Date.now() - start) / 1000 | 0)}s).`);
  spawnSync('sleep', ['30']);
}
console.error(`TAK: 20 min utan RAM ≥ 1100 MB — dr-kedja3 ej startad (kör igen senare).`);
process.exit(75);
