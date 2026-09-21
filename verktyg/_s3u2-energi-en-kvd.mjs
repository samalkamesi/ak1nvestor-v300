/**
 * s3-u2 KVD — energi-en (engelsk översättning av sa-analyserar-du-energiaktier).
 *
 * Spår 3, manifest auto-s3-1789983925327. Originalet = energi-guiden (levererad
 * utan B-rad, "föregående omgång" enligt mallen); -en-omgången B1–B23 (Ö1–Ö23)
 * är komplett ⇒ energi-en = nästa lediga -en-lucka (AR23-ar var klaimat av
 * annat syskon och lämnades orörd enligt Ö5-precedensen).
 *
 * Kontroller (original ↔ -en):
 *  1. BlogPost-form exakt + slug = originalets + "-en"
 *  2. TAL-PARITET språkmedveten — SV: mellanslagstusental "3 400"→3400,
 *     komma=decimal; EN: komma med exakt 3 siffror=tusental "3,400"→3400,
 *     punkt=decimal. Multiset (varje tal lika många gånger på båda sidor).
 *     (AR8/Ö14-klassens normalisering.)
 *  3. Korslänkar — href-multiset identisk (inga nya ytor, inga borttappade)
 *  4. Externa URL:er — identisk uppsättning
 *  5. Varumärkesgrinden — alla 26 regexer ur data/varumarke.json × 3 ytor
 *     (title/description/body), FEL = 0 krävs, VARNING rapporteras
 *  6. Rådverb SV+EN — juridikgrinden: 0 träffar krävs
 *  7. Sökordsdisciplin — "energy stocks" i title + ingress + H2
 *  8. title ≤ 60 tkn, description ≤ 155 tkn
 *  9. Ord raw (länktext avkodad, URL:er bort) ≤ 1400
 * 10. readingMinutes = round(ord/600)
 * 11. Disclaimer-sista-rad — engelsk form
 * 12. H2-paritet — lika många ##-rubriker
 * 13. Motsvarigheter bevarade — software-jämförelsen + "different, not harder"
 * 14. Aritmetik motorräknad — hävstång 80−50=30; 80·⅔≈53 (dokumenterad
 *     avrundning, |53,33−53|<1); 53−50=3; (30−3)/30=90 %>80; IEA
 *     3400−2200=1200 och 2200/1200≈1,83 = "almost twice" (1,8≤x<2);
 *     utdelningstest 100−20=80; checklistans 5 steg; 8 H2
 * 15. Svenska läckor 0 — URL:er + href:ar + vitlistade egennamn/koder bort,
 *     sedan svenska funktionord = 0 träffar
 */
import { readFileSync } from "node:fs";

const ORIG = "data/blogg-utkast/sa-analyserar-du-energiaktier.json";
const EN = "data/blogg-utkast/sa-analyserar-du-energiaktier-en.json";
const SOKORD = "energy stocks";

const BLOGFALT = ["slug", "title", "description", "pillar", "author", "publishedAt", "readingMinutes", "tags", "body"];
const varumarke = JSON.parse(readFileSync("data/varumarke.json", "utf8"));
const franRegexar = varumarke.forbjudnaFraser.map((f) => ({
  allvar: f.allvar,
  kalla: f.fran,
  re: new RegExp(f.fran, "giu"),
}));

// Rådverb EN — imperativa köp-/sälj-/rekommendationsfraser (juridikgrinden)
const radverbEN = [
  /\b(?:you|we|readers?|investors?)\s+(?:should|must)\s+(?:buy|sell|avoid|pick|grab)\b/i,
  /\b(?:buy|sell|grab|snap\s+up)\s+(?:this|the)\s+(?:stock|share|company)\b/i,
  /\b(?:our|my)\s+(?:top\s+)?recommendation\b/i,
  /\brecommend\s+(?:buying|selling|that\s+you)\b/i,
  /\bbest\s+stock\s+to\s+buy\b/i,
  /\bhot\s+stock\b/i,
  /\bact\s+now\b/i,
];
// Rådverb SV — läckage från originalets språk får inte följa med
const radverbSV = [
  /\bköp\s+(?:denna|denne|denna här|aktien)\b/i,
  /\bsälj\s+(?:dina\s+)?aktier\b/i,
  /\bmin\s+rekommendation\b/i,
  /\bvi\s+rekommenderar\b/i,
  /\bdet\s+är\s+en\s+(?:bra|dålig)\s+köp\b/i,
];

// Svenska funktionord för läckkontroll (vitlistade egennamn tas bort först)
const SV_ORD = [
  "och", "eller", "att", "som", "är", "var", "varit", "en", "ett", "på", "med",
  "av", "för", "till", "från", "inte", "men", "denna", "detta", "här", "där",
  "så", "kan", "skall", "ska", "vill", "ger", "tar", "får", "bli", "blir",
  "även", "alla", "många", "mycket", "lite", "endast", "ju", "väl", "nämligen",
  "exempel", "empel", "kapitel", "källa", "källor", "steg", "bolag", "bolaget",
  "aktier", "pris", "intäkt", "intäkter", "kostnad", "kostnader",
];

// Språkmedveten talnormalisering (AR8/Ö14-klassen)
const talSV = (s) =>
  (s.match(/\d[\d\s]*(?:,\d+)?/g) || [])
    .map((t) => t.replace(/\s+/g, "").replace(",", "."))
    .filter((t) => /\d/.test(t));
const talEN = (s) =>
  (s.match(/\d+(?:[.,]\d+)?/g) || [])
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

// 2. TAL-PARITET språkmedveten (description + body)
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
const saknas = ["software company", "different, not harder"].filter((a) => !E.body.includes(a));
rapp(saknas.length === 0, 'Motsvarigheter bevarade ("software company" + "different, not harder")', saknas.join(", "));

// 14. Aritmetik motorräknad
const ari = [];
const j = (namn, villkor, detalj) => ari.push([namn, villkor, detalj]);
j("hävstång marginal 80−50=30", 80 - 50 === 30);
j("prisfall 80·⅔≈53 (avrundat, |53,33−53|<1)", Math.abs(80 * (2 / 3) - 53) < 1, `motor ${eval("80*(2/3)").toFixed(2)}`);
j("marginal efter fall 53−50=3", 53 - 50 === 3);
j("marginalfall (30−3)/30=90 %>80", (30 - 3) / 30 === 0.9 && 0.9 > 0.8);
j("IEA total 3400", /3,400/.test(E.body));
j("IEA ren energi 2200", /2,200/.test(E.body));
j("IEA fossilt 3400−2200=1200", 3400 - 2200 === 1200);
j("IEA kvot 2200/1200≈1,83 = almost twice (1,8≤x<2)", 2200 / 1200 >= 1.8 && 2200 / 1200 < 2, `motor ${(2200 / 1200).toFixed(2)}`);
j("utdelningstest 100−20=80", 100 - 20 === 80 && /20 percent/.test(E.body));
j("checklistans steg = 5", (E.body.match(/^\d\. \*\*/gm) || []).length === 5);
j("tre grupper + tre misstag + tre intäktsmaskiner", ["Three kinds", "Three mistakes", "three revenue machines"].every((t) => E.body.includes(t)));
for (const [namn, ok, detalj] of ari) rapp(ok, `aritmetik: ${namn}`, detalj || "");

// 15. Svenska läckor 0
const rensad = E.body
  .replace(/https?:\/\/\S+/g, " ")
  .replace(/\[[^\]]*\]\([^)]*\)/g, " ")
  .replace(/Vår Energi/g, " ")
  .replace(/\bAK1A\b|\bAKM2\b|\bEV\/EBITDA\b|\bEBITDA\b|\bP\/E\b|\bIEA\b|\bEIA\b|\bSE[1-4]\b/g, " ");
const lek = SV_ORD.filter((w) => new RegExp(`(?<![\\p{L}])${w}(?![\\p{L}])`, "iu").test(rensad));
rapp(lek.length === 0, `Svenska läckor 0 (URL:er/href:ar + egennamn vitlistade)`, lek.join(", "));

console.log(`\nSLUTRESULTAT: ${fel === 0 ? "ALLT GRÖNT" : fel + " RÖDA"}`);
process.exit(fel === 0 ? 0 : 1);
