// Rond 154 — landa del 2: radera överlevd dev-artefakt → tsc → commit → push
import fs from 'node:fs';
import { execFileSync, execFile } from 'node:child_process';
const ROT = '/home/ak1a/agent/ak1';

// 1. Radera .next/dev ( överlevd halvskriven artefakt från svepets döda TUNG-barn; ingen process äger den)
fs.rmSync(ROT + '/.next/dev', { recursive: true, force: true });
console.log('.next/dev raderad:', !fs.existsSync(ROT + '/.next/dev'));

// 2. tsc-grind (samma som pre-commit)
try {
  execFileSync('node', ['node_modules/typescript/bin/tsc', '--noEmit'], { cwd: ROT, stdio: 'pipe', timeout: 240000 });
  console.log('TSC GRÖN');
} catch (e) { console.log('TSC FEL:', String(e.stdout || e).slice(0, 300)); process.exit(1); }

// 3. Svepdöden bokförd i worklog (tilläggsrad)
fs.appendFileSync(ROT + '/worklog.md', `
### Rond 154 tillägg [organ:Φ]: fullsvepet dog ~00:11Z vid TUNG-sviten testa-styrelse (historisk mördare) efter 189 loggrader — .next/dev lämnades halvskriven av dess dev-barn och blockerade tsc-grinden; artefakten raderad (ingen ägande process), svepet återupptas med --fortsatt vid nästa fönster (V228-checkpointen bevarar allt mätta). [studio]
`);

// 4. Commit + push
const log = execFileSync('git', ['log', '--oneline', '-3'], { cwd: ROT }).toString();
if (!log.includes('harmoniseringskur')) {
  execFileSync('git', ['add', 'worklog.md', 'verktyg/testa-ai-mentor-*.mjs', 'verktyg/_r154-*.mjs'], { cwd: ROT, stdio: 'pipe' });
  execFileSync('git', ['add', '-f', 'data/vakten/r154-harmonisering.json', 'data/vakten/r154-harmonisering-v2.json', 'data/vakten/r154-harmonisering-v3.json', 'data/vakten/r154-verifiering.json', 'data/vakten/r154-slutverifiering.json', 'data/vakten/r154-tsc.json'], { cwd: ROT, stdio: 'pipe' });
  fs.writeFileSync('/tmp/r154c-msg.txt', 'studio: rond 154 del 2 [organ:Φ] — svitharmoniseringskur: 41 mentorsviter hela kedjan (83 lager) i widgetordning + warrant K03 495 + multipel L2 — alla gröna (314/0 kedjetest, 42 filer 0 syntaxfel); svepets .next/dev-artefakt raderad ur tsc-grinden');
  execFileSync('git', ['commit', '-F', '/tmp/r154c-msg.txt'], { cwd: ROT, stdio: 'pipe' });
  console.log('COMMIT:', execFileSync('git', ['rev-parse', '--short', 'HEAD'], { cwd: ROT }).toString().trim());
} else { console.log('commit redan landad'); }

const pusha = () => new Promise((res) => execFile('git', ['push', 'prod', 'develop'], { cwd: ROT, timeout: 60000 }, (fel, ut) => res({ fel, ut: String(ut) })));
let ok = false;
for (let i = 1; i <= 3 && !ok; i++) {
  try { execFileSync('git', ['fetch', 'prod', 'develop'], { cwd: ROT, stdio: 'pipe' }); } catch {}
  try { execFileSync('git', ['merge', '-X', 'theirs', '--no-edit', 'prod/develop'], { cwd: ROT, stdio: 'pipe' }); } catch {}
  const r = await pusha();
  if (!r.fel) { console.log('PUSH GRÖN'); ok = true; } else console.log(`push ${i}:`, r.fel.message.slice(0, 120));
  if (i < 3) await new Promise(r2 => setTimeout(r2, 15000));
}
if (!ok) console.log('PUSH VÄNTAR — commit landad');
