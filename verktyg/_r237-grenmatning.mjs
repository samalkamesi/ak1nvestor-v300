#!/usr/bin/env node
/** _r237-grenmatning.mjs — Rond 237: mät Tysklands och Japans grenstruktur FÖRE formulering
 *  (rond 225:s läxa) + hela universumets 1-grens-karta för nästa-uppgift-valet. */
import { readFileSync } from "node:fs";
const u = JSON.parse(readFileSync('data/portfolj-system/bolagsunivers.json', 'utf8'));
console.log(`UNIVERSUM: ${u.length} rader\n`);

for (const land of ['Tyskland', 'Japan']) {
  const lr = u.filter(r => r.land === land);
  const g = {};
  for (const r of lr) g[r.bransch] = (g[r.bransch] ?? 0) + 1;
  const en = Object.entries(g).filter(([, n]) => n < 2).map(([k]) => k);
  console.log(`${land.toUpperCase()}: ${lr.length} rader — ${Object.entries(g).sort().map(([k, n]) => `${k} ${n}`).join(' · ')}`);
  console.log(`  ⇒ 1-grenar: ${en.length ? en.join(', ') : '(inga)'}\n`);
  for (const r of lr) console.log(`  · ${r.ticker} — ${r.namn.slice(0, 40)} [${r.bransch}]`);
  console.log('');
}

// Bonus: HELA universumets 1-grens-karta per land (nästa-uppgift-underlaget)
const lander = {};
for (const r of u) {
  lander[r.land] = lander[r.land] ?? {};
  lander[r.land][r.bransch] = (lander[r.land][r.bransch] ?? 0) + 1;
}
console.log('ALLA LÄNDERS 1-GRENAR (karta för nästa uppgift):');
for (const [land, g] of Object.entries(lander).sort()) {
  const en = Object.entries(g).filter(([, n]) => n < 2).map(([k]) => `${k}(${u.find(r => r.land === land && r.bransch === k)?.ticker})`);
  if (en.length) console.log(`  ${land}: ${en.join(' · ')}`);
}
