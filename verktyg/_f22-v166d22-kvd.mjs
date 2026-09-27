#!/usr/bin/env node
// v166-d22 KVD — mekanisk efterkontroll av djupkapitel 15 i
// data/bokmaster/the-hour-between-dog-and-wolf.json enligt DESIGN-v166.
import fs from 'node:fs';
import { execFileSync } from 'node:child_process';

const FIL = 'data/bokmaster/the-hour-between-dog-and-wolf.json';
const UNDERLAG = 'data/forskning/KURS-FAS3/underlag-f22-dog-and-wolf.md';
let pass = 0;
let fel = 0;
const k = (namn, ok, detalj = '') => {
  if (ok) {
    pass++;
    console.log(`  PASS ${namn}${detalj ? ' — ' + detalj : ''}`);
  } else {
    fel++;
    console.log(`  FEL  ${namn}${detalj ? ' — ' + detalj : ''}`);
  }
};

console.log('KVD v166-d22 the-hour-between-dog-and-wolf');

// 1. JSON giltig + struktur
const raw = fs.readFileSync(FIL, 'utf8');
let j = null;
try {
  j = JSON.parse(raw);
  k('JSON giltig', true);
} catch (e) {
  k('JSON giltig', false, e.message);
  process.exit(1);
}
k('chapterCount == len(chapters) == 15', j.chapterCount === 15 && j.chapters.length === 15, `cc=${j.chapterCount} len=${j.chapters.length}`);
const summa = j.chapters.reduce((a, c) => a + c.minutes, 0);
k('totalMinutes == Σ == 181', j.totalMinutes === summa && summa === 181, `tm=${j.totalMinutes} Σ=${summa}`);
const nya = j.chapters[j.chapters.length - 1];
k('nytt kapitel num=15, minutes 11–14, titel', nya.num === 15 && nya.minutes >= 11 && nya.minutes <= 14 && nya.title === 'Från boken till egen analys', `minutes=${nya.minutes}`);

// 2. Quiz = 3, format, unika ratt-lägen
k('quiz = 3', Array.isArray(nya.quiz) && nya.quiz.length === 3);
const quizOk = nya.quiz.every((q) => typeof q.q === 'string' && Array.isArray(q.alternativ) && q.alternativ.length === 4 && [0, 1, 2, 3].includes(q.ratt) && typeof q.tips === 'string');
const lagen = nya.quiz.map((q) => q.ratt);
k('quizformat {q, alternativ[4], ratt, tips}', quizOk, `ratt-lägen ${lagen.join(',')}`);
k('unika ratt-lägen', new Set(lagen).size === 3);

// 3. Blockstruktur enligt DESIGN-v166 (f22: text/text/utmaning/text/tabell/text/insikt)
const typer = nya.blocks.map((b) => b.type);
const forvantat = ['text', 'text', 'utmaning', 'text', 'tabell', 'text', 'insikt'];
k('blockstruktur', JSON.stringify(typer) === JSON.stringify(forvantat), typer.join('/'));

// 3b. Tabellens inre JSON giltig med underlagets rader ordagrant
let tabellOk = false;
let tabellDetalj = '';
try {
  const t = JSON.parse(nya.blocks[4].content);
  tabellOk =
    t.rader.length === 4 &&
    t.rader[0].length === 5 &&
    t.rader[0][0] === 'Tillstånd' &&
    t.rader[1][0] === 'Neutral — regeln följs' &&
    t.rader[2][0] === 'Efter förlust — kortisol' &&
    t.rader[3][0] === 'Efter vinst — testosteron' &&
    t.rader[1][4] === '−800 kr' &&
    t.rader[2][3] === '+60 kr (endast 6 av 10 beslut togs)' &&
    t.rader[3][4] === '−2 000 kr';
  tabellDetalj = `${t.rader.length} rader × ${t.rader[0].length} kol`;
} catch (e) {
  tabellDetalj = e.message;
}
k('tabell inre JSON giltig, rader ordagrant', tabellOk, tabellDetalj);

// 4. Varumärkesgrind (data/varumarke.json) — 0 träffar på nya kapitlet
const vm = JSON.parse(fs.readFileSync('data/varumarke.json', 'utf8'));
const textNya = JSON.stringify(nya);
const traffar = [];
for (const { fran } of vm.forbjudnaFraser) {
  const re = new RegExp(fran, 'iu');
  if (re.test(textNya)) traffar.push(fran);
}
k(`varumärkesgrind 0 träffar (${vm.forbjudnaFraser.length} mönster)`, traffar.length === 0, traffar.join(' | '));

// 5. Juridikgrind: övnings-/utbildningsdeklaration ordagrant, 2007:528, inga rådsformuleringar
const DEKL = 'Utbildningsmaterial — beskriver hur metoden fungerar med hypotetiska tankeexperiment i pappersform; inga investeringsråd, inga avkastningslöften (2007:528).';
k('övningsdeklaration "pedagogiskt, inget råd" ordagrant', textNya.includes('pedagogiskt, inget råd'));
k('utbildningsdeklaration ordagrant', textNya.includes(DEKL));
const n528 = (textNya.match(/2007:528/g) || []).length;
k('2007:528 närvaro ≥ 2', n528 >= 2, `${n528} träffar`);
const rads = textNya.match(/\b(köp|sälj)\s+(denna|den här|aktien|nu|snabbt)\b/i);
k('inga köp/sälj-rådsformuleringar', rads === null, rads ? rads[0] : '');
k('inga avkastningslöften', !/garanterad[^\n]*avkastning|obegränsad[^\n]*avkastning/i.test(textNya));

// 6. Talmarkörer från underlaget (överföringsbevis) — DUBBELRIKTAT:
// varje markör ska finnas i BÅDE kapitlet och underlaget (närvaro + inga påhittade tal)
const markorer = [
  'Goldman Sachs', 'Deutsche Bank', '2012', 'saliv', 'testosteron', 'kortisol', 'winning effect',
  '100 000 kr', 'risk 1 %', '1 000 kr per beslut', 'stopp på 10 %', '10 000 kr', '+2/−2 %', '+0,2 %',
  'F21:s mynt', '10 beslut', '3V/7F', '3 vinster, 7 förluster', '7,5 % sannolikhet', '26 % av serierna',
  '4 vinster eller färre', '2,5× risken', '2 000 kr i stället för 800', 'hälften av besluten togs aldrig',
  'V V V', 'interoception', 'jag ser marknaden', 'tills det lugnat sig', 'jag var nog ganska rationell',
  'Neutral — regeln följs', 'Efter förlust — kortisol', 'Efter vinst — testosteron',
  '+200 kr', '−800 kr', '500 kr', '5 000 kr', '+60 kr', '6 av 10 beslut togs', '−400 kr',
  '2 500 kr', '25 000 kr', '+500 kr', '−2 000 kr', 'en av fyra normala serier',
  'tre beslut i rad', '2007:528',
];
const underlag = fs.readFileSync(UNDERLAG, 'utf8');
// Underlaget är radombrutet (~72 kol) — normalisera whitespace före jämförelse,
// annars missas fraser som delas av radbrytning ("4 vinster eller␊färre").
const underlagNorm = underlag.replace(/\s+/g, ' ');
const saknadeKap = markorer.filter((m) => !textNya.includes(m));
const saknadeUnd = markorer.filter((m) => !underlagNorm.includes(m));
const andel = Math.round(((markorer.length - saknadeKap.length) / markorer.length) * 100);
k(
  `talmarkörer 100 % DUBBELRIKTAT (${markorer.length - saknadeKap.length}/${markorer.length} = ${andel} %)`,
  saknadeKap.length === 0 && saknadeUnd.length === 0,
  saknadeKap.length ? 'saknade i kapitel: ' + saknadeKap.join(', ') : saknadeUnd.length ? 'saknade i underlag: ' + saknadeUnd.join(', ') : 'alla närvarande i både kapitel och underlag',
);

// 6b. Siffer-sanering: varje siffer-token i nya kapitlet (exkl. num/minutes-metadata) ska vara delsträng i underlaget
const textUtanMeta = JSON.stringify({ intro: nya.intro, blocks: nya.blocks, quiz: nya.quiz });
const siffror = [...new Set(textUtanMeta.match(/\d[\d ,.×]*\d|\d/g) || [])].map((s) => s.trim()).filter(Boolean);
const pahittade = siffror.filter((s) => !underlagNorm.includes(s));
k('inga påhittade tal (siffer-token ⊆ underlaget)', pahittade.length === 0, pahittade.length ? 'okända: ' + pahittade.join(' | ') : `${siffror.length} unika token alla kända`);

// 7. Append-only: kapitel 1–14 + chapters_list 1–14 + övriga toppfält bit-identiska mot HEAD
const gamlaRaw = execFileSync("git", ["show", `HEAD:${FIL}`], { encoding: 'utf8' });
const g = JSON.parse(gamlaRaw);
const kapOk = g.chapters.slice(0, 14).every((c, i) => JSON.stringify(c) === JSON.stringify(j.chapters[i]));
k('kapitel 1–14 bit-identiska', kapOk && j.chapters.length === 15);
const listOk = g.chapters_list.slice(0, 14).every((c, i) => JSON.stringify(c) === JSON.stringify(j.chapters_list[i]));
k('chapters_list 1–14 orörda (strängposter)', listOk);
k(
  'chapters_list-post 15 = {num,title,minutes}',
  JSON.stringify(j.chapters_list[14]) === '{"num":15,"title":"Från boken till egen analys","minutes":13}',
);
const topp = ['slug', 'category', 'weight', 'title', 'summary', 'minutes', 'xp', 'level', 'learn', 'why', 'kalla'];
const toppOk = topp.every((f) => JSON.stringify(g[f]) === JSON.stringify(j[f]));
k('övriga toppfält orörda', toppOk);

// 8. tsc 0 (data-väg — ingen src-ändring, INGET bygge; projektbinären läses utan installation)
let tscOk = false;
let tscUt = '';
try {
  execFileSync("node", ["node_modules/typescript/bin/tsc", "--noEmit"], { cwd: '/home/ak1a/AK1', stdio: 'pipe', timeout: 240000 });
  tscOk = true;
} catch (e) {
  tscUt = (e.stdout || '') + (e.stderr || '');
}
k('tsc --noEmit 0 fel', tscOk, tscOk ? 'grön' : tscUt.slice(0, 200));

console.log(`\nKVD SAMMANFATTNING: ${pass} PASS · ${fel} FEL`);
process.exit(fel === 0 ? 0 : 1);
