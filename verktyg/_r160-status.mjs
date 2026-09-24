// Rond 160: snabbstatus — git-svans, yta + bevakarens interim-output.
import { execFileSync } from 'node:child_process';
import { readFileSync, existsSync } from 'node:fs';

const ws = '/home/ak1a/agent/ak1';
console.log('senaste commits:');
console.log(execFileSync('git', ['-C', ws, 'log', '-2', '--format=%h %ci %s'], { encoding: 'utf8' }).trim());
console.log('\nyta:');
console.log(execFileSync('git', ['-C', ws, 'status', '--porcelain'], { encoding: 'utf8' }).trim() || '(ren)');

const utfil = '/home/ak1a/.zcode/cli/exec/sess_6fcd696a-38cb-4978-8cc7-6a322e750a4d/call_8aec59db70ac4d10ae1c9921-stdout.log';
if (existsSync(utfil)) {
  const t = readFileSync(utfil, 'utf8');
  console.log('\nbevakarens output (' + t.length + ' tecken):');
  console.log(t.trim().slice(-600) || '(tom ännu)');
}
