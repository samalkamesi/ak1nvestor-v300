// r330 retrypush: vänta ut fabrikens smutsiga yta i AK1, pusha när rent (max 8 min)
import { execSync } from 'node:child_process';

const YTA = '/home/ak1a/agent/ak1';
const sh = (cmd, timeout = 120000) => {
  try { return execSync(cmd, { cwd: YTA, shell: '/bin/bash', encoding: 'utf8', timeout, stdio: ['ignore', 'pipe', 'pipe'] }).toString().trim(); }
  catch (e) { return 'FEL: ' + ((e.stdout || '') + (e.stderr || e.message)).split('\n').filter(l => !l.startsWith('hint:') && !l.startsWith(' ')).join(' ').slice(0, 250); }
};

for (let försök = 1; försök <= 8; försök++) {
  const push = sh('git push prod develop 2>&1');
  const nu = new Date().toISOString().slice(11, 16);
  if (!push.startsWith('FEL')) {
    console.log(`[${nu}] PUSH OK (försök ${försök})`);
    console.log(sh('git log --oneline -1'));
    process.exit(0);
  }
  const yta = sh("git -C /home/ak1a/AK1 status --porcelain | head -3");
  console.log(`[${nu}] försök ${försök}: ${push.slice(0, 120)} · AK1-yta: ${yta.replace(/\n/g, ' | ').slice(0, 120) || 'ren'}`);
  await new Promise(r => setTimeout(r, 60000));
}
console.log('GAV UPP efter 8 försök — bokförs, nästa rond pushar');
process.exit(1);
