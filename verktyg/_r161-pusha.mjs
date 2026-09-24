// Rond 161: tålig push-poll — väntar ut v159-barnen, pushar 1c7b9b7a-kedjan.
import { execFileSync } from 'node:child_process';

const ws = '/home/ak1a/agent/ak1';
function git(args, opts = {}) {
  return execFileSync('git', args, { cwd: ws, encoding: 'utf8', ...opts });
}

const deadline = Date.now() + 8 * 60 * 1000;
let försök = 0;
while (Date.now() < deadline) {
  försök++;
  try {
    git(['push', 'prod', 'develop'], { timeout: 60000 });
    console.log(`PUSH GRÖN på försök ${försök}`);
    console.log('remote:', git(['ls-remote', 'prod', 'develop']).trim().split('\t')[0]);
    console.log('ws-HEAD:', git(['log', '-1', '--format=%h']).trim());
    process.exit(0);
  } catch (e) {
    const msg = String(e.stdout || '') + String(e.stderr || '');
    const nonff = msg.includes('fetch first') || msg.includes('non-fast-forward');
    console.log(`försök ${försök}: ${nonff ? 'prod gått framåt — emottag' : 'prod-yta upptagen (v159-barn arbetar)'} — väntar 90 s`);
    if (nonff) {
      try {
        git(['fetch', 'prod', 'develop']);
        git(['merge', 'prod/develop', '-m', 'merge: emottag v159-leveranser (rond 161)'], { timeout: 240000 });
        console.log('merge OK');
      } catch (e2) {
        console.log('merge-fel:', String(e2.stdout || e2.message).slice(0, 250));
      }
    }
    await new Promise((r) => setTimeout(r, 90000));
  }
}
console.log('fönster utgick — push väntar fortfarande');
