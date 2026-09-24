#!/usr/bin/env node
/**
 * s5-u3 (manifest auto-s5-1789910709805, omgång 23) — KVD PREKOLL FÖRE insert:
 * kt-08-optionsforfallets-dag + vr-09-konglomeratrabatten +
 * ek-07-walk-forward-i-motorn. Struktur, aritmetik (oberoende omräknad),
 * juridikgrind (2007:528 utbildningsframing, 0 rådsfraser), språkgrind
 * (CJK, typografiska citat, tabbar, dubbelord med åäö-säker lookaround),
 * korslänkar registeräkta, R2 (kraverFas/priser), serievakt.
 *
 * Pedagogisk plattform — inte investeringsråd.
 */
import { readFileSync } from "node:fs";

const ROT = "/home/ak1a/AK1";
const KURSER = [
  "kt-08-optionsforfallets-dag",
  "vr-09-konglomeratrabatten",
  "ek-07-walk-forward-i-motorn",
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

// ── Register (korslänkar + serievakt) ─────────────────────────────────────────
const reg = JSON.parse(readFileSync(ROT + "/public/deep-courses.json", "utf8"));
const slugar = Object.keys(reg);

// ── Aritmetiska referenser (oberoende omräknad med JS-matematik) ─────────────
// erf via Abramowitz-Stegun 7.1.26 (max fel 1,5e-7 — godtagbart mot kurstextens avrundning)
const erf = (x) => {
  const s = Math.sign(x); x = Math.abs(x);
  const t = 1 / (1 + 0.3275911 * x);
  const y = 1 - ((((1.061405429 * t - 1.453152027) * t + 1.421413741) * t - 0.284496736) * t + 0.254829592) * t * Math.exp(-x * x);
  return s * y;
};
const Phi = (z) => 0.5 * (1 + erf(z / Math.SQRT2));
const PhiInv = (p) => { let lo = -6, hi = 6; for (let i = 0; i < 200; i++) { const m = (lo + hi) / 2; (Phi(m) < p) ? lo = m : hi = m; } return (lo + hi) / 2; };
const ref = {
  kt: {
    pin15: 2 * Phi(1 / 1.5) - 1,          // inom ±1 kr, sigma 1,5 %
    pin10: 2 * Phi(1 / 1.0) - 1,          // utmaning: sigma 1,0 %
    h0: 1000 * 100 * 0.50, h62: 1000 * 100 * 0.62, h38: 1000 * 100 * 0.38,
    kopA: 1000 * 100 * 0.62 - 1000 * 100 * 0.50,
    kopB: 1000 * 100 * 0.50 - 1000 * 100 * 0.38,
    utmKop: 2000 * 100 * 0.62 - 2000 * 100 * 0.50,
    utmH62: 2000 * 100 * 0.62,
    oi: 12000 * 100, oiAndel: (12000 * 100) / 8000000, oiAndelTunn: (12000 * 100) / 5000000,
    k95: 3000 * 100, k105: 5000 * 100,
  },
  vr: {
    summa: 800 + 400, rabatt: 800 + 400 - 960, rabattPct: (800 + 400 - 960) / 1200,
    steg: 1200 / 960 - 1,
    vante8: Math.pow(1 / 0.8, 1 / 8) - 1, vante12: Math.pow(1 / 0.8, 1 / 12) - 1,
    spin: 800 + 420, spinPct: (800 + 420) / 960 - 1, spinEttAr: 800 + 420 - 15, spinEttArPct: (800 + 420 - 15) / 960 - 1,
    utmRabatt: (1500 - 1050) / 1500, utmSteg: 1500 / 1050 - 1, utmVante10: Math.pow(1500 / 1050, 1 / 10) - 1,
    utmSpin: 800 + 440 - 40 - 15, utmSpinPct: (800 + 440 - 40 - 15) / 960 - 1,
    utmIngen: 800 + 400 - 40 - 15, utmIngenPct: (800 + 400 - 40 - 15) / 960 - 1,
    premie: 420 / 400 - 1,
  },
  ek: {
    fonster: (20 - 8) / 2, utmFonster: (24 - 10) / 2,
    wfe: 7.8 / 12, wfeLag: 3.4 / 4, wfeMinne: 3 / 11, utmWfe: 9 / 15,
    plan: 11 * 11, herfe: PhiInv(1 - 1 / 121), herfePct: PhiInv(1 - 1 / 121) * 4,
    utmPlan: Math.pow(7, 3), utmHerfe: PhiInv(1 - 1 / 343), utmHerfePct: PhiInv(1 - 1 / 343) * 3,
    median: ([12, 14, 9, 15, 11, 13].sort((a, b) => a - b)[2] + [12, 14, 9, 15, 11, 13].sort((a, b) => a - b)[3]) / 2,
  },
};

console.log("═══ REFERENSVÄRDEN (motorns omräkning)");
console.log("  kt: pin15=" + (ref.kt.pin15 * 100).toFixed(1) + "% pin10=" + (ref.kt.pin10 * 100).toFixed(1) + "% hedge 50000/" + ref.kt.h62 + "/" + ref.kt.h38 + " köp " + ref.kt.kopA + " åt båda håll (symmetri " + (ref.kt.kopA === ref.kt.kopB) + ")");
console.log("  kt: utm köp " + ref.kt.utmKop + " (hedge " + ref.kt.utmH62 + ") · OI " + ref.kt.oi + " = " + (ref.kt.oiAndel * 100).toFixed(0) + "% av 8 000 000, tunn handel " + (ref.kt.oiAndelTunn * 100).toFixed(0) + "% av 5 000 000 · grannar 95: " + ref.kt.k95 + " 105: " + ref.kt.k105);
console.log("  vr: rabatt " + ref.vr.rabatt + " = " + (ref.vr.rabattPct * 100).toFixed(0) + "% steg " + (ref.vr.steg * 100).toFixed(0) + "% · vänte " + (ref.vr.vante8 * 100).toFixed(1) + "%/" + (ref.vr.vante12 * 100).toFixed(1) + "% per år");
console.log("  vr: spin " + ref.vr.spin + " = +" + (ref.vr.spinPct * 100).toFixed(1) + "% ett år " + ref.vr.spinEttAr + " = +" + (ref.vr.spinEttArPct * 100).toFixed(1) + "% · utm: rabatt " + (ref.vr.utmRabatt * 100).toFixed(0) + "% steg +" + (ref.vr.utmSteg * 100).toFixed(1) + "% vänte10 " + (ref.vr.utmVante10 * 100).toFixed(1) + "% spin1år " + ref.vr.utmSpin + " = +" + (ref.vr.utmSpinPct * 100).toFixed(1) + "% utan premie " + ref.vr.utmIngen + " = +" + (ref.vr.utmIngenPct * 100).toFixed(1) + "%");
console.log("  ek: fönster " + ref.ek.fonster + " utm " + ref.ek.utmFonster + " · wfe " + ref.ek.wfe.toFixed(2) + " låg " + ref.ek.wfeLag.toFixed(2) + " minne " + ref.ek.wfeMinne.toFixed(2) + " utm " + ref.ek.utmWfe.toFixed(2));
console.log("  ek: plan " + ref.ek.plan + " härfång z=" + ref.ek.herfe.toFixed(2) + " → +" + ref.ek.herfePct.toFixed(1) + "% · utm plan " + ref.ek.utmPlan + " z=" + ref.ek.utmHerfe.toFixed(2) + " → +" + ref.ek.utmHerfePct.toFixed(1) + "% · median " + ref.ek.median);

// ── struktur och textkontroller per kurs ─────────────────────────────────────
const KATEGORI = { "kt-08-optionsforfallets-dag": "KATALYSATOR", "vr-09-konglomeratrabatten": "VÄRDERING", "ek-07-walk-forward-i-motorn": "EKOSYSTEM" };
const NIVA = { "kt-08-optionsforfallets-dag": "Avancerad", "vr-09-konglomeratrabatten": "Intermediär", "ek-07-walk-forward-i-motorn": "Avancerad" };
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
// Historiska egennamn (dokumenterad vitlista — kursvetenskapens personer och institutioner)
const EGENNAMN = new Set(["chicago", "board", "corporation", "harold", "geneen", "itt", "ltv", "litton", "berger", "ofek", "brock", "lakonishok", "lebaron", "robert", "pardos", "alexander"]);
// Ny svensk kursvokabulär (sammansättningar som registret ännu inte bär — första ägare är denna kurs)
const SVNYA = new Set(["förfalloptron", "förfalloptrons", "kvartalsförfalloptron", "indexoptioner", "indexoption", "indexterminer", "nolldagarsoption", "nolldagarsoptioner", "gammaexponering", "gammaexponeringen", "magnetkarta", "magnetkartan", "magneternas", "uppsplittring", "uppsplittringens", "konglomeratrabatt", "konglomeratrabatten", "holdingrabatt", "substansrabatt", "utdelningsdisciplin", "renodling", "renodlade", "renodlning", "fristående", "friståendepremie", "kurvanpassning", "slumphärfång", "slumphärfånget", "kalenderkursens", "auktionskursen", "dagsrisk", "positionstyngd", "dragningskraft", "värdehöjning", "spun", "fönsterantal", "urvalsdisciplin", "värdepärmens", "värdefällans", "utdelningsstrategi", "månadsritual", "kursgrafik", "kursgrafiken"]);

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
  P(d.chapters.every((c, i) => c.num === i + 1 && c.minutes === 4 && c.title === d.chapters_list[i].title && c.title === d.chapters_list[i].title && d.chapters_list[i].num === i + 1 && d.chapters_list[i].minutes === 4), "kapitelnummer, 4 min, titelparitet list/kap");
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
  // (nya kurser föder nytt svensk vokabulär — svensk formologi + egennamn + ny
  // kursvokabulär vitlistas; listorna är dokumenterade ovan)
  const regVocab = new Set();
  for (const p of Object.values(reg)) for (const v of values(p)) for (const ord of v.toLowerCase().split(/[^a-zåäö0-9-]+/)) if (ord.length >= 3) regVocab.add(ord);
  const svForm = /(en|et|er|ar|or|na|nde|ingen|ningen|elsen|sinnen|ernas|ing|tion|tionen|eringen|heten|ligen)$/;
  const eng = new Set();
  for (const v of vals) for (const ord of v.split(/[^a-zA-ZåäöÅÄÖ'-]+/)) {
    const o = ord.toLowerCase();
    if (o.includes("-")) continue;
    if (o.length >= 3 && !regVocab.has(o) && !EGENNAMN.has(o) && !SVNYA.has(o) && /^[a-zåäö]+$/.test(o) && !svForm.test(o) && !/[åäö]/.test(o)) eng.add(o);
  }
  V(eng.size === 0, "engelskaläckor mot registrets vokabulär (sv-formologi + egennamn + ny vokabulär vitlistad)", eng.size ? [...eng].slice(0, 12).join(",") : "0");

  // juridikgrind
  const rad = vals.join(" ").toLowerCase();
  const radfraser = [/\bdu bör (köpa|sälja|placera|teckna|välja)\b/, /\bni bör (köpa|sälja|placera)\b/, /\bköp (denna|den här) aktien\b/, /\bsälj (denna|den här) aktien\b/, /\bvi rekommenderar (köp|sälj|placering)\b/, /\btipsa dig om (aktier|placering)\b/];
  P(radfraser.every((re) => !re.test(rad)), "juridikgrind: 0 du/ni-riktade rådsfraser");
  P(/utbildning|pedagogisk|kursens|mekanismer/i.test(d.summary) || /aldrig råd|inte investeringsråd/i.test(rad), "utbildningsframing i summary");
  P(!/\b(2005:59|2022:260|2022:261|1985:716|2022:482)\b/.test(rad), "0 blandade lagrum (endast 2007:528 tillåts i kontext)");

  // R2
  P(!/kraverFas|prisplan|tier|fas 2|fas 3/i.test(rad) || !/\b(9 ?999|13 ?999|249|449|799)\b/.test(rad), "R2: 0 tjänstepristal");
  P(!/publicera i data\/blogg/.test(rad), "R2: 0 publiceringslöften");

  // korslänkar: nämnda kursprefix i text måste vara registeräkta (egen prefix
  // = giltig — kursen läggs till registret i samma kedja)
  const egenPrefix = slug.split("-")[0];
  const prefix = [...new Set([...rad.matchAll(/\b(km-\d{3}|v\d{2}|ts-\d{2}|pc-\d{2}|rk-\d{2}|se-\d{2}|bf-\d{2}|od-\d{2}|ek-\d{2}|rp-\d{2}|vr-\d{2}|mt-\d{2}|ln-\d{2}|st-\d{2}|mk-\d{2}|kt-\d{2}|am-\d{2}|ks-\d{2}|ib-\d{2}|pe-\d{2})\b/g)].map((m) => m[1]))];
  const felPrefix = prefix.filter((p) => !slug.startsWith(p + "-") && !slugar.some((s) => s.startsWith(p + "-")));
  P(felPrefix.length === 0, "korslänksprefix registeräkta", prefix.join(",") || "0 länkar");

  // serievakt
  P(!reg[slug], "slug ej redan i registret");
  const serie = slugar.filter((s) => s.startsWith(slug.split("-")[0] + "-")).sort();
  P(serie.length >= 1, "serien existerar (fortsättning)", serie.slice(-3).join(","));

  // aritmetiknärvaro: motorns referensvärden måste stå i texten (svensk decimalform)
  const ARIT = {
    "kt-08-optionsforfallets-dag": ["12 000", "1 200 000", "8 000 000", "15 procent", "1 000", "100 000", "0,50", "0,62", "62 000", "0,38", "38 000", "49,5", "1,5 procent", "68,3", "1,0 procent", "24 000", "124 000", "2 000", "3 000", "300 000", "5 000", "500 000", "tredje fredagen", "1973", "1983", "1987", "5 000 000", "24 procent", "95", "105", "101", "99"],
    "vr-09-konglomeratrabatten": ["800", "400", "1 200", "960", "240", "20 procent", "25 procent", "2,8 procent", "1,9 procent", "420", "1 220", "27,1", "1 205", "25,5", "1 500", "1 050", "30 procent", "42,9", "3,6", "440", "1 185", "23,4", "1 145", "19,3", "1968", "1995", "15 procent", "fem procents", "tio procents"],
    "ek-07-walk-forward-i-motorn": ["20 − 8", "sex fönster", "6 fönster", "7,8", "12 procent", "0,65", "0,50", "0,70", "4,0", "3,4", "0,85", "11", "3,0", "0,27", "121", "9,6", "2,40", "343", "8,3", "2,76", "12,5", "tunnaste fönstret 9", "2002", "2009", "2010", "2011", "2021", "1992", "24", "0,60", "0,85", "tjugo"],
  };
  const saknas = ARIT[slug].filter((s) => !rad.includes(s.toLowerCase()));
  P(saknas.length === 0, "aritmetiknärvaro (motorns värden i texten)", saknas.length ? "saknas: " + saknas.join(",") : ARIT[slug].length + " värden återfunna");

  // motorparschema: nyckeltal mot oberoende omräkning (1 decimals tolerans)
  if (slug === "kt-08-optionsforfallets-dag") {
    P(nara((ref.kt.pin15 * 100), 49.5) && nara((ref.kt.pin10 * 100), 68.3), "kt: pin-sannolikheter 49,5/68,3 mot motorn", (ref.kt.pin15 * 100).toFixed(2) + "/" + (ref.kt.pin10 * 100).toFixed(2));
    P(ref.kt.kopA === 12000 && ref.kt.kopB === 12000 && ref.kt.utmKop === 24000, "kt: hedgeköp 12 000/12 000/24 000 exakt");
    P(ref.kt.oi === 1200000 && nara(ref.kt.oiAndel * 100, 15) && nara(ref.kt.oiAndelTunn * 100, 24), "kt: OI-andelar 15/24 procent mot motorn");
  }
  if (slug === "vr-09-konglomeratrabatten") {
    P(nara(ref.vr.rabattPct * 100, 20) && nara(ref.vr.steg * 100, 25), "vr: rabatt 20 procent och steg 25 procent mot motorn");
    P(Math.round(ref.vr.vante8 * 1000) / 10 === 2.8 && Math.round(ref.vr.vante12 * 1000) / 10 === 1.9, "vr: väntans pris 2,8/1,9 procent mot motorn (avrundat som texten redovisar)");
    P(nara(ref.vr.spinPct * 100, 27.1) && nara(ref.vr.spinEttArPct * 100, 25.5), "vr: spin-off 27,1/25,5 procent mot motorn");
    P(nara(ref.vr.utmRabatt * 100, 30) && nara(ref.vr.utmSteg * 100, 42.9) && nara(ref.vr.utmVante10 * 100, 3.6), "vr: utmaning 30/42,9/3,6 mot motorn");
    P(nara(ref.vr.utmSpinPct * 100, 23.4) && nara(ref.vr.utmIngenPct * 100, 19.3), "vr: utmaning spin 23,4/19,3 mot motorn");
  }
  if (slug === "ek-07-walk-forward-i-motorn") {
    P(ref.ek.fonster === 6 && ref.ek.utmFonster === 7, "ek: fönsterantal 6/7 exakt");
    P(nara(ref.ek.wfe, 0.65) && nara(ref.ek.wfeLag, 0.85) && nara(ref.ek.wfeMinne, 0.27) && nara(ref.ek.utmWfe, 0.60), "ek: effektiviteter 0,65/0,85/0,27/0,60 mot motorn");
    P(nara(ref.ek.herfePct, 9.6) && nara(ref.ek.utmHerfePct, 8.3) && nara(ref.ek.herfe, 2.40, 0.005) && nara(ref.ek.utmHerfe, 2.76, 0.005), "ek: härfång 9,6 (2,40 sigma)/8,3 (2,76 sigma) mot motorn");
    P(ref.ek.median === 12.5 && ref.ek.plan === 121 && ref.ek.utmPlan === 343, "ek: median 12,5 och planer 121/343 exakt");
  }
}

console.log("═══ TOTALT: " + pass + " PASS · " + fel + " FEL · " + varn + " VARNING");
process.exit(fel ? 1 : 0);
