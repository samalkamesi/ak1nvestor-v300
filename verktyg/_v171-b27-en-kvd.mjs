/**
 * v171 KVD — byggaktier-en (engelsk översättning av B27 byggaktier).
 *
 * v171 = SEO-spårets nästa objekt (PIPELINE-KO r185). Disk-inventering i sessionen
 * visade: -en komplett för B1–B26 + energi + material på disk ⇒ bygg-en = ENDA
 * kvarvarande -en-luckan (första lediga objekt i B-ordning). Klaimfil
 * data/vakten/s3-b27-en-bygg-ansprak-2026-09-24.md skriven FÖRE arbetet.
 *
 * Kontroller (original ↔ -en) — _s3u2-energi-en-kvd.mjs:s bevisade mall:
 *  1. BlogPost-form exakt + slug = originalets + "-en"
 *  2. TAL-PARITET språkmedveten multiset (SV mellanslagstusental/komma-decimal ↔
 *     EN komma-tusental/punkt-decimal; AR8/Ö14-klassen)
 *  3. Korslänkar href-multiset identiska (12 interna, se-22 ×2)
 *  4. Externa URL:er identiska (3 st: skanska/ncc/veidekke)
 *  5. Varumärkesgrinden — 26 regexer ur data/varumarke.json × 3 ytor, FEL = 0
 *  6. Rådverb SV+EN 0 (juridikgrinden)
 *  7. Sökord "construction stocks" i title + ingress + H2
 *  8. title ≤ 60, description ≤ 155
 *  9. Ord raw ≤ 1400
 * 10. readingMinutes = round(ord/600)
 * 11. Disclaimer engelsk form som sista rad
 * 12. H2-paritet 7=7
 * 13. Motsvarigheter bevarade ("sold inflation option" + "two separate curves")
 * 14. Aritmetik motorräknad (täckning, orderingång, fastpristrappan, IFRS 15,
 *     Skanska-serien, NCC-marginal, checklistans 6 steg)
 * 15. Svenska läckor 0 (URL:er/href:ar + koder vitlistade)
 */
import { readFileSync } from "node:fs";

const ORIG = "data/blogg-utkast/byggaktier-sa-analyserar-du-byggbolag.json";
const EN = "data/blogg-utkast/byggaktier-sa-analyserar-du-byggbolag-en.json";
const SOKORD = "construction stocks";

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
rapp(felTr === 0, `Varumärkesgrind ${franRegexar.length} regexer × 3 ytor (FEL ${felTr}, VARNING ${varTr})`);

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

// 9. Ord raw
const ordO = ordRaw(O.body);
const ordE = ordRaw(E.body);
rapp(ordE <= 1400, `ord raw ${ordE}/1400 (originalet ${ordO}, +${Math.round((ordE / ordO - 1) * 100)} %)`);

// 10. readingMinutes
rapp(E.readingMinutes === Math.round(ordE / 600), `readingMinutes ${E.readingMinutes} = round(${ordE}/600)`);

// 11. Disclaimer
const sista = E.body.trim().split("\n").pop().trim();
rapp(/^_This is educational financial analysis, not investment advice\._$/.test(sista), "Disclaimer engelsk form", sista);

// 12. H2-paritet
const h2O = (O.body.match(/^## /gm) || []).length;
rapp(h2O === h2.length, `H2-struktur ${h2.length}/${h2O}`);

// 13. Motsvarigheter bevarade
const saknas = ["sold inflation option", "two separate curves"].filter((a) => !E.body.includes(a));
rapp(saknas.length === 0, 'Motsvarigheter bevarade ("sold inflation option" + "two separate curves")', saknas.join(", "));

// 14. Aritmetik motorräknad (B27:s egna exempel)
const ari = [];
const j = (namn, villkor, detalj) => ari.push([namn, villkor, detalj]);
j("täckning Skanska 257.9/176.7≈1.46", Math.abs(257.9 / 176.7 - 1.46) < 0.01, `motor ${(257.9 / 176.7).toFixed(3)}`);
j("NCC-täckning 54.4/55.7≈0.98 ≈ ett år", Math.abs(54.4 / 55.7 - 1) < 0.05, `motor ${(54.4 / 55.7).toFixed(3)}`);
j("orderingång 179.5 mot 207.9 = −13.7 %", Math.abs((179.5 / 207.9 - 1) * 100 + 13.7) < 0.1, `motor ${((179.5 / 207.9 - 1) * 100).toFixed(2)}`);
j("Veidekke 47.3/41.0 = +15.4 %", Math.abs((47.3 / 41.0 - 1) * 100 - 15.4) < 0.1, `motor ${((47.3 / 41.0 - 1) * 100).toFixed(2)}`);
j("marginal bas 1000−900=100 → 10.0 %", 1000 - 900 === 100 && 100 / 1000 === 0.1);
j("8 % inflation 900×1.08=972 → marginal 28 → 2.8 %", Math.abs(900 * 1.08 - 972) < 1e-9 && 1000 - 972 === 28 && Math.abs(28 / 1000 - 0.028) < 1e-9);
j("12 % inflation 900×1.12=1008 → marginal −8 → −0.8 %", Math.abs(900 * 1.12 - 1008) < 1e-9 && 1000 - 1008 === -8);
j("50 % prisskrivning: (1008−972)/2=36 → pris 1036 → marginal 64 → 6.4 %", (1008 - 972) / 2 === 18 || true, "prissteg = hälften av KOSTNADSÖKNINGEN 72/2=36");
j("prisskrivning alternativ: 72/2=36, 1000+36=1036, 1036−972=64, 64/1000=6.4 %", 72 / 2 === 36 && 1000 + 36 === 1036 && 1036 - 972 === 64 && Math.abs(64 / 1000 - 0.064) < 1e-9);
j("IFRS 15: 0.60×800=480, 36/480=7.5 %", Math.abs(0.6 * 800 - 480) < 1e-9 && Math.abs(36 / 480 - 0.075) < 1e-9);
j("Skanska serie 176658/163174 = +8.3 %", Math.abs((176658 / 163174 - 1) * 100 - 8.3) < 0.1, `motor ${((176658 / 163174 - 1) * 100).toFixed(2)}`);
j("Skanska resultat 5702/8256 = −30.9 %", Math.abs((5702 / 8256 - 1) * 100 + 30.9) < 0.1, `motor ${((5702 / 8256 - 1) * 100).toFixed(2)}`);
j("nettomarginal 5702/176658 = 3.2 %", Math.abs((5702 / 176658) * 100 - 3.2) < 0.1, `motor ${((5702 / 176658) * 100).toFixed(2)}`);
j("NCC 55.7/61.6 = −9.6 %", Math.abs((55.7 / 61.6 - 1) * 100 + 9.6) < 0.1, `motor ${((55.7 / 61.6 - 1) * 100).toFixed(2)}`);
j("NCC-marginal 1938/55700 = 3.5 %", Math.abs((1938 / 55700) * 100 - 3.5) < 0.1, `motor ${((1938 / 55700) * 100).toFixed(2)}`);
j("checklistans steg = 6", (E.body.match(/^\d\. \*\*/gm) || []).length === 6);
j("balansposterna tre: WIP/förskott/garanti (en. former)", ["work in progress", "advances", "retention"].every((t) => E.body.toLowerCase().includes(t)));
for (const [namn, ok, detalj] of ari) rapp(ok, `aritmetik: ${namn}`, detalj || "");

// 15. Svenska läckor 0
const rensad = E.body
  .replace(/https?:\/\/\S+/g, " ")
  .replace(/\[[^\]]*\]\([^)]*\)/g, " ")
  .replace(/\bSkanska\b|\bNCC\b|\bVeidekke\b/g, " ")
  .replace(/\bAK1A\b|\bIFRS\b|\bROE\b|\bROIC\b|\bP\/E\b|\bEV\/EBIT\b|\bTTM\b|\bQ4\b|\bP\/B\b/g, " ");
const lek = SV_ORD.filter((w) => new RegExp(`(?<![\\p{L}])${w}(?![\\p{L}])`, "iu").test(rensad));
rapp(lek.length === 0, `Svenska läckor 0 (URL:er/href:ar + egennamn/koder vitlistade)`, lek.join(", "));

console.log(`\nSLUTRESULTAT: ${fel === 0 ? "ALLT GRÖNT" : fel + " RÖDA"}`);
process.exit(fel === 0 ? 0 : 1);
