#!/usr/bin/env node
// KVD för v166-d09 — djupkapitel 16 i the-visual-investor.json
// Kontroller: JSON-giltighet · chapterCount/totalMinutes-konsistens · quiz=3 ·
// varumärkesgrind 0 träffar · talmarkörer ≥80 % · append-only (kapitel 1–15
// bit-identiska) · chapters_list: strängposterna 1–15 orörda + post 16 som
// {num,title,minutes} enligt DESIGN-v166 (filen har historiskt strängformat;
// kontraktet dikterar objektformat för nya posten, gamla poster RÖRS EJ).
import fs from "node:fs";
import { execFileSync } from "node:child_process";

const SOKVAG = "data/bokmaster/the-visual-investor.json";
let fel = 0;
const krav = (namn, ok, detalj) => {
  console.log(`${ok ? "GRÖN" : "RÖD"}  ${namn}${detalj ? " — " + detalj : ""}`);
  if (!ok) fel++;
};

const rå = fs.readFileSync(SOKVAG, "utf8");
let bok;
try {
  bok = JSON.parse(rå);
  krav("JSON giltig", true);
} catch (e) {
  krav("JSON giltig", false, e.message);
  process.exit(1);
}

// Konsistens
krav("chapterCount == len(chapters)", bok.chapterCount === bok.chapters.length,
  `chapterCount=${bok.chapterCount}, len=${bok.chapters.length}`);
const summa = bok.chapters.reduce((a, k) => a + k.minutes, 0);
krav("totalMinutes == Σ kapitelminuter", bok.totalMinutes === summa,
  `totalMinutes=${bok.totalMinutes}, Σ=${summa}`);

// Nya kapitlet
const ny = bok.chapters[bok.chapters.length - 1];
krav("nytt kapitel num = sista+1", ny.num === 16 && bok.chapters.length === 16, `num=${ny.num}`);
krav("titel", ny.title === "Från boken till egen analys", ny.title);
krav("minutes 11–14", ny.minutes >= 11 && ny.minutes <= 14, `minutes=${ny.minutes}`);
krav("quiz = 3 frågor", Array.isArray(ny.quiz) && ny.quiz.length === 3, `len=${ny.quiz?.length}`);
krav("quizformat {q, alternativ[4], ratt, tips}",
  ny.quiz.every(q => q.q && Array.isArray(q.alternativ) && q.alternativ.length === 4 &&
    Number.isInteger(q.ratt) && q.ratt >= 0 && q.ratt <= 3 && q.tips));
krav("quiz ratt inom alternativ + unika positioner",
  new Set(ny.quiz.map(q => q.ratt)).size === 3);

// Blockstruktur enligt design-tabellen
const typer = ny.blocks.map(b => b.type);
const vagnta = ["text", "text", "utmaning", "text", "text", "text", "insikt"];
krav("blockstruktur (kärna, läsning, utmaning, räkneexempel ×2, fallgropar, insikt)",
  JSON.stringify(typer) === JSON.stringify(vagnta), typer.join(", "));

// chapters_list — post 16 som objekt enligt kontraktet; gamla strängposter orörda
const lp = bok.chapters_list[bok.chapters_list.length - 1];
krav("chapters_list-längd == chapters-längd", bok.chapters_list.length === bok.chapters.length);
krav("chapters_list-poster 1–15 fortfarande strängar (append-only)",
  bok.chapters_list.slice(0, 15).every(c => typeof c === "string"));
krav("chapters_list-post 16 = {num,title,minutes} matchande kapitel 16",
  typeof lp === "object" && lp.num === ny.num && lp.title === ny.title && lp.minutes === ny.minutes);

// Varumärkesgrind — forbjudnaFraser mot hela nya kapitlet
const varumarke = JSON.parse(fs.readFileSync("data/varumarke.json", "utf8"));
const text = JSON.stringify(ny);
const traifar = [];
for (const f of varumarke.forbjudnaFraser) {
  const re = new RegExp(f.fran, "i");
  if (re.test(text)) traifar.push(f.fran);
}
krav("varumärkesgrind 0 träffar", traifar.length === 0,
  traifar.length ? traifar.join("; ") : `${varumarke.forbjudnaFraser.length} mönster testade`);

// Juridik — rådgivningsformuleringar + käll-/övningsdeklarationer
const radgivning = [/\bköp\b[^.]*\baktie\b/i, /\bsälj\b[^.]*\baktie\b/i, /\bbör du köpa\b/i, /\brekommenderar (?:att )?köp/i];
const radTraff = radgivning.filter(re => re.test(text));
krav("inga köp/sälj-formuleringar", radTraff.length === 0, radTraff.map(String).join("; "));
krav("källdeklaration ordagrant (Ericsson B, Yahoo Finance, 2026-09-24)",
  text.includes("Verkliga kurser, Ericsson B (ERIC-B.ST), källa Yahoo Finance, hämtat 2026-09-24"));
krav("övningsdeklaration ordagrant (inte en rekommendation)",
  text.includes("En övning i att läsa — inte en rekommendation (2007:528)"));
krav("jurideklaration närvaro (2007:528) ≥ 2",
  (text.match(/2007:528/g) || []).length >= 2, `${(text.match(/2007:528/g) || []).length} förekomster`);

// Talmarkörer från underlag f09 — överföringsbevis ≥80 %
const markorer = ["114,80", "50,01", "−56,4 %", "120,10", "+140,2 %", "×2,4", "94,26", "21,5 %",
  "125,85", "91,52", "−27,3 %", "~91", "~100", "93,82", "96,7", "96,76", "127,35", "2 juni",
  "91,50", "23 juli", "−28,2 %", "14 juli", "112,75", "98,54", "−12,6 %", "42,8 miljoner",
  "8,7 miljoner", "4,9×", "dec 2021", "sep 2023", "april 2026", "maj 2026", "fem år",
  "14 månader", "fem månader", "minst två gånger",
  "(114,80 − 50,01) ÷ 114,80", "(125,85 − 91,52) ÷ 125,85"];
const saknade = markorer.filter(m => !text.includes(m));
krav(`talmarkörer ≥ 80 %`, saknade.length / markorer.length <= 0.2,
  `${markorer.length - saknade.length}/${markorer.length} närvaro${saknade.length ? ", saknas: " + saknade.join(", ") : ""}`);

// Append-only — kapitel 1–15 bit-identiska mot HEAD
const gamlaRå = execFileSync("git", ["show", `HEAD:${SOKVAG}`], { encoding: "utf8" });
const gamla = JSON.parse(gamlaRå);
const identiska = gamla.chapters.every((g, i) =>
  JSON.stringify(g) === JSON.stringify(bok.chapters[i]));
krav("befintliga kapitel bit-identiska (append-only)", identiska,
  `${gamla.chapters.length} gamla kapitel jämförda`);
const gamlaLista = JSON.stringify(gamla.chapters_list) === JSON.stringify(bok.chapters_list.slice(0, 15));
krav("chapters_list-poster 1–15 bit-identiska mot HEAD", gamlaLista);
const oforandradeFalt = gamla.slug === bok.slug && gamla.title === bok.title &&
  gamla.summary === bok.summary && gamla.kalla && bok.kalla &&
  JSON.stringify(gamla.kalla) === JSON.stringify(bok.kalla) &&
  gamla.chapterCount === 15 && bok.chapterCount === 16 &&
  gamla.totalMinutes === 170 && bok.totalMinutes === 183;
krav("övliga fält orörda (slug, title, summary, kalla, …)", oforandradeFalt);

console.log(fel === 0 ? "\nKVD: GRÖN — 0 röda" : `\nKVD: RÖD — ${fel} krav fallerade`);
process.exit(fel === 0 ? 0 : 1);
