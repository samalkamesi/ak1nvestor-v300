// Validerar registerhärdningen: syntax + torrkörning (fabriken rör inget i torr-läge)
import { execFileSync } from 'node:child_process';
const WS = '/home/ak1a/agent/ak1';
try {
  execFileSync('node', ['--check', 'verktyg/agentfabrik.mjs'], { cwd: WS, encoding: 'utf8', timeout: 60000 });
  console.log('syntax: OK');
} catch (e) { console.log('SYNTAXFEL:\n' + (e.stderr || e.message).slice(0, 1500)); process.exit(1); }
try {
  const ut = execFileSync('node', ['verktyg/agentfabrik.mjs', '--torr'], { cwd: WS, encoding: 'utf8', timeout: 120000, maxBuffer: 16 * 1024 * 1024 });
  console.log('torrkörning (sista rader):\n' + ut.trim().split('\n').slice(-6).join('\n'));
} catch (e) { console.log('TORR-FEL:\n' + ((e.stdout || '') + (e.stderr || '')).slice(0, 1500)); process.exit(1); }
