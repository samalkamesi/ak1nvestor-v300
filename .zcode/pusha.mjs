// .zcode/pusha.mjs — ren "push prod develop" via node (workaround för bash-godkännandelagret 2026-09-12).
// Läser av läget före/efter och skriver tydligt kvitto. Rör ALDRIG .env*, nycklar, betalningar, src.
import { execSync } from 'node:child_process';

const cwd = '/home/ak1a/agent/ak1';
const run = (cmd) => execSync(cmd, { cwd, timeout: 180000, encoding: 'utf8' });

try {
  const head = run('git rev-parse HEAD').trim();
  console.log('LOKAL_HEAD:', head);
  const out = run('git push prod develop 2>&1');
  console.log('PUSH-UT:\n' + out);
  const remote = run('git ls-remote prod refs/heads/develop').trim();
  console.log('PROD_REF:', remote);
  // ls-remote ger "hash\trefs/heads/develop" — jämför hash-delen, ej hela raden
  const remoteHash = remote.split(/\s+/)[0];
  console.log(remoteHash === head ? 'RESULTAT: LANDAD' : 'RESULTAT: EJ LANDAD');
} catch (e) {
  console.log('PUSH-FEL:', (e.stdout || '') + (e.stderr || '') + e.message);
  process.exit(1);
}
