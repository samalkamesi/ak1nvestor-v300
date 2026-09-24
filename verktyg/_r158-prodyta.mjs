// Rond 158: sond av prod-ytans smutsighet + fabrikens pågående barn.
import { execFileSync } from 'node:child_process';
import { readdirSync, readFileSync, existsSync, statSync } from 'node:fs';
import { join } from 'node:path';

const ws = '/home/ak1a/agent/ak1';
const prod = '/home/ak1a/AK1';

function prodGit(args) {
  return execFileSync(
    'git',
    ['--git-dir', `${prod}/.git`, '--work-tree', prod, ...args],
    { cwd: ws, encoding: 'utf8' }
  );
}

console.log('== PROD-YTA ==');
console.log(prodGit(['status', '--porcelain']).trim() || '(ren)');
console.log('\nprod-HEAD:', prodGit(['log', '-3', '--format=%h %ci %s']).trim());

console.log('\n== FABRIKENS KÖ (ko/) ==');
const ko = `${prod}/data/vakten/agentfabrik/ko`;
if (existsSync(ko)) {
  for (const f of readdirSync(ko)) {
    console.log('ko-fil:', f, '(mtime', new Date(statSync(join(ko, f)).mtime).toISOString(), ')');
  }
} else console.log('(ko-katalogen saknas)');

console.log('\n== FABRIKENS STATUS (senaste 5) ==');
const st = `${prod}/data/vakten/agentfabrik/status`;
if (existsSync(st)) {
  const filer = readdirSync(st).sort().slice(-5);
  for (const f of filer) {
    try {
      const j = JSON.parse(readFileSync(join(st, f), 'utf8'));
      console.log(f, '=>', j.status, '| titel:', j.titel || '?', '| klara:', (j.uppgifter || []).filter((u) => u.status === 'klar').length + '/' + (j.uppgifter || []).length);
    } catch { console.log(f, '(oläsbart)'); }
  }
} else console.log('(status-katalogen saknas)');

console.log('\n== DEPLOYLÅS ==');
try {
  console.log(execFileSync('bash', ['-c', 'cat /tmp/ak1a-deploy.lock 2>/dev/null; fuser /tmp/ak1a-deploy.lock 2>&1 || true'], { encoding: 'utf8' }).trim() || '(inget lås)');
} catch (e) { console.log('(låssond fel)', e.message.slice(0, 100)); }
