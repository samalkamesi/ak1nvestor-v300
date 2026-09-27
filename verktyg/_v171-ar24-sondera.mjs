// AR24-sondering del 3: publishedAt-konvention + H2 + sista kontroller ur mallen
import { readFileSync } from 'node:fs';
for (const [namn, fil] of [
  ['skog-sv', 'skogsaktier-sa-analyserar-du-skogsbolag.json'],
  ['skog-ar', 'skogsaktier-sa-analyserar-du-skogsbolag-ar.json'],
  ['medtech-sv', 'medtechaktier-sa-analyserar-du-medicintekniska-bolag.json'],
  ['bygg-en', 'byggaktier-sa-analyserar-du-byggbolag-en.json'],
]) {
  const f = JSON.parse(readFileSync('/home/ak1a/agent/ak1/data/blogg-utkast/' + fil, 'utf8'));
  const h2 = [...f.body.matchAll(/^## /gm)].length;
  console.log(`${namn}: publishedAt=${f.publishedAt} H2=${h2} ord=${f.body.split(/\s+/).filter(Boolean).length} tags=${f.tags.length}`);
}
const k = readFileSync('/home/ak1a/agent/ak1/verktyg/_s3u3-b26-ar-kvd-skog-ar.mjs', 'utf8');
console.log('=== MALlens sista kontroller ===');
console.log(k.slice(-3500));
