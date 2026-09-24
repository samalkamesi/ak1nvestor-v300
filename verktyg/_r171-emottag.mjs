// Emottag av v164-fabriksleveranser (merge — push ägs fortfarande av pollen)
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
const WS = '/home/ak1a/agent/ak1';
const git = (args, cwd = WS, tmo = 300000) => execFileSync('git', args, { cwd, encoding: 'utf8', timeout: tmo, maxBuffer: 32 * 1024 * 1024 });

git(['fetch', 'prod', 'develop']);
const m = git(['merge', 'prod/develop', '-m', 'merge: emottag v164-fas3 första omgångarnas underlag (12/24) + s7-leveranser']);
console.log('merge:', m.trim().split('\n').filter(l => l.startsWith(' ') || l.includes('files changed')).slice(0, 3).join(' ; ').slice(0, 200));
console.log('HEAD:', git(['rev-parse', '--short', 'HEAD']).trim());
console.log('yta:', git(['status', '--porcelain']).trim() || 'REN');
const filer = fs.readdirSync(WS + '/data/forskning/KURS-FAS3').filter(f => f.endsWith('.md') || f.endsWith('.json'));
console.log('KURS-FAS3-filer:', filer.length);
console.log(filer.slice(0, 30).join('\n'));
