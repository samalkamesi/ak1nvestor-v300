#!/usr/bin/env node
// Rond 228 — U31-SOND: UK/kommunikation 1→2 (UK:s sista 1-gren enligt U30-kön).
// (a) cellstatus i bolagsunivers.json (land+sektor), (b) kollisionskontroll för
//     kandidater (primär+sekundär notering — AZN-läxan), (c) cellens existerande
//     rad som strukturmall för nästa steg (hämtning). READ-ONLY sond.
import { readFileSync } from 'node:fs';

const ROT = '/home/ak1a/agent/ak1';
const uni = JSON.parse(readFileSync(`${ROT}/data/portfolj-system/bolagsunivers.json`, 'utf8'));
const rader = Array.isArray(uni) ? uni : (uni.bolag || uni.universum || uni.rader || []);
console.log(`UNIVERSUM: ${rader.length} rader (typ: ${Array.isArray(uni) ? 'array' : 'objekt med nycklar ' + Object.keys(uni).join(',')})`);

// Fältnamn (första raden)
if (rader[0]) console.log(`FÄLT (${Object.keys(rader[0]).length}): ${Object.keys(rader[0]).join(', ').slice(0, 400)}`);

// (a) UK + kommunikation
const f = r => (r.land || r.landon || '').toLowerCase();
const s = r => (r.sektor || r.bransch || '').toLowerCase();
const uk = rader.filter(r => f(r).includes('storbritannien') || f(r).includes('uk') || f(r) === 'gb');
console.log(`\nUK-RADER: ${uk.length}`);
const grupper = {};
for (const r of uk) { const k = r.sektor || r.bransch || '?'; grupper[k] = (grupper[k] || 0) + 1; }
console.log('UK per sektor:', JSON.stringify(grupper));
const ukKomm = uk.filter(r => s(r).includes('kommunikation') || s(r).includes('telekom') || s(r).includes('telecommunication'));
console.log(`\nUK/KOMMUNIKATION (${ukKomm.length} rad):`);
for (const r of ukKomm) console.log(`  ${r.ticker || r.symbol} — ${r.namn || r.bolag} (rad ${rader.indexOf(r) + 1})`);

// (b) Kollisionskontroll: VOD-läget i HELA universumet (primär+sekundär)
const kandidater = ['VOD', 'VOD.L', 'VOD.O', 'VOD.US', 'BT', 'BT.L', 'VMED', 'VMO2', 'TEF', 'ORA'];
console.log('\nKOLLISIONSKONTROLL (primär+sekundär i hela universumet):');
for (const t of kandidater) {
  const traf = rader.filter(r => (r.ticker || r.symbol || '').toUpperCase().includes(t.toUpperCase()));
  if (traf.length) for (const r of traf) console.log(`  TRÄFF ${t}: ${r.ticker || r.symbol} — ${r.namn || r.bolag} [${r.land}/${r.sektor}]`);
}
// Vodafone-namnträffar (ticker kan variera)
const vodNamn = rader.filter(r => (r.namn || r.bolag || '').toLowerCase().includes('vodafone'));
if (vodNamn.length) for (const r of vodNamn) console.log(`  NAMNTRÄFF vodafone: ${r.ticker || r.symbol} — ${r.namn || r.bolag} [${r.land}/${r.sektor}]`);
else console.log('  vodafone: 0 namnträffar — REN kandidat');

// (c) BT-radens fulla struktur som mall (första 25 fält + värdekort)
const bt = ukKomm[0];
if (bt) {
  console.log(`\nBT-RADEN SOM MALL (nycklar + korta värden):`);
  for (const [k, v] of Object.entries(bt).slice(0, 30)) console.log(`  ${k} = ${String(JSON.stringify(v)).slice(0, 100)}`);
}

// Cellens grannkontext: vad heter sektor-värdena i UK (för exakt match)
console.log(`\nUK-sektorvärden exakta: ${[...new Set(uk.map(r => r.sektor || r.bransch))].join(' | ')}`);
