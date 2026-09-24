// rond 157: sond 2 — läge efter ETIMEDOUT + systemlast
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';

const R = '/home/ak1a/agent/ak1';
const ut = [];

ut.push('MERGE_HEAD kvar: ' + fs.existsSync(R + '/.git/MERGE_HEAD'));
ut.push('── log -3 ──');
ut.push(execFileSync('git', ['-C', R, 'log', '--oneline', '-3'], { encoding: 'utf8' }));
ut.push('── status --porcelain (första 8) ──');
ut.push(execFileSync('git', ['-C', R, 'status', '--porcelain'], { encoding: 'utf8' }).split('\n').slice(0, 8).join('\n'));
ut.push('── last ──');
ut.push(execFileSync('uptime', [], { encoding: 'utf8' }).trim());
ut.push(execFileSync('free', ['-m'], { encoding: 'utf8' }).split('\n').slice(1, 2).join(''));
ut.push('── tunga processer (top 5 CPU) ──');
ut.push(execFileSync('ps', ['--sort=-pcpu', '-eo', 'pid,pcpu,pmem,etime,comm', '--no-headers'], { encoding: 'utf8' }).split('\n').slice(0, 5).join('\n'));

console.log(ut.join('\n'));
fs.writeFileSync(R + '/data/vakten/r157-sond2.txt', ut.join('\n'));
