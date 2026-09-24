// KVD v166-d05 — mekanisk efterkontroll enligt DESIGN-v166
import { readFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';

const SOKVAG = '/home/ak1a/AK1/data/bokmaster/technical-analysis-of-stock-trends.json';
const gamla = JSON.parse(execFileSync('git', ['show', `HEAD:${SOKVAG.replace('/home/ak1a/AK1/', '')}`], { cwd: '/home/ak1a/AK1', encoding: 'utf8' }));
const nya = JSON.parse(readFileSync(SOKVAG, 'utf8'));
const vm = JSON.parse(readFileSync('/home/ak1a/AK1/data/varumarke.json', 'utf8'));

const fel = [];
const ok = (namn, villkor, detalj = '') => {
  console.log((villkor ? 'GRÖN' : 'RÖD') + ' — ' + namn + (detalj ? ' (' + detalj + ')' : ''));
  if (!villkor) fel.push(namn);
};

// 1. JSON giltig (parse ovan) + chapterCount/totalMinutes
ok('JSON giltig', true);
ok('chapterCount == len(chapters)', nya.chapterCount === nya.chapters.length, `${nya.chapterCount} == ${nya.chapters.length}`);
ok('totalMinutes == Σ kapitelminuter', nya.totalMinutes === nya.chapters.reduce((s, c) => s + c.minutes, 0), `${nya.totalMinutes} == ${nya.chapters.reduce((s, c) => s + c.minutes, 0)}`);

// 2. append-only: gamla kapitel bit-identiska + inga raderade
ok('antal kapitel +1', nya.chapters.length === gamla.chapters.length + 1, `${gamla.chapters.length} → ${nya.chapters.length}`);
ok('gamla kapitel bit-identiska', gamla.chapters.every((c, i) => JSON.stringify(c) === JSON.stringify(nya.chapters[i])));
ok('gamla toppfält oförändrade (utöver counts + append)', Object.entries(gamla).every(([kk, v]) => ['chapterCount', 'totalMinutes', 'chapters', 'chapters_list'].includes(kk) || JSON.stringify(v) === JSON.stringify(nya[kk])));
const gl = nya.chapters_list;
ok('chapters_list == chapters (num/title/minutes)', nya.chapters.length === gl.length && nya.chapters.every((c, i) => c.num === gl[i].num && c.title === gl[i].title && c.minutes === gl[i].minutes));

// 3. det nya kapitlet
const k = nya.chapters.at(-1);
ok('num = sista+1', k.num === gamla.chapters.at(-1).num + 1, `num=${k.num}`);
ok('minutes inom 11–14', k.minutes >= 11 && k.minutes <= 14, `${k.minutes}`);
ok('titel', k.title === 'Från boken till egen analys');
const bt = k.blocks.map(b => b.type);
ok('blockstruktur enligt design', JSON.stringify(bt) === JSON.stringify(['text', 'text', 'utmaning', 'text', 'tabell', 'text', 'text', 'insikt']), bt.join(','));

// 4. quiz = 3, format, påståendeform
ok('quiz = 3', k.quiz.length === 3);
ok('quizformat', k.quiz.every(q => Array.isArray(q.alternativ) && q.alternativ.length === 4 && Number.isInteger(q.ratt) && q.ratt >= 0 && q.ratt < 4 && typeof q.tips === 'string' && typeof q.q === 'string'));
const rad = k.quiz.flatMap(q => [q.q, ...q.alternativ]).join(' ').toLowerCase();
ok('quiz utan handlingsråd', !/\b(köp|sälj|handla)\b.*\b(aktie|nu)\b/.test(rad));

// 5. varumärkesgrind på hela nya kapitlet
const kapitelText = JSON.stringify(k.intro) + k.blocks.map(b => b.content).join('\n') + JSON.stringify(k.quiz);
let träffar = [];
for (const { fran } of vm.forbjudnaFraser) {
  let re;
  try { re = new RegExp(fran, 'giu'); } catch { continue; }
  const m = kapitelText.match(re);
  if (m) träffar.push(`${fran}: ${m.length}`);
}
ok('varumärkesgrind 0 träffar', träffar.length === 0, träffar.join('; ') || '0');

// 6. talmarkörer från underlaget sektion 3 (överföringsbevis)
const markorer = ['158', '172', '160', '146', '147', '146,5', '25,5', '145,50', '145,5', '120', '18 %', '2,4×', '40', '41', '46', '40,5', '5,5', '51,5', '12 %'];
const saknade = markorer.filter(m => !kapitelText.includes(m));
ok('talmarkörer ≥ 80 %', saknade.length / markorer.length <= 0.2, `${markorer.length - saknade.length}/${markorer.length}${saknade.length ? ' saknas: ' + saknade.join(',') : ''}`);
// extra: ingen falsk deklaration — "konstruerade" måste deklareras
ok('konstruerad-tal-deklaration närvarande', /alla siffror nedan är konstruerade för genomräkningen/i.test(kapitelText) && /konstruerade/i.test(JSON.parse(k.blocks[4].content).rubrik));
ok('2007:528-deklaration', kapitelText.includes('2007:528'));

// 7. tabellblock parsbar inner-JSON
const tab = JSON.parse(k.blocks[4].content);
ok('tabell inner-JSON {rubrik, rader}', !!tab.rubrik && Array.isArray(tab.rader) && tab.rader.every(r => Array.isArray(r)), `${tab.rader.length} rader`);

console.log(fel.length === 0 ? '\nKVD: SAMTLIGA GRÖNA — leveransklar' : `\nKVD: ${fel.length} RÖD: ${fel.join(', ')}`);
process.exit(fel.length === 0 ? 0 : 1);
