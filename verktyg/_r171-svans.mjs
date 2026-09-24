// Sista raderna ordagrant (node-kanalen)
import { readFileSync, readdirSync } from 'node:fs';
const KAT = '/home/ak1a/agent/ak1/data/forskning/KURS-FAS3';
for (const f of readdirSync(KAT).filter(f => /^underlag-(f01|f02|f04|f05|f08|f09|f11|f12)/.test(f)).sort()) {
  const sista = readFileSync(KAT + '/' + f, 'utf8').trimEnd().split('\n').pop();
  console.log('=== ' + f.slice(10, 13) + ' ===\n' + sista + '\n');
}
// f09 + f12 räkneexempel-form: vad innehåller sektion 3?
for (const pre of ['f09', 'f12']) {
  const f = readdirSync(KAT).find(x => x.includes('underlag-' + pre));
  const txt = readFileSync(KAT + '/' + f, 'utf8');
  const sekt3 = txt.split('## 3')[1]?.split('## 4')[0] ?? '';
  console.log('=== ' + pre + ' sektion 3 (första 400 tkn) ===\n' + sekt3.slice(0, 400) + '\n');
}
