// Amend:ar in commit-runern så ytan blir ren (push-pollen kräver det)
import { execSync } from 'node:child_process';
const WS = '/home/ak1a/agent/ak1';
execSync('git add verktyg/_r167-commit.mjs verktyg/_r167-amend.mjs', { cwd: WS, encoding: 'utf8', timeout: 60000 });
const commit = execSync('git commit --amend --no-edit', { cwd: WS, encoding: 'utf8', timeout: 420000, maxBuffer: 16 * 1024 * 1024 });
console.log(commit.split('\n').find(l => l.includes('develop')) || 'amendad');
const head = execSync('git rev-parse --short HEAD', { cwd: WS, encoding: 'utf8' }).trim();
const status = execSync('git status --porcelain', { cwd: WS, encoding: 'utf8' }).trim();
console.log('HEAD:', head, '| yta:', status || 'REN');
