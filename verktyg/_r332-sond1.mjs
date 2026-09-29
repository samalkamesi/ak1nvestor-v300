// r332 sond 1 (v211): hur läser next start .meta? finns status-stöd? + /en-artefaktens rum
import { execSync } from 'node:child_process';
import fs from 'node:fs';

const sh = (cmd, timeout = 30000) => {
  try { return execSync(cmd, { cwd: '/bin', shell: '/bin/bash', encoding: 'utf8', timeout }).trim(); }
  catch (e) { return 'FEL: ' + (e.stdout || e.message).toString().slice(0, 200); }
};
const AK1 = '/home/ak1a/AK1';

console.log('=== NEXT-KÄLLAN: meta + status (base-server) ===');
console.log(sh(`grep -n 'metaStatus\\|"status"\\|status:' ${AK1}/node_modules/next/dist/server/base-server.js 2>/dev/null | grep -i 'meta\\|prerender' | head -10`));
console.log(sh(`grep -n -B3 -A10 'async function getMetaFilepathExtendedMetadata\\|loadMetaWithBlocking\\|readMetaFile' ${AK1}/node_modules/next/dist/server/base-server.js 2>/dev/null | head -40`));

console.log('\n=== _not-found.meta (referens för hur Next skriver 404-sidor) ===');
const nf = `${AK1}/.next/server/app/_not-found.meta`;
if (fs.existsSync(nf)) console.log(fs.readFileSync(nf, 'utf8').slice(0, 300));
else console.log(sh(`find ${AK1}/.next/server/app -maxdepth 1 -name '*not-found*'`));

console.log('\n=== EN/AR framtidssidor i artefakten? ===');
console.log(sh(`find ${AK1}/.next/server/app -path '*blogg/sa-laser-du-holm*' | head -8`));

console.log('\n=== 404:ans PRODUKTIONSSVARET för en känd publik sida som redirects? kontroll av meta-statusmekanism i next-server ===');
console.log(sh(`grep -rn '\\.status\\b' ${AK1}/node_modules/next/dist/server/next-server.js 2>/dev/null | grep -i meta | head -5`));
console.log(sh(`grep -n -A6 'prerender' ${AK1}/node_modules/next/dist/server/base-server.js 2>/dev/null | grep -n 'status' | head -8`));
