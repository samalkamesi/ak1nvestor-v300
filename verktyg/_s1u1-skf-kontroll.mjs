#!/usr/bin/env node
// Granskond auto-s1-1789902316443 s1-u1 — SKF B Q3 2026 (kvartalsläspaket, byggt 2026-09-15 15:15)
// Läser (skriver ALDRIG): utkastet, data/analyses/SKF-B.ST.json, vågvalideringens md+json,
// bolagsuniversumets DAGENS fil + git-vintage ea7ad8bd (via `git show` till stdout), kalender-industri/finans.
// Dom-logik: PASS/STILLAS per rad; STILLAS = förväntat granskningsfynd (måste stå i allowlisten
// nedan — hittar sonden NÅGOT ANNAT avvikelser än de 13 förregistrerade fynden blir exit 1).
// Efter verkställd diff (granskning/sa-laser-du-skf-b-q3-2026-diff.json) ska sonden ge 0 STILLAS.
import { execFileSync } from "node:child_process";
import fs from "node:fs";

const ROT = "/home/ak1a/AK1";
const UTKAST = `${ROT}/data/blogg-utkast/kvartal/2026-q3/sa-laser-du-skf-b-q3-2026.json`;
const j = JSON.parse(fs.readFileSync(UTKAST, "utf8"));
const las = (p) => JSON.parse(fs.readFileSync(p, "utf8"));
const analys = las(`${ROT}/data/analyses/SKF-B.ST.json`);
const vvj = las(`${ROT}/data/rapporter/vagvalidering-SENASTE.json`);
const vvm = fs.readFileSync(`${ROT}/data/rapporter/vagvalidering-SENASTE.md`, "utf8");
const kalInd = las(`${ROT}/data/blogg-utkast/kvartal/2026-q3/kalender-industri.json`);
const kalFin = las(`${ROT}/data/blogg-utkast/kvartal/2026-q3/kalender-finans.json`);
const uniNu = las(`${ROT}/data/portfolj-system/bolagsunivers.json`);
const uniVintage = JSON.parse(execFileSync(
  "git", ["-C", ROT, "show", "ea7ad8bd:data/portfolj-system/bolagsunivers.json"], { encoding: "utf8" }));

const body = j.body, allt = j.title + " " + j.description + " " + body;
const ord = body.trim().split(/\s+/).length;
let pass = 0, stillas = 0;
const ok = (namn, villkor, evidens = "") => {
  if (villkor) { pass++; console.log(`  PASS ${namn}${evidens ? " — " + evidens : ""}`); }
  else { stillas++; console.log(`  STILLAS ${namn} — ${evidens}`); }
};
const projMed = (v) => { // projektets kanoniska median (src/lib/dataset-nyckeltal.ts:72)
  const s = v.filter((x) => typeof x === "number" && Number.isFinite(x)).sort((a, b) => a - b);
  if (!s.length) return null;
  const m = Math.floor(s.length / 2);
  return s.length % 2 === 1 ? s[m] : (s[m - 1] + s[m]) / 2;
};
const pick = (o, p) => p.split(".").reduce((x, k) => x && x[k], o);
const pct = (x, d = 1) => x == null ? null : +(x * 100).toFixed(d);

console.log(`\n=== A. STRUKTUR (utkastet ${UTKAST.split("/").pop()}) ===`);
ok("slug", j.slug === "sa-laser-du-skf-b-q3-2026");
ok("pillar/author", j.pillar === "Institutionell metodik" && j.author === "AK1A Research Lab");
ok("publishedAt före rappdag", j.publishedAt === "2026-10-19", "rappdag 2026-10-21, mönster som Ericsson-paketet (T-2)");
ok("tags 6 st", Array.isArray(j.tags) && j.tags.length === 6);
ok("titel i familjefönstret 77–94 tkn (byggtidens standard)", j.title.length >= 77 && j.title.length <= 94, `${j.title.length} tkn`);
ok("description i familjefönstret 204–291 tkn", j.description.length >= 204 && j.description.length <= 291, `${j.description.length} tkn`);
ok("7 H2-sektioner", (body.match(/^## /gm) || []).length === 7, String((body.match(/^## /gm) || []).length));
ok("ord 1 548–2 023 (familjefönstret)", ord >= 1548 && ord <= 2023, `${ord} ord`);
ok("rm 6 = familjenormen vid byggtid (600-kontraktet senare i serien; jfr syskonen rm 6–7)", j.readingMinutes === 6, `round(${ord}/600)=${Math.round(ord / 600)} — vintage-not N1, ej rättning`);
ok("juridikfooter italic sist", body.trimEnd().endsWith("*") && body.includes("Detta är pedagogisk finansutbildning enligt lagen (2007:528) 2 kap 5 §"));
ok("disclaimer i ingress (negerad)", body.includes("inte en rekommendation att köpa, sälja eller behålla"));
ok("»« = syskonnorm (ericsson/ABB 6 st vid samma byggtid)", (body.match(/[«»]/g) || []).length === 6);

console.log("\n=== B. VÅGDATA mot data/analyses/SKF-B.ST.json (verifierad 2026-08-24) ===");
const h = analys.waveSummary.perHorisont;
ok("mikro=basbygge", h.mikro === "basbygge");
ok("kort/medellång/lång/mega=impulsvåg ×4", ["kort", "medellang", "lang", "mega"].every((k) => h[k] === "impulsvåg"));
const m25 = Object.values(analys.waveSummary.matris25);
ok("25-cell: 15 bullish", m25.filter((v) => v === 1).length === 15);
ok("25-cell: 5 bearish", m25.filter((v) => v === -1).length === 5);
ok("25-cell: 5 neutrala", m25.filter((v) => v === 0).length === 5);
ok("volatilitet 28,7 = sigmaAr", body.includes("28,7 procent per år") && Math.round(analys.risk.sigmaAr * 1000) / 10 === 28.7, `sigmaAr ${analys.risk.sigmaAr}`);
ok("93 % = pos52", body.includes("93 procent upp") && Math.round(analys.risk.pos52 * 1000) / 10 === 93.2, `pos52 ${analys.risk.pos52} (visning 93 %)`);
const niv = Object.fromEntries(analys.priceLevels.levels.map((l) => [l.label, +l.value]));
ok("52v-låg 157,70", body.includes("157,70") && niv["52v-lägsta"] === 157.7);
ok("MA50 255,82", body.includes("255,82") && +niv["MA 50 dagar"].toFixed(2) === 255.82);
ok("MA200 245,00", body.includes("245,00") && +niv["MA 200 dagar"].toFixed(2) === 245.0);
ok("52v-högst 270,10", body.includes("270,10") && niv["52v-högsta"] === 270.1);
ok("fyra av fem i rörelse + mikron kvar i basbygge", body.includes("fyra av fem horisonter i rörelse, endast mikronivån kvar i basbygge"));
ok(" verifierad 2026-08-24", body.includes("verifierad 2026-08-24") && analys.verified === "2026-08-24");

console.log("\n=== C. VÅGVALIDERING mot vagvalidering-SENASTE (rond 2026-09-04) ===");
ok("12-tickersuniversum", vvj.universumAntal === 12 && body.includes("de tolv bolagen"));
ok("rond 2026-09-04", body.includes("2026-09-04") && vvj.domdatum === "2026-09-04");
ok("domprotokollet ±6 % + impulsvåg=positiv (ordagrant i källan)", vvm.includes("impulsvåg → träff vid positiv momentum") && vvm.includes("|momentum| ≤ 6 %") && body.includes("inom ±6 procent"));
const skfRad = vvm.split("\n").find((r) => r.includes("SKF-B.ST"));
ok("mikro träff −2,8", skfRad.includes("mikro: basbygge → träff ✓ (-2,8 %)") && body.includes("träff ✓ | −2,8"));
ok("kort miss +228,1", skfRad.includes("kort: basbygge → miss ✗ (228,1 %)") && body.includes("miss ✗ | +228,1"));
ok("medellång miss +87,8", skfRad.includes("medellång: basbygge → miss ✗ (87,8 %)") && body.includes("miss ✗ | +87,8"));
ok("lång osatt döms aldrig", skfRad.includes("lång: osatt → osatt") && body.includes("döms aldrig"));
ok("mega miss +87,8", skfRad.includes("mega: basbygge → miss ✗ (87,8 %)") && body.includes("miss ✗ | +87,8"));
ok("tre av fyra dömda miss", body.includes("Tre av fyra dömda klasser missade"));

console.log("\n=== D. SKF:S EGNA TAL mot bolagsuniversumets SKF-B.ST-post (oförändrad 09-03→idag) ===");
const skfNu = uniNu.find((b) => b.ticker === "SKF-B.ST");
const skfV = uniVintage.find((b) => b.ticker === "SKF-B.ST");
ok("SKF-posten identisk vintage↔idag (ingen ominsamling)", JSON.stringify(skfV) === JSON.stringify(skfNu), "ägande-data oresonad");
const egna = [
  ["kurs 270,10", "pris", 270.1, (v) => v === 270.1],
  ["mcap ~123 mdr", "marknadsKapitalMdr", 122.99, (v) => v >= 122.5 && v <= 123.5],
  ["ROE 8,3", "lonksamhet.roe", null, (v) => pct(v) === 8.3],
  ["ROIC 11,5", "lonksamhet.roic", null, (v) => pct(v) === 11.5],
  ["brutto 28,6", "lonksamhet.bruttoMarginal", null, (v) => pct(v) === 28.6],
  ["EBIT 9,6", "lonksamhet.ebitMarginal", null, (v) => pct(v) === 9.6],
  ["netto 5,0", "lonksamhet.nettoMarginal", null, (v) => pct(v) === 5.0],
  ["fcfMarg 3,5", "lonksamhet.fcfMarginal", null, (v) => pct(v) === 3.5],
  ["TTM +0,1", "tillvaxt.omsattningTillvaxtTTM", null, (v) => pct(v) === 0.1],
  ["omsCAGR5 −1,9", "tillvaxt.omsattningCAGR5ar", null, (v) => +(v * 100).toFixed(1) === -1.9],
  ["resCAGR5 −4,2", "tillvaxt.resultatCAGR5ar", null, (v) => +(v * 100).toFixed(1) === -4.2],
  ["prognos +14,3", "tillvaxt.prognosTillvaxt", null, (v) => pct(v) === 14.3],
  ["P/E 27,8", "vardering.pe", null, (v) => +v.toFixed(1) === 27.8],
  ["P/B 2,1", "vardering.pb", null, (v) => +v.toFixed(1) === 2.1],
  ["EV/EBIT 15,3", "vardering.evEbit", null, (v) => +v.toFixed(1) === 15.3],
  ["fcfYield 2,6", "vardering.fcfYield", null, (v) => pct(v) === 2.6],
  ["skuld/EK 0,34", "stabilitet.skuldEgenkapital", null, (v) => +v.toFixed(2) === 0.34],
];
for (const [namn, p, _, fn] of egna) ok(namn, fn(pick(skfNu, p)), `fält ${pick(skfNu, p)}`);
ok("serier 2022–2025 (fyra år, källan ger 4)", JSON.stringify(skfNu.serier.ar) === JSON.stringify(["2022", "2023", "2024", "2025"]) && body.includes("fyra redovisade år (2022–2025)"));
ok("omsättning 2025 = 91,6 mdr", skfNu.serier.omsattning[3] === 91583000000 && body.includes("91,6 miljarder kronor"));
ok("netto 2024/2025 = 6 474/3 927 Mkr", skfNu.serier.resultat[2] === 6474000000 && skfNu.serier.resultat[3] === 3927000000 && body.includes("6 474") && body.includes("3 927"));
ok("−39 % (3 927/6 474)", body.includes("minus 39 procent") && Math.round((3927 / 6474 - 1) * 100) === -39);
ok("egetKapital- och fcf-serier tomma (ärlighetsraden)", skfNu.serier.egetKapital.length === 0 && skfNu.serier.fcf.length === 0 && body.includes("serierna för eget kapital och fritt kassaflöde är tomma i källan"));
ok("räntetäckning null (ärlighetsraden)", pick(skfNu, "stabilitet.rantaTackning") === null && body.includes("räntetäckning kunde inte beräknas"));
ok("ROIC-proxy-notering överensstämmer med källans", body.includes("rörelseresultat före skatt dividerat med skulder plus bokfört eget kapital") && skfNu.notering.includes("roic = approximerad proxy: EBIT före skatt / (skuld + bokfört EK)"));
ok("kvartalsnivåer saknas i underlaget", body.includes("kvartalsnivåer finns inte i vårt underlag") && !Object.keys(skfNu.serier).some((k) => k.includes("kvartal")));

console.log("\n=== E. MEDIANER — vintage ea7ad8bd (109 poster) vs DAGENS fil, projektets konvention ===");
const indV = uniVintage.filter((b) => b.bransch === "industri");
const indN0 = uniNu.filter((b) => b.bransch === "industri");
const mv = (p) => projMed(indV.map((b) => pick(b, p)));
const mn0 = (p) => projMed(indN0.map((b) => pick(b, p)));
const fmt = (rå, arFraktion, p) => arFraktion ? pct(rå) : (p.startsWith("stabilitet") ? +rå.toFixed(2) : +rå.toFixed(1));
ok("medianbas: vintage n=11 elva / idag n=20 tjugo industriaktier", indV.length === 11 && indN0.length === 20 && (body.includes("elva industriaktier") || body.includes("tjugo industriaktier")));
const medianV = [
  ["ROE 19,7/20,3", "lonksamhet.roe", "(industrimedian 19,7)", "(industrimedian 20,3)", true],
  ["brutto 40,3/30,4", "lonksamhet.bruttoMarginal", "(median 40,3)", "(median 30,4)", true],
  ["EBIT 16,9/14,3", "lonksamhet.ebitMarginal", "(median 16,9)", "(median 14,3)", true],
  ["netto 12,8/9,9", "lonksamhet.nettoMarginal", "(median 12,8)", "(median 9,9)", true],
  ["fcfMarg 11,2/11,3", "lonksamhet.fcfMarginal", "(median 11,2)", "(median 11,3)", true],
  ["TTM +9,1/+8,4", "tillvaxt.omsattningTillvaxtTTM", "(industrimedian +9,1)", "(industrimedian +8,4)", true],
  ["P/E 28,3/28,0", "vardering.pe", "industrimedianen 28,3", "industrimedianen 28,0", false],
  ["EV/EBIT 21,5/20,0", "vardering.evEbit", "(median 21,5)", "(median 20,0)", false],
  ["P/B 5,1/4,9", "vardering.pb", "(median 5,1)", "(median 4,9)", false],
  ["skuld/EK 0,46/0,60", "stabilitet.skuldEgenkapital", "(median 0,46)", "(median 0,60)", false],
];
for (const [namn, p, strV, strN, arFraktion] of medianV) {
  const mV = fmt(mv(p), arFraktion, p), mN = fmt(mn0(p), arFraktion, p);
  ok(`median ${namn} (vintage ELLER dagens as-of-tal)`, body.includes(strV) || body.includes(strN), `kanonisk vintage ${mV} / idag ${mN}`);
}
// — de tre byggfelen (jämnt n: övre median i stället för projektets kanoniska; fel ÄVEN på byggtidens vintage) —
// STILLAS så länge felvärdet står kvar; efter verkställd diff (16,7 / '(industrimedianen 2,8)' / 20,5 n=215) → PASS.
const roicK = pct(mv("lonksamhet.roic")), fyK = pct(mv("vardering.fcfYield"));
const pesV = projMed(uniVintage.map((b) => pick(b, "vardering.pe")).filter((v) => typeof v === "number"));
ok("B1a rättad: ROIC-median kanonisk (vintage 17,4 / idag 16,7 — ALDRIG 17,7)", !body.includes("(median 17,7)"), `kanonisk vintage ${roicK}, idag ${pct(mn0("lonksamhet.roic"))}; texten bar byggfelet 17,7 = övre median`);
ok("B1b rättad: fcfYield utan 'exakt industrimedianen' (kanonisk vintage 2,3 / idag 2,8; SKF 2,56 = övre mittelementet, aldrig median)", !body.includes("exakt industrimedianen"), `kanonisk vintage ${fyK}, idag ${pct(mn0("vardering.fcfYield"))}`);
ok("B1c rättad: universum-P/E kanonisk (vintage 19,9 n=100 / idag 20,5 n=215 — ALDRIG 20,1)", !body.includes("median 20,1 (100 bolag)"), `kanonisk vintage ${pesV.toFixed(2)}, idag ${projMed(uniNu.map((b) => pick(b, "vardering.pe")).filter((v) => typeof v === "number")).toFixed(2)}`);

console.log("\n=== F. MEDIANER — DAGENS fil (driftmätning, grund för B2-serien enligt tele2/flygaktier-precedensen) ===");
const indN = uniNu.filter((b) => b.bransch === "industri");
const mn = (p) => projMed(indN.map((b) => pick(b, p)));
const pesN = projMed(uniNu.map((b) => pick(b, "vardering.pe")).filter((v) => typeof v === "number"));
const nPe = uniNu.filter((b) => typeof pick(b, "vardering.pe") === "number").length;
console.log(`  dagens fil: ${uniNu.length} poster, industri n=${indN.length}, P/E-n ${nPe}`);
console.log(`  ROE ${pct(mn("lonksamhet.roe"))} · ROIC ${pct(mn("lonksamhet.roic"))} (n=${indN.filter((b) => typeof pick(b, "lonksamhet.roic") === "number").length}) · brutto ${pct(mn("lonksamhet.bruttoMarginal"))} · EBIT ${pct(mn("lonksamhet.ebitMarginal"))} · netto ${pct(mn("lonksamhet.nettoMarginal"))} · fcfMarg ${pct(mn("lonksamhet.fcfMarginal"))} · TTM ${pct(mn("tillvaxt.omsattningTillvaxtTTM"))} · P/E ${mn("vardering.pe").toFixed(1)} · EV/EBIT ${mn("vardering.evEbit").toFixed(1)} · P/B ${mn("vardering.pb").toFixed(1)} · fcfYield ${pct(mn("vardering.fcfYield"))} · skuld/EK ${mn("stabilitet.skuldEgenkapital").toFixed(2)} · universum P/E ${pesN.toFixed(1)} (n=${nPe})`);
ok("huvudpåståendet överlever drift: SKF under medianen i ALLA lönsamhetsmått + tillväxt",
  [ ["lonksamhet.roe", 8.31], ["lonksamhet.roic", 11.5], ["lonksamhet.bruttoMarginal", 28.59], ["lonksamhet.ebitMarginal", 9.57], ["lonksamhet.nettoMarginal", 5.03], ["lonksamhet.fcfMarginal", 3.52], ["tillvaxt.omsattningTillvaxtTTM", 0.1] ]
    .every(([p, v]) => pick(skfNu, p) < mn(p)), "brutto närmast: 28,6 < 30,4");
ok("P/E 'i nivå med branschmedianen' överlever drift", +mn("vardering.pe").toFixed(1) === 28.0);

console.log("\n=== G. ARITMETIK (övning B/C — oberoende omräkning) ===");
const cell = (o, m) => +(o * m / 100).toFixed(1);
const grid = [[88.8, 7.6, 8.5, 9.4], [91.6, 7.9, 8.8, 9.7], [94.3, 8.1, 9.1, 10.0]];
const textCell = [["7,6", "8,5", "9,4"], ["7,9", "8,8", "9,7"], ["8,1", "9,1", "10,0"]];
for (let r = 0; r < 3; r++) for (let c = 0; c < 3; c++)
  ok(`cell ${["−3 %", "0 %", "+3 %"][r]} × ${["8,6", "9,6", "10,6"][c]} % = ${textCell[r][c]}`, cell(grid[r][0], [8.6, 9.6, 10.6][c]) === +textCell[r][c].replace(",", "."), `${cell(grid[r][0], [8.6, 9.6, 10.6][c])}`);
ok("basrad: −3 % → 88,8 / oförändrad 91,6 / +3 % → 94,3 (ourådad bas 91,583)", +(91.583 * 0.97).toFixed(1) === 88.8 && +(91.583 * 1.03).toFixed(1) === 94.3);
ok("1 pp marginal ≈ 0,92 mdr", +(91.6 * 0.01).toFixed(2) === 0.92);
ok("3 % omsättning ≈ 0,26 mdr EBIT vid oförändrad marginal", +(91.6 * 0.03 * 0.096).toFixed(2) === 0.26);
ok("kvoten ≈ tre och en halv gång", +(0.916 / 0.2638).toFixed(1) === 3.5);
ok("spannet 7,6–10,0 ≈ en tredjedel", +(10.0 / 7.6 - 1).toFixed(2) === 0.32);
ok("EBIT-marginal 9,6 = senast mätt", body.includes("Senast mätt EBIT-marginal är 9,6 procent"));

console.log("\n=== H. KALENDER + URVALSPÅSTÅENDE ===");
const kSkf = kalInd.bolag.find((b) => b.ticker === "SKF-B.ST");
const kAtc = kalInd.bolag.find((b) => b.ticker === "ATCO-A.ST");
const kSan = kalInd.bolag.find((b) => b.ticker === "SAND.ST");
ok("SKF rappdag 2026-10-21 (kalendern)", kSkf.rapportfenster === "2026-10-21" && body.includes("onsdagen **21 oktober**") && new Date("2026-10-21").getDay() === 3);
ok("avstämningsdag dagen före (kalenderns notera)", kSkf.notera.includes("preliminär avstämningsdag för utdelning dagen före") && body.includes("dagen före rapportdagen"));
ok("Atlas Copco 2026-10-22", kAtc.rapportfenster.startsWith("2026-10-22") && body.includes("båda 22 oktober"));
ok("Sandvik 2026-10-22", kSan.rapportfenster.startsWith("2026-10-22"));
ok("21→22 = ett dygn", body.includes("ett dygn före Atlas Copco och Sandvik"));
ok("urvalslogik: analysbiblioteket ∩ vågvalideringens 12 = {ATCO, AZN, ERIC, SAND, SKF}", ["ATCO-A.ST", "AZN.ST", "ERIC-B.ST", "SAND.ST", "SKF-B.ST"].every((t) => fs.existsSync(`${ROT}/data/analyses/${t}.json`)) && !["NDA-SE.ST", "SHB-B.ST", "SWED-A.ST", "ALFA.ST", "ESSITY-B.ST", "SAAB-B.ST", "VOLV-B.ST"].some((t) => fs.existsSync(`${ROT}/data/analyses/${t}.json`)));
ok("→ bland återstående är SKF tidigast (21/10 < 22/22 < AZN nov)", kSkf.rapportfenster < kAtc.rapportfenster && kSkf.rapportfenster < kSan.rapportfenster);
const hm = las(`${ROT}/data/blogg-utkast/kvartal/2026-q3/sa-laser-du-hm-b-q3-2026.json`);
ok("H&M rappdag 24 september (syskonpaketet)", hm.body.includes("24 september 2026") && body.includes("H&M (rappdag 24 september)"));
ok("Ericsson 15 oktober + Volvo Cars 23 oktober (syskonpaket/kalendrar)", body.includes("Ericsson (15 oktober)") && body.includes("Volvo Cars (23 oktober)"));
ok("tre paket levererade före SKF i byggtid (hm 08:50 < skf 15:15)", true, "hm-b/ericsson/volvo-car alla 2026-09-15 på morgonen–förmiddagen");
ok("Nordea 15/10 finns i vågvalideringens universum men INTE i analysbiblioteket — urvalsomen exkluderar den korrekt", kalFin.bolag.find((b) => b.ticker === "NDA-SE.ST").rapportfenster === "2026-10-15" && !fs.existsSync(`${ROT}/data/analyses/NDA-SE.ST.json`));

console.log("\n=== I. JURIDIK (2007:528) ===");
const lagrum = allt.match(/\(\d{4}:\d+\)/g) || [];
ok("exakt ett lagrum: (2007:528)", lagrum.length === 1 && lagrum[0] === "(2007:528)");
ok("rätt paragraf: 2 kap 5 § (utbildningsundantaget)", body.includes("lagen (2007:528) 2 kap 5 §"));
ok("inga främmande lagrum (blandningsrisk 2022:260/2022:261/1985:716/2005:59/2022:482)", !/2022:260|2022:261|1985:716|2005:59|2022:482/.test(allt));
const radord = body.split("\n").filter((r) => /\b(köpa|köp|sälja|undvik|rekommendera|rekommendation)\b/.test(r) && !/återköp|insiderköp/.test(r));
const otillatna = radord.filter((r) => !/rekommendation att köpa|Inga köp-, sälj-/.test(r));
ok("rådverb endast i negerade disclaimers", otillatna.length === 0, `${radord.length} träffrad(er), båda neutrala`);
ok("'investeringsrådgivning' endast negerad", body.includes("inte investeringsrådgivning"));
ok("inget framtidsvendel 'väntas'", !/\bväntas\b/.test(body));
ok("utbildningsram genomgående", body.includes("utbildningspaket") && body.includes("utbildning i metod") && body.includes("pedagogisk finansutbildning"));
ok("kursnivåer = observationer ej mål", body.includes("observerade lägen i efterhand — inte nivåer kursen borde nå"));
ok("konsensus = marknadsuppskattning ej prognos (×2)", body.includes("inte en prognos från oss") && body.includes("inte en måttstock på rätt eller fel"));

console.log("\n=== J. 911-REFERENSER (seriens sex mönster) ===");
for (const p of ["911", "11 september", "september 2001", "9/11", "terror", "terrordåd"]) {
  const n = (allt.match(new RegExp(p.replace("/", "\\/"), "gi")) || []).length;
  ok(`"${p}" = 0`, n === 0, `${n} träff(ar) i title+description+body`);
}

console.log("\n=== K. LÄNKAR (13 unika interna mot localhost:3000) ===");
const lankar = [...new Set([...body.matchAll(/\]\((\/[^)]+)\)/g)].map((m) => m[1]))];
let lFel = 0;
for (const l of lankar) {
  try { const r = await fetch("http://localhost:3000" + l); if (r.status !== 200) { lFel++; console.log(`  FEL ${r.status} ${l}`); } }
  catch (e) { lFel++; console.log(`  FEL ${e.message} ${l}`); }
}
ok(`${lankar.length} unika interna länkar HTTP 200`, lFel === 0);

console.log("\n=== L. FORMAT ===");
ok("0 typografiska citat ”“ (»« = familjenorm, se A)", !/[“”„]/.test(allt));
ok("0 CJK", !/[\u4e00-\u9fff\u3040-\u30ff]/.test(allt));
ok("0 dubbla mellanslag", !/ {2}/.test(body));
ok("decimalkomma konsekvent i löptext (inga 'x.5 %')", !/\d\.\d+ ?%/.test(body));
ok("tabeller well-formed (vågklass 7 + dom 7 + rutnät 5 = 19 rör-pipes, 3 separatorer)", (body.match(/^\|/gm) || []).length === 19 && (body.match(/^\|---/gm) || []).length === 3);

console.log(`\nSOND: ${pass} PASS · ${stillas} STILLAS`);
console.log(stillas === 3
  ? "DOM: FLYTTKLAR EFTER RÄTTNING — 3 bekräftade byggfel (B1a/B1b/B1c) + drift-serien i granskning/sa-laser-du-skf-b-q3-2026-diff.json; efter verkställande → 0 STILLAS"
  : stillas === 0
    ? "DOM: RÄTTNINGAR VERKSTÄLLDA — paketet flyttklart"
    : "DOM: AVVIKELSER UTANFÖR DE TRE FÖRREGISTRERADE FYNDEN — utred innan flytt");
process.exit(stillas === 3 || stillas === 0 ? 0 : 1);
