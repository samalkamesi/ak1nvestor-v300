// _v223-tradkoll.mjs — mitt träds läge efter långpollarens merge-försök.
import { execFileSync } from 'node:child_process';
function ko(c, t = 20, cwd = '/home/ak1a/agent/ak1') { try { return execFileSync('bash', ['-c', c], { encoding: 'utf8', timeout: t * 1000, cwd }).trim(); } catch (e) { return null; } }
console.log('== MITT TRÄD ==');
console.log(ko('git log --oneline -3'));
console.log('yta: ' + (ko('git status --short | head -5') || '(ren)'));
console.log('merge-pågående: ' + (ko('test -f .git/MERGE_HEAD && echo JA || echo NEJ')));
console.log('\n== PROD ==');
console.log(ko('git log --oneline -1', 20, '/home/ak1a/AK1'));
console.log('lås: ' + (ko('flock -w 2 /tmp/ak1a-deploy.lock true && echo LEDIGT || echo UPPTAGET')));
