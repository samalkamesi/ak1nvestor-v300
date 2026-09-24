// rond 157: merge-lägessond — visa status, konflikter, MERGE_HEAD
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';

const R = '/home/ak1a/agent/ak1';
const ut = [];

ut.push('MERGE_HEAD finns: ' + fs.existsSync(R + '/.git/MERGE_HEAD'));
ut.push('── status --short ──');
ut.push(execFileSync('git', ['-C', R, 'status', '--short'], { encoding: 'utf8' }).slice(0, 2000));
try {
  ut.push('── konfliktfiler (diff --name-only --diff-filter=U) ──');
  ut.push(execFileSync('git', ['-C', R, 'diff', '--name-only', '--diff-filter=U'], { encoding: 'utf8' }));
} catch (e) { ut.push('(inga/diff-fel: ' + String(e.message).slice(0, 100) + ')'); }
ut.push('── prod/develop HEAD ──');
ut.push(execFileSync('git', ['-C', R, 'log', '--oneline', '-1', 'prod/develop'], { encoding: 'utf8' }).trim());

console.log(ut.join('\n'));
fs.writeFileSync(R + '/data/vakten/r157-sond.txt', ut.join('\n'));
