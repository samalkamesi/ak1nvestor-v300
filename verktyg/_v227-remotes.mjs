// Sond v227: prod-trädets remotes + HEAD + senaste synkloggrader (drift-rond)
import { execFileSync } from 'node:child_process';

function git(args) {
  return execFileSync('git', ['-C', '/home/ak1a/AK1', ...args], { encoding: 'utf8' }).trim();
}

console.log('remotes:');
console.log(git(['remote', '-v']));
console.log('HEAD:', git(['rev-parse', 'HEAD']).slice(0, 8));
try {
  console.log('origin/develop:', git(['rev-parse', 'origin/develop']).slice(0, 8));
} catch (e) {
  console.log('origin/develop saknas:', String(e).slice(0, 80));
}
console.log('status (följda):', git(['status', '--porcelain', '--untracked-files=no']).split('\n').filter(Boolean).length, 'rader');
