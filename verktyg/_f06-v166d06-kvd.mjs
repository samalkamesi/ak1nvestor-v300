#!/usr/bin/env node
// KVD för v166-d06 — djupkapitel 21 i technical-analysis-financial-markets.json
// Kontroller: JSON-giltighet · chapterCount/totalMinutes-konsistens · quiz=3 ·
// varumärkesgrind 0 träffar · talmarkörer ≥80 % · append-only (kapitel 1–20 bit-identiska).
import fs from "node:fs";
import { execFileSync } from "node:child_process";

const SOKVAG = "data/bokmaster/technical-analysis-financial-markets.json";
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
krav("chapters_list == chapters (num/title/minutes)",
  bok.chapters_list.length === bok.chapters.length &&
  bok.chapters_list.every((c, i) =>
    c.num === bok.chapters[i].num && c.title === bok.chapters[i].title &&
    c.minutes === bok.chapters[i].minutes));

// Nya kapitlet
const ny = bok.chapters[bok.chapters.length - 1];
krav("nytt kapitel num = sista+1", ny.num === 21 && bok.chapters.length === 21, `num=${ny.num}`);
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

// Juridik — rådgivningsformuleringar
const radgivning = [/\bköp\b[^.]*\baktie\b/i, /\bsälj\b[^.]*\baktie\b/i, /\bbör du köpa\b/i, /\brekommenderar (?:att )?köp/i];
const radTraff = radgivning.filter(re => re.test(text));
krav("inga köp/sälj-formuleringar", radTraff.length === 0, radTraff.map(String).join("; "));
krav("övningsdeklaration närvaro (konstruerade tal deklarerade)",
  /Alla siffror är konstruerade för genomräkningen/.test(text));
krav("käll-/juridikdeklaration (2007:528) i räkneexemplet",
  (text.match(/2007:528/g) || []).length >= 2);

// Talmarkörer från underlag f06 — överföringsbevis ≥80 %
const markorer = ["84 kr", "82,60", "1,7 %", "1,2 miljoner", "3,0 miljoner", "2,5×",
  "1,5–2×", "1,05 miljoner", "0,9×", "1,3 miljoner", "1,1×", "tre gånger",
  "senaste 20 dagarna", "tre dagar senare", "inom en vecka", "sedan ett halvår",
  "4–5 gånger", "OMX Stockholm", "(84 − 82,60) ÷ 84", "3,0 ÷ 1,2"];
const saknade = markorer.filter(m => !text.includes(m));
krav(`talmarkörer ≥ 80 %`, saknade.length / markorer.length <= 0.2,
  `${markorer.length - saknade.length}/${markorer.length} närvaro${saknade.length ? ", saknas: " + saknade.join(", ") : ""}`);

// Append-only — kapitel 1–20 bit-identiska mot HEAD
const gamlaRå = execFileSync("git", ["show", `HEAD:${SOKVAG}`], { encoding: "utf8" });
const gamla = JSON.parse(gamlaRå);
const identiska = gamla.chapters.every((g, i) =>
  JSON.stringify(g) === JSON.stringify(bok.chapters[i]));
krav("befintliga kapitel bit-identiska (append-only)", identiska,
  `${gamla.chapters.length} gamla kapitel jämförda`);
const oforandradeFalt = gamla.slug === bok.slug && gamla.title === bok.title &&
  gamla.summary === bok.summary && gamla.kalla && bok.kalla &&
  JSON.stringify(gamla.kalla) === JSON.stringify(bok.kalla);
krav("övliga fält orörda (slug, title, summary, kalla, …)", oforandradeFalt);

console.log(fel === 0 ? "\nKVD: GRÖN — 0 röda" : `\nKVD: RÖD — ${fel} krav fallerade`);
process.exit(fel === 0 ? 0 : 1);
