// r329 ompush: merge hem fabrikens commits + push + driftbevis-väntan
import { execSync } from 'node:child_process';

const YTA = '/home/ak1a/agent/ak1';
const sh = (cmd, timeout = 120000) => {
  try { return execSync(cmd, { cwd: YTA, shell: '/bin/bash', encoding: 'utf8', timeout, stdio: ['ignore', 'pipe', 'pipe'] }).toString().trim(); }
  catch (e) { return 'FEL: ' + ((e.stdout || '') + (e.stderr || e.message)).slice(0, 500); }
};
const steg = (n, f) => { const ut = sh(f); console.log(`[${ut.startsWith('FEL') ? 'FEL' : 'OK'}] ${n}: ${ut.slice(0, 350)}`); return ut; };

steg('fetch', 'git fetch prod develop');
steg('merge', 'git merge prod/develop --no-edit');
steg('push', 'git push prod develop');
steg('HEAD', 'git log --oneline -1');

console.log('\n=== VÄNTAR :x9-DRIFTBEVIS (max 11 min) ===');
const deadline = Date.now() + 11 * 60 * 1000;
while (Date.now() < deadline) {
  await new Promise(r => setTimeout(r, 45000));
  const loggrad = sh("tail -60 /home/ak1a/.pm2/logs/ak1a-pumpor-out.log | grep -E 'konfigintegritet' | tail -3");
  const nu = new Date().toISOString().slice(11, 16);
  console.log(`${nu}: ${loggrad.replace(/\n/g, ' ⏎ ').slice(0, 300) || '(ingen körning ännu)'}`);
  if (/konfigintegritet-vakt\.mjs slut kod=/.test(loggrad)) {
    const gron = sh("grep -c '11/11' /home/ak1a/AK1/data/vakten/konfigintegritetvakt.log || true");
    console.log(`DRIFTBEVIS: nya vakten har kört i AK1 (11/11-rader i loggen: ${gron.trim()})`);
    break;
  }
}
console.log('\nKLAR');
