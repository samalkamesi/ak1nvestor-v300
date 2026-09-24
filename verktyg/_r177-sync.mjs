// Sync-cykel: fetch prod → merge prod/develop → push prod develop.
// Avbryter ärligt vid merge-konflikt och listar unmerged filer.
import { execSync } from 'node:child_process';
const kör = (cmd) => {
  try {
    return { ok: true, ut: execSync(cmd, { encoding: 'utf8', stderr: 'pipe' }) };
  } catch (e) {
    return { ok: false, ut: (e.stdout || '') + (e.stderr || '') };
  }
};

console.log('== fetch ==');
let r = kör('git fetch prod 2>&1');
console.log(r.ok ? 'fetch OK' : 'fetch FEL: ' + r.ut.slice(0, 300));

console.log('== merge ==');
r = kör('git merge prod/develop --no-edit 2>&1');
console.log(r.ut.trim().slice(0, 500) || '(merge tyst OK)');
if (!r.ok) {
  const u = kör('git diff --name-only --diff-filter=U');
  console.log('UNMERGED:\n' + u.ut);
  console.log('SKRIPT AVBRYTER — konflikt kräver manuell lösning');
  process.exit(1);
}

console.log('== push ==');
r = kör('git push prod develop 2>&1');
console.log(r.ut.trim().slice(0, 400));
process.exit(r.ok ? 0 : 2);
