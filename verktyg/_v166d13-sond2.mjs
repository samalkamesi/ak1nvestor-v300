// Sond 2: fibonacci-applications sista kapitel + chapters_list + KVD-mall
import { readFileSync } from 'node:fs';
const j = JSON.parse(readFileSync('data/bokmaster/fibonacci-applications.json', 'utf8'));
console.log('slug:', j.slug, '· chapterCount:', j.chapterCount, '· totalMinutes:', j.totalMinutes, '· len:', j.chapters.length);
console.log('minutes-summary per kap:', j.chapters.map(c => c.minutes).join(','));
console.log('\nchapters_list:');
for (const [i, e] of j.chapters_list.entries()) console.log(`  [${i}] ${typeof e === 'string' ? 'STR: ' + e : 'OBJ: ' + JSON.stringify(e)}`);
const sist = j.chapters.at(-1);
console.log('\nSISTA KAP:', JSON.stringify({ num: sist.num, title: sist.title, minutes: sist.minutes, falt: Object.keys(sist) }));
console.log('blocktyper:', sist.blocks.map(b => b.type).join(','));
console.log('intro:', sist.intro.slice(0, 300));
console.log('\nQuiz q1:', JSON.stringify(sist.quiz[0]).slice(0, 400));
