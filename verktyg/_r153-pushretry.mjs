// Rond 153 — tålig push-retry: väntar ut fabrikens agent i prod-trädet (mönster rond 147)
import fs from 'node:fs';
import { execFileSync, execFile } from 'node:child_process';
const ROT = '/home/ak1a/agent/ak1';
const PROD = '/home/ak1a/AK1';
const utfall = { startad: new Date().toISOString(), forsok: [] };

const prodRen = () => {
  try { return execFileSync('git', ['-C', PROD, 'status', '--porcelain'], { stdio: 'pipe' }).toString().trim() === ''; }
  catch { return false; }
};
const pusha = () => new Promise((res) => execFile('git', ['push', 'prod', 'develop'], { cwd: ROT, timeout: 60000 }, (fel, ut) => res({ fel, ut: String(ut) })));

for (let i = 1; i <= 10; i++) {
  try { execFileSync('git', ['fetch', 'prod', 'develop'], { cwd: ROT, stdio: 'pipe' }); } catch {}
  // hämta in prods framsteg om det gått framåt (theirs: append-loggar unioneras av git)
  try { execFileSync('git', ['merge', '-X', 'theirs', '--no-edit', 'prod/develop'], { cwd: ROT, stdio: 'pipe' }); } catch {}
  const r = await pusha();
  utfall.forsok.push({ n: i, ts: new Date().toISOString(), ok: !r.fel, medd: (r.fel ? r.fel.message : r.ut).slice(0, 120) });
  if (!r.fel) { utfall.status = 'PUSH GRÖN'; break; }
  if (i < 10) await new Promise((r2) => setTimeout(r2, 180000)); // 3 min
}
if (!utfall.status) utfall.status = 'TAK UPPNÅTT — nästa rond pushar';
fs.writeFileSync(ROT + '/data/vakten/r153-pushretry.json', JSON.stringify(utfall, null, 1));
fs.writeFileSync(PROD + '/data/vakten/r153-pushretry.json', JSON.stringify(utfall, null, 1));
console.log(JSON.stringify(utfall.status));
