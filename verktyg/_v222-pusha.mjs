// _v222-pusha.mjs — pusha rundans commit till prod via node-kanalen.
import { execFileSync } from 'node:child_process';
try {
  const ut = execFileSync('bash', ['-c', 'git push prod develop 2>&1'], { encoding: 'utf8', timeout: 120000, cwd: '/home/ak1a/agent/ak1' });
  console.log(ut.trim());
} catch (e) {
  console.log('PUSH-FEL:\n' + String(e.stdout || '') + String(e.stderr || ''));
}
try {
  const efter = execFileSync('bash', ['-c', 'cd /home/ak1a/AK1 && git log --oneline -1'], { encoding: 'utf8', timeout: 20000 });
  console.log('\nPROD HEAD EFTER: ' + efter.trim());
} catch (e) { console.log('(prod-läsning fel: ' + e.message.split('\n')[0] + ')'); }
