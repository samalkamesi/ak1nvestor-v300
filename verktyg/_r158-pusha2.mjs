// Rond 158: tålig push-poll — väntar ut fabrikens s10-barn, pushar när prod-ytan rensas.
import { execFileSync } from 'node:child_process';

const ws = '/home/ak1a/agent/ak1';
function git(args, opts = {}) {
  return execFileSync('git', args, { cwd: ws, encoding: 'utf8', ...opts });
}

const deadline = Date.now() + 8 * 60 * 1000; // 8 min (inom Bash-taken)
let försök = 0;
while (Date.now() < deadline) {
  försök++;
  try {
    git(['push', 'prod', 'develop'], { timeout: 60000 });
    console.log(`PUSH GRÖN på försök ${försök}`);
    console.log('remote:', git(['ls-remote', 'prod', 'develop']).trim());
    console.log('ws-HEAD:', git(['log', '-1', '--format=%h %s']).trim());
    process.exit(0);
  } catch (e) {
    const msg = String(e.stdout || '') + String(e.stderr || '') + String(e.message || '');
    const unstaged = msg.includes('unstaged');
    const nonff = msg.includes('non-fast-forward') || msg.includes('fetch first');
    console.log(`försök ${försök}: ${unstaged ? 'prod-yta smutsig (fabriksbarn arbetar)' : nonff ? 'prod gått framåt — emottag' : 'okänt fel'} — väntar 90 s`);
    if (nonff) {
      try {
        git(['fetch', 'prod', 'develop']);
        git(['merge', 'prod/develop', '-m', 'merge: emottag prod under push-väntan (rond 158)'], { timeout: 240000 });
        console.log('merge OK');
      } catch (e2) {
        console.log('merge-fel:', String(e2.stdout || e2.message).slice(0, 300));
      }
    }
    await new Promise((r) => setTimeout(r, 90000));
  }
}
console.log('DEADLINE (8 min) — push väntar fortfarande; nästa poll avser');
