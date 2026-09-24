// Rond 173: emottag — fetch prod + merge + statusrapport
import { execFileSync } from 'node:child_process';
const ws = '/home/ak1a/agent/ak1';
const p = (...a) => console.log(...a);
const git = (args) => execFileSync('git', args, { cwd: ws, timeout: 120000 }).toString().trim();

try {
  p('FETCH:', git(['fetch', 'prod', 'develop']) || 'OK (ingen utdata)');
} catch (e) { p('FETCH-fel:', e.status, String(e.stderr).slice(0, 300)); }

try {
  p('FETCH_HEAD:', git(['log', '--oneline', '-3', 'FETCH_HEAD']));
} catch (e) { p('log-fel:', String(e.stderr).slice(0, 300)); }

try {
  const merge = execFileSync('git', ['merge', 'FETCH_HEAD', '--no-edit'], { cwd: ws, timeout: 120000 }).toString().trim();
  p('MERGE:\n' + merge);
} catch (e) {
  p('MERGE-konflikt/status:', (e.stdout || '').slice(0, 1500));
  p('stderr:', String(e.stderr || '').slice(0, 300));
}

p('\nSTATUS:', git(['status', '--porcelain']));
p('HEAD:', git(['log', '--oneline', '-3']));
