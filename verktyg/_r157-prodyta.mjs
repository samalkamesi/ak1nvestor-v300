// rond 157: lista prod-trädets 29 smutsiga filer + senaste prod-commits
import { execFileSync } from 'node:child_process';

const P = '/home/ak1a/AK1';
const ut = [];
ut.push('── prod status --porcelain ──');
ut.push(execFileSync('git', ['-C', P, 'status', '--porcelain'], { encoding: 'utf8' }).trim());
ut.push('');
ut.push('── prod log -5 ──');
ut.push(execFileSync('git', ['-C', P, 'log', '--oneline', '-5'], { encoding: 'utf8' }).trim());
ut.push('');
ut.push('── senaste prod-commit i detalj (namn) ──');
ut.push(execFileSync('git', ['-C', P, 'log', '-1', '--format=%h %s'], { encoding: 'utf8' }).slice(0, 400));
console.log(ut.join('\n'));
