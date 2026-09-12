// V2: node --check wrapper (syntaxkontoll utan bash-blocker)
import { execFileSync } from 'node:child_process';
const fil = process.argv[2];
try {
  execFileSync('node', ['--check', fil], { encoding: 'utf8', timeout: 30_000 });
  console.log('SYNTAX OK: ' + fil);
} catch (e) {
  console.log('SYNTAXFEL: ' + (e.stderr || e.message));
  process.exit(1);
}
