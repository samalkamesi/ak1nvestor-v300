// Rond 161: snabbkoll v161-status + RAM + synk-svans.
import { execFileSync } from 'node:child_process';
import { readdirSync, readFileSync } from 'node:fs';

const d = '/home/ak1a/AK1/data/vakten/agentfabrik/status';
for (const f of readdirSync(d).filter((f) => f.includes('v161'))) {
  const j = JSON.parse(readFileSync(`${d}/${f}`, 'utf8'));
  console.log(f, '=>', j.status, '| klara', (j.klara || []).length, '/', j.totalt ?? '?');
}
console.log('ko:', readdirSync('/home/ak1a/AK1/data/vakten/agentfabrik/ko').join(', ') || '(tom)');
console.log('\nRAM:', execFileSync('free', ['-m'], { encoding: 'utf8' }).split('\n')[1].trim());
console.log('\nsynk-svans (3):');
console.log(readFileSync('/home/ak1a/AK1/data/vakten/prod-synk.log', 'utf8').trim().split('\n').slice(-3).join('\n'));
