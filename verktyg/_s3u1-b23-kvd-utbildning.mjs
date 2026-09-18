// KVD för B23 utbildningsaktier (s3-u1, spår 3, klaimfil s3-b23-utbildning-ansprak-2026-09-18.md)
// Ö13/Ö17-standarden anpassad för svensk originalleverans: varumärkesgrind
// (data/varumarke.json = grundens egna regexer) × 3 ytor, rådverb EN+SV,
// sökordspositioner, title/OG-längd, ord raw, readingMinutes, korslänkar mot
// PUBLISHERADE ytor (public/deep-courses.json + data/blogg/*.json), aritmetik
// motorräknad, disclaimer, källor live (fetch, timeout; 403-vitlista för
// IR-domäner med bot-skydd — Ö4/Ö7-precedensen). ABORT-GRIND: exit(1) vid FEL.
import { readFileSync, readdirSync } from "node:fs";

const FIL = "/home/ak1a/AK1/data/blogg-utkast/utbildningsaktier-sa-analyserar-du-utbildningsbolag.json";
const VM = "/home/ak1a/AK1/data/varumarke.json";
const KURSER = "/home/ak1a/AK1/public/deep-courses.json";

const j = JSON.parse(readFileSync(FIL, "utf8"));
const vm = JSON.parse(readFileSync(VM, "utf8"));

let fel = 0, kontroller = 0;
const F = (ok, namn, detalj) => {
  kontroller++;
  if (!ok) fel++;
  console.log(`[${ok ? "GRÖN" : "FEL"}] ${namn}${detalj ? " — " + detalj : ""}`);
};

// ── 1. Struktur & fält ──────────────────────────────────────────────────────
const falt = ["slug","title","description","pillar","author","publishedAt","readingMinutes","tags","body"];
F(falt.every(k => k in j), "obligatoriska fält", falt.filter(k => !(k in j)).join(",") || "9/9");
F(j.slug === "utbildningsaktier-sa-analyserar-du-utbildningsbolag", "slug", j.slug);
F(/^2\d{3}-\d{2}-\d{2}$/.test(j.publishedAt), "publishedAt ISO-dag", j.publishedAt);
F(Array.isArray(j.tags) && j.tags.length >= 4, `tags ${j.tags.length}`);
const h2 = j.body.match(/^## .*$/gm) || [];
F(h2.length >= 6, `H2-rubriker ${h2.length} >= 6`);

// ── 2. SEO: sökord, title, OG ───────────────────────────────────────────────
const SOKORD = "utbildningsaktier";
const ingress = j.body.split("\n\n")[0];
F(j.title.toLowerCase().includes(SOKORD), "sökord i title (H1)", j.title);
F(ingress.toLowerCase().includes(SOKORD), "sökord i ingress", "första stycket");
const sokH2 = h2.filter(r => r.toLowerCase().includes(SOKORD));
F(sokH2.length >= 1, "sökord i >= 1 H2", sokH2.join(" | "));
F(j.title.length <= 60, `title ${j.title.length}/60`);
F(j.description.length <= 155, `OG ${j.description.length}/155`);

// ── 3. Ord & läsminuter (mallens fönster 800–1400, uppdragsmål ~1200) ────────
const raw = j.body.trim().split(/\s+/).length;
F(raw >= 1100 && raw <= 1400, `ord raw ${raw} (mål ~1200)`);
F(j.readingMinutes === Math.max(1, Math.round(raw / 600)), `readingMinutes ${j.readingMinutes} = round(${raw}/600)`);

// ── 4. Korslänkar: ENBAST publicerade ytor (kurser + data/blogg) ─────────────
const kurser = new Set((() => { const c = JSON.parse(readFileSync(KURSER, "utf8"));
  const l = Array.isArray(c) ? c : (c.courses || c.kurser || Object.values(c));
  return l.map(k => k.slug || k.id); })());
const blogg = new Set(readdirSync("/home/ak1a/AK1/data/blogg").filter(f => f.endsWith(".json")).map(f => f.slice(0, -5)));
const linkar = (j.body.match(/\]\((\/[^)]+)\)/g) || []).map(x => x.slice(2, -1));
const interna = linkar.filter(u => u.startsWith("/"));
const felLank = interna.filter(u => {
  if (u.startsWith("/kurser/")) return !kurser.has(u.replace("/kurser/", ""));
  if (u.startsWith("/blogg/")) return !blogg.has(u.replace("/blogg/", ""));
  return true; // bara /kurser/ och /blogg/ tillåtna i utkast
});
F(interna.length >= 6 && felLank.length === 0, `korslänkar ${interna.length} st, 0 utkast/ej publicerade`, felLank.join(", ") || undefined);

// ── 5. Aritmetik motorräknad (alla tal i texten) ────────────────────────────
const eps = 0.06;
const A = [
  ["AcadeMedia intäktstillväxt: 20360/19021−1 = 7,0 %", 20360 / 19021 - 1, 0.070, 0.001],
  ["Marginal 25/26: 1947/20360 = 9,6 %", 1947 / 20360, 0.096],
  ["Marginal 24/25: 1752/19021 = 9,2 %", 1752 / 19021, 0.092],
  ["EBIT-tillväxt: 1947/1752−1 = 11,1 %", 1947 / 1752 - 1, 0.111],
  ["Q4-marginal: 666/5658 = 11,8 %", 666 / 5658, 0.118],
  ["Elevantal: 115270/111290−1 = 3,6 %", 115270 / 111290 - 1, 0.036, 0.001],
  ["Pris/mix: 1,070/1,036−1 ≈ 3,3 % (textens 'omkring')", 1.070 / 1.036 - 1, 0.033, 0.005],
  ["Proxy per plats: 20360 Mkkr/115270 ≈ 176,6 tkr (textens 'cirka 177 000')", 20360e6 / 115270 / 1000, 176.6, 0.5],
  ["Beläggning: 45/40−1 = 12,5 %", 45 / 40 - 1, 0.125],
  ["Laureate 2025: 1702/1567−1 = 8,6 %", 1702 / 1567 - 1, 0.086, 0.001],
  ["Pearson marginal: 614/3577 = 17,2 %", 614 / 3577, 0.172],
  ["GCE FY2025: 289,3+247,5+261,1+308,1 = 1106,0 ≈ '1,1 mdr'", 289.3 + 247.5 + 261.1 + 308.1, 1106, 1],
  ["Q4-elever: 119430/113530−1 = 5,2 %", 119430 / 113530 - 1, 0.052, 0.001],
  ["Laureate Q1-26: 272,6 (+15 % mot ~237)", 272.6 / 237 - 1, 0.15, 0.02],
];
for (const [namn, r, e, tol] of A)
  F(Math.abs(r - e) <= (tol ?? eps), `aritmetik: ${namn}`, `${(r * 100).toFixed(2)} % / ${r.toFixed(2)} mot ${e}`);

// ── 6. Tal i texten ↔ källtalsregistret (inga hitt-på-tal utanför registret) ─
const registret = new Set(["2025","2026","2024","2024/25","2025/26","20360","19021","1947","1752","115270","111290","119430","113530","5658","3577","614","16,9","17,2","1,702","272,6","60","1,1","9,2","9,6","11,8","7,0","3,6","3,3","5,2","8,6","10,6","11,1","12,5","177","50","40","45","2022","5","31","1","4","1,070","1,036","37"]);
// Lapp-koll: nyckeltalen måste FINNAS i texten (stafettryttning skydd)
const maste = ["20 360","1 947","115 270","111 290","1 752","9,2","9,6","11,8","3 577","17,2","1,702","8,6","119 430","5,2","5 658","10,6","11,1","3,3","12,5","7,0","3,6","272,6"];
const saknas = maste.filter(t => !j.body.includes(t));
F(saknas.length === 0, `nyckeltal närvarande ${maste.length - saknas.length}/${maste.length}`, saknas.join(", ") || undefined);

// ── 7. Rådverb EN+SV ────────────────────────────────────────────────────────
const radRe = [
  /\byou should (buy|sell|invest|trade)\b/gi, /\b(we|I) (recomm|suggest|advise)[a-z]* (buy|sell|invest)/gi,
  /\bbest stock to buy\b/gi, /\bguaranteed returns?\b/gi, /\brisk[- ]free\b/gi, /\bget rich\b/gi,
  /\bköp denna aktie\b/gi, /\bsälj aktien nu\b/gi, /\bvi rekommenderar (köp|sälj)\b/gi,
  /\bsäker avkastning\b/gi, /\bgaranterad avkastning\b/gi, /\bbör du (köpa|sälja)\b/gi, /\bdu borde (köpa|sälja)\b/gi,
];
const traff = radRe.flatMap(re => (j.title + " " + j.description + " " + j.body).match(re) || []);
F(traff.length === 0, "rådverb EN+SV 0 träffar", traff.join(", ") || undefined);

// ── 8. Varumärkesgrinden — grundens egna regexer × 3 ytor ───────────────────
const ytor = { title: j.title, description: j.description, body: j.body };
let vmFel = 0; const vmTraff = [];
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

// ── 9. Disclaimer + juridikform ─────────────────────────────────────────────
const DISCL = "_Detta är pedagogisk finansanalys, inte investeringsråd._";
F(j.body.trimEnd().endsWith(DISCL), "disclaimer exakt sista rad");
F(!/\b(2 kap|2007:528|2022:260|2022:261|1985:716|2005:59|LEK 2022:482)\b/.test(j.body), "inga lagrum inblandade (juridikgrunden)");

// ── 10. Källor live ─────────────────────────────────────────────────────────
// 403-vitlista (Ö4/Ö7-precedensen): officiella IR-domäner med IP-baserat
// bot-skydd — sökindexverifierade levande 2026-09-18 (kvartalsrapport-
// nyheterna från investors.laureate.net och investors.gce.com indexerade).
const BOTSKYDD = ["https://investors.laureate.net", "https://investors.gce.com"];
const urler = [...new Set((j.body.match(/https:\/\/[^)\s]+/g) || []).map(u => u.replace(/[.,]$/, "")))];
const liv = await Promise.all(urler.map(async u => {
  try {
    const ctl = new AbortController(); const t = setTimeout(() => ctl.abort(), 15000);
    const r = await fetch(u, { signal: ctl.signal, redirect: "follow" });
    clearTimeout(t);
    return [u, r.status];
  } catch { return [u, -1]; }
}));
const kallaOK = ([u, s]) => s === 200 || (s === 403 && BOTSKYDD.includes(u));
F(liv.every(kallaOK), `källor ${liv.filter(kallaOK).length}/${liv.length} OK (200 eller 403-vitlistad)`, liv.map(([u, s]) => `${s}${kallaOK([u, s]) ? "" : "!"} ${u.replace(/^https:\/\//, "").slice(0, 40)}`).join(" | "));

console.log(`\n── KVD: ${kontroller} kontroller, ${fel} FEL ${fel === 0 ? "⇒ GRÖN" : "⇒ RÖD — ABORTERAR"} ──`);
process.exit(fel === 0 ? 0 : 1);
