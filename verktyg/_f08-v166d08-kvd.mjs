#!/usr/bin/env node
// KVD för v166-d08 — djupkapitel 15 i encyclopedia-of-chart-patterns.json
// Kontroller: JSON-giltighet · chapterCount/totalMinutes-konsistens · quiz=3 ·
// varumärkesgrind 0 träffar · talmarkörer ≥80 % · append-only (kapitel 1–14 bit-identiska).
import fs from "node:fs";
import { execFileSync } from "node:child_process";

const SOKVAG = "data/bokmaster/encyclopedia-of-chart-patterns.json";
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
krav("nytt kapitel num = sista+1", ny.num === 15 && bok.chapters.length === 15, `num=${ny.num}`);
krav("titel", ny.title === "Från boken till egen analys", ny.title);
krav("minutes 11–14", ny.minutes >= 11 && ny.minutes <= 14, `minutes=${ny.minutes}`);
krav("quiz = 3 frågor", Array.isArray(ny.quiz) && ny.quiz.length === 3, `len=${ny.quiz?.length}`);
krav("quizformat {q, alternativ[4], ratt, tips}",
  ny.quiz.every(q => q.q && Array.isArray(q.alternativ) && q.alternativ.length === 4 &&
    Number.isInteger(q.ratt) && q.ratt >= 0 && q.ratt <= 3 && q.tips));
krav("quiz ratt unika positioner", new Set(ny.quiz.map(q => q.ratt)).size === 3);
krav("quiz påståendeform (inga handlingsrådsfrågor)",
  ny.quiz.every(q => !/^\s*(Vad ska du|Bör du|Vilken aktie) /.test(q.q)));

// Blockstruktur enligt design-tabellen (underlaget bär två tabeller → två tabellblock)
const typer = ny.blocks.map(b => b.type);
const vagnta = ["text", "text", "utmaning", "text", "tabell", "tabell", "text", "text", "insikt"];
krav("blockstruktur (kärna, läsning, utmaning, räkneexempel text+2 tabeller, jämförelse, fallgropar, insikt)",
  JSON.stringify(typer) === JSON.stringify(vagnta), typer.join(", "));
krav("intro-fält 2–3 meningar", typeof ny.intro === "string" &&
  (ny.intro.match(/\./g) || []).length >= 2 && ny.intro.length < 700,
  `${ny.intro.split(".").length - 1} punkter, ${ny.intro.length} tecken`);

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

// Juridik — rådgivningsformuleringar + deklarationer
const radgivning = [/\bköp\b[^.]*\baktie\b/i, /\bsälj\b[^.]*\baktie\b/i, /\bbör du köpa\b/i, /\brekommenderar (?:att )?köp/i];
const radTraff = radgivning.filter(re => re.test(text));
krav("inga köp/sälj-formuleringar", radTraff.length === 0, radTraff.map(String).join("; "));
krav("källdeklaration ORDAGRANT (Yahoo Finance 2026-09-24 i text + båda tabellrubriker)",
  (text.match(/Yahoo Finance/g) || []).length === 3 && text.includes("hämtat 2026-09-24"),
  `${(text.match(/Yahoo Finance/g) || []).length}× Yahoo Finance`);
krav("övningsdeklaration ORDAGRANT (inte en rekommendation, en övning i att mäta)",
  text.includes("inte en rekommendation, en övning i att mäta"));
krav("käll-/juridikdeklaration (2007:528) minst 2",
  (text.match(/2007:528/g) || []).length >= 2, `${(text.match(/2007:528/g) || []).length}× 2007:528`);

// Lagrumshygien — inga främmande lagrum
const lagrum = text.match(/\b(?:19|20)\d{2}:\d{3,4}\b/g) || [];
krav("endast 2007:528 som lagrum", lagrum.every(l => l === "2007:528"), lagrum.join(", ") || "inga");

// Talmarkörer från underlag f08 — överföringsbevis ≥80 % (målet 100 %)
const markorer = [
  "5 och 10 %", "tusentals", "två toppar och en dal", "tre toppar och två dalar",
  "2015-03-02", "365,40", "2016-06-27", "236,60", "−35,3 %", "2017-01-23", "234,60",
  "250,00", "6 handelsdagar", "2017-03-30", "227,70", "aldrig över 236,60 igen",
  "107,80", "236,60 − (365,40 − 236,60)", "2018-03-27", "120,94", "−46,9 %",
  "2021-07-14", "246,90", "2021-10-06", "180,68", "−26,8 %", "2022-01-03", "221,90",
  "10,1 %", "2022-02-14", "180,30", "184,70", "2022-02-18", "179,35", "166,50",
  "2,3 ×", "114,46", "180,68 − (246,90 − 180,68)", "2022-09-29", "114,72", "−36,0 %",
  "26 öre", "12 procent", "genomsnittlig nedgång 20 %", "throwback/pullback",
];
const saknade = markorer.filter(m => !text.includes(m));
krav("talmarkörer ≥ 80 %", saknade.length / markorer.length <= 0.2,
  `${markorer.length - saknade.length}/${markorer.length} närvaro${saknade.length ? ", saknas: " + saknade.join(", ") : " (100 %)"}`);

// Ekosystem-kopplingar (F01/F04/F07/F03/AKM2 enligt sektion 5)
const eko = ["F01", "F04", "F07", "F03", "AKM2"].filter(m => !text.includes(m));
krav("ekosystemreferenser F01/F04/F07/F03/AKM2", eko.length === 0, eko.length ? "saknas: " + eko.join(", ") : "5/5");

// Append-only — kapitel 1–14 bit-identiska mot HEAD (körs före commit)
const gamlaRå = execFileSync("git", ["show", `HEAD:${SOKVAG}`], { encoding: "utf8" });
const gamla = JSON.parse(gamlaRå);
const identiska = gamla.chapters.every((g, i) =>
  JSON.stringify(g) === JSON.stringify(bok.chapters[i]));
krav("befintliga kapitel bit-identiska (append-only)", identiska,
  `${gamla.chapters.length} gamla kapitel jämförda`);
const oforandradeFalt = gamla.slug === bok.slug && gamla.title === bok.title &&
  gamla.summary === bok.summary && gamla.category === bok.category &&
  JSON.stringify(gamla.kalla) === JSON.stringify(bok.kalla) &&
  JSON.stringify(gamla.learn) === JSON.stringify(bok.learn) &&
  JSON.stringify(gamla.why) === JSON.stringify(bok.why);
krav("övliga fält orörda (slug, title, summary, kalla, …)", oforandradeFalt);

console.log(fel === 0 ? "\nKVD: GRÖN — 0 röda" : `\nKVD: RÖD — ${fel} krav fallerade`);
process.exit(fel === 0 ? 0 : 1);
