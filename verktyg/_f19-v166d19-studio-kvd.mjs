#!/usr/bin/env node
// KVD för v166-d19 — djupkapitel 15 i the-complete-turtletrader.json.
// Append-kontroll: HEAD om den saknar djupkapitlet (pre-append-läge, som nu),
// annars append-committens förälder (rond 177:s läxa — aldrig post-append-HEAD).
import fs from "node:fs";
import { execFileSync } from "node:child_process";

const SOKVAG = "data/bokmaster/the-complete-turtletrader.json";
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

krav("chapterCount == len(chapters)", bok.chapterCount === bok.chapters.length,
  `${bok.chapterCount}/${bok.chapters.length}`);
const summa = bok.chapters.reduce((a, k) => a + k.minutes, 0);
krav("totalMinutes == Σ", bok.totalMinutes === summa, `${bok.totalMinutes} == ${summa}`);

const ny = bok.chapters.at(-1);
krav("nytt kapitel num = 15", ny.num === 15 && bok.chapters.length === 15, `num=${ny.num}`);
krav("titel", ny.title === "Från boken till egen analys", ny.title);
krav("minutes 11–14", ny.minutes >= 11 && ny.minutes <= 14, `minutes=${ny.minutes}`);
krav("quiz = 3", Array.isArray(ny.quiz) && ny.quiz.length === 3, `len=${ny.quiz?.length}`);
krav("quizformat {q, alternativ[4], ratt, tips}",
  ny.quiz.every(q => q.q && Array.isArray(q.alternativ) && q.alternativ.length === 4 &&
    Number.isInteger(q.ratt) && q.ratt >= 0 && q.ratt <= 3 && q.tips));
krav("quiz unika ratt-lägen", new Set(ny.quiz.map(q => q.ratt)).size === 3,
  ny.quiz.map(q => q.ratt).join(","));

const typer = ny.blocks.map(b => b.type);
const vagnta = ["text", "text", "utmaning", "text", "tabell", "text", "insikt"];
krav("blockstruktur (kärna, läsning, utmaning, räkneexempel text+tabell, fallgropar, insikt)",
  JSON.stringify(typer) === JSON.stringify(vagnta), typer.join(", "));

const lp = bok.chapters_list.at(-1);
krav("chapters_list-längd == chapters-längd", bok.chapters_list.length === bok.chapters.length);
krav("chapters_list-poster 1–14 strängar (append-only)",
  bok.chapters_list.slice(0, 14).every(c => typeof c === "string"));
krav("chapters_list-post 15 = {num,title,minutes}",
  typeof lp === "object" && lp.num === ny.num && lp.title === ny.title && lp.minutes === ny.minutes);

const varumarke = JSON.parse(fs.readFileSync("data/varumarke.json", "utf8"));
const text = JSON.stringify(ny);
const traifar = varumarke.forbjudnaFraser.filter(f => new RegExp(f.fran, "i").test(text));
krav("varumärkesgrind 0 träffar", traifar.length === 0,
  traifar.length ? traifar.join("; ") : `${varumarke.forbjudnaFraser.length} mönster`);

const radgivning = [/\bköp\b[^.]*\baktie\b/i, /\bsälj\b[^.]*\baktie\b/i, /\bbör du köpa\b/i, /\brekommenderar (?:att )?köp/i];
krav("inga köp/sälj-formuleringar", radgivning.every(re => !re.test(text)));
krav("konstruerade-tal-deklaration ordagrant",
  text.includes("Genomgångshypotetiskt exempel med konstruerade tal — inte historisk data"));
krav("slutdeklaration ordagrant (hypotetiska övningstal)",
  text.includes("hypotetiska övningstal, inga investeringsråd, inga avkastningslöften (2007:528)"));
krav("jurideklaration (2007:528) ≥ 2", (text.match(/2007:528/g) || []).length >= 2,
  `×${(text.match(/2007:528/g) || []).length}`);
const lagBland = ["2022:260", "2022:261", "1985:716", "2022:482", "2005:59"].filter(l => text.includes(l));
krav("inga blandade lagrum", lagBland.length === 0, lagBland.join(";"));

const markorer = ["1983", "1984", "tusen ansökningar", "tjugotal", "två veckors", "100 miljoner",
  "poker", "bridge", "Jerry Parker", "Chesapeake Capital", "Liz Cheval", "EMC Capital", "Paul Rabar",
  "Tom Shanks", "1987–88", "100 000", "1 %", "1 000 kr", "100 / 95 kr", "200", "990 kr",
  "50,00 / 47,50 kr", "396", "980 kr", "80 / 76 kr", "245", "110", "+7 350 kr", "105 360",
  "0,99", "1,075", "1,0536", "+5,4 %", "två förluster", "990 / 2,50", "980 / 4", "(110 − 80) × 245",
  "survivorship", "kontrollgrupp", "decennier"];
const saknade = markorer.filter(m => !text.includes(m));
krav("talmarkörer ≥ 80 %", saknade.length / markorer.length <= 0.2,
  `${markorer.length - saknade.length}/${markorer.length}${saknade.length ? ", saknas: " + saknade.join(", ") : ""}`);

// Append-only — bas: HEAD om pre-append, annars append-committens förälder
const headRaw = execFileSync("git", ["show", `HEAD:${SOKVAG}`], { encoding: "utf8" });
const head = JSON.parse(headRaw);
let bas = head, basNamn = "HEAD (pre-append)";
if (head.chapters.at(-1)?.title === "Från boken till egen analys") {
  const hash = execFileSync("git", ["log", "--format=%h", "-1", "--", SOKVAG], { encoding: "utf8" }).trim();
  bas = JSON.parse(execFileSync("git", ["show", `${hash}~1:${SOKVAG}`], { encoding: "utf8" }));
  basNamn = `${hash}~1 (förälder)`;
}
const identiska = bas.chapters.every((g, i) => JSON.stringify(g) === JSON.stringify(bok.chapters[i]));
krav(`befintliga kapitel bit-identiska (${basNamn})`, identiska, `${bas.chapters.length} kapitel jämförda`);
const listaRen = JSON.stringify(bas.chapters_list) === JSON.stringify(bok.chapters_list.slice(0, bas.chapters.length));
krav(`chapters_list-poster 1–${bas.chapters.length} bit-identiska (${basNamn})`, listaRen);
const falt = bas.slug === bok.slug && bas.title === bok.title && bas.summary === bok.summary &&
  JSON.stringify(bas.kalla) === JSON.stringify(bok.kalla) &&
  bas.chapters.length === 14 && bok.chapterCount === 15 && bas.totalMinutes === 168 && bok.totalMinutes === 181;
krav("övliga fält orörda (slug, title, summary, kalla)", falt);

console.log(fel === 0 ? "\nKVD: GRÖN — 0 röda" : `\nKVD: RÖD — ${fel} krav fallerade`);
process.exit(fel === 0 ? 0 : 1);
