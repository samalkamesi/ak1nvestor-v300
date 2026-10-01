// _v222-status.mjs — fabrik + prod-synk + långpollare-status i en läsning.
import fs from 'node:fs';
import { execFileSync } from 'node:child_process';
function ko(c, t = 20, cwd = '/home/ak1a/AK1') { try { return execFileSync('bash', ['-c', c], { encoding: 'utf8', timeout: t * 1000, cwd }).trim(); } catch { return null; } }

console.log('== FABRIKSTATUS auto-s8 ==');
try {
  const j = JSON.parse(fs.readFileSync('/home/ak1a/AK1/data/vakten/agentfabrik/status/auto-s8-1790822119281.json', 'utf8'));
  console.log(`${j.status} · klara ${j.klara.length}/${j.totalt} · underkända ${j.underkända.length} (försök: ${j.underkända.map(u => u.forsok).join(',') || '-'})`);
} catch (e) { console.log('(läsfel)'); }

console.log('\n== PROD-SYNKLOGG (sista 5) ==');
try { console.log(fs.readFileSync('/home/ak1a/AK1/data/vakten/prod-synk.log', 'utf8').split('\n').filter(r => r.trim()).slice(-5).join('\n')); } catch { console.log('(saknas)'); }

console.log('\n== PROD-YTA ==');
console.log(ko('git log --oneline -1'));
console.log('status:', ko('git status --short | head -6') || '(ren)');

console.log('\n== BYGGPROCESSER ==');
console.log(ko("ps -eo pid,etime,cmd | grep -E 'next build|npm ci' | grep -v grep | head -3") || '(inga)');

console.log('\n== LÅNGPOLLARE ==');
try { console.log(fs.readFileSync('/tmp/v222-langpollare.log', 'utf8').trim().split('\n').slice(-3).join('\n')); } catch { console.log('(startar)'); }
