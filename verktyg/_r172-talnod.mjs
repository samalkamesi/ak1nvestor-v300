// Talmarkörsdensitet: alla tal + decimaler för domfälten
import { readFileSync } from 'node:fs';
const KAT = '/home/ak1a/agent/ak1/data/forskning/KURS-FAS3';
for (const f of ['f19-complete-turtletrader', 'f20-trend-following', 'f21-trading-in-the-zone']) {
  const b = readFileSync(KAT + '/underlag-' + f + '.md', 'utf8');
  const alla = (b.match(/\d+/g) || []).length;
  const dec = (b.match(/\d+[.,]\d+/g) || []).length;
  console.log(f, '| alla tal:', alla, '| decimaler:', dec);
}
