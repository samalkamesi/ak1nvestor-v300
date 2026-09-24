// Starta bevakaren + commit mellanläget
import fs from 'node:fs';
import { execFileSync, spawn } from 'node:child_process';
import { openSync } from 'node:fs';
const ws = '/home/ak1a/agent/ak1';
const git = (args, t = 300000) => execFileSync('git', args, { cwd: ws, timeout: t }).toString().trim();
const out = openSync('/tmp/r176-bevakare.log', 'a');
const barn = spawn('node', ['/home/ak1a/agent/ak1/verktyg/_r176-bevakare.mjs'], {
  detached: true, stdio: ['ignore', out, out], env: process.env,
});
barn.unref();
console.log(`bevakare startad pid=${barn.pid}`);
fs.writeFileSync('/tmp/r176.txt', 'studio: rond 176 [organ:\u03a6] \u2014 v166-progress: d01-d03 granskade 33 PASS 0 FEL (3/24, alla kontraktskontroller gr\u00f6na) + autonom bevakare (emottag+granska var 2,5 min, rapport /tmp/r176-l\u00e4ge.txt)');
console.log(git(['add', 'data/forskning/KURS-FAS3/GRANSKNING-v166-SENASTE.md', 'verktyg/_r176-bevakare.mjs', 'verktyg/_r176-starta.mjs']));
console.log(git(['commit', '-F', '/tmp/r176.txt']).split('\n')[0]);
console.log('HEAD:', git(['log', '--oneline', '-1']));
