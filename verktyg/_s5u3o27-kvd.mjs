#!/usr/bin/env node
/**
 * s5-u3 (manifest auto-s5-1790027118738, omgång 27, byggare 3/3) — KVD:
 * ln-06-underhallscapex · ks-09-senioritetsordningen · od-11-ranteswapen.
 * Struktur · serie · grannar · sondbelägg · aritmetik (maskinell) · korslänkar
 * · blockkonvention · språkgrind · juridik · R2 · syskonvakt.
 *
 * Pedagogisk plattform — inte investeringsråd.
 */
import { readFileSync } from "node:fs";

const ROT = "/home/ak1a/AK1";
const reg = JSON.parse(readFileSync(ROT + "/public/deep-courses.json", "utf8"));
const regN = Object.keys(reg).length;

let PASS = 0, FEL = 0, VARNING = 0;
const ok = (v, namn, detalj = "") => {
  if (v) { PASS++; console.log("  PASS " + namn + (detalj ? " — " + detalj : "")); }
  else { FEL++; console.log("  FEL  " + namn + (detalj ? " — " + detalj : "")); }
};
const nj = (a, b, tol, namn) => {
  const d = Math.abs(a - b);
  ok(d <= tol, namn, "beräknat " + (Math.round(a * 10000) / 10000) + " mot kursens " + b + " (diff " + (Math.round(d * 10000) / 10000) + ")");
};
const las = (p) => JSON.parse(readFileSync(ROT + "/data/kurser-tillagg/" + p + ".json", "utf8"));

console.log("KVD s5-u3 o27 — registerläge " + regN + " (syskon: u1 ma-09, u2 roic-06+st-08 landade; mina tre på plats)");

const ln = las("ln-06-underhallscapex");
const ks = las("ks-09-senioritetsordningen");
const od = las("od-11-ranteswapen");

// ── 1. Strukturella vakter ───────────────────────────────────────────────────
console.log("\n── Struktur (18 fält, 6 kap à 4 min, block, slug, nivå)");
for (const [namn, c, kat] of [["ln-06", ln, "LÖNSAMHET"], ["ks-09", ks, "KAPITALSTRUKTUR"], ["od-11", od, "OPTIONS & DERIVAT"]]) {
  ok(Object.keys(c).length === 18, namn + ": 18 fält", Object.keys(c).length + " st");
  ok(c.category === kat, namn + ": kategori " + kat);
  ok(c.chapters.length === 6 && c.chapters_list.length === 6, namn + ": 6 kapitel");
  ok(c.chapters.every((k) => k.minutes === 4 && k.intro && Array.isArray(k.blocks) && k.blocks.length >= 2), namn + ": varje kap 4 min + intro + minst 2 block");
  ok(c.chapters.reduce((s, k) => s + k.minutes, 0) === c.totalMinutes && c.totalMinutes === 24, namn + ": minsumma 24 = totalMinutes");
  ok(c.chapters_list.every((l, i) => l.title === c.chapters[i].title && l.num === c.chapters[i].num), namn + ": chapters_list speglar chapters");
  ok(/^[a-z0-9][a-z0-9-]*$/.test(c.slug), namn + ": slug ren ASCII");
  ok(["Nybörjare", "Intermediär", "Avancerad"].includes(c.level), namn + ": nivå giltig (" + c.level + ")");
  ok(c.xp === 50, namn + ": xp 50");
  ok(!JSON.stringify(c).includes("­"), namn + ": inga mjuka bindestreck");
  ok(c.why.length > 900 && c.learn.length > 1000 && c.summary.length > 1200, namn + ": why/learn/summary-längd", "why " + c.why.length + " · learn " + c.learn.length + " · summary " + c.summary.length);
  ok(Object.keys(c.history).join(",") === "origin,evolution,modern" && Object.values(c.history).every((t) => t.length > 200), namn + ": history origin+evolution+modern");
  ok(c.lynchSection.length > 450 && c.grahamSection.length > 450 && c.ak1Section.length > 400, namn + ": tre mästarsektioner", "lynch " + c.lynchSection.length + " · graham " + c.grahamSection.length + " · ak1 " + c.ak1Section.length);
  const juridik = (c.summary + " " + c.chapters[c.chapters.length - 1].blocks[0].content).toLowerCase();
  ok(/placeringsråd|utbildning om (mekanismer|strukturer|instrument|metoder|metod)|aldrig (placerings)?råd/.test(juridik), namn + ": utbildningsframing närvarande");
  ok(!/köp denna|sälj denna|bör du köpa|rekommenderar köp/i.test(JSON.stringify(c)), namn + ": inga rådsformuleringar");
  ok(!/kraverFas|13999|9999|449 kr|799 kr/i.test(JSON.stringify(c)), namn + ": R2 ren (inga pris-/tier-ytor)");
}

// ── 2. Blockkonvention ────────────────────────────────────────────────────────
console.log("\n── Blockkonvention");
for (const [namn, c] of [["ln-06", ln], ["ks-09", ks], ["od-11", od]]) {
  for (const k of c.chapters) {
    const typer = k.blocks.map((b) => b.type).join("+");
    const vantad = k.num === 6 ? "text+utmaning+insight" : k.num === 1 ? /^text\+(definition|tabell)\+insight$/.test(typer) ? typer : null : "text+tabell+insight";
    ok(!!vantad && typer === vantad, namn + " kap " + k.num + ": " + typer);
    ok(k.blocks.every((b) => typeof b.content === "string" && b.content.length > 40), namn + " kap " + k.num + ": alla block bär innehåll");
  }
}

// ── 3. Seriekontroll ─────────────────────────────────────────────────────────
console.log("\n── Serieordning (mina tre i registret efter föregångare)");
for (const [ny, fore] of [["ln-06-underhallscapex", "ln-05-vad-ar-lonsamhet"], ["ks-09-senioritetsordningen", "ks-08-valutasakringen"], ["od-11-ranteswapen", "od-10-kreditderivatet"]]) {
  ok(!!reg[ny], ny + " i registret");
  ok(!!reg[fore], "föregångare " + fore + " i registret");
  ok(Object.keys(reg).indexOf(fore) < Object.keys(reg).indexOf(ny), fore + " < " + ny + " i kartordning");
}
const lnN = Object.keys(reg).filter((s) => s.startsWith("ln-")).length;
const ksN = Object.keys(reg).filter((s) => s.startsWith("ks-")).length;
const odN = Object.keys(reg).filter((s) => s.startsWith("od-")).length;
ok(lnN === 6 && ksN === 9 && odN === 11, "familjelängd ln 6 / ks 9 / od 11", lnN + "/" + ksN + "/" + odN);
ok(ln.level === "Intermediär" && ks.level === "Intermediär" && od.level === "Avancerad", "nivåval (ln/ks Intermediär, od Avancerad)");

// ── 4. Grannexistens ──────────────────────────────────────────────────────────
console.log("\n── Grannexistens (refererade kurser finns i registret)");
const grannar = {
  "ln-06": ["km-003-kassaflodesanalysen", "v19-kapitalforbranning", "ks-02-kapitalallokering", "ln-02-resultatkvalitet-och-accruals", "v08-ebitda-marginal", "ln-01-dupont-analysen", "ln-03-marginaltrappan-och-operativ-havstavng", "ln-04-kapitalbindning-och-rorelsekapital", "ln-05-vad-ar-lonsamhet", "bk-05-redovisningspolitiken", "km-028-reverse-dcf", "rs-08-modellrisken", "tx-03-nar-skapar-tillvaxt-varde", "tx-07-fran-siffra-till-kassa", "se-20-gruv-och-metallsektorn", "se-18-rederi-och-shipping", "vr-05-pris-och-varde", "km-006-kvartalsrapporten", "st-07-skuggskulderna", "ek-04-backtestens-hantverk"],
  "ks-09": ["rk-03-skuldfalla", "st-03-altman-z-score", "ks-05-covenanter-och-kreditbetyg", "od-10-kreditderivatet", "st-07-skuggskulderna", "ks-01-kapitalstruktur-grunder", "ks-02-kapitalallokering", "ks-03-skuldens-anatomi", "ks-04-emissionens-mekanik", "ks-06-konvertibler-och-hybridkapital", "ks-07-kapitalstrukturens-avvagning", "ks-08-valutasakringen", "ma-05-kreditpremien", "rs-04-riskmatrisen", "st-05-refinansieringsmuren", "vr-05-pris-och-varde"],
  "od-11": ["ks-03-skuldens-anatomi", "ks-04-emissionens-mekanik", "rk-16-kontrahentrisken", "ma-05-kreditpremien", "rk-08-ranterisk", "ks-08-valutasakringen", "od-07-terminskontraktet", "od-10-kreditderivatet", "ma-03-realrantan", "mk-04-statsobligationer", "ks-07-kapitalstrukturens-avvagning", "bf-04-investera-som-en-robot", "rs-04-riskmatrisen", "od-02-implicit-volatilitet", "st-08-bindningsrisken"],
};
for (const [namn, slugs] of Object.entries(grannar)) {
  for (const s of slugs) ok(!!reg[s], namn + " → granne finns: " + s);
}

// ── 5. Sondbelägg (why-rädernas 0-påståenden mot registret minus mina tre) ────
console.log("\n── Sondbelägg (0-påståenden mot registret utan mina tre)");
const MINA = ["ln-06-underhallscapex", "ks-09-senioritetsordningen", "od-11-ranteswapen"];
const regUtan = {};
for (const [k, v] of Object.entries(reg)) if (!MINA.includes(k)) regUtan[k] = v;
const arKurs = (s) => /^[a-z]{1,6}-\d{1,3}-/.test(s);
const kursAgare = (term) => Object.entries(regUtan).filter(([s, v]) => arKurs(s) && JSON.stringify(v).toLowerCase().includes(term.toLowerCase())).map(([s]) => s);
for (const term of ["underhållscapex", "underhållskapex", "tillväxtcapex"]) ok(kursAgare(term).length === 0, "ln-06: «" + term + "» 0 kursägare (endast böcker)", kursAgare(term).join(",") || "0");
for (const term of ["senioritet", "prioritetsordning", "efterställd", "subordination"]) ok(kursAgare(term).length === 0, "ks-09: «" + term + "» 0 kursägare (endast böcker)", kursAgare(term).join(",") || "0");
ok(kursAgare("swapkurvan").every((s) => s === "st-08-bindningsrisken"), "od-11: «swapkurvan» endast hos st-08 (uttrycklig överlåtelse: «ägs av derivatfamiljens kurser»)", kursAgare("swapkurvan").join(",") || "0");
const rswap = kursAgare("ränteswap");
ok(rswap.every((s) => ["rk-08-ranterisk", "mk-04-statsobligationer", "st-05-refinansieringsmuren", "st-08-bindningsrisken"].includes(s)), "od-11: «ränteswap» endast förbifart + st-08:s låntagarvy (dokumenterad gräns)", rswap.join(",") || "0");
const st08 = regUtan["st-08-bindningsrisken"] ? JSON.stringify(regUtan["st-08-bindningsrisken"]) : "";
ok(st08.includes("derivatfamiljens kurser"), "od-11: st-08:s överlåtelseformulering finns i registret (gränsen ömsesidigt dokumenterad)");
const oktInne = JSON.stringify(regUtan).toLowerCase();
ok(oktInne.includes("duration"), "od-11: duration finns hos granne (rk-08) — gränssnitt dokumenterat");
ok(oktInne.includes("covenant"), "ks-09: covenant finns hos granne (ks-05) — gränssnitt dokumenterat");

// ── 6. Aritmetik ln-06 ───────────────────────────────────────────────────────
console.log("\n── Aritmetik ln-06 (marginalerna, tre vägarna, kvoten, fällan)");
nj(204 / 1200, 0.17, 0.0005, "EBITDA-marginal 204/1 200 = 17,0 %");
nj(720 / 12, 60, 0.001, "maskiner 720 ÷ 12 = 60");
nj(480 / 40, 12, 0.001, "byggnader 480 ÷ 40 = 12");
nj(60 + 12, 72, 0.001, "avskrivningar 60 + 12 = 72");
nj(132 - 60, 72, 0.001, "capex 132 − hall 60 = underhåll 72");
nj(204 - 132, 72, 0.001, "naiv FCF 204 − 132 = 72");
nj(204 - 72, 132, 0.001, "kassaöra exakt 204 − 72 = 132");
nj(204 - 75, 129, 0.001, "kassaöra arbetsnummer 204 − 75 = 129");
nj(132 - 75, 57, 0.001, "tillväxtens pris 132 − 75 = 57");
nj(129 / 1200, 0.108, 0.0006, "kassaöre-marginal arbetsnr 129/1 200 = 10,8 % (avrundning 10,75 → 10,8)");
nj(132 / 1200, 0.11, 0.0005, "kassaöre-marginal exakt 132/1 200 = 11,0 %");
nj([74, 77, 78, 81, 132].sort((a, b) => a - b)[2], 78, 0.001, "femårshistorik median 78");
nj(0.060 * 1200, 72, 0.001, "nyckeltal 6,0 % × 1 200 = 72");
nj(132 / 72, 1.83, 0.005, "kvot hallår 132/72 = 1,83");
nj(78 / 72, 1.08, 0.005, "kvot median 78/72 = 1,08");
nj(72 / 132 * 100, 54.5, 0.05, "underhållsandel 72/132 = 54,5 %");
nj(72 - 40, 32, 0.001, "nettotapp 72 − 40 = 32 per år");
nj(5 * 32, 160, 0.001, "fem års tapp 5 × 32 = 160");
nj(1200 - 160, 1040, 0.001, "substans 1 200 − 160 = 1 040");
nj(17.0 - 6.0, 11.0, 0.001, "jämförelse A: 17,0 − 6,0 = 11,0");
nj(17.0 - 2.0, 15.0, 0.001, "jämförelse B: 17,0 − 2,0 = 15,0");
nj(300 - 90, 210, 0.001, "utmaning f1 kassaöra 300 − 90 = 210");
nj(150 / 90, 1.67, 0.005, "utmaning f1 kvot 150/90 = 1,67");
nj(90 - 45, 45, 0.001, "utmaning f2 tapp 90 − 45 = 45");
nj(45 / 90, 0.50, 0.005, "utmaning f2 kvot 0,50");
nj(0.050 * 2000, 100, 0.001, "utmaning f3 underhåll 5,0 % × 2 000 = 100");
nj(260 - 100, 160, 0.001, "utmaning f3 kassaöra 260 − 100 = 160");
nj(160 / 2000, 0.08, 0.0005, "utmaning f3 marginal 160/2 000 = 8,0 %");

// ── 7. Aritmetik ks-09 ───────────────────────────────────────────────────────
console.log("\n── Aritmetik ks-09 (realisationen, trappan, återvinningen, yield)");
nj(420 * 0.61, 256.2, 0.05, "pantrealisation 420 × 0,61 = 256,2");
nj(380 * 0.35, 133.0, 0.05, "opant realisation 380 × 0,35 = 133,0");
nj(256.2 + 133.0, 389.2, 0.05, "realiserat totalt 389,2");
nj(389.2 / 800, 0.487, 0.0006, "återvinning på bok 389,2/800 = 48,7 % (avrundning 48,65 → 48,7)");
nj(389.2 - 12.0, 377.2, 0.05, "fördelningsbart 389,2 − 12 = 377,2");
nj(380 - 256.2, 123.8, 0.05, "bankens restfordran 380 − 256,2 = 123,8");
nj(30 + 12, 42, 0.001, "förmånsrätt 30 + 12 = 42");
nj(133.0 - 12.0 - 42, 79.0, 0.05, "pro rata-pott 133,0 − 12,0 − 42 = 79,0");
nj(123.8 + 150 + 90 + 18, 381.8, 0.05, "osäkrade 123,8 + 150 + 90 + 18 = 381,8");
nj(79.0 / 381.8, 0.207, 0.0005, "utdelningskvot 79,0/381,8 = 20,7 %");
nj(123.8 * 0.207, 25.6, 0.05, "bankens pro rata-andel 123,8 × 0,207 = 25,6");
nj(256.2 + 25.6, 281.8, 0.05, "bankens total 256,2 + 25,6 = 281,8");
nj(281.8 / 380, 0.742, 0.0005, "bankens återvinning 281,8/380 = 74,2 %");
nj(150 * 0.207, 31.0, 0.05, "obligationen 150 × 0,207 = 31,0");
nj(90 * 0.207, 18.6, 0.05, "leverantörerna 90 × 0,207 = 18,6");
nj(256.2 + 42 + 79.0, 377.2, 0.05, "kontrollrad 256,2 + 42 + 79,0 = 377,2");
nj(1 - 0.207, 0.793, 0.0005, "LGD 1 − 0,207 = 79,3 %");
nj(0.045 * 0.793, 0.036, 0.0005, "förväntad förlust 4,5 % × 79,3 % ≈ 3,6 pp");
nj(420 / 380, 1.11, 0.005, "boktäckning 420/380 = 1,11");
nj(256.2 / 380, 0.674, 0.0005, "realisationstäckning 256,2/380 = 67,4 %");
nj(3.4 - 2.0, 1.4, 0.001, "spread säkrad över stat 1,4 pp");
nj(7.0 - 2.0, 5.0, 0.001, "spread efterställd över stat 5,0 pp");
nj(7.0 - 3.4, 3.6, 0.001, "spread efterställd över säkrad 3,6 pp");
nj(74.2 - 20.7, 53.5, 0.05, "klyftan 74,2 − 20,7 = 53,5 pp");
nj(25 + 15, 40, 0.001, "rekonstruktion 25 + 15 = 40 %");
nj(420 * 0.51, 214.2, 0.05, "stress pant 420 × 0,51 = 214,2");
nj(380 * 0.25, 95.0, 0.05, "stress opant 380 × 0,25 = 95,0");
nj(300 * 0.70, 210, 0.001, "utmaning f1 pant 300 × 0,70 = 210");
nj(250 - 210, 40, 0.001, "utmaning f1 rest 250 − 210 = 40");
nj(40 + 80 + 30, 150, 0.001, "utmaning f2 osäkrade 40 + 80 + 30 = 150");
nj(60 / 150, 0.40, 0.005, "utmaning f2 kvot 60/150 = 40,0 %");
nj(0.40 * 80, 32, 0.001, "utmaning f2 obligationen 0,40 × 80 = 32");
nj(1 - 0.35, 0.65, 0.005, "utmaning f3 LGD 1 − 0,35 = 65,0 %");
nj(0.060 * 0.650, 0.039, 0.0005, "utmaning f3 förväntad förlust 3,9 pp");

// ── 8. Aritmetik od-11 ───────────────────────────────────────────────────────
console.log("\n── Aritmetik od-11 (benen, nättingen, identiteten, brytvärdet)");
nj(2.20 + 1.80, 4.00, 0.001, "lån STIBOR 2,20: 2,20 + 1,80 = 4,00 %");
nj(3.10 + 1.80, 4.90, 0.001, "fast syntetiskt 3,10 + 1,80 = 4,90 %");
nj(0.049 * 2000, 98, 0.001, "årsbelopp 4,90 % × 2 000 = 98 Mkr");
nj(3.10 - 2.20, 0.90, 0.001, "diff STIBOR 2,20: 3,10 − 2,20 = 0,90");
nj(0.0090 * 2000 * 0.25, 4.5, 0.001, "nätting 0,90 % × 2 000 × 90/360 = 4,5 Mkr");
nj(4.00 + 1.80, 5.80, 0.001, "lån STIBOR 4,00: 5,80 %");
nj(5.80 - 0.90, 4.90, 0.001, "total STIBOR 4,00: 5,80 − 0,90 = 4,90 %");
nj(5.00 + 1.80, 6.80, 0.001, "lån STIBOR 5,00: 6,80 %");
nj(0.019 * 2000 * 0.25, 9.5, 0.001, "swap in STIBOR 5,00: 1,90 % × 2 000 × 0,25 = 9,5 Mkr");
nj(6.80 - 1.90, 4.90, 0.001, "total STIBOR 5,00: 6,80 − 1,90 = 4,90 %");
nj(0.031 * 2000 * 0.25, 15.5, 0.001, "fasta benet kvartal 3,10 % = 15,5 Mkr");
nj(0.022 * 2000 * 0.25, 11.0, 0.001, "rörliga benet kvartal 2,20 % = 11,0 Mkr");
nj(3.10 - 2.30, 0.80, 0.001, "bryt-diff 3,10 − 2,30 = 0,80 pp");
nj(0.008 * 2000 * 2.8, 44.8, 0.05, "brytvärde 0,80 % × 2 000 × 2,8 ≈ 44,8 Mkr");
nj(0.009 * 2000 * 2.8, 50.4, 0.05, "spegel 0,90 % × 2 000 × 2,8 ≈ 50,4 Mkr");
nj(4.40 - 3.10, 1.30, 0.001, "dubbel netto STIBOR + (4,40 − 3,10) = +1,30");
nj(4.50 + 1.30, 5.80, 0.001, "dubbel STIBOR 4,50: 4,50 + 1,30 = 5,80 %");
nj(2000 * Math.pow(0.98, 5), 1808, 1, "amortering år fem 2 000 × 0,98⁵ ≈ 1 808");
nj(2000 - 1808, 192, 1.5, "överstäckning 2 000 − 1 808 = 192 Mkr");
nj(0.01 * 2000 * 2.8, 56, 0.05, "känslighet 1,00 % × 2 000 × 2,8 = 56 Mkr");
nj(3.10 - 3.50, -0.40, 0.001, "utmaning f1 diff 3,10 − 3,50 = −0,40");
nj(0.004 * 2000 * 0.25, 2.0, 0.001, "utmaning f1 0,40 % × 2 000 × 0,25 = 2,0 Mkr in");
nj(3.10 - 2.65, 0.45, 0.001, "utmaning f2 diff 3,10 − 2,65 = 0,45");
nj(0.0045 * 2000 * 1.9, 17.1, 0.05, "utmaning f2 bryt 0,45 % × 2 000 × 1,9 ≈ 17,1 Mkr");
ok(JSON.stringify(od).includes("2,70") && JSON.stringify(od).includes("3,55"), "od-11: kurvan 2,70/3,10/3,55 närvarande");

// ── 9. Korslänkar registeräkta (prefixmatch ur löpande text) ────────────────
console.log("\n── Korslänkar (alla kursprefix i texterna finns i registret)");
const prefix = new Set(Object.keys(reg).map((s) => s.split("-").slice(0, 2).join("-")));
for (const [namn, c] of [["ln-06", ln], ["ks-09", ks], ["od-11", od]]) {
  const texter = [c.summary, c.why, c.learn, c.lynchSection, c.grahamSection, c.ak1Section, ...c.chapters.flatMap((k) => [k.intro, ...k.blocks.map((b) => b.content)])].join(" ");
  const ref = [...texter.matchAll(/\b(km|ts|pc|rk|pf|se|sj|bf|mk|vm|ud|bk|ln|st|tx|ks|rs|mt|kt|am|vr|ib|pe|roic|ma|od|ek|rp)-(\d{1,3})\b/g)].map((m) => m[0]);
  ok(ref.length >= 8, namn + ": bär korslänkar (" + ref.length + " st)", [...new Set(ref)].join(","));
  const saknadeRef = [...new Set(ref)].filter((r) => !prefix.has(r));
  ok(saknadeRef.length === 0, namn + ": alla korslänkar registeräkta", saknadeRef.join(",") || "0 saknade");
}

// ── 10. Språkgrind ────────────────────────────────────────────────────────────
console.log("\n── Språkgrind");
for (const [namn, c] of [["ln-06", ln], ["ks-09", ks], ["od-11", od]]) {
  const s = JSON.stringify(c);
  ok(!/[\u4e00-\u9fff\u3040-\u30ff\u0400-\u04ff]/.test(s), namn + ": inga CJK/kyrilliska läckor");
  ok(!/[\u{00AD}]/u.test(s), namn + ": inga mjuka bindestreck");
  ok(!/\t/.test(s), namn + ": inga tabbar");
  ok(!/…/.test(s), namn + ": inga tre-punkter");
  const dub = s.match(/\b([a-zA-ZåäöÅÄÖ]{3,})\s+\1\b/g);
  ok(!dub, namn + ": inga dubbelord", dub ? [...new Set(dub)].slice(0, 5).join(",") : "");
  for (const lek of ["compare ", "additional ", "itself ", "something ", "back ", " the ", " and ", " with ", "approximately", "tolerance", "setting"]) ok(!s.toLowerCase().includes(lek), namn + ": ingen engelskläcka »" + lek.trim() + "«");
  ok(!/«[^»]*$|^[^«]*»/.test(s), namn + ": inga brutna citattecken");
}

// ── 11. Syskonvakt ────────────────────────────────────────────────────────────
console.log("\n── Syskonvakt (omgångens övriga nykomlingar kvar i registret)");
for (const s of ["ma-09-produktionsgapet", "roic-06-bankernas-lonsamhet", "st-08-bindningsrisken"]) {
  ok(!!reg[s], "syskonkurs i registret: " + s);
}
ok(regN >= 495, "register ≥ 495 (492 + omgångens sex)", String(regN));

console.log("\nKVD o27: " + PASS + " PASS · " + FEL + " FEL · " + VARNING + " VARNING");
process.exit(FEL > 0 ? 1 : 0);
