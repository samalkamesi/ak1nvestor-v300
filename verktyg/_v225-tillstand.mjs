// _v225-tillstand.mjs — samla beslutsunderlag: divergens, src-beröring, fabrik, RAM.
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
function ko(c, t = 60) { try { return execFileSync('bash', ['-c', c], { encoding: 'utf8', timeout: t * 1000, cwd: '/home/ak1a/agent/ak1' }).trim(); } catch (e) { return 'FEL: ' + String(e.stdout || e.message).split('\n').slice(-3).join('\n'); } }

console.log('== KÖN MOT PROD (prod saknar) ==');
console.log(ko('git log --oneline prod/develop..develop'));
console.log('\nsrc-beröring i kön:', ko('git diff --stat prod/develop..develop -- src/ | tail -3') || '(INGEN — ren data/verktyg-leverans, inget npm-bygge krävs)');
console.log('antal filer totalt:', ko('git diff --name-only prod/develop..develop | wc -l'));

console.log('\n== PRODS LOKALA (jag saknar) ==');
console.log(ko('git log --oneline develop..prod/develop | head -12'));
console.log('\nsrc-beröring bland prods lokala:', ko('git diff --name-only develop...prod/develop -- src/ | head -5') || '(ingen)');

console.log('\n== FABRIK (prod-status) ==');
try {
  const dir = '/home/ak1a/AK1/data/vakten/agentfabrik/status';
  const filer = fs.readdirSync(dir).filter(f => f.endsWith('.json'));
  const aktiva = [];
  for (const f of filer) {
    try { const j = JSON.parse(fs.readFileSync(dir + '/' + f, 'utf8'));
      if (j.status !== 'klar') aktiva.push(`${f} status=${j.status} progress=${j.klara ?? '?'}/${j.totalt ?? '?'}`);
    } catch {}
  }
  console.log('statusfiler:', filer.length, '· icke-klara:', aktiva.length);
  for (const a of aktiva.slice(0, 8)) console.log(' ', a);
  const paaga = aktiva.filter(a => a.includes('pågår') || a.includes('vantar-ram'));
  console.log('AKTIVA i synkens ögon (pågår/vantar-ram):', paaga.length);
} catch (e) { console.log('(fel:', e.message.split('\n')[0], ')'); }

console.log('\n== AUTO-PAUS ==');
console.log('lever:', fs.existsSync('/home/ak1a/AK1/data/vakten/agentfabrik/AUTO-PAUS') ? 'JA (tas bort efter grön deploy)' : 'NEJ');

console.log('\n== RESURSER ==');
try { const m = fs.readFileSync('/proc/meminfo', 'utf8').match(/^MemAvailable:\s+(\d+) kB/m); console.log('RAM tillgängligt:', Math.round(Number(m[1]) / 1024), 'MB (synkens tak: 2200)'); } catch {}
console.log('deploy-lås flock-probe:', ko("exec 9<>/tmp/ak1a-deploy.lock && flock -n 9 && echo FREET || echo UPPTAGET"));

console.log('\n== PROD-SYNK LOGG (senaste 6) ==');
try { console.log(fs.readFileSync('/home/ak1a/AK1/data/vakten/prod-synk.log', 'utf8').trim().split('\n').slice(-6).join('\n')); } catch (e) { console.log('(ingen logg)'); }
