// Rond 173: vaktkvitto-commit (motorervalideringsrapporten)
import fs from 'node:fs';
import { execFileSync } from 'node:child_process';
const ws = '/home/ak1a/agent/ak1';
const git = (args, t = 300000) => execFileSync('git', args, { cwd: ws, timeout: t }).toString().trim();
fs.writeFileSync('/tmp/r173c.txt', 'studio: rond 173 vaktkvitto [organ:\u03a6] \u2014 motorervalideringsrapporten f\u00e4rsk av rondens kvalitetsvakt (13/13 PASS 0 fel GR\u00d6N i arbetsytan)');
console.log(git(['add', 'data/rapporter/motorervalidering-2026-09-02.md']));
console.log(git(['commit', '-F', '/tmp/r173c.txt']).split('\n')[0]);
console.log('HEAD:', git(['log', '--oneline', '-1']));
console.log('STATUS:', git(['status', '--porcelain']) || '(ren)');
