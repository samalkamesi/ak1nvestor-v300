// prod-verification, fil-skrivande variant (stdout förloras vid skal-häng — källan till 30 s-fönstrets bottennack)
import { writeFileSync } from 'node:fs';
const ut = [];
const r1 = await fetch('https://lab.ak1nvestor.com/api/kurs/v01-forsaljningstillvaxt', { signal: AbortSignal.timeout(20000) });
const t1 = await r1.text();
let kap12 = null;
try { const j = JSON.parse(t1); const kurser = j.chapters ? j : (j.kurs || j.data || j); kap12 = kurser.chapters ? kurser.chapters.find(k => k.num === 12) : '(struktur okänd — söker text)'; } catch { kap12 = t1.includes('Från teorin till egen räkning') ? '(textträff i svaret)' : null; }
ut.push('API v01: ' + r1.status + ' · kap12: ' + (kap12 ? (typeof kap12 === 'string' ? kap12 : kap12.title + ' · ' + kap12.minutes + ' min · quiz ' + (kap12.quiz ? kap12.quiz.length : 0)) : 'SAKNAS'));
const r2 = await fetch('https://lab.ak1nvestor.com/', { signal: AbortSignal.timeout(20000) });
ut.push('SAJT: ' + r2.status);
const r3 = await fetch('https://lab.ak1nvestor.com/api/kurs/v19-kapitalforbranning', { signal: AbortSignal.timeout(20000) });
const t3 = await r3.text();
ut.push('API v19: ' + r3.status + ' · textträff kap 14: ' + t3.includes('Från teorin till egen räkning'));
writeFileSync('/tmp/v167-prod.txt', ut.join('\n') + '\n');
