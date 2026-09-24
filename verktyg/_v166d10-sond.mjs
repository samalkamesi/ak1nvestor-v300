// Sond: struktur av intermarket-analysis.json inför v166-d10-append
import { readFileSync } from 'node:fs';
const p = 'data/bokmaster/intermarket-analysis.json';
const j = JSON.parse(readFileSync(p, 'utf8'));
console.log('toppnycklar:', Object.keys(j).join(', '));
console.log('chapterCount:', j.chapterCount, '· totalMinutes:', j.totalMinutes, '· chapters:', j.chapters.length);
console.log('chapters_list typ:', Array.isArray(j.chapters_list) ? `array (${j.chapters_list.length})` : typeof j.chapters_list);
if (Array.isArray(j.chapters_list)) {
  console.log('chapters_list[0]:', JSON.stringify(j.chapters_list[0]));
  console.log('chapters_list[sista]:', JSON.stringify(j.chapters_list.at(-1)));
}
const kap = j.chapters.at(-1);
console.log('\nSISTA KAPITLET:', JSON.stringify({ num: kap.num, title: kap.title, minutes: kap.minutes, ovrigaFalt: Object.keys(kap) }));
console.log('rutor:', kap.rutor ? kap.rutor.length : (kap.blocks ? kap.blocks.length : 'okänt fält'));
const rutor = kap.rutor || kap.blocks || [];
for (const [i, r] of rutor.entries()) {
  const typer = Object.keys(r);
  console.log(`  ruta[${i}] typ=${r.typ || r.typ_block || '?'} fält=${typer.join('/')} len=${JSON.stringify(r).length}`);
}
console.log('\nSista kapitlets quiz:', JSON.stringify(kap.quiz || kap.quizFrage || 'inget quizfält', null, 1).slice(0, 800));
// Näst sista kapitlet för blocktypsjämförelse
const kap2 = j.chapters.at(-2);
console.log('\nNÄST SISTA:', JSON.stringify({ num: kap2.num, title: kap2.title, minutes: kap2.minutes }));
const rutor2 = kap2.rutor || kap2.blocks || [];
console.log('  blocktyper:', rutor2.map(r => r.typ || '?').join(','));
// Stickprov av ett textblock och ett quiz-block ur ett tidigare kapitel för att se exakt fältformat
console.log('\nExempel på textblock (kap 2, första):', JSON.stringify((j.chapters[1]?.rutor || j.chapters[1]?.blocks || [])[0], null, 1).slice(0, 600));
const q = (j.chapters[1]?.rutor || j.chapters[1]?.blocks || []).find(r => (r.typ || '') === 'quiz') || j.chapters[1]?.quiz;
console.log('\nQuizformat kap 2:', JSON.stringify(j.chapters[1]?.quiz || q, null, 1).slice(0, 900));
