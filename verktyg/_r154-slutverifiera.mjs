// Rond 154 — slutverifiering: de 2 kurerade sviterna + kedjetestet + syntax på alla 43 + 3 stickprov
import { execFile, execFileSync } from 'node:child_process';
import fs from 'node:fs';
const ROT = '/home/ak1a/agent/ak1';
const u = { syntax: [], resultat: [] };

// 1. node --check på alla ändrade sviter (git diff-mängden)
const diffade = execFileSync('git', ['diff', '--name-only'], { cwd: ROT }).toString().trim().split('\n').filter(f => f.endsWith('.mjs'));
for (const f of diffade) {
  try { execFileSync('node', ['--check', f], { cwd: ROT, stdio: 'pipe' }); }
  catch (e) { u.syntax.push(f + ': ' + String(e.stderr || e).slice(0, 80)); }
}
u.antalDiffade = diffade.length;
console.log(`syntaxkontroll: ${diffade.length} filer, ${u.syntax.length} fel`);

// 2. De kurerade + kedjan + 3 stickprov ur de 41
const sviter = ['testa-ai-mentor-warrant.mjs', 'testa-ai-mentor-multipel.mjs', 'testa-ai-mentor-kedja.mjs',
  'testa-ai-mentor-bokmastar.mjs', 'testa-ai-mentor-grahamgolv.mjs', 'testa-ai-mentor-riskdjup.mjs'];
for (const s of sviter) {
  const r = await new Promise((res) => {
    execFile('node', ['verktyg/' + s], { cwd: ROT, timeout: 120000, maxBuffer: 8 * 1024 * 1024 }, (fel, ut) => res(String(ut)));
  });
  const dom = (r.match(/(\d+) PASS\s*[·\/]\s*(\d+) FAIL/i) || [])[0] ?? r.trim().split('\n').pop()?.slice(0, 80);
  u.resultat.push({ svit: s, dom });
  console.log(s.padEnd(42), dom);
}
fs.writeFileSync(ROT + '/data/vakten/r154-slutverifiering.json', JSON.stringify(u, null, 1));
