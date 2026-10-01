// _v221-visa-z.mjs — visar organ:Z:s commit d76a3db2 innehåll.
import { execFileSync } from 'node:child_process';
const MIN = '/home/ak1a/agent/ak1';
try {
  const stat = execFileSync('git', ['show', '--stat', '--format=%h %ci%n%B', 'd76a3db2'], { encoding: 'utf8', timeout: 20000, cwd: MIN });
  console.log(stat.split('\n').slice(0, 40).join('\n'));
} catch (e) { console.log('FEL: ' + e.message); }
