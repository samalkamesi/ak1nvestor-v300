// r330 sond 2: vem äger AK1:s smutsiga yta? fabrikens status + diff-kortlek
import { execSync } from 'node:child_process';
import fs from 'node:fs';

const sh = (cmd, timeout = 30000) => {
  try { return execSync(cmd, { cwd: '/bin', shell: '/bin/bash', encoding: 'utf8', timeout }).trim(); }
  catch (e) { return 'FEL: ' + (e.stdout || e.message).toString().slice(0, 200); }
};
const AK1 = '/home/ak1a/AK1';

console.log('=== FABRIKENS AKTIVA MANIFEST ===');
const ko = `${AK1}/data/vakten/agentfabrik/ko`;
const status = `${AK1}/data/vakten/agentfabrik/status`;
console.log(sh(`ls -t ${ko} 2>/dev/null | head -3`));
for (const f of sh(`ls -t ${status} 2>/dev/null | head -2`).split('\n')) {
  if (!f) continue;
  try {
    const j = JSON.parse(fs.readFileSync(`${status}/${f}`, 'utf8'));
    console.log(`${f}: status=${j.status} · ${j.klara ?? '?'}/${j.antal ?? (j.uppgifter ?? []).length} klara · pågående: ${(j.uppgifter ?? []).filter(u => u.status === 'kör' || u.status === 'pågår').map(u => u.id).join(',') || '–'}`);
  } catch { console.log(`${f}: (ej json)`); }
}

console.log('\n=== DE TRE FILERNA — diff-kortlek ===');
for (const f of ['data/siffror.json', 'public/deep-courses.json', 'public/llms-full.txt']) {
  const stat = sh(`git -C ${AK1} diff --stat -- '${f}' | tail -1`);
  console.log(`${f}: ${stat || '(ren)'}`);
}

console.log('\n=== ÄNDRINGSTIDER (lever barnet?) ===');
console.log(sh(`stat -c '%y %n' ${AK1}/data/siffror.json ${AK1}/public/deep-courses.json ${AK1}/public/llms-full.txt 2>/dev/null`));
console.log('nu: ' + sh("date -u '+%Y-%m-%d %H:%M:%S'"));
