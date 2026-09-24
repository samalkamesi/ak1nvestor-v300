// Rond 174: commit v166-manifestet (parkerat)
import fs from 'node:fs';
import { execFileSync } from 'node:child_process';
const ws = '/home/ak1a/agent/ak1';
const git = (args, t = 300000) => execFileSync('git', args, { cwd: ws, timeout: t }).toString().trim();
// validera JSON först
JSON.parse(fs.readFileSync(`${ws}/data/forskning/KURS-FAS3/manifest-v166-fas3-djupintegrering.json`, 'utf8'));
fs.writeFileSync('/tmp/r174c.txt', 'studio: rond 174 [organ:\u03a6] \u2014 v166-manifest PARKERAT (24 djupkapitel-uppgifter, sl\u00e4ppregel: push-kedjan landad + prod-vakt GR\u00d6N f\u00f6rst)');
console.log(git(['add', 'data/forskning/KURS-FAS3/manifest-v166-fas3-djupintegrering.json',
  'verktyg/_r174-manifest.mjs', 'verktyg/_r174-bokfor2.mjs']));
console.log(git(['commit', '-F', '/tmp/r174c.txt']).split('\n')[0]);
console.log('HEAD:', git(['log', '--oneline', '-1']));
console.log('STATUS:', git(['status', '--porcelain']) || '(ren)');
