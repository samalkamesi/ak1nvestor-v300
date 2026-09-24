import { readFileSync } from 'node:fs';
const j = JSON.parse(readFileSync('data/bokmaster/the-hour-between-dog-and-wolf.json', 'utf8'));
console.log('chapterCount:', j.chapterCount, '· totalMinutes:', j.totalMinutes, '· len:', j.chapters.length);
console.log('minutes:', j.chapters.map(c => c.minutes).join(','));
console.log('chapters_list[sista]:', JSON.stringify(j.chapters_list.at(-1)), '· [0] typ:', typeof j.chapters_list[0]);
const sist = j.chapters.at(-1);
console.log('sista kap:', JSON.stringify({ num: sist.num, title: sist.title, minutes: sist.minutes, falt: Object.keys(sist) }));
console.log('blocktyper:', sist.blocks.map(b => b.type).join(','));
