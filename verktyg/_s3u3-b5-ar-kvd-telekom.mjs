#!/usr/bin/env node
// KVD-sond för AR5 telekomaktier-ar (s3-u3, manifest auto-s3-1789833900935)
// Läser ALDRIG src/, skriver ALDRIG — ren verifiering av utkastet mot originalet B5.
import { readFileSync } from "node:fs";

const ROT = "/home/ak1a/AK1";
const AR_SOKVAG = `${ROT}/data/blogg-utkast/telekomaktier-sa-analyserar-du-telekom-och-mediabolag-ar.json`;
const SV_SOKVAG = `${ROT}/data/blogg-utkast/telekomaktier-sa-analyserar-du-telekom-och-mediabolag.json`;
const SOKORD = "أسهم الاتصالات";
const DISCLAIMER = "_هذا تحليل مالي تعليمي، وليس نصيحة استثمارية._";

let pass = 0, fel = 0, varn = 0;
const rad = (ok, namn, detalj) => {
  if (ok) { pass++; console.log(`  PASS ${namn} — ${detalj}`); }
  else { fel++; console.log(`  FEL  ${namn} — ${detalj}`); }
};
const vRad = (ok, namn, detalj) => {
  if (ok) pass++; else { varn++; console.log(`  VARN ${namn} — ${detalj}`); }
  if (ok) console.log(`  PASS ${namn} — ${detalj}`);
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
rad(ar.publishedAt === "2026-09-19", "publishedAt", ar.publishedAt);
rad(Array.isArray(ar.tags) && ar.tags.length >= 3, "tags", `${ar.tags.length} taggar`);

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
rad(h2Traff.length >= 2, "sökord i 2 H2", `${h2Traff.length} H2: ${h2Traff.map((h) => h.slice(0, 25)).join(" | ")}`);

// ── 4. H2-paritet ──────────────────────────────────────────────────────────
const svH2 = sv.body.split("\n").filter((l) => l.startsWith("## "));
rad(h2or.length === svH2.length, "H2-paritet", `AR ${h2or.length} == SV ${svH2.length}`);

// ── 5. Korslänkar MULTISET-identiska ───────────────────────────────────────
const lankar = (t) => (t.match(/\]\((\/[^)]+)\)/g) || []).map((m) => m.slice(2, -1));
const arL = lankar(ar.body).sort(), svL = lankar(sv.body).sort();
rad(JSON.stringify(arL) === JSON.stringify(svL), "korslänkar MULTISET", `AR ${arL.length} == SV ${svL.length} identiskt sorterad`);

// ── 6. Externa URL:er identiska ────────────────────────────────────────────
const externa = (t) => (t.match(/https?:\/\/[^)\s]+/g) || []).sort();
rad(JSON.stringify(externa(ar.body)) === JSON.stringify(externa(sv.body)), "externa URL:er", `${externa(ar.body).length}/${externa(sv.body).length} identiska`);

// ── 7. Talparitet normaliserad ─────────────────────────────────────────────
const rensaEgennamn = (t) => t.replaceAll("تيلي2", "TELE-TO").replaceAll("Tele2", "TELE-TO"); // varumärket Tele2:s siffra är ingen referensvärde — symmetriskt på båda språken
// "1,800"→1800 (tusentalskomma: exakt 3 siffror, inte inledande 0) · "0,015"/"0.015"→0.015 (decimal) · "7,6"→7.6
const nummer = (x) => (/^\d+,\d{3}$/.test(x) && !/^0,/.test(x) ? Number(x.replace(",", "")) : Number(x.replace(",", ".")));
const talUtt = (t) => {
  const r = rensaEgennamn(t)
    .replace(/https?:\/\/\S+/g, " ")
    .replace(/\]\([^)]*\)/g, "]")
    // SV mellanslagstusental: "1 800"/"10 000" (en iteration räcker för fyr-/femsiffriga tal)
    .replace(/(\d)[ \u00A0](\d{3})(?=\D|$)/g, "$1$2");
  return (r.match(/\d+(?:[.,]\d+)*/g) || []).map(nummer);
};
const sortNum = (a) => [...a].sort((x, y) => x - y);
const arT = sortNum(talUtt(ar.body)), svT = sortNum(talUtt(sv.body));
const freq = (a) => a.reduce((m, x) => ((m[x] = (m[x] || 0) + 1), m), {});
const fa = freq(arT), fs = freq(svT);
const diffTal = [...new Set([...Object.keys(fa), ...Object.keys(fs)].map(Number))]
  .filter((k) => (fa[k] || 0) !== (fs[k] || 0))
  .map((k) => `${k}: AR ${fa[k] || 0}× mot SV ${fs[k] || 0}×`);
rad(JSON.stringify(arT) === JSON.stringify(svT), "talparitet multiset", `AR ${arT.length} == SV ${svT.length}` + (diffTal.length ? ` — diff: ${diffTal.join("; ")}` : " (frekvensidentiska)"));

// ── 8. Aritmetik motorräknad ────────────────────────────────────────────────
const ap = (ok, namn, detalj) => rad(ok, `aritmetik: ${namn}`, detalj);
ap(150 * 12 === 1800 && ar.body.includes("1,800"), "ARPU årsintäkt", "150 × 12 = 1,800 i text");
ap(Math.abs(1 / 0.015 - 66.6667) < 0.01 && ar.body.includes("67"), "churn-relation", "1 ÷ 0.015 ≈ 67 månader i text");
ap(67 * 150 >= 9950 && 67 * 150 <= 10100 && ar.body.includes("10,000"), "livslängdsvärde", "67 × 150 ≈ 10,000 i text");
ap(12 - 6 === 6 && ar.body.includes("12 − 6 = 6"), "operatörens driftkassa", "12 − 6 = 6 i text");
ap(Math.abs(6 - 1.2 - 4.8) < 1e-9 && ar.body.includes("4.8"), "efter ränta", "6 − 1.2 = 4.8 i text");
ap(Math.abs(30 / 12 - 2.5) < 1e-9 && ar.body.includes("2.5×"), "nettoskuld/EBITDA", "30 ÷ 12 = 2.5× i text");
ap(Math.abs(12 / 30 - 0.4) < 1e-9 && ar.body.includes("40%"), "EBITDA-marginal", "12 ÷ 30 = 40% i text");
ap(Math.abs(6 / 30 - 0.2) < 1e-9 && ar.body.includes("20%"), "capexandel", "6 ÷ 30 = 20% i text");
ap(2.3 + 4.2 === 6.5, "auktionssumma-logik", "2.3 + 4.2 = 6.5 (inget påstående, bara källtalen)");

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

// ── 12. Svenska läckor ──────────────────────────────────────────────────────
const VITLISTA = ["ARPU", "churn", "capex", "EBITDA", "EV/EBITDA", "P/E", "ARR", "PTS", "GSMA", "5G", "AK1A Research Lab"];
let latRester = ar.body
  // källornas visningsetiketter som helhet FÖRST på rå text: ([ericsson.com](url)) → stryk hela parentesen
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
const kallTal = ["7.6", "6.4", "2.3", "4.2", "760", "120", "900", "2100", "2600", "2031", "325", "50.7", "51.7", "761", "293", "2022", "482"];
const saknas = kallTal.filter((t) => !ar.body.includes(t));
rad(saknas.length === 0, "källtalskärna", saknas.length ? `saknas: ${saknas.join(", ")}` : `${kallTal.length}/${kallTal.length} närvarande`);

console.log(`\nKVD AR5 TELEKOM-AR: ${pass} PASS · ${fel} FEL · ${varn} VARN (ord ${n}, title ${tl}/60, OG ${dl}/155, H2 ${h2or.length}, korslänkar ${arL.length}, externa ${externa(ar.body).length}, varumärkesregexer ${vmAntal})`);
process.exit(fel === 0 ? 0 : 1);
