// KVD för Ö18 livsmedelsaktier-en (s3-u2, manifest auto-s3-1789762524949)
// Ö13-standarden: varumärkesgrind (data/varumarke.json = grundens egna regexer) × 3 ytor,
// rådverb EN+SV, sökordspositioner, title/OG-längd, ord (raw), readingMinutes,
// korslänkar-multiset + talparitet mot originalet B18, aritmetik motorräknad,
// disclaimer. ABORT-GRIND: process.exit(1) vid FEL.
import { readFileSync } from "node:fs";

const EN_SOKVAG = "/home/ak1a/AK1/data/blogg-utkast/livsmedelsaktier-sa-analyserar-du-livsmedelsbolag-en.json";
const SV_SOKVAG = "/home/ak1a/AK1/data/blogg-utkast/livsmedelsaktier-sa-analyserar-du-livsmedelsbolag.json";
const VARUMARKE = "/home/ak1a/AK1/data/varumarke.json";

const en = JSON.parse(readFileSync(EN_SOKVAG, "utf8"));
const sv = JSON.parse(readFileSync(SV_SOKVAG, "utf8"));
const vm = JSON.parse(readFileSync(VARUMARKE, "utf8"));

let fel = 0, kontroller = 0;
const F = (ok, namn, detalj) => {
  kontroller++;
  const mkt = ok ? "GRÖN" : "FEL";
  if (!ok) fel++;
  console.log(`[${mkt}] ${namn}${detalj ? " — " + detalj : ""}`);
};

// ── 1. Struktur & fält ──────────────────────────────────────────────────────
const falt = ["slug","title","description","pillar","author","publishedAt","readingMinutes","tags","body"];
F(falt.every(k => k in en), "obligatoriska fält", falt.filter(k => !(k in en)).join(",") || "9/9");
F(en.slug === sv.slug + "-en", "slug = originalet + -en", `${en.slug}`);
F(/^2\d{3}-\d{2}-\d{2}$/.test(en.publishedAt), "publishedAt ISO-dag", en.publishedAt);
F(en.body.includes("## ") && (en.body.match(/^## /gm) || []).length >= 2, ">= 2 H2-rubriker", `${(en.body.match(/^## /gm) || []).length}`);

// ── 2. SEO: sökord, title, OG ───────────────────────────────────────────────
const SOKORD = "food stocks";
const ingress = en.body.split("\n\n")[0];
const h2 = en.body.match(/^## .*$/gm) || [];
F(en.title.toLowerCase().includes(SOKORD), "sökord i title (H1)", en.title);
F(ingress.toLowerCase().includes(SOKORD), "sökord i ingress", "första stycket");
F(h2.some(r => r.toLowerCase().includes(SOKORD)), "sökord i H2", h2.filter(r => r.toLowerCase().includes(SOKORD)).join(" | "));
F(en.title.length <= 60, `title ${en.title.length}/60`);
F(en.description.length <= 155, `OG ${en.description.length}/155`);

// ── 3. Ord & läsminuter (raw-metoden; mallens ordmål 800–1400) ──────────────
const raw = s => s.trim().split(/\s+/).length;
const ordEN = raw(en.body), ordSV = raw(sv.body);
F(ordEN >= 1300 && ordEN <= 1400, `ord raw ${ordEN} (originalet ${ordSV})`, `kvot ${(ordEN/ordSV).toFixed(3)}`);
F(en.readingMinutes === Math.max(1, Math.round(ordEN / 600)), `readingMinutes ${en.readingMinutes} = round(${ordEN}/600)`);

// ── 4. Korslänkar MULTISET mot originalet (interna /blogg/ + /kurser/) ──────
const linkar = b => (b.match(/\]\((\/[^)]+)\)/g) || []).map(x => x.slice(2, -1)).sort();
const lEN = linkar(en.body), lSV = linkar(sv.body);
F(lEN.length === lSV.length && lEN.every((v, i) => v === lSV[i]), `korslänkar ${lEN.length}/${lSV.length} MULTISET-identiska`);

// ── 5. Talparitet (tusentalsnormaliserad: SV 54,1→54.1; 1 457→1457) ────────
const tal = b => {
  const t = b
    .replace(/(\d) (\d{3})\b/g, "$1$2")          // SV tusentelsmellanslag
    .replace(/(\d),(\d)/g, "$1.$2")               // SV decimalkomma
    .replace(/(\d)\.(\d{3})\b/g, "$1$2");         // EN tusentelspunkt (omosjälvlig)
  return (t.match(/\d+(?:\.\d+)?/g) || []).map(Number).sort((a, b) => a - b);
};
const tEN = tal(en.body), tSV = tal(sv.body);
const diffa = [];
for (let i = 0; i < Math.max(tEN.length, tSV.length); i++)
  if (tEN[i] !== tSV[i]) diffa.push(`${tSV[i]}≠${tEN[i]}`);
F(diffa.length === 0, `talparitet ${tEN.length} tal (sorted multiset)`, diffa.slice(0, 12).join(" ") || undefined);

// ── 6. Aritmetik motorräknad ────────────────────────────────────────────────
const eps = 0.06;
const A = [
  ["Organisk tillväxt 1.04×0.99=1.0296", 1.04 * 0.99, 1.0296, 0.001],
  ["PepsiCo CAGR (93.9/86.4)^(1/3)−1≈2.8 %", (93.9 / 86.4) ** (1 / 3) - 1, 0.028, 0.001],
  ["Nestlé CAGR (89.9/94.8)^(1/3)−1≈−1.8 %", (89.9 / 94.8) ** (1 / 3) - 1, -0.018, 0.001],
  ["Duopol 93.9/47.9≈1.96 'nästan dubbelt'", 93.9 / 47.9 > 1.9, true],
  ["Råvara 45×1.10=49.5", 45 * 1.1, 49.5, 0.001],
  ["Marginal efter chock 100−49.5=50.5", 100 - 45 * 1.1, 50.5, 0.001],
  ["Marginalfall 55−50.5=4.5 pp", 55 - (100 - 45 * 1.1), 4.5, 0.001],
  ["Prisad marginal 53.5/103≈51.9 %", 53.5 / 103, 0.519, 0.001],
  ["Carlsberg 40.8/73.6>0.5 'mer än hälften'", 40.8 / 73.6 > 0.5, true],
  ["ROIC 19.4 mot 20.1 'nästan jämna'", Math.abs(19.4 - 20.1) < 1, true],
];
for (const [namn, r, e, tol] of A)
  F(typeof r === "boolean" ? r === e : Math.abs(r - e) <= (tol ?? eps), `aritmetik: ${namn}`, `${typeof r === "number" ? r.toFixed(4) : r} mot ${e}`);

// ── 7. Rådverb EN+SV (tillsats utöver grundens grind) ───────────────────────
const radRe = [
  /\byou should (buy|sell|invest|trade)\b/gi, /\b(we|I) (recomm|suggest|advise)[a-z]* (buy|sell|invest)/gi,
  /\bbuy (this|the) (stock|share)s? now\b/gi, /\bbest stock to buy\b/gi, /\bguaranteed returns?\b/gi,
  /\brisk[- ]free\b/gi, /\bget rich\b/gi, /\bköp denna aktie\b/gi, /\bsälj aktien nu\b/gi,
  /\bvi rekommenderar (köp|sälj)\b/gi, /\bsäker avkastning\b/gi, /\bgaranterad avkastning\b/gi,
];
const traff = radRe.flatMap(re => (en.title + " " + en.description + " " + en.body).match(re) || []);
F(traff.length === 0, `rådverb EN+SV 0 träffar`, traff.join(", ") || undefined);

// ── 8. Varumärkesgrinden — grundens egna regexer × 3 ytor ───────────────────
const ytor = { title: en.title, description: en.description, body: en.body };
let vmFel = 0, vmTraff = [];
for (const grupp of vm.forbjudnaFraser) {
  const re = new RegExp(grupp.fran, "giu");
  for (const [ytNamn, text] of Object.entries(ytor)) {
    re.lastIndex = 0;
    const m = text.match(re);
    if (m) {
      const allvar = (grupp.allvar || grupp.severity) === "VARNING" ? 0 : 1;
      vmFel += allvar;
      vmTraff.push(`${ytNamn}: ${m[0]} (${allvar ? "FEL" : "VARNING"})`);
    }
  }
}
F(vmFel === 0, `varumärkesgrind ${vm.forbjudnaFraser.length} regexer × 3 ytor`, vmTraff.join("; ") || "0 träffar");

// ── 9. Disclaimer ───────────────────────────────────────────────────────────
const DISCL = "_This is educational financial analysis, not investment advice._";
F(en.body.trimEnd().endsWith(DISCL), "disclaimer exakt sista rad (engelsk form)");

// ── 10. Källor live (0 externa URL:er väntat — Ö15-precedensen) ────────────
const urler = [...new Set((en.body.match(/https:\/\/[^)\s]+/g) || []).map(u => u.replace(/[.,]$/, "")))];
F(urler.length === 0, `källor 0 externa URL:er i bodyn (originalet utan källista — paritet)`, urler.join(" | ") || undefined);

console.log(`\n── KVD: ${kontroller} kontroller, ${fel} FEL ${fel === 0 ? "⇒ GRÖN" : "⇒ RÖD — ABORTERAR"} ──`);
process.exit(fel === 0 ? 0 : 1);
