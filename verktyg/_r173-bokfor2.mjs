// Rond 173 (tillägg): commit dirigantfilerna — data/verktyg-only, ingen push
import fs from 'node:fs';
import { execFileSync } from 'node:child_process';
const ws = '/home/ak1a/agent/ak1';
const git = (args, t = 300000) => execFileSync('git', args, { cwd: ws, timeout: t }).toString().trim();

const msg = `studio: rond 173 till\u00e4gg [organ:\u03a6] \u2014 push-dirigent (v\u00e4ntar rent prod-f\u00f6nster: sp\u00e5dat-ren + ko tom + inga fabriksprocesser + RAM\u22651500, fast-forward-push utan bygge + prod-vakt) \u2014 push-pollen konstaterad d\u00f6d (sista rad 13:20Z), dirigenten \u00e4r kedjans vakthund tills deadline`;
fs.writeFileSync('/tmp/r173b-commitmsg.txt', msg);
console.log(git(['add', 'verktyg/_r173-pushdirigent.mjs', 'verktyg/_r173-starta-dirigent.mjs', 'verktyg/_r173-bokfor2.mjs']));
console.log(git(['commit', '-F', '/tmp/r173b-commitmsg.txt']));
console.log('HEAD:', git(['log', '--oneline', '-1']));
console.log('STATUS:', git(['status', '--porcelain']) || '(ren)');
