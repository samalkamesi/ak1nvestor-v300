// Rond 40 — manuell fetch + merge + push med full utdata
import { execSync } from 'node:child_process';
import fs from 'node:fs';
const ARB = '/home/ak1a/agent/ak1';
const rad = (t) => console.log(t);
const run = (cmd) => execSync(cmd, { cwd: ARB, encoding: 'utf8', timeout: 300_000, stdio: ['pipe', 'pipe', 'pipe'] });

rad('=== FETCH ===');
rad(run('git fetch prod 2>&1'));
rad('=== MERGE prod/develop ===');
try {
  rad(run('git merge prod/develop -m "Merge branch \'develop\' of /home/ak1a/AK1 into develop" 2>&1'));
} catch (m) {
  rad('MERGE-KONFLIKT: ' + String(m.message).slice(0, 300));
  const status = run('git status --porcelain');
  rad('STATUS: ' + status.split('\n').slice(0, 10).join(' | '));
  const konflikter = status.split('\n').filter((r) => r.startsWith('UU'));
  if (konflikter.length > 0) {
    for (const r of konflikter) {
      const p = r.slice(3).trim();
      const txt = fs.readFileSync(ARB + '/' + p, 'utf8');
      fs.writeFileSync(ARB + '/' + p, txt.replace(/^(<{7}|={7}|>{7})[^\n]*\n/gm, ''));
      rad('löst (båda behållna): ' + p);
    }
    run('git add -A');
    rad(run('git commit --no-edit -m "merge-lösning: båda parters rader behållna" 2>&1'));
  }
}
rad('=== PUSH ===');
try {
  const ut = run('git push prod develop 2>&1');
  rad('PUSH OK — ' + ut.split('\n').filter((r) => r.includes('->') || r.includes('develop')).join(' ; '));
} catch (e) {
  rad('PUSH-FEL: ' + ((e.stdout || '') + (e.stderr || '')).slice(0, 500));
}
rad('ARB HEAD: ' + run('git log -1 --format=%h').trim());
