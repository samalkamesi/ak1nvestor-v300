// Rond 154 — tålig push-retry för fa40a790 (väntar ut fabriksagent, mönster r153)
import fs from 'node:fs';
import { execFileSync, execFile } from 'node:child_process';
const ROT = '/home/ak1a/agent/ak1';
const utfall = { startad: new Date().toISOString(), forsok: [] };
const pusha = () => new Promise((res) => execFile('git', ['push', 'prod', 'develop'], { cwd: ROT, timeout: 60000 }, (fel, ut) => res({ fel, ut: String(ut) })));
let ok = false;
for (let i = 1; i <= 10 && !ok; i++) {
  try { execFileSync('git', ['fetch', 'prod', 'develop'], { cwd: ROT, stdio: 'pipe' }); } catch {}
  try { execFileSync('git', ['merge', '-X', 'theirs', '--no-edit', 'prod/develop'], { cwd: ROT, stdio: 'pipe' }); } catch {}
  const r = await pusha();
  utfall.forsok.push({ n: i, ok: !r.fel, medd: (r.fel ? r.fel.message : r.ut).slice(0, 100) });
  if (!r.fel) { utfall.status = 'PUSH GRÖN'; ok = true; break; }
  if (i < 10) await new Promise(r2 => setTimeout(r2, 180000));
}
if (!utfall.status) utfall.status = 'TAK UPPNÅTT';
fs.writeFileSync(ROT + '/data/vakten/r154-pushretry.json', JSON.stringify(utfall, null, 1));
console.log(utfall.status);
