/**
 * r259 KVD — investmentbolag-ar (arabisk översättning av B28 investmentbolag, AR30).
 *
 * r259 = sista -ar-objektet i SEO-spårets branschguidefamilj (v171). Klaimfil
 * data/vakten/s3-b28-ar-investmentbolag-ansprak-2026-09-26.md skriven FÖRE arbetet.
 *
 * Mall: _r257-b28-en-kvd.mjs (B28-engelskans struktur) med AR-konventioner från
 * _r191-ar29-kvd.mjs (senaste bevisade -ar-leveransen): västerländska siffror,
 * punktdecimal, komma-tusental, "بالمئة" för procent, rådverb SV+EN+AR,
 * disclaimer arabisk exakt sista rad, latinsk token-läckkontroll.
 *
 * Kontroller (original ↔ -ar):
 *  1. BlogPost-form exakt + slug = originalets + "-ar" + publishedAt = leveransdagen
 *     2026-09-26 (AR-spårets konvention sedan AR24; AR29 kontrollerade samma sak)
 *  2. TAL-PARITET språkmedveten multiset (SV mellanslagstusental/komma-decimal ↔
 *     AR komma-tusental/punktdecimal; href:ar + Q-etiketter strippas symmetriskt)
 *  3. Korslänkar href-multiset identiska (18 interna)
 *  4. Externa URL:er identiska (4 st: investorab/industrivarden/kinnevik/latour)
 *  5. Varumärkesgrinden — regexer ur data/varumarke.json × 3 ytor = 0 FEL/0 VARN
 *  6. Rådverb SV+EN+AR 0 träffar (juridikgrinden — ren utbildning)
 *  7. Sökord "شركات الاستثمار" i title + H1 + ingress + minst 2 H2
 *  8. title ≤ 60, description ≤ 155 (kodpunkter — arabiska tecken räknas som 1)
 *  9. Ord raw 1150–1400 (originalet 1 220 — paritet; AR29 landade 1 153)
 * 10. readingMinutes = round(ord/600)
 * 11. Disclaimer arabisk form exakt som sista rad
 * 12. H2-paritet 5=5 (+ H1-paritet 1=1)
 * 13. Motsvarigheter bevarade ("النتيجة هي الطقس، والقيمة الجوهرية هي المناخ"
 *     + "الميزانية هي الحقيقة والسعر رأي فيها")
 * 14. Aritmetik motorräknad (NAV-trappan, Kinnevik-rabatten, Investor-premien,
 *     förlustsumman, svängningsbeviset, Latour-CAGR, spannet, medianen, P/B-kvoten,
 *     checklistans 5 steg, trappans fyra värden i texten)
 * 15. Läckor 0: svenska ord (SV_ORD) + latinska token utanför vitlistan
 *     (URL:er/href:ar + varumärken/koder strippas först)
 */
import { readFileSync } from "node:fs";

const ROTT = "/home/ak1a/agent/ak1";
const ORIG = `${ROTT}/data/blogg-utkast/investmentbolag-sa-analyserar-du-investmentbolag.json`;
const AR = `${ROTT}/data/blogg-utkast/investmentbolag-sa-analyserar-du-investmentbolag-ar.json`;
const SOKORD = "شركات الاستثمار";
const LEVERANSDAG = "2026-09-26";

const BLOGFALT = ["slug", "title", "description", "pillar", "author", "publishedAt", "readingMinutes", "tags", "body"];
const varumarke = JSON.parse(readFileSync(`${ROTT}/data/varumarke.json`, "utf8"));
const franRegexar = varumarke.forbjudnaFraser.map((f) => ({
  allvar: f.allvar,
  kalla: f.fran,
  re: new RegExp(f.fran, "giu"),
}));

const radverbEN = [
  /\b(?:you|we|readers?|investors?)\s+(?:should|must)\s+(?:buy|sell|avoid|pick|grab)\b/i,
  /\b(?:buy|sell|grab|snap\s+up)\s+(?:this|the)\s+(?:stock|share|company)\b/i,
  /\b(?:our|my)\s+(?:top\s+)?recommendation\b/i,
  /\brecommend\s+(?:buying|selling|that\s+you)\b/i,
  /\bbest\s+stock\s+to\s+buy\b/i,
  /\bhot\s+stock\b/i,
  /\bact\s+now\b/i,
];
const radverbSV = [
  /\bköp\s+(?:denna|denne|denna här|aktien)\b/i,
  /\bsälj\s+(?:dina\s+)?aktier\b/i,
  /\bmin\s+rekommendation\b/i,
  /\bvi\s+rekommenderar\b/i,
  /\bdet\s+är\s+en\s+(?:bra|dålig)\s+köp\b/i,
];
// AR29:s arabiska rådsfraslista (imperativuppmaningar + rekommendationsfraser)
const radverbAR = /(اشترِ|بِعْ|استثمر في هذا|أنصحك|نوصي بشراء|نصيحتي إليك)/g;

const SV_ORD = [
  "och", "eller", "att", "som", "är", "var", "varit", "en", "ett", "på", "med",
  "av", "för", "till", "från", "inte", "men", "denna", "detta", "här", "där",
  "så", "kan", "skall", "ska", "vill", "ger", "tar", "får", "bli", "blir",
  "även", "alla", "många", "mycket", "lite", "endast", "ju", "väl", "nämligen",
  "exempel", "empel", "kapitel", "källa", "källor", "steg", "bolag", "bolaget",
  "aktier", "pris", "intäkt", "intäkter", "kostnad", "kostnader", "mot", "mellan",
];

// Symmetrisk rensning före tal-extraktion (AR29-klass): URL:ar + markdown-href:ar +
// kvartalsetiketter (Q3 2025 = formatkod, inte innehållstal) bort på BÅDA sidor —
// href:arna är dessutom byte-identiska (kontroll 3), så deras siffror är redan paritet.
const rensad = (t) =>
  t.replace(/https?:\/\/[^\s)\]]+/g, " ").replace(/\]\([^)]*\)/g, "]").replace(/\bQ([1-4])\b/g, " ");
const talSV = (s) =>
  (rensad(s).replace(/(\d)[ ](\d{3})(?![\d])/g, "$1$2").replace(/,(\d+)/g, ".$1").match(/\d+(?:\.\d+)?/g) || []);
const talAR = (s) =>
  (rensad(s).replace(/(\d),(\d{3})(?![\d,])/g, "$1$2").match(/\d+(?:\.\d+)?/g) || []);

const multiset = (arr) => {
  const m = new Map();
  for (const x of arr) m.set(x, (m.get(x) || 0) + 1);
  return m;
};
const likaMultiset = (a, b) => {
  if (a.size !== b.size) return false;
  for (const [k, v] of a) if (b.get(k) !== v) return false;
  return true;
};
const lankarUr = (body) => [...body.matchAll(/\]\((\/[^)]+)\)/g)].map((m) => m[1]);
const urlerUr = (body) => [...body.matchAll(/https?:\/\/[^ \n)]+/g)].map((m) => m[0]);
const ordRaw = (body) =>
  body
    .replace(/https?:\/\/\S+/g, " ")
    .replace(/\[([^\]]*)\]\([^)]*\)/g, "$1")
    .replace(/[#*_>]/g, " ")
    .split(/\s+/)
    .filter(Boolean).length;

let fel = 0;
const rapp = (ok, namn, detalj) => {
  if (!ok) fel++;
  console.log(`  ${ok ? "GRÖN" : "RÖD "} ${namn}${detalj ? " — " + detalj : ""}`);
};

const O = JSON.parse(readFileSync(ORIG, "utf8"));
const A = JSON.parse(readFileSync(AR, "utf8"));
console.log(`\n=== ${AR.split("/").pop()} ===`);

// 1. Form + slug + metadata
rapp(JSON.stringify(Object.keys(A)) === JSON.stringify(BLOGFALT), "BlogPost-form exakt", Object.keys(A).join(","));
rapp(A.slug === O.slug + "-ar", "slug = originalets + -ar", `${O.slug} → ${A.slug}`);
rapp(A.pillar === O.pillar && A.author === O.author, "metadata identisk (pillar/author)", `${A.pillar} / ${A.author}`);
rapp(A.publishedAt === LEVERANSDAG, `publishedAt = leveransdagen ${LEVERANSDAG} (AR-konventionen)`, `${A.publishedAt} (originalet ${O.publishedAt})`);
rapp(A.tags.length === O.tags.length, `tags ${A.tags.length}/${O.tags.length} (originalets antal, översatta)`);

// 2. TAL-PARITET språkmedveten
const talO = talSV(O.description + " " + O.body);
const talA = talAR(A.description + " " + A.body);
const mO = multiset(talO);
const mA = multiset(talA);
rapp(likaMultiset(mO, mA), `TAL-PARITET språkmedveten multiset (${talO.length} tal)`,
  likaMultiset(mO, mA) ? "" : `endast original: ${[...mO].filter(([k, v]) => mA.get(k) !== v).map(([k, v]) => k + "×" + v)}; endast -ar: ${[...mA].filter(([k, v]) => mO.get(k) !== v).map(([k, v]) => k + "×" + v)}`);

// 3. Korslänkar
const lO = lankarUr(O.body);
const lA = lankarUr(A.body);
rapp(likaMultiset(multiset(lO), multiset(lA)), `Korslänkar multiset (${lO.length} st)`,
  likaMultiset(multiset(lO), multiset(lA)) ? "" : `O:${JSON.stringify(lO)} A:${JSON.stringify(lA)}`);

// 4. Externa URL:er
const uO = urlerUr(O.body).sort();
const uA = urlerUr(A.body).sort();
rapp(JSON.stringify(uO) === JSON.stringify(uA), `Externa URL:er identiska (${uO.length} st)`,
  JSON.stringify(uO) === JSON.stringify(uA) ? uA.map((u) => u.replace(/^https?:\/\//, "").split("/")[0]).join(" + ") : `O:${JSON.stringify(uO)} A:${JSON.stringify(uA)}`);

// 5. Varumärkesgrind × 3 ytor
let felTr = 0;
let varTr = 0;
for (const yta of [A.title, A.description, A.body]) {
  for (const { allvar, kalla, re } of franRegexar) {
    re.lastIndex = 0;
    const n = (yta.match(re) || []).length;
    if (n > 0 && allvar === "FEL") { felTr += n; console.log(`    FEL-träff: /${kalla}/ ×${n}`); }
    if (n > 0 && allvar === "VARNING") varTr += n;
  }
}
rapp(felTr === 0 && varTr === 0, `Varumärkesgrind ${franRegexar.length} regexer × 3 ytor (FEL ${felTr}, VARNING ${varTr})`);

// 6. Rådverb SV+EN+AR
radverbAR.lastIndex = 0;
const radTr = [...radverbEN, ...radverbSV].flatMap((re) => A.body.match(re) || []).concat(A.body.match(radverbAR) || []);
rapp(radTr.length === 0, "Rådverb SV+EN+AR 0 träffar (juridikgrinden)", radTr.join("; "));

// 7. Sökord i title + H1 + ingress + minst 2 H2
const block0 = A.body.split("\n\n")[0]; // H1-raden
const ingress = A.body.split("\n\n")[1]; // första stycket efter H1
const h2 = [...A.body.matchAll(/^## (.+)$/gm)].map((m) => m[1]);
const h2Traff = h2.filter((h) => h.includes(SOKORD)).length;
rapp(
  A.title.includes(SOKORD) && block0.includes(SOKORD) && ingress.includes(SOKORD) && h2Traff >= 2,
  `Sökord "${SOKORD}" i title+H1+ingress+≥2 H2`,
  `title:${A.title.includes(SOKORD)} H1:${block0.includes(SOKORD)} ingress:${ingress.includes(SOKORD)} H2:${h2Traff}/${h2.length}`
);

// 8. Längder (kodpunkter)
rapp([...A.title].length <= 60, `title ${[...A.title].length}/60`);
rapp([...A.description].length <= 155, `description ${[...A.description].length}/155`);

// 9. Ord raw (1150–1400)
const ordO = ordRaw(O.body);
const ordA = ordRaw(A.body);
rapp(ordA >= 1150 && ordA <= 1400, `ord raw ${ordA} (gräns 1150–1400; originalet ${ordO}, ${Math.round((ordA / ordO - 1) * 100)} %)`);

// 10. readingMinutes
rapp(A.readingMinutes === Math.round(ordA / 600), `readingMinutes ${A.readingMinutes} = round(${ordA}/600)`);

// 11. Disclaimer
const sista = A.body.trim().split("\n").pop().trim();
rapp(sista === "_هذا تحليل مالي تعليمي، وليس نصيحة استثمارية._", "Disclaimer arabisk form exakt sista rad", sista);

// 12. H2-paritet + H1-paritet
const h2O = (O.body.match(/^## /gm) || []).length;
rapp(h2O === h2.length, `H2-struktur ${h2.length}/${h2O}`);
const h1O = (O.body.match(/^# /gm) || []).length;
const h1A = (A.body.match(/^# /gm) || []).length;
rapp(h1O === h1A, `H1-struktur ${h1A}/${h1O}`);

// 13. Motsvarigheter bevarade (B28:s två metaforer)
const saknas = [
  "النتيجة هي الطقس، والقيمة الجوهرية هي المناخ",
  "الميزانية هي الحقيقة والسعر رأي فيها",
].filter((a) => !A.body.includes(a));
rapp(saknas.length === 0, "Motsvarigheter bevarade (väder/klimat + sanning/åsikt)", saknas.join(", "));

// 14. Aritmetik motorräknad (B28:s egna exempel — identiska med _r257-b28-en-kvd.mjs)
const ari = [];
const j = (namn, villkor, detalj) => ari.push([namn, villkor, detalj]);
j("NAV-trappa 355→397 = +11,8 %", Math.abs(397 / 355 * 100 - 100 - 11.8) < 0.051, `motor ${(397 / 355 * 100 - 100).toFixed(3)}`);
j("Kinnevik rabatt 40,2 % ur P/B 0,598", Math.abs((1 - 0.598) * 100 - 40.2) < 1e-9);
j("Investor premie ~16 % ur P/B 1,159", Math.abs((1.159 - 1) * 100 - 16) < 0.51, `motor ${((1.159 - 1) * 100).toFixed(2)}`);
j("Kinnevik förlustsumma 30,3 mdr (19 519+4 766+2 623+3 346 Mkr)", Math.abs((19519 + 4766 + 2623 + 3346) / 1000 - 30.3) < 0.051, `motor ${((19519 + 4766 + 2623 + 3346) / 1000).toFixed(3)}`);
j("Industrivärden svängning >40 mdr (26 594+13 967 = 40 561)", (26594 + 13967) / 1000 > 40, `motor ${((26594 + 13967) / 1000).toFixed(3)}`);
j("Latour CAGR ~7,6 %/år (22 611→28 145 på 3 år)", Math.abs((Math.pow(28145 / 22611, 1 / 3) - 1) * 100 - 7.6) < 0.051, `motor ${((Math.pow(28145 / 22611, 1 / 3) - 1) * 100).toFixed(3)}`);
j("spann 3,128/0,598 > 5×", 3.128 / 0.598 > 5, `motor ${(3.128 / 0.598).toFixed(3)}`);
j("median P/B 1,09 av (0,598 1,029 1,159 3,128)", Math.abs((1.029 + 1.159) / 2 - 1.09) < 0.051, `motor ${((1.029 + 1.159) / 2).toFixed(4)}`);
j("P/B 1,159 av kurs 410,75 / substans 354,4", Math.abs(410.75 / 354.4 - 1.159) < 0.051, `motor ${(410.75 / 354.4).toFixed(4)}`);
j("checklistans steg = 5", (A.body.match(/^\d\. \*\*/gm) || []).length === 5);
j("P/B-trappans fyra värden i texten (0.598/1.03/1.159/3.13)", ["0.598", "1.03", "1.159", "3.13"].every((t) => A.body.includes(t)));
for (const [namn, ok, detalj] of ari) rapp(ok, `aritmetik: ${namn}`, detalj || "");

// 15. Läckor 0 — svenska ord + latinska token (varumärken/koder strippas först)
const rensadLacka = A.body
  // Markdown-länkar först (text+href som enhet) — annars äter URL-strippen
  // slutparentesen i "](url)._" och länktexten ("Investment AB Latour") läcker
  .replace(/\[[^\]]*\]\([^)]*\)/g, " ")
  .replace(/https?:\/\/\S+/g, " ")
  .replace(/\b(?:Industrivärden|Investor|Latour|Kinnevik|Wallenberg|AK1A|Yahoo|Finance|MarketStack|IFRS|ROE|EBIT|NAV|AB)\b/g, " ")
  .replace(/\bP\/E\b|\bP\/B\b|\bQ[1-4]\b/g, " ");
const latin = [...new Set(rensadLacka.match(/[A-Za-z][A-Za-z0-9&.\-]*/g) || [])];
const lek = SV_ORD.filter((w) => new RegExp(`(?<![\\p{L}])${w}(?![\\p{L}])`, "iu").test(rensadLacka));
rapp(latin.length === 0 && lek.length === 0, "Läckor 0 (svenska ord + latinska token; varumärken/koder/URL:ar strippade)", [...lek, ...latin].join(", "));

console.log(`\nSLUTRESULTAT: ${fel === 0 ? "ALLT GRÖNT" : fel + " RÖDA"}`);
process.exit(fel === 0 ? 0 : 1);
