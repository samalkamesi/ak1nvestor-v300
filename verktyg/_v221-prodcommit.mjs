// _v221-prodcommit.mjs — bokför fabrikens s5-leverans i PROD-ytan (trädägarens commit).
// add → commit -F (hook: R2 + speglar + tsc inkrementell) → rapport. Logg: /tmp/v221-prodcommit.log
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';

const PROD = '/home/ak1a/AK1';
const MSG = '/home/ak1a/agent/ak1/verktyg/_v221-prodcommit-msg.txt';
const LOGG = '/tmp/v221-prodcommit.log';
fs.writeFileSync(LOGG, `start ${new Date().toISOString()}\n`);
const logga = (s) => { fs.appendFileSync(LOGG, s + '\n'); console.log(s); };

const addVagar = [
  'data/kurser-tillagg',
  'data/siffror.json',
  'public/deep-courses.json',
  'public/llms-full.txt',
  'public/llms.txt',
  'public/sok-index.json',
  'public/speglar-slugar.json',
  'src/lib/ai-mentor-register.ts',
  'src/lib/larvag-karta.ts',
  'verktyg/_s5u1o32-frontb.mjs',
  'verktyg/_s5u1o32-kvd.mjs',
  'verktyg/_s5u1o32-llms.mjs',
  'verktyg/_s5u1o32-mentorbyte.mjs',
  'verktyg/_s5u1o32-mentorlaka.mjs',
  'verktyg/_s5u1o32-sond.mjs',
  'verktyg/_s5u1o32-sond2.mjs',
  'verktyg/_s5u2o32-frontb.mjs',
  'verktyg/_s5u2o32-kvd.mjs',
  'verktyg/_s5u2o32-sond.mjs',
  'verktyg/_s5u3o33-frontb.mjs',
  'verktyg/_s5u3o33-kvd.mjs',
  'verktyg/_s5u3o33-mentorbyte.mjs',
  'verktyg/_s5u3o33-sond.mjs',
  'verktyg/_s5u3o33-sond2.mjs',
];

try {
  const ut = execFileSync('git', ['add', ...addVagar], { encoding: 'utf8', timeout: 30000, cwd: PROD });
  logga('add OK: ' + ut.trim());
  const steg = execFileSync('git', ['diff', '--cached', '--stat'], { encoding: 'utf8', timeout: 15000, cwd: PROD });
  logga('stegat:\n' + steg.trim().slice(0, 1500));
  const com = execFileSync('git', ['commit', '-F', MSG], { encoding: 'utf8', timeout: 900_000, cwd: PROD });
  logga('commit OK: ' + com.trim().slice(0, 800));
  const head = execFileSync('git', ['log', '--oneline', '-1'], { encoding: 'utf8', timeout: 15000, cwd: PROD });
  logga('nytt HEAD: ' + head.trim());
  const status = execFileSync('git', ['status', '--porcelain'], { encoding: 'utf8', timeout: 15000, cwd: PROD });
  logga('kvarvarande smuts:\n' + (status.trim() || '(ren)'));
  logga('KLAR');
} catch (e) {
  logga('FEL: ' + String(e.message).slice(0, 500));
  logga('stdout: ' + String(e.stdout || '').slice(0, 800));
  logga('stderr: ' + String(e.stderr || '').slice(0, 2000));
  process.exit(1);
}
