import { readFileSync, writeFileSync } from 'node:fs';
const FIL = 'data/portfolj-system/bolagsunivers.json';
let t = readFileSync(FIL, 'utf8');
const fore = (t.match(/tornen-okonomick/g) || []).length;
t = t.replace('tornen-okonomick:n: medan operatörerna föll på AI-telefoni-oro stod infrastrukturen', 'tornens motkonjunktur: medan operatörerna föll på AI-telefoni-oro stod infrastrukturen');
writeFileSync(FIL, t);
const u = JSON.parse(readFileSync(FIL, 'utf8'));
console.log(`RÄTTAD: ${fore} → ${(readFileSync(FIL, 'utf8').match(/tornen-okonomick/g) || []).length} · n=${u.length} · sista=${u[u.length - 1].ticker}`);
