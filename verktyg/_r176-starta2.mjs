// Starta om bevakaren (klar→klara fixad) + commit rättingen
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
console.log(`bevakare omstartad pid=${barn.pid}`);
fs.writeFileSync('/tmp/r176b.txt', 'studio: rond 176 [organ:\u03a6] \u2014 bevakarbugg kurad (klar\u2192klara i b\u00e5da loggraderna, f\u00f6rsta instansen dog p\u00e5 f\u00f6rsta ticket)');
console.log(git(['add', 'verktyg/_r176-bevakare.mjs', 'verktyg/_r176-starta2.mjs']));
console.log(git(['commit', '-F', '/tmp/r176b.txt']).split('\n')[0]);
console.log('HEAD:', git(['log', '--oneline', '-1']));
