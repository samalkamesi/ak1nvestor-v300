// Rond 154 — FAIL-detajer efter kur: vilket test faller nu, och kom infogningen in?
import fs from 'node:fs';
import { execFile } from 'node:child_process';
const ROT = '/home/ak1a/agent/ak1';

// 1. Kom blocket in i historia-sviten?
const svit = fs.readFileSync(ROT + '/verktyg/testa-ai-mentor-historia.mjs', 'utf8');
console.log('har R154-blocket:', svit.includes('R154-harmonisering'));
console.log('har kategoristangning-strängen:', svit.includes('"svaraLokaltKategoristangning"'));
const ai = svit.indexOf('KOMPONENTER');
console.log('array-utdrag:', svit.slice(ai, ai + 400).split('\n').slice(0, 8).join('\n').slice(0, 380));

// 2. FAIL-raden LIVE
const r = await new Promise((res) => {
  execFile('node', ['verktyg/testa-ai-mentor-historia.mjs'], { cwd: ROT, timeout: 60000, maxBuffer: 4 * 1024 * 1024 }, (fel, ut) => res(String(ut)));
});
console.log('\nFAIL-rader nu:');
console.log(r.split('\n').filter(x => /FAIL/i.test(x)).join('\n').slice(0, 800));
