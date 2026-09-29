// r333 sond 1: slutpush-läge + puppeteer/chrome-tillgång för v207-mätinstrumentet
import { execSync } from 'node:child_process';
import fs from 'node:fs';

const sh = (cmd, timeout = 30000) => {
  try { return execSync(cmd, { cwd: '/bin', shell: '/bin/bash', encoding: 'utf8', timeout }).trim(); }
  catch (e) { return 'FEL: ' + (e.stdout || e.message).toString().slice(0, 200); }
};
const AK1 = '/home/ak1a/AK1';
const YTA = '/home/ak1a/agent/ak1';

console.log('=== KLOCKA + SLUTPUSH ===');
console.log(sh("date -u '+%H:%M:%SZ'"));
console.log(fs.existsSync(`${YTA}/data/vakten/r330-slutpush-kvito.log`) ? fs.readFileSync(`${YTA}/data/vakten/r330-slutpush-kvito.log`, 'utf8').trim().split('\n').slice(-3).join('\n') : '(kvito saknas)');

console.log('\n=== YTOR ===');
console.log('min: ' + (sh(`git -C ${YTA} status --porcelain | head -2`) || '(ren)'));
console.log('AK1: ' + (sh(`git -C ${AK1} status --porcelain | head -2`) || '(ren)'));
console.log('AK1-HEAD: ' + sh(`git -C ${AK1} log --oneline -1`).slice(0, 90));

console.log('\n=== PUPPETEER-TILLGÅNG (gränssnittsvaktens mönster) ===');
console.log(sh(`ls -d ${AK1}/node_modules/puppeteer-core 2>/dev/null || echo 'puppeteer-core saknas'`));
console.log(sh(`ls -d ${AK1}/node_modules/puppeteer 2>/dev/null || echo 'puppeteer saknas'`));
console.log('chrome: ' + sh(`ls -1d ~/.cache/puppeteer/chrome/linux-*/chrome-linux64/chrome 2>/dev/null | sort -V | tail -1`));
console.log('vaktens import: ' + sh(`grep -n \"require('puppeteer\|from 'puppeteer\" ${AK1}/verktyg/granssnittsvakt.mjs | head -2`));

console.log('\n=== MOTORBUNTARNA I ARTEFAKTEN (chunk-namn) ===');
console.log('namnträffar: ' + sh(`ls ${AK1}/.next/static/chunks/ 2>/dev/null | grep -icE 'monte|kelly|sam|bayes|konfluens|super' || echo 0`));
console.log(sh(`find ${AK1}/.next/static -name '*.js' | wc -l`) + ' js-filer totalt i .next/static');
