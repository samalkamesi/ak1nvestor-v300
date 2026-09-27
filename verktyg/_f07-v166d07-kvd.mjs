// KVD för v166-d07 — japanese-candlestick-charting, djupkapitel 17
// Kontrollerar DESIGN-v166-djupintegrering.md:s mekaniska krav + varumärkesgrind + talmarkörer.
import fs from "node:fs";

const FIL = "/home/ak1a/AK1/data/bokmaster/japanese-candlestick-charting.json";
const j = JSON.parse(fs.readFileSync(FIL, "utf8"));
const kap = j.chapters[j.chapters.length - 1];
let fel = 0;
const kolla = (ok, namn) => { console.log((ok ? "  OK " : " FEL "), namn); if (!ok) fel++; };

console.log("== v166-d07 KVD: japanese-candlestick-charting ==");

kolla(j.chapterCount === j.chapters.length, `chapterCount (${j.chapterCount}) == len(chapters) (${j.chapters.length})`);
kolla(j.chapterCount === j.chapters_list.length, `chapterCount == len(chapters_list) (${j.chapters_list.length})`);
const sumK = j.chapters.reduce((a, c) => a + c.minutes, 0);
const sumL = j.chapters_list.reduce((a, c) => a + c.minutes, 0);
kolla(j.totalMinutes === sumK && j.totalMinutes === sumL, `totalMinutes (${j.totalMinutes}) == Σ chapters (${sumK}) == Σ list (${sumL})`);

kolla(kap.num === 17 && kap.title === "Från boken till egen analys", `nytt kapitel num=${kap.num} title="${kap.title}"`);
kolla(kap.minutes >= 11 && kap.minutes <= 14, `minutes (${kap.minutes}) i intervallet 11–14`);
const typer = kap.blocks.map(b => b.type).join("/");
kolla(typer === "text/text/utmaning/text/tabell/text/text/insikt", `blockstruktur enligt designen: ${typer}`);

kolla(
  kap.quiz.length === 3 && kap.quiz.every(q =>
    typeof q.q === "string" && q.q.length > 0 &&
    Array.isArray(q.alternativ) && q.alternativ.length === 4 &&
    Number.isInteger(q.ratt) && q.ratt >= 0 && q.ratt <= 3 &&
    typeof q.tips === "string" && q.tips.length > 0),
  "quiz = 3 × {q, alternativ[4], ratt 0–3, tips}");

// Varumärkesgrind — alla förbjudna fraser mot nya kapitlets samtliga strängar
const v = JSON.parse(fs.readFileSync("/home/ak1a/AK1/data/varumarke.json", "utf8"));
const text = JSON.stringify(kap);
const traffar = [];
for (const f of v.forbjudnaFraser) {
  try { if (new RegExp(f.fran, "u").test(text)) traffar.push(f.fran); }
  catch { traffar.push(f.fran + " (regexfel)"); }
}
kolla(traffar.length === 0, `varumärkesgrind 0 träffar av ${v.forbjudnaFraser.length} mönster${traffar.length ? " — träffar: " + traffar.join(" ; ") : ""}`);

// Juridikgrind: "investeringsråd" endast negerat (lookbehind-regexen ovan täcker, här som kontextbevis)
const irKontexter = [...text.matchAll(/.{25}investeringsråd/g)].map(m => m[0]);
kolla(irKontexter.every(k => /(inga|inte|ej|aldrig|ingen|utan)\s+investeringsråd$/.test(k.trim()) || /inga investeringsråd$/.test(k.trim())), `"investeringsråd" endast negerat: ${JSON.stringify(irKontexter)}`);

// Underlagets talmarkörer — överföringsbevis (designen kräver ≥ 80 %)
const markorer = [
  "93,84", "15 oktober", "87,98", "6,2 %", "23–28 oktober 2025",
  "90,60", "90,84", "89,00", "89,76", "0,84", "89,40",
  "89,56", "89,74", "89,22", "0,34", "1,24", "0,18",
  "89,50", "89,96", "88,74", "89,36", "0,14", "1,22",
  "92,40", "88,64", "91,56", "2,56", "12,7 M",
  "3,6 ×", "1,8 ×", "78 %", "4,4 M", "7 M", "95,12", "29/10",
  "2007:528", "ERIC-B.ST", "Nasdaq Stockholm", "Yahoo Finance", "2026-09-24",
  "tor 23/10", "fre 24/10", "mån 27/10", "tis 28/10",
];
const saknade = markorer.filter(m => !text.includes(m));
const andel = (markorer.length - saknade.length) / markorer.length;
kolla(andel >= 0.8, `talmarkörer ${markorer.length - saknade.length}/${markorer.length} (${Math.round(andel * 100)} %) ≥ 80 %${saknade.length ? " — saknade: " + saknade.join(", ") : " — 100 % ordagrant"}`);

// Append-only: befintliga kapitel och listrader orörda
kolla(j.chapters.slice(0, 16).every((c, i) => c.num === i + 1 && c.minutes === 10), "kapitel 1–16 kvar (num 1–16, minutes 10)");
kolla(j.chapters_list.slice(0, 16).every((c, i) => c.num === i + 1 && c.minutes === 10), "chapters_list 1–16 orörd");
kolla(j.kalla && j.kalla.slug !== undefined || j.kalla.forfattare === "Steve Nison", 'kalla orörd ("Steve Nison", 1991, bk-023)');

console.log(fel === 0 ? "KVD GRÖN (" + "0 fel)" : `KVD RÖD (${fel} fel)`);
process.exit(fel === 0 ? 0 : 1);
