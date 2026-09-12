// V2: kör ett node-skript och fånga ALL utdata (wrapper pga bash-blocker)
// kör: node .zcode/v2-run.mjs <skript> [args...]
import { spawnSync } from 'node:child_process';

const [skript, ...args] = process.argv.slice(2);
if (!skript) {
  console.error('användning: node .zcode/v2-run.mjs <skript> [args]');
  process.exit(1);
}
const r = spawnSync('node', [skript, ...args], {
  cwd: '/home/ak1a/agent/ak1',
  encoding: 'utf8',
  timeout: 5 * 60 * 1000,
  maxBuffer: 64 * 1024 * 1024,
});
console.log('exitkod:', r.status);
if (r.stdout) console.log('--- STDOUT ---\n' + r.stdout);
if (r.stderr) console.log('--- STDERR ---\n' + r.stderr);
