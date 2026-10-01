// _v224-kategorier.mjs — räkna unika kategorier + kurser i registret.
import fs from 'node:fs';
const j = JSON.parse(fs.readFileSync('/home/ak1a/agent/ak1/public/deep-courses.json', 'utf8'));
const lista = Object.values(j);
const kat = new Set(lista.map(k => k.category).filter(Boolean));
console.log(`kurser: ${lista.length} · kategorier: ${kat.size}`);
console.log('kategorier:', [...kat].sort().join(', '));
