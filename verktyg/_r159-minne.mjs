// Rond 159: rätta landat-hash i beslutsminnets sista rad.
import { readFileSync, writeFileSync } from 'node:fs';

const f = '/home/ak1a/agent/ak1/data/vakten/beslutsminne.jsonl';
const rader = readFileSync(f, 'utf8').trim().split('\n');
const i = rader.length - 1;
rader[i] = rader[i].replace('"landat":"pending"', '"landat":"3fa731d8"');
writeFileSync(f, rader.join('\n') + '\n');
console.log('fixad:', rader[i]);
