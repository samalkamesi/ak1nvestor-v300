// Våg 149 — lägessonder: beslutsminne, prod-synk, styrelserond
import { readFileSync, existsSync } from 'node:fs';

const lasSista = (fil, n) => {
  if (!existsSync(fil)) return '(saknas: ' + fil + ')';
  const rader = readFileSync(fil, 'utf8').trim().split('\n');
  return rader.slice(-n).join('\n');
};

console.log('=== BESLUTSMINNE (sista 3) ===');
for (const r of lasSista('data/vakten/beslutsminne.jsonl', 3).split('\n')) {
  try {
    const j = JSON.parse(r);
    console.log('---', JSON.stringify({ tid: j.tid || j.stamp, vag: j.vag || j.våg, beslut: (j.beslut || j.titel || '').slice(0, 180) }));
  } catch { console.log('(oparsbar rad)', r.slice(0, 120)); }
}

console.log('\n=== PROD-SYNK (sista 6) ===');
console.log(lasSista('/home/ak1a/AK1/data/vakten/prod-synk.log', 6));

console.log('\n=== STYRELSEROND (sista 4) ===');
console.log(lasSista('/home/ak1a/AK1/data/vakten/styrelse-rond.log', 4));

console.log('\n=== FABRIKSSTATUS ===');
console.log(readFileSync('/home/ak1a/AK1/data/vakten/agentfabrik/status/zcode-paritet-v148.json', 'utf8'));
