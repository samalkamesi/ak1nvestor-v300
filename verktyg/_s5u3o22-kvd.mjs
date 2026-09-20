#!/usr/bin/env node
/**
 * s5-u3 (manifest auto-s5-1789888503136, omgång 22) — KVD PREKOLL FÖRE insert:
 * bf-16-slumpens-serier + od-08-binomialtradet-och-replikeringen +
 * se-21-kemisektorn. Struktur, aritmetik (oberoende omräknad), juridikgrind
 * (2007:528 utbildningsframing, 0 rådsfraser), språkgrind (CJK, typografiska
 * citat, tabbar, dubbelord med åäö-säker lookaround), korslänkar registeräkta,
 * R2 (kraverFas/priser), serievakt.
 *
 * Pedagogisk plattform — inte investeringsråd.
 */
import { readFileSync } from "node:fs";

const ROT = "/home/ak1a/AK1";
const KURSER = [
  "bf-16-slumpens-serier",
  "od-08-binomialtradet-och-replikeringen",
  "se-21-kemisektorn",
];
let pass = 0, fel = 0, varn = 0;
const P = (ok, namn, detalj = "") => {
  if (ok) { pass++; console.log("  PASS " + namn + (detalj ? " — " + detalj : "")); }
  else { fel++; console.log("  FEL  " + namn + (detalj ? " — " + detalj : "")); }
};
const V = (ok, namn, detalj = "") => {
  if (ok) { pass++; console.log("  PASS " + namn + (detalj ? " — " + detalj : "")); }
  else { varn++; console.log("  VARN " + namn + (detalj ? " — " + detalj : "")); }
};
const nara = (x, y, tol = 0.01) => Math.abs(x - y) <= tol * Math.max(Math.abs(y), 1);
const K = (x) => "≈" + x;

// ── Register (korslänkar + serievakt) ─────────────────────────────────────────
const reg = JSON.parse(readFileSync(ROT + "/public/deep-courses.json", "utf8"));
const slugar = Object.keys(reg);

// ── Aritmetiska referenser (oberoende omräknade med JS-matematik) ─────────────
const C = (n, k) => { let r = 1; for (let i = 0; i < k; i++) r = (r * (n - i)) / (i + 1); return r; };
// erf via Abramowitz-Stegun 7.1.26 (max fel 1,5e-7 — godtagbart mot kurstextens avrundning)
const erf = (x) => {
  const s = Math.sign(x); x = Math.abs(x);
  const t = 1 / (1 + 0.3275911 * x);
  const y = 1 - ((((1.061405429 * t - 1.453152027) * t + 1.421413741) * t - 0.284496736) * t + 0.254829592) * t * Math.exp(-x * x);
  return s * y;
};
const Phi = (z) => 0.5 * (1 + erf(z / Math.SQRT2));
const komb = (k) => C(10, k);
const ref = {
  bf: {
    p5av10: komb(5) / 1024,
    pMinst6: (komb(6) + komb(7) + komb(8) + komb(9) + komb(10)) / 1024,
    pMinst8: (komb(8) + komb(9) + komb(10)) / 1024,
    pMinst8valfri: 2 * (komb(8) + komb(9) + komb(10)) / 1024,
    stor100: (() => { const z = (59.5 - 50) / 5; return 1 - Phi(z); })(),
    kvot: ((komb(6) + komb(7) + komb(8) + komb(9) + komb(10)) / 1024) / 0.029,
    mc1913: Math.pow(18 / 37, 26),
    mcOdd: 1 / Math.pow(18 / 37, 26),
    log2_100: Math.log2(100), log2_200: Math.log2(200),
    H100: (() => { let s = 0; for (let k = 1; k <= 100; k++) s += 1 / k; return s; })(),
    halv8: Math.pow(0.5, 8), halv20: Math.pow(0.5, 20),
    a52s: Math.sqrt(52 * 0.53 * 0.47), a520s: Math.sqrt(520 * 0.53 * 0.47),
    z52: (26.5 - 52 * 0.53) / Math.sqrt(52 * 0.53 * 0.47),
    z520: (260.5 - 520 * 0.53) / Math.sqrt(520 * 0.53 * 0.47),
    fi52: (() => { return Phi((26.5 - 27.56) / 3.5941); })(),
    fi520: (() => { return Phi((260.5 - 275.6) / 11.366); })(),
    mult20: 1 - Math.pow(0.95, 20),
    fonder6: 200 / 64,
  },
  od: {
    delta: 20 / 40,
    B: 40 / 1.02,
    C: 50 - 40 / 1.02,
    upp: 0.5 * 120 - (40 / 1.02) * 1.02,
    ner: 0.5 * 80 - (40 / 1.02) * 1.02,
    q: (1.02 - 0.80) / (1.20 - 0.80),
    Cq: (0.55 * 20) / 1.02,
    Cu: 24.2 / 1.02,
    C2: (0.55 * (24.2 / 1.02)) / 1.02,
    Pu: 1.8 / 1.02,
    PdFort: 18.4 / 1.02,
    P0: (0.55 * (1.8 / 1.02) + 0.45 * 20) / 1.02,
  },
  se: {
    g4: 33 * 4, g8: 33 * 8, g12: 33 * 12,
    breakevenHog: 33 * 12 + 150,
    margHog: 560 - (33 * 12 + 150),
    margLag: 560 - (33 * 4 + 150),
    kvot: (560 - (33 * 4 + 150)) / (560 - (33 * 12 + 150)),
    margHog500: 500 - (33 * 12 + 150),
    margLag500: 500 - (33 * 4 + 150),
    bulkBrutto: 12000 * 0.18,
    specBrutto: 3000 * 0.38,
    specAndel: (3000 * 0.38) / (12000 * 0.18 + 3000 * 0.38),
    omsAndel: 3000 / 15000,
    fouSpec: 3000 * 0.05,
    fouBulk: 12000 * 0.005,
  },
};

console.log("═══ REFERENSVÄRDEN (motorns omräkning)");
console.log("  bf: p5av10=" + K((ref.bf.p5av10 * 100).toFixed(1)) + "% pMinst6=" + K((ref.bf.pMinst6 * 100).toFixed(1)) + "% pMinst8=" + K((ref.bf.pMinst8 * 100).toFixed(1)) + "% pMinst8valfri=" + K((ref.bf.pMinst8valfri * 100).toFixed(1)) + "%");
console.log("  bf: stor100=" + K((ref.bf.stor100 * 100).toFixed(1)) + "% kvot=" + ref.bf.kvot.toFixed(1) + " mc1913=" + ref.bf.mc1913.toExponential(2) + " (ett på " + Math.round(ref.bf.mcOdd / 1e6) + " miljoner)");
console.log("  bf: log2: " + ref.bf.log2_100.toFixed(1) + "/" + ref.bf.log2_200.toFixed(1) + " H100=" + ref.bf.H100.toFixed(1) + " halv8=1/" + Math.round(1 / ref.bf.halv8) + " halv20=1/" + Math.round(1 / ref.bf.halv20).toLocaleString("sv-SE"));
console.log("  bf: σ52=" + ref.bf.a52s.toFixed(1) + " z52=" + ref.bf.z52.toFixed(2) + " Φ=" + K((ref.bf.fi52 * 100).toFixed(0)) + "% · σ520=" + ref.bf.a520s.toFixed(1) + " z520=" + ref.bf.z520.toFixed(2) + " Φ=" + K((ref.bf.fi520 * 100).toFixed(0)) + "% · mult20=" + K((ref.bf.mult20 * 100).toFixed(0)) + "% fonder6=" + ref.bf.fonder6.toFixed(1));
console.log("  od: Δ=" + ref.od.delta.toFixed(2) + " B=" + ref.od.B.toFixed(2) + " C=" + ref.od.C.toFixed(2) + " upp=" + ref.od.upp.toFixed(1) + " ner=" + ref.od.ner.toFixed(1) + " q=" + ref.od.q.toFixed(2) + " Cq=" + ref.od.Cq.toFixed(2));
console.log("  od: Cu=" + ref.od.Cu.toFixed(2) + " C2=" + ref.od.C2.toFixed(2) + " Pu=" + ref.od.Pu.toFixed(2) + " PdFort=" + ref.od.PdFort.toFixed(2) + " P0=" + ref.od.P0.toFixed(2));
console.log("  se: gas 132/264/396 · breakevenHög=" + ref.se.breakevenHog + " marginaler 14/278 kvot=" + ref.se.kvot.toFixed(1) + " · 500-fallet: " + ref.se.margHog500 + "/" + ref.se.margLag500);
console.log("  se: brutto 2160/1140 andel=" + (ref.se.specAndel * 100).toFixed(1) + "% omsättningandel=" + (ref.se.omsAndel * 100).toFixed(0) + "% FoU 60/150");

// ── strukturoch textkontroller per kurs ───────────────────────────────────────
const KATEGORI = { "bf-16-slumpens-serier": "BETEENDEFINANS", "od-08-binomialtradet-och-replikeringen": "OPTIONS & DERIVAT", "se-21-kemisektorn": "SEKTORANALYS" };
const NIVA = { "bf-16-slumpens-serier": "Avancerad", "od-08-binomialtradet-och-replikeringen": "Avancerad", "se-21-kemisektorn": "Intermediär" };
const FALT18 = ["slug", "category", "weight", "chapterCount", "totalMinutes", "title", "summary", "minutes", "xp", "level", "why", "learn", "history", "chapters_list", "lynchSection", "grahamSection", "ak1Section", "chapters"];

function values(o) {
  const out = [];
  (function w(x) {
    if (typeof x === "string") out.push(x);
    else if (Array.isArray(x)) x.forEach(w);
    else if (x && typeof x === "object") Object.values(x).forEach(w);
  })(o);
  return out;
}
const LATINORD = /^[a-zA-Z'-]+$/;
const SVOK = /[aeiouyåäö]/;
const EGENNAMN = new Set(["kahneman", "tversky", "monte", "carlo", "haber", "bosch", "basf", "yara", "norden", "boliden", "lynch", "graham", "saab", "erf", "bernanke", "cardano", "galileo", "pascal", "fermat", "bernoulli", "bachelier", "cox", "ross", "rubinstein", "black", "scholes", "merton", "opponeringen", "ak1a", "sam", "mr", "market", "bernanke"]);

for (const slug of KURSER) {
  console.log("═══ KURS " + slug);
  const d = JSON.parse(readFileSync(ROT + "/data/kurser-tillagg/" + slug + ".json", "utf8"));

  // struktur
  P(d.slug === slug, "slug == filnamn");
  P(FALT18.every((f) => f in d) && Object.keys(d).length === 18, "18 fält exakt", Object.keys(d).length + " fält");
  P(d.category === KATEGORI[slug], "kategori", d.category);
  P(d.level === NIVA[slug], "nivå", d.level);
  P(d.chapterCount === 6 && d.totalMinutes === 24 && d.minutes === 24 && d.xp === 50 && d.weight === "—", "kap/min/xp/weight-kontrakt");
  P(d.chapters.length === 6 && d.chapters_list.length === 6, "6 kapitel + chapters_list");
  P(d.chapters.every((c, i) => c.num === i + 1 && c.minutes === 4 && c.title === d.chapters_list[i].title), "kapitelnummer, 4 min, titelparitet list/kap");
  P(d.chapters.every((c) => c.blocks.length >= 2 && c.blocks.every((b) => ["text", "definition", "tabell", "insight", "utmaning"].includes(b.type) && Object.keys(b).every((k) => k === "type" || k === "content"))), "blocktyper + endast type/content");
  P(d.chapters.some((c) => c.blocks.some((b) => b.type === "utmaning")), "minst en utmaning");
  P(d.history && ["origin", "evolution", "modern"].every((k) => typeof d.history[k] === "string" && d.history[k].length > 100), "history origin/evolution/modern");
  P(d.learn.split("·").length === 8, "learn 8 punkter", d.learn.split("·").length + " punkter");
  P(d.summary.length > 1200 && d.summary.length < 2400, "summary-längd", d.summary.length + " tecken");
  P(d.why.length > 800 && d.why.length < 1700, "why-längd (varför-raden)", d.why.length + " tecken");

  // språkgrind på textvärden
  const vals = values(d);
  const typ = vals.flatMap((v) => [...v].filter((c) => /[\u00AB\u00BB\u201C\u201D\u2018\u2019]/.test(c)));
  P(typ.length === 0, "0 typografiska citat", typ.length + " st");
  const cjk = vals.flatMap((v) => [...v].filter((c) => /[\u3000-\u9fff\uff00-\uffef\u4e00-\u9fff]/.test(c)));
  P(cjk.length === 0, "0 CJK", cjk.length + " st");
  const tabbar = vals.reduce((a, v) => a + (v.includes("\t") ? 1 : 0), 0);
  P(tabbar === 0, "0 tabbar i textvärden", tabbar + " st");
  const us = vals.filter((v) => /_[a-zåäö]/i.test(v) || /[a-zåäö]_/.test(v));
  P(us.length === 0, "0 underscore i textvärden", us.length + " st");
  const dubbel = [];
  for (const v of vals) {
    // lookaround-gränser: \b är ASCII-känslig mot åäö (o21-läxan) — ordgränser som lookarounds
    const m = v.matchAll(/(?<![a-zA-ZåäöÅÄÖ])([a-zåäöé]{2,})(?=\s+\1(?![a-zA-ZåäöÅÄÖ]))/gi);
    for (const x of m) dubbel.push(x[1]);
  }
  P(dubbel.length === 0, "0 dubbelord", dubbel.join(","));
  const dubbelMellan = vals.filter((v) => v.includes("  "));
  P(dubbelMellan.length === 0, "0 dubbla mellanslag", dubbelMellan.length + " st");
  // engelskaläckor: token som ALDRIG förekommer i registrets svenska vokabulär
  // (nya kurser föder nytt svensk vokabulär — svensk formologi vitlistas:
  // bestämda/plurala suffix och sammansättningar med bindestreck)
  const regVocab = new Set();
  for (const p of Object.values(reg)) for (const v of values(p)) for (const ord of v.toLowerCase().split(/[^a-zåäö0-9-]+/)) if (ord.length >= 3) regVocab.add(ord);
  const svForm = /(en|et|er|ar|or|na|nde|ningen|elsen|sinnen|ernas|ernas)$/;
  const eng = new Set();
  for (const v of vals) for (const ord of v.split(/[^a-zA-ZåäöÅÄÖ'-]+/)) {
    const o = ord.toLowerCase();
    if (o.includes("-")) continue;
    if (o.length >= 3 && !regVocab.has(o) && /^[a-zåäö]+$/.test(o) && !svForm.test(o) && !/[åäö]/.test(o)) eng.add(o);
  }
  V(eng.size === 0, "engelskaläckor mot registrets vokabulär (sv-formologi vitlistad)", eng.size ? [...eng].slice(0, 12).join(",") : "0");

  // juridikgrind
  const rad = vals.join(" ").toLowerCase();
  const radfraser = [/\bdu bör (köpa|sälja|placera|teckna|välja)\b/, /\bni bör (köpa|sälja|placera)\b/, /\bköp (denna|den här) aktien\b/, /\bsälj (denna|den här) aktien\b/, /\bvi rekommenderar (köp|sälj|placering)\b/, /\btipsa dig om (aktier|placering)\b/];
  P(radfraser.every((re) => !re.test(rad)), "juridikgrind: 0 du/ni-riktade rådsfraser");
  P(/utbildning|pedagogisk|kursens|mekanismer/i.test(d.summary) || /aldrig råd|inte investeringsråd/i.test(rad), "utbildningsframing i summary");
  P(!/\b(2005:59|2022:260|2022:261|1985:716|2022:482)\b/.test(rad), "0 blandade lagrum (endast 2007:528 tillåts i kontext)");

  // R2
  P(!/kraverFas|priser|prisplan|tier|fas 2|fas 3/i.test(rad) || !/\b(9 ?999|13 ?999|249|449|799)\b/.test(rad), "R2: 0 tjänstepristal");
  P(!/publicera i data\/blogg/.test(rad), "R2: 0 publiceringslöften");

  // korslänkar: nämnda kursprefix i text måste vara registeräkta (egen prefix
  // = giltig — kursen läggs till registret i samma kedja)
  const egenPrefix = slug.split("-")[0];
  const prefix = [...new Set([...rad.matchAll(/\b(km-\d{3}|v\d{2}|ts-\d{2}|pc-\d{2}|rk-\d{2}|se-\d{2}|bf-\d{2}|od-\d{2}|ek-\d{2}|rp-\d{2}|vr-\d{2}|mt-\d{2}|ln-\d{2}|st-\d{2}|mk-\d{2})\b/g)].map((m) => m[1]))];
  const felPrefix = prefix.filter((p) => !slug.startsWith(p + "-") && !slugar.some((s) => s.startsWith(p + "-")));
  P(felPrefix.length === 0, "korslänksprefix registeräkta", prefix.join(",") || "0 länkar");

  // serievakt
  P(!reg[slug], "slug ej redan i registret");
  const serie = slugar.filter((s) => s.startsWith(slug.split("-")[0] + "-")).sort();
  P(serie.length >= 1, "serien existerar (fortsättning)", serie.slice(-3).join(","));

  // aritmetiknärvaro: motorns referensvärden måste stå i texten (svensk decimalform)
  const ARIT = {
    "bf-16-slumpens-serier": ["252", "24,6", "386", "37,7", "2,9", "tretton", "56", "5,5", "112", "10,9", "137 miljoner", "6,6", "7,6", "5,2", "38 procent", "9 procent", "64 procent", "0,39", "256", "18 augusti 1913"],
    "od-08-binomialtradet-och-replikeringen": ["120", "80", "0,5", "39,22", "10,78", "40,00", "0,55", "1,02", "144", "96", "64", "23,73", "12,79", "1,76", "18,04", "9,78", "1,96", "44,12", "5,88", "38,46", "11,54", "43,27", "6,73"],
    "se-21-kemisektorn": ["132", "264", "396", "150", "282", "546", "560", "278", "19,9", "500", "46", "218", "414", "86", "12 000", "18 procent", "2 160", "3 000", "38 procent", "1 140", "34,5", "5 procent", "150 miljoner", "60 miljoner", "146"],
  };
  const saknas = ARIT[slug].filter((s) => !rad.includes(s.toLowerCase()));
  P(saknas.length === 0, "aritmetiknärvaro (motorns värden i texten)", saknas.length ? "saknas: " + saknas.join(",") : ARIT[slug].length + " värden återfunna");
}

console.log("═══ TOTALT: " + pass + " PASS · " + fel + " FEL · " + varn + " VARNING");
process.exit(fel ? 1 : 0);
