#!/usr/bin/env node
// Rond 138: hitta den 404-resurs som gränssnittsvakten fann på /rapportakademin
const BAS = 'http://localhost:3000';
const r = await fetch(`${BAS}/rapportakademin`);
const html = await r.text();
console.log('sida-status:', r.status, 'längd:', html.length);
const ref = [...html.matchAll(/(?:src|href)="([^"]+)"/g)].map(m => m[1]);
const lokala = [...new Set(ref.filter(u => u.startsWith('/') && !u.startsWith('//') && !u.startsWith('/#')))];
console.log('lokala referenser:', lokala.length);
for (const u of lokala) {
  try {
    const h = await fetch(`${BAS}${u.split('#')[0].split('?')[0]}`, { method: 'HEAD' });
    if (h.status !== 200) console.log(`FYND ${h.status}: ${u}`);
  } catch (e) { console.log(`FEL ${u}: ${e.message}`); }
}
// favicon är en klassisk tyst 404 (chrome begär den automatiskt utan src-attribut)
try {
  const f = await fetch(`${BAS}/favicon.ico`, { method: 'HEAD' });
  console.log('favicon.ico:', f.status);
} catch (e) { console.log('favicon-fel:', e.message); }
console.log('SOND KLAR');
