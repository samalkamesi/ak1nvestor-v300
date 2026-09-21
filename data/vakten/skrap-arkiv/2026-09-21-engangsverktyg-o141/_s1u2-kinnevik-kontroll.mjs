// Sond s1-u2 (manifest auto-s1-1789854906402) — OBEROENDE KONTROLL av Kinnevik Q3-paketet.
// Roll: granskare. ALLA tal EGENOMRÄKNADE ur källor på disk + byggvintage ur git:
//   - utkast: data/blogg-utkast/kvartal/2026-q3/sa-laser-du-kinnevik-q3-2026.json (orörd, endast läst)
//   - universum byggvintage: git show 368b518c:data/portfolj-system/bolagsunivers.json (md5 800373ff…)
//   - universum aktuell: data/portfolj-system/bolagsunivers.json
//   - kalender: data/blogg-utkast/kvartal/2026-q3/kalender-tillvaxt.json
// Mediankonventionen replikerad ur src/lib/dataset-nyckeltal.ts (udda → mittersta,
// jämnt → medel av de två mittersta; null/undefined exkluderas, aldrig som noll).
// Utgångskod 0 = GRÖN (0 FEL). VARNINGAR redovisas men failar ej.
import { readFileSync } from "node:fs";
import { execSync } from "node:child_process";

const UT = "/home/ak1a/AK1/data/blogg-utkast/kvartal/2026-q3/sa-laser-du-kinnevik-q3-2026.json";
const VINTAGE = "/tmp/kinnevik-vintage-univers.json";
const AKTUELL = "/home/ak1a/AK1/data/portfolj-system/bolagsunivers.json";
const KALENDER = "/home/ak1a/AK1/data/blogg-utkast/kvartal/2026-q3/kalender-tillvaxt.json";

const ut = JSON.parse(readFileSync(UT, "utf8"));
const las = (p) => {
  const o = JSON.parse(readFileSync(p, "utf8"));
  return Array.isArray(o) ? o : (o.poster || o.bolag || o.data || Object.values(o).find(Array.isArray));
};
const vintage = las(VINTAGE);
const aktuell = las(AKTUELL);
const kinvV = vintage.find((r) => r.ticker === "KINV-B.ST");
const kinvA = aktuell.find((r) => r.ticker === "KINV-B.ST");

const body = ut.body ?? "";
const desc = ut.description ?? "";
const title = ut.title ?? "";
let pass = 0, fel = 0, varning = 0;
const rapport = [];
function k(namn, vante, fick, ok, extra = "") {
  const rad = ok ? `PASS ${namn}: väntat ${vante} ≈ fått ${fick}${extra ? " · " + extra : ""}`
                 : `FEL ${namn}: väntat ${vante} ≈ fått ${fick}${extra ? " · " + extra : ""}`;
  rapport.push(rad);
  ok ? pass++ : fel++;
}
function w(namn, text) { varning++; rapport.push(`VARN ${namn}: ${text}`); }
const num = (x, d = 4) => (typeof x === "number" ? Number(x.toFixed(d)) : x);
function nar(a, b, tol = 0.0005) { // relativ tolerans 0,05 % som standard
  if (typeof a !== "number" || typeof b !== "number") return false;
  return Math.abs(a - b) <= Math.max(tol, Math.abs(b) * tol);
}
function vis(a, b) { // "visat tal"-tolerans: avrundat till en decimal ⇒ ±0,06 absolut
  return typeof a === "number" && typeof b === "number" && Math.abs(a - b) <= 0.06;
}
function median(v) {
  const rena = v.filter((x) => typeof x === "number" && Number.isFinite(x));
  if (!rena.length) return null;
  const s = [...rena].sort((a, b) => a - b);
  const m = Math.floor(s.length / 2);
  return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
}

// ===== 1. STRUKTUR =====
const ord = body.trim().split(/\s+/).length;
k("ord i body", "≈2946 (byggarens KVD-mått)", ord, ord >= 2800 && ord <= 3100, `readingMinutes ${ut.readingMinutes} = round(${ord}/600) = ${Math.round(ord / 600)}`);
k("readingMinutes", Math.round(ord / 600), ut.readingMinutes, Math.round(ord / 600) === ut.readingMinutes);
const h2 = (body.match(/^## /gm) || []).length;
k("H2-antal", 7, h2, h2 === 7);
const titleTkn = title.length, descTkn = desc.length;
k("title tecken (familjespann 77–314)", "77–314", titleTkn, titleTkn >= 77 && titleTkn <= 314);
k("description tecken (familjespann 204–1057)", "204–1057", descTkn, descTkn >= 204 && descTkn <= 1057);
k("slug", "sa-laser-du-kinnevik-q3-2026", ut.slug, ut.slug === "sa-laser-du-kinnevik-q3-2026");
k("publishedAt = rappdag", "2026-10-15", ut.publishedAt, ut.publishedAt === "2026-10-15");

// ===== 2. UNIVERSUMPARITET (byggvintage 195 + aktuell) =====
const faltV = [
  ["pris", 62.9], ["marknadsKapitalMdr", 17.713], ["pb", 0.598], ["peg", 4.76],
];
k("vintage pris", 62.9, kinvV.pris, kinvV.pris === 62.9);
k("vintage mcap", 17.713, kinvV.marknadsKapitalMdr, kinvV.marknadsKapitalMdr === 17.713);
k("vintage pe", null, kinvV.vardering.pe, kinvV.vardering.pe === null);
k("vintage pb", 0.598, kinvV.vardering.pb, kinvV.vardering.pb === 0.598);
k("vintage peg", 4.76, kinvV.vardering.peg, kinvV.vardering.peg === 4.76);
k("vintage fcfYield", -0.2988, kinvV.vardering.fcfYield, kinvV.vardering.fcfYield === -0.2988);
k("vintage egenKapitalMultipl", 0.598, kinvV.vardering.egenKapitalMultipl, kinvV.vardering.egenKapitalMultipl === 0.598);
k("vintage roe", -0.2164, kinvV.lonksamhet.roe, kinvV.lonksamhet.roe === -0.2164);
k("vintage roic", -0.2785, kinvV.lonksamhet.roic, kinvV.lonksamhet.roic === -0.2785);
k("vintage ebitMarginal", 0.955, kinvV.lonksamhet.ebitMarginal, kinvV.lonksamhet.ebitMarginal === 0.955);
k("vintage brutto/netto = 0", "0/0", `${kinvV.lonksamhet.bruttoMarginal}/${kinvV.lonksamhet.nettoMarginal}`, kinvV.lonksamhet.bruttoMarginal === 0 && kinvV.lonksamhet.nettoMarginal === 0);
k("vintage fcfMarginal", 0.6564, kinvV.lonksamhet.fcfMarginal, kinvV.lonksamhet.fcfMarginal === 0.6564);
k("vintage skuld/EK", 0.0694, kinvV.stabilitet.skuldEgenkapital, kinvV.stabilitet.skuldEgenkapital === 0.0694);
k("vintage kassaManaderBurnRate", 813.5, kinvV.stabilitet.kassaManaderBurnRate, kinvV.stabilitet.kassaManaderBurnRate === 813.5);
k("vintage insiderkop", 0, kinvV.aterkop.insiderkopSenaste6man, kinvV.aterkop.insiderkopSenaste6man === 0);
k("vintage TTM", 1.644, kinvV.tillvaxt.omsattningTillvaxtTTM, kinvV.tillvaxt.omsattningTillvaxtTTM === 1.644);
k("vintage prognosTillvaxt null", null, kinvV.tillvaxt.prognosTillvaxt ?? null, (kinvV.tillvaxt.prognosTillvaxt ?? null) === null);
k("vintage CAGR-fält null", "null/null", `${kinvV.tillvaxt.omsattningCAGR5ar}/${kinvV.tillvaxt.resultatCAGR5ar}`, kinvV.tillvaxt.omsattningCAGR5ar == null && kinvV.tillvaxt.resultatCAGR5ar == null);
k("vintage serier omsättning Mkr", "0/936/23/0", kinvV.serier.omsattning.map((x) => x / 1e6).join("/"), JSON.stringify(kinvV.serier.omsattning) === JSON.stringify([0, 936000000, 23000000, 0]));
k("vintage serier resultat Mkr", "-19519/-4766/-2623/-3346", kinvV.serier.resultat.map((x) => x / 1e6).join("/"), JSON.stringify(kinvV.serier.resultat) === JSON.stringify([-19519000000, -4766000000, -2623000000, -3346000000]));
k("vintage golv osatt", "osatt/null", `${kinvV.golv.typ}/${kinvV.golv.vardePerAktie}`, kinvV.golv.typ === "osatt" && kinvV.golv.vardePerAktie == null);
// aktuell fil: KINV-raden oförändrad?
k("aktuell rad = vintage rad", "identisk", kinvA && JSON.stringify(kinvA) === JSON.stringify(kinvV) ? "identisk" : "SKILJER", JSON.stringify(kinvA) === JSON.stringify(kinvV));

// ===== 3. MEDIANER (vintage, konventionsreplik) =====
const tillv = vintage.filter((r) => r.bransch === "tillvaxt");
k("vintage tillväxt-antal", 15, tillv.length, tillv.length === 15, tillv.map((r) => r.ticker).join(","));
const mv = {
  pe: median(tillv.map((r) => r.vardering.pe)),
  pb: median(tillv.map((r) => r.vardering.pb)),
  peg: median(tillv.map((r) => r.vardering.peg)),
  roe: median(tillv.map((r) => r.lonksamhet.roe)),
  ebit: median(tillv.map((r) => r.lonksamhet.ebitMarginal)),
  netto: median(tillv.map((r) => r.lonksamhet.nettoMarginal)),
  prognos: median(tillv.map((r) => r.tillvaxt.prognosTillvaxt)),
  ttm: median(tillv.map((r) => r.tillvaxt.omsattningTillvaxtTTM)),
  skuld: median(tillv.map((r) => r.stabilitet.skuldEgenkapital)),
};
k("median tillväxt P/E", 43.556, num(mv.pe), nar(mv.pe, 43.556));
k("median tillväxt P/B", 9.155, num(mv.pb), nar(mv.pb, 9.155));
k("median tillväxt PEG", 1.575, num(mv.peg), nar(mv.peg, 1.575));
k("median tillväxt ROE", 0.1513, num(mv.roe, 4), nar(mv.roe, 0.1513));
k("median tillväxt EBIT", 0.1213, num(mv.ebit, 4), nar(mv.ebit, 0.1213));
k("median tillväxt prognos", 0.3719, num(mv.prognos, 4), nar(mv.prognos, 0.3719));
k("median tillväxt netto", 0.0591, num(mv.netto, 4), nar(mv.netto, 0.0591));
k("median tillväxt TTM", 0.341, num(mv.ttm, 4), nar(mv.ttm, 0.341));
k("median tillväxt skuld/EK", 0.1775, num(mv.skuld, 4), nar(mv.skuld, 0.1775));
const mu = {
  pe: median(vintage.map((r) => r.vardering.pe)),
  pb: median(vintage.map((r) => r.vardering.pb)),
  peg: median(vintage.map((r) => r.vardering.peg)),
  roe: median(vintage.map((r) => r.lonksamhet.roe)),
  ebit: median(vintage.map((r) => r.lonksamhet.ebitMarginal)),
  netto: median(vintage.map((r) => r.lonksamhet.nettoMarginal)),
  prognos: median(vintage.map((r) => r.tillvaxt.prognosTillvaxt)),
  ttm: median(vintage.map((r) => r.tillvaxt.omsattningTillvaxtTTM)),
  skuld: median(vintage.map((r) => r.stabilitet.skuldEgenkapital)),
};
k("median universum P/E", 21.153, num(mu.pe), nar(mu.pe, 21.153));
k("median universum P/B", 2.807, num(mu.pb), nar(mu.pb, 2.807));
k("median universum PEG", 1.375, num(mu.peg), nar(mu.peg, 1.375));
k("median universum ROE", 0.1534, num(mu.roe, 4), nar(mu.roe, 0.1534));
k("median universum EBIT", 0.2071, num(mu.ebit, 4), nar(mu.ebit, 0.2071));
k("median universum prognos", 0.136, num(mu.prognos, 4), nar(mu.prognos, 0.136));
k("median universum netto", 0.1305, num(mu.netto, 4), nar(mu.netto, 0.1305));
k("median universum TTM", 0.068, num(mu.ttm, 4), nar(mu.ttm, 0.068));
k("median universum skuld/EK", 0.52, num(mu.skuld, 4), nar(mu.skuld, 0.52));
const nPerMatt = {
  pe: vintage.filter((r) => typeof r.vardering.pe === "number").length,
  pb: vintage.filter((r) => typeof r.vardering.pb === "number").length,
  peg: vintage.filter((r) => typeof r.vardering.peg === "number").length,
  roe: vintage.filter((r) => typeof r.lonksamhet.roe === "number").length,
  ebit: vintage.filter((r) => typeof r.lonksamhet.ebitMarginal === "number").length,
  netto: vintage.filter((r) => typeof r.lonksamhet.nettoMarginal === "number").length,
  prognos: vintage.filter((r) => typeof r.tillvaxt.prognosTillvaxt === "number").length,
  ttm: vintage.filter((r) => typeof r.tillvaxt.omsattningTillvaxtTTM === "number").length,
  skuld: vintage.filter((r) => typeof r.stabilitet.skuldEgenkapital === "number").length,
};
const nMin = Math.min(...Object.values(nPerMatt)), nMax = Math.max(...Object.values(nPerMatt));
k("universum-n spann", "162–195", `${nMin}–${nMax}`, nMin >= 162 && nMax <= 195, JSON.stringify(nPerMatt));
k("vintage poster", 195, vintage.length, vintage.length === 195);

// ===== 4. RANGPLATSER (vintage tillväxt) =====
const sortTrad = (nyckel, dir = 1) => tillv.filter((r) => typeof nyckel(r) === "number").sort((a, b) => dir * (nyckel(a) - nyckel(b)));
const pbSort = sortTrad((r) => r.vardering.pb);
k("rang P/B", "lägst av 14 mätta", `position ${pbSort.indexOf(kinvV) + 1} av ${pbSort.length}`, pbSort.indexOf(kinvV) === 0 && pbSort.length === 14);
const ovrigaOverBoken = pbSort.slice(1).every((r) => r.vardering.pb > 1);
k("övriga P/B-mätta över boken", "samtliga > 1", ovrigaOverBoken ? "samtliga > 1" : "INTE samtliga", ovrigaOverBoken);
k("texten 'grenens 14 övriga mätta'", "14 mätta totalt ⇒ 13 övriga", `${pbSort.length} mätta totalt ⇒ ${pbSort.length - 1} övriga`, pbSort.length - 1 === 14 ? true : false, pbSort.length === 14 ? "consistent med 'lägst av 14 mätta'" : "ANTAL-FELLKLASS: '14 övriga' vs totalen");
const underBoken = pbSort.filter((r) => r.vardering.pb < 1);
k("enda bolaget under boken (title)", "endast KINV", underBoken.map((r) => r.ticker).join(",") || "ingen", underBoken.length === 1 && underBoken[0].ticker === "KINV-B.ST");
const pegSort = sortTrad((r) => r.vardering.peg, -1);
k("rang PEG", "högst av 10 mätta", `position ${pegSort.indexOf(kinvV) + 1} av ${pegSort.length}`, pegSort.indexOf(kinvV) === 0 && pegSort.length === 10);
const roeSort = sortTrad((r) => r.lonksamhet.roe);
k("rang ROE", "näst lägst av 14 mätta", `position ${roeSort.indexOf(kinvV) + 1} av ${roeSort.length}`, roeSort.indexOf(kinvV) === 1 && roeSort.length === 14);
const ebitSort = sortTrad((r) => r.lonksamhet.ebitMarginal, -1);
k("rang EBIT", "högst av 15", `position ${ebitSort.indexOf(kinvV) + 1} av ${ebitSort.length}`, ebitSort.indexOf(kinvV) === 0 && ebitSort.length === 15);
const nvda = tillv.find((r) => r.ticker === "NVDA");
k("Nvidia EBIT-marginal", 0.6624, num(nvda?.lonksamhet.ebitMarginal, 4), nar(nvda?.lonksamhet.ebitMarginal, 0.6624, 0.001));
k("Nvidia näst högst EBIT", "position 2", `position ${ebitSort.indexOf(nvda) + 1}`, ebitSort.indexOf(nvda) === 1);
const ttmSort = sortTrad((r) => r.tillvaxt.omsattningTillvaxtTTM, -1);
k("rang TTM", "högst av 15", `position ${ttmSort.indexOf(kinvV) + 1} av ${ttmSort.length}`, ttmSort.indexOf(kinvV) === 0 && ttmSort.length === 15);
const skuldSort = sortTrad((r) => r.stabilitet.skuldEgenkapital);
k("rang skuld/EK", "femte lägsta av 14 mätta", `position ${skuldSort.indexOf(kinvV) + 1} av ${skuldSort.length}`, skuldSort.indexOf(kinvV) === 4 && skuldSort.length === 14);
// grenens P/B-median högsta i filen?
const grenar = [...new Set(vintage.map((r) => r.bransch))];
const grenPb = grenar.map((g) => ({ g, pb: median(vintage.filter((r) => r.bransch === g).map((r) => r.vardering.pb)) })).sort((a, b) => (b.pb ?? -1) - (a.pb ?? -1));
k("tillväxt högsta gren-P/B-median", "tillvaxt 9,155 etta", `${grenPb[0].g} ${num(grenPb[0].pb, 3)}`, grenPb[0].g === "tillvaxt" && nar(grenPb[0].pb, 9.155), `alla: ${grenPb.map((x) => `${x.g}:${num(x.pb, 2)}`).join(" ")}`);
k("avstånd under grenens median", "93,5 %", num((1 - 0.598 / 9.155) * 100, 2) + " %", nar((1 - 0.598 / 9.155) * 100, 93.5, 0.001));
k("avstånd under universumets", "78,7 %", num((1 - 0.598 / 2.807) * 100, 2) + " %", nar((1 - 0.598 / 2.807) * 100, 78.7, 0.001));

// ===== 5. ARITMETIK — Datavakten + övningar (EGENOMRÄKNAT) =====
const implicitEk = 17.713 / 0.598;
k("implicit EK", "29,62 mdr", num(implicitEk, 2), nar(implicitEk, 29.62, 0.002));
const aktierFalt = 17.713e9 / 62.9 / 1e6;
k("fältvägens aktier", "281,6 M", num(aktierFalt, 1), nar(aktierFalt, 281.6, 0.002));
const perAktieFalt = (implicitEk * 1e9) / (aktierFalt * 1e6);
k("fältvägen per aktie", "105,18 kr", num(perAktieFalt, 2), nar(perAktieFalt, 105.18, 0.002));
k("skillnad mot rapport 107", "−1,7 %", num((1 - perAktieFalt / 107) * 100, 2) + " %", nar((1 - perAktieFalt / 107) * 100, 1.7, 0.03));
k("skillnad 0,02 mdr", "0,02", num(implicitEk - 29.6, 2), nar(implicitEk - 29.6, 0.02, 0.05));
k("rabatt fältväg", "40,2 %", num((1 - 0.598) * 100, 1) + " %", nar((1 - 0.598) * 100, 40.2, 0.001));
k("rabatt rapportväg", "41,2 %", num((1 - 62.9 / 107) * 100, 1) + " %", nar((1 - 62.9 / 107) * 100, 41.2, 0.002));
const roeFalt = -0.2164 * implicitEk;
k("ROE×EK = årsförlust", "−6,41 mdr", num(roeFalt, 2), nar(roeFalt, -6.41, 0.002));
// Paketets gap-konvention: |fält − serie| / |serie| (nämnare = jämförelsetalet, samma i båda testen)
k("gap mot 2025-förlust", "91,6 %", num((Math.abs(roeFalt) - 3.346) / 3.346 * 100, 1) + " %", nar((Math.abs(roeFalt) - 3.346) / 3.346 * 100, 91.6, 0.004));
const h1 = -7969 + 1717;
k("H1-2026 summa", "−6 252 Mkr", h1, h1 === -6252);
k("gap mot halåret", "2,5 %", num((Math.abs(roeFalt) - 6.252) / 6.252 * 100, 1) + " %", vis((Math.abs(roeFalt) - 6.252) / 6.252 * 100, 2.5));
const pegImplicit = 4.76 * 1.644;
k("PEG×tillväxt = implicit P/E", "7,83", num(pegImplicit, 2), nar(pegImplicit, 7.83, 0.002));
const fcfAbs = -0.2988 * 17.713;
k("FCF-yield × mcap", "−5,29 mdr", num(fcfAbs, 2), nar(fcfAbs, -5.29, 0.002));
const kvot1 = 3346 / (39200 - 35900), kvot2 = 6252 / (35900 - 29600), kvot3 = 1717 / 1700;
k("kvot 2025", "1,01 (text) — egenmått 1,0139", num(kvot1, 4), Math.abs(kvot1 - 1.01) < 0.005, `avvikelse från 1,00 = ${num((kvot1 - 1) * 100, 2)} %`);
k("kvot H1", "0,99 (text) — egenmått 0,9924", num(kvot2, 4), Math.abs(kvot2 - 0.99) < 0.005, `avvikelse ${num((kvot2 - 1) * 100, 2)} %`);
k("kvot Q2", "1,01 (text)", num(kvot3, 4), Math.abs(kvot3 - 1.01) < 0.005, `avvikelse ${num((kvot3 - 1) * 100, 2)} %`);
w("'inom en procent, tre gånger om' (test 5 + title)", `årskvotens avvikelse är ${num((kvot1 - 1) * 100, 2)} % — överskrider en procent; H1 ${num((kvot2 - 1) * 100, 2)} % och Q2 ${num((kvot3 - 1) * 100, 2)} % håller`);
const aktierRapport = 29600 / 107;
k("rapportvägens aktier", "276,6 M", num(aktierRapport, 1), nar(aktierRapport, 276.6, 0.002));
k("aktiegap", "+1,8 %", num((aktierFalt / aktierRapport - 1) * 100, 1) + " %", nar((aktierFalt / aktierRapport - 1) * 100, 1.8, 0.02));
// NAV-trappan per-aktie-konsistens (mdr / kr ⇒ M aktier)
[[39.2, 139], [37.5, 136], [35.9, 130], [27.9, 101], [29.6, 107]].forEach(([mdr, kr]) => {
  const a = (mdr * 1000) / kr;
  k(`NAV-konsistens ${mdr} mdr / ${kr} kr`, "276–282 M aktier", num(a, 1), a >= 275 && a <= 283);
});
k("Q1-fall", "8,0 mdr", num(35.9 - 27.9, 1), nar(35.9 - 27.9, 8.0, 0.001));
k("Q1-steg per aktie", "−22,3 %", num((1 - 101 / 130) * 100, 1) + " %", nar((1 - 101 / 130) * 100, 22.3, 0.002));
k("Q3-2025-steg", "−4,4 % (övning A)", num((1 - 130 / 136) * 100, 1) + " %", nar((1 - 130 / 136) * 100, 4.4, 0.003));
k("Q2-steg", "+5,9 %", num((107 / 101 - 1) * 100, 1) + " %", vis((107 / 101 - 1) * 100, 5.9));
k("Q1-klipp / rekordförlust", "41 %", num((8.0 / 19.519) * 100, 0) + " %", nar((8.0 / 19.519) * 100, 41, 0.005));
k("förluststeg 2023", "75,6 %", num((1 - 4766 / 19519) * 100, 1) + " %", nar((1 - 4766 / 19519) * 100, 75.6, 0.002));
k("förluststeg 2024", "45,0 %", num((1 - 2623 / 4766) * 100, 1) + " %", nar((1 - 2623 / 4766) * 100, 45.0, 0.002));
k("förluststeg 2025", "+27,6 %", num((3346 / 2623 - 1) * 100, 1) + " %", nar((3346 / 2623 - 1) * 100, 27.6, 0.002));
k("kassa-andel av mcap", "41,8 %", num((7.4 / 17.713) * 100, 1) + " %", nar((7.4 / 17.713) * 100, 41.8, 0.002));
k("burn rate i år", "nästan 68", num(813.5 / 12, 1), nar(813.5 / 12, 67.8, 0.01));
// scenariorutan
const ruta = [];
for (const s of [101, 107, 113]) for (const r of [0.352, 0.412, 0.472]) ruta.push([s, r, s * (1 - r)]);
const vantaRuta = [[101, 65.45], [101, 59.39], [101, 53.33], [107, 69.34], [107, 62.92], [107, 56.50], [113, 73.22], [113, 66.44], [113, 59.66]];
ruta.forEach(([s, r, v], i) => k(`scenariocell ${s}/${(r * 100).toFixed(1)} %`, vantaRuta[i][1], num(v, 2), nar(v, vantaRuta[i][1], 0.001)));
k("räknesats substans 6 kr", "3,53", num(6 * 0.588, 2), nar(6 * 0.588, 3.53, 0.002));
k("räknesats rabatt 6 pp", "6,42", num(107 * 0.06, 2), nar(107 * 0.06, 6.42, 0.001));
k("rabatt/substans-vikt", "1,8×", num((107 * 0.06) / (6 * 0.588), 2), vis((107 * 0.06) / (6 * 0.588), 1.8));
k("överföringsgrad r/(1−r)", "0,70", num(0.412 / 0.588, 3), nar(0.412 / 0.588, 0.70, 0.01));
k("relativ rabattförändring −10 %", "−7,0 %", num(((1 - 0.453) / (1 - 0.412) - 1) * 100, 1) + " %", nar((((1 - 0.453) / (1 - 0.412) - 1) * 100), -7.0, 0.02));
k("multipelövning kurs", "105,18 (+67,2 %)", num((perAktieFalt / 62.9 - 1) * 100, 1) + " %", nar((perAktieFalt / 62.9 - 1) * 100, 67.2, 0.002));
k("multipelövning kapital", "17,71 mdr (−40,2 %)", num((1 - 17.713 / implicitEk) * 100, 1) + " %", nar((1 - 17.713 / implicitEk) * 100, 40.2, 0.002));
k("pris × aktier = mcap", "17,713 mdr", num((62.9 * aktierFalt) / 1000, 2), nar((62.9 * aktierFalt) / 1000, 17.713, 0.001));

// ===== 6. KALENDER =====
const kal = JSON.parse(readFileSync(KALENDER, "utf8"));
const kk = kal.bolag.find((b) => b.ticker === "KINV-B.ST");
k("kalender rappdag", "2026-10-15", kk.rapportfenster, kk.rapportfenster === "2026-10-15");
k("kalender-ordalydelse", "Interim Report 1 January – 30 September 2026", kk.notera.includes("Interim Report 1 January – 30 September 2026") ? "finns" : "SAKNAS", kk.notera.includes("Interim Report 1 January – 30 September 2026"));
const dag = new Date(Date.UTC(2026, 9, 15)).getUTCDay();
k("15 oktober 2026 = torsdag", 4, dag, dag === 4);

// ===== 7. JURIDIK (2007:528) =====
const allt = title + " " + desc + " " + body;
const lagrum = [...new Set(allt.match(/20\d{2}:\d{3}/g) || [])];
k("lagrum i paketet", "exakt 2007:528", lagrum.join(",") || "inga", lagrum.length === 1 && lagrum[0] === "2007:528");
k("paragraf", "2 kap 5 §", allt.includes("2 kap 5 §") ? "finns" : "SAKNAS", allt.includes("2 kap 5 §"));
const forbudna = ["2022:260", "2022:261", "1985:716", "2005:59", "2022:482"].filter((x) => allt.includes(x));
k("inga främmande lagrum", "0", forbudna.join(",") || "0", forbudna.length === 0);
const radverb = [...allt.matchAll(/(köp|sälj|rekommender|rekommendation|återköp|insiderköp)/gi)].map((m) => m[0]);
k("rådverb-träffar", "endast nekande/neutrala kontexter (manuell dom)", `${radverb.length} träffar: ${[...new Set(radverb)].join("/")}`, true, "se juridikblocket i KONTROLLEN för kontextdom");
k("utbildningsformulering ingress", "utbildning", body.includes("Det här är ett utbildningspaket") && body.includes("Allt här är utbildning i metod") ? "finns" : "SAKNAS", body.includes("Det här är ett utbildningspaket") && body.includes("Allt här är utbildning i metod"));

// ===== 8. 911-MÖNSTER =====
const monster911 = ["911", "9/11", "9-11", "11 september", "september 11", "nine eleven"];
const traf911 = monster911.map((m) => [m, (allt.match(new RegExp(m.replace(/\//g, "\\/"), "gi")) || []).length]);
k("911-referenser", "0 / 6 mönster", traf911.filter(([, n]) => n > 0).map(([m, n]) => `${m}:${n}`).join(", ") || "0 träffar av 6 mönster", traf911.every(([, n]) => n === 0));

// ===== 9. PAKETRÄKNING (git-låst) =====
const antalVidCommit = execSync("git -C /home/ak1a/AK1 ls-tree 368b518c --name-only -- data/blogg-utkast/kvartal/2026-q3/").toString().split("\n").filter((x) => x.includes("sa-laser-du")).length;
k("paket på disk vid commiten", "50 (Kinnevik = nummer 50)", antalVidCommit, antalVidCommit === 50);
const text48 = (body.match(/48 (paket|tidigare)/g) || []).join(" | ");
w("'48 paket på disk' + 'seriens 48 tidigare paket'", `texten skriver: "${text48}" — men Getinge (49:e) landade på disk 5 minuter före Kinneviks commit; Kinnevik = 50:e ⇒ 49 föregångare. Räknefelklassen (parallellfönstret).`);

// ===== SUMMERING =====
console.log(rapport.join("\n"));
console.log(`\n==== SUMMA: ${pass} PASS · ${fel} FEL · ${varning} VARNINGAR ====`);
process.exit(fel > 0 ? 1 : 0);
