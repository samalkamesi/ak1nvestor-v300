// _v223-lage.mjs — hjärtslags-lägessond: prod/local HEAD, fabrik, byggen, ytor.
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
function ko(c, t = 20, cwd = '/home/ak1a/agent/ak1') { try { return execFileSync('bash', ['-c', c], { encoding: 'utf8', timeout: t * 1000, cwd }).trim(); } catch { return null; } }

console.log('== TID ==', new Date().toISOString());
console.log('\n== LOKALT ==');
console.log(ko('git log --oneline -4'));
console.log('yta: ' + (ko('git status --short | head -5') || '(ren)'));

console.log('\n== PROD ==');
console.log(ko('git log --oneline -4', 20, '/home/ak1a/AK1'));
console.log('yta: ' + (ko('git status --short | head -6', 20, '/home/ak1a/AK1') || '(ren)'));

console.log('\n== FABRIK auto-s8 ==');
try {
  const j = JSON.parse(fs.readFileSync('/home/ak1a/AK1/data/vakten/agentfabrik/status/auto-s8-1790822119281.json', 'utf8'));
  console.log(`${j.status} · klara ${j.klara.length}/${j.totalt} · underkända ${j.underkända.length}`);
  for (const k of j.klara) console.log('  klar:', k.id, k.forsok ? '(försök ' + k.forsok + ')' : '');
} catch (e) { console.log('(läsfel)'); }

console.log('\n== BYGGPROCESSER ==');
console.log(ko("ps -eo pid,etime,cmd | grep -E 'next build|npm ci' | grep -v grep | head -3") || '(inga)');

console.log('\n== DEPLOY-LÅS ==');
console.log(ko('flock -w 2 /tmp/ak1a-deploy.lock true && echo LEDIGT || echo UPPTAGET'));

console.log('\n== LÅNGPOLLARE ==');
try { console.log(fs.readFileSync('/tmp/v222-langpollare.log', 'utf8').trim().split('\n').slice(-3).join('\n')); } catch { console.log('(borta)'); }
console.log('\n== PROD-SONDER ==');
const sond = async (n, u) => { try { const s = await fetch(u, { redirect: 'manual', signal: AbortSignal.timeout(15000) }); console.log(`${n}: ${s.status}`); } catch (e) { console.log(`${n}: FEL`); } };
await sond('roten', 'https://lab.ak1nvestor.com/');
await sond('am-10 (fabrikens kurs)', 'https://lab.ak1nvestor.com/kurser/am-10-insynslistan');
await sond('zcode-rutt', 'https://lab.ak1nvestor.com/api/studio/stream');
