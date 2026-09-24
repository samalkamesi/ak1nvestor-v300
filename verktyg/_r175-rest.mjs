import { execFileSync } from 'node:child_process';
const ws = '/home/ak1a/agent/ak1';
const git = (args, t = 300000) => execFileSync('git', args, { cwd: ws, timeout: t }).toString().trim();
console.log(git(['add', 'verktyg/_r175-rest.mjs', 'verktyg/_r174-kvitto.mjs']));
console.log(git(['commit', '-m', 'studio: rond 175 rest [organ:\u03a6] \u2014 rond 174:s kvitto-skript + denna']).split('\n')[0]);
console.log('STATUS:', git(['status', '--porcelain']) || '(ren)');
