// v167-sond 2: V-kursens struktur via objektaccess
import { readFileSync } from 'node:fs';
const j = JSON.parse(readFileSync('public/deep-courses.json', 'utf8'));
const nycklar = Object.keys(j);
console.log('antal kurser (nycklar):', nycklar.length);
const v = j['v09-roe'];
console.log('v09-roe fält:', Object.keys(v).join(', '));
const kap = v.chapters || v.kapitel || [];
console.log('kapitel:', kap.length, '· chapterCount:', v.chapterCount, '· totalMinutes:', v.totalMinutes);
const sist = kap.at(-1);
console.log('sista kap fält:', Object.keys(sist).join(','));
console.log('sista:', JSON.stringify({ num: sist.num, title: sist.title, minutes: sist.minutes }).slice(0, 150));
const blocks = sist.blocks || [];
console.log('sista blocktyper:', blocks.map(b => b.type).join(','));
console.log('sista quiz:', Array.isArray(sist.quiz) ? sist.quiz.length : typeof sist.quiz);
console.log('kap[0] blocktyper:', (kap[0].blocks || []).map(b => b.type).join(','), '· quiz:', Array.isArray(kap[0].quiz) ? kap[0].quiz.length : typeof kap[0].quiz);
if (Array.isArray(kap[0].quiz) && kap[0].quiz[0]) console.log('quiz[0] fält:', Object.keys(kap[0].quiz[0]).join(','));
console.log('chapters_list:', 'chapters_list' in v);
// gemensamt: quiz-antal per kapitel över V-kurser
const vSlugs = nycklar.filter(k => /^v\d{2}-/.test(k));
console.log('\nV-kurser:', vSlugs.length);
for (const s of vSlugs.slice(0, 3)) {
  const kk = j[s].chapters;
  console.log(`${s}: ${kk.length} kap · quiz/kap: ${kk.map(c => Array.isArray(c.quiz) ? c.quiz.length : '?').join(',')} · totalMinutes ${j[s].totalMinutes}`);
}
// quiz-antal unika över alla V-kurser
const quizTal = new Set();
for (const s of vSlugs) for (const c of j[s].chapters) quizTal.add(Array.isArray(c.quiz) ? c.quiz.length : 'x');
console.log('unika quiz-antal/kapitel bland V-kurser:', [...quizTal].join(','));
// blocktypsuppsättning
const typer = new Set();
for (const s of vSlugs) for (const c of j[s].chapters) for (const b of (c.blocks || [])) typer.add(b.type);
console.log('blocktyper i V-kurser:', [...typer].join(','));
