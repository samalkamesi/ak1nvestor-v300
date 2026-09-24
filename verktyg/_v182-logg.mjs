// loggdiagnos: hitta Turn execution failed-rader i dagens zcode-logg + omkringliggande felorsaker
import { readFileSync } from 'node:fs';
const linjer = readFileSync('/home/ak1a/.zcode/cli/log/zcode-2026-09-24.jsonl', 'utf8').split('\n');
console.log('rader:', linjer.length);
const träff = [];
linjer.forEach((l, i) => { if (l.includes('Turn execution failed') || l.includes('79543a8c') || l.includes('995d3050')) träff.push(i); });
console.log('träffrader:', träff.length, träff.slice(-10).join(','));
// skriv ut de 6 sista träffarna + 2 rader efter varje (om det finns felorsaker)
for (const i of träff.slice(-6)) {
  for (let j = Math.max(0, i - 1); j <= Math.min(linjer.length - 1, i + 2); j++) {
    const l = linjer[j];
    if (l.length > 700) { console.log(j + ':', l.slice(0, 700)); } else console.log(j + ':', l);
  }
  console.log('---');
}
