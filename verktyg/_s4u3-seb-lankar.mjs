// Länkkontroll för sa-laser-du-seb-q3-2026.json — alla interna länkar HTTP 200 mot localhost (loopback är whitelistad).
import { readFileSync } from 'node:fs';

const body = JSON.parse(readFileSync('/home/ak1a/AK1/data/blogg-utkast/kvartal/2026-q3/sa-laser-du-seb-q3-2026.json', 'utf8')).body;
const paths = [...new Set([...body.matchAll(/\]\((\/[^)#?]+)[^)]*\)/g)].map((m) => m[1]))];
console.log('unika interna länkar:', paths.length);
let ok = 0, fel = 0;
for (const p of paths) {
  try {
    const r = await fetch('http://localhost:3000' + p);
    if (r.status === 200) { ok++; console.log('200', p); } else { fel++; console.log(r.status, p, 'FEL'); }
  } catch (e) { fel++; console.log('ERR', p, e.message); }
}
console.log(`=== LÄNKAR: ${ok} OK · ${fel} FEL ===`);
process.exit(fel ? 1 : 0);
