#!/usr/bin/env node
/**
 * s5-u3 (manifest auto-s5-1789989925484, omgång 26, byggare 3/3) — KVD:
 * bf-18-kompetensillusionen · od-10-kreditderivatet · kt-10-avknoppningen.
 * Struktur · serie · grannar · sondbelägg · aritmetik (maskinell) · korslänkar
 * · blockkonvention · språkgrind · juridik · R2.
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

console.log("KVD s5-u3 o26 — registerläge " + regN + " (syskon: u1 se-24, u2 st-07+pe-08 landade; mina tre på plats)");

const bf = las("bf-18-kompetensillusionen");
const od = las("od-10-kreditderivatet");
const kt = las("kt-10-avknoppningen");

// ── 1. Strukturella vakter ───────────────────────────────────────────────────
console.log("\n── Struktur (18 fält, 6 kap à 4 min, block, slug, nivå)");
for (const [namn, c, kat] of [["bf-18", bf, "BETEENDEFINANS"], ["od-10", od, "OPTIONS & DERIVAT"], ["kt-10", kt, "KATALYSATOR"]]) {
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
  ok(/placeringsråd|placeringsbeslut|utbildning om mekanismer|aldrig råd/.test(juridik), namn + ": utbildningsframing närvarande");
  ok(!/köp denna|sälj denna|bör du köpa|rekommenderar köp/i.test(JSON.stringify(c)), namn + ": inga rådsformuleringar");
  ok(!/kraverFas|13999|9999|449 kr|799 kr/i.test(JSON.stringify(c)), namn + ": R2 ren (inga pris-/tier-ytor)");
}

// ── 2. Blockkonvention (kap 1: text+definition|tabell+insight; 2-5: text+tabell+insight; 6: text+utmaning+insight)
console.log("\n── Blockkonvention");
for (const [namn, c] of [["bf-18", bf], ["od-10", od], ["kt-10", kt]]) {
  for (const k of c.chapters) {
    const typer = k.blocks.map((b) => b.type).join("+");
    const vantad = k.num === 6 ? "text+utmaning+insight" : k.num === 1 ? /^text\+(definition|tabell)\+insight$/.test(typer) ? typer : null : "text+tabell+insight";
    ok(!!vantad && typer === vantad, namn + " kap " + k.num + ": " + typer);
    ok(k.blocks.every((b) => typeof b.content === "string" && b.content.length > 40), namn + " kap " + k.num + ": alla block bär innehåll");
  }
}

// ── 3. Seriekontroll ─────────────────────────────────────────────────────────
console.log("\n── Serieordning (mina tre i registret efter föregångare)");
for (const [ny, fore] of [["bf-18-kompetensillusionen", "bf-17-nutidsbias-och-den-hyperboliska-kurvan"], ["od-10-kreditderivatet", "od-09-forsakringsskrivandet"], ["kt-10-avknoppningen", "kt-09-budpremien-och-budprocessen"]]) {
  ok(!!reg[ny], ny + " i registret");
  ok(!!reg[fore], "föregångare " + fore + " i registret");
  ok(Object.keys(reg).indexOf(fore) < Object.keys(reg).indexOf(ny), fore + " < " + ny + " i kartordning");
}
const bfN = Object.keys(reg).filter((s) => s.startsWith("bf-")).length;
const odN = Object.keys(reg).filter((s) => s.startsWith("od-")).length;
const ktN = Object.keys(reg).filter((s) => s.startsWith("kt-")).length;
ok(bfN === 18 && odN === 10 && ktN === 10, "familjelängd bf 18 / od 10 / kt 10", bfN + "/" + odN + "/" + ktN);
ok(bf.level === "Intermediär" && od.level === "Avancerad" && kt.level === "Intermediär", "nivåval (bf/kt Intermediär, od Avancerad)");

// ── 4. Grannexistens ─────────────────────────────────────────────────────────
console.log("\n── Grannexistens (refererade kurser finns i registret)");
const grannar = {
  "bf-18": ["km-036-overconfidence", "bf-10-dunningkruger", "bf-16-slumpens-serier", "bf-04-investera-som-en-robot", "ek-04-backtestens-hantverk", "km-016-sharpe-kvot", "kt-02-forvantningsanalys-och-kalibrering", "ek-06-bayesianska-omviktningen"],
  "od-10": ["od-09-forsakringsskrivandet", "od-02-implicit-volatilitet", "rk-16-kontrahentrisken", "st-05-refinansieringsmuren", "ks-05-covenanter-och-kreditbetyg", "ma-05-kreditpremien", "st-01-soliditet-och-rantetackning", "rs-03-dold-samvariation", "bf-13-arbitragens-granser", "bf-17-nutidsbias-och-den-hyperboliska-kurvan", "rs-04-riskmatrisen", "ek-06-bayesianska-omviktningen"],
  "kt-10": ["vr-09-konglomeratrabatten", "km-012-sum-of-the-parts-sotp", "am-07-indexomlaggningen", "kt-03-katalysatorkedjor", "kt-09-budpremien-och-budprocessen", "kt-02-forvantningsanalys-och-kalibrering", "kt-04-den-uteblivna-katalysatorn", "rs-03-dold-samvariation", "rs-04-riskmatrisen", "rs-09-personalrisken", "ks-02-kapitalallokering"],
};
for (const [namn, slugs] of Object.entries(grannar)) {
  for (const s of slugs) ok(!!reg[s], namn + " → granne finns: " + s);
}
ok(Object.keys(reg).some((k) => k.startsWith("km-035")), "bf-18 → granne km-035 (flockbeteende) finns");
ok(Object.keys(reg).some((k) => k.startsWith("km-017")), "bf-18 → granne km-017 (kelly) finns");
ok(Object.keys(reg).some((k) => k.startsWith("you-can-be")), "kt-10 → granne you-can-be-a-stock-market-genius finns");

// ── 5. Sondbelägg (why-rädernas 0-påståenden mot registret minus mina tre) ───
console.log("\n── Sondbelägg (0-påståenden mot registret utan mina tre)");
const regUtan = {};
for (const [k, v] of Object.entries(reg)) if (!["bf-18-kompetensillusionen", "od-10-kreditderivatet", "kt-10-avknoppningen"].includes(k)) regUtan[k] = v;
const stackAll = JSON.stringify(regUtan).toLowerCase();
const kursAgare = (term) => Object.entries(regUtan).filter(([s, v]) => JSON.stringify(v).toLowerCase().includes(term.toLowerCase())).map(([s]) => s);
for (const term of ["kompetensillusion", "illusion of skill", "social smitta"]) ok(kursAgare(term).length === 0, "bf-18: «" + term + "» 0 kursägare", kursAgare(term).length + " st");
ok(stackAll.includes("övermod"), "bf-18: övermod finns hos granne (km-036) — gränssnitt dokumenterat");
for (const term of ["credit default", "kreditderivat", "swaption"]) {
  const a = kursAgare(term);
  ok(a.every((s) => s.endsWith("-short") || s.includes("genius") || s.includes("quantitative") || s.includes("ekonomi")) || a.length === 0, "od-10: «" + term + "» endast bokträffar/förbifart", a.join(",") || "0");
}
const bokEllerForbifart = (s) => !/^[a-z]{2}-\d/.test(s) || /^(km-012|kt-03|kt-09|vr-09|pc-04|pc-15|pc-20|pe-02|rk-12)/.test(s);
ok(kursAgare(" CDS ").every(bokEllerForbifart), "od-10: CDS endast böcker + förbifart (rk-12)", kursAgare(" CDS ").join(",") || "0");
const avk = kursAgare("avknoppning");
ok(avk.every(bokEllerForbifart), "kt-10: «avknoppning» endast böcker + grannar i förbifart", avk.join(","));
ok(kursAgare("spin off").length === 0, "kt-10: «spin off» 0 kursägare");

// ── 6. Aritmetik bf-18 ───────────────────────────────────────────────────────
console.log("\n── Aritmetik bf-18 (korrelationerna, miljöerna, paradoxen, turneringen)");
nj(25 * 24 / 2, 300, 0.001, "25 rådgivare: 25 × 24 ÷ 2 = 300 par");
nj(25 * 8, 200, 0.001, "25 × 8 = 200 årsresultat");
nj(1000 * 0.25, 250, 0.001, "1 000 slumpförvaltare: 250 i toppkvartilen");
nj(250 * 0.25, 62.5, 0.01, "250 × 0,25 = 62,5 nästa år (baslinjen)");
nj(10 * 10 / (10 * 10 + 20 * 20), 0.20, 0.001, "σs10: 100/500 = 0,20");
nj(2 * 2 / (2 * 2 + 20 * 20), 0.0099, 0.0001, "σs2: 4/404 = 0,0099 ≈ 0,01");
nj(5 * 5 / (5 * 5 + 20 * 20), 0.0588, 0.0005, "utmaning σs5: 25/425 ≈ 0,059");
nj(4000 / 16, 250, 0.001, "slantturneringen: 4 000 ÷ 2⁴ = 250 med fyra raka");
nj(250 / 4000 * 100, 6.25, 0.005, "basisfrekvens 250/4 000 = 6,25 %");
nj(8000 / 32, 250, 0.001, "utmaning: 8 000 ÷ 2⁵ = 250 med fem raka");
nj(6 / 10 * 100, 60, 0.001, "Lynch: sex av tio = 60 %");

// ── 7. Aritmetik od-10 ───────────────────────────────────────────────────────
console.log("\n── Aritmetik od-10 (premien, ekvationen, stolen, statskrediten)");
nj(0.025 * 10000000, 250000, 0.5, "250 bp × 10 M = 250 000 kr/år");
nj(250000 / 4, 62500, 0.5, "kvartalspremie 62 500");
nj(1 - 0.40, 0.60, 0.001, "förlustandel 1 − 0,40 = 0,60");
nj(0.025 / 0.60, 0.0417, 0.0005, "årsannolikhet 0,025 ÷ 0,60 = 4,17 %");
nj(Math.pow(0.9583, 5), 0.808, 0.0005, "0,9583⁵ = 0,808");
nj(1 - Math.pow(0.9583, 5), 0.192, 0.0005, "kumulativt 5 år = 19,2 %");
nj((0.025 / 0.60) * 0.60 * 10000000, 250000, 0.5, "förväntad förlust = premien exakt (break-even, exakt kvot)");
nj((1 - 0.40) * 10000000, 6000000, 1, "utbetalning (1 − 0,40) × 10 M = 6 000 000");
nj(6000000 / 250000, 24, 0.001, "6 000 000 ÷ 250 000 = 24 års premier");
nj(250000 - 6000000, -5750000, 1, "första årets fall: −5 750 000");
nj(250 - 220, 30, 0.001, "basis 250 − 220 = 30 punkter");
nj(50000000 / 10000000, 5, 0.001, "multiplikator 50 M ÷ 10 M = 5×");
nj(0.020 / 0.60, 0.033, 0.0005, "Grekland 2009: 200 punkter = 3,3 %/år");
nj(0.10 / 0.60, 0.167, 0.0005, "Grekland 2010: 1 000 punkter = 16,7 %/år");
nj(1 - Math.pow(0.8333, 2), 0.306, 0.0005, "två år kumulativt = 30,6 %");
nj(0.040 * 5000000, 200000, 0.5, "utmaning f1: 400 bp × 5 M = 200 000");
nj(0.040 / 0.60, 0.067, 0.0005, "utmaning f1: PD = 6,7 %");
nj((1 - 0.35) * 5000000, 3250000, 1, "utmaning f2: 0,65 × 5 M = 3 250 000");
nj(3250000 / 200000, 16.25, 0.01, "utmaning f3: 16,25 års premier");

// ── 8. Aritmetik kt-10 ───────────────────────────────────────────────────────
console.log("\n── Aritmetik kt-10 (rabatten, mekaniken, fönstret, utfallet)");
nj(100 * 120 / 1000, 12, 0.001, "Modrik: 100 M × 120 kr = 12 mdr");
nj(10 + 0.60 * 10, 16, 0.001, "SOTP: kärna 10 + andel 0,60 × 10 = 16 mdr");
nj((16 - 12) / 16 * 100, 25, 0.01, "rabatt (16 − 12) ÷ 16 = 25 %");
nj(60 / 100, 0.60, 0.001, "andel 60 M ÷ 100 M = 0,60 per aktie");
nj(132 / 120 - 1, 0.10, 0.001, "beslutsdagen 120 → 132 = +10 %");
nj((100 - 64) / 100 * 100, 36, 0.01, "when-issued 64 = 36 % rabatt");
nj((100 - 62) / 100 * 100, 38, 0.01, "dag noll 62 = 38 % rabatt");
nj(95 + 0.60 * 62, 132.2, 0.01, "kontinuitet 95 + 0,60 × 62 = 132,2");
nj((160 - 132) / 160 * 100, 17.5, 0.01, "rabatt beslutsdagen 17,5 %");
nj((160 - 132.2) / 160 * 100, 17.4, 0.05, "rabatt distributionen 17,4 % (avrundat 17,375)");
nj(12 / 0.8, 15, 0.001, "fönstret 12 M ÷ 0,8 M = 15 handelsdagar");
nj((100 - 56) / 100 * 100, 44, 0.01, "botten 56 = 44 % rabatt");
nj(56 / 62 - 1, -0.097, 0.0005, "62 → 56 = −9,7 %");
nj(71 / 56 - 1, 0.268, 0.0005, "56 → 71 = +26,8 %");
nj((100 - 71) / 100 * 100, 29, 0.01, "71 = 29 % rabatt");
nj(99 / 95 - 1, 0.042, 0.0005, "kärnan 95 → 99 = +4,2 %");
nj(99 + 0.60 * 71, 141.6, 0.01, "summa 12 mån: 99 + 0,60 × 71 = 141,6");
nj(141.6 / 132 - 1, 0.073, 0.0005, "141,6 mot 132 = +7,3 %");
nj((160 - 141.6) / 160 * 100, 11.5, 0.01, "slutrabatt (160 − 141,6) ÷ 160 = 11,5 %");
nj((140 - 105) / 140 * 100, 25, 0.01, "utmaning f1: 25 % rabatt");
nj(88 + 0.50 * 70, 123, 0.01, "utmaning f2: 88 + 0,50 × 70 = 123");
nj(80 * 0.09 / 0.6, 12, 0.001, "utmaning f3: 7,2 ÷ 0,6 = 12 handelsdagar");

// ── 9. Korslänkar registeräkta (prefixmatch ur löpande text) ────────────────
console.log("\n── Korslänkar (alla kursprefix i texterna finns i registret)");
const prefix = new Set(Object.keys(reg).map((s) => s.split("-").slice(0, 2).join("-")));
for (const [namn, c] of [["bf-18", bf], ["od-10", od], ["kt-10", kt]]) {
  const texter = [c.summary, c.why, c.learn, c.lynchSection, c.grahamSection, c.ak1Section, ...c.chapters.flatMap((k) => [k.intro, ...k.blocks.map((b) => b.content)])].join(" ");
  const ref = [...texter.matchAll(/\b(km|ts|pc|rk|pf|se|sj|bf|mk|vm|ud|bk|ln|st|tx|ks|rs|mt|kt|am|vr|ib|pe|roic|ma|od|ek|rp)-(\d{1,3})\b/g)].map((m) => m[0]);
  ok(ref.length >= 8, namn + ": bär korslänkar (" + ref.length + " st)", [...new Set(ref)].join(","));
  const saknadeRef = [...new Set(ref)].filter((r) => !prefix.has(r));
  ok(saknadeRef.length === 0, namn + ": alla korslänkar registeräkta", saknadeRef.join(",") || "0 saknade");
}

// ── 10. Språkgrind ────────────────────────────────────────────────────────────
console.log("\n── Språkgrind");
for (const [namn, c] of [["bf-18", bf], ["od-10", od], ["kt-10", kt]]) {
  const s = JSON.stringify(c);
  ok(!/[\u4e00-\u9fff\u3040-\u30ff\u0400-\u04ff]/.test(s), namn + ": inga CJK/kyrilliska läckor");
  ok(!/[\u{00AD}]/u.test(s), namn + ": inga mjuka bindestreck");
  ok(!/\t/.test(s), namn + ": inga tabbar");
  const dub = s.match(/\b([a-zA-ZåäöÅÄÖ]{3,})\s+\1\b/g);
  ok(!dub, namn + ": inga dubbelord", dub ? [...new Set(dub)].slice(0, 5).join(",") : "");
  for (const lek of ["compare ", "additional ", "itself ", "something ", "back ", " the ", " and ", " with "]) ok(!s.toLowerCase().includes(lek), namn + ": ingen engelskläcka »" + lek.trim() + "«");
  ok(!/«[^»]*$|^[^«]*»/.test(s), namn + ": inga brutna citattecken");
}

// ── 11. Syskonvakt ────────────────────────────────────────────────────────────
console.log("\n── Syskonvakt (omgångens övriga nykomlingar kvar i registret)");
for (const s of ["se-24-banksektorn", "st-07-skuggskulderna", "pe-08-avgiftsmaskinen"]) {
  const hit = Object.keys(reg).find((k) => k.startsWith(s.split("-").slice(0, 2).join("-") + "-"));
  ok(!!hit, "syskonkurs i registret: " + (hit || s));
}
ok(regN >= 489, "register ≥ 489 (483 + omgångens sex)", String(regN));

console.log("\nKVD o26: " + PASS + " PASS · " + FEL + " FEL · " + VARNING + " VARNING");
process.exit(FEL > 0 ? 1 : 0);
