// _v225-koll.mjs — syntaxkoll + kontraktstest körning.
import { execFileSync } from 'node:child_process';
function ko(c, t = 60) { try { return execFileSync('bash', ['-c', c], { encoding: 'utf8', timeout: t * 1000, cwd: '/home/ak1a/agent/ak1' }).trim(); } catch (e) { return 'FEL: ' + String(e.stdout || e.message).split('\n').slice(-5).join('\n'); } }
console.log('fabrik:', ko('node --check verktyg/agentfabrik.mjs && echo SYNTAX-OK'));
console.log('synk:  ', ko('node --check verktyg/prod-synk.mjs && echo SYNTAX-OK'));
console.log('\ntest:');
console.log(ko('node verktyg/testa-agentfabrik-deploygrind.mjs', 120));
