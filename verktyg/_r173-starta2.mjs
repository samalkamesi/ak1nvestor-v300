// Commit doda-skriptet + starta HÄRDADE dirigenten
import fs from 'node:fs';
import { execFileSync, spawn } from 'node:child_process';
import { openSync } from 'node:fs';
const ws = '/home/ak1a/agent/ak1';
const git = (args, t = 300000) => execFileSync('git', args, { cwd: ws, timeout: t }).toString().trim();
console.log(git(['add', 'verktyg/_r173-doda.mjs', 'verktyg/_r173-starta2.mjs']));
console.log(git(['commit', '-m', 'studio: rond 173 dirigentbyte [organ:\u03a6] \u2014 gamla dirigenten SIGKILL:ad, h\u00e4rdad (process-koll) startad efter emottag 81fabc02']).split('\n')[0]);
console.log('HEAD:', git(['log', '--oneline', '-1']));

const out = openSync('/tmp/r173-pushdirigent.log', 'a');
const barn = spawn('node', ['/home/ak1a/agent/ak1/verktyg/_r173-pushdirigent.mjs'], {
  detached: true, stdio: ['ignore', out, out], env: process.env,
});
barn.unref();
console.log(`h\u00e4rdad dirigent startad pid=${barn.pid}`);
console.log('STATUS:', git(['status', '--porcelain']) || '(ren)');
