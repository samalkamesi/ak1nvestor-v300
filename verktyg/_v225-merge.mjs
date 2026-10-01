// _v225-merge.mjs — förena prod:s 10 auto-commits med min kön (rond 158-mönstret).
import { execFileSync } from 'node:child_process';
function ko(c, t = 90) { try { return execFileSync('bash', ['-c', c], { encoding: 'utf8', timeout: t * 1000, cwd: '/home/ak1a/agent/ak1' }).trim(); } catch (e) { return 'FEL: ' + String(e.stdout || e.message).split('\n').slice(-6).join('\n'); } }

console.log('== MERGE prod/develop -> develop ==');
console.log(ko('git merge prod/develop -m "merge: prod -> develop — v225-kön förenad med fabrikens auto-commits (s8/s9/s10 DR+vakt)" 2>&1 | tail -6'));
console.log('\n== STATUS EFTER ==');
console.log(ko('git status --short | head -15') || '(ren)');
console.log('\nKonflikter:', ko("git diff --name-only --diff-filter=U"));
console.log('HEAD:', ko('git log --oneline -2'));
