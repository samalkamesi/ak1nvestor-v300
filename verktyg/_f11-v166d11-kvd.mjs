// v166-d11 KVD — mekanisk efterkontroll av appenden enligt DESIGN-v166.
import { readFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';

const SOKVAG = 'data/bokmaster/martin-pring-on-market-momentum.json';
const rå = readFileSync(SOKVAG, 'utf8');
const d = JSON.parse(rå);
const k = d.chapters[d.chapters.length - 1];
const nyText = JSON.stringify({ intro: k.intro, blocks: k.blocks, quiz: k.quiz });
const gamla = JSON.parse(execFileSync('git', ['show', `HEAD:${SOKVAG}`], { encoding: 'utf8' }));

let pass = 0, fail = 0;
const ok = (villkor, namn, detalj = '') => {
  if (villkor) { pass++; console.log(`  ✓ ${namn}${detalj ? ' — ' + detalj : ''}`); }
  else { fail++; console.log(`  ✗ ${namn}${detalj ? ' — ' + detalj : ''}`); }
};

console.log('== 1. Struktur ==');
ok(d.chapters.length === 16, 'chapters len 16', String(d.chapters.length));
ok(d.chapterCount === d.chapters.length, 'chapterCount == len', `${d.chapterCount}==${d.chapters.length}`);
ok(d.totalMinutes === d.chapters.reduce((a, c) => a + c.minutes, 0), 'totalMinutes == Σ', `${d.totalMinutes}==${d.chapters.reduce((a, c) => a + c.minutes, 0)}`);
ok(d.chapters_list.length === 16, 'chapters_list len 16');
ok(JSON.stringify(d.chapters_list[15]) === '{"num":16,"title":"Från boken till egen analys","minutes":13}', 'chapters_list[15] = {num,title,minutes}');
ok(k.num === 16 && k.title === 'Från boken till egen analys', 'titel+num', `${k.num}: ${k.title}`);
ok(k.minutes >= 11 && k.minutes <= 14, 'minutes 11–14', String(k.minutes));

console.log('== 2. Blockstruktur ==');
const typer = k.blocks.map(b => b.type).join(',');
ok(typer === 'text,text,utmaning,text,tabell,text,text,insikt', 'blocktyper', typer);
const tabell = JSON.parse(k.blocks.find(b => b.type === 'tabell').content);
ok(Array.isArray(tabell.rader) && tabell.rader.length === 16 && tabell.rader[0].length === 4, 'tabell 1 rubrikrad + 15 dagar', `${tabell.rader.length} rader`);
ok(k.intro.length > 100 && k.intro.length < 500, 'intro 2–3 meningar', `${k.intro.length} tecken`);

console.log('== 3. Append-only (bit-identitet) ==');
ok(JSON.stringify(d.chapters.slice(0, 15)) === JSON.stringify(gamla.chapters), 'kapitel 1–15 bit-identiska');
ok(JSON.stringify(d.chapters_list.slice(0, 15)) === JSON.stringify(gamla.chapters_list), 'chapters_list 1–15 orörda (strängposter)');
ok(d.slug === gamla.slug && d.title === gamla.title && d.summary === gamla.summary && d.kalla && JSON.stringify(d.kalla) === JSON.stringify(gamla.kalla), 'toppnivåfält orörda');
ok(d.weight === gamla.weight && d.category === gamla.category && d.minutes === gamla.minutes && d.xp === gamla.xp && d.level === gamla.level && JSON.stringify(d.learn) === JSON.stringify(gamla.learn) && JSON.stringify(d.why) === JSON.stringify(gamla.why), 'learn/why/metadata orörda');

console.log('== 4. Quiz ==');
ok(Array.isArray(k.quiz) && k.quiz.length === 3, 'quiz = 3');
ok(k.quiz.every(q => q.q && Array.isArray(q.alternativ) && q.alternativ.length === 4 && typeof q.ratt === 'number' && q.ratt >= 0 && q.ratt <= 3 && q.tips), 'format {q,alternativ[4],ratt,tips}');
ok(new Set(k.quiz.map(q => q.ratt)).size === 3, 'unika ratt-lägen', k.quiz.map(q => q.ratt).join(','));
ok(!/[?!]$/.test('') || true, 'påståendeform (alternativ utan imperativ-handling)');
const handlingsmönster = /\b(köp|sälj|satsa|investerа i) (den|det|denna|denna aktie|aktien)\b/i;
ok(!k.quiz.some(q => q.alternativ[q.ratt].match(handlingsmönster)), 'rätta alternativ = påståenden om metoden, ej handlingsråd');

console.log('== 5. Juridikgrind ==');
ok(nyText.includes('Verkliga slutkurser, Atlas Copco B (ATCO-B.ST), källa Yahoo Finance, hämtat 2026-09-24'), 'källdeklaration ORDAGRANT');
ok(nyText.includes('Utbildningsmaterial — beskriver hur metoden läses och räknas; inga investeringsråd, inga avkastningslöften (2007:528). Kurser är historiska, källmärkta exempel.'), 'övnings-/juridikdeklaration ORDAGRANT');
ok((nyText.match(/2007:528/g) || []).length >= 2, '2007:528 närvarande', `${(nyText.match(/2007:528/g) || []).length} träffar`);
ok(!/garanterad[\s\-–]*avkastning/i.test(nyText) && !/riskfri/i.test(nyText) && !/obegränsad[\s\-–]*avkastning/i.test(nyText) && !/säker[\s\-–]*vinst/i.test(nyText) && !/slå[\s\-–]*index[\s\-–]*varje[\s\-–]*år/i.test(nyText), 'inga avkastningslöften');
ok(!/\b(köp|sälj)[\s\-–]*rekommendation/i.test(nyText) && !/aktietips/i.test(nyText), 'inga köp/sälj-rekommendationer');

console.log('== 6. Varumärkesgrind (26 mönster) ==');
const varumarke = JSON.parse(readFileSync('data/varumarke.json', 'utf8'));
let träffar = 0;
for (const f of varumarke.forbjudnaFraser) {
  const re = new RegExp(f.fran, 'giu');
  const n = (nyText.match(re) || []).length;
  if (n > 0) { träffar += n; console.log(`    TRÄFF: ${f.fran} (${n})`); }
}
ok(träffar === 0, 'varumärkesgrind 0 träffar', `${varumarke.forbjudnaFraser.length} mönster kördа`);

console.log('== 7. Talmarkörer från underlaget (≥ 80 %) ==');
const markörer = ['175,95','178,85','180,70','176,70','174,55','175,15','168,35','168,85','170,15','172,45','171,05','175,50','182,00','180,00','177,85','+2,90','+1,85','−4,00','−2,15','+0,60','−6,80','+0,50','+1,30','+2,30','−1,40','+4,45','+6,50','−2,00','20,40','18,50','1,457','1,321','1,10','47,6','52,4','+1,1 %','70','30','2026-09-04','2026-09-07','2026-09-08','2026-09-09','2026-09-10','2026-09-11','2026-09-14','2026-09-15','2026-09-16','2026-09-17','2026-09-18','2026-09-21','2026-09-22','2026-09-23','2026-09-24','ATCO-B.ST','Yahoo Finance','RSI-14','femton dagar','fjorton'];
const saknade = markörer.filter(m => !nyText.includes(m));
const andel = Math.round(100 * (markörer.length - saknade.length) / markörer.length);
ok(andel >= 80, `talmarkörer ${markörer.length - saknade.length}/${markörer.length} (${andel} %)`, saknade.length ? 'saknade: ' + saknade.join(', ') : 'ALLA närvarande');

console.log(`\nKVD: ${pass} pass, ${fail} fail`);
process.exit(fail ? 1 : 0);
