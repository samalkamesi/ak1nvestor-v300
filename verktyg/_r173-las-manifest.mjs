import fs from 'node:fs';
const m = JSON.parse(fs.readFileSync('/home/ak1a/agent/ak1/data/forskning/KURS-FAS3/manifest-v164-fas3-djup.json', 'utf8'));
console.log('uppgifter:', m.uppgifter.length);
console.log('--- u1 titel:', m.uppgifter[0].titel);
console.log('--- u1 prompt (första 1500 tkn):');
console.log(m.uppgifter[0].prompt.slice(0, 1500));
console.log('\n--- släppregel/nycklar:', Object.keys(m).join(', '));
