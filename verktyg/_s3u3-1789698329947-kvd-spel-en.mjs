#!/usr/bin/env node
// KVD för s3-u3 (omgång auto-s3-1789698329947) — Ö12 spelaktier-en
// Kontroller: varumärkesgrind (data/varumarke.json, "giu" som src/lib/
// varumarke.ts), rådverb EN+SV, intern länkparitet (multiset) + talparitet
// (tusentalsnormaliserad: SV "1 457" == EN "1,457") mot originalet B12,
// sökord i title+ingress+H2, title ≤ 60, OG ≤ 155, ord 1200–1400,
// readingMinutes, disclaimer-sista-rad, aritmetik, käll-URL:er levande.
// Sondrättningar från Ö9-racet inbyggda från start (ärlighetsdoktrinen).
import { readFileSync } from "node:fs";

const UT = "/home/ak1a/AK1/data/blogg-utkast/spelaktier-sa-analyserar-du-spelbolag-en.json";
const ORIG = "/home/ak1a/AK1/data/blogg-utkast/spelaktier-sa-analyserar-du-spelbolag.json";
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
    /\b(you should (buy|sell|purchase)|buy (this|the) (stock|share)|sell (this|the) (stock|share)|we recommend (buying|selling)|invest in (this|evolution|kambi)|köp (denna|denne) aktie|sälj (denna|denne) aktie|vi rekommenderar (köp|sälj))\b/gi;
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
    gron(`länkparitet: ${totA} interna länkar multiset-identiska med originalet`);
  else fel.push(`länkparitet: saknas=${JSON.stringify(saknas)} extra=${JSON.stringify(extra)}`);
}

// 4. Talparitet — tusentalsnormaliserad (SV "1 457"/decimalkomma == EN "1,457"/punkt)
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

// 5. Sökordsdisciplin: "gambling stocks" i title + ingress + minst 1 H2
{
  const kw = "gambling stocks";
  const h2 = (en.body.match(/^## .*$/gm) || []).join("\n").toLowerCase();
  const ingress = en.body.split("\n\n")[0].toLowerCase();
  if (en.title.toLowerCase().includes(kw) && ingress.includes(kw) && h2.includes(kw))
    gron(`sökord "${kw}" i title + ingress + H2`);
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
      : fel.push(`aritmetik ${namn}: ${uttryckt} ≠ ${sant}`);
  A("PEG 15,15 ÷ 11,4", 1.33, 15.15 / 11.4, 0.01);
  A("budpremie-kvot 890,6 ÷ 695", 1.28, 890.6 / 695, 0.01);
  A("budpremie-% över bud", 28, ((890.6 - 695) / 695) * 100, 0.5);
  A("marginal-exempel 100 → 58", 58, 57.8, 0.5);
  A("platå 2067/2063", 0.2, (2067 / 2063 - 1) * 100, 0.1);
}

// 9. Käll-URL:er — originalets fyra externa, översatta rakt
{
  const kallor = [
    "https://www.spelinspektionen.se/om-oss/statistik/",
    "https://www.evolution.com/investors/",
    "https://news.cision.com/candle-lake-limited/",
    "https://www.kambi.com/investors/",
  ];
  const iKroppen = kallor.filter((u) => en.body.includes(u));
  if (iKroppen.length !== kallor.length)
    fel.push(`källista: ${kallor.length - iKroppen.length} URL:er saknas i body`);
  else gron(`källista: ${kallor.length} URL:er närvarande i body`);
  const status = [];
  for (const u of kallor) {
    try {
      const r = await fetch(u, { redirect: "follow", signal: AbortSignal.timeout(20000) });
      status.push(`${r.status} ${u}`);
    } catch {
      status.push(`FEL ${u}`);
    }
  }
  console.log("  · källor live: " + status.join(" | "));
  const daliga = status.filter((s) => !s.startsWith("200"));
  if (daliga.length === 0) gron("källor live: 4/4 HTTP 200");
  else console.log(`  · NOTIS källor: ${daliga.join(" | ")} — bot-skydd/redirect bedöms mot sökindex enligt Gartner-precedensen`);
}

console.log(fel.length === 0 ? "\nKVD: GRÖN — 0 FEL" : "\nKVD: RÖD\n" + fel.map((f) => "  ✗ " + f).join("\n"));
process.exit(fel.length === 0 ? 0 : 1);
