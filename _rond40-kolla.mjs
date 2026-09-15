import { execSync } from 'node:child_process';
const run = (c) => { try { return execSync(c, { encoding: 'utf8', timeout: 60_000 }).trim(); } catch (e) { return 'FEL: ' + ((e.stdout || '') + (e.stderr || '')).trim().slice(0, 300); } };
console.log('ARB:', run('git -C /home/ak1a/agent/ak1 log -1 --format="%h %s"'));
console.log('PROD:', run('git -C /home/ak1a/AK1 log -1 --format="%h %s"'));
console.log('STATUS:', run('git -C /home/ak1a/agent/ak1 status --porcelain') || '(ren)');
