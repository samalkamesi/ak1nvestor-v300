// _v222-vanta.mjs — vänta in prod-ytans pågående fabriksleverans, pusha när ren.
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';

function ko(kommando, takSek = 30, cwd = '/home/ak1a/agent/ak1') {
  try { return execFileSync('bash', ['-c', kommando], { encoding: 'utf8', timeout: takSek * 1000, cwd }).trim(); }
  catch (e) { return null; }
}

console.log('== PROD STAGE-LÄGE NU ==');
console.log(ko('cd /home/ak1a/AK1 && git status --short | head -10', 20, '/home/ak1a/AK1'));
console.log('\n== FABRIKSSTATUS ==');
try {
  const fil = fs.readdirSync('/home/ak1a/AK1/data/vakten/agentfabrik/status').filter(f => f.startsWith('auto-s8')).sort().pop();
  const j = JSON.parse(fs.readFileSync('/home/ak1a/AK1/data/vakten/agentfabrik/status/' + fil, 'utf8'));
  console.log(`${j.id}: ${j.status} · klara ${j.klara.length}/${j.totalt} · underkända ${j.underkända.length}`);
} catch (e) { console.log('(läsfel)'); }

// Polla upp till 20 min: vänta på ren prod-yta ELLER att prod-HEAD går framåt
const startHead = 'b55660a4';
for (let i = 0; i < 40; i++) {
  await new Promise(r => setTimeout(r, 30000));
  const head = ko('git log --format=%h -1', 15, '/home/ak1a/AK1');
  const statusUt = ko('git status --short | head -4', 15, '/home/ak1a/AK1');
  const ren = statusUt === null || statusUt === '';
  if (head && head !== startHead) {
    console.log(`\n[${Math.round((i + 1) * 0.5)} min] PROD GICK FRAMÅT: ${head} — försöker pusha`);
    break;
  }
  if (ren) {
    console.log(`\n[${Math.round((i + 1) * 0.5)} min] PROD-YTAN REN — försöker pusha`);
    break;
  }
  if (i % 4 === 0) console.log(`[${Math.round((i + 1) * 0.5)} min] väntar: prod-ytan upptagen (${(statusUt || '?').split('\n').length} rader)`);
}

console.log('\n== PUSH-FÖRSÖK ==');
console.log(ko('git push prod develop 2>&1 | tail -3', 180));
const prodHead = ko('git log --format=%h -1', 15, '/home/ak1a/AK1');
console.log('\nPROD HEAD: ' + prodHead + (prodHead === 'ccac7fbd' || (prodHead || '').startsWith('ccac7fb') ? ' == MIN MERGE — PUSHEN LANDAD' : ' (ännu ej min)'));
