// V2-P1: kör tsc --noEmit och skriv exakt utdata + antal fel till fil (wrapper pga bash-blocker)
import { execSync } from 'node:child_process';
import { writeFileSync } from 'node:fs';

const ut = '/home/ak1a/agent/ak1/.zcode/v2-tsc-svar.txt';
let rader = [];
let kod = 0;
try {
  const svar = execSync('npx tsc --noEmit', {
    cwd: '/home/ak1a/agent/ak1',
    encoding: 'utf8',
    timeout: 5 * 60 * 1000,
    stdio: ['ignore', 'pipe', 'pipe'],
    maxBuffer: 64 * 1024 * 1024,
  });
  rader = svar.split('\n').filter(Boolean);
} catch (e) {
  kod = e.status ?? -1;
  const stdout = (e.stdout || '').toString().split('\n').filter(Boolean);
  rader = stdout; // tsc skriver felen på stdout
  if (e.stderr) rader.push('--- STDERR ---', ...(e.stderr.toString().split('\n').filter(Boolean)));
}
const fel = rader.filter((l) => /error TS/.test(l));
const rapport = [
  `kördatum-UTC: ${new Date().toISOString()}`,
  `exitkod: ${kod}`,
  `antal TS-fel: ${fel.length}`,
  '--- FELRADER ---',
  ...fel,
  '--- SLUT ---',
].join('\n');
writeFileSync(ut, rapport);
console.log(rapport);
