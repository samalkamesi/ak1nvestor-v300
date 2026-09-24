#!/usr/bin/env node
// ROND 106 — push av r106-commit + provenans för landningsskriptet + vänta-pusher vid behov
import { writeFileSync, unlinkSync, existsSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { spawn } from 'node:child_process';
const ARB = '/home/ak1a/agent/ak1';
const run = (c, a, o = {}) => execFileSync(c, a, { cwd: ARB, encoding: 'utf-8', ...o }).trim();
const isPAD = () => { try { run('git', ['merge-base', '--is-ancestor', 'HEAD', 'prod/develop']); return true; } catch { return false; } };

// provenans-commit av landningsskriptet (glömdes i r106-landa)
const msg = `${ARB}/verktyg/.r106b-msg.txt`;
writeFileSync(msg, 'studio: ROND 106 provenans — landningsskript (v211-manifest + PIPELINE/v212-bokning)');
run('git', ['add', 'verktyg/_r106-landa.mjs']);
try { console.log(run('git', ['commit', '-F', msg]).split('\n')[0]); } catch (e) { console.log('commit:', String(e).split('\n')[0]); }
if (existsSync(msg)) unlinkSync(msg);

for (let i = 1; i <= 3 && !isPAD(); i++) {
  try { console.log('push', i, ':', run('git', ['push', 'prod', 'develop']).split('\n').pop()); }
  catch (e) {
    const fel = String(e);
    console.log('push', i, 'fel:', fel.includes('staged changes') || fel.includes('unstaged') ? 'REN-YTA-GRIND' : fel.split('\n').filter((r) => r.includes('rejected')).join(' | ').slice(0, 100));
    if (!fel.includes('staged') && !fel.includes('unstaged')) { try { run('git', ['fetch', 'prod', 'develop']); run('git', ['merge', '--no-edit', 'prod/develop']); } catch (m) { console.log('merge:', String(m).slice(0, 80)); } }
  }
}
if (isPAD()) console.log('R106 PUSHEAD ✓', run('git', ['rev-parse', '--short', 'HEAD']));
else {
  const P = `${ARB}/verktyg/_r106-pusha.mjs`;
  writeFileSync(P, `#!/usr/bin/env node
import { appendFileSync, writeFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
const ARB = '${ARB}';
const run = (c, a) => execFileSync(c, a, { cwd: ARB, encoding: 'utf-8' }).trim();
const isPAD = () => { try { run('git', ['merge-base', '--is-ancestor', 'HEAD', 'prod/develop']); return true; } catch { return false; } };
const KVT = ARB + '/data/vakten/r106-push-kvitto.json';
for (let i = 1; i <= 30; i++) {
  if (isPAD()) { writeFileSync(KVT, JSON.stringify({ status: 'PUSHAD', hash: run('git', ['rev-parse', '--short', 'HEAD']), ts: new Date().toISOString() }, null, 2)); process.exit(0); }
  try { run('git', ['push', 'prod', 'develop']); if (isPAD()) { writeFileSync(KVT, JSON.stringify({ status: 'PUSHAD', hash: run('git', ['rev-parse', '--short', 'HEAD']), ts: new Date().toISOString() }, null, 2)); process.exit(0); } }
  catch (e) { try { run('git', ['fetch', 'prod', 'develop']); run('git', ['merge', '--no-edit', 'prod/develop']); } catch (m) {} }
  await new Promise((r) => setTimeout(r, 60_000));
}
writeFileSync(KVT, JSON.stringify({ status: 'UPPGIVEN', ts: new Date().toISOString() }, null, 2));
`);
  const p = spawn('node', [P], { detached: true, stdio: 'ignore' });
  p.unref();
  console.log('vänta-pusher r106 pid', p.pid);
}
