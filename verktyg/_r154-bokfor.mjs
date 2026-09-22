// Rond 154 — bokföring av våg 232-launch (idempotent)
import fs from 'node:fs';
import { execFileSync, execFile } from 'node:child_process';
const ROT = '/home/ak1a/agent/ak1';

const log = execFileSync('git', ['log', '--oneline', '-3'], { cwd: ROT }).toString();
if (log.includes('rond 154')) { console.log('redan landad'); process.exit(0); }

fs.appendFileSync(ROT + '/worklog.md', `
## Rond 154 [organ:Φ] — 2026-09-21 23:5xZ: VÅG 232 VERKSTÄLLD — fullsvep attempt 5 launchat som --fortsatt-återupptagning (fönstret öppnades: fabrik tom + RAM 5 631 MB ≥ 3 000 TUNG-krav + prod-byggt intakt)
Söndagens attempt 5 (r117-loggen) dog i evig RAM-väntan 1 429 MB — V228-checkpointningen bankade dock varje mätt svit, varför dagens launch (pid 829648, detached setsid, logg r154-fullsvep5-fortsatt.log) återupptar med --fortsatt istället för att börja om. Bevakare löper (tak 90 min, detekterar genererad>launch). Tidiga fynd i de deterministiska sviterna: TVÅ RÖDA ur fabrikens s6-u3-leverans (testa-ai-mentor-historia 25/1·26 + testa-ai-mentor-kapitalbindning 31/1·32) — diagnostiseras när svepets fulla rapport landar; resten hittills gröna. Push-retry-sonden från r153: PUSH GRÖN (df0847d3 i båda träden). PIPELINE: HM-omtolkning + SKF pdf-parse + branding våg 2 kvar i kön. [studio]
`);

const beslut = { ts: new Date().toISOString(), rond: 154, beslut: "Våg 232 verkställd i öppet fönster (fabrik tom + RAM 5,6 GB): fullsvep attempt 5 återupptaget med --fortsatt (V228-checkpoint bevarar söndagens mätta sviter); två tidiga röda i AI-Mentorn-sviter noterade för rotdiagnos", landat: "r154-fullsvep.mjs + bevakare + worklog" };
fs.appendFileSync(ROT + '/data/vakten/beslutsminne.jsonl', JSON.stringify(beslut) + '\n');

execFileSync('git', ['add', 'worklog.md', 'verktyg/_r154-lagesond.mjs', 'verktyg/_r154-forlaunch.mjs', 'verktyg/_r154-fullsvep.mjs', 'verktyg/_r154-svepbevakare.mjs', 'verktyg/_r154-bokfor.mjs'], { cwd: ROT, stdio: 'pipe' });
execFileSync('git', ['add', '-f', 'data/vakten/r154-lagesond.json', 'data/vakten/r154-forlaunch.json'], { cwd: ROT, stdio: 'pipe' });
fs.writeFileSync('/tmp/r154-msg.txt', 'studio: rond 154 [organ:Φ] — våg 232 verkställd: fullsvep attempt 5 återupptaget (--fortsatt, V228-checkpoint) i öppet fönster (fabrik tom, RAM 5,6 GB) + två tidiga AI-Mentorn-röda noterade');
execFileSync('git', ['commit', '-F', '/tmp/r154-msg.txt'], { cwd: ROT, stdio: 'pipe' });
console.log('COMMIT:', execFileSync('git', ['rev-parse', '--short', 'HEAD'], { cwd: ROT }).toString().trim());

const pusha = () => new Promise((res) => execFile('git', ['push', 'prod', 'develop'], { cwd: ROT, timeout: 60000 }, (fel, ut) => res({ fel, ut: String(ut) })));
let ok = false;
for (let i = 1; i <= 3 && !ok; i++) {
  try { execFileSync('git', ['fetch', 'prod', 'develop'], { cwd: ROT, stdio: 'pipe' }); } catch {}
  try { execFileSync('git', ['merge', '-X', 'theirs', '--no-edit', 'prod/develop'], { cwd: ROT, stdio: 'pipe' }); } catch {}
  const r = await pusha();
  if (!r.fel) { console.log('PUSH GRÖN'); ok = true; } else console.log(`push ${i}:`, r.fel.message.slice(0, 120));
  if (i < 3) await new Promise(r2 => setTimeout(r2, 15000));
}
if (!ok) console.log('PUSH VÄNTAR — commit landad lokalt');
