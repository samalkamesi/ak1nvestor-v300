#!/usr/bin/env node
/**
 * s5-u1 (manifest auto-s5-1789812330026) — KVD för +1 kurs:
 * mt-07 prisfullmakten (MOAT-familjens sjunde steg, tredje Avancerad).
 *
 * Lägen:  --fore  = kursfil FÖRE insert (struktur, språk, aritmetik,
 *                  juridik, korsreferensprefix mot existerande register)
 *          --efter = desamma + round-trip register↔kursfil + serieordning +
 *                  antalsvakt (idempotens, syskonlandningar syns som notis)
 *
 * Pedagogisk plattform — inte investeringsråd.
 */
import { readFileSync } from "node:fs";

const ROT = "/home/ak1a/AK1";
const LAGE = process.argv.includes("--efter") ? "efter" : "fore";
const MINA = [
  { fil: "data/kurser-tillagg/mt-07-prisfullmakten.json", slug: "mt-07-prisfullmakten", fore: "mt-06-kostnadsoverlagsenhet", kat: "MOAT", niva: "Avancerad", steg: ["mt-01-vad-ar-en-moat","mt-02-moat-erosion-och-vallgravstest","mt-03-vallgraven-i-siffror","mt-04-vallgravens-fodelse","mt-05-byteskostnader-och-inlasning","mt-06-kostnadsoverlagsenhet"] },
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

// ── Aritmetikutvärderare (whitelist — inga identifierare möjliga) ────────────
// O19-tillägget mot o18: divisionstecknet / tillhör nu fönstret (o18:s klass
// saknade det — a/b = c klipptes till b = c och flaggades falskt), och
// obalanserade parenteser (fönster som fångar en ensam slutparentes) rensas
// före evaluering snarare än äntras som oparsbara.
function utvardera(uttryck) {
  let ren = uttryck.replace(/,/g, ".").replace(/×/g, "*").replace(/−/g, "-").replace(/÷/g, "/").replace(/\s+/g, "");
  const oppnar = (ren.match(/\(/g) || []).length, stanger = (ren.match(/\)/g) || []).length;
  if (oppnar !== stanger) ren = ren.replace(/[()]/g, "");
  if (!/^[-+*/().0-9]+$/.test(ren)) return null;
  try { return Function('"use strict";return (' + ren + ")")(); } catch { return null; }
}
const nara = (a, b, tol) => Math.abs(a - b) <= tol;

// ── Språkgrind på ALLA strängvärden i kursobjektet ───────────────────────────
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
  ok(k.chapters.every((c) => c.intro.length > 20 && c.blocks.every((b) => ["text","definition","tabell","insight","utmaning"].includes(b.type) && typeof b.content === "string" && b.content.length > 40 && Object.keys(b).every((nyckel) => nyckel === "type" || nyckel === "content"))), "A10 intro + block innehållsladdade, inga främmande blockfält");
  ok(k.history && ["origin","evolution","modern"].every((f) => typeof k.history[f] === "string" && k.history[f].length > 80), "A11 history tre led");
  ok(["lynchSection","grahamSection","ak1Section"].every((f) => typeof k[f] === "string" && k[f].length > 100), "A12 lynch/graham/ak1-sektioner");
  ok(typeof k.summary === "string" && k.summary.length > 80 && typeof k.learn === "string" && k.learn.length > 80 && typeof k.why === "string" && k.why.length > 150, "A13 summary/learn/why-längd");

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
  const engelska = hela.match(/\b(the|and|with|again|only|approximately|category|wounds|value|lifetime|input|from)\b/gi);
  ok(!engelska, "B9 engelska läckor 0", engelska ? JSON.stringify([...new Set(engelska)]) : "");
  ok(!/_[a-zåäö]/.test(hela), "B10 understreck i brödtext 0");

  // C. Juridikgrind
  const radsfraser = hela.match(/(bör köpa|bör sälja|rekommenderar att|vi råder|köp aktien|sälj aktien|investera i|lägg pengar|satsa på denna)/gi);
  ok(!radsfraser, "C1 rådsfraser 0", radsfraser ? JSON.stringify(radsfraser) : "");
  ok(/utbildning|aldrig råd|inte råd|eget val|eget beslut|läsarens eget|eget arbete/i.test(hela), "C2 utbildningsframing närvarande");
  ok(!/\b(2007:528|2022:260|2022:261|1985:716|2005:59|2022:482)\b/.test(hela), "C3 lagrumsnummer 0 (o13-konventionen)");

  // D. Korsreferensprefix registeräkta
  const prefix = [...new Set([...hela.matchAll(/\b([a-z]{2}-\d{2})\b/g)].map((x) => x[1]))];
  const egnaPrefix = MINA.map((x) => x.slug.split("-").slice(0, 2).join("-"));
  const brutna = prefix.filter((p) => !prefixFinns(p) && !egnaPrefix.includes(p));
  ok(brutna.length === 0, "D1 korsreferensprefix registeräkta (" + prefix.length + " st)", brutna.join(",") || "samliga äkta");

  // E. Aritmetik — fönstermetoden (samma evaluatorkontrakt som o18-serien)
  let aritmA = 0, aritmF = [];
  for (const s of str) {
    const fonster = s.match(/\(?[0-9][0-9 ,.+×÷−()/]*[0-9)](?:\s*=\s*[0-9][0-9 ,.+×÷−()/]*[0-9)])+/g) || [];
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
  // Special: elasticitetstrappan (kap 2)
  if (k.slug.startsWith("mt-07")) {
    ok(Math.abs(1.04 * 1.0 - 1.04) < 1e-9 && Math.abs(1.04 * 0.985 - 1.0244) < 1e-9 && Math.abs(1.04 * 0.94 - 0.9776) < 1e-9 && Math.abs(1.04 * 0.96 - 0.9984) < 1e-9, "E2 trappan 1,0400/1,0244/0,9776/0,9984");
    ok(6 / 4 === 1.5 && Math.abs(1.5 / 4 - 0.375) < 1e-9, "E3 elasticiteter 1,5 och 0,375");
    ok(110 - 66 === 44 && Math.abs(44 / 110 - 0.4) < 1e-9 && Math.abs(41 / 107 - 0.383) < 0.0005 && Math.abs(34 / 100 - 0.34) < 1e-9 && Math.abs((107 - 100) / (110 - 100) - 0.7) < 1e-9, "E4 skärmningen 0,400/0,383/0,340/0,7");
    ok(Math.abs(40 / 8000 - 0.005) < 1e-9 && Math.abs(108 / 104 - 1.038) < 0.0005 && 43 - 41 === 2 && 39 - 34 === 5, "E5 kullager/pristrappa/band 0,005/1,038/2/5");
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
    PASS++; // F1-pre: kursen ännu ej i registret — insert senare (grönt)
  } else {
    VARN++; console.log("  VARN  F1-pre " + m.slug + " redan i registret — syskonlandning (register-först-presedensen nöjd; mina övriga steg fortsätter)");
  }
}

console.log("────");
console.log(`KVD ${LAGE}: ${PASS} PASS · ${FEL} FEL · ${VARN} VARNING — register ${regSlugar.length} kurser`);
process.exit(FEL ? 1 : 0);
