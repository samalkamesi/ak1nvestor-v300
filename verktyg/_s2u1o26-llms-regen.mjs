#!/usr/bin/env node
/**
 * _s2u1o26-llms-regen.mjs — AUTO-S2 omgång 26 u1: llms.txt Dataset-sektion
 * HELREGEN ur kodvägen på diskens faktiska läge 244 (kroppen från _s2u1o25,
 * oförändrad fabrik). Denna omgång: MATERIAL (AI.PA Frankrike 0→1) —
 * material-raden omräknad ur disk (26 bolag, P/E n 24→25, AI.PA blir ny
 * P75-gränsvärde); INGEN ny aspektrad (materialets sida var redan
 * publicerad, matta ≥ MIN_MATTA 5 sedan tidigare).
 * K2-kontraktet: efter körning gäller fil == regen(disk).
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

const huvudrad =
  `- [Dataset — branschmedianer](${SITE}/dataset): Median P/E per bransch i AK1A:s universum ` +
  `(${u.length} bolag i 10 branscher, rådata ${hamtat ?? "—"}) — totalt median P/E ${svTal(totPe.median)} ` +
  `(n=${totPe.n} av ${u.length} bolag med mätt P/E). Med P/B, EBIT-marginal, FCF-marginal och omsättningstillväxt per bransch.`;

const aspektradFabrik = (slug) => {
  const bolag = u.filter((b) => b.bransch === slug);
  const namn = NAMN[slug];
  const res = stat(bolag, (b) => b.tillvaxt?.resultatCAGR5ar, true);
  return (
    `- [Dataset ${namn} — Resultattillväxt (CAGR 5 år)](${SITE}/dataset/${slug}/resultat-cagr-5ar): ` +
    `Resultattillväxten (CAGR) inom ${namn} i AK1A:s universum (rådata ${hamtat ?? "—"}): ` +
    `median ${svTal(res.median)} % per år med kvartilspridning P25–P75 ${svTal(res.p25)}–${svTal(res.p75)} % ` +
    `(n=${res.n} bolag med mätt resultat-CAGR). Jämförd med universumet: median ${svTal(totRes.median)} % ` +
    `för samtliga ${totRes.n} bolag med mätt resultat-CAGR. Pedagogisk referens — inte investeringsrådgivning.`
  );
};

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

// Aspektrader DATA-DRIVET (omg24-kursen): varje bransch vars aspektsida är
// publicerad enligt kontraktets gränsregel (matta ≥ MIN_MATTA 5) får sin rad —
// spegeln av de faktiskt 200-svarande /dataset/[bransch]/resultat-cagr-5ar-
// sidorna. Idempotent och racesäker: omkörning efter annan agents smalare
// regen återställer den kompletta sektionen (race-fyndet nedan).
const MIN_MATTA = 5;
const ASPEKT_EFTER = Object.fromEntries(
  branscher
    .map((slug) => [slug, u.filter((b) => (b.bransch ?? "osatt") === slug && typeof b.tillvaxt?.resultatCAGR5ar === "number").length])
    .filter(([, matta]) => matta >= MIN_MATTA)
);
const sektionRader = [intro, "", huvudrad];
for (const slug of branscher) {
  sektionRader.push(branschrad(slug));
  if (ASPEKT_EFTER[slug]) sektionRader.push(aspektradFabrik(slug));
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
console.log(`FÖRE→EFTER i tal: total ${FORE.match(/på (\d+) bolag/)?.[1] ?? "?"}→${u.length}`);
for (const slug of ["material"]) {
  const b = u.filter((x) => x.bransch === slug);
  const pe = stat(b, (x) => x.vardering?.pe, false);
  const res = stat(b, (x) => x.tillvaxt?.resultatCAGR5ar, true);
  console.log(slug.toUpperCase() + ": P/E " + svTal(pe.median) + " [P25–P75 " + svTal(pe.p25) + "–" + svTal(pe.p75) + ", n=" + pe.n + "] · resCAGR median " + svTal(res.median) + " % (n=" + res.n + ") · antalBolag " + b.length);
}
console.log("TOTALT: P/E " + svTal(totPe.median) + " (n=" + totPe.n + " av " + u.length + ")");
console.log("ASPEKTRADER: " + Object.keys(ASPEKT_EFTER).join(" + "));
console.log("JAPAN: " + u.filter((x) => x.land === "Japan").map((x) => x.ticker).join(" · "));
