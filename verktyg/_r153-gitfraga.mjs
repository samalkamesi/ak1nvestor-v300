import { execFileSync } from 'node:child_process';
const ROT = '/home/ak1a/agent/ak1';
const run = (args) => { try { return execFileSync('git', args, { cwd: ROT }).toString().trim(); } catch (e) { return 'FEL: ' + String(e.stderr || e).slice(0, 200); } };
console.log('tracked i data/vakten (första 5):');
console.log(run(['ls-files', 'data/vakten/']).split('\n').slice(0, 5).join('\n'));
console.log('--- beslutsminne tracked:', run(['ls-files', 'data/vakten/beslutsminne.jsonl']) || 'NEJ');
console.log('--- check-ignore uppdrag-klart:', run(['check-ignore', '-v', 'data/vakten/uppdrag-klart.json']) || 'ej ignorerad');
console.log('--- status kort:');
console.log(run(['status', '--porcelain']).split('\n').slice(0, 12).join('\n'));
