// v166-design: gräv kapitelstrukturen i flaggskeppet (ak1ts-vaglarans-hierarki)
import fs from 'node:fs';
const j = JSON.parse(fs.readFileSync('/home/ak1a/agent/ak1/data/bokmaster/ak1ts-vaglarans-hierarki.json', 'utf8'));
console.log('chapters:', j.chapters.length, '| chapterCount:', j.chapterCount, '| totalMinutes:', j.totalMinutes, '| minutes:', j.minutes);
console.log('chapters_list[0]:', JSON.stringify(j.chapters_list?.[0]));
console.log('chapters_list[senaste]:', JSON.stringify(j.chapters_list?.[j.chapters_list.length - 1]));
const k = j.chapters[j.chapters.length - 1];
console.log('\nSISTA kapitlet:', k.num, k.title, '| min:', k.minutes, '| blocks:', k.blocks.length, '| quiz:', k.quiz.length);
console.log('blocktyper i kursen:', [...new Set(j.chapters.flatMap(c => c.blocks.map(b => b.type)))].join(', '));
console.log('\nquiz[0] fullstruktur:');
console.log(JSON.stringify(k.quiz[0], null, 1).slice(0, 700));
console.log('\nblockexempel (sista kapitlet block 1, förstat 300 tkn):');
console.log(JSON.stringify(k.blocks[0]).slice(0, 300));
// summera minuter per kapitel för konsistensförståelse
const sum = j.chapters.reduce((a, c) => a + c.minutes, 0);
console.log('\nΣ kapitelminuter:', sum, '== totalMinutes?', sum === j.totalMinutes);
