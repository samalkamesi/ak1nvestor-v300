// r327 sond 8: bokföringsunderlag — worklog-svans, beslutsminnesfil, PIPELINE-svans
import { execSync } from 'node:child_process';
import fs from 'node:fs';

const sh = (cmd, timeout = 20000) => {
  try { return execSync(cmd, { cwd: '/bin', shell: '/bin/bash', encoding: 'utf8', timeout }).trim(); }
  catch (e) { return 'FEL: ' + (e.stdout || e.message).toString().slice(0, 200); }
};
const YTA = '/home/ak1a/agent/ak1';

console.log('=== worklog.md svans (12 rader) ===');
console.log(sh(`tail -12 ${YTA}/worklog.md`));

console.log('\n=== data/forskning — beslutsminne + pipeline ===');
console.log(sh(`ls ${YTA}/data/forskning/ | grep -iE 'BESLUT|PIPELINE'`));

const bm = `${YTA}/data/forskning/STYRELSE-BESLUTSMINNE.md`;
if (fs.existsSync(bm)) {
  console.log('\n=== BESLUTSMINNE svans (6 rader) ===');
  console.log(sh(`tail -6 ${bm}`));
}

console.log('\n=== PIPELINE-KO.md svans (35 rader) ===');
console.log(sh(`tail -35 ${YTA}/data/forskning/PIPELINE-KO.md`));

console.log('\n=== git-status kort ===');
console.log(sh(`cd ${YTA} && git status --porcelain`));
console.log(sh(`cd ${YTA} && git log --oneline -1`));
