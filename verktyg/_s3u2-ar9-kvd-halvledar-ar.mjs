#!/usr/bin/env node
// KVD-sond för AR9 halvledaraktier-ar (s3-u2 byggare 2/3, 2026-09-20)
// Läser ALDLIG src/, skriver ALDRIG — ren verifiering av utkastet mot originalet B9.
// Kontrollklass = AR8 (verktyg/_v211u2-ar8-kvd-tillvaxt-ar.mjs): talparitet frekvensidentisk
// normaliserad med SPRÅKMEDEVETEN normalisering (AR3-precedensens klass):
//   SV-sidan: komma är ALLTID decimal ("1,657"→1.657) + mellanslagstusental "1 000"→1000.
//   AR-sidan: komma med exakt 3 siffror är TUSENTAL ("1,000"→1000), decimal skrivs med punkt ("1.657").
import { readFileSync } from "node:fs";

const ROT = "/home/ak1a/AK1";
const AR_SOKVAG = `${ROT}/data/blogg-utkast/halvledaraktier-sa-analyserar-du-halvledarbolag-ar.json`;
const SV_SOKVAG = `${ROT}/data/blogg-utkast/halvledaraktier-sa-analyserar-du-halvledarbolag.json`;
const SOKORD = "أسهم أشباه الموصلات";
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
rad(JSON.stringify(arL) === JSON.stringify(svL), "korslänkar MULTISET", `AR ${arL.length} == SV ${svL.length} identiskt sorterad (se-02 ×2, rk-05 ×2)`);

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
ap(Math.abs((110 - 80) / 110 * 100 - 27.27) < 0.5 && Math.round((110 - 80) / 110 * 100) === 27 && ar.body.includes("27 بالمئة"), "piskoeffekten", "(110 − 80) ÷ 110 ≈ 27 % i text");
ap(Math.abs(8 / 40 * 365 - 73) < 1e-9 && ar.body.includes("8 ÷ 40 × 365 = 73"), "lagerdagar bas", "8 ÷ 40 × 365 = 73 i text");
ap(Math.abs(12 / 40 * 365 - 109.5) < 1e-9 && Math.round(12 / 40 * 365) === 110 && ar.body.includes("110 يوماً"), "lagerdagar vuxet", "round(12 ÷ 40 × 365) = 110 dagar i text");
ap(Math.abs(28.4 / 1.657 - 17.14) < 0.05 && ar.body.includes("28.4 ÷ 1.657 ≈ 17"), "forward NVIDIA", "28.4 ÷ 1.657 ≈ 17 i text");
ap(Math.abs(117.5 / 2.042 - 57.54) < 0.05 && Math.round(117.5 / 2.042) === 58 && ar.body.includes("117.5 ÷ 2.042 ≈ 58"), "forward AMD", "117.5 ÷ 2.042 ≈ 58 i text");
ap(Math.abs(74.7 - 55.7 - 19.0) < 1e-9 && ar.body.includes("74.7") && ar.body.includes("55.7"), "bruttomarginalgap", "74.7 − 55.7 = 19.0 pp (motor) — båda talen i text");
ap(Math.abs(117.5 - 27.8 - 89.7) < 1e-9 && ar.body.includes("27.8–117.5"), "multipelspann", "117.5 − 27.8 = 89.7 — spannet 27.8–117.5 i text");
ap(80 / 110 < 1.0 && ar.body.includes("80") && ar.body.includes("1.0"), "book-to-bill-tröskel", "80 ÷ 110 < 1.0 — tröskeltalet i text");
ap(791.7 > 627.6 && 25.6 > 19.1 && ar.body.includes("791.7") && ar.body.includes("627.6"), "SIA-tillväxt", "791.7 > 627.6 och +25.6 > +19.1 — båda paren i text");

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
  "Taiwan Semiconductor Manufacturing Company", "Advanced Micro Devices, Inc.",
  "Global Semiconductor Sales", "NVIDIA Corporation",
  "NVIDIA", "AMD", "TSMC", "SIA",
  "fabless", "foundries", "backlog", "book-to-bill",
  "P/E", "PEG", "P/S", "DCF",
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
const kallTal = ["627.6", "2024", "19.1", "791.7", "2025", "25.6", "2026-09-15", "74.7", "55.7", "64.2", "56.1", "100", "110", "20", "80", "27", "1.0", "365", "8", "40", "73", "12", "27.8", "117.5", "28.4", "65.7", "1.657", "17", "104.2", "2.042", "58"];
const saknas = kallTal.filter((t) => !ar.body.includes(t));
rad(saknas.length === 0, "källtalskärna", saknas.length ? `saknas: ${saknas.join(", ")}` : `${kallTal.length}/${kallTal.length} närvarande`);

console.log(`\nKVD AR9 HALVLEDAR-AR: ${pass} PASS · ${fel} FEL · ${varn} VARN (ord ${n}, title ${tl}/60, OG ${dl}/155, H2 ${h2or.length}, korslänkar ${arL.length}, externa ${externa(ar.body).length}, varumärkesregexer ${vmAntal})`);
process.exit(fel === 0 ? 0 : 1);
