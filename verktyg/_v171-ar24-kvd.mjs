#!/usr/bin/env node
// KVD för AR24 medtechaktier-ar (v171, studio rond 187-188)
// Kontrollklass: AR8/AR26 — varumärkesgrind, rådverb SV+EN+AR, sökord,
// title/OG-längd, ord, korslänkar + externa URL:er multiset, H2-paritet,
// talparitet (språkmedveten normalisering), aritmetik motorräknad,
// readingMinutes, disclaimer-sista-rad, svenska läckor (vitlista).
import { readFileSync } from "node:fs";

const AR = "/home/ak1a/agent/ak1/data/blogg-utkast/medtechaktier-sa-analyserar-du-medicintekniska-bolag-ar.json";
const SV = "/home/ak1a/agent/ak1/data/blogg-utkast/medtechaktier-sa-analyserar-du-medicintekniska-bolag.json";
const VM = "/home/ak1a/agent/ak1/data/varumarke.json";

const fel = [], varningar = [];
const F = (m) => fel.push(m);
const ok = (namn, villkor, detalj) => {
  if (villkor) console.log(`  OK  ${namn} ${detalj ?? ""}`);
  else F(`${namn} ${detalj ?? ""}`);
};

const ar = JSON.parse(readFileSync(AR, "utf8"));
const sv = JSON.parse(readFileSync(SV, "utf8"));
const vm = JSON.parse(readFileSync(VM, "utf8"));

// --- 1. BlogPost-form ---
const falt = ["slug", "title", "description", "pillar", "author", "publishedAt", "readingMinutes", "tags", "body"];
ok("C1 BlogPost-fält", falt.every((f) => f in ar), `(${falt.filter((f) => f in ar).length}/9)`);
ok("C2 slug", ar.slug === "medtechaktier-sa-analyserar-du-medicintekniska-bolag-ar", ar.slug);
ok("C3 tags", Array.isArray(ar.tags) && ar.tags.length === sv.tags.length, `(${ar.tags.length}=${sv.tags.length})`);

// --- 2. Varumärkesgrind: egna FEL-regexer × 3 ytor ---
const grunder = vm.forbjudnaFraser.filter((r) => r.allvar === "FEL");
let grindTräffar = 0;
for (const yta of [ar.title, ar.description, ar.body]) {
  for (const g of grunder) {
    const re = new RegExp(g.fran, "giu");
    const t = yta.match(re);
    if (t) { grindTräffar++; F(`varumärkesgrind: "${t[0]}" (${g.fran}) i yta`); }
  }
}
ok("C4 varumärkesgrind FEL 0", grindTräffar === 0, `(${grunder.length} regexer × 3 ytor)`);

// --- 3. Rådverb SV+EN+AR ---
const radVerb = [
  [/\b(köp|sälj)\b\s+(denna|denne|aktien|andelen)/gi, "SV"],
  [/\b(buy|sell)\s+(this|the)\s+(stock|share)/gi, "EN"],
  [/اشترِ|بِع\s|استثمر في هذا|أنصحك|نوصي بشراء/g, "AR"],
];
let radTräffar = 0;
for (const [re, sprak] of radVerb) {
  for (const yta of [ar.title, ar.description, ar.body]) {
    const t = yta.match(re);
    if (t) { radTräffar++; F(`rådverb ${sprak}: "${t[0]}"`); }
  }
}
ok("C5 rådverb SV+EN+AR 0", radTräffar === 0);

// --- 4. Sökord i title + ingress + ≥2 H2 ---
const sok = "أسهم التقنية الطبية";
const ingress = ar.body.split("\n\n")[0];
const h2or = [...ar.body.matchAll(/^## (.+)$/gm)].map((m) => m[1]);
const h2MedSok = h2or.filter((h) => h.includes(sok)).length;
ok("C6 sökord title", ar.title.includes(sok));
ok("C7 sökord ingress", ingress.includes(sok));
ok("C8 sökord ≥2 H2", h2MedSok >= 2, `(${h2MedSok} av ${h2or.length} H2)`);

// --- 5. Längder ---
ok("C9 title ≤60", [...ar.title].length <= 60, `(${[...ar.title].length}/60)`);
ok("C10 OG ≤155", [...ar.description].length <= 155, `(${[...ar.description].length}/155)`);

// --- 6. Ord (raw) ---
const ord = ar.body.split(/\s+/).filter(Boolean).length;
ok("C11 ord 1000–1400", ord >= 1000 && ord <= 1400, `(${ord}, originalet ${sv.body.split(/\s+/).filter(Boolean).length})`);
ok("C12 readingMinutes = round(ord/600)", ar.readingMinutes === Math.round(ord / 600), `(${ar.readingMinutes} = round(${ord}/600))`);

// --- 7. Korslänkar multiset ---
const links = (s) => [...s.matchAll(/\]\((\/(?:kurser|blogg)\/[^)]*)\)/g)].map((m) => m[1]).sort();
const la = links(ar.body), ls = links(sv.body);
ok("C13 korslänkar multiset", JSON.stringify(la) === JSON.stringify(ls), `(${la.length}=${ls.length})`);

// --- 8. Externa URL:er multiset ---
const externa = (s) => [...s.matchAll(/\]\((https?:\/\/[^)]*)\)/g)].map((m) => m[1]).sort();
const ea = externa(ar.body), es = externa(sv.body);
ok("C14 externa URL:er multiset", JSON.stringify(ea) === JSON.stringify(es), `(${ea.length}=${es.length}: ${ea.join(", ")})`);

// --- 9. H2-paritet ---
const h2sv = [...sv.body.matchAll(/^## /gm)].length;
ok("C15 H2-paritet", h2or.length === h2sv, `(${h2or.length}=${h2sv})`);

// --- 10. Talparitet: språkmedveten normalisering (AR8-klassen) ---
const stripTillTal = (text, sprak) => {
  let t = text.replace(/\]\([^)]*\)/g, "]")
              .replace(/\d{4}-\d{2}-\d{2}/g, "§DATUM§");
  if (sprak === "sv") {
    t = t.replace(/(\d) (\d{3})(?!\d)/g, "$1$2")
         .replace(/,/g, ".");
  } else {
    t = t.replace(/(\d),(\d{3})(?!\d)/g, "$1$2");
  }
  return [...t.matchAll(/-?\d+(?:\.\d+)?/g)].map((m) => parseFloat(m[0]).toFixed(6));
};
const ta = stripTillTal(ar.body + " " + ar.description, "ar").sort();
const ts = stripTillTal(sv.body + " " + sv.description, "sv").sort();
const diffTal = [];
for (let i = 0, j = 0; i < ta.length || j < ts.length; ) {
  const a = ta[i], s = ts[j];
  if (a === s) { i++; j++; }
  else if (s === undefined || (a !== undefined && a < s)) { diffTal.push(`endast-AR:${a}`); i++; }
  else { diffTal.push(`endast-SV:${s}`); j++; }
}
ok("C16 talparitet multiset", diffTal.length === 0, `(${ta.length}/${ts.length} tal)${diffTal.length ? " DIFF: " + diffTal.join(", ") : ""}`);

// --- 11. Aritmetik motorräknad (medtech-egna) ---
const A = (namn, faktiskt, min, max, text) => ok(namn, faktiskt >= min && faktiskt <= max, `(${faktiskt.toFixed(2)} i spannet ${min}–${max}${text ? " → " + text : ""})`);
A("A1 trappspann = 48.3", 73.7 - 25.4, 48.25, 48.35, "48.3 نقطة مئوية");
A("A2 exempel-marginal 16 %", (100 * 68 - 5200) / (100 * 100) * 100, 15.9, 16.1, "16 بالمئة");
A("A3 volymhävstång 42.5 %", ((68 * 110 - 5200) - 1600) / 1600 * 100, 42.4, 42.6, "42.5 بالمئة");
A("A4 hävstångskvot >4×", (((68 * 110 - 5200) - 1600) / 1600 * 100) / 10, 4.2, 4.3, "أكثر من أربعة أضعاف");
A("A5 prisfall 31 %", (1600 - (9500 - 3200 - 5200)) / 1600 * 100, 31.2, 31.3, "31 بالمئة");
A("A6 Getinge intäkt +23.6", (34969 / 28292 - 1) * 100, 23.5, 23.7, "+23.6");
A("A7 Getinge resultat −9.4", (2258 / 2491 - 1) * 100, -9.5, -9.3, "−9.4");
A("A8 marginal 8.8 → 6.5", 2491 / 28292 * 100, 8.75, 8.85, "8.8");
A("A9 marginal 2025 6.5", 2258 / 34969 * 100, 6.45, 6.55, "6.5");
A("A10 EBIT-kvot >2×", 24.7 / 10.5, 2.3, 2.4, "أكثر من الضعف");
A("A11 P/E-kvot >2×", 41.0 / 19.4, 2.1, 2.15, "أكثر من الضعف");

// --- 12. Disclaimer exakt sista rad ---
const rader = ar.body.trimEnd().split("\n");
ok("C17 disclaimer sista rad", rader[rader.length - 1].trim() === "_هذا تحليل مالي تعليمي، وليس نصيحة استثمارية._");

// --- 13. Svenska/latinska läckor (vitlista AR6/AR25-konventionen) ---
const vitlista = new Set(["Boston", "Scientific", "CellaVision", "Coloplast", "Elekta", "Getinge", "Ambu", "Straumann", "Sonova", "Fresenius", "Attendo", "AK1A", "AK", "A", "CE", "EES", "EU", "MDR", "FDA", "Yahoo", "Finance", "MarketStack", "EBIT", "P/E", "PEG", "ROIC", "ROE", "EV/EBIT", "eur-lex", "Läkemedelsverket", "k"]);
// Symbol-vitlista (AR25-precedensens klass): multiplikationstecknet × (U+00D7) hamnar i
// latiska-spannet À-ÿ och tokenseras som ord — "68 × 110" är matematik, inte läcka.
vitlista.add("×");
const latRe = new RegExp("[A-Za-zÀ-ÿ][A-Za-zÀ-ÿ/\\-]*", "g");
const latinska = [...new Set([...(ar.body.replace(/\]\([^)]*\)/g, "]").matchAll(latRe))].map((m) => m[0]))];
const lackage = latinska.filter((w) => !vitlista.has(w));
ok("C18 svenska läckor 0", lackage.length === 0, lackage.length ? `LÄCKOR: ${lackage.join(", ")}` : `(${latinska.length} latinska token, alla vitlistade)`);

// --- Sammanfattning ---
console.log(`\n=== KVD AR24 medtech-ar: ${fel.length} FEL, ${varningar.length} VARNINGAR ===`);
if (fel.length) { console.log("FEL:"); fel.forEach((f) => console.log("  ✗ " + f)); }
varningar.forEach((v) => console.log("  ⚠ " + v));
process.exit(fel.length ? 1 : 0);
