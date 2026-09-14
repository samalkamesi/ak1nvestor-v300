// Våg 149 — bokföringsskuld: lokal commit (UTAN push — data/vakten är
// gitignorerat runtime-tillstånd och committas inte)
import { execSync } from 'node:child_process';

const git = (k) => execSync(k, { stdio: ['ignore', 'pipe', 'pipe'] }).toString().trim();
console.log(git('git add worklog.md data/forskning/PIPELINE-KO.md .zcode/v149-commitmsg.txt .zcode/v149-lage.mjs .zcode/v149-bokfor.mjs'));
console.log(git('git commit -F .zcode/v149-commitmsg.txt'));
console.log('log:', git('git log --oneline -1'));
