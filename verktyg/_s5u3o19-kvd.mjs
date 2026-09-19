#!/usr/bin/env node
/**
 * s5-u3 (manifest auto-s5-1789812330026, omgång 19) — KVD för +3 kurser:
 * mt-07 kvalitetspremien · se-18 rederi och shipping · ma-07 valutakursens mekanik.
 *
 * Lägen:  --fore  = kursfiler + register-grandar FÖRE insert
 *         --efter = desamma + round-trip register↔kursfil + serieordning + antalsvakt
 *
 * Pedagogisk plattform — inte investeringsråd.
 */
import { readFileSync } from "node:fs";

const ROT = "/home/ak1a/AK1";
const LAGE = process.argv.includes("--efter") ? "efter" : "fore";
const MOAT_STEG = ["mt-01-vad-ar-en-moat","mt-02-moat-erosion-och-vallgravstest","mt-03-vallgraven-i-siffror","mt-04-vallgravens-fodelse","mt-05-byteskostnader-och-inlasning","mt-06-kostnadsoverlagsenhet","mt-07-prisfullmakten"];
const SEKTOR_STEG = ["se-01-saassektorn","se-02-halvledarsektorn","se-03-forsvarssektorn","se-04-logistiksektorn","se-05-lyxsektorn","se-06-finanssektorn","se-07-detailhandel","se-08-media","se-09-bil","se-10-flyg","se-11-krypto","se-12-spel","se-13-utbildning","se-14-livsmedel","se-15-logistik","se-16-sektoranalysens-metod","se-17-skogssektorn","km-038-techsektorn","km-039-pharmasektorn","km-040-banksektorn","km-041-industrisektorn","km-042-fastighetsektorn","km-043-energisektorn","km-044-konsumentsektorn","km-045-materialsektorn","km-046-telekomsektorn","km-047-utilitysektorn","km-048-halsovardsektorn"];
const MA_STEG = ["ma-01-transmissionsmekaniken","ma-02-lonebildning-och-kostnadsspiralen","ma-03-realrantan","ma-04-konjunkturindikatorerna","ma-05-kreditpremien","ma-06-aktiernas-riskpremie"];
const MINA = [
  { fil: "data/kurser-tillagg/mt-08-kvalitetspremien.json", slug: "mt-08-kvalitetspremien", fore: "mt-07-prisfullmakten", kat: "MOAT", niva: "Avancerad", steg: MOAT_STEG },
  { fil: "data/kurser-tillagg/se-18-rederi-och-shipping.json", slug: "se-18-rederi-och-shipping", fore: "se-17-skogssektorn", kat: "SEKTORANALYS", niva: "Intermediär", steg: SEKTOR_STEG },
  { fil: "data/kurser-tillagg/ma-07-valutakursens-mekanik.json", slug: "ma-07-valutakursens-mekanik", fore: "ma-06-aktiernas-riskpremie", kat: "MAKROEKONOMI & RÄNTA", niva: "Avancerad", steg: MA_STEG },
];

const register = JSON.parse(readFileSync(ROT + "/public/deep-courses.json", "utf8"));
const regSlugar = Object.keys(register);
const prefixFinns = (p) => regSlugar.some((s) => s === p || s.startsWith(p + "-"));

let PASS = 0, FEL = 0, VARN = 0;
const ok = (villkor, namn, detalj = "") => {
  if (villkor) { PASS++; if (process.env.VERBOSE) console.log("  PASS " + namn + (detalj ? " — " + detalj : "")); }
  else { FEL++; console.log("  FEL  " + namn + (detalj ? " — " + detalj : "")); }
};
const varna = (villkor, namn, detalj = "") => {
  if (!villkor) { VARN++; console.log("  VARN  " + namn + (detalj ? " — " + detalj : "")); }
  else PASS++;
};

function utvardera(uttryck) {
  const ren = uttryck.replace(/,/g, ".").replace(/×/g, "*").replace(/−/g, "-").replace(/÷/g, "/").replace(/\s+/g, "");
  if (!/^[-+*/().0-9]+$/.test(ren)) return null;
  try { return Function('"use strict";return (' + ren + ")")(); } catch { return null; }
}
const nara = (a, b, tol) => Math.abs(a - b) <= tol;

function allaStrangar(o, ack = []) {
  if (typeof o === "string") ack.push(o);
  else if (Array.isArray(o)) o.forEach((x) => allaStrangar(x, ack));
  else if (o && typeof o === "object") Object.values(o).forEach((x) => allaStrangar(x, ack));
  return ack;
}

for (const m of MINA) {
  console.log("═══ " + m.slug + " (" + LAGE + ")");
  const k = JSON.parse(readFileSync(ROT + "/" + m.fil, "utf8"));

  // A. Struktur
  ok(/^[a-z0-9][a-z0-9-]*$/.test(k.slug), "A1 slug ASCII", k.slug);
  ok(k.slug === m.slug, "A2 slug matchar anspråk");
  ok(k.category === m.kat, "A3 kategori exakt", k.category);
  ok(k.level === m.niva, "A4 nivå enligt anspråk", k.level);
  ok(k.xp === 50 && k.weight === "—", "A5 xp/weight-konvention");
  ok(k.chapterCount === 6 && k.chapters.length === 6 && k.chapters_list.length === 6, "A6 sex kapitel ×3 ytor");
  ok(k.minutes === k.totalMinutes && k.minutes === k.chapters.reduce((s, c) => s + c.minutes, 0), "A7 minuter = totalMinutes = Σ kapitel", String(k.minutes));
  ok(k.chapters.every((c, i) => c.num === i + 1 && c.num === k.chapters_list[i].num && c.title === k.chapters_list[i].title && c.minutes === k.chapters_list[i].minutes), "A8 chapters_list ↔ chapters paritet");
  const monster = [["text","definition","insight"],["text","tabell","insight"],["text","tabell","insight"],["text","definition","insight"],["text","insight"],["text","utmaning","insight"]];
  ok(k.chapters.every((c, i) => JSON.stringify(c.blocks.map((b) => b.type)) === JSON.stringify(monster[i])), "A9 blockmönster per kapitel");
  ok(k.chapters.every((c) => c.intro.length > 20 && c.blocks.every((b) => ["text","definition","tabell","insight","utmaning"].includes(b.type) && typeof b.content === "string" && b.content.length > 40)), "A10 intro + block innehållsladdade");
  ok(k.history && ["origin","evolution","modern"].every((f) => typeof k.history[f] === "string" && k.history[f].length > 80), "A11 history tre led");
  ok(["lynchSection","grahamSection","ak1Section"].every((f) => typeof k[f] === "string" && k[f].length > 100), "A12 lynch/graham/ak1-sektioner");
  ok(typeof k.summary === "string" && k.summary.length > 80 && typeof k.learn === "string" && k.learn.length > 80 && typeof k.why === "string" && k.why.length > 150, "A13 summary/learn/why-längd");
  ok(Object.keys(k).length === 18, "A14 exakt 18 fält (registerkontrakt)", String(Object.keys(k).length));

  // B. Språkgrind
  const str = allaStrangar(k);
  const hela = str.join("\n");
  ok(!/[\u201C\u201D\u2018\u2019]/.test(hela), "B1 typografiska citat 0");
  ok(!/\u00AD/.test(hela), "B2 mjuka bindestreck 0");
  ok(!/\t/.test(hela), "B3 tabbar 0");
  ok(!/[\u4E00-\u9FFF\u0400-\u04FF]/.test(hela), "B4 CJK/kyrilliska 0");
  const dubbelMell = hela.match(/[^\n]  +[^\n]/g);
  ok(!dubbelMell, "B6 dubbla mellanslag 0", dubbelMell ? JSON.stringify(dubbelMell.slice(0, 3)) : "");
  const dubbelord = hela.match(/\b(\w{2,}) \1\b/gi);
  ok(!dubbelord, "B7 dubbelord 0", dubbelord ? JSON.stringify([...new Set(dubbelord)].slice(0, 5)) : "");
  const accenter = hela.match(/[àâèéêìîòôùû]/gi);
  ok(!accenter, "B8 accenter utanför åäö 0", accenter ? JSON.stringify([...new Set(accenter)]) : "");
  const engelska = hela.match(/\b(the|and|with|again|only|approximately|category|timber|spreadar|obviously|famously|itself|possible|productiv|hedging|spannmål|multipleral)\b/gi);
  ok(!engelska, "B9 engelska läckor 0", engelska ? JSON.stringify([...new Set(engelska)]) : "");

  // C. Juridikgrind
  const radsfraser = hela.match(/(bör köpa|bör sälja|rekommenderar att|vi råder|köp aktien|sälj aktien|investera i|lägg pengar|satsa på denna)/gi);
  ok(!radsfraser, "C1 rådsfraser 0", radsfraser ? JSON.stringify(radsfraser) : "");
  ok(/utbildning|aldrig råd|inte råd|eget val|eget beslut|läsarens eget|eget arbete|eget ansvar/i.test(hela), "C2 utbildningsframing närvarande");
  ok(!/(\d{4}:\d+|lagen \(|kap \d+ §|\d kap \d+ §)/.test(hela), "C3 lagrumsnummer 0 (o13-konventionen)");

  // D. Korsreferensprefix registeräkta
  const prefix = [...new Set([...hela.matchAll(/\b([a-z]{2}-\d{2})\b/g)].map((x) => x[1]))];
  const egnaPrefix = MINA.map((x) => x.slug.split("-").slice(0, 2).join("-"));
  const brutna = prefix.filter((p) => !prefixFinns(p) && !egnaPrefix.includes(p));
  ok(brutna.length === 0, "D1 korsreferensprefix registeräkta (" + prefix.length + " st)", brutna.join(",") || "samliga äkta");

  // E. Aritmetik — fönstermetoden (som o18)
  let aritmA = 0, aritmF = [];
  for (const s of str) {
    const fonster = s.match(/\(?[0-9][0-9 ,.+×÷−()]*[0-9)](?:\s*=\s*[0-9][0-9 ,.+×÷−()]*[0-9)])+/g) || [];
    for (const f of fonster) {
      const led = f.split("=").map((x) => x.trim()).filter((x) => x.length > 0);
      const varden = led.map((x) => utvardera(x));
      if (varden.some((v) => v === null) || varden.length < 2) { aritmF.push(f + " (oparsbart)"); continue; }
      const referens = varden[varden.length - 1];
      if (varden.some((v) => !nara(v, referens, Math.max(0.06, Math.abs(referens) * 0.011)))) aritmF.push(f.replace(/\s+/g, " "));
      else aritmA++;
    }
  }
  ok(aritmF.length === 0, "E1 aritmetik fönsterkedjor (" + aritmA + " gröna)", aritmF.join(" | ") || "");

  // E-specifika kontroller per kurs (oberoende omräknade)
  if (k.slug.startsWith("mt-08")) {
    const d25till15 = Math.pow(15 / 25, 0.1), d10till12 = Math.pow(12 / 10, 0.1), d25till10 = Math.pow(10 / 25, 0.1);
    ok(nara(d25till15, 0.950, 0.001) && nara((d25till15 - 1) * 100, -5.0, 0.05), "E2 dragningsränta 15÷25 upphöjt 0,1 ≈ 0,950 → −5,0", d25till15.toFixed(4));
    ok(nara(d10till12, 1.018, 0.001) && nara((d10till12 - 1) * 100, 1.8, 0.05), "E3 dragningsränta 12÷10 upphöjt 0,1 ≈ 1,018 → +1,8", d10till12.toFixed(4));
    ok(nara(d25till10, 0.912, 0.001) && nara((d25till10 - 1) * 100, -8.8, 0.05), "E4 tredje raden 10÷25 upphöjt 0,1 ≈ 0,912 → −8,8", d25till10.toFixed(4));
    ok(Math.abs(8.0 - 5.0 - 3.0) < 1e-9 && Math.abs(4.0 + 1.8 - 5.8) < 1e-9 && Math.abs(8.0 - 8.8 + 0.8) < 1e-9, "E5 sumbor 3,0 · 5,8 · −0,8");
    ok(30 / 25 === 1.2, "E6 direktavkastning 30 ÷ 25 = 1,2");
  }
  if (k.slug.startsWith("se-18")) {
    ok(12000 + 8000 + 5000 === 25000, "E2 nollpunkten 25 000");
    ok(80000 - 25000 === 55000 && 55000 * 300 === 16500000, "E3 högcykel 55 000/dag → 16 500 000/år");
    ok(18000 - 25000 === -7000 && -7000 * 300 === -2100000, "E4 botten −7 000/dag → −2 100 000/år");
    ok(Math.abs(0.6 * 35000 + 0.4 * 18000 - 28200) < 1e-9 && 28200 - 25000 === 3200 && 3200 * 300 === 960000, "E5 certifikatsblandning 28 200 → 960 000/år");
    ok(nara(663 / 11793, 0.056, 0.001), "E6 indexvittnet 663 ÷ 11 793 ≈ 0,056", (663 / 11793).toFixed(4));
    ok(6 / 10 === 0.6 && 110 - 55 === 55, "E7 certifikatsandel 6 ÷ 10 = 0,60 + halvering 110 − 55 = 55");
  }
  if (k.slug.startsWith("ma-07")) {
    ok(nara(10 * 1.02 / 1.04, 9.81, 0.01), "E2 terminen 10,00 × 1,02 ÷ 1,04 ≈ 9,81", (10 * 1.02 / 1.04).toFixed(4));
    ok(nara(10.5 / 9.5, 1.105, 0.001), "E3 PPP-avvikelsen 10,50 ÷ 9,50 ≈ 1,105", (10.5 / 9.5).toFixed(4));
    ok(1000 - 800 === 200 && 1100 - 800 === 300 && 100 / 200 === 0.5 && 100 / 1000 === 0.1, "E4 exportörskedjan 200 · 300 · 0,50 · 0,10");
    ok(70 * 1.1 === 77, "E5 importspegeln 70 × 1,10 = 77");
    ok(Math.abs(4.0 - 1.0 - 3.0) < 1e-9, "E6 ränteskillnaden 4,0 − 1,0 = 3,0");
  }

  // F. Registerläge
  if (LAGE === "efter") {
    ok(register[m.slug] !== undefined, "F1 kursen i registret");
    if (register[m.slug]) {
      ok(JSON.stringify(register[m.slug]) === JSON.stringify(k), "F2 round-trip register ↔ kursfil identisk");
    }
    const iNy = regSlugar.indexOf(m.slug), iFore = regSlugar.indexOf(m.fore);
    ok(iFore >= 0 && iNy > iFore, "F3 serieordning efter " + m.fore, iFore + " < " + iNy);
    const saknadeSteg = m.steg.filter((s) => !register[s]);
    varna(saknadeSteg.length === 0, "F4 front B-steg alla i registret", saknadeSteg.join(",") || m.steg.length + " steg gröna");
  } else if (register[m.slug] === undefined) {
    PASS++;
  } else {
    VARN++; console.log("  VARN  F1-pre " + m.slug + " redan i registret — syskonlandning (register-först-presedensen nöjd; mina övriga steg fortsätter)");
  }
}

console.log("────");
console.log(`KVD ${LAGE}: ${PASS} PASS · ${FEL} FEL · ${VARN} VARNING — register ${regSlugar.length} kurser`);
process.exit(FEL ? 1 : 0);
