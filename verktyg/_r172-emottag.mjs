// Rond 172: emottag av v164 del 2 (f13+) — merge, aldrig push (pollen äger)
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
const WS = '/home/ak1a/agent/ak1';
const git = (args, tmo = 300000) => execFileSync('git', args, { cwd: WS, encoding: 'utf8', timeout: tmo, maxBuffer: 32 * 1024 * 1024 });
git(['fetch', 'prod', 'develop']);
const m = git(['merge', 'prod/develop', '-m', 'merge: emottag v164-fas3 del 2 (f13-f21, fabriken 21/24)']);
console.log('merge-ok:', m.includes('files changed') || m.trim().split('\n').slice(-1)[0].slice(0, 80));
console.log('HEAD:', git(['rev-parse', '--short', 'HEAD']).trim());
const nya = fs.readdirSync(WS + '/data/forskning/KURS-FAS3').filter(f => /^underlag-f(1[3-9]|2[0-4])/.test(f));
console.log('nya underlag f13-f24 i ytan:', nya.length, '→', nya.map(f => f.slice(10, 13)).join(','));
