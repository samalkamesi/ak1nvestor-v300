#!/usr/bin/env node
// KVD för v166-d13 — djupkapitel 15 i fibonacci-applications.json
// Kontroller: JSON-giltighet · chapterCount/totalMinutes-konsistens · quiz=3 ·
// blockstruktur · varumärkesgrind 0 träffar · käll-/övningsdeklaration ordagrant ·
// talmarkörer ≥80 % · append-only (kapitel 1–14 bit-identiska) · chapters_list
// strängposter 1–14 orörda + post 15 som {num,title,minutes}.
import fs from "node:fs";
import { execFileSync } from "node:child_process";

const SOKVAG = "data/bokmaster/fibonacci-applications.json";
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
krav("nytt kapitel num = sista+1", ny.num === 15 && bok.chapters.length === 15, `num=${ny.num}`);
krav("titel", ny.title === "Från boken till egen analys", ny.title);
krav("minutes 11–14", ny.minutes >= 11 && ny.minutes <= 14, `minutes=${ny.minutes}`);
krav("quiz = 3 frågor", Array.isArray(ny.quiz) && ny.quiz.length === 3, `len=${ny.quiz?.length}`);
krav("quizformat {q, alternativ[4], ratt, tips}",
  ny.quiz.every(q => q.q && Array.isArray(q.alternativ) && q.alternativ.length === 4 &&
    Number.isInteger(q.ratt) && q.ratt >= 0 && q.ratt <= 3 && q.tips));
krav("quiz ratt inom alternativ + unika positioner",
  new Set(ny.quiz.map(q => q.ratt)).size === 3);

// Blockstruktur (f13 bär ingen tabell: kärna, läsning, utmaning, räkneexempel, fallgropar, insikt)
const typer = ny.blocks.map(b => b.type);
const vagnta = ["text", "text", "utmaning", "text", "text", "insikt"];
krav("blockstruktur (kärna, läsning, utmaning, räkneexempel, fallgropar, insikt)",
  JSON.stringify(typer) === JSON.stringify(vagnta), typer.join(", "));
krav("utmaning-block finns", typer.includes("utmaning"));
krav("insikt-block finns", typer.includes("insikt"));

// chapters_list — post 15 som objekt enligt kontraktet; gamla strängposter orörda
const lp = bok.chapters_list[bok.chapters_list.length - 1];
krav("chapters_list-längd == chapters-längd", bok.chapters_list.length === bok.chapters.length);
krav("chapters_list-poster 1–14 fortfarande strängar (append-only)",
  bok.chapters_list.slice(0, 14).every(c => typeof c === "string"));
krav("chapters_list-post 15 = {num,title,minutes} matchande kapitel 15",
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
krav("käll-/övningsdeklaration ordagrant (Volvo B, Yahoo Finance, 2026-09-24, inte en rekommendation)",
  text.includes("Pedagogisk genomräkning på verkliga dagsslutkurser, Volvo B (VOLV-B.ST), källa Yahoo Finance, hämtat 2026-09-24 — en övning i att räkna, inte en rekommendation (2007:528)"));
krav("jurideklaration närvaro (2007:528) ≥ 2",
  (text.match(/2007:528/g) || []).length >= 2, `${(text.match(/2007:528/g) || []).length} förekomster`);

// Talmarkörer från underlag f13 — överföringsbevis ≥80 %
const markorer = ["0,618", "1,618", "61,8", "38,2", "0,618²", "halveringsregel", "127,2", "161,8",
  "317,50", "371,50", "54,00", "20,63", "350,87", "350,90", "33,37", "338,13", "338,10",
  "344,50", "343,20", "338,20", "351,30", "330,20", "76,5", "23 juni", "4 aug", "12 aug",
  "19 aug", "26 aug", "15 sep", "VOLV-B.ST", "2026-09-24", "10 öre", "gyllene zonen",
  "1, 1, 2, 3, 5, 8, 13, 21"];
const saknade = markorer.filter(m => !text.includes(m));
krav(`talmarkörer ≥ 80 %`, saknade.length / markorer.length <= 0.2,
  `${markorer.length - saknade.length}/${markorer.length} närvaro${saknade.length ? ", saknas: " + saknade.join(", ") : ""}`);

// Append-only — kapitel 1–14 bit-identiska mot HEAD
const gamlaRå = execFileSync("git", ["show", `HEAD:${SOKVAG}`], { encoding: "utf8" });
const gamla = JSON.parse(gamlaRå);
const identiska = gamla.chapters.every((g, i) =>
  JSON.stringify(g) === JSON.stringify(bok.chapters[i]));
krav("befintliga kapitel bit-identiska (append-only)", identiska,
  `${gamla.chapters.length} gamla kapitel jämförda`);
const gamlaLista = JSON.stringify(gamla.chapters_list) === JSON.stringify(bok.chapters_list.slice(0, 14));
krav("chapters_list-poster 1–14 bit-identiska mot HEAD", gamlaLista);
const oforandradeFalt = gamla.slug === bok.slug && gamla.title === bok.title &&
  gamla.summary === bok.summary && gamla.kalla && bok.kalla &&
  JSON.stringify(gamla.kalla) === JSON.stringify(bok.kalla) &&
  gamla.chapterCount === 14 && bok.chapterCount === 15 &&
  gamla.totalMinutes === 160 && bok.totalMinutes === 173;
krav("övliga fält orörda (slug, title, summary, kalla, …)", oforandradeFalt);

console.log(fel === 0 ? "\nKVD: GRÖN — 0 röda" : `\nKVD: RÖD — ${fel} krav fallerade`);
process.exit(fel === 0 ? 0 : 1);
