// Manifestets f21-deklaration (node-kanalen)
import { readFileSync } from 'node:fs';
const m = JSON.parse(readFileSync('/home/ak1a/agent/ak1/data/forskning/KURS-FAS3/manifest-v164-fas3-djup.json', 'utf8'));
const u = m.uppgifter.find(x => x.id === 'f21');
console.log(JSON.stringify({ id: u.id, titel: u.titel, filer: u.filer }, null, 1));
