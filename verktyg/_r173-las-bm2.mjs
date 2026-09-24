import fs from 'node:fs';
const j = JSON.parse(fs.readFileSync('/home/ak1a/agent/ak1/data/bokmaster/a-random-walk-down-wall-street.json', 'utf8'));
console.log('nycklar:', Object.keys(j).join(', '));
const ch = j.chapters || [];
console.log('chapters:', ch.length);
if (ch[0]) {
  console.log('kap1-nycklar:', Object.keys(ch[0]).join(', '));
  for (const k of Object.keys(ch[0])) {
    const v = ch[0][k];
    console.log(`  ${k}: ${typeof v === 'string' ? v.slice(0, 100).replace(/\n/g, ' ') : JSON.stringify(v).slice(0, 140)}`);
  }
}
console.log('category:', j.category, '| level:', j.level, '| quiz i rot?', !!(j.quiz));
