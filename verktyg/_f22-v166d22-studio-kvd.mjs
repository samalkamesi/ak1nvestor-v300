#!/usr/bin/env node
// KVD för v166-d22 — the-hour-between-dog-and-wolf (förälder-medveten append-bas)
import fs from "node:fs";
import { execFileSync } from "node:child_process";
const SOKVAG = "data/bokmaster/the-hour-between-dog-and-wolf.json";
let fel = 0;
const krav = (n, ok, d) => { console.log(`${ok ? "GRÖN" : "RÖD"}  ${n}${d ? " — " + d : ""}`); if (!ok) fel++; };

let bok;
try { bok = JSON.parse(fs.readFileSync(SOKVAG, "utf8")); krav("JSON giltig", true); }
catch (e) { krav("JSON giltig", false, e.message); process.exit(1); }

krav("chapterCount == len", bok.chapterCount === bok.chapters.length, `${bok.chapterCount}/${bok.chapters.length}`);
krav("totalMinutes == Σ", bok.totalMinutes === bok.chapters.reduce((a, k) => a + k.minutes, 0), `${bok.totalMinutes}`);
const ny = bok.chapters.at(-1);
krav("num 15 + titel + minutes 11–14", ny.num === 15 && ny.title === "Från boken till egen analys" && ny.minutes >= 11 && ny.minutes <= 14, `num=${ny.num} min=${ny.minutes}`);
krav("quiz=3 format unika", ny.quiz.length === 3 && ny.quiz.every(q => q.q && q.alternativ.length === 4 && Number.isInteger(q.ratt) && q.ratt >= 0 && q.ratt <= 3 && q.tips) && new Set(ny.quiz.map(q => q.ratt)).size === 3, ny.quiz.map(q => q.ratt).join(","));
const typer = ny.blocks.map(b => b.type);
krav("blockstruktur", JSON.stringify(typer) === JSON.stringify(["text", "text", "utmaning", "text", "tabell", "text", "insikt"]), typer.join(","));
krav("chapters_list längd + strängposter 1–14 + post 15 objekt",
  bok.chapters_list.length === 15 && bok.chapters_list.slice(0, 14).every(c => typeof c === "string") &&
  (() => { const lp = bok.chapters_list.at(-1); return typeof lp === "object" && lp.num === 15 && lp.title === ny.title && lp.minutes === ny.minutes; })());
const vm = JSON.parse(fs.readFileSync("data/varumarke.json", "utf8"));
const text = JSON.stringify(ny);
const traif = vm.forbjudnaFraser.filter(f => new RegExp(f.fran, "i").test(text));
krav("varumärkesgrind 0/26", traif.length === 0, traif.join(";"));
krav("inga köp/sälj", [/\bköp\b[^.]*\baktie\b/i, /\bsälj\b[^.]*\baktie\b/i, /\bbör du köpa\b/i, /\brekommenderar (?:att )?köp/i].every(re => !re.test(text)));
krav("övningsdeklaration ordagrant", text.includes("Tankeexperiment i pappersform: övningsportfölj 100 000 kr, exempel på en regel (pedagogiskt, inget råd): risk 1 % = 1 000 kr per beslut; stopp på 10 % ger position 10 000 kr"));
krav("2007:528 ≥ 2 + inga blandade lagrum", (text.match(/2007:528/g) || []).length >= 2 && !["2022:260", "2022:261", "1985:716", "2022:482", "2005:59"].some(l => text.includes(l)), `×${(text.match(/2007:528/g) || []).length}`);
const markorer = ["Coates", "Goldman Sachs", "Deutsche Bank", "Cambridge", "2012", "Mellan hund och varg", "testosteron", "kortisol", "winning effect", "interoception", "saliv", "100 000", "1 %", "1 000 kr", "10 %", "10 000 kr", "+2/−2 %", "+0,2 %", "500 kr", "5 000 kr", "+60 kr", "6 av 10", "2 500 kr", "25 000 kr", "+500 kr", "+200 kr", "−800 kr", "−400 kr", "−2 000 kr", "3V/7F", "7,5 %", "26 %", "4 vinster", "2,5×", "tvångspauser", "hunden blir varg"];
const saknade = markorer.filter(m => !text.includes(m));
krav("talmarkörer ≥ 80 %", saknade.length / markorer.length <= 0.2, `${markorer.length - saknade.length}/${markorer.length}${saknade.length ? " saknas: " + saknade.join(", ") : ""}`);

const headRaw = execFileSync("git", ["show", `HEAD:${SOKVAG}`], { encoding: "utf8" });
const head = JSON.parse(headRaw);
let bas = head, basNamn = "HEAD (pre-append)";
if (head.chapters.at(-1)?.title === "Från boken till egen analys") {
  const hash = execFileSync("git", ["log", "--format=%h", "-1", "--", SOKVAG], { encoding: "utf8" }).trim();
  bas = JSON.parse(execFileSync("git", ["show", `${hash}~1:${SOKVAG}`], { encoding: "utf8" }));
  basNamn = `${hash}~1`;
}
krav(`append-only kapitel (${basNamn})`, bas.chapters.every((g, i) => JSON.stringify(g) === JSON.stringify(bok.chapters[i])) && bas.chapters.length === 14);
krav(`append-only chapters_list (${basNamn})`, JSON.stringify(bas.chapters_list) === JSON.stringify(bok.chapters_list.slice(0, 14)));
krav("övliga fält orörda", bas.slug === bok.slug && bas.title === bok.title && bas.summary === bok.summary && JSON.stringify(bas.kalla) === JSON.stringify(bok.kalla) && bas.totalMinutes === 168 && bok.totalMinutes === 181 && bok.chapterCount === 15);

console.log(fel === 0 ? "\nKVD: GRÖN — 0 röda" : `\nKVD: RÖD — ${fel}`);
process.exit(fel ? 1 : 0);
