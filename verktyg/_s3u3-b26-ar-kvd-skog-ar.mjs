#!/usr/bin/env node
// KVD-sond för AR26 skogsaktier-ar (s3-u3, manifest auto-s3-1790240107451)
// Kontrollklass: AR8/AR25 — varumärkesgrind, rådverb SV+EN+AR, sökord,
// title/OG-längd, ord, korslänkar + externa URL:er multiset, H2-paritet,
// talparitet (språkmedveten normalisering), aritmetik motorräknad,
// readingMinutes, disclaimer-sista-rad, svenska läckor (vitlista).
import { readFileSync } from "node:fs";

const AR = "/home/ak1a/AK1/data/blogg-utkast/skogsaktier-sa-analyserar-du-skogsbolag-ar.json";
const SV = "/home/ak1a/AK1/data/blogg-utkast/skogsaktier-sa-analyserar-du-skogsbolag.json";
const VM = "/home/ak1a/AK1/data/varumarke.json";

const fel = [], varningar = [];
const F = (m) => fel.push(m);
const V = (m) => varningar.push(m);
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
ok("C2 slug", ar.slug === "skogsaktier-sa-analyserar-du-skogsbolag-ar", ar.slug);
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
const sok = "أسهم الغابات";
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
  let t = text.replace(/\]\([^)]*\)/g, "]")      // URL-delen bort, länktext kvar
              .replace(/\d{4}-\d{2}-\d{2}/g, "§DATUM§"); // datum som enhet
  if (sprak === "sv") {
    t = t.replace(/(\d) (\d{3})(?!\d)/g, "$1$2") // mellanslagstusental (exakta 3-siffriga grupper)
         .replace(/,/g, ".");
  } else {
    t = t.replace(/(\d),(\d{3})(?!\d)/g, "$1$2"); // AR-tusentelskomma (exakt 3 siffror)
  }
  return [...t.matchAll(/-?\d+(?:\.\d+)?/g)].map((m) => parseFloat(m[0]).toFixed(6));
};
const ta = stripTillTal(ar.body + " " + ar.description, "ar").sort();
const ts = stripTillTal(sv.body + " " + sv.description, "sv").sort();
const diffTal = [];
const maxlen = Math.max(ta.length, ts.length);
for (let i = 0, j = 0; i < ta.length || j < ts.length; ) {
  const a = ta[i], s = ts[j];
  if (a === s) { i++; j++; }
  else if (s === undefined || (a !== undefined && a < s)) { diffTal.push(`endast-AR:${a}`); i++; }
  else { diffTal.push(`endast-SV:${s}`); j++; }
}
ok("C16 talparitet multiset", diffTal.length === 0, `(${ta.length}/${ts.length} tal)${diffTal.length ? " DIFF: " + diffTal.join(", ") : ""}`);

// --- 11. Aritmetik motorräknad ---
const A = (namn, faktiskt, min, max, text) => ok(namn, faktiskt >= min && faktiskt <= max, `(${faktiskt.toFixed(2)} i spannet ${min}–${max}${text ? " → " + text : ""})`);
A("A1 omsättningsfall ≈6 %", (1 - 82.1 / 87.3) * 100, 5.5, 6.5, "نحو ستة بالمئة");
A("A2 resultatfall ≈55 %", (1 - 7.8 / 17.3) * 100, 54.5, 55.5, "نحو 55 بالمئة");
A("A3 hävstång ≈9×", (1 - 7.8 / 17.3) / (1 - 82.1 / 87.3), 8.9, 9.5, "تسع مرات");
A("A4 normalår ≈12.5", (17.3 + 7.8) / 2, 12.4, 12.6, "نحو 12.5");
A("A5 2025 faktiskt ≈6.8", 3.205 + 2.879 + 0.711, 6.7, 6.9, "6.8 مليار");
A("A6 avstånd ≈46 %", (1 - 6.8 / 12.5) * 100, 45.5, 46.5, "نحو 46");
A("A7 spannm >57 pp", 69.4 - 12.2, 57.0, 58.0, "يتجاوز 57");
A("A8 Billerud ≈90 %", (1 - 484 / 4590) * 100, 89.0, 90.0, "يقارب 90");
A("A9 UPM ≈3/4", 1 - 388 / 1526, 0.74, 0.755, "ثلاثة أرباع");
A("A10 Holmen >1/3", 1 - 3697 / 5874, 0.36, 0.38, "أكثر من ثلث");
A("A11 SCA ≈halverat", 1 - 3625 / 6821, 0.46, 0.48, "يقارب النصف");
A("A12 P/B-median 0.80", [0.72, 0.74, 0.80, 0.91, 1.28].sort((x, y) => x - y)[2], 0.795, 0.805, "0.80");

// --- 12. Disclaimer exakt sista rad ---
const rader = ar.body.trimEnd().split("\n");
ok("C17 disclaimer sista rad", rader[rader.length - 1].trim() === "_هذا تحليل مالي تعليمي، وليس نصيحة استثمارية._");

// --- 13. Svenska/latinska läckor (vitlista enligt AR6-konventionen) ---
const vitlista = new Set(["SCA", "Holmen", "Billerud", "Stora", "Enso", "UPM", "AK1A", "SLU", "Riksskogstaxeringen", "EBIT", "P/E", "PEG", "Yahoo", "Finance", "MarketStack"]);
// Fragmentvitlista (AR25-precedensens klass): tokenizerns siffer-/slash-brytning av godkända
// termer — AK1A matchas som "AK"+"A" eftersom siffran 1 bryter det latinska tokenet.
// Guidetexten orörd av kuren; endast kontrollen utvidgas med motiv här.
const fragment = new Set(["AK", "A"]);
const latRe = new RegExp("[A-Za-zÀ-ÿ][A-Za-zÀ-ÿ/\\-]*", "g");
const latinska = [...new Set([...(ar.body.replace(/\]\([^)]*\)/g, "]").matchAll(latRe))].map((m) => m[0]))];
const lackage = latinska.filter((w) => !vitlista.has(w) && !fragment.has(w));
ok("C18 svenska läckor 0", lackage.length === 0, lackage.length ? `LÄCKOR: ${lackage.join(", ")}` : `(${latinska.length} latinska token, alla vitlistade)`);

// --- Sammanfattning ---
console.log(`\n=== KVD AR26 skogsaktier-ar: ${fel.length} FEL, ${varningar.length} VARNINGAR ===`);
if (fel.length) { console.log("FEL:"); fel.forEach((f) => console.log("  ✗ " + f)); }
varningar.forEach((v) => console.log("  ⚠ " + v));
process.exit(fel.length ? 1 : 0);
