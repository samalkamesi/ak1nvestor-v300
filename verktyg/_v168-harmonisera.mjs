// harmonisera ai-mentor-register.ts mot deep-courses.json (V01–V20): kapitel/quiz/minuter
import { readFileSync, writeFileSync } from 'node:fs';
const REG = '/home/ak1a/agent/ak1/src/lib/ai-mentor-register.ts';
const dc = JSON.parse(readFileSync('/home/ak1a/agent/ak1/public/deep-courses.json', 'utf8'));
let src = readFileSync(REG, 'utf8');
let n = 0;
for (const [slug, kurs] of Object.entries(dc)) {
  if (!/^v(0[1-9]|1[0-9]|20)-/.test(slug)) continue;
  const kap = (kurs.chapters || []).length;
  const quiz = (kurs.chapters || []).reduce((s, c) => s + ((c.quiz || []).length), 0);
  const min = (kurs.chapters || []).reduce((s, c) => s + (c.minutes || 0), 0);
  const radRe = new RegExp('(\\{ slug: "' + slug + '".*?\\})');
  const m = src.match(radRe);
  if (!m) { console.error('SAKNAS i registret: ' + slug); process.exit(1); }
  const ny = m[1]
    .replace(/kapitel: \d+/, 'kapitel: ' + kap)
    .replace(/quiz: \d+/, 'quiz: ' + quiz)
    .replace(/minuter: \d+/, 'minuter: ' + min);
  if (ny !== m[1]) { src = src.replace(radRe, ny); n++; }
}
writeFileSync(REG, src);
console.log('uppdaterade poster: ' + n + '/20');
