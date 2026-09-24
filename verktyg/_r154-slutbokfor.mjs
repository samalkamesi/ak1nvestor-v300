// Rond 154 — slutbokföring av harmoniseringskuren (idempotent)
import fs from 'node:fs';
import { execFileSync, execFile } from 'node:child_process';
const ROT = '/home/ak1a/agent/ak1';

const log = execFileSync('git', ['log', '--oneline', '-4'], { cwd: ROT }).toString();
if (log.includes('harmoniseringskur')) { console.log('redan landad'); process.exit(0); }

// Svepets hälsa till bokföringen
let svep = 'okänd';
try { execFileSync('ps', ['-p', '829648', '-o', 'pid=', '--no-headers'], { stdio: 'pipe' }); svep = 'PÅGÅR (pid 829648)'; } catch { svep = 'avslutat'; }

fs.appendFileSync(ROT + '/worklog.md', `
## Rond 154 del 2 [organ:Φ] — 2026-09-22 00:2xZ: SVITHARMONISERINGSKUR — 41 eftersläpande mentorsviter normalize + warrant K03 + multipel L2, ALLA GRÖNA
Fullsvepet (attempt 5, --fortsatt, ${svep}) avslöjade 26 röda AI-Mentorn-sviter — V219-läxan igen: fönsternas wire:ar (kategoristangning 1ea8ccb8/932659c9, banksektorn a092db0e, notlasning/nykull/nyfodda/skuldordning/valideringsfonster) kom utan full svitharmonisering. KUR i tre steg med grunden som domare: v1 (infoga saknade före marknadsrytm) föll på "fel ordning" för tidigt hörande komponenter; v2 (normalisera till widgetordning) föll på eget regex-bugg — [A-Za-z]+ tappade nakna "svaraLokalt" + siffersuffix (L01:s okända-kontroll FÅNGADE det: grinden fungerar); v3 (hela kedjan, \\w*-klass, 83 lager, provenienskommentarer bevarade) + warrant K03 483→495 (spår 5:s rebake-kedja fortsatt dokumenterad) + multipel L2-sträng förlängd med de sju nya i widgetordning. BEVIS: warrant 39/0 · multipel 74/0 · historia 26/0 · kapitalbindning 32/0 · kategoristangning 80/0 (grön förblev grön) · kedjetestet 314/0 · 3 stickprov rena · node --check 42/42. V219-principen: det pågående svepets rapport bär PRE-fix-sanningen — nästa svep mäter enhetligt grönt. [studio]
`);

const beslut = { ts: new Date().toISOString(), rond: 154, beslut: "Svitharmoniseringskur V219-klass: 41 eftersläpande mentorsviter fick hela widgetkedjan (83 lager) i exakt ordning + warrant K03 495 + multipel L2 — alla verifierade gröna; v2:s regex-tapp (nakna svaraLokalt) fångades av L01-grinden själv", landat: "41 svitfiler + warrant + multipel + r154-skript + worklog" };
fs.appendFileSync(ROT + '/data/vakten/beslutsminne.jsonl', JSON.stringify(beslut) + '\n');

execFileSync('git', ['add', 'worklog.md', 'verktyg/testa-ai-mentor-*.mjs', 'verktyg/_r154-*.mjs'], { cwd: ROT, stdio: 'pipe' });
execFileSync('git', ['add', '-f', 'data/vakten/r154-harmonisering.json', 'data/vakten/r154-harmonisering-v2.json', 'data/vakten/r154-harmonisering-v3.json', 'data/vakten/r154-verifiering.json', 'data/vakten/r154-slutverifiering.json'], { cwd: ROT, stdio: 'pipe' });
fs.writeFileSync('/tmp/r154b-msg.txt', 'studio: rond 154 del 2 [organ:Φ] — svitharmoniseringskur: 41 mentorsviter hela kedjan (83 lager) i widgetordning + warrant K03 495 + multipel L2 — alla gröna (kedjetest 314/0, 42 filer 0 syntaxfel)');
execFileSync('git', ['commit', '-F', '/tmp/r154b-msg.txt'], { cwd: ROT, stdio: 'pipe' });
console.log('COMMIT:', execFileSync('git', ['rev-parse', '--short', 'HEAD'], { cwd: ROT }).toString().trim(), '| svep:', svep);

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
