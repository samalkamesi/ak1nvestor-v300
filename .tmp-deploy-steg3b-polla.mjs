// Steg 3b: Polla byggstatus (exit-fil + loggsans)
import { readFileSync, existsSync } from 'node:fs';
import { execFileSync } from 'node:child_process';

const LOGG = '/home/ak1a/agent/ak1/.tmp-deploy-bygg.log';
const EXIT = '/home/ak1a/agent/ak1/.tmp-deploy-bygg-exit.txt';

// Vänta så många ms som arg anger
const vantaMs = Number(process.argv[2] || 0);
if (vantaMs > 0) Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, vantaMs);

let exit = null;
if (existsSync(EXIT)) exit = readFileSync(EXIT, 'utf8').trim();

const logg = existsSync(LOGG) ? readFileSync(LOGG, 'utf8') : '';
const rader = logg.split('\n').filter(Boolean);
const svans = rader.slice(-14).join('\n');

// RAM-grindens meddelanden
const ramRader = rader.filter((r) => /ram|minne|väntar|V[äa]ntar|sleep|MB/i.test(r)).slice(-6);

let procLever = false;
try {
  execFileSync('bash', ['-c', 'ps -p $(cat /home/ak1a/agent/ak1/.tmp-deploy-bygg-pid.txt) >/dev/null 2>&1'], { timeout: 15000 });
  procLever = true;
} catch { procLever = false; }

console.log(JSON.stringify({ exit, procLever, loggRader: rader.length, ramRader, svans }, null, 2));
process.exit(exit === null ? 0 : (exit === '0' ? 0 : 1));
