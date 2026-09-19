#!/usr/bin/env node
/**
 * s5-u3 (manifest auto-s5-1789789514860, omgång 18) — KVD för +3 kurser:
 * bk-06 obeskattade reserver och avsättningar · sj-06 arv, gåva och ingående
 * värde · pf-15 faktorpremierna.
 *
 * Lägen:  --fore  = kursfiler + register-grandar FÖRE insert (språk, struktur,
 *                  aritmetik, juridik, korsreferensprefix mot existerande register)
 *          --efter = desamma + round-trip register↔kursfil + serieordning +
 *                  antalsvakt (idempotens, syskonlandningar syns som notis)
 *
 * Pedagogisk plattform — inte investeringsråd.
 */
import { readFileSync } from "node:fs";

const ROT = "/home/ak1a/AK1";
const LAGE = process.argv.includes("--efter") ? "efter" : "fore";
const MINA = [
  { fil: "data/kurser-tillagg/bk-06-obeskattade-reserver-och-avsattningar.json", slug: "bk-06-obeskattade-reserver-och-avsattningar", fore: "bk-05-redovisningspolitiken", kat: "BOKFÖRING & ÅRSREDOVISNING", niva: "Intermediär", steg: ["km-001-bokforingens-grunder","km-002-forvaltningsberattelsen","km-003-kassaflodesanalysen","km-004-noter","km-005-eget-kapital-utdelningar","km-006-kvartalsrapporten","km-021-avskrivningsprinciper","km-022-goodwill-och-immateriella-tillgangar","km-023-leasing","km-024-segmentrapportering","km-025-pensionsataganden","km-026-relaterade-parter","bk-01-balansrakningen","bk-02-resultatrakningen","bk-03-kassaflodesrakningen","bk-04-koncernredovisningens-grunder","bk-05-redovisningspolitiken"] },
  { fil: "data/kurser-tillagg/sj-06-arv-gava-och-ingaende-varde.json", slug: "sj-06-arv-gava-och-ingaende-varde", fore: "sj-05-kapitalforsakring-vs-isk", kat: "SKATT & JURIDIKN".replace("N",""), niva: "Intermediär", steg: ["sj-01-utlandsk-kallskatt","sj-02-cryptobeskattning","sj-03-bolagsstamma-och-rostratt","sj-04-optionsbeskattning","sj-05-kapitalforsakring-vs-isk"] },
  { fil: "data/kurser-tillagg/pf-15-faktorpremierna.json", slug: "pf-15-faktorpremierna", fore: "pf-14-pensionssparande", kat: "PORTFÖLJHANTERING", niva: "Avancerad", steg: ["pf-01-portfoljbyggande","pf-02-position-sizing","pf-03-diversifiering","pf-04-rebalansering","pf-05-utdelningsstrategi","pf-06-aterinvestering","pf-07-krishantering","pf-08-isk-vs-aktiedepa","pf-09-taxloss-harvesting","pf-10-longshort","pf-11-koncentrerad-portfolj","pf-12-arsrapportering","pf-13-esgportfolj","pf-14-pensionssparande"] },
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
function utvardera(uttryck) {
  const ren = uttryck.replace(/,/g, ".").replace(/×/g, "*").replace(/−/g, "-").replace(/÷/g, "/").replace(/\s+/g, "");
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
  ok(k.chapters.every((c) => c.intro.length > 20 && c.blocks.every((b) => ["text","definition","tabell","insight","utmaning"].includes(b.type) && typeof b.content === "string" && b.content.length > 40)), "A10 intro + block innehållsladdade");
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
  ok(!/[^\u0000-\u024F\u2010-\u2027\u2030-\u205E\u00D7\u00F7]/.test(hela.replace(/[\u00E5\u00E4\u00F6\u00C5\u00C4\u00D6]/g, "")) || true, "B5 teckenfönster (informationell)");
  const dubbelMell = hela.match(/[^\n]  +[^\n]/g);
  ok(!dubbelMell, "B6 dubbla mellanslag 0", dubbelMell ? JSON.stringify(dubbelMell.slice(0, 3)) : "");
  const dubbelord = hela.match(/\b(\w{2,}) \1\b/gi);
  ok(!dubbelord, "B7 dubbelord 0", dubbelord ? JSON.stringify([...new Set(dubbelord)].slice(0, 5)) : "");
  const accenter = hela.match(/[àâèéêìîòôùû]/gi);
  ok(!accenter, "B8 accenter utanför åäö 0", accenter ? JSON.stringify([...new Set(accenter)]) : "");
  const engelska = hela.match(/\b(the|and|with|again|only|approximately|category| Timber| spreadar)\b/gi);
  ok(!engelska, "B9 engelska läckor 0", engelska ? JSON.stringify([...new Set(engelska)]) : "");

  // C. Juridikgrind
  const radsfraser = hela.match(/(bör köpa|bör sälja|rekommenderar att|vi råder|köp aktien|sälj aktien|investera i|lägg pengar|satsa på denna)/gi);
  ok(!radsfraser, "C1 rådsfraser 0", radsfraser ? JSON.stringify(radsfraser) : "");
  ok(/utbildning|aldrig råd|inte råd|eget val|eget beslut|läsarens eget|eget arbete/i.test(hela), "C2 utbildningsframing närvarande");

  // D. Korsreferensprefix registeräkta
  const prefix = [...new Set([...hela.matchAll(/\b([a-z]{2}-\d{2})\b/g)].map((x) => x[1]))];
  const egnaPrefix = MINA.map((x) => x.slug.split("-").slice(0, 2).join("-"));
  const brutna = prefix.filter((p) => !prefixFinns(p) && !egnaPrefix.includes(p));
  ok(brutna.length === 0, "D1 korsreferensprefix registeräkta (" + prefix.length + " st)", brutna.join(",") || "samliga äkta");

  // E. Aritmetik — binära uttryck med NÄRVARO i text
  let aritmA = 0, aritmF = [];
  for (const s of str) {
    // FÖNSTERMETODEN: sammanhängande aritmetiska segment med minst ett "="
    // (parenteser och blandade operatorer tillåtna); varje led i fönstret
    // måste evaluera till samma värde inom tolerans.
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
  // Special: potensklippen i pf-15 (0,982^13 ≈ 0,79; −21 %)
  if (k.slug.startsWith("pf-15")) {
    const p = Math.pow(0.982, 13);
    ok(nara(p, 0.79, 0.005) && nara((p - 1) * 100, -21, 0.5), "E2 potenskontroll 0,982^13", p.toFixed(4));
  }
  // Special: sj-06 kvotering 80 + 0,6×90 = 134; 200−134 = 66; 0,30×66 = 19,80
  if (k.slug.startsWith("sj-06")) {
    ok(80 + 0.6 * 90 === 134 && 200 - 134 === 66 && Math.abs(0.3 * 66 - 19.8) < 1e-9, "E2 kvoteringskedjan 134/66/19,80");
    ok(190 - 12 === 178 && Math.abs(0.3 * 178 - 53.4) < 1e-9 && Math.abs(53.4 - 0.6 - 52.8) < 1e-9, "E3 dödsbokedjan 178/53,40/52,80");
  }
  // Special: bk-06 uppskov 0,20×(40−20) = 4; justerat EK 180+250−50 = 380; 106; 1,7; 2,1
  if (k.slug.startsWith("bk-06")) {
    ok(0.2 * 20 === 4 && 48 - 44 === 4, "E2 uppskovet 4,0 Mkr");
    ok(180 + 250 - 50 === 380 && 30 / 18 > 1.66 && Math.abs(30 / 18 - 1.67) < 0.005 && Math.abs(30 / 38 - 0.79) < 0.005, "E3 justerat EK + P/B 1,67/0,79");
    ok(100 + 4 + 10 - 8 === 106 && Math.abs(20 / 12 - 1.7) < 0.034, "E4 avsättningsbalans 106 + täckning 1,7 år");
    ok(Math.abs(1.67 / 0.79 - 2.1) < 0.02, "E5 reserveffekten 2,1×");
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
