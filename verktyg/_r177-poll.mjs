// Polla prod-trädets (arbetsyta /home/ak1a/AK1) renhet: unstaged/untracked?
import { execFileSync } from 'node:child_process';
try {
  const ut = execFileSync('git', ['-C', '/home/ak1a/AK1', 'status', '--porcelain'], { encoding: 'utf8', stderr: 'pipe' });
  const rader = ut.trim().split('\n').filter(Boolean);
  if (rader.length === 0) {
    console.log('PROD-TRÄD RENT — push kan gå igenom');
  } else {
    console.log(`PROD-TRÄD SMUTSIGT (${rader.length} rader):`);
    for (const r of rader.slice(0, 15)) console.log('  ' + r);
  }
  const head = execFileSync('git', ['-C', '/home/ak1a/AK1', 'log', '--oneline', '-1'], { encoding: 'utf8' });
  console.log('prod-trädets HEAD:', head.trim().slice(0, 100));
} catch (e) {
  console.log('SONDFEL:', ((e.stdout || '') + (e.stderr || '')).slice(0, 300));
}
