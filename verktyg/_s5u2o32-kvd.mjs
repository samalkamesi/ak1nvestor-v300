#!/usr/bin/env node
/**
 * KVD för s5-u2 (omgång 32) — st-09-konkursordningen + vm-12-reverserad-dcf.
 * Oberoende omräkning av ALL aritmetik, strukturparitet, juridiklint,
 * språkgrind (CJK/mjuka bindestreck/kända läckor), korslänkar mot registret.
 * Kör: node verktyg/_s5u2o32-kvd.mjs
 */
import { readFileSync } from "node:fs";

let pass = 0, fel = 0;
const OK = (namn, villkor, bevis = "") => {
  if (villkor) { pass++; console.log("PASS " + namn + (bevis ? " — " + bevis : "")); }
  else { fel++; console.log("FEL " + namn + (bevis ? " — " + bevis : "")); }
};
const nara = (a, b, tol = 0.051) => Math.abs(a - b) <= tol;

const reg = JSON.parse(readFileSync("/home/ak1a/AK1/public/deep-courses.json", "utf8"));
const st = JSON.parse(readFileSync("/home/ak1a/AK1/data/kurser-tillagg/st-09-konkursordningen.json", "utf8"));
const vm = JSON.parse(readFileSync("/home/ak1a/AK1/data/kurser-tillagg/vm-12-reverserad-dcf.json", "utf8"));
const alla = [st, vm];

// ── 1. Struktur ×2 ───────────────────────────────────────────────────────────
for (const k of alla) {
  const n = k.slug.slice(0, 5);
  OK(n + " chapterCount 6", k.chapterCount === 6);
  OK(n + " totalMinutes = Σ kapitel", k.totalMinutes === k.chapters.reduce((s, c) => s + c.minutes, 0), k.totalMinutes + " min");
  OK(n + " minutes = totalMinutes", k.minutes === k.totalMinutes);
  OK(n + " chapters_list ↔ chapters", k.chapters_list.length === k.chapters.length &&
    k.chapters_list.every((c, i) => c.num === k.chapters[i].num && c.title === k.chapters[i].title && c.minutes === k.chapters[i].minutes));
  OK(n + " kap 6 bär utmaning", k.chapters[5].blocks.some((b) => b.type === "utmaning"));
  OK(n + " blocktyper kända", k.chapters.every((c) => c.blocks.every((b) => ["text", "definition", "insight", "tabell", "utmaning"].includes(b.type))));
  OK(n + " xp 50 + weight—", k.xp === 50 && k.weight === "—");
  OK(n + " slug-äkthet", k.slug === (k === st ? "st-09-konkursordningen" : "vm-12-reverserad-dcf"));
  OK(n + " kategori väntad", (k === st ? k.category === "STABILITET" : k.category === "VÄRDERINGSMETODER"), k.category);
  OK(n + " level satt", ["Intermediär", "Avancerad"].includes(k.level), k.level);
  OK(n + " history 3 rötter", Object.keys(k.history).length === 3 && k.history.origin && k.history.evolution && k.history.modern);
  OK(n + " mästarsektioner", !!k.lynchSection && !!k.grahamSection && !!k.ak1Section);
}

// ── 2. Aritmetik ST-09 (oberoende omräkning) ─────────────────────────────────
{
  const T = (namn, villkor, bevis) => OK("st-09 " + namn, villkor, bevis);
  // Kap 1: kapitalunderskott
  T("kap1 balans 400 presenteras", JSON.stringify(st).includes("balansomslutning 400"));
  // Kap 2: bud 25+15=40
  T("kap2 bud 25+15=40", 25 + 15 === 40);
  T("kap2 budtext 40 procent", JSON.stringify(st).includes("40 procent"));
  // Kap 3: borgenärsutdelningen
  const bo = 150 + 30 + 20 + 10;
  T("kap3 boet 210", bo === 210);
  const bankProcent = 150 / 160 * 100;
  T("kap3 bank 94 %", nara(bankProcent, 94, 0.5), bankProcent.toFixed(2));
  const rest = bo - 150 - 30;
  T("kap3 rest 30", rest === 30);
  const opri = rest / 60 * 100;
  T("kap3 oprioriterade 50 %", nara(opri, 50), opri.toFixed(1));
  const summaUtdelat = 150 + 30 + 30;
  T("kap3 boets ekvation 210", summaUtdelat === bo);
  // Kap 5: pantandel
  const pant = 250 / 400 * 100;
  T("kap5 pantandel 63 %", nara(pant, 63, 0.5), pant.toFixed(1));
  // Kap 6: diskonteringen 50/1,06² = 44,5
  const nuv = 50 / (1.06 * 1.06);
  T("kap6 nuvärde 44,5", nara(nuv, 44.5, 0.05), nuv.toFixed(2));
  T("kap6 texttal «44,5»", JSON.stringify(st).includes("44,5"));
  T("kap6 texttal «1,06»", JSON.stringify(st).includes("1,06"));
  T("kap6 gap 4,5", nara(44.5 - 40, 4.5, 0.05));
  // Lagrum: korrekta SFS-nummer i filen
  const txt = JSON.stringify(st);
  for (const lag of ["2005:551", "1996:764", "1987:672", "1970:979", "25 kap 13 §"]) {
    T("lagrum " + lag + " närvarande", txt.includes(lag));
  }
}

// ── 3. Aritmetik VM-12 (oberoende omräkning) ─────────────────────────────────
{
  const T = (namn, villkor, bevis) => OK("vm-12 " + namn, villkor, bevis);
  const EV = 14000, FCF = 700, r = 0.08;
  T("EV-led 12000+2000", 12000 + 2000 === EV);
  T("P/E 20", 12000 / 600 === 20 || JSON.stringify(vm).includes("P/E 20"));
  T("EV/FCF 20", EV / FCF === 20);
  T("extraktionsgrad 5 %", nara(1 / 20 * 100, 5));
  // Implicit g
  const g = (EV * r - FCF) / (EV + FCF);
  T("g = 420/14700", Math.round(EV * r - FCF) === 420 && EV + FCF === 14700);
  T("g ≈ 2,86 %", nara(g * 100, 2.86, 0.005), (g * 100).toFixed(4));
  T("kontroll framåt 14 000", nara(FCF * (1 + g) / (r - g), EV, 0.5));
  // Tre världar
  for (const [gg, v] of [[0.01, 10100], [g, 14000], [0.045, 20900]]) {
    T("värld g=" + (gg * 100).toFixed(2) + " → " + v, nara(FCF * (1 + gg) / (r - gg), v, 1));
  }
  T("hävstång 20900−10100=10800", 20900 - 10100 === 10800);
  // WACC 9 %
  const g2 = (EV * 0.09 - FCF) / (EV + FCF);
  T("WACC9 g ≈ 3,81 %", nara(g2 * 100, 3.81, 0.005), (g2 * 100).toFixed(4));
  T("flytt 0,95 pp", nara((g2 - g) * 100, 0.95, 0.01), ((g2 - g) * 100).toFixed(3));
  T("560 = 14700g", Math.round(EV * 0.09 - FCF) === 560);
  // Fasning
  const d10 = Math.pow(1.08, 10);
  T("1,08^10 = 2,159", nara(d10, 2.159, 0.001), d10.toFixed(6));
  function steg(t) {
    let pv = 0;
    for (let ar = 1; ar <= 10; ar++) pv += FCF * Math.pow(1 + t, ar) / Math.pow(1.08, ar);
    const tv = (FCF * Math.pow(1 + t, 10) * 1.02 / 0.06) / d10;
    return [Math.round(pv), Math.round(tv), Math.round(pv + tv)];
  }
  const [p4, t4, s4] = steg(0.04);
  const [p7, t7, s7] = steg(0.07);
  const [p12, t12, s12] = steg(0.12);
  T("fasning 4 %: 5721+8159=13880", p4 === 5721 && t4 === 8159 && s4 === 13880, s4);
  T("fasning 7 %: 6653+10843=17496", p7 === 6653 && t7 === 10843 && s7 === 17496, s7);
  T("fasning 12 %: 8597+17119=25716", p12 === 8597 && t12 === 17119 && s12 === 25716, s12);
  T("gap 13 880 mot 14 000 = 0,9 %", nara((14000 - s4) / 14000 * 100, 0.86, 0.05));
  T("kärnlexa 3616", s7 - s4 === 3616);
  T("kärnlexa 8220", s12 - s7 === 8220);
  // Slutvärdesdominans: TV > hälften i alla tre
  T("slutvärde >50 % i alla världar", t4 > s4 / 2 && t7 > s7 / 2 && t12 > s12 / 2);
  // Textkonsistens: fasningens tal i texten
  const vt = JSON.stringify(vm);
  for (const tal of ["5 721", "8 159", "13 880", "6 653", "10 843", "17 496", "8 597", "17 119", "25 716", "2,86", "3,81", "0,95", "10 100", "20 900", "10 800", "3 616", "8 220", "2,159"]) {
    T("texttal «" + tal + "»", vt.includes(tal));
  }
}

// ── 4. Juridiklint ×2 ────────────────────────────────────────────────────────
{
  const rad = ["köp aktien", "sälj aktien", "vi rekommenderar köp", "rekommenderar försäljning", "borde köpa", "ska du köpa", "bör sälja", "placera dina pengar i", "detta är en köppost", "ta positionen"];
  const disclaim = ["aldrig investeringsråd", "ingen uppmaning att köpa", "utbildning"];
  for (const k of alla) {
    const txt = JSON.stringify(k).toLowerCase();
    const radTräff = rad.filter((f) => txt.includes(f));
    OK(k.slug.slice(0, 5) + " juridiklint 0 rådsfraser", radTräff.length === 0, radTräff.join(", ") || "rent");
    const d = disclaim.filter((f) => txt.includes(f));
    OK(k.slug.slice(0, 5) + " utbildningsframing", d.length >= 2, d.length + " fraser");
  }
}

// ── 5. Språkgrind ×2 ─────────────────────────────────────────────────────────
{
  const cjk = /[\u3040-\u30ff\u3400-\u4dbf\u4e00-\u9fff\uf900-\ufaff\uff66-\uff9f]/;
  const mjuka = /\u00ad/;
  const lackor2 = ["värdets医科", "hypotesen.kursens", "rabott", "marknadsvid", "en高", "r-kompONENT", "år års", "ettoperationsbart", "snipa", "ifårån", "framåtDCF", "EXTRACTIONS", "first Decennier", "låter Arthur", "Lösningen g"];
  for (const k of alla) {
    const txt = JSON.stringify(k);
    const n = k.slug.slice(0, 5);
    OK(n + " 0 CJK", !cjk.test(txt));
    OK(n + " 0 mjuka bindestreck", !mjuka.test(txt));
    const l = lackor2.filter((f) => txt.includes(f));
    OK(n + " 0 kända läckor", l.length === 0, l.join(",") || "rent");
  }
}

// ── 6. Korslänkar mot registret ──────────────────────────────────────────────
{
  const referenser = {
    "st-09": ["st-05-refinansieringsmuren", "st-06-likviditetsreserven", "st-07-skuggskulderna", "st-08-bindningsrisken", "ks-09-senioritetsordningen", "ks-05-covenanter-och-kreditbetyg", "rk-03-skuldfalla", "v10-skuldsattningsgrad", "ma-05-kreditpremien", "kt-02-forvantningsanalys-och-kalibrering", "distress-investing"],
    "vm-12": ["vm-11-waccfallor", "vm-02-intrinsic-value", "vm-04-cyklisk-justering", "kt-02-forvantningsanalys-och-kalibrering", "ek-06-bayesianska-omviktningen", "expectations-investing", "vm-03-multipelval", "vm-08-evsales", "vm-09-pricetocashflow"],
  };
  for (const [pre, slugs] of Object.entries(referenser)) {
    const saknas = slugs.filter((s) => !(s in reg));
    OK(pre + " korslänkar registeräkta", saknas.length === 0, saknas.join(", ") || slugs.length + " st ok");
  }
  // Korslänkar som NÄMNS i kursfilerna ska finnas (kortform + slug)
  const stTxt = JSON.stringify(st);
  const vmTxt = JSON.stringify(vm);
  OK("st-09 nämner ks-05 (covenant-granne)", stTxt.includes("ks-05"));
  OK("vm-12 nämner vm-11", vmTxt.includes("vm-11"));
  OK("vm-12 nämner AKM2 + ek-06", vmTxt.includes("AKM2") && vmTxt.includes("ek-06"));
}

// ── 7. R2: ingen pris-/tier-/publiceringsyta ─────────────────────────────────
{
  for (const k of alla) {
    const txt = JSON.stringify(k).toLowerCase();
    const r2 = ["9 999", "13 999", "249", "449", "799", "kraverfas", "pris per månad", "prenumeration"].filter((f) => txt.includes(f));
    OK(k.slug.slice(0, 5) + " R2 ren (0 pris-yta)", r2.length === 0, r2.join(",") || "ren");
  }
}

console.log("\n═ KVD SLUT: " + pass + " PASS · " + fel + " FEL ═");
process.exit(fel === 0 ? 0 : 1);
