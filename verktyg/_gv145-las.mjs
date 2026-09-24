// Filtrera fram alla fynd (felAntal > 0) ur vaktrapporten
import { readFileSync } from 'node:fs';

const sökväg = process.argv[2] ?? '/home/ak1a/AK1/data/vakten/granssnitt-2026-09-21T113043.json';
const r = JSON.parse(readFileSync(sökväg, 'utf8'));

let totalt = 0;
const unikaFel = new Map();
for (const k of r.kombinationer) {
  if (!k.felAntal) continue;
  totalt += k.felAntal;
  console.log(`${k.tema}/${k.skarm} ${k.sida}: ${k.felAntal} fel`);
  for (const cf of k.konsolFel || []) {
    const antal = unikaFel.get(cf) ?? 0;
    unikaFel.set(cf, antal + 1);
    console.log(`   ${cf}`);
  }
}
console.log('\n=== TOTALT fel:', totalt, '===');
console.log('\n=== UNIKA FELMEDELANDEN ===');
for (const [msg, antal] of unikaFel) console.log(`[${antal}x] ${msg}`);
