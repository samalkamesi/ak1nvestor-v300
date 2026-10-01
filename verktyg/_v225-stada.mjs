// _v225-stada.mjs — skrota spöklåset + verifiera omkörningar.
import fs from 'node:fs';
import { execFileSync } from 'node:child_process';
const LOCK = '/home/ak1a/agent/ak1/data/vakten/agentfabrik/LOCK';
try {
  fs.renameSync(LOCK, LOCK.replace(/LOCK$/, 'LOCK.skrotad-manuell-v225'));
  console.log('spöklåset skrotat');
} catch (e) { console.log('(flytt: ' + e.message.split('\n')[0] + ')'); }
try {
  console.log('\n== TORRKÖRNING (direkt program — daemonens väg) ==');
  console.log(execFileSync('node', ['verktyg/agentfabrik.mjs', '--torr'], { encoding: 'utf8', timeout: 90000, cwd: '/home/ak1a/agent/ak1' }).trim().split('\n').slice(0, 8).join('\n'));
} catch (e) { console.log('FEL: ' + String(e.stdout || e.message).split('\n').slice(0, 6).join('\n')); }
try {
  console.log('\n== KONTRAKTSTEST ==');
  console.log(execFileSync('node', ['verktyg/testa-agentfabrik-deploygrind.mjs'], { encoding: 'utf8', timeout: 90000, cwd: '/home/ak1a/agent/ak1' }).trim());
} catch (e) { console.log('FEL: ' + String(e.stdout || e.message).split('\n').slice(-8).join('\n')); }
try {
  const efter = fs.readdirSync('/home/ak1a/agent/ak1/data/vakten/agentfabrik').filter(f => f.startsWith('LOCK'));
  console.log('\nLOCK-kataloger efter körningar:', efter.join(', ') || '(ingen — torrkörningen lämnade INTE nytt spöke)');
} catch {}
