// Starta v2 + döda v1 (zombie) + commit verktygen
import fs from 'node:fs';
import { execFileSync, spawn } from 'node:child_process';
import { openSync } from 'node:fs';
const ws = '/home/ak1a/agent/ak1';
const git = (args, t = 300000) => execFileSync('git', args, { cwd: ws, timeout: t }).toString().trim();

// döda v1
try { process.kill(3273252, 'SIGKILL'); console.log('v1 (3273252) dödad'); }
catch (e) { console.log('v1-redan borta:', e.message); }

const out = openSync('/tmp/r174-dirigent2.log', 'a');
const barn = spawn('node', ['/home/ak1a/agent/ak1/verktyg/_r174-dirigent2.mjs'], {
  detached: true, stdio: ['ignore', out, out], env: process.env,
});
barn.unref();
console.log(`v2 startad pid=${barn.pid}, logg=/tmp/r174-dirigent2.log`);

fs.writeFileSync('/tmp/r174b.txt', 'studio: rond 174 [organ:\u03a6] \u2014 superdirigent v2 (emottag+merge+push+prod-vakt i en autonom loop, v1 zombie-d\u00f6dad) \u2014 buffringsfyndet dokumenterat: dirigentlogg till fil \u00e4r blockbuffrad, ps \u00e4r sanningen');
console.log(git(['add', 'verktyg/_r174-poll.mjs', 'verktyg/_r174-dirigent2.mjs', 'verktyg/_r174-starta-v2.mjs']));
console.log(git(['commit', '-F', '/tmp/r174b.txt']).split('\n')[0]);
console.log('HEAD:', git(['log', '--oneline', '-1']));
