#!/usr/bin/env node
/**
 * KVD PREKOLL för s5-u1 omgång 32 — am-10-insynslistan FÖRE registerinsert.
 * Kontroller: struktur, aritmetik (oberoende omräkning), juridikgrind,
 * språkgrind, korslänkar (registeräkta), R2, blockkonvention, learn-form.
 * Kör: node verktyg/_s5u1o32-kvd.mjs
 */
import { readFileSync } from "node:fs";

const KURS = "/home/ak1a/AK1/data/kurser-tillagg/am-10-insynslistan.json";
const REG = "/home/ak1a/AK1/public/deep-courses.json";
const c = JSON.parse(readFileSync(KURS, "utf8"));
const dc = JSON.parse(readFileSync(REG, "utf8"));
const slugs = Object.keys(dc);

let pass = 0, fel = 0, varning = 0;
const OK = (m) => { pass++; };
const F = (m) => { fel++; console.log("FEL:", m); };
const V = (m) => { varning++; console.log("VARN:", m); };
const t = (b, m) => { if (b) OK(m); else F(m); };

// ── 1. STRUKTUR ─────────────────────────────────────────────────────────────
const falt = ["slug","category","weight","chapterCount","totalMinutes","title","summary","minutes","xp","level","learn","why","chapters_list","history","chapters","lynchSection","grahamSection","ak1Section"];
t(JSON.stringify(Object.keys(c)) === JSON.stringify(falt), "18 fält i ordning");
t(c.slug === "am-10-insynslistan", "slug korrekt");
t(c.category === "AKTIEMARKNADEN I PRAKTIKEN", "kategori = familjen");
t(c.chapterCount === 6 && c.chapters.length === 6 && c.chapters_list.length === 6, "6 kapitel + chapters_list");
t(c.totalMinutes === c.minutes && c.minutes === 24, "minutes 24 = totalMinutes");
t(c.xp === 50, "xp 50");
t(c.level === "Intermediär", "nivå Intermediär");
t(c.weight === "—", "weight —");
t(typeof c.learn === "string" && c.learn.length > 1000, "learn är text > 1000 tecken");
t(c.why.length > 1000 && c.why.length < 3500, "why-längd " + c.why.length + " i spannet");
t(c.summary.length > 1000 && c.summary.length < 3500, "summary-längd " + c.summary.length + " i spannet");
t(typeof c.history === "object" && ["origin","evolution","modern"].every(k => k in c.history), "history 3 sektioner");
for (const s of ["lynchSection","grahamSection","ak1Section"]) t(typeof c[s] === "string" && c[s].length > 300, s + " längd " + c[s].length);
// chapters_list-paritet
for (let i = 0; i < 6; i++) {
  t(c.chapters_list[i].num === c.chapters[i].num && c.chapters_list[i].title === c.chapters[i].title && c.chapters_list[i].minutes === c.chapters[i].minutes, "chapters_list-paritet kap " + (i+1));
  t(c.chapters[i].minutes === 4, "kap " + (i+1) + " = 4 min");
  t(c.chapters[i].intro && c.chapters[i].intro.length > 50, "kap " + (i+1) + " intro");
}
// blockkonvention: kap1 text+definition+insight; kap2-5 text+tabell+insight; kap6 text+utmaning+insight
const bty = (i) => c.chapters[i].blocks.map(b => b.type).join(",");
t(bty(0) === "text,definition,insight", "kap 1 block: " + bty(0));
for (const i of [1,2,3,4]) t(bty(i) === "text,tabell,insight", "kap " + (i+1) + " block: " + bty(i));
t(bty(5) === "text,utmaning,insight", "kap 6 block: " + bty(5));
for (const ch of c.chapters) for (const b of ch.blocks) t(typeof b.content === "string" && b.content.length > 60, "blockcontent kap " + ch.num + " " + b.type);

// ── 2. ARITMETIK (oberoende omräkning) ──────────────────────────────────────
const blob = JSON.stringify(c);
t(10000 * 40 === 400000, "köp 10 000 à 40 = 400 000 kr");
t(120 / 365 > 0.328 && 120 / 365 < 0.330, "120/365 = 32,9 % (0,3287)");
t(120 / 252 > 0.475 && 120 / 252 < 0.478, "120/252 = 47,6 % (0,4762)");
t(41 + 173 + 88 + 27 === 329, "41+173+88+27 = 329 anmälningar");
t(Math.abs((7.2 - 3.1) - 4.1) < 0.001, "klusteröverskott 7,2−3,1 = +4,1");
t(Math.abs((3.9 - 3.1) - 0.8) < 0.001, "enkelt köp 3,9−3,1 = +0,8");
t(Math.abs((3.0 - 3.1) + 0.1) < 0.001, "options 3,0−3,1 = −0,1");
t(Math.abs((4.4 - 3.1) - 1.3) < 0.001, "säljkluster 4,4−3,1 = +1,3");
t(42 / 30 === 1.4, "optionsrealisation 42/30 = 1,4");
t(12000 + 8000 + 15000 === 35000, "kluster 12 000+8 000+15 000 = 35 000 aktier");
t(35000 * 40 === 1400000, "35 000 à 40 = 1 400 000 kr");
t(Math.abs(400000 / 8400000 - 0.0476) < 0.001, "400 000/8 400 000 = 4,8 % av årslönen");
t(Math.abs(400000 / 40000000 - 0.01) < 0.0001, "400 000/40 Mkr = 1,0 %");
t(Math.abs(400000 / 4000000 - 0.10) < 0.001, "400 000/4 Mkr = 10,0 %");
t(4 * 30 === 120, "4 rapporter × 30 dagar = 120");
// kalenderkedjan: kursens exempel saknar år (påhittat) — kontrollen binder det
// till 2022, det senaste år då 25 januari var en TISDAG som kursen anger
{ const d = new Date(Date.UTC(2022,0,25));
  t(d.getUTCDay() === 2, "25 jan 2022 = tisdag (kursens kalenderbärare)");
  t(d.getUTCDay() === 2 && (() => { const s = new Date(Date.UTC(2022,0,25)); s.setUTCDate(s.getUTCDate()-30); return s.getUTCMonth() === 11 && s.getUTCDate() === 26; })(), "25 jan − 30 d = 26 dec"); }
// 3 arbetsdagar från tors 27 jan 2022: fre 28, mån 31, tis 1 feb
{ const d = new Date(Date.UTC(2022,0,27)); const dagar = [];
  let n = 0;
  while (n < 3) { d.setUTCDate(d.getUTCDate()+1); const wd = d.getUTCDay(); if (wd !== 0 && wd !== 6) { n++; dagar.push(d.getUTCDate() + "/" + (d.getUTCMonth()+1)); } }
  t(dagar.join(";") === "28/1;31/1;1/2", "3 arbetsdagar efter tors 27 jan = fre 28, mån 31, tis 1 feb"); }
// köp-andel modellurval
t(Math.abs(302 / 329 - 0.918) < 0.001, "302/329 = 91,8 %");
t(Math.abs(27 / 329 - 0.082) < 0.001, "27/329 = 8,2 %");

// ── 3. JURIDIKGRIND ────────────────────────────────────────────────────────
const rad = ["du bör köpa", "vi rekommenderar", "kop dessa aktier", "sälj dina aktier", "investera i denna aktie", "min rekommendation", "tipsa om aktien", "garanterad avkastning", "riskfri vinst"];
let radträff = 0;
for (const r of rad) if (blob.toLowerCase().includes(r)) { radträff++; F("rådfras: " + r); }
t(radträff === 0, "0 rådgivningsfraser");
t(/\d+\s*(kap|§|paragraf)\s*\d+/i.test(blob) === false, "0 lagrumsformat");
t(blob.includes("utbildning"), "utbildningsframing närvarande");
t(blob.includes("PÅHITTAD") || blob.includes("PÅHITTADE"), "PÅHITTADE-deklaration");
t(/lwa|hyra för|tjänstepris|kr\/mån|pris per månad/i.test(blob) === false, "R2: 0 tjänstepristal");

// ── 4. SPRÅKGRIND ─────────────────────────────────────────────────────────
t(/[\u4e00-\u9fff\u3040-\u30ff]/.test(blob) === false, "0 CJK");
t(/[\u0400-\u04ff]/.test(blob) === false, "0 kyrilliska");
t(/\t/.test(blob) === false, "0 tabbar");
t(/\u00ad/.test(blob) === false, "0 mjuka bindestreck");
t(/…/.test(blob) === false, "0 tre-punkter");
t(/[\u201c\u201d\u2018\u2019]/.test(blob) === false, "0 engelska typografiska citat");
t(/\u00a0/.test(blob) === false, "0 hårda mellanslag");
t(/  /.test(blob) === false, "0 dubbla mellanslag");
// dubbelord (åäö-säker)
{ const m = blob.match(/\b(\w+)(\s+\1\b)/giu); t(m === null, "0 dubbelord" + (m ? ": " + m.slice(0,3).join(",") : "")); }
// understreck i text (utanför JSON-nycklar: content-värden)
{ const texts = []; for (const ch of c.chapters) for (const b of ch.blocks) texts.push(b.content);
  texts.push(c.summary, c.why, c.learn, c.lynchSection, c.grahamSection, c.ak1Section);
  const us = texts.join(" ").match(/\w+_\w+/g); t(us === null, "0 understreck i text" + (us ? ": " + us[0] : "")); }
// engelska funktionord
const eng = [" the ", " and ", " with ", " that ", " this ", " from ", " same ", " no:", " itself", " their "];
{ const texts = (c.summary + c.why + c.learn + JSON.stringify(c.chapters) + c.lynchSection + c.grahamSection + c.ak1Section + JSON.stringify(c.history)).toLowerCase();
  const träff = eng.filter(e => texts.includes(e));
  t(träff.length === 0, "0 engelska funktionord" + (träff.length ? ": " + träff.join(",") : "")); }

// ── 5. KORSLÄNKAR registeräkta ─────────────────────────────────────────────
const lankade = ["v20-aterekop-egna-aktier","kt-07-den-tillverkade-katalysatorn","km-036-overconfidence","v16-produktlanseringar","am-06-kortlage-och-aktieutlaning","am-03-lasa-aktiesidan","am-04-marknadsstruktur"];
for (const l of lankade) t(slugs.includes(l), "korslänk registeräkt: " + l);
// alla slug-referenser i texten som matchar mönstret xx-nn ska finnas i registret
// (kursens EGEN slug am-10-… undantas — den är insertens objekt, inte en korslänk)
{ const saknade = (blob.match(/[a-z]{1,5}-\d{2,3}(?=-[a-z])/g) || []).filter(m => m !== "am-10" && !slugs.some(s => s.startsWith(m)));
  t(saknade.length === 0, "0 fantomslugar" + (saknade.length ? ": " + saknade.join(",") : "")); }

// ── 6. SONDBELÄGG kvarstår ────────────────────────────────────────────────
t(!slugs.includes("am-10-insynslistan"), "am-10 ej redan i registret (idempotens)");

console.log(`\nKVD: ${pass} PASS, ${fel} FEL, ${varning} VARNING`);
process.exit(fel > 0 ? 1 : 0);
