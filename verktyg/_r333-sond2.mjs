// r333 sond 2: chrome-sokvag-export + motorchunk-identifiering + ytans node_modules
import { execSync } from 'node:child_process';
import fs from 'node:fs';

const sh = (cmd, timeout = 30000) => {
  try { return execSync(cmd, { cwd: '/bin', shell: '/bin/bash', encoding: 'utf8', timeout }).trim(); }
  catch (e) { return 'FEL: ' + (e.stdout || e.message).toString().slice(0, 150); }
};
const AK1 = '/home/ak1a/AK1';
const YTA = '/home/ak1a/agent/ak1';

console.log('=== chrome-sokvag.mjs export ===');
console.log(sh(`grep -n 'export' ${AK1}/verktyg/chrome-sokvag.mjs | head -4`));

console.log('\n=== motorchunk-kandidater (innehåll: MonteCarlo/kelly/Bayes) ===');
const träffar = sh(`grep -rl 'MonteCarlo\\|monteCarlo\\|kellyOptimal\\|bayesiansk' ${AK1}/.next/static/chunks/ 2>/dev/null | head -6`);
console.log(träffar || '(inga träffar i chunks/)');
console.log(sh(`grep -rl 'MonteCarlo\\|monteCarlo' ${AK1}/.next/static/chunks/app 2>/dev/null | head -6`) || '');

console.log('\n=== de 6 största chunks ===');
for (const f of sh(`ls -S ${AK1}/.next/static/chunks/*.js | head -6`).split('\n')) {
  const st = fs.statSync(f);
  console.log(`${(st.size / 1024).toFixed(0)} kB  ${f.split('/').pop()}`);
}

console.log('\n=== min ytans node_modules? ===');
console.log(sh(`ls -d ${YTA}/node_modules/puppeteer-core 2>/dev/null || echo 'saknas i ytan — createRequire mot AK1'`));
