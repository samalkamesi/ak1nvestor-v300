/**
 * v211-u1 KVD — oberoende konfirmering av B18-en (livsmedel) + B20-en (lyx).
 *
 * Läge: v211-manifestet dispatchade "-en för B18 + B20", men båda objekten
 * levererades redan under manifest auto-s3-1789762524949 (commits 2ee3ab32
 * resp 88ba2094, medan originalen B18/B20 är orörda sedan sina respektive
 * single commits). Doktrinen = ingen duplikat ⇒ detta skript KONFIRMERAR
 * leveranserna mot v211:s fem KVD-punkter mekaniskt, i stället för att
 * översätta om.
 *
 * Kontroller (per filpar original ↔ -en):
 *  1. BlogPost-form exakt + slug = originalets + "-en"
 *  2. TAL-PARITET — talserier ur description+body, decimal komma→punkt,
 *     multiset-jämförelse (varje tal lika många gånger på båda sidor)
 *  3. Korslänkar — href-multiset identisk (inga nya ytor, inga borttappade)
 *  4. Varumärkesgrinden — ALLA 26 regexer ur data/varumarke.json (samma
 *     källor som kontrolleraText) × 3 ytor (title/description/body),
 *     FEL = 0 krävs, VARNING rapporteras
 *  5. Rådverb EN — juridikgrinden på engelska: 0 träffar krävs
 *  6. Sökordsdisciplin — primärt sökord i title + ingress + ≥1 H2
 *  7. title ≤ 60 tkn, description ≤ 155 tkn
 *  8. Disclaimer-sista-rad — engelsk form, samma budskap
 *  9. Avgränsningar bevarade (B18 mot B7/B13, B20 mot B7/B18)
 * 10. H2-strukturparitet — lika många ##-rubriker
 */
import { readFileSync } from "node:fs";

const pars = [
  {
    orig: "data/blogg-utkast/livsmedelsaktier-sa-analyserar-du-livsmedelsbolag.json",
    en: "data/blogg-utkast/livsmedelsaktier-sa-analyserar-du-livsmedelsbolag-en.json",
    sokord: "food stocks",
    avgransning: ["consumer companies", "store retail"],
  },
  {
    orig: "data/blogg-utkast/lyxaktier-sa-analyserar-du-lyxbolag.json",
    en: "data/blogg-utkast/lyxaktier-sa-analyserar-du-lyxbolag-en.json",
    sokord: "luxury stocks",
    avgransning: ["consumer companies guide", "food track"],
  },
];

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

const talUr = (s) =>
  (s.match(/\d+(?:[.,]\d+)?/g) || []).map((t) => t.replace(",", "."));
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

let fel = 0;
const rapp = (ok, namn, detalj) => {
  if (!ok) fel++;
  console.log(`  ${ok ? "GRÖN" : "RÖD "} ${namn}${detalj ? " — " + detalj : ""}`);
};

for (const par of pars) {
  console.log(`\n=== ${par.en.split("/").pop()} ===`);
  const O = JSON.parse(readFileSync(par.orig, "utf8"));
  const E = JSON.parse(readFileSync(par.en, "utf8"));

  // 1. Form + slug
  rapp(JSON.stringify(Object.keys(E)) === JSON.stringify(BLOGFALT), "BlogPost-form exakt", Object.keys(E).join(","));
  rapp(E.slug === O.slug + "-en", "slug = originalets + -en", `${O.slug} → ${E.slug}`);

  // 2. TAL-PARITET (description + body)
  const talO = talUr(O.description + " " + O.body).sort();
  const talE = talUr(E.description + " " + E.body).sort();
  const mO = multiset(talO);
  const me = multiset(talE);
  rapp(likaMultiset(mO, me), `TAL-PARITET multiset (${talO.length} tal)`,
    likaMultiset(mO, me) ? "" : `endast original: ${[...mO].filter(([k, v]) => me.get(k) !== v).map(([k, v]) => k + "×" + v)}; endast -en: ${[...me].filter(([k, v]) => mO.get(k) !== v).map(([k, v]) => k + "×" + v)}`);

  // 3. Korslänkar
  const lO = lankarUr(O.body);
  const lE = lankarUr(E.body);
  rapp(likaMultiset(multiset(lO), multiset(lE)), `Korslänkar multiset (${lO.length} st)`,
    likaMultiset(multiset(lO), multiset(lE)) ? "" : `O:${JSON.stringify(lO)} E:${JSON.stringify(lE)}`);

  // 4. Varumärkesgrind × 3 ytor
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
  rapp(felTr === 0, `Varumärkesgrind 26 regexer × 3 ytor (FEL ${felTr}, VARNING ${varTr})`);

  // 5. Rådverb EN
  const radTr = radverbEN.flatMap((re) => E.body.match(re) || []);
  rapp(radTr.length === 0, `Rådverb EN 0 träffar`, radTr.join("; "));

  // 6. Sökord i title + ingress + H2
  const ingress = E.body.split("\n\n")[0];
  const h2 = [...E.body.matchAll(/^## (.+)$/gm)].map((m) => m[1]);
  const sok = par.sokord.toLowerCase();
  rapp(
    E.title.toLowerCase().includes(sok) && ingress.toLowerCase().includes(sok) &&
      h2.some((h) => h.toLowerCase().includes(sok)),
    `Sökord "${par.sokord}" i title+ingress+H2`,
    `title:${E.title.toLowerCase().includes(sok)} ingress:${ingress.toLowerCase().includes(sok)} H2:${h2.filter((h) => h.toLowerCase().includes(sok)).length}/${h2.length}`
  );

  // 7. Längder
  rapp(E.title.length <= 60, `title ${E.title.length}/60`);
  rapp(E.description.length <= 155, `description ${E.description.length}/155`);

  // 8. Disclaimer
  const sista = E.body.trim().split("\n").pop().trim();
  rapp(/^_This is educational financial analysis, not investment advice\._$/.test(sista), "Disclaimer engelsk form", sista);

  // 9. Avgränsningar
  const saknas = par.avgransning.filter((a) => !E.body.toLowerCase().includes(a));
  rapp(saknas.length === 0, `Avgränsningar bevarade (${par.avgransning.join(" + ")})`, saknas.join(", "));

  // 10. H2-paritet
  const h2O = (O.body.match(/^## /gm) || []).length;
  const h2E = (E.body.match(/^## /gm) || []).length;
  rapp(h2O === h2E, `H2-struktur ${h2E}/${h2O}`);
}

console.log(`\nSLUTRESULTAT: ${fel === 0 ? "ALLT GRÖNT" : fel + " RÖDA"}`);
process.exit(fel === 0 ? 0 : 1);
