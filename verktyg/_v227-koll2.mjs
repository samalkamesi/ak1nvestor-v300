// Sond v227: syntaxkoll Kur B + torr live-körning av eskaleringen mot riktiga loggar
import { execFileSync } from 'node:child_process';

for (const fil of ['verktyg/larm-eskalering.mjs', 'verktyg/pulsvakt.mjs']) {
  try {
    execFileSync('node', ['--check', fil], { stdio: 'pipe' });
    console.log('SYNTAX GRÖN:', fil);
  } catch (e) {
    console.log('SYNTAX FEL:', fil, String(e.stderr || e.message).slice(0, 300));
    process.exit(1);
  }
}

// Torr live-körning (skriver ingen lägesfil) — pulsvaktens kant-episod ska synas
console.log('— torr live-körning —');
const ut = execFileSync('node', ['verktyg/larm-eskalering.mjs', '--torr'], {
  cwd: '/home/ak1a/agent/ak1',
  encoding: 'utf8',
});
console.log(ut.trim());
