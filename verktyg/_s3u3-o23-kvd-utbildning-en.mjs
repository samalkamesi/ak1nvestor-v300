#!/usr/bin/env node
// KVD för Ö23 utbildning-en (s3-u3, manifest auto-s3-1789808729921)
// Kontrollerar utkastet mot Ö-konventionerna: varumärkesgrind, rådverb,
// sökord, title/OG, ord, korslänkar, talparitet, aritmetik, disclaimer.
import { readFileSync } from "node:fs";

const UT = "/home/ak1a/AK1/data/blogg-utkast";
const sv = JSON.parse(readFileSync(`${UT}/utbildningsaktier-sa-analyserar-du-utbildningsbolag.json`, "utf8"));
const en = JSON.parse(readFileSync(`${UT}/utbildningsaktier-sa-analyserar-du-utbildningsbolag-en.json`, "utf8"));
const vm = JSON.parse(readFileSync("/home/ak1a/AK1/data/varumarke.json", "utf8"));

const r = []; // rapportrader: [namn, ok, detalj]
const check = (namn, ok, detalj) => r.push({ namn, ok: !!ok, detalj });

// Ytor
const ytor = { title: en.title, description: en.description, body: en.body };

// 1. Varumärkesgrind: grindens EGNA regexer (forbuidnaFraser) × 3 ytor
{
  let fel = 0, varn = 0, traffar = [];
  for (const p of vm.forbjudnaFraser) {
    const re = new RegExp(p.fran, "gi");
    for (const [yta, text] of Object.entries(ytor)) {
      const m = text.match(re);
      if (m) { p.allvar === "FEL" ? fel++ : varn++; traffar.push(`${p.fran} @ ${yta}: ${m[0]}`); }
    }
  }
  check("varumärkesgrind 26 regexer × 3 ytor", fel === 0 && varn === 0,
    `${vm.forbjudnaFraser.length} regexer, FEL ${fel}, VARNING ${varn}${traffar.length ? " — " + traffar.join("; ") : ""}`);
}

// 2. Rådverb EN+SV = 0 (URL:er strippas — källornas domäner är neutrala)
{
  const b = en.body.replace(/\]\([^)]*\)/g, "]").replace(/https?:\/\/\S+/g, "");
  const enRe = /\b(you should (?:buy|sell|invest)|we recommend|buy (?:this|the) stock|sell (?:this|the) stock|invest in this stock|our recommendation|strong buy|strong sell|must buy|do not buy|avoid this stock|hot stock|guaranteed return|risk[- ]free)\b/gi;
  const svRe = /\b(köp denna aktie|sälj denna aktie|vi rekommenderar|du bör köpa|du bör sälja|riskfrit|garanterad avkastning)\b/gi;
  const t1 = b.match(enRe) || [], t2 = b.match(svRe) || [];
  check("rådverb EN+SV", t1.length + t2.length === 0, `EN ${t1.length}, SV ${t2.length}`);
}

// 3. Sökord "education stocks" i title + ingress + 2 H2
{
  const ingress = en.body.split("\n\n")[0];
  const h2 = [...en.body.matchAll(/^## (.+)$/gm)].map((m) => m[1]);
  const iTitle = /education stocks/i.test(en.title);
  const iIng = /education stocks/i.test(ingress);
  const h2med = h2.filter((h) => /education stocks/i.test(h));
  check("sökord education stocks", iTitle && iIng && h2med.length >= 2,
    `title ${iTitle}, ingress ${iIng}, H2 med sökord ${h2med.length}: ${h2med.map((h) => `"${h}"`).join(" | ")}`);
}

// 4+5. Title ≤ 60, description ≤ 155
check("title ≤ 60 tkn", en.title.length <= 60, `${en.title.length}/60`);
check("OG-description ≤ 155 tkn", en.description.length <= 155, `${en.description.length}/155`);

// 6. Ord (Ö21:s metod)
const ord = (b) => b.replace(/[#*_\[\]()]/g, " ").split(/\s+/).filter(Boolean).length;
const ordEn = ord(en.body), ordSv = ord(sv.body);
check("ord 1200–1400", ordEn >= 1200 && ordEn <= 1400, `${ordEn} (originalet ${ordSv})`);

// 7. Korslänkar 8/8 MULTISET-identiska
{
  const lnk = (b) => [...b.matchAll(/\]\((\/(?:kurser|blogg)\/[^)]+)\)/g)].map((m) => m[1]).sort();
  const a = lnk(sv.body), b = lnk(en.body);
  check(`korslänkar ${a.length}/${a.length} MULTISET`, JSON.stringify(a) === JSON.stringify(b),
    `SV [${a.join(", ")}] == EN [${b.join(", ")}]`);
}

// 8. Talparitet: originalets tal (URL-stripped) finns i EN, tusentals-/decimalnormaliserade
// SV: "20 360"→"20360", "7,0"→"7.0" · EN: "20,360"→"20360" (tusentalskomma), "7.0" kvar
{
  const stripUrls = (b) => b.replace(/\]\([^)]*\)/g, "]").replace(/https?:\/\/\S+/g, "");
  const normSV = (s) => s.replace(/(\d) (?=\d{3}\b)/g, "$1").replace(/(\d),(\d)/g, "$1.$2");
  const normEN = (s) => s.replace(/(\d),(\d{3})\b/g, "$1$2");
  const talSV = [...normSV(stripUrls(sv.body)).matchAll(/\d[\d.]*/g)].map((m) => m[0]);
  const talEN = [...normEN(stripUrls(en.body)).matchAll(/\d[\d.]*/g)].map((m) => m[0]);
  const saknade = [];
  for (const t of new Set(talSV)) {
    const n = talSV.filter((x) => x === t).length;
    const m = talEN.filter((x) => x === t).length;
    if (m < n) saknade.push(`${t} (SV ${n}, EN ${m})`);
  }
  check("talparitet SV→EN", saknade.length === 0,
    saknade.length ? `SAKNADE i EN: ${saknade.join(", ")}` : `samtliga ${new Set(talSV).size} unika SV-tal finns i EN (multiset ${talSV.length}→${talEN.length})`);
}

// 9. Aritmetik motorräknad
{
  const eps = 0.051;
  const A = [
    ["pris/mix 1.070÷1.036 (%)", (1.070 / 1.036 - 1) * 100, 3.3, 0.05],
    ["oms/plats 20360÷115270 (tkr)", (20360 / 115270) * 1000, 177, 1],
    ["beläggning 5÷40 (%)", (5 / 40) * 100, 12.5, eps],
    ["marginal 25/26 1947÷20360 (%)", (1947 / 20360) * 100, 9.6, eps],
    ["marginal 24/25 1752÷19021 (%)", (1752 / 19021) * 100, 9.2, eps],
    ["volym 115270÷111290 (%)", (115270 / 111290 - 1) * 100, 3.6, eps],
    ["rörelse 1947÷1752 (%)", (1947 / 1752 - 1) * 100, 11.1, eps],
    ["intäkt 20360÷19021 (%)", (20360 / 19021 - 1) * 100, 7.0, eps],
  ];
  const fel = A.filter(([n, calc, txt, tol]) => Math.abs(calc - txt) > tol);
  check("aritmetik 8/8", fel.length === 0,
    A.map(([n, c, t]) => `${n}: motor ${c.toFixed(2)} mot text ${t}`).join("; ") + (fel.length ? ` — FEL: ${fel.map((f) => f[0]).join(",")}` : ""));
}

// 10. readingMinutes = round(ord/600)
check("readingMinutes", en.readingMinutes === Math.round(ordEn / 600), `${en.readingMinutes} = round(${ordEn}/600)`);

// 11. Disclaimer sista rad
{
  const sista = en.body.trim().split("\n").pop().trim();
  check(" disclaimer engelsk form", sista === "_This is educational financial analysis, not investment advice._", JSON.stringify(sista));
}

// 12. Slug + läge
check("slug = originalets + -en", en.slug === sv.slug + "-en", en.slug);

// 13. Externa URL:er identiska multiset
{
  const url = (b) => [...b.matchAll(/https?:\/\/[^\s)]+/g)].map((m) => m[0].replace(/[.,]$/, "")).sort();
  const a = url(sv.body), b = url(en.body);
  check(`externa URL:er ${a.length}/${a.length}`, JSON.stringify(a) === JSON.stringify(b), a.join(" | "));
}

// 14. Svenska läckor 0 (URL:ar + de två avsiktliga svenska termerna strippade)
{
  const b = en.body.replace(/\]\([^)]*\)/g, "]").replace(/https?:\/\/\S+/g, "")
    .replace(/bidrag till enskilda huvudmän/g, "").replace(/Skärpta villkor för friskolesektorn/g, "");
  const svenska = [" och ", " att ", " inte ", " så ", " är ", " för att ", "analyserar du", "så fungerar", "kan du ", "delar av "];
  const traffar = svenska.filter((s) => b.toLowerCase().includes(s));
  check("svenska läckor (URL-slugar + citerade termer strippade)", traffar.length === 0, traffar.length ? `träffar: ${traffar.join(", ")}` : "0");
}

// Rapport
let fel = 0;
for (const x of r) { if (!x.ok) fel++; console.log(`${x.ok ? "GRÖN" : "RÖD"}  ${x.namn.trim()} — ${x.detalj}`); }
console.log(`\nKVD Ö23 utbildning-en: ${r.length - fel}/${r.length} kontroller GRÖNA, ${fel} FEL`);
process.exit(fel ? 1 : 0);
