// Steg 2c: tsc direkt (ej via git exec) + push
import { execFileSync, spawnSync } from 'node:child_process';
import { writeFileSync } from 'node:fs';

const logg = [];
const logga = (s) => { logg.push(s); console.log(s); };

// 1. tsc --noEmit via projektets binär, körd i ARB (npx utan git-wrapper)
logga('=== tsc --noEmit i ARB (projektbinär) ===');
const tsc = spawnSync('npx', ['tsc', '--noEmit'], {
  cwd: '/home/ak1a/agent/ak1',
  encoding: 'utf8',
  timeout: 420000,
});
const tscUt = (tsc.stdout || '') + (tsc.stderr || '');
logga(`tsc exit-kod: ${tsc.status}`);
if (tscUt.trim()) logga('tsc-utdata (första 3000 tecknen):\n' + tscUt.slice(0, 3000));

if (tsc.status !== 0) {
  writeFileSync('/home/ak1a/agent/ak1/.tmp-deploy-steg2c.txt', 'TSC FEL — AVBRYTER PUSH\n' + logg.join('\n'));
  console.log('AVBRYTER: tsc fel');
  process.exit(1);
}
logga('TSC: 0 FEL');

// 2. Push
logga('\n=== PUSH develop -> prod ===');
let pushOk = false;
try {
  const ut = execFileSync('git', ['-C', '/home/ak1a/agent/ak1', 'push', 'prod', 'develop'], { encoding: 'utf8', timeout: 120000 });
  logga('PUSH OK\n' + ut.trim());
  pushOk = true;
} catch (e) {
  logga('PUSH FEL: ' + String(e && e.message ? e.message : e));
}

// 3. Prod-HEAD som bevis
const prodHead = execFileSync('git', ['-C', '/home/ak1a/AK1', 'log', '-1', '--format=%h %s'], { encoding: 'utf8', timeout: 30000 }).trim();
logga('\n=== PROD HEAD efter push ===\n' + prodHead);

writeFileSync('/home/ak1a/agent/ak1/.tmp-deploy-steg2c.txt', logg.join('\n'));
console.log(pushOk ? 'STEG 2 KLAR' : 'PUSH MISSLYCKADES');
process.exit(pushOk ? 0 : 1);
