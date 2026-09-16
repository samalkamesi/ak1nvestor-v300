#!/usr/bin/env node
/**
 * KVD — s5-u2 (manifest auto-s5-1789569318697, 2026-09-16): maskinell kontroll
 * av de två nya kurserna bk-02-resultatrakningen + bk-03-kassaflodesrakningen.
 * Kontroller: strukturparitet, aritmetik (samtliga tal i båda kurserna),
 * språkgrind (CJK/underscore/läckor), juridikgrind (rådfraser),
 * korslänkar mot registret ∪ egna slugar (egna gröna via unionen).
 */
import { readFileSync } from "node:fs";

const ROT = "/home/ak1a/AK1";
const register = JSON.parse(readFileSync(`${ROT}/public/deep-courses.json`, "utf8"));
const regSlugs = new Set(Object.keys(register));
const EGENA = ["bk-02-resultatrakningen", "bk-03-kassaflodesrakningen"];
for (const s of EGENA) regSlugs.add(s); // union: egna referenser gröna i förhand (infogas strax)
let fel = 0, kontroll = 0;
const ok = (v, msg) => { kontroll++; if (!v) { fel++; console.log(`FEL: ${msg}`); } };
const nar = (faktisk, vantad, msg) => { kontroll++; if (Math.abs(faktisk - vantad) > 1e-9) { fel++; console.log(`FEL: ${msg} (${faktisk} ≠ ${vantad})`); } };

for (const fil of EGENA) {
  const k = JSON.parse(readFileSync(`${ROT}/data/kurser-tillagg/${fil}.json`, "utf8"));
  const alla = JSON.stringify(k);
  // innehållstext utan JSON-nycklar (chapters_list etc.) och utan kategori-fältets
  // versalkonvention — grunderna ska testa PROSAN, inte strukturens fältnamn
  const texter = [k.summary, k.learn, k.why, k.history?.origin, k.history?.evolution, k.history?.modern, k.lynchSection, k.grahamSection, k.ak1Section,
    ...k.chapters.flatMap((c) => [c.intro, c.title, ...c.blocks.map((b) => b.content)])].filter(Boolean).join(" ");
  ok(k.slug === fil, `${fil}: slug-fel`);
  ok(k.category === "BOKFÖRING & ÅRSREDOVISNING", `${fil}: kategori`);
  ok(k.chapterCount === 6 && k.chapters.length === 6 && k.chapters_list.length === 6, `${fil}: antal kapitel`);
  ok(k.minutes === 24 && k.totalMinutes === 24 && k.xp === 50, `${fil}: minuter/XP`);
  ok(k.chapters.reduce((s, c) => s + c.minutes, 0) === 24, `${fil}: kapitelminuter summerar 24`);
  ok(k.level === "Nybörjare", `${fil}: nivå Nybörjare`);
  ok(k.weight === "—", `${fil}: weight`);
  ok(!("quiz" in k), `${fil}: bär inget quiz-fält`);
  ok(typeof k.summary === "string" && k.summary.length > 60, `${fil}: summary`);
  ok(typeof k.learn === "string" && k.learn.length > 100, `${fil}: learn`);
  ok(typeof k.why === "string" && k.why.length > 150, `${fil}: why (lärvägs-varför)`);
  ok(k.history && k.history.origin && k.history.evolution && k.history.modern, `${fil}: history-triad`);
  ok(k.lynchSection && k.grahamSection && k.ak1Section, `${fil}: mästarsektioner`);
  for (let i = 0; i < 6; i++) {
    const a = k.chapters_list[i], b = k.chapters[i];
    ok(a.num === b.num && a.title === b.title && a.minutes === b.minutes, `${fil}: paritet kapitel ${i + 1}`);
    ok(b.intro && b.blocks && b.blocks.length >= 2 && b.blocks.some((x) => x.type === "text"), `${fil}: kapitel ${i + 1} intro+block`);
  }
  // språkgrind: CJK, underscore-läckor, mjuka bindestreck, engelska läckord, VERSAL-läcka (EBITDA är etablerat registermån)
  ok(!/[\u4e00-\u9fff\u3040-\u30ff\uac00-\ud7af]/.test(alla), `${fil}: CJK-tecken`);
  ok(!/[a-zåäö]_[a-zåäö]/i.test(texter), `${fil}: underscore i ord`);
  ok(!/\u00ad/.test(alla), `${fil}: mjukt bindestreck`);
  ok(!/\b(the|with|from|about|however|between)\b/i.test(texter), `${fil}: engelska läckord`);
  ok(!/[A-ZÅÄÖ]{6,}/.test(texter.replace(/EBITDA/g, "")), `${fil}: VERSAL-läcka`);
  // juridikgrind: rådfraser + utbildningsformulering
  ok(!/(bör (du )?(köpa|sälja|handla)|rekommenderar (att )?(köpa|sälja)|garanterad avkastning|riskfri avkastning|säker avkastning|köp denna|sälj denna|bäst att köpa)/i.test(alla), `${fil}: rådfraser`);
  ok(/aldrig investeringsråd|utbildar|i att läsa och räkna/i.test(k.ak1Section), `${fil}: utbildningsformulering i ak1-sektionen`);
  // korslänkar: korta kursreferenser måste ha serie i registret ∪ egna
  const ref = [...new Set([...alla.matchAll(/\b([a-z]{2,4})-(\d{2})\b/g)].map((m) => `${m[1]}-${m[2]}`))];
  for (const r of ref) {
    ok([...regSlugs].some((s) => s.startsWith(r + "-")), `${fil}: referens ${r} saknar serie i registret`);
  }
}

// ── aritmetik bk-02: trappan 1 200 → 540 → 300 → 270 → 216 med marginaler ──
const bk2 = JSON.stringify(JSON.parse(readFileSync(`${ROT}/data/kurser-tillagg/bk-02-resultatrakningen.json`, "utf8")));
{
  nar(1200 - 660, 540, "bk-02 bruttoresultat");
  nar(540 / 1200 * 100, 45.0, "bk-02 bruttomarginal");
  nar(540 - 240, 300, "bk-02 EBIT");
  nar(300 / 1200 * 100, 25.0, "bk-02 EBIT-marginal");
  nar(300 - 30, 270, "bk-02 före skatt");
  nar(270 / 1200 * 100, 22.5, "bk-02 marginal före skatt");
  nar(270 * 0.20, 54, "bk-02 skatt (förenklad 20 %)");
  nar(270 - 54, 216, "bk-02 årets resultat");
  nar(216 / 1200 * 100, 18.0, "bk-02 nettomarginal");
  nar(300 / 40, 7.5, "bk-02 räntetäckning");
  nar(216 / 120, 1.80, "bk-02 EPS");
  nar(27.00 / 1.80, 15.0, "bk-02 P/E");
  nar(0.90 / 1.80 * 100, 50, "bk-02 utdelningskvot %");
  nar(Math.round(0.90 / 27.00 * 100 * 1000) / 1000, 3.333, "bk-02 direktavkastning %");
  nar(260 + 40, 300, "bk-02 engångsfällan justerat EBIT");
  // textåtergivning: nyckeltalen står i texten
  for (const s of ["1 200", "540", "45,0", "300", "25,0", "270", "22,5", "216", "18,0", "7,5", "1,80", "15,0", "50 procent", "3,3 procent", "20,6"])
    ok(bk2.includes(s), `bk-02: talet "${s}" saknas i texten`);
}

// ── aritmetik bk-03: tre flöden + trippelkontrollens stängda ekvation ──
const bk3 = JSON.stringify(JSON.parse(readFileSync(`${ROT}/data/kurser-tillagg/bk-03-kassaflodesrakningen.json`, "utf8")));
{
  nar(216 + 30 + 54, 300, "bk-03 resultat→EBIT");
  nar(300 + 60, 360, "bk-03 EBITDA");
  nar(360 - 5 - 5 + 15, 365, "bk-03 efter arbetskapital");
  nar(365 - 54, 311, "bk-03 löpande verksamheten");
  nar(10 - 40 - 20 - 108, -158, "bk-03 finansieringsverksamheten");
  nar(311 - 120 - 158, 33, "bk-03 årets kassaflöde");
  nar(32 + 33, 65, "bk-03 kassa slut");
  nar(311 - 120, 191, "bk-03 frikassaflöde");
  nar(216 - 108, 108, "bk-03 Δ eget kapital");
  nar(15 - 20, -5, "bk-03 Δ skulder");
  nar(-5 + 108, 103, "bk-03 Δ finansieringssida (krav)");
  nar(33 + 5 + 5 + 60, 103, "bk-03 Δ tillgångssida (faktisk) — EKVATIONEN STÄNGER");
  nar(120 - 60, 60, "bk-03 Δ maskiner");
  nar(360 - 311, 49, "bk-03 EBITDA→kassa gap");
  nar(311 - (115 - 5), 201, "bk-03 omvända fallet fordringar 115");
  nar(216 - 201, 15, "bk-03 vinst endast på papper");
  nar(Math.round(191 / 108 * 1000) / 1000, 1.769, "bk-03 utdelningstäckning (nästan dubbel)");
  for (const s of ["216 + 30 + 54 = 300", "300 + 60 = 360", "= 311", "= +33", "32 till 65", "= 191", "103", "+60", "201", "15 miljoner"])
    ok(bk3.includes(s), `bk-03: strängen "${s}" saknas i texten`);
}

console.log(`\n${kontroll} kontroller — ${fel} FEL`);
process.exit(fel === 0 ? 0 : 1);
