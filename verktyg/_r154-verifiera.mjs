// Rond 154 — verifiering av harmoniseringen: röda→gröna, gröna förblir gröna, kedjetestet
import { execFile } from 'node:child_process';
const ROT = '/home/ak1a/agent/ak1';
const sviter = [
  'testa-ai-mentor-historia.mjs',        // ursprungligt röd
  'testa-ai-mentor-kapitalbindning.mjs', // ursprungligt röd
  'testa-ai-mentor-kategoristangning.mjs', // var GRÖN — får ej brytas
  'testa-ai-mentor-warrant.mjs',         // rapport-röd (2 FAIL)
  'testa-ai-mentor-multipel.mjs',        // rapport-röd
  'testa-ai-mentor-kedja.mjs',           // kedjekontraktet (fall H)
];
const u = { resultat: [] };
for (const s of sviter) {
  const r = await new Promise((res) => {
    execFile('node', ['verktyg/' + s], { cwd: ROT, timeout: 120000, maxBuffer: 8 * 1024 * 1024 },
      (fel, ut) => res({ fel, ut: String(ut) }));
  });
  const dom = (r.ut.match(/(\d+) PASS\s*·\s*(\d+) FAIL/i) || r.ut.match(/(\d+) PASS\s*\/\s*(\d+) FAIL/i) || [])[0] ?? '?';
  const sista = r.ut.trim().split('\n').filter(x => x.trim()).pop()?.slice(0, 110) ?? '';
  u.resultat.push({ svit: s, dom: dom || sista, fel: r.fel ? String(r.fel).slice(0, 60) : null });
  console.log(s.padEnd(45), dom || sista);
}
import fs from 'node:fs';
fs.writeFileSync(ROT + '/data/vakten/r154-verifiering.json', JSON.stringify(u, null, 1));
