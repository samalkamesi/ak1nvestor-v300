#!/usr/bin/env node
// v166-d21 KVD — mekanisk efterkontroll av djupkapitel 15 i
// data/bokmaster/trading-in-the-zone.json enligt DESIGN-v166.
import fs from 'node:fs';
import { execSync } from 'node:child_process';

const FIL = 'data/bokmaster/trading-in-the-zone.json';
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

console.log('KVD v166-d21 trading-in-the-zone');

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
k('totalMinutes == Σ == 172', j.totalMinutes === summa && summa === 172, `tm=${j.totalMinutes} Σ=${summa}`);
const nya = j.chapters[j.chapters.length - 1];
k('nytt kapitel num=15, minutes 11–14, titel', nya.num === 15 && nya.minutes >= 11 && nya.minutes <= 14 && nya.title === 'Från boken till egen analys', `minutes=${nya.minutes}`);

// 2. Quiz = 3, format, unika ratt-lägen
k('quiz = 3', Array.isArray(nya.quiz) && nya.quiz.length === 3);
const quizOk = nya.quiz.every((q) => typeof q.q === 'string' && Array.isArray(q.alternativ) && q.alternativ.length === 4 && [0, 1, 2, 3].includes(q.ratt) && typeof q.tips === 'string');
const lagen = nya.quiz.map((q) => q.ratt);
k('quizformat {q, alternativ[4], ratt, tips}', quizOk, `ratt-lägen ${lagen.join(',')}`);
k('unika ratt-lägen', new Set(lagen).size === 3);

// 3. Blockstruktur enligt DESIGN-v166 (f21: text/text/utmaning/text/tabell/text/text/insikt)
const typer = nya.blocks.map((b) => b.type);
const forvantat = ['text', 'text', 'utmaning', 'text', 'tabell', 'text', 'text', 'insikt'];
k('blockstruktur', JSON.stringify(typer) === JSON.stringify(forvantat), typer.join('/'));

// 3b. Tabellens inre JSON giltig med underlagets rader
let tabellOk = false;
let tabellDetalj = '';
try {
  const t = JSON.parse(nya.blocks[4].content);
  tabellOk = t.rader.length === 4 && t.rader[0].length === 5 && t.rader[1][1] === 'V V V F V F F V F V' && t.rader[2][1] === 'F F F F F V V V V V' && t.rader[3][1] === 'V F F V F V F F V V';
  tabellDetalj = `${t.rader.length} rader × ${t.rader[0].length} kol`;
} catch (e) {
  tabellDetalj = e.message;
}
k('tabell inre JSON giltig, serierna ordagrant', tabellOk, tabellDetalj);

// 4. Varumärkesgrind (data/varumarke.json) — 0 träffar på nya kapitlet
const vm = JSON.parse(fs.readFileSync('data/varumarke.json', 'utf8'));
const textNya = JSON.stringify(nya);
const traffar = [];
for (const { fran } of vm.forbjudnaFraser) {
  const re = new RegExp(fran, 'iu');
  if (re.test(textNya)) traffar.push(fran);
}
k(`varumärkesgrind 0 träffar (${vm.forbjudnaFraser.length} mönster)`, traffar.length === 0, traffar.join(' | '));

// 5. Juridikgrind: räknedeklaration + juridikdeklaration ordagrant, 2007:528, inga rådsformuleringar
const RAKNE = 'Genomgång på antaganden, ingen rekommendation (2007:528).';
const JURI = 'Utbildningsmaterial — beskriver hur metoden och psykologin fungerar med genomskinliga räkneexempel på antaganden; inga investeringsråd, inga avkastningslöften (2007:528).';
k('räknedeklaration ordagrant', textNya.includes(RAKNE));
k('juristikdeklaration ordagrant', textNya.includes(JURI));
k('2007:528 närvaro', (textNya.match(/2007:528/g) || []).length >= 2, `${(textNya.match(/2007:528/g) || []).length} träffar`);
const rads = textNya.match(/\b(köp|sälj)\s+(denna|den här|aktien|nu|snabbt)\b/i);
k('inga köp/sälj-rådsformuleringar', rads === null, rads ? rads[0] : '');
k('inga avkastningslöften', !/garanterad[^\n]*avkastning|obegränsad[^\n]*avkastning/i.test(textNya));

// 6. Talmarkörer från underlaget (överföringsbevis) — ≥ 80 % krav, 100 % mål
const markorer = [
  '55 mot 45', '20 affärer', '55 %', '+1R', '−1R', 'V V V F V F F V F V', '6/4', 'Jag har koll', '+2R',
  'F F F F F V V V V V', '5/5', 'Kanten är fejk', '0R', 'V F F V F V F F V V', 'inget dramatiskt alls',
  '~23 %', '~26 %', '~27 %', '0,55³ ≈ 17 %', '0,45⁵ ≈ 1,8 %', '0,55 per affär', '5,5R', 'lagen om stora tal',
  'ordningen är slump, fördelningen är metod', '4/10-serie', 'fem raka vinster',
];
const saknade = markorer.filter((m) => !textNya.includes(m));
const andel = Math.round(((markorer.length - saknade.length) / markorer.length) * 100);
k(`talmarkörer ≥ 80 % (${markorer.length - saknade.length}/${markorer.length} = ${andel} %)`, andel >= 80 && saknade.length === 0, saknade.length ? 'saknade: ' + saknade.join(', ') : 'alla närvarande');

// 7. Append-only: kapitel 1–14 + chapters_list 1–14 + övriga toppfält bit-identiska mot HEAD
const gamlaRaw = execSync(`git show HEAD:${FIL}`, { encoding: 'utf8' });
const g = JSON.parse(gamlaRaw);
const kapOk = g.chapters.slice(0, 14).every((c, i) => JSON.stringify(c) === JSON.stringify(j.chapters[i]));
k('kapitel 1–14 bit-identiska', kapOk && j.chapters.length === 15);
const listOk = g.chapters_list.slice(0, 14).every((c, i) => JSON.stringify(c) === JSON.stringify(j.chapters_list[i]));
k('chapters_list 1–14 orörda (strängposter)', listOk);
k('chapters_list-post 15 = {num,title,minutes}', JSON.stringify(j.chapters_list[14]) === '{"num":15,"title":"Från boken till egen analys","minutes":12}');
const topp = ['slug', 'category', 'weight', 'title', 'summary', 'minutes', 'xp', 'level', 'learn', 'why', 'kalla'];
const toppOk = topp.every((f) => JSON.stringify(g[f]) === JSON.stringify(j[f]));
k('övriga toppfält orörda', toppOk);

// 8. Befintliga kapitels quiz oförändrade (extra skydd) — täcks av bit-identitet; sammanfattning
console.log(`\nKVD SAMMANFATTNING: ${pass} PASS · ${fel} FEL`);
process.exit(fel === 0 ? 0 : 1);
