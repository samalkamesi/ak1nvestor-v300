// _v221-commit-pusha.mjs — stagar merge-lösningen, committar merge-commit, pushar prod.
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';

const ROT = '/home/ak1a/agent/ak1';
const MSG = '/home/ak1a/agent/ak1/verktyg/_v221-merge-msg2.txt';
const LOGG = '/tmp/v221-commit-pusha.log';
fs.writeFileSync(LOGG, `start ${new Date().toISOString()}\n`);
const logga = (s) => { fs.appendFileSync(LOGG, s + '\n'); console.log(s); };
const git = (args, t = 120000) => execFileSync('git', args, { encoding: 'utf8', timeout: t, cwd: ROT }).trim();

try {
  git(['add',
    'data/siffror.json', 'public/deep-courses.json', 'public/llms-full.txt',
    'public/llms.txt', 'public/sok-index.json', 'public/speglar-slugar.json',
    'src/lib/ai-mentor-register.ts', 'src/lib/larvag-karta.ts',
    'data/kurser-tillagg', 'data/forskning/r359-notis.md', 'verktyg/_s5u1o32-frontb.mjs',
    'verktyg/_s5u1o32-kvd.mjs', 'verktyg/_s5u1o32-llms.mjs', 'verktyg/_s5u1o32-mentorbyte.mjs',
    'verktyg/_s5u1o32-mentorlaka.mjs', 'verktyg/_s5u1o32-sond.mjs', 'verktyg/_s5u1o32-sond2.mjs',
    'verktyg/_s5u2o32-frontb.mjs', 'verktyg/_s5u2o32-kvd.mjs', 'verktyg/_s5u2o32-sond.mjs',
    'verktyg/_s5u3o33-frontb.mjs', 'verktyg/_s5u3o33-kvd.mjs', 'verktyg/_s5u3o33-mentorbyte.mjs',
    'verktyg/_s5u3o33-sond.mjs', 'verktyg/_s5u3o33-sond2.mjs',
  ]);
  logga('add OK');
  const com = git(['commit', '-F', MSG]);
  logga('commit: ' + com.split('\n').slice(0, 3).join(' | ').slice(0, 300));
  const push = git(['push', 'prod', 'develop'], 180000);
  logga('push: ' + push.split('\n').slice(-3).join(' | ').slice(0, 300));
  logga('HEAD: ' + git(['log', '--oneline', '-1']).slice(0, 120));
  const kvar = git(['rev-list', '--count', 'prod/develop..develop']);
  logga(`commits prod fortfarande saknar: ${kvar}`);
  logga('KLAR');
} catch (e) {
  logga('FEL: ' + String(e.message).slice(0, 300));
  logga('stdout: ' + String(e.stdout || '').slice(0, 500));
  logga('stderr: ' + String(e.stderr || '').slice(0, 800));
  process.exit(1);
}
