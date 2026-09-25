#!/usr/bin/env node
// v166-d17 KVD — mekanisk efterkontroll av djupkapitel 15 i
// data/bokmaster/the-new-science-of-technical-analysis.json enligt DESIGN-v166.
import fs from 'node:fs';
import { execFileSync } from 'node:child_process';

const FIL = 'data/bokmaster/the-new-science-of-technical-analysis.json';
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

console.log('KVD v166-d17 the-new-science-of-technical-analysis');

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

// 3. Blockstruktur enligt DESIGN-v166 (f17: text/text/utmaning/text/tabell/text/insikt)
const typer = nya.blocks.map((b) => b.type);
const forvantat = ['text', 'text', 'utmaning', 'text', 'tabell', 'text', 'insikt'];
k('blockstruktur', JSON.stringify(typer) === JSON.stringify(forvantat), typer.join('/'));

// 4. Varumärkesgrind (data/varumarke.json) — 0 träffar på nya kapitlet
const vm = JSON.parse(fs.readFileSync('data/varumarke.json', 'utf8'));
const textNya = JSON.stringify(nya);
const traffar = [];
for (const { fran } of vm.forbjudnaFraser) {
  const re = new RegExp(fran, 'iu');
  if (re.test(textNya)) traffar.push(fran);
}
k(`varumärkesgrind 0 träffar (${vm.forbjudnaFraser.length} mönster)`, traffar.length === 0, traffar.join(' | '));

// 5. Juridikgrind: käll- + övnings- + juridikdeklaration ordagrant, 2007:528, inga rådsformuleringar
const KALL = 'Verkliga dagsslutkurser, Volvo B (VOLV-B.ST), källa Yahoo Finance, hämtat 2026-09-24 (251 handelsdagar). En kursräkning — ingen bedömning av aktien.';
const JURI = 'Utbildningsmaterial — beskriver hur metoden räknar med källmärkta, historiska exempel; inga investeringsråd, inga avkastningslöften (2007:528).';
k('källdeklaration ordagrant', textNya.includes(KALL));
k('övningsdeklaration (i källdeklarationen)', textNya.includes('En kursräkning — ingen bedömning av aktien'));
k('juristikdeklaration ordagrant', textNya.includes(JURI));
k('2007:528 närvaro', (textNya.match(/2007:528/g) || []).length >= 2, `${(textNya.match(/2007:528/g) || []).length} träffar`);
const rads = textNya.match(/\b(köp|sälj)\s+(denna|den här|aktien|nu|snabbt)\b/i);
k('inga köp/sälj-rådsformuleringar', rads === null, rads ? rads[0] : '');
k('inga avkastningslöften', !/garanterad[^\n]*avkastning|obegränsad[^\n]*avkastning/i.test(textNya));

// 6. Talmarkörer från underlaget (överföringsbevis) — ≥ 80 % krav, 100 % mål
const markorer = ['1994', '2026-09-24', '251 handelsdagar', '13 juli', '335,30', '340,20', '7 jul', '14 juli', '337,10', '333,70', '8 jul', '15 jul', '338,50', '334,40', '16 jul', '341,30', '336,90', '17 jul', '339,10', '335,30', '20 jul', '338,70', '339,50', '338,50', '21 jul', '348,00', '22 jul', '352,00', '23 jul', '354,80', '24 juli', '354,20', '342,10', '348,90', '355,90', '371,50', '4 aug', '+4,7 %', '330,20', '15 sep', '−11,1 %', 'fyra sälj-nior', 'tre giltiga', 'en ogiltig köp-nia'];
const saknade = markorer.filter((m) => !textNya.includes(m));
const andel = Math.round(((markorer.length - saknade.length) / markorer.length) * 100);
k(`talmarkörer ≥ 80 % (${markorer.length - saknade.length}/${markorer.length} = ${andel} %)`, andel >= 80 && saknade.length === 0, saknade.length ? 'saknade: ' + saknade.join(', ') : 'alla närvarande');

// 7. Append-only: kapitel 1–14 + chapters_list 1–14 + övriga toppfält bit-identiska mot HEAD
const gamlaRaw = execFileSync("git", ["show", `HEAD:${FIL}`], { encoding: 'utf8' });
const g = JSON.parse(gamlaRaw);
const kapOk = g.chapters.slice(0, 14).every((c, i) => JSON.stringify(c) === JSON.stringify(j.chapters[i]));
k('kapitel 1–14 bit-identiska', kapOk && j.chapters.length === 15);
const listOk = g.chapters_list.slice(0, 14).every((c, i) => JSON.stringify(c) === JSON.stringify(j.chapters_list[i]));
k('chapters_list 1–14 orörda (strängposter)', listOk);
k('chapters_list-post 15 = {num,title,minutes}', JSON.stringify(j.chapters_list[14]) === '{"num":15,"title":"Från boken till egen analys","minutes":13}');
const topp = ['slug', 'category', 'weight', 'title', 'summary', 'minutes', 'xp', 'level', 'learn', 'why', 'kalla'];
const toppOk = topp.every((f) => JSON.stringify(g[f]) === JSON.stringify(j[f]));
k('övriga toppfält orörda', toppOk);

// 8. Befintliga kapitels quiz oförändrade (extra skydd) — täcks av bit-identitet; sammanfattning
console.log(`\nKVD SAMMANFATTNING: ${pass} PASS · ${fel} FEL`);
process.exit(fel === 0 ? 0 : 1);
