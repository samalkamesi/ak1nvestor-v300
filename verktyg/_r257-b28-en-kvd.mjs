/**
 * r257 KVD — investmentbolag-en (engelsk översättning av B28 investmentbolag).
 *
 * r257 = SEO-spårets sista -en-objekt (spåret "v171 SEO" fortsätter; B28 är
 * branschomgångenens sista svenska original). Klaimfil
 * data/vakten/s3-b28-en-investmentbolag-ansprak-2026-09-25.md skriven FÖRE arbetet.
 *
 * Kontroller (original ↔ -en) — _v171-b27-en-kvd.mjs:s bevisade mall:
 *  1. BlogPost-form exakt + slug = originalets + "-en"
 *  2. TAL-PARITET språkmedveten multiset (SV mellanslagstusental/komma-decimal ↔
 *     EN komma-tusental/punkt-decimal; AR8/Ö14-klassen)
 *  3. Korslänkar href-multiset identiska (18 interna)
 *  4. Externa URL:er identiska (4 st: investorab/industrivarden/kinnevik/latour)
 *  5. Varumärkesgrinden — 26 regexer ur data/varumarke.json × 3 ytor = 0 FEL/0 VARN
 *  6. Rådverb SV+EN 0 (juridikgrinden)
 *  7. Sökord "investment companies" i title + ingress + H2
 *  8. title ≤ 60, description ≤ 155
 *  9. Ord raw 1150–1400
 * 10. readingMinutes = round(ord/600)
 * 11. Disclaimer engelsk form som sista rad
 * 12. H2-paritet 5=5 (+ H1-paritet 1=1)
 * 13. Motsvarigheter bevarade ("earnings are the weather, NAV is the climate"
 *     + "the balance sheet is the truth and the share price is an opinion")
 * 14. Aritmetik motorräknad (NAV-trappan, Kinnevik-rabatten, Investor-premien,
 *     förlustsumman, svängningsbeviset, Latour-CAGR, spannet, medianen, P/B-kvoten,
 *     checklistans 5 steg)
 * 15. Svenska läckor 0 (URL:er/href:ar + egennamn/koder vitlistade)
 */
import { readFileSync } from "node:fs";

const ORIG = "data/blogg-utkast/investmentbolag-sa-analyserar-du-investmentbolag.json";
const EN = "data/blogg-utkast/investmentbolag-sa-analyserar-du-investmentbolag-en.json";
const SOKORD = "investment companies";

const BLOGFALT = ["slug", "title", "description", "pillar", "author", "publishedAt", "readingMinutes", "tags", "body"];
const varumarke = JSON.parse(readFileSync("data/varumarke.json", "utf8"));
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

const SV_ORD = [
  "och", "eller", "att", "som", "är", "var", "varit", "en", "ett", "på", "med",
  "av", "för", "till", "från", "inte", "men", "denna", "detta", "här", "där",
  "så", "kan", "skall", "ska", "vill", "ger", "tar", "får", "bli", "blir",
  "även", "alla", "många", "mycket", "lite", "endast", "ju", "väl", "nämligen",
  "exempel", "empel", "kapitel", "källa", "källor", "steg", "bolag", "bolaget",
  "aktier", "pris", "intäkt", "intäkter", "kostnad", "kostnader",
];

// Q-kvartalsnormalisering (AR8/Ö14-klassen): "Q4 2025" → "Q4_2025" på BÅDA sidor —
// talSV:s girighet över mellanslag smälter annars ihop "4 2025"→"42025" medan talEN
// ger "4"+"2025"; under strecket är talinnehållet identiskt, tokeniseringen måste vara det med.
const qNorm = (s) => s.replace(/([Qq])([1-4]) (\d{4})/g, "$1$2_$3");
const talSV = (s) =>
  (qNorm(s).match(/\d[\d\s]*(?:,\d+)?/g) || [])
    .map((t) => t.replace(/\s+/g, "").replace(",", "."))
    .filter((t) => /\d/.test(t));
const talEN = (s) =>
  (qNorm(s).match(/\d+(?:[.,]\d+)?/g) || [])
    .map((t) => (/,\d{3}$/.test(t) ? t.replace(",", "") : t.replace(",", ".")));

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
const E = JSON.parse(readFileSync(EN, "utf8"));
console.log(`\n=== ${EN.split("/").pop()} ===`);

// 1. Form + slug
rapp(JSON.stringify(Object.keys(E)) === JSON.stringify(BLOGFALT), "BlogPost-form exakt", Object.keys(E).join(","));
rapp(E.slug === O.slug + "-en", "slug = originalets + -en", `${O.slug} → ${E.slug}`);
rapp(E.publishedAt === O.publishedAt && E.pillar === O.pillar && E.author === O.author, "metadata identisk (publishedAt/pillar/author)");
rapp(E.tags.length === O.tags.length, `tags ${E.tags.length}/${O.tags.length} (originalets, översatta)`);

// 2. TAL-PARITET språkmedveten
const talO = talSV(O.description + " " + O.body);
const talE = talEN(E.description + " " + E.body);
const mO = multiset(talO);
const mE = multiset(talE);
rapp(likaMultiset(mO, mE), `TAL-PARITET språkmedveten multiset (${talO.length} tal)`,
  likaMultiset(mO, mE) ? "" : `endast original: ${[...mO].filter(([k, v]) => mE.get(k) !== v).map(([k, v]) => k + "×" + v)}; endast -en: ${[...mE].filter(([k, v]) => mO.get(k) !== v).map(([k, v]) => k + "×" + v)}`);

// 3. Korslänkar
const lO = lankarUr(O.body);
const lE = lankarUr(E.body);
rapp(likaMultiset(multiset(lO), multiset(lE)), `Korslänkar multiset (${lO.length} st)`,
  likaMultiset(multiset(lO), multiset(lE)) ? "" : `O:${JSON.stringify(lO)} E:${JSON.stringify(lE)}`);

// 4. Externa URL:er
const uO = urlerUr(O.body).sort();
const uE = urlerUr(E.body).sort();
rapp(JSON.stringify(uO) === JSON.stringify(uE), `Externa URL:er identiska (${uO.length} st)`,
  JSON.stringify(uO) === JSON.stringify(uE) ? "" : `O:${JSON.stringify(uO)} E:${JSON.stringify(uE)}`);

// 5. Varumärkesgrind × 3 ytor
let felTr = 0;
let varTr = 0;
for (const yta of [E.title, E.description, E.body]) {
  for (const { allvar, kalla, re } of franRegexar) {
    re.lastIndex = 0;
    const n = (yta.match(re) || []).length;
    if (n > 0 && allvar === "FEL") { felTr += n; console.log(`    FEL-träff: /${kalla}/ ×${n}`); }
    if (n > 0 && allvar === "VARNING") varTr += n;
  }
}
rapp(felTr === 0 && varTr === 0, `Varumärkesgrind ${franRegexar.length} regexer × 3 ytor (FEL ${felTr}, VARNING ${varTr})`);

// 6. Rådverb SV+EN
const radTr = [...radverbEN, ...radverbSV].flatMap((re) => E.body.match(re) || []);
rapp(radTr.length === 0, "Rådverb SV+EN 0 träffar", radTr.join("; "));

// 7. Sökord i title + ingress + H2
const ingress = E.body.split("\n\n")[0];
const h2 = [...E.body.matchAll(/^## (.+)$/gm)].map((m) => m[1]);
const sok = SOKORD.toLowerCase();
rapp(
  E.title.toLowerCase().includes(sok) && ingress.toLowerCase().includes(sok) &&
    h2.some((h) => h.toLowerCase().includes(sok)),
  `Sökord "${SOKORD}" i title+ingress+H2`,
  `title:${E.title.toLowerCase().includes(sok)} ingress:${ingress.toLowerCase().includes(sok)} H2:${h2.filter((h) => h.toLowerCase().includes(sok)).length}/${h2.length}`
);

// 8. Längder
rapp(E.title.length <= 60, `title ${E.title.length}/60`);
rapp(E.description.length <= 155, `description ${E.description.length}/155`);

// 9. Ord raw (1150–1400)
const ordO = ordRaw(O.body);
const ordE = ordRaw(E.body);
rapp(ordE >= 1150 && ordE <= 1400, `ord raw ${ordE}/1400 (gräns 1150–1400; originalet ${ordO}, +${Math.round((ordE / ordO - 1) * 100)} %)`);

// 10. readingMinutes
rapp(E.readingMinutes === Math.round(ordE / 600), `readingMinutes ${E.readingMinutes} = round(${ordE}/600)`);

// 11. Disclaimer
const sista = E.body.trim().split("\n").pop().trim();
rapp(/^_This is educational financial analysis, not investment advice\._$/.test(sista), "Disclaimer engelsk form", sista);

// 12. H2-paritet + H1-paritet
const h2O = (O.body.match(/^## /gm) || []).length;
rapp(h2O === h2.length, `H2-struktur ${h2.length}/${h2O}`);
const h1O = (O.body.match(/^# /gm) || []).length;
const h1E = (E.body.match(/^# /gm) || []).length;
rapp(h1O === h1E, `H1-struktur ${h1E}/${h1O}`);

// 13. Motsvarigheter bevarade
const saknas = [
  "earnings are the weather, NAV is the climate",
  "the balance sheet is the truth and the share price is an opinion",
].filter((a) => !E.body.includes(a));
rapp(saknas.length === 0, 'Motsvarigheter bevarade ("weather/climate" + "truth/opinion")', saknas.join(", "));

// 14. Aritmetik motorräknad (B28:s egna exempel — speglar _s3u1-b28-kvd-investmentbolag.mjs)
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
j("checklistans steg = 5", (E.body.match(/^\d\. \*\*/gm) || []).length === 5);
j("P/B-trappans fyra värden i texten (0.598/1.03/1.159/3.13)", ["0.598", "1.03", "1.159", "3.13"].every((t) => E.body.includes(t)));
for (const [namn, ok, detalj] of ari) rapp(ok, `aritmetik: ${namn}`, detalj || "");

// 15. Svenska läckor 0
const rensad = E.body
  .replace(/https?:\/\/\S+/g, " ")
  .replace(/\[[^\]]*\]\([^)]*\)/g, " ")
  .replace(/\bIndustrivärden\b|\bKinnevik\b|\bLatour\b|\bInvestor\b|\bWallenberg\b|\bMarket\b|\bMr\b/g, " ")
  .replace(/\bAK1A\b|\bIFRS\b|\bROE\b|\bROIC\b|\bP\/E\b|\bEV\/EBIT\b|\bTTM\b|\bQ[1-4]\b|\bP\/B\b|\bNAV\b|\bEBIT\b|\bAB\b|\bYahoo\b|\bMarketStack\b/g, " ");
const lek = SV_ORD.filter((w) => new RegExp(`(?<![\\p{L}])${w}(?![\\p{L}])`, "iu").test(rensad));
rapp(lek.length === 0, `Svenska läckor 0 (URL:er/href:ar + egennamn/koder vitlistade)`, lek.join(", "));

console.log(`\nSLUTRESULTAT: ${fel === 0 ? "ALLT GRÖNT" : fel + " RÖDA"}`);
process.exit(fel === 0 ? 0 : 1);
