// Skriv ut d10-kapitlet (intermarket) fullständigt som formatmall för d13
import { readFileSync } from 'node:fs';
const j = JSON.parse(readFileSync('data/bokmaster/intermarket-analysis.json', 'utf8'));
const kap = j.chapters.at(-1);
console.log(JSON.stringify(kap, null, 1));
