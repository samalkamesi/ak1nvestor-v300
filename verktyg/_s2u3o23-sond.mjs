// sond: universumfördelning per bransch + cell (bransch/land) inför s2-u3 omg23-val
import { readFileSync } from 'node:fs';

const rows = JSON.parse(readFileSync('/home/ak1a/AK1/data/portfolj-system/bolagsunivers.json', 'utf8'));
const byBransch = {};
const cells = {};
for (const r of rows) {
  byBransch[r['bransch']] = (byBransch[r['bransch']] || 0) + 1;
  const k = r['bransch'] + '/' + r.land;
  cells[k] = (cells[k] || 0) + 1;
}
console.log('TOTALT:', rows.length);
console.log('=== BRANSCH ===');
for (const [k, v] of Object.entries(byBransch).sort()) console.log(k + ': ' + v);
console.log('=== CELLER med n>=2 (mogna) ===');
for (const [k, v] of Object.entries(cells).sort()) console.log(k + ': ' + v);
console.log('=== CELLER med n<=1 (födelsekandidater) ===');
for (const [k, v] of Object.entries(cells).sort()) if (v <= 1) console.log(k + ': ' + v);
console.log('=== ALLA TICKERS ===');
console.log(rows.map((r) => r.ticker).join(' '));
