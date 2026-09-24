import { execFileSync } from 'node:child_process';
const ws = '/home/ak1a/agent/ak1';
const git = (args, t = 300000) => execFileSync('git', args, { cwd: ws, timeout: t }).toString().trim();
console.log(git(['add', 'verktyg/_r173-bokfor3.mjs', 'verktyg/_r173-bokfor4.mjs']));
console.log(git(['commit', '-m', 'studio: rond 173 verktygsrester [organ:Φ] — bokför3/4-skripten']).split('\n')[0]);
console.log('STATUS:', git(['status', '--porcelain']) || '(ren)');
