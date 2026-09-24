// Rond 160: emotta v161:s skog-en + pusha v160 P1-svepet (med kort retry).
import { execFileSync } from 'node:child_process';
import { readdirSync, readFileSync } from 'node:fs';

const ws = '/home/ak1a/agent/ak1';
const prod = '/home/ak1a/AK1';
function git(args, opts = {}) {
  return execFileSync('git', args, { cwd: ws, encoding: 'utf8', ...opts });
}

// v161-status + skog-en-filens läge
const stDir = `${prod}/data/vakten/agentfabrik/status`;
for (const f of readdirSync(stDir).filter((f) => f.includes('v161'))) {
  const j = JSON.parse(readFileSync(`${stDir}/${f}`, 'utf8'));
  console.log('v161:', j.status, (j.klara || []).length + '/' + j.totalt);
}
console.log('skog-en i prod:', readFileSync(`${prod}/data/blogg-utkast/skogsaktier-sa-analyserar-du-skogsbolag-en.json`, 'utf8').length, 'tkn');

git(['fetch', 'prod', 'develop']);
git(['merge', 'prod/develop', '-m', 'merge: emottag v161 skog-en (rond 160)'], { timeout: 240000 });
console.log('HEAD efter merge:', git(['log', '-1', '--format=%h %s']).trim().slice(0, 90));

for (let i = 1; i <= 3; i++) {
  try {
    git(['push', 'prod', 'develop'], { timeout: 60000 });
    console.log(`PUSH GRÖN (försök ${i})`);
    break;
  } catch (e) {
    const msg = String(e.stdout || '') + String(e.stderr || '');
    if (msg.includes('fetch first') || msg.includes('non-fast-forward')) {
      git(['fetch', 'prod', 'develop']);
      git(['merge', 'prod/develop', '-m', 'merge: emottag prod (rond 160 push-retry)'], { timeout: 240000 });
      console.log('emottog + merge OK');
    } else {
      console.log(`försök ${i} avvisad — väntar 60 s`);
      await new Promise((r) => setTimeout(r, 60000));
    }
  }
}
console.log('remote:', git(['ls-remote', 'prod', 'develop']).trim().split('\t')[0]);
console.log('ws-HEAD:', git(['log', '-1', '--format=%h']).trim());
console.log('yta:', git(['status', '--porcelain']).trim() || '(ren)');
