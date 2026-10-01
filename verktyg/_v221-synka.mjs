// _v221-synka.mjs — hämta prod:s leveranscommit + pusha develop tillbaka (r360-mönstret).
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';

const ROT = '/home/ak1a/agent/ak1';
const LOGG = '/tmp/v221-synka.log';
fs.writeFileSync(LOGG, `start ${new Date().toISOString()}\n`);
const logga = (s) => { fs.appendFileSync(LOGG, s + '\n'); console.log(s); };

try {
  const steg = [
    ['fetch', ['fetch', 'prod']],
    ['merge', ['merge', '--no-edit', '-m',
      'merge: prod -> develop — v221 fabrikens s5-lärvägleverans (82626725) inhämtad av trädägaren',
      'FETCH_HEAD']],
    ['push', ['push', 'prod', 'develop']],
  ];
  for (const [namn, args] of steg) {
    const ut = execFileSync('git', args, { encoding: 'utf8', timeout: 120_000, cwd: ROT });
    logga(`${namn} OK: ${ut.trim().slice(0, 400)}`);
  }
  const head = execFileSync('git', ['log', '--oneline', '-2'], { encoding: 'utf8', timeout: 15000, cwd: ROT });
  logga('HEAD nu:\n' + head.trim());
  logga('KLAR');
} catch (e) {
  logga('FEL: ' + String(e.message).slice(0, 400));
  logga('stdout: ' + String(e.stdout || '').slice(0, 600));
  logga('stderr: ' + String(e.stderr || '').slice(0, 600));
  process.exit(1);
}
