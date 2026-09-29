// r333 retrypush: diagnos + retry av push prod develop (node-kanalen, ofiltrerade fel)
import { execSync } from 'node:child_process';

const YTA = '/home/ak1a/agent/ak1';
const sh = (cmd, timeout = 120000) => {
  try { return execSync(cmd, { cwd: YTA, shell: '/bin/bash', encoding: 'utf8', timeout, stdio: ['ignore', 'pipe', 'pipe'] }).toString().trim(); }
  catch (e) { return 'FEL-EXIT: ' + ((e.stdout || '') + '\n' + (e.stderr || e.message)).trim().slice(0, 900); }
};

console.log('=== FETCH ===');
console.log(sh('git fetch prod 2>&1') || '(ok, tyst)');

console.log('\n=== DIVERGENS develop..prod/develop (nya i prod) ===');
console.log(sh('git log --oneline develop..prod/develop') || '(ingen)');

console.log('\n=== DIVERGENS prod/develop..develop (mina som saknas i prod) ===');
console.log(sh('git log --oneline prod/develop..develop | head -8') || '(ingen)');

console.log('\n=== AK1-status (lås/pågående) ===');
console.log(sh('git -C /home/ak1a/AK1 status --porcelain | head -5') || '(ren)');
console.log(sh('git -C /home/ak1a/AK1 log --oneline -1').slice(0, 120));

console.log('\n=== PUSH RETRY ===');
console.log(sh('git push prod develop 2>&1') || '(ok, tyst)');

console.log('\n=== VERIFIKATION ===');
console.log(sh('git ls-remote prod develop').slice(0, 60));
console.log(sh('git rev-parse develop').slice(0, 60));
console.log('\nKLAR retrypush');
