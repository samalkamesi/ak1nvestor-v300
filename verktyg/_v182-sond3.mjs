// sond 3: kapitelantal/quiz per V-kurs — underlag för exakta num i manifestet
import { readFileSync } from 'node:fs';
const dc = JSON.parse(readFileSync('/home/ak1a/agent/ak1/public/deep-courses.json', 'utf8'));
const rader = [];
for (let i = 1; i <= 20; i++) {
  const slug = Object.keys(dc).find(s => s.startsWith('v' + String(i).padStart(2, '0') + '-'));
  const c = dc[slug];
  const quizKap = c.chapters.filter(k => k.quiz && k.quiz.length).length;
  const sista = c.chapters[c.chapters.length - 1];
  rader.push([slug, c.chapters.length, c.chapterCount, c.totalMinutes, quizKap, sista.num, sista.title.slice(0, 40)].join(' | '));
}
console.log(rader.join('\n'));
