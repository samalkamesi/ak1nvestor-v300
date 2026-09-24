#!/usr/bin/env node
// KVD för v166-d14 — djupkapitel 16 i come-into-my-trading-room.json
// Kontroller: JSON-giltighet · chapterCount/totalMinutes-konsistens · quiz=3 ·
// varumärkesgrind 0 träffar · talmarkörer ≥80 % · append-only (kapitel 1–15
// bit-identiska) · chapters_list: strängposterna 1–15 orörda + post 16 som
// {num,title,minutes} enligt DESIGN-v166 (filen har historiskt strängformat;
// kontraktet dikterar objektformat för nya posten, gamla poster RÖRS EJ).
import fs from "node:fs";
import { execFileSync } from "node:child_process";

const SOKVAG = "data/bokmaster/come-into-my-trading-room.json";
let fel = 0;
const krav = (namn, ok, detalj) => {
  console.log(`${ok ? "GRÖN" : "RÖD"}  ${namn}${detalj ? " — " + detalj : ""}`);
  if (!ok) fel++;
};

let bok;
try {
  bok = JSON.parse(fs.readFileSync(SOKVAG, "utf8"));
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
  new Set(ny.quiz.map(q => q.ratt)).size === 3, ny.quiz.map(q => q.ratt).join(","));

// Blockstruktur enligt design-tabellen (kärna, läsning, utmaning,
// räkneexempel text+tabell, fallgropar, insikt)
const typer = ny.blocks.map(b => b.type);
const vagnta = ["text", "text", "utmaning", "text", "tabell", "text", "insikt"];
krav("blockstruktur (kärna, läsning, utmaning, räkneexempel text+tabell, fallgropar, insikt)",
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
krav("källdeklaration ordagrant (Ericsson B, ERIC-B.ST, Yahoo Finance, 2026-09-24, genomräkning ej rekommendation)",
  text.includes("Ericsson B (ERIC-B.ST), källa Yahoo Finance, hämtat 2026-09-24") &&
  text.includes("En genomräkning, inte en rekommendation (2007:528)"));
krav("övningsdeklaration ordagrant (utbildningsmaterial, inga investeringsråd, inga avkastningslöften)",
  text.includes("Utbildningsmaterial — beskriver hur metoden fungerar med källmärkta, historiska exempel; inga investeringsråd, inga avkastningslöften (2007:528)"));
krav("jurideklaration närvaro (2007:528) ≥ 2",
  (text.match(/2007:528/g) || []).length >= 2, `${(text.match(/2007:528/g) || []).length} förekomster`);

// Talmarkörer från underlag f14 — överföringsbevis ≥ 80 %
const markorer = ["91,50", "23 juli", "91–100", "93,82", "96,70", "96,76", "100,50", "96,50",
  "112,50", "4,00", "12,00", "3,0", "100 000", "2 000", "500", "50 250", "−2 000", "2,0 %",
  "+6 000", "+6,0 %", "6 %", "14 juli", "1 %", "2 %", "2,0", "ERIC-B.ST", "Yahoo Finance",
  "2026-09-24", "Ericsson", "macd", "högst tre", "F09", "F11", "F12", "F03", "triple screen",
  "journal", "2 %-regeln", "6 %-taket"];
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
  gamla.summary === bok.summary && gamla.weight === bok.weight &&
  gamla.category === bok.category && gamla.minutes === bok.minutes &&
  gamla.xp === bok.xp && gamla.level === bok.level &&
  JSON.stringify(gamla.learn) === JSON.stringify(bok.learn) &&
  JSON.stringify(gamla.why) === JSON.stringify(bok.why) &&
  JSON.stringify(gamla.kalla) === JSON.stringify(bok.kalla) &&
  gamla.chapterCount === 15 && bok.chapterCount === 16 &&
  gamla.totalMinutes === 170 && bok.totalMinutes === 183;
krav("övliga fält orörda (slug, title, summary, weight, kalla, …)", oforandradeFalt);

console.log(fel === 0 ? "\nKVD: GRÖN — 0 röda" : `\nKVD: RÖD — ${fel} krav fallerade`);
process.exit(fel === 0 ? 0 : 1);
