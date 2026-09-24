#!/usr/bin/env node
// _s4u2-latour-kvd.mjs — KVD för Latour Q3-läspaket (s4-u2, manifest auto-s4-1790046905434)
// GRÖN = 0 FEL 0 VARNING. Kontroller: struktur, universumparitet (md5-lås), aritmetik (oberoende
// hårdkodade källtal — andra kanalen än talbanken), medianer/rang LIVE ur 256-filen, juridik
// (exakt ett lagrum, rådverbgrind med standardnekande-vitlista), disclaimer sista raden,
// interna länkar (struktur + --http om appen svarar), språkgrind, ord/rm-kontrakt.
import { readFileSync, existsSync } from "node:fs";
import { createHash } from "node:crypto";
import http from "node:http";

const PAKET = "data/blogg-utkast/kvartal/2026-q3/sa-laser-du-latour-q3-2026.json";
const UNI = "data/portfolj-system/bolagsunivers.json";
const MED = (a) => { const s = [...a].sort((x, y) => x - y); const n = s.length; return n % 2 ? s[(n - 1) / 2] : (s[n / 2 - 1] + s[n / 2]) / 2; };
const approx = (faktiskt, forvantat, tol = 0.005) => Math.abs(faktiskt - forvantat) <= tol * Math.max(1, Math.abs(forvantat));

let fel = 0, varn = 0, pass = 0;
const F = (m) => { fel++; console.log("FEL:", m); };
const W = (m) => { varn++; console.log("VARNING:", m); };
const OK = (m) => { pass++; };

const p = JSON.parse(readFileSync(PAKET, "utf8"));
const body = p.body;
const rader = body.split("\n");

// ── 1. Struktur ─────────────────────────────────────────────────────────────
const falt = ["slug", "title", "description", "pillar", "author", "publishedAt", "readingMinutes", "tags", "body"];
falt.every((f) => f in p) ? OK("struktur: alla fält") : F("struktur: saknar fält");
p.slug === "sa-laser-du-latour-q3-2026" ? OK("slug") : F("slug: " + p.slug);
p.publishedAt === "2026-11-03" ? OK("publishedAt = rappdagen") : F("publishedAt: " + p.publishedAt);
p.pillar === "Institutionell metodik" && p.author === "AK1A Research Lab" ? OK("pillar/author") : F("pillar/author");
p.description.length >= 150 && p.description.length <= 900 ? OK("description längd " + p.description.length + " (familjepraxis 283–1155)") : F("description längd utanför praxis: " + p.description.length);
Array.isArray(p.tags) && p.tags.length === 6 && p.tags.includes("kvartalsrapport") && p.tags.includes("Latour") ? OK("tags 6 med sökord") : F("tags: " + JSON.stringify(p.tags));
const h2 = [...body.matchAll(/^## (.+)$/gm)].map((m) => m[1].trim());
h2.length === 8 ? OK("H2 = 8") : F("H2 = " + h2.length);
body.includes("## Källor") && h2[h2.length - 1] === "Källor" ? OK("Källor sista H2") : F("Källor inte sista H2");
title: {
  const t = p.title;
  t.includes("Latour") && t.includes("Q3") && t.includes("3 november 2026") ? OK("title bär objekt+rappdag") : F("title saknar nyckeldelar");
}
// sökord i ingress + H2
const ingress = rader[0];
ingress.includes("kvartalsrapportserie") && ingress.includes("Latour") ? OK("sökord ingress") : F("sökord ingress");
h2.filter((h) => h.includes("NAV") || h.includes("Latour") || h.includes("substans")).length >= 3 ? OK("sökord H2") : F("sökord H2");

// ── 2. Universumparitet (md5-lås) ───────────────────────────────────────────
const md5 = createHash("md5").update(readFileSync(UNI)).digest("hex");
md5 === "6e540c8753d28f8b905a2aab9f15b29d" ? OK("universumfil md5-låst") : F("universumfil md5 ändrad: " + md5);
const U = JSON.parse(readFileSync(UNI, "utf8"));
const L = U.find((x) => x.ticker === "LATO-B.ST");
L ? OK("universumrad finns") : F("universumrad saknas");
const para = [
  ["pris", "209,5", L.pris === 209.5],
  ["mcap", "133,9", approx(L.marknadsKapitalMdr, 133.937)],
  ["P/E", "20,519", L.vardering.pe === 20.519],
  ["P/B", "3,128", L.vardering.pb === 3.128],
  ["EV/EBIT", "39,769", L.vardering.evEbit === 39.769],
  ["PEG osatt", "osatt", L.vardering.peg === null],
  ["FCF-yield", "1,94", L.vardering.fcfYield === 0.0194],
  ["ROE", "15,6", L.lonksamhet.roe === 0.156],
  ["brutto", "39,95", L.lonksamhet.bruttoMarginal === 0.3995],
  ["EBIT-marg", "12,84", L.lonksamhet.ebitMarginal === 0.1284],
  ["netto", "23,74", L.lonksamhet.nettoMarginal === 0.2374],
  ["CAGR", "7,57", L.tillvaxt.omsattningCAGR5ar === 0.0757],
  ["TTM", "1,8", L.tillvaxt.omsattningTillvaxtTTM === 0.018],
  ["insiderköp 0", "0", L.aterkop.insiderkopSenaste6man === 0],
  ["skuld/EK osatt", "osatt", L.stabilitet.skuldEgenkapital === null],
];
for (const [namn, textForm, stammer] of para) {
  stammer && body.includes(textForm) ? OK("paritet " + namn) : F(`paritet ${namn}: fält ${stammer ? "OK" : "AVVIKER"} men textform "${textForm}" ${body.includes(textForm) ? "finns" : "SAKNAS"}`);
}
// serieordinal i text
JSON.stringify(L.serier.omsattning) === JSON.stringify([22611000000, 25550000000, 25886000000, 28145000000]) &&
  body.includes("22 611") && body.includes("28 145") ? OK("omsättningsserien 22 611→28 145") : F("omsättningsserie");
// MarketStack-not
L.kallor[1].paranoid.includes("ingen färsk data") && body.includes("MarketStack") && body.includes("enkelkäll") ? OK("enkelkällnot") : F("enkelkällnot");

// ── 3. Aritmetik — oberoende omräkning från hårdkodade källtal ─────────────
const A = [
  // premier
  ["premie okt-25 +11,5 %", 234.2 / 210 - 1, 0.115],
  ["premie årsskiftet +1,0 %", 218 / 216 - 1, 0.01],
  ["rabatt 30/6 −4,9 %", 193 / 203 - 1, -0.049],
  ["premie sept +3,2 % (209,5/203)", 209.5 / 203 - 1, 0.032],
  ["premie sept 2,8 % (209,8/204)", 209.8 / 204 - 1, 0.028],
  // NAV & portfölj
  ["NAV-fall 216→203 = −6,0 %", 203 / 216 - 1, -0.06],
  ["dämpning −8,8 % × (74/123,5) ≈ −5,3 %", -8.8 * (74 / 123.5), -5.27],
  ["gap 2025: −16,9 mot +12,7 = 29,6 pp", 16.9 + 12.7, 29.6],
  // kvartal härledda
  ["Q2-25 oms 7 096 = 13 980−6 884", 13980 - 6884, 7096],
  ["Q2-26 oms 7 226 = 13 961−6 735", 13961 - 6735, 7226],
  ["Q2-26 oms YoY +1,8 %", 7226 / 7096 - 1, 0.0183],
  ["Q1-26 oms YoY −2,2 %", 6735 / 6884 - 1, -0.0216],
  ["Q2-26 res 3 857 = 4 424−567", 4424 - 567, 3857],
  ["Q2-25 res 1 598 = 2 544−946", 2544 - 946, 1598],
  ["Q2-26 res YoY +141 %", 3857 / 1598 - 1, 1.414],
  ["Q1-26 res YoY −40,1 %", 567 / 946 - 1, -0.401],
  ["Q3-25 oms 6 750 = 20 730−13 980", 20730 - 13980, 6750],
  ["Q4-25 oms 7 415 = 28 145−20 730", 28145 - 20730, 7415],
  ["Q3-25 res 1 222 = 3 766−2 544", 3766 - 2544, 1222],
  ["H1-26 oms YoY −0,1 %", 13961 / 13980 - 1, -0.0014],
  ["H1-26 res YoY +73,9 %", 4424 / 2544 - 1, 0.739],
  // tre världar
  ["IFRS-EK 42 819 = 133 937/3,128", 133937 / 3.128, 42819],
  ["substans/IFRS 2,88×", 123527 / 42819, 2.885],
  ["kurs/NAV 1,032", 209.5 / 203, 1.0320],
  ["kurs/NAV 204: 1,028", 209.8 / 204, 1.0284],
  ["aktieantal implicit 571,9 M", 123527 / 216, 571.9],
  ["aktieantal ur mcap 639 M", 133937 / 209.5, 639.4],
  // nettoskuld
  ["nettoskuldminskning årsskiftet→Q2 16,8 %", 1 - 13929 / 16751, 0.168],
  // utdelning
  ["årsutdelning 2 917 Mkr", 5.1 * 571.9, 2916.7],
  ["direktavkastning 2,43 %", 5.1 / 209.8, 0.0243],
  ["täckning 62 %", 1.8 / 2.917, 0.617],
  ["ASSA 86 %", 2.5 / 2.917, 0.857],
  ["utdelning/substans 2,36 %", 5.1 / 216, 0.0236],
  ["höjning 10,9 %", 5.1 / 4.6 - 1, 0.1087],
  ["ökning substans totalt 2025: +12,3 %", 123527 / 110061 - 1, 0.1232],
  ["204×1,029 ≈ 209,9", 204 * 1.029, 209.9],
];
for (const [namn, raknat, textForm] of A) {
  approx(raknat, textForm, 0.006) ? OK("aritmetik " + namn) : F(`aritmetik ${namn}: räknat ${raknat.toFixed(4)} mot förväntat ${textForm}`);
}
// textformer som måste finnas (formatkontroll av de oberoende räknade)
const textFinns = ["+11,5 %", "+1,0 %", "−4,9 %", "+3,2 %", "2,8 procent", "minus 6,0 procent", "minus 5,3", "29,6 procentenheter", "7 096", "7 226", "3 857", "1 598", "42 819", "2,88", "1,032", "571,9", "639", "16,8", "2 917", "62 procent", "86 procent", "10,9 procent", "123 527", "110 061", "13 929", "16 751", "12 281", "18 521", "6 750", "7 415", "1 222", "20 730", "18 871", "3 766", "74", "84", "97,8", "84,7", "62,4", "24,7", "13,0", "2,5 miljarder", "1,8 miljarder", "234,20", "206", "209,80", "131,8", "134", "193", "204", "203", "216", "215", "210", "207", "213", "218"];
for (const t of textFinns) body.includes(t) ? OK("textform " + t) : F("textform SAKNAS: " + t);

// ── 4. Medianer/rang LIVE ur 256-filen ─────────────────────────────────────
const fin = U.filter((x) => x.bransch === "finans");
fin.length === 37 ? OK("finansgrenen 37 bolag") : F("finansgrenen: " + fin.length);
const peV = fin.map((x) => x.vardering?.pe).filter((v) => v != null);
const pbV = fin.map((x) => x.vardering?.pb).filter((v) => v != null);
const evV = fin.map((x) => x.vardering?.evEbit).filter((v) => v != null);
const roeV = fin.map((x) => x.lonksamhet?.roe).filter((v) => v != null);
const pegV = fin.map((x) => x.vardering?.peg).filter((v) => v != null);
const mPe = +MED(peV).toFixed(2), mPb = +MED(pbV).toFixed(2), mEv = +MED(evV), mRoe = +MED(roeV), mPeg = +MED(pegV);
const fmtM = (v, d = 2) => v.toFixed(d).replace(".", ",");
const medKoll = [
  ["P/E-median " + fmtM(mPe), fmtM(mPe), Math.abs(mPe - 14.28) < 0.005],
  ["P/B-median " + fmtM(mPb), fmtM(mPb), Math.abs(mPb - 1.77) < 0.005],
  ["EV/EBIT-median " + fmtM(mEv, 1), fmtM(mEv, 1), Math.abs(mEv - 15.296) < 0.05],
  ["ROE-median " + fmtM(mRoe * 100, 1) + " %", fmtM(mRoe * 100, 1), Math.abs(mRoe - 0.131) < 0.0005],
  ["PEG-median " + fmtM(mPeg), fmtM(mPeg), Math.abs(mPeg - 1.22) < 0.005],
];
for (const [namn, textForm, sant] of medKoll) {
  sant && body.includes(textForm) ? OK("median " + namn) : F(`median ${namn}: ${sant ? "OK" : "AVVIKER"}; textform "${textForm}" ${body.includes(textForm) ? "finns" : "SAKNAS"}`);
}
const rang = (arr, v) => [...arr].sort((a, b) => a - b).indexOf(v) + 1;
body.includes("30 av 37") && rang(peV, 20.519) === 30 ? OK("P/E-rang 30 av 37") : F("P/E-rang: " + rang(peV, 20.519));
body.includes("32 av 37") && rang(pbV, 3.128) === 32 ? OK("P/B-rang 32 av 37") : F("P/B-rang: " + rang(pbV, 3.128));
body.includes("28 av 37") && rang(roeV, 0.156) === 28 ? OK("ROE-rang 28 av 37") : F("ROE-rang: " + rang(roeV, 0.156));
body.includes("av 20 mätta") && evV.length === 20 ? OK("EV/EBIT n 20") : F("EV/EBIT n: " + evV.length);
body.includes("34 mätta") && pegV.length === 34 ? OK("PEG n 34") : F("PEG n: " + pegV.length);

// ── 5. Juridik ──────────────────────────────────────────────────────────────
const lagrum = (body.match(/2007:\d+/g) || []);
lagrum.length === 1 && lagrum[0] === "2007:528" ? OK("exakt ett lagrum 2007:528") : F("lagrum: " + JSON.stringify(lagrum));
// rådverb — ordgräns; negerad standardfras vitlistas
const radRe = /\b(rekommenderar|rekommendation att köpa|rekommendation att sälja|tipsar|råd att köpa|råd att sälja|bör köpa|bör sälja|bör du köpa|bör du sälja|köp aktien|sälj aktien|strong buy|strong sell)\b/gi;
const radTräffar = [...body.matchAll(radRe)].filter((m) => !/inte en rekommendation att köpa|Inga köp-/i.test(body.slice(Math.max(0, m.index - 40), m.index + m[0].length + 10)));
radTräffar.length === 0 ? OK("rådverb 0") : F("rådverb: " + radTräffar.map((m) => m[0]).join(", "));
const sista = rader[rader.length - 1].trim();
sista.startsWith("*Detta är pedagogisk finansutbildning") && sista.includes("2007:528") && sista.includes("inte investeringsrådgivning") ? OK("disclaimer exakt sista raden") : F("disclaimer sista rad: " + sista.slice(0, 60));

// ── 6. Interna länkar ──────────────────────────────────────────────────────
const linkRe = /\]\((\/[^)]+)\)/g;
const lankar = [...new Set([...body.matchAll(linkRe)].map((m) => m[1]))];
const tillatna = new Set([
  "/dataset/finans/roe", "/dataset/finans/netto-marginal", "/dataset/finans/fcf-avkastning",
  "/dataset/finans/omsattningstillvaxt-ttm", "/dataset/finans/vardering", "/dataset/finans/pb",
  "/dataset/finans/pe", "/dataset/finans/ev-ebit", "/dataset/finans/skuldsattning",
  "/dataset/finans/universumjamforelse", "/bolag/lato-b-st", "/kurser", "/transparens",
]);
lankar.forEach((l) => tillatna.has(l) ? OK("länk tillåten " + l) : F("länk EJ tillåten: " + l));
lankar.length >= 12 ? OK("länkantal " + lankar.length) : F("för få unika länkar: " + lankar.length);
// publika slugs: bolag-slug måste vara i publiceringscachen
const cache = JSON.parse(readFileSync("data/cache/bolags-publicerade.json", "utf8"));
cache.slugs.includes("lato-b-st") ? OK("lato-b-st publicerad") : F("lato-b-st saknas i publiceringscache");
// --http-läge
if (process.argv.includes("--http")) {
  const hämta = (väg) => new Promise((res) => {
    const req = http.get({ host: "127.0.0.1", port: 3000, path: väg, timeout: 5000 }, (r) => { r.resume(); res(r.statusCode); });
    req.on("error", () => res(0)); req.on("timeout", () => { req.destroy(); res(0); });
  });
  const koder = await Promise.all(lankar.map(hämta));
  lankar.forEach((l, i) => (koder[i] === 200 ? OK("HTTP 200 " + l) : F(`HTTP ${koder[i]} ${l}`)));
} else {
  console.log("NOTIS: --http ej givet — länkar strukturkontrollerade (app-status kan avläsas separat)");
}

// ── 7. Språkgrind ───────────────────────────────────────────────────────────
const skrap = [
  ["NBSP", /\u00A0/], ["dubblettmellanslag", /  +/], ["undefined", /undefined/i], ["NaN", /\bNaN\b/],
  ["null i brödtext", /\bnull\b/], ["CJK", /[\u4e00-\u9fff]/], ["rak citattecken", /(?<!\d)"/],
];
for (const [namn, re] of skrap) {
  const t = body.match(new RegExp(re, "g"));
  !t ? OK("språk " + namn) : (namn === "dubblettmellanslag" && t.every((x) => x.length === 2) && body.includes("|---") ? W("språk " + namn + " (tabell-separatorer)") : F("språk " + namn + ": " + (t || []).length + " träffar"));
}

// ── 8. Ord/rm-kontrakt ──────────────────────────────────────────────────────
const ord = body.split(/\s+/).length;
ord >= 2600 && ord <= 3600 ? OK("ord " + ord + " inom familjepraxis") : F("ord utanför spann: " + ord);
p.readingMinutes === Math.max(3, Math.round(ord / 600)) ? OK("readingMinutes = round(ord/600) = " + p.readingMinutes) : F("readingMinutes: " + p.readingMinutes + " mot " + Math.round(ord / 600));
existsSync("verktyg/_s4u2-latour-data.json") && existsSync("verktyg/_s4u2-latour-byggdata.mjs") ? OK("talbank + motor på disk") : F("talbank/motor saknas");

console.log(`\nDOM: ${fel === 0 && varn === 0 ? "GRÖN" : fel === 0 ? "GRÖN med varningar" : "RÖD"} — ${pass} PASS, ${fel} FEL, ${varn} VARNING`);
process.exit(fel === 0 ? 0 : 1);
