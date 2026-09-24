#!/usr/bin/env node
/**
 * s5-u3 (manifest auto-s5-1789932910773, byggare 3/3) — KVD PREKOLL FÖRE insert:
 * rp-07-vantan-i-svansen + ib-06-family-officen + tx-06-fran-siffra-till-kassa.
 * Struktur, aritmetik (oberoende omräknad), juridikgrind (2007:528
 * utbildningsframing, 0 rådsfraser), språkgrind (CJK, typografiska citat,
 * tabbar, dubbelord med åäö-säker lookaround), korslänkar registeräkta,
 * R2 (kraverFas/priser), serievakt.
 *
 * Pedagogisk plattform — inte investeringsråd.
 */
import { readFileSync } from "node:fs";

const ROT = "/home/ak1a/AK1";
const KURSER = [
  "rp-07-vantan-i-svansen",
  "ib-07-family-officen",
  "tx-07-fran-siffra-till-kassa",
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
  rp: {
    cvar95: (12 + 10 + 9 + 8 + 7) / 5, skillnad: (12 + 10 + 9 + 8 + 7) / 5 - 7,
    pIngen: 0.96 ** 2, pEn: 2 * 0.04 * 0.96, pBada: 0.04 ** 2,
    esEn: (0.04 * 100) / 0.05, esTva: (0.0016 * 200 + 0.0484 * 100) / 0.05, esSumma: 2 * 80,
    pIngen3: 0.97 ** 2, pEn3: 2 * 0.03 * 0.97, pBada3: 0.03 ** 2,
    esEn3: (0.03 * 100) / 0.05, esTva3: (0.0009 * 200 + 0.0491 * 100) / 0.05, esSumma3: 2 * 60,
    z95: PhiInv(0.95), svansKonst: (Math.exp(-(PhiInv(0.95) ** 2) / 2) / Math.sqrt(2 * Math.PI)) / 0.05,
    varMon: PhiInv(0.95) * 12 / Math.sqrt(12), cvarMon: ((Math.exp(-(PhiInv(0.95) ** 2) / 2) / Math.sqrt(2 * Math.PI)) / 0.05) * 12 / Math.sqrt(12),
  },
  ib: {
    budget: 1.2 + 1.2 + 0.6, p200: (1.2 + 1.2 + 0.6) / 200, p2000: (1.2 + 1.2 + 0.6) / 2000,
    mfoKostnad: (1.2 + 1.2 + 0.6) / 10, mfoP: ((1.2 + 1.2 + 0.6) / 10) / 200,
    arv: 500 / 3, arvP: (1.2 + 1.2 + 0.6) / (500 / 3),
    utmP400: (1.2 + 1.2 + 0.6) / 400, utmArv: 500 / 4, utmArvP: (1.2 + 1.2 + 0.6) / (500 / 4),
    utmMfo: (1.2 + 1.2 + 0.6) / 12, utmMfoP: ((1.2 + 1.2 + 0.6) / 12) / 200,
  },
  tx: {
    tull: 18 + 12 - 6, cfo: 120 - 18 - 12 + 6 - 10 - 6,
    gradNu: (120 - 18 - 12 + 6 - 10 - 6) / 120, gradFore: 72 / 96, tullKvot: (18 + 12 - 6) / 40,
    ebitdaVaxt: 120 - 96, marginalFore: 96 / 200, marginalNu: 120 / 240,
    dsoFore: (41 / 200) * 365, dsoNu: (59 / 240) * 365, fordVaxt: (59 - 41) / 41,
    dioFore: (30 / 120) * 365, dpoFore: (25 / 120) * 365, dioNu: (42 / 144) * 365, dpoNu: (31 / 144) * 365,
    cccFore: 75 + 91 - 76, cccNu: 90 + 107 - 79, cccDelta: (90 + 107 - 79) - (75 + 91 - 76),
    utmCfo: 150 - 20 - 8 + 4 - 12 - 8, utmGrad: (150 - 20 - 8 + 4 - 12 - 8) / 150,
    utmDso: (74 / 300) * 365, utmCcc: 90 + 95 - 72,
  },
};

console.log("═══ REFERENSVÄRDEN (motorns omräkning)");
console.log("  rp: cvar95 " + ref.rp.cvar95 + " · skillnad " + ref.rp.skillnad + " · P " + ref.rp.pIngen + "/" + ref.rp.pEn + "/" + ref.rp.pBada + " (summa " + (ref.rp.pIngen + ref.rp.pEn + ref.rp.pBada).toFixed(4) + ")");
console.log("  rp: ES 80+80=" + ref.rp.esSumma + " mot " + ref.rp.esTva + " · 3%-varianten " + ref.rp.pIngen3 + "/" + ref.rp.pEn3 + "/" + ref.rp.pBada3 + " ES " + ref.rp.esSumma3 + " mot " + ref.rp.esTva3);
console.log("  rp: z95 " + ref.rp.z95.toFixed(4) + " svanskonstant " + ref.rp.svansKonst.toFixed(2) + " → månads VaR " + ref.rp.varMon.toFixed(2) + " CVaR " + ref.rp.cvarMon.toFixed(2) + " (12/√12=" + (12 / Math.sqrt(12)).toFixed(2) + ")");
console.log("  ib: budget " + ref.ib.budget.toFixed(1) + " · 200 Mkr " + (ref.ib.p200 * 100).toFixed(1) + "% · 2 000 Mkr " + (ref.ib.p2000 * 100).toFixed(2) + "% · MFO " + ref.ib.mfoKostnad.toFixed(1) + " Mkr = " + (ref.ib.mfoP * 100).toFixed(2) + "%");
console.log("  ib: arv 500/3=" + ref.ib.arv.toFixed(1) + " → " + (ref.ib.arvP * 100).toFixed(1) + "%/år · utm " + (ref.ib.utmP400 * 100).toFixed(2) + "% · " + ref.ib.utmArv + " Mkr → " + (ref.ib.utmArvP * 100).toFixed(1) + "% · MFO12 " + ref.ib.utmMfo.toFixed(2) + " = " + (ref.ib.utmMfoP * 100).toFixed(3) + "%");
console.log("  tx: tull " + ref.tx.tull + " · CFO " + ref.tx.cfo + " · konvertering " + ref.tx.gradNu.toFixed(2) + " mot " + ref.tx.gradFore.toFixed(2) + " · tullkvot " + (ref.tx.tullKvot * 100).toFixed(0) + "% · marginaler " + (ref.tx.marginalFore * 100).toFixed(0) + "→" + (ref.tx.marginalNu * 100).toFixed(0));
console.log("  tx: DSO " + ref.tx.dsoFore.toFixed(1) + "→" + ref.tx.dsoNu.toFixed(1) + " · ford.växt " + (ref.tx.fordVaxt * 100).toFixed(0) + "% · DIO " + ref.tx.dioFore.toFixed(1) + "→" + ref.tx.dioNu.toFixed(1) + " · DPO " + ref.tx.dpoFore.toFixed(1) + "→" + ref.tx.dpoNu.toFixed(1));
console.log("  tx: CCC " + ref.tx.cccFore + "→" + ref.tx.cccNu + " (+" + ref.tx.cccDelta + ") · utm CFO " + ref.tx.utmCfo + " konv " + ref.tx.utmGrad.toFixed(2) + " DSO " + ref.tx.utmDso.toFixed(1) + " CCC " + ref.tx.utmCcc);

// ── struktur och textkontroller per kurs ─────────────────────────────────────
const KATEGORI = { "rp-07-vantan-i-svansen": "RISKHANTERING & PORTFÖLJTEORI", "ib-07-family-officen": "PRIVATE EQUITY & INVESTMENTBOLAG", "tx-07-fran-siffra-till-kassa": "TILLVÄXT" };
const NIVA = { "rp-07-vantan-i-svansen": "Avancerad", "ib-07-family-officen": "Intermediär", "tx-07-fran-siffra-till-kassa": "Intermediär" };
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
// Historiska egennamn + etablerade facktermer (dokumenterad vitlista)
const EGENNAMN = new Set(["artzner", "delbaen", "eber", "heath", "rockafellar", "uryasev", "basel", "frtb", "cvar", "family", "office", "sfo", "mfo", "dso", "dio", "dpo", "ccc", "cfo", "ebitda", "mkr", "lp", "arr", "limited", "partner", "sigma", "kvartal"]);
// Ny svensk kursvokabulär (sammansättningar som registret ännu inte bär — första ägare är denna omgång)
const SVNYA = new Set(["familjekontor", "familjekontors", "familjekontoren", "familjekontorets", "familjers", "familjekapitalets", "svansmedel", "svansmedlet", "svansmått", "svansmåttet", "svansmånad", "svansmånader", "svansprotokoll", "svansregister", "svansrum", "svanskontroll", "svanskontot", "svanskonstant", "svansdagar", "femprocentsvans", "konverteringsgrad", "konverteringsgraden", "konverteringens", "konverteringstest", "konverteringstestet", "konverteringsserie", "konverteringsseriens", "konverteringskontroll", "kassakonverteringscykeln", "kassakonverteringscykel", "tull", "tullkvot", "tullen", "tullens", "kvitto", "kvittot", "kvittosteg", "kvittotsteg", "tumregel", "tumregeln", "tumregler", "brytpunkten", "percentil", "percentilens", "percentilgränsen", "konfidens", "konfidensgrad", "konfidensgraden", "konfidensen", "bankirhus", "bankirhusen", "provisionsjakt", "stiftelse", "filantropi", "ursprungsföretag", "institutionell", "institutionella", "simulerade", "simulerad", "fallissemang", "fallissemangs", "fallissemangssannolikhet", "kupong", "artefakt", "subadditivitet", "subadditiviteten", "subadditivitetens", "monotonicitet", "translationsinvarians", "homogenitet", "koherens", "koherent", "koherenta", "koherensaxlar", "koherensaxlarnas", "anticykliskt", "emissionsprospekt", "servett", "netto", "restlöptid", "kapitalgivare", "kapitalgivarsidan", "kapitalgivarna", "kapitalgivarens", "syskonbolag", "holdingbolag", "registerdata", "succession", "ursäkt", "ursäktas", "termometern", "skiljedomare", "etablerad", "vittnesmål", "konvention", "fakturerad", "obetald", "obetalda", "varukostnad", "lagertid", "lagertiden", "lagertidsserie", "lagertidsserien", "abonnemang", "projektbolag", "piedestal", "branschfråga", "grundläsning", "valutasäkring", "kassarad", "kassaraden", "kassakontot", "kassats", "paddan", "andrahandsläsning", "andrahandsläsaren", "framtidsköp", "slirning", "slirar", "slirande", "notering", "mönstret", "årsprov", "balansräknings", "koncernkontorets", "matchningsprincipen", "arbetskapitalet", "arbetskapitalens", "tillväxtkrona", "tillväxtkronan", "marginalökning", "marginalökningen", "leverantörstiden", "betalningstiden", "betalningstidsserie", "betalningstiderna", "betalningstid", "betalningstider", "förskott", "förmögenhet", "arvinge", "arvingar", "arvingarnas", "generationsskifte", "generationsskiftet", "generationsskiften", "generationsskiftets", "största", "ägare", "ägarna", "substansrabatt", "evigt", "evighetskapitalet", "kapital", "fondtak", "kostnadsmatematik", "delandets", "pensionssystem", "logikens", "kontorets", "ruinteori", "optimeringsform", "baselutskottets", "stressvy", "uppkast", "puckeln", "kontrollant", "urskilja", "intas", "enes", "registry", "register"]);

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
  P(d.chapters.every((c, i) => c.num === i + 1 && c.minutes === 4 && c.title === d.chapters_list[i].title && d.chapters_list[i].num === i + 1 && d.chapters_list[i].minutes === 4), "kapitelnummer, 4 min, titelparitet list/kap");
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
  const prefix = [...new Set([...rad.matchAll(/\b(km-\d{3}|v\d{2}|ts-\d{2}|pc-\d{2}|rk-\d{2}|se-\d{2}|bf-\d{2}|od-\d{2}|ek-\d{2}|rp-\d{2}|vr-\d{2}|mt-\d{2}|ln-\d{2}|st-\d{2}|mk-\d{2}|kt-\d{2}|am-\d{2}|ks-\d{2}|ib-\d{2}|pe-\d{2}|tx-\d{2})\b/g)].map((m) => m[1]))];
  const felPrefix = prefix.filter((p) => !slug.startsWith(p + "-") && !slugar.some((s) => s.startsWith(p + "-")));
  P(felPrefix.length === 0, "korslänksprefix registeräkta", prefix.join(",") || "0 länkar");

  // serievakt
  P(!reg[slug], "slug ej redan i registret");
  const serie = slugar.filter((s) => s.startsWith(slug.split("-")[0] + "-")).sort();
  P(serie.length >= 1, "serien existerar (fortsättning)", serie.slice(-3).join(","));

  // aritmetiknärvaro: motorns referensvärden måste stå i texten (svensk decimalform)
  const ARIT = {
    "rp-07-vantan-i-svansen": ["9,2", "46 / 5", "7,0", "2,2", "0,96 i kvadrat = 0,9216", "0,0768", "0,0016", "1,0000", "80", "103,2", "5,16 / 0,05", "0,32 + 4,84", "160", "0,9409", "0,0582", "0,0009", "101,8", "60 + 60 = 120", "5,7", "7,1", "1,645", "2,06", "14,1", "8,4", "6,5", "7,8", "97,5", "minus 7", "minus 12", "minus 10", "0,0484", "0,0491"],
    "ib-07-family-officen": ["1,2 + 1,2 + 0,6 = 3,0", "3,0 delat med 200 = 1,5", "3,0 delat med 2 000 = 0,15", "166,7", "1,8 procent", "0,3 miljoner", "0,75 procent", "2,4 procent", "0,125 procent", "tio familjer", "200 miljoner", "500", "tre arvingar", "0,15 procent på 200 miljoner"],
    "tx-07-fran-siffra-till-kassa": ["18 + 12 − 6 = 24", "120 − 18 − 12 + 6 − 10 − 6 = 80", "80 / 120 = 0,67", "72 / 96 = 0,75", "24 / 40 = 60", "41 / 200 × 365 = 75", "59 / 240 × 365 = 90", "44 procent", "30 / 120 × 365 = 91", "25 / 120 × 365 = 76", "42 / 144 × 365 = 107", "31 / 144 × 365 = 79", "90 + 107 − 79 = 118", "75 + 91 − 76 = 90", "28 dagar", "150 − 20 − 8 + 4 − 12 − 8 = 106", "106 / 150 = 0,71", "74 / 300 × 365 = 90", "90 + 95 − 72 = 113", "200 → 240", "96 → 120"],
  };
  const saknas = ARIT[slug].filter((s) => !rad.includes(s.toLowerCase()));
  P(saknas.length === 0, "aritmetiknärvaro (motorns värden i texten)", saknas.length ? "saknas: " + saknas.join(",") : ARIT[slug].length + " värden återfunna");

  // motorparschema: nyckeltal mot oberoende omräkning (1 decimals tolerans)
  if (slug === "rp-07-vantan-i-svansen") {
    P(Math.round(ref.rp.cvar95 * 10) / 10 === 9.2 && Math.round(ref.rp.skillnad * 10) / 10 === 2.2, "rp: CVaR 9,2 och skillnad 2,2 exakt");
    P(Math.round(ref.rp.pIngen * 10000) / 10000 === 0.9216 && Math.round(ref.rp.pEn * 10000) / 10000 === 0.0768 && Math.round(ref.rp.pBada * 10000) / 10000 === 0.0016, "rp: sannolikheter 0,9216/0,0768/0,0016 exakt");
    P(ref.rp.esEn === 80 && nara(ref.rp.esTva, 103.2) && ref.rp.esSumma === 160, "rp: ES 80/103,2/160 mot motorn");
    P(Math.round(ref.rp.pIngen3 * 10000) / 10000 === 0.9409 && Math.round(ref.rp.pEn3 * 10000) / 10000 === 0.0582 && Math.round(ref.rp.pBada3 * 10000) / 10000 === 0.0009, "rp: 3%-varianten 0,9409/0,0582/0,0009 exakt");
    P(ref.rp.esEn3 === 60 && nara(ref.rp.esTva3, 101.8) && ref.rp.esSumma3 === 120, "rp: 3%-ES 60/101,8/120 mot motorn");
    P(nara(ref.rp.varMon, 5.7) && nara(ref.rp.cvarMon, 7.1) && nara(ref.rp.z95, 1.645, 0.005) && nara(ref.rp.svansKonst, 2.06, 0.005), "rp: normalfallet 5,7/7,1 (z 1,645, konstant 2,06) mot motorn");
  }
  if (slug === "ib-07-family-officen") {
    P(ref.ib.budget === 3 && nara(ref.ib.p200 * 100, 1.5) && nara(ref.ib.p2000 * 100, 0.15, 0.05), "ib: budget 3,0 och andelar 1,5/0,15 procent mot motorn");
    P(ref.ib.mfoKostnad === 0.3 && nara(ref.ib.mfoP * 100, 0.15, 0.05), "ib: MFO 0,3 Mkr = 0,15 procent på 200 Mkr mot motorn");
    P(nara(ref.ib.arv, 166.7) && nara(ref.ib.arvP * 100, 1.8), "ib: arv 166,7 och drift 1,8 procent mot motorn");
    P(nara(ref.ib.utmP400 * 100, 0.75) && ref.ib.utmArv === 125 && nara(ref.ib.utmArvP * 100, 2.4), "ib: utmaning 0,75 procent och 125/2,4 mot motorn");
    P(ref.ib.utmMfo === 0.25 && nara(ref.ib.utmMfoP * 100, 0.125, 0.02), "ib: utmaning MFO 0,25 Mkr = 0,125 procent mot motorn");
  }
  if (slug === "tx-07-fran-siffra-till-kassa") {
    P(ref.tx.tull === 24 && ref.tx.cfo === 80, "tx: tull 24 och CFO 80 exakt");
    P(nara(ref.tx.gradNu, 0.67) && ref.tx.gradFore === 0.75, "tx: konvertering 0,67 mot 0,75 mot motorn");
    P(ref.tx.tullKvot === 0.6 && ref.tx.ebitdaVaxt === 24 && ref.tx.marginalFore === 0.48 && ref.tx.marginalNu === 0.5, "tx: tullkvot 60 procent och marginalökning 24 (48→50) exakt");
    P(nara(ref.tx.dsoFore, 75) && nara(ref.tx.dsoNu, 90) && nara(ref.tx.fordVaxt, 0.44), "tx: DSO 75→90 och ford ringar 44 procent mot motorn");
    P(nara(ref.tx.dioFore, 91) && nara(ref.tx.dpoFore, 76) && nara(ref.tx.dioNu, 107) && nara(ref.tx.dpoNu, 79), "tx: DIO/DPO 91/76 → 107/79 mot motorn");
    P(ref.tx.cccFore === 90 && ref.tx.cccNu === 118 && ref.tx.cccDelta === 28, "tx: CCC 90→118 (+28) exakt");
    P(ref.tx.utmCfo === 106 && nara(ref.tx.utmGrad, 0.71) && nara(ref.tx.utmDso, 90) && ref.tx.utmCcc === 113, "tx: utmaning 106/0,71/90/113 mot motorn");
  }
}

console.log("═══ TOTALT: " + pass + " PASS · " + fel + " FEL · " + varn + " VARNING");
process.exit(fel ? 1 : 0);
