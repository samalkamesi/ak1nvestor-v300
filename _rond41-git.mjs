// Rond 41 — git-läge + tmp-filernas spår
import { execSync } from 'node:child_process';
const run = (c) => { try { return execSync(c, { encoding: 'utf8', timeout: 20_000, cwd: '/home/ak1a/agent/ak1' }).trim(); } catch (e) { return 'FEL: ' + (e.stdout || e.message).toString().slice(0, 150); } };
console.log('--- full status ---');
console.log(run('git status --porcelain') || '(ren)');
console.log('--- var blev .tmp-deploy-bygg-exit.txt trackad? ---');
console.log(run('git log -1 --format=%h %s -- .tmp-deploy-bygg-exit.txt'));
console.log('--- finns de i prod-trädet? ---');
console.log(run('git -C /home/ak1a/AK1 ls-files .tmp-deploy-bygg-exit.txt .tmp-deploy-steg1-status.mjs _rond40-bevis.mjs'));
console.log('--- gap 13-rad ---');
console.log(run("grep -n '| 13 |' data/forskning/ZCODE-GAP-REGISTER.md"));
