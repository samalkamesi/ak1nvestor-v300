#!/usr/bin/env node
// KVD-sond för AR12 spelaktier-ar (s3-u2 byggare 2/3, 2026-09-20)
// Läser ALDRIG src/, skriver ALDRIG — ren verifiering av utkastet mot originalet B12.
// Kontrollklass = AR8/AR9 (språkmedveten talnormalisering):
//   SV-sidan: komma är ALLTID decimal ("13,60"→13.6) + mellanslagstusental "1 457"→1457.
//   AR-sidan: komma med exakt 3 siffror är TUSENTAL ("1,457"→1457), decimal skrivs med punkt ("57.8").
import { readFileSync } from "node:fs";

const ROT = "/home/ak1a/AK1";
const AR_SOKVAG = `${ROT}/data/blogg-utkast/spelaktier-sa-analyserar-du-spelbolag-ar.json`;
const SV_SOKVAG = `${ROT}/data/blogg-utkast/spelaktier-sa-analyserar-du-spelbolag.json`;
const SOKORD = "أسهم القمار";
const DISCLAIMER = "_هذا تحليل مالي تعليمي، وليس نصيحة استثمارية._";

let pass = 0, fel = 0, varn = 0;
const rad = (ok, namn, detalj) => {
  if (ok) { pass++; console.log(`  PASS ${namn} — ${detalj}`); }
  else { fel++; console.log(`  FEL  ${namn} — ${detalj}`); }
};

// ── 1. JSON giltig + BlogPost-form ─────────────────────────────────────────
let ar, sv;
try {
  ar = JSON.parse(readFileSync(AR_SOKVAG, "utf8"));
  sv = JSON.parse(readFileSync(SV_SOKVAG, "utf8"));
  rad(true, "JSON giltig", "båda filerna parsar");
} catch (e) {
  console.log(`  FEL  JSON giltig — ${e.message}`); process.exit(1);
}
const FALT = ["slug", "title", "description", "pillar", "author", "publishedAt", "readingMinutes", "tags", "body"];
rad(JSON.stringify(Object.keys(ar)) === JSON.stringify(FALT), "BlogPost-form", `fält exakta: ${Object.keys(ar).join(",")}`);
rad(ar.slug === sv.slug + "-ar", "slug-konvention", `${ar.slug} = originalet + -ar`);
rad(ar.pillar === sv.pillar && ar.author === sv.author, "pillar+author", `${ar.pillar} / ${ar.author}`);
rad(ar.publishedAt === "2026-09-20", "publishedAt", ar.publishedAt);
rad(Array.isArray(ar.tags) && ar.tags.length === sv.tags.length, "tags-antal", `${ar.tags.length} == originalets ${sv.tags.length}`);

// ── 2. Ord, längder ────────────────────────────────────────────────────────
const ord = (t) => t.split(/\s+/).filter(Boolean).length;
const n = ord(ar.body);
rad(n >= 800 && n <= 1400, "ordmål 800–1400", `${n} ord (originalet ${ord(sv.body)})`);
const tl = Array.from(ar.title).length;
const dl = Array.from(ar.description).length;
rad(tl <= 60, "title ≤ 60 tkn", `${tl}/60`);
rad(dl <= 155, "OG ≤ 155 tkn", `${dl}/155`);
rad(ar.readingMinutes === Math.round(n / 600), "readingMinutes = round(ord/600)", `rm ${ar.readingMinutes} = round(${n}/600)`);

// ── 3. Sökordsdisciplin ────────────────────────────────────────────────────
const h2or = ar.body.split("\n").filter((l) => l.startsWith("## ")).map((l) => l.slice(3));
const ingress = ar.body.split("\n\n")[0];
const h2Traff = h2or.filter((h) => h.includes(SOKORD));
rad(ar.title.includes(SOKORD), "sökord i title", "title bär sökordet");
rad(ingress.includes(SOKORD), "sökord i ingress", "ingressens första stycke bär sökordet");
rad(h2Traff.length >= 2, "sökord i 2 H2", `${h2Traff.length} H2: ${h2Traff.map((h) => h.slice(0, 30)).join(" | ")}`);

// ── 4. H2-paritet ──────────────────────────────────────────────────────────
const svH2 = sv.body.split("\n").filter((l) => l.startsWith("## "));
rad(h2or.length === svH2.length, "H2-paritet", `AR ${h2or.length} == SV ${svH2.length}`);

// ── 5. Korslänkar MULTISET-identiska ───────────────────────────────────────
const lankar = (t) => (t.match(/\]\((\/[^)]+)\)/g) || []).map((m) => m.slice(2, -1));
const arL = lankar(ar.body).sort(), svL = lankar(sv.body).sort();
rad(JSON.stringify(arL) === JSON.stringify(svL), "korslänkar MULTISET", `AR ${arL.length} == SV ${svL.length} identiskt sorterad (se-12 ×2, rk-06 ×2)`);

// ── 6. Externa URL:er identiska ────────────────────────────────────────────
const externa = (t) => (t.match(/https?:\/\/[^)\s]+/g) || []).sort();
rad(JSON.stringify(externa(ar.body)) === JSON.stringify(externa(sv.body)), "externa URL:er", `${externa(ar.body).length}/${externa(sv.body).length} identiska`);

// ── 7. Talparitet normaliserad (frekvensidentisk multiset) ─────────────────
// Kvartalsetiketterna Q1/Q2 strippas SYMMETRISKT på båda språken (AR5-precedensen:
// varumärkessiffran i Tele2/تيلي2 strippades symmetriskt) — Q-etiketten är en
// formatkod, inte ett innehållstal, och korrekt arabiska skriver den utskrivet
// ("الربع الأول/الثاني"); utan strippning vore diffen exakt Q1 ×1 + Q2 ×2.
const talUttSV = (t) => {
  const r = t
    .replace(/https?:\/\/\S+/g, " ")
    .replace(/\]\([^)]*\)/g, "]")
    .replace(/\bQ[1-4]\b/g, " Q ")
    .replace(/(\d)[ \u00A0](\d{3})(?=\D|$)/g, "$1$2");
  return (r.match(/\d+(?:[.,]\d+)*/g) || []).map((x) => Number(x.replace(",", ".")));
};
const talUttAR = (t) => {
  const r = t
    .replace(/https?:\/\/\S+/g, " ")
    .replace(/\]\([^)]*\)/g, "]")
    .replace(/\bQ[1-4]\b/g, " Q ");
  return (r.match(/\d+(?:[.,]\d+)*/g) || []).map((x) =>
    /^\d+,\d{3}$/.test(x) && !/^0,/.test(x) ? Number(x.replace(",", "")) : Number(x.replace(",", ".")));
};
const sortNum = (a) => [...a].sort((x, y) => x - y);
const arT = sortNum(talUttAR(ar.body)), svT = sortNum(talUttSV(sv.body));
const freq = (a) => a.reduce((m, x) => ((m[x] = (m[x] || 0) + 1), m), {});
const fa = freq(arT), fs = freq(svT);
const diffTal = [...new Set([...Object.keys(fa), ...Object.keys(fs)].map(Number))]
  .filter((k) => (fa[k] || 0) !== (fs[k] || 0))
  .map((k) => `${k}: AR ${fa[k] || 0}× mot SV ${fs[k] || 0}×`);
rad(JSON.stringify(arT) === JSON.stringify(svT), "talparitet multiset", `AR ${arT.length} == SV ${svT.length}` + (diffTal.length ? ` — diff: ${diffTal.join("; ")}` : " (frekvensidentiska)"));

// ── 8. Aritmetik motorräknad ────────────────────────────────────────────────
const ap = (ok, namn, detalj) => rad(ok, `aritmetik: ${namn}`, detalj);
ap(Math.abs(15.15 / 11.4 - 1.329) < 0.001 && Math.round(15.15 / 11.4 * 100) / 100 === 1.33 && ar.body.includes("15.15 ÷ 11.4 ≈ 1.33"), "PEG", "15.15 ÷ 11.4 ≈ 1.33 i text");
ap(Math.abs(890.6 / 695 - 1.2814) < 0.001 && Math.round(890.6 / 695 * 100) / 100 === 1.28 && ar.body.includes("890.6 ÷ 695 ≈ 1.28"), "budpremien kvot", "890.6 ÷ 695 ≈ 1.28 i text");
ap(Math.abs((890.6 / 695 - 1) * 100 - 28.15) < 0.01 && Math.round((890.6 / 695 - 1) * 100) === 28 && ar.body.includes("28 بالمئة"), "budpremien procent", "(890.6 ÷ 695 − 1) ≈ 28 % i text");
ap(Math.round(57.8) === 58 && ar.body.includes("100 يورو") && ar.body.includes("58 يورو"), "marginal-exemplet", "round(57.8) = 58 — 100 € → 58 € i text");
ap(Math.abs(2067 / 2063 * 100 - 100 - 0.19) < 0.01 && Math.abs(2067 / 2063 * 100 - 100 - 0.2) < 0.05 && ar.body.includes("2,067") && ar.body.includes("2,063"), "platååret", "2067 ÷ 2063 = +0.2 % — seriens sista steg nästan plant (Ö12-precedensen)");
ap(30.02 > 30 && ar.body.includes("30.02") && ar.body.includes("30 بالمئة"), "budpliktströskeln", "30.02 > 30 — tröskepassingen i text");

// ── 9. Varumärkesgrind (data/varumarke.json × 3 ytor) ──────────────────────
const vm = JSON.parse(readFileSync(`${ROT}/data/varumarke.json`, "utf8"));
const ytor = { title: ar.title, description: ar.description, body: ar.body };
let vmFel = 0, vmVarn = 0, vmAntal = 0;
for (const { fran, allvar } of vm.forbjudnaFraser) {
  vmAntal++;
  for (const [yta, text] of Object.entries(ytor)) {
    if (new RegExp(fran, "i").test(text)) {
      if (allvar === "FEL") { vmFel++; console.log(`  FEL  varumärke /${fran}/ träff i ${yta}`); }
      else { vmVarn++; console.log(`  VARN varumärke /${fran}/ träff i ${yta}`); }
    }
  }
}
rad(vmFel === 0, "varumärkesgrind FEL", `${vmAntal} regexer × 3 ytor = ${vmFel} FEL, ${vmVarn} VARNING`);

// ── 10. Rådverb SV+EN+AR ───────────────────────────────────────────────────
const radVerb = [
  [/köp\s+(denna|aktien|nu)/i, "SV köp+direktobjekt"],
  [/sälj\s+(dina|aktien|nu)/i, "SV sälj+direktobjekt"],
  [/rekommenderar\s+(att\s+du\s+)?(köper|säljer)/i, "SV rekommenderar"],
  [/\bbuy this stock\b/i, "EN buy this"],
  [/\byou should (buy|sell)\b/i, "EN should buy/sell"],
  [/اشترِ/, "AR اشترِ"],
  [/\bبِع\b/, "AR بِع"],
  [/استثمر في هذا/, "AR استثمر في هذا"],
  [/أنصحك/, "AR أنصحك"],
  [/نوصي بشراء/, "AR نوصي بشراء"],
];
const radTraff = [];
for (const [re, namn] of radVerb) {
  for (const [yta, text] of Object.entries(ytor)) if (re.test(text)) radTraff.push(`${namn} i ${yta}`);
}
rad(radTraff.length === 0, "rådverb SV+EN+AR", radTraff.length ? radTraff.join("; ") : "0 träffar");

// ── 11. Disclaimer-sista-rad ────────────────────────────────────────────────
const sista = ar.body.trim().split("\n").pop().trim();
rad(sista === DISCLAIMER, "disclaimer exakt sist", sista.slice(0, 40) + "…");

// ── 12. Svenska/läckor 0 (endast vitlistade egennamn + finstermermer) ──────
const VITLISTA = [
  "AK1A Research Lab", "AK1A",
  "Evolution AB (publ)", "Evolution",
  "Kambi Group plc", "Kambi",
  "Candle Lake Limited", "Spelinspektionen",
  "Nasdaq Stockholm", "Cision",
  "S&P Global Market Intelligence", "StockAnalysis",
  "B2C", "B2B", "P/E", "PEG", "ROE", "EV/EBITDA",
];
let latRoster = ar.body
  .replace(/\(\[[^\]]*\]\([^)]*\)\)/g, " ")
  .replace(/https?:\/\/\S+/g, " ")
  .replace(/\]\([^)]*\)/g, "]");
for (const v of [...VITLISTA].sort((a, b) => b.length - a.length)) latRoster = latRoster.replaceAll(v, " ");
const latinRoster = latRoster
  .replace(/[/,._\-–:()&+×÷≈%[\]]/g, " ")
  .split(/\s+/)
  .filter((w) => /[a-zA-ZåäöÅÄÖ]/.test(w));
rad(latinRoster.length === 0, "svenska/läckor 0", latinRoster.length ? `kvarvarande: ${latinRoster.join(", ")}` : "endast vitlistade egennamn/termer kvar");

// ── 13. Källa: originalets sifferkärna närvarande ──────────────────────────
const kallTal = ["2019", "6.9", "2.8", "6.7", "0.8", "18", "100", "57.8", "51.8", "31.2", "0.02", "58", "1,457", "1,799", "2,063", "2,067", "2022", "2025", "2.2", "11.4", "15.15", "1.33", "13.60", "30.02", "30", "24", "13", "695", "132", "5.7", "2026-09-15", "890.60", "1.28", "28"];
const saknas = kallTal.filter((t) => !ar.body.includes(t));
rad(saknas.length === 0, "källtalskärna", saknas.length ? `saknas: ${saknas.join(", ")}` : `${kallTal.length}/${kallTal.length} närvarande`);

console.log(`\nKVD AR12 SPEL-AKTIEN-AR: ${pass} PASS · ${fel} FEL · ${varn} VARN (ord ${n}, title ${tl}/60, OG ${dl}/155, H2 ${h2or.length}, korslänkar ${arL.length}, externa ${externa(ar.body).length}, varumärkesregexer ${vmAntal})`);
process.exit(fel === 0 ? 0 : 1);
