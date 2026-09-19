#!/usr/bin/env node
/**
 * _s2u1o21-llms-regen.mjs — AUTO-S2 omgång 21 u1: llms.txt Dataset-sektion
 * HELREGEN ur kodvägen på diskens faktiska läge (kroppen från _s2u1o19/
 * _v209u2, ordagrant mönster — aspektraden BERÄKNAS ur disk, aldrig bevaras).
 * K2-kontraktet: efter körning gäller fil == regen(disk). Läget vid min
 * körning: 214 (u1:s 8411.T + syskonens ev. rider om de hunnit). Utskrifter
 * bär 8411.T:s kvartilsplaceringar = uppgiftens universumjämförelse.
 */
import { readFileSync, writeFileSync } from "node:fs";

const UNI = "data/portfolj-system/bolagsunivers.json";
const LLMS = "public/llms.txt";
const SITE = "https://lab.ak1nvestor.com";

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
const NAMN = {
  energi: "Energi", fastighet: "Fastighet", finans: "Finans", halso: "Hälsa",
  industri: "Industri", kommunikation: "Kommunikation", konsument: "Konsument",
  material: "Material", teknik: "Teknik", tillvaxt: "Tillväxt", osatt: "osatt",
};

const u = JSON.parse(readFileSync(UNI, "utf8"));
const hamtat = u.reduce((h, b) => (b.hamtat && b.hamtat > (h ?? "") ? b.hamtat : h), null);
const totPe = stat(u, (b) => b.vardering?.pe, false);
const totRes = stat(u, (b) => b.tillvaxt?.resultatCAGR5ar, true);
const fin = u.filter((b) => b.bransch === "finans");
const finRes = stat(fin, (b) => b.tillvaxt?.resultatCAGR5ar, true);
const finPe = stat(fin, (b) => b.vardering?.pe, false);
const finPb = stat(fin, (b) => b.vardering?.pb, false);

const huvudrad =
  `- [Dataset — branschmedianer](${SITE}/dataset): Median P/E per bransch i AK1A:s universum ` +
  `(${u.length} bolag i 10 branscher, rådata ${hamtat ?? "—"}) — totalt median P/E ${svTal(totPe.median)} ` +
  `(n=${totPe.n} av ${u.length} bolag med mätt P/E). Med P/B, EBIT-marginal, FCF-marginal och omsättningstillväxt per bransch.`;

const aspektrad =
  `- [Dataset Finans — Resultattillväxt (CAGR 5 år)](${SITE}/dataset/finans/resultat-cagr-5ar): ` +
  `Resultattillväxten (CAGR) inom Finans i AK1A:s universum (rådata ${hamtat ?? "—"}): ` +
  `median ${svTal(finRes.median)} % per år med kvartilspridning P25–P75 ${svTal(finRes.p25)}–${svTal(finRes.p75)} % ` +
  `(n=${finRes.n} bolag med mätt resultat-CAGR). Jämförd med universumet: median ${svTal(totRes.median)} % ` +
  `för samtliga ${totRes.n} bolag med mätt resultat-CAGR. Pedagogisk referens — inte investeringsrådgivning.`;

const branscher = [...new Set(u.map((b) => b.bransch ?? "osatt"))].sort((a, b) => a.localeCompare(b, "sv"));
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

const intro =
  `AK1A:s publika dataset: median P/E, P/B, EBIT-marginal, FCF-marginal och omsättningstillväxt per bransch, ` +
  `räknat ur det fasta universumet på ${u.length} bolag i ${branscher.length} branscher (rådata ${hamtat ?? "—"}). ` +
  `Observationsantal (n) redovisas per nyckeltal. Varje branschsida redovisar dessutom kvartilspridningen (P25–P75) ` +
  `per nyckeltal och jämför branschens medianer med hela universumets medianer. Under varje bransch finns dessutom ` +
  `aspektsidor — ett nyckeltal per sida (P/E, P/B, ROE, ROIC, EV/EBIT, PEG, marginaler, tillväxt m.fl.) — där varje ` +
  `sida redovisar median, kvartiler och spridning för branschen samt samma mått för hela universumet som ` +
  `jämförelserad. Pedagogisk referens — inte investeringsrådgivning.`;

const sektionRader = [intro, "", huvudrad];
for (const slug of branscher) {
  sektionRader.push(branschrad(slug));
  if (slug === "finans") sektionRader.push(aspektrad);
}
const target = [...sektionRader, ""].join("\n");

// ── Kirurgiskt sektionsbyte ───────────────────────────────────────────────────
const txt = readFileSync(LLMS, "utf8");
const rader = txt.split("\n");
const start = rader.findIndex((r) => r === "## Dataset — branschmedianer");
const slut = rader.findIndex((r, i) => i > start && r.startsWith("## "));
if (start === -1 || slut === -1) throw new Error("hittar inte Dataset-sektionen");

const FORE = rader.slice(start + 2, slut).join("\n").replace(/\n+$/, "\n");
const ersatt = [...rader.slice(0, start + 2), ...target.split("\n"), ...rader.slice(slut)].join("\n");
if (ersatt === txt) {
  console.log("LLMS: redan konvergent — ingen skrivning (K2 gäller: fil == regen(disk) på " + u.length + "-läget)");
} else {
  writeFileSync(LLMS, ersatt);
  const kontroll = readFileSync(LLMS, "utf8").split("\n");
  const kropp = kontroll.slice(start + 2, kontroll.findIndex((r, i) => i > start && r.startsWith("## "))).join("\n").replace(/\n+$/, "\n");
  const targetNorm = target.replace(/\n+$/, "\n");
  if (kropp !== targetNorm) { console.error("ABORT L2: skriv-och-återläs-avvikelse"); process.exit(1); }
  console.log(`LLMS REGEN GRÖN: sektionen på ${u.length}-läget; round-trip disk OK`);
}
console.log(`FÖRE→EFTER i tal: total ${FORE.match(/på (\d+) bolag/)?.[1] ?? "?"}→${u.length} · aspektrad n ${FORE.match(/\(n=(\d+) bolag med mätt resultat-CAGR/)?.[1] ?? "?"}→${finRes.n} (median →${svTal(finRes.median)} %) · universum-CAGR n →${totRes.n} (median ${svTal(totRes.median)} %)`);
console.log(`FINANS: P/E ${svTal(finPe.median)} [P25–P75 ${svTal(finPe.p25)}–${svTal(finPe.p75)}, n=${finPe.n}] P/B ${svTal(finPb.median)} · antalBolag ${fin.length}`);
console.log(`TOTALT: P/E ${svTal(totPe.median)} (n=${totPe.n} av ${u.length})`);
// ── 8411.T:s kvartilsplacering (uppgiftens kärna: universumjämförelsen) ──
const placera = (ticker, f, pct) => {
  const b = u.find((x) => x.ticker === ticker);
  if (!b) { console.log(`KVARTIL ${ticker}: EJ PÅ DISK`); return; }
  const varde = f(b);
  const iFin = fin.filter((x) => typeof f(x) === "number").map(f).sort((a, c) => a - c);
  const iAll = u.filter((x) => typeof f(x) === "number").map(f).sort((a, c) => a - c);
  const fmt = (x) => (pct ? (100 * x).toFixed(1).replace(".", ",") + " %" : String(x).replace(".", ","));
  console.log(`KVARTIL ${ticker}: ${fmt(varde)} = rad ${iFin.indexOf(varde) + 1} av ${iFin.length} i finans (P25 ${svTal(percentil(fin.map(f), 0.25) * (pct ? 100 : 1))} · median ${svTal(median(fin.map(f)) * (pct ? 100 : 1))} · P75 ${svTal(percentil(fin.map(f), 0.75) * (pct ? 100 : 1))}${pct ? " %" : ""}) · universumrad ${iAll.filter((x) => x < varde).length + 1} av ${iAll.length} (median ${svTal(median(u.map(f)) * (pct ? 100 : 1))}${pct ? " %" : ""})`);
};
placera("8411.T", (b) => b.vardering?.pe, false);
placera("8411.T", (b) => b.tillvaxt?.resultatCAGR5ar, true);
for (const t of ["8306.T", "8316.T", "8411.T", "BNP.PA", "CS.PA", "HDFCBANK.NS", "TRYG.CO", "SAMPO.HE"]) {
  const r = u.find((x) => x.ticker === t);
  if (r) console.log(`FINANS-P/AKET: ${t} P/E ${r.vardering.pe} | P/B ${r.vardering.pb} | CAGR ${r.tillvaxt?.resultatCAGR5ar ?? "null"} | ROE ${r.lonksamhet?.roe ?? "null"}`);
}
