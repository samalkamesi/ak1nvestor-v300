// AR24-sondering del 2: KVD-mallens svans + publishedAt-konvention + ordjämförelse
import { readFileSync } from 'node:fs';
const k = readFileSync('/home/ak1a/agent/ak1/verktyg/_s3u3-b26-ar-kvd-skog-ar.mjs', 'utf8');
console.log('=== KVD-MALLEN SVANS ===');
console.log(k.slice(6000));
console.log('=== PUBLISHEDAT ===');
const skogSv = JSON.parse(readFileSync('/home/ak1a/agent/ak1/data/blogg-utkast/skogsaktier-sa-analyserar-du-skogsbolag.json', 'utf8'));
console.log('skog-sv publishedAt:', skogSv.publishedAt, '| ord:', skogSv.body.split(/\s+/).filter(Boolean).length);
const skogAr = JSON.parse(readFileSync('/home/ak1a/agent/ak1/data/blogg-utkast/skogsaktier-sa-analyserar-du-skogsbolag-ar.json', 'utf8'));
console.log('skog-ar publishedAt:', skogAr.publishedAt, '| ord:', skogAr.body.split(/\s+/).filter(Boolean).length);
const medSv = JSON.parse(readFileSync('/home/ak1a/agent/ak1/data/blogg-utkast/medtechaktier-sa-analyserar-du-medicintekniska-bolag.json', 'utf8'));
console.log('medtech-sv publishedAt:', medSv.publishedAt, '| ord:', medSv.body.split(/\s+/).filter(Boolean).length, '| H2:', [...medSv.body.matchAll(/^## /gm)].length);
console.log('H2-rubriker:', [...medSv.body.matchAll(/^## (.+)$/gm)].map(m => m[1]).join(' | '));
