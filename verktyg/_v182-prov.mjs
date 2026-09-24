// prod-verification: API:t serverar det nya kapitlet + sajten 200
import { readFileSync } from 'node:fs';
const r1 = await fetch('https://lab.ak1nvestor.com/api/kurs/v01-forsaljningstillvaxt', { signal: AbortSignal.timeout(20000) });
const t1 = await r1.text();
let kap12 = null;
try { const j = JSON.parse(t1); const kurser = j.chapters ? j : (j.kurs || j.data || j); kap12 = kurser.chapters ? kurser.chapters.find(k => k.num === 12) : '(struktur okänd — söker text)'; } catch { kap12 = t1.includes('Från teorin till egen räkning') ? '(textträff i svaret)' : null; }
console.log('API v01:', r1.status, '· kap12:', kap12 ? (typeof kap12 === 'string' ? kap12 : kap12.title + ' · ' + kap12.minutes + ' min · quiz ' + (kap12.quiz ? kap12.quiz.length : 0)) : 'SAKNAS');
const r2 = await fetch('https://lab.ak1nvestor.com/', { signal: AbortSignal.timeout(20000) });
console.log('SAJT:', r2.status);
const r3 = await fetch('https://lab.ak1nvestor.com/api/kurs/v19-kapitalforbranning', { signal: AbortSignal.timeout(20000) });
const t3 = await r3.text();
console.log('API v19:', r3.status, '· textträff kap 14:', t3.includes('Från teorin till egen räkning'));
