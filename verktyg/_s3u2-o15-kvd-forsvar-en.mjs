#!/usr/bin/env node
// KVD för s3-u2 — Ö15 forsvarsaktier-en (engelsk översättning av B15)
// Standard enligt Ö14 (_s3u3-1789718100493-kvd-flyg-en.mjs): varumärkesgrind
// (data/varumarke.json), rådverb EN+SV, intern länkparitet (multiset) +
// talparitet (tusentalsnormaliserad) mot originalet B15, sökord i
// title+ingress+H2, title ≤ 60, OG ≤ 155, ord 1200–1400, readingMinutes,
// disclaimer-sista-rad, aritmetik motorräknad. B15 saknar extern källista
// (SIPRI/NATO/Saab nämns utan URL:er) ⇒ käll-sektionen verifierar 0 externa.
import { readFileSync } from "node:fs";

const UT = "/home/ak1a/AK1/data/blogg-utkast/forsvarsaktier-sa-analyserar-du-forsvarsbolag-en.json";
const ORIG = "/home/ak1a/AK1/data/blogg-utkast/forsvarsaktier-sa-analyserar-du-forsvarsbolag.json";
const VM = JSON.parse(readFileSync("/home/ak1a/AK1/data/varumarke.json", "utf8"));

const en = JSON.parse(readFileSync(UT, "utf8"));
const sv = JSON.parse(readFileSync(ORIG, "utf8"));

const fel = [];
const gron = (rad) => console.log("  ✓ " + rad);

// 1. Varumärkesgrind — 3 ytor
{
  let traffor = 0;
  for (const yta of [en.title, en.description, en.body]) {
    for (const f of VM.forbjudnaFraser) {
      const re = new RegExp(f.fran, "giu");
      re.lastIndex = 0;
      let m;
      while ((m = re.exec(yta)) !== null) {
        if (f.allvar === "FEL") {
          traffor++;
          fel.push(`varumärkesgrind FEL: "${m[0]}" (${f.fran})`);
        }
      }
    }
  }
  if (traffor === 0) gron(`varumärkesgrind: ${VM.forbjudnaFraser.length} regexer × 3 ytor = 0 FEL`);
}

// 2. Rådverb EN+SV
{
  const radRe =
    /\b(you should (buy|sell|purchase)|buy (this|the) (stock|share)|sell (this|the) (stock|share)|we recommend (buying|selling)|invest in (this|saab|rheinmetall|bae)|köp (denna|denne) aktie|sälj (denna|denne) aktie|vi rekommenderar (köp|sälj))\b/gi;
  const t = (en.title + " " + en.description + " " + en.body).match(radRe) || [];
  if (t.length === 0) gron("rådverb EN+SV: 0 träffar");
  else fel.push(`rådverb: ${t.join(", ")}`);
}

// 3. Intern länkparitet — multiset mot originalet
{
  const urls = (s) => {
    const map = new Map();
    for (const m of s.matchAll(/\]\((\/[^)]+)\)/g)) map.set(m[1], (map.get(m[1]) || 0) + 1);
    return map;
  };
  const a = urls(sv.body), b = urls(en.body);
  const saknas = [...a.entries()].filter(([u, n]) => (b.get(u) || 0) !== n);
  const extra = [...b.entries()].filter(([u, n]) => (a.get(u) || 0) !== n);
  const totA = [...a.values()].reduce((x, y) => x + y, 0);
  if (saknas.length === 0 && extra.length === 0)
    gron(`länkparitet: ${totA} interna länkinstanser multiset-identiska med originalet`);
  else fel.push(`länkparitet: saknas=${JSON.stringify(saknas)} extra=${JSON.stringify(extra)}`);
}

// 4. Talparitet — tusentalsnormaliserad (SV "2 700"/decimalkomma == EN "2,700"/punkt)
{
  const normSv = (s) => {
    let t = s.replace(/(\d),(\d)/g, "$1.$2");
    for (let i = 0; i < 3; i++) t = t.replace(/(\d) (\d{3})(?!\d)/g, "$1$2");
    return t;
  };
  const normEn = (s) => {
    let t = s;
    for (let i = 0; i < 3; i++) t = t.replace(/(\d),(\d{3})(?!\d)/g, "$1$2");
    return t;
  };
  const tal = (s) => s.match(/\d+(?:\.\d+)?/g) || [];
  const a = new Set(tal(normSv(sv.body))), b = new Set(tal(normEn(en.body)));
  const saknas = [...a].filter((x) => !b.has(x));
  if (saknas.length === 0) gron(`talparitet: samtliga ${a.size} unika tal ur originalet närvarande`);
  else fel.push(`talparitet, saknas i översättningen: ${saknas.join(", ")}`);
}

// 5. Sökordsdisciplin: "defense stocks" i title + ingress + minst 1 H2
{
  const kw = "defense stocks";
  const h2 = (en.body.match(/^## .*$/gm) || []).join("\n").toLowerCase();
  const ingress = en.body.split("\n\n")[0].toLowerCase();
  const antalH2 = (h2.match(new RegExp(kw, "g")) || []).length;
  if (en.title.toLowerCase().includes(kw) && ingress.includes(kw) && h2.includes(kw))
    gron(`sökord "${kw}" i title + ingress + ${antalH2} H2`);
  else fel.push("sökord saknas i någon av title/ingress/H2");
}

// 6. Längdmått
{
  const ord = en.body.trim().split(/\s+/).length;
  const tkn = (s) => [...s].length;
  const rm = Math.round(ord / 600);
  console.log(`  · ord ${ord} (mål 1200–1400) | title ${tkn(en.title)}/60 | OG ${tkn(en.description)}/155 | readingMinutes ${en.readingMinutes} (round(ord/600)=${rm})`);
  if (tkn(en.title) <= 60) gron(`title ${tkn(en.title)} tkn ≤ 60`); else fel.push(`title ${tkn(en.title)} > 60`);
  if (tkn(en.description) <= 155) gron(`OG ${tkn(en.description)} tkn ≤ 155`); else fel.push(`OG ${tkn(en.description)} > 155`);
  if (ord >= 1200 && ord <= 1400) gron(`ord ${ord} inom 1200–1400`); else fel.push(`ord ${ord} utanför 1200–1400`);
  if (en.readingMinutes === rm) gron("readingMinutes = round(ord/600)"); else fel.push(`readingMinutes ${en.readingMinutes} ≠ ${rm}`);
}

// 7. Disclaimer-sista-rad
{
  const sista = en.body.trim().split("\n").pop().trim();
  if (sista === "_This is educational financial analysis, not investment advice._")
    gron("disclaimer-sista-rad: engelsk form enligt Ö-konventionen");
  else fel.push(`disclaimer-sista-rad fel: "${sista}"`);
}

// 8. Aritmetik — originalets genomräknade exempel
{
  const A = (namn, uttryckt, sant, tol) =>
    Math.abs(uttryckt - sant) <= (tol ?? Math.max(Math.abs(sant) * 0.005, 0.05))
      ? gron(`aritmetik ${namn}: ${uttryckt} ≈ ${sant.toFixed(2)}`)
      : fel.push(`aritmetik ${namn}: ${uttryckt} ≠ ${sant.toFixed(2)}`);
  A("täckningsgrad 190 ÷ 65", 2.9, 190 / 65, 0.05);
  A("marginal 6.5 ÷ 65 (procent)", 10.0, (6.5 / 65) * 100, 0.05);
}

// 9. Källor — B15 saknar extern källista: verifiera paritet (0 externa i båda)
{
  const ext = (s) => [...s.matchAll(/\]\((https?:[^)]+)\)/g)].map((m) => m[1]);
  const a = ext(sv.body), b = ext(en.body);
  if (a.length === 0 && b.length === 0)
    gron("källista: B15 utan externa URL:er (SIPRI/NATO/Saab nämns utan länkar) — paritet 0 = 0, inga källor att översätta");
  else fel.push(`källista: oväntade externa URL:er (orig=${a.join(",")} en=${b.join(",")})`);
}

console.log(fel.length === 0 ? "\nKVD: GRÖN — 0 FEL" : "\nKVD: RÖD\n" + fel.map((f) => "  ✗ " + f).join("\n"));
process.exit(fel.length === 0 ? 0 : 1);
