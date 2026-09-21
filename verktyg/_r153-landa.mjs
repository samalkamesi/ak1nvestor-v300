// Rond 153 — landning (idempotent): git add -f bevisfiler + commit + push + disk-kopior till prod
import fs from 'node:fs';
import { execFileSync, execFile } from 'node:child_process';

const ROT = '/home/ak1a/agent/ak1';
const PROD = '/home/ak1a/AK1';

// 0. Idempotenskontroll
const log = execFileSync('git', ['log', '--oneline', '-5'], { cwd: ROT }).toString();
if (log.includes('rond 153')) { console.log('redan landad:', log.split('\n')[0]); process.exit(0); }

// 1. Disk-kopior till prod-trädet (pumporna läser sitt träd; beslutsminnet växer där)
const diskFiler = ['uppdrag-klart.json', 'r153-dod-sond.json', 'r153-vaktsond.json', 'r153-riktad-vakt.json'];
for (const f of diskFiler) {
  const kalla = `${ROT}/data/vakten/${f}`, mal = `${PROD}/data/vakten/${f}`;
  if (fs.existsSync(kalla)) fs.copyFileSync(kalla, mal);
}
// beslutsminne-rad till prod-trädet om den saknas där (raden identifieras av rond-tidsstämpeln)
const rad = fs.readFileSync(`${ROT}/data/vakten/beslutsminne.jsonl`, 'utf8').trim().split('\n').pop();
const prodBeslut = fs.existsSync(`${PROD}/data/vakten/beslutsminne.jsonl`)
  ? fs.readFileSync(`${PROD}/data/vakten/beslutsminne.jsonl`, 'utf8') : '';
if (!prodBeslut.includes('"rond":153')) fs.appendFileSync(`${PROD}/data/vakten/beslutsminne.jsonl`, rad + '\n');
// worklog-raden till prod-trädet också (dess klarsynta bokföring)
const wl = fs.readFileSync(`${ROT}/worklog.md`, 'utf8');
const prodWl = fs.readFileSync(`${PROD}/worklog.md`, 'utf8');
if (wl.includes('Rond 153') && !prodWl.includes('Rond 153 [organ:Ψ]')) {
  fs.appendFileSync(`${PROD}/worklog.md`, wl.slice(wl.indexOf('\n## Rond 153')));
}
console.log('disk-kopior + beslutsminne + worklog speglade till prod-trädet');

// 2. Commit: worklog + verktyg (vanligt) + data/vakten-bevis (‑f, fabrikens mönster)
execFileSync('git', ['add', 'worklog.md', 'verktyg/_r153-dod-sond.mjs', 'verktyg/_r153-vaktsond.mjs', 'verktyg/_r153-riktad-vakt.mjs', 'verktyg/_r153-bokfor.mjs', 'verktyg/_r153-landa.mjs'], { cwd: ROT, stdio: 'pipe' });
execFileSync('git', ['add', '-f', 'data/vakten/uppdrag-klart.json', 'data/vakten/r153-dod-sond.json', 'data/vakten/r153-vaktsond.json', 'data/vakten/r153-riktad-vakt.json'], { cwd: ROT, stdio: 'pipe' });
fs.writeFileSync('/tmp/r153-msg.txt', `studio: rond 153 [organ:Ψ] — kunduppdraget RAPPORTAKADEMIN stängt: DoD mekaniskt verifierad (snitt 200 ×2 · bedöm-först 200-kod/401 · vakt 0/4 EFTER deploy · 3 kur-anfäder i prod-HEAD) + uppdrag-klart.json + R2-påminnelse`);
execFileSync('git', ['commit', '-F', '/tmp/r153-msg.txt'], { cwd: ROT, stdio: 'pipe' });
console.log('COMMIT:', execFileSync('git', ['rev-parse', '--short', 'HEAD'], { cwd: ROT }).toString().trim());

// 3. Push: fetch-first + merge + retry ×3
const pusha = () => new Promise((res) => execFile('git', ['push', 'prod', 'develop'], { cwd: ROT, timeout: 60000 }, (fel, ut) => res({ fel, ut: String(ut) })));
let ok = false;
for (let i = 1; i <= 3 && !ok; i++) {
  try { execFileSync('git', ['fetch', 'prod', 'develop'], { cwd: ROT, stdio: 'pipe' }); } catch {}
  const r = await pusha();
  if (!r.fel) { console.log('PUSH GRÖN:', r.ut.trim().split('\n').pop()); ok = true; break; }
  console.log(`push-försök ${i} avvisad:`, r.fel.message.slice(0, 150));
  try { execFileSync('git', ['merge', '-X', 'theirs', '--no-edit', 'prod/develop'], { cwd: ROT, stdio: 'pipe' }); } catch (e) { console.log('merge:', String(e.stderr || e).slice(0, 120)); }
  await new Promise((r2) => setTimeout(r2, 15000));
}
console.log(ok ? 'KLAR: commit + push gröna' : 'PUSH VÄNTAR (prod-trädet upptaget av fabrik) — commit landad, disk-kopiorna lever redan i prod');
