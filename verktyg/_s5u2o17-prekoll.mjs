#!/usr/bin/env node
/**
 * PRE-KOLL s5-u2 omgång 17 (manifest auto-s5-1789766125084) — FÖRE insert:
 * rs-08-modellrisken (cederade rs-07-slugen till u1:s verkställda leverans) +
 * od-06-positionen-efter-bygget (od-06 hållet — FIFO + färdig kursfil).
 *
 * Grindar: JSON/schema-paritet mot st-06-mönstret, språkgrind (CJK, mjuka
 * bindestreck, typografiska citattecken, tabbar, dubbla mellanslag, ellips,
 * engelskaläckor), korslänkar registeräkta, aritmetik OBEROENDE omräknad,
 * juridikgrind (utbildningsframing, 0 rådgivningsfraser), strukturparitet
 * (chapters_list ↔ chapters, 6×4 min, xp 50).
 *
 * Pedagogisk plattform — inte investeringsråd.
 */
import { readFileSync } from "node:fs";

const ROT = "/home/ak1a/AK1";
const REGISTRET = JSON.parse(readFileSync(ROT + "/public/deep-courses.json", "utf8"));
const regPrefix = Object.keys(REGISTRET).map((s) => s.match(/^[a-z]+-\d+/)?.[0]).filter(Boolean);
const harPrefix = (p) => regPrefix.includes(p);

// Sträng-värden rekursivt (NYCKLAR som chapters_list får ALDRIG trigga språkgrinden)
const vardeStrangar = (x) => typeof x === "string" ? [x] : Array.isArray(x) ? x.flatMap(vardeStrangar) : x && typeof x === "object" ? Object.values(x).flatMap(vardeStrangar) : [];

const pass = [], fail = [];
const T = (namn, villkor, detalj) => (villkor ? pass : fail).push((villkor ? "PASS " : "FAIL ") + namn + (detalj ? " — " + detalj : ""));

for (const fil of ["rs-08-modellrisken", "od-06-positionen-efter-bygget"]) {
  const rå = readFileSync(ROT + "/data/kurser-tillagg/" + fil + ".json", "utf8");
  let k;
  try { k = JSON.parse(rå); } catch (e) { console.error("FEL: " + fil + " är ej giltig JSON: " + e.message); process.exit(1); }
  const allText = vardeStrangar(k).join("\n"); // endast värden — nycklar orsakade falska träffar (chapters_list)
  const fält = Object.keys(k);

  // ── Schema-paritet (st-06-mönstret) ──
  const vantaFält = ["slug","category","weight","chapterCount","totalMinutes","title","summary","minutes","xp","level","learn","why","history","chapters_list","lynchSection","grahamSection","ak1Section","chapters"];
  T(fil + ": topfält-paritet (18 fält, st-06-mönstret)", fält.length === vantaFält.length && vantaFält.every((f) => fält.includes(f)), fält.join(","));
  T(fil + ": slug = filnamn", k.slug === fil, k.slug);
  T(fil + ": 6 kapitel", k.chapters.length === 6 && k.chapterCount === 6);
  T(fil + ": 6 × 4 min = 24", k.chapters.every((c) => c.minutes === 4) && k.totalMinutes === 24 && k.minutes === 24);
  T(fil + ": xp 50", k.xp === 50);
  T(fil + ": weight em-streck", k.weight === "—");
  T(fil + ": chapters_list ↔ chapters (num+titel+minuter)", k.chapters_list.length === 6 && k.chapters.every((c, i) => c.title === k.chapters_list[i].title && c.num === k.chapters_list[i].num && c.minutes === k.chapters_list[i].minutes));
  T(fil + ": history origin+evolution+modern", ["origin","evolution","modern"].every((x) => typeof k.history[x] === "string" && k.history[x].length > 200));
  T(fil + ": blocktyper bland text/definition/tabell/insight/utmaning", k.chapters.every((c) => c.blocks.every((b) => ["text","definition","tabell","insight","utmaning"].includes(b.type) && typeof b.content === "string" && b.content.length > 0)));
  T(fil + ": exakt en utmaning (kap 6)", k.chapters.filter((c) => c.blocks.some((b) => b.type === "utmaning")).length === 1);
  T(fil + ": inga extra blockfält", k.chapters.every((c) => c.blocks.every((b) => Object.keys(b).join(",") === "type,content")));

  // ── Språkgrind ──
  const cjk = allText.match(/[\u4e00-\u9fff\u3040-\u30ff\uac00-\ud7af]/g) || [];
  T(fil + ": 0 CJK", cjk.length === 0, cjk.slice(0, 3).join(" "));
  const mjuka = allText.match(/\u00ad/g) || [];
  T(fil + ": 0 mjuka bindestreck", mjuka.length === 0);
  const typCitat = allText.match(/[«»\u201c\u201d\u2018\u2019]/g) || [];
  T(fil + ": 0 typografiska citattecken", typCitat.length === 0);
  const tabbar = allText.match(/\t/g) || [];
  T(fil + ": 0 tabbar", tabbar.length === 0);
  const dubbel = allText.match(/ (?= )/g) || [];
  T(fil + ": 0 dubbla mellanslag", dubbel.length === 0, rå.match(/.{0,30}  +.{0,30}/)?.[0] ?? "");
  const ellips = allText.match(/…/g) || [];
  T(fil + ": 0 ellips", ellips.length === 0);
  const engelska = ["something ","the model","bookkeeping","accountable","well-anchored","complete ","Praxis","belongs","slippage","Praktisera omhedering"];
  const engTr = engelska.filter((w) => allText.includes(w));
  T(fil + ": 0 kända engelskaläckor", engTr.length === 0, engTr.join(","));
  const under = allText.match(/[a-zåäö]_[a-zåäö]|_[A-ZÅÄÖ]/g) || [];
  T(fil + ": 0 undermarks-klistrade ord", under.length === 0);

  // ── Korslänkar registeräkta (självreferens tillåten — familjenarrativet namnger eget läge) ──
  const länkar = [...new Set([...allText.matchAll(/\b([a-z]{1,4})-(\d{1,3})\b/g)].map((m) => m[1] + "-" + m[2]))];
  const egetPrefix = k.slug.match(/^[a-z]+-\d+/)?.[0];
  const skuggor = länkar.filter((l) => l !== egetPrefix && !harPrefix(l));
  T(fil + ": korslänkar registeräkta (" + länkar.length + " st)", skuggor.length === 0, skuggor.join(","));
  console.log("  " + fil + " länkar: " + länkar.sort().join(" "));

  // ── Juridikgrind ──
  const råd = ["köp denna","sälj denna","bör köpa","bör sälja","vi rekommenderar köp","tipsa om aktien"].filter((w) => allText.toLowerCase().includes(w));
  T(fil + ": 0 rådgivningsfraser", råd.length === 0, råd.join(","));
  T(fil + ": utbildningsframing närvarande", /inte uppmaningar att köpa eller sälja|utbildning i/.test(allText));
  T(fil + ": påhittade exempel deklarerade", /påhittade|påhittat/.test(allText));
  const lagrum = ["2007:528","2022:260","2022:261","1985:716","2005:59","2022:482"].filter((x) => allText.includes(x));
  T(fil + ": 0 lagrum (juridikgrindens granne äger)", lagrum.length === 0, lagrum.join(","));

  // ── R2 ──
  const prisYtor = ["kr/mån","Fas 2","Fas 3","prenumeration","99 kr","449","799"].filter((x) => allText.includes(x));
  T(fil + ": R2 — 0 pris-/tier-ytor", prisYtor.length === 0, prisYtor.join(","));
}

// ── Aritmetik: OBEROENDE omräkning av kursernas signaturtal ──
const rs = JSON.parse(readFileSync(ROT + "/data/kurser-tillagg/rs-08-modellrisken.json", "utf8"));
const rsText = vardeStrangar(rs).join("\n");
const A = (namn, uttryck) => T("aritmetik " + namn, uttryck, "");
const avrund = (x, d) => Math.round(x * 10 ** d) / 10 ** d;
A("rs: basvärde 135×0,12×14 = 226,8", avrund(135 * 0.12 * 14, 1) === 226.8);
A("rs: känslighet marginal 135×0,13×14 = 245,7 (+18,9)", avrund(135 * 0.13 * 14, 1) === 245.7 && avrund(245.7 - 226.8, 1) === 18.9);
A("rs: känslighet multipel 16,2×16 = 259,2 (+32,4)", avrund(16.2 * 16, 1) === 259.2 && avrund(259.2 - 226.8, 1) === 32.4);
A("rs: känslighet intäkt 140×0,12×14 = 235,2 (+8,4)", avrund(140 * 0.12 * 14, 1) === 235.2 && avrund(235.2 - 226.8, 1) === 8.4);
A("rs: samtliga 140×0,13×16 = 291,2 (+64,4)", avrund(140 * 0.13 * 16, 1) === 291.2 && avrund(291.2 - 226.8, 1) === 64.4);
A("rs: summan enskilda 18,9+32,4+8,4 = 59,7 · interaktion 64,4−59,7 = 4,7", avrund(18.9 + 32.4 + 8.4, 1) === 59.7 && avrund(64.4 - 59.7, 1) === 4.7);
A("rs: marginal (226,8−210)/210 = 8,0 procent", avrund(((226.8 - 210) / 210) * 100, 1) === 8.0);
A("rs: korgen 135×0,115×13,5 = 209,6", avrund(135 * 0.115 * 13.5, 1) === 209.6);
A("rs: enskilt marginalfel 15,525×14 = 217,4 (välter ej)", avrund(135 * 0.115 * 14, 1) === 217.4);
A("rs: enskilt multipelfel 16,2×13,5 = 218,7 (välter ej)", avrund(16.2 * 13.5, 1) === 218.7);
A("rs: procenttal 18,9/226,8=8,3 · 32,4/226,8=14,3 · 8,4/226,8=3,7 · 64,4/226,8=28,4", [8.3, 14.3, 3.7, 28.4].every((v, i) => avrund(([18.9, 32.4, 8.4, 64.4][i] / 226.8) * 100, 1) === v));
for (const tal of ["226,8","245,7","259,2","235,2","291,2","209,6","217,4","218,7","16,2","17,55","15,525","59,7","4,7","8,0 procent"]) A("rs: talet »" + tal + "« närvarande i kursfilen", rsText.includes(tal));

const od = JSON.parse(readFileSync(ROT + "/data/kurser-tillagg/od-06-positionen-efter-bygget.json", "utf8"));
const odText = vardeStrangar(od).join("\n");
A("od: startexponering 10×100×0,04 = 40 aktier", 10 * 100 * 0.04 === 40);
A("od: efter rörelse 10×100×0,26 = 260 aktier", 10 * 100 * 0.26 === 260);
A("od: förändring +220 utan beslut", 260 - 40 === 220);
A("od: gammavinst 0,5×0,02×8² = 0,64 kr/aktie → 640 kr", avrund(0.5 * 0.02 * 8 * 8, 2) === 0.64 && 640 === 0.64 * 1000);
A("od: thetan 0,50×1000 = 500 kr/dag", 0.5 * 1000 === 500);
A("od: netto för dagen 640−500 = +140", 640 - 500 === 140);
A("od: break-even √(2×0,50/0,02) = √50 ≈ 7,1 kr", avrund(Math.sqrt(50), 1) === 7.1);
A("od: 7,1/150 ≈ 4,7 procent", avrund((7.1 / 150) * 100, 1) === 4.7);
A("od: bandjustering 260−100 = 160 sålda aktier", 260 - 100 === 160);
A("od: lösenbehov 1000×150 = 150 000 kr", 1000 * 150 === 150000);
for (const tal of ["40 aktier","260 aktier","0,64","640","500","140","7,1","4,7","160","150 000","0,52","0,48","0,63","0,37","0,04","0,26"]) A("od: talet »" + tal + "« närvarande i kursfilen", odText.includes(tal));

console.log("\n" + pass.length + " PASS · " + fail.length + " FAIL");
if (fail.length) { console.log(fail.join("\n")); process.exit(1); }
console.log("PRE-KOLL GRÖN — bägge kursfilerna redo för insert.");
