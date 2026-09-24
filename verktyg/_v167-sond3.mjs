// v167-sond 3: V09-kursens kap 7–11 (v200-sektionerna) vs underlagets a–f
import { readFileSync } from 'node:fs';
const j = JSON.parse(readFileSync('public/deep-courses.json', 'utf8'));
const v = j['v09-roe'];
for (const [i, k] of v.chapters.entries()) {
  const blocks = k.blocks || [];
  const ords = blocks.map(b => (b.content || '').length).reduce((a, b) => a + b, 0);
  console.log(`kap ${k.num}: "${k.title}" · ${k.minutes} min · ${blocks.length} block (${blocks.map(b => b.type).join(',')}) · ~${ords} tecken · quiz: ${Array.isArray(k.quiz) ? k.quiz.length : '—'}`);
  if (i >= 5) console.log('   intro:', (k.intro || '').slice(0, 100));
}
// kap 7 content stickprov
const k7 = v.chapters[6];
console.log('\nkap 7 block[0] början:', (k7.blocks?.[0]?.content || '').slice(0, 300));
const k11 = v.chapters[10];
console.log('\nkap 11 block:', (k11.blocks || []).map(b => `${b.type}: ${(b.content || '').slice(0, 60)}`).join('\n  '));
