// Commit av rond 167 via node-kanalen (skalet hänger) — add + commit -F + hook passerar
import { execSync } from 'node:child_process';
const WS = '/home/ak1a/agent/ak1';
const filer = [
  'verktyg/_r167-barnsond.mjs', 'verktyg/_r167-cpu.mjs', 'verktyg/_r167-pushpoll2.mjs',
  'verktyg/_r167-rondsond.mjs', 'verktyg/_r167-kvsond.mjs', 'verktyg/_r167-kvrun.mjs',
  'verktyg/_r167-mimosatest.mjs', 'verktyg/_r167-pushpoll3.mjs', 'verktyg/_r167-gitstatus.mjs',
  'verktyg/_r167-commitmsg.txt', 'verktyg/_s1u2-investor-ater-kontroll.mjs',
  'worklog.md', 'data/forskning/PIPELINE-KO.md',
];
const add = execSync(`git add ${filer.join(' ')}`, { cwd: WS, encoding: 'utf8', timeout: 60000 });
console.log('add: ok');
const commit = execSync('git commit -F verktyg/_r167-commitmsg.txt', { cwd: WS, encoding: 'utf8', timeout: 420000, maxBuffer: 16 * 1024 * 1024 });
console.log(commit.slice(0, 400));
const head = execSync('git rev-parse --short HEAD', { cwd: WS, encoding: 'utf8' }).trim();
const status = execSync('git status --porcelain', { cwd: WS, encoding: 'utf8' }).trim();
console.log('HEAD:', head, '| yta efter:', status || 'REN');
