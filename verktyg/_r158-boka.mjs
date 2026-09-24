// Rond 158 bokföring: worklog-rad + add + commit -F + push + verifiering (node-kanalen).
import { execFileSync } from 'node:child_process';
import { appendFileSync, readFileSync } from 'node:fs';

const ws = '/home/ak1a/agent/ak1';

function git(args, opts = {}) {
  return execFileSync('git', args, { cwd: ws, encoding: 'utf8', ...opts });
}

function steg(namn, fn) {
  try {
    const ut = fn();
    console.log(`OK ${namn}:`, String(ut).trim().slice(0, 300));
    return true;
  } catch (e) {
    console.log(`FEL ${namn}:`, e.code || '', String(e.stdout || e.message).slice(0, 500));
    return false;
  }
}

// 1) Worklog-rad för kunddirektiv + bloggverifiering
const rad =
  '\n## ROND 158 bokföring [organ:Φ] — 2026-09-24: kunddirektiv emottaget (fortsätt på 8 GB — ingen uppgradering; kvalitet > kvantitet, ALDRIG kurser i massproduktion) + KUNDPRIORITET 1 LEVERERAD GRÖNT: /blogg verifierad LIVE (HTTP 200, exakt 94 unika inläggs-länkar = 94 json-filer på disk — kf1-fixen bevisad i prod); kö bokat: (2) branding-finslip alla publika sidor, (3) Fas 2-djup: 20 indikatorerna på djupet, (4) kvalitetsdoktrin. Verktyg: _r158-bloggverifiera.mjs (bevis).\n';
appendFileSync(`${ws}/worklog.md`, rad);
console.log('OK worklog-rad appendad');

// 2) Add allt utom commitmsg-filen
steg('add', () =>
  git([
    'add',
    'worklog.md',
    'verktyg/_r157-slutkontroll.mjs',
    'verktyg/_r158-merge.mjs',
    'verktyg/_r158-prodlage.mjs',
    'verktyg/_r158-pusha.mjs',
    'verktyg/_r158-bloggverifiera.mjs',
  ])
);

// 3) Commit med färdigt meddelande
steg('commit', () => git(['commit', '-F', 'verktyg/_r158-commitmsg.txt'], { timeout: 240000 }));

// 4) Push
steg('push', () => git(['push', 'prod', 'develop'], { timeout: 120000 }));

// 5) Verifiering: HEAD + remote-HEAD + yta
steg('verifiering', () => {
  const head = git(['log', '-1', '--format=%h %s']).trim();
  const remote = git(['ls-remote', 'prod', 'develop']).trim();
  const yta = git(['status', '--porcelain']).trim() || '(ren)';
  return `HEAD: ${head}\nremote: ${remote}\nyta: ${yta}`;
});
