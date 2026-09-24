// extrahera hela cause-kedjan ur turn.failed-raderna
import { readFileSync } from 'node:fs';
const linjer = readFileSync('/home/ak1a/.zcode/cli/log/zcode-2026-09-24.jsonl', 'utf8').split('\n');
let n = 0;
for (const l of linjer) {
  if (!l.includes('"event":"turn.failed"')) continue;
  n++;
  if (n > 4) break;
  try {
    const j = JSON.parse(l);
    console.log(j.timestamp, '|', JSON.stringify(j.error, null, 1).slice(0, 1200));
    console.log('===');
  } catch { console.log('parse-fel'); }
}
console.log('totala turn.failed idag:', linjer.filter(l => l.includes('"event":"turn.failed"')).length);
