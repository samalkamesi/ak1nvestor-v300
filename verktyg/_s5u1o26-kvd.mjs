#!/usr/bin/env node
/**
 * s5-u1 omgång 26 — KVD för se-24-banksektorn: juridikgrind, korslänkar,
 * blockkonvention (familjesed), aritmetikkontroll, R2.
 *
 * Pedagogisk plattform — inte investeringsråd.
 */
import { readFileSync } from "node:fs";

const ROT = "/home/ak1a/AK1";
const k = JSON.parse(readFileSync(ROT + "/data/kurser-tillagg/se-24-banksektorn.json", "utf8"));
const reg = JSON.parse(readFileSync(ROT + "/public/deep-courses.json", "utf8"));
const regSlugs = Object.keys(reg);

let PASS = 0, FEL = 0;
const ok = (v, n, d = "") => { if (v) { PASS++; console.log("  PASS " + n + (d ? " — " + d : "")); } else { FEL++; console.log("  FEL  " + n + (d ? " — " + d : "")); } };

// A. Juridikgrind
const allt = [
  k.title, k.summary, k.why, k.learn,
  k.history.origin, k.history.evolution, k.history.modern,
  k.lynchSection, k.grahamSection, k.ak1Section,
  ...k.chapters.flatMap((c) => [c.title, c.intro, ...c.blocks.map((b) => b.content)]),
].join("\n");
ok(/aldrig placeringsråd|inte placeringsråd|utbildning om mekanismer/.test(allt), "A1 juridikmarkering (utbildning, aldrig råd)");
const radsförbud = allt.toLowerCase().match(/\b(köp denna|sälj denna|rekommenderar köp|rekommenderar sälj|min rekommendation är att köpa|bör du köpa|så borde du investera)\b/g);
ok(!radsförbud, "A2 inga rådsformuleringar", radsförbud ? radsförbud.join(", ") : "0 träffar");
ok(!/\b(Fas 2|Fas 3|9 ?999|13 ?999|249|449|799)\b/.test(allt), "A3 R2 — inga pris-/tier-tal i kursen");
ok(!/\(1994|2005:59|2022:26[01]|2022:482\)/.test(allt), "A4 inga blandade lagrum");

// B. Korslänkar: alla kurs-id-namn finns i registret
const referenser = [...new Set([...allt.matchAll(/\b([a-zA-Z]{2,4}-\d{2,3})-[a-zA-Z]/g)].map((m) => m[0].toLowerCase()))];
const saknade = referenser.filter((ref) => !regSlugs.some((s) => s.startsWith(ref)));
ok(saknade.length === 0, "B1 korslänkar registeräkta (" + referenser.length + " st)", saknade.length ? "SAKNADE: " + saknade.join(", ") : referenser.slice(0, 8).join(", ") + " …");
const minaRefs = referenser.filter((r) => r.startsWith("se-"));
ok(minaRefs.length >= 3, "B2 familjesjälvreferenser (metod + grannar)", minaRefs.join(", "));

// C. Blockkonvention (familjesed från se-23): kap 1-5 = 3 block, sista insight;
//    mittposition definition|tabell; kap 6 = text+utmaning+insight
ok(k.chapters.length === 6 && k.chapterCount === 6, "C1 sex kapitel");
for (const c of k.chapters) {
  const typer = c.blocks.map((b) => b.type);
  const sista = typer[typer.length - 1];
  if (c.num < 6) {
    ok(typer.length === 3 && typer[0] === "text" && ["definition", "tabell"].includes(typer[1]) && sista === "insight",
      "C2." + c.num + " kap " + c.num + " blockkonvention", typer.join("+"));
  } else {
    ok(typer[0] === "text" && typer.includes("utmaning") && sista === "insight", "C2.6 protokollskapitel text+utmaning+insight", typer.join("+"));
  }
  ok(c.minutes === 4, "C3." + c.num + " minuter 4");
}
ok(k.chapters.reduce((s, c) => s + c.minutes, 0) === k.totalMinutes && k.totalMinutes === k.minutes, "C4 minuter summa = totalMinutes = minutes (" + k.minutes + ")");
ok(k.chapters.every((c) => c.blocks.every((b) => (b.content || "").length > 40)), "C5 inga tomma block");

// D. Aritmetik (kursens signaturtal)
const A = {
  nii: 3600 - 800 - 520,
  rantenat: (3600 - 800 - 520) / 100000,
  upp1: 4600 - 1120 - 720,
  ned1: 2600 - 480 - 320,
  upp2: 5600 - 1440 - 920,
  kreditiaRok: 900 + 150 - 700 - 200,
  kreditiaKris: 900 + 150 - 700 - 600,
  fondiaNii: 2000 - 0 - 750,
  sveaRok: 2280 + 420 - 1100 - 50,
  netto: 1550 * 0.78,
  roe: (1550 * 0.78) / 8000,
  kiSvea: 1100 / 2700,
  kiKred: 700 / 1050,
  riskJ: (900 - 200) / 10000,
  riskS: (2280 - 50) / 100000,
  kundKontroll: 400000 * 4000 / 1e6 - 50,
  havstang: 110 / 8,
  cet1: 8 / 80,
  buffert: 0.015 * 80000,
  utd5: 8000 + 1209 - 8400,
  utd10: 8000 + 1209 - 8800,
};
ok(A.nii === 2280 && Math.abs(A.rantenat - 0.0228) < 1e-9, "D1 nätlån 2 280 Mkr / räntenät 2,28 %", String(A.nii) + " / " + (A.rantenat * 100).toFixed(2) + " %");
ok(A.upp1 === 2760 && A.ned1 === 1800 && A.upp2 === 3240, "D2 räntesvängen +2 760 / 1 800 / 3 240", [A.upp1, A.ned1, A.upp2].join(" / "));
ok(A.kreditiaRok === 150 && A.kreditiaKris === -250 && A.fondiaNii === 1250, "D3 Kreditia +150/−250, Fondia 1 250", [A.kreditiaRok, A.kreditiaKris, A.fondiaNii].join(" / "));
ok(Math.abs(A.kiSvea - 0.4074) < 1e-3 && Math.abs(A.kiKred - 0.6667) < 1e-3, "D4 K/I 40,7 % / 66,7 %", (A.kiSvea * 100).toFixed(1) + " / " + (A.kiKred * 100).toFixed(1));
ok(A.sveaRok === 1550 && Math.abs(A.kundKontroll - 1550) < 1e-9, "D5 RÖK 1 550 = kundkontrollen", A.sveaRok + " = " + A.kundKontroll);
ok(Math.round(A.netto) === 1209 && Math.abs(A.roe - 0.1511) < 1e-3, "D6 netto 1 209, ROE 15,1 %", Math.round(A.netto) + " / " + (A.roe * 100).toFixed(1) + " %");
ok(A.havstang === 13.75 && Math.abs(A.cet1 - 0.10) < 1e-9 && A.buffert === 1200, "D7 hävstång 13,75×, CET1 10,0 %, buffert 1 200 Mkr", A.havstang + "× / " + (A.cet1 * 100).toFixed(1) + " % / " + A.buffert);
ok(A.utd5 === 809 && A.utd10 === 409, "D8 utdelningsekvationen 809 / 409", A.utd5 + " / " + A.utd10);
ok(Math.abs(A.riskJ - 0.07) < 1e-9 && Math.abs(A.riskS - 0.0223) < 1e-4, "D9 riskjusterat räntenät 7,0 % / 2,23 %", (A.riskJ * 100).toFixed(1) + " / " + (A.riskS * 100).toFixed(2));

// E. Registerposten på plats + struktur
ok(reg["se-24-banksektorn"] !== undefined, "E1 registerpost på plats (484)");
const siffror = JSON.parse(readFileSync(ROT + "/data/siffror.json", "utf8"));
ok(typeof siffror.kurser === "number" || typeof siffror.antalKurser === "number" || Object.keys(siffror).length > 3, "E2 siffror.json omskriven av kedjan", Object.keys(siffror).slice(0, 6).join(", "));
const larvag = JSON.parse(readFileSync(ROT + "/data/vakten/larvag-synk.json", "utf8"));
ok(larvag.status === "grön" && larvag.registerAntal >= 484, "E3 larvag-synk GRÖN ≥ 484", larvag.status + " " + larvag.registerAntal);

// F. Triplett-skydd: syskonens ytor orörda
ok(reg["st-07"] === undefined, "F1 u2:s st-07 inte förlagd av mig (deras yta)");
ok(k.slug !== "se-25-x" && !k.title.includes("Skuggskuld"), "F2 ingen titelkollision med u2:s skuggskulder");

console.log("────");
console.log(`KVD: ${PASS} PASS · ${FEL} FEL`);
process.exit(FEL ? 1 : 0);
