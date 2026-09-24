// Neutralt granskningsprov av PROD:s d13-version (efter konfliktval --theirs):
// kapitel-/quiz-/blockformat, varumärkesgrind, lagrum, kärntal, deklarationer.
import fs from 'node:fs';
const j = JSON.parse(fs.readFileSync('data/bokmaster/fibonacci-applications.json', 'utf8'));
const ny = j.chapters.at(-1);
const text = JSON.stringify(ny);
let fel = 0;
const ok = (n, v, d) => { console.log(`${v ? 'GRÖN' : 'RÖD'}  ${n}${d ? ' — ' + d : ''}`); if (!v) fel++; };

ok('JSON giltig', true);
ok('chapterCount == len', j.chapterCount === j.chapters.length, `${j.chapterCount}/${j.chapters.length}`);
ok('totalMinutes == Σ', j.totalMinutes === j.chapters.reduce((a, k) => a + k.minutes, 0), `${j.totalMinutes}`);
ok('kapitel 15 "Från boken till egen analys"', ny.num === 15 && ny.title === 'Från boken till egen analys' && ny.minutes >= 11 && ny.minutes <= 14, `num=${ny.num}, min=${ny.minutes}`);
ok('quiz = 3, format, unika ratt', ny.quiz.length === 3 && ny.quiz.every(q => q.q && q.alternativ.length === 4 && Number.isInteger(q.ratt) && q.ratt >= 0 && q.ratt <= 3 && q.tips) && new Set(ny.quiz.map(q => q.ratt)).size === 3, `ratt ${ny.quiz.map(q => q.ratt).join(',')}`);
ok('utmaning + insikt + tabell-block', ['utmaning', 'insikt', 'tabell'].every(t => ny.blocks.some(b => b.type === t)), ny.blocks.map(b => b.type).join(','));
const vm = JSON.parse(fs.readFileSync('data/varumarke.json', 'utf8'));
const traif = vm.forbjudnaFraser.filter(f => new RegExp(f.fran, 'i').test(text));
ok('varumärkesgrind 0 träffar', traif.length === 0, traif.length ? traif.join(';') : `${vm.forbjudnaFraser.length} mönster`);
const lagBland = ['2022:260', '2022:261', '1985:716', '2022:482', '2005:59'].filter(l => text.includes(l));
ok('lagrum endast 2007:528 (≥2), inga blandade', lagBland.length === 0 && (text.match(/2007:528/g) || []).length >= 2, `×${(text.match(/2007:528/g) || []).length}, övriga 0`);
const karn = ['317,50', '371,50', '54,00', '350,90', '338,10', '344,50', '343,20', '338,20', '351,30', '330,20', '76,5', 'VOLV-B.ST', '2026-09-24', '61,8', '38,2', 'halveringsregel', '2007:528'];
const saknas = karn.filter(t => !text.includes(t));
ok('kärntal från underlaget 17/17', saknas.length === 0, saknas.length ? 'SAKNAS ' + saknas.join(',') : 'alla närvarande');
ok('käll-/övningsdeklaration närvaro (Yahoo Finance + inte rekommendation)', /Yahoo Finance/.test(text) && /rekommendation/.test(text));
const radgiv = [/\bköp\b[^.]*\baktie\b/i, /\bsälj\b[^.]*\baktie\b/i, /\bbör du köpa\b/i, /\brekommenderar (?:att )?köp/i].filter(re => re.test(text));
ok('inga köp/sälj-formuleringar', radgiv.length === 0);
ok('num-sekvens 1..15', j.chapters.every((k, i) => k.num === i + 1));

console.log(fel === 0 ? `\nVALD VERSION (prod): GRÖN — ${14 - fel}/14 relevant` : `\nRÖD — ${fel} fallerade`);
process.exit(fel ? 1 : 0);
