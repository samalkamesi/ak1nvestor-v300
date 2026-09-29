// r330 slutpush: vänta in s5-familjens commit-fönster (ren AK1-yta) → merge → push → kvito
import { execSync } from 'node:child_process';
import fs from 'node:fs';

const YTA = '/home/ak1a/agent/ak1';
const sh = (cmd, timeout = 120000) => {
  try { return execSync(cmd, { cwd: YTA, shell: '/bin/bash', encoding: 'utf8', timeout, stdio: ['ignore', 'pipe', 'pipe'] }).toString().trim(); }
  catch (e) { return 'FEL: ' + ((e.stdout || '') + (e.stderr || e.message)).split('\n').filter(l => !l.startsWith('hint:') && !l.startsWith(' ')).join(' ').slice(0, 200); }
};

const kvito = (text) => {
  try { fs.appendFileSync('/home/ak1a/agent/ak1/data/vakten/r330-slutpush-kvito.log', `${new Date().toISOString()} ${text}\n`); } catch {}
};

// Max 90 min (s5:s omgångar springer ~25 min + merge-fönster)
for (let i = 1; i <= 45; i++) {
  const yta = sh("git -C /home/ak1a/AK1 status --porcelain | head -2");
  if (!yta) {
    kvito('AK1-yta ren — pushar');
    sh('git fetch prod develop');
    const m = sh('git merge prod/develop --no-edit');
    kvito('merge: ' + (m.startsWith('FEL') ? m.slice(0, 120) : 'OK'));
    const p = sh('git push prod develop');
    kvito('push: ' + (p.startsWith('FEL') ? p.slice(0, 120) : 'OK'));
    if (!p.startsWith('FEL')) {
      kvito('HEAD: ' + sh('git log --oneline -1'));
      console.log('SLUTPUSH KLAR');
      process.exit(0);
    }
  } else {
    if (i % 5 === 1) kvito(`vantar (${i}): yta=${yta.replace(/\n/g, '|').slice(0, 80)}`);
  }
  await new Promise(r => setTimeout(r, 120000));
}
kvito('GAV UPP efter 90 min');
process.exit(1);
