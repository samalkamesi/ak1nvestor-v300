import fs from 'node:fs';
import path from 'node:path';
const BM = '/home/ak1a/agent/ak1/data/bokmaster';
const ak1ts = fs.readdirSync(BM).filter(f => /^ak1ts-/.test(f)).sort();
console.log('ak1ts-kurser:', ak1ts.length);
let tomma = 0, fyllda = 0;
for (const f of ak1ts) {
  const j = JSON.parse(fs.readFileSync(path.join(BM, f), 'utf8'));
  const n = (j.chapters || []).length;
  if (n === 0) tomma++; else fyllda++;
  console.log(`${f} chapters=${n} chapterCount=${j.chapterCount} totalMinutes=${j.totalMinutes}`);
}
console.log(`\nSUMMA: ${ak1ts.length} kurser · ${tomma} med tom chapters · ${fyllda} fyllda`);
// underlagens slug-mappning
const KAT = '/home/ak1a/agent/ak1/data/forskning/KURS-FAS3';
console.log('\nunderlag:', fs.readdirSync(KAT).filter(f => /^underlag-f\d+/.test(f)).length);
