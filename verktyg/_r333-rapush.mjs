// r333 råpush: visar HELA push-felet ofiltrerat + AK1:s mottagningshooks
import { execSync } from 'node:child_process';
import fs from 'node:fs';

const YTA = '/home/ak1a/agent/ak1';
const sh = (cmd, timeout = 120000) => {
  try { return execSync(cmd, { cwd: YTA, shell: '/bin/bash', encoding: 'utf8', timeout, stdio: ['ignore', 'pipe', 'pipe'] }).toString().trim(); }
  catch (e) { return 'RAW-FEL:\n' + ((e.stdout || '') + '\n' + (e.stderr || e.message)).trim(); }
};

console.log('=== AK1 hooks ===');
const hooks = '/home/ak1a/AK1/.git/hooks';
try {
  const aktiva = fs.readdirSync(hooks).filter(f => !f.endsWith('.sample'));
  console.log(aktiva.length ? aktiva.join(', ') : '(inga aktiva hooks)');
  for (const h of aktiva) {
    if (['pre-receive', 'update', 'post-receive'].includes(h)) {
      console.log(`--- ${h} ---\n` + fs.readFileSync(`${hooks}/${h}`, 'utf8').slice(0, 500));
    }
  }
} catch (e) { console.log('hook-läsfel: ' + e.message); }

console.log('\n=== core.hooksPath i AK1 ===');
console.log(sh('git -C /home/ak1a/AK1 config core.hooksPath') || '(ej satt)');

console.log('\n=== AK1 git-lås ===');
console.log(sh('ls /home/ak1a/AK1/.git/*.lock 2>/dev/null') || '(inga .git/*.lock)');
console.log(sh('ls /home/ak1a/AK1/.git/refs/heads/*.lock 2>/dev/null') || '(inga ref-lås)');

console.log('\n=== RÅ PUSH ===');
console.log(sh('git push prod develop'));

console.log('\n=== efter: remote vs lokal ===');
console.log('remote: ' + sh('git ls-remote prod develop').slice(0, 20));
console.log('lokal:  ' + sh('git rev-parse develop').slice(0, 20));
