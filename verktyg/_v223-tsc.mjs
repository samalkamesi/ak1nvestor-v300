// _v223-tsc.mjs — typkontroll via node-kanalen (skalhäng-kuren).
import { execFileSync } from 'node:child_process';
try {
  const ut = execFileSync('node', ['node_modules/typescript/bin/tsc', '--noEmit'], { encoding: 'utf8', timeout: 570000, cwd: '/home/ak1a/agent/ak1' });
  console.log('TSC GRÖN — 0 fel');
} catch (e) {
  const ut = String(e.stdout || '');
  const fel = ut.split('\n').filter(r => r.includes('error TS'));
  console.log(`TSC FEL: ${fel.length}`);
  console.log(fel.slice(0, 10).join('\n'));
}
