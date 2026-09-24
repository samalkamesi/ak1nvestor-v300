import fs from 'node:fs';
import path from 'node:path';
const BM = '/home/ak1a/agent/ak1/data/bokmaster';
const m = JSON.parse(fs.readFileSync('/home/ak1a/agent/ak1/data/forskning/KURS-FAS3/manifest-v164-fas3-djup.json', 'utf8'));
const filer = new Set(fs.readdirSync(BM));
let saknas = 0;
for (const u of m.uppgifter) {
  const slug = u.prompt.match(/slug ([a-z0-9-]+)/)?.[1] || '?';
  const finns = filer.has(`${slug}.json`);
  let ch = -1;
  if (finns) {
    const j = JSON.parse(fs.readFileSync(path.join(BM, `${slug}.json`), 'utf8'));
    ch = (j.chapters || []).length;
  }
  if (!finns) saknas++;
  console.log(`${u.id} ${slug} ${finns ? 'FINNS chapters=' + ch : 'SAKNAS'} | ${u.titel}`);
}
console.log(`\nSAKNADE kursposter: ${saknas}/24`);
