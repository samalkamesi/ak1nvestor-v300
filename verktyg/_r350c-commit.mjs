// r350c: slut-commit — städa sonder, commit:a protokoll+worklog, pusha prod
import { execSync } from 'node:child_process';
import { rmSync } from 'node:fs';

const CWD = '/home/ak1a/agent/ak1';
const kör = (etikett, cmd) => {
  try {
    const ut = execSync(cmd, { cwd: CWD, timeout: 180000, stdio: ['ignore', 'pipe', 'pipe'] }).toString().trim();
    console.log(etikett + ': OK' + (ut ? '\n' + ut.split('\n').slice(0, 4).join('\n') : ''));
    return true;
  } catch (e) {
    console.log(etikett + ': FEL\n' + ((e.stdout || '') + (e.stderr || '')).toString().split('\n').slice(0, 10).join('\n'));
    return false;
  }
};

// städa rondens sonder
for (const f of ['_r350-debut', '_r350-paraply', '_r350-cron', '_r350-paraplydebut', '_r350-stad2', '_r350-merge']) {
  rmSync(CWD + '/verktyg/' + f + '.mjs', { force: true });
}

if (!kör('git add', 'git add -A')) process.exit(1);
if (!kör('git commit', 'git commit -F .tmp-r350c-msg.txt')) process.exit(1);
rmSync(CWD + '/.tmp-r350c-msg.txt', { force: true });
rmSync(CWD + '/verktyg/_r350c-commit.mjs', { force: true });
if (!kör('git push', 'git push prod develop')) process.exit(1);
kör('git status', 'git status --short');
kör('git log', 'git log --oneline -3');
