#!/usr/bin/env node
// KVD-sond för AR11 saasaktier-ar (s3-u1 byggare 1/3, 2026-09-20)
// Läser ALDRIG src/, skriver ALDRIG — ren verifiering av utkastet mot originalet B11.
// Kontrollklass = AR9 (verktyg/_s3u2-ar9-kvd-halvledar-ar.mjs): talparitet frekvensidentisk
// normaliserad med SPRÅKMEDEVETEN normalisering (AR3/AR8-precedensens klass):
//   SV-sidan: komma är ALLTID decimal ("98,9"→98.9) + mellanslagstusental "1 000"→1000.
//   AR-sidan: komma med exakt 3 siffror är TUSENTAL ("40,000"→40000), decimal skrivs med punkt.
import { readFileSync } from "node:fs";

const ROT = "/home/ak1a/AK1";
const AR_SOKVAG = `${ROT}/data/blogg-utkast/saasaktier-sa-analyserar-du-saas-bolag-ar.json`;
const SV_SOKVAG = `${ROT}/data/blogg-utkast/saasaktier-sa-analyserar-du-saas-bolag.json`;
const SOKORD = "أسهم SaaS";
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
rad(n >= 1200 && n <= 1400, "ordmål 1200–1400", `${n} ord (originalet ${ord(sv.body)})`);
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
rad(JSON.stringify(arL) === JSON.stringify(svL), "korslänkar MULTISET", `AR ${arL.length} == SV ${svL.length} identiskt sorterad (se-01 ×2, v02 ×2)`);

// ── 6. Externa URL:er identiska ────────────────────────────────────────────
const externa = (t) => (t.match(/https?:\/\/[^)\s]+/g) || []).sort();
rad(JSON.stringify(externa(ar.body)) === JSON.stringify(externa(sv.body)), "externa URL:er", `${externa(ar.body).length}/${externa(sv.body).length} identiska`);

// ── 7. Talparitet normaliserad (frekvensidentisk multiset) ─────────────────
const talUttSV = (t) => {
  const r = t
    .replace(/https?:\/\/\S+/g, " ")
    .replace(/\]\([^)]*\)/g, "]")
    .replace(/(\d)[ \u00A0](\d{3})(?=\D|$)/g, "$1$2");
  return (r.match(/\d+(?:[.,]\d+)*/g) || []).map((x) => Number(x.replace(",", ".")));
};
const talUttAR = (t) => {
  const r = t
    .replace(/https?:\/\/\S+/g, " ")
    .replace(/\]\([^)]*\)/g, "]");
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
ap(Math.abs(1 / 0.01 - 100) < 1e-9 && ar.body.includes("1 ÷ 0.01 = 100"), "churn-relation", "1 ÷ 0.01 = 100 månader i text");
ap(Math.abs(1 / 0.02 - 50) < 1e-9 && ar.body.includes("50 شهراً"), "churn-fördubbling", "1 ÷ 0.02 = 50 — relationen halveras, i text");
ap(Math.abs(800 * 50 - 40000) < 1e-9 && ar.body.includes("800 × 50 = 40,000"), "livstidsvärde", "800 × 50 = 40,000 i text");
ap(Math.abs(40000 / 8000 - 5) < 1e-9 && ar.body.includes("5:1"), "LTV/CAC", "40,000 ÷ 8,000 = 5 — 5:1 i text");
ap(Math.abs(17.3 + 23.8 - 41.1) < 1e-9 && ar.body.includes("17.3 + 23.8 = 41.1"), "Rule of 40 SAP", "17.3 + 23.8 = 41.1 i text");
ap(Math.abs(19.3 + 5.0 - 24.3) < 1e-9 && ar.body.includes("19.3 + 5.0 = 24.3"), "Rule of 40 Microsoft", "19.3 + 5.0 = 24.3 i text");
ap(Math.abs(44.4 + 35.1 - 79.5) < 1e-9 && ar.body.includes("44.4 + 35.1 = 79.5"), "Rule of 40 Palantir", "44.4 + 35.1 = 79.5 i text");
ap(Math.abs(13.1 + 6.1 - 19.2) < 1e-9 && ar.body.includes("13.1 + 6.1 = 19.2"), "Rule of 40 Sinch", "13.1 + 6.1 = 19.2 i text");
ap(Math.abs(Math.pow(1.02, 5) - 1.104) < 0.005 && ar.body.includes("1.02") && ar.body.includes("1.10"), "SBC-utspädning", "1.02⁵ ≈ 1.10 — båda talen i text");
ap(Math.abs(98.9 - 18.4 - 80.5) < 1e-9 && ar.body.includes("98.9") && ar.body.includes("18.4"), "bruttomarginalgap", "98.9 − 18.4 = 80.5 pp (motor) — båda talen i text");

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

// ── 12. Svenska/läckor 0 (endast vitlistade egennamn + finstermer) ─────────
const VITLISTA = [
  "AK1A Research Lab", "AK1A",
  "Bessemer Venture Partners", "State of the Cloud",
  "Software as a Service", "Rule of 40",
  "Microsoft", "Palantir", "Truecaller", "Kambi", "Sinch", "SAP",
  "Investor Relations", "Investors",
  "SaaS", "ARR", "churn", "NDR", "SBC",
  "P/E", "P/S", "EV/Sales", "EV/EBIT", "EBIT", "DCF", "PEG",
  // E = P/E:s nämnare som matematisk variabel — originalets egen konvention ("när E är liten"), inte ett svenskt ord
  "E",
];
let latRester = ar.body
  .replace(/\(\[[^\]]*\]\([^)]*\)\)/g, " ")
  .replace(/https?:\/\/\S+/g, " ")
  .replace(/\]\([^)]*\)/g, "]");
for (const v of [...VITLISTA].sort((a, b) => b.length - a.length)) latRester = latRester.replaceAll(v, " ");
const latinRester = latRester
  .replace(/[/,._\-–:()&+×÷≈%[\]]/g, " ")
  .split(/\s+/)
  .filter((w) => /[a-zA-ZåäöÅÄÖ]/.test(w));
rad(latinRester.length === 0, "svenska/läckor 0", latinRester.length ? `kvarvarande: ${latinRester.join(", ")}` : "endast vitlistade egennamn/termer kvar");

// ── 13. Källa: originalets sifferkärna närvarande ──────────────────────────
const kallTal = ["98.9", "19", "84.8", "73.7", "73.1", "67.9", "18.4", "0.01", "100", "110", "1,000", "800", "40,000", "8,000", "5:1", "40", "17.3", "23.8", "41.1", "19.3", "5.0", "24.3", "44.4", "35.1", "79.5", "13.1", "6.1", "19.2", "197", "1.02", "1.10", "10", "50", "2026-09-15"];
const saknas = kallTal.filter((t) => !ar.body.includes(t));
rad(saknas.length === 0, "källtalskärna", saknas.length ? `saknas: ${saknas.join(", ")}` : `${kallTal.length}/${kallTal.length} närvarande`);

console.log(`\nKVD AR11 SAAS-AR: ${pass} PASS · ${fel} FEL · ${varn} VARN (ord ${n}, title ${tl}/60, OG ${dl}/155, H2 ${h2or.length}, korslänkar ${arL.length}, externa ${externa(ar.body).length}, varumärkesregexer ${vmAntal})`);
process.exit(fel === 0 ? 0 : 1);
