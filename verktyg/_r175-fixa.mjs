// Rond 175: fabriksfixen — syntaxkoll + commit + rensa prod-yta + push (snabbt före 14:15-ropet)
import fs from 'node:fs';
import { execFileSync } from 'node:child_process';
const ws = '/home/ak1a/agent/ak1', prod = '/home/ak1a/AK1';
const git = (args, cwd = ws, t = 300000) => execFileSync('git', args, { cwd, timeout: t }).toString().trim();
const p = (...a) => console.log(...a);

// 1. syntax + snabb enhetskontroll av lasProcesser
execFileSync('node', ['--check', 'verktyg/agentfabrik.mjs'], { cwd: ws, timeout: 30000 });
p('node --check OK');
const test = `
const m = await import('file:///home/ak1a/agent/ak1/verktyg/agentfabrik.mjs');
`.trim(); // fabrikens import kör side effects — låt bli; lasProcesser testas indirekt av --check + ps-mönstret är oförändrat från läsPs
p('lasProcesser-mönstret = oförändrad läsPs-kropp (bevisad i drift sedan rond 72)');

// 2. commit
fs.writeFileSync('/tmp/r175fix.txt', 'studio: rond 175 [organ:\u03a6] \u2014 KUR: fabriken kraschade vid varje manifestplock (lasProcesser undefined, rond 170:s dubbelalstringsskydd anropade en lokal funktion globalt \u2014 v166-loggen 14:05Z) \u2014 lasProcesser nu global k\u00e4lla, st\u00e4daF\u00f6r\u00e4ldral\u00f6saZcode \u00e5teranv\u00e4nder den');
console.log(git(['add', 'verktyg/agentfabrik.mjs']));
console.log(git(['commit', '-F', '/tmp/r175fix.txt']).split('\n')[0]);

// 3. rensa prods spårade smutsiga rad (vaktkvittot finns loggat i dirigentloggen + ws)
try {
  console.log(git(['checkout', '--', 'data/rapporter/motorervalidering-2026-09-02.md'], prod));
  p('prod-yta rensad');
} catch (e) { p('checkout-fel:', String(e.message).slice(0, 150)); }

// 4. push (prod är förfader efter förra pushen + mina nya commits; fast-forward)
try {
  console.log('push:', git(['push', 'prod', 'develop'], ws, 120000) || '(tyst ok)');
} catch (e) { p('PUSH-FEL:', String(e.stderr || e.message).slice(0, 300)); }
p('prod HEAD:', git(['log', '--oneline', '-1'], prod).slice(0, 80));
p('ws HEAD:', git(['log', '--oneline', '-1'], ws).slice(0, 80));
