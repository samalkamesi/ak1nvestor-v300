// Rond 247 — körare: kör gränssnittsvakten från PROD-repot (puppeteer-core finns
// bara där) och skriver klarrad till statusfilen vid exit. Detacherad — överlever
// studio-häng.
import { spawn } from 'node:child_process';
import { appendFileSync, openSync } from 'node:fs';
const S = '/tmp/r247-vakt-status.txt';
appendFileSync(S, 'R247-VAKT2-UPPE ts=' + Date.now() + '\n');
const logg = openSync('/tmp/r247-vakt.log', 'a');
const barn = spawn(
  'node',
  ['verktyg/granssnittsvakt.mjs', '--bas=http://localhost:3000'],
  { cwd: '/home/ak1a/AK1', stdio: ['ignore', logg, logg] }
);
appendFileSync(S, 'R247-VAKT2-SPAWNAD pid=' + barn.pid + ' ts=' + Date.now() + '\n');
barn.on('close', (kod) => {
  appendFileSync(S, 'R247-VAKT-KLAR kod=' + kod + ' ts=' + Date.now() + '\n');
  process.exit(0);
});
