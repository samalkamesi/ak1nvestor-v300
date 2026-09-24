// Bokför worklog-raden + sondfiler, commit, och visar pollens senaste varv
import { execSync } from 'node:child_process';
import fs from 'node:fs';
const WS = '/home/ak1a/agent/ak1';
execSync('git add worklog.md verktyg/_r168-tsc.mjs 2>/dev/null || true', { cwd: WS, encoding: 'utf8', timeout: 60000 });
execSync('git add worklog.md', { cwd: WS, encoding: 'utf8', timeout: 60000 });
execSync('git commit -m "studio: rond 168 bokföring [organ:Φ] — worklog-rad (dataset-eyebrow 16/16 + pollhärdning) "', { cwd: WS, encoding: 'utf8', timeout: 420000, maxBuffer: 16 * 1024 * 1024 });
console.log('HEAD:', execSync('git rev-parse --short HEAD', { cwd: WS, encoding: 'utf8' }).trim());
console.log('yta:', execSync('git status --porcelain', { cwd: WS, encoding: 'utf8' }).trim() || 'REN');
console.log('--- pollstatus (sista 3) ---');
console.log(fs.readFileSync('/tmp/r167-pushpoll-status.txt', 'utf8').trim().split('\n').slice(-3).join('\n'));
