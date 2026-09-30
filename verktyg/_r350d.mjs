// r350d: städ-commit — radera de två committade tmp-filerna + push
import { execSync } from 'node:child_process';
import { rmSync } from 'node:fs';

const CWD = '/home/ak1a/agent/ak1';
const kör = (etikett, cmd) => {
  try {
    const ut = execSync(cmd, { cwd: CWD, timeout: 180000, stdio: ['ignore', 'pipe', 'pipe'] }).toString().trim();
    console.log(etikett + ': OK' + (ut ? '\n' + ut.split('\n').slice(0, 3).join('\n') : ''));
    return true;
  } catch (e) {
    console.log(etikett + ': FEL\n' + ((e.stdout || '') + (e.stderr || '')).toString().split('\n').slice(0, 8).join('\n'));
    return false;
  }
};

rmSync(CWD + '/.tmp-r350c-msg.txt', { force: true });
rmSync(CWD + '/verktyg/_r350c-commit.mjs', { force: true });
if (!kör('git add', 'git add -A')) process.exit(1);
if (!kör('git commit', 'git commit -m "stad: r350-tmp — r350c-wrapperns egna filer ur trädet (self-cleanup efterskostnad)"')) process.exit(1);
if (!kör('git push', 'git push prod develop')) process.exit(1);
rmSync(CWD + '/verktyg/_r350d.mjs', { force: true });
kör('git status', 'git status --short');
kör('git log', 'git log --oneline -2');
