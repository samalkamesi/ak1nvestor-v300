// r335 sond: lever soft-404-märkningen i AKTUELLA prod-artefakten? (r332:s fönster-notis-test)
// 8 framtids-slugar ur r332-drifttestet + kontrollpost (publikt inlägg = 200)
import { execSync } from 'node:child_process';
import fs from 'node:fs';

const slugar = [
  'sa-laser-du-ericsson-q3-2026',
  'sa-laser-du-evolution-q3-2026',
  'sa-laser-du-goldman-sachs-q3-2026',
  'sa-laser-du-holmen-q3-2026',
  'sa-laser-du-industrivarden-q3-2026',
  'sa-laser-du-nordea-q3-2026',
  'sa-laser-du-sandvik-q3-2026',
  'sa-laser-du-skf-b-q3-2026',
];
const KONTROLL = 'kassaflodesanalys-101'; // publikt inlägg — ska vara 200

console.log('=== AKTIV ARTEFAKT (.meta-status i /home/ak1a/AK1/.next) ===');
const grund = '/home/ak1a/AK1/.next/server/app/blogg';
let hittade = 0, markta = 0;
for (const s of slugar) {
  const p = `${grund}/${s}.meta`;
  if (!fs.existsSync(p)) { console.log(`${s}: .meta SAKNAS (on-demand?)`); continue; }
  hittade++;
  const meta = JSON.parse(fs.readFileSync(p, 'utf8'));
  const m = meta.status ?? 200;
  if (m === 404) markta++;
  console.log(`${s}: .meta status=${m}`);
}
console.log(`sammanfattning: ${hittade} statiska platser, ${markta} märkta 404`);

console.log('\n=== HTTP-DOM (localhost:3000) ===');
for (const [namn, slug] of [...slugar.slice(0, 3).map(s => ['framtids-' + s.slice(10, 25), s]), ['KONTROLL', KONTROLL]]) {
  try {
    const kod = execSync(`curl -s -o /dev/null -w '%{http_code}' http://localhost:3000/blogg/${slug}`, { timeout: 15000, shell: '/bin/bash' }).toString().trim();
    console.log(`${namn}: HTTP ${kod}`);
  } catch (e) { console.log(`${namn}: mätfel`); }
}
console.log('\nDOM: märkta=8 och framtids=404 och kontroll=200 ⇒ kuren lever; annars ⇒ SUDDAD av 09:37-bygget — märk om');
