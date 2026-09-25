// r257: commit [organ:Φ] + push prod — specifika filer, ALDRIG den andra sessionens _r257-integritet/rot-spad
import { execSync } from 'node:child_process';

const filer = [
  'PIPELINE-KO.md',
  'data/forskning/SEO-GUIDER-2026-09.md',
  'worklog.md',
  'data/blogg-utkast/investmentbolag-sa-analyserar-du-investmentbolag-en.json',
  'verktyg/_r257-b28-en-kvd.mjs',
  'verktyg/_r257-worklog.txt',
  'verktyg/_r257-worklog-append.mjs',
  'verktyg/_r257-commitmsg.txt',
  'verktyg/_r256-commit.txt',
  'verktyg/_r258-rondsond.mjs',
  'verktyg/_r259-klarmarkning.mjs',
  'verktyg/_r259-pipeline-jamf.mjs'
];

function sh(steg, cmd, tid = 300000) {
  try {
    const ut = execSync(cmd, { encoding: 'utf8', timeout: tid, cwd: '/home/ak1a/agent/ak1' });
    console.log('OK', steg, '|', ut.trim().slice(0, 300));
  } catch (e) {
    console.log('FEL', steg, '|', String(e.message).slice(0, 400));
    if (e.stdout) console.log('stdout:', String(e.stdout).slice(0, 400));
    process.exit(1);
  }
}

sh('add', 'git add ' + filer.join(' '));
sh('status-efter-add', 'git status --porcelain');
sh('commit', 'git commit -F verktyg/_r257-commitmsg.txt');
sh('hash', 'git log -1 --format=%h');
sh('push', 'git push prod develop');
sh('status-slut', 'git status --porcelain');
