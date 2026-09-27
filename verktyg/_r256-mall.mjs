import fs from 'node:fs';
const u = JSON.parse(fs.readFileSync('data/portfolj-system/bolagsunivers.json', 'utf8'));
const lista = Array.isArray(u) ? u : (u.bolag || u.universum || Object.values(u)[0]);
console.log('antal:', lista.length);
const lt = lista.find((b) => b.ticker === 'LT.NS');
const ap = lista.find((b) => b.ticker === 'APOLLOHOSP.NS');
console.log('=== LT.NS ===');
console.log(JSON.stringify(lt, null, 1));
console.log('=== APOLLOHOSP.NS (fältnamn + korta värden) ===');
if (ap) {
  for (const [k, v] of Object.entries(ap)) {
    const s = typeof v === 'object' ? JSON.stringify(v) : String(v);
    console.log(`${k}: ${s.length > 90 ? s.slice(0, 90) + '…' : s}`);
  }
} else { console.log('(saknas)'); }
