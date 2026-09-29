#!/usr/bin/env node
/**
 * NYTTOVALT llms-regen — HELREGEN av Dataset-sektionen i public/llms.txt på
 * diskens FAKTIVA 316-läge (v209-u1/_v209u1-llms-regen.mjs-mönstret), med den
 * skillnaden att denna OCKSÅ bär o559-bygggrinden (sitemap-byggsanning.ts:s
 * exakta semantik): /dataset/[bransch] och aspektsidorna är byggfrusna
 * (dynamicParams=false) — en rad för en sida det körande bygget SAKNAR är ett
 * dött löfte till AI-läsare. nyttovalt-raden hålls ALLTILLBAKA tills nästa
 * gröna bygge (fail-open utan .next).
 *
 * Sektionens form är den som lever på disk (varje bransch: branschmedianer-
 * rad + Resultattillväxt-CAGR-aspektrad) — aspektrader omräknade på
 * 316-läget eftersom universummedianen för resultat-CAGR rörs av de fem
 * nya nyttovalt-bolagen (n 261→266).
 */
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import path from "node:path";

const SITE = "https://lab.ak1nvestor.com";
const LLMS = "public/llms.txt";
const BYGG_APP = path.join(process.cwd(), ".next", "server", "app");

// byggdSidaFinns (sitemap-byggsanning.ts): fail-open utan .next.
const bygginfoFinns = existsSync(path.join(process.cwd(), ".next", "BUILD_ID")) && existsSync(BYGG_APP);
const byggdSidaFinns = (rel) => {
  if (!bygginfoFinns) return true;
  try {
    return existsSync(path.join(BYGG_APP, `${rel}.html`));
  } catch {
    return true;
  }
};

const u = JSON.parse(readFileSync("data/portfolj-system/bolagsunivers.json", "utf8"));

// ── medianreplik (dataset-medianer.ts, EXAKT) ────────────────────────────────
const median = (v) => {
  const r = v.filter((x) => typeof x === "number" && Number.isFinite(x));
  if (!r.length) return null;
  const s = [...r].sort((a, b) => a - b);
  const m = Math.floor(s.length / 2);
  return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
};
const percentil = (v, p) => {
  const r = v.filter((x) => typeof x === "number" && Number.isFinite(x));
  if (!r.length) return null;
  const s = [...r].sort((a, b) => a - b);
  const pos = (s.length - 1) * p;
  const lo = Math.floor(pos), hi = Math.ceil(pos);
  return lo === hi ? s[lo] : s[lo] + (pos - lo) * (s[hi] - s[lo]);
};
const runda1 = (x) => Math.round(x * 10) / 10;
const svTal = (x) => (x === null ? "—" : String(x).replace(".", ","));
const stat = (rader, f, pct) => {
  const v = rader.map((b) => f(b) ?? null);
  const n = v.filter((x) => typeof x === "number" && Number.isFinite(x)).length;
  const omv = (x) => (x === null ? null : pct ? runda1(x * 100) : runda1(x));
  return { median: omv(median(v)), p25: omv(percentil(v, 0.25)), p75: omv(percentil(v, 0.75)), n };
};
const hamtat = u.reduce((h, b) => (b.hamtat && b.hamtat > (h ?? "") ? b.hamtat : h), null);

const totPe = stat(u, (b) => b.vardering?.pe, false);
const totRes = stat(u, (b) => b.tillvaxt?.resultatCAGR5ar, true);

const NAMN = {
  energi: "Energi", fastighet: "Fastighet", finans: "Finans", halso: "Hälsa",
  industri: "Industri", kommunikation: "Kommunikation", konsument: "Konsument",
  material: "Material", teknik: "Teknik", tillvaxt: "Tillväxt",
  nyttovalt: "Nyttovalt", osatt: "osatt",
};
const branscher = [...new Set(u.map((b) => b.bransch ?? "osatt"))].sort((a, b) =>
  a.localeCompare(b, "sv"),
);

const huvudrad =
  `- [Dataset — branschmedianer](${SITE}/dataset): Median P/E per bransch i AK1A:s universum ` +
  `(${u.length} bolag i ${branscher.length} branscher, rådata ${hamtat ?? "—"}) — totalt median P/E ${svTal(totPe.median)} ` +
  `(n=${totPe.n} av ${u.length} bolag med mätt P/E). Med P/B, EBIT-marginal, FCF-marginal och omsättningstillväxt per bransch.`;

const branschrad = (slug) => {
  const bolag = u.filter((b) => (b.bransch ?? "osatt") === slug);
  const namn = NAMN[slug] ?? slug;
  const pe = stat(bolag, (b) => b.vardering?.pe, false);
  const pb = stat(bolag, (b) => b.vardering?.pb, false);
  const ebit = stat(bolag, (b) => b.lonksamhet?.ebitMarginal, true);
  const fcf = stat(bolag, (b) => b.lonksamhet?.fcfMarginal, true);
  const till = stat(bolag, (b) => b.tillvaxt?.omsattningTillvaxtTTM, true);
  return (
    `- [Dataset ${namn} — branschmedianer](${SITE}/dataset/${slug}): Medianerna för ${namn} i AK1A:s universum ` +
    `(${bolag.length} bolag i branschen, rådata ${hamtat ?? "—"}): P/E ${svTal(pe.median)} med kvartilspridning ` +
    `P25–P75 ${svTal(pe.p25)}–${svTal(pe.p75)} (n=${pe.n}) · P/B ${svTal(pb.median)} · ` +
    `EBIT-marginal ${svTal(ebit.median)} % · FCF-marginal ${svTal(fcf.median)} % · ` +
    `omsättningstillväxt ${svTal(till.median)} %. Jämförd med universumet: median P/E ${svTal(totPe.median)} ` +
    `för samtliga ${u.length} bolag.`
  );
};

const aspektrad = (slug) => {
  const bolag = u.filter((b) => (b.bransch ?? "osatt") === slug);
  const namn = NAMN[slug] ?? slug;
  const res = stat(bolag, (b) => b.tillvaxt?.resultatCAGR5ar, true);
  return (
    `- [Dataset ${namn} — Resultattillväxt (CAGR 5 år)](${SITE}/dataset/${slug}/resultat-cagr-5ar): ` +
    `Resultattillväxten (CAGR) inom ${namn} i AK1A:s universum (rådata ${hamtat ?? "—"}): ` +
    `median ${svTal(res.median)} % per år med kvartilspridning P25–P75 ${svTal(res.p25)}–${svTal(res.p75)} % ` +
    `(n=${res.n} bolag med mätt resultat-CAGR). Jämförd med universumet: median ${svTal(totRes.median)} % ` +
    `för samtliga ${totRes.n} bolag med mätt resultat-CAGR. Pedagogisk referens — inte investeringsrådgivning.`
  );
};

const intro =
  `AK1A:s publika dataset: median P/E, P/B, EBIT-marginal, FCF-marginal och omsättningstillväxt per bransch, ` +
  `räknat ur det fasta universumet på ${u.length} bolag i ${branscher.length} branscher (rådata ${hamtat ?? "—"}). ` +
  `Observationsantal (n) redovisas per nyckeltal. Varje branschsida redovisar dessutom kvartilspridningen (P25–P75) ` +
  `per nyckeltal och jämför branschens medianer med hela universumets medianer. Under varje bransch finns dessutom ` +
  `aspektsidor — ett nyckeltal per sida (P/E, P/B, ROE, ROIC, EV/EBIT, PEG, marginaler, tillväxt m.fl.) — där varje ` +
  `sida redovisar median, kvartiler och spridning för branschen samt samma mått för hela universumet som ` +
  `jämförelserad. Pedagogisk referens — inte investeringsrådgivning.`;

// ── Kirurgiskt sektionsbyte i public/llms.txt ────────────────────────────────
const txt = readFileSync(LLMS, "utf8");
const rader = txt.split("\n");
const start = rader.findIndex((r) => r === "## Dataset — branschmedianer");
const slut = rader.findIndex((r, i) => i > start && r.startsWith("## "));
if (start === -1 || slut === -1) throw new Error("hittar inte Dataset-sektionen");
const sektion = [intro, "", huvudrad];
let tillbakahallna = [];
for (const slug of branscher) {
  if (byggdSidaFinns(`dataset/${slug}`)) {
    sektion.push(branschrad(slug));
    if (byggdSidaFinns(`dataset/${slug}/resultat-cagr-5ar`)) sektion.push(aspektrad(slug));
  } else {
    tillbakahallna.push(slug);
  }
}
const nya = [...rader.slice(0, start + 2), ...sektion, "", ...rader.slice(slut)];
writeFileSync(LLMS, nya.join("\n"));
console.log(`LLMS HELREGEN: Dataset-sektionen ombyggd på ${u.length}-läget (${branscher.length} branscher, rådata ${hamtat}).`);
console.log(`huvudrad: totalt median P/E ${svTal(totPe.median)} (n=${totPe.n} av ${u.length}).`);
console.log(`universum resultat-CAGR: median ${svTal(totRes.median)} % (n=${totRes.n}).`);
console.log(
  tillbakahallna.length
    ? `BYGGGRIND (o559): ${tillbakahallna.join(", ")} hålls tillbaka — sidan ej i körande bygge (släpps av nästa gröna bygge + regen).`
    : "BYGGGRIND: samtliga branscher byggda — alla rader publicerade.",
);
