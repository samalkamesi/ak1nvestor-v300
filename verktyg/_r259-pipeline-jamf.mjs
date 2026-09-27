import fs from 'node:fs';
const a = fs.readFileSync('/home/ak1a/agent/ak1/PIPELINE-KO.md', 'utf8');
const b = fs.readFileSync('/home/ak1a/agent/ak1/data/forskning/PIPELINE-KO.md', 'utf8');
console.log('identiska:', a === b, '| rot rader:', a.split('\n').length, '| forskning rader:', b.split('\n').length);
if (a !== b) {
  const ra = a.split('\n'), rb = b.split('\n');
  for (let i = 0; i < Math.max(ra.length, rb.length); i++) {
    if (ra[i] !== rb[i]) { console.log('första diff vid rad', i + 1); console.log('ROT :', (ra[i] || '').slice(0, 90)); console.log('FORS:', (rb[i] || '').slice(0, 90)); break; }
  }
}
