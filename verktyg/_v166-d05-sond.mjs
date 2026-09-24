// sond v166-d05 del 2 — fulltext i förebild + målfilens tabellformat + filformattering
import { readFileSync } from 'node:fs';

const forebild = JSON.parse(readFileSync('/home/ak1a/AK1/data/bokmaster/ak1ts-vaglarans-hierarki.json', 'utf8'));
const mal = JSON.parse(readFileSync('/home/ak1a/AK1/data/bokmaster/technical-analysis-of-stock-trends.json', 'utf8'));

const djup = forebild.chapters.find(c => c.title.toLowerCase().includes('från boken'));
console.log('=== FÖREBILD block 3 (text: räkneexemplet inledning) ===');
console.log(djup.blocks[3].content);
console.log('\n=== FÖREBILD block 4 (tabell) ===');
console.log(JSON.stringify(djup.blocks[4].content));
console.log('--- tabellcontent renderat ---');
console.log(djup.blocks[4].content);
console.log('\n=== FÖREBILD block 5 (text: forts räkneexempel) ===');
console.log(djup.blocks[5].content);

console.log('\n=== MÅL: kap 15 intro + tabellblock (formatreferens) ===');
const k15 = mal.chapters[14];
console.log('intro:', k15.intro);
const tab = k15.blocks.find(b => b.type === 'tabell');
console.log('--- tabellcontent JSON-escaped ---');
console.log(JSON.stringify(tab.content));
console.log('--- renderat ---');
console.log(tab.content);
const tab2 = mal.chapters.flatMap(c => c.blocks.filter(b => b.type === 'tabell'))[1];
if (tab2) { console.log('--- ytterligare en tabell (JSON-escaped) ---'); console.log(JSON.stringify(tab2.content)); }

console.log('\n=== MÅL: tre intro-exempel (längd + ton) ===');
for (const i of [0, 7, 13]) console.log(`kap ${i + 1}: (${mal.chapters[i].intro.length} tkn) ${mal.chapters[i].intro}\n`);

console.log('=== MÅL: kapitelminuter (alla) ===');
console.log(mal.chapters.map(c => `${c.num}:${c.minutes}`).join(' '));

console.log('\n=== MÅL: utmaning-block (formatreferens kap 15) ===');
const utm = k15.blocks.find(b => b.type === 'utmaning');
console.log(utm.content);

console.log('\n=== MÅL: insikt-block (formatreferens kap 15) ===');
const ins = k15.blocks.find(b => b.type === 'insikt');
console.log(ins.content);
