// Rond 161: emotta u2:s sent landade commit (8acb9782) i arbetsytan + push-kedja.
import { execFileSync } from 'node:child_process';

const ws = '/home/ak1a/agent/ak1';
function git(args, opts = {}) {
  return execFileSync('git', args, { cwd: ws, encoding: 'utf8', ...opts });
}

console.log('före: HEAD', git(['log', '-1', '--format=%h']).trim());
git(['fetch', 'prod', 'develop']);
console.log('prod/develop:', git(['log', 'prod/develop', '-1', '--format=%h %s']).trim().slice(0, 90));
git(['merge', 'prod/develop', '-m', 'merge: emottag u2:s fas2-djup 11-20 (rond 161)'], { timeout: 240000 });
console.log('efter: HEAD', git(['log', '-1', '--format=%h %s']).trim().slice(0, 90));
console.log('yta:', git(['status', '--porcelain']).trim() || '(ren)');
try {
  git(['push', 'prod', 'develop'], { timeout: 120000 });
  console.log('push: GRÖN');
} catch (e) {
  console.log('push avvisad:', String(e.stderr || e.message).slice(0, 140));
}
