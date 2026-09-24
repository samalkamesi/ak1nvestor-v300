#!/usr/bin/env node
// KVD för v166-d10 — djupkapitel 17 i intermarket-analysis.json
// Kontroller: JSON-giltighet · chapterCount/totalMinutes-konsistens · quiz=3 ·
// varumärkesgrind 0 träffar · talmarkörer ≥80 % · append-only (kapitel 1–16
// bit-identiska) · chapters_list: strängposterna 1–16 orörda + post 17 som
// {num,title,minutes} enligt DESIGN-v166 (filen har historiskt strängformat;
// kontraktet dikterar objektformat för nya posten, gamla poster RÖRS EJ).
import fs from "node:fs";
import { execFileSync } from "node:child_process";

const SOKVAG = "data/bokmaster/intermarket-analysis.json";
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
krav("nytt kapitel num = sista+1", ny.num === 17 && bok.chapters.length === 17, `num=${ny.num}`);
krav("titel", ny.title === "Från boken till egen analys", ny.title);
krav("minutes 11–14", ny.minutes >= 11 && ny.minutes <= 14, `minutes=${ny.minutes}`);
krav("quiz = 3 frågor", Array.isArray(ny.quiz) && ny.quiz.length === 3, `len=${ny.quiz?.length}`);
krav("quizformat {q, alternativ[4], ratt, tips}",
  ny.quiz.every(q => q.q && Array.isArray(q.alternativ) && q.alternativ.length === 4 &&
    Number.isInteger(q.ratt) && q.ratt >= 0 && q.ratt <= 3 && q.tips));
krav("quiz ratt inom alternativ + unika positioner",
  new Set(ny.quiz.map(q => q.ratt)).size === 3);

// Blockstruktur enligt design-tabellen (kärna, läsning, utmaning,
// räkneexempel text+tabell — underlaget bär tabell, fallgropar, insikt)
const typer = ny.blocks.map(b => b.type);
const vagnta = ["text", "text", "utmaning", "text", "tabell", "text", "insikt"];
krav("blockstruktur (kärna, läsning, utmaning, räkneexempel text+tabell, fallgropar, insikt)",
  JSON.stringify(typer) === JSON.stringify(vagnta), typer.join(", "));

// chapters_list — post 17 som objekt enligt kontraktet; gamla strängposter orörda
const lp = bok.chapters_list[bok.chapters_list.length - 1];
krav("chapters_list-längd == chapters-längd", bok.chapters_list.length === bok.chapters.length);
krav("chapters_list-poster 1–16 fortfarande strängar (append-only)",
  bok.chapters_list.slice(0, 16).every(c => typeof c === "string"));
krav("chapters_list-post 17 = {num,title,minutes} matchande kapitel 17",
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
krav("källdeklaration ordagrant (bolagsunivers.json, Yahoo Finance, 2026-09-03)",
  text.includes("Ur plattformens dataset (data/portfolj-system/bolagsunivers.json, källa Yahoo Finance, hämtat 2026-09-03; årsresultat i miljarder lokal valuta)"));
krav("övningsdeklaration ordagrant (inget om vad någon bör göra)",
  text.includes("det säger inget om vad någon bör göra (2007:528)"));
krav("jurideklaration närvaro (2007:528) ≥ 2",
  (text.match(/2007:528/g) || []).length >= 2, `${(text.match(/2007:528/g) || []).length} förekomster`);

// Talmarkörer från underlag f10 — överföringsbevis ≥80 %
const markorer = ["28,7", "11,9", "−59 %", "42,3", "19,4", "−54 %", "6,8", "3,6", "−47 %",
  "5,9", "3,7", "−37 %", "4,6", "0,5", "−89 %", "10 av 10", "−51 %", "−74 %",
  "2026-09-03", "bolagsunivers.json", "Yahoo Finance", "NOK", "USD", "SEK", "EUR",
  "1980–90-talen", "sekelskiftet", "Ericsson", "SKF", "Autoliv", "Stora Enso", "UPM",
  "Vår Energi", "DNO", "Equinor", "Shell", "SCA", "Holmen", "Billerud", "2022→2023"];
const saknade = markorer.filter(m => !text.includes(m));
krav(`talmarkörer ≥ 80 %`, saknade.length / markorer.length <= 0.2,
  `${markorer.length - saknade.length}/${markorer.length} närvaro${saknade.length ? ", saknas: " + saknade.join(", ") : ""}`);

// Append-only — kapitel 1–16 bit-identiska mot HEAD
const gamlaRå = execFileSync("git", ["show", `HEAD:${SOKVAG}`], { encoding: "utf8" });
const gamla = JSON.parse(gamlaRå);
const identiska = gamla.chapters.every((g, i) =>
  JSON.stringify(g) === JSON.stringify(bok.chapters[i]));
krav("befintliga kapitel bit-identiska (append-only)", identiska,
  `${gamla.chapters.length} gamla kapitel jämförda`);
const gamlaLista = JSON.stringify(gamla.chapters_list) === JSON.stringify(bok.chapters_list.slice(0, 16));
krav("chapters_list-poster 1–16 bit-identiska mot HEAD", gamlaLista);
const oforandradeFalt = gamla.slug === bok.slug && gamla.title === bok.title &&
  gamla.summary === bok.summary && gamla.kalla && bok.kalla &&
  JSON.stringify(gamla.kalla) === JSON.stringify(bok.kalla) &&
  gamla.chapterCount === 16 && bok.chapterCount === 17 &&
  gamla.totalMinutes === 180 && bok.totalMinutes === 193;
krav("övliga fält orörda (slug, title, summary, kalla, …)", oforandradeFalt);

console.log(fel === 0 ? "\nKVD: GRÖN — 0 röda" : `\nKVD: RÖD — ${fel} krav fallerade`);
process.exit(fel === 0 ? 0 : 1);
