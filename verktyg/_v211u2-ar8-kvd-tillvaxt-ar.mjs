#!/usr/bin/env node
// KVD-sond för AR8 tillväxtaktier-ar (v211-u2, manifest v211-oversattning-1789853364271)
// Läser ALDRIG src/, skriver ALDRIG — ren verifiering av utkastet mot originalet B8.
// Kontrollklass = AR5 (verktyg/_s3u3-b5-ar-kvd-telekom.mjs): talparitet frekvensidentisk
// normaliserad (SV mellanslagstusental/decimalkomma == AR tusentalskomma/punkt).
import { readFileSync } from "node:fs";

const ROT = "/home/ak1a/AK1";
const AR_SOKVAG = `${ROT}/data/blogg-utkast/tillvaxtaktier-sa-analyserar-du-tillvaxtbolag-ar.json`;
const SV_SOKVAG = `${ROT}/data/blogg-utkast/tillvaxtaktier-sa-analyserar-du-tillvaxtbolag.json`;
const SOKORD = "أسهم النمو";
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
rad(ar.publishedAt === "2026-09-19", "publishedAt", ar.publishedAt);
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
rad(h2Traff.length >= 2, "sökord i 2 H2", `${h2Traff.length} H2: ${h2Traff.map((h) => h.slice(0, 22)).join(" | ")}`);

// ── 4. H2-paritet ──────────────────────────────────────────────────────────
const svH2 = sv.body.split("\n").filter((l) => l.startsWith("## "));
rad(h2or.length === svH2.length, "H2-paritet", `AR ${h2or.length} == SV ${svH2.length}`);

// ── 5. Korslänkar MULTISET-identiska ───────────────────────────────────────
const lankar = (t) => (t.match(/\]\((\/[^)]+)\)/g) || []).map((m) => m.slice(2, -1));
const arL = lankar(ar.body).sort(), svL = lankar(sv.body).sort();
rad(JSON.stringify(arL) === JSON.stringify(svL), "korslänkar MULTISET", `AR ${arL.length} == SV ${svL.length} identiskt sorterad (dubbellänkar v19 ×2 + km-028 ×2 + /dataset)`);

// ── 6. Externa URL:er identiska ────────────────────────────────────────────
const externa = (t) => (t.match(/https?:\/\/[^)\s]+/g) || []).sort();
rad(JSON.stringify(externa(ar.body)) === JSON.stringify(externa(sv.body)), "externa URL:er", `${externa(ar.body).length}/${externa(sv.body).length} identiska`);

// ── 7. Talparitet normaliserad (frekvensidentisk multiset) ─────────────────
// SPRÅKMEDEVETEN normalisering (AR3-precedensens klass — kontrollbugg rättad med motiv):
// B8 innehåller SV "1,185" = DECIctal 1.185 (tre decimaler) som mönsterkolliderar med
// AR-tusentalskommat "1,000". I det här korpuset är reglerna entydiga per språk:
//   SV-sidan: komma är ALLTID decimal ("72,2"→72.2, "1,185"→1.185) + mellanslagstusental "1 000"→1000.
//   AR-sidan: komma med exakt 3 siffror är TUSENTAL ("1,000"→1000), decimal skrivs med punkt ("1.185").
const talUttSV = (t) => {
  const r = t
    .replace(/https?:\/\/\S+/g, " ")
    .replace(/\]\([^)]*\)/g, "]")
    // SV mellanslagstusental: "1 000" (en iteration räcker för fyr-/femsiffriga tal)
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
ap(Math.abs(1000 / 250 - 4) < 1e-9 && ar.body.includes("1,000 ÷ 250 = 4"), "runway-räckvidd", "1,000 ÷ 250 = 4 سنوات i text");
ap(Math.abs(70 / 1.3 - 53.85) < 0.5 && ar.body.includes("70 ÷ 1.30 ≈ 54"), "P/E-avklingning", "70 ÷ 1.30 ≈ 54 i text");
ap(Math.abs(72.2 / 20.5 - 3.522) < 0.05 && ar.body.includes("3.5 أضعاف"), "multipelpremien", "72.2 ÷ 20.5 ≈ 3.5× i text");
ap(37 / 9.9 > 3.5 && 37 / 9.9 < 4 && ar.body.includes("أربعة أضعاف"), "tillväxtpremien", "37 ÷ 9.9 ≈ 3.7 → «أربعة أضعاف» (nästan fyra) i text");
ap(Math.abs(Math.pow(1.37, 5) - 4.826) < 0.05 && ar.body.includes("4.8"), "scenario 37 %", "1.37^5 ≈ 4.8 i text");
ap(Math.abs(Math.pow(1.185, 5) - 2.337) < 0.05 && ar.body.includes("2.3"), "scenario 18.5 %", "1.185^5 ≈ 2.3 i text");
ap(Math.abs(Math.pow(1.1, 5) - 1.6105) < 0.005 && ar.body.includes("1.61"), "scenario 10 %", "1.1^5 ≈ 1.61 i text");
ap(Math.abs(Math.pow(1.02, 5) - 1.1041) < 0.005 && ar.body.includes("1.10"), "utspädning", "1.02^5 ≈ 1.10 i text");
ap(Math.abs(1 - 20 / 70 - 0.7143) < 0.001 && ar.body.includes("70%"), "marginalfallet", "1 − 20/70 ≈ 71 % → «نحو 70%» i text");
ap(Math.abs(13.8 - 5.9 - 7.9) < 0.01 && ar.body.includes("ثماني نقاط مئوية"), "FCF-gapet", "13.8 − 5.9 ≈ 8 pp i text");

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

// ── 12. Svenska/läckor 0 (endast vitlistade akronymer) ──────────────────────
const VITLISTA = ["AK1A Research Lab", "AK1A", "AKM2", "EV/EBITDA", "P/E", "PEG", "FCF", "ROIC", "ARR", "10-K"];
let latRester = ar.body
  // källornas visningsetiketter som helhet FÖRST på rå text: ([sec.gov](url)) → stryk hela parentesen
  .replace(/\(\[[^\]]*\]\([^)]*\)\)/g, " ")
  .replace(/https?:\/\/\S+/g, " ")
  .replace(/\]\([^)]*\)/g, "]");
for (const v of [...VITLISTA].sort((a, b) => b.length - a.length)) latRester = latRester.replaceAll(v, " ");
const latinRester = latRester
  .replace(/[/,._\-–:()&+×÷≈%[\]]/g, " ")
  .split(/\s+/)
  .filter((w) => /[a-zA-ZåäöÅÄÖ]/.test(w));
rad(latinRester.length === 0, "svenska/läckor 0", latinRester.length ? `kvarvarande: ${latinRester.join(", ")}` : "endast vitlistade akronymer kvar");

// ── 13. Källa: originalets sifferkärna närvarande ──────────────────────────
const kallTal = ["37", "9.9", "72.2", "20.5", "1,000", "250", "4", "13.8", "0.8", "72", "70", "1.30", "54", "20", "2.2", "30", "10", "15.1", "15.3", "47.8", "14.5", "3.5", "5.9", "15", "100", "1.37", "4.8", "18.5", "1.185", "2.3", "1.61", "61", "1.02", "1.10", "2026"];
const saknas = kallTal.filter((t) => !ar.body.includes(t));
rad(saknas.length === 0, "källtalskärna", saknas.length ? `saknas: ${saknas.join(", ")}` : `${kallTal.length}/${kallTal.length} närvarande`);

console.log(`\nKVD AR8 TILLVÄXT-AR: ${pass} PASS · ${fel} FEL · ${varn} VARN (ord ${n}, title ${tl}/60, OG ${dl}/155, H2 ${h2or.length}, korslänkar ${arL.length}, externa ${externa(ar.body).length}, varumärkesregexer ${vmAntal})`);
process.exit(fel === 0 ? 0 : 1);
